'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  CommissionPolicyRepository,
  hasPermission,
} from '@/lib/firebase-server';
import type { CommissionPolicyType, CommissionPolicyBasis } from '@rashx/database';

export async function createPolicyAction(
  formData: FormData
): Promise<{ success: boolean; policyId?: string; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'policies.manage')) {
    return { success: false, error: 'لا تملك صلاحية إدارة سياسات العمولات' };
  }

  const nameAr = (formData.get('nameAr') as string)?.trim();
  const nameEn = (formData.get('nameEn') as string)?.trim() || undefined;
  const description = (formData.get('description') as string)?.trim() || undefined;
  const type = (formData.get('type') as CommissionPolicyType) || 'SERVICE';
  const basis = (formData.get('basis') as CommissionPolicyBasis) || 'PERCENTAGE_OF_REVENUE';
  const ratePercentRaw = formData.get('ratePercent') as string;
  const effectiveFrom = (formData.get('effectiveFrom') as string)?.trim() || new Date().toISOString().split('T')[0]!;

  const rateBps = ratePercentRaw ? Math.round(parseFloat(ratePercentRaw) * 100) : undefined;

  if (!nameAr || !type || !basis) {
    return { success: false, error: 'يرجى استكمال جميع بيانات السياسة الإلزامية' };
  }

  try {
    const policyRepo = new CommissionPolicyRepository();
    const policy = await policyRepo.createPolicy(
      session.tenant.tenantId,
      {
        nameAr,
        nameEn,
        description,
        type,
        basis,
        rateBps,
        effectiveFrom,
        applicableServiceIds: [],
        branchScope: [],
      },
      session.user.uid
    );

    revalidatePath('/dashboard/commission-policies');
    return { success: true, policyId: policy.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء حفظ سياسة العمولة' };
  }
}

export async function updatePolicyAction(
  policyId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'policies.manage')) {
    return { success: false, error: 'لا تملك صلاحية إدارة سياسات العمولات' };
  }

  const nameAr = (formData.get('nameAr') as string)?.trim();
  const nameEn = (formData.get('nameEn') as string)?.trim() || undefined;
  const description = (formData.get('description') as string)?.trim() || undefined;
  const ratePercentRaw = formData.get('ratePercent') as string;
  const isActive = formData.get('isActive') === 'true';

  const rateBps = ratePercentRaw ? Math.round(parseFloat(ratePercentRaw) * 100) : undefined;

  try {
    const policyRepo = new CommissionPolicyRepository();
    await policyRepo.updatePolicy(
      session.tenant.tenantId,
      policyId,
      {
        nameAr,
        nameEn,
        description,
        rateBps,
        isActive,
      },
      session.user.uid
    );

    revalidatePath('/dashboard/commission-policies');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء تعديل سياسة العمولة' };
  }
}
