import { describe, it, expect, beforeEach } from 'vitest';
import type { DocumentReference, DocumentSnapshot, WriteBatch } from 'firebase-admin/firestore';
import { ProviderRepository } from '../src/server/repositories/provider.repository';
import { EmployeeRepository } from '../src/server/repositories/employee.repository';
import { firestorePaths } from '../src/paths';
import { BranchDocSchema } from '../src/branch.schema';
import { EmployeeDocSchema } from '../src/employee.schema';
import { DEFAULT_OPERATING_HOURS } from '../src/server/repositories/branch.repository';

class MockProviderProjectionFirestore {
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

  batch(): WriteBatch {
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
    } as unknown as WriteBatch;
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

describe('Phase 2.1: Public Provider Projection Hardening', () => {
  const tenantId = 'salon_proj_tenant';
  const branchId = 'branch_center';
  const employeeId = 'emp_provider_1';
  const actorUid = 'owner_uid';
  let mockDb: MockProviderProjectionFirestore;
  let repo: ProviderRepository;

  beforeEach(async () => {
    mockDb = new MockProviderProjectionFirestore();
    repo = new ProviderRepository(mockDb as any);

    // Seed branch
    const branchDoc = BranchDocSchema.parse({
      id: branchId,
      tenantId,
      code: 'CENTER',
      name: 'فرع الوسط التجاري',
      city: 'الرياض',
      district: 'الملز',
      address: 'شارع صلاح الدين',
      phone: '+966509876543',
      coordinates: { latitude: 24.6636, longitude: 46.7253 },
      isMain: true,
      isActive: true,
      operatingHours: DEFAULT_OPERATING_HOURS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockDb.store.set(firestorePaths.branch(tenantId, branchId), branchDoc);

    // Seed employee
    const employeeDoc = EmployeeDocSchema.parse({
      id: employeeId,
      tenantId,
      employeeNumber: 'EMP-010',
      fullNameAr: 'ليلى الأحمد',
      phone: '0567788990',
      nationalId: '1099887766',
      jobTitle: 'أخصائية تجميل',
      employmentType: 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      hireDate: '2026-01-01',
      primaryBranchId: branchId,
      assignedBranchIds: [branchId],
      isProvider: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockDb.store.set(firestorePaths.employee(tenantId, employeeId), employeeDoc);
  });

  it('atomically creates public projection and strips employeeId and sensitive internal configuration', async () => {
    const provider = await repo.createProvider(
      tenantId,
      {
        employeeId,
        displayNameAr: 'ليلى - خبيرة التجميل',
        bioAr: 'خبرة 7 سنوات في العناية بالبشرة',
        specialties: ['تنظيف بشرة', 'هيدرافاشيال'],
        assignedBranchIds: [branchId],
        assignedServiceIds: ['srv_1', 'srv_2'],
        commissionEligible: true,
        defaultCommissionPolicyId: 'policy_vip_comm',
        isPubliclyVisible: true,
        displayOrder: 1,
      },
      actorUid
    );

    // 1. Verify operational provider document contains internal fields
    const operationalDoc = mockDb.store.get(firestorePaths.provider(tenantId, provider.id)) as any;
    expect(operationalDoc).toBeDefined();
    expect(operationalDoc.employeeId).toBe(employeeId);
    expect(operationalDoc.defaultCommissionPolicyId).toBe('policy_vip_comm');
    expect(operationalDoc.commissionEligible).toBe(true);

    // 2. Verify sanitized public projection document strictly excludes employeeId and commission details
    const publicDoc = mockDb.store.get(firestorePaths.publicProvider(tenantId, provider.id)) as any;
    expect(publicDoc).toBeDefined();
    expect(publicDoc.displayNameAr).toBe('ليلى - خبيرة التجميل');
    expect(publicDoc.bioAr).toBe('خبرة 7 سنوات في العناية بالبشرة');
    expect(publicDoc.isPubliclyVisible).toBe(true);

    // Crucial security guarantees:
    expect(publicDoc.employeeId).toBeUndefined();
    expect(publicDoc.defaultCommissionPolicyId).toBeUndefined();
    expect(publicDoc.commissionEligible).toBeUndefined();
    expect(publicDoc.assignedServiceIds).toBeUndefined();
    expect(publicDoc.assignedBranchIds).toBeUndefined();
  });

  it('updates public projection in sync when operational provider profile changes', async () => {
    const provider = await repo.createProvider(
      tenantId,
      {
        employeeId,
        displayNameAr: 'ليلى - خبيرة التجميل',
        assignedBranchIds: [branchId],
        isPubliclyVisible: true,
      },
      actorUid
    );

    // Update display name and visibility
    await repo.updateProvider(
      tenantId,
      provider.id,
      {
        displayNameAr: 'ليلى الأحمد (VIP)',
        bioAr: 'تحديث النبذة التعريفية للعملاء',
      },
      actorUid
    );

    const publicDoc = await repo.getPublicProvider(tenantId, provider.id);
    expect(publicDoc).not.toBeNull();
    expect(publicDoc?.displayNameAr).toBe('ليلى الأحمد (VIP)');
    expect(publicDoc?.bioAr).toBe('تحديث النبذة التعريفية للعملاء');
  });

  it('hides provider from public discovery when isPubliclyVisible is false or deactivated', async () => {
    const provider = await repo.createProvider(
      tenantId,
      {
        employeeId,
        displayNameAr: 'ليلى مخفية',
        assignedBranchIds: [branchId],
        isPubliclyVisible: false,
      },
      actorUid
    );

    const publicView = await repo.getPublicProvider(tenantId, provider.id);
    expect(publicView).toBeNull();

    const publicList = await repo.listPublicProviders(tenantId);
    expect(publicList.find((p) => p.id === provider.id)).toBeUndefined();
  });

  it('automatically deactivates provider and hides public projection upon employee termination', async () => {
    const employeeRepo = new EmployeeRepository(mockDb as any);

    const provider = await repo.createProvider(
      tenantId,
      {
        employeeId,
        displayNameAr: 'ليلى خبيرة التجميل',
        assignedBranchIds: [branchId],
        isPubliclyVisible: true,
      },
      actorUid
    );

    // Initial check: public projection is visible
    const beforeTerm = await repo.getPublicProvider(tenantId, provider.id);
    expect(beforeTerm).not.toBeNull();
    expect(beforeTerm?.isPubliclyVisible).toBe(true);

    // Terminate employee
    await employeeRepo.terminateEmployee(
      tenantId,
      employeeId,
      {
        effectiveDate: '2026-11-23',
        reason: 'RESIGNATION',
        notes: 'استقالة بموجب إشعار مسبق',
      },
      actorUid
    );

    // After termination: provider status must be INACTIVE and public projection must be hidden
    const operationalDoc = mockDb.store.get(firestorePaths.provider(tenantId, provider.id)) as any;
    expect(operationalDoc.status).toBe('INACTIVE');

    const publicView = await repo.getPublicProvider(tenantId, provider.id);
    expect(publicView).toBeNull();

    const publicList = await repo.listPublicProviders(tenantId);
    expect(publicList.find((p) => p.id === provider.id)).toBeUndefined();
  });
});
