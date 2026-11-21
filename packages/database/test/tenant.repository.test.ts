import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import {
  TenantRepository,
  TenantProvisioningError,
  TenantProvisioningErrorCode,
} from '../src/server/repositories/tenant.repository';
import { createTrustedSystemContext } from '../src/server/internal/trusted-system';
import { firestorePaths } from '../src/paths';

/**
 * High-fidelity in-memory transactional Firestore simulation.
 * Rigorously models Firestore Admin SDK transaction mechanics:
 * 1. Read-before-write validation: transaction.get() after set() throws.
 * 2. Atomic staging: writes are buffered and only committed if callback succeeds.
 * 3. Failure rollback: exceptions leave underlying store completely unchanged.
 * 4. Concurrency conflict detection: concurrent modifications simulate transaction abort/retry.
 */
class InMemoryTransactionalFirestore {
  private store = new Map<string, Record<string, unknown>>();
  private docVersions = new Map<string, number>();
  public transactionExecutionCount = 0;
  public simulateConflictOnNextRun = false;

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

  hasDocument(path: string): boolean {
    return this.store.has(path);
  }

  getStoreKeys(): string[] {
    return Array.from(this.store.keys());
  }

  async runTransaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>,
    attempt = 1
  ): Promise<T> {
    this.transactionExecutionCount++;

    const stagedWrites = new Map<string, Record<string, unknown>>();
    const readVersions = new Map<string, number>();
    let hasWritten = false;

    const mockTransaction: Transaction = {
      get: async (ref: DocumentReference) => {
        if (hasWritten) {
          throw new Error('Firestore transactions require all reads to be executed before writes.');
        }
        readVersions.set(ref.path, this.docVersions.get(ref.path) || 0);
        return this.createSnapshot(ref.path);
      },
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        hasWritten = true;
        stagedWrites.set(ref.path, JSON.parse(JSON.stringify(data)));
        return mockTransaction;
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        hasWritten = true;
        stagedWrites.set(ref.path, JSON.parse(JSON.stringify(data)));
        return mockTransaction;
      },
      delete: (ref: DocumentReference) => {
        hasWritten = true;
        return mockTransaction;
      },
    } as unknown as Transaction;

    // Simulate transient concurrency conflict requiring one retry
    if (this.simulateConflictOnNextRun) {
      this.simulateConflictOnNextRun = false;
      // First attempt executes and throws simulated conflict
      try {
        await updateFunction(mockTransaction);
      } catch (err) {
        // Discard staged writes
        stagedWrites.clear();
      }
      // Re-run transaction (retry)
      return this.runTransaction(updateFunction, attempt + 1);
    }

    // Execute transaction callback
    const result = await updateFunction(mockTransaction);

    // Concurrency conflict detection: verify all read documents remain untouched
    for (const [path, readVer] of readVersions.entries()) {
      const currentVer = this.docVersions.get(path) || 0;
      if (currentVer !== readVer) {
        // Conflicting concurrent write committed during transaction execution:
        // Automatically retry transaction (up to 5 attempts, mimicking Firestore)
        if (attempt < 5) {
          return this.runTransaction(updateFunction, attempt + 1);
        }
        throw new Error('Transaction failed due to concurrent modification conflict.');
      }
    }

    // Atomic commit: apply all staged writes into underlying store
    for (const [path, data] of stagedWrites.entries()) {
      this.store.set(path, data);
      this.docVersions.set(path, (this.docVersions.get(path) || 0) + 1);
    }

    return result;
  }
}

