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
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import { demoData } from '@/data/commercial';

export interface DemoFormData {
  fullName: string;
  businessName: string;
  phone: string;
  email: string;
  businessType: string;
  branches: string;
  preferredTime: string;
  notes: string;
}

export interface DemoFormProps {
  lang: Lang;
  className?: string;
  onSubmit?: (data: DemoFormData) => Promise<void>;
}

type FormStatus = 'idle' | 'submitting' | 'submitted' | 'unsupported' | 'error';

export function DemoForm({ lang, className, onSubmit }: DemoFormProps) {
  const isAr = lang === 'ar';
  const formId = useId();

  const [formData, setFormData] = useState<DemoFormData>({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    businessType: 'women-salon',
    branches: '1',
    preferredTime: 'morning',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DemoFormData, string>>>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const t = isAr
    ? {
        eyebrow: 'نموذج حجز العرض التوضيحي',
        title: 'حدد بيانات منشأتك لتخصيص العرض الحي',
        subtitle: 'أدخل تفاصيل صالونك لنقوم بإعداد بيئة عرض تحاكي احتياجاتك وتوضّح كيفية إدارة عملك اليومي بمرونة.',
        fields: {
          fullName: { label: 'الاسم الكامل', placeholder: 'مثال: نورة السالم' },
          businessName: { label: 'اسم الصالون أو المركز', placeholder: 'مثال: مركز لمسة الجمال' },
          phone: { label: 'رقم الجوال للتنسيق', placeholder: '05X XXX XXXX أو +966' },
          email: { label: 'البريد الإلكتروني للعمل', placeholder: 'contact@salon.com' },
          businessType: { label: 'طبيعة النشاط' },
          branches: { label: 'عدد الفروع' },
          preferredTime: { label: 'الوقت المفضل للاجتماع' },
          notes: { label: 'أولوياتك أو أهداف محددة تود التركيز عليها (اختياري)', placeholder: 'مثال: التركيز على نظام الحجوزات ونقاط البيع السريعة...' },
        },
        buttons: {
          submit: 'طلب حجز العرض الحي',
          submitting: 'جاري تسجيل الطلب...',
          edit: 'تعديل البيانات',
          callDirect: 'حجز فوري عبر الهاتف (+966 54 808 2945)',
        },
        validation: {
          fullNameRequired: 'يرجى كتابة الاسم الكامل للمتابعة والتنسيق.',
          businessNameRequired: 'يرجى كتابة اسم المنشأة أو الصالون.',
          phoneRequired: 'يرجى إدخال رقم جوال صالح (8 إلى 15 رقماً).',
          emailRequired: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
        },
        unsupportedNotice: {
          title: 'جاهزية التنسيق المباشر مع فريق الخبراء',
          description:
            'نظام الاستقبال المباشر عبر المنصة في مرحلة التهيئة النهائية. لحجز موعد عرضك الحي فوراً دون انتظار، يمكنك الاتصال المباشر أو المراسلة عبر رقمنا الرسمي:',
          contactNumber: '+966 54 808 2945',
        },
        successNotice: {
          title: 'تم استلام طلب العرض الحي بنجاح',
          description:
            'شكراً لاهتمامك بمنظومة RASHX. سيتواصل معك أحد مستشارينا لتأكيد رابط الاجتماع الافتراضي وتنسيق الوقت المناسب.',
        },
        errorNotice: {
          title: 'تعذر إرسال الطلب',
          description: 'حدث خطأ غير متوقع أثناء معالجة النموذج. يرجى إعادة المحاولة أو التواصل المباشر عبر الهاتف.',
        },
      }
    : {
        eyebrow: 'SCHEDULE A DEMO',
        title: 'Enter Facility Details for a Tailored Walkthrough',
        subtitle: 'Provide your salon information so we can simulate an environment matching your operational workflows.',
        fields: {
          fullName: { label: 'Full Name', placeholder: 'e.g. Noura Al-Salem' },
          businessName: { label: 'Salon / Facility Name', placeholder: 'e.g. Elegance Beauty Center' },
          phone: { label: 'Mobile Number', placeholder: '+966 5X XXX XXXX' },
          email: { label: 'Business Email', placeholder: 'contact@salon.com' },
          businessType: { label: 'Facility Type' },
          branches: { label: 'Branches Count' },
          preferredTime: { label: 'Preferred Session Timing' },
          notes: { label: 'Operational Priorities (Optional)', placeholder: 'e.g. Focus on POS, staff commissions, and online bookings...' },
        },
        buttons: {
          submit: 'Request Live Demo',
          submitting: 'Scheduling Session...',
          edit: 'Edit Details',
          callDirect: 'Direct Call (+966 54 808 2945)',
        },
        validation: {
          fullNameRequired: 'Full name is required to coordinate the demo.',
          businessNameRequired: 'Facility name is required.',
          phoneRequired: 'Please enter a valid phone number (8-15 digits).',
          emailRequired: 'Please enter a valid business email address.',
        },
        unsupportedNotice: {
          title: 'Direct Scheduling with Our Product Team',
          description:
            'Direct web submission endpoints are undergoing scheduled calibration. To secure your live walkthrough immediately, contact our dedicated line directly:',
          contactNumber: '+966 54 808 2945',
        },
        successNotice: {
          title: 'Demo Request Received Successfully',
          description:
            'Thank you for your interest in RASHX. A product specialist will contact you shortly with meeting credentials.',
        },
        errorNotice: {
          title: 'Submission Error',
          description: 'An unexpected issue occurred. Please try again or reach out directly via phone.',
        },
      };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DemoFormData, string>> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = t.validation.fullNameRequired;
    }

    if (!formData.businessName.trim() || formData.businessName.trim().length < 2) {
      newErrors.businessName = t.validation.businessNameRequired;
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
    field: keyof DemoFormData,
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
      id="demo-form"
      className={`relative bg-[#FAF9F8] py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
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

          <div className="mt-10 sm:mt-12 rounded-3xl bg-white p-6 sm:p-10 lg:p-12">
            {status === 'submitted' && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-2xl bg-[#F0C5AE]/20 p-6 sm:p-8 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#16A34A] mb-4">
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
                aria-label="Direct Demo Scheduling"
                className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8 text-center"
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

                <div className="rounded-2xl bg-white p-5 max-w-md mx-auto mb-6 text-center">
                  <p className="text-xs font-semibold text-[#75645B] mb-1">
                    {isAr ? 'رقم التنسيق المباشر لخدمة العملاء والاشتراكات' : 'Direct Product & Demo Coordination Line'}
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
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#54453D] hover:bg-[#F0C5AE]/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C78360]"
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
                      className="w-full rounded-xl bg-[#FAF9F8] px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    />
                    {errors.fullName && (
                      <p id={`${formId}-fullName-err`} className="mt-1.5 text-xs text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Business Name */}
                  <div>
                    <label
                      htmlFor={`${formId}-businessName`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.businessName.label} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${formId}-businessName`}
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => handleChange('businessName', e.target.value)}
                      placeholder={t.fields.businessName.placeholder}
                      aria-invalid={Boolean(errors.businessName)}
                      aria-describedby={errors.businessName ? `${formId}-businessName-err` : undefined}
                      className="w-full rounded-xl bg-[#FAF9F8] px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    />
                    {errors.businessName && (
                      <p id={`${formId}-businessName-err`} className="mt-1.5 text-xs text-red-600">
                        {errors.businessName}
                      </p>
                    )}
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
                      className="w-full rounded-xl bg-[#FAF9F8] px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
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
                      className="w-full rounded-xl bg-[#FAF9F8] px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    />
                    {errors.email && (
                      <p id={`${formId}-email-err`} className="mt-1.5 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Business Type */}
                  <div>
                    <label
                      htmlFor={`${formId}-businessType`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.businessType.label}
                    </label>
                    <select
                      id={`${formId}-businessType`}
                      value={formData.businessType}
                      onChange={(e) => handleChange('businessType', e.target.value)}
                      className="w-full rounded-xl bg-[#FAF9F8] px-4 py-3 text-sm text-[#54453D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    >
                      {demoData.businessTypes.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label[lang]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Branches Count */}
                  <div>
                    <label
                      htmlFor={`${formId}-branches`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.branches.label}
                    </label>
                    <select
                      id={`${formId}-branches`}
                      value={formData.branches}
                      onChange={(e) => handleChange('branches', e.target.value)}
                      className="w-full rounded-xl bg-[#FAF9F8] px-4 py-3 text-sm text-[#54453D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    >
                      {demoData.branchOptions.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label[lang]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preferred Time */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`${formId}-preferredTime`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.preferredTime.label}
                    </label>
                    <select
                      id={`${formId}-preferredTime`}
                      value={formData.preferredTime}
                      onChange={(e) => handleChange('preferredTime', e.target.value)}
                      className="w-full rounded-xl bg-[#FAF9F8] px-4 py-3 text-sm text-[#54453D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
                    >
                      {demoData.preferredTimes.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label[lang]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`${formId}-notes`}
                      className="block text-sm font-semibold text-[#54453D] mb-2"
                    >
                      {t.fields.notes.label}
                    </label>
                    <textarea
                      id={`${formId}-notes`}
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder={t.fields.notes.placeholder}
                      className="w-full rounded-xl bg-[#FAF9F8] px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150 resize-y"
                    />
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
