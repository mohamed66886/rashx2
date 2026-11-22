import { z } from 'zod';
import { SlugFormatSchema } from './slug.schema';

export const TenantStatusEnum = z.enum(['PROVISIONING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED']);
export type TenantStatus = z.infer<typeof TenantStatusEnum>;

export const SubscriptionTierEnum = z.enum(['STARTER', 'GROWTH', 'ENTERPRISE']);
export type SubscriptionTier = z.infer<typeof SubscriptionTierEnum>;

/**
 * Saudi Commercial Registration (CR) Number: exactly 10 digits.
 */
export const SaudiCrNumberSchema = z
  .string()
  .regex(/^\d{10}$/, 'Commercial Registration (CR) number must be exactly 10 digits');

/**
 * Saudi VAT Number: exactly 15 digits, starting and ending according to ZATCA rules (starts with 3).
 */
export const SaudiVatNumberSchema = z
  .string()
  .regex(/^3\d{14}$/, 'Saudi VAT number must be exactly 15 digits starting with 3');

export const CommercialRegistrationStatusEnum = z.enum([
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
]);
export type CommercialRegistrationStatus = z.infer<typeof CommercialRegistrationStatusEnum>;

/**
 * Commercial Registration Document Schema (`/tenants/{tenantId}/commercial_registration/record`).
 * Private verification record holding uploaded certificate metadata and administrative review state.
 */
export const CommercialRegistrationDocSchema = z
  .object({
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    crNumber: SaudiCrNumberSchema,
    certificateStoragePath: z.string().min(1, 'Certificate storage path is required'),
    certificateFileName: z.string().min(1, 'Certificate file name is required'),
    certificateContentType: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
    certificateFileSizeBytes: z
      .number()
      .int()
      .positive()
      .max(5 * 1024 * 1024, 'Certificate file size must not exceed 5MB'),
    status: CommercialRegistrationStatusEnum.default('PENDING_REVIEW'),
    uploadedByUid: z.string().min(1, 'Uploaded by UID is required'),
    uploadedAt: z.string().datetime({ message: 'uploadedAt must be an ISO 8601 datetime string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
    reviewedByUid: z.string().optional(),
    reviewedAt: z.string().datetime().optional(),
    rejectionReason: z.string().max(500).optional(),
  })
  .strict();

export type CommercialRegistrationDoc = z.infer<typeof CommercialRegistrationDocSchema>;

export const ProvisioningStatusEnum = z.enum(['IN_PROGRESS', 'COMPLETED', 'FAILED']);
export type ProvisioningStatus = z.infer<typeof ProvisioningStatusEnum>;

export const ProvisioningStepEnum = z.enum([
  'USER_CREATED',
  'TENANT_PROVISIONED',
  'CERTIFICATE_UPLOADED',
  'CR_METADATA_SAVED',
]);
export type ProvisioningStep = z.infer<typeof ProvisioningStepEnum>;

/**
 * Tenant Provisioning Tracking Document (`/tenant_provisioning/{ownerUid}`).
 * Tracks multi-step onboarding lifecycle, supporting safe idempotent recovery and retries.
 */
export const TenantProvisioningDocSchema = z
  .object({
    ownerUid: z.string().min(1, 'Owner UID is required'),
    tenantId: z.string().optional(),
    slug: SlugFormatSchema.optional(),
    status: ProvisioningStatusEnum,
    step: ProvisioningStepEnum,
    crNumber: SaudiCrNumberSchema.optional(),
    certificateStoragePath: z.string().optional(),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 datetime string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
    error: z.string().max(1000).optional(),
  })
  .strict();

export type TenantProvisioningDoc = z.infer<typeof TenantProvisioningDocSchema>;

/**
 * Operational Tenant Document Schema (`/tenants/{tenantId}`).
 * Contains complete corporate, billing, and lifecycle data.
 */
export const TenantDocSchema = z
  .object({
    id: z.string().min(1, 'Tenant ID must be non-empty'),
    slug: SlugFormatSchema,
    name: z.string().min(1, 'Tenant name is required').max(100),
    commercialName: z.string().min(1, 'Commercial business name is required').max(100),
    crNumber: SaudiCrNumberSchema,
    vatNumber: SaudiVatNumberSchema.optional(),
    status: TenantStatusEnum,
    isPublished: z.boolean(),
    primaryOwnerUid: z.string().min(1, 'Primary owner UID must be non-empty'),
    subscriptionTier: SubscriptionTierEnum,
    billingEmail: z.string().email('Invalid billing email address'),
    timezone: z.literal('Asia/Riyadh').default('Asia/Riyadh'),
    currency: z.literal('SAR').default('SAR'),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 datetime string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
  })
  .strict();

export type TenantDoc = z.infer<typeof TenantDocSchema>;

/**
 * Public Tenant Profile Projection (`/tenants/{tenantId}/public_profile/profile`).
 * Strictly excludes sensitive corporate identifiers (CR, VAT), billing email, subscription tier,
 * primary owner UID, and operational status.
 */
export const PublicTenantProfileSchema = z
  .object({
    id: z.string().min(1, 'Tenant ID must be non-empty'),
    slug: SlugFormatSchema,
    name: z.string().min(1, 'Tenant name is required').max(100),
    logoUrl: z.string().url('Invalid logo URL').nullable().optional(),
    coverImageUrl: z.string().url('Invalid cover image URL').nullable().optional(),
    socialLinks: z.record(z.string().url('Invalid social media link URL')).optional(),
    publicAddress: z.string().max(255).optional(),
    publicPhone: z.string().min(7).max(20).optional(),
    bookingPolicy: z.string().max(2000).optional(),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
  })
  .strict();

export type PublicTenantProfile = z.infer<typeof PublicTenantProfileSchema>;

/**
 * Input schema for tenant creation during onboarding/provisioning.
 */
export const CreateTenantInputSchema = z
  .object({
    slug: SlugFormatSchema,
    name: z.string().min(1, 'Tenant name is required').max(100),
    commercialName: z.string().min(1, 'Commercial business name is required').max(100),
    crNumber: SaudiCrNumberSchema,
    vatNumber: SaudiVatNumberSchema.optional(),
    primaryOwnerUid: z.string().min(1, 'Primary owner UID is required'),
    subscriptionTier: SubscriptionTierEnum.default('STARTER'),
    billingEmail: z.string().email('Invalid billing email address'),
  })
  .strict();

export type CreateTenantInput = z.infer<typeof CreateTenantInputSchema>;

/**
 * Input schema for updating tenant operational settings.
 */
export const UpdateTenantInputSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    commercialName: z.string().min(1).max(100).optional(),
    crNumber: SaudiCrNumberSchema.optional(),
    vatNumber: SaudiVatNumberSchema.optional(),
    status: TenantStatusEnum.optional(),
    isPublished: z.boolean().optional(),
    subscriptionTier: SubscriptionTierEnum.optional(),
    billingEmail: z.string().email().optional(),
  })
  .strict();

export type UpdateTenantInput = z.infer<typeof UpdateTenantInputSchema>;

