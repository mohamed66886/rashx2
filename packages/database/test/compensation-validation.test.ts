import { describe, it, expect, beforeEach } from 'vitest';
import type { DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { CompensationRepository } from '../src/server/repositories/compensation.repository';
import { firestorePaths } from '../src/paths';
import { EmployeeDocSchema } from '../src/employee.schema';

class MockCompensationValidationFirestore {
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

  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    const tx = {
      get: async (target: any) => {
        if (typeof target.get === 'function') {
          return target.get();
        }
        return this.doc(target.path).get();
      },
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

describe('Phase 2.2: Compensation Contract Interval Overlap Engine & Edge Cases', () => {
  const tenantId = 'salon_comp_val_tenant';
  const employeeId = 'emp_comp_1';
  const ownerUid = 'owner_user_1';
  let mockDb: MockCompensationValidationFirestore;
  let repo: CompensationRepository;

  beforeEach(() => {
    mockDb = new MockCompensationValidationFirestore();
    repo = new CompensationRepository(mockDb as any);

    // Seed employee
    const employeeDoc = EmployeeDocSchema.parse({
      id: employeeId,
      tenantId,
      employeeNumber: 'EMP-020',
      fullNameAr: 'هند السالم',
      phone: '0512345678',
      jobTitle: 'أخصائية عناية بالأظافر',
      employmentType: 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      hireDate: '2026-01-01',
      primaryBranchId: 'branch_1',
      assignedBranchIds: ['branch_1'],
      isProvider: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockDb.store.set(firestorePaths.employee(tenantId, employeeId), employeeDoc);
  });

  it('Case 1: Contract A: Jan 1–Jan 31; Contract B: Feb 1 onward (clean consecutive, valid)', async () => {
    const compA = await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 500000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-01-01',
        effectiveEndDate: '2026-01-31',
      },
      'OWNER',
      ownerUid
    );
    expect(compA.status).toBe('ACTIVE');

    const compB = await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 600000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-02-01',
      },
      'OWNER',
      ownerUid
    );
    expect(compB.status).toBe('ACTIVE');
  });

  it('Case 2: Contract A: Jan 1–Jan 31; Contract B: Jan 20 onward (conflict, overlap)', async () => {
    await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 500000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-01-01',
        effectiveEndDate: '2026-01-31',
      },
      'OWNER',
      ownerUid
    );

    await expect(
      repo.createCompensation(
        tenantId,
        employeeId,
        {
          modelType: 'FIXED_SALARY',
          fixed: { baseSalaryHalalas: 600000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
          effectiveStartDate: '2026-01-20',
        },
        'OWNER',
        ownerUid
      )
    ).rejects.toThrow('العقد الجديد يتعارض مع فترة العقد الساري القائم [2026-01-01 إلى 2026-01-31].');
  });

  it('Case 3: Existing future contract followed by earlier overlapping contract', async () => {
    await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 500000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-06-01',
        effectiveEndDate: '2026-06-30',
      },
      'OWNER',
      ownerUid
    );

    await expect(
      repo.createCompensation(
        tenantId,
        employeeId,
        {
          modelType: 'FIXED_SALARY',
          fixed: { baseSalaryHalalas: 550000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
          effectiveStartDate: '2026-05-01',
          effectiveEndDate: '2026-06-10', // Overlaps June 1 - June 10
        },
        'OWNER',
        ownerUid
      )
    ).rejects.toThrow('العقد الجديد يتعارض مع فترة العقد الساري القائم [2026-06-01 إلى 2026-06-30].');
  });

  it('Case 4: New contract completely inside an existing period', async () => {
    await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 500000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-01-01',
        effectiveEndDate: '2026-12-31',
      },
      'OWNER',
      ownerUid
    );

    await expect(
      repo.createCompensation(
        tenantId,
        employeeId,
        {
          modelType: 'FIXED_SALARY',
          fixed: { baseSalaryHalalas: 550000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
          effectiveStartDate: '2026-03-01',
          effectiveEndDate: '2026-03-31',
        },
        'OWNER',
        ownerUid
      )
    ).rejects.toThrow('العقد الجديد يتعارض مع فترة العقد الساري القائم [2026-01-01 إلى 2026-12-31].');
  });

  it('Case 5: New contract containing an existing period', async () => {
    await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 500000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-02-01',
        effectiveEndDate: '2026-02-28',
      },
      'OWNER',
      ownerUid
    );

    await expect(
      repo.createCompensation(
        tenantId,
        employeeId,
        {
          modelType: 'FIXED_SALARY',
          fixed: { baseSalaryHalalas: 550000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
          effectiveStartDate: '2026-01-01',
          effectiveEndDate: '2026-03-31',
        },
        'OWNER',
        ownerUid
      )
    ).rejects.toThrow('العقد الجديد يتعارض مع فترة العقد الساري القائم [2026-02-01 إلى 2026-02-28].');
  });

  it('Case 6: Same start date as existing contract', async () => {
    await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 500000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-01-01',
        effectiveEndDate: '2026-01-31',
      },
      'OWNER',
      ownerUid
    );

    await expect(
      repo.createCompensation(
        tenantId,
        employeeId,
        {
          modelType: 'FIXED_SALARY',
          fixed: { baseSalaryHalalas: 550000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
          effectiveStartDate: '2026-01-01',
          effectiveEndDate: '2026-02-15',
        },
        'OWNER',
        ownerUid
      )
    ).rejects.toThrow('العقد الجديد يتعارض مع فترة العقد الساري القائم [2026-01-01 إلى 2026-01-31].');
  });

  it('Case 7: Same end date as existing contract', async () => {
    await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 500000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-01-01',
        effectiveEndDate: '2026-01-31',
      },
      'OWNER',
      ownerUid
    );

    await expect(
      repo.createCompensation(
        tenantId,
        employeeId,
        {
          modelType: 'FIXED_SALARY',
          fixed: { baseSalaryHalalas: 550000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
          effectiveStartDate: '2026-01-15',
          effectiveEndDate: '2026-01-31',
        },
        'OWNER',
        ownerUid
      )
    ).rejects.toThrow('العقد الجديد يتعارض مع فترة العقد الساري القائم [2026-01-01 إلى 2026-01-31].');
  });

  it('Case 8: Open-ended active contract followed by future contract (clean transition, superseding previous contract)', async () => {
    const comp1 = await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 500000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-01-01',
      },
      'OWNER',
      ownerUid
    );

    const comp2 = await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 650000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-07-01',
      },
      'OWNER',
      ownerUid
    );

    const prevDoc = mockDb.store.get(
      firestorePaths.compensation(tenantId, employeeId, comp1.id)
    ) as any;
    expect(prevDoc.status).toBe('SUPERSEDED');
    expect(prevDoc.effectiveEndDate).toBe('2026-06-30');

    const newDoc = mockDb.store.get(
      firestorePaths.compensation(tenantId, employeeId, comp2.id)
    ) as any;
    expect(newDoc.status).toBe('ACTIVE');
    expect(newDoc.effectiveStartDate).toBe('2026-07-01');
  });

  it('Case 9: Cancelled contract followed by new contract (cancelled contracts ignored during conflict detection)', async () => {
    // Manually seed a CANCELLED contract covering Jan 1 to Jan 31
    mockDb.store.set(firestorePaths.compensation(tenantId, employeeId, 'comp_cancelled_1'), {
      id: 'comp_cancelled_1',
      tenantId,
      employeeId,
      modelType: 'FIXED_SALARY',
      fixed: { baseSalaryHalalas: 500000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
      effectiveStartDate: '2026-01-01',
      effectiveEndDate: '2026-01-31',
      status: 'CANCELLED',
      createdByUid: ownerUid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // New active contract covering the same period should succeed because cancelled contracts are not active
    const newComp = await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 550000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-01-01',
        effectiveEndDate: '2026-01-31',
      },
      'OWNER',
      ownerUid
    );
    expect(newComp.status).toBe('ACTIVE');
  });

  it('Case 10: Superseded contract followed by new contract (superseded contracts ignored during conflict detection)', async () => {
    // Manually seed a SUPERSEDED contract covering Jan 1 to Jan 31
    mockDb.store.set(firestorePaths.compensation(tenantId, employeeId, 'comp_superseded_1'), {
      id: 'comp_superseded_1',
      tenantId,
      employeeId,
      modelType: 'FIXED_SALARY',
      fixed: { baseSalaryHalalas: 500000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
      effectiveStartDate: '2026-01-01',
      effectiveEndDate: '2026-01-31',
      status: 'SUPERSEDED',
      createdByUid: ownerUid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // New active contract starting Feb 1 should succeed smoothly
    const newComp = await repo.createCompensation(
      tenantId,
      employeeId,
      {
        modelType: 'FIXED_SALARY',
        fixed: { baseSalaryHalalas: 550000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
        effectiveStartDate: '2026-02-01',
      },
      'OWNER',
      ownerUid
    );
    expect(newComp.status).toBe('ACTIVE');
  });

  it('rejects inverted date range where effectiveEndDate is before effectiveStartDate', async () => {
    await expect(
      repo.createCompensation(
        tenantId,
        employeeId,
        {
          modelType: 'FIXED_SALARY',
          fixed: { baseSalaryHalalas: 600000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
          effectiveStartDate: '2026-06-01',
          effectiveEndDate: '2026-05-15', // Inverted!
        },
        'OWNER',
        ownerUid
      )
    ).rejects.toThrow('تاريخ انتهاء السريان لا يمكن أن يكون قبل تاريخ بدء السريان.');
  });

  it('strictly forbids MANAGER without custom grant from creating compensation records', async () => {
    await expect(
      repo.createCompensation(
        tenantId,
        employeeId,
        {
          modelType: 'FIXED_SALARY',
          fixed: { baseSalaryHalalas: 500000, currency: 'SAR', paymentFrequency: 'MONTHLY' },
          effectiveStartDate: '2026-01-01',
        },
        'MANAGER',
        'manager_uid_1'
      )
    ).rejects.toThrow('غير مصرح: لا تملك الصلاحية لإدارة البيانات المالية وهياكل الأجور للموظفين.');
  });
});
