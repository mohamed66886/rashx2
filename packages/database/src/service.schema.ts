import { z } from 'zod';
import { TaxModeEnum } from './service-pricing';
import { ResourceTypeEnum, ServiceResourceRequirementEnum } from './resource.schema';

export const ServiceStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export type ServiceStatus = z.infer<typeof ServiceStatusEnum>;

/**
 * ============================================================================
 * LEGACY / GATE B.2.5 SERVICE SCHEMAS
 * Preserved for strict backwards compatibility with existing margin isolation tests.
 * ============================================================================
 */
export const OperationalServiceDocSchema = z
  .object({
    id: z.string().min(1, 'Service ID must be non-empty'),
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    name: z.string().min(1, 'Service name is required').max(100),
    description: z.string().max(1000).default(''),
    category: z.string().min(1, 'Category is required').max(50),
    priceHalalas: z
      .number()
      .int('Price must be an integer (Halalas)')
      .nonnegative('Price cannot be negative'),
    durationMinutes: z
      .number()
      .int('Duration must be an integer')
      .positive('Duration must be greater than 0 minutes'),
    costOfGoodsHalalas: z
      .number()
      .int('Cost of goods must be an integer (Halalas)')
      .nonnegative('Cost of goods cannot be negative'),
    stylistCommissionBps: z
      .number()
      .int('Stylist commission must be an integer (basis points)')
      .min(0, 'Commission cannot be negative')
      .max(10000, 'Commission cannot exceed 10000 basis points (100%)'),
    internalProcedureNotes: z.string().max(2000).nullable().optional(),
    supplierSku: z.string().max(100).nullable().optional(),
    primaryBranchId: z.string().min(1, 'Primary branch ID must be specified'),
    assignedBranchIds: z.array(z.string().min(1)),
    status: ServiceStatusEnum,
    isVisible: z.boolean(),
    isArchived: z.boolean(),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 datetime string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
  })
  .strict();

export type OperationalServiceDoc = z.infer<typeof OperationalServiceDocSchema>;

export const PublicServiceProjectionSchema = z
  .object({
    id: z.string().min(1, 'Service ID must be non-empty'),
    name: z.string().min(1, 'Service name is required').max(100),
    description: z.string().max(1000),
    category: z.string().min(1).max(50),
    priceHalalas: z
      .number()
      .int('Price must be an integer (Halalas)')
      .nonnegative('Price cannot be negative'),
    durationMinutes: z
      .number()
      .int('Duration must be an integer')
      .positive('Duration must be greater than 0 minutes'),
    imageUrl: z.string().url('Invalid image URL').nullable().optional(),
    primaryBranchId: z.string().min(1),
    assignedBranchIds: z.array(z.string().min(1)),
    status: z.literal('PUBLISHED'),
    isVisible: z.literal(true),
    isArchived: z.literal(false),
  })
  .strict();

export type PublicServiceProjection = z.infer<typeof PublicServiceProjectionSchema>;

export const CreateServiceInputSchema = z
  .object({
    tenantId: z.string().min(1, 'Tenant ID is required'),
    name: z.string().min(1, 'Service name is required').max(100),
    description: z.string().max(1000).optional().default(''),
    category: z.string().min(1, 'Category is required').max(50),
    priceHalalas: z.number().int().nonnegative('Price cannot be negative'),
    durationMinutes: z.number().int().positive('Duration must be greater than 0 minutes'),
    costOfGoodsHalalas: z.number().int().nonnegative().default(0),
    stylistCommissionBps: z.number().int().min(0).max(10000).default(0),
    internalProcedureNotes: z.string().max(2000).nullable().optional(),
    supplierSku: z.string().max(100).nullable().optional(),
    primaryBranchId: z.string().min(1, 'Primary branch ID is required'),
    assignedBranchIds: z.array(z.string().min(1)).default([]),
    status: ServiceStatusEnum.default('DRAFT'),
    isVisible: z.boolean().default(false),
    isArchived: z.boolean().default(false),
  })
  .strict();

export type CreateServiceInput = z.infer<typeof CreateServiceInputSchema>;

export const UpdateServiceInputSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).optional(),
    category: z.string().min(1).max(50).optional(),
    priceHalalas: z.number().int().nonnegative().optional(),
    durationMinutes: z.number().int().positive().optional(),
    costOfGoodsHalalas: z.number().int().nonnegative().optional(),
    stylistCommissionBps: z.number().int().min(0).max(10000).optional(),
    internalProcedureNotes: z.string().max(2000).nullable().optional(),
    supplierSku: z.string().max(100).nullable().optional(),
    primaryBranchId: z.string().min(1).optional(),
    assignedBranchIds: z.array(z.string().min(1)).optional(),
    status: ServiceStatusEnum.optional(),
    isVisible: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  })
  .strict();

export type UpdateServiceInput = z.infer<typeof UpdateServiceInputSchema>;

