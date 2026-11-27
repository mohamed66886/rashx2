'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  ResourceRepository,
  ResourceError,
  BookingRepository,
  BookingError,
  type ResourceType,
  type ResourceStatus,
  type EligibleResourceAvailability,
} from '@/lib/firebase-server';

function formatError(err: any, fallback: string): string {
  if (err instanceof ResourceError || err instanceof BookingError) {
    return err.message;
  }
  if (typeof err?.message === 'string' && err.message.trim().length > 0) {
    return err.message;
  }
  return fallback;
}

export async function createResourceAction(
  formData: FormData
): Promise<{ success: boolean; resourceId?: string; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  const branchId = (formData.get('branchId') as string) || '';
  const nameAr = (formData.get('nameAr') as string) || '';
  const nameEn = (formData.get('nameEn') as string) || '';
  const code = (formData.get('code') as string) || '';
  const type = (formData.get('type') as ResourceType) || 'BARBER_CHAIR';
  const status = (formData.get('status') as ResourceStatus) || 'ACTIVE';
  const supportsAllBranchServices = formData.get('supportsAllBranchServices') === 'true';
  const supportedServiceIds = formData.getAll('supportedServiceIds').map(String).filter(Boolean);
  const supportedCategoryIds = formData.getAll('supportedCategoryIds').map(String).filter(Boolean);
  const description = (formData.get('description') as string) || '';

  if (!branchId || !nameAr.trim()) {
    return { success: false, error: 'اسم المورد بالعربية والفرع مطلوبان.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new ResourceRepository();
    const created = await repo.createResource(actor, {
      tenantId: session.tenant.tenantId,
      branchId,
      nameAr,
      nameEn,
      code,
      type,
      status,
      supportsAllBranchServices,
      supportedServiceIds,
      supportedCategoryIds,
      description,
    });

    revalidatePath('/dashboard/resources');
    revalidatePath('/dashboard/operations');
    return { success: true, resourceId: created.id };
  } catch (err) {
    return { success: false, error: formatError(err, 'تعذر إنشاء المورد.') };
  }
}

export async function updateResourceAction(
  resourceId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  const nameAr = (formData.get('nameAr') as string) || '';
  const nameEn = (formData.get('nameEn') as string) || '';
  const code = (formData.get('code') as string) || '';
  const type = (formData.get('type') as ResourceType) || undefined;
  const status = (formData.get('status') as ResourceStatus) || undefined;
  const supportsAllBranchServices = formData.get('supportsAllBranchServices') === 'true';
  const supportedServiceIds = formData.getAll('supportedServiceIds').map(String).filter(Boolean);
  const supportedCategoryIds = formData.getAll('supportedCategoryIds').map(String).filter(Boolean);
  const description = (formData.get('description') as string) || '';

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new ResourceRepository();
    await repo.updateResource(actor, session.tenant.tenantId, resourceId, {
      nameAr: nameAr || undefined,
      nameEn,
      code,
      type,
      status,
      supportsAllBranchServices,
      supportedServiceIds,
      supportedCategoryIds,
      description,
    });

    revalidatePath('/dashboard/resources');
    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/calendar');
    return { success: true };
  } catch (err) {
    return { success: false, error: formatError(err, 'تعذر تحديث المورد.') };
  }
}

export async function changeResourceStatusAction(
  resourceId: string,
  status: ResourceStatus
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new ResourceRepository();
    await repo.changeResourceStatus(actor, session.tenant.tenantId, resourceId, status);

    revalidatePath('/dashboard/resources');
    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/calendar');
    return { success: true };
  } catch (err) {
    return { success: false, error: formatError(err, 'تعذر تحديث حالة المورد.') };
  }
}

export async function assignBookingResourceAction(
  bookingId: string,
  resourceId: string | null
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new BookingRepository();
    await repo.assignBookingResource(actor, session.tenant.tenantId, bookingId, resourceId);

    revalidatePath('/dashboard/operations');
    revalidatePath('/dashboard/queue');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard/bookings');
    revalidatePath(`/dashboard/bookings/${bookingId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: formatError(err, 'تعذر تخصيص الكرسي أو المورد.') };
  }
}

export async function listEligibleResourcesAction(params: {
  branchId: string;
  serviceId: string;
  startTimeIso?: string;
  endTimeIso?: string;
  ignoreBookingId?: string;
}): Promise<{ success: boolean; resources?: EligibleResourceAvailability[]; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة.' };
  }

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new ResourceRepository();
    const resources = await repo.listEligibleResourcesForService(
      actor,
      session.tenant.tenantId,
      params.branchId,
      params.serviceId,
      params.startTimeIso && params.endTimeIso
        ? {
            startTimeIso: params.startTimeIso,
            endTimeIso: params.endTimeIso,
            ignoreBookingId: params.ignoreBookingId,
          }
        : undefined
    );
    return { success: true, resources };
  } catch (err) {
    return { success: false, error: formatError(err, 'تعذر جلب الموارد المؤهلة.') };
  }
}

