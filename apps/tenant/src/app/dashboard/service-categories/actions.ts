'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { ServiceCategoryRepository } from '@/lib/firebase-server';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createCategoryAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'جلسة العمل غير صالحة. يرجى تسجيل الدخول مجدداً.' };
  }

  const { tenant, membership, user } = session;
  const nameAr = formData.get('nameAr')?.toString().trim();
  const nameEn = formData.get('nameEn')?.toString().trim() || '';
  const descriptionAr = formData.get('descriptionAr')?.toString().trim() || '';
  const descriptionEn = formData.get('descriptionEn')?.toString().trim() || '';
  const imageUrl = formData.get('imageUrl')?.toString().trim() || '';
  const displayOrderStr = formData.get('displayOrder')?.toString().trim();
  const displayOrder = displayOrderStr ? parseInt(displayOrderStr, 10) : 0;
  const isActive = formData.get('isActive') !== 'false';

  if (!nameAr) {
    return { success: false, error: 'اسم التصنيف بالعربية مطلوب.' };
  }

  try {
    const repo = new ServiceCategoryRepository();
    const category = await repo.createCategory(
      tenant.tenantId,
      {
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        imageUrl,
        displayOrder,
        isActive,
      },
      user.uid,
      membership.role
    );

    revalidatePath('/dashboard/service-categories');
    revalidatePath('/dashboard/services');
    return { success: true, data: category };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'فشل إنشاء التصنيف.',
    };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'جلسة العمل غير صالحة. يرجى تسجيل الدخول مجدداً.' };
  }

  const { tenant, membership, user } = session;
  const nameAr = formData.get('nameAr')?.toString().trim();
  const nameEn = formData.get('nameEn')?.toString().trim();
  const descriptionAr = formData.get('descriptionAr')?.toString().trim();
  const descriptionEn = formData.get('descriptionEn')?.toString().trim();
  const imageUrl = formData.get('imageUrl')?.toString().trim();
  const displayOrderStr = formData.get('displayOrder')?.toString().trim();
  const displayOrder = displayOrderStr ? parseInt(displayOrderStr, 10) : undefined;
  const isActive = formData.get('isActive') !== null ? formData.get('isActive') === 'true' : undefined;

  try {
    const repo = new ServiceCategoryRepository();
    const updated = await repo.updateCategory(
      tenant.tenantId,
      categoryId,
      {
        nameAr: nameAr || undefined,
        nameEn,
        descriptionAr,
        descriptionEn,
        imageUrl,
        displayOrder,
        isActive,
      },
      user.uid,
      membership.role
    );

    revalidatePath('/dashboard/service-categories');
    revalidatePath('/dashboard/services');
    return { success: true, data: updated };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'فشل تعديل التصنيف.',
    };
  }
}

export async function toggleCategoryStatusAction(
  categoryId: string,
  currentActive: boolean
): Promise<ActionResponse> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'جلسة العمل غير صالحة.' };
  }

  const { tenant, membership, user } = session;

  try {
    const repo = new ServiceCategoryRepository();
    await repo.setCategoryStatus(
      tenant.tenantId,
      categoryId,
      !currentActive,
      user.uid,
      membership.role
    );

    revalidatePath('/dashboard/service-categories');
    revalidatePath('/dashboard/services');
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'فشل تغيير حالة التصنيف.',
    };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResponse> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'جلسة العمل غير صالحة.' };
  }

  const { tenant, membership, user } = session;

  try {
    const repo = new ServiceCategoryRepository();
    await repo.deleteCategory(tenant.tenantId, categoryId, user.uid, membership.role);

    revalidatePath('/dashboard/service-categories');
    revalidatePath('/dashboard/services');
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'فشل حذف التصنيف.',
    };
  }
}
