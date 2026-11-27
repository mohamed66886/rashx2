import { z } from 'zod';

/**
 * Slot granularity for scheduling is 15 minutes.
 */
export const SLOT_GRANULARITY_MINUTES = 15;

/**
 * Standard business timezone for RASHX.
 * Saudi Arabia is UTC+3 permanently with zero Daylight Saving Time (DST) shifts.
 */
export const SAUDI_TIMEZONE = 'Asia/Riyadh';
export const SAUDI_UTC_OFFSET_HOURS = 3;

/**
 * Schema for querying availability of slots.
 */
export const AvailabilityQueryInputSchema = z
  .object({
    tenantId: z.string().min(1, 'معرف المنشأة مطلوب'),
    branchId: z.string().min(1, 'معرف الفرع مطلوب'),
    serviceId: z.string().min(1, 'معرف الخدمة مطلوب'),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ الحجز يجب أن يكون بصيغة YYYY-MM-DD'),
    providerId: z.string().min(1).optional(),
    resourceId: z.string().min(1).optional(),
    timezone: z.string().default(SAUDI_TIMEZONE),
  })
  .strict();

export type AvailabilityQueryInput = z.input<typeof AvailabilityQueryInputSchema>;

export interface TimeSlot {
  /** Local time formatted as HH:mm in Riyadh timezone (e.g. "10:00") */
  time: string;
  /** End of service formatted as HH:mm in Riyadh timezone (e.g. "10:45") */
  endTime: string;
  /** Canonical UTC ISO datetime string representing start of slot */
  startTimeIso: string;
  /** Canonical UTC ISO datetime string representing end of slot */
  endTimeIso: string;
  /** Provider providing this slot */
  providerId: string;
  /** Arabic display name of provider */
  providerNameAr: string;
  /** Provider photo if available */
  providerPhotoUrl?: string;
  /** Whether the slot is open for reservation */
  available: boolean;
}

export interface ProviderAvailabilitySummary {
  id: string;
  displayNameAr: string;
  photoUrl?: string;
  availableSlotCount: number;
}

export interface ResourceAvailabilitySummary {
  id: string;
  nameAr: string;
  type: string;
  code?: string;
}

export interface AvailabilityQueryResult {
  date: string;
  branchId: string;
  serviceId: string;
  serviceNameAr: string;
  serviceDurationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  totalDurationMinutes: number;
  priceHalalas: number;
  timezone: string;
  availableProviders: ProviderAvailabilitySummary[];
  availableResources?: ResourceAvailabilitySummary[];
  slots: TimeSlot[];
}

/**
 * Converts a Riyadh local date (YYYY-MM-DD) and time (HH:mm) into a canonical UTC ISO string.
 * Example: '2026-11-25', '10:00' -> '2026-11-25T07:00:00.000Z'
 */
export function riyadhTimeToUtcIso(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  if (!year || !month || !day || hours === undefined || minutes === undefined) {
    throw new Error(`Invalid date or time: date=${dateStr}, time=${timeStr}`);
  }

  // Create Date using UTC methods with UTC+3 offset subtracted
  const utcDate = new Date(Date.UTC(year, month - 1, day, hours - SAUDI_UTC_OFFSET_HOURS, minutes, 0, 0));
  return utcDate.toISOString();
}

/**
 * Converts a canonical UTC ISO string into Riyadh local date and time.
 * Returns { date: 'YYYY-MM-DD', time: 'HH:mm' }
 */
export function utcIsoToRiyadhTime(utcIsoStr: string): { date: string; time: string; dayOfWeek: string } {
  const utcDate = new Date(utcIsoStr);
  if (isNaN(utcDate.getTime())) {
    throw new Error(`Invalid ISO datetime: ${utcIsoStr}`);
  }

  // Add 3 hours for Riyadh
  const riyadhMillis = utcDate.getTime() + SAUDI_UTC_OFFSET_HOURS * 60 * 60 * 1000;
  const riyadhDate = new Date(riyadhMillis);

  const year = riyadhDate.getUTCFullYear();
  const month = String(riyadhDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(riyadhDate.getUTCDate()).padStart(2, '0');
  const hours = String(riyadhDate.getUTCHours()).padStart(2, '0');
  const minutes = String(riyadhDate.getUTCMinutes()).padStart(2, '0');

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = daysOfWeek[riyadhDate.getUTCDay()]!;

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
    dayOfWeek,
  };
}

export interface GeneratedSlotLock {
  lockId: string;
  date: string;
  time: string;
  startTimeIso: string;
  endTimeIso: string;
}

