import { z } from 'zod';
import { BookingSourceEnum } from './booking.schema';

/**
 * Queue operational statuses (derived projection synced with canonical BookingDoc status).
 */
export const QueueEntryStatusEnum = z.enum([
  'WAITING',
  'CALLED',
  'IN_SERVICE',
  'COMPLETED',
  'REMOVED',
  'NO_SHOW',
]);
export type QueueEntryStatus = z.infer<typeof QueueEntryStatusEnum>;

/**
 * Explicit queue priority tiers.
 * Priority ordering: PRIORITY (1) < APPOINTMENT (2) < WALK_IN (3),
 * combined with sequential FIFO sequence number and explicit manual position overrides.
 */
export const QueuePriorityLevelEnum = z.enum(['PRIORITY', 'APPOINTMENT', 'WALK_IN']);
export type QueuePriorityLevel = z.infer<typeof QueuePriorityLevelEnum>;

export const QUEUE_PRIORITY_RANKS: Record<QueuePriorityLevel, 1 | 2 | 3> = {
  PRIORITY: 1,
  APPOINTMENT: 2,
  WALK_IN: 3,
};

export const QUEUE_PRIORITY_LABELS_AR: Record<QueuePriorityLevel, string> = {
  PRIORITY: 'أولوية قصوى / VIP',
  APPOINTMENT: 'موعد محجوز مسبقاً',
  WALK_IN: 'زيارة فورية (Walk-in)',
};

export const QueueCallTypeEnum = z.enum(['INITIAL_CALL', 'CALL_AGAIN', 'NO_RESPONSE']);
export type QueueCallType = z.infer<typeof QueueCallTypeEnum>;

/**
 * Queue Entry Document (`/tenants/{tenantId}/queue_entries/{bookingId}`).
 * Deterministic document ID equals `bookingId` to structurally prevent duplicate queue entries.
 */
export const QueueEntryDocSchema = z
  .object({
    id: z.string().min(1), // Always equal to bookingId
    bookingId: z.string().min(1),
    bookingNumber: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Riyadh business date (YYYY-MM-DD)
    customerId: z.string().min(1),
    customerName: z.string().min(1),
    customerPhone: z.string().nullable().default(null),
    isGuestCustomer: z.boolean().default(false),
    serviceId: z.string().min(1),
    serviceNameAr: z.string().min(1),
    serviceDurationMinutes: z.number().int().positive(),
    providerId: z.string().min(1),
    providerNameAr: z.string().min(1),
    resourceId: z.string().nullable().default(null),
    resourceNameAr: z.string().nullable().default(null),
    source: BookingSourceEnum.default('DASHBOARD'),
    status: QueueEntryStatusEnum.default('WAITING'),
    priorityLevel: QueuePriorityLevelEnum.default('APPOINTMENT'),
    priorityRank: z.number().int().min(1).max(3).default(2),
    sequenceNumber: z.number().int().positive(),
    positionScore: z.number().nonnegative(),
    scheduledStartTime: z.string().datetime(),
    checkedInAt: z.string().datetime(),
    queuedAt: z.string().datetime(),
    callCount: z.number().int().nonnegative().default(0),
    lastCalledAt: z.string().datetime().nullable().default(null),
    lastCalledBy: z.string().nullable().default(null),
    serviceStartedAt: z.string().datetime().nullable().default(null),
    completedAt: z.string().datetime().nullable().default(null),
    removedAt: z.string().datetime().nullable().default(null),
    removedReason: z.string().max(500).nullable().default(null),
    notes: z.string().max(1000).optional().default(''),
    updatedAt: z.string().datetime(),
    updatedBy: z.string().min(1),
  })
  .strict();

export type QueueEntryDoc = z.infer<typeof QueueEntryDocSchema>;

/**
 * Queue Branch+Date Concurrency Lock (`/tenants/{tenantId}/queue_locks/{branchId}_{date}`).
 * Ensures serialized sequence allocation, manual reordering, and atomic call-next transitions.
 */
export const QueueLockDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    version: z.number().int().nonnegative(),
    nextSequenceNumber: z.number().int().positive(),
    lastMutationType: z.enum([
      'ENQUEUE',
      'CALL',
      'CALL_AGAIN',
      'NO_RESPONSE',
      'REORDER',
      'START_SERVICE',
      'COMPLETE',
      'REMOVE',
      'RECONCILE',
    ]),
    lastBookingId: z.string().min(1),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type QueueLockDoc = z.infer<typeof QueueLockDocSchema>;

/**
 * Queue Call History Document (`/tenants/{tenantId}/queue_calls/{callId}`).
 * Immutable chronological log of every customer call, recall, and no-response event.
 */
export const QueueCallDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    bookingId: z.string().min(1),
    queueEntryId: z.string().min(1),
    customerId: z.string().min(1),
    customerName: z.string().min(1),
    providerId: z.string().min(1),
    providerNameAr: z.string().min(1),
    resourceId: z.string().nullable().default(null),
    resourceNameAr: z.string().nullable().default(null),
    callType: QueueCallTypeEnum,
    callSequence: z.number().int().positive(),
    notes: z.string().max(500).optional().default(''),
    idempotencyKey: z.string().nullable().optional().default(null),
    calledAt: z.string().datetime(),
    calledBy: z.string().min(1),
  })
  .strict();

export type QueueCallDoc = z.infer<typeof QueueCallDocSchema>;

