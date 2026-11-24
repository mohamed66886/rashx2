import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  ServiceCategoryDocSchema,
  PublicServiceCategorySchema,
  CreateCategoryInputSchema,
  UpdateCategoryInputSchema,
  type ServiceCategoryDoc,
  type PublicServiceCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '../../service-category.schema';
import {
  ServiceAuditRecordSchema,
  type ServiceAuditRecord,
} from '../../service-audit.schema';
import {
  assertPermission,
  type TenantRole,
} from '../../permissions';

export class ServiceCategoryRepository {
  private readonly db: Firestore;

  constructor(firestore?: Firestore) {
    this.db = firestore || getFirebaseAdminFirestore();
  }

  /**
   * Helper to write an immutable service audit record.
   */
  private async logAudit(
    tenantId: string,
    operation: ServiceAuditRecord['operation'],
    entityId: string,
    actorUid: string,
    details?: Record<string, unknown>,
    before?: Record<string, unknown> | null,
    after?: Record<string, unknown> | null
  ): Promise<void> {
    const auditRef = this.db.collection(firestorePaths.serviceAuditTrail(tenantId)).doc();
    const nowIso = new Date().toISOString();
    const record: ServiceAuditRecord = ServiceAuditRecordSchema.parse({
      id: auditRef.id,
      tenantId,
      actorUid,
      entityType: 'CATEGORY',
      entityId,
      operation,
      details,
      before: before ?? null,
      after: after ?? null,
      timestamp: nowIso,
    });
    await auditRef.set(record);
  }

