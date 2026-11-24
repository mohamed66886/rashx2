import 'server-only';
import { randomBytes, createHash } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';
import type { Auth, UserRecord } from 'firebase-admin/auth';
import { getFirebaseAdminFirestore } from '../index';
import { getFirebaseAdminAuth } from '@rashx/auth/server';
import { firestorePaths } from '../../paths';
import {
  InvitationDocSchema,
  InvitationTokenDocSchema,
  CreateInvitationInputSchema,
  type InvitationDoc,
  type InvitationTokenDoc,
} from '../../invitation.schema';
import { MembershipRepository } from './membership.repository';
import { EmployeeRepository } from './employee.repository';
import { createInternalSystemContext } from './trusted-context';
import { HrAuditRecordSchema, type HrAuditRecord } from '../../hr-audit.schema';

export interface AuthUserResolver {
  getUser(uid: string): Promise<UserRecord | { uid: string; email?: string; emailVerified?: boolean; disabled?: boolean }>;
}

export class InvitationRepository {
  private readonly db: Firestore;
  private readonly auth?: AuthUserResolver;
  private readonly membershipRepo: MembershipRepository;
  private readonly employeeRepo: EmployeeRepository;

  constructor(firestore?: Firestore, auth?: AuthUserResolver) {
    this.db = firestore || getFirebaseAdminFirestore();
    if (auth) {
      this.auth = auth;
    } else {
      try {
        this.auth = getFirebaseAdminAuth();
      } catch {
        // Fallback for isolated unit tests where auth mock is injected explicitly
      }
    }
    this.membershipRepo = new MembershipRepository(this.db);
    this.employeeRepo = new EmployeeRepository(this.db);
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Generates a cryptographically secure, single-use tenant invitation.
   * Atomically commits invitation document, token lookup, and immutable HR audit record.
   */
  async createInvitation(
    tenantId: string,
    input: unknown,
    actorUid: string
  ): Promise<{ invitation: InvitationDoc; rawToken: string }> {
    const parsed = CreateInvitationInputSchema.parse(input);
    if (parsed.role === 'OWNER') {
      throw new Error('Cannot directly invite or add an OWNER. Ownership transfer is required.');
    }
    const nowIso = new Date().toISOString();

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + (parsed.expiresInDays || 7));
    const expiresAt = expiresDate.toISOString();

    const invitationId = this.db.collection(firestorePaths.invitations(tenantId)).doc().id;

    const invitation: InvitationDoc = InvitationDocSchema.parse({
      id: invitationId,
      tenantId,
      email: parsed.email.toLowerCase(),
      role: parsed.role,
      targetEmployeeId: parsed.targetEmployeeId || null,
      tokenHash,
      expiresAt,
      status: 'PENDING',
      invitedByUid: actorUid,
      acceptedByUid: null,
      acceptedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    const tokenDoc: InvitationTokenDoc = InvitationTokenDocSchema.parse({
      tokenHash,
      invitationId,
      tenantId,
      email: invitation.email,
      role: invitation.role,
      targetEmployeeId: invitation.targetEmployeeId,
      expiresAt,
      status: 'PENDING',
    });

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'USER_LINKED',
      entityType: 'MEMBERSHIP',
      entityId: invitationId,
      actorUid,
      details: {
        invitedEmail: invitation.email,
        role: invitation.role,
        targetEmployeeId: invitation.targetEmployeeId,
      },
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.set(this.db.doc(firestorePaths.invitation(tenantId, invitationId)), invitation);
    batch.set(this.db.doc(firestorePaths.invitationToken(tokenHash)), tokenDoc);
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    await batch.commit();

    return { invitation, rawToken };
  }

  /**
   * Gets an invitation by ID.
   */
  async getInvitationById(tenantId: string, invitationId: string): Promise<InvitationDoc | null> {
    const snap = await this.db.doc(firestorePaths.invitation(tenantId, invitationId)).get();
    if (!snap.exists) return null;
    return InvitationDocSchema.parse(snap.data());
  }

  /**
   * Lists all invitations for a tenant.
   */
  async listInvitations(tenantId: string): Promise<InvitationDoc[]> {
    const snap = await this.db.collection(firestorePaths.invitations(tenantId)).get();
    const invitations = snap.docs
      .map((d) => InvitationDocSchema.parse(d.data()))
      .filter((inv) => inv.tenantId === tenantId);

    invitations.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return invitations;
  }

  /**
   * Revokes an existing pending invitation.
   * Atomically marks invitation and token as REVOKED and logs HR audit record.
   */
  async revokeInvitation(
    tenantId: string,
    invitationId: string,
    actorUid: string
  ): Promise<InvitationDoc> {
    const invRef = this.db.doc(firestorePaths.invitation(tenantId, invitationId));
    const snap = await invRef.get();
    if (!snap.exists) {
      throw new Error(`دعوة الانضمام (${invitationId}) غير موجودة.`);
    }

    const invitation = InvitationDocSchema.parse(snap.data());
    if (invitation.status !== 'PENDING') {
      throw new Error('لا يمكن إلغاء دعوة غير معلقة.');
    }

    const nowIso = new Date().toISOString();
    const updated: InvitationDoc = InvitationDocSchema.parse({
      ...invitation,
      status: 'REVOKED',
      updatedAt: nowIso,
    });

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'MEMBERSHIP_REVOKED',
      entityType: 'MEMBERSHIP',
      entityId: invitationId,
      actorUid,
      details: {
        revokedEmail: invitation.email,
      },
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.set(invRef, updated);
    batch.update(this.db.doc(firestorePaths.invitationToken(invitation.tokenHash)), {
      status: 'REVOKED',
    });
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    await batch.commit();

    return updated;
  }

  /**
   * Accepts an invitation using the raw token string.
   * Atomically verifies and burns the single-use token in a transaction,
   * authoritatively verifies authenticated identity via Firebase Admin Auth,
   * activates membership, and links the employee profile if specified.
   *
   * Security Invariants:
   * 1. Requires valid authenticated UID (cannot supply empty or unauthenticated UID).
   * 2. Authoritatively resolves user record from Firebase Admin Auth.
   * 3. Requires verified email (unverified accounts cannot claim invitations).
   * 4. Enforces strict email matching against the invited email.
   * 5. Rejects any attempt to accept OWNER role via invitation.
   * 6. Consumes token inside a transaction to prevent double-spending or replay attacks.
   */
  async acceptInvitation(
    rawToken: string,
    actorUid: string,
    verifiedUserOverride?: { uid: string; email?: string; emailVerified?: boolean }
  ): Promise<{ tenantId: string; role: string }> {
    if (!actorUid || typeof actorUid !== 'string' || actorUid.trim() === '') {
      throw new Error('مستخدم غير مصادق عليه: معرف المستخدم مطلوب لقبول الدعوة.');
    }

    const cleanActorUid = actorUid.trim();

    // 1. Authoritatively resolve the verified user record from Firebase Admin Auth
    let resolvedEmail: string | undefined;
    let resolvedEmailVerified = false;

    if (verifiedUserOverride) {
      if (verifiedUserOverride.uid !== cleanActorUid) {
        throw new Error('محاولة غير مصرح بها: عدم تطابق بين معرف المستخدم المعتمد والجلسة.');
      }
      resolvedEmail = verifiedUserOverride.email;
      resolvedEmailVerified = verifiedUserOverride.emailVerified ?? false;
    } else if (this.auth) {
      try {
        const userRecord = await this.auth.getUser(cleanActorUid);
        if (userRecord.disabled) {
          throw new Error('حساب المستخدم معطل ولا يمكنه قبول الدعوات.');
        }
        resolvedEmail = userRecord.email;
        resolvedEmailVerified = userRecord.emailVerified ?? false;
      } catch (err: any) {
        throw new Error(`تعذر التحقق من هوية المستخدم لدى خادم المصادقة: ${err.message || 'المستخدم غير موجود'}`);
      }
    } else {
      throw new Error('خدمة المصادقة غير مهيأة ولا يمكن التحقق من هوية المستخدم الموثقة.');
    }

    if (!resolvedEmail || resolvedEmail.trim() === '') {
      throw new Error('الحساب لا يحتوي على بريد إلكتروني مسجل.');
    }

    if (!resolvedEmailVerified) {
      throw new Error('يجب تأكيد وتوثيق البريد الإلكتروني للحساب قبل قبول الدعوة.');
    }

    const normalizedActorEmail = resolvedEmail.trim().toLowerCase();

    const tokenHash = this.hashToken(rawToken);
    const tokenRef = this.db.doc(firestorePaths.invitationToken(tokenHash));
    const nowIso = new Date().toISOString();

    let tokenData!: InvitationTokenDoc;

    // Transaction guarantees single-use atomic consumption under concurrent acceptance attempts
    await this.db.runTransaction(async (tx) => {
      const tokenSnap = await tx.get(tokenRef);
      if (!tokenSnap.exists) {
        throw new Error('رمز الدعوة غير صالح أو تم استخدامه مسبقاً.');
      }

      tokenData = InvitationTokenDocSchema.parse(tokenSnap.data());

      if (tokenData.status !== 'PENDING') {
        throw new Error(`الدعوة لم تعد صالحة (الحالة: ${tokenData.status}).`);
      }

      if (tokenData.expiresAt <= nowIso) {
        tx.update(tokenRef, { status: 'EXPIRED' });
        throw new Error('انتهت صلاحية رمز الدعوة.');
      }

      if (tokenData.role === 'OWNER') {
        throw new Error('لا يمكن قبول دور المالك (OWNER) عبر رابط دعوة.');
      }

      const normalizedTokenEmail = tokenData.email.trim().toLowerCase();
      if (normalizedActorEmail !== normalizedTokenEmail) {
        throw new Error(
          `البريد الإلكتروني الموثق للحساب (${normalizedActorEmail}) لا يتطابق مع البريد الموجه إليه الدعوة (${normalizedTokenEmail}).`
        );
      }

      const invRef = this.db.doc(firestorePaths.invitation(tokenData.tenantId, tokenData.invitationId));

      const auditId = this.db.collection(firestorePaths.hrAuditTrail(tokenData.tenantId)).doc().id;
      const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
        id: auditId,
        tenantId: tokenData.tenantId,
        action: 'USER_LINKED',
        entityType: 'MEMBERSHIP',
        entityId: cleanActorUid,
        actorUid: cleanActorUid,
        details: {
          invitationId: tokenData.invitationId,
          role: tokenData.role,
          targetEmployeeId: tokenData.targetEmployeeId,
        },
        timestamp: nowIso,
      });

      tx.update(tokenRef, {
        status: 'ACCEPTED',
      });
      tx.update(invRef, {
        status: 'ACCEPTED',
        acceptedByUid: cleanActorUid,
        acceptedAt: nowIso,
        updatedAt: nowIso,
      });
      tx.set(this.db.doc(firestorePaths.hrAuditRecord(tokenData.tenantId, auditId)), auditRecord);
    });

    const { tenantId, invitationId, role, targetEmployeeId } = tokenData;

    // Add membership using MembershipRepository with authoritative internal system context
    await this.membershipRepo.addMember(
      {
        tenantId,
        targetUid: cleanActorUid,
        role: role as 'MANAGER' | 'STAFF',
        title: targetEmployeeId ? 'عضو فريق العمل' : undefined,
      },
      createInternalSystemContext('accept_invitation')
    );

    // If an employee profile was targeted, link user to employee
    if (targetEmployeeId) {
      await this.employeeRepo.linkUser(tenantId, targetEmployeeId, cleanActorUid, cleanActorUid);
    }

    return { tenantId, role };
  }
}
