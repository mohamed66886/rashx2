import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { TenantBootstrapService } from '../src/server/tenant-bootstrap.service';
import { firestorePaths } from '../src/paths';

class MockFailingBootstrapFirestore {
  public store = new Map<string, Record<string, unknown>>();
  public failBatchNumber: number | null = null;
  private currentBatch = 0;

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
      set: async (data: Record<string, unknown>, options?: { merge?: boolean }) => {
        if (options?.merge && this.store.has(path)) {
          const existing = this.store.get(path) || {};
          this.store.set(path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        } else {
          this.store.set(path, JSON.parse(JSON.stringify(data)));
        }
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
        const docId = id || `doc_${Math.random().toString(36).substring(2, 9)}`;
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
      }),
      get: async () => {
        const docs: DocumentSnapshot[] = [];
        for (const [key, value] of this.store.entries()) {
          const segs = key.slice(path.length + 1).split('/');
          if (key.startsWith(path + '/') && segs.length === 1) {
            docs.push(this.createSnapshot(key));
          }
        }
        return { docs, empty: docs.length === 0 };
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
    this.currentBatch++;
    const batchId = this.currentBatch;
    const staged = new Map<string, Record<string, unknown>>();

    return {
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        staged.set(ref.path, JSON.parse(JSON.stringify(data)));
        return this;
      },
      commit: async () => {
        if (this.failBatchNumber === batchId) {
          throw new Error(`Simulated catastrophic failure in Batch ${batchId}`);
        }
        for (const [p, d] of staged.entries()) {
          this.store.set(p, d);
        }
      },
    };
  }

  resetBatchCounter() {
    this.currentBatch = 0;
  }
}

