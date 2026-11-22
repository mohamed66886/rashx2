import { z } from 'zod';

/**
 * Validates geographical coordinates (WGS 84).
 * Latitude: [-90, 90], Longitude: [-180, 180].
 */
export const GeoCoordinatesSchema = z
  .object({
    latitude: z
      .number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),
    longitude: z
      .number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180'),
  })
  .strict();

export type GeoCoordinates = z.infer<typeof GeoCoordinatesSchema>;

/**
 * Validates opening and closing hours for a single day in HH:MM format (24h).
 */
export const OperatingHoursDaySchema = z
  .object({
    open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Open time must be formatted as HH:MM (24h)'),
    close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Close time must be formatted as HH:MM (24h)'),
    isClosed: z.boolean(),
  })
  .strict();

export type OperatingHoursDay = z.infer<typeof OperatingHoursDaySchema>;

/**
 * Weekly operating hours schedule.
 */
export const OperatingHoursWeeklySchema = z
  .object({
    monday: OperatingHoursDaySchema,
    tuesday: OperatingHoursDaySchema,
    wednesday: OperatingHoursDaySchema,
    thursday: OperatingHoursDaySchema,
    friday: OperatingHoursDaySchema,
    saturday: OperatingHoursDaySchema,
    sunday: OperatingHoursDaySchema,
  })
  .strict();

export type OperatingHoursWeekly = z.infer<typeof OperatingHoursWeeklySchema>;

/**
 * Operational Branch Document (`/tenants/{tenantId}/branches/{branchId}`).
 * Includes internal manager notes and tenant linkage.
 */
export const BranchDocSchema = z
  .object({
    id: z.string().min(1, 'Branch ID must be non-empty'),
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    name: z.string().min(1, 'Branch name is required').max(100),
    city: z.string().min(1, 'City is required').max(100),
    district: z.string().min(1, 'District is required').max(100),
    address: z.string().min(1, 'Physical address is required').max(255),
    coordinates: GeoCoordinatesSchema,
    phone: z.string().min(7, 'Phone number must be at least 7 characters').max(20),
    isActive: z.boolean(),
    operatingHours: OperatingHoursWeeklySchema,
    internalNotes: z.string().max(1000).optional(),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 datetime string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
  })
  .strict();

export type BranchDoc = z.infer<typeof BranchDocSchema>;

/**
 * Public Branch Projection (`/tenants/{tenantId}/public_branches/{branchId}`).
 * Strictly excludes internalNotes and tenantId.
 */
export const PublicBranchSchema = z
  .object({
    id: z.string().min(1, 'Branch ID must be non-empty'),
    name: z.string().min(1, 'Branch name is required').max(100),
    city: z.string().min(1, 'City is required').max(100),
    district: z.string().min(1, 'District is required').max(100),
    address: z.string().min(1, 'Physical address is required').max(255),
    coordinates: GeoCoordinatesSchema,
    phone: z.string().min(7).max(20),
    operatingHours: OperatingHoursWeeklySchema,
    isActive: z.boolean(),
  })
  .strict();

export type PublicBranch = z.infer<typeof PublicBranchSchema>;

/**
 * Input schema for creating a new branch.
 */
export const CreateBranchInputSchema = z
  .object({
    tenantId: z.string().min(1, 'Tenant ID is required'),
    name: z.string().min(1, 'Branch name is required').max(100),
    city: z.string().min(1, 'City is required').max(100),
    district: z.string().min(1, 'District is required').max(100),
    address: z.string().min(1, 'Physical address is required').max(255),
    coordinates: GeoCoordinatesSchema,
    phone: z.string().min(7).max(20),
    operatingHours: OperatingHoursWeeklySchema,
    internalNotes: z.string().max(1000).optional(),
  })
  .strict();

export type CreateBranchInput = z.infer<typeof CreateBranchInputSchema>;

/**
 * Input schema for updating an existing branch.
 */
export const UpdateBranchInputSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    city: z.string().min(1).max(100).optional(),
    district: z.string().min(1).max(100).optional(),
    address: z.string().min(1).max(255).optional(),
    coordinates: GeoCoordinatesSchema.optional(),
    phone: z.string().min(7).max(20).optional(),
    isActive: z.boolean().optional(),
    operatingHours: OperatingHoursWeeklySchema.optional(),
    internalNotes: z.string().max(1000).optional(),
  })
  .strict();

export type UpdateBranchInput = z.infer<typeof UpdateBranchInputSchema>;

