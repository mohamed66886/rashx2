import { z } from 'zod';

/**
 * Supported configurable salon resource types.
 */
export const ResourceTypeEnum = z.enum([
  'BARBER_CHAIR',
  'STYLING_CHAIR',
  'WASH_STATION',
  'TREATMENT_ROOM',
  'NAIL_STATION',
  'VIP_SUITE',
  'GENERAL_STATION',
]);
export type ResourceType = z.infer<typeof ResourceTypeEnum>;

export const RESOURCE_TYPE_LABELS_AR: Record<ResourceType, string> = {
  BARBER_CHAIR: 'كرسي حلاقة',
  STYLING_CHAIR: 'كرسي تصفيف',
  WASH_STATION: 'محطة غسيل شعر',
  TREATMENT_ROOM: 'غرفة عناية / علاج',
  NAIL_STATION: 'محطة أظافر',
  VIP_SUITE: 'جناح VIP',
  GENERAL_STATION: 'محطة خدمة عامة',
};

/**
 * Resource operational statuses.
 * INACTIVE or MAINTENANCE resources cannot receive new booking assignments.
 */
export const ResourceStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']);
export type ResourceStatus = z.infer<typeof ResourceStatusEnum>;

export const RESOURCE_STATUS_LABELS_AR: Record<ResourceStatus, string> = {
  ACTIVE: 'نشط ومتاح',
  INACTIVE: 'غير نشط',
  MAINTENANCE: 'قيد الصيانة',
};

/**
 * Service-level resource requirement configuration.
 */
export const ServiceResourceRequirementEnum = z.enum(['NONE', 'OPTIONAL', 'REQUIRED']);
export type ServiceResourceRequirement = z.infer<typeof ServiceResourceRequirementEnum>;

/**
 * Configurable Salon Resource Document (`/tenants/{tenantId}/resources/{resourceId}`).
 * Strictly scoped to one tenant and one branch.
 */
export const ResourceDocSchema = z
  .object({
    id: z.string().min(1, 'معرف المورد مطلوب'),
    tenantId: z.string().min(1, 'معرف المنشأة مطلوب'),
    branchId: z.string().min(1, 'معرف الفرع مطلوب'),
    nameAr: z.string().min(1, 'اسم المورد بالعربية مطلوب').max(100),
    nameEn: z.string().max(100).optional().default(''),
    code: z.string().max(30).optional().default(''),
    type: ResourceTypeEnum,
    status: ResourceStatusEnum.default('ACTIVE'),
    supportsAllBranchServices: z.boolean().default(false),
    supportedServiceIds: z.array(z.string().min(1)).default([]),
    supportedCategoryIds: z.array(z.string().min(1)).default([]),
    description: z.string().max(500).optional().default(''),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
    createdBy: z.string().min(1, 'معرف المنشئ مطلوب'),
    updatedBy: z.string().min(1, 'معرف المحدث مطلوب'),
  })
  .strict();

export type ResourceDoc = z.infer<typeof ResourceDocSchema>;

/**
 * Input Schema for creating a configurable Resource.
 */
export const CreateResourceInputSchema = z
  .object({
    tenantId: z.string().min(1, 'معرف المنشأة مطلوب'),
    branchId: z.string().min(1, 'معرف الفرع مطلوب'),
    nameAr: z.string().min(1, 'اسم المورد بالعربية مطلوب').max(100),
    nameEn: z.string().max(100).optional().default(''),
    code: z.string().max(30).optional().default(''),
    type: ResourceTypeEnum,
    status: ResourceStatusEnum.optional().default('ACTIVE'),
    supportsAllBranchServices: z.boolean().optional().default(false),
    supportedServiceIds: z.array(z.string().min(1)).optional().default([]),
    supportedCategoryIds: z.array(z.string().min(1)).optional().default([]),
    description: z.string().max(500).optional().default(''),
  })
  .strict();

export type CreateResourceInput = z.input<typeof CreateResourceInputSchema>;

/**
 * Input Schema for updating an existing Resource.
 */
