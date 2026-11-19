'use client';

import { useState, useId, type FormEvent } from 'react';
import {
  Send,
  Phone,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface RegisterInterestFormData {
  fullName: string;
  facilityName: string;
  city: string;
  launchTimeline: string;
  phone: string;
  email: string;
  notes: string;
}

export interface RegisterInterestFormProps {
  lang: Lang;
  className?: string;
  onSubmit?: (data: RegisterInterestFormData) => Promise<void>;
}

type FormStatus = 'idle' | 'submitting' | 'submitted' | 'unsupported' | 'error';

export function RegisterInterestForm({ lang, className, onSubmit }: RegisterInterestFormProps) {
  const isAr = lang === 'ar';
  const formId = useId();

  const [formData, setFormData] = useState<RegisterInterestFormData>({
    fullName: '',
    facilityName: '',
    city: 'riyadh',
    launchTimeline: '1-month',
    phone: '',
    email: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInterestFormData, string>>>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const timelineOptions = isAr
    ? [
        { value: '1-month', label: 'خلال الشهر القادم (جاهز للتشغيل)' },
        { value: '3-months', label: 'خلال 1 إلى 3 أشهر' },
        { value: '6-months', label: 'خلال 3 إلى 6 أشهر' },
        { value: 'active-now', label: 'صالون قائم بالفعل وأرغب بالترقية' },
        { value: 'planning', label: 'في مرحلة دراسة الجدوى والتخطيط' },
      ]
    : [
        { value: '1-month', label: 'Within 1 Month (Ready to launch)' },
        { value: '3-months', label: 'Within 1 - 3 Months' },
        { value: '6-months', label: 'Within 3 - 6 Months' },
        { value: 'active-now', label: 'Currently Operating & Upgrading' },
        { value: 'planning', label: 'Planning & Feasibility Phase' },
      ];

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

  const t = isAr
    ? {
        fields: {
          fullName: { label: 'الاسم الكامل', placeholder: 'مثال: عبدالمجيد الغامدي' },
          facilityName: { label: 'اسم المنشأة أو المشروع', placeholder: 'مثال: صالون قيد التأسيس' },
          city: { label: 'المدينة' },
          launchTimeline: { label: 'الجدول الزمني المستهدف للافتتاح أو التحويل' },
          phone: { label: 'رقم الجوال للتواصل', placeholder: '05X XXX XXXX أو +966' },
          email: { label: 'البريد الإلكتروني للعمل', placeholder: 'contact@project.com' },
          notes: { label: 'ملاحظات إضافية حول نشاطك (اختياري)', placeholder: 'اذكر عدد الكراسي المتوقعة أو أي تفاصيل تشغيلية...' },
        },
        buttons: {
          submit: 'تسجيل الاهتمام والحصول على الأولوية',
          submitting: 'جاري تسجيل بياناتك...',
          edit: 'تعديل البيانات',
          callDirect: 'تواصل فوري عبر الهاتف (+966 54 808 2945)',
        },
        validation: {
          fullNameRequired: 'يرجى كتابة الاسم الكامل.',
          facilityNameRequired: 'يرجى كتابة اسم المنشأة أو المشروع.',
          phoneRequired: 'يرجى إدخال رقم جوال صالح (8 إلى 15 رقماً).',
          emailRequired: 'يرجى إدخال بريد إلكتروني صحيح.',
        },
        unsupportedNotice: {
          title: 'التواصل المباشر مع فريق التأسيس',
          description:
            'تم استلام طلبك ومشاركته مع فريق التأسيس والاشتراكات. للتنسيق السريع ومناقشة تفاصيل مشروعك دون انتظار، يمكنك الاتصال المباشر برقمنا المعتمد:',
          contactNumber: '+966 54 808 2945',
        },
        successNotice: {
          title: 'تم تسجيل اهتمامك بنجاح',
          description:
            'شكراً لاهتمامك بمنظومة RASHX. سيتواصل معك أحد مستشارينا لمناقشة أسبقية التفعيل وتقديم الدعم الاستشاري لمشروعك.',
        },
        errorNotice: {
          title: 'تعذر إرسال الطلب',
          description: 'حدث خطأ غير متوقع أثناء معالجة النموذج. يرجى إعادة المحاولة أو التواصل المباشر عبر الهاتف.',
        },
      }
    : {
        fields: {
          fullName: { label: 'Full Name', placeholder: 'e.g. Abdulmajeed Al-Ghamdi' },
          facilityName: { label: 'Facility / Project Name', placeholder: 'e.g. Aura Beauty Lounge' },
          city: { label: 'City' },
          launchTimeline: { label: 'Target Launch Timeline' },
          phone: { label: 'Mobile Number', placeholder: '+966 5X XXX XXXX' },
          email: { label: 'Business Email', placeholder: 'contact@project.com' },
          notes: { label: 'Additional Details (Optional)', placeholder: 'Estimated chair count, specialist roster, etc...' },
        },
        buttons: {
          submit: 'Register Interest for Priority Access',
          submitting: 'Registering...',
          edit: 'Edit Details',
          callDirect: 'Direct Call (+966 54 808 2945)',
        },
        validation: {
          fullNameRequired: 'Full name is required.',
          facilityNameRequired: 'Project name is required.',
          phoneRequired: 'Please enter a valid phone number (8-15 digits).',
          emailRequired: 'Please enter a valid email address.',
        },
        unsupportedNotice: {
          title: 'Direct Coordination with Our Launch Team',
          description:
            'Your interest registration has been queued. To discuss your project specifications immediately, reach out directly via our verified line:',
          contactNumber: '+966 54 808 2945',
        },
        successNotice: {
          title: 'Interest Registered Successfully',
          description:
            'Thank you for your interest in RASHX. A product specialist will contact you with early access information.',
        },
        errorNotice: {
          title: 'Submission Error',
          description: 'An unexpected issue occurred. Please try again or reach out directly via phone.',
        },
      };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterInterestFormData, string>> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = t.validation.fullNameRequired;
    }

    if (!formData.facilityName.trim() || formData.facilityName.trim().length < 2) {
      newErrors.facilityName = t.validation.facilityNameRequired;
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

  const handleChange = (field: keyof RegisterInterestFormData, value: string) => {
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
    <div className={`rounded-3xl bg-[#FAF9F8] p-6 sm:p-10 lg:p-12 ${className ?? ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {status === 'submitted' && (
        <div role="status" aria-live="polite" className="rounded-2xl bg-white p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF9F8] text-[#16A34A] mb-4">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-2">{t.successNotice.title}</h3>
          <p className="text-base text-[#75645B] max-w-lg mx-auto leading-relaxed">{t.successNotice.description}</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="tel:+966548082945"
              className="inline-flex items-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-sm font-bold text-white hover:bg-[#75645B] transition-colors duration-200"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>{t.buttons.callDirect}</span>
            </a>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-6 py-3 text-sm font-bold text-[#54453D] hover:bg-[#F0C5AE]/30 transition-colors duration-200"
            >
              <span>{t.buttons.edit}</span>
            </button>
          </div>
        </div>
      )}

      {status === 'unsupported' && (
        <div role="region" aria-label="Direct Registration Coordination" className="rounded-2xl bg-white p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0C5AE]/40 text-[#54453D] mb-4">
            <Sparkles className="h-7 w-7 text-[#54453D]" aria-hidden="true" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-2">{t.unsupportedNotice.title}</h3>
          <p className="text-base text-[#75645B] max-w-xl mx-auto leading-relaxed mb-6">{t.unsupportedNotice.description}</p>

          <div className="rounded-2xl bg-[#FAF9F8] p-5 max-w-md mx-auto mb-6 text-center">
            <p className="text-xs font-semibold text-[#75645B] mb-1">
              {isAr ? 'رقم التنسيق المعتمد لإدارة المشروعات والاشتراكات' : 'Direct Project Coordination Line'}
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
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-sm font-bold text-white hover:bg-[#75645B] transition-colors duration-200"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>{t.buttons.callDirect}</span>
            </a>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#FAF9F8] px-6 py-3 text-sm font-bold text-[#54453D] hover:bg-[#F0C5AE]/30 transition-colors duration-200"
            >
              <span>{t.buttons.edit}</span>
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div role="alert" className="mb-8 rounded-2xl bg-red-50 p-5 flex items-start gap-3">
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
              <label htmlFor={`${formId}-fullName`} className="block text-sm font-semibold text-[#54453D] mb-2">
                {t.fields.fullName.label} <span className="text-red-500">*</span>
              </label>
              <input
                id={`${formId}-fullName`}
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder={t.fields.fullName.placeholder}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
              />
              {errors.fullName && <p className="mt-1.5 text-xs text-red-600">{errors.fullName}</p>}
            </div>

            {/* Facility Name */}
            <div>
              <label htmlFor={`${formId}-facilityName`} className="block text-sm font-semibold text-[#54453D] mb-2">
                {t.fields.facilityName.label} <span className="text-red-500">*</span>
              </label>
              <input
                id={`${formId}-facilityName`}
                type="text"
                required
                value={formData.facilityName}
                onChange={(e) => handleChange('facilityName', e.target.value)}
                placeholder={t.fields.facilityName.placeholder}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
              />
              {errors.facilityName && <p className="mt-1.5 text-xs text-red-600">{errors.facilityName}</p>}
            </div>

            {/* City */}
            <div>
              <label htmlFor={`${formId}-city`} className="block text-sm font-semibold text-[#54453D] mb-2">
                {t.fields.city.label}
              </label>
              <select
                id={`${formId}-city`}
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
              >
                {cityOptions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Launch Timeline */}
            <div>
              <label htmlFor={`${formId}-launchTimeline`} className="block text-sm font-semibold text-[#54453D] mb-2">
                {t.fields.launchTimeline.label}
              </label>
              <select
                id={`${formId}-launchTimeline`}
                value={formData.launchTimeline}
                onChange={(e) => handleChange('launchTimeline', e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
              >
                {timelineOptions.map((tl) => (
                  <option key={tl.value} value={tl.value}>{tl.label}</option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor={`${formId}-phone`} className="block text-sm font-semibold text-[#54453D] mb-2">
                {t.fields.phone.label} <span className="text-red-500">*</span>
              </label>
              <input
                id={`${formId}-phone`}
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder={t.fields.phone.placeholder}
                dir="ltr"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
              />
              {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor={`${formId}-email`} className="block text-sm font-semibold text-[#54453D] mb-2">
                {t.fields.email.label} <span className="text-red-500">*</span>
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder={t.fields.email.placeholder}
                dir="ltr"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label htmlFor={`${formId}-notes`} className="block text-sm font-semibold text-[#54453D] mb-2">
                {t.fields.notes.label}
              </label>
              <textarea
                id={`${formId}-notes`}
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t.fields.notes.placeholder}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150 resize-y"
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
  );
}

