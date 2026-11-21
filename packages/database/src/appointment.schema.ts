import { z } from 'zod';

/**
 * Normalizes any valid ISO 8601 datetime string (including with timezone offsets)
 * to canonical UTC ISO string format (`YYYY-MM-DDTHH:mm:ss.sssZ`).
 */
export function normalizeToUtcIso(dateTimeStr: string): string {
  if (typeof dateTimeStr !== 'string' || dateTimeStr.trim() === '') {
    throw new Error('Datetime string must be non-empty');
  }
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO 8601 datetime: ${dateTimeStr}`);
  }
  return date.toISOString();
}

/**
 * Appointment Lifecycle Statuses
 */
export const AppointmentStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);
export type AppointmentStatus = z.infer<typeof AppointmentStatusEnum>;

/**
 * Payment Statuses
 */
export const PaymentStatusEnum = z.enum([
  'PENDING',
  'PAID',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
]);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

/**
 * Canonical Appointment Document Schema (`/tenants/{tenantId}/appointments/{appointmentId}`).
 */
export const AppointmentDocSchema = z
  .object({
    id: z.string().min(1, 'Appointment ID must be non-empty'),
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    branchId: z.string().min(1, 'Branch ID must be non-empty'),
    staffId: z.string().min(1, 'Staff ID must be non-empty'),
    customerId: z.string().min(1, 'Customer ID must be non-empty'),
    serviceId: z.string().min(1, 'Service ID must be non-empty'),
    status: AppointmentStatusEnum,
    scheduledStartTime: z
      .string()
      .datetime({ message: 'scheduledStartTime must be a valid ISO 8601 string' }),
    scheduledEndTime: z
      .string()
      .datetime({ message: 'scheduledEndTime must be a valid ISO 8601 string' }),
    priceHalalas: z.number().int().nonnegative('Price in Halalas cannot be negative'),
    paymentStatus: PaymentStatusEnum,
    notes: z.string().max(1000).default(''),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict()
  .refine(
    (data) =>
      new Date(data.scheduledEndTime).getTime() > new Date(data.scheduledStartTime).getTime(),
    {
      message: 'scheduledEndTime must be strictly later than scheduledStartTime',
      path: ['scheduledEndTime'],
    }
  );

export type AppointmentDoc = z.infer<typeof AppointmentDocSchema>;

/**
 * Input schema for server-authoritative appointment rescheduling.
 */
export const RescheduleAppointmentInputSchema = z
  .object({
    tenantId: z.string().min(1),
    appointmentId: z.string().min(1),
    scheduledStartTime: z.string().datetime({ offset: true }),
    scheduledEndTime: z.string().datetime({ offset: true }),
    staffId: z.string().min(1).optional(),
    branchId: z.string().min(1).optional(),
    notes: z.string().max(1000).optional(),
  })
  .strict()
  .refine(
    (data) =>
      new Date(data.scheduledEndTime).getTime() > new Date(data.scheduledStartTime).getTime(),
    {
      message: 'scheduledEndTime must be strictly later than scheduledStartTime',
      path: ['scheduledEndTime'],
    }
  );

export type RescheduleAppointmentInput = z.infer<typeof RescheduleAppointmentInputSchema>;

/**
 * Canonical Schedule Lock Document Schema (`/tenants/{tenantId}/schedule_locks/{staffUid}`).
 * Concurrency mutex document used for Optimistic Concurrency Control (OCC) over staff booking schedules.
 */
export const ScheduleLockDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    staffId: z.string().min(1),
    version: z.number().int().nonnegative(),
    lastMutationType: z.enum(['CREATE', 'RESCHEDULE', 'CANCEL', 'COMPLETE', 'NO_SHOW']),
    lastAppointmentId: z.string().min(1),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type ScheduleLockDoc = z.infer<typeof ScheduleLockDocSchema>;

/**
 * Input schema for server-authoritative appointment creation.
 */
export const CreateAppointmentInputSchema = z
  .object({
    tenantId: z.string().min(1),
    appointmentId: z.string().min(1).optional(),
    branchId: z.string().min(1),
    staffId: z.string().min(1),
    customerId: z.string().min(1),
    serviceId: z.string().min(1),
    scheduledStartTime: z.string().datetime({ offset: true }),
    scheduledEndTime: z.string().datetime({ offset: true }),
    priceHalalas: z.number().int().nonnegative(),
    notes: z.string().max(1000).optional(),
  })
  .strict()
  .refine(
    (data) =>
      new Date(data.scheduledEndTime).getTime() > new Date(data.scheduledStartTime).getTime(),
    {
      message: 'scheduledEndTime must be strictly later than scheduledStartTime',
      path: ['scheduledEndTime'],
    }
  );

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentInputSchema>;

/**
 * Input schema for server-authoritative appointment cancellation.
 */
export const CancelAppointmentInputSchema = z
  .object({
    tenantId: z.string().min(1),
    appointmentId: z.string().min(1),
    reason: z.string().max(500).optional(),
  })
  .strict();

export type CancelAppointmentInput = z.infer<typeof CancelAppointmentInputSchema>;

/**
 * Input schema for server-authoritative appointment completion.
 */
export const CompleteAppointmentInputSchema = z
  .object({
    tenantId: z.string().min(1),
    appointmentId: z.string().min(1),
    notes: z.string().max(1000).optional(),
  })
  .strict();

export type CompleteAppointmentInput = z.infer<typeof CompleteAppointmentInputSchema>;

/**
 * Input schema for server-authoritative appointment no-show marking.
 */
export const MarkNoShowAppointmentInputSchema = z
  .object({
    tenantId: z.string().min(1),
    appointmentId: z.string().min(1),
    notes: z.string().max(1000).optional(),
  })
  .strict();

export type MarkNoShowAppointmentInput = z.infer<typeof MarkNoShowAppointmentInputSchema>;



