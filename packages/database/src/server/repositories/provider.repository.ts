import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  ProviderDocSchema,
  PublicProviderDocSchema,
  CreateProviderInputSchema,
  UpdateProviderInputSchema,
  type ProviderDoc,
  type PublicProviderDoc,
  type CreateProviderInput,
  type UpdateProviderInput,
  type ProviderStatus,
} from '../../provider.schema';
import { EmployeeDocSchema } from '../../employee.schema';
import { BranchDocSchema } from '../../branch.schema';
import { HrAuditRecordSchema, type HrAuditRecord } from '../../hr-audit.schema';

export interface ProviderListOptions {
  branchId?: string;
  status?: ProviderStatus;
  serviceId?: string;
}

export class ProviderRepository {
  private readonly db: Firestore;

  constructor(firestore?: Firestore) {
    this.db = firestore || getFirebaseAdminFirestore();
  }

  /**
   * Helper to write an immutable HR audit record.
   */
  private async logHrAudit(
    tenantId: string,
    action: HrAuditRecord['action'],
    entityId: string,
    actorUid: string,
    details: Record<string, unknown>
  ): Promise<void> {
    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const nowIso = new Date().toISOString();
    const record: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action,
      entityType: 'PROVIDER',
      entityId,
      actorUid,
      details,
      timestamp: nowIso,
    });
    await this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)).set(record);
  }

  /**
   * Validates that all branch IDs exist and belong to the specified tenant.
   */
  private async validateBranches(tenantId: string, branchIds: string[]): Promise<void> {
    for (const branchId of branchIds) {
      const snap = await this.db.doc(firestorePaths.branch(tenantId, branchId)).get();
      if (!snap.exists) {
        throw new Error(`الفرع المحدد (${branchId}) غير موجود في هذه المنشأة.`);
      }
      const branch = BranchDocSchema.parse(snap.data());
      if (branch.tenantId !== tenantId) {
        throw new Error('محاولة تعيين فرع يتبع منشأة أخرى محظورة.');
      }
    }
  }

  /**
   * Builds the sanitized public projection of a service provider document.
   * Strictly excludes employeeId, tenant-internal branch IDs, internal commission policies, and private operational data.
   */
  private buildPublicProjection(provider: ProviderDoc): PublicProviderDoc {
    return PublicProviderDocSchema.parse({
      id: provider.id,
      tenantId: provider.tenantId,
      providerId: provider.id,
      displayNameAr: provider.displayNameAr,
      displayNameEn: provider.displayNameEn,
      bioAr: provider.bioAr,
      bioEn: provider.bioEn,
      photoUrl: provider.photoUrl,
      specialties: provider.specialties || [],
      displayOrder: provider.displayOrder || 0,
      yearsOfExperience: provider.yearsOfExperience,
      isPubliclyVisible: provider.status === 'ACTIVE' && provider.isPubliclyVisible,
      updatedAt: provider.updatedAt,
    });
  }

  /**
   * Creates a service provider profile linked to an existing employee.
   */
  async createProvider(
    tenantId: string,
    input: unknown,
    actorUid: string
  ): Promise<ProviderDoc> {
    const parsed = CreateProviderInputSchema.parse(input);
    const nowIso = new Date().toISOString();

    // 1. Verify employee exists and belongs to this tenant
    const empSnap = await this.db.doc(firestorePaths.employee(tenantId, parsed.employeeId)).get();
    if (!empSnap.exists) {
      throw new Error(`الموظف المحدد (${parsed.employeeId}) غير موجود في هذه المنشأة.`);
    }
    const employee = EmployeeDocSchema.parse(empSnap.data());
    if (employee.tenantId !== tenantId) {
      throw new Error('محاولة ربط مقدم خدمة بموظف من منشأة أخرى محظورة.');
    }

    // 2. Validate Branches
    await this.validateBranches(tenantId, parsed.assignedBranchIds);

    // 3. Ensure employee does not already have a provider profile
    const existingProvSnap = await this.db
      .collection(firestorePaths.providers(tenantId))
      .where('employeeId', '==', parsed.employeeId)
      .limit(1)
      .get();

    if (!existingProvSnap.empty) {
      throw new Error('يوجد ملف مقدم خدمة مسجل مسبقاً لهذا الموظف.');
    }

    const providerId = this.db.collection(firestorePaths.providers(tenantId)).doc().id;
    const providerDoc: ProviderDoc = ProviderDocSchema.parse({
      ...parsed,
      id: providerId,
      tenantId,
      status: 'ACTIVE',
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    const publicProjection = this.buildPublicProjection(providerDoc);

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'PROVIDER_CREATED',
      entityType: 'PROVIDER',
      entityId: providerId,
      actorUid,
      details: {
        employeeId: parsed.employeeId,
        displayNameAr: providerDoc.displayNameAr,
        assignedBranchesCount: providerDoc.assignedBranchIds.length,
      },
      timestamp: nowIso,
    });

    // Write provider, public projection, employee flag, and HR audit trail atomically in one batch
    const batch = this.db.batch();
    batch.set(this.db.doc(firestorePaths.provider(tenantId, providerId)), providerDoc);
    batch.set(this.db.doc(firestorePaths.publicProvider(tenantId, providerId)), publicProjection);
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    batch.update(this.db.doc(firestorePaths.employee(tenantId, parsed.employeeId)), {
      isProvider: true,
      updatedAt: nowIso,
    });
    await batch.commit();

    return providerDoc;
  }

  /**
   * Retrieves a Provider by ID.
   */
  async getProviderById(tenantId: string, providerId: string): Promise<ProviderDoc | null> {
    const snap = await this.db.doc(firestorePaths.provider(tenantId, providerId)).get();
    if (!snap.exists) {
      return null;
    }
    const data = snap.data();
    if (data?.tenantId !== tenantId) {
      return null;
    }
    return ProviderDocSchema.parse(data);
  }

  /**
   * Retrieves a Provider by Employee ID.
   */
  async getProviderByEmployeeId(tenantId: string, employeeId: string): Promise<ProviderDoc | null> {
    const snap = await this.db
      .collection(firestorePaths.providers(tenantId))
      .where('employeeId', '==', employeeId)
      .limit(1)
      .get();

    if (snap.empty || !snap.docs[0]) {
      return null;
    }
    return ProviderDocSchema.parse(snap.docs[0].data());
  }

  /**
   * Lists providers with optional branch and status filtering.
   */
  async listProviders(tenantId: string, options?: ProviderListOptions): Promise<ProviderDoc[]> {
    const snap = await this.db.collection(firestorePaths.providers(tenantId)).get();
    let providers = snap.docs
      .map((d) => ProviderDocSchema.parse(d.data()))
      .filter((p) => p.tenantId === tenantId);

    if (options?.branchId) {
      providers = providers.filter((p) => p.assignedBranchIds.includes(options.branchId!));
    }

    if (options?.status) {
      providers = providers.filter((p) => p.status === options.status);
    }

    if (options?.serviceId) {
      providers = providers.filter((p) => p.assignedServiceIds.includes(options.serviceId!));
    }

    // Sort by displayOrder ascending, then displayNameAr
    providers.sort((a, b) => a.displayOrder - b.displayOrder || a.displayNameAr.localeCompare(b.displayNameAr));

    return providers;
  }

  /**
   * Updates an existing Service Provider profile.
   */
  async updateProvider(
    tenantId: string,
    providerId: string,
    input: unknown,
    actorUid: string
  ): Promise<ProviderDoc> {
    const current = await this.getProviderById(tenantId, providerId);
    if (!current) {
      throw new Error(`مقدم الخدمة المطلوب (${providerId}) غير موجود.`);
    }

    const parsed = UpdateProviderInputSchema.parse(input);
    const nowIso = new Date().toISOString();

    if (parsed.assignedBranchIds) {
      await this.validateBranches(tenantId, parsed.assignedBranchIds);
    }

    const updated: ProviderDoc = ProviderDocSchema.parse({
      ...current,
      ...parsed,
      id: providerId,
      tenantId,
      updatedAt: nowIso,
    });

    const publicProjection = this.buildPublicProjection(updated);

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'PROVIDER_UPDATED',
      entityType: 'PROVIDER',
      entityId: providerId,
      actorUid,
      details: {
        updatedFields: Object.keys(parsed),
      },
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.set(this.db.doc(firestorePaths.provider(tenantId, providerId)), updated);
    batch.set(this.db.doc(firestorePaths.publicProvider(tenantId, providerId)), publicProjection);
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    await batch.commit();

    return updated;
  }

  /**
   * Assigns eligible salon services to a provider.
   */
  async assignServices(
    tenantId: string,
    providerId: string,
    serviceIds: string[],
    actorUid: string
  ): Promise<ProviderDoc> {
    const current = await this.getProviderById(tenantId, providerId);
    if (!current) {
      throw new Error(`مقدم الخدمة المطلوب (${providerId}) غير موجود.`);
    }

    const nowIso = new Date().toISOString();
    const updated: ProviderDoc = ProviderDocSchema.parse({
      ...current,
      assignedServiceIds: Array.from(new Set(serviceIds)),
      updatedAt: nowIso,
    });

    const publicProjection = this.buildPublicProjection(updated);

    const auditId = this.db.collection(firestorePaths.hrAuditTrail(tenantId)).doc().id;
    const auditRecord: HrAuditRecord = HrAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'PROVIDER_UPDATED',
      entityType: 'PROVIDER',
      entityId: providerId,
      actorUid,
      details: {
        assignedServiceIdsCount: updated.assignedServiceIds.length,
      },
      timestamp: nowIso,
    });

    const batch = this.db.batch();
    batch.set(this.db.doc(firestorePaths.provider(tenantId, providerId)), updated);
    batch.set(this.db.doc(firestorePaths.publicProvider(tenantId, providerId)), publicProjection);
    batch.set(this.db.doc(firestorePaths.hrAuditRecord(tenantId, auditId)), auditRecord);
    await batch.commit();

    return updated;
  }

  /**
   * Retrieves a sanitized public provider projection by provider ID.
   * Safe for anonymous visitors.
   */
  async getPublicProvider(tenantId: string, providerId: string): Promise<PublicProviderDoc | null> {
    const snap = await this.db.doc(firestorePaths.publicProvider(tenantId, providerId)).get();
    if (!snap.exists) {
      return null;
    }
    const data = snap.data();
    if (data?.tenantId !== tenantId) {
      return null;
    }
    const parsed = PublicProviderDocSchema.parse(data);
    if (!parsed.isPubliclyVisible) {
      return null;
    }
    return parsed;
  }

  /**
   * Lists publicly visible providers for customer-facing discovery.
   * Strictly filters by isPubliclyVisible == true.
   */
  async listPublicProviders(tenantId: string): Promise<PublicProviderDoc[]> {
    const snap = await this.db.collection(firestorePaths.publicProviders(tenantId)).get();
    const providers = snap.docs
      .map((d) => PublicProviderDocSchema.parse(d.data()))
      .filter((p) => p.tenantId === tenantId && p.isPubliclyVisible);

    providers.sort((a, b) => a.displayOrder - b.displayOrder || a.displayNameAr.localeCompare(b.displayNameAr));
    return providers;
  }
}

