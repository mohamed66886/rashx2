'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  ServiceRepository,
  canManageServiceCommission,
  canManageServicePricing,
  canManageServiceStatus,
  hasPermission,
} from '@/lib/firebase-server';
import type { TaxMode } from '@rashx/database';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

function parseSarToHalalasStrict(sarStr: string): number {
  const trimmed = sarStr.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split('.');
  if (parts.length > 2) {
    throw new Error('صيغة السعر بالريال غير صالحة.');
  }
  if (parts.length === 2 && parts[1]!.length > 2) {
    throw new Error('السعر لا يمكن أن يحتوي على أجزاء من الهللة (الحد الأقصى خانتان عشريتان).');
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || isNaN(parsed)) {
    throw new Error('السعر بالريال يجب أن يكون رقماً صالحاً ومحدداً.');
  }
  if (parsed < 0) {
    throw new Error('السعر لا يمكن أن يكون سالباً.');
  }
  const halalas = Math.round(parsed * 100);
  if (!Number.isSafeInteger(halalas)) {
    throw new Error('السعر يتجاوز الحدود الرقمية الآمنة.');
  }
  return halalas;
}

export async function createServiceAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'جلسة العمل غير صالحة. يرجى تسجيل الدخول مجدداً.' };
  }

  const { tenant, membership, user } = session;

  const categoryId = formData.get('categoryId')?.toString().trim();
  const nameAr = formData.get('nameAr')?.toString().trim();
  const nameEn = formData.get('nameEn')?.toString().trim() || '';
  const descriptionAr = formData.get('descriptionAr')?.toString().trim() || '';
  const descriptionEn = formData.get('descriptionEn')?.toString().trim() || '';
  const imageUrl = formData.get('imageUrl')?.toString().trim() || '';

  const durationMinutesStr = formData.get('durationMinutes')?.toString().trim();
  const durationMinutes = durationMinutesStr ? parseInt(durationMinutesStr, 10) : 30;

  const bufferBeforeStr = formData.get('bufferBeforeMinutes')?.toString().trim();
  const bufferBeforeMinutes = bufferBeforeStr ? parseInt(bufferBeforeStr, 10) : 0;

  const bufferAfterStr = formData.get('bufferAfterMinutes')?.toString().trim();
  const bufferAfterMinutes = bufferAfterStr ? parseInt(bufferAfterStr, 10) : 0;

  // Base price in SAR: convert to Halalas strictly
  const basePriceSarStr = formData.get('basePriceSar')?.toString().trim();
  let basePriceHalalas = 0;
  if (basePriceSarStr) {
    try {
      basePriceHalalas = parseSarToHalalasStrict(basePriceSarStr);
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'السعر غير صالح' };
    }
  }

  const taxMode = (formData.get('taxMode')?.toString().trim() || 'TAX_INCLUSIVE') as TaxMode;
  const primaryBranchId = formData.get('primaryBranchId')?.toString().trim() || undefined;

  // Multiple assigned branches & providers
  const assignedBranchIds = formData.getAll('assignedBranchIds').map((v) => v.toString().trim()).filter(Boolean);
  const assignedProviderIds = formData.getAll('assignedProviderIds').map((v) => v.toString().trim()).filter(Boolean);

  const commissionPolicyId = formData.get('commissionPolicyId')?.toString().trim() || null;
  const displayOrderStr = formData.get('displayOrder')?.toString().trim();
  const displayOrder = displayOrderStr ? parseInt(displayOrderStr, 10) : 0;
  const isActive = formData.get('isActive') !== 'false';

  if (!nameAr) {
    return { success: false, error: 'اسم الخدمة بالعربية مطلوب.' };
  }
  if (!categoryId) {
    return { success: false, error: 'يجب اختيار تصنيف للخدمة.' };
  }
  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    return { success: false, error: 'مدة الخدمة يجب أن تكون أكبر من 0 دقائق.' };
  }
  if (isNaN(basePriceHalalas) || basePriceHalalas < 0) {
    return { success: false, error: 'السعر لا يمكن أن يكون سالباً.' };
  }

  try {
    const repo = new ServiceRepository();
    const service = await repo.createService(
      tenant.tenantId,
      {
        categoryId,
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        imageUrl,
        durationMinutes,
        bufferBeforeMinutes,
        bufferAfterMinutes,
        basePriceHalalas,
        taxMode,
        primaryBranchId,
        assignedBranchIds: assignedBranchIds.length > 0 ? assignedBranchIds : undefined,
        assignedProviderIds,
        commissionPolicyId,
        displayOrder,
        isActive,
      },
      user.uid,
      membership.role,
      (membership as any).customPermissions
    );

    revalidatePath('/dashboard/services');
    revalidatePath('/dashboard/service-categories');
    return { success: true, data: service };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'فشل إنشاء الخدمة.',
    };
  }
}

