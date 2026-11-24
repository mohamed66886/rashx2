import { z } from 'zod';

export const HrAuditActionEnum = z.enum([
  'EMPLOYEE_CREATED',
  'EMPLOYEE_UPDATED',
  'EMPLOYEE_STATUS_CHANGED',
  'EMPLOYEE_TERMINATED',
  'USER_LINKED',
  'USER_UNLINKED',
  'MEMBERSHIP_ROLE_CHANGED',
  'MEMBERSHIP_SUSPENDED',
  'MEMBERSHIP_REACTIVATED',
  'MEMBERSHIP_REVOKED',
  'PROVIDER_CREATED',
  'PROVIDER_UPDATED',
  'BRANCH_ASSIGNMENT_CHANGED',
  'COMPENSATION_CREATED',
  'COMPENSATION_UPDATED',
  'COMMISSION_POLICY_CREATED',
  'COMMISSION_POLICY_UPDATED',
]);
export type HrAuditAction = z.infer<typeof HrAuditActionEnum>;

export const HrAuditEntityTypeEnum = z.enum([
  'EMPLOYEE',
  'PROVIDER',
  'MEMBERSHIP',
  'COMPENSATION',
  'COMMISSION_POLICY',
]);
export type HrAuditEntityType = z.infer<typeof HrAuditEntityTypeEnum>;

/**
 * HR & Personnel Audit Record Document (`/tenants/{tenantId}/hr_audit/{auditId}`).
 * Append-only immutable audit trail for employee, provider, membership, and compensation mutations.
 */
export const HrAuditRecordSchema = z
  .object({
    id: z.string().min(1, 'Audit ID is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    action: HrAuditActionEnum,
    entityType: HrAuditEntityTypeEnum,
    entityId: z.string().min(1, 'Entity ID is required'),
    actorUid: z.string().min(1, 'Actor UID is required'),
    details: z.record(z.any()).default({}),
    timestamp: z.string().datetime({ message: 'timestamp must be an ISO 8601 string' }),
  })
  .strict();

export type HrAuditRecord = z.infer<typeof HrAuditRecordSchema>;

