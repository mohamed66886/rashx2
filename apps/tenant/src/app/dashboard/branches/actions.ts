'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { BranchRepository } from '@/lib/firebase-server';

export async function updateBranchAction(
  branchId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (session.membership.role !== 'OWNER' && session.membership.role !== 'MANAGER') {
    return { success: false, error: 'تتطلب هذه العملية صلاحيات إدارة الفرع' };
  }

  const name = formData.get('name') as string;
  const nameEn = (formData.get('nameEn') as string) || undefined;
  const city = formData.get('city') as string;
  const district = formData.get('district') as string;
  const address = formData.get('address') as string;
  const phone = formData.get('phone') as string;
  const email = (formData.get('email') as string) || undefined;
  const isMain = formData.get('isMain') === 'true';

  try {
    const branchRepo = new BranchRepository();
    await branchRepo.updateBranch(session.tenant.tenantId, branchId, {
      name,
      nameEn,
      city,
      district,
      address,
      phone,
      email,
      isMain,
    });

    revalidatePath('/dashboard/branches');
    revalidatePath(`/dashboard/branches/${branchId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء حفظ بيانات الفرع' };
  }
}

