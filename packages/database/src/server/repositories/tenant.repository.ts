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
  CreateTenantInputSchema,
  TenantDocSchema,
  type CreateTenantInput,
  type TenantDoc,
} from '../../tenant.schema';
import {
  TenantSlugDocSchema,
  type TenantSlugDoc,
} from '../../slug.schema';
import {
  MembershipDocSchema,
  MembershipSummaryDocSchema,
  type MembershipDoc,
  type MembershipSummaryDoc,
} from '../../membership.schema';
import { TrustedSystemContext } from './trusted-context';

/**
 * Standard error codes for tenant provisioning operations.
 */
export enum TenantProvisioningErrorCode {
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SLUG_ALREADY_EXISTS = 'SLUG_ALREADY_EXISTS',
  OWNER_NOT_FOUND = 'OWNER_NOT_FOUND',
  OWNER_DISABLED = 'OWNER_DISABLED',
  TENANT_ALREADY_EXISTS = 'TENANT_ALREADY_EXISTS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
}

/**
 * Strongly typed error thrown on tenant provisioning failures.
 */
export class TenantProvisioningError extends Error {
  public override readonly cause?: unknown;

  constructor(
    public readonly code: TenantProvisioningErrorCode,
    message: string,
    cause?: unknown
  ) {
    super(message);
    this.name = 'TenantProvisioningError';
    this.cause = cause;
  }
}

/**
 * Result returned upon successful atomic tenant provisioning.
 */
export interface TenantProvisioningResult {
  tenantId: string;
  slug: string;
  ownerUid: string;
  status: 'PROVISIONED';
  createdAt: string;
}

/**
 * Authorization context for tenant provisioning.
 * Enforces server-authoritative permission checks.
 */
export type TenantAuthorizationContext =
  | TrustedSystemContext
  | {
      callerUid: string;
      isPlatformAdmin?: boolean;
      system?: never;
    };

/**
 * Server-only repository for tenant lifecycle, operational data access,
 * and atomic multi-document provisioning.
 */
export class TenantRepository {
  private readonly db: Firestore;

  constructor(firestore?: Firestore) {
    this.db = firestore || getFirebaseAdminFirestore();
  }

  /**
   * Generates a stable, collision-resistant tenant identifier.
   * Derived from a fresh Firestore document reference outside transaction callbacks.
   */
  protected generateTenantId(): string {
    return this.db.collection(firestorePaths.tenants()).doc().id;
  }

