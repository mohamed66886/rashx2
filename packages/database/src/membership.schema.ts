import { z } from 'zod';

export const MembershipRoleEnum = z.enum(['OWNER', 'MANAGER', 'STAFF']);
export type MembershipRole = z.infer<typeof MembershipRoleEnum>;

export const MembershipStatusEnum = z.enum(['ACTIVE', 'SUSPENDED', 'REVOKED']);
export type MembershipStatus = z.infer<typeof MembershipStatusEnum>;

/**
 * Operational Membership Document (`/tenants/{tenantId}/memberships/{memberUid}`).
 * Maps an authenticated Firebase UID to an organizational role within a tenant.
 */
export const MembershipDocSchema = z
  .object({
    id: z.string().min(1, 'Member ID (Firebase UID) must be non-empty'),
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    role: MembershipRoleEnum,
    status: MembershipStatusEnum,
    title: z.string().max(100).optional(),
    joinedAt: z.string().datetime({ message: 'joinedAt must be an ISO 8601 datetime string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
  })
  .strict();

export type MembershipDoc = z.infer<typeof MembershipDocSchema>;

/**
 * Input schema for adding a member to a tenant organization.
 */
export const CreateMembershipInputSchema = z
  .object({
    id: z.string().min(1, 'Member UID is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    role: MembershipRoleEnum,
    title: z.string().max(100).optional(),
  })
  .strict();

export type CreateMembershipInput = z.infer<typeof CreateMembershipInputSchema>;

/**
 * Input schema for altering a member's role or status.
 */
export const UpdateMembershipRoleInputSchema = z
  .object({
    role: MembershipRoleEnum,
    status: MembershipStatusEnum.optional(),
    title: z.string().max(100).optional(),
  })
  .strict();

export type UpdateMembershipRoleInput = z.infer<typeof UpdateMembershipRoleInputSchema>;

/**
 * Membership Summary Mutex Document (`/tenants/{tenantId}/membership_summary/counts`).
 * Enforces transactional invariants such that activeOwnerCount >= 1, preventing orphaned tenants.
 */
export const MembershipSummaryDocSchema = z
  .object({
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    activeOwnerCount: z
      .number()
      .int('activeOwnerCount must be an integer')
      .min(1, 'A tenant must have at least 1 active owner (activeOwnerCount >= 1)'),
    activeManagerCount: z
      .number()
      .int('activeManagerCount must be an integer')
      .nonnegative('activeManagerCount must be non-negative')
      .default(0),
    activeStaffCount: z
      .number()
      .int('activeStaffCount must be an integer')
      .nonnegative('activeStaffCount must be non-negative')
      .default(0),
    totalActiveMembers: z
      .number()
      .int('totalActiveMembers must be an integer')
      .min(1, 'totalActiveMembers must be at least 1'),
    version: z
      .number()
      .int('version must be an integer')
      .nonnegative('version must be non-negative'),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
  })
  .strict();

export type MembershipSummaryDoc = z.infer<typeof MembershipSummaryDocSchema>;

