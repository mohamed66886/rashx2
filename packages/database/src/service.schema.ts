import { z } from 'zod';

export const ServiceStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export type ServiceStatus = z.infer<typeof ServiceStatusEnum>;

/**
 * Operational Service Document (`/tenants/{tenantId}/services/{serviceId}`).
 * Holds internal financial figures (COGS in Halalas, stylist commission split in basis points)
 * and confidential operational details (supplier SKU, internal procedure SOP notes).
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

/**
 * Public Service Projection (`/tenants/{tenantId}/public_services/{serviceId}`).
 * Strictly excludes costOfGoodsHalalas, stylistCommissionBps, internalProcedureNotes,
 * supplierSku, and tenantId. Enforces that only published, visible, and non-archived
 * services can exist in public listings.
 */
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

/**
 * Input schema for creating a new operational service.
 */
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

/**
 * Input schema for updating an existing operational service.
 */
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

