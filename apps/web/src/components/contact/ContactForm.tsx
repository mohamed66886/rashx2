'use client';

import { useState, useId, type FormEvent } from 'react';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Send,
  Phone,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Info,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface ContactFormData {
  fullName: string;
  businessName: string;
  phone: string;
  email: string;
  inquiryType: string;
  message: string;
}

export interface ContactFormProps {
  lang: Lang;
  className?: string;
  /** Optional submission handler for when a verified backend endpoint is provided */
  onSubmit?: (data: ContactFormData) => Promise<void>;
  /** Default selected topic ID if passed */
  initialTopic?: string;
}

type FormStatus = 'idle' | 'submitting' | 'submitted' | 'unsupported' | 'error';

export function ContactForm({
  lang,
  className,
  onSubmit,
  initialTopic = 'platform',
}: ContactFormProps) {
  const isAr = lang === 'ar';
  const formId = useId();

  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    inquiryType: initialTopic,
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const t = isAr
    ? {
        eyebrow: 'نموذج التواصل المباشر',
        title: 'أرسل لنا تفاصيل استفسارك',
        subtitle:
          'يرجى تزويدنا بالمعلومات الأساسية حول منشأتك وطبيعة استفسارك، لنوفر لك التوجيه المناسب بدقة.',
        fields: {
          fullName: {
            label: 'الاسم الكامل',
            placeholder: 'مثال: سارة العتيبي',
          },
          businessName: {
            label: 'اسم المنشأة أو الصالون',
            placeholder: 'مثال: صالون لمسة الأناقة',
          },
          phone: {
            label: 'رقم الجوال',
            placeholder: '05X XXX XXXX أو +966',
          },
          email: {
            label: 'البريد الإلكتروني',
            placeholder: 'name@business.com',
          },
          inquiryType: {
            label: 'نوع الاستفسار',
            options: [
              { value: 'platform', label: 'معلومات المنصة السحابية' },
              { value: 'subscription', label: 'استفسارات باقات الاشتراك' },
              { value: 'support', label: 'المساندة والدعم الفني' },
              { value: 'partnership', label: 'شراكات الأعمال والتكامل' },
              { value: 'general', label: 'استفسارات عامة أخرى' },
            ],
          },
          message: {
            label: 'تفاصيل الرسالة أو الاستفسار',
            placeholder: 'اكتب تفاصيل استفسارك هنا، وسنقوم بالاطلاع عليه بدقة...',
          },
        },
        buttons: {
          submit: 'إرسال الاستفسار',
          submitting: 'جاري التحقق والارسال...',
          edit: 'تعديل البيانات',
          callDirect: 'اتصال هاتفي مباشر (+966 54 808 2945)',
          telegramDirect: 'مراسلة عبر تيليجرام (@rashxsa)',
        },
        validation: {
          fullNameRequired: 'الاسم الكامل مطلوب (حرفان على الأقل).',
          businessNameRequired: 'اسم المنشأة أو الصالون مطلوب.',
          phoneRequired: 'يرجى إدخال رقم جوال صحيح (مثال: 05XXXXXXXX).',
          emailRequired: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
          inquiryTypeRequired: 'يرجى اختيار نوع الاستفسار.',
          messageRequired: 'يرجى كتابة رسالة توضيحية لا تقل عن 10 أحرف.',
        },
        integrationNotice: {
          title: 'تنبيه الربط التقني لقنوات الاستقبال',
          description:
            'خدمة إرسال النماذج التلقائية السحابية قيد الربط المؤسسي بقاعدة البيانات. ولضمان وصول استفسارك وموثوقية التواصل، لم يتم إرسال أو تخزين بياناتك على خادم غير معتمد. يمكنك التواصل الفوري معنا عبر قنواتنا المباشرة المعتمدة أدناه.',
        },
        successNotice: {
          title: 'تم استلام استفسارك بنجاح',
          description: 'شكرًا لتواصلك معنا. سنقوم بمراجعة طلبك والتواصل معك في أقرب وقت.',
        },
        errorNotice: {
          title: 'تعذر إرسال الاستفسار',
          description: 'حدث خطأ أثناء محاولة المعالجة. يرجى المحاولة لاحقًا أو الاتصال بنا مباشرة.',
        },
      }
    : {
        eyebrow: 'DIRECT INQUIRY FORM',
        title: 'Send Us Your Inquiry Details',
        subtitle:
          'Please provide essential information about your business and inquiry so we can offer tailored guidance.',
        fields: {
          fullName: {
            label: 'Full Name',
            placeholder: 'e.g., Sarah Al-Otaibi',
          },
          businessName: {
            label: 'Business or Salon Name',
            placeholder: 'e.g., Elegance Touch Salon',
          },
          phone: {
            label: 'Phone Number',
            placeholder: '05X XXX XXXX or +966',
          },
          email: {
            label: 'Email Address',
            placeholder: 'name@business.com',
          },
          inquiryType: {
            label: 'Inquiry Type',
            options: [
              { value: 'platform', label: 'Platform Information' },
              { value: 'subscription', label: 'Subscription Inquiries' },
              { value: 'support', label: 'Technical Support' },
              { value: 'partnership', label: 'Business Partnerships' },
              { value: 'general', label: 'Other General Inquiries' },
            ],
          },
          message: {
            label: 'Message Details',
            placeholder: 'Provide your detailed inquiry here...',
          },
        },
        buttons: {
          submit: 'Submit Inquiry',
          submitting: 'Validating & Submitting...',
          edit: 'Edit Details',
          callDirect: 'Call Directly (+966 54 808 2945)',
          telegramDirect: 'Message on Telegram (@rashxsa)',
        },
        validation: {
          fullNameRequired: 'Full name is required (at least 2 characters).',
          businessNameRequired: 'Business or salon name is required.',
          phoneRequired: 'Please enter a valid phone number (e.g., 05XXXXXXXX).',
          emailRequired: 'Please enter a valid email address.',
          inquiryTypeRequired: 'Please select an inquiry type.',
          messageRequired: 'Please provide a message with at least 10 characters.',
        },
        integrationNotice: {
          title: 'Technical Integration Boundary Notice',
          description:
            'Automated cloud form persistence is currently awaiting backend integration. To guarantee message delivery and respect data privacy, your data was not transmitted to an unverified server. Please connect directly through our verified channels below.',
        },
        successNotice: {
          title: 'Inquiry Received Successfully',
          description: 'Thank you for reaching out. We will review your inquiry and follow up shortly.',
        },
        errorNotice: {
          title: 'Submission Failed',
          description: 'An error occurred during processing. Please try again or reach out directly.',
        },
      };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

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

    if (!formData.inquiryType) {
      newErrors.inquiryType = t.validation.inquiryTypeRequired;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = t.validation.messageRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions when currently submitting
    if (status === 'submitting') {
      return;
    }

    if (!validate()) {
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      if (onSubmit) {
        // If a verified submission handler is provided (e.g., in future integration or test)
        await onSubmit(formData);
        setStatus('submitted');
      } else {
        // Repository audit verified: NO backend API endpoint or database persistence exists.
        // Rule: "If no working backend exists, do not display a fake success message or pretend that the message was sent."
        // "In that case, build the UI with a clearly documented integration boundary and provide a working alternative contact method when available."
        // We set status to 'unsupported' after brief verification simulation
        await new Promise((resolve) => setTimeout(resolve, 350));
        setStatus('unsupported');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : t.errorNotice.description
      );
    }
  };

  const handleChange = (
    field: keyof ContactFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <section
      id="contact-form"
      className={`relative bg-[#FAF9F8] py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center">
            <SectionTitle
              eyebrow={t.eyebrow}
              title={t.title}
              align="center"
            />
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B]">
              {t.subtitle}
            </p>
          </div>

          {/* Form Card Container (Tonal Surface, Zero Borders, Zero Shadows) */}
          <div className="mt-10 sm:mt-12 rounded-3xl bg-white p-6 sm:p-10 lg:p-12">
            {/* Case 1: Backend Integration Boundary Notice (No working backend) */}
            {status === 'unsupported' && (
              <div
                role="status"
                aria-live="polite"
                className="space-y-6 rounded-2xl bg-[#FAF9F8] p-6 sm:p-8 text-start"
              >
                <div className="flex items-start gap-3 text-[#C78360]">
                  <Info className="h-6 w-6 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-bold text-[#54453D]">
                      {t.integrationNotice.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                      {t.integrationNotice.description}
                    </p>
                  </div>
                </div>

                {/* Direct Alternative Action Links */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a
                    href="tel:+966548082945"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#54453D] px-5 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    <span>{t.buttons.callDirect}</span>
                  </a>

                  <a
                    href="https://t.me/rashxsa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#91B8C0] px-5 py-3 text-sm font-bold text-[#2C4349] transition-colors duration-200 hover:bg-[#91B8C0]/80"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>{t.buttons.telegramDirect}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#54453D] transition-colors duration-200 hover:bg-[#FAF9F8]"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    <span>{t.buttons.edit}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Case 2: Verified Backend Success State */}
            {status === 'submitted' && (
              <div
                role="status"
                aria-live="polite"
                className="space-y-4 rounded-2xl bg-[#FAF9F8] p-6 sm:p-8 text-center"
              >
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#91B8C0]/20 text-[#2C4349]">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-[#54453D]">
                  {t.successNotice.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#75645B] max-w-md mx-auto">
                  {t.successNotice.description}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setFormData({
                      fullName: '',
                      businessName: '',
                      phone: '',
                      email: '',
                      inquiryType: 'platform',
                      message: '',
                    });
                  }}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#54453D] px-6 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                >
                  {isAr ? 'إرسال استفسار آخر' : 'Send Another Inquiry'}
                </button>
              </div>
            )}

            {/* Case 3: Error State Banner */}
            {status === 'error' && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-6 flex items-start gap-3 rounded-2xl bg-[#FEF2F2] p-4 text-[#991B1B]"
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm">
                  <p className="font-bold">{t.errorNotice.title}</p>
                  <p className="mt-1">{errorMessage || t.errorNotice.description}</p>
                </div>
              </div>
            )}

            {/* Core Interactive Form */}
            {status !== 'unsupported' && status !== 'submitted' && (
              <form
                id={`${formId}-form`}
                onSubmit={handleSubmit}
                noValidate
                className="space-y-6"
              >
                {/* Row 1: Full Name & Business Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`${formId}-fullName`}
                      className="block text-xs font-bold text-[#54453D]"
                    >
                      {t.fields.fullName.label}
                      <span className="ms-1 text-[#DC2626] font-bold" aria-hidden="true">*</span>
                    </label>
                    <input
                      id={`${formId}-fullName`}
                      name="fullName"
                      type="text"
                      required
                      maxLength={100}
                      disabled={status === 'submitting'}
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder={t.fields.fullName.placeholder}
                      aria-invalid={errors.fullName ? 'true' : 'false'}
                      aria-describedby={errors.fullName ? `${formId}-fullName-error` : undefined}
                      className={`w-full h-11 px-3.5 rounded-xl bg-[#FAF9F8] text-sm text-[#54453D] placeholder:text-[#A39890] outline-none transition-colors duration-150 focus:bg-[#FAF9F8] focus:ring-2 focus:ring-[#C78360] ${
                        errors.fullName ? 'bg-[#FEF2F2] text-[#991B1B]' : ''
                      }`}
                    />
                    {errors.fullName && (
                      <p
                        id={`${formId}-fullName-error`}
                        role="alert"
                        className="text-xs text-[#DC2626] font-medium"
                      >
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Business Name */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`${formId}-businessName`}
                      className="block text-xs font-bold text-[#54453D]"
                    >
                      {t.fields.businessName.label}
                      <span className="ms-1 text-[#DC2626] font-bold" aria-hidden="true">*</span>
                    </label>
                    <input
                      id={`${formId}-businessName`}
                      name="businessName"
                      type="text"
                      required
                      maxLength={100}
                      disabled={status === 'submitting'}
                      value={formData.businessName}
                      onChange={(e) => handleChange('businessName', e.target.value)}
                      placeholder={t.fields.businessName.placeholder}
                      aria-invalid={errors.businessName ? 'true' : 'false'}
                      aria-describedby={errors.businessName ? `${formId}-businessName-error` : undefined}
                      className={`w-full h-11 px-3.5 rounded-xl bg-[#FAF9F8] text-sm text-[#54453D] placeholder:text-[#A39890] outline-none transition-colors duration-150 focus:bg-[#FAF9F8] focus:ring-2 focus:ring-[#C78360] ${
                        errors.businessName ? 'bg-[#FEF2F2] text-[#991B1B]' : ''
                      }`}
                    />
                    {errors.businessName && (
                      <p
                        id={`${formId}-businessName-error`}
                        role="alert"
                        className="text-xs text-[#DC2626] font-medium"
                      >
                        {errors.businessName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Phone Number & Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`${formId}-phone`}
                      className="block text-xs font-bold text-[#54453D]"
                    >
                      {t.fields.phone.label}
                      <span className="ms-1 text-[#DC2626] font-bold" aria-hidden="true">*</span>
                    </label>
                    <input
                      id={`${formId}-phone`}
                      name="phone"
                      type="tel"
                      dir="ltr"
                      required
                      maxLength={20}
                      disabled={status === 'submitting'}
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder={t.fields.phone.placeholder}
                      aria-invalid={errors.phone ? 'true' : 'false'}
                      aria-describedby={errors.phone ? `${formId}-phone-error` : undefined}
                      className={`w-full h-11 px-3.5 rounded-xl bg-[#FAF9F8] text-sm text-[#54453D] placeholder:text-[#A39890] outline-none transition-colors duration-150 focus:bg-[#FAF9F8] focus:ring-2 focus:ring-[#C78360] text-start ${
                        errors.phone ? 'bg-[#FEF2F2] text-[#991B1B]' : ''
                      }`}
                    />
                    {errors.phone && (
                      <p
                        id={`${formId}-phone-error`}
                        role="alert"
                        className="text-xs text-[#DC2626] font-medium"
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <label
                      htmlFor={`${formId}-email`}
                      className="block text-xs font-bold text-[#54453D]"
                    >
                      {t.fields.email.label}
                      <span className="ms-1 text-[#DC2626] font-bold" aria-hidden="true">*</span>
                    </label>
                    <input
                      id={`${formId}-email`}
                      name="email"
                      type="email"
                      dir="ltr"
                      required
                      maxLength={120}
                      disabled={status === 'submitting'}
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder={t.fields.email.placeholder}
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? `${formId}-email-error` : undefined}
                      className={`w-full h-11 px-3.5 rounded-xl bg-[#FAF9F8] text-sm text-[#54453D] placeholder:text-[#A39890] outline-none transition-colors duration-150 focus:bg-[#FAF9F8] focus:ring-2 focus:ring-[#C78360] text-start ${
                        errors.email ? 'bg-[#FEF2F2] text-[#991B1B]' : ''
                      }`}
                    />
                    {errors.email && (
                      <p
                        id={`${formId}-email-error`}
                        role="alert"
                        className="text-xs text-[#DC2626] font-medium"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Inquiry Type (Dropdown) */}
                <div className="space-y-2">
                  <label
                    htmlFor={`${formId}-inquiryType`}
                    className="block text-xs font-bold text-[#54453D]"
                  >
                    {t.fields.inquiryType.label}
                    <span className="ms-1 text-[#DC2626] font-bold" aria-hidden="true">*</span>
                  </label>
                  <select
                    id={`${formId}-inquiryType`}
                    name="inquiryType"
                    required
                    disabled={status === 'submitting'}
                    value={formData.inquiryType}
                    onChange={(e) => handleChange('inquiryType', e.target.value)}
                    aria-invalid={errors.inquiryType ? 'true' : 'false'}
                    aria-describedby={errors.inquiryType ? `${formId}-inquiryType-error` : undefined}
                    className={`w-full h-11 px-3.5 rounded-xl bg-[#FAF9F8] text-sm text-[#54453D] outline-none transition-colors duration-150 focus:bg-[#FAF9F8] focus:ring-2 focus:ring-[#C78360] ${
                      errors.inquiryType ? 'bg-[#FEF2F2] text-[#991B1B]' : ''
                    }`}
                  >
                    {t.fields.inquiryType.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.inquiryType && (
                    <p
                      id={`${formId}-inquiryType-error`}
                      role="alert"
                      className="text-xs text-[#DC2626] font-medium"
                    >
                      {errors.inquiryType}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`${formId}-message`}
                      className="block text-xs font-bold text-[#54453D]"
                    >
                      {t.fields.message.label}
                      <span className="ms-1 text-[#DC2626] font-bold" aria-hidden="true">*</span>
                    </label>
                    <span className="text-[11px] text-[#75645B]">
                      {formData.message.length} / 1000
                    </span>
                  </div>
                  <textarea
                    id={`${formId}-message`}
                    name="message"
                    required
                    rows={4}
                    maxLength={1000}
                    disabled={status === 'submitting'}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder={t.fields.message.placeholder}
                    aria-invalid={errors.message ? 'true' : 'false'}
                    aria-describedby={errors.message ? `${formId}-message-error` : undefined}
                    className={`w-full p-3.5 rounded-xl bg-[#FAF9F8] text-sm text-[#54453D] placeholder:text-[#A39890] outline-none transition-colors duration-150 focus:bg-[#FAF9F8] focus:ring-2 focus:ring-[#C78360] resize-y min-h-[110px] ${
                      errors.message ? 'bg-[#FEF2F2] text-[#991B1B]' : ''
                    }`}
                  />
                  {errors.message && (
                    <p
                      id={`${formId}-message-error`}
                      role="alert"
                      className="text-xs text-[#DC2626] font-medium"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#54453D] px-6 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#75645B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === 'submitting' ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                        <span>{t.buttons.submitting}</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden="true" />
                        <span>{t.buttons.submit}</span>
                      </>
                    )}
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

