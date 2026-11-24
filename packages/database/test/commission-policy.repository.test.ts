import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { CommissionPolicyRepository } from '../src/server/repositories/commission-policy.repository';

class MockPolicyFirestore {
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
        const docId = id || `pol_${Math.random().toString(36).substring(2, 9)}`;
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

  batch() {
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
}

describe('CommissionPolicyRepository Suite', () => {
  let mockDb: MockPolicyFirestore;
  let repo: CommissionPolicyRepository;
  const tenantId = 'tenant_policy_test';
  const actorUid = 'user_owner_01';

  beforeEach(() => {
    mockDb = new MockPolicyFirestore();
    repo = new CommissionPolicyRepository(mockDb as unknown as Firestore);
  });

  it('creates and retrieves a commission policy with rateBps and basis', async () => {
    const policy = await repo.createPolicy(
      tenantId,
      {
        nameAr: 'عمولة خدمات العناية بالشعر',
        nameEn: 'Hair Care Commission',
        type: 'SERVICE',
        basis: 'PERCENTAGE_OF_REVENUE',
        rateBps: 1200, // 12%
        effectiveFrom: '2025-01-01',
        description: 'سياسة عمولة موحدة لخدمات التصفيف والقص',
      },
      actorUid
    );

    expect(policy.id).toBeDefined();
    expect(policy.nameAr).toBe('عمولة خدمات العناية بالشعر');
    expect(policy.rateBps).toBe(1200);
    expect(policy.isActive).toBe(true);

    const fetched = await repo.getPolicyById(tenantId, policy.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.basis).toBe('PERCENTAGE_OF_REVENUE');
  });

  it('updates an existing commission policy', async () => {
    const policy = await repo.createPolicy(
      tenantId,
      {
        nameAr: 'عمولة المنتجات',
        type: 'PRODUCT',
        basis: 'PERCENTAGE_OF_REVENUE',
        rateBps: 500, // 5%
        effectiveFrom: '2025-01-01',
      },
      actorUid
    );

    const updated = await repo.updatePolicy(
      tenantId,
      policy.id,
      {
        rateBps: 750, // Updated to 7.5%
        nameAr: 'عمولة مبيعات منتجات العناية المنزلية',
      },
      actorUid
    );

    expect(updated.rateBps).toBe(750);
    expect(updated.nameAr).toBe('عمولة مبيعات منتجات العناية المنزلية');
  });

  it('lists active policies for tenant', async () => {
    await repo.createPolicy(
      tenantId,
      {
        nameAr: 'سياسة 1',
        type: 'SERVICE',
        effectiveFrom: '2025-01-01',
      },
      actorUid
    );

    await repo.createPolicy(
      tenantId,
      {
        nameAr: 'سياسة 2',
        type: 'PRODUCT',
        effectiveFrom: '2025-01-01',
      },
      actorUid
    );

    const list = await repo.listPolicies(tenantId);
    expect(list).toHaveLength(2);
  });
});

