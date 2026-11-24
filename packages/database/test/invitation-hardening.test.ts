import { describe, it, expect, beforeEach } from 'vitest';
import type { DocumentReference, DocumentSnapshot, WriteBatch } from 'firebase-admin/firestore';
import { InvitationRepository, type AuthUserResolver } from '../src/server/repositories/invitation.repository';
import { firestorePaths } from '../src/paths';
import { UserDocSchema } from '../src/user.schema';

class MockInvitationHardeningFirestore {
  public store = new Map<string, Record<string, unknown>>();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
      set: async (data: Record<string, unknown>) => {
        this.store.set(path, JSON.parse(JSON.stringify(data)));
      },
      update: async (data: Record<string, unknown>) => {
        const existing = this.store.get(path) || {};
        this.store.set(path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
      },
    } as unknown as DocumentReference;
  }

  collection(path: string) {
    return {
      doc: (id?: string) => {
        const docId = id || `id_${Math.random().toString(36).substring(2, 9)}`;
        return this.doc(`${path}/${docId}`);
      },
      where: (field: string, op: string, val: unknown) => ({
        limit: () => ({
          get: async () => {
            const docs: DocumentSnapshot[] = [];
            for (const [key, value] of this.store.entries()) {
              if (key.startsWith(path + '/') && value[field] === val) {
                docs.push(this.createSnapshot(key));
                break;
              }
            }
            return { docs, empty: docs.length === 0 };
          },
        }),
        get: async () => {
          const docs: DocumentSnapshot[] = [];
          for (const [key, value] of this.store.entries()) {
            if (key.startsWith(path + '/') && value[field] === val) {
              docs.push(this.createSnapshot(key));
            }
          }
          return { docs, empty: docs.length === 0 };
        },
      }),
      get: async () => {
        const docs: DocumentSnapshot[] = [];
        for (const [key] of this.store.entries()) {
          const segs = key.slice(path.length + 1).split('/');
          if (key.startsWith(path + '/') && segs.length === 1) {
            docs.push(this.createSnapshot(key));
          }
        }
        return { docs, size: docs.length, empty: docs.length === 0 };
      },
    };
  }

  batch(): WriteBatch {
    const ops: (() => void)[] = [];
    return {
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        ops.push(() => this.store.set(ref.path, JSON.parse(JSON.stringify(data))));
        return this.batch();
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        ops.push(() => {
          const existing = this.store.get(ref.path) || {};
          this.store.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        });
        return this.batch();
      },
      delete: (ref: DocumentReference) => {
        ops.push(() => this.store.delete(ref.path));
        return this.batch();
      },
      commit: async () => {
        for (const op of ops) {
          op();
        }
      },
    } as unknown as WriteBatch;
  }

  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    const tx = {
      get: async (ref: DocumentReference) => ref.get(),
      set: (ref: DocumentReference, data: Record<string, unknown>, options?: any) => {
        if (options?.merge) {
          const existing = this.store.get(ref.path) || {};
          this.store.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        } else {
          this.store.set(ref.path, JSON.parse(JSON.stringify(data)));
        }
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        const existing = this.store.get(ref.path) || {};
        this.store.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
      },
      delete: (ref: DocumentReference) => {
        this.store.delete(ref.path);
      },
    };
    return updateFunction(tx);
  }

  private createSnapshot(path: string): DocumentSnapshot {
    const exists = this.store.has(path);
    const data = exists ? JSON.parse(JSON.stringify(this.store.get(path))) : undefined;
    return {
      id: path.split('/').pop()!,
      ref: this.doc(path),
      exists,
      data: () => data,
    } as unknown as DocumentSnapshot;
  }
}

