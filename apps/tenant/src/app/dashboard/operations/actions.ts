'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  AvailabilityService,
  BookingError,
  CustomerRepository,
  CustomerError,
  DailyOperationsService,
  OperationsError,
  QueueRepository,
  QueueError,
  type BookingDoc,
  type BookingStatus,
  type CustomerDoc,
  type OperationalWarning,
  type QueueEntryDoc,
  type QueueCallDoc,
  type AvailabilityQueryResult,
} from '@/lib/firebase-server';

function formatOpError(err: any, fallback: string): string {
  if (
    err instanceof OperationsError ||
    err instanceof QueueError ||
    err instanceof BookingError ||
    err instanceof CustomerError
  ) {
    return err.message;
  }
  if (typeof err?.message === 'string' && err.message.trim().length > 0) {
    return err.message;
  }
  return fallback;
}

export async function searchCustomersForWalkInAction(
  query: string
): Promise<{ success: boolean; customers?: CustomerDoc[]; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new CustomerRepository();
    const res = await repo.listCustomers(actor, session.tenant.tenantId, {
      search: query,
      status: 'ACTIVE',
      limit: 20,
    });
    return { success: true, customers: res.customers };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر البحث عن العملاء.') };
  }
}

export async function getWalkInAvailabilityAction(params: {
  branchId: string;
  serviceId: string;
  date: string;
  providerId?: string;
  resourceId?: string;
}): Promise<{ success: boolean; data?: AvailabilityQueryResult; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const availabilityService = new AvailabilityService();
    const data = await availabilityService.getAvailableSlots({
      tenantId: session.tenant.tenantId,
      branchId: params.branchId,
      serviceId: params.serviceId,
      date: params.date,
      providerId: params.providerId || undefined,
      resourceId: params.resourceId || undefined,
    });
    return { success: true, data };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر فحص التوافر.') };
  }
}

export async function registerWalkInAction(input: {
  branchId: string;
  serviceId: string;
  providerId: string;
  resourceId?: string | null;
  scheduledStartTime: string;
  existingCustomerId?: string;
  newCustomerName?: string;
  newCustomerPhone?: string;
  isGuestCustomer?: boolean;
  customerNotes?: string;
  internalNotes?: string;
  addToQueue?: boolean;
  priority?: boolean;
  idempotencyKey: string;
}): Promise<{
  success: boolean;
  bookingId?: string;
  bookingNumber?: string;
  queueEntryId?: string | null;
  deduplicated?: boolean;
  error?: string;
}> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const ops = new DailyOperationsService();
    const res = await ops.registerWalkIn(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/queue');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard/bookings');
    revalidatePath('/dashboard/customers');
    return {
      success: true,
      bookingId: res.booking.id,
      bookingNumber: res.booking.bookingNumber,
      queueEntryId: res.queueEntry?.id ?? null,
      deduplicated: res.deduplicated,
    };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر تسجيل الزيارة الفورية.') };
  }
}

export async function enqueueBookingAction(
  bookingId: string,
  priority = false
): Promise<{ success: boolean; entry?: QueueEntryDoc; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const queueRepo = new QueueRepository();
    const entry = await queueRepo.enqueueBooking(actor, {
      tenantId: session.tenant.tenantId,
      bookingId,
      priority,
    });

    revalidatePath('/dashboard/queue');
    revalidatePath('/dashboard/operations');
    return { success: true, entry };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر إضافة الحجز إلى الطابور.') };
  }
}

export async function callNextCustomerAction(input: {
  branchId: string;
  date: string;
  providerId?: string;
  targetBookingId?: string;
  notes?: string;
  idempotencyKey: string;
}): Promise<{
  success: boolean;
  entry?: QueueEntryDoc;
  call?: QueueCallDoc;
  deduplicated?: boolean;
  error?: string;
}> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const queueRepo = new QueueRepository();
    const res = await queueRepo.callNextCustomer(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/queue');
    revalidatePath('/dashboard/operations');
    return { success: true, ...res };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر نداء العميل.') };
  }
}

