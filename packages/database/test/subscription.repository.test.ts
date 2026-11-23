import { describe, it, expect, beforeEach } from 'vitest';
import type {
  Firestore,
  DocumentReference,
  DocumentSnapshot,
  Transaction,
} from 'firebase-admin/firestore';
import {
  SubscriptionRepository,
  SubscriptionUnauthorizedError,
  SubscriptionNotFoundError,
} from '../src/server/repositories/subscription.repository';
import { SubscriptionAccessGuard } from '../src/server/subscription-guard';
import { firestorePaths } from '../src/paths';
import type { SubscriptionDoc } from '../src/subscription.schema';

class InMemoryTransactionalFirestore {
  private store = new Map<string, Record<string, unknown>>();
  private docVersions = new Map<string, number>();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
    } as unknown as DocumentReference;
  }

  collection(path: string) {
    return {
      doc: (id?: string) => {
        const docId = id || `auto_${Math.random().toString(36).substring(2, 10)}`;
        return this.doc(`${path}/${docId}`);
      },
      orderBy: () => ({
        get: async () => {
          const docs: DocumentSnapshot[] = [];
          for (const [key, value] of this.store.entries()) {
            if (key.startsWith(path + '/')) {
              docs.push(this.createSnapshot(key));
            }
          }
          return { docs };
        },
      }),
      get: async () => {
        const docs: DocumentSnapshot[] = [];
        for (const [key, value] of this.store.entries()) {
          // match direct children
          const segments = key.slice(path.length + 1).split('/');
          if (key.startsWith(path + '/') && segments.length === 1) {
            docs.push(this.createSnapshot(key));
          }
        }
        return { docs };
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

  setDocumentDirect(path: string, data: Record<string, unknown>) {
    this.store.set(path, JSON.parse(JSON.stringify(data)));
    this.docVersions.set(path, (this.docVersions.get(path) || 0) + 1);
  }

  getDocumentDirect(path: string): Record<string, unknown> | undefined {
    return this.store.get(path);
  }

  batch() {
    const staged = new Map<string, Record<string, unknown>>();
    return {
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        staged.set(ref.path, JSON.parse(JSON.stringify(data)));
        return this;
      },
      commit: async () => {
        for (const [p, d] of staged.entries()) {
          this.setDocumentDirect(p, d);
        }
      },
    };
  }

  async runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    const stagedWrites = new Map<string, Record<string, unknown>>();
    const mockTransaction: Transaction = {
      get: async (ref: DocumentReference) => {
        return this.createSnapshot(ref.path);
      },
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        stagedWrites.set(ref.path, JSON.parse(JSON.stringify(data)));
        return mockTransaction;
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        const existing = this.store.get(ref.path) || {};
        stagedWrites.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        return mockTransaction;
      },
    } as unknown as Transaction;

    const result = await updateFunction(mockTransaction);
    for (const [p, d] of stagedWrites.entries()) {
      this.setDocumentDirect(p, d);
    }
    return result;
  }
}

