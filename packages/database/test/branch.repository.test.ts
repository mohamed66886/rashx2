import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import { BranchRepository, DEFAULT_OPERATING_HOURS } from '../src/server/repositories/branch.repository';
import { firestorePaths } from '../src/paths';

class MockBranchFirestore {
  public store = new Map<string, Record<string, unknown>>();

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
    const mockTransaction: Transaction = {
      get: async (target: any) => {
        if (target.docs !== undefined || typeof target.get === 'function') {
          return target.get();
        }
        return this.createSnapshot(target.path);
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
      this.store.set(p, d);
    }
    return result;
  }
}

describe('BranchRepository Suite', () => {
  let mockDb: MockBranchFirestore;
  let repo: BranchRepository;
  const tenantId = 'tenant_salon_alpha';

  beforeEach(() => {
    mockDb = new MockBranchFirestore();
    repo = new BranchRepository(mockDb as unknown as Firestore);
  });

  it('creates a default main branch and synchronizes public branch projection', async () => {
    const branch = await repo.createDefaultMainBranch(tenantId, 'صالون النخبة');

    expect(branch.id).toBe('main-branch');
    expect(branch.isMain).toBe(true);
    expect(branch.code).toBe('MAIN');
    expect(branch.city).toBe('الرياض');
    expect(branch.isActive).toBe(true);

    // Verify private doc exists
    const privateSnap = await mockDb.doc(firestorePaths.branch(tenantId, 'main-branch')).get();
    expect(privateSnap.exists).toBe(true);
    expect(privateSnap.data()?.internalNotes).toBeDefined();

    // Verify public projection exists and excludes internalNotes
    const publicSnap = await mockDb.doc(firestorePaths.publicBranch(tenantId, 'main-branch')).get();
    expect(publicSnap.exists).toBe(true);
    expect(publicSnap.data()?.internalNotes).toBeUndefined();
    expect(publicSnap.data()?.isMain).toBe(true);
  });

  it('enforces single main branch when promoting another branch to main', async () => {
    // 1. Create main branch
    const b1 = await repo.createBranch(tenantId, {
      tenantId,
      name: 'فرع العليا',
      city: 'الرياض',
      district: 'العليا',
      address: 'شارع التحلية',
      coordinates: { latitude: 24.7, longitude: 46.6 },
      phone: '+966501111111',
      isMain: true,
      operatingHours: DEFAULT_OPERATING_HOURS,
    });

    expect(b1.isMain).toBe(true);

    // 2. Create second branch as non-main
    const b2 = await repo.createBranch(tenantId, {
      tenantId,
      name: 'فرع النخيل',
      city: 'الرياض',
      district: 'النخيل',
      address: 'طريق الملك عبدالله',
      coordinates: { latitude: 24.8, longitude: 46.7 },
      phone: '+966502222222',
      isMain: false,
      operatingHours: DEFAULT_OPERATING_HOURS,
    });

    expect(b2.isMain).toBe(false);

    // 3. Promote b2 to main
    await repo.updateBranch(tenantId, b2.id, { isMain: true });

    // 4. Verify b2 is now main, b1 is demoted
    const updatedB1 = await repo.getBranchById(tenantId, b1.id);
    const updatedB2 = await repo.getBranchById(tenantId, b2.id);

    expect(updatedB2?.isMain).toBe(true);
    expect(updatedB1?.isMain).toBe(false);
  });

  it('rejects unsetting main branch directly without promoting another branch', async () => {
    const mainBranch = await repo.createDefaultMainBranch(tenantId, 'صالون النخبة');

    await expect(
      repo.updateBranch(tenantId, mainBranch.id, { isMain: false })
    ).rejects.toThrow('لا يمكن إلغاء تعيين الفرع الرئيسي');
  });
});

