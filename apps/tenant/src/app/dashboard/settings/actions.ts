'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { CompanyRepository } from '@/lib/firebase-server';

function formatErrorMessage(err: any, fallbackMessage: string): string {
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

export async function saveCompanyProfileAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح' };
  }

  if (session.membership.role !== 'OWNER') {
    return { success: false, error: 'تعديل ملف المنشأة القانوني مقتصر على مالك المنشأة (OWNER)' };
  }

  const legalNameAr = formData.get('legalNameAr') as string;
  const legalNameEn = (formData.get('legalNameEn') as string) || undefined;
  const legalForm = (formData.get('legalForm') as any) || 'SOLE_PROPRIETORSHIP';
  const crNumber = formData.get('crNumber') as string;
  const rawUnified = formData.get('unifiedEstablishmentNumber');
  const unifiedEstablishmentNumber =
    typeof rawUnified === 'string' && rawUnified.trim() !== ''
      ? rawUnified.trim()
      : null;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;

  const nationalAddress = {
    buildingNumber: formData.get('buildingNumber') as string,
    streetName: formData.get('streetName') as string,
    district: formData.get('district') as string,
    city: formData.get('city') as string,
    postalCode: formData.get('postalCode') as string,
    additionalNumber: (formData.get('additionalNumber') as string) || undefined,
    unitNumber: (formData.get('unitNumber') as string) || undefined,
  };

  try {
    const compRepo = new CompanyRepository();
    await compRepo.saveCompanyProfile(session.tenant.tenantId, {
      legalNameAr,
      legalNameEn,
      legalForm,
      crNumber,
      unifiedEstablishmentNumber,
      phone,
      email,
      nationalAddress,
    });

    revalidatePath('/dashboard/settings/profile');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatErrorMessage(err, 'حدث خطأ أثناء حفظ الملف القانوني') };
  }
}

export async function saveTaxSettingsAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح' };
  }

  if (session.membership.role !== 'OWNER') {
    return { success: false, error: 'تعديل الإعدادات الضريبية مقتصر على مالك المنشأة (OWNER)' };
  }

  const vatStatus = formData.get('vatStatus') as any;
  const rawVat = formData.get('vatNumber');
  const vatNumber =
    typeof rawVat === 'string' && rawVat.trim() !== ''
      ? rawVat.trim()
      : null;
  const isTaxInclusivePricing = formData.get('isTaxInclusivePricing') === 'true';

  try {
    const compRepo = new CompanyRepository();
    await compRepo.saveTaxSettings(session.tenant.tenantId, {
      vatStatus,
      vatNumber,
      isTaxInclusivePricing,
    });

    revalidatePath('/dashboard/settings/tax');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatErrorMessage(err, 'حدث خطأ أثناء حفظ الإعدادات الضريبية') };
  }
}

export async function saveGeneralSettingsAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح' };
  }

  if (session.membership.role !== 'OWNER' && session.membership.role !== 'MANAGER') {
    return { success: false, error: 'صلاحيات غير كافية' };
  }

  const timezone = formData.get('timezone') as string;
  const defaultLocale = formData.get('defaultLocale') as string;
  const calendarType = formData.get('calendarType') as any;
  const startOfWeek = formData.get('startOfWeek') as any;

  try {
    const compRepo = new CompanyRepository();
    await compRepo.saveGeneralSettings(session.tenant.tenantId, {
      timezone: 'Asia/Riyadh' as const,
      defaultLocale,
      calendarType,
      startOfWeek,
    });

    revalidatePath('/dashboard/settings/general');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء حفظ الإعدادات العامة' };
  }
}

export async function saveSeoSettingsAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    return { success: false, error: 'غير مصرح' };
  }

  const siteTitle = formData.get('siteTitle') as string;
  const siteDescription = formData.get('siteDescription') as string;
  const keywordsRaw = formData.get('keywords') as string;
  const indexingEnabled = formData.get('indexingEnabled') === 'true';

  const keywords = keywordsRaw
    ? keywordsRaw.split(',').map((k) => k.trim()).filter(Boolean)
    : [];

  try {
    const compRepo = new CompanyRepository();
    await compRepo.saveSeoSettings(session.tenant.tenantId, {
      siteTitle,
      siteDescription,
      keywords,
      indexingEnabled,
    });

    revalidatePath('/dashboard/settings/seo');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء حفظ إعدادات SEO' };
  }
}
