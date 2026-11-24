import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import { InvitationRepository, type AuthUserResolver } from '../src/server/repositories/invitation.repository';
import { MembershipRepository } from '../src/server/repositories/membership.repository';
import { firestorePaths } from '../src/paths';
import { TenantDocSchema } from '../src/tenant.schema';
import { MembershipDocSchema } from '../src/membership.schema';

class MockInvitationFirestore {
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

  batch() {
    const staged = new Map<string, Record<string, unknown>>();
    return {
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        staged.set(ref.path, JSON.parse(JSON.stringify(data)));
        return this;
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        const existing = this.store.get(ref.path) || {};
        staged.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        return this;
      },
      commit: async () => {
        for (const [p, d] of staged.entries()) {
          this.store.set(p, d);
        }
      },
    };
  }

  async runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    const tx: Transaction = {
      get: async (refOrQuery: any) => {
        if (typeof refOrQuery.get === 'function') {
          return refOrQuery.get();
        }
        return this.createSnapshot(refOrQuery.path);
      },
      set: (ref: DocumentReference, data: any) => {
        this.store.set(ref.path, JSON.parse(JSON.stringify(data)));
        return tx;
      },
      update: (ref: DocumentReference, data: any) => {
        const existing = this.store.get(ref.path) || {};
        this.store.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        return tx;
      },
      delete: (ref: DocumentReference) => {
        this.store.delete(ref.path);
        return tx;
      },
    } as unknown as Transaction;

    return updateFunction(tx);
  }
}

describe('Invitation & Membership Suite', () => {
  let mockDb: MockInvitationFirestore;
  let inviteRepo: InvitationRepository;
  let membershipRepo: MembershipRepository;

  const tenantId = 'tenant_invite_test';
  const ownerUid = 'user_owner_01';
  const invitedUserUid = 'user_invited_99';

  beforeEach(() => {
    mockDb = new MockInvitationFirestore();
    const db = mockDb as unknown as Firestore;
    const mockAuth: AuthUserResolver = {
      getUser: async (uid: string) => {
        if (uid === invitedUserUid) {
          return { uid, email: 'manager@example.com', emailVerified: true };
        }
        if (uid === 'another_user') {
          return { uid, email: 'manager@example.com', emailVerified: true };
        }
        return { uid, email: 'cancel@example.com', emailVerified: true };
      },
    };
    inviteRepo = new InvitationRepository(db, mockAuth);
    membershipRepo = new MembershipRepository(db);

    const nowIso = new Date().toISOString();

    // Seed Tenant Document
    mockDb.store.set(
      firestorePaths.tenant(tenantId),
      TenantDocSchema.parse({
        id: tenantId,
        name: 'صالون التألق',
        commercialName: 'مؤسسة صالون التألق للتزيين النسائي',
        slug: 'altalaq',
        crNumber: '1010123456',
        status: 'ACTIVE',
        isPublished: true,
        primaryOwnerUid: ownerUid,
        subscriptionTier: 'STARTER',
        billingEmail: 'billing@altalaq.sa',
        createdAt: nowIso,
        updatedAt: nowIso,
      })
    );

    // Seed Owner Membership
    mockDb.store.set(
      firestorePaths.membership(tenantId, ownerUid),
      MembershipDocSchema.parse({
        id: ownerUid,
        tenantId,
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: nowIso,
        updatedAt: nowIso,
      })
    );

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

    // Seed invited user in /users
    mockDb.store.set(firestorePaths.user(invitedUserUid), {
      id: invitedUserUid,
      email: 'manager@example.com',
      displayName: 'Invited Manager',
      status: 'ACTIVE',
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  });

  it('creates cryptographically secure invitation and returns raw token while storing only hash', async () => {
    const { invitation, rawToken } = await inviteRepo.createInvitation(
      tenantId,
      {
        email: 'staff@example.com',
        role: 'STAFF',
      },
      ownerUid
    );

    expect(rawToken).toBeDefined();
    expect(rawToken.length).toBe(64); // 32 random bytes as hex string
    expect(invitation.status).toBe('PENDING');
    expect(invitation.tokenHash).toBeDefined();

    // Verify rawToken is NOT in database
    const storedInvite = mockDb.store.get(firestorePaths.invitation(tenantId, invitation.id));
    expect(storedInvite?.tokenHash).toBeDefined();
    expect(storedInvite?.rawToken).toBeUndefined();

    // Verify single-use token document exists under invitation_tokens/{tokenHash}
    const tokenDoc = mockDb.store.get(firestorePaths.invitationToken(invitation.tokenHash));
    expect(tokenDoc).toBeDefined();
    expect(tokenDoc?.tenantId).toBe(tenantId);
    expect(tokenDoc?.status).toBe('PENDING');
  });

  it('rejects direct invitation for OWNER role (requires ownership transfer)', async () => {
    await expect(
      inviteRepo.createInvitation(
        tenantId,
        {
          email: 'newowner@example.com',
          role: 'OWNER',
        },
        ownerUid
      )
    ).rejects.toThrow('Cannot directly invite or add an OWNER');
  });

  it('accepts invitation and grants membership in tenant organization', async () => {
    const { invitation, rawToken } = await inviteRepo.createInvitation(
      tenantId,
      {
        email: 'manager@example.com',
        role: 'MANAGER',
      },
      ownerUid
    );

    const accepted = await inviteRepo.acceptInvitation(rawToken, invitedUserUid);
    expect(accepted.tenantId).toBe(tenantId);
    expect(accepted.role).toBe('MANAGER');

    const updatedInvitation = await inviteRepo.getInvitationById(tenantId, invitation.id);
    expect(updatedInvitation?.status).toBe('ACCEPTED');
    expect(updatedInvitation?.acceptedByUid).toBe(invitedUserUid);

    // Verify membership document was created
    const memberDoc = await membershipRepo.getMembership(tenantId, invitedUserUid);
    expect(memberDoc).not.toBeNull();
    expect(memberDoc?.role).toBe('MANAGER');
    expect(memberDoc?.status).toBe('ACTIVE');

    // Verify attempting to use token a second time throws error (single-use enforcement)
    await expect(
      inviteRepo.acceptInvitation(rawToken, 'another_user')
    ).rejects.toThrow('الدعوة لم تعد صالحة');
  });

  it('revokes an invitation preventing any further use', async () => {
    const { invitation, rawToken } = await inviteRepo.createInvitation(
      tenantId,
      {
        email: 'cancel@example.com',
        role: 'STAFF',
      },
      ownerUid
    );

    await inviteRepo.revokeInvitation(tenantId, invitation.id, ownerUid);

    const revoked = await inviteRepo.getInvitationById(tenantId, invitation.id);
    expect(revoked?.status).toBe('REVOKED');

    await expect(
      inviteRepo.acceptInvitation(rawToken, invitedUserUid)
    ).rejects.toThrow('الدعوة لم تعد صالحة');
  });

  it('protects the last active OWNER from suspension', async () => {
    await expect(
      membershipRepo.suspendMember(
        {
          tenantId,
          targetUid: ownerUid,
        },
        { uid: ownerUid }
      )
    ).rejects.toThrow();
  });
});
