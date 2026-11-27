import { z } from 'zod';
import { TaxModeEnum } from './service-pricing';

/**
 * Booking Lifecycle Statuses
 */
export const BookingStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'IN_SERVICE',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

/**
 * Booking Source Channel
 */
export const BookingSourceEnum = z.enum([
  'ONLINE_APP',
  'DASHBOARD',
  'WALK_IN',
  'PHONE',
]);
export type BookingSource = z.infer<typeof BookingSourceEnum>;

/**
 * Permitted status transitions table.
 * Terminal states (COMPLETED, CANCELLED, NO_SHOW) cannot transition to any other state.
 */
export const PERMITTED_STATUS_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
  CHECKED_IN: ['IN_SERVICE', 'CANCELLED', 'NO_SHOW'],
  IN_SERVICE: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export function isValidBookingStatusTransition(
  fromStatus: BookingStatus,
  toStatus: BookingStatus
): boolean {
  if (fromStatus === toStatus) return true;
  const allowed = PERMITTED_STATUS_TRANSITIONS[fromStatus];
  return allowed ? allowed.includes(toStatus) : false;
}

export function isTerminalBookingStatus(status: BookingStatus): boolean {
  return status === 'COMPLETED' || status === 'CANCELLED' || status === 'NO_SHOW';
}

/**
 * Slot Lock Document Schema (`/tenants/{tenantId}/slot_locks/{lockId}`).
 * Deterministic schedule mutex lock representing a single 15-minute time slice for a provider.
 * Lock ID format: `${providerId}_${YYYY-MM-DD}_${HHmm}`
 */
export const SlotLockDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    providerId: z.string().min(1),
    branchId: z.string().min(1),
    bookingId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slotTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    startTimeIso: z.string().datetime(),
    endTimeIso: z.string().datetime(),
    status: z.enum(['LOCKED', 'RELEASED']).default('LOCKED'),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type SlotLockDoc = z.infer<typeof SlotLockDocSchema>;

/**
 * Canonical Booking Price Snapshot Schema (halalas & VAT calculations).
 */
export const BookingPriceSnapshotSchema = z
  .object({
    basePriceHalalas: z.number().int().nonnegative('Base price cannot be negative'),
    currency: z.literal('SAR').default('SAR'),
    taxMode: TaxModeEnum.default('TAX_INCLUSIVE'),
    taxRateBps: z.number().int().nonnegative(),
    netPriceHalalas: z.number().int().nonnegative(),
    calculatedTaxHalalas: z.number().int().nonnegative(),
    totalPriceHalalas: z.number().int().nonnegative(),
  })
  .strict();

export type BookingPriceSnapshot = z.infer<typeof BookingPriceSnapshotSchema>;

/**
 * Canonical Booking Document Schema (`/tenants/{tenantId}/bookings/{bookingId}`).
 */
export const BookingDocSchema = z
  .object({
    id: z.string().min(1, 'معرف الحجز مطلوب'),
    bookingNumber: z.string().min(1, 'رقم الحجز المرجعي مطلوب'),
    tenantId: z.string().min(1, 'معرف المنشأة مطلوب'),
    branchId: z.string().min(1, 'معرف الفرع مطلوب'),
    customerId: z.string().min(1, 'معرف العميل مطلوب'),
    customerName: z.string().min(1, 'اسم العميل مطلوب'),
    customerPhone: z.string().nullable().optional().default(null),
    serviceId: z.string().min(1, 'معرف الخدمة مطلوب'),
    providerId: z.string().min(1, 'معرف مقدم الخدمة مطلوب'),
    providerNameAr: z.string().min(1, 'اسم مقدم الخدمة مطلوب'),
    resourceId: z.string().nullable().optional().default(null),
    resourceNameAr: z.string().nullable().optional().default(null),

    // Snapshot metadata (immutable once created)
    serviceNameSnapshot: z.object({
      ar: z.string().min(1),
      en: z.string().optional().default(''),
    }),
    serviceDurationMinutes: z.number().int().positive(),
    bufferBeforeMinutes: z.number().int().nonnegative().default(0),
    bufferAfterMinutes: z.number().int().nonnegative().default(0),
    totalDurationMinutes: z.number().int().positive(),
    priceSnapshot: BookingPriceSnapshotSchema,

    // Time schedule
    scheduledStartTime: z.string().datetime({ message: 'scheduledStartTime must be a valid ISO 8601 string' }),
    scheduledEndTime: z.string().datetime({ message: 'scheduledEndTime must be a valid ISO 8601 string' }),
    timezone: z.string().default('Asia/Riyadh'),

    // Status and lifecycle
    status: BookingStatusEnum.default('CONFIRMED'),
    source: BookingSourceEnum.default('DASHBOARD'),
    customerNotes: z.string().max(1000).default(''),
    internalNotes: z.string().max(1000).default(''),

    // Reserved deterministic slot locks
    slotLockIds: z.array(z.string().min(1)).default([]),
    resourceSlotLockIds: z.array(z.string().min(1)).default([]),
    idempotencyKey: z.string().nullable().optional().default(null),

    // Lifecycle transition metadata
    cancellation: z
      .object({
        reason: z.string().max(500).optional().default(''),
        cancelledAt: z.string().datetime(),
        cancelledBy: z.string().min(1),
      })
      .optional(),

    rescheduling: z
      .object({
        previousStartTime: z.string().datetime(),
        previousEndTime: z.string().datetime(),
        rescheduledAt: z.string().datetime(),
        rescheduledBy: z.string().min(1),
        reason: z.string().max(500).optional().default(''),
      })
      .optional(),

    checkIn: z
      .object({
        checkedInAt: z.string().datetime(),
        checkedInBy: z.string().min(1),
      })
      .optional(),

    serviceExecution: z
      .object({
        startedAt: z.string().datetime().optional(),
        startedBy: z.string().optional(),
        completedAt: z.string().datetime().optional(),
        completedBy: z.string().optional(),
      })
      .optional(),

    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
    createdBy: z.string().min(1, 'معرف المنشئ مطلوب'),
    updatedBy: z.string().min(1, 'معرف المحدث مطلوب'),
  })
  .strict()
  .refine(
    (data) => new Date(data.scheduledEndTime).getTime() > new Date(data.scheduledStartTime).getTime(),
    {
      message: 'scheduledEndTime must be strictly later than scheduledStartTime',
      path: ['scheduledEndTime'],
    }
  );