describe('Tenant Bootstrap Lifecycle & Fault Tolerance Suite', () => {
  let mockDb: MockFailingBootstrapFirestore;
  let service: TenantBootstrapService;
  const tenantId = 'tenant_lifecycle_test';
  const ownerUid = 'user_owner_lifecycle';

  beforeEach(() => {
    mockDb = new MockFailingBootstrapFirestore();
    service = new TenantBootstrapService(mockDb as unknown as Firestore);
    // Seed tenant record for reconciliation
    mockDb.store.set(firestorePaths.tenant(tenantId), {
      id: tenantId,
      name: 'صالون التألق الحديث',
      slug: 'taalloq-salon',
      status: 'ACTIVE',
      crNumber: '1010887766',
      billingEmail: 'billing@taalloq.sa',
    });
  });

  it('handles catastrophic failure in Batch 1 and records FAILED status', async () => {
    mockDb.failBatchNumber = 1;

    await expect(
      service.bootstrapTenant(tenantId, {
        name: 'صالون التألق الحديث',
        ownerUid,
      })
    ).rejects.toThrow('Simulated catastrophic failure in Batch 1');

    const statusSnap = await mockDb.doc(firestorePaths.bootstrapStatus(tenantId)).get();
    expect(statusSnap.exists).toBe(true);
    const statusData = statusSnap.data() as any;
    expect(statusData.status).toBe('FAILED');
    expect(statusData.stage).toBe('FAILED');
    expect(statusData.lastError).toContain('Batch 1');
  });

  it('handles failure in Batch 2 (periods) and records correct stage and error', async () => {
    mockDb.failBatchNumber = 2;

    await expect(
      service.bootstrapTenant(tenantId, {
        name: 'صالون التألق الحديث',
        ownerUid,
      })
    ).rejects.toThrow('Simulated catastrophic failure in Batch 2');

    const statusSnap = await mockDb.doc(firestorePaths.bootstrapStatus(tenantId)).get();
    const statusData = statusSnap.data() as any;
    expect(statusData.status).toBe('FAILED');
    expect(statusData.lastError).toContain('Batch 2');

    // Batch 1 succeeded: Main branch and company settings exist
    const branchSnap = await mockDb.doc(firestorePaths.branch(tenantId, 'main-branch')).get();
    expect(branchSnap.exists).toBe(true);

    // Batch 2 failed: Accounting periods were not committed
    const periodsSnap = await mockDb.collection(firestorePaths.accountingPeriods(tenantId)).get();
    expect(periodsSnap.empty).toBe(true);
  });

  it('handles failure in Batch 3 (accounts) and records correct failure stage', async () => {
    mockDb.failBatchNumber = 3;

    await expect(
      service.bootstrapTenant(tenantId, {
        name: 'صالون التألق الحديث',
        ownerUid,
      })
    ).rejects.toThrow('Simulated catastrophic failure in Batch 3');

    const statusSnap = await mockDb.doc(firestorePaths.bootstrapStatus(tenantId)).get();
    const statusData = statusSnap.data() as any;
    expect(statusData.status).toBe('FAILED');
    expect(statusData.lastError).toContain('Batch 3');

    // Batch 1 & 2 succeeded
    const periodsSnap = await mockDb.collection(firestorePaths.accountingPeriods(tenantId)).get();
    expect(periodsSnap.docs.length).toBe(12);

    // Batch 3 failed: Accounts were not committed
    const accountsSnap = await mockDb.collection(firestorePaths.accounts(tenantId)).get();
    expect(accountsSnap.empty).toBe(true);
  });

  it('recovers cleanly via reconcileTenant after partial failure and transitions to READY', async () => {
    // Stage partial bootstrap (failure in batch 3)
    mockDb.failBatchNumber = 3;
    await expect(
      service.bootstrapTenant(tenantId, {
        name: 'صالون التألق الحديث',
        ownerUid,
      })
    ).rejects.toThrow();

    // Reset failure and run reconciliation
    mockDb.failBatchNumber = null;
    mockDb.resetBatchCounter();

    const reconResult = await service.reconcileTenant(tenantId);
    expect(reconResult.bootstrapStatus.status).toBe('READY');
    expect(reconResult.accountsCreatedCount).toBeGreaterThan(0);

    // Verify all accounts now exist
    const accountsSnap = await mockDb.collection(firestorePaths.accounts(tenantId)).get();
    expect(accountsSnap.empty).toBe(false);

    // Final status is READY
    const finalStatusSnap = await mockDb.doc(firestorePaths.bootstrapStatus(tenantId)).get();
    expect((finalStatusSnap.data() as any).status).toBe('READY');
  });

  it('preserves customized settings and never overwrites them during reconciliation', async () => {
    // 1. Initial bootstrap
    await service.bootstrapTenant(tenantId, {
      name: 'صالون التألق الحديث',
      ownerUid,
    });

    // 2. User customizes their company profile & tax settings
    const compRef = mockDb.doc(firestorePaths.companyProfile(tenantId));
    await compRef.set({
      tenantId,
      legalNameAr: 'شركة التألق للتجميل ذات المسؤولية المحدودة',
      legalNameEn: 'Al-Taalloq Beauty LLC',
      legalForm: 'LLC',
      crNumber: '1010999999',
      phone: '+966555112233',
      email: 'custom@taalloq.sa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const taxRef = mockDb.doc(firestorePaths.taxSettings(tenantId));
    await taxRef.set({
      tenantId,
      vatStatus: 'REGISTERED',
      vatNumber: '310000000000003',
      standardVatRateBps: 1500,
      rates: [
        {
          rateBps: 1500,
          nameAr: 'ضريبة قياسية مخصصة',
          effectiveFrom: '2020-07-01',
          effectiveUntil: null,
        },
      ],
      isTaxInclusivePricing: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 3. Reconcile tenant
    await service.reconcileTenant(tenantId);

    // 4. Verify custom values remain intact
    const compAfter = (await compRef.get()).data() as any;
    expect(compAfter.legalNameAr).toBe('شركة التألق للتجميل ذات المسؤولية المحدودة');
    expect(compAfter.legalForm).toBe('LLC');
    expect(compAfter.email).toBe('custom@taalloq.sa');

    const taxAfter = (await taxRef.get()).data() as any;
    expect(taxAfter.vatNumber).toBe('310000000000003');
    expect(taxAfter.isTaxInclusivePricing).toBe(false);
  });

  it('is completely idempotent when reconciliation is called concurrently or repeatedly', async () => {
    // 1. First complete bootstrap
    await service.bootstrapTenant(tenantId, {
      name: 'صالون التألق الحديث',
      ownerUid,
    });

    // 2. Call reconciliation twice concurrently
    const [result1, result2] = await Promise.all([
      service.reconcileTenant(tenantId),
      service.reconcileTenant(tenantId),
    ]);

    expect(result1.bootstrapStatus.status).toBe('READY');
    expect(result2.bootstrapStatus.status).toBe('READY');

    // No duplicate accounts or periods created
    expect(result1.accountsCreatedCount).toBe(0);
    expect(result2.accountsCreatedCount).toBe(0);

    const periodsSnap = await mockDb.collection(firestorePaths.accountingPeriods(tenantId)).get();
    expect(periodsSnap.docs.length).toBe(12);
  });
});