/**
 * ============================================================================
 * PHASE 3.0 COMPLETE SERVICE CATALOG SCHEMAS
 * Production-ready salon service document model with full category, pricing,
 * Saudi VAT, branch availability, provider assignment, and commission policy support.
 * ============================================================================
 */

export const ServiceDocSchema = z
  .object({
    id: z.string().min(1, 'Service ID is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    categoryId: z.string().min(1, 'معرف التصنيف مطلوب'),
    categoryNameAr: z.string().min(1, 'اسم التصنيف مطلوب'),
    nameAr: z.string().min(1, 'اسم الخدمة بالعربية مطلوب').max(100),
    nameEn: z.string().max(100).optional().default(''),
    descriptionAr: z.string().max(1000).optional().default(''),
    descriptionEn: z.string().max(1000).optional().default(''),
    imageUrl: z.string().url('رابط الصورة غير صالح').optional().or(z.literal('')),
    durationMinutes: z
      .number()
      .int('مدة الخدمة يجب أن تكون رقماً صحيحاً بالدقائق')
      .positive('مدة الخدمة يجب أن تكون أكبر من 0 دقائق'),
    bufferBeforeMinutes: z
      .number()
      .int('الوقت الاحتياطي قبل الخدمة يجب أن يكون رقماً صحيحاً')
      .nonnegative('الوقت الاحتياطي قبل الخدمة لا يمكن أن يكون سالباً')
      .default(0),
    bufferAfterMinutes: z
      .number()
      .int('الوقت الاحتياطي بعد الخدمة يجب أن يكون رقماً صحيحاً')
      .nonnegative('الوقت الاحتياطي بعد الخدمة لا يمكن أن يكون سالباً')
      .default(0),
    basePriceHalalas: z
      .number()
      .int('السعر الأساسي يجب أن يكون رقماً صحيحاً بالهللات')
      .nonnegative('السعر لا يمكن أن يكون سالباً')
      .max(10_000_000_00, 'السعر الأساسي يتجاوز الحد الأقصى المسموح به (10 ملايين ريال)')
      .refine((val) => Number.isSafeInteger(val), 'السعر الأساسي يجب أن يكون رقماً صحيحاً آمناً'),
    currency: z.literal('SAR').default('SAR'),
    taxMode: TaxModeEnum.default('TAX_INCLUSIVE'),
    taxRateBps: z
      .number()
      .int('نسبة الضريبة بنقاط الأساس يجب أن تكون رقماً صحيحاً')
      .nonnegative(),
    netPriceHalalas: z
      .number()
      .int('السعر الصافي يجب أن يكون رقماً صحيحاً بالهللات')
      .nonnegative(),
    calculatedTaxHalalas: z
      .number()
      .int('مبلغ الضريبة يجب أن يكون رقماً صحيحاً بالهللات')
      .nonnegative(),
    totalPriceHalalas: z
      .number()
      .int('السعر الإجمالي يجب أن يكون رقماً صحيحاً بالهللات')
      .nonnegative(),
    primaryBranchId: z.string().min(1, 'الفرع الرئيسي مطلوب'),
    assignedBranchIds: z.array(z.string().min(1)).min(1, 'يجب تحديد فرع واحد على الأقل'),
    assignedProviderIds: z.array(z.string().min(1)).default([]),
    commissionPolicyId: z.string().nullable().default(null),
    resourceRequirement: ServiceResourceRequirementEnum.default('OPTIONAL'),
    allowedResourceTypes: z.array(ResourceTypeEnum).default([]),
    displayOrder: z.number().int().nonnegative().default(0),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
    createdBy: z.string().min(1, 'معرف المنشئ مطلوب'),
    updatedBy: z.string().min(1, 'معرف المحدث مطلوب'),

    // Compatibility fields with legacy schema
    name: z.string().optional(),
    category: z.string().optional(),
    priceHalalas: z.number().int().nonnegative().optional(),
    status: ServiceStatusEnum.optional(),
    isVisible: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  })
  .strict();

export type ServiceDoc = z.infer<typeof ServiceDocSchema>;

/**
 * Public Service Catalog Item (`/tenants/{tenantId}/public_services/{serviceId}`)
 * Strictly sanitizes internal margins, commissions, providers, employee IDs,
 * internal branch IDs, and audit metadata for anonymous salon visitors.
 */
export const PublicCatalogServiceSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    categoryId: z.string().min(1),
    categoryNameAr: z.string().min(1),
    nameAr: z.string().min(1).max(100),
    nameEn: z.string().max(100).optional(),
    descriptionAr: z.string().max(1000).optional(),
    descriptionEn: z.string().max(1000).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    durationMinutes: z.number().int().positive(),
    totalPriceHalalas: z.number().int().nonnegative(),
    currency: z.literal('SAR'),
    taxMode: TaxModeEnum,
    displayOrder: z.number().int().default(0),
    status: z.literal('PUBLISHED').default('PUBLISHED'),
    isVisible: z.literal(true).default(true),
    isActive: z.literal(true),
    isArchived: z.literal(false).default(false),
    isCategoryActive: z.literal(true).default(true),
  })
  .strict();