describe('Phase 2.2: Invitation Acceptance Verified Identity & Critical Edge Cases', () => {
  const tenantId = 'salon_invite_tenant';
  const ownerUid = 'tenant_owner_user';
  let mockDb: MockInvitationHardeningFirestore;
  let repo: InvitationRepository;
  let mockAuth: AuthUserResolver;

  beforeEach(() => {
    mockDb = new MockInvitationHardeningFirestore();

    mockAuth = {
      getUser: async (uid: string) => {
        if (uid === 'user_target_1') {
          return { uid, email: 'staff@example.com', emailVerified: true };
        }
        if (uid === 'user_imposter_2') {
          return { uid, email: 'imposter@example.com', emailVerified: true };
        }
        if (uid === 'unverified_user') {
          return { uid, email: 'staff@example.com', emailVerified: false };
        }
        if (uid === 'no_email_user') {
          return { uid, email: undefined, emailVerified: false };
        }
        if (uid === 'disabled_user') {
          return { uid, email: 'staff@example.com', emailVerified: true, disabled: true };
        }
        throw new Error('User record not found in Firebase Admin Auth');
      },
    };

    repo = new InvitationRepository(mockDb as any, mockAuth);

    const nowIso = new Date().toISOString();

    // Seed Tenant Document
    mockDb.store.set(firestorePaths.tenant(tenantId), {
      id: tenantId,
      name: 'صالون التألق',
      commercialName: 'مؤسسة صالون التألق للتزيين النسائي',
      slug: 'altalaq',
      crNumber: '1010123456',
      taxNumber: '300123456700003',
      ownerUid,
      billingEmail: 'billing@altalaq.com',
      contactPhone: '+966500000000',
      status: 'ACTIVE',
      isPublished: true,
      subscriptionPlan: 'PRO',
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    // Seed Owner Membership
    mockDb.store.set(firestorePaths.membership(tenantId, ownerUid), {
      id: ownerUid,
      tenantId,
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: nowIso,
      updatedAt: nowIso,
    });

    // Seed Membership Summary Mutex Document
    mockDb.store.set(firestorePaths.membershipSummary(tenantId), {
      tenantId,
      activeOwnerCount: 1,
      activeManagerCount: 0,
      activeStaffCount: 0,
      totalActiveMembers: 1,
      version: 1,
      updatedAt: nowIso,
    });

    // Seed target user documents
    mockDb.store.set(firestorePaths.user('user_target_1'), {
      id: 'user_target_1',
      email: 'staff@example.com',
      displayName: 'مستلم الدعوة المعتمد',
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    mockDb.store.set(firestorePaths.user('user_imposter_2'), {
      id: 'user_imposter_2',
      email: 'imposter@example.com',
      displayName: 'مستخدم غير مصرح',
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  });

  it('strictly forbids creating an invitation with role OWNER', async () => {
    await expect(
      repo.createInvitation(
        tenantId,
        {
          email: 'future_owner@example.com',
          role: 'OWNER',
          expiresInDays: 7,
        },
        ownerUid
      )
    ).rejects.toThrow('Cannot directly invite or add an OWNER. Ownership transfer is required.');
  });

  it('rejects acceptance if actorUid is missing or whitespace', async () => {
    const { rawToken } = await repo.createInvitation(
      tenantId,
      { email: 'staff@example.com', role: 'STAFF', expiresInDays: 7 },
      ownerUid
    );

    await expect(repo.acceptInvitation(rawToken, '')).rejects.toThrow(
      'مستخدم غير مصادق عليه: معرف المستخدم مطلوب لقبول الدعوة.'
    );
    await expect(repo.acceptInvitation(rawToken, '   ')).rejects.toThrow(
      'مستخدم غير مصادق عليه: معرف المستخدم مطلوب لقبول الدعوة.'
    );
  });

  it('rejects acceptance if user email is not verified in Firebase Admin Auth', async () => {
    const { rawToken } = await repo.createInvitation(
      tenantId,
      { email: 'staff@example.com', role: 'STAFF', expiresInDays: 7 },
      ownerUid
    );

    await expect(repo.acceptInvitation(rawToken, 'unverified_user')).rejects.toThrow(
      'يجب تأكيد وتوثيق البريد الإلكتروني للحساب قبل قبول الدعوة.'
    );
  });

  it('rejects acceptance if user record has no email in Firebase Admin Auth', async () => {
    const { rawToken } = await repo.createInvitation(
      tenantId,
      { email: 'staff@example.com', role: 'STAFF', expiresInDays: 7 },
      ownerUid
    );

    await expect(repo.acceptInvitation(rawToken, 'no_email_user')).rejects.toThrow(
      'الحساب لا يحتوي على بريد إلكتروني مسجل.'
    );
  });

  it('rejects acceptance if user account is disabled', async () => {
    const { rawToken } = await repo.createInvitation(
      tenantId,
      { email: 'staff@example.com', role: 'STAFF', expiresInDays: 7 },
      ownerUid
    );

    await expect(repo.acceptInvitation(rawToken, 'disabled_user')).rejects.toThrow(
      'حساب المستخدم معطل ولا يمكنه قبول الدعوات.'
    );
  });

  it('rejects acceptance if user does not exist in Firebase Admin Auth', async () => {
    const { rawToken } = await repo.createInvitation(
      tenantId,
      { email: 'staff@example.com', role: 'STAFF', expiresInDays: 7 },
      ownerUid
    );

    await expect(repo.acceptInvitation(rawToken, 'non_existent_uid')).rejects.toThrow(
      'تعذر التحقق من هوية المستخدم لدى خادم المصادقة'
    );
  });

  it('rejects acceptance if authoritative verified email does not match invitation email', async () => {
    const { rawToken } = await repo.createInvitation(
      tenantId,
      { email: 'staff@example.com', role: 'STAFF', expiresInDays: 7 },
      ownerUid
    );

    await expect(repo.acceptInvitation(rawToken, 'user_imposter_2')).rejects.toThrow(
      'لا يتطابق مع البريد الموجه إليه الدعوة'
    );
  });

  it('successfully accepts invitation with authoritative verified email and burns token atomically', async () => {
    const { rawToken } = await repo.createInvitation(
      tenantId,
      { email: 'staff@example.com', role: 'STAFF', expiresInDays: 7 },
      ownerUid
    );

    const result = await repo.acceptInvitation(rawToken, 'user_target_1');
    expect(result.tenantId).toBe(tenantId);
    expect(result.role).toBe('STAFF');

    // Token must be burned to ACCEPTED status
    // Attempting to accept again must be rejected immediately
    await expect(repo.acceptInvitation(rawToken, 'user_target_1')).rejects.toThrow(
      'الدعوة لم تعد صالحة (الحالة: ACCEPTED)'
    );
  });

  it('rejects spoofed verifiedUserOverride where UID does not match actorUid', async () => {
    const { rawToken } = await repo.createInvitation(
      tenantId,
      { email: 'staff@example.com', role: 'STAFF', expiresInDays: 7 },
      ownerUid
    );

    await expect(
      repo.acceptInvitation(rawToken, 'user_imposter_2', {
        uid: 'user_target_1', // Spoofed UID
        email: 'staff@example.com',
        emailVerified: true,
      })
    ).rejects.toThrow('محاولة غير مصرح بها: عدم تطابق بين معرف المستخدم المعتمد والجلسة.');
  });

  it('rejects acceptance of revoked invitation', async () => {
    const { invitation, rawToken } = await repo.createInvitation(
      tenantId,
      { email: 'staff@example.com', role: 'STAFF', expiresInDays: 7 },
      ownerUid
    );

    await repo.revokeInvitation(tenantId, invitation.id, ownerUid);

    await expect(repo.acceptInvitation(rawToken, 'user_target_1')).rejects.toThrow(
      'الدعوة لم تعد صالحة (الحالة: REVOKED)'
    );
  });

  it('rejects acceptance of expired invitation', async () => {
    const { rawToken, invitation } = await repo.createInvitation(
      tenantId,
      { email: 'staff@example.com', role: 'STAFF', expiresInDays: 1 },
      ownerUid
    );

    // Backdate the expiration to yesterday
    const pastIso = new Date(Date.now() - 86400000).toISOString();
    const tokenDoc = mockDb.store.get(firestorePaths.invitationToken(invitation.tokenHash));
    if (tokenDoc) {
      tokenDoc.expiresAt = pastIso;
    }

    await expect(repo.acceptInvitation(rawToken, 'user_target_1')).rejects.toThrow(
      'انتهت صلاحية رمز الدعوة.'
    );
  });
});
