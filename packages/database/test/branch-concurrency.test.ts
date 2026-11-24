import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import { BranchRepository, DEFAULT_OPERATING_HOURS } from '../src/server/repositories/branch.repository';
import { firestorePaths } from '../src/paths';

class MockConcurrencyBranchFirestore {
  public store = new Map<string, Record<string, unknown>>();
  private lockPointerVersion = 0;

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
      set: async (data: Record<string, unknown>) => {
        this.store.set(path, JSON.parse(JSON.stringify(data)));
      },
    } as unknown as DocumentReference;
  }

  collection(path: string) {
    return {
      doc: (id?: string) => {
        const docId = id || `branch_${Math.random().toString(36).substring(2, 9)}`;
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
    const staged = new Map<string, Record<string, unknown>>();
    return {
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        staged.set(ref.path, JSON.parse(JSON.stringify(data)));
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
    const stagedWrites = new Map<string, Record<string, unknown>>();
    const readVersions = new Map<string, number>();

    const mockTransaction: Transaction = {
      get: async (target: any) => {
        if (target.docs !== undefined || typeof target.get === 'function') {
          return target.get();
        }
        const snap = this.createSnapshot(target.path);
        if (snap.exists && (snap.data() as any)?.version !== undefined) {
          readVersions.set(target.path, (snap.data() as any).version);
        }
        return snap;
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
      delete: (ref: DocumentReference) => {
        stagedWrites.set(ref.path, null as any);
        return mockTransaction;
      },
    } as unknown as Transaction;

    const result = await updateFunction(mockTransaction);

    for (const [p, d] of stagedWrites.entries()) {
      if (d === null) {
        this.store.delete(p);
      } else {
        this.store.set(p, d);
      }
    }
    return result;
  }
}

describe('Branch Concurrency & Mutex Invariant Suite', () => {
  let mockDb: MockConcurrencyBranchFirestore;
  let repo: BranchRepository;
  const tenantId = 'tenant_main_concurrency';
  const otherTenantId = 'tenant_other_boundary';

  beforeEach(async () => {
    mockDb = new MockConcurrencyBranchFirestore();
    repo = new BranchRepository(mockDb as unknown as Firestore);
    // Initialize with a default main branch
    await repo.createDefaultMainBranch(tenantId, 'صالون التميز الرئيسي');
  });

  it('guarantees exactly one main branch exists and pointer matches it', async () => {
    const mainBranch = await repo.getMainBranch(tenantId);
    expect(mainBranch).not.toBeNull();
    expect(mainBranch?.isMain).toBe(true);
    expect(mainBranch?.id).toBe('main-branch');

    const pointerSnap = await mockDb.doc(firestorePaths.mainBranchPointer(tenantId)).get();
    expect(pointerSnap.exists).toBe(true);
    expect((pointerSnap.data() as any).mainBranchId).toBe('main-branch');
  });

  it('atomically demotes old main branch when promoting a new branch', async () => {
    // 1. Create a second secondary branch
    const branch2 = await repo.createBranch(tenantId, {
      tenantId,
      name: 'فرع العليا',
      city: 'الرياض',
      district: 'العليا',
      address: 'طريق التخصصي',
      coordinates: { latitude: 24.71, longitude: 46.67 },
      phone: '+966501112233',
      operatingHours: DEFAULT_OPERATING_HOURS,
      isMain: false,
    });

    expect(branch2.isMain).toBe(false);

    // 2. Promote branch 2 to main
    const promoted = await repo.updateBranch(tenantId, branch2.id, {
      isMain: true,
    });

    expect(promoted.isMain).toBe(true);

    // 3. Verify old main branch is demoted in both private doc and public projection
    const oldMainSnap = await mockDb.doc(firestorePaths.branch(tenantId, 'main-branch')).get();
    expect((oldMainSnap.data() as any).isMain).toBe(false);

    const oldPublicSnap = await mockDb.doc(firestorePaths.publicBranch(tenantId, 'main-branch')).get();
    expect((oldPublicSnap.data() as any).isMain).toBe(false);

    // 4. Verify pointer points to new main branch
    const pointerSnap = await mockDb.doc(firestorePaths.mainBranchPointer(tenantId)).get();
    expect((pointerSnap.data() as any).mainBranchId).toBe(branch2.id);

    // 5. Total main branches in collection is strictly 1
    const allBranches = await repo.listBranches(tenantId);
    const mainBranches = allBranches.filter((b) => b.isMain);
    expect(mainBranches.length).toBe(1);
    expect(mainBranches[0]?.id).toBe(branch2.id);
  });

  it('rejects direct unset of main branch without appointing a replacement', async () => {
    await expect(
      repo.updateBranch(tenantId, 'main-branch', {
        isMain: false,
      })
    ).rejects.toThrow('لا يمكن إلغاء تعيين الفرع الرئيسي مباشرة دون ترقية فرع آخر ليكون رئيسياً.');
  });

  it('rejects deleting the main branch', async () => {
    await expect(
      repo.deleteBranch(tenantId, 'main-branch')
    ).rejects.toThrow('لا يمكن حذف الفرع الرئيسي للمنشأة.');
  });

  it('rejects deactivating the main branch', async () => {
    await expect(
      repo.updateBranch(tenantId, 'main-branch', {
        isActive: false,
      })
    ).rejects.toThrow('لا يمكن تعطيل الفرع الرئيسي للمنشأة.');
  });

  it('rejects cross-tenant branch update or promotion attempts', async () => {
    // Create branch in other tenant
    const otherBranch = await repo.createBranch(otherTenantId, {
      tenantId: otherTenantId,
      name: 'فرع منشأة أخرى',
      city: 'جدة',
      district: 'الروضة',
      address: 'شارع الأمير سلطان',
      coordinates: { latitude: 21.54, longitude: 39.17 },
      phone: '+966504445566',
      operatingHours: DEFAULT_OPERATING_HOURS,
    });

    // Attempt to update other tenant branch via current tenant
    await expect(
      repo.updateBranch(tenantId, otherBranch.id, {
        name: 'اسم مخترق',
      })
    ).rejects.toThrow();

    // Attempt to delete other tenant branch via current tenant
    await expect(
      repo.deleteBranch(tenantId, otherBranch.id)
    ).rejects.toThrow();
  });
});