describe('TenantRepository — Atomic Provisioning & Transactional Safety', () => {
  let mockDb: InMemoryTransactionalFirestore;
  let repo: TenantRepository;

  const validOwnerUid = 'firebase_auth_owner_01';
  const validOwnerDoc = {
    uid: validOwnerUid,
    email: 'owner@riyadhsalon.sa',
    displayName: 'Turki Al-Saud',
    disabled: false,
    createdAt: '2026-11-20T00:00:00.000Z',
  };

  const validPayload = {
    slug: 'riyadh-salon',
    name: 'Riyadh Luxury Salon',
    commercialName: 'Riyadh Beauty Trading Est.',
    crNumber: '1010123456',
    vatNumber: '310123456789012',
    primaryOwnerUid: validOwnerUid,
    subscriptionTier: 'GROWTH' as const,
    billingEmail: 'billing@riyadhsalon.sa',
  };

  beforeEach(() => {
    mockDb = new InMemoryTransactionalFirestore();
    // Seed the owner user into /users/{ownerUid}
    mockDb.setDocumentDirect(firestorePaths.user(validOwnerUid), validOwnerDoc);
    repo = new TenantRepository(mockDb as unknown as Firestore);
  });

  // -------------------------------------------------------------
  // Scenario 1-5: Successful Atomic Provisioning & Document Persisting
  // -------------------------------------------------------------
  it('1. Successfully provisions tenant and returns strongly-typed result', async () => {
    const result = await repo.createTenant(validPayload);

    expect(result).toBeDefined();
    expect(result.status).toBe('PROVISIONED');
    expect(result.slug).toBe('riyadh-salon');
    expect(result.ownerUid).toBe(validOwnerUid);
    expect(result.tenantId).toBeTruthy();
    expect(result.createdAt).toBeTruthy();
  });

  it('2. Correctly creates the private operational tenant document (/tenants/{tenantId})', async () => {
    const result = await repo.createTenant(validPayload);
    const tenantPath = firestorePaths.tenant(result.tenantId);

    expect(mockDb.hasDocument(tenantPath)).toBe(true);
    const tenantDoc = mockDb.getDocumentDirect(tenantPath)!;

    expect(tenantDoc.id).toBe(result.tenantId);
    expect(tenantDoc.slug).toBe('riyadh-salon');
    expect(tenantDoc.name).toBe('Riyadh Luxury Salon');
    expect(tenantDoc.commercialName).toBe('Riyadh Beauty Trading Est.');
    expect(tenantDoc.crNumber).toBe('1010123456');
    expect(tenantDoc.vatNumber).toBe('310123456789012');
    expect(tenantDoc.status).toBe('ACTIVE');
    expect(tenantDoc.isPublished).toBe(false);
    expect(tenantDoc.primaryOwnerUid).toBe(validOwnerUid);
    expect(tenantDoc.subscriptionTier).toBe('GROWTH');
    expect(tenantDoc.billingEmail).toBe('billing@riyadhsalon.sa');
    expect(tenantDoc.timezone).toBe('Asia/Riyadh');
    expect(tenantDoc.currency).toBe('SAR');
  });

  it('3. Correctly creates the slug reservation document (/tenant_slugs/{slug})', async () => {
    const result = await repo.createTenant(validPayload);
    const slugPath = firestorePaths.tenantSlug('riyadh-salon');

    expect(mockDb.hasDocument(slugPath)).toBe(true);
    const slugDoc = mockDb.getDocumentDirect(slugPath)!;

    expect(slugDoc.slug).toBe('riyadh-salon');
    expect(slugDoc.tenantId).toBe(result.tenantId);
    expect(slugDoc.status).toBe('ACTIVE');
    expect(slugDoc.allocatedAt).toBeTruthy();
  });

  it('4. Correctly creates the owner membership document (/tenants/{tenantId}/memberships/{ownerUid})', async () => {
    const result = await repo.createTenant(validPayload);
    const membershipPath = firestorePaths.membership(result.tenantId, validOwnerUid);

    expect(mockDb.hasDocument(membershipPath)).toBe(true);
    const membershipDoc = mockDb.getDocumentDirect(membershipPath)!;

    expect(membershipDoc.id).toBe(validOwnerUid);
    expect(membershipDoc.tenantId).toBe(result.tenantId);
    expect(membershipDoc.role).toBe('OWNER');
    expect(membershipDoc.status).toBe('ACTIVE');
    expect(membershipDoc.title).toBe('Primary Owner');
  });

  it('5. Correctly initializes the membership mutex summary (/tenants/{tenantId}/membership_summary/counts)', async () => {
    const result = await repo.createTenant(validPayload);
    const summaryPath = firestorePaths.membershipSummary(result.tenantId);

    expect(mockDb.hasDocument(summaryPath)).toBe(true);
    const summaryDoc = mockDb.getDocumentDirect(summaryPath)!;

    expect(summaryDoc.tenantId).toBe(result.tenantId);
    expect(summaryDoc.activeOwnerCount).toBe(1);
    expect(summaryDoc.activeManagerCount).toBe(0);
    expect(summaryDoc.activeStaffCount).toBe(0);
    expect(summaryDoc.totalActiveMembers).toBe(1);
    expect(summaryDoc.version).toBe(0);
  });

  // -------------------------------------------------------------
  // Scenario 6-9: Validation & Rejection Guards
  // -------------------------------------------------------------
  it('6. Strictly rejects duplicate slug reservation', async () => {
    // First provisioning succeeds
    await repo.createTenant(validPayload);

    // Second provisioning with identical slug must fail
    await expect(
      repo.createTenant({
        ...validPayload,
        name: 'Another Salon with Same Slug',
      })
    ).rejects.toThrow(TenantProvisioningError);

    try {
      await repo.createTenant(validPayload);
    } catch (err: any) {
      expect(err).toBeInstanceOf(TenantProvisioningError);
      expect(err.code).toBe(TenantProvisioningErrorCode.SLUG_ALREADY_EXISTS);
      expect(err.message).toContain("already reserved");
    }
  });

  it('7. Strictly rejects tenant creation when owner user does not exist in /users', async () => {
    const nonExistentOwnerPayload = {
      ...validPayload,
      slug: 'fresh-slug',
      primaryOwnerUid: 'non_existent_uid_999',
    };

    try {
      await repo.createTenant(nonExistentOwnerPayload);
      expect.fail('Should have thrown OWNER_NOT_FOUND error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(TenantProvisioningError);
      expect(err.code).toBe(TenantProvisioningErrorCode.OWNER_NOT_FOUND);
      expect(err.message).toContain("does not exist");
    }
  });

  it('8. Strictly rejects tenant creation when owner user is disabled', async () => {
    const disabledOwnerUid = 'disabled_owner_uid';
    mockDb.setDocumentDirect(firestorePaths.user(disabledOwnerUid), {
      uid: disabledOwnerUid,
      email: 'disabled@riyadhsalon.sa',
      disabled: true,
    });

    const disabledOwnerPayload = {
      ...validPayload,
      slug: 'disabled-slug',
      primaryOwnerUid: disabledOwnerUid,
    };

    try {
      await repo.createTenant(disabledOwnerPayload);
      expect.fail('Should have thrown OWNER_DISABLED error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(TenantProvisioningError);
      expect(err.code).toBe(TenantProvisioningErrorCode.OWNER_DISABLED);
      expect(err.message).toContain("is disabled");
    }
  });

  it('9. Strictly rejects invalid tenant payload (malformed CR, VAT, slug, or email)', async () => {
    // Malformed CR (not 10 digits)
    await expect(
      repo.createTenant({ ...validPayload, crNumber: '123' })
    ).rejects.toThrow(TenantProvisioningError);

    // Malformed VAT (not starting with 3 or not 15 digits)
    await expect(
      repo.createTenant({ ...validPayload, vatNumber: '123456789012345' })
    ).rejects.toThrow(TenantProvisioningError);

    // Reserved slug
    await expect(
      repo.createTenant({ ...validPayload, slug: 'admin' })
    ).rejects.toThrow(TenantProvisioningError);

    // Invalid email
    await expect(
      repo.createTenant({ ...validPayload, billingEmail: 'not-an-email' })
    ).rejects.toThrow(TenantProvisioningError);
  });

  // -------------------------------------------------------------
  // Scenario 10: Atomic Rollback (Zero Partial Writes)
  // -------------------------------------------------------------
  it('10. Guarantees transaction atomicity: failure leaves zero partial documents', async () => {
    // Attempt provisioning with a missing owner to trigger an in-transaction rollback
    const invalidOwnerPayload = {
      ...validPayload,
      slug: 'atomic-test-slug',
      primaryOwnerUid: 'non_existent_owner_for_rollback',
    };

    await expect(repo.createTenant(invalidOwnerPayload)).rejects.toThrow();

    // Verify ZERO documents were created for this attempt
    expect(mockDb.hasDocument(firestorePaths.tenantSlug('atomic-test-slug'))).toBe(false);

    // Check store keys: only the initial seeded owner exists
    const allKeys = mockDb.getStoreKeys();
    expect(allKeys).toEqual([firestorePaths.user(validOwnerUid)]);
  });

  // -------------------------------------------------------------
  // Scenario 11: Concurrency Conflict Protection
  // -------------------------------------------------------------
  it('11. Guarantees that concurrent attempts to reserve the same slug cannot both succeed', async () => {
    // Run two provisioning attempts concurrently targeting the exact same slug
    const p1 = repo.createTenant(validPayload);
    const p2 = repo.createTenant({
      ...validPayload,
      name: 'Concurrent Competitor Salon',
    });

    const results = await Promise.allSettled([p1, p2]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly one must succeed, and exactly one must fail
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const rejectionReason = (rejected[0] as PromiseRejectedResult).reason;
    expect(rejectionReason).toBeInstanceOf(TenantProvisioningError);
    expect(rejectionReason.code).toBe(TenantProvisioningErrorCode.SLUG_ALREADY_EXISTS);
  });

  // -------------------------------------------------------------
  // Scenario 12: Existing Tenant Data Cannot Be Overwritten
  // -------------------------------------------------------------
  it('12. Prevents accidental overwrite of existing tenant records', async () => {
    const firstResult = await repo.createTenant(validPayload);
    const tenantPath = firestorePaths.tenant(firstResult.tenantId);
    const originalDoc = mockDb.getDocumentDirect(tenantPath);

    // Attempting to re-reserve the same slug must fail before touching the tenant doc
    await expect(repo.createTenant(validPayload)).rejects.toThrow();

    // Original tenant data is identical and unharmed
    expect(mockDb.getDocumentDirect(tenantPath)).toEqual(originalDoc);
  });

  // -------------------------------------------------------------
  // Scenario 13: Transaction Callback Retries Do Not Duplicate Side Effects
  // -------------------------------------------------------------
  it('13. Handles transaction retry safely without duplicating external side effects', async () => {
    mockDb.simulateConflictOnNextRun = true;

    const result = await repo.createTenant(validPayload);

    // Verifies the transaction ran twice due to retry
    expect(mockDb.transactionExecutionCount).toBe(2);
    expect(result.status).toBe('PROVISIONED');

    // Persisted documents exist exactly once
    const tenantPath = firestorePaths.tenant(result.tenantId);
    expect(mockDb.hasDocument(tenantPath)).toBe(true);
    expect(mockDb.hasDocument(firestorePaths.tenantSlug('riyadh-salon'))).toBe(true);
  });

  // -------------------------------------------------------------
  // Security & Authorization Boundaries
  // -------------------------------------------------------------
  describe('Authorization Context Boundary', () => {
    it('allows caller provisioning when caller is the owner (self)', async () => {
      const result = await repo.createTenant(validPayload, {
        callerUid: validOwnerUid,
      });
      expect(result.status).toBe('PROVISIONED');
    });

    it('allows caller provisioning when caller is a platform administrator', async () => {
      // Seed authoritative platform admin record in /platform_admins/{uid}
      mockDb.setDocumentDirect(firestorePaths.platformAdmin('platform_admin_super'), {
        uid: 'platform_admin_super',
        role: 'SUPER_ADMIN',
      });

      const result = await repo.createTenant(validPayload, {
        callerUid: 'platform_admin_super',
        isPlatformAdmin: true,
      });
      expect(result.status).toBe('PROVISIONED');
    });

    it('strictly rejects when caller spoofs isPlatformAdmin without authoritative record in /platform_admins', async () => {
      // Caller asserts isPlatformAdmin: true, but no document exists at /platform_admins/spoof_admin
      try {
        await repo.createTenant(validPayload, {
          callerUid: 'spoof_admin',
          isPlatformAdmin: true,
        });
        expect.fail('Should have failed authoritative platform admin check');
      } catch (err: any) {
        expect(err).toBeInstanceOf(TenantProvisioningError);
        expect(err.code).toBe(TenantProvisioningErrorCode.UNAUTHORIZED);
        expect(err.message).toContain('Authoritative platform administrator verification failed');
      }
    });

    it('allows provisioning in unforgeable system context via internal orchestration', async () => {
      const trustedSystem = createTrustedSystemContext('Initial system tenant provisioning');
      const result = await repo.createTenant(validPayload, trustedSystem);
      expect(result.status).toBe('PROVISIONED');
    });

    it('strictly rejects when untrusted caller attempts to spoof system: true via plain object', async () => {
      // Attacker attempts to pass plain object with system: true
      await expect(
        repo.createTenant(validPayload, {
          callerUid: 'attacker_uid',
          system: true,
        } as any)
      ).rejects.toThrow(TenantProvisioningError);

      try {
        await repo.createTenant(validPayload, { system: true } as any);
        expect.fail('Should have rejected plain system boolean');
      } catch (err: any) {
        expect(err).toBeInstanceOf(TenantProvisioningError);
        expect(err.code).toBe(TenantProvisioningErrorCode.UNAUTHORIZED);
        expect(err.message).toContain('System privilege cannot be granted via untrusted context');
      }
    });

    it('strictly rejects when caller tries to provision for another user without admin rights', async () => {
      await expect(
        repo.createTenant(validPayload, {
          callerUid: 'unauthorized_stranger_uid',
          isPlatformAdmin: false,
        })
      ).rejects.toThrow(TenantProvisioningError);

      try {
        await repo.createTenant(validPayload, {
          callerUid: 'unauthorized_stranger_uid',
        });
      } catch (err: any) {
        expect(err.code).toBe(TenantProvisioningErrorCode.UNAUTHORIZED);
        expect(err.message).toContain("not authorized");
      }
    });
  });

  // -------------------------------------------------------------
  // Helper Query Methods
  // -------------------------------------------------------------
  describe('Tenant Query Methods', () => {
    it('getTenantById returns tenant when existing, null when missing', async () => {
      const result = await repo.createTenant(validPayload);
      const found = await repo.getTenantById(result.tenantId);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Riyadh Luxury Salon');

      const missing = await repo.getTenantById('non_existent_id');
      expect(missing).toBeNull();
    });

    it('getTenantBySlug resolves slug to full tenant record', async () => {
      const result = await repo.createTenant(validPayload);
      const found = await repo.getTenantBySlug('riyadh-salon');
      expect(found).not.toBeNull();
      expect(found?.id).toBe(result.tenantId);

      const missing = await repo.getTenantBySlug('missing-slug');
      expect(missing).toBeNull();
    });

    it('isSlugAvailable correctly reports availability', async () => {
      expect(await repo.isSlugAvailable('available-slug')).toBe(true);
      await repo.createTenant(validPayload);
      expect(await repo.isSlugAvailable('riyadh-salon')).toBe(false);
    });
  });
});
