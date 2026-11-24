import { z } from 'zod';

export const ServiceAuditOperationEnum = z.enum([
  'CATEGORY_CREATED',
  'CATEGORY_UPDATED',
  'CATEGORY_STATUS_CHANGED',
  'CATEGORY_DELETED',
  'SERVICE_CREATED',
  'SERVICE_UPDATED',
  'SERVICE_PRICING_CHANGED',
  'SERVICE_STATUS_CHANGED',
  'SERVICE_BRANCH_AVAILABILITY_CHANGED',
  'SERVICE_PROVIDER_ASSIGNMENT_CHANGED',
  'SERVICE_COMMISSION_POLICY_CHANGED',
  'SERVICE_DELETED',
]);

export type ServiceAuditOperation = z.infer<typeof ServiceAuditOperationEnum>;

/**
 * Service & Category Audit Trail Document (`/tenants/{tenantId}/service_audit/{auditId}`).
 * Immutable chronological ledger of all service catalog modifications.
 */
export const ServiceAuditRecordSchema = z
  .object({
    id: z.string().min(1, 'Audit record ID is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    actorUid: z.string().min(1, 'Actor UID is required'),
    entityType: z.enum(['SERVICE', 'CATEGORY']),
    entityId: z.string().min(1, 'Entity ID is required'),
    operation: ServiceAuditOperationEnum,
    details: z.record(z.unknown()).optional(),
    before: z.record(z.unknown()).nullable().optional(),
    after: z.record(z.unknown()).nullable().optional(),
    timestamp: z.string().datetime({ message: 'timestamp must be an ISO 8601 string' }),
  })
  .strict();

export type ServiceAuditRecord = z.infer<typeof ServiceAuditRecordSchema>;

