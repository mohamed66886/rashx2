'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  ProviderRepository,
  EmployeeRepository,
  hasPermission,
} from '@/lib/firebase-server';

export async function createProviderAction(
  employeeId: string,
  formData: FormData
): Promise<{ success: boolean; providerId?: string; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'providers.manage')) {
    return { success: false, error: 'لا تملك صلاحية تسجيل ملف مقدم خدمة' };
  }

  const displayNameAr = (formData.get('displayNameAr') as string)?.trim();
  const displayNameEn = (formData.get('displayNameEn') as string)?.trim() || undefined;
  const bioAr = (formData.get('bioAr') as string)?.trim() || undefined;
  const specialtiesRaw = (formData.get('specialties') as string)?.trim();
  const isPubliclyVisible = formData.get('isPubliclyVisible') === 'true';

  const specialties = specialtiesRaw
    ? specialtiesRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  try {
    const employeeRepo = new EmployeeRepository();
    const emp = await employeeRepo.getEmployeeById(session.tenant.tenantId, employeeId);
    if (!emp) {
      return { success: false, error: 'الموظف المحدد غير موجود' };
    }

    const providerRepo = new ProviderRepository();
    const provider = await providerRepo.createProvider(
      session.tenant.tenantId,
      {
        employeeId,
        displayNameAr,
        displayNameEn,
        bioAr,
        specialties,
        assignedBranchIds: emp.assignedBranchIds,
        assignedServiceIds: [],
        isPubliclyVisible,
      },
      session.user.uid
    );

    revalidatePath('/dashboard/providers');
    revalidatePath('/dashboard/employees');
    revalidatePath(`/dashboard/employees/${employeeId}`);
    return { success: true, providerId: provider.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء إنشاء ملف مقدم الخدمة' };
  }
}

export async function updateProviderAction(
  providerId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'providers.manage')) {
    return { success: false, error: 'لا تملك صلاحية تعديل ملف مقدم الخدمة' };
  }

  const displayNameAr = (formData.get('displayNameAr') as string)?.trim();
  const displayNameEn = (formData.get('displayNameEn') as string)?.trim() || undefined;
  const bioAr = (formData.get('bioAr') as string)?.trim() || undefined;
  const specialtiesRaw = (formData.get('specialties') as string)?.trim();
  const isPubliclyVisible = formData.get('isPubliclyVisible') === 'true';
  const status = (formData.get('status') as any) || undefined;

  const specialties = specialtiesRaw !== undefined
    ? specialtiesRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

  try {
    const providerRepo = new ProviderRepository();
    await providerRepo.updateProvider(
      session.tenant.tenantId,
      providerId,
      {
        displayNameAr,
        displayNameEn,
        bioAr,
        specialties,
        isPubliclyVisible,
        status,
      },
      session.user.uid
    );

    revalidatePath('/dashboard/providers');
    revalidatePath(`/dashboard/providers/${providerId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء تعديل بيانات مقدم الخدمة' };
  }
}

export async function assignServicesAction(
  providerId: string,
  assignedServiceIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'providers.assign_services')) {
    return { success: false, error: 'لا تملك صلاحية إسناد الخدمات لمقدم الخدمة' };
  }

  try {
    const providerRepo = new ProviderRepository();
    await providerRepo.assignServices(
      session.tenant.tenantId,
      providerId,
      assignedServiceIds,
      session.user.uid
    );

    revalidatePath('/dashboard/providers');
    revalidatePath(`/dashboard/providers/${providerId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء ربط الخدمات' };
  }
}
