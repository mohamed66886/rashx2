'use client';

import { useState, useId, type FormEvent } from 'react';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Send,
  Phone,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Globe,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface GetStartedFormData {
  fullName: string;
  facilityName: string;
  subdomain: string;
  city: string;
  phone: string;
  email: string;
  teamSize: string;
}

export interface GetStartedFormProps {
  lang: Lang;
  className?: string;
  onSubmit?: (data: GetStartedFormData) => Promise<void>;
}

type FormStatus = 'idle' | 'submitting' | 'submitted' | 'unsupported' | 'error';

export function GetStartedForm({ lang, className, onSubmit }: GetStartedFormProps) {
  const isAr = lang === 'ar';
  const formId = useId();

  const [formData, setFormData] = useState<GetStartedFormData>({
    fullName: '',
    facilityName: '',
    subdomain: '',
    city: 'riyadh',
    phone: '',
    email: '',
    teamSize: '1-5',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GetStartedFormData, string>>>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const cityOptions = isAr
    ? [
        { value: 'riyadh', label: 'الرياض' },
        { value: 'jeddah', label: 'جدة' },
        { value: 'dammam', label: 'الدمام والخبر' },
        { value: 'makkah', label: 'مكة المكرمة' },
        { value: 'madinah', label: 'المدينة المنورة' },
        { value: 'other', label: 'مدينة أخرى في المملكة' },
      ]
    : [
        { value: 'riyadh', label: 'Riyadh' },
        { value: 'jeddah', label: 'Jeddah' },
        { value: 'dammam', label: 'Dammam & Khobar' },
        { value: 'makkah', label: 'Makkah' },
        { value: 'madinah', label: 'Madinah' },
        { value: 'other', label: 'Other Saudi City' },
      ];

  const teamSizeOptions = isAr
    ? [
        { value: '1-5', label: '1 - 5 مقدمي خدمة' },
        { value: '6-15', label: '6 - 15 مقدم خدمة' },
        { value: '16-30', label: '16 - 30 مقدم خدمة' },
        { value: '30+', label: 'أكثر من 30 (سلسلة / مركز متكامل)' },
      ]
    : [
        { value: '1-5', label: '1 - 5 Specialists' },
        { value: '6-15', label: '6 - 15 Specialists' },
        { value: '16-30', label: '16 - 30 Specialists' },
        { value: '30+', label: '30+ Specialists (Multi-Branch/Center)' },
      ];

  const t = isAr
    ? {
        eyebrow: 'نموذج تهيئة المنظومة الرقمية',
        title: 'احجز مساحة صالونك السحابية وابدأ الإعداد',
        subtitle: 'أدخل بيانات منشأتك والنطاق الفرعي المطلوب لبدء إعداد الموقع ولوحة التحكم وفريق العمل.',
        fields: {
          fullName: { label: 'اسم المسؤول / المالك', placeholder: 'مثال: نورة السالم' },
          facilityName: { label: 'اسم الصالون أو المركز', placeholder: 'مثال: صالون رقة وجمال' },
          subdomain: {
            label: 'النطاق الفرعي المطلوب (Subdomain)',
            placeholder: 'salon-name',
            hint: 'سيكون رابط موقعك ولوحة التحكم: https://[subdomain].rashx.org',
          },
          city: { label: 'المدينة' },
          phone: { label: 'رقم الجوال للتواصل والربط', placeholder: '05X XXX XXXX أو +966' },
          email: { label: 'البريد الإلكتروني المعتمد للإدارة', placeholder: 'owner@salon.com' },
          teamSize: { label: 'حجم طاقم العمل ومقدمي الخدمات' },
        },
        buttons: {
          submit: 'تأكيد حجز المساحة وبدء التهيئة',
          submitting: 'جاري حجز النطاق والتحقق...',
          edit: 'تعديل البيانات',
          callDirect: 'تفعيل فوري عبر الهاتف (+966 54 808 2945)',
        },
        validation: {
          fullNameRequired: 'يرجى إدخال اسم المسؤول أو المالك.',
          facilityNameRequired: 'يرجى إدخال اسم الصالون أو المركز.',
          subdomainRequired: 'يرجى تحديد النطاق الفرعي المطلوب بالأحرف الإنجليزية والأرقام فقط (مثال: lamasat-beauty).',
          phoneRequired: 'يرجى إدخال رقم جوال صالح (8 إلى 15 رقماً).',
          emailRequired: 'يرجى إدخال عنوان بريد إلكتروني صحيح للإدارة.',
        },
        unsupportedNotice: {
          title: 'جاهزية التفعيل المباشر مع فريق RASHX',
          description:
            'خدمة التهيئة المؤتمتة الفورية عبر الويب تخضع لجدول التفعيل النهائي. لتخصيص نطاقك الفرعي وحجز مساحة صالونك فوراً، يمكنك التواصل المباشر مع فريق التأسيس:',
          contactNumber: '+966 54 808 2945',
        },
        successNotice: {
          title: 'تم تسجيل بيانات التأسيس بنجاح',
          description:
            'شكراً لثقتك في RASHX. يقوم فريق التهيئة حالياً بحجز النطاق الفرعي وإعداد بيئة العمل الخاصة بصالونك، وسنتواصل معك خلال ساعات لإتمام التفعيل.',
        },
        errorNotice: {
          title: 'تعذر إرسال البيانات',
          description: 'حدث خطأ غير متوقع أثناء معالجة النموذج. يرجى إعادة المحاولة أو التواصل المباشر عبر الهاتف.',
        },
      }
    : {
        eyebrow: 'ONBOARDING REGISTRATION',
        title: 'Reserve Your Cloud Salon Space & Begin Setup',
        subtitle: 'Enter your business details and requested subdomain to initialize your website, dashboard, and team access.',
        fields: {
          fullName: { label: 'Owner / Manager Full Name', placeholder: 'e.g. Noura Al-Salem' },
          facilityName: { label: 'Salon / Facility Name', placeholder: 'e.g. Elegance Salon' },
          subdomain: {
            label: 'Requested Subdomain',
            placeholder: 'salon-name',
            hint: 'Your live portal URL will be: https://[subdomain].rashx.org',
          },
          city: { label: 'City' },
          phone: { label: 'Mobile Number for Admin Setup', placeholder: '+966 5X XXX XXXX' },
          email: { label: 'Administrative Email', placeholder: 'owner@salon.com' },
          teamSize: { label: 'Specialist & Staff Team Size' },
        },
        buttons: {
          submit: 'Confirm Reservation & Initialize Setup',
          submitting: 'Reserving Subdomain...',
          edit: 'Edit Details',
          callDirect: 'Immediate Onboarding Call (+966 54 808 2945)',
        },
        validation: {
          fullNameRequired: 'Full name is required.',
          facilityNameRequired: 'Salon name is required.',
          subdomainRequired: 'Please enter a valid subdomain using lowercase letters, numbers, and dashes (3-30 chars).',
          phoneRequired: 'Please enter a valid phone number (8-15 digits).',
          emailRequired: 'Please enter a valid email address.',
        },
        unsupportedNotice: {
          title: 'Direct Cloud Onboarding with Our Setup Engineers',
          description:
            'Direct automated tenant provisioning is undergoing final integration. To activate your private subdomain and workspace immediately, contact our setup specialists directly:',
          contactNumber: '+966 54 808 2945',
        },
        successNotice: {
          title: 'Registration Received Successfully',
          description:
            'Thank you for partnering with RASHX. Our onboarding engineers are reserving your subdomain and will reach out shortly to complete the launch.',
        },
        errorNotice: {
          title: 'Submission Error',
          description: 'An unexpected issue occurred. Please try again or reach out directly via phone.',
        },
      };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof GetStartedFormData, string>> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = t.validation.fullNameRequired;
    }

    if (!formData.facilityName.trim() || formData.facilityName.trim().length < 2) {
      newErrors.facilityName = t.validation.facilityNameRequired;
    }

    const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
    const cleanSubdomain = formData.subdomain.trim().toLowerCase();
    if (!cleanSubdomain || !subdomainRegex.test(cleanSubdomain)) {
      newErrors.subdomain = t.validation.subdomainRequired;
    }

    const phoneRegex = /^[+]?[0-9\s-]{8,20}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = t.validation.phoneRequired;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = t.validation.emailRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;
    if (!validate()) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      if (onSubmit) {
        await onSubmit(formData);
        setStatus('submitted');
      } else {
        await new Promise((resolve) => setTimeout(resolve, 350));
        setStatus('unsupported');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t.errorNotice.description);
    }
  };

  const handleChange = (
    field: keyof GetStartedFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  return (
    <section
      id="get-started-form"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-3xl">
          <SectionTitle
            eyebrow={t.eyebrow}
            title={t.title}
            align="center"
          />
          <p className="mt-4 text-base leading-relaxed text-[#75645B] max-w-2xl mx-auto text-center">
            {t.subtitle}
          </p>

          <div className="mt-10 sm:mt-12 rounded-3xl bg-[#FAF9F8] p-6 sm:p-10 lg:p-12">
            {status === 'submitted' && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-2xl bg-white p-6 sm:p-8 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF9F8] text-[#16A34A] mb-4">
                  <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-2">
                  {t.successNotice.title}
                </h3>
                <p className="text-base text-[#75645B] max-w-lg mx-auto leading-relaxed">
                  {t.successNotice.description}
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="tel:+966548082945"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-sm font-bold text-white hover:bg-[#75645B] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C78360]"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    <span>{t.buttons.callDirect}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-6 py-3 text-sm font-bold text-[#54453D] hover:bg-[#F0C5AE]/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C78360]"
                  >
                    <span>{t.buttons.edit}</span>
                  </button>
                </div>
              </div>
            )}

            {status === 'unsupported' && (
              <div
                role="region"
                aria-label="Direct Onboarding Activation"
                className="rounded-2xl bg-white p-6 sm:p-8 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0C5AE]/40 text-[#54453D] mb-4">
                  <Sparkles className="h-7 w-7 text-[#54453D]" aria-hidden="true" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-2">
                  {t.unsupportedNotice.title}
                </h3>
                <p className="text-base text-[#75645B] max-w-xl mx-auto leading-relaxed mb-6">
                  {t.unsupportedNotice.description}
                </p>

                <div className="rounded-2xl bg-[#FAF9F8] p-5 max-w-md mx-auto mb-6 text-center">
                  <p className="text-xs font-semibold text-[#75645B] mb-1">
                    {isAr ? 'خط تفعيل ومتابعة تهيئة المنشآت الجديد' : 'Direct Facility Provisioning Line'}
                  </p>
                  <a
                    href="tel:+966548082945"
                    dir="ltr"
                    className="inline-block text-xl sm:text-2xl font-black text-[#54453D] hover:text-[#C78360] transition-colors duration-200"
                  >
                    {t.unsupportedNotice.contactNumber}
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="tel:+966548082945"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-sm font-bold text-white hover:bg-[#75645B] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C78360]"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    <span>{t.buttons.callDirect}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#FAF9F8] px-6 py-3 text-sm font-bold text-[#54453D] hover:bg-[#F0C5AE]/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C78360]"
                  >
                    <span>{t.buttons.edit}</span>
                  </button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div
                role="alert"
                className="mb-8 rounded-2xl bg-red-50 p-5 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm text-red-800">
                  <h4 className="font-bold">{t.errorNotice.title}</h4>
                  <p className="mt-1 leading-relaxed">{errorMessage || t.errorNotice.description}</p>
                </div>
              </div>
            )}

            {status !== 'submitted' && status !== 'unsupported' && (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor={`${formId}-fullName`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.fullName.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${formId}-fullName`}
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder={t.fields.fullName.placeholder}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? `${formId}-fullName-err` : undefined}
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    />
                    {errors.fullName && (
                      <p id={`${formId}-fullName-err`} className="mt-1.5 text-xs text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Facility Name */}
                  <div>
                    <label
                      htmlFor={`${formId}-facilityName`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.facilityName.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${formId}-facilityName`}
                      type="text"
                      required
                      value={formData.facilityName}
                      onChange={(e) => handleChange('facilityName', e.target.value)}
                      placeholder={t.fields.facilityName.placeholder}
                      aria-invalid={Boolean(errors.facilityName)}
                      aria-describedby={errors.facilityName ? `${formId}-facilityName-err` : undefined}
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    />
                    {errors.facilityName && (
                      <p id={`${formId}-facilityName-err`} className="mt-1.5 text-xs text-red-600">
                        {errors.facilityName}
                      </p>
                    )}
                  </div>

                  {/* Subdomain */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`${formId}-subdomain`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.subdomain.label} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl bg-white px-4 py-2.5" dir="ltr">
                      <Globe className="h-4 w-4 text-[#A89F91] shrink-0 mr-2" aria-hidden="true" />
                      <input
                        id={`${formId}-subdomain`}
                        type="text"
                        required
                        value={formData.subdomain}
                        onChange={(e) => handleChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder={t.fields.subdomain.placeholder}
                        aria-invalid={Boolean(errors.subdomain)}
                        aria-describedby={errors.subdomain ? `${formId}-subdomain-err` : undefined}
                        className="w-full bg-transparent text-sm text-[#54453D] placeholder:text-[#A89F91] focus:outline-none"
                      />
                      <span className="text-xs sm:text-sm font-bold text-[#75645B] shrink-0 ml-2 select-none">
                        .rashx.org
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#75645B]">
                      {t.fields.subdomain.hint}
                    </p>
                    {errors.subdomain && (
                      <p id={`${formId}-subdomain-err`} className="mt-1.5 text-xs text-red-600">
                        {errors.subdomain}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor={`${formId}-city`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.city.label}
                    </label>
                    <select
                      id={`${formId}-city`}
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    >
                      {cityOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Team Size */}
                  <div>
                    <label
                      htmlFor={`${formId}-teamSize`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.teamSize.label}
                    </label>
                    <select
                      id={`${formId}-teamSize`}
                      value={formData.teamSize}
                      onChange={(e) => handleChange('teamSize', e.target.value)}
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    >
                      {teamSizeOptions.map((ts) => (
                        <option key={ts.value} value={ts.value}>
                          {ts.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor={`${formId}-phone`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.phone.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${formId}-phone`}
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder={t.fields.phone.placeholder}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? `${formId}-phone-err` : undefined}
                      dir="ltr"
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    />
                    {errors.phone && (
                      <p id={`${formId}-phone-err`} className="mt-1.5 text-xs text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor={`${formId}-email`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.email.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${formId}-email`}
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder={t.fields.email.placeholder}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? `${formId}-email-err` : undefined}
                      dir="ltr"
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    />
                    {errors.email && (
                      <p id={`${formId}-email-err`} className="mt-1.5 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#54453D] px-8 py-4 text-base font-bold text-white transition-colors duration-200 hover:bg-[#75645B] focus:outline-none focus:ring-2 focus:ring-[#C78360] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" aria-hidden="true" />
                    <span>{status === 'submitting' ? t.buttons.submitting : t.buttons.submit}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
