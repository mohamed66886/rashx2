import 'server-only';
import type {
  Firestore,
  DocumentReference,
  DocumentSnapshot,
  Transaction,
} from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  MembershipDocSchema,
  MembershipSummaryDocSchema,
  type MembershipDoc,
  type MembershipSummaryDoc,
  type MembershipRole,
  type MembershipStatus,
} from '../../membership.schema';
import { TrustedSystemContext } from './trusted-context';

/**
 * Standard error codes for membership lifecycle and invariant operations.
 */
export enum MembershipErrorCode {
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_DISABLED = 'USER_DISABLED',
  MEMBERSHIP_ALREADY_EXISTS = 'MEMBERSHIP_ALREADY_EXISTS',
  MEMBERSHIP_NOT_FOUND = 'MEMBERSHIP_NOT_FOUND',
  INVALID_ROLE_TRANSITION = 'INVALID_ROLE_TRANSITION',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  LAST_OWNER_INVARIANT_VIOLATION = 'LAST_OWNER_INVARIANT_VIOLATION',
  CROSS_TENANT_MUTATION = 'CROSS_TENANT_MUTATION',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
}

/**
 * Strongly typed error thrown on membership mutation failures.
 */
export class MembershipError extends Error {
  public override readonly cause?: unknown;

  constructor(
    public readonly code: MembershipErrorCode,
    message: string,
    cause?: unknown
  ) {
    super(message);
    this.name = 'MembershipError';
    this.cause = cause;
  }
}

/**
 * Actor performing the membership mutation.
 * Authoritative identity derived from verified token, trusted platform context,
 * or unforgeable internal system context.
 */
export type MembershipActor =
  | TrustedSystemContext
  | {
      uid: string;
      isPlatformAdmin?: boolean;
      system?: never;
    };

/**
 * Audit log entry for membership transitions.
 * Strictly excludes PII and sensitive contact data.
 *
 * AUDIT INTEGRITY ARCHITECTURE & LIMITATIONS:
 * 1. Transactional Atomicity:
 *    Audit records are written in the exact same Firestore transaction as the membership mutation.
 *    If any check fails or the transaction encounters a conflict, the audit record is rolled back
 *    atomically with the mutation (zero partial logs).
 * 2. Append-Only Application Boundary:
 *    The MembershipRepository exposes NO update, delete, or truncate methods for audit logs.
 *    Application code consuming this repository can only append new audit entries via mutations.
 * 3. Security Rule & Admin SDK Limitation (Explicit Trust Disclaimer):
 *    Firestore Security Rules (e.g. `allow write: if false`) protect against direct client SDK
 *    modifications. However, the Firebase Admin SDK bypasses Firestore Security Rules by design.
 *    Privileged server credentials therefore have technical capability to modify or delete audit
 *    documents. Immutability is an application/repository-level constraint, NOT an absolute
 *    database-level or engine-enforced cryptographic guarantee.
 * 4. Future Architecture Recommendation:
 *    For absolute non-repudiation and compliance immutability, audit events should be streamed to
 *    an external, separately controlled audit sink (e.g., Cloud Logging / BigQuery with retention
 *    locks or a dedicated audit project where application service accounts only hold append roles).
 */
export interface MembershipAuditLog {
  id: string;
  tenantId: string;
  actorUid: string;
  targetUid: string;
  action:
    | 'ADD_MEMBER'
    | 'CHANGE_ROLE'
    | 'SUSPEND_MEMBER'
    | 'REACTIVATE_MEMBER'
    | 'REMOVE_MEMBER'
    | 'TRANSFER_OWNERSHIP';
  previousRole?: MembershipRole;
  newRole?: MembershipRole;
  previousStatus?: MembershipStatus;
  newStatus?: MembershipStatus;
  timestamp: string;
}

/**
 * Context provided to internal transactional mutation handlers.
 */
interface InternalMutationContext {
  transaction: Transaction;
  tenantId: string;
  nowIso: string;
  summary: MembershipSummaryDoc;
  actorRole: MembershipRole | 'SUPER_ADMIN';
  actorMembership: MembershipDoc | null;
  targetRef: DocumentReference;
  targetSnap: DocumentSnapshot;
  targetMembership: MembershipDoc | null;
  targetUserSnap: DocumentSnapshot | null;
}