export type BookingDoc = z.infer<typeof BookingDocSchema>;

/**
 * Input Schema for creating a new booking.
 */
export const CreateBookingInputSchema = z
  .object({
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    serviceId: z.string().min(1),
    providerId: z.string().min(1),
    resourceId: z.string().min(1).nullable().optional(),
    customerId: z.string().min(1),
    scheduledStartTime: z.string().datetime({ offset: true }),
    customerNotes: z.string().max(1000).optional().default(''),
    internalNotes: z.string().max(1000).optional().default(''),
    source: BookingSourceEnum.optional().default('DASHBOARD'),
    idempotencyKey: z.string().min(1).max(100).optional(),
    initialStatus: z.enum(['PENDING', 'CONFIRMED']).optional().default('CONFIRMED'),
  })
  .strict();

export type CreateBookingInput = z.input<typeof CreateBookingInputSchema>;

/**
 * Input Schema for rescheduling a booking.
 */
export const RescheduleBookingInputSchema = z
  .object({
    tenantId: z.string().min(1),
    bookingId: z.string().min(1),
    newScheduledStartTime: z.string().datetime({ offset: true }),
    newProviderId: z.string().min(1).optional(),
    newBranchId: z.string().min(1).optional(),
    newResourceId: z.string().min(1).nullable().optional(),
    reason: z.string().max(500).optional().default(''),
    internalNotes: z.string().max(1000).optional(),
  })
  .strict();

export type RescheduleBookingInput = z.input<typeof RescheduleBookingInputSchema>;

/**
 * Input Schema for cancelling a booking.
 */
export const CancelBookingInputSchema = z
  .object({
    tenantId: z.string().min(1),
    bookingId: z.string().min(1),
    reason: z.string().max(500).optional().default(''),
  })
  .strict();

export type CancelBookingInput = z.input<typeof CancelBookingInputSchema>;

/**
 * Booking Audit Log Document Schema (`/tenants/{tenantId}/booking_audit/{auditId}`).
 */
export const BookingAuditDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    actorUid: z.string().min(1),
    entityType: z.literal('BOOKING'),
    entityId: z.string().min(1),
    action: z.enum([
      'BOOKING_CREATED',
      'BOOKING_CONFIRMED',
      'BOOKING_RESCHEDULED',
      'BOOKING_CANCELLED',
      'BOOKING_CHECKED_IN',
      'BOOKING_SERVICE_STARTED',
      'BOOKING_SERVICE_COMPLETED',
      'BOOKING_NO_SHOW',
      'WALK_IN_CREATED',
      'RESOURCE_ASSIGNED',
      'RESOURCE_RELEASED',
    ]),
    beforeValues: z.record(z.unknown()).optional(),
    afterValues: z.record(z.unknown()).optional(),
    idempotencyKey: z.string().optional(),
    timestamp: z.string().datetime(),
  })
  .strict();

export type BookingAuditDoc = z.infer<typeof BookingAuditDocSchema>;
