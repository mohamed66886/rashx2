'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { AccountingRepository } from '@/lib/firebase-server';
import type { JournalLine } from '@rashx/database';

export async function createDraftJournalAction(
  data: {
    descriptionAr: string;
    descriptionEn?: string;
    entryDate: string;
    periodId: string;
    lines: JournalLine[];
    sourceDocumentRef?: string;
  }
): Promise<{ success: boolean; entryId?: string; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح' };
  }

  if (session.membership.role !== 'OWNER' && session.membership.role !== 'MANAGER') {
    return { success: false, error: 'تتطلب هذه العملية صلاحيات مالية' };
  }

  try {
    const accRepo = new AccountingRepository();
    const entry = await accRepo.createDraftJournal(
      session.tenant.tenantId,
      data,
      session.user.uid
    );

    revalidatePath('/dashboard/accounting/journals');
    return { success: true, entryId: entry.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء حفظ مسودة القيد' };
  }
}

export async function postJournalAction(
  entryId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح' };
  }

  if (session.membership.role !== 'OWNER' && session.membership.role !== 'MANAGER') {
    return { success: false, error: 'ترحيل القيود مقتصر على الإدارة المالية' };
  }

  try {
    const accRepo = new AccountingRepository();
    await accRepo.postJournalEntry(session.tenant.tenantId, entryId, session.user.uid);

    revalidatePath('/dashboard/accounting');
    revalidatePath('/dashboard/accounting/journals');
    revalidatePath('/dashboard/accounting/ledger');
    revalidatePath('/dashboard/accounting/trial-balance');
    revalidatePath('/dashboard/accounting/accounts');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل ترحيل القيد' };
  }
}

export async function reverseJournalAction(
  entryId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح' };
  }

  if (session.membership.role !== 'OWNER') {
    return { success: false, error: 'عكس القيود المحاسبية مقتصر على مالك المنشأة (OWNER)' };
  }

  try {
    const accRepo = new AccountingRepository();
    await accRepo.reverseJournalEntry(
      session.tenant.tenantId,
      entryId,
      session.user.uid,
      reason
    );

    revalidatePath('/dashboard/accounting');
    revalidatePath('/dashboard/accounting/journals');
    revalidatePath('/dashboard/accounting/ledger');
    revalidatePath('/dashboard/accounting/trial-balance');
    revalidatePath('/dashboard/accounting/accounts');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل عكس القيد' };
  }
}

export async function closePeriodAction(
  periodId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح' };
  }

  if (session.membership.role !== 'OWNER') {
    return { success: false, error: 'إقفال الفترات المالية مقتصر على مالك المنشأة (OWNER)' };
  }

  try {
    const accRepo = new AccountingRepository();
    await accRepo.closeAccountingPeriod(session.tenant.tenantId, periodId, session.user.uid);

    revalidatePath('/dashboard/accounting/periods');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل إقفال الفترة المالية' };
  }
}

export async function reopenPeriodAction(
  periodId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح' };
  }

  if (session.membership.role !== 'OWNER') {
    return { success: false, error: 'إعادة فتح الفترات المالية مقتصر على مالك المنشأة (OWNER)' };
  }

  try {
    const accRepo = new AccountingRepository();
    await accRepo.reopenAccountingPeriod(
      session.tenant.tenantId,
      periodId,
      session.user.uid,
      reason
    );

    revalidatePath('/dashboard/accounting/periods');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل إعادة فتح الفترة المالية' };
  }
}

export async function createCostCenterAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح' };
  }

  const code = formData.get('code') as string;
  const nameAr = formData.get('nameAr') as string;
  const nameEn = (formData.get('nameEn') as string) || undefined;
  const branchId = (formData.get('branchId') as string) || undefined;

  try {
    const accRepo = new AccountingRepository();
    await accRepo.createCostCenter(session.tenant.tenantId, {
      code,
      nameAr,
      nameEn,
      branchId,
      isActive: true,
    });

    revalidatePath('/dashboard/accounting/cost-centers');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل إنشاء مركز التكلفة' };
  }
}

