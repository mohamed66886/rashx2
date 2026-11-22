import { z } from 'zod';

export const EmploymentStatusEnum = z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACTOR']);
export type EmploymentStatus = z.infer<typeof EmploymentStatusEnum>;

/**
 * Operational Staff Document (`/tenants/{tenantId}/staff/{staffUid}`).
 * Canonical identity: `staffId` === `auth.uid`.
 * Holds sensitive compensation figures (base salary in Halalas, commission in basis points),
 * and confidential PII (National ID, personal contact numbers, emergency contact).
 */
export const StaffDocSchema = z
  .object({
    id: z.string().min(1, 'Staff UID must be non-empty (canonical auth.uid)'),
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    displayName: z.string().min(1, 'Display name is required').max(100),
    assignedBranchIds: z
      .array(z.string().min(1, 'Branch ID must be non-empty'))
      .min(1, 'Staff must be assigned to at least one branch'),
    isActive: z.boolean(),
    isPubliclyVisible: z.boolean(),
    specialties: z.array(z.string().min(1, 'Specialty cannot be empty')),
    baseSalaryHalalas: z
      .number()
      .int('Base salary must be an integer (Halalas)')
      .nonnegative('Base salary cannot be negative'),
    commissionSplitBps: z
      .number()
      .int('Commission split must be an integer (basis points)')
      .min(0, 'Commission split cannot be negative')
      .max(10000, 'Commission split cannot exceed 10000 basis points (100%)'),
    nationalId: z.string().min(1, 'National ID is required for operational staff records'),
    personalPhone: z.string().min(7, 'Personal phone must be at least 7 characters').max(20),
    emergencyContact: z.string().min(1, 'Emergency contact information is required').max(100),
    employmentStatus: EmploymentStatusEnum,
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 datetime string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
  })
  .strict();

export type StaffDoc = z.infer<typeof StaffDocSchema>;

/**
 * Staff Self-Service Compensation Document
 * (`/tenants/{tenantId}/staff_compensation/{staffUid}`).
 * Restricts base salary, commission split, and employment status
 * to tenant OWNER or the employee themselves.
 */
export const StaffCompensationDocSchema = z
  .object({
    id: z.string().min(1, 'Staff UID must be non-empty (canonical auth.uid)'),
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    staffId: z.string().min(1, 'Staff ID must match id'),
    baseSalaryHalalas: z
      .number()
      .int('Base salary must be an integer (Halalas)')
      .nonnegative('Base salary cannot be negative'),
    commissionSplitBps: z
      .number()
      .int('Commission split must be an integer (basis points)')
      .min(0, 'Commission split cannot be negative')
      .max(10000, 'Commission split cannot exceed 10000 basis points (100%)'),
    employmentStatus: EmploymentStatusEnum,
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 datetime string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
  })
  .strict();

export type StaffCompensationDoc = z.infer<typeof StaffCompensationDocSchema>;

/**
 * Confidential Staff HR & Identity Document
 * (`/tenants/{tenantId}/staff_confidential/{staffUid}`).
 * Restricts nationalId, personalPhone, and emergency contact
 * exclusively to tenant OWNER and authorized HR administrators.
 * Ordinary employees and managers have no direct client read access.
 */
export const StaffConfidentialDocSchema = z
  .object({
    id: z.string().min(1, 'Staff UID must be non-empty (canonical auth.uid)'),
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    staffId: z.string().min(1, 'Staff ID must match id'),
    nationalId: z.string().min(1, 'National ID is required for confidential staff records'),
    personalPhone: z.string().min(7, 'Personal phone must be at least 7 characters').max(20),
    emergencyContact: z.string().min(1, 'Emergency contact information is required').max(100),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 datetime string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
  })
  .strict();

export type StaffConfidentialDoc = z.infer<typeof StaffConfidentialDocSchema>;

/**
 * Public Staff Roster Projection (`/tenants/{tenantId}/public_roster/{staffUid}`).
 * Strictly excludes base salary, commission split, nationalId, personalPhone, emergency contact,
 * employment status, and tenantId.
 */
export const PublicStaffRosterSchema = z
  .object({
    id: z.string().min(1, 'Staff UID must be non-empty'),
    displayName: z.string().min(1, 'Display name is required').max(100),
    avatarUrl: z.string().url('Invalid avatar URL').nullable().optional(),
    bio: z.string().max(500).optional(),
    specialties: z.array(z.string().min(1)),
    assignedBranchIds: z.array(z.string().min(1)),
    isBookableOnline: z.boolean(),
  })
  .strict();

export type PublicStaffRoster = z.infer<typeof PublicStaffRosterSchema>;

/**
 * Input schema for onboarding operational staff.
 */
export const CreateStaffInputSchema = z
  .object({
    id: z.string().min(1, 'Staff UID is required (auth.uid)'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    displayName: z.string().min(1).max(100),
    assignedBranchIds: z.array(z.string().min(1)).min(1),
    specialties: z.array(z.string().min(1)).default([]),
    baseSalaryHalalas: z.number().int().nonnegative().default(0),
    commissionSplitBps: z.number().int().min(0).max(10000).default(0),
    nationalId: z.string().min(1),
    personalPhone: z.string().min(7).max(20),
    emergencyContact: z.string().min(1).max(100),
    employmentStatus: EmploymentStatusEnum.default('FULL_TIME'),
    isPubliclyVisible: z.boolean().default(true),
  })
  .strict();

export type CreateStaffInput = z.infer<typeof CreateStaffInputSchema>;

/**
 * Input schema for updating operational staff records.
 */
export const UpdateStaffInputSchema = z
  .object({
    displayName: z.string().min(1).max(100).optional(),
    assignedBranchIds: z.array(z.string().min(1)).min(1).optional(),
    isActive: z.boolean().optional(),
    isPubliclyVisible: z.boolean().optional(),
    specialties: z.array(z.string().min(1)).optional(),
    baseSalaryHalalas: z.number().int().nonnegative().optional(),
    commissionSplitBps: z.number().int().min(0).max(10000).optional(),
    nationalId: z.string().min(1).optional(),
    personalPhone: z.string().min(7).max(20).optional(),
    emergencyContact: z.string().min(1).max(100).optional(),
    employmentStatus: EmploymentStatusEnum.optional(),
  })
  .strict();

export type UpdateStaffInput = z.infer<typeof UpdateStaffInputSchema>;