export async function updateServiceAction(
  serviceId: string,
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'جلسة العمل غير صالحة. يرجى تسجيل الدخول مجدداً.' };
  }

  const { tenant, membership, user } = session;

  const categoryId = formData.get('categoryId')?.toString().trim();
  const nameAr = formData.get('nameAr')?.toString().trim();
  const nameEn = formData.get('nameEn')?.toString().trim();
  const descriptionAr = formData.get('descriptionAr')?.toString().trim();
  const descriptionEn = formData.get('descriptionEn')?.toString().trim();
  const imageUrl = formData.get('imageUrl')?.toString().trim();

  const durationMinutesStr = formData.get('durationMinutes')?.toString().trim();
  const durationMinutes = durationMinutesStr ? parseInt(durationMinutesStr, 10) : undefined;

  const bufferBeforeStr = formData.get('bufferBeforeMinutes')?.toString().trim();
  const bufferBeforeMinutes = bufferBeforeStr ? parseInt(bufferBeforeStr, 10) : undefined;

  const bufferAfterStr = formData.get('bufferAfterMinutes')?.toString().trim();
  const bufferAfterMinutes = bufferAfterStr ? parseInt(bufferAfterStr, 10) : undefined;

  const basePriceSarStr = formData.get('basePriceSar')?.toString().trim();
  let basePriceHalalas: number | undefined = undefined;
  if (basePriceSarStr !== undefined && basePriceSarStr !== '') {
    try {
      basePriceHalalas = parseSarToHalalasStrict(basePriceSarStr);
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'السعر غير صالح' };
    }
  }

  const taxModeRaw = formData.get('taxMode')?.toString().trim();
  const taxMode = taxModeRaw ? (taxModeRaw as TaxMode) : undefined;

  const primaryBranchId = formData.get('primaryBranchId')?.toString().trim() || undefined;

  const assignedBranchIds = formData.getAll('assignedBranchIds').map((v) => v.toString().trim()).filter(Boolean);
  const assignedProviderIds = formData.getAll('assignedProviderIds').map((v) => v.toString().trim()).filter(Boolean);

  const commissionPolicyRaw = formData.get('commissionPolicyId');
  const commissionPolicyId =
    commissionPolicyRaw !== null
      ? commissionPolicyRaw.toString().trim() || null
      : undefined;

  const displayOrderStr = formData.get('displayOrder')?.toString().trim();
  const displayOrder = displayOrderStr ? parseInt(displayOrderStr, 10) : undefined;

  const isActiveRaw = formData.get('isActive');
  const isActive = isActiveRaw !== null ? isActiveRaw === 'true' : undefined;

  try {
    const repo = new ServiceRepository();
    const updated = await repo.updateService(
      tenant.tenantId,
      serviceId,
      {
        categoryId: categoryId || undefined,
        nameAr: nameAr || undefined,
        nameEn,
        descriptionAr,
        descriptionEn,
        imageUrl,
        durationMinutes,
        bufferBeforeMinutes,
        bufferAfterMinutes,
        basePriceHalalas,
        taxMode,
        primaryBranchId,
        assignedBranchIds: assignedBranchIds.length > 0 ? assignedBranchIds : undefined,
        assignedProviderIds: assignedProviderIds.length > 0 ? assignedProviderIds : undefined,
        commissionPolicyId,
        displayOrder,
        isActive,
      },
      user.uid,
      membership.role,
      (membership as any).customPermissions
    );

    revalidatePath('/dashboard/services');
    revalidatePath(`/dashboard/services/${serviceId}`);
    return { success: true, data: updated };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'فشل تعديل الخدمة.',
    };
  }
}

export async function toggleServiceStatusAction(
  serviceId: string,
  currentActive: boolean
): Promise<ActionResponse> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'جلسة العمل غير صالحة.' };
  }

  const { tenant, membership, user } = session;

  try {
    const repo = new ServiceRepository();
    await repo.setServiceStatus(
      tenant.tenantId,
      serviceId,
      !currentActive,
      user.uid,
      membership.role,
      (membership as any).customPermissions
    );

    revalidatePath('/dashboard/services');
    revalidatePath(`/dashboard/services/${serviceId}`);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'فشل تغيير حالة الخدمة.',
    };
  }
}

export async function deleteServiceAction(serviceId: string): Promise<ActionResponse> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'جلسة العمل غير صالحة.' };
  }

  const { tenant, membership, user } = session;

  try {
    const repo = new ServiceRepository();
    await repo.deleteService(tenant.tenantId, serviceId, user.uid, membership.role);

    revalidatePath('/dashboard/services');
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'فشل حذف الخدمة.',
    };
  }
}
