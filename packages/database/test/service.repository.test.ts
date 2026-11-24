import { describe, it, expect, beforeEach } from 'vitest';
import type {
  Firestore,
  DocumentReference,
  DocumentSnapshot,
  WriteBatch,
  Transaction,
} from 'firebase-admin/firestore';
import { ServiceRepository } from '../src/server/repositories/service.repository';
import { firestorePaths } from '../src/paths';
import type { TaxSettingsDoc } from '../src/company.schema';
import type { BranchDoc } from '../src/branch.schema';
import type { ProviderDoc } from '../src/provider.schema';
import type { CommissionPolicyDoc } from '../src/commission-policy.schema';
import type { ServiceCategoryDoc } from '../src/service-category.schema';

function applyMockUpdate(
  existing: Record<string, unknown>,
  data: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...existing };
  for (const [key, value] of Object.entries(data)) {
    if (
      value &&
      typeof value === 'object' &&
      ('elements' in value ||
        (value as any).constructor?.name === 'ArrayUnionTransform' ||
        (value as any).constructor?.name === 'ArrayRemoveTransform')
    ) {
      const isRemove = (value as any).constructor?.name === 'ArrayRemoveTransform';
      const elements: unknown[] = (value as any).elements || [];
      const currentArr: unknown[] = Array.isArray(result[key])
        ? [...(result[key] as unknown[])]
        : [];
      if (isRemove) {
        result[key] = currentArr.filter((item) => !elements.includes(item));
      } else {
        for (const el of elements) {
          if (!currentArr.includes(el)) {
            currentArr.push(el);
          }
        }
        result[key] = currentArr;
      }
    } else {
      result[key] = value !== undefined ? JSON.parse(JSON.stringify(value)) : undefined;
    }
  }
  return result;
}

