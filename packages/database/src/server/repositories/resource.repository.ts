import 'server-only';
import type { Firestore, Transaction } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  ResourceDocSchema,
  CreateResourceInputSchema,
  UpdateResourceInputSchema,
  ResourceSlotLockDocSchema,
  isResourceEligibleForService,
  type ResourceDoc,
  type CreateResourceInput,
  type UpdateResourceInput,
  type ResourceStatus,
  type ResourceType,
} from '../../resource.schema';
import { BranchDocSchema } from '../../branch.schema';
import { ServiceDocSchema } from '../../service.schema';
import { hasPermission, type TenantRole } from '../../permissions';
import { generateResourceSlotLockIds, utcIsoToRiyadhTime } from '../../availability.types';
import { TrustedSystemContext } from './trusted-context';

export enum ResourceErrorCode {
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BRANCH_FORBIDDEN = 'BRANCH_FORBIDDEN',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND',
  BRANCH_INACTIVE = 'BRANCH_INACTIVE',
  SERVICE_NOT_FOUND = 'SERVICE_NOT_FOUND',
}

export class ResourceError extends Error {
  constructor(
    public readonly code: ResourceErrorCode,
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ResourceError';
  }
}

export type ResourceActor =
  | TrustedSystemContext
  | {
      uid: string;
      role: TenantRole;
      customPermissions?: readonly string[] | null;
      assignedBranchIds?: readonly string[] | null;
      isPlatformAdmin?: boolean;
    };

export interface ResourceListFilters {
  branchId?: string;
  status?: ResourceStatus;
  type?: ResourceType;
}

export interface EligibleResourceAvailability extends ResourceDoc {
  isAvailableForWindow: boolean;
}

export class ResourceRepository {
  constructor(private readonly firestore: Firestore = getFirebaseAdminFirestore()) {}