export const UpdateResourceInputSchema = z
  .object({
    nameAr: z.string().min(1, 'اسم المورد بالعربية مطلوب').max(100).optional(),
    nameEn: z.string().max(100).optional(),
    code: z.string().max(30).optional(),
    type: ResourceTypeEnum.optional(),
    status: ResourceStatusEnum.optional(),
    supportsAllBranchServices: z.boolean().optional(),
    supportedServiceIds: z.array(z.string().min(1)).optional(),
    supportedCategoryIds: z.array(z.string().min(1)).optional(),
    description: z.string().max(500).optional(),
  })
  .strict();

export type UpdateResourceInput = z.input<typeof UpdateResourceInputSchema>;

/**
 * Deterministic Resource Slot Lock Document (`/tenants/{tenantId}/resource_slot_locks/{lockId}`).
 * Lock ID format: `${resourceId}_${YYYY-MM-DD}_${HHmm}`
 */
export const ResourceSlotLockDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    resourceId: z.string().min(1),
    branchId: z.string().min(1),
    bookingId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slotTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    startTimeIso: z.string().datetime(),
    endTimeIso: z.string().datetime(),
    status: z.enum(['LOCKED', 'RELEASED']).default('LOCKED'),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type ResourceSlotLockDoc = z.infer<typeof ResourceSlotLockDocSchema>;

/**
 * Resource Schedule Mutex Lock (`/tenants/{tenantId}/resource_schedule_locks/{resourceId}`).
 * Provides Optimistic Concurrency Control (OCC) across concurrent resource reservations.
 */
export const ResourceScheduleLockDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    resourceId: z.string().min(1),
    branchId: z.string().min(1),
    version: z.number().int().nonnegative(),
    lastMutationType: z.enum(['CREATE', 'RESCHEDULE', 'CANCEL', 'ASSIGN', 'RELEASE', 'COMPLETE', 'NO_SHOW']),
    lastBookingId: z.string().min(1),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type ResourceScheduleLockDoc = z.infer<typeof ResourceScheduleLockDocSchema>;

/**
 * Checks whether a resource is eligible to be assigned to a service in a branch.
 */
export function isResourceEligibleForService(
  resource: Pick<
    ResourceDoc,
    | 'tenantId'
    | 'branchId'
    | 'type'
    | 'status'
    | 'supportsAllBranchServices'
    | 'supportedServiceIds'
    | 'supportedCategoryIds'
  >,
  service: {
    id: string;
    tenantId: string;
    categoryId: string;
    assignedBranchIds: readonly string[];
    resourceRequirement?: ServiceResourceRequirement;
    allowedResourceTypes?: readonly ResourceType[];
  }
): { eligible: boolean; reason?: string } {
  if (resource.tenantId !== service.tenantId) {
    return { eligible: false, reason: 'المورد لا يتبع لنفس المنشأة.' };
  }
  if (resource.status !== 'ACTIVE') {
    return {
      eligible: false,
      reason:
        resource.status === 'MAINTENANCE'
          ? 'المورد قيد الصيانة حالياً ولا يمكن حجزه.'
          : 'المورد غير نشط حالياً ولا يمكن حجزه.',
    };
  }
  if (!service.assignedBranchIds.includes(resource.branchId)) {
    return { eligible: false, reason: 'الخدمة غير متوفرة في فرع هذا المورد.' };
  }
  if (service.resourceRequirement === 'NONE') {
    return { eligible: false, reason: 'هذه الخدمة مصنفة بأنها لا تتطلب حجز كرسي أو مورد.' };
  }
  if (service.allowedResourceTypes && service.allowedResourceTypes.length > 0) {
    if (!service.allowedResourceTypes.includes(resource.type)) {
      return {
        eligible: false,
        reason: `نوع المورد (${RESOURCE_TYPE_LABELS_AR[resource.type]}) غير متوافق مع متطلبات الخدمة.`,
      };
    }
  }
  if (resource.supportsAllBranchServices) {
    return { eligible: true };
  }
  const matchesService = resource.supportedServiceIds.includes(service.id);
  const matchesCategory = resource.supportedCategoryIds.includes(service.categoryId);
  if (!matchesService && !matchesCategory) {
    return {
      eligible: false,
      reason: 'هذا المورد غير مهيأ لتقديم هذه الخدمة أو تصنيفها.',
    };
  }
  return { eligible: true };
}