/**
 * Generates all discrete slot lock IDs spanned by an interval [startTimeIso, endTimeIso).
 * Granularity is 15 minutes.
 */
export function generateSlotLockIds(
  providerId: string,
  startTimeIso: string,
  endTimeIso: string
): { lockIds: string[]; slotLocks: GeneratedSlotLock[]; slotStartIsoTimes: string[] } {
  const startMs = new Date(startTimeIso).getTime();
  const endMs = new Date(endTimeIso).getTime();

  if (endMs <= startMs) {
    throw new Error('endTimeIso must be strictly later than startTimeIso');
  }

  const stepMs = SLOT_GRANULARITY_MINUTES * 60 * 1000;
  const lockIds: string[] = [];
  const slotLocks: GeneratedSlotLock[] = [];
  const slotStartIsoTimes: string[] = [];

  for (let currentMs = startMs; currentMs < endMs; currentMs += stepMs) {
    const currentIso = new Date(currentMs).toISOString();
    const nextIso = new Date(currentMs + stepMs).toISOString();
    const { date, time } = utcIsoToRiyadhTime(currentIso);
    const compactTime = time.replace(':', '');
    const lockId = `${providerId}_${date}_${compactTime}`;

    lockIds.push(lockId);
    slotStartIsoTimes.push(currentIso);
    slotLocks.push({
      lockId,
      date,
      time,
      startTimeIso: currentIso,
      endTimeIso: nextIso,
    });
  }

  return { lockIds, slotLocks, slotStartIsoTimes };
}

/**
 * Generates discrete 15-minute slot lock IDs for a salon resource (chair/room/station).
 */
export function generateResourceSlotLockIds(
  resourceId: string,
  startTimeIso: string,
  endTimeIso: string
): { lockIds: string[]; slotLocks: GeneratedSlotLock[]; slotStartIsoTimes: string[] } {
  return generateSlotLockIds(resourceId, startTimeIso, endTimeIso);
}

/**
 * Returns [startTimeIso, endTimeIso) UTC bounds for a single Riyadh calendar day (YYYY-MM-DD).
 */
export function riyadhDayBoundsUtc(dateStr: string): { startTimeIso: string; endTimeIso: string } {
  const startTimeIso = riyadhTimeToUtcIso(dateStr, '00:00');
  const startMs = new Date(startTimeIso).getTime();
  const endTimeIso = new Date(startMs + 24 * 60 * 60 * 1000).toISOString();
  return { startTimeIso, endTimeIso };
}

/**
 * Returns [startTimeIso, endTimeIso) UTC bounds spanning inclusive Riyadh dates [startDateStr, endDateStr].
 */
export function riyadhDateRangeUtc(
  startDateStr: string,
  endDateStr: string
): { startTimeIso: string; endTimeIso: string } {
  const startTimeIso = riyadhTimeToUtcIso(startDateStr, '00:00');
  const endDayStartMs = new Date(riyadhTimeToUtcIso(endDateStr, '00:00')).getTime();
  const endTimeIso = new Date(endDayStartMs + 24 * 60 * 60 * 1000).toISOString();
  return { startTimeIso, endTimeIso };
}

/**
 * Returns the current date string (YYYY-MM-DD) in Asia/Riyadh timezone.
 */
export function getCurrentRiyadhDate(now: Date = new Date()): string {
  return utcIsoToRiyadhTime(now.toISOString()).date;
}

/**
 * Adds `days` calendar days to a YYYY-MM-DD Riyadh date string.
 */
export function addRiyadhDays(dateStr: string, days: number): string {
  const baseMs = new Date(riyadhTimeToUtcIso(dateStr, '12:00')).getTime();
  const shiftedIso = new Date(baseMs + days * 24 * 60 * 60 * 1000).toISOString();
  return utcIsoToRiyadhTime(shiftedIso).date;
}

/**
 * Returns current Riyadh time rounded up to the nearest 15-minute boundary for immediate walk-ins.
 */
export function getCurrentRiyadhTimeRounded15(now: Date = new Date()): {
  date: string;
  time: string;
  iso: string;
} {
  const stepMs = SLOT_GRANULARITY_MINUTES * 60 * 1000;
  const roundedMs = Math.ceil(now.getTime() / stepMs) * stepMs;
  const iso = new Date(roundedMs).toISOString();
  const { date, time } = utcIsoToRiyadhTime(iso);
  return { date, time, iso };
}