export async function callAgainAction(input: {
  bookingId: string;
  notes?: string;
  idempotencyKey: string;
}): Promise<{ success: boolean; entry?: QueueEntryDoc; call?: QueueCallDoc; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const queueRepo = new QueueRepository();
    const res = await queueRepo.callAgain(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/queue');
    revalidatePath('/dashboard/operations');
    return { success: true, entry: res.entry, call: res.call };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر إعادة نداء العميل.') };
  }
}

export async function recordNoResponseAction(input: {
  bookingId: string;
  disposition: 'RETURN_TO_QUEUE' | 'MARK_NO_SHOW';
  notes?: string;
  idempotencyKey: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const queueRepo = new QueueRepository();
    await queueRepo.recordNoResponse(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/queue');
    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard/bookings');
    return { success: true };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر تسجيل عدم الاستجابة.') };
  }
}

export async function reorderQueueAction(input: {
  branchId: string;
  date: string;
  orderedBookingIds: string[];
  elevateBookingIdToPriority?: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const queueRepo = new QueueRepository();
    await queueRepo.reorderQueue(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/queue');
    revalidatePath('/dashboard/operations');
    return { success: true };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر إعادة ترتيب الطابور.') };
  }
}

export async function startQueueServiceAction(
  bookingId: string,
  resourceId?: string | null
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const queueRepo = new QueueRepository();
    await queueRepo.startServiceFromQueue(
      actor,
      session.tenant.tenantId,
      bookingId,
      resourceId
    );

    revalidatePath('/dashboard/queue');
    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard/bookings');
    revalidatePath(`/dashboard/bookings/${bookingId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر بدء تقديم الخدمة.') };
  }
}

export async function completeQueueServiceAction(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const queueRepo = new QueueRepository();
    await queueRepo.completeServiceFromQueue(actor, session.tenant.tenantId, bookingId);

    revalidatePath('/dashboard/queue');
    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard/bookings');
    revalidatePath(`/dashboard/bookings/${bookingId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر إتمام الخدمة.') };
  }
}

export async function removeFromQueueAction(input: {
  bookingId: string;
  reason?: string;
  cancelBooking?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const queueRepo = new QueueRepository();
    await queueRepo.removeFromQueue(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/queue');
    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard/bookings');
    return { success: true };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر إزالة السجل من الطابور.') };
  }
}

export async function reconcileQueueAction(
  branchId: string,
  date: string
): Promise<{ success: boolean; repairedCount?: number; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const queueRepo = new QueueRepository();
    const res = await queueRepo.reconcileQueueProjection(
      actor,
      session.tenant.tenantId,
      branchId,
      date
    );

    revalidatePath('/dashboard/queue');
    revalidatePath('/dashboard/operations');
    return { success: true, repairedCount: res.repairedCount };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر مزامنة بيانات الطابور.') };
  }
}

export async function fetchCalendarPageAction(params: {
  startDate: string;
  endDate: string;
  branchId?: string;
  providerId?: string;
  resourceId?: string;
  serviceId?: string;
  status?: BookingStatus;
  cursorStartTimeIso?: string;
  limit?: number;
}): Promise<{
  success: boolean;
  bookings?: BookingDoc[];
  warnings?: OperationalWarning[];
  nextCursorStartTimeIso?: string | null;
  hasMore?: boolean;
  error?: string;
}> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const ops = new DailyOperationsService();
    const res = await ops.getCalendarSchedule(actor, session.tenant.tenantId, params);
    return {
      success: true,
      bookings: res.bookings,
      warnings: res.warnings,
      nextCursorStartTimeIso: res.nextCursorStartTimeIso,
      hasMore: res.hasMore,
    };
  } catch (err) {
    return { success: false, error: formatOpError(err, 'تعذر تحميل بيانات التقويم.') };
  }
}