export type PublicCatalogService = z.infer<typeof PublicCatalogServiceSchema>;

/**
 * Input Schema for creating a Service in the tenant catalog.
 */
export const CreateCatalogServiceInputSchema = z
  .object({
    categoryId: z.string().min(1, 'يجب اختيار تصنيف للخدمة'),
    nameAr: z.string().min(1, 'اسم الخدمة بالعربية مطلوب').max(100),
    nameEn: z.string().max(100).optional().default(''),
    descriptionAr: z.string().max(1000).optional().default(''),
    descriptionEn: z.string().max(1000).optional().default(''),
    imageUrl: z.string().url('رابط الصورة غير صالح').optional().or(z.literal('')),
    durationMinutes: z
      .number()
      .int('مدة الخدمة يجب أن تكون رقماً صحيحاً بالدقائق')
      .positive('مدة الخدمة يجب أن تكون أكبر من 0 دقائق')
      .max(720, 'مدة الخدمة لا يمكن أن تتجاوز 12 ساعة'),
    bufferBeforeMinutes: z
      .number()
      .int('الوقت الاحتياطي قبل الخدمة يجب أن يكون رقماً صحيحاً')
      .nonnegative()
      .default(0),
    bufferAfterMinutes: z
      .number()
      .int('الوقت الاحتياطي بعد الخدمة يجب أن يكون رقماً صحيحاً')
      .nonnegative()
      .default(0),
    basePriceHalalas: z
      .number()
      .int('السعر الأساسي يجب أن يكون رقماً صحيحاً بالهللات')
      .nonnegative('السعر لا يمكن أن يكون سالباً')
      .max(10_000_000_00, 'السعر الأساسي يتجاوز الحد الأقصى المسموح به (10 ملايين ريال)')
      .refine((val) => Number.isSafeInteger(val), 'السعر الأساسي يجب أن يكون رقماً صحيحاً آمناً'),
    taxMode: TaxModeEnum.default('TAX_INCLUSIVE'),
    customTaxRateBps: z
      .number()
      .int()
      .min(0)
      .max(10000)
      .nullable()
      .optional(),
    primaryBranchId: z.string().optional(),
    assignedBranchIds: z.array(z.string().min(1)).optional(),
    assignedProviderIds: z.array(z.string().min(1)).optional().default([]),
    commissionPolicyId: z.string().nullable().optional(),
    resourceRequirement: ServiceResourceRequirementEnum.optional().default('OPTIONAL'),
    allowedResourceTypes: z.array(ResourceTypeEnum).optional().default([]),
    displayOrder: z.number().int().nonnegative().optional().default(0),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export type CreateCatalogServiceInput = z.infer<typeof CreateCatalogServiceInputSchema>;

/**
 * Input Schema for updating a Service in the tenant catalog.
 */
export const UpdateCatalogServiceInputSchema = z
  .object({
    categoryId: z.string().min(1, 'يجب اختيار تصنيف للخدمة').optional(),
    nameAr: z.string().min(1, 'اسم الخدمة بالعربية مطلوب').max(100).optional(),
    nameEn: z.string().max(100).optional(),
    descriptionAr: z.string().max(1000).optional(),
    descriptionEn: z.string().max(1000).optional(),
    imageUrl: z.string().url('رابط الصورة غير صالح').optional().or(z.literal('')),
    durationMinutes: z
      .number()
      .int()
      .positive()
      .max(720)
      .optional(),
    bufferBeforeMinutes: z
      .number()
      .int()
      .nonnegative()
      .optional(),
    bufferAfterMinutes: z
      .number()
      .int()
      .nonnegative()
      .optional(),
    basePriceHalalas: z
      .number()
      .int()
      .nonnegative()
      .max(10_000_000_00)
      .refine((val) => Number.isSafeInteger(val), 'السعر الأساسي يجب أن يكون رقماً صحيحاً آمناً')
      .optional(),
    taxMode: TaxModeEnum.optional(),
    customTaxRateBps: z
      .number()
      .int()
      .min(0)
      .max(10000)
      .nullable()
      .optional(),
    primaryBranchId: z.string().optional(),
    assignedBranchIds: z.array(z.string().min(1)).optional(),
    assignedProviderIds: z.array(z.string().min(1)).optional(),
    commissionPolicyId: z.string().nullable().optional(),
    resourceRequirement: ServiceResourceRequirementEnum.optional(),
    allowedResourceTypes: z.array(ResourceTypeEnum).optional(),
    displayOrder: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdateCatalogServiceInput = z.infer<typeof UpdateCatalogServiceInputSchema>;
