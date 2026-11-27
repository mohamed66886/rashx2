'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BookingRepository,
  BookingError,
  AvailabilityService,
  type BookingStatus,
} from '@/lib/firebase-server';
import { riyadhTimeToUtcIso } from '@rashx/database';

function formatErrorMessage(err: any, fallbackMessage: string): string {
  if (err instanceof BookingError) {
    return err.message;
  }
  if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    const first = err.errors[0];
    if (first.message) {
      return first.message;
    }
  }
  if (typeof err?.message === 'string') {
    const trimmed = err.message.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          return parsed[0].message;
        }
      } catch {
        // Fall back
      }
    }
    return err.message;
  }
  return fallbackMessage;
}

export async function createBookingAction(
  formData: FormData
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  const branchId = formData.get('branchId') as string;
  const serviceId = formData.get('serviceId') as string;
  const providerId = formData.get('providerId') as string;
  const resourceId = (formData.get('resourceId') as string) || null;
  const customerId = formData.get('customerId') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const customerNotes = (formData.get('customerNotes') as string) || '';
  const internalNotes = (formData.get('internalNotes') as string) || '';
  const idempotencyKey = (formData.get('idempotencyKey') as string) || undefined;

  if (!branchId || !serviceId || !providerId || !customerId || !date || !time) {
    return { success: false, error: 'جميع الحقول الأساسية وموعد الحجز مطلوبة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const startTimeIso = riyadhTimeToUtcIso(date, time);
    const bookingRepo = new BookingRepository();

    const created = await bookingRepo.createBooking(actor, {
      tenantId: session.tenant.tenantId,
      branchId,
      serviceId,
      providerId,
      resourceId,
      customerId,
      scheduledStartTime: startTimeIso,
      customerNotes,
      internalNotes,
      source: 'DASHBOARD',
      idempotencyKey,
      initialStatus: 'CONFIRMED',
    });

    revalidatePath('/dashboard/bookings');
    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/calendar');
    revalidatePath(`/dashboard/customers/${customerId}`);
    return { success: true, bookingId: created.id };
  } catch (err: any) {
    return { success: false, error: formatErrorMessage(err, 'فشل إنشاء الحجز.') };
  }
}

export async function rescheduleBookingAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  const bookingId = formData.get('bookingId') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const newProviderId = (formData.get('newProviderId') as string) || undefined;
  const rawNewResourceId = formData.get('newResourceId');
  const newResourceId =
    rawNewResourceId === '__KEEP__' || rawNewResourceId === null
      ? undefined
      : rawNewResourceId === ''
        ? null
        : String(rawNewResourceId);
  const reason = (formData.get('reason') as string) || '';

  if (!bookingId || !date || !time) {
    return { success: false, error: 'معرف الحجز والتاريخ والوقت الجديد مطلوبان.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const newStartTimeIso = riyadhTimeToUtcIso(date, time);
    const bookingRepo = new BookingRepository();

    await bookingRepo.rescheduleBooking(actor, {
      tenantId: session.tenant.tenantId,
      bookingId,
      newScheduledStartTime: newStartTimeIso,
      newProviderId,
      newResourceId,
      reason,
    });

    revalidatePath('/dashboard/bookings');
    revalidatePath(`/dashboard/bookings/${bookingId}`);
    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard/queue');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatErrorMessage(err, 'فشل إعادة جدولة الموعد.') };
  }
}

export async function cancelBookingAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  const bookingId = formData.get('bookingId') as string;
  const reason = (formData.get('reason') as string) || '';

  if (!bookingId) {
    return { success: false, error: 'معرف الحجز مطلوب.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const bookingRepo = new BookingRepository();
    await bookingRepo.cancelBooking(actor, {
      tenantId: session.tenant.tenantId,
      bookingId,
      reason,
    });

    revalidatePath('/dashboard/bookings');
    revalidatePath(`/dashboard/bookings/${bookingId}`);
    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard/queue');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatErrorMessage(err, 'فشل إلغاء الحجز.') };
  }
}

export async function transitionBookingStatusAction(
  bookingId: string,
  targetStatus: BookingStatus
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const bookingRepo = new BookingRepository();
    await bookingRepo.transitionBookingStatus(
      actor,
      session.tenant.tenantId,
      bookingId,
      targetStatus
    );

    revalidatePath('/dashboard/bookings');
    revalidatePath(`/dashboard/bookings/${bookingId}`);
    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard/queue');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatErrorMessage(err, 'فشل تغيير حالة الحجز.') };
  }
}

export async function getAvailabilitySlotsAction(
  branchId: string,
  serviceId: string,
  date: string,
  providerId?: string,
  resourceId?: string
) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  try {
    const availabilityService = new AvailabilityService();
    const result = await availabilityService.getAvailableSlots({
      tenantId: session.tenant.tenantId,
      branchId,
      serviceId,
      date,
      providerId: providerId || undefined,
      resourceId: resourceId || undefined,
    });

    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: formatErrorMessage(err, 'تعذر جلب الأوقات المتاحة.') };
  }
}

