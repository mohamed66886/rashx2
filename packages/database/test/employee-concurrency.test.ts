import { describe, it, expect, beforeEach } from 'vitest';
import type { DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { EmployeeRepository } from '../src/server/repositories/employee.repository';
import { firestorePaths } from '../src/paths';
import { BranchDocSchema } from '../src/branch.schema';
import { DEFAULT_OPERATING_HOURS } from '../src/server/repositories/branch.repository';

class MockConcurrencyEmployeeFirestore {
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

  private txQueue: Promise<void> = Promise.resolve();

  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.txQueue = this.txQueue.then(async () => {
        try {
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
          const res = await updateFunction(tx);
          resolve(res);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}

describe('Phase 2.1: Employee Concurrency & Confidentiality Hardening', () => {
  const tenantId = 'salon_concurrency_tenant';
  const branchId = 'branch_main';
  const ownerUid = 'owner_user_1';
  let mockDb: MockConcurrencyEmployeeFirestore;
  let repo: EmployeeRepository;

  beforeEach(async () => {
    mockDb = new MockConcurrencyEmployeeFirestore();
    repo = new EmployeeRepository(mockDb as any);

    // Seed branch
    const branchDoc = BranchDocSchema.parse({
      id: branchId,
      tenantId,
      code: 'MAIN',
      name: 'الفرع الرئيسي بالرياض',
      city: 'الرياض',
      district: 'العليا',
      address: 'شارع التحلية',
      phone: '+966501234567',
      coordinates: { latitude: 24.7136, longitude: 46.6753 },
      isMain: true,
      isActive: true,
      operatingHours: DEFAULT_OPERATING_HOURS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockDb.store.set(firestorePaths.branch(tenantId, branchId), branchDoc);
  });

  it('atomically generates sequential, collision-free employee numbers across multiple creations', async () => {
    const creationPromises = Array.from({ length: 5 }, (_, i) =>
      repo.createEmployee(
        tenantId,
        {
          fullNameAr: `موظف رقم ${i + 1}`,
          phone: `050123450${i}`,
          nationalId: `109876543${i}`,
          jobTitle: 'أخصائي تصفيف شعر',
          hireDate: '2026-03-01',
          primaryBranchId: branchId,
          assignedBranchIds: [branchId],
        },
        ownerUid
      )
    );

    const createdEmployees = await Promise.all(creationPromises);
    const employeeNumbers = createdEmployees.map((e) => e.employeeNumber);

    // Every employee number must be unique and properly formatted
    const uniqueNumbers = new Set(employeeNumbers);
    expect(uniqueNumbers.size).toBe(5);

    for (const num of employeeNumbers) {
      expect(num).toMatch(/^EMP-\d{3}$/);
    }

    expect(employeeNumbers).toContain('EMP-001');
    expect(employeeNumbers).toContain('EMP-005');
  });

  it('masks confidential nationalId for managers while owner receives complete unmasked data', async () => {
    const employee = await repo.createEmployee(
      tenantId,
      {
        fullNameAr: 'سارة عبد الله',
        phone: '0559988776',
        nationalId: '1098765432',
        internalNotes: 'ملاحظات سرية حول الراتب والتقييم',
        jobTitle: 'خبيرة بشرة',
        hireDate: '2026-02-15',
        primaryBranchId: branchId,
        assignedBranchIds: [branchId],
      },
      ownerUid
    );

    // 1. OWNER inspection (Full Unmasked Access)
    const ownerView = await repo.getEmployeeSafe(
      tenantId,
      employee.id,
      'OWNER',
      ownerUid
    );
    expect(ownerView?.nationalId).toBe('1098765432');
    expect(ownerView?.internalNotes).toBe('ملاحظات سرية حول الراتب والتقييم');

    // 2. MANAGER inspection (Masked National ID, notes visible)
    const managerUid = 'manager_user_99';
    const managerView = await repo.getEmployeeSafe(
      tenantId,
      employee.id,
      'MANAGER',
      managerUid
    );
    expect(managerView?.nationalId).toMatch(/^109\*{4,5}32$/);
    expect(managerView?.nationalId).not.toBe('1098765432');

    // 3. STAFF peer inspection (Forbidden)
    const peerStaffUid = 'staff_peer_123';
    await expect(
      repo.getEmployeeSafe(tenantId, employee.id, 'STAFF', peerStaffUid)
    ).rejects.toThrow('غير مصرح: لا تملك صلاحية الاطلاع على ملفات الموظفين الآخرين.');
  });

  it('allows staff member to view their own profile with contact details', async () => {
    const linkedUid = 'staff_self_uid';
    const employee = await repo.createEmployee(
      tenantId,
      {
        fullNameAr: 'أحمد التميمي',
        phone: '0509988112',
        nationalId: '1012345678',
        internalNotes: 'ملاحظات داخلية للإدارة فقط',
        jobTitle: 'مصفف شعر أول',
        hireDate: '2026-01-10',
        primaryBranchId: branchId,
        assignedBranchIds: [branchId],
        linkedUid,
      },
      ownerUid
    );

    const selfView = await repo.getEmployeeSafe(
      tenantId,
      employee.id,
      'STAFF',
      linkedUid
    );
    expect(selfView).not.toBeNull();
    expect(selfView?.fullNameAr).toBe('أحمد التميمي');
    expect(selfView?.phone).toBe('0509988112');
    // Staff viewing themselves sees their masked national ID (Phase 2.2 requirement), and management internalNotes are omitted
    expect(selfView?.nationalId).toBe('101*****78');
    expect(selfView?.internalNotes).toBeUndefined();

    // STAFF-peer access must be strictly rejected
    await expect(
      repo.getEmployeeSafe(tenantId, employee.id, 'STAFF', 'other_staff_uid')
    ).rejects.toThrow('غير مصرح: لا تملك صلاحية الاطلاع على ملفات الموظفين الآخرين.');
  });
});
