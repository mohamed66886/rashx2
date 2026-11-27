'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { CustomerRepository, CustomerError } from '@/lib/firebase-server';

function formatErrorMessage(err: any, fallbackMessage: string): string {
  if (err instanceof CustomerError) {
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

export async function createCustomerAction(
  formData: FormData
): Promise<{ success: boolean; customerId?: string; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;
  const email = (formData.get('email') as string) || undefined;
  const dateOfBirth = (formData.get('dateOfBirth') as string) || undefined;
  const gender = (formData.get('gender') as any) || 'UNSPECIFIED';
  const privateNotes = (formData.get('privateNotes') as string) || '';
  const rawTags = (formData.get('tags') as string) || '';
  const tags = rawTags
    ? rawTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  try {
    const customerRepo = new CustomerRepository();
    const created = await customerRepo.createCustomer(
      {
        uid: session.user.uid,
        role: session.membership.role,
      },
      {
        tenantId: session.tenant.tenantId,
        fullName,
        phone,
        email,
        dateOfBirth,
        gender,
        privateNotes,
        tags,
      }
    );

    revalidatePath('/dashboard/customers');
    return { success: true, customerId: created.id };
  } catch (err: any) {
    return { success: false, error: formatErrorMessage(err, 'حدث خطأ أثناء إضافة العميل.') };
  }
}

export async function updateCustomerAction(
  customerId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  const fullName = (formData.get('fullName') as string) || undefined;
  const phone = (formData.get('phone') as string) || undefined;
  const email = (formData.get('email') as string) || null;
  const dateOfBirth = (formData.get('dateOfBirth') as string) || null;
  const gender = (formData.get('gender') as any) || undefined;
  const privateNotes = (formData.get('privateNotes') as string) || undefined;
  const rawTags = formData.get('tags') as string;
  const tags = rawTags !== null
    ? rawTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined;

  try {
    const customerRepo = new CustomerRepository();
    await customerRepo.updateCustomer(
      {
        uid: session.user.uid,
        role: session.membership.role,
      },
      session.tenant.tenantId,
      customerId,
      {
        fullName,
        phone,
        email,
        dateOfBirth,
        gender,
        privateNotes,
        tags,
      }
    );

    revalidatePath('/dashboard/customers');
    revalidatePath(`/dashboard/customers/${customerId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatErrorMessage(err, 'حدث خطأ أثناء تحديث بيانات العميل.') };
  }
}

export async function archiveCustomerAction(
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'انتهت الجلسة أو الحساب غير مصرح له.' };
  }

  try {
    const customerRepo = new CustomerRepository();
    await customerRepo.archiveCustomer(
      {
        uid: session.user.uid,
        role: session.membership.role,
      },
      session.tenant.tenantId,
      customerId
    );

    revalidatePath('/dashboard/customers');
    revalidatePath(`/dashboard/customers/${customerId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatErrorMessage(err, 'حدث خطأ أثناء أرشفة العميل.') };
  }
}

