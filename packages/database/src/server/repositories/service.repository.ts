import 'server-only';
import { FieldValue, type Firestore, type Transaction } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  ServiceDocSchema,
  PublicCatalogServiceSchema,
  CreateCatalogServiceInputSchema,
  UpdateCatalogServiceInputSchema,
  type ServiceDoc,
  type PublicCatalogService,
  type CreateCatalogServiceInput,
  type UpdateCatalogServiceInput,
} from '../../service.schema';
import { ServiceCategoryDocSchema } from '../../service-category.schema';
import { BranchDocSchema } from '../../branch.schema';
import {
  ProviderDocSchema,
  PublicProviderDocSchema,
  type ProviderDoc,
  type PublicProviderDoc,
} from '../../provider.schema';
import {
  CommissionPolicyDocSchema,
  validateCommissionPolicyAssociation,
} from '../../commission-policy.schema';
import { TaxSettingsDocSchema } from '../../company.schema';
import { calculateServicePricing } from '../../service-pricing';
import {
  ServiceAuditRecordSchema,
  type ServiceAuditRecord,
} from '../../service-audit.schema';
import {
  assertPermission,
  canManageServiceCommission,
  type TenantRole,
} from '../../permissions';

export interface ServiceListFilter {
  categoryId?: string;
  branchId?: string;
  providerId?: string;
  isActive?: boolean;
  search?: string;
}

export class ServiceRepository {
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
      entityType: 'SERVICE',
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
   * Resolves the authoritative main branch ID for the tenant.
   */
  private async getMainBranchId(tenantId: string, transaction?: Transaction): Promise<string> {
    const pointerRef = this.db.doc(firestorePaths.mainBranchPointer(tenantId));
    const pointerSnap = transaction ? await transaction.get(pointerRef) : await pointerRef.get();
    if (pointerSnap.exists) {
      const data = pointerSnap.data();
      if (data?.branchId) return data.branchId;
      if (data?.mainBranchId) return data.mainBranchId;
    }

    const branchesSnap = await this.db
      .collection(firestorePaths.branches(tenantId))
      .where('isMain', '==', true)
      .limit(1)
      .get();

    if (!branchesSnap.empty) {
      return branchesSnap.docs[0]!.id;
    }

    // Fallback to first branch
    const anyBranchSnap = await this.db
      .collection(firestorePaths.branches(tenantId))
      .limit(1)
      .get();
    if (!anyBranchSnap.empty) {
      return anyBranchSnap.docs[0]!.id;
    }

    throw new Error('لم يتم العثور على فرع معتمد للمتجر. يرجى تهيئة الفرع الرئيسي أولاً.');
  }

  /**
   * Validates that all given branch IDs exist, belong to tenant, and are active.
   */
  private async validateBranches(
    tenantId: string,
    branchIds: string[],
    transaction?: Transaction
  ): Promise<void> {
    for (const bId of branchIds) {
      const ref = this.db.doc(firestorePaths.branch(tenantId, bId));
      const snap = transaction ? await transaction.get(ref) : await ref.get();
      if (!snap.exists) {
        throw new Error(`الفرع المحدد غير موجود أو لا ينتمي لهذا المتجر (${bId})`);
      }
      const branch = BranchDocSchema.parse(snap.data());
      if (branch.tenantId !== tenantId) {
        throw new Error(`الفرع المحدد لا ينتمي لهذا المتجر (${bId})`);
      }
      if (!branch.isActive) {
        throw new Error(`لا يمكن إضافة الفرع (${branch.name}) لأنه غير مفعّل`);
      }
    }
  }

