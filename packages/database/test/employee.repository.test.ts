import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { EmployeeRepository } from '../src/server/repositories/employee.repository';
import { firestorePaths } from '../src/paths';
import { BranchDocSchema } from '../src/branch.schema';
import { DEFAULT_OPERATING_HOURS } from '../src/server/repositories/branch.repository';

class MockEmployeeFirestore {
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

  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
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
    return updateFunction(tx);
  }
}

describe('EmployeeRepository Suite', () => {
  let mockDb: MockEmployeeFirestore;
  let repo: EmployeeRepository;
  const tenantId = 'tenant_emp_test';
  const branch1Id = 'branch_main_01';
  const branch2Id = 'branch_sub_02';
  const actorUid = 'user_owner_01';

  beforeEach(async () => {
    mockDb = new MockEmployeeFirestore();
    repo = new EmployeeRepository(mockDb as unknown as Firestore);

    // Seed test branches
    const nowIso = new Date().toISOString();
    mockDb.store.set(
      firestorePaths.branch(tenantId, branch1Id),
      BranchDocSchema.parse({
        id: branch1Id,
        tenantId,
        code: 'MAIN',
        name: 'الفرع الرئيسي',
        city: 'الرياض',
        district: 'العليا',
        address: 'شارع التحلية',
        phone: '+966501111111',
        coordinates: { latitude: 24.7136, longitude: 46.6753 },
        operatingHours: DEFAULT_OPERATING_HOURS,
        isMain: true,
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      })
    );

    mockDb.store.set(
      firestorePaths.branch(tenantId, branch2Id),
      BranchDocSchema.parse({
        id: branch2Id,
        tenantId,
        code: 'BRANCH-2',
        name: 'فرع النرجس',
        city: 'الرياض',
        district: 'النرجس',
        address: 'طريق عثمان بن عفان',
        phone: '+966502222222',
        coordinates: { latitude: 24.7136, longitude: 46.6753 },
        operatingHours: DEFAULT_OPERATING_HOURS,
        isMain: false,
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      })
    );
  });

  it('creates an employee with valid branches and generates unique employeeNumber', async () => {
    const emp = await repo.createEmployee(
      tenantId,
      {
        fullNameAr: 'سارة خالد المنصور',
        fullNameEn: 'Sarah Mansour',
        jobTitle: 'أخصائية عناية بالبشرة',
        department: 'العناية بالبشرة',
        employmentType: 'FULL_TIME',
        hireDate: '2025-01-15',
        primaryBranchId: branch1Id,
        assignedBranchIds: [branch1Id, branch2Id],
        phone: '+966551234567',
        email: 'sarah@example.com',
        isProvider: true,
      },
      actorUid
    );

    expect(emp.id).toBeDefined();
    expect(emp.employeeNumber).toBe('EMP-001');
    expect(emp.employmentStatus).toBe('ACTIVE');
    expect(emp.primaryBranchId).toBe(branch1Id);
    expect(emp.assignedBranchIds).toHaveLength(2);
    expect(emp.isProvider).toBe(true);

    const fetched = await repo.getEmployeeById(tenantId, emp.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.fullNameAr).toBe('سارة خالد المنصور');
  });

  it('rejects employee creation if primary branch is not in assigned branches', async () => {
    await expect(
      repo.createEmployee(
        tenantId,
        {
          fullNameAr: 'نورة السعيد',
          jobTitle: 'مصففة شعر',
          hireDate: '2025-02-01',
          primaryBranchId: branch1Id,
          assignedBranchIds: [branch2Id], // Primary branch missing!
          phone: '+966552223344',
        },
        actorUid
      )
    ).rejects.toThrow('الفرع الأساسي يجب أن يكون ضمن قائمة الفروع المعينة للموظف');
  });

  it('rejects employee creation if branch belongs to a different tenant', async () => {
    await expect(
      repo.createEmployee(
        tenantId,
        {
          fullNameAr: 'ريم العبدالله',
          jobTitle: 'خبيرة مكياج',
          hireDate: '2025-02-01',
          primaryBranchId: 'non_existent_branch',
          assignedBranchIds: ['non_existent_branch'],
          phone: '+966553334455',
        },
        actorUid
      )
    ).rejects.toThrow('غير موجود في هذه المنشأة');
  });

  it('updates employee details while preserving employeeNumber', async () => {
    const created = await repo.createEmployee(
      tenantId,
      {
        fullNameAr: 'منى الناصر',
        jobTitle: 'مصففة شعر أولى',
        hireDate: '2025-01-10',
        primaryBranchId: branch1Id,
        assignedBranchIds: [branch1Id],
        phone: '+966554445566',
      },
      actorUid
    );

    const updated = await repo.updateEmployee(
      tenantId,
      created.id,
      {
        fullNameAr: 'منى الناصر القحطاني',
        jobTitle: 'رئيسة فريق التصفيف',
      },
      actorUid
    );

    expect(updated.fullNameAr).toBe('منى الناصر القحطاني');
    expect(updated.jobTitle).toBe('رئيسة فريق التصفيف');
    expect(updated.employeeNumber).toBe(created.employeeNumber);
  });

  it('manages employee status transitions and terminates employee preserving details', async () => {
    const emp = await repo.createEmployee(
      tenantId,
      {
        fullNameAr: 'هند الراشد',
        jobTitle: 'خبيرة أظافر',
        hireDate: '2024-11-01',
        primaryBranchId: branch1Id,
        assignedBranchIds: [branch1Id],
        phone: '+966555556677',
      },
      actorUid
    );

    // Set ON_LEAVE
    const onLeave = await repo.setEmployeeStatus(tenantId, emp.id, 'ON_LEAVE', actorUid, 'إجازة سنوية');
    expect(onLeave.employmentStatus).toBe('ON_LEAVE');

    // Terminate
    const terminated = await repo.terminateEmployee(
      tenantId,
      emp.id,
      {
        effectiveDate: '2025-06-30',
        reason: 'استقالة الموظف لظروف عائلية',
        notes: 'تم تسليم كافة العهد وصرف المستحقات',
      },
      actorUid
    );

    expect(terminated.employmentStatus).toBe('TERMINATED');
    expect(terminated.terminationDetails?.effectiveDate).toBe('2025-06-30');
    expect(terminated.terminationDetails?.reason).toBe('استقالة الموظف لظروف عائلية');
    expect(terminated.terminationDetails?.terminatedByUid).toBe(actorUid);
  });

  it('links and unlinks user authentication UID to employee profile', async () => {
    const emp = await repo.createEmployee(
      tenantId,
      {
        fullNameAr: 'أمل المطيري',
        jobTitle: 'محاسبة الصالون',
        hireDate: '2025-01-01',
        primaryBranchId: branch1Id,
        assignedBranchIds: [branch1Id],
        phone: '+966556667788',
      },
      actorUid
    );

    expect(emp.linkedUid).toBeNull();

    const linked = await repo.linkUser(tenantId, emp.id, 'user_auth_123', actorUid);
    expect(linked.linkedUid).toBe('user_auth_123');

    const unlinked = await repo.unlinkUser(tenantId, emp.id, actorUid);
    expect(unlinked.linkedUid).toBeNull();
  });

  it('Phase 2.3: retrieves current employee profile and projects strictly safe DTO for STAFF self', async () => {
    const linkedUid = 'auth_staff_self_99';
    const emp = await repo.createEmployee(
      tenantId,
      {
        fullNameAr: 'ريم العتيبي',
        jobTitle: 'أخصائية مساج',
        hireDate: '2025-01-01',
        primaryBranchId: branch1Id,
        assignedBranchIds: [branch1Id],
        phone: '+966551122334',
        nationalId: '1098765432',
        internalNotes: 'ملاحظات سرية للإدارة',
        emergencyContact: {
          name: 'سالم العتيبي',
          relation: 'أخ',
          phone: '+966509988776',
        },
        linkedUid,
      },
      actorUid
    );

    // 1. Staff self profile retrieval via getCurrentEmployeeProfile
    const profile = await repo.getCurrentEmployeeProfile(tenantId, linkedUid, 'STAFF');
    expect(profile).not.toBeNull();
    expect(profile?.fullNameAr).toBe('ريم العتيبي');
    expect(profile?.phone).toBe('+966551122334');
    // National ID must be masked
    expect(profile?.nationalId).toBe('109*****32');
    // Internal notes must be stripped
    expect((profile as any)?.internalNotes).toBeUndefined();
    // Emergency contact must be present
    expect(profile?.emergencyContact?.name).toBe('سالم العتيبي');

    // 2. Peer STAFF access must be strictly rejected
    await expect(
      repo.getEmployeeByIdSafe(tenantId, emp.id, 'STAFF', 'other_staff_uid')
    ).rejects.toThrow('غير مصرح: لا تملك صلاحية الاطلاع على ملفات الموظفين الآخرين.');

    // 3. STAFF list attempt must be strictly rejected
    await expect(
      repo.listEmployeesSafe(tenantId, {}, 'STAFF', linkedUid)
    ).rejects.toThrow('غير مصرح: لا تملك صلاحية استعراض سجل الموظفين.');
  });

  it('Phase 2.3: enforces Manager and Owner access boundaries across DTO projections', async () => {
    const emp = await repo.createEmployee(
      tenantId,
      {
        fullNameAr: 'منى الشهري',
        jobTitle: 'خبير صبغات',
        hireDate: '2025-02-01',
        primaryBranchId: branch1Id,
        assignedBranchIds: [branch1Id],
        phone: '+966559988776',
        nationalId: '1076543210',
        internalNotes: 'تقييم تجريبي للأداء',
        emergencyContact: {
          name: 'محمد الشهري',
          relation: 'والد',
          phone: '+966501122334',
        },
      },
      actorUid
    );

    // 1. Manager view: masked national ID, emergency contact, notes stripped unless granted
    const managerView = await repo.getEmployeeByIdSafe(tenantId, emp.id, 'MANAGER', 'manager_uid');
    expect(managerView).not.toBeNull();
    expect(managerView?.nationalId).toBe('107*****10');
    expect((managerView as any)?.internalNotes).toBeUndefined();
    expect(managerView?.emergencyContact?.phone).toBe('+966501122334');

    // 2. Manager operational info helper
    const opInfo = await repo.getEmployeeOperationalInfo(tenantId, emp.id, 'MANAGER');
    expect(opInfo).not.toBeNull();
    expect(opInfo?.employeeNumber).toBe(emp.employeeNumber);

    // 3. Confidential HR access rejected for MANAGER without grant
    await expect(
      repo.getEmployeeConfidentialHr(tenantId, emp.id, 'MANAGER')
    ).rejects.toThrow('غير مصرح: هذه البيانات محصورة بمالك المنشأة ومسؤولي الموارد البشرية المصرح لهم.');

    // 4. Owner view: full unmasked national ID, emergency contact, internal notes
    const ownerView = await repo.getEmployeeConfidentialHr(tenantId, emp.id, 'OWNER');
    expect(ownerView).not.toBeNull();
    expect(ownerView?.nationalId).toBe('1076543210');
    expect(ownerView?.internalNotes).toBe('تقييم تجريبي للأداء');

    // 5. Manager listing employees receives masked DTOs
    const listRes = await repo.listEmployeesSafe(tenantId, {}, 'MANAGER', 'manager_uid');
    expect(listRes.employees.length).toBeGreaterThan(0);
    const listedEmp = listRes.employees.find((e) => e.id === emp.id);
    expect(listedEmp?.nationalId).toBe('107*****10');
    expect((listedEmp as any)?.internalNotes).toBeUndefined();
  });

  it('Phase 2.3: prevents overwriting nationalId with masked string during employee updates', async () => {
    const emp = await repo.createEmployee(
      tenantId,
      {
        fullNameAr: 'سارة الدوسري',
        jobTitle: 'أخصائية بديكير',
        hireDate: '2025-03-01',
        primaryBranchId: branch1Id,
        assignedBranchIds: [branch1Id],
        phone: '+966554433221',
        nationalId: '1055554444',
      },
      actorUid
    );

    // Update with masked nationalId containing asterisks
    await repo.updateEmployee(
      tenantId,
      emp.id,
      {
        fullNameAr: 'سارة الدوسري (تعديل)',
        nationalId: '105*****44', // Masked string from UI form
      },
      actorUid
    );

    // Stored national ID must remain original unmasked value
    const fresh = await repo.getEmployeeById(tenantId, emp.id);
    expect(fresh?.fullNameAr).toBe('سارة الدوسري (تعديل)');
    expect(fresh?.nationalId).toBe('1055554444');
  });
});
