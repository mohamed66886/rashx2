import { z } from 'zod';

/**
 * Service Category Document (`/tenants/{tenantId}/service_categories/{categoryId}`).
 * Organizes salon services into logical operational and customer-facing groupings.
 */
export const ServiceCategoryDocSchema = z
  .object({
    id: z.string().min(1, 'Category ID is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    nameAr: z.string().min(1, 'اسم التصنيف بالعربية مطلوب').max(100),
    nameEn: z.string().max(100).optional().default(''),
    descriptionAr: z.string().max(500).optional().default(''),
    descriptionEn: z.string().max(500).optional().default(''),
    imageUrl: z.string().url('رابط الصورة غير صالح').optional().or(z.literal('')),
    displayOrder: z.number().int('الترتيب يجب أن يكون رقماً صحيحاً').nonnegative().default(0),
    isActive: z.boolean().default(true),
    renamePropagation: z
      .object({
        status: z.enum(['IN_PROGRESS', 'COMPLETED']),
        targetNameAr: z.string(),
        updatedAt: z.string().datetime(),
      })
      .optional(),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
    createdBy: z.string().min(1, 'معرف منشئ السجل مطلوب'),
    updatedBy: z.string().min(1, 'معرف محدث السجل مطلوب'),
  })
  .strict();

export type ServiceCategoryDoc = z.infer<typeof ServiceCategoryDocSchema>;

/**
 * Public Service Category Projection (`/tenants/{tenantId}/public_service_categories/{categoryId}`).
 * Safe for anonymous public reads on published salons.
 */
export const PublicServiceCategorySchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    nameAr: z.string().min(1).max(100),
    nameEn: z.string().max(100).optional(),
    descriptionAr: z.string().max(500).optional(),
    descriptionEn: z.string().max(500).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    displayOrder: z.number().int().default(0),
    isActive: z.literal(true),
  })
  .strict();

export type PublicServiceCategory = z.infer<typeof PublicServiceCategorySchema>;

/**
 * Input Schema for creating a Service Category.
 */
export const CreateCategoryInputSchema = z
  .object({
    nameAr: z.string().min(1, 'اسم التصنيف بالعربية مطلوب').max(100),
    nameEn: z.string().max(100).optional().default(''),
    descriptionAr: z.string().max(500).optional().default(''),
    descriptionEn: z.string().max(500).optional().default(''),
    imageUrl: z.string().url('رابط الصورة غير صالح').optional().or(z.literal('')),
    displayOrder: z.number().int().nonnegative().default(0),
    isActive: z.boolean().default(true),
  })
  .strict();

export type CreateCategoryInput = z.infer<typeof CreateCategoryInputSchema>;

/**
 * Input Schema for updating an existing Service Category.
 */
export const UpdateCategoryInputSchema = z
  .object({
    nameAr: z.string().min(1, 'اسم التصنيف بالعربية مطلوب').max(100).optional(),
    nameEn: z.string().max(100).optional(),
    descriptionAr: z.string().max(500).optional(),
    descriptionEn: z.string().max(500).optional(),
    imageUrl: z.string().url('رابط الصورة غير صالح').optional().or(z.literal('')),
    displayOrder: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInputSchema>;