/**
 * Operations Audit Document (`/tenants/{tenantId}/operations_audit/{auditId}`).
 * Covers Walk-ins, Queue, Calling, Resources, and Operational Service Execution events.
 */
export const OperationsAuditActionEnum = z.enum([
  'WALK_IN_CREATED',
  'QUEUE_ENTRY_CREATED',
  'QUEUE_POSITION_CHANGED',
  'CUSTOMER_CALLED',
  'CUSTOMER_CALLED_AGAIN',
  'CUSTOMER_NO_RESPONSE',
  'QUEUE_ENTRY_REMOVED',
  'QUEUE_RECONCILED',
  'RESOURCE_CREATED',
  'RESOURCE_UPDATED',
  'RESOURCE_STATUS_CHANGED',
  'RESOURCE_ASSIGNED',
  'RESOURCE_RELEASED',
  'BOOKING_SERVICE_STARTED',
  'BOOKING_SERVICE_COMPLETED',
  'BOOKING_NO_SHOW',
]);
export type OperationsAuditAction = z.infer<typeof OperationsAuditActionEnum>;

export const OperationsAuditDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().nullable().optional().default(null),
    actorUid: z.string().min(1),
    entityType: z.enum(['BOOKING', 'QUEUE_ENTRY', 'QUEUE_CALL', 'RESOURCE', 'WALK_IN']),
    entityId: z.string().min(1),
    action: OperationsAuditActionEnum,
    beforeValues: z.record(z.unknown()).optional(),
    afterValues: z.record(z.unknown()).optional(),
    idempotencyKey: z.string().nullable().optional().default(null),
    timestamp: z.string().datetime(),
  })
  .strict();

export type OperationsAuditDoc = z.infer<typeof OperationsAuditDocSchema>;

// ============================================================================
// Operational Input Schemas
// ============================================================================

export const EnqueueBookingInputSchema = z
  .object({
    tenantId: z.string().min(1),
    bookingId: z.string().min(1),
    priority: z.boolean().optional().default(false),
    notes: z.string().max(1000).optional().default(''),
  })
  .strict();

export type EnqueueBookingInput = z.input<typeof EnqueueBookingInputSchema>;

export const CallNextCustomerInputSchema = z
  .object({
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    providerId: z.string().min(1).optional(),
    targetBookingId: z.string().min(1).optional(),
    notes: z.string().max(500).optional().default(''),
    idempotencyKey: z.string().min(1).max(120).optional(),
  })
  .strict();

export type CallNextCustomerInput = z.input<typeof CallNextCustomerInputSchema>;

export const CallAgainInputSchema = z
  .object({
    tenantId: z.string().min(1),
    bookingId: z.string().min(1),
    notes: z.string().max(500).optional().default(''),
    idempotencyKey: z.string().min(1).max(120).optional(),
  })
  .strict();

export type CallAgainInput = z.input<typeof CallAgainInputSchema>;

export const RecordNoResponseInputSchema = z
  .object({
    tenantId: z.string().min(1),
    bookingId: z.string().min(1),
    disposition: z.enum(['RETURN_TO_QUEUE', 'MARK_NO_SHOW']),
    notes: z.string().max(500).optional().default(''),
    idempotencyKey: z.string().min(1).max(120).optional(),
  })
  .strict();

export type RecordNoResponseInput = z.input<typeof RecordNoResponseInputSchema>;

export const ReorderQueueInputSchema = z
  .object({
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    orderedBookingIds: z.array(z.string().min(1)).min(1),
    elevateBookingIdToPriority: z.string().min(1).optional(),
  })
  .strict();

export type ReorderQueueInput = z.input<typeof ReorderQueueInputSchema>;

export const RemoveQueueEntryInputSchema = z
  .object({
    tenantId: z.string().min(1),
    bookingId: z.string().min(1),
    reason: z.string().max(500).optional().default(''),
    cancelBooking: z.boolean().optional().default(false),
  })
  .strict();

export type RemoveQueueEntryInput = z.input<typeof RemoveQueueEntryInputSchema>;

export const WalkInRegistrationInputSchema = z
  .object({
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    serviceId: z.string().min(1),
    providerId: z.string().min(1),
    resourceId: z.string().min(1).nullable().optional(),
    scheduledStartTime: z.string().datetime({ offset: true }),
    // Customer selection or creation
    existingCustomerId: z.string().min(1).optional(),
    newCustomerName: z.string().min(2).max(100).optional(),
    newCustomerPhone: z.string().optional(),
    isGuestCustomer: z.boolean().optional().default(false),
    customerNotes: z.string().max(1000).optional().default(''),
    internalNotes: z.string().max(1000).optional().default(''),
    addToQueue: z.boolean().optional().default(true),
    priority: z.boolean().optional().default(false),
    idempotencyKey: z.string().min(1).max(120),
  })
  .strict();

export type WalkInRegistrationInput = z.input<typeof WalkInRegistrationInputSchema>;

/**
 * Deterministic comparator for ordering WAITING queue entries.
 */
export function compareWaitingQueueEntries(a: QueueEntryDoc, b: QueueEntryDoc): number {
  if (a.positionScore !== b.positionScore) {
    return a.positionScore - b.positionScore;
  }
  const timeCmp = a.checkedInAt.localeCompare(b.checkedInAt);
  if (timeCmp !== 0) return timeCmp;
  return a.id.localeCompare(b.id);
}