class MockServiceFirestore {
  public store = new Map<string, Record<string, unknown>>();
  public docVersions = new Map<string, number>();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
      set: async (data: Record<string, unknown>) => {
        this.store.set(path, JSON.parse(JSON.stringify(data)));
        this.docVersions.set(path, (this.docVersions.get(path) || 0) + 1);
      },
      update: async (data: Record<string, unknown>) => {
        const existing = this.store.get(path) || {};
        this.store.set(path, applyMockUpdate(existing, data));
        this.docVersions.set(path, (this.docVersions.get(path) || 0) + 1);
      },
      delete: async () => {
        this.store.delete(path);
        this.docVersions.set(path, (this.docVersions.get(path) || 0) + 1);
      },
    } as unknown as DocumentReference;
  }

  collection(path: string) {
    const self = this;
    return {
      doc: (id?: string) => {
        const docId = id || `srv_${Math.random().toString(36).substring(2, 9)}`;
        return self.doc(`${path}/${docId}`);
      },
      where: (field: string, op: string, val: unknown) => {
        const filters: Array<{ field: string; op: string; val: unknown }> = [{ field, op, val }];

        const queryObj = {
          where: (f2: string, op2: string, v2: unknown) => {
            filters.push({ field: f2, op: op2, val: v2 });
            return queryObj;
          },
          orderBy: () => queryObj,
          limit: (n: number) => ({
            get: async () => {
              const res = await queryObj.get();
              return { docs: res.docs.slice(0, n), empty: res.docs.length === 0 };
            },
          }),
          get: async () => {
            const docs: DocumentSnapshot[] = [];
            for (const [key, value] of self.store.entries()) {
              if (!key.startsWith(path + '/')) continue;
              const matchesAll = filters.every((cond) => {
                if (cond.op === '==' || cond.op === '===') return value[cond.field] === cond.val;
                if (cond.op === 'array-contains') {
                  const arr = value[cond.field];
                  return Array.isArray(arr) && arr.includes(cond.val);
                }
                return false;
              });
              if (matchesAll) {
                docs.push(self.createSnapshot(key));
              }
            }
            return { docs, empty: docs.length === 0 };
          },
        };
        return queryObj;
      },
      orderBy: () => ({
        where: (f2: string, op2: string, v2: unknown) => ({
          get: async () => {
            const docs: DocumentSnapshot[] = [];
            for (const [key, value] of self.store.entries()) {
              if (key.startsWith(path + '/') && value[f2] === v2) {
                docs.push(self.createSnapshot(key));
              }
            }
            return { docs, empty: docs.length === 0 };
          },
        }),
        get: async () => {
          const docs: DocumentSnapshot[] = [];
          for (const [key] of self.store.entries()) {
            const segs = key.slice(path.length + 1).split('/');
            if (key.startsWith(path + '/') && segs.length === 1) {
              docs.push(self.createSnapshot(key));
            }
          }
          return { docs, empty: docs.length === 0 };
        },
      }),
      get: async () => {
        const docs: DocumentSnapshot[] = [];
        for (const [key] of self.store.entries()) {
          const segs = key.slice(path.length + 1).split('/');
          if (key.startsWith(path + '/') && segs.length === 1) {
            docs.push(self.createSnapshot(key));
          }
        }
        return { docs, empty: docs.length === 0 };
      },
    };
  }

  batch(): WriteBatch {
    const operations: Array<() => void> = [];
    return {
      set: (docRef: DocumentReference, data: Record<string, unknown>) => {
        operations.push(() => {
          this.store.set(docRef.path, JSON.parse(JSON.stringify(data)));
          this.docVersions.set(docRef.path, (this.docVersions.get(docRef.path) || 0) + 1);
        });
        return this as unknown as WriteBatch;
      },
      update: (docRef: DocumentReference, data: Record<string, unknown>) => {
        operations.push(() => {
          const existing = this.store.get(docRef.path) || {};
          this.store.set(docRef.path, applyMockUpdate(existing, data));
          this.docVersions.set(docRef.path, (this.docVersions.get(docRef.path) || 0) + 1);
        });
        return this as unknown as WriteBatch;
      },
      delete: (docRef: DocumentReference) => {
        operations.push(() => {
          this.store.delete(docRef.path);
          this.docVersions.set(docRef.path, (this.docVersions.get(docRef.path) || 0) + 1);
        });
        return this as unknown as WriteBatch;
      },
      commit: async () => {
        for (const op of operations) op();
      },
    } as unknown as WriteBatch;
  }

  async runTransaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>,
    attempt = 1
  ): Promise<T> {
    const stagedWrites = new Map<string, { type: 'set' | 'update' | 'delete'; data?: Record<string, unknown> }>();
    const readVersions = new Map<string, number>();
    let hasWritten = false;

    const mockTransaction: Transaction = {
      get: async (target: any) => {
        if (hasWritten) {
          throw new Error('Firestore transactions require all reads to be executed before all writes');
        }
        if (target.path) {
          readVersions.set(target.path, this.docVersions.get(target.path) || 0);
          return this.createSnapshot(target.path);
        }
        if (target.docs !== undefined || typeof target.get === 'function') {
          return target.get();
        }
        return this.createSnapshot(target.path);
      },
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        hasWritten = true;
        stagedWrites.set(ref.path, { type: 'set', data: JSON.parse(JSON.stringify(data)) });
        return mockTransaction;
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        hasWritten = true;
        stagedWrites.set(ref.path, { type: 'update', data });
        return mockTransaction;
      },
      delete: (ref: DocumentReference) => {
        hasWritten = true;
        stagedWrites.set(ref.path, { type: 'delete' });
        return mockTransaction;
      },
    } as unknown as Transaction;

    const result = await updateFunction(mockTransaction);

    // Optimistic Concurrency Conflict Detection:
    for (const [path, readVer] of readVersions.entries()) {
      const currentVer = this.docVersions.get(path) || 0;
      if (currentVer !== readVer) {
        if (attempt < 5) {
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 10 + 5));
          return this.runTransaction(updateFunction, attempt + 1);
        }
        throw new Error('Transaction failed due to concurrent modification conflict.');
      }
    }

    for (const [path, op] of stagedWrites.entries()) {
      if (op.type === 'delete') {
        this.store.delete(path);
      } else if (op.type === 'set') {
        this.store.set(path, op.data!);
      } else if (op.type === 'update') {
        const existing = this.store.get(path) || {};
        this.store.set(path, applyMockUpdate(existing, op.data!));
      }
      this.docVersions.set(path, (this.docVersions.get(path) || 0) + 1);
    }

    return result;
  }

  private createSnapshot(path: string): DocumentSnapshot {
    const data = this.store.get(path);
    return {
      exists: !!data,
      id: path.split('/').pop()!,
      ref: { path } as DocumentReference,
      data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined),
    } as unknown as DocumentSnapshot;
  }
}