/**
 * Calculated mutation outcome produced by internal operation handlers.
 */
interface MutationPlan {
  targetDoc: MembershipDoc;
  ownerDelta: number;
  managerDelta: number;
  staffDelta: number;
  activeDelta: number;
  auditAction: MembershipAuditLog['action'];
  previousRole?: MembershipRole;
  previousStatus?: MembershipStatus;
  extraWrites?: Array<{ ref: DocumentReference; data: Record<string, unknown> }>;
}

/**
 * Server-only repository enforcing tenant membership invariants,
 * role hierarchy authorization, and the active owner mutex.
 */
export class MembershipRepository {
  private readonly db: Firestore;

  constructor(firestore?: Firestore) {
    this.db = firestore || getFirebaseAdminFirestore();
  }

  /**
   * Helper verifying actor authorization against target and action.
   */
  private verifyRolePermissions(
    action: MembershipAuditLog['action'],
    actorRole: MembershipRole | 'SUPER_ADMIN',
    targetRole?: MembershipRole,
    newRole?: MembershipRole
  ): void {
    if (actorRole === 'SUPER_ADMIN') {
      return; // Platform admin has platform recovery authority
    }

    if (actorRole === 'STAFF') {
      throw new MembershipError(
        MembershipErrorCode.FORBIDDEN,
        'STAFF members are not permitted to manage memberships.'
      );
    }

    if (actorRole === 'MANAGER') {
      if (action === 'TRANSFER_OWNERSHIP') {
        throw new MembershipError(
          MembershipErrorCode.FORBIDDEN,
          'MANAGERS are not permitted to manage or transfer ownership.'
        );
      }
      if (targetRole === 'OWNER' || newRole === 'OWNER') {
        throw new MembershipError(
          MembershipErrorCode.FORBIDDEN,
          'MANAGERS cannot manage or alter OWNER memberships.'
        );
      }
      if (newRole === 'MANAGER') {
        throw new MembershipError(
          MembershipErrorCode.FORBIDDEN,
          'MANAGERS cannot promote members to MANAGER.'
        );
      }
      if (targetRole === 'MANAGER' && (action === 'CHANGE_ROLE' || action === 'SUSPEND_MEMBER' || action === 'REMOVE_MEMBER')) {
        throw new MembershipError(
          MembershipErrorCode.FORBIDDEN,
          'MANAGERS cannot alter, suspend, or remove other MANAGERS.'
        );
      }
    }

    // OWNER has full authority over tenant memberships
  }

