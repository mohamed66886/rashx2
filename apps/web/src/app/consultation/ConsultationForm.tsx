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

export interface ConsultationFormData {
  fullName: string;
  facilityName: string;
  focusArea: string;
  clientVolume: string;
  preferredTime: string;
  phone: string;
  email: string;
  notes: string;
}

export interface ConsultationFormProps {
  lang: Lang;
  className?: string;
  onSubmit?: (data: ConsultationFormData) => Promise<void>;
}

type FormStatus = 'idle' | 'submitting' | 'submitted' | 'unsupported' | 'error';

export function ConsultationForm({ lang, className, onSubmit }: ConsultationFormProps) {
  const isAr = lang === 'ar';
  const formId = useId();

  const [formData, setFormData] = useState<ConsultationFormData>({
    fullName: '',
    facilityName: '',
    focusArea: 'booking',
    clientVolume: '20-50',
    preferredTime: 'morning',
    phone: '',
    email: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ConsultationFormData, string>>>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const focusOptions = isAr
    ? [
        { value: 'booking', label: 'تنظيم الحجوزات ومنع تعارض المواعيد' },
        { value: 'commissions', label: 'حساب عمولات الكوافيرات ومقدمي الخدمات' },
        { value: 'pos-zatca', label: 'نقاط البيع والامتثال للفوترة ZATCA' },
        { value: 'branding-website', label: 'إطلاق موقع إلكتروني وتطبيق للعملاء' },
        { value: 'multibranch', label: 'إدارة سلاسل الفروع المتعددة والمخزون' },
        { value: 'general', label: 'مراجعة شاملة لكافة العمليات التشغيلية' },
      ]
    : [
        { value: 'booking', label: 'Appointment Scheduling & Conflict Prevention' },
        { value: 'commissions', label: 'Stylist & Specialist Commission Automation' },
        { value: 'pos-zatca', label: 'POS Checkout & ZATCA E-Invoicing' },
        { value: 'branding-website', label: 'Salon Website & Customer Booking Engine' },
        { value: 'multibranch', label: 'Multi-Branch Management & Inventory' },
        { value: 'general', label: 'Comprehensive Operational Assessment' },
      ];

  const volumeOptions = isAr
    ? [
        { value: 'under-20', label: 'أقل من 20 عميلة يومياً' },
        { value: '20-50', label: 'من 20 إلى 50 عميلة يومياً' },
        { value: '50-100', label: 'من 50 إلى 100 عميلة يومياً' },
        { value: '100+', label: 'أكثر من 100 عميلة يومياً (حجم مرتفع)' },
      ]
    : [
        { value: 'under-20', label: 'Under 20 Clients Daily' },
        { value: '20-50', label: '20 - 50 Clients Daily' },
        { value: '50-100', label: '50 - 100 Clients Daily' },
        { value: '100+', label: '100+ Clients Daily (High Volume)' },
      ];

  const timeOptions = isAr
    ? [
        { value: 'morning', label: 'الفترة الصباحية (10 ص - 1 م)' },
        { value: 'afternoon', label: 'الفترة المسائية (2 م - 6 م)' },
        { value: 'evening', label: 'الفترة الليلية (7 م - 10 م)' },
      ]
    : [
        { value: 'morning', label: 'Morning (10 AM - 1 PM)' },
        { value: 'afternoon', label: 'Afternoon (2 PM - 6 PM)' },
        { value: 'evening', label: 'Evening (7 PM - 10 PM)' },
      ];

  const t = isAr
    ? {
        fields: {
          fullName: { label: 'اسم المسؤول / المالك', placeholder: 'مثال: مشاعل السبيعي' },
          facilityName: { label: 'اسم الصالون أو المركز', placeholder: 'مثال: صالون لمسة جمال' },
          focusArea: { label: 'أبرز محور تود التركيز عليه في الجلسة' },
          clientVolume: { label: 'متوسط تدفق العملاء الحالي' },
          preferredTime: { label: 'الوقت المفضل للاتصال والاستشارة' },
          phone: { label: 'رقم الجوال للتواصل', placeholder: '05X XXX XXXX أو +966' },
          email: { label: 'البريد الإلكتروني للعمل', placeholder: 'owner@salon.com' },
          notes: { label: 'تحديات محددة تواجهها حالياً (اختياري)', placeholder: 'اذكر أي معوقات تشغيلية تود مناقشتها مع المستشار...' },
        },
        buttons: {
          submit: 'طلب حجز الجلسة الاستشارية المجانية',
          submitting: 'جاري حجز موعد الاستشارة...',
          edit: 'تعديل البيانات',
          callDirect: 'حجز فوري عبر الهاتف (+966 54 808 2945)',
        },
        validation: {
          fullNameRequired: 'يرجى كتابة اسم المسؤول.',
          facilityNameRequired: 'يرجى كتابة اسم الصالون أو المركز.',
          phoneRequired: 'يرجى إدخال رقم جوال صالح (8 إلى 15 رقماً).',
          emailRequired: 'يرجى إدخال بريد إلكتروني صحيح.',
        },
        unsupportedNotice: {
          title: 'التنسيق الفوري مع مستشار العمليات',
          description:
            'تم تسجيل رغبتك بالاستشارة. للتنسيق اللحظي وتحديد موعد الجلسة اليوم دون انتظار، يمكنك الاتصال المباشر بخط الاستشارات:',
          contactNumber: '+966 54 808 2945',
        },
        successNotice: {
          title: 'تم تسجيل طلب الاستشارة بنجاح',
          description:
            'شكراً لاهتمامك. سيتواصل معك أحد خبراء العمليات في RASHX لتأكيد موعد الجلسة الاستشارية الافتراضية عبر الهاتف.',
        },
        errorNotice: {
          title: 'تعذر إرسال الطلب',
          description: 'حدث خطأ غير متوقع أثناء معالجة النموذج. يرجى إعادة المحاولة أو التواصل المباشر عبر الهاتف.',
        },
      }
    : {
        fields: {
          fullName: { label: 'Owner / Manager Full Name', placeholder: 'e.g. Mashael Al-Subaie' },
          facilityName: { label: 'Salon / Facility Name', placeholder: 'e.g. Glamour Lounge' },
          focusArea: { label: 'Primary Advisory Focus' },
          clientVolume: { label: 'Current Daily Client Flow' },
          preferredTime: { label: 'Preferred Consultation Timing' },
          phone: { label: 'Mobile Number', placeholder: '+966 5X XXX XXXX' },
          email: { label: 'Business Email', placeholder: 'owner@salon.com' },
          notes: { label: 'Current Operational Challenges (Optional)', placeholder: 'Describe bottlenecks you want to resolve...' },
        },
        buttons: {
          submit: 'Schedule Free Advisory Session',
          submitting: 'Scheduling...',
          edit: 'Edit Details',
          callDirect: 'Direct Call (+966 54 808 2945)',
        },
        validation: {
          fullNameRequired: 'Full name is required.',
          facilityNameRequired: 'Facility name is required.',
          phoneRequired: 'Please enter a valid phone number (8-15 digits).',
          emailRequired: 'Please enter a valid email address.',
        },
        unsupportedNotice: {
          title: 'Direct Advisory Line',
          description:
            'Your consultation request is registered. For immediate session confirmation, dial our direct advisory desk directly:',
          contactNumber: '+966 54 808 2945',
        },
        successNotice: {
          title: 'Consultation Request Confirmed',
          description:
            'Thank you for reaching out. A RASHX workflow advisor will contact you to confirm your virtual meeting time.',
        },
        errorNotice: {
          title: 'Submission Error',
          description: 'An unexpected issue occurred. Please try again or reach out directly via phone.',
        },
      };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ConsultationFormData, string>> = {};

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

  const handleChange = (field: keyof ConsultationFormData, value: string) => {
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
        <div role="region" aria-label="Direct Consultation Coordination" className="rounded-2xl bg-white p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0C5AE]/40 text-[#54453D] mb-4">
            <Sparkles className="h-7 w-7 text-[#54453D]" aria-hidden="true" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-2">{t.unsupportedNotice.title}</h3>
          <p className="text-base text-[#75645B] max-w-xl mx-auto leading-relaxed mb-6">{t.unsupportedNotice.description}</p>

          <div className="rounded-2xl bg-[#FAF9F8] p-5 max-w-md mx-auto mb-6 text-center">
            <p className="text-xs font-semibold text-[#75645B] mb-1">
              {isAr ? 'رقم التنسيق المباشر لجلسات الاستشارات والتشغيل' : 'Direct Advisory Coordination Line'}
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

            {/* Focus Area */}
            <div>
              <label htmlFor={`${formId}-focusArea`} className="block text-sm font-semibold text-[#54453D] mb-2">
                {t.fields.focusArea.label}
              </label>
              <select
                id={`${formId}-focusArea`}
                value={formData.focusArea}
                onChange={(e) => handleChange('focusArea', e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
              >
                {focusOptions.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Client Volume */}
            <div>
              <label htmlFor={`${formId}-clientVolume`} className="block text-sm font-semibold text-[#54453D] mb-2">
                {t.fields.clientVolume.label}
              </label>
              <select
                id={`${formId}-clientVolume`}
                value={formData.clientVolume}
                onChange={(e) => handleChange('clientVolume', e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
              >
                {volumeOptions.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
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

            {/* Preferred Time */}
            <div className="sm:col-span-2">
              <label htmlFor={`${formId}-preferredTime`} className="block text-sm font-semibold text-[#54453D] mb-2">
                {t.fields.preferredTime.label}
              </label>
              <select
                id={`${formId}-preferredTime`}
                value={formData.preferredTime}
                onChange={(e) => handleChange('preferredTime', e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] focus:outline-none focus:ring-2 focus:ring-[#C78360] transition-colors duration-150"
              >
                {timeOptions.map((tm) => (
                  <option key={tm.value} value={tm.value}>{tm.label}</option>
                ))}
              </select>
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

