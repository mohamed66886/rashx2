'use client';

/**
 * RASHX Brand Showcase — Interactive Form Inputs & Appointment Controls
 *
 * Dedicated live demonstration of all custom, accessible, flat, borderless,
 * and shadowless input primitives built for the RASHX Beauty & Wellness OS.
 */

import { useState } from 'react';
import {
  Input,
  PhoneInput,
  Select,
  DatePicker,
  TimePicker,
  DateTimePicker,
  Textarea,
  Checkbox,
  RadioGroup,
  Radio,
  Switch,
  FormField,
  Button,
  Badge,
  FileUpload,
} from '@rashx/ui';

export interface BrandInputsShowcaseProps {
  lang?: 'ar' | 'en';
}

export function BrandInputsShowcase({ lang = 'ar' }: BrandInputsShowcaseProps) {
  const isAr = lang === 'ar';

  // State management for interactive showcase
  const [salonName, setSalonName] = useState('صالون لمسة حرير');
  const [email, setEmail] = useState('owner@lamsethareer.sa');
  const [phone, setPhone] = useState('501234567');
  const [countryCode, setCountryCode] = useState('+966');
  const [service, setService] = useState('hair-cut');
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['riyadh', 'khobar']);
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(new Date('2026-11-20'));
  const [appointmentTime, setAppointmentTime] = useState('14:30');
  const [combinedDate, setCombinedDate] = useState<Date | null>(new Date('2026-11-20'));
  const [combinedTime, setCombinedTime] = useState('16:00');
  const [notes, setNotes] = useState('يرجى تحضير مصففة الشعر المعتمدة وتجهيز غرفة VIP.');
  const [packageType, setPackageType] = useState('gold');
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const serviceOptions = [
    { value: 'hair-cut', label: isAr ? 'قص وتصفيف الشعر (Hair Styling)' : 'Hair Cut & Styling' },
    { value: 'coloring', label: isAr ? 'صبغة وعلاج بروتين (Color & Treatment)' : 'Color & Protein' },
    { value: 'spa', label: isAr ? 'سبا ومساج استرخائي (Spa & Massage)' : 'Relaxation Spa' },
    { value: 'skincare', label: isAr ? 'جلسة عناية متكاملة بالبشرة (Skin Care)' : 'Skin Care Session' },
  ];

  const branchOptions = [
    { value: 'riyadh', label: isAr ? 'فرع الرياض — العليا' : 'Riyadh — Olaya' },
    { value: 'jeddah', label: isAr ? 'فرع جدة — الروضة' : 'Jeddah — Rawdah' },
    { value: 'khobar', label: isAr ? 'فرع الخبر — الحزام الذهبي' : 'Khobar — Golden Belt' },
  ];

  return (
    <div className="space-y-10">
      {/* ── Sub-grid 1: Text, Email, Password, Search & Phone ──────── */}
      <div className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between text-start">
          <div>
            <h3 className="text-lg font-bold text-[#54453D]">
              {isAr ? '1. حقول الإدخال النصية ورقم الجوال' : '1. Text & Mobile Phone Inputs'}
            </h3>
            <p className="mt-1 text-xs text-[#75645B]">
              {isAr
                ? 'تصميم مسطح ونظيف مع خلفية ناعمة، خالية من الحواف والظلال مع مؤشرات تركيز إمكانية الوصول.'
                : 'Flat, clean design with warm neutral fills, zero decorative borders or shadows.'}
            </p>
          </div>
          <Badge variant="brand" size="sm">
            {isAr ? 'تصميم مسطح' : 'Flat & Borderless'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Base Text Input */}
          <FormField
            label={isAr ? 'اسم المنشأة / الصالون' : 'Salon / Business Name'}
            required
            helperText={isAr ? 'الاسم التجاري كما يظهر للعملاء' : 'Trade name visible to clients'}
          >
            <Input
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              placeholder={isAr ? 'أدخل اسم الصالون' : 'Enter salon name'}
              clearable
              onClear={() => setSalonName('')}
            />
          </FormField>

          {/* Email Input */}
          <FormField
            label={isAr ? 'البريد الإلكتروني الرسمي' : 'Official Email Address'}
            required
            helperText={isAr ? 'لاستلام الفواتير وتقارير الحجوزات' : 'For invoices and appointment reports'}
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="salon@example.com"
              startAdornment={<span className="text-xs font-bold text-[#75645B]">@</span>}
            />
          </FormField>

          {/* Phone Input with GCC / KSA Country Selector */}
          <FormField
            label={isAr ? 'رقم جوال الإدارة (واتساب)' : 'Management Mobile (WhatsApp)'}
            required
            helperText={isAr ? 'المفتاح الدولي للمملكة العربية السعودية +966' : 'Default GCC +966 (KSA)'}
          >
            <PhoneInput
              value={phone}
              onChange={(val) => setPhone(val)}
              onCountryChange={(c) => setCountryCode(c.dialCode)}
              placeholder="50 123 4567"
              lang={lang}
            />
          </FormField>

          {/* Password Input with Visibility Toggle */}
          <FormField
            label={isAr ? 'كلمة المرور المشفرة' : 'Encrypted Password'}
            helperText={isAr ? 'جرب زر إظهار / إخفاء كلمة المرور' : 'Toggle eye icon to show/hide'}
          >
            <Input
              type="password"
              isPassword
              defaultValue="Rashx2026@Pass"
              placeholder="••••••••••••"
            />
          </FormField>

          {/* Search Input with Clear Button */}
          <FormField
            label={isAr ? 'بحث سريع عن عميل أو حجز' : 'Quick Client / Booking Search'}
            helperText={isAr ? 'مع زر تفريغ سريع عند الكتابة' : 'Includes instant clear button'}
          >
            <Input
              type="search"
              placeholder={isAr ? 'ابحث عن عميل أو حجز...' : 'Search client or booking...'}
              clearable
            />
          </FormField>

          {/* Error State Demonstration */}
          <FormField
            label={isAr ? 'حقل يوضح حالة الخطأ (Error State)' : 'Validation Error Demonstration'}
            errorMessage={isAr ? 'هذا الحقل إلزامي ولم يتم إدخاله بالشكل الصحيح' : 'This field is required and invalid'}
          >
            <Input
              hasError
              defaultValue="invalid-format-input"
              placeholder="Error preview"
            />
          </FormField>
        </div>
      </div>

      {/* ── Sub-grid 2: Dropdowns & Appointments (Select & Date/Time) ─ */}
      <div className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between text-start">
          <div>
            <h3 className="text-lg font-bold text-[#54453D]">
              {isAr ? '2. القوائم المنسدلة ومواعيد الحجوزات والتقويم' : '2. Dropdowns, Calendar & Appointment Pickers'}
            </h3>
            <p className="mt-1 text-xs text-[#75645B]">
              {isAr
                ? 'قوائم منسدلة مخصصة مع فلترة بالبحث، ومحددات تقويم وساعات حجوزات متوافقة مع تجربة صالونات التجميل.'
                : 'Accessible dropdown with live search, custom calendar and salon appointment time slots.'}
            </p>
          </div>
          <Badge variant="secondary" size="sm" className="bg-[#91B8C0] text-[#54453D]">
            {isAr ? 'نظام الحجوزات' : 'Appointment Engine'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Custom Dropdown Select */}
          <FormField
            label={isAr ? 'الخدمة المطلوبة' : 'Selected Service'}
            required
            helperText={isAr ? 'قائمة منسدلة مخصصة مع بحث فوري' : 'Custom select with live search filter'}
          >
            <Select
              options={serviceOptions}
              value={service}
              onChange={(val) => setService(val)}
              searchable
              placeholder={isAr ? 'اختر الخدمة...' : 'Select service...'}
            />
          </FormField>

          {/* Multi-Select Tags */}
          <FormField
            label={isAr ? 'الفروع المشمولة (متعدد)' : 'Assigned Branches (Multi)'}
            helperText={isAr ? 'اختيار متعدد مع وسوم سهلة الحذف' : 'Multi-select with removable tags'}
          >
            <Select
              options={branchOptions}
              value={selectedBranches}
              onMultiChange={(val) => setSelectedBranches(val)}
              multiple
              searchable
              placeholder={isAr ? 'اختر الفروع...' : 'Select branches...'}
            />
          </FormField>

          {/* Custom Date Picker */}
          <FormField
            label={isAr ? 'تاريخ الموعد (DatePicker)' : 'Appointment Date (DatePicker)'}
            required
            helperText={isAr ? 'تقويم تفاعلي كامل مع تنقل شهري وزر اليوم' : 'Interactive calendar with quick-today'}
          >
            <DatePicker
              value={appointmentDate}
              onChange={(d) => setAppointmentDate(d)}
              lang={lang}
              placeholder={isAr ? 'اختر تاريخ الحجز' : 'Select appointment date'}
            />
          </FormField>

          {/* Custom Time Picker */}
          <FormField
            label={isAr ? 'وقت الموعد (TimePicker)' : 'Appointment Slot (TimePicker)'}
            required
            helperText={isAr ? 'فترات مواعيد مجدولة مسبقاً بنظام 12/24 ساعة' : 'Predefined appointment slots'}
          >
            <TimePicker
              value={appointmentTime}
              onChange={(t) => setAppointmentTime(t)}
              lang={lang}
            />
          </FormField>

          {/* Combined DateTimePicker */}
          <div className="md:col-span-2">
            <FormField
              label={isAr ? 'محدد الموعد واليوم المتكامل (DateTimePicker)' : 'Combined Appointment Booking'}
              helperText={isAr ? 'اختيار اليوم والشريحة الزمنية في خطوة واحدة سلسة' : 'Select day tab and appointment slot'}
            >
              <DateTimePicker
                dateValue={combinedDate}
                timeValue={combinedTime}
                onDateChange={(d) => setCombinedDate(d)}
                onTimeChange={(t) => setCombinedTime(t)}
                lang={lang}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* ── Sub-grid 3: Textarea, Radio Cards, Checkboxes & Switches ── */}
      <div className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between text-start">
          <div>
            <h3 className="text-lg font-bold text-[#54453D]">
              {isAr ? '3. باقات الاشتراكات والملاحظات وقنوات الإشعارات' : '3. Packages, Instructions & Notifications'}
            </h3>
            <p className="mt-1 text-xs text-[#75645B]">
              {isAr
                ? 'خيارات الباقات على شكل بطاقات مسطحة، مفاتيح تشغيل، ومربعات اختيار تفاعلية.'
                : 'Flat card-based radio packages, smooth sliding switches, and accessible checkboxes.'}
            </p>
          </div>
          <Badge variant="secondary" size="sm" className="bg-[#F0C5AE] text-[#54453D]">
            {isAr ? 'خيارات متقدمة' : 'Advanced Controls'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Radio Group with Cards */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-[#75645B] mb-3">
              {isAr ? 'اختر باقة إدارة الصالون (RadioCard Group)' : 'Salon Subscription Package'}
            </span>
            <RadioGroup
              name="packageType"
              value={packageType}
              onChange={(val) => setPackageType(val)}
              className="space-y-3"
            >
              <Radio
                value="silver"
                variant="card"
                label={isAr ? 'باقة الانطلاق (Silver Starter)' : 'Silver Starter'}
                description={isAr ? 'حتى 3 موظفات، حجز مواعيد، وفواتير إلكترونية' : 'Up to 3 staff, bookings, e-invoicing'}
              />
              <Radio
                value="gold"
                variant="card"
                label={isAr ? 'باقة الصالون المتكامل (Gold Pro)' : 'Gold Pro (Recommended)'}
                description={isAr ? 'فروع غير محدودة، تقارير ذكاء أعمال، وربط واتساب' : 'Unlimited branches, BI reports, WhatsApp'}
              />
              <Radio
                value="diamond"
                variant="card"
                label={isAr ? 'باقة سلاسل ومراكز السبا (Diamond Enterprise)' : 'Diamond Enterprise'}
                description={isAr ? 'إدارة المستودعات، ولاء العملاء، وحلول مخصصة' : 'Warehouse inventory, client loyalty, custom API'}
              />
            </RadioGroup>
          </div>

          {/* Textarea + Switches + Checkbox */}
          <div className="space-y-6">
            <FormField
              label={isAr ? 'ملاحظات وتوجيهات خاصة بالخدمة (Textarea)' : 'Special Client Instructions'}
              helperText={isAr ? 'حقل متعدد الأسطر مع عداد حروف مدمج' : 'With real-time character counter'}
            >
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={250}
                showCount
                rows={4}
                placeholder={isAr ? 'اكتب أي ملاحظات أو طلبات خاصة...' : 'Type client requests or notes...'}
              />
            </FormField>

            <div className="rounded-xl bg-white p-5 space-y-4">
              <span className="block text-xs font-bold uppercase text-[#75645B]">
                {isAr ? 'قنوات الإشعارات والتأكيد' : 'Notification Channels'}
              </span>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#54453D]">
                    {isAr ? 'إشعارات واتساب الفورية للعميل' : 'Instant WhatsApp Confirmations'}
                  </p>
                  <p className="text-xs text-[#75645B]">
                    {isAr ? 'إرسال تفاصيل الموعد ورابط الموقع تلقائياً' : 'Automated booking link and directions'}
                  </p>
                </div>
                <Switch
                  checked={whatsappNotifications}
                  onChange={(e) => setWhatsappNotifications(e.target.checked)}
                  variant="peach"
                  aria-label="WhatsApp notifications toggle"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#54453D]">
                    {isAr ? 'تذكير بالرسائل النصية SMS' : 'SMS Appointment Reminders'}
                  </p>
                  <p className="text-xs text-[#75645B]">
                    {isAr ? 'إرسال تذكير قبل الموعد بساعتين' : 'Send SMS 2 hours before booking'}
                  </p>
                </div>
                <Switch
                  checked={smsReminders}
                  onChange={(e) => setSmsReminders(e.target.checked)}
                  variant="blue"
                  aria-label="SMS reminders toggle"
                />
              </div>

              <div className="pt-2 border-t border-[#F2EFEB]">
                <Checkbox
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  label={isAr ? 'الموافقة على سياسة الحجز والإلغاء المعتمدة' : 'Agree to salon booking policy'}
                  description={isAr ? 'يتطلب الإلغاء أو التعديل إشعاراً مسبقاً بـ 24 ساعة' : 'Requires 24h cancellation notice'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Sub-grid 4: File & Document Upload Primitives ─────────── */}
        <div className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between text-start">
            <div>
              <h3 className="text-lg font-bold text-[#54453D]">
                {isAr ? '4. حقول رفع الملفات والمستندات (File Upload Primitives)' : '4. File & Document Upload Primitives'}
              </h3>
              <p className="mt-1 text-xs text-[#75645B]">
                {isAr
                  ? 'خيارات متعددة لرفع الملفات: منطقة السحب والإفلات الكاملة، الشريط المدمج، رفع الصورة الشخصية وشعار الصالون، وزر الرفع المباشر مع دعم بطاقات الملفات والتحقق من الحجم.'
                  : 'Versatile file upload controls: full dropzone, compact bar, avatar/logo profile uploader, and trigger button.'}
              </p>
            </div>
            <Badge variant="brand" size="sm">
              {isAr ? 'متعدد الأنماط' : 'Multi-Variant'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* 1. Full Dropzone */}
            <div className="lg:col-span-2">
              <FormField
                label={isAr ? 'السجل التجاري ورخصة البلدية (Dropzone)' : 'Commercial Registration & License'}
                helperText={isAr ? 'يدعم رفع ملفات PDF وصور العقود والمستندات الرسمية' : 'Supports PDF and image documents'}
              >
                <FileUpload
                  variant="dropzone"
                  multiple
                  maxFiles={4}
                  maxSizeMB={15}
                  lang={lang}
                  label={isAr ? 'اسحب عقود وتراخيص الصالون هنا' : 'Drag salon documents here, or browse'}
                  helperText={isAr ? 'يدعم PDF, PNG, JPG حتى 15 ميجابايت' : 'Supports PDF, PNG, JPG up to 15MB'}
                />
              </FormField>
            </div>

            {/* 2. Avatar / Salon Logo Upload */}
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl text-center">
              <span className="text-xs font-bold text-[#54453D] mb-3">
                {isAr ? 'شعار الصالون أو الصورة الشخصية' : 'Salon Logo / Profile Avatar'}
              </span>
              <FileUpload
                variant="avatar"
                avatarSize="lg"
                accept="image/*"
                lang={lang}
                label={isAr ? 'شعار المنشأة' : 'Salon Logo'}
                helperText={isAr ? 'انقر لتغيير الشعار' : 'Click to change logo'}
              />
            </div>

            {/* 3. Compact Single-line Upload */}
            <div className="lg:col-span-2">
              <FormField
                label={isAr ? 'مرفق إثبات الدفع أو التحويل البنكي (Compact Bar)' : 'Bank Transfer Receipt (Compact Bar)'}
                helperText={isAr ? 'شريط مدمج بسطر واحد مناسب للنماذج السريعة' : 'Single-line compact upload bar'}
              >
                <FileUpload
                  variant="compact"
                  lang={lang}
                  helperText={isAr ? 'اختر إيصال التحويل (PDF أو صورة)...' : 'Choose receipt (PDF or image)...'}
                />
              </FormField>
            </div>

            {/* 4. Button Trigger with Chips */}
            <div>
              <FormField
                label={isAr ? 'صور معرض الأعمال (Button Trigger)' : 'Portfolio Gallery Photos (Button Trigger)'}
                helperText={isAr ? 'زر رفع مع شرائح توضيحية للملفات المحددة' : 'Trigger button with file chips'}
              >
                <FileUpload
                  variant="button"
                  multiple
                  accept="image/*"
                  lang={lang}
                  label={isAr ? 'إضافة صور إلى المعرض' : 'Add gallery photos'}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Live Preview / Submit Demo */}
        <div className="mt-8 pt-6 border-t border-[#F2EFEB] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-[#75645B]">
            {isAr ? (
              <span>
                الحجز المحدد:{' '}
                <strong className="text-[#54453D]">
                  {appointmentDate ? appointmentDate.toISOString().slice(0, 10) : ''} · {appointmentTime} · {countryCode} {phone}
                </strong>
              </span>
            ) : (
              <span>
                Current selection:{' '}
                <strong className="text-[#54453D]">
                  {appointmentDate ? appointmentDate.toISOString().slice(0, 10) : ''} · {appointmentTime} · {countryCode} {phone}
                </strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSalonName('');
                setEmail('');
                setPhone('');
                setNotes('');
                setDemoSubmitted(false);
              }}
            >
              {isAr ? 'إعادة تعيين الحقول' : 'Reset Form'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setDemoSubmitted(true)}
            >
              {demoSubmitted ? (isAr ? '✓ تم الحفظ بنجاح' : '✓ Saved') : (isAr ? 'حفظ واختبار النموذج' : 'Test Save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