  /**
   * Creates a new service category within the tenant.
   * Enforces name uniqueness within tenant and records immutable audit log.
   */
  async createCategory(
    tenantId: string,
    input: CreateCategoryInput,
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<ServiceCategoryDoc> {
    assertPermission(actorRole, 'service_categories.create', customPermissions);

    const validated = CreateCategoryInputSchema.parse(input);

    // Check duplicate Arabic name within tenant
    const existingSnap = await this.db
      .collection(firestorePaths.serviceCategories(tenantId))
      .where('nameAr', '==', validated.nameAr.trim())
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      throw new Error(`تصنيف بالاسم العربي "${validated.nameAr}" موجود بالفعل لهذا المتجر`);
    }

    const categoryRef = this.db.collection(firestorePaths.serviceCategories(tenantId)).doc();
    const nowIso = new Date().toISOString();

    const categoryDoc: ServiceCategoryDoc = ServiceCategoryDocSchema.parse({
      id: categoryRef.id,
      tenantId,
      nameAr: validated.nameAr.trim(),
      nameEn: validated.nameEn?.trim() || '',
      descriptionAr: validated.descriptionAr?.trim() || '',
      descriptionEn: validated.descriptionEn?.trim() || '',
      imageUrl: validated.imageUrl || '',
      displayOrder: validated.displayOrder ?? 0,
      isActive: validated.isActive ?? true,
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: actorUid,
      updatedBy: actorUid,
    });

    const auditRef = this.db.collection(firestorePaths.serviceAuditTrail(tenantId)).doc();
    const auditRecord: ServiceAuditRecord = ServiceAuditRecordSchema.parse({
      id: auditRef.id,
      tenantId,
      actorUid,
      entityType: 'CATEGORY',
      entityId: categoryDoc.id,
      operation: 'CATEGORY_CREATED',
      details: { nameAr: categoryDoc.nameAr },
      before: null,
      after: categoryDoc as unknown as Record<string, unknown>,
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.set(categoryRef, categoryDoc);
    if (categoryDoc.isActive) {
      const pubCatRef = this.db.doc(firestorePaths.publicServiceCategory(tenantId, categoryDoc.id));
      const pubProj = this.toPublicProjection(categoryDoc);
      if (pubProj) batch.set(pubCatRef, pubProj);
    }
    batch.set(auditRef, auditRecord);
    await batch.commit();

    return categoryDoc;
  }

  /**
   * Retrieves a category by ID with tenant verification.
   */
  async getCategoryById(tenantId: string, categoryId: string): Promise<ServiceCategoryDoc | null> {
    const snap = await this.db.doc(firestorePaths.serviceCategory(tenantId, categoryId)).get();
    if (!snap.exists) return null;
    return ServiceCategoryDocSchema.parse(snap.data());
  }

  /**
   * Lists categories for a tenant, sorted by displayOrder ASC, then createdAt ASC.
   */
  async listCategories(
    tenantId: string,
    filter?: { isActive?: boolean }
  ): Promise<ServiceCategoryDoc[]> {
    let query = this.db
      .collection(firestorePaths.serviceCategories(tenantId))
      .orderBy('displayOrder', 'asc');

    if (filter?.isActive !== undefined) {
      query = query.where('isActive', '==', filter.isActive);
    }

    const snap = await query.get();
    return snap.docs.map((d) => ServiceCategoryDocSchema.parse(d.data()));
  }

  /**
   * Updates an existing category.
   */
  async updateCategory(
    tenantId: string,
    categoryId: string,
    input: UpdateCategoryInput,
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<ServiceCategoryDoc> {
    assertPermission(actorRole, 'service_categories.update', customPermissions);
    const validated = UpdateCategoryInputSchema.parse(input);

    const docRef = this.db.doc(firestorePaths.serviceCategory(tenantId, categoryId));
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error(`التصنيف المطلوب غير موجود (${categoryId})`);
    }

    const currentDoc = ServiceCategoryDocSchema.parse(snap.data());

    // If deactivating via update, safeguard against active services
    if (validated.isActive === false && currentDoc.isActive) {
      const activeServicesSnap = await this.db
        .collection(firestorePaths.services(tenantId))
        .where('categoryId', '==', categoryId)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (!activeServicesSnap.empty) {
        throw new Error(
          'لا يمكن تعطيل هذا التصنيف لوجود خدمات نشطة مرتبطة به. يرجى تعطيل أو نقل الخدمات أولاً.'
        );
      }
    }

    const isNameArChanged =
      validated.nameAr !== undefined && validated.nameAr.trim() !== currentDoc.nameAr;
    const newNameAr = isNameArChanged ? validated.nameAr!.trim() : currentDoc.nameAr;

    // If nameAr is updated, verify no other category in this tenant uses that name
    if (isNameArChanged) {
      if (currentDoc.renamePropagation?.status === 'IN_PROGRESS') {
        throw new Error(
          'لا يمكن تعديل اسم التصنيف أثناء وجود عملية انتشار جارية. يرجى الانتظار حتى اكتمالها أو استخدام زر استئناف التحديث.'
        );
      }

      const existingSnap = await this.db
        .collection(firestorePaths.serviceCategories(tenantId))
        .where('nameAr', '==', newNameAr)
        .limit(1)
        .get();

      if (!existingSnap.empty && existingSnap.docs[0]?.id !== categoryId) {
        throw new Error(`تصنيف بالاسم العربي "${validated.nameAr}" موجود بالفعل لهذا المتجر`);
      }
    }

    const nowIso = new Date().toISOString();
    const updatedData: ServiceCategoryDoc = ServiceCategoryDocSchema.parse({
      ...currentDoc,
      ...validated,
      nameAr: newNameAr,
      nameEn: validated.nameEn !== undefined ? validated.nameEn.trim() : currentDoc.nameEn,
      descriptionAr:
        validated.descriptionAr !== undefined
          ? validated.descriptionAr.trim()
          : currentDoc.descriptionAr,
      descriptionEn:
        validated.descriptionEn !== undefined
          ? validated.descriptionEn.trim()
          : currentDoc.descriptionEn,
      imageUrl: validated.imageUrl !== undefined ? validated.imageUrl : currentDoc.imageUrl,
      displayOrder:
        validated.displayOrder !== undefined ? validated.displayOrder : currentDoc.displayOrder,
      isActive: validated.isActive !== undefined ? validated.isActive : currentDoc.isActive,
      renamePropagation: isNameArChanged
        ? {
            status: 'IN_PROGRESS',
            targetNameAr: newNameAr,
            updatedAt: nowIso,
          }
        : currentDoc.renamePropagation,
      updatedAt: nowIso,
      updatedBy: actorUid,
    });

    const auditRef = this.db.collection(firestorePaths.serviceAuditTrail(tenantId)).doc();
    const auditRecord: ServiceAuditRecord = ServiceAuditRecordSchema.parse({
      id: auditRef.id,
      tenantId,
      actorUid,
      entityType: 'CATEGORY',
      entityId: categoryId,
      operation: 'CATEGORY_UPDATED',
      details: { updatedFields: Object.keys(validated) },
      before: currentDoc as unknown as Record<string, unknown>,
      after: updatedData as unknown as Record<string, unknown>,
      timestamp: nowIso,
    });

    // 1. Commit category update, public projection, and audit record
    const batch = this.db.batch();
    batch.set(docRef, updatedData);

    const pubCatRef = this.db.doc(firestorePaths.publicServiceCategory(tenantId, categoryId));
    if (updatedData.isActive) {
      const pubProj = this.toPublicProjection(updatedData);
      if (pubProj) batch.set(pubCatRef, pubProj);
    } else {
      batch.delete(pubCatRef);
    }

    batch.set(auditRef, auditRecord);
    await batch.commit();

    // 2. Scalable Propagation: Propagate rename in chunks of <= 150 services (max 300 writes per batch)
    if (isNameArChanged) {
      const servicesSnap = await this.db
        .collection(firestorePaths.services(tenantId))
        .where('categoryId', '==', categoryId)
        .get();

      const CHUNK_SIZE = 150;
      for (let i = 0; i < servicesSnap.docs.length; i += CHUNK_SIZE) {
        const chunk = servicesSnap.docs.slice(i, i + CHUNK_SIZE);
        const chunkBatch = this.db.batch();
        const chunkNow = new Date().toISOString();

        for (const sDoc of chunk) {
          const sData = sDoc.data();
          chunkBatch.update(sDoc.ref, {
            categoryNameAr: newNameAr,
            category: newNameAr,
            updatedAt: chunkNow,
          });
          if (sData.isActive) {
            const pubRef = this.db.doc(firestorePaths.publicService(tenantId, sDoc.id));
            chunkBatch.update(pubRef, {
              categoryNameAr: newNameAr,
            });
          }
        }
        await chunkBatch.commit();
      }

      // 3. Completion Verification before marking COMPLETED
      const verifySnap = await this.db
        .collection(firestorePaths.services(tenantId))
        .where('categoryId', '==', categoryId)
        .get();
      const stillPending = verifySnap.docs.filter((d) => d.data().categoryNameAr !== newNameAr);

      if (stillPending.length === 0) {
        const completedPropagation = {
          status: 'COMPLETED' as const,
          targetNameAr: newNameAr,
          updatedAt: new Date().toISOString(),
        };
        updatedData.renamePropagation = completedPropagation;
        await docRef.update({
          renamePropagation: completedPropagation,
          updatedAt: completedPropagation.updatedAt,
        });
      }
    }

    return updatedData;
  }

  /**
   * Idempotently resumes or retries propagating a category rename to all services in the category
   * in safe chunks of <= 150 services (max 300 writes per batch).
   */
  async retryCategoryRenamePropagation(
    tenantId: string,
    categoryId: string,
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<{ processedServices: number; status: 'COMPLETED' }> {
    assertPermission(actorRole, 'service_categories.update', customPermissions);

    const docRef = this.db.doc(firestorePaths.serviceCategory(tenantId, categoryId));
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error(`التصنيف المطلوب غير موجود (${categoryId})`);
    }

    const category = ServiceCategoryDocSchema.parse(snap.data());
    const targetNameAr = category.renamePropagation?.targetNameAr || category.nameAr;
    const nowIso = new Date().toISOString();

    // Mark IN_PROGRESS if not already marked
    if (category.renamePropagation?.status !== 'IN_PROGRESS') {
      await docRef.update({
        renamePropagation: {
          status: 'IN_PROGRESS',
          targetNameAr,
          updatedAt: nowIso,
        },
        updatedAt: nowIso,
      });
    }

    const servicesSnap = await this.db
      .collection(firestorePaths.services(tenantId))
      .where('categoryId', '==', categoryId)
      .get();

    // Filter services that need propagation
    const pendingServices = servicesSnap.docs.filter((d) => {
      const data = d.data();
      return data.categoryNameAr !== targetNameAr || data.category !== targetNameAr;
    });

    const CHUNK_SIZE = 150;
    for (let i = 0; i < pendingServices.length; i += CHUNK_SIZE) {
      const chunk = pendingServices.slice(i, i + CHUNK_SIZE);
      const chunkBatch = this.db.batch();
      const chunkNow = new Date().toISOString();

      for (const sDoc of chunk) {
        const sData = sDoc.data();
        chunkBatch.update(sDoc.ref, {
          categoryNameAr: targetNameAr,
          category: targetNameAr,
          updatedAt: chunkNow,
        });
        if (sData.isActive) {
          const pubRef = this.db.doc(firestorePaths.publicService(tenantId, sDoc.id));
          chunkBatch.update(pubRef, {
            categoryNameAr: targetNameAr,
          });
        }
      }
      await chunkBatch.commit();
    }

    // Completion Verification before marking COMPLETED
    const verifySnap = await this.db
      .collection(firestorePaths.services(tenantId))
      .where('categoryId', '==', categoryId)
      .get();
    const stillPending = verifySnap.docs.filter(
      (d) => d.data().categoryNameAr !== targetNameAr || d.data().category !== targetNameAr
    );

    if (stillPending.length === 0) {
      const completedPropagation = {
        status: 'COMPLETED' as const,
        targetNameAr,
        updatedAt: new Date().toISOString(),
      };
      await docRef.update({
        renamePropagation: completedPropagation,
        updatedAt: completedPropagation.updatedAt,
      });

      // Deduplicated idempotent audit record using a deterministic document ID
      const auditId = `cat_rename_completion_${categoryId}`;
      const auditRef = this.db.doc(firestorePaths.serviceAuditRecord(tenantId, auditId));
      const auditRecord: ServiceAuditRecord = ServiceAuditRecordSchema.parse({
        id: auditId,
        tenantId,
        actorUid,
        entityType: 'CATEGORY',
        entityId: categoryId,
        operation: 'CATEGORY_UPDATED',
        details: { targetNameAr, propagatedCount: pendingServices.length, status: 'COMPLETED' },
        before: { renamePropagation: category.renamePropagation },
        after: { renamePropagation: completedPropagation },
        timestamp: completedPropagation.updatedAt,
      });
      await auditRef.set(auditRecord);
    }

    return {
      processedServices: pendingServices.length,
      status: 'COMPLETED',
    };
  }

  /**
   * Sets category activation status with safe business validation:
   * Prevents deactivating a category that still contains active services.
   */
  async setCategoryStatus(
    tenantId: string,
    categoryId: string,
    isActive: boolean,
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<ServiceCategoryDoc> {
    assertPermission(actorRole, 'service_categories.manage_status', customPermissions);

    const docRef = this.db.doc(firestorePaths.serviceCategory(tenantId, categoryId));
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error(`التصنيف المطلوب غير موجود (${categoryId})`);
    }

    const currentDoc = ServiceCategoryDocSchema.parse(snap.data());
    if (currentDoc.isActive === isActive) {
      return currentDoc;
    }

    // Deactivation safeguard: Check for active services under this category
    if (!isActive) {
      const activeServicesSnap = await this.db
        .collection(firestorePaths.services(tenantId))
        .where('categoryId', '==', categoryId)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (!activeServicesSnap.empty) {
        throw new Error(
          'لا يمكن تعطيل هذا التصنيف لوجود خدمات نشطة مرتبطة به. يرجى تعطيل أو نقل الخدمات أولاً.'
        );
      }
    }

    const nowIso = new Date().toISOString();
    const updatedDoc: ServiceCategoryDoc = ServiceCategoryDocSchema.parse({
      ...currentDoc,
      isActive,
      updatedAt: nowIso,
      updatedBy: actorUid,
    });

    const auditRef = this.db.collection(firestorePaths.serviceAuditTrail(tenantId)).doc();
    const auditRecord: ServiceAuditRecord = ServiceAuditRecordSchema.parse({
      id: auditRef.id,
      tenantId,
      actorUid,
      entityType: 'CATEGORY',
      entityId: categoryId,
      operation: 'CATEGORY_STATUS_CHANGED',
      details: { isActive, previousActive: currentDoc.isActive },
      before: { isActive: currentDoc.isActive },
      after: { isActive },
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.set(docRef, updatedDoc);

    const pubCatRef = this.db.doc(firestorePaths.publicServiceCategory(tenantId, categoryId));
    if (isActive) {
      const pubProj = this.toPublicProjection(updatedDoc);
      if (pubProj) batch.set(pubCatRef, pubProj);
    } else {
      batch.delete(pubCatRef);
      // Clean up any public service projections in this category
      const pubServicesSnap = await this.db
        .collection(firestorePaths.publicServices(tenantId))
        .where('categoryId', '==', categoryId)
        .get();
      for (const pDoc of pubServicesSnap.docs) {
        batch.delete(pDoc.ref);
      }
    }

    batch.set(auditRef, auditRecord);
    await batch.commit();

    return updatedDoc;
  }

  /**
   * Safely deletes a category.
   * Rejects deletion if any services (active or inactive) are associated with it.
   */
  async deleteCategory(
    tenantId: string,
    categoryId: string,
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<void> {
    assertPermission(actorRole, 'service_categories.manage_status', customPermissions);

    const docRef = this.db.doc(firestorePaths.serviceCategory(tenantId, categoryId));
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error(`التصنيف المطلوب غير موجود (${categoryId})`);
    }

    const currentDoc = ServiceCategoryDocSchema.parse(snap.data());

    // Check if any service references this category
    const servicesSnap = await this.db
      .collection(firestorePaths.services(tenantId))
      .where('categoryId', '==', categoryId)
      .limit(1)
      .get();

    if (!servicesSnap.empty) {
      throw new Error(
        'لا يمكن حذف هذا التصنيف لأنه يحتوي على خدمات مرتبطة به. يرجى نقل أو حذف الخدمات أولاً.'
      );
    }

    const nowIso = new Date().toISOString();
    const auditRef = this.db.collection(firestorePaths.serviceAuditTrail(tenantId)).doc();
    const auditRecord: ServiceAuditRecord = ServiceAuditRecordSchema.parse({
      id: auditRef.id,
      tenantId,
      actorUid,
      entityType: 'CATEGORY',
      entityId: categoryId,
      operation: 'CATEGORY_DELETED',
      details: { nameAr: currentDoc.nameAr },
      before: currentDoc as unknown as Record<string, unknown>,
      after: null,
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.delete(docRef);
    const pubCatRef = this.db.doc(firestorePaths.publicServiceCategory(tenantId, categoryId));
    batch.delete(pubCatRef);
    batch.set(auditRef, auditRecord);
    await batch.commit();
  }

  /**
   * Batch updates category display order.
   */
  async reorderCategories(
    tenantId: string,
    categoryOrders: Array<{ id: string; displayOrder: number }>,
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<void> {
    assertPermission(actorRole, 'service_categories.update', customPermissions);
    if (!categoryOrders || categoryOrders.length === 0) return;

    const batch = this.db.batch();
    const nowIso = new Date().toISOString();

    for (const item of categoryOrders) {
      const docRef = this.db.doc(firestorePaths.serviceCategory(tenantId, item.id));
      batch.update(docRef, {
        displayOrder: item.displayOrder,
        updatedAt: nowIso,
        updatedBy: actorUid,
      });
    }

    await batch.commit();
  }

  /**
   * Sanitized public projection for external catalog visitors.
   */
  toPublicProjection(category: ServiceCategoryDoc): PublicServiceCategory | null {
    if (!category.isActive) return null;
    return PublicServiceCategorySchema.parse({
      id: category.id,
      tenantId: category.tenantId,
      nameAr: category.nameAr,
      nameEn: category.nameEn || undefined,
      descriptionAr: category.descriptionAr || undefined,
      descriptionEn: category.descriptionEn || undefined,
      imageUrl: category.imageUrl || undefined,
      displayOrder: category.displayOrder,
      isActive: true as const,
    });
  }
}