describe('ServiceRepository', () => {
  let mockDb: MockServiceFirestore;
  let repo: ServiceRepository;
  const tenantA = 'tenant_riyadh_01';
  const tenantB = 'tenant_jeddah_02';
  const actorOwner = 'user_owner_01';
  const actorManager = 'user_manager_01';
  const actorStaff = 'user_staff_01';

  // Seed documents
  const branchMain: BranchDoc = {
    id: 'branch_olaya_main',
    tenantId: tenantA,
    name: 'فرع العليا الرئيسي',
    isMain: true,
    city: 'الرياض',
    district: 'العليا',
    address: 'طريق الملك فهد',
    coordinates: { latitude: 24.7136, longitude: 46.6753 },
    phone: '+966500000001',
    isActive: true,
    operatingHours: {
      sunday: { open: '09:00', close: '22:00', isClosed: false },
      monday: { open: '09:00', close: '22:00', isClosed: false },
      tuesday: { open: '09:00', close: '22:00', isClosed: false },
      wednesday: { open: '09:00', close: '22:00', isClosed: false },
      thursday: { open: '09:00', close: '22:00', isClosed: false },
      friday: { open: '13:00', close: '22:00', isClosed: false },
      saturday: { open: '09:00', close: '22:00', isClosed: false },
    },
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  };

  const branchSahafa: BranchDoc = {
    ...branchMain,
    id: 'branch_sahafa',
    name: 'فرع الصحافة',
    isMain: false,
    district: 'الصحافة',
  };

  const branchCrossTenant: BranchDoc = {
    ...branchMain,
    id: 'branch_other_tenant',
    tenantId: tenantB,
    name: 'فرع جدة',
  };

  const activeCategory: ServiceCategoryDoc = {
    id: 'cat_hair',
    tenantId: tenantA,
    nameAr: 'العناية بالشعر',
    nameEn: 'Hair Care',
    descriptionAr: '',
    descriptionEn: '',
    imageUrl: '',
    displayOrder: 1,
    isActive: true,
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
    createdBy: actorOwner,
    updatedBy: actorOwner,
  };

  const inactiveCategory: ServiceCategoryDoc = {
    ...activeCategory,
    id: 'cat_inactive',
    nameAr: 'تصنيف معطل',
    isActive: false,
  };

  const activeProvider: ProviderDoc = {
    id: 'prov_sara',
    tenantId: tenantA,
    employeeId: 'emp_sara',
    displayNameAr: 'سارة العتيبي',
    status: 'ACTIVE',
    assignedBranchIds: ['branch_olaya_main', 'branch_sahafa'],
    assignedServiceIds: [],
    specialties: ['قص وتصفيف', 'صبغات'],
    isPubliclyVisible: true,
    commissionEligible: true,
    defaultCommissionPolicyId: null,
    displayOrder: 1,
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  };

  const providerOlayaOnly: ProviderDoc = {
    ...activeProvider,
    id: 'prov_olaya_only',
    displayNameAr: 'ريم القحطاني',
    assignedBranchIds: ['branch_olaya_main'],
  };

  const inactiveProvider: ProviderDoc = {
    ...activeProvider,
    id: 'prov_inactive',
    displayNameAr: 'نورة الدوسري',
    status: 'INACTIVE',
  };

  const taxSettingsRegistered: TaxSettingsDoc = {
    tenantId: tenantA,
    vatStatus: 'REGISTERED',
    vatNumber: '300000000000003',
    standardVatRateBps: 1500,
    rates: [
      {
        rateBps: 1500,
        nameAr: 'النسبة الأساسية القياسية',
        effectiveFrom: '2020-07-01',
        effectiveUntil: null,
      },
    ],
    isTaxInclusivePricing: true,
    isVatExempt: false,
    verificationStatus: 'VERIFIED',
    updatedAt: '2026-11-20T10:00:00.000Z',
  };

  const activeCommissionPolicy: CommissionPolicyDoc = {
    id: 'pol_standard_service',
    tenantId: tenantA,
    nameAr: 'عمولة الخدمات الأساسية',
    type: 'SERVICE',
    basis: 'PERCENTAGE_OF_REVENUE',
    rateBps: 2000, // 20%
    applicableServiceIds: [],
    branchScope: [],
    effectiveFrom: '2026-01-01',
    effectiveUntil: '2028-12-31',
    isActive: true,
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  };

  beforeEach(() => {
    mockDb = new MockServiceFirestore();
    repo = new ServiceRepository(mockDb as unknown as Firestore);

    // Seed mock database
    mockDb.store.set(firestorePaths.branch(tenantA, branchMain.id), branchMain as unknown as Record<string, unknown>);
    mockDb.store.set(firestorePaths.branch(tenantA, branchSahafa.id), branchSahafa as unknown as Record<string, unknown>);
    mockDb.store.set(firestorePaths.branch(tenantB, branchCrossTenant.id), branchCrossTenant as unknown as Record<string, unknown>);
    mockDb.store.set(firestorePaths.mainBranchPointer(tenantA), { branchId: branchMain.id });
    mockDb.store.set(firestorePaths.serviceCategory(tenantA, activeCategory.id), activeCategory as unknown as Record<string, unknown>);
    mockDb.store.set(firestorePaths.serviceCategory(tenantA, inactiveCategory.id), inactiveCategory as unknown as Record<string, unknown>);
    mockDb.store.set(firestorePaths.taxSettings(tenantA), taxSettingsRegistered as unknown as Record<string, unknown>);
    mockDb.store.set(firestorePaths.provider(tenantA, activeProvider.id), activeProvider as unknown as Record<string, unknown>);
    mockDb.store.set(firestorePaths.provider(tenantA, providerOlayaOnly.id), providerOlayaOnly as unknown as Record<string, unknown>);
    mockDb.store.set(firestorePaths.provider(tenantA, inactiveProvider.id), inactiveProvider as unknown as Record<string, unknown>);
    mockDb.store.set(firestorePaths.commissionPolicy(tenantA, activeCommissionPolicy.id), activeCommissionPolicy as unknown as Record<string, unknown>);
  });

  describe('Service Creation & Saudi Tax Pricing Integration', () => {
    it('creates a service with 15% inclusive tax and integer Halalas', async () => {
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'قص وتصفيف ملكي',
          durationMinutes: 45,
          bufferBeforeMinutes: 5,
          bufferAfterMinutes: 10,
          basePriceHalalas: 11500, // 115.00 SAR
          taxMode: 'TAX_INCLUSIVE',
        },
        actorOwner,
        'OWNER'
      );

      expect(service.id).toBeDefined();
      expect(service.nameAr).toBe('قص وتصفيف ملكي');
      expect(service.categoryNameAr).toBe('العناية بالشعر');
      expect(service.durationMinutes).toBe(45);
      expect(service.bufferBeforeMinutes).toBe(5);
      expect(service.bufferAfterMinutes).toBe(10);
      expect(service.basePriceHalalas).toBe(11500);
      expect(service.taxRateBps).toBe(1500);
      expect(service.calculatedTaxHalalas).toBe(1500);
      expect(service.netPriceHalalas).toBe(10000);
      expect(service.totalPriceHalalas).toBe(11500);
      // Invariant
      expect(service.netPriceHalalas + service.calculatedTaxHalalas).toBe(service.totalPriceHalalas);

      // Branch defaulted to main branch
      expect(service.primaryBranchId).toBe('branch_olaya_main');
      expect(service.assignedBranchIds).toContain('branch_olaya_main');

      // Public projection written
      const publicPath = firestorePaths.publicService(tenantA, service.id);
      expect(mockDb.store.has(publicPath)).toBe(true);

      // Audit log created
      const audits = Array.from(mockDb.store.entries()).filter(
        ([k, v]) =>
          k.startsWith(firestorePaths.serviceAuditTrail(tenantA)) &&
          v.operation === 'SERVICE_CREATED'
      );
      expect(audits.length).toBe(1);
    });

    it('creates a service with tax exclusive mode', async () => {
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'حمام زيت مغربي',
          durationMinutes: 60,
          basePriceHalalas: 10000, // 100.00 SAR net
          taxMode: 'TAX_EXCLUSIVE',
        },
        actorOwner,
        'OWNER'
      );

      expect(service.netPriceHalalas).toBe(10000);
      expect(service.calculatedTaxHalalas).toBe(1500);
      expect(service.totalPriceHalalas).toBe(11500);
      expect(service.netPriceHalalas + service.calculatedTaxHalalas).toBe(service.totalPriceHalalas);
    });

    it('rejects creation under an inactive category', async () => {
      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: inactiveCategory.id,
            nameAr: 'خدمة تحت تصنيف معطل',
            durationMinutes: 30,
            basePriceHalalas: 5000,
            isActive: true,
          },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/لا يمكن إضافة خدمة مفعّلة تحت تصنيف معطّل/);
    });

    it('rejects negative or non-integer price', async () => {
      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: activeCategory.id,
            nameAr: 'خدمة بسعر سالب',
            durationMinutes: 30,
            basePriceHalalas: -100,
          },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/لا يمكن أن يكون سالباً/);
    });

    it('rejects non-positive duration', async () => {
      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: activeCategory.id,
            nameAr: 'خدمة بدون وقت',
            durationMinutes: 0,
            basePriceHalalas: 5000,
          },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/أكبر من 0/);
    });
  });

  describe('Branch Availability & Isolation', () => {
    it('successfully assigns multiple active branches in the same tenant', async () => {
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'تصفيف شعر نسائي',
          durationMinutes: 30,
          basePriceHalalas: 8000,
          assignedBranchIds: ['branch_olaya_main', 'branch_sahafa'],
        },
        actorOwner,
        'OWNER'
      );

      expect(service.assignedBranchIds).toHaveLength(2);
      expect(service.assignedBranchIds).toContain('branch_olaya_main');
      expect(service.assignedBranchIds).toContain('branch_sahafa');
    });

    it('rejects branch belonging to another tenant', async () => {
      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: activeCategory.id,
            nameAr: 'خدمة في فرع خاطئ',
            durationMinutes: 30,
            basePriceHalalas: 8000,
            assignedBranchIds: ['branch_other_tenant'],
          },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/غير موجود أو لا ينتمي لهذا المتجر/);
    });
  });

  describe('Provider Assignments & Branch Compatibility', () => {
    it('successfully assigns an active and branch-compatible provider', async () => {
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'مكياج سهرة',
          durationMinutes: 60,
          basePriceHalalas: 25000,
          assignedBranchIds: ['branch_olaya_main'],
          assignedProviderIds: [activeProvider.id],
        },
        actorOwner,
        'OWNER'
      );

      expect(service.assignedProviderIds).toContain(activeProvider.id);

      const assigned = await repo.listProvidersForService(tenantA, service.id);
      expect(assigned).toHaveLength(1);
      expect(assigned[0]!.displayNameAr).toBe('سارة العتيبي');
    });

    it('rejects inactive provider assignment', async () => {
      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: activeCategory.id,
            nameAr: 'خدمة مع موظف معطل',
            durationMinutes: 30,
            basePriceHalalas: 5000,
            assignedProviderIds: [inactiveProvider.id],
          },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/غير مفعّل/);
    });

    it('rejects provider whose assigned branches do NOT overlap with service branches', async () => {
      // Provider operates ONLY in Olaya. Service is offered ONLY in Sahafa.
      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: activeCategory.id,
            nameAr: 'خدمة فرع الصحافة',
            durationMinutes: 30,
            basePriceHalalas: 5000,
            primaryBranchId: 'branch_sahafa',
            assignedBranchIds: ['branch_sahafa'],
            assignedProviderIds: [providerOlayaOnly.id],
          },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/غير معيّن في أي من الفروع المتاحة لهذه الخدمة/);
    });
  });

  describe('Commission Policy Association & Role Boundaries', () => {
    it('allows OWNER to associate an active commission policy', async () => {
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'علاج الكيراتين البرازيلي',
          durationMinutes: 120,
          basePriceHalalas: 50000,
          commissionPolicyId: activeCommissionPolicy.id,
        },
        actorOwner,
        'OWNER'
      );

      expect(service.commissionPolicyId).toBe(activeCommissionPolicy.id);
    });

    it('denies MANAGER from associating commission policy without explicit permission', async () => {
      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: activeCategory.id,
            nameAr: 'خدمة مدير',
            durationMinutes: 30,
            basePriceHalalas: 10000,
            commissionPolicyId: activeCommissionPolicy.id,
          },
          actorManager,
          'MANAGER'
        )
      ).rejects.toThrow(/إدارة سياسات العمولات مخصصة لمالك المنشأة فقط/);
    });
  });

  describe('Safe Archival Deletion Policy', () => {
    it('soft-deletes/archives service, preserving historical document while removing public projection', async () => {
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'خدمة للحذف',
          durationMinutes: 30,
          basePriceHalalas: 5000,
        },
        actorOwner,
        'OWNER'
      );

      const publicPath = firestorePaths.publicService(tenantA, service.id);
      expect(mockDb.store.has(publicPath)).toBe(true);

      // Delete (archive) service
      await repo.deleteService(tenantA, service.id, actorOwner, 'OWNER');

      // Internal document still exists with isArchived = true, isActive = false
      const archived = await repo.getServiceById(tenantA, service.id);
      expect(archived).not.toBeNull();
      expect(archived?.isActive).toBe(false);
      expect(archived?.isArchived).toBe(true);

      // Public projection removed
      expect(mockDb.store.has(publicPath)).toBe(false);

      // Audit log records SERVICE_DELETED
      const deleteAudits = Array.from(mockDb.store.entries()).filter(
        ([k, v]) =>
          k.startsWith(firestorePaths.serviceAuditTrail(tenantA)) &&
          v.operation === 'SERVICE_DELETED'
      );
      expect(deleteAudits.length).toBe(1);
    });

    it('denies MANAGER from deleting a service (OWNER only)', async () => {
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'خدمة لا يمكن للمدير حذفها',
          durationMinutes: 30,
          basePriceHalalas: 5000,
        },
        actorOwner,
        'OWNER'
      );

      await expect(
        repo.deleteService(tenantA, service.id, actorManager, 'MANAGER')
      ).rejects.toThrow(/حذف الخدمات مقتصر على مالك المنشأة/);
    });
  });

  // =========================================================================
  // PHASE 3.1 HARDENING SUITES: COMMISSION APPLICABILITY & BIDIRECTIONAL SYNC
  // =========================================================================
  describe('Phase 3.1: Commission Policy Applicability Hardening', () => {
    it('supports future-effective commission policy association (scheduled for later)', async () => {
      const futurePolicy: CommissionPolicyDoc = {
        ...activeCommissionPolicy,
        id: 'policy_future_01',
        nameAr: 'عمولة مستقبلية',
        effectiveFrom: '2099-01-01',
        effectiveUntil: '2099-12-31',
      };
      mockDb.store.set(firestorePaths.commissionPolicy(tenantA, futurePolicy.id), futurePolicy);

      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'خدمة مع عمولة مستقبلية',
          durationMinutes: 45,
          basePriceHalalas: 15000,
          commissionPolicyId: futurePolicy.id,
        },
        actorOwner,
        'OWNER'
      );
      expect(service.commissionPolicyId).toBe(futurePolicy.id);
    });

    it('rejects association with an expired commission policy', async () => {
      const expiredPolicy: CommissionPolicyDoc = {
        ...activeCommissionPolicy,
        id: 'policy_expired_01',
        nameAr: 'عمولة منتهية',
        effectiveFrom: '2020-01-01',
        effectiveUntil: '2021-01-01',
      };
      mockDb.store.set(firestorePaths.commissionPolicy(tenantA, expiredPolicy.id), expiredPolicy);

      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: activeCategory.id,
            nameAr: 'خدمة مع عمولة منتهية',
            durationMinutes: 45,
            basePriceHalalas: 15000,
            commissionPolicyId: expiredPolicy.id,
          },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/منتهية الصلاحية/);
    });

    it('rejects commission policy with inverted date interval (effectiveFrom > effectiveUntil)', async () => {
      const invertedPolicy: CommissionPolicyDoc = {
        ...activeCommissionPolicy,
        id: 'policy_inverted_01',
        nameAr: 'عمولة تواريخ معكوسة',
        effectiveFrom: '2026-12-31',
        effectiveUntil: '2026-01-01',
      };
      mockDb.store.set(firestorePaths.commissionPolicy(tenantA, invertedPolicy.id), invertedPolicy);

      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: activeCategory.id,
            nameAr: 'خدمة مع عمولة معكوسة',
            durationMinutes: 45,
            basePriceHalalas: 15000,
            commissionPolicyId: invertedPolicy.id,
          },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/فترة سريان سياسة العمولة غير صالحة/);
    });

    it('rejects commission policy from a different tenant', async () => {
      const crossTenantPolicy: CommissionPolicyDoc = {
        ...activeCommissionPolicy,
        id: 'policy_other_tenant',
        tenantId: tenantB,
        nameAr: 'عمولة متجر آخر',
      };
      // Store in tenantB's space
      mockDb.store.set(firestorePaths.commissionPolicy(tenantB, crossTenantPolicy.id), crossTenantPolicy);

      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: activeCategory.id,
            nameAr: 'خدمة مع عمولة متجر آخر',
            durationMinutes: 45,
            basePriceHalalas: 15000,
            commissionPolicyId: crossTenantPolicy.id,
          },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/غير موجودة/);
    });
  });

  describe('Phase 3.1: Bidirectional Provider-Service Synchronization', () => {
    it('atomically adds service ID to provider assignedServiceIds on createService', async () => {
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'قص واستشوار',
          durationMinutes: 45,
          basePriceHalalas: 12000,
          assignedProviderIds: [activeProvider.id],
        },
        actorOwner,
        'OWNER'
      );

      const providerData = mockDb.store.get(firestorePaths.provider(tenantA, activeProvider.id));
      expect(providerData).toBeDefined();
      expect(providerData?.assignedServiceIds).toContain(service.id);
    });

    it('atomically adds and removes provider links on updateService', async () => {
      // 1. Create service with activeProvider
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'تلوين خصلات',
          durationMinutes: 90,
          basePriceHalalas: 30000,
          assignedBranchIds: ['branch_olaya_main', 'branch_sahafa'],
          assignedProviderIds: [activeProvider.id],
        },
        actorOwner,
        'OWNER'
      );

      // Verify activeProvider has service.id
      let p1 = mockDb.store.get(firestorePaths.provider(tenantA, activeProvider.id));
      expect(p1?.assignedServiceIds).toContain(service.id);

      // 2. Update service to replace activeProvider with providerOlayaOnly
      await repo.updateService(
        tenantA,
        service.id,
        { assignedProviderIds: [providerOlayaOnly.id] },
        actorOwner,
        'OWNER'
      );

      // Verify activeProvider had service.id removed
      p1 = mockDb.store.get(firestorePaths.provider(tenantA, activeProvider.id));
      expect(p1?.assignedServiceIds).not.toContain(service.id);

      // Verify providerOlayaOnly now has service.id added
      const p2 = mockDb.store.get(firestorePaths.provider(tenantA, providerOlayaOnly.id));
      expect(p2?.assignedServiceIds).toContain(service.id);
    });

    it('atomically cleans up provider assignedServiceIds on deleteService', async () => {
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'مساج استرخائي',
          durationMinutes: 60,
          basePriceHalalas: 25000,
          assignedProviderIds: [activeProvider.id],
        },
        actorOwner,
        'OWNER'
      );

      let p = mockDb.store.get(firestorePaths.provider(tenantA, activeProvider.id));
      expect(p?.assignedServiceIds).toContain(service.id);

      // Delete (archive) service
      await repo.deleteService(tenantA, service.id, actorOwner, 'OWNER');

      // Provider assignedServiceIds must have service.id removed
      p = mockDb.store.get(firestorePaths.provider(tenantA, activeProvider.id));
      expect(p?.assignedServiceIds).not.toContain(service.id);
    });
  });

  describe('Phase 3.1: Category State Consistency & Inactive Safeguards', () => {
    it('rejects activating a service when category is inactive', async () => {
      // Create an inactive service under inactive category
      const service = await repo.createService(
        tenantA,
        {
          categoryId: inactiveCategory.id,
          nameAr: 'خدمة معطلة',
          durationMinutes: 30,
          basePriceHalalas: 5000,
          isActive: false,
        },
        actorOwner,
        'OWNER'
      );

      // Attempt to activate service while category is still inactive
      await expect(
        repo.updateService(
          tenantA,
          service.id,
          { isActive: true },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/لا يمكن تفعيل خدمة تابعة لتصنيف معطّل/);
    });
  });

  // =========================================================================
  // PHASE 3.1.1 CONCURRENCY & TRANSACTION INTEGRITY SUITE
  // =========================================================================
  describe('Phase 3.1.1: Concurrency, Provider Reverse Links & Conflict Handling', () => {
    it('handles concurrent provider assignments to the same service without losing updates', async () => {
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'جلسة علاجية متقدمة',
          durationMinutes: 60,
          basePriceHalalas: 30000,
          assignedProviderIds: [],
        },
        actorOwner,
        'OWNER'
      );

      expect(service.assignedProviderIds).toEqual([]);

      // Execute concurrent assignments
      const [resA, resB] = await Promise.all([
        repo.assignProvidersToService(tenantA, service.id, [activeProvider.id], actorOwner, 'OWNER'),
        repo.assignProvidersToService(tenantA, service.id, [providerOlayaOnly.id], actorOwner, 'OWNER'),
      ]);

      // Re-fetch service from database
      const finalService = await repo.getServiceById(tenantA, service.id);
      expect(finalService).not.toBeNull();
      expect(finalService!.assignedProviderIds).toContain(activeProvider.id);
      expect(finalService!.assignedProviderIds).toContain(providerOlayaOnly.id);

      // Verify both providers now have the service ID in their reverse links
      const p1 = mockDb.store.get(firestorePaths.provider(tenantA, activeProvider.id));
      const p2 = mockDb.store.get(firestorePaths.provider(tenantA, providerOlayaOnly.id));
      expect(p1?.assignedServiceIds).toContain(service.id);
      expect(p2?.assignedServiceIds).toContain(service.id);
    });

    it('rejects assigning a provider from a different tenant', async () => {
      const crossTenantProvider: ProviderDoc = {
        ...activeProvider,
        id: 'prov_cross_tenant_01',
        tenantId: tenantB,
        displayNameAr: 'مقدم من متجر آخر',
      };
      mockDb.store.set(firestorePaths.provider(tenantB, crossTenantProvider.id), crossTenantProvider);

      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'خدمة تجربة',
          durationMinutes: 30,
          basePriceHalalas: 10000,
        },
        actorOwner,
        'OWNER'
      );

      await expect(
        repo.assignProvidersToService(
          tenantA,
          service.id,
          [crossTenantProvider.id],
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/غير موجود|لا ينتمي لنفس المتجر/);
    });

    it('rejects assigning an inactive provider', async () => {
      const inactiveProvider: ProviderDoc = {
        ...activeProvider,
        id: 'prov_inactive_test_01',
        displayNameAr: 'مقدم معطل',
        status: 'INACTIVE',
      };
      mockDb.store.set(firestorePaths.provider(tenantA, inactiveProvider.id), inactiveProvider);

      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'خدمة تجربة 2',
          durationMinutes: 30,
          basePriceHalalas: 10000,
        },
        actorOwner,
        'OWNER'
      );

      await expect(
        repo.assignProvidersToService(
          tenantA,
          service.id,
          [inactiveProvider.id],
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/غير مفعّل/);
    });

    it('safely removes provider assignment and updates reverse link', async () => {
      const service = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'خدمة حلاقة',
          durationMinutes: 30,
          basePriceHalalas: 10000,
          assignedProviderIds: [activeProvider.id, providerOlayaOnly.id],
        },
        actorOwner,
        'OWNER'
      );

      // Verify initial setup
      let p1 = mockDb.store.get(firestorePaths.provider(tenantA, activeProvider.id));
      expect(p1?.assignedServiceIds).toContain(service.id);

      // Remove activeProvider
      const updated = await repo.removeProviderFromService(
        tenantA,
        service.id,
        activeProvider.id,
        actorOwner,
        'OWNER'
      );
      expect(updated.assignedProviderIds).not.toContain(activeProvider.id);
      expect(updated.assignedProviderIds).toContain(providerOlayaOnly.id);

      // Verify provider reverse link is cleanly removed
      p1 = mockDb.store.get(firestorePaths.provider(tenantA, activeProvider.id));
      expect(p1?.assignedServiceIds).not.toContain(service.id);
    });
  });

  describe('Phase 3.1.2: Commission Permission Isolation & Public Catalog Queries', () => {
    it('allows OWNER to create and update services with commission policies', async () => {
      const srv = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'خدمة بعمولة للمالك',
          durationMinutes: 30,
          basePriceHalalas: 10000,
          commissionPolicyId: activeCommissionPolicy.id,
        },
        actorOwner,
        'OWNER'
      );
      expect(srv.commissionPolicyId).toBe(activeCommissionPolicy.id);

      const updated = await repo.updateService(
        tenantA,
        srv.id,
        {
          commissionPolicyId: null,
        },
        actorOwner,
        'OWNER'
      );
      expect(updated.commissionPolicyId).toBeNull();
    });

    it('rejects MANAGER creating a service with a commission policy without explicit permission', async () => {
      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: activeCategory.id,
            nameAr: 'خدمة مدير بعمولة',
            durationMinutes: 30,
            basePriceHalalas: 10000,
            commissionPolicyId: activeCommissionPolicy.id,
          },
          'user_manager_1',
          'MANAGER'
        )
      ).rejects.toThrow(/غير مصرح.*عمولات/);
    });

    it('rejects MANAGER modifying commission policy on an existing service without explicit permission', async () => {
      // Created by owner with policy
      const srv = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'خدمة أساسية',
          durationMinutes: 30,
          basePriceHalalas: 10000,
          commissionPolicyId: activeCommissionPolicy.id,
        },
        actorOwner,
        'OWNER'
      );

      // Manager attempts to clear or change commission policy
      await expect(
        repo.updateService(
          tenantA,
          srv.id,
          {
            commissionPolicyId: null,
          },
          'user_manager_1',
          'MANAGER'
        )
      ).rejects.toThrow(/غير مصرح.*عمولات/);
    });

    it('allows MANAGER to update non-commission fields without touching commission policy', async () => {
      const srv = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'خدمة قبل تعديل المدير',
          durationMinutes: 30,
          basePriceHalalas: 10000,
          commissionPolicyId: activeCommissionPolicy.id,
        },
        actorOwner,
        'OWNER'
      );

      // Manager updates duration and name without changing commissionPolicyId
      const updated = await repo.updateService(
        tenantA,
        srv.id,
        {
          nameAr: 'خدمة بعد تعديل المدير',
          durationMinutes: 45,
        },
        'user_manager_1',
        'MANAGER'
      );

      expect(updated.nameAr).toBe('خدمة بعد تعديل المدير');
      expect(updated.durationMinutes).toBe(45);
      expect(updated.commissionPolicyId).toBe(activeCommissionPolicy.id); // Policy preserved
    });

    it('allows MANAGER with explicit custom permission to manage commission policies', async () => {
      const srv = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'خدمة مدير مفوض',
          durationMinutes: 30,
          basePriceHalalas: 10000,
          commissionPolicyId: activeCommissionPolicy.id,
        },
        'user_manager_authorized',
        'MANAGER',
        ['services.manage_commission_policy'] // Explicitly granted custom permission
      );

      expect(srv.commissionPolicyId).toBe(activeCommissionPolicy.id);

      const updated = await repo.updateService(
        tenantA,
        srv.id,
        {
          commissionPolicyId: null,
        },
        'user_manager_authorized',
        'MANAGER',
        ['services.manage_commission_policy']
      );

      expect(updated.commissionPolicyId).toBeNull();
    });

    it('strictly rejects STAFF from creating or updating services', async () => {
      await expect(
        repo.createService(
          tenantA,
          {
            categoryId: activeCategory.id,
            nameAr: 'خدمة من موظف',
            durationMinutes: 30,
            basePriceHalalas: 10000,
          },
          'user_staff_1',
          'STAFF'
        )
      ).rejects.toThrow(/غير مصرح/);
    });

    it('listPublicCatalogServices returns only query-compatible published items', async () => {
      const srv = await repo.createService(
        tenantA,
        {
          categoryId: activeCategory.id,
          nameAr: 'خدمة عامة معتمدة',
          durationMinutes: 30,
          basePriceHalalas: 10000,
          isActive: true,
        },
        actorOwner,
        'OWNER'
      );

      const publicItems = await repo.listPublicCatalogServices(tenantA);
      expect(publicItems.length).toBeGreaterThanOrEqual(1);
      const found = publicItems.find((p) => p.id === srv.id);
      expect(found).toBeDefined();
      expect(found?.status).toBe('PUBLISHED');
      expect(found?.isActive).toBe(true);
      expect(found?.isCategoryActive).toBe(true);
      expect(found?.isArchived).toBe(false);
      expect(found?.isVisible).toBe(true);
    });
  });
});