  /**
   * Shared internal transactional mutation engine.
   * Enforces:
   * 1. Tenant namespace isolation
   * 2. Read-before-write transactional sequencing
   * 3. Authoritative platform administrator checks
   * 4. Invariant: nextActiveOwnerCount >= 1
   * 5. Atomicity & Audit logging
   */
  private async executeMutation(
    tenantId: string,
    targetUid: string,
    actor: MembershipActor,
    mutationHandler: (ctx: InternalMutationContext) => Promise<MutationPlan>
  ): Promise<{ targetDoc: MembershipDoc; summaryDoc: MembershipSummaryDoc }> {
    if (!tenantId || typeof tenantId !== 'string' || tenantId.trim() === '') {
      throw new MembershipError(MembershipErrorCode.INVALID_PAYLOAD, 'Tenant ID must be non-empty.');
    }
    if (!targetUid || typeof targetUid !== 'string' || targetUid.trim() === '') {
      throw new MembershipError(MembershipErrorCode.INVALID_PAYLOAD, 'Target UID must be non-empty.');
    }

    // Detect and reject untrusted caller attempts to spoof system authority via plain objects
    if (
      typeof actor === 'object' &&
      actor !== null &&
      'system' in actor &&
      (actor as Record<string, unknown>).system !== undefined
    ) {
      if (!TrustedSystemContext.isTrusted(actor)) {
        throw new MembershipError(
          MembershipErrorCode.UNAUTHORIZED,
          'System privilege cannot be granted via untrusted context. Use TrustedSystemContext.'
        );
      }
    }

    const isSystem = TrustedSystemContext.isTrusted(actor);
    const actorUid = !isSystem && actor ? (actor as { uid?: string }).uid : undefined;

    if (!isSystem && (!actorUid || typeof actorUid !== 'string' || actorUid.trim() === '')) {
      throw new MembershipError(MembershipErrorCode.UNAUTHORIZED, 'Actor UID must be provided.');
    }

    const cleanTenantId = tenantId.trim();
    const cleanTargetUid = targetUid.trim();
    const cleanActorUid = isSystem ? 'system' : actorUid!.trim();
    const isPlatformAdmin = !isSystem && Boolean((actor as { isPlatformAdmin?: boolean }).isPlatformAdmin);
    const nowIso = new Date().toISOString();

    // Canonical document references strictly scoped to cleanTenantId
    const summaryRef = this.db.doc(firestorePaths.membershipSummary(cleanTenantId));
    const targetRef = this.db.doc(firestorePaths.membership(cleanTenantId, cleanTargetUid));
    const actorRef = !isSystem
      ? this.db.doc(firestorePaths.membership(cleanTenantId, cleanActorUid))
      : null;
    const targetUserRef = this.db.doc(firestorePaths.user(cleanTargetUid));
    const platformAdminRef = isPlatformAdmin
      ? this.db.doc(firestorePaths.platformAdmin(cleanActorUid))
      : null;

    try {
      return await this.db.runTransaction(async (transaction: Transaction) => {
        // --- 1. ALL READS FIRST (Strict Firestore ordering) ---
        const [summarySnap, targetSnap, actorSnap, targetUserSnap, platformAdminSnap] =
          await Promise.all([
            transaction.get(summaryRef),
            transaction.get(targetRef),
            actorRef ? transaction.get(actorRef) : Promise.resolve(null),
            transaction.get(targetUserRef),
            platformAdminRef ? transaction.get(platformAdminRef) : Promise.resolve(null),
          ]);

        // Guard: Membership summary mutex must exist
        if (!summarySnap.exists) {
          throw new MembershipError(
            MembershipErrorCode.TENANT_NOT_FOUND,
            `Tenant summary document for '${cleanTenantId}' does not exist.`
          );
        }
        const summary = MembershipSummaryDocSchema.parse(summarySnap.data());

        // Guard: Actor authorization verification
        let actorRole: MembershipRole | 'SUPER_ADMIN';
        let actorMembership: MembershipDoc | null = null;

        if (isSystem) {
          actorRole = 'SUPER_ADMIN';
        } else if (isPlatformAdmin) {
          // Authoritative platform admin verification from Firestore document
          if (!platformAdminSnap || !platformAdminSnap.exists) {
            throw new MembershipError(
              MembershipErrorCode.UNAUTHORIZED,
              `Actor '${cleanActorUid}' is not an authoritative platform administrator.`
            );
          }
          actorRole = 'SUPER_ADMIN';
        } else {
          // Normal tenant member: verify active membership in this tenant
          if (!actorSnap || !actorSnap.exists) {
            throw new MembershipError(
              MembershipErrorCode.FORBIDDEN,
              `Actor '${cleanActorUid}' has no membership in tenant '${cleanTenantId}'.`
            );
          }
          actorMembership = MembershipDocSchema.parse(actorSnap.data());
          if (actorMembership.status !== 'ACTIVE') {
            throw new MembershipError(
              MembershipErrorCode.FORBIDDEN,
              `Actor '${cleanActorUid}' membership is not ACTIVE (status: ${actorMembership.status}).`
            );
          }
          actorRole = actorMembership.role;
        }

        const targetMembership = targetSnap.exists
          ? MembershipDocSchema.parse(targetSnap.data())
          : null;

        // --- 2. EXECUTE OPERATION-SPECIFIC LOGIC ---
        const plan = await mutationHandler({
          transaction,
          tenantId: cleanTenantId,
          nowIso,
          summary,
          actorRole,
          actorMembership,
          targetRef,
          targetSnap,
          targetMembership,
          targetUserSnap,
        });

        // --- 3. INVARIANT ENFORCEMENT: activeOwnerCount >= 1 ---
        const nextActiveOwnerCount = summary.activeOwnerCount + plan.ownerDelta;
        if (nextActiveOwnerCount < 1) {
          throw new MembershipError(
            MembershipErrorCode.LAST_OWNER_INVARIANT_VIOLATION,
            `Operation rejected: Mutation would violate invariant activeOwnerCount >= 1 (resulting: ${nextActiveOwnerCount}).`
          );
        }

        const nextActiveManagerCount = summary.activeManagerCount + plan.managerDelta;
        const nextActiveStaffCount = summary.activeStaffCount + plan.staffDelta;
        const nextTotalActiveMembers = summary.totalActiveMembers + plan.activeDelta;

        if (nextActiveManagerCount < 0 || nextActiveStaffCount < 0 || nextTotalActiveMembers < 1) {
          throw new MembershipError(
            MembershipErrorCode.INVALID_STATUS_TRANSITION,
            'Operation rejected: resulting member counts cannot be negative.'
          );
        }

        const updatedSummaryDoc: MembershipSummaryDoc = MembershipSummaryDocSchema.parse({
          tenantId: cleanTenantId,
          activeOwnerCount: nextActiveOwnerCount,
          activeManagerCount: nextActiveManagerCount,
          activeStaffCount: nextActiveStaffCount,
          totalActiveMembers: nextTotalActiveMembers,
          version: summary.version + 1,
          updatedAt: nowIso,
        });

        // --- 4. ALL WRITES AFTER READS ---
        transaction.set(targetRef, plan.targetDoc);
        transaction.set(summaryRef, updatedSummaryDoc);

        // Apply any extra writes (e.g. previous owner demotion in transferOwnership)
        if (plan.extraWrites) {
          for (const extra of plan.extraWrites) {
            transaction.set(extra.ref, extra.data);
          }
        }

        // Record Audit Log (safe, no PII)
        const auditLogId = this.db.collection(firestorePaths.auditLogs(cleanTenantId)).doc().id;
        const auditLogRef = this.db.doc(firestorePaths.auditLog(cleanTenantId, auditLogId));
        const auditLogEntry: MembershipAuditLog = {
          id: auditLogId,
          tenantId: cleanTenantId,
          actorUid: cleanActorUid,
          targetUid: cleanTargetUid,
          action: plan.auditAction,
          previousRole: plan.previousRole,
          newRole: plan.targetDoc.role,
          previousStatus: plan.previousStatus,
          newStatus: plan.targetDoc.status,
          timestamp: nowIso,
        };
        transaction.set(auditLogRef, auditLogEntry);

        return {
          targetDoc: plan.targetDoc,
          summaryDoc: updatedSummaryDoc,
        };
      });
    } catch (error) {
      if (error instanceof MembershipError) {
        throw error;
      }
      throw new MembershipError(
        MembershipErrorCode.TRANSACTION_FAILED,
        `Membership transaction failed: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }

  /**
   * Adds a new member to the tenant organization.
   * Disallows direct creation of OWNER role (ownership transfer is required).
   */
  async addMember(
    params: {
      tenantId: string;
      targetUid: string;
      role: 'MANAGER' | 'STAFF';
      title?: string;
    },
    actor: MembershipActor
  ): Promise<MembershipDoc> {
    if (params.role !== 'MANAGER' && params.role !== 'STAFF') {
      throw new MembershipError(
        MembershipErrorCode.INVALID_ROLE_TRANSITION,
        'Cannot directly invite or add an OWNER. New members must be MANAGER or STAFF.'
      );
    }

    const { targetDoc } = await this.executeMutation(
      params.tenantId,
      params.targetUid,
      actor,
      async (ctx) => {
        // Permissions check
        this.verifyRolePermissions('ADD_MEMBER', ctx.actorRole, undefined, params.role);

        // Verify target user exists in /users and is active
        if (!ctx.targetUserSnap || !ctx.targetUserSnap.exists) {
          throw new MembershipError(
            MembershipErrorCode.USER_NOT_FOUND,
            `User '${params.targetUid}' does not exist in root /users.`
          );
        }
        const userData = ctx.targetUserSnap.data() as Record<string, unknown> | undefined;
        if (userData && (userData.disabled === true || userData.isDisabled === true || userData.status === 'DISABLED')) {
          throw new MembershipError(
            MembershipErrorCode.USER_DISABLED,
            `User '${params.targetUid}' is disabled.`
          );
        }

        // Check for duplicate membership
        if (ctx.targetMembership) {
          if (ctx.targetMembership.status === 'ACTIVE' || ctx.targetMembership.status === 'SUSPENDED') {
            throw new MembershipError(
              MembershipErrorCode.MEMBERSHIP_ALREADY_EXISTS,
              `User '${params.targetUid}' already has an active or suspended membership in tenant '${ctx.tenantId}'.`
            );
          }
        }

        const newDoc: MembershipDoc = MembershipDocSchema.parse({
          id: params.targetUid,
          tenantId: ctx.tenantId,
          role: params.role,
          status: 'ACTIVE',
          title: params.title || (params.role === 'MANAGER' ? 'Manager' : 'Staff'),
          joinedAt: ctx.targetMembership ? ctx.targetMembership.joinedAt : ctx.nowIso,
          updatedAt: ctx.nowIso,
        });

        return {
          targetDoc: newDoc,
          ownerDelta: 0,
          managerDelta: params.role === 'MANAGER' ? 1 : 0,
          staffDelta: params.role === 'STAFF' ? 1 : 0,
          activeDelta: 1,
          auditAction: 'ADD_MEMBER',
          previousRole: ctx.targetMembership?.role,
          previousStatus: ctx.targetMembership?.status,
        };
      }
    );

    return targetDoc;
  }

  /**
   * Changes the role of an existing active member.
   * If demoting an OWNER, enforces activeOwnerCount >= 1.
   */
  async changeMemberRole(
    params: {
      tenantId: string;
      targetUid: string;
      newRole: MembershipRole;
      title?: string;
    },
    actor: MembershipActor
  ): Promise<MembershipDoc> {
    const { targetDoc } = await this.executeMutation(
      params.tenantId,
      params.targetUid,
      actor,
      async (ctx) => {
        if (!ctx.targetMembership) {
          throw new MembershipError(
            MembershipErrorCode.MEMBERSHIP_NOT_FOUND,
            `Membership for '${params.targetUid}' does not exist in tenant '${ctx.tenantId}'.`
          );
        }

        if (ctx.targetMembership.status !== 'ACTIVE') {
          throw new MembershipError(
            MembershipErrorCode.INVALID_STATUS_TRANSITION,
            `Cannot change role for membership in status '${ctx.targetMembership.status}'. Must be ACTIVE.`
          );
        }

        this.verifyRolePermissions(
          'CHANGE_ROLE',
          ctx.actorRole,
          ctx.targetMembership.role,
          params.newRole
        );

        if (ctx.targetMembership.role === params.newRole) {
          // No-op if role is unchanged
          return {
            targetDoc: ctx.targetMembership,
            ownerDelta: 0,
            managerDelta: 0,
            staffDelta: 0,
            activeDelta: 0,
            auditAction: 'CHANGE_ROLE',
            previousRole: ctx.targetMembership.role,
            previousStatus: ctx.targetMembership.status,
          };
        }

        // Calculate counter deltas
        const prevRole = ctx.targetMembership.role;
        const ownerDelta = (params.newRole === 'OWNER' ? 1 : 0) - (prevRole === 'OWNER' ? 1 : 0);
        const managerDelta = (params.newRole === 'MANAGER' ? 1 : 0) - (prevRole === 'MANAGER' ? 1 : 0);
        const staffDelta = (params.newRole === 'STAFF' ? 1 : 0) - (prevRole === 'STAFF' ? 1 : 0);

        const updatedDoc: MembershipDoc = MembershipDocSchema.parse({
          ...ctx.targetMembership,
          role: params.newRole,
          title: params.title !== undefined ? params.title : ctx.targetMembership.title,
          updatedAt: ctx.nowIso,
        });

        return {
          targetDoc: updatedDoc,
          ownerDelta,
          managerDelta,
          staffDelta,
          activeDelta: 0,
          auditAction: 'CHANGE_ROLE',
          previousRole: prevRole,
          previousStatus: ctx.targetMembership.status,
        };
      }
    );

    return targetDoc;
  }

  /**
   * Demotes an OWNER to a lower role (defaults to MANAGER).
   * Enforces that the tenant retains at least 1 other active owner.
   */
  async demoteOwner(
    params: {
      tenantId: string;
      targetUid: string;
      newRole?: 'MANAGER' | 'STAFF';
    },
    actor: MembershipActor
  ): Promise<MembershipDoc> {
    return this.changeMemberRole(
      {
        tenantId: params.tenantId,
        targetUid: params.targetUid,
        newRole: params.newRole || 'MANAGER',
      },
      actor
    );
  }

  /**
   * Suspends a membership.
   * If target is the last active OWNER, rejects with invariant violation.
   */
  async suspendMember(
    params: {
      tenantId: string;
      targetUid: string;
    },
    actor: MembershipActor
  ): Promise<MembershipDoc> {
    const { targetDoc } = await this.executeMutation(
      params.tenantId,
      params.targetUid,
      actor,
      async (ctx) => {
        if (!ctx.targetMembership) {
          throw new MembershipError(
            MembershipErrorCode.MEMBERSHIP_NOT_FOUND,
            `Membership for '${params.targetUid}' does not exist in tenant '${ctx.tenantId}'.`
          );
        }

        this.verifyRolePermissions('SUSPEND_MEMBER', ctx.actorRole, ctx.targetMembership.role);

        // If already suspended or revoked, return without duplicate counter decrements
        if (ctx.targetMembership.status === 'SUSPENDED') {
          return {
            targetDoc: ctx.targetMembership,
            ownerDelta: 0,
            managerDelta: 0,
            staffDelta: 0,
            activeDelta: 0,
            auditAction: 'SUSPEND_MEMBER',
            previousRole: ctx.targetMembership.role,
            previousStatus: ctx.targetMembership.status,
          };
        }

        if (ctx.targetMembership.status === 'REVOKED') {
          throw new MembershipError(
            MembershipErrorCode.INVALID_STATUS_TRANSITION,
            'Cannot suspend a REVOKED membership.'
          );
        }

        const role = ctx.targetMembership.role;
        const ownerDelta = role === 'OWNER' ? -1 : 0;
        const managerDelta = role === 'MANAGER' ? -1 : 0;
        const staffDelta = role === 'STAFF' ? -1 : 0;

        const updatedDoc: MembershipDoc = MembershipDocSchema.parse({
          ...ctx.targetMembership,
          status: 'SUSPENDED',
          updatedAt: ctx.nowIso,
        });

        return {
          targetDoc: updatedDoc,
          ownerDelta,
          managerDelta,
          staffDelta,
          activeDelta: -1,
          auditAction: 'SUSPEND_MEMBER',
          previousRole: role,
          previousStatus: ctx.targetMembership.status,
        };
      }
    );

    return targetDoc;
  }

  /**
   * Reactivates a suspended membership.
   */
  async reactivateMember(
    params: {
      tenantId: string;
      targetUid: string;
    },
    actor: MembershipActor
  ): Promise<MembershipDoc> {
    const { targetDoc } = await this.executeMutation(
      params.tenantId,
      params.targetUid,
      actor,
      async (ctx) => {
        if (!ctx.targetMembership) {
          throw new MembershipError(
            MembershipErrorCode.MEMBERSHIP_NOT_FOUND,
            `Membership for '${params.targetUid}' does not exist in tenant '${ctx.tenantId}'.`
          );
        }

        this.verifyRolePermissions('REACTIVATE_MEMBER', ctx.actorRole, ctx.targetMembership.role);

        if (ctx.targetMembership.status === 'ACTIVE') {
          return {
            targetDoc: ctx.targetMembership,
            ownerDelta: 0,
            managerDelta: 0,
            staffDelta: 0,
            activeDelta: 0,
            auditAction: 'REACTIVATE_MEMBER',
            previousRole: ctx.targetMembership.role,
            previousStatus: ctx.targetMembership.status,
          };
        }

        if (ctx.targetMembership.status === 'REVOKED') {
          throw new MembershipError(
            MembershipErrorCode.INVALID_STATUS_TRANSITION,
            'Cannot reactivate a REVOKED membership directly; re-add the member instead.'
          );
        }

        // Verify user in root /users is not disabled
        if (ctx.targetUserSnap && ctx.targetUserSnap.exists) {
          const udata = ctx.targetUserSnap.data() as Record<string, unknown> | undefined;
          if (udata && (udata.disabled === true || udata.isDisabled === true || udata.status === 'DISABLED')) {
            throw new MembershipError(
              MembershipErrorCode.USER_DISABLED,
              `Cannot reactivate disabled user '${params.targetUid}'.`
            );
          }
        }

        const role = ctx.targetMembership.role;
        const ownerDelta = role === 'OWNER' ? 1 : 0;
        const managerDelta = role === 'MANAGER' ? 1 : 0;
        const staffDelta = role === 'STAFF' ? 1 : 0;

        const updatedDoc: MembershipDoc = MembershipDocSchema.parse({
          ...ctx.targetMembership,
          status: 'ACTIVE',
          updatedAt: ctx.nowIso,
        });

        return {
          targetDoc: updatedDoc,
          ownerDelta,
          managerDelta,
          staffDelta,
          activeDelta: 1,
          auditAction: 'REACTIVATE_MEMBER',
          previousRole: role,
          previousStatus: ctx.targetMembership.status,
        };
      }
    );

    return targetDoc;
  }

  /**
   * Safely revokes/removes a membership, preserving historical audit evidence.
   * If target is the last active OWNER, rejects with invariant violation.
   * Prevents double decrement if membership was already suspended or revoked.
   */
  async removeMember(
    params: {
      tenantId: string;
      targetUid: string;
    },
    actor: MembershipActor
  ): Promise<MembershipDoc> {
    const { targetDoc } = await this.executeMutation(
      params.tenantId,
      params.targetUid,
      actor,
      async (ctx) => {
        if (!ctx.targetMembership) {
          throw new MembershipError(
            MembershipErrorCode.MEMBERSHIP_NOT_FOUND,
            `Membership for '${params.targetUid}' does not exist in tenant '${ctx.tenantId}'.`
          );
        }

        this.verifyRolePermissions('REMOVE_MEMBER', ctx.actorRole, ctx.targetMembership.role);

        // If already revoked, return without double decrement
        if (ctx.targetMembership.status === 'REVOKED') {
          return {
            targetDoc: ctx.targetMembership,
            ownerDelta: 0,
            managerDelta: 0,
            staffDelta: 0,
            activeDelta: 0,
            auditAction: 'REMOVE_MEMBER',
            previousRole: ctx.targetMembership.role,
            previousStatus: ctx.targetMembership.status,
          };
        }

        // Only decrement counters if previous status was ACTIVE.
        // If previous status was SUSPENDED, counters were already decremented.
        const wasActive = ctx.targetMembership.status === 'ACTIVE';
        const role = ctx.targetMembership.role;

        const ownerDelta = wasActive && role === 'OWNER' ? -1 : 0;
        const managerDelta = wasActive && role === 'MANAGER' ? -1 : 0;
        const staffDelta = wasActive && role === 'STAFF' ? -1 : 0;
        const activeDelta = wasActive ? -1 : 0;

        const updatedDoc: MembershipDoc = MembershipDocSchema.parse({
          ...ctx.targetMembership,
          status: 'REVOKED',
          updatedAt: ctx.nowIso,
        });

        return {
          targetDoc: updatedDoc,
          ownerDelta,
          managerDelta,
          staffDelta,
          activeDelta,
          auditAction: 'REMOVE_MEMBER',
          previousRole: role,
          previousStatus: ctx.targetMembership.status,
        };
      }
    );

    return targetDoc;
  }

  /**
   * Atomically transfers primary tenant ownership from the current owner to target member.
   * Demotes current owner to MANAGER (or specified role) while promoting target to OWNER.
   * Enforces zero intermediate states with 0 owners.
   */
  async transferOwnership(
    params: {
      tenantId: string;
      targetUid: string;
      previousOwnerRole?: 'MANAGER' | 'STAFF';
    },
    actor: MembershipActor
  ): Promise<{ previousOwner: MembershipDoc; newOwner: MembershipDoc }> {
    const demotionRole: 'MANAGER' | 'STAFF' = params.previousOwnerRole || 'MANAGER';

    let updatedPreviousOwner: MembershipDoc | null = null;

    const { targetDoc: updatedNewOwner } = await this.executeMutation(
      params.tenantId,
      params.targetUid,
      actor,
      async (ctx) => {
        // Reject self-transfer
        if (ctx.actorMembership && ctx.actorMembership.id === params.targetUid) {
          throw new MembershipError(
            MembershipErrorCode.INVALID_ROLE_TRANSITION,
            'Cannot transfer ownership to self.'
          );
        }

        this.verifyRolePermissions('TRANSFER_OWNERSHIP', ctx.actorRole, undefined, 'OWNER');

        if (!ctx.targetMembership) {
          throw new MembershipError(
            MembershipErrorCode.MEMBERSHIP_NOT_FOUND,
            `Target user '${params.targetUid}' has no membership in tenant '${ctx.tenantId}'.`
          );
        }

        if (ctx.targetMembership.status !== 'ACTIVE') {
          throw new MembershipError(
            MembershipErrorCode.INVALID_STATUS_TRANSITION,
            `Target member must be ACTIVE to receive ownership (status: ${ctx.targetMembership.status}).`
          );
        }

        if (ctx.targetUserSnap && ctx.targetUserSnap.exists) {
          const userData = ctx.targetUserSnap.data() as Record<string, unknown> | undefined;
          if (
            userData &&
            (userData.disabled === true ||
              userData.isDisabled === true ||
              userData.status === 'DISABLED')
          ) {
            throw new MembershipError(
              MembershipErrorCode.USER_DISABLED,
              `Cannot transfer ownership to disabled user '${params.targetUid}'.`
            );
          }
        }

        // Determine who the current owner being demoted is
        let previousOwnerMembership: MembershipDoc;
        let previousOwnerRef: DocumentReference;

        if (ctx.actorMembership && ctx.actorMembership.role === 'OWNER') {
          previousOwnerMembership = ctx.actorMembership;
          previousOwnerRef = this.db.doc(firestorePaths.membership(ctx.tenantId, ctx.actorMembership.id));
        } else {
          // If executed by platform admin, target must not already be OWNER
          if (ctx.targetMembership.role === 'OWNER') {
            throw new MembershipError(
              MembershipErrorCode.INVALID_ROLE_TRANSITION,
              `Target member '${params.targetUid}' is already an OWNER.`
            );
          }
          // Platform admin recovery: Actor is not tenant owner, find an active owner to demote
          // In standard tenant transfer, actor must be active owner
          throw new MembershipError(
            MembershipErrorCode.FORBIDDEN,
            'Ownership transfer must be initiated by an active OWNER of the tenant.'
          );
        }

        // Update previous owner (demote to MANAGER/STAFF)
        updatedPreviousOwner = MembershipDocSchema.parse({
          ...previousOwnerMembership,
          role: demotionRole,
          title: demotionRole === 'MANAGER' ? 'Manager' : 'Staff',
          updatedAt: ctx.nowIso,
        });

        // Update target (promote to OWNER)
        const newOwnerDoc: MembershipDoc = MembershipDocSchema.parse({
          ...ctx.targetMembership,
          role: 'OWNER',
          title: 'Owner',
          updatedAt: ctx.nowIso,
        });

        // Counter deltas:
        // Previous owner: -1 OWNER, +1 (MANAGER or STAFF)
        // Target: +1 OWNER, -1 (previous target role)
        // Net ownerDelta: -1 + 1 = 0
        const prevTargetRole = ctx.targetMembership.role;
        const managerDelta =
          (demotionRole === 'MANAGER' ? 1 : 0) - (prevTargetRole === 'MANAGER' ? 1 : 0);
        const staffDelta =
          (demotionRole === 'STAFF' ? 1 : 0) - (prevTargetRole === 'STAFF' ? 1 : 0);

        return {
          targetDoc: newOwnerDoc,
          ownerDelta: 0, // strictly preserved
          managerDelta,
          staffDelta,
          activeDelta: 0, // total active members unchanged
          auditAction: 'TRANSFER_OWNERSHIP',
          previousRole: prevTargetRole,
          previousStatus: ctx.targetMembership.status,
          extraWrites: [
            {
              ref: previousOwnerRef,
              data: updatedPreviousOwner,
            },
          ],
        };
      }
    );

    return {
      previousOwner: updatedPreviousOwner!,
      newOwner: updatedNewOwner,
    };
  }

  /**
   * Retrieves a member's record by tenantId and UID.
   */
  async getMembership(tenantId: string, memberUid: string): Promise<MembershipDoc | null> {
    const docRef = this.db.doc(firestorePaths.membership(tenantId, memberUid));
    const snap = await docRef.get();
    if (!snap.exists) {
      return null;
    }
    return MembershipDocSchema.parse(snap.data());
  }

  /**
   * Retrieves the membership summary mutex document for a tenant.
   */
  async getMembershipSummary(tenantId: string): Promise<MembershipSummaryDoc | null> {
    const docRef = this.db.doc(firestorePaths.membershipSummary(tenantId));
    const snap = await docRef.get();
    if (!snap.exists) {
      return null;
    }
    return MembershipSummaryDocSchema.parse(snap.data());
  }
}

