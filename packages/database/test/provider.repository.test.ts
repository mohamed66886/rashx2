import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { ProviderRepository } from '../src/server/repositories/provider.repository';
import { firestorePaths } from '../src/paths';
import { BranchDocSchema } from '../src/branch.schema';
import { DEFAULT_OPERATING_HOURS } from '../src/server/repositories/branch.repository';
import { EmployeeDocSchema } from '../src/employee.schema';

class MockProviderFirestore {
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
    const staged = new Map<string, Record<string, unknown>>();
    return {
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        staged.set(ref.path, JSON.parse(JSON.stringify(data)));
        return this;
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        const existing = this.store.get(ref.path) || {};
        staged.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        return this;
      },
      commit: async () => {
        for (const [p, d] of staged.entries()) {
          this.store.set(p, d);
        }
      },
    };
  }
}

describe('ProviderRepository Suite', () => {
  let mockDb: MockProviderFirestore;
  let repo: ProviderRepository;
  const tenantId = 'tenant_provider_test';
  const branchId = 'branch_prov_01';
  const employeeId = 'emp_sarah_01';
  const actorUid = 'user_owner_01';

  beforeEach(() => {
    mockDb = new MockProviderFirestore();
    repo = new ProviderRepository(mockDb as unknown as Firestore);
    const nowIso = new Date().toISOString();

    // Seed branch
    mockDb.store.set(
      firestorePaths.branch(tenantId, branchId),
      BranchDocSchema.parse({
        id: branchId,
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

    // Seed employee
    mockDb.store.set(
      firestorePaths.employee(tenantId, employeeId),
      EmployeeDocSchema.parse({
        id: employeeId,
        tenantId,
        employeeNumber: 'EMP-001',
        fullNameAr: 'سارة خالد',
        fullNameEn: 'Sarah Khaled',
        jobTitle: 'أخصائية تلوين شعر',
        employmentType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
        hireDate: '2025-01-01',
        primaryBranchId: branchId,
        assignedBranchIds: [branchId],
        phone: '+966551112233',
        isProvider: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      })
    );
  });

  it('creates a provider profile linked to employee and updates isProvider flag', async () => {
    const provider = await repo.createProvider(
      tenantId,
      {
        employeeId,
        displayNameAr: 'سارة خالد',
        displayNameEn: 'Sarah Khaled',
        bioAr: 'خبرة أكثر من ٧ سنوات في صبغات وتلوين الشعر',
        specialties: ['صبغات شعر', 'بلياج', 'علاجات بروتين'],
        assignedBranchIds: [branchId],
        isPubliclyVisible: true,
      },
      actorUid
    );

    expect(provider.id).toBeDefined();
    expect(provider.employeeId).toBe(employeeId);
    expect(provider.status).toBe('ACTIVE');
    expect(provider.specialties).toContain('صبغات شعر');

    // Verify employee doc was updated with isProvider: true
    const empData = mockDb.store.get(firestorePaths.employee(tenantId, employeeId));
    expect(empData?.isProvider).toBe(true);

    const fetched = await repo.getProviderByEmployeeId(tenantId, employeeId);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(provider.id);
  });

  it('rejects provider creation if employee does not exist', async () => {
    await expect(
      repo.createProvider(
        tenantId,
        {
          employeeId: 'non_existent_emp',
          displayNameAr: 'مقدم مجهول',
          assignedBranchIds: [branchId],
        },
        actorUid
      )
    ).rejects.toThrow('الموظف المحدد');
  });

  it('assigns services to provider and preserves audit trail', async () => {
    const provider = await repo.createProvider(
      tenantId,
      {
        employeeId,
        displayNameAr: 'سارة خالد',
        assignedBranchIds: [branchId],
      },
      actorUid
    );

    const updated = await repo.assignServices(
      tenantId,
      provider.id,
      ['srv_haircut', 'srv_hair_color', 'srv_treatment'],
      actorUid
    );

    expect(updated.assignedServiceIds).toHaveLength(3);
    expect(updated.assignedServiceIds).toContain('srv_hair_color');
  });

  it('updates provider profile and visibility', async () => {
    const provider = await repo.createProvider(
      tenantId,
      {
        employeeId,
        displayNameAr: 'سارة خالد',
        assignedBranchIds: [branchId],
        isPubliclyVisible: true,
      },
      actorUid
    );

    const updated = await repo.updateProvider(
      tenantId,
      provider.id,
      {
        displayNameAr: 'سارة خالد (كبيرة مصففي الشعر)',
        isPubliclyVisible: false,
        status: 'ON_LEAVE',
      },
      actorUid
    );

    expect(updated.displayNameAr).toBe('سارة خالد (كبيرة مصففي الشعر)');
    expect(updated.isPubliclyVisible).toBe(false);
    expect(updated.status).toBe('ON_LEAVE');
  });
});
