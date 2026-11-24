'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  EmployeeRepository,
  CompensationRepository,
  hasPermission,
  canManageCompensation,
  canTerminateEmployee,
} from '@/lib/firebase-server';
import type { EmployeeStatus, CompensationModelType } from '@rashx/database';

export async function createEmployeeAction(
  formData: FormData
): Promise<{ success: boolean; employeeId?: string; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'employees.create')) {
    return { success: false, error: 'لا تملك صلاحية إضافة موظف جديد' };
  }

  const fullNameAr = (formData.get('fullNameAr') as string)?.trim();
  const fullNameEn = (formData.get('fullNameEn') as string)?.trim() || undefined;
  const employeeNumber = (formData.get('employeeNumber') as string)?.trim() || undefined;
  const jobTitle = (formData.get('jobTitle') as string)?.trim();
  const department = (formData.get('department') as string)?.trim() || undefined;
  const employmentType = (formData.get('employmentType') as any) || 'FULL_TIME';
  const hireDate = (formData.get('hireDate') as string)?.trim();
  const primaryBranchId = (formData.get('primaryBranchId') as string)?.trim();
  const assignedBranchIdsRaw = formData.getAll('assignedBranchIds') as string[];
  const phone = (formData.get('phone') as string)?.trim();
  const email = (formData.get('email') as string)?.trim() || undefined;
  const nationalId = (formData.get('nationalId') as string)?.trim() || undefined;
  const isProvider = formData.get('isServiceProvider') === 'true';

  if (!fullNameAr || !jobTitle || !hireDate || !primaryBranchId || !phone) {
    return { success: false, error: 'يرجى استكمال جميع الحقول الإلزامية ورقم الهاتف' };
  }

  const assignedBranchIds = Array.from(new Set([primaryBranchId, ...assignedBranchIdsRaw.filter(Boolean)]));

  try {
    const employeeRepo = new EmployeeRepository();
    const employee = await employeeRepo.createEmployee(
      session.tenant.tenantId,
      {
        fullNameAr,
        fullNameEn,
        employeeNumber,
        jobTitle,
        department,
        employmentType,
        hireDate,
        primaryBranchId,
        assignedBranchIds,
        phone,
        email,
        nationalId,
        isProvider,
      },
      session.user.uid
    );

    revalidatePath('/dashboard/employees');
    return { success: true, employeeId: employee.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء حفظ بيانات الموظف' };
  }
}

