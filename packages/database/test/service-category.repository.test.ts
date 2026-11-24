
import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot, WriteBatch } from 'firebase-admin/firestore';
import { ServiceCategoryRepository } from '../src/server/repositories/service-category.repository';
import { firestorePaths } from '../src/paths';

class MockCategoryFirestore {
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
      delete: async () => {
        this.store.delete(path);
      },
    } as unknown as DocumentReference;
  }

  collection(path: string) {
    const self = this;
    return {
      doc: (id?: string) => {
        const docId = id || `id_${Math.random().toString(36).substring(2, 9)}`;
        return self.doc(`${path}/${docId}`);
      },
      where: (field: string, op: string, val: unknown) => {
        let whereChain = {
          where: (f2: string, op2: string, v2: unknown) => {
            return {
              limit: (n: number) => ({
                get: async () => {
                  const docs: DocumentSnapshot[] = [];
                  for (const [key, value] of self.store.entries()) {
                    if (
                      key.startsWith(path + '/') &&
                      value[field] === val &&
                      value[f2] === v2
                    ) {
                      docs.push(self.createSnapshot(key));
                      if (docs.length >= n) break;
                    }
                  }
                  return { docs, empty: docs.length === 0 };
                },
              }),
              get: async () => {
                const docs: DocumentSnapshot[] = [];
                for (const [key, value] of self.store.entries()) {
                  if (
                    key.startsWith(path + '/') &&
                    value[field] === val &&
                    value[f2] === v2
                  ) {
                    docs.push(self.createSnapshot(key));
                  }
                }
                return { docs, empty: docs.length === 0 };
              },
            };
          },
          limit: (n: number) => ({
            get: async () => {
              const docs: DocumentSnapshot[] = [];
              for (const [key, value] of self.store.entries()) {
                if (key.startsWith(path + '/') && value[field] === val) {
                  docs.push(self.createSnapshot(key));
                  if (docs.length >= n) break;
                }
              }
              return { docs, empty: docs.length === 0 };
            },
          }),
          get: async () => {
            const docs: DocumentSnapshot[] = [];
            for (const [key, value] of self.store.entries()) {
              if (key.startsWith(path + '/') && value[field] === val) {
                docs.push(self.createSnapshot(key));
              }
            }
            return { docs, empty: docs.length === 0 };
          },
        };
        return whereChain;
      },
      orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => ({
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
        });
        return this as unknown as WriteBatch;
      },
      update: (docRef: DocumentReference, data: Record<string, unknown>) => {
        operations.push(() => {
          const existing = this.store.get(docRef.path) || {};
          this.store.set(docRef.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        });
        return this as unknown as WriteBatch;
      },
      delete: (docRef: DocumentReference) => {
        operations.push(() => {
          this.store.delete(docRef.path);
        });
        return this as unknown as WriteBatch;
      },
      commit: async () => {
        for (const op of operations) op();
      },
    } as unknown as WriteBatch;
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

describe('ServiceCategoryRepository', () => {
  let mockDb: MockCategoryFirestore;
  let repo: ServiceCategoryRepository;
  const tenantA = 'tenant_riyadh_01';
  const tenantB = 'tenant_jeddah_02';
  const actorOwner = 'user_owner_01';
  const actorManager = 'user_manager_01';
  const actorStaff = 'user_staff_01';

  beforeEach(() => {
    mockDb = new MockCategoryFirestore();
    repo = new ServiceCategoryRepository(mockDb as unknown as Firestore);
  });

  describe('Category Creation & Duplicate Prevention', () => {
    it('creates a service category with audit log for OWNER', async () => {
      const category = await repo.createCategory(
        tenantA,
        {
          nameAr: 'العناية بالشعر',
          nameEn: 'Hair Care',
          descriptionAr: 'خدمات قص وتصفيف وعلاج الشعر',
          displayOrder: 1,
        },
        actorOwner,
        'OWNER'
      );

      expect(category.id).toBeDefined();
      expect(category.nameAr).toBe('العناية بالشعر');
      expect(category.nameEn).toBe('Hair Care');
      expect(category.displayOrder).toBe(1);
      expect(category.isActive).toBe(true);

      // Verify audit record was created atomically
      const audits = Array.from(mockDb.store.entries()).filter(([k]) =>
        k.startsWith(firestorePaths.serviceAuditTrail(tenantA))
      );
      expect(audits.length).toBe(1);
      expect(audits[0]![1].operation).toBe('CATEGORY_CREATED');
      expect(audits[0]![1].entityType).toBe('CATEGORY');
    });

    it('creates a service category for authorized MANAGER', async () => {
      const category = await repo.createCategory(
        tenantA,
        { nameAr: 'العناية بالأظافر', nameEn: 'Nail Care' },
        actorManager,
        'MANAGER'
      );

      expect(category.id).toBeDefined();
      expect(category.nameAr).toBe('العناية بالأظافر');
    });

    it('denies category creation by STAFF', async () => {
      await expect(
        repo.createCategory(
          tenantA,
          { nameAr: 'المساج والاسترخاء' },
          actorStaff,
          'STAFF'
        )
      ).rejects.toThrow(/غير مصرح/);
    });

    it('rejects duplicate Arabic category name in the same tenant', async () => {
      await repo.createCategory(
        tenantA,
        { nameAr: 'العناية بالبشرة' },
        actorOwner,
        'OWNER'
      );

      await expect(
        repo.createCategory(
          tenantA,
          { nameAr: 'العناية بالبشرة' },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/موجود بالفعل/);
    });

    it('allows identical category name in a different tenant', async () => {
      const catA = await repo.createCategory(
        tenantA,
        { nameAr: 'العناية بالبشرة' },
        actorOwner,
        'OWNER'
      );
      const catB = await repo.createCategory(
        tenantB,
        { nameAr: 'العناية بالبشرة' },
        actorOwner,
        'OWNER'
      );

      expect(catA.id).toBeDefined();
      expect(catB.id).toBeDefined();
      expect(catA.tenantId).toBe(tenantA);
      expect(catB.tenantId).toBe(tenantB);
    });
  });

  describe('Category Update & Validation', () => {
    it('updates category details and logs audit', async () => {
      const cat = await repo.createCategory(
        tenantA,
        { nameAr: 'العناية باللحية', displayOrder: 2 },
        actorOwner,
        'OWNER'
      );

      const updated = await repo.updateCategory(
        tenantA,
        cat.id,
        { nameAr: 'العناية باللحية والشوارب', displayOrder: 5 },
        actorOwner,
        'OWNER'
      );

      expect(updated.nameAr).toBe('العناية باللحية والشوارب');
      expect(updated.displayOrder).toBe(5);

      const audits = Array.from(mockDb.store.entries()).filter(
        ([k, v]) =>
          k.startsWith(firestorePaths.serviceAuditTrail(tenantA)) &&
          v.operation === 'CATEGORY_UPDATED'
      );
      expect(audits.length).toBe(1);
    });

    it('rejects update if nameAr conflicts with another existing category', async () => {
      const cat1 = await repo.createCategory(tenantA, { nameAr: 'مكياج' }, actorOwner, 'OWNER');
      const cat2 = await repo.createCategory(tenantA, { nameAr: 'تسريحات' }, actorOwner, 'OWNER');

      await expect(
        repo.updateCategory(tenantA, cat2.id, { nameAr: 'مكياج' }, actorOwner, 'OWNER')
      ).rejects.toThrow(/موجود بالفعل/);
    });
  });

  describe('Safe Status Activation & Deactivation Policies', () => {
    it('safely deactivates category when no active services exist', async () => {
      const cat = await repo.createCategory(tenantA, { nameAr: 'سبا' }, actorOwner, 'OWNER');

      const updated = await repo.setCategoryStatus(tenantA, cat.id, false, actorOwner, 'OWNER');
      expect(updated.isActive).toBe(false);
    });

    it('rejects deactivation when active services exist under the category', async () => {
      const cat = await repo.createCategory(tenantA, { nameAr: 'قص شعر' }, actorOwner, 'OWNER');

      // Seed an active service under this category
      const servicePath = firestorePaths.service(tenantA, 'srv_active_01');
      mockDb.store.set(servicePath, {
        id: 'srv_active_01',
        tenantId: tenantA,
        categoryId: cat.id,
        nameAr: 'قص أطفال',
        isActive: true,
      });

      await expect(
        repo.setCategoryStatus(tenantA, cat.id, false, actorOwner, 'OWNER')
      ).rejects.toThrow(/لا يمكن تعطيل هذا التصنيف لوجود خدمات نشطة مرتبطة به/);
    });
  });

  describe('Safe Deletion Policy', () => {
    it('safely deletes an unused category', async () => {
      const cat = await repo.createCategory(tenantA, { nameAr: 'تصنيف مؤقت' }, actorOwner, 'OWNER');

      await repo.deleteCategory(tenantA, cat.id, actorOwner, 'OWNER');

      const fetched = await repo.getCategoryById(tenantA, cat.id);
      expect(fetched).toBeNull();
    });

    it('rejects deletion if services are attached to the category', async () => {
      const cat = await repo.createCategory(tenantA, { nameAr: 'صبغات' }, actorOwner, 'OWNER');

      // Seed a service referencing this category
      const servicePath = firestorePaths.service(tenantA, 'srv_dye_01');
      mockDb.store.set(servicePath, {
        id: 'srv_dye_01',
        tenantId: tenantA,
        categoryId: cat.id,
        nameAr: 'صبغة كاملة',
        isActive: false,
      });

      await expect(
        repo.deleteCategory(tenantA, cat.id, actorOwner, 'OWNER')
      ).rejects.toThrow(/لا يمكن حذف هذا التصنيف لأنه يحتوي على خدمات مرتبطة به/);
    });
  });

  // =========================================================================
  // PHASE 3.1 HARDENING SUITES: RENAME PROPAGATION & CONSISTENCY SAFEGUARDS
  // =========================================================================
  describe('Phase 3.1: Category Rename Propagation & Consistency Safeguards', () => {
    it('propagates category nameAr change to all associated services and their public projections', async () => {
      const cat = await repo.createCategory(
        tenantA,
        { nameAr: 'عناية بالشعر الأصلية' },
        actorOwner,
        'OWNER'
      );

      // Seed an active service and its public projection
      const srvId = 'srv_propagate_01';
      const servicePath = firestorePaths.service(tenantA, srvId);
      const publicPath = firestorePaths.publicService(tenantA, srvId);

      mockDb.store.set(servicePath, {
        id: srvId,
        tenantId: tenantA,
        categoryId: cat.id,
        categoryNameAr: 'عناية بالشعر الأصلية',
        nameAr: 'جلسة علاجية',
        isActive: true,
      });
      mockDb.store.set(publicPath, {
        id: srvId,
        tenantId: tenantA,
        categoryId: cat.id,
        categoryNameAr: 'عناية بالشعر الأصلية',
        nameAr: 'جلسة علاجية',
        isActive: true,
      });

      // Update category name
      await repo.updateCategory(
        tenantA,
        cat.id,
        { nameAr: 'عناية بالشعر الملكية' },
        actorOwner,
        'OWNER'
      );

      // Verify service document was updated
      const updatedSrv = mockDb.store.get(servicePath);
      expect(updatedSrv?.categoryNameAr).toBe('عناية بالشعر الملكية');
      expect(updatedSrv?.category).toBe('عناية بالشعر الملكية');

      // Verify public service document was updated
      const updatedPub = mockDb.store.get(publicPath);
      expect(updatedPub?.categoryNameAr).toBe('عناية بالشعر الملكية');
    });

    it('rejects deactivation via updateCategory when active services exist', async () => {
      const cat = await repo.createCategory(
        tenantA,
        { nameAr: 'تصنيف لا يمكن تعطيله' },
        actorOwner,
        'OWNER'
      );

      // Seed active service
      mockDb.store.set(firestorePaths.service(tenantA, 'srv_must_block_deactivation'), {
        id: 'srv_must_block_deactivation',
        tenantId: tenantA,
        categoryId: cat.id,
        isActive: true,
      });

      await expect(
        repo.updateCategory(tenantA, cat.id, { isActive: false }, actorOwner, 'OWNER')
      ).rejects.toThrow(/لا يمكن تعطيل هذا التصنيف لوجود خدمات نشطة مرتبطة به/);
    });

    it('maintains public_service_categories projection lifecycle on create, update, and delete', async () => {
      // 1. Create active category -> public projection created
      const cat = await repo.createCategory(
        tenantA,
        { nameAr: 'مكياج سينمائي', isActive: true },
        actorOwner,
        'OWNER'
      );
      const pubPath = firestorePaths.publicServiceCategory(tenantA, cat.id);
      expect(mockDb.store.has(pubPath)).toBe(true);
      expect(mockDb.store.get(pubPath)?.nameAr).toBe('مكياج سينمائي');

      // 2. Update category -> public projection updated
      await repo.updateCategory(
        tenantA,
        cat.id,
        { nameAr: 'مكياج احترافي' },
        actorOwner,
        'OWNER'
      );
      expect(mockDb.store.get(pubPath)?.nameAr).toBe('مكياج احترافي');

      // 3. Delete category -> public projection deleted
      await repo.deleteCategory(tenantA, cat.id, actorOwner, 'OWNER');
      expect(mockDb.store.has(pubPath)).toBe(false);
    });
  });

  // =========================================================================
  // PHASE 3.1.1 CATEGORY RENAME SCALABILITY & RESUME SUITE
  // =========================================================================
  describe('Phase 3.1.1: Category Rename Scalability & Idempotent Resume', () => {
    it('propagates category rename across 200 services in chunks of <= 150 without exceeding limits', async () => {
      const cat = await repo.createCategory(
        tenantA,
        { nameAr: 'قسم العناية الكبرى' },
        actorOwner,
        'OWNER'
      );

      // Seed 200 services (100 active with public projections, 100 inactive)
      for (let i = 1; i <= 200; i++) {
        const srvId = `srv_bulk_${i}`;
        const isActive = i % 2 === 0;
        const serviceDoc = {
          id: srvId,
          tenantId: tenantA,
          categoryId: cat.id,
          categoryNameAr: 'قسم العناية الكبرى',
          category: 'قسم العناية الكبرى',
          nameAr: `خدمة رقم ${i}`,
          isActive,
        };
        mockDb.store.set(firestorePaths.service(tenantA, srvId), serviceDoc);

        if (isActive) {
          mockDb.store.set(firestorePaths.publicService(tenantA, srvId), {
            id: srvId,
            tenantId: tenantA,
            categoryId: cat.id,
            categoryNameAr: 'قسم العناية الكبرى',
            nameAr: `خدمة رقم ${i}`,
            isActive: true,
          });
        }
      }

      // Rename category
      const updatedCat = await repo.updateCategory(
        tenantA,
        cat.id,
        { nameAr: 'قسم العناية الفائقة المحدث' },
        actorOwner,
        'OWNER'
      );

      // Verify category document has COMPLETED propagation
      expect(updatedCat.nameAr).toBe('قسم العناية الفائقة المحدث');
      expect(updatedCat.renamePropagation?.status).toBe('COMPLETED');
      expect(updatedCat.renamePropagation?.targetNameAr).toBe('قسم العناية الفائقة المحدث');

      // Verify all 200 services have updated names
      for (let i = 1; i <= 200; i++) {
        const srvId = `srv_bulk_${i}`;
        const srv = mockDb.store.get(firestorePaths.service(tenantA, srvId));
        expect(srv?.categoryNameAr).toBe('قسم العناية الفائقة المحدث');
        expect(srv?.category).toBe('قسم العناية الفائقة المحدث');

        if (i % 2 === 0) {
          const pub = mockDb.store.get(firestorePaths.publicService(tenantA, srvId));
          expect(pub?.categoryNameAr).toBe('قسم العناية الفائقة المحدث');
        }
      }
    });

    it('idempotently resumes propagation via retryCategoryRenamePropagation', async () => {
      const cat = await repo.createCategory(
        tenantA,
        { nameAr: 'تصنيف تحت التعديل' },
        actorOwner,
        'OWNER'
      );

      // Seed 50 services with old name, 50 already updated
      for (let i = 1; i <= 100; i++) {
        const srvId = `srv_resume_${i}`;
        const isAlreadyUpdated = i > 50;
        mockDb.store.set(firestorePaths.service(tenantA, srvId), {
          id: srvId,
          tenantId: tenantA,
          categoryId: cat.id,
          categoryNameAr: isAlreadyUpdated ? 'الاسم الجديد المستهدف' : 'تصنيف تحت التعديل',
          category: isAlreadyUpdated ? 'الاسم الجديد المستهدف' : 'تصنيف تحت التعديل',
          nameAr: `خدمة رقم ${i}`,
          isActive: true,
        });
        mockDb.store.set(firestorePaths.publicService(tenantA, srvId), {
          id: srvId,
          tenantId: tenantA,
          categoryId: cat.id,
          categoryNameAr: isAlreadyUpdated ? 'الاسم الجديد المستهدف' : 'تصنيف تحت التعديل',
          nameAr: `خدمة رقم ${i}`,
          isActive: true,
        });
      }

      // Simulate category doc in IN_PROGRESS state
      await mockDb.doc(firestorePaths.serviceCategory(tenantA, cat.id)).update({
        nameAr: 'الاسم الجديد المستهدف',
        renamePropagation: {
          status: 'IN_PROGRESS',
          targetNameAr: 'الاسم الجديد المستهدف',
          updatedAt: new Date().toISOString(),
        },
      });

      // Call retryCategoryRenamePropagation
      const retryResult = await repo.retryCategoryRenamePropagation(
        tenantA,
        cat.id,
        actorOwner,
        'OWNER'
      );

      expect(retryResult.status).toBe('COMPLETED');
      expect(retryResult.processedServices).toBe(50); // only the 50 pending services were processed

      // Verify all 100 services now match
      for (let i = 1; i <= 100; i++) {
        const srvId = `srv_resume_${i}`;
        const srv = mockDb.store.get(firestorePaths.service(tenantA, srvId));
        expect(srv?.categoryNameAr).toBe('الاسم الجديد المستهدف');
        const pub = mockDb.store.get(firestorePaths.publicService(tenantA, srvId));
        expect(pub?.categoryNameAr).toBe('الاسم الجديد المستهدف');
      }

      // Verify category status is now COMPLETED
      const refreshedCat = await repo.getCategoryById(tenantA, cat.id);
      expect(refreshedCat?.renamePropagation?.status).toBe('COMPLETED');
    });

    it('rejects concurrent rename when propagation is already IN_PROGRESS', async () => {
      const cat = await repo.createCategory(
        tenantA,
        { nameAr: 'تصنيف متزامن' },
        actorOwner,
        'OWNER'
      );

      // Simulate in-progress state
      await mockDb.doc(firestorePaths.serviceCategory(tenantA, cat.id)).update({
        renamePropagation: {
          status: 'IN_PROGRESS',
          targetNameAr: 'الاسم الأول الجاري',
          updatedAt: new Date().toISOString(),
        },
      });

      // Second rename attempt should be rejected
      await expect(
        repo.updateCategory(
          tenantA,
          cat.id,
          { nameAr: 'اسم ثاني متنازع عليه' },
          actorOwner,
          'OWNER'
        )
      ).rejects.toThrow(/عملية انتشار جارية/);
    });

    it('handles category rename with more than 500 affected documents across chunks', async () => {
      const cat = await repo.createCategory(
        tenantA,
        { nameAr: 'تصنيف ضخم 500+' },
        actorOwner,
        'OWNER'
      );

      // 260 services with public projections = 520 affected documents
      for (let i = 1; i <= 260; i++) {
        const srvId = `srv_huge_${i}`;
        mockDb.store.set(firestorePaths.service(tenantA, srvId), {
          id: srvId,
          tenantId: tenantA,
          categoryId: cat.id,
          categoryNameAr: 'تصنيف ضخم 500+',
          category: 'تصنيف ضخم 500+',
          nameAr: `خدمة ضخمة ${i}`,
          isActive: true,
        });
        mockDb.store.set(firestorePaths.publicService(tenantA, srvId), {
          id: srvId,
          tenantId: tenantA,
          categoryId: cat.id,
          categoryNameAr: 'تصنيف ضخم 500+',
          nameAr: `خدمة ضخمة ${i}`,
          isActive: true,
        });
      }

      const res = await repo.updateCategory(
        tenantA,
        cat.id,
        { nameAr: 'تصنيف ضخم محدث بالكامل' },
        actorOwner,
        'OWNER'
      );

      expect(res.renamePropagation?.status).toBe('COMPLETED');
      expect(res.nameAr).toBe('تصنيف ضخم محدث بالكامل');

      // Verify sample docs in chunk 1 and chunk 2
      const srv1 = mockDb.store.get(firestorePaths.service(tenantA, 'srv_huge_1'));
      expect(srv1?.categoryNameAr).toBe('تصنيف ضخم محدث بالكامل');
      const srv260 = mockDb.store.get(firestorePaths.service(tenantA, 'srv_huge_260'));
      expect(srv260?.categoryNameAr).toBe('تصنيف ضخم محدث بالكامل');
    });

    it('verifies public category projection immediately exposes authoritative name during propagation', async () => {
      const cat = await repo.createCategory(
        tenantA,
        { nameAr: 'تصنيف للعرض العام' },
        actorOwner,
        'OWNER'
      );

      await repo.updateCategory(
        tenantA,
        cat.id,
        { nameAr: 'تصنيف رسمي معتمد' },
        actorOwner,
        'OWNER'
      );

      // Check public projection
      const pubCatSnap = await mockDb.doc(firestorePaths.publicServiceCategory(tenantA, cat.id)).get();
      expect(pubCatSnap.exists).toBe(true);
      expect((pubCatSnap.data() as any).nameAr).toBe('تصنيف رسمي معتمد');
    });

    it('deduplicates audit events across repeated recovery invocations', async () => {
      const cat = await repo.createCategory(
        tenantA,
        { nameAr: 'تصنيف تكرار الاستئناف' },
        actorOwner,
        'OWNER'
      );

      // Seed 10 services
      for (let i = 1; i <= 10; i++) {
        const srvId = `srv_dedup_${i}`;
        mockDb.store.set(firestorePaths.service(tenantA, srvId), {
          id: srvId,
          tenantId: tenantA,
          categoryId: cat.id,
          categoryNameAr: 'تصنيف تكرار الاستئناف',
          nameAr: `خدمة ${i}`,
          isActive: true,
        });
      }

      // Mark IN_PROGRESS
      await mockDb.doc(firestorePaths.serviceCategory(tenantA, cat.id)).update({
        nameAr: 'الاسم بعد الاستئناف',
        renamePropagation: {
          status: 'IN_PROGRESS',
          targetNameAr: 'الاسم بعد الاستئناف',
          updatedAt: new Date().toISOString(),
        },
      });

      // Run recovery 3 times
      await repo.retryCategoryRenamePropagation(tenantA, cat.id, actorOwner, 'OWNER');
      await repo.retryCategoryRenamePropagation(tenantA, cat.id, actorOwner, 'OWNER');
      await repo.retryCategoryRenamePropagation(tenantA, cat.id, actorOwner, 'OWNER');

      // Count audit records for this category completion
      let completionAuditCount = 0;
      for (const [key] of mockDb.store.entries()) {
        if (key.includes(`cat_rename_completion_${cat.id}`)) {
          completionAuditCount++;
        }
      }
      expect(completionAuditCount).toBe(1); // Exactly one deduplicated record
    });
  });
});