  /**
   * Atomically provisions a new tenant organization across 4 collections:
   * 1. Slug reservation (/tenant_slugs/{slug})
   * 2. Private operational tenant (/tenants/{tenantId})
   * 3. Owner membership (/tenants/{tenantId}/memberships/{ownerUid})
   * 4. Membership mutex summary (/tenants/{tenantId}/membership_summary/counts)
   *
   * All 4 operations succeed together or fail together within a single Firestore transaction.
   *
   * @param input Raw or typed tenant creation payload
   * @param authContext Optional verified caller context for explicit authorization boundaries
   */
  async createTenant(
    input: unknown,
    authContext?: TenantAuthorizationContext
  ): Promise<TenantProvisioningResult> {
    // -------------------------------------------------------------
    // Step 1 — Resolve & validate inputs
    // -------------------------------------------------------------
    let parsedInput: CreateTenantInput;
    try {
      parsedInput = CreateTenantInputSchema.parse(input);
    } catch (validationError) {
      throw new TenantProvisioningError(
        TenantProvisioningErrorCode.INVALID_PAYLOAD,
        'Invalid tenant provisioning payload.',
        validationError
      );
    }

    // Server-authoritative authorization boundary:
    // If caller context is provided, verify caller is authorized to provision for this owner UID.
    let isSystem = false;
    let isPlatformAdmin = false;
    let callerUid: string | undefined;

    if (authContext) {
      // Reject any untrusted caller attempting to pass a plain { system: true } or system property
      if (
        typeof authContext === 'object' &&
        'system' in authContext &&
        (authContext as Record<string, unknown>).system !== undefined
      ) {
        if (!TrustedSystemContext.isTrusted(authContext)) {
          throw new TenantProvisioningError(
            TenantProvisioningErrorCode.UNAUTHORIZED,
            'System privilege cannot be granted via untrusted context. Use TrustedSystemContext.'
          );
        }
      }

      isSystem = TrustedSystemContext.isTrusted(authContext);
      isPlatformAdmin = !isSystem && Boolean((authContext as { isPlatformAdmin?: boolean }).isPlatformAdmin);
      callerUid = !isSystem ? (authContext as { callerUid?: string }).callerUid : undefined;
      const isSelf = callerUid === parsedInput.primaryOwnerUid;

      if (!isSystem && !isPlatformAdmin && !isSelf) {
        throw new TenantProvisioningError(
          TenantProvisioningErrorCode.UNAUTHORIZED,
          `Caller '${callerUid ?? 'anonymous'}' is not authorized to provision a tenant for owner '${parsedInput.primaryOwnerUid}'.`
        );
      }

      if (isPlatformAdmin && (!callerUid || callerUid.trim() === '')) {
        throw new TenantProvisioningError(
          TenantProvisioningErrorCode.UNAUTHORIZED,
          'Platform administrator verification requires a valid callerUid.'
        );
      }
    }

    const slug = parsedInput.slug;
    const ownerUid = parsedInput.primaryOwnerUid;

    // Generate stable identifiers and timestamp OUTSIDE the transaction callback.
    // Firestore transactions may retry automatically upon conflict. Generating identifiers
    // outside guarantees that callback retries remain idempotent and reuse the same identity.
    const tenantId = this.generateTenantId();
    const nowIso = new Date().toISOString();

    // Canonical document references constructed using firestorePaths builders
    const slugRef = this.db.doc(firestorePaths.tenantSlug(slug));
    const ownerRef = this.db.doc(firestorePaths.user(ownerUid));
    const tenantRef = this.db.doc(firestorePaths.tenant(tenantId));
    const membershipRef = this.db.doc(firestorePaths.membership(tenantId, ownerUid));
    const summaryRef = this.db.doc(firestorePaths.membershipSummary(tenantId));

    // Authoritative platform admin verification reference if non-self admin caller
    const needsPlatformAdminVerification =
      !isSystem &&
      isPlatformAdmin &&
      callerUid !== ownerUid;
    const platformAdminRef = needsPlatformAdminVerification && callerUid
      ? this.db.doc(firestorePaths.platformAdmin(callerUid))
      : null;

    // -------------------------------------------------------------
    // Step 2-6 — Atomic Firestore Transaction
    // -------------------------------------------------------------
    try {
      await this.db.runTransaction(async (transaction: Transaction) => {
        // Step 2 — Read transaction prerequisites FIRST (all reads before writes)
        const [slugSnap, ownerSnap, tenantSnap, platformAdminSnap] = await Promise.all([
          transaction.get(slugRef),
          transaction.get(ownerRef),
          transaction.get(tenantRef),
          platformAdminRef ? transaction.get(platformAdminRef) : Promise.resolve(null),
        ]);

        // Authoritative verification: reject unverified platform admin claim
        if (platformAdminRef && (!platformAdminSnap || !platformAdminSnap.exists)) {
          throw new TenantProvisioningError(
            TenantProvisioningErrorCode.UNAUTHORIZED,
            `Authoritative platform administrator verification failed for '${callerUid}'.`
          );
        }

        // Guard 1: Slug collision
        if (slugSnap.exists) {
          throw new TenantProvisioningError(
            TenantProvisioningErrorCode.SLUG_ALREADY_EXISTS,
            `The slug '${slug}' is already reserved.`
          );
        }

        // Guard 2: Missing owner user identity
        if (!ownerSnap.exists) {
          throw new TenantProvisioningError(
            TenantProvisioningErrorCode.OWNER_NOT_FOUND,
            `Owner user record '${ownerUid}' does not exist.`
          );
        }

        // Guard 3: Disabled or invalid owner
        const ownerData = ownerSnap.data() as Record<string, unknown> | undefined;
        if (
          ownerData &&
          (ownerData.disabled === true ||
            ownerData.isDisabled === true ||
            ownerData.status === 'DISABLED')
        ) {
          throw new TenantProvisioningError(
            TenantProvisioningErrorCode.OWNER_DISABLED,
            `Owner account '${ownerUid}' is disabled.`
          );
        }

        // Guard 4: Tenant ID collision check
        if (tenantSnap.exists) {
          throw new TenantProvisioningError(
            TenantProvisioningErrorCode.TENANT_ALREADY_EXISTS,
            `Tenant '${tenantId}' already exists.`
          );
        }

        // Step 3 — Construct Private Operational Tenant Document
        const tenantDocData: TenantDoc = TenantDocSchema.parse({
          id: tenantId,
          slug: parsedInput.slug,
          name: parsedInput.name,
          commercialName: parsedInput.commercialName,
          crNumber: parsedInput.crNumber,
          ...(parsedInput.vatNumber ? { vatNumber: parsedInput.vatNumber } : {}),
          status: 'ACTIVE',
          isPublished: false,
          primaryOwnerUid: ownerUid,
          subscriptionTier: parsedInput.subscriptionTier,
          billingEmail: parsedInput.billingEmail,
          timezone: 'Asia/Riyadh',
          currency: 'SAR',
          createdAt: nowIso,
          updatedAt: nowIso,
        });

        // Step 4 — Construct Slug Reservation Document
        const slugDocData: TenantSlugDoc = TenantSlugDocSchema.parse({
          slug: parsedInput.slug,
          tenantId,
          status: 'ACTIVE',
          allocatedAt: nowIso,
        });

        // Step 5 — Construct Owner Membership Document
        const membershipDocData: MembershipDoc = MembershipDocSchema.parse({
          id: ownerUid,
          tenantId,
          role: 'OWNER',
          status: 'ACTIVE',
          title: 'Primary Owner',
          joinedAt: nowIso,
          updatedAt: nowIso,
        });

        // Step 6 — Construct Membership Mutex Summary Document
        const summaryDocData: MembershipSummaryDoc = MembershipSummaryDocSchema.parse({
          tenantId,
          activeOwnerCount: 1,
          activeManagerCount: 0,
          activeStaffCount: 0,
          totalActiveMembers: 1,
          version: 0,
          updatedAt: nowIso,
        });

        // Writes: All staged within the transaction for atomic commit
        transaction.set(tenantRef, tenantDocData);
        transaction.set(slugRef, slugDocData);
        transaction.set(membershipRef, membershipDocData);
        transaction.set(summaryRef, summaryDocData);
      });
    } catch (error) {
      if (error instanceof TenantProvisioningError) {
        throw error;
      }
      throw new TenantProvisioningError(
        TenantProvisioningErrorCode.TRANSACTION_FAILED,
        `Tenant provisioning transaction failed: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }

    // -------------------------------------------------------------
    // Step 7 — Commit & Return Strongly Typed Provisioning Result
    // -------------------------------------------------------------
    return {
      tenantId,
      slug,
      ownerUid,
      status: 'PROVISIONED',
      createdAt: nowIso,
    };
  }

  /**
   * Retrieves an operational tenant record by its canonical ID.
   * Server-only access.
   */
  async getTenantById(tenantId: string): Promise<TenantDoc | null> {
    const docRef = this.db.doc(firestorePaths.tenant(tenantId));
    const snap = await docRef.get();
    if (!snap.exists) {
      return null;
    }
    return TenantDocSchema.parse(snap.data());
  }

  /**
   * Resolves a slug to an operational tenant document.
   */
  async getTenantBySlug(slug: string): Promise<TenantDoc | null> {
    const slugRef = this.db.doc(firestorePaths.tenantSlug(slug));
    const slugSnap = await slugRef.get();
    if (!slugSnap.exists) {
      return null;
    }
    const slugData = TenantSlugDocSchema.parse(slugSnap.data());
    return this.getTenantById(slugData.tenantId);
  }

  /**
   * Checks whether a slug is available for reservation.
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    const slugRef = this.db.doc(firestorePaths.tenantSlug(slug));
    const slugSnap = await slugRef.get();
    return !slugSnap.exists;
  }
}