  private verifyPermission(
    actor: ResourceActor,
    capability: Parameters<typeof hasPermission>[1]
  ): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin) return;
    if (!hasPermission(actor.role, capability, actor.customPermissions)) {
      throw new ResourceError(
        ResourceErrorCode.FORBIDDEN,
        `غير مصرح: لا تملك الصلاحية المطلوبة (${capability}) لإدارة أو عرض الموارد.`
      );
    }
  }

  private verifyBranchAccess(actor: ResourceActor, branchId: string): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin) return;
    if (actor.role === 'OWNER') return;
    if (actor.assignedBranchIds && actor.assignedBranchIds.length > 0) {
      if (!actor.assignedBranchIds.includes(branchId)) {
        throw new ResourceError(
          ResourceErrorCode.BRANCH_FORBIDDEN,
          'غير مصرح: لا تملك صلاحية الوصول إلى موارد هذا الفرع.'
        );
      }
    }
  }

  private getActorUid(actor: ResourceActor): string {
    if (TrustedSystemContext.isTrusted(actor)) return 'SYSTEM';
    if (actor.isPlatformAdmin) return 'PLATFORM_ADMIN';
    return actor.uid;
  }

  /**
   * Creates a configurable salon resource (chair, treatment room, wash station, etc.)
   * strictly bound to one tenant and one branch.
   */
  async createResource(actor: ResourceActor, rawInput: CreateResourceInput): Promise<ResourceDoc> {
    this.verifyPermission(actor, 'resources.manage');

    const parseResult = CreateResourceInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new ResourceError(
        ResourceErrorCode.INVALID_PAYLOAD,
        `بيانات إنشاء المورد غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    this.verifyBranchAccess(actor, input.branchId);

    const tenantId = input.tenantId;
    const actorUid = this.getActorUid(actor);
    const resourceId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const branchRef = this.firestore.doc(firestorePaths.branch(tenantId, input.branchId));
      const branchSnap = await transaction.get(branchRef);
      if (!branchSnap.exists) {
        throw new ResourceError(ResourceErrorCode.BRANCH_NOT_FOUND, 'الفرع المحدد غير موجود.');
      }
      const branch = BranchDocSchema.parse(branchSnap.data());
      if (branch.tenantId !== tenantId) {
        throw new ResourceError(ResourceErrorCode.FORBIDDEN, 'الفرع المحدد لا يتبع لهذه المنشأة.');
      }
      if (!branch.isActive) {
        throw new ResourceError(ResourceErrorCode.BRANCH_INACTIVE, 'لا يمكن إضافة مورد لفرع غير نشط.');
      }

      const uniqueServiceIds = Array.from(new Set(input.supportedServiceIds || []));
      for (const sId of uniqueServiceIds) {
        const sSnap = await transaction.get(this.firestore.doc(firestorePaths.service(tenantId, sId)));
        if (!sSnap.exists) {
          throw new ResourceError(
            ResourceErrorCode.SERVICE_NOT_FOUND,
            `الخدمة المحددة (${sId}) غير موجودة في المنشأة.`
          );
        }
      }

      const resourceDoc = ResourceDocSchema.parse({
        id: resourceId,
        tenantId,
        branchId: input.branchId,
        nameAr: input.nameAr.trim(),
        nameEn: input.nameEn?.trim() || '',
        code: input.code?.trim() || '',
        type: input.type,
        status: input.status || 'ACTIVE',
        supportsAllBranchServices: input.supportsAllBranchServices ?? false,
        supportedServiceIds: uniqueServiceIds,
        supportedCategoryIds: Array.from(new Set(input.supportedCategoryIds || [])),
        description: input.description?.trim() || '',
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: actorUid,
        updatedBy: actorUid,
      });

      const auditId = `audit_res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, auditId));

      transaction.set(this.firestore.doc(firestorePaths.resource(tenantId, resourceId)), resourceDoc);
      transaction.set(auditRef, {
        id: auditId,
        tenantId,
        branchId: input.branchId,
        actorUid,
        entityType: 'RESOURCE',
        entityId: resourceId,
        action: 'RESOURCE_CREATED',
        afterValues: {
          nameAr: resourceDoc.nameAr,
          type: resourceDoc.type,
          status: resourceDoc.status,
          branchId: resourceDoc.branchId,
        },
        timestamp: nowIso,
      });

      return resourceDoc;
    });
  }

  /**
   * Updates resource configuration without altering historical bookings or cancelling active reservations.
   */
  async updateResource(
    actor: ResourceActor,
    tenantId: string,
    resourceId: string,
    rawInput: UpdateResourceInput
  ): Promise<ResourceDoc> {
    this.verifyPermission(actor, 'resources.manage');

    const parseResult = UpdateResourceInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new ResourceError(
        ResourceErrorCode.INVALID_PAYLOAD,
        `بيانات تحديث المورد غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    const actorUid = this.getActorUid(actor);
    const nowIso = new Date().toISOString();

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const resRef = this.firestore.doc(firestorePaths.resource(tenantId, resourceId));
      const snap = await transaction.get(resRef);
      if (!snap.exists) {
        throw new ResourceError(ResourceErrorCode.RESOURCE_NOT_FOUND, 'المورد المطلوب غير موجود.');
      }
      const existing = ResourceDocSchema.parse(snap.data());
      if (existing.tenantId !== tenantId) {
        throw new ResourceError(ResourceErrorCode.FORBIDDEN, 'المورد لا يتبع لهذه المنشأة.');
      }
      this.verifyBranchAccess(actor, existing.branchId);

      const nextServiceIds =
        input.supportedServiceIds !== undefined
          ? Array.from(new Set(input.supportedServiceIds))
          : existing.supportedServiceIds;

      if (input.supportedServiceIds !== undefined) {
        for (const sId of nextServiceIds) {
          const sSnap = await transaction.get(this.firestore.doc(firestorePaths.service(tenantId, sId)));
          if (!sSnap.exists) {
            throw new ResourceError(
              ResourceErrorCode.SERVICE_NOT_FOUND,
              `الخدمة المحددة (${sId}) غير موجودة في المنشأة.`
            );
          }
        }
      }

      const updated = ResourceDocSchema.parse({
        ...existing,
        nameAr: input.nameAr !== undefined ? input.nameAr.trim() : existing.nameAr,
        nameEn: input.nameEn !== undefined ? input.nameEn.trim() : existing.nameEn,
        code: input.code !== undefined ? input.code.trim() : existing.code,
        type: input.type !== undefined ? input.type : existing.type,
        status: input.status !== undefined ? input.status : existing.status,
        supportsAllBranchServices:
          input.supportsAllBranchServices !== undefined
            ? input.supportsAllBranchServices
            : existing.supportsAllBranchServices,
        supportedServiceIds: nextServiceIds,
        supportedCategoryIds:
          input.supportedCategoryIds !== undefined
            ? Array.from(new Set(input.supportedCategoryIds))
            : existing.supportedCategoryIds,
        description: input.description !== undefined ? input.description.trim() : existing.description,
        updatedAt: nowIso,
        updatedBy: actorUid,
      });

      const statusChanged = existing.status !== updated.status;
      const auditId = `audit_res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, auditId));

      transaction.set(resRef, updated);
      transaction.set(auditRef, {
        id: auditId,
        tenantId,
        branchId: existing.branchId,
        actorUid,
        entityType: 'RESOURCE',
        entityId: resourceId,
        action: statusChanged ? 'RESOURCE_STATUS_CHANGED' : 'RESOURCE_UPDATED',
        beforeValues: {
          nameAr: existing.nameAr,
          status: existing.status,
          type: existing.type,
        },
        afterValues: {
          nameAr: updated.nameAr,
          status: updated.status,
          type: updated.type,
        },
        timestamp: nowIso,
      });

      return updated;
    });
  }

  /**
   * Explicitly changes resource operational status (ACTIVE / INACTIVE / MAINTENANCE).
   * Preserves all historical and active booking assignments without silent mutation.
   */
  async changeResourceStatus(
    actor: ResourceActor,
    tenantId: string,
    resourceId: string,
    status: ResourceStatus
  ): Promise<ResourceDoc> {
    return this.updateResource(actor, tenantId, resourceId, { status });
  }

  async getResourceById(
    actor: ResourceActor,
    tenantId: string,
    resourceId: string
  ): Promise<ResourceDoc | null> {
    this.verifyPermission(actor, 'resources.read');

    const snap = await this.firestore.doc(firestorePaths.resource(tenantId, resourceId)).get();
    if (!snap.exists) return null;

    const doc = ResourceDocSchema.parse(snap.data());
    if (doc.tenantId !== tenantId) {
      throw new ResourceError(ResourceErrorCode.FORBIDDEN, 'المورد لا يتبع لهذه المنشأة.');
    }
    this.verifyBranchAccess(actor, doc.branchId);
    return doc;
  }

  async listResources(
    actor: ResourceActor,
    tenantId: string,
    filters: ResourceListFilters = {}
  ): Promise<ResourceDoc[]> {
    this.verifyPermission(actor, 'resources.read');

    if (filters.branchId) {
      this.verifyBranchAccess(actor, filters.branchId);
    }

    let query: any = this.firestore.collection(firestorePaths.resources(tenantId));
    if (filters.branchId) {
      query = query.where('branchId', '==', filters.branchId);
    }
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }

    const snap = await query.get();
    let resources: ResourceDoc[] = snap.docs.map((d: any) => ResourceDocSchema.parse(d.data()));

    // Enforce actor branch scoping if restricted
    if (
      !TrustedSystemContext.isTrusted(actor) &&
      !actor.isPlatformAdmin &&
      actor.role !== 'OWNER' &&
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0
    ) {
      const allowedBranches = new Set(actor.assignedBranchIds);
      resources = resources.filter((r) => allowedBranches.has(r.branchId));
    }

    resources.sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));
    return resources;
  }

  /**
   * Returns active branch resources eligible for a service, along with real-time slot lock availability
   * when a UTC time window is supplied.
   */
  async listEligibleResourcesForService(
    actor: ResourceActor,
    tenantId: string,
    branchId: string,
    serviceId: string,
    window?: { startTimeIso: string; endTimeIso: string; ignoreBookingId?: string }
  ): Promise<EligibleResourceAvailability[]> {
    this.verifyPermission(actor, 'resources.read');
    this.verifyBranchAccess(actor, branchId);

    const serviceSnap = await this.firestore.doc(firestorePaths.service(tenantId, serviceId)).get();
    if (!serviceSnap.exists) {
      throw new ResourceError(ResourceErrorCode.SERVICE_NOT_FOUND, 'الخدمة غير موجودة.');
    }
    const service = ServiceDocSchema.parse(serviceSnap.data());

    const resources = await this.listResources(actor, tenantId, {
      branchId,
      status: 'ACTIVE',
    });

    const eligible = resources.filter((res) => isResourceEligibleForService(res, service).eligible);

    if (!window) {
      return eligible.map((r) => ({ ...r, isAvailableForWindow: true }));
    }

    const blockStartIso = new Date(
      new Date(window.startTimeIso).getTime() - service.bufferBeforeMinutes * 60 * 1000
    ).toISOString();
    const blockEndIso = new Date(
      new Date(window.endTimeIso).getTime() + service.bufferAfterMinutes * 60 * 1000
    ).toISOString();

    const { date } = utcIsoToRiyadhTime(blockStartIso);
    const locksSnap = await this.firestore
      .collection(firestorePaths.resourceSlotLocks(tenantId))
      .where('date', '==', date)
      .where('status', '==', 'LOCKED')
      .get();

    const lockedSetByResource = new Map<string, Set<string>>();
    for (const d of locksSnap.docs) {
      const lock = ResourceSlotLockDocSchema.parse(d.data());
      if (window.ignoreBookingId && lock.bookingId === window.ignoreBookingId) {
        continue;
      }
      let set = lockedSetByResource.get(lock.resourceId);
      if (!set) {
        set = new Set<string>();
        lockedSetByResource.set(lock.resourceId, set);
      }
      set.add(lock.id);
    }

    return eligible.map((res) => {
      const { lockIds } = generateResourceSlotLockIds(res.id, blockStartIso, blockEndIso);
      const resLocks = lockedSetByResource.get(res.id);
      const conflict = resLocks ? lockIds.some((lid) => resLocks.has(lid)) : false;
      return {
        ...res,
        isAvailableForWindow: !conflict,
      };
    });
  }
}