  /**
   * Creates a new service in the tenant catalog with full business validation.
   * Concurrency-safe: Runs in a Firestore transaction with pure read-before-write execution.
   */
  async createService(
    tenantId: string,
    input: CreateCatalogServiceInput,
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<ServiceDoc> {
    assertPermission(actorRole, 'services.create', customPermissions);
    const validated = CreateCatalogServiceInputSchema.parse(input);

    return await this.db.runTransaction(async (transaction: Transaction) => {
      // 1. All Reads First
      const categoryRef = this.db.doc(firestorePaths.serviceCategory(tenantId, validated.categoryId));
      const categorySnap = await transaction.get(categoryRef);
      if (!categorySnap.exists) {
        throw new Error(`التصنيف المحدد غير موجود في هذا المتجر (${validated.categoryId})`);
      }
      const category = ServiceCategoryDocSchema.parse(categorySnap.data());
      if (category.tenantId !== tenantId) {
        throw new Error(`التصنيف المحدد لا ينتمي لهذا المتجر (${validated.categoryId})`);
      }
      if (!category.isActive && validated.isActive) {
        throw new Error(
          `لا يمكن إضافة خدمة مفعّلة تحت تصنيف معطّل (${category.nameAr}). يرجى تفعيل التصنيف أولاً.`
        );
      }

      const mainBranchId = await this.getMainBranchId(tenantId, transaction);
      const primaryBranchId = validated.primaryBranchId || mainBranchId;
      let assignedBranchIds =
        validated.assignedBranchIds && validated.assignedBranchIds.length > 0
          ? validated.assignedBranchIds
          : [primaryBranchId];

      if (!assignedBranchIds.includes(primaryBranchId)) {
        assignedBranchIds = [primaryBranchId, ...assignedBranchIds];
      }
      await this.validateBranches(tenantId, assignedBranchIds, transaction);

      const taxSettingsRef = this.db.doc(firestorePaths.taxSettings(tenantId));
      const taxSettingsSnap = await transaction.get(taxSettingsRef);
      const taxSettings = taxSettingsSnap.exists
        ? TaxSettingsDocSchema.parse(taxSettingsSnap.data())
        : null;

      const assignedProviderIds = validated.assignedProviderIds || [];
      const providerDocs: ProviderDoc[] = [];
      for (const pId of assignedProviderIds) {
        const pRef = this.db.doc(firestorePaths.provider(tenantId, pId));
        const pSnap = await transaction.get(pRef);
        if (!pSnap.exists) {
          throw new Error(`مقدم الخدمة المحدد (${pId}) غير موجود في هذا المتجر`);
        }
        const provider = ProviderDocSchema.parse(pSnap.data());
        if (provider.tenantId !== tenantId) {
          throw new Error(`مقدم الخدمة (${provider.displayNameAr}) لا ينتمي لنفس المتجر`);
        }
        if (provider.status !== 'ACTIVE') {
          throw new Error(`مقدم الخدمة (${provider.displayNameAr}) غير مفعّل`);
        }
        const branchOverlap = provider.assignedBranchIds.some((bId) => assignedBranchIds.includes(bId));
        if (!branchOverlap) {
          throw new Error(
            `مقدم الخدمة (${provider.displayNameAr}) غير معيّن في أي من الفروع المتاحة لهذه الخدمة`
          );
        }
        providerDocs.push(provider);
      }

      if (validated.commissionPolicyId) {
        if (!canManageServiceCommission(actorRole, customPermissions)) {
          throw new Error('غير مصرح: إدارة سياسات العمولات مخصصة لمالك المنشأة فقط.');
        }
        const policyRef = this.db.doc(firestorePaths.commissionPolicy(tenantId, validated.commissionPolicyId));
        const policySnap = await transaction.get(policyRef);
        if (!policySnap.exists) {
          throw new Error(`سياسة العمولة المحددة غير موجودة (${validated.commissionPolicyId})`);
        }
        const policy = CommissionPolicyDocSchema.parse(policySnap.data());
        validateCommissionPolicyAssociation(policy, tenantId);
      }

      const pricing = calculateServicePricing(
        {
          basePriceHalalas: validated.basePriceHalalas,
          taxMode: validated.taxMode,
          customTaxRateBps: validated.customTaxRateBps,
        },
        taxSettings
      );

      const serviceRef = this.db.collection(firestorePaths.services(tenantId)).doc();
      const nowIso = new Date().toISOString();
      const isActive = validated.isActive ?? true;

      const serviceDoc: ServiceDoc = ServiceDocSchema.parse({
        id: serviceRef.id,
        tenantId,
        categoryId: validated.categoryId,
        categoryNameAr: category.nameAr,
        nameAr: validated.nameAr.trim(),
        nameEn: validated.nameEn?.trim() || '',
        descriptionAr: validated.descriptionAr?.trim() || '',
        descriptionEn: validated.descriptionEn?.trim() || '',
        imageUrl: validated.imageUrl || '',
        durationMinutes: validated.durationMinutes,
        bufferBeforeMinutes: validated.bufferBeforeMinutes ?? 0,
        bufferAfterMinutes: validated.bufferAfterMinutes ?? 0,
        basePriceHalalas: pricing.basePriceHalalas,
        currency: 'SAR',
        taxMode: pricing.taxMode,
        taxRateBps: pricing.taxRateBps,
        netPriceHalalas: pricing.netPriceHalalas,
        calculatedTaxHalalas: pricing.calculatedTaxHalalas,
        totalPriceHalalas: pricing.totalPriceHalalas,
        primaryBranchId,
        assignedBranchIds,
        assignedProviderIds,
        commissionPolicyId: validated.commissionPolicyId ?? null,
        resourceRequirement: validated.resourceRequirement ?? 'OPTIONAL',
        allowedResourceTypes: validated.allowedResourceTypes ?? [],
        displayOrder: validated.displayOrder ?? 0,
        isActive,
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: actorUid,
        updatedBy: actorUid,

        // Compatibility fields
        name: validated.nameAr.trim(),
        category: category.nameAr,
        priceHalalas: pricing.totalPriceHalalas,
        status: isActive ? 'PUBLISHED' : 'DRAFT',
        isVisible: isActive,
        isArchived: false,
      });

      let publicDoc: PublicCatalogService | null = null;
      if (isActive && category.isActive) {
        publicDoc = PublicCatalogServiceSchema.parse({
          id: serviceDoc.id,
          tenantId,
          categoryId: serviceDoc.categoryId,
          categoryNameAr: serviceDoc.categoryNameAr,
          nameAr: serviceDoc.nameAr,
          nameEn: serviceDoc.nameEn || undefined,
          descriptionAr: serviceDoc.descriptionAr || undefined,
          descriptionEn: serviceDoc.descriptionEn || undefined,
          imageUrl: serviceDoc.imageUrl || undefined,
          durationMinutes: serviceDoc.durationMinutes,
          totalPriceHalalas: serviceDoc.totalPriceHalalas,
          currency: 'SAR',
          taxMode: serviceDoc.taxMode,
          displayOrder: serviceDoc.displayOrder,
          status: 'PUBLISHED',
          isVisible: true,
          isActive: true as const,
          isArchived: false,
          isCategoryActive: true as const,
        });
      }

      const auditRef = this.db.collection(firestorePaths.serviceAuditTrail(tenantId)).doc();
      const auditRecord: ServiceAuditRecord = ServiceAuditRecordSchema.parse({
        id: auditRef.id,
        tenantId,
        actorUid,
        entityType: 'SERVICE',
        entityId: serviceDoc.id,
        operation: 'SERVICE_CREATED',
        details: {
          nameAr: serviceDoc.nameAr,
          categoryId: serviceDoc.categoryId,
          totalPriceHalalas: serviceDoc.totalPriceHalalas,
          taxMode: serviceDoc.taxMode,
        },
        before: null,
        after: serviceDoc as unknown as Record<string, unknown>,
        timestamp: nowIso,
      });

      // 2. All Writes Follow All Reads
      transaction.set(serviceRef, serviceDoc);

      if (publicDoc) {
        const publicRef = this.db.doc(firestorePaths.publicService(tenantId, serviceDoc.id));
        transaction.set(publicRef, publicDoc);
      }

      for (const pId of assignedProviderIds) {
        const pRef = this.db.doc(firestorePaths.provider(tenantId, pId));
        transaction.update(pRef, {
          assignedServiceIds: FieldValue.arrayUnion(serviceDoc.id),
          updatedAt: nowIso,
        });
      }

      transaction.set(auditRef, auditRecord);

      return serviceDoc;
    });
  }

  /**
   * Retrieves a service by ID with tenant verification.
   */
  async getServiceById(tenantId: string, serviceId: string): Promise<ServiceDoc | null> {
    const snap = await this.db.doc(firestorePaths.service(tenantId, serviceId)).get();
    if (!snap.exists) return null;
    return ServiceDocSchema.parse(snap.data());
  }

  /**
   * Lists services for a tenant with rich filtering and sorting.
   */
  async listServices(
    tenantId: string,
    filter?: ServiceListFilter
  ): Promise<ServiceDoc[]> {
    let query = this.db
      .collection(firestorePaths.services(tenantId))
      .orderBy('displayOrder', 'asc');

    if (filter?.categoryId) {
      query = query.where('categoryId', '==', filter.categoryId);
    }
    if (filter?.branchId) {
      query = query.where('assignedBranchIds', 'array-contains', filter.branchId);
    }
    if (filter?.isActive !== undefined) {
      query = query.where('isActive', '==', filter.isActive);
    }

    const snap = await query.get();
    let services = snap.docs.map((d) => ServiceDocSchema.parse(d.data()));

    // In-memory filters for providerId and search text
    if (filter?.providerId) {
      services = services.filter((s) => s.assignedProviderIds?.includes(filter.providerId!));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      services = services.filter(
        (s) =>
          s.nameAr.toLowerCase().includes(q) ||
          (s.nameEn && s.nameEn.toLowerCase().includes(q)) ||
          s.categoryNameAr.toLowerCase().includes(q)
      );
    }

    return services;
  }

  /**
   * Queries public service catalog items using the strict query-compatible publication filters
   * mandated by Firestore Security Rules.
   */
  async listPublicCatalogServices(
    tenantId: string,
    filter?: { categoryId?: string }
  ): Promise<PublicCatalogService[]> {
    let query = this.db
      .collection(firestorePaths.publicServices(tenantId))
      .where('status', '==', 'PUBLISHED')
      .where('isVisible', '==', true)
      .where('isActive', '==', true)
      .where('isArchived', '==', false)
      .where('isCategoryActive', '==', true);

    if (filter?.categoryId) {
      query = query.where('categoryId', '==', filter.categoryId);
    }

    const snap = await query.get();
    return snap.docs.map((d) => PublicCatalogServiceSchema.parse(d.data()));
  }

  /**
   * Updates an existing service.
   * Concurrency-safe: Runs in a Firestore transaction with pure read-before-write execution.
   */
  async updateService(
    tenantId: string,
    serviceId: string,
    input: UpdateCatalogServiceInput,
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<ServiceDoc> {
    assertPermission(actorRole, 'services.update', customPermissions);
    const validated = UpdateCatalogServiceInputSchema.parse(input);

    return await this.db.runTransaction(async (transaction: Transaction) => {
      // 1. All Reads First
      const docRef = this.db.doc(firestorePaths.service(tenantId, serviceId));
      const snap = await transaction.get(docRef);
      if (!snap.exists) {
        throw new Error(`الخدمة المطلوبة غير موجودة (${serviceId})`);
      }

      const currentDoc = ServiceDocSchema.parse(snap.data());
      if (currentDoc.tenantId !== tenantId) {
        throw new Error(`الخدمة لا تنتمي لهذا المتجر (${serviceId})`);
      }

      // Permission checks for sensitive sections
      const isPricingChanged =
        validated.basePriceHalalas !== undefined ||
        validated.taxMode !== undefined ||
        validated.customTaxRateBps !== undefined;

      if (isPricingChanged) {
        assertPermission(actorRole, 'services.manage_pricing', customPermissions);
      }

      const isBranchesChanged =
        validated.primaryBranchId !== undefined || validated.assignedBranchIds !== undefined;

      if (isBranchesChanged) {
        assertPermission(actorRole, 'services.manage_branch_availability', customPermissions);
      }

      const isProvidersChanged = validated.assignedProviderIds !== undefined;
      if (isProvidersChanged) {
        assertPermission(actorRole, 'services.manage_provider_assignments', customPermissions);
      }

      const isCommissionChanged =
        validated.commissionPolicyId !== undefined &&
        validated.commissionPolicyId !== currentDoc.commissionPolicyId;
      if (isCommissionChanged) {
        if (!canManageServiceCommission(actorRole, customPermissions)) {
          throw new Error('غير مصرح: إدارة سياسات العمولات مخصصة لمالك المنشأة فقط.');
        }
      }

      const isStatusChanged = validated.isActive !== undefined && validated.isActive !== currentDoc.isActive;
      if (isStatusChanged) {
        assertPermission(actorRole, 'services.manage_status', customPermissions);
      }

      // Read and Validate Category
      const categoryId = validated.categoryId || currentDoc.categoryId;
      const catSnap = await transaction.get(
        this.db.doc(firestorePaths.serviceCategory(tenantId, categoryId))
      );
      if (!catSnap.exists) {
        throw new Error(`التصنيف المحدد غير موجود (${categoryId})`);
      }
      const targetCategory = ServiceCategoryDocSchema.parse(catSnap.data());
      if (targetCategory.tenantId !== tenantId) {
        throw new Error(`التصنيف المحدد لا ينتمي لهذا المتجر (${categoryId})`);
      }
      const categoryNameAr = targetCategory.nameAr;

      const isActive = validated.isActive !== undefined ? validated.isActive : currentDoc.isActive;
      if (isActive && !targetCategory.isActive) {
        throw new Error(
          `لا يمكن تفعيل خدمة تابعة لتصنيف معطّل (${targetCategory.nameAr}). يرجى تفعيل التصنيف أولاً.`
        );
      }

      // Read and Validate Branches
      let primaryBranchId = validated.primaryBranchId || currentDoc.primaryBranchId;
      let assignedBranchIds = validated.assignedBranchIds || currentDoc.assignedBranchIds;
      if (!assignedBranchIds.includes(primaryBranchId)) {
        assignedBranchIds = [primaryBranchId, ...assignedBranchIds];
      }
      if (isBranchesChanged) {
        await this.validateBranches(tenantId, assignedBranchIds, transaction);
      }

      // Read and Calculate Tax & Pricing
      let pricing = {
        basePriceHalalas: currentDoc.basePriceHalalas,
        taxMode: currentDoc.taxMode,
        taxRateBps: currentDoc.taxRateBps,
        netPriceHalalas: currentDoc.netPriceHalalas,
        calculatedTaxHalalas: currentDoc.calculatedTaxHalalas,
        totalPriceHalalas: currentDoc.totalPriceHalalas,
      };

      if (isPricingChanged) {
        const taxSettingsSnap = await transaction.get(this.db.doc(firestorePaths.taxSettings(tenantId)));
        const taxSettings = taxSettingsSnap.exists
          ? TaxSettingsDocSchema.parse(taxSettingsSnap.data())
          : null;

        const calcResult = calculateServicePricing(
          {
            basePriceHalalas: validated.basePriceHalalas ?? currentDoc.basePriceHalalas,
            taxMode: validated.taxMode ?? currentDoc.taxMode,
            customTaxRateBps:
              validated.customTaxRateBps !== undefined
                ? validated.customTaxRateBps
                : currentDoc.taxRateBps,
          },
          taxSettings
        );
        pricing = {
          basePriceHalalas: calcResult.basePriceHalalas,
          taxMode: calcResult.taxMode,
          taxRateBps: calcResult.taxRateBps,
          netPriceHalalas: calcResult.netPriceHalalas,
          calculatedTaxHalalas: calcResult.calculatedTaxHalalas,
          totalPriceHalalas: calcResult.totalPriceHalalas,
        };
      }

      // Read and Validate Providers
      const assignedProviderIds = validated.assignedProviderIds ?? currentDoc.assignedProviderIds;
      const oldProviders = currentDoc.assignedProviderIds || [];
      const newProviders = assignedProviderIds;
      const addedProviders = newProviders.filter((p) => !oldProviders.includes(p));
      const removedProviders = oldProviders.filter((p) => !newProviders.includes(p));
      const allRelevantProviderIds = Array.from(new Set([...assignedProviderIds, ...oldProviders]));

      const providerSnaps = new Map<string, any>();
      for (const pId of allRelevantProviderIds) {
        const pSnap = await transaction.get(this.db.doc(firestorePaths.provider(tenantId, pId)));
        providerSnaps.set(pId, pSnap);
      }

      if (isProvidersChanged || isBranchesChanged) {
        for (const pId of assignedProviderIds) {
          const pSnap = providerSnaps.get(pId);
          if (!pSnap || !pSnap.exists) {
            throw new Error(`مقدم الخدمة المحدد (${pId}) غير موجود`);
          }
          const provider = ProviderDocSchema.parse(pSnap.data());
          if (provider.tenantId !== tenantId) {
            throw new Error(`مقدم الخدمة (${provider.displayNameAr}) لا ينتمي لنفس المتجر`);
          }
          if (provider.status !== 'ACTIVE') {
            throw new Error(`مقدم الخدمة (${provider.displayNameAr}) غير مفعّل`);
          }
          const branchOverlap = provider.assignedBranchIds.some((bId) => assignedBranchIds.includes(bId));
          if (!branchOverlap) {
            throw new Error(
              `مقدم الخدمة (${provider.displayNameAr}) غير معيّن في أي من الفروع المتاحة لهذه الخدمة`
            );
          }
        }
      }

      // Read and Validate Commission Policy
      let commissionPolicyId = currentDoc.commissionPolicyId;
      if (isCommissionChanged) {
        if (validated.commissionPolicyId) {
          const policySnap = await transaction.get(
            this.db.doc(firestorePaths.commissionPolicy(tenantId, validated.commissionPolicyId))
          );
          if (!policySnap.exists) {
            throw new Error(`سياسة العمولة المحددة غير موجودة (${validated.commissionPolicyId})`);
          }
          const policy = CommissionPolicyDocSchema.parse(policySnap.data());
          validateCommissionPolicyAssociation(policy, tenantId);
          commissionPolicyId = validated.commissionPolicyId;
        } else {
          commissionPolicyId = null;
        }
      }

      const nowIso = new Date().toISOString();

      const updatedDoc: ServiceDoc = ServiceDocSchema.parse({
        ...currentDoc,
        categoryId,
        categoryNameAr,
        nameAr: validated.nameAr !== undefined ? validated.nameAr.trim() : currentDoc.nameAr,
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
        durationMinutes:
          validated.durationMinutes !== undefined
            ? validated.durationMinutes
            : currentDoc.durationMinutes,
        bufferBeforeMinutes:
          validated.bufferBeforeMinutes !== undefined
            ? validated.bufferBeforeMinutes
            : currentDoc.bufferBeforeMinutes,
        bufferAfterMinutes:
          validated.bufferAfterMinutes !== undefined
            ? validated.bufferAfterMinutes
            : currentDoc.bufferAfterMinutes,
        basePriceHalalas: pricing.basePriceHalalas,
        taxMode: pricing.taxMode,
        taxRateBps: pricing.taxRateBps,
        netPriceHalalas: pricing.netPriceHalalas,
        calculatedTaxHalalas: pricing.calculatedTaxHalalas,
        totalPriceHalalas: pricing.totalPriceHalalas,
        primaryBranchId,
        assignedBranchIds,
        assignedProviderIds,
        commissionPolicyId,
        resourceRequirement:
          validated.resourceRequirement !== undefined
            ? validated.resourceRequirement
            : currentDoc.resourceRequirement ?? 'OPTIONAL',
        allowedResourceTypes:
          validated.allowedResourceTypes !== undefined
            ? validated.allowedResourceTypes
            : currentDoc.allowedResourceTypes ?? [],
        displayOrder:
          validated.displayOrder !== undefined ? validated.displayOrder : currentDoc.displayOrder,
        isActive,
        updatedAt: nowIso,
        updatedBy: actorUid,

        // Compatibility fields
        name: validated.nameAr !== undefined ? validated.nameAr.trim() : currentDoc.nameAr,
        category: categoryNameAr,
        priceHalalas: pricing.totalPriceHalalas,
        status: isActive ? 'PUBLISHED' : 'DRAFT',
        isVisible: isActive,
      });

      let publicDoc: PublicCatalogService | null = null;
      if (isActive && targetCategory.isActive) {
        publicDoc = PublicCatalogServiceSchema.parse({
          id: updatedDoc.id,
          tenantId,
          categoryId: updatedDoc.categoryId,
          categoryNameAr: updatedDoc.categoryNameAr,
          nameAr: updatedDoc.nameAr,
          nameEn: updatedDoc.nameEn || undefined,
          descriptionAr: updatedDoc.descriptionAr || undefined,
          descriptionEn: updatedDoc.descriptionEn || undefined,
          imageUrl: updatedDoc.imageUrl || undefined,
          durationMinutes: updatedDoc.durationMinutes,
          totalPriceHalalas: updatedDoc.totalPriceHalalas,
          currency: 'SAR',
          taxMode: updatedDoc.taxMode,
          displayOrder: updatedDoc.displayOrder,
          status: 'PUBLISHED',
          isVisible: true,
          isActive: true as const,
          isArchived: false,
          isCategoryActive: true as const,
        });
      }

      // Determine audit operation type
      let operation: ServiceAuditRecord['operation'] = 'SERVICE_UPDATED';
      if (isPricingChanged && !isBranchesChanged && !isProvidersChanged) {
        operation = 'SERVICE_PRICING_CHANGED';
      } else if (isBranchesChanged) {
        operation = 'SERVICE_BRANCH_AVAILABILITY_CHANGED';
      } else if (isProvidersChanged) {
        operation = 'SERVICE_PROVIDER_ASSIGNMENT_CHANGED';
      } else if (isCommissionChanged) {
        operation = 'SERVICE_COMMISSION_POLICY_CHANGED';
      } else if (isStatusChanged) {
        operation = 'SERVICE_STATUS_CHANGED';
      }

      const auditRef = this.db.collection(firestorePaths.serviceAuditTrail(tenantId)).doc();
      const auditRecord: ServiceAuditRecord = ServiceAuditRecordSchema.parse({
        id: auditRef.id,
        tenantId,
        actorUid,
        entityType: 'SERVICE',
        entityId: serviceId,
        operation,
        details: { updatedFields: Object.keys(validated) },
        before: currentDoc as unknown as Record<string, unknown>,
        after: updatedDoc as unknown as Record<string, unknown>,
        timestamp: nowIso,
      });

      // 2. All Writes Follow All Reads
      transaction.set(docRef, updatedDoc);

      if (isProvidersChanged) {
        for (const pId of addedProviders) {
          const pRef = this.db.doc(firestorePaths.provider(tenantId, pId));
          transaction.update(pRef, {
            assignedServiceIds: FieldValue.arrayUnion(serviceId),
            updatedAt: nowIso,
          });
        }
        for (const pId of removedProviders) {
          const pSnap = providerSnaps.get(pId);
          if (pSnap && pSnap.exists) {
            const pRef = this.db.doc(firestorePaths.provider(tenantId, pId));
            transaction.update(pRef, {
              assignedServiceIds: FieldValue.arrayRemove(serviceId),
              updatedAt: nowIso,
            });
          }
        }
      }

      const publicRef = this.db.doc(firestorePaths.publicService(tenantId, serviceId));
      if (publicDoc) {
        transaction.set(publicRef, publicDoc);
      } else {
        transaction.delete(publicRef);
      }

      transaction.set(auditRef, auditRecord);

      return updatedDoc;
    });
  }

  /**
   * Sets service activation status.
   */
  async setServiceStatus(
    tenantId: string,
    serviceId: string,
    isActive: boolean,
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<ServiceDoc> {
    return this.updateService(
      tenantId,
      serviceId,
      { isActive },
      actorUid,
      actorRole,
      customPermissions
    );
  }

  /**
   * Deletes a service safely (soft-delete / archive policy):
   * Sets isActive = false, isArchived = true, removes public projection,
   * preserves historical record for future booking references, and logs audit.
   * Concurrency-safe: Runs in a Firestore transaction with pure read-before-write execution.
   */
  async deleteService(
    tenantId: string,
    serviceId: string,
    actorUid: string,
    actorRole: TenantRole = 'OWNER'
  ): Promise<void> {
    if (actorRole !== 'OWNER') {
      throw new Error('غير مصرح: حذف الخدمات مقتصر على مالك المنشأة (OWNER) فقط.');
    }

    await this.db.runTransaction(async (transaction: Transaction) => {
      // 1. All Reads First
      const docRef = this.db.doc(firestorePaths.service(tenantId, serviceId));
      const snap = await transaction.get(docRef);
      if (!snap.exists) {
        throw new Error(`الخدمة غير موجودة (${serviceId})`);
      }

      const currentDoc = ServiceDocSchema.parse(snap.data());
      if (currentDoc.tenantId !== tenantId) {
        throw new Error(`الخدمة لا تنتمي لهذا المتجر (${serviceId})`);
      }

      const assignedProviderIds = currentDoc.assignedProviderIds || [];
      const providerSnaps = new Map<string, any>();
      for (const pId of assignedProviderIds) {
        const pSnap = await transaction.get(this.db.doc(firestorePaths.provider(tenantId, pId)));
        providerSnaps.set(pId, pSnap);
      }

      const nowIso = new Date().toISOString();

      const archivedDoc: ServiceDoc = ServiceDocSchema.parse({
        ...currentDoc,
        isActive: false,
        isArchived: true,
        isVisible: false,
        status: 'ARCHIVED',
        updatedAt: nowIso,
        updatedBy: actorUid,
      });

      const auditRef = this.db.collection(firestorePaths.serviceAuditTrail(tenantId)).doc();
      const auditRecord: ServiceAuditRecord = ServiceAuditRecordSchema.parse({
        id: auditRef.id,
        tenantId,
        actorUid,
        entityType: 'SERVICE',
        entityId: serviceId,
        operation: 'SERVICE_DELETED',
        details: { nameAr: currentDoc.nameAr, policy: 'ARCHIVED_PRESERVE_HISTORY' },
        before: currentDoc as unknown as Record<string, unknown>,
        after: archivedDoc as unknown as Record<string, unknown>,
        timestamp: nowIso,
      });

      // 2. All Writes Follow All Reads
      transaction.set(docRef, archivedDoc);

      const publicRef = this.db.doc(firestorePaths.publicService(tenantId, serviceId));
      transaction.delete(publicRef);

      for (const pId of assignedProviderIds) {
        const pSnap = providerSnaps.get(pId);
        if (pSnap && pSnap.exists) {
          const pRef = this.db.doc(firestorePaths.provider(tenantId, pId));
          transaction.update(pRef, {
            assignedServiceIds: FieldValue.arrayRemove(serviceId),
            updatedAt: nowIso,
          });
        }
      }

      transaction.set(auditRef, auditRecord);
    });
  }

  /**
   * Assigns multiple providers to a service atomically.
   * Concurrency-safe: Runs in a Firestore transaction with pure read-before-write execution.
   */
  async assignProvidersToService(
    tenantId: string,
    serviceId: string,
    providerIds: string[],
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<ServiceDoc> {
    assertPermission(actorRole, 'services.manage_provider_assignments', customPermissions);

    return await this.db.runTransaction(async (transaction: Transaction) => {
      // 1. All Reads First
      const docRef = this.db.doc(firestorePaths.service(tenantId, serviceId));
      const snap = await transaction.get(docRef);
      if (!snap.exists) {
        throw new Error(`الخدمة غير موجودة (${serviceId})`);
      }

      const currentDoc = ServiceDocSchema.parse(snap.data());
      if (currentDoc.tenantId !== tenantId) {
        throw new Error(`الخدمة لا تنتمي لهذا المتجر (${serviceId})`);
      }

      const combined = Array.from(new Set([...currentDoc.assignedProviderIds, ...providerIds]));
      const newlyAdded = combined.filter((p) => !currentDoc.assignedProviderIds.includes(p));

      for (const pId of combined) {
        const pRef = this.db.doc(firestorePaths.provider(tenantId, pId));
        const pSnap = await transaction.get(pRef);
        if (!pSnap.exists) {
          throw new Error(`مقدم الخدمة المحدد (${pId}) غير موجود`);
        }
        const provider = ProviderDocSchema.parse(pSnap.data());
        if (provider.tenantId !== tenantId) {
          throw new Error(`مقدم الخدمة (${provider.displayNameAr}) لا ينتمي لنفس المتجر`);
        }
        if (provider.status !== 'ACTIVE') {
          throw new Error(`مقدم الخدمة (${provider.displayNameAr}) غير مفعّل`);
        }
        const branchOverlap = provider.assignedBranchIds.some((bId) =>
          currentDoc.assignedBranchIds.includes(bId)
        );
        if (!branchOverlap) {
          throw new Error(
            `مقدم الخدمة (${provider.displayNameAr}) غير معيّن في أي من الفروع المتاحة لهذه الخدمة`
          );
        }
      }

      const nowIso = new Date().toISOString();
      const updatedDoc: ServiceDoc = ServiceDocSchema.parse({
        ...currentDoc,
        assignedProviderIds: combined,
        updatedAt: nowIso,
        updatedBy: actorUid,
      });

      const auditRef = this.db.collection(firestorePaths.serviceAuditTrail(tenantId)).doc();
      const auditRecord: ServiceAuditRecord = ServiceAuditRecordSchema.parse({
        id: auditRef.id,
        tenantId,
        actorUid,
        entityType: 'SERVICE',
        entityId: serviceId,
        operation: 'SERVICE_PROVIDER_ASSIGNMENT_CHANGED',
        details: { newlyAdded, totalProviders: combined.length },
        before: currentDoc as unknown as Record<string, unknown>,
        after: updatedDoc as unknown as Record<string, unknown>,
        timestamp: nowIso,
      });

      // 2. All Writes Follow All Reads
      transaction.set(docRef, updatedDoc);

      for (const pId of newlyAdded) {
        const pRef = this.db.doc(firestorePaths.provider(tenantId, pId));
        transaction.update(pRef, {
          assignedServiceIds: FieldValue.arrayUnion(serviceId),
          updatedAt: nowIso,
        });
      }

      transaction.set(auditRef, auditRecord);

      return updatedDoc;
    });
  }

  /**
   * Removes a provider assignment from a service safely.
   * Concurrency-safe: Runs in a Firestore transaction with pure read-before-write execution.
   */
  async removeProviderFromService(
    tenantId: string,
    serviceId: string,
    providerId: string,
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<ServiceDoc> {
    assertPermission(actorRole, 'services.manage_provider_assignments', customPermissions);

    return await this.db.runTransaction(async (transaction: Transaction) => {
      // 1. All Reads First
      const docRef = this.db.doc(firestorePaths.service(tenantId, serviceId));
      const snap = await transaction.get(docRef);
      if (!snap.exists) {
        throw new Error(`الخدمة غير موجودة (${serviceId})`);
      }

      const currentDoc = ServiceDocSchema.parse(snap.data());
      if (currentDoc.tenantId !== tenantId) {
        throw new Error(`الخدمة لا تنتمي لهذا المتجر (${serviceId})`);
      }

      const pRef = this.db.doc(firestorePaths.provider(tenantId, providerId));
      const pSnap = await transaction.get(pRef);

      const filtered = currentDoc.assignedProviderIds.filter((p) => p !== providerId);
      const nowIso = new Date().toISOString();

      const updatedDoc: ServiceDoc = ServiceDocSchema.parse({
        ...currentDoc,
        assignedProviderIds: filtered,
        updatedAt: nowIso,
        updatedBy: actorUid,
      });

      const auditRef = this.db.collection(firestorePaths.serviceAuditTrail(tenantId)).doc();
      const auditRecord: ServiceAuditRecord = ServiceAuditRecordSchema.parse({
        id: auditRef.id,
        tenantId,
        actorUid,
        entityType: 'SERVICE',
        entityId: serviceId,
        operation: 'SERVICE_PROVIDER_ASSIGNMENT_CHANGED',
        details: { removedProviderId: providerId, remainingProviders: filtered.length },
        before: currentDoc as unknown as Record<string, unknown>,
        after: updatedDoc as unknown as Record<string, unknown>,
        timestamp: nowIso,
      });

      // 2. All Writes Follow All Reads
      transaction.set(docRef, updatedDoc);

      if (pSnap.exists) {
        transaction.update(pRef, {
          assignedServiceIds: FieldValue.arrayRemove(serviceId),
          updatedAt: nowIso,
        });
      }

      transaction.set(auditRef, auditRecord);

      return updatedDoc;
    });
  }

  /**
   * Lists all operational providers assigned to a service.
   */
  async listProvidersForService(
    tenantId: string,
    serviceId: string
  ): Promise<ProviderDoc[]> {
    const service = await this.getServiceById(tenantId, serviceId);
    if (!service || !service.assignedProviderIds || service.assignedProviderIds.length === 0) {
      return [];
    }

    const providers: ProviderDoc[] = [];
    for (const pId of service.assignedProviderIds) {
      const snap = await this.db.doc(firestorePaths.provider(tenantId, pId)).get();
      if (snap.exists) {
        providers.push(ProviderDocSchema.parse(snap.data()));
      }
    }

    return providers;
  }

  /**
   * Lists sanitized public providers assigned to a service (for customer booking UI).
   */
  async listPublicProvidersForService(
    tenantId: string,
    serviceId: string
  ): Promise<PublicProviderDoc[]> {
    const providers = await this.listProvidersForService(tenantId, serviceId);
    return providers
      .filter((p) => p.status === 'ACTIVE' && p.isPubliclyVisible)
      .map((p) =>
        PublicProviderDocSchema.parse({
          id: p.id,
          tenantId: p.tenantId,
          providerId: p.id,
          displayNameAr: p.displayNameAr,
          displayNameEn: p.displayNameEn || undefined,
          bioAr: p.bioAr || undefined,
          bioEn: p.bioEn || undefined,
          photoUrl: p.photoUrl || undefined,
          specialties: p.specialties,
          displayOrder: p.displayOrder,
          yearsOfExperience: p.yearsOfExperience || undefined,
          isPubliclyVisible: true,
          updatedAt: p.updatedAt,
        })
      );
  }

  /**
   * Lists all services available at a specific branch.
   */
  async listServicesForBranch(
    tenantId: string,
    branchId: string,
    onlyActive = true
  ): Promise<ServiceDoc[]> {
    return this.listServices(tenantId, { branchId, isActive: onlyActive ? true : undefined });
  }

  /**
   * Associates a commission policy with a service (restricted to OWNER or explicitly granted).
   */
  async associateCommissionPolicy(
    tenantId: string,
    serviceId: string,
    commissionPolicyId: string | null,
    actorUid: string,
    actorRole: TenantRole = 'OWNER',
    customPermissions?: readonly string[] | null
  ): Promise<ServiceDoc> {
    return this.updateService(
      tenantId,
      serviceId,
      { commissionPolicyId },
      actorUid,
      actorRole,
      customPermissions
    );
  }
}

