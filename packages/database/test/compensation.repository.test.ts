import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import { CompensationRepository } from '../src/server/repositories/compensation.repository';
import { firestorePaths } from '../src/paths';
import { EmployeeDocSchema } from '../src/employee.schema';

class MockCompensationFirestore {
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
        const docId = id || `comp_${Math.random().toString(36).substring(2, 9)}`;
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

describe('CompensationRepository Suite', () => {
  let mockDb: MockCompensationFirestore;
  let repo: CompensationRepository;
  const tenantId = 'tenant_comp_test';
  const employeeId = 'emp_sal_01';
  const ownerUid = 'user_owner_01';
  const managerUid = 'user_manager_01';

  beforeEach(() => {
    mockDb = new MockCompensationFirestore();
    repo = new CompensationRepository(mockDb as unknown as Firestore);
    const nowIso = new Date().toISOString();

    // Seed employee
    mockDb.store.set(
      firestorePaths.employee(tenantId, employeeId),
      EmployeeDocSchema.parse({
        id: employeeId,
        tenantId,
        employeeNumber: 'EMP-001',
        fullNameAr: 'هند السالم',
        jobTitle: 'أخصائية تجميل',
        employmentType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
        hireDate: '2025-01-01',
        primaryBranchId: 'branch_01',
        assignedBranchIds: ['branch_01'],
        phone: '+966551234567',
        isProvider: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      })
    );
  });

  it('creates a FIXED_SALARY compensation record in integer Halalas by OWNER', async () => {
    const contract = await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        effectiveStartDate: '2025-01-01',
        fixed: {
          baseSalaryHalalas: 650000, // 6,500.00 SAR
          currency: 'SAR',
          paymentFrequency: 'MONTHLY',
        },
        notes: 'عقد توظيف أساسي بدوام كامل',
      },
      'OWNER',
      ownerUid
    );

    expect(contract.id).toBeDefined();
    expect(contract.status).toBe('ACTIVE');
    expect(contract.fixed?.baseSalaryHalalas).toBe(650000);
    expect(contract.fixed?.currency).toBe('SAR');
    expect(contract.createdByUid).toBe(ownerUid);

    const history = await repo.listCompensationHistory(tenantId, employeeId, 'OWNER');
    expect(history).toHaveLength(1);
    expect(history[0]?.id).toBe(contract.id);
  });

  it('denies compensation management to MANAGER by default (RBAC protection)', async () => {
    await expect(
      repo.createCompensation(
        tenantId,
        employeeId,
        {
          modelType: 'FIXED_SALARY',
          effectiveStartDate: '2025-01-01',
          fixed: {
            baseSalaryHalalas: 500000,
          },
        },
        'MANAGER',
        managerUid
      )
    ).rejects.toThrow('غير مصرح: لا تملك الصلاحية لإدارة البيانات المالية');
  });

  it('denies compensation reading to MANAGER by default', async () => {
    // Create contract by OWNER first
    await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        effectiveStartDate: '2025-01-01',
        fixed: {
          baseSalaryHalalas: 800000,
        },
      },
      'OWNER',
      ownerUid
    );

    // MANAGER attempts to read compensation history
    await expect(
      repo.listCompensationHistory(tenantId, employeeId, 'MANAGER')
    ).rejects.toThrow('غير مصرح: لا تملك الصلاحية للاطلاع على السجلات المالية والأجور');
  });

  it('atomically supersedes previous active contract when a new contract is created', async () => {
    // Contract 1: Starting Jan 1, 2025
    const contract1 = await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        effectiveStartDate: '2025-01-01',
        fixed: {
          baseSalaryHalalas: 500000, // 5,000 SAR
        },
      },
      'OWNER',
      ownerUid
    );

    expect(contract1.status).toBe('ACTIVE');

    // Contract 2: Promotion / Raise starting July 1, 2025
    const contract2 = await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'HYBRID',
        effectiveStartDate: '2025-07-01',
        hybrid: {
          baseSalaryHalalas: 700000, // 7,000 SAR
          serviceCommissionRateBps: 1500, // 15%
        },
        notes: 'ترقية إلى رئيسة قسم العناية',
      },
      'OWNER',
      ownerUid
    );

    expect(contract2.status).toBe('ACTIVE');
    expect(contract2.modelType).toBe('HYBRID');

    // Verify Contract 1 was superseded with effectiveEndDate set to 2025-06-30
    const contract1Updated = mockDb.store.get(
      firestorePaths.compensation(tenantId, employeeId, contract1.id)
    );
    expect(contract1Updated?.status).toBe('SUPERSEDED');
    expect(contract1Updated?.effectiveEndDate).toBe('2025-06-30');

    // Verify active contract retrieval
    const active = await repo.getActiveCompensation(tenantId, employeeId, 'OWNER');
    expect(active).not.toBeNull();
    expect(active?.id).toBe(contract2.id);
    expect(active?.hybrid?.baseSalaryHalalas).toBe(700000);
  });
});