export async function updateEmployeeAction(
  employeeId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'employees.update')) {
    return { success: false, error: 'لا تملك صلاحية تعديل بيانات الموظف' };
  }

  const fullNameAr = (formData.get('fullNameAr') as string)?.trim();
  const fullNameEn = (formData.get('fullNameEn') as string)?.trim() || undefined;
  const jobTitle = (formData.get('jobTitle') as string)?.trim();
  const department = (formData.get('department') as string)?.trim() || undefined;
  const employmentType = (formData.get('employmentType') as any) || undefined;
  const primaryBranchId = (formData.get('primaryBranchId') as string)?.trim();
  const assignedBranchIdsRaw = formData.getAll('assignedBranchIds') as string[];
  const phone = (formData.get('phone') as string)?.trim() || undefined;
  const email = (formData.get('email') as string)?.trim() || undefined;
  const nationalId = (formData.get('nationalId') as string)?.trim() || undefined;

  const assignedBranchIds = primaryBranchId
    ? Array.from(new Set([primaryBranchId, ...assignedBranchIdsRaw.filter(Boolean)]))
    : undefined;

  try {
    const employeeRepo = new EmployeeRepository();
    await employeeRepo.updateEmployee(
      session.tenant.tenantId,
      employeeId,
      {
        fullNameAr,
        fullNameEn,
        jobTitle,
        department,
        employmentType,
        primaryBranchId,
        assignedBranchIds,
        phone,
        email,
        nationalId,
      },
      session.user.uid
    );

    revalidatePath('/dashboard/employees');
    revalidatePath(`/dashboard/employees/${employeeId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء تعديل بيانات الموظف' };
  }
}

export async function setEmployeeStatusAction(
  employeeId: string,
  status: EmployeeStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'employees.update')) {
    return { success: false, error: 'لا تملك صلاحية تغيير حالة الموظف' };
  }

  if (status === 'TERMINATED') {
    return { success: false, error: 'يرجى استخدام خيار إنهاء الخدمة الرسمي لتوثيق تاريخ وسبب الإنهاء' };
  }

  try {
    const employeeRepo = new EmployeeRepository();
    await employeeRepo.setEmployeeStatus(
      session.tenant.tenantId,
      employeeId,
      status,
      session.user.uid,
      reason
    );

    revalidatePath('/dashboard/employees');
    revalidatePath(`/dashboard/employees/${employeeId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء تحديث حالة الموظف' };
  }
}

export async function terminateEmployeeAction(
  employeeId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!canTerminateEmployee(session.membership.role)) {
    return { success: false, error: 'صلاحية إنهاء الخدمة محصورة بمالك المنشأة فقط' };
  }

  const terminationDate = (formData.get('terminationDate') as string)?.trim();
  const reason = (formData.get('reason') as string)?.trim();
  const notes = (formData.get('notes') as string)?.trim() || undefined;

  if (!terminationDate || !reason) {
    return { success: false, error: 'يرجى تحديد تاريخ إنهاء الخدمة وسبب الإنهاء' };
  }

  try {
    const employeeRepo = new EmployeeRepository();
    await employeeRepo.terminateEmployee(
      session.tenant.tenantId,
      employeeId,
      {
        effectiveDate: terminationDate,
        reason,
        notes,
      },
      session.user.uid
    );

    revalidatePath('/dashboard/employees');
    revalidatePath(`/dashboard/employees/${employeeId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء توثيق إنهاء الخدمة' };
  }
}

export async function linkUserAction(
  employeeId: string,
  userUid: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!hasPermission(session.membership.role, 'employees.update')) {
    return { success: false, error: 'لا تملك صلاحية ربط حساب المستخدم' };
  }

  try {
    const employeeRepo = new EmployeeRepository();
    await employeeRepo.linkUser(
      session.tenant.tenantId,
      employeeId,
      userUid,
      session.user.uid
    );

    revalidatePath('/dashboard/employees');
    revalidatePath(`/dashboard/employees/${employeeId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء ربط حساب المستخدم' };
  }
}

export async function saveCompensationAction(
  employeeId: string,
  payload: {
    modelType: CompensationModelType;
    effectiveStartDate: string;
    effectiveEndDate?: string;
    fixed?: {
      baseSalaryHalalas: number;
      paymentFrequency?: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY';
    };
    commission?: {
      commissionBasis: 'SERVICE_REVENUE_PERCENTAGE' | 'PRODUCT_SALES_PERCENTAGE' | 'FIXED_AMOUNT_PER_SERVICE';
      commissionRateBps?: number;
      fixedAmountHalalas?: number;
    };
    hybrid?: {
      baseSalaryHalalas: number;
      serviceCommissionRateBps?: number;
    };
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح لك بتنفيذ هذه العملية' };
  }

  if (!canManageCompensation(session.membership.role)) {
    return { success: false, error: 'لا تملك صلاحية إدارة أو تعديل الهياكل المالية والرواتب' };
  }

  try {
    const compRepo = new CompensationRepository();
    await compRepo.createCompensation(
      session.tenant.tenantId,
      employeeId,
      {
        modelType: payload.modelType,
        effectiveStartDate: payload.effectiveStartDate,
        effectiveEndDate: payload.effectiveEndDate || null,
        fixed: payload.fixed,
        commission: payload.commission,
        hybrid: payload.hybrid,
        notes: payload.notes,
      },
      session.membership.role,
      session.user.uid
    );

    revalidatePath(`/dashboard/employees/${employeeId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء حفظ العقد المالي' };
  }
}