describe('B.2.8 Subscription Lifecycle & Repository Suite', () => {
  let mockDb: InMemoryTransactionalFirestore;
  let repo: SubscriptionRepository;
  let guard: SubscriptionAccessGuard;

  const tenantId = 'tenant_lamsa_01';
  const ownerUid = 'user_owner_01';
  const adminUid = 'platform_admin_super';

  const baseStartTime = new Date('2026-11-23T12:00:00.000Z');

  beforeEach(() => {
    mockDb = new InMemoryTransactionalFirestore();
    repo = new SubscriptionRepository(mockDb as unknown as Firestore);
    guard = new SubscriptionAccessGuard(mockDb as unknown as Firestore);

    // Setup active platform admin
    mockDb.setDocumentDirect(firestorePaths.platformAdmin(adminUid), {
      uid: adminUid,
      isActive: true,
      role: 'SUPER_ADMIN',
    });

    // Setup tenant document
    mockDb.setDocumentDirect(firestorePaths.tenant(tenantId), {
      id: tenantId,
      name: 'Lamsa Salon',
      slug: 'lamsa',
      status: 'ACTIVE',
      primaryOwnerUid: ownerUid,
      createdAt: baseStartTime.toISOString(),
      updatedAt: baseStartTime.toISOString(),
    });
  });

  describe('1. 3-Day Free Trial Creation', () => {
    it('creates exactly 72-hour trial subscription upon provisioning', async () => {
      const sub = await repo.createTrialSubscription(tenantId, 'STARTER', {
        now: baseStartTime,
        actorUid: ownerUid,
      });

      expect(sub.status).toBe('TRIALING');
      expect(sub.tenantId).toBe(tenantId);
      expect(sub.trialDurationDays).toBe(3);
      expect(sub.trialStartedAt).toBe('2026-11-23T12:00:00.000Z');
      expect(sub.trialEndsAt).toBe('2026-11-26T12:00:00.000Z'); // exactly +72 hours
      expect(sub.currentPeriodEndsAt).toBeNull();

      // Verify persisted in Firestore
      const persisted = mockDb.getDocumentDirect(firestorePaths.subscription(tenantId));
      expect(persisted).toBeDefined();
      expect(persisted?.status).toBe('TRIALING');
    });

    it('creates an initial audit trail record upon trial creation', async () => {
      await repo.createTrialSubscription(tenantId, 'STARTER', {
        now: baseStartTime,
        actorUid: ownerUid,
      });

      const auditTrail = await repo.getSubscriptionAuditTrail(tenantId);
      expect(auditTrail.length).toBe(1);
      expect(auditTrail[0].action).toBe('TRIAL_CREATED');
      expect(auditTrail[0].previousStatus).toBe('TRIALING');
      expect(auditTrail[0].newStatus).toBe('TRIALING');
      expect(auditTrail[0].durationDays).toBe(3);
    });
  });

  describe('2. Authoritative Server-Time Access Evaluation', () => {
    beforeEach(async () => {
      await repo.createTrialSubscription(tenantId, 'STARTER', {
        now: baseStartTime,
        actorUid: ownerUid,
      });
    });

    it('allows operational access during the 72-hour trial (e.g. at 24 hours)', async () => {
      const evaluationTime = new Date('2026-11-24T12:00:00.000Z');
      const evalResult = await repo.verifyOperationalAccess(tenantId, evaluationTime);

      expect(evalResult.allowed).toBe(true);
      expect(evalResult.effectiveStatus).toBe('TRIALING');
      expect(evalResult.isTrial).toBe(true);
      expect(evalResult.isExpired).toBe(false);
      expect(evalResult.remainingTrialHours).toBe(48);

      // Guard check
      const guardResult = await guard.checkOperationalAccess(tenantId, evaluationTime);
      expect(guardResult.allowed).toBe(true);
    });

    it('rejects operational access exactly at trial expiration (72 hours)', async () => {
      const expiryTime = new Date('2026-11-26T12:00:00.000Z');
      const evalResult = await repo.verifyOperationalAccess(tenantId, expiryTime);

      expect(evalResult.allowed).toBe(false);
      expect(evalResult.effectiveStatus).toBe('EXPIRED');
      expect(evalResult.isExpired).toBe(true);
      expect(evalResult.remainingTrialHours).toBe(0);

      // Guard assertion throws typed SubscriptionAccessError
      await expect(guard.assertOperationalAccess(tenantId, expiryTime)).rejects.toThrow(
        /انتهت فترة التجربة المجانية/
      );
    });

    it('rejects operational access after trial expiration has passed', async () => {
      const afterExpiry = new Date('2026-11-26T12:00:01.000Z');
      const evalResult = await repo.verifyOperationalAccess(tenantId, afterExpiry);

      expect(evalResult.allowed).toBe(false);
      expect(evalResult.effectiveStatus).toBe('EXPIRED');
    });

    it('synchronizes expiration status idempotently in Firestore', async () => {
      const afterExpiry = new Date('2026-11-27T00:00:00.000Z');
      const synced = await repo.syncExpirationIfNecessary(tenantId, afterExpiry);

      expect(synced?.status).toBe('EXPIRED');

      const persisted = mockDb.getDocumentDirect(firestorePaths.subscription(tenantId));
      expect(persisted?.status).toBe('EXPIRED');

      const auditTrail = await repo.getSubscriptionAuditTrail(tenantId);
      const autoExpiredAudit = auditTrail.find((a) => a.action === 'AUTO_EXPIRED');
      expect(autoExpiredAudit).toBeDefined();
    });
  });

  describe('3. Platform Administrator Manual Activation', () => {
    beforeEach(async () => {
      await repo.createTrialSubscription(tenantId, 'STARTER', {
        now: baseStartTime,
        actorUid: ownerUid,
      });
    });

    it('allows authorized platform administrator to manually activate subscription', async () => {
      const activationTime = new Date('2026-11-25T10:00:00.000Z');
      const activatedSub = await repo.activateSubscription({
        tenantId,
        adminUid,
        durationDays: 30,
        planId: 'GROWTH',
        note: 'Customer confirmed annual bank wire transfer',
        now: activationTime,
      });

      expect(activatedSub.status).toBe('ACTIVE');
      expect(activatedSub.planId).toBe('GROWTH');
      expect(activatedSub.activatedBy).toBe(adminUid);
      expect(activatedSub.currentPeriodStartedAt).toBe(activationTime.toISOString());
      expect(activatedSub.currentPeriodEndsAt).toBe(
        new Date(activationTime.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      );

      // Verify audit record created
      const auditTrail = await repo.getSubscriptionAuditTrail(tenantId);
      const activationAudit = auditTrail.find((a) => a.action === 'MANUALLY_ACTIVATED');
      expect(activationAudit).toBeDefined();
      expect(activationAudit?.actorUid).toBe(adminUid);
      expect(activationAudit?.durationDays).toBe(30);
      expect(activationAudit?.note).toBe('Customer confirmed annual bank wire transfer');

      // Verify operational access is now fully active
      const evalResult = await repo.verifyOperationalAccess(tenantId, activationTime);
      expect(evalResult.allowed).toBe(true);
      expect(evalResult.effectiveStatus).toBe('ACTIVE');
    });

    it('strictly rejects activation when caller is not an authorized platform administrator', async () => {
      const rogueCallerUid = 'rogue_user_or_owner';

      await expect(
        repo.activateSubscription({
          tenantId,
          adminUid: rogueCallerUid,
          durationDays: 30,
        })
      ).rejects.toThrow(SubscriptionUnauthorizedError);

      // Verify subscription status was NOT modified
      const sub = await repo.getSubscription(tenantId);
      expect(sub?.status).toBe('TRIALING');
    });

    it('strictly rejects activation when caller tries to spoof admin role in a normal user doc', async () => {
      const fakeAdminUid = 'fake_admin';
      mockDb.setDocumentDirect(firestorePaths.user(fakeAdminUid), {
        uid: fakeAdminUid,
        role: 'SUPER_ADMIN', // Spoofed in /users, but missing in /platform_admins
      });

      await expect(
        repo.activateSubscription({
          tenantId,
          adminUid: fakeAdminUid,
          durationDays: 30,
        })
      ).rejects.toThrow(SubscriptionUnauthorizedError);
    });

    it('restores access for an EXPIRED salon without recreating or altering tenant data', async () => {
      // 1. Let trial expire
      const expiredTime = new Date('2026-11-27T00:00:00.000Z');
      await repo.syncExpirationIfNecessary(tenantId, expiredTime);

      let access = await repo.verifyOperationalAccess(tenantId, expiredTime);
      expect(access.allowed).toBe(false);

      // 2. Platform admin activates
      await repo.activateSubscription({
        tenantId,
        adminUid,
        durationDays: 60,
        now: expiredTime,
      });

      // 3. Operational access immediately restored
      access = await repo.verifyOperationalAccess(tenantId, expiredTime);
      expect(access.allowed).toBe(true);
      expect(access.effectiveStatus).toBe('ACTIVE');

      // 4. Tenant record and existing metadata remain 100% intact
      const tenantDoc = mockDb.getDocumentDirect(firestorePaths.tenant(tenantId));
      expect(tenantDoc?.name).toBe('Lamsa Salon');
      expect(tenantDoc?.slug).toBe('lamsa');
      expect(tenantDoc?.primaryOwnerUid).toBe(ownerUid);
    });
  });

  describe('4. Tenant Isolation & Administrative Boundaries', () => {
    const tenantB = 'tenant_salon_b';

    beforeEach(async () => {
      await repo.createTrialSubscription(tenantId, 'STARTER', {
        now: baseStartTime,
        actorUid: ownerUid,
      });

      // Create Tenant B
      mockDb.setDocumentDirect(firestorePaths.tenant(tenantB), {
        id: tenantB,
        name: 'Salon B',
        slug: 'salon-b',
        status: 'ACTIVE',
        primaryOwnerUid: 'user_owner_b',
      });
      await repo.createTrialSubscription(tenantB, 'STARTER', {
        now: baseStartTime,
        actorUid: 'user_owner_b',
      });
    });

    it('maintains strict isolation between Tenant A and Tenant B subscriptions', async () => {
      // Activate Tenant A
      await repo.activateSubscription({
        tenantId,
        adminUid,
        durationDays: 30,
        now: baseStartTime,
      });

      const subA = await repo.getSubscription(tenantId);
      const subB = await repo.getSubscription(tenantB);

      expect(subA?.status).toBe('ACTIVE');
      expect(subB?.status).toBe('TRIALING');

      // Tenant A audit trail does not contain Tenant B records
      const auditA = await repo.getSubscriptionAuditTrail(tenantId);
      const auditB = await repo.getSubscriptionAuditTrail(tenantB);

      expect(auditA.every((a) => a.tenantId === tenantId)).toBe(true);
      expect(auditB.every((b) => b.tenantId === tenantB)).toBe(true);
    });

    it('rejects activation for non-existent tenant', async () => {
      await expect(
        repo.activateSubscription({
          tenantId: 'non_existent_tenant',
          adminUid,
          durationDays: 30,
        })
      ).rejects.toThrow(/Tenant 'non_existent_tenant' does not exist/);
    });
  });
});

