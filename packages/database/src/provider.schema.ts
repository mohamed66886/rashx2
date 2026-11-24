import { z } from 'zod';

export const ProviderStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']);
export type ProviderStatus = z.infer<typeof ProviderStatusEnum>;

/**
 * Service Provider Profile Document (`/tenants/{tenantId}/providers/{providerId}`).
 * Represents an employee authorized and configured to deliver salon services to clients.
 * Linked to an underlying EmployeeDoc via `employeeId`.
 */
export const ProviderDocSchema = z
  .object({
    id: z.string().min(1, 'Provider ID is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    employeeId: z.string().min(1, 'معرف الموظف مطلوب لربط ملف مقدم الخدمة'),
    displayNameAr: z.string().min(1, 'اسم مقدم الخدمة باللغة العربية مطلوب').max(100),
    displayNameEn: z.string().max(100).optional(),
    status: ProviderStatusEnum.default('ACTIVE'),
    bioAr: z.string().max(500).optional(),
    bioEn: z.string().max(500).optional(),
    photoUrl: z.string().url('رابط الصورة غير صالح').optional().or(z.literal('')),
    specialties: z.array(z.string().min(1)).default([]),
    assignedBranchIds: z.array(z.string().min(1)).min(1, 'يجب تعيين مقدم الخدمة في فرع واحد على الأقل'),
    assignedServiceIds: z.array(z.string().min(1)).default([]),
    isPubliclyVisible: z.boolean().default(true),
    commissionEligible: z.boolean().default(true),
    defaultCommissionPolicyId: z.string().nullable().default(null),
    displayOrder: z.number().int().default(0),
    yearsOfExperience: z.number().int().nonnegative().optional(),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();

export type ProviderDoc = z.infer<typeof ProviderDocSchema>;

/**
 * Public Service Provider Projection (`/tenants/{tenantId}/public_providers/{providerId}`).
 * Strictly sanitizes internal HR links, employee ID, and compensation metadata.
 * Safe for anonymous public reads on published salons.
 */
export const PublicProviderDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    providerId: z.string().min(1),
    displayNameAr: z.string().min(1).max(100),
    displayNameEn: z.string().max(100).optional(),
    bioAr: z.string().max(500).optional(),
    bioEn: z.string().max(500).optional(),
    photoUrl: z.string().url().optional().or(z.literal('')),
    specialties: z.array(z.string()).default([]),
    displayOrder: z.number().int().default(0),
    yearsOfExperience: z.number().int().nonnegative().optional(),
    isPubliclyVisible: z.boolean().default(true),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();

export type PublicProviderDoc = z.infer<typeof PublicProviderDocSchema>;

/**
 * Input Schema for creating a Service Provider profile from an Employee.
 */
export const CreateProviderInputSchema = z
  .object({
    employeeId: z.string().min(1, 'معرف الموظف مطلوب'),
    displayNameAr: z.string().min(1, 'اسم العرض بالعربية مطلوب').max(100),
    displayNameEn: z.string().max(100).optional(),
    bioAr: z.string().max(500).optional(),
    bioEn: z.string().max(500).optional(),
    photoUrl: z.string().url().optional().or(z.literal('')),
    specialties: z.array(z.string().min(1)).default([]),
    assignedBranchIds: z.array(z.string().min(1)).min(1, 'يجب تعيين فرع واحد على الأقل'),
    assignedServiceIds: z.array(z.string().min(1)).default([]),
    isPubliclyVisible: z.boolean().default(true),
    commissionEligible: z.boolean().default(true),
    defaultCommissionPolicyId: z.string().nullable().optional(),
    displayOrder: z.number().int().default(0),
    yearsOfExperience: z.number().int().nonnegative().optional(),
  })
  .strict();

export type CreateProviderInput = z.infer<typeof CreateProviderInputSchema>;

/**
 * Input Schema for updating a Service Provider profile.
 */
export const UpdateProviderInputSchema = z
  .object({
    displayNameAr: z.string().min(1).max(100).optional(),
    displayNameEn: z.string().max(100).optional(),
    status: ProviderStatusEnum.optional(),
    bioAr: z.string().max(500).optional(),
    bioEn: z.string().max(500).optional(),
    photoUrl: z.string().url().optional().or(z.literal('')),
    specialties: z.array(z.string().min(1)).optional(),
    assignedBranchIds: z.array(z.string().min(1)).min(1).optional(),
    assignedServiceIds: z.array(z.string().min(1)).optional(),
    isPubliclyVisible: z.boolean().optional(),
    commissionEligible: z.boolean().optional(),
    defaultCommissionPolicyId: z.string().nullable().optional(),
    displayOrder: z.number().int().optional(),
    yearsOfExperience: z.number().int().nonnegative().optional(),
  })
  .strict();

export type UpdateProviderInput = z.infer<typeof UpdateProviderInputSchema>;

