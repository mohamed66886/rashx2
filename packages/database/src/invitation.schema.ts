import { z } from 'zod';
import { MembershipRoleEnum } from './membership.schema';

export const InvitationStatusEnum = z.enum([
  'PENDING',
  'ACCEPTED',
  'REVOKED',
  'EXPIRED',
]);
export type InvitationStatus = z.infer<typeof InvitationStatusEnum>;

/**
 * Tenant Invitation Document (`/tenants/{tenantId}/invitations/{invitationId}`).
 * Cryptographically secure invitation to link an authenticated user with an organizational role.
 */
export const InvitationDocSchema = z
  .object({
    id: z.string().min(1, 'Invitation ID is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    email: z.string().email('البريد الإلكتروني غير صالح'),
    role: MembershipRoleEnum,
    targetEmployeeId: z.string().nullable().default(null),
    tokenHash: z.string().min(1, 'Token hash is required'),
    expiresAt: z.string().datetime({ message: 'expiresAt must be an ISO 8601 string' }),
    status: InvitationStatusEnum.default('PENDING'),
    invitedByUid: z.string().min(1, 'معرف المستخدم الداعي مطلوب'),
    acceptedByUid: z.string().nullable().default(null),
    acceptedAt: z.string().datetime().nullable().default(null),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();

export type InvitationDoc = z.infer<typeof InvitationDocSchema>;

/**
 * Single-use Invitation Token Lookup Document (`/invitation_tokens/{tokenHash}`).
 * Allows constant-time lookup and verification without enumerating tenant collections.
 */
export const InvitationTokenDocSchema = z
  .object({
    tokenHash: z.string().min(1),
    invitationId: z.string().min(1),
    tenantId: z.string().min(1),
    email: z.string().email(),
    role: MembershipRoleEnum,
    targetEmployeeId: z.string().nullable().optional(),
    expiresAt: z.string().datetime(),
    status: InvitationStatusEnum,
  })
  .strict();

export type InvitationTokenDoc = z.infer<typeof InvitationTokenDocSchema>;

/**
 * Input Schema for creating an invitation
 */
export const CreateInvitationInputSchema = z
  .object({
    email: z.string().email('البريد الإلكتروني غير صالح'),
    role: MembershipRoleEnum,
    targetEmployeeId: z.string().nullable().optional(),
    expiresInDays: z.number().int().min(1).max(30).default(7),
  })
  .strict();

export type CreateInvitationInput = z.infer<typeof CreateInvitationInputSchema>;

