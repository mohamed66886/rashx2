'use client';

import React, { useState, useEffect } from 'react';
import { getFirebaseAuth, createUserWithEmailAndPassword } from '@/lib/firebase-client';

/* ------------------------------------------------------------------ */
/*  RASHX brand tokens                                                 */
/*  Peach #F0C5AE · Dusty Blue #91B8C0 · Cream #FAF9F8 · Ink #54453D   */
/*  Brand assets expected in /public/brand (see README in delivery).   */
/* ------------------------------------------------------------------ */

type Phase = 'form' | 'working' | 'done';
type SlugStatus = { checking: boolean; available?: boolean; valid?: boolean; message?: string };

const FONT = 'var(--font-brand)';
const MONO = 'ui-monospace,Menlo,Consolas,monospace';

const STEPS = ['المنشأة', 'المالك', 'السجل التجاري'];

const inputCls =
  'w-full h-[50px] rounded-[14px] border-[1.5px] border-[#9A8C83] bg-white px-4 text-base font-medium text-[#54453D] placeholder:text-[#8A7B72] outline-none focus:border-[#54453D] focus:ring-4 focus:ring-[#F0C5AE] transition-shadow';
const labelCls = 'block text-sm font-bold text-[#54453D] mb-2';

/* ----------------------------- icons ------------------------------ */
const Check = ({ size = 14, stroke = 3 }: { size?: number; stroke?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const ArrowNext = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
const ArrowBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* --------------------------- small parts -------------------------- */
function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex gap-3 list-none p-0 m-0" aria-label="خطوات التسجيل">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <li key={label} className="flex-1" aria-current={active ? 'step' : undefined}>
            <div className={`h-1 rounded ${n <= step ? 'bg-[#54453D]' : 'bg-[#E6DDD6]'}`} />
            <div className={`mt-2.5 flex items-center gap-2 text-[13px] ${active ? 'font-bold text-[#54453D]' : done ? 'font-medium text-[#54453D]' : 'font-medium text-[#6B5B52]'}`}>
              <span
                className={`inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-xs ${
                  done ? 'bg-[#91B8C0] text-[#54453D]' : active ? 'bg-[#54453D] text-[#FAF9F8]' : 'border-[1.5px] border-[#9A8C83]'
                }`}
              >
                {done ? <Check size={12} stroke={3.2} /> : n.toLocaleString('ar-EG')}
              </span>
              <span className="truncate">{label}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function PrimaryButton({ children, className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#54453D] px-7 text-base font-bold text-[#FAF9F8] transition hover:bg-[#433730] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-14 items-center gap-2.5 text-[15px] font-bold text-[#54453D] cursor-pointer">
      <ArrowBack />
      رجوع
    </button>
  );
}

/* --------------------------- side panels -------------------------- */
function Symbol({ white, className }: { white?: boolean; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/brand/symbol-rx-${white ? 'white' : 'ink'}.svg`} alt="" aria-hidden="true" className={className} />;
}

function PanelDetails({ name, slug }: { name: string; slug: string }) {
  const shownName = name.trim() || 'اسم صالونك';
  const shownSlug = slug.trim() || 'your-salon';
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#F0C5AE] p-14 text-[#54453D] lg:flex lg:w-[560px] lg:shrink-0">
      <Symbol className="pointer-events-none absolute -bottom-44 -left-48 w-[620px] opacity-[0.09]" />
      <div className="relative">
        <div className="text-sm font-bold">معاينة مباشرة</div>
        <h2 className="mt-2 max-w-[420px] text-[30px] font-bold leading-[1.4]">هكذا سيراك عملاؤك على الإنترنت</h2>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(84,69,61,0.18)]">
        <div className="flex items-center gap-3 border-b border-[#E6DDD6] bg-[#FAF9F8] px-[18px] py-3.5">
          <div className="flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <i key={i} className="block h-2.5 w-2.5 rounded-full bg-[#E6DDD6]" />
            ))}
          </div>
          <div dir="ltr" className="flex h-8 flex-1 items-center gap-2 truncate rounded-[10px] border border-[#E6DDD6] bg-white px-3 text-[13px] font-medium" style={{ fontFamily: MONO }}>
            {shownSlug}.rashx.org
          </div>
        </div>
        <div className="flex items-center gap-4 bg-[#F8E3D6] px-7 pb-2 pt-7">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[#54453D]">
            <Symbol white className="w-[30px]" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[22px] font-bold">{shownName}</div>
            <div className="mt-1 text-sm text-[#6B5B52]">احجزي موعدك بضغطة واحدة</div>
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-[#F8E3D6] px-7 pb-7 pt-5" aria-hidden="true">
          {[
            ['#D9E7EA', '55%', '32%'],
            ['#F0C5AE', '44%', '28%'],
            ['#D9E7EA', '62%', '36%'],
          ].map(([c, w1, w2], i) => (
            <div key={i} className="flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5">
              <div className="h-10 w-10 rounded-xl" style={{ background: c }} />
              <div className="flex-1">
                <div className="h-2.5 rounded-md bg-[#E6DDD6]" style={{ width: w1 }} />
                <div className="mt-2 h-2 rounded-md bg-[#F0E9E4]" style={{ width: w2 }} />
              </div>
              <div className="h-[30px] w-16 rounded-[10px] bg-[#91B8C0]" />
            </div>
          ))}
        </div>
      </div>

      <p className="relative mt-6 max-w-[400px] text-[15px] leading-[1.8]">
        انضم إلى منظومة راش إكس لإدارة الصالونات ومراكز التجميل في المملكة العربية السعودية.
      </p>
    </aside>
  );
}

function PanelOwner({ displayName, phone, email, name }: { displayName: string; phone: string; email: string; name: string }) {
  const initial = (displayName.trim() || 'م').charAt(0);
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#91B8C0] p-14 text-[#54453D] lg:flex lg:w-[560px] lg:shrink-0">
      <Symbol white className="pointer-events-none absolute -left-52 -top-32 w-[640px] opacity-20" />
      <div className="relative">
        <span className="inline-block rounded-full bg-white px-4 py-2 text-[13px] font-bold">بطاقة المالك</span>
        <h2 className="mt-[18px] max-w-[420px] text-[32px] font-bold leading-[1.4]">حسابك هو مفتاح صالونك</h2>
      </div>

      <div className="relative flex flex-col gap-4">
        <div className="rounded-3xl bg-white p-7 shadow-[0_24px_60px_rgba(84,69,61,0.16)]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F0C5AE] text-[28px] font-bold">{initial}</div>
            <div className="min-w-0">
              <div className="truncate text-xl font-bold">{displayName.trim() || 'اسم المالك'}</div>
              <div className="mt-1 truncate text-sm text-[#6B5B52]">مالك {name.trim() || 'الصالون'}</div>
            </div>
          </div>
          <div className="my-[22px] h-px bg-[#E6DDD6]" />
          <div className="flex flex-col gap-3.5 text-[15px]">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5B52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
              <span dir="ltr" style={{ fontFamily: MONO }}>{phone.trim() || '05XXXXXXXX'}</span>
            </div>
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5B52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3.5 7.5l8.5 6 8.5-6" /></svg>
              <span dir="ltr" className="truncate" style={{ fontFamily: MONO }}>{email.trim() || 'owner@example.com'}</span>
            </div>
          </div>
        </div>
        <ul className="m-0 flex list-none flex-col gap-3.5 rounded-[20px] bg-[#FAF9F8] px-6 py-[22px] text-[15px] leading-[1.6]">
          {['البريد الإلكتروني هو اسم الدخول إلى لوحتك', 'كلمة المرور ٨ خانات على الأقل'].map((t) => (
            <li key={t} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#F0C5AE]"><Check size={12} stroke={3.2} /></span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function PanelVerify({ crNumber, hasFile }: { crNumber: string; hasFile: boolean }) {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#54453D] p-14 text-[#FAF9F8] lg:flex lg:w-[560px] lg:shrink-0">
      <Symbol white className="pointer-events-none absolute -bottom-48 -left-52 w-[640px] opacity-[0.07]" />
      <div className="relative">
        <h2 className="max-w-[420px] text-[32px] font-bold leading-[1.4]">لماذا نطلب السجل التجاري؟</h2>
        <p className="mt-3 max-w-[400px] text-base leading-[1.8] text-[#F4EDE8]">لنتأكد أن كل صالون على راش إكس منشأة حقيقية ومرخّصة، فتطمئن أنت وعملاؤك.</p>
      </div>

      <div className="relative w-[340px] max-w-full -rotate-3 self-center rounded-[20px] bg-[#FAF9F8] px-[26px] pb-[30px] pt-7 text-[#54453D] shadow-[0_30px_60px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between">
          <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-[#F0C5AE]"><Symbol className="w-[26px]" /></div>
          <div className="text-xs font-bold tracking-wide text-[#6B5B52]">شهادة سجل تجاري</div>
        </div>
        <div dir="ltr" className="mt-[26px] text-right text-[22px] font-bold tracking-[0.22em]" style={{ fontFamily: MONO }}>
          {crNumber || '1010XXXXXX'}
        </div>
        <div className="mt-[22px] flex flex-col gap-2.5" aria-hidden="true">
          <div className="h-[9px] w-[90%] rounded-md bg-[#E6DDD6]" />
          <div className="h-[9px] w-[72%] rounded-md bg-[#E6DDD6]" />
          <div className="h-[9px] w-[82%] rounded-md bg-[#E6DDD6]" />
        </div>
        <div className="mt-[26px] flex items-center gap-2.5">
          <span className={`flex h-[34px] w-[34px] items-center justify-center rounded-full ${hasFile ? 'bg-[#91B8C0]' : 'border-[1.5px] border-[#9A8C83]'}`}>
            {hasFile && <Check size={18} />}
          </span>
          <span className="text-sm font-bold">{hasFile ? 'تم الاستلام' : 'بانتظار الملف'}</span>
        </div>
      </div>

      <ul className="relative m-0 flex list-none flex-col gap-4 p-0 text-[15px] leading-[1.7]">
        {['رقم السجل من ١٠ أرقام يطابق شهادتك.', 'نسخة الشهادة للتوثيق فقط ولا تظهر لعملائك.'].map((t, i) => (
          <li key={t} className="flex items-start gap-3.5">
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#F0C5AE] text-[13px] font-bold text-[#54453D]">{(i + 1).toLocaleString('ar-EG')}</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ------------------------------ page ------------------------------ */
export default function RegisterSalonPage() {
  const [phase, setPhase] = useState<Phase>('form');
  const [step, setStep] = useState(1);
  const [stage, setStage] = useState(0); // 0..3 while working

  // Form fields (unchanged)
  const [name, setName] = useState('');
  const [commercialName, setCommercialName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  const [slugStatus, setSlugStatus] = useState<SlugStatus>({ checking: false });
  const [showPassword, setShowPassword] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [finalSlug, setFinalSlug] = useState('');

  // Debounced slug availability check (unchanged logic)
  useEffect(() => {
    const trimmedSlug = slug.trim().toLowerCase();
    if (!trimmedSlug) {
      setSlugStatus({ checking: false });
      return;
    }
    if (trimmedSlug.length < 3) {
      setSlugStatus({ checking: false, valid: false, message: 'يجب أن يتكون اسم النطاق من 3 أحرف على الأقل' });
      return;
    }
    setSlugStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(trimmedSlug)}`);
        const data = await res.json();
        setSlugStatus({ checking: false, available: data.available, valid: data.valid, message: data.reason });
      } catch {
        setSlugStatus({ checking: false, available: false, message: 'تعذر التحقق من توفر النطاق حالياً' });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [slug]);

  // Auto-redirect after success screen
  useEffect(() => {
    if (phase !== 'done' || !redirectUrl) return;
    const t = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 3000);
    return () => clearTimeout(t);
  }, [phase, redirectUrl]);

  // Scroll to top on step change (mobile)
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step, phase]);

  /* ---------------------------- file ---------------------------- */
  const acceptFile = (file: File | undefined | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError('حجم ملف الشهادة يجب ألا يتجاوز 5 ميجابايت');
      return;
    }
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setFormError('صيغة الملف غير مدعومة. يرجى اختيار ملف PDF أو صورة JPG أو PNG');
      return;
    }
    setFormError(null);
    setCertificateFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => acceptFile(e.target.files?.[0]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const formatSize = (bytes: number) =>
    bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت` : `${Math.max(1, Math.round(bytes / 1024))} كيلوبايت`;

  /* ------------------------ step validation ---------------------- */
  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!name.trim()) return 'يرجى إدخال اسم الصالون أو المركز';
      if (!slug.trim()) return 'يرجى إدخال اسم النطاق الفرعي';
      if (slugStatus.checking) return 'يرجى الانتظار حتى يكتمل التحقق من النطاق';
      if (slugStatus.available === false || slugStatus.valid === false) return 'يرجى اختيار اسم نطاق متاح وصحيح';
    }
    if (s === 2) {
      if (!displayName.trim()) return 'يرجى إدخال اسم المسؤول أو المالك';
      if (!email.trim() || !email.includes('@')) return 'يرجى إدخال بريد إلكتروني صحيح';
      if (!phoneNumber.trim()) return 'يرجى إدخال رقم الجوال';
      if (password.length < 8) return 'كلمة المرور يجب ألا تقل عن 8 خانات';
      if (password !== confirmPassword) return 'كلمة المرور وتأكيدها غير متطابقين';
    }
    if (s === 3) {
      if (!/^\d{10}$/.test(crNumber.trim())) return 'رقم السجل التجاري يجب أن يتكون من 10 أرقام دقيقة';
      if (!certificateFile) return 'يرجى إرفاق صورة أو نسخة من شهادة السجل التجاري';
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) return setFormError(err);
    setFormError(null);
    setStep((s) => s + 1);
  };
  const goBack = () => {
    setFormError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  /* --------------------------- submit --------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return goNext();
    setFormError(null);

    // Re-validate everything (same checks as the original page)
    for (const s of [1, 2, 3]) {
      const err = validateStep(s);
      if (err) {
        setStep(s);
        return setFormError(err);
      }
    }

    // Normalize Saudi phone number
    let normalizedPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (normalizedPhone.startsWith('05')) normalizedPhone = '+966' + normalizedPhone.substring(1);
    else if (normalizedPhone.startsWith('5')) normalizedPhone = '+966' + normalizedPhone;
    else if (!normalizedPhone.startsWith('+')) normalizedPhone = '+' + normalizedPhone;

    setPhase('working');
    setStage(0);
    try {
      const auth = getFirebaseAuth();

      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') throw new Error('البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول بدلاً من ذلك.');
        if (authErr.code === 'auth/weak-password') throw new Error('كلمة المرور ضعيفة جداً. يرجى اختيار كلمة مرور أقوى.');
        throw new Error(authErr.message || 'فشل إنشاء حساب المستخدم');
      }

      const idToken = await userCredential.user.getIdToken();
      setStage(1);

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('commercialName', commercialName.trim() || name.trim());
      formData.append('displayName', displayName.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('phoneNumber', normalizedPhone);
      formData.append('slug', slug.trim().toLowerCase());
      formData.append('crNumber', crNumber.trim());
      formData.append('certificate', certificateFile as File);

      setStage(2);
      const provisionRes = await fetch('/api/tenant/provision', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'X-RASHX-CSRF': '1' },
        body: formData,
      });
      const provisionData = await provisionRes.json();
      if (!provisionRes.ok || !provisionData.success) {
        throw new Error(provisionData.error || 'فشلت تهيئة الصالون. يرجى المحاولة لاحقاً.');
      }

      const currentHostname = window.location.hostname;
      let target = provisionData.redirectUrl;
      // Local dev: tenant app runs on localhost:3002
      if (currentHostname.includes('localhost') || currentHostname === '127.0.0.1') {
        target = `http://${provisionData.slug}.localhost:3002/login`;
      }

      setStage(3);
      setFinalSlug(provisionData.slug || slug.trim().toLowerCase());
      setRedirectUrl(target);
      setPhase('done');
    } catch (err: any) {
      setPhase('form');
      setStep(3);
      setFormError(err.message || 'حدث خطأ غير متوقع أثناء التسجيل');
    }
  };

  /* ------------------------ password strength ------------------- */
  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Za-z]/.test(password) && /\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    if (password.length >= 12) s++;
    return s;
  })();
  const strengthLabel = ['', 'كلمة المرور ضعيفة', 'كلمة المرور مقبولة', 'كلمة المرور قوية', 'كلمة المرور قوية جداً'][strength];

  /* ============================ WORKING ============================ */
  if (phase === 'working') {
    const items = ['إنشاء حساب المالك', 'تهيئة المنشأة وحجز النطاق', 'رفع شهادة السجل وتوثيق البيانات'];
    const pct = [12, 38, 66, 100][stage];
    return (
      <main dir="rtl" style={{ fontFamily: FONT }} className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FAF9F8] px-4 py-24 text-[#54453D]">
        <div aria-hidden="true" className="absolute -right-56 -top-60 h-[620px] w-[620px] rounded-full bg-[#F0C5AE] max-md:-right-40 max-md:-top-48 max-md:h-[380px] max-md:w-[380px]" />
        <div aria-hidden="true" className="absolute -bottom-64 -left-52 h-[640px] w-[640px] rounded-full bg-[#91B8C0] max-md:-bottom-48 max-md:-left-40 max-md:h-[380px] max-md:w-[380px]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/wordmark-arabic-ink.svg" alt="راش إكس" className="absolute right-6 top-8 h-6 w-auto lg:right-24 lg:top-11 lg:h-7" />

        <div role="status" aria-live="polite" className="relative flex w-full max-w-[680px] flex-col items-center rounded-[32px] bg-white px-6 py-10 shadow-[0_30px_80px_rgba(84,69,61,0.14)] sm:px-14">
          <div className="relative flex h-[124px] w-[124px] items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#E6DDD6]" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#54453D] border-r-[#91B8C0] motion-reduce:animate-none" />
            <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#F0C5AE]"><Symbol className="w-11" /></div>
          </div>
          <h1 className="mt-7 text-center text-[28px] font-bold leading-tight sm:text-[32px]">جاري تجهيز صالونك</h1>
          <p className="mt-2.5 text-center text-base leading-[1.7] text-[#6B5B52]">لحظات ويكون صالونك جاهزًا. لا تغلق هذه الصفحة.</p>
          <div dir="ltr" className="mt-5 inline-flex h-9 max-w-full items-center truncate rounded-full border border-[#E6DDD6] bg-[#FAF9F8] px-4 text-sm font-medium" style={{ fontFamily: MONO }}>
            {slug.trim().toLowerCase()}.rashx.org
          </div>

          <ol className="m-0 mt-8 flex w-full list-none flex-col p-0">
            {items.map((label, i) => {
              const done = i < stage;
              const active = i === stage;
              return (
                <li key={label} className={`flex min-h-14 items-center gap-4 ${active ? '-mx-4 rounded-2xl bg-[#FAF9F8] px-4' : ''} ${!done && !active ? 'text-[#6B5B52]' : ''}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${done ? 'bg-[#91B8C0] text-[#54453D]' : active ? 'bg-[#54453D]' : 'border-[1.5px] border-[#9A8C83]'}`}>
                    {done ? <Check size={16} /> : active ? <i className="block h-3.5 w-3.5 animate-spin rounded-full border-[2.5px] border-[#FAF9F8]/35 border-t-[#FAF9F8] motion-reduce:animate-none" /> : null}
                  </span>
                  <span className={`flex-1 text-base ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
                  <span className="text-[13px] text-[#6B5B52]">{done ? 'تم' : active ? 'جارٍ…' : ''}</span>
                </li>
              );
            })}
          </ol>

          <div className="mt-7 h-1.5 w-full overflow-hidden rounded-md bg-[#E6DDD6]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="تقدم التهيئة">
            <div className="h-full rounded-md bg-[#54453D] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </main>
    );
  }

  /* ============================== DONE ============================= */
  if (phase === 'done') {
    const domain = `${finalSlug}.rashx.org`;
    const next = [
      ['سجّل الدخول', 'بالبريد وكلمة المرور اللذين أنشأتهما.', 'bg-[#F0C5AE]'],
      ['جهّز صالونك', 'أضف خدماتك وفريقك ومواعيد العمل.', 'bg-[#91B8C0]'],
      ['شارك رابطك', 'أرسله لعملائك ليبدؤوا الحجز.', 'bg-[#F0C5AE]'],
    ];
    return (
      <main dir="rtl" style={{ fontFamily: FONT }} className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F0C5AE] px-4 py-24 text-[#54453D]">
        <Symbol className="pointer-events-none absolute -bottom-56 -left-56 w-[760px] opacity-[0.09] max-md:w-[480px]" />
        <div aria-hidden="true" className="absolute -right-44 -top-48 h-[520px] w-[520px] rounded-full bg-[#91B8C0] max-md:h-80 max-md:w-80" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/wordmark-arabic-ink.svg" alt="راش إكس" className="absolute right-6 top-8 z-10 h-6 w-auto lg:right-24 lg:top-11 lg:h-7" />

        <div role="status" className="relative flex w-full max-w-[860px] flex-col items-center rounded-[36px] bg-white px-6 py-10 shadow-[0_30px_80px_rgba(84,69,61,0.18)] sm:px-16 sm:pb-12 sm:pt-14">
          <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#91B8C0] shadow-[0_0_0_10px_#D9E7EA]"><Check size={42} stroke={2.4} /></div>
          <h1 className="mt-8 text-center text-[32px] font-bold leading-tight sm:text-[40px]">صالونك جاهز</h1>
          <p className="mt-3 max-w-[520px] text-center text-[17px] leading-[1.8] text-[#6B5B52]">أهلًا بك في راش إكس. حسابك أُنشئ ورابط صالونك محجوز لك.</p>

          <div className="mt-7 flex max-w-full items-center gap-3 rounded-[18px] border-[1.5px] border-[#E6DDD6] bg-[#FAF9F8] py-2.5 pe-2.5 ps-5">
            <svg className="hidden shrink-0 sm:block" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5B52" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>
            <span dir="ltr" className="min-w-0 truncate text-base font-bold sm:text-xl" style={{ fontFamily: MONO }}>{domain}</span>
            <button type="button" onClick={() => navigator.clipboard?.writeText(`https://${domain}`)} className="h-10 shrink-0 rounded-xl bg-[#F0C5AE] px-4 text-sm font-bold cursor-pointer">نسخ الرابط</button>
          </div>

          <a href={redirectUrl ?? '#'} className="mt-8 inline-flex h-[60px] w-full items-center justify-center gap-3 rounded-[18px] bg-[#54453D] px-10 text-[17px] font-bold text-[#FAF9F8] transition hover:bg-[#433730] sm:w-auto">
            الدخول إلى لوحة الصالون
            <ArrowNext />
          </a>
          <p className="mt-3 text-[13px] text-[#6B5B52]">سيتم توجيهك تلقائيًا خلال ثوانٍ…</p>

          <div className="my-9 h-px w-full bg-[#E6DDD6]" />
          <ul className="m-0 grid w-full list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
            {next.map(([t, d, bg], i) => (
              <li key={t} className="rounded-[20px] bg-[#FAF9F8] p-5">
                <div className={`flex h-[34px] w-[34px] items-center justify-center rounded-full text-sm font-bold ${bg}`}>{(i + 1).toLocaleString('ar-EG')}</div>
                <div className="mt-3.5 text-[15px] font-bold">{t}</div>
                <div className="mt-1.5 text-sm leading-[1.7] text-[#6B5B52]">{d}</div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  /* ============================== FORM ============================= */
  const bandBg = step === 1 ? 'bg-[#F0C5AE]' : step === 2 ? 'bg-[#91B8C0]' : 'bg-[#54453D]';
  const titles = ([
    ['عرّفنا بصالونك', 'اسم الصالون ورابطه الخاص على راش إكس، وبه يدخل عملاؤك للحجز.'],
    ['حساب المالك', 'بهذا الحساب تدخل لوحة صالونك وتدير فريقك ومواعيدك.'],
    ['وثّق سجلك التجاري', 'خطوة أخيرة، ثم ننشئ صالونك ونحجز رابطه.'],
  ][step - 1] || ['عرّفنا بصالونك', '']) as [string, string];

  return (
    <main dir="rtl" style={{ fontFamily: FONT }} className="flex min-h-screen flex-col bg-white text-[#54453D] lg:flex-row">
      {/* Mobile / tablet brand band (replaces side panel below lg) */}
      <header className={`flex items-center justify-between px-5 py-4 lg:hidden ${bandBg}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/brand/wordmark-arabic-${step === 3 ? 'white' : 'ink'}.svg`} alt="راش إكس" className="h-6 w-auto" />
        <span className={`text-[13px] font-bold ${step === 3 ? 'text-[#FAF9F8]' : 'text-[#54453D]'}`}>
          الخطوة {step.toLocaleString('ar-EG')} من {(3).toLocaleString('ar-EG')}
        </span>
      </header>

      {/* Form side */}
      <section className="flex flex-1 flex-col px-5 pb-8 pt-8 sm:px-10 lg:px-24 lg:pb-12 lg:pt-11">
        <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col lg:max-w-none">
          <div className="hidden items-center justify-between lg:flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/wordmark-arabic-ink.svg" alt="راش إكس" className="h-7 w-auto" />
            <span className="text-sm text-[#6B5B52]">
              لديك حساب؟ <a href="/login" className="font-bold text-[#54453D] hover:underline">تسجيل الدخول</a>
            </span>
          </div>

          <div className="lg:mt-10"><Stepper step={step} /></div>

          <div className="mt-8 lg:mt-9">
            <h1 className="m-0 text-[30px] font-bold leading-[1.3] tracking-tight lg:text-4xl">{titles[0]}</h1>
            <p className="mt-2.5 text-base leading-[1.7] text-[#6B5B52]">{titles[1]}</p>
          </div>

          {formError && (
            <div role="alert" className="mt-6 flex items-start gap-2 rounded-xl border border-[#E8B8A6] bg-[#FDF1EB] p-4 text-sm leading-relaxed text-[#7A2E12]">
              <span className="font-bold">تنبيه:</span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-1 flex-col">
            <div className="flex flex-col gap-[18px]">
              {/* ------------ Step 1 ------------ */}
              {step === 1 && (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className={labelCls}>اسم الصالون / المركز <span aria-hidden="true">*</span></label>
                      <input id="name" className={inputCls} type="text" required placeholder="مثال: صالون لمسة حرير" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="cname" className={labelCls}>الاسم القانوني بالسجل <small className="ms-1.5 font-normal text-[#6B5B52]">اختياري</small></label>
                      <input id="cname" className={inputCls} type="text" placeholder="مؤسسة لمسة حرير للتزيين النسائي" value={commercialName} onChange={(e) => setCommercialName(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="slug" className={labelCls}>رابط صالونك <span aria-hidden="true">*</span></label>
                    <div dir="ltr" className="flex h-[52px] items-stretch overflow-hidden rounded-[14px] border-[1.5px] border-[#9A8C83] bg-white focus-within:border-[#54453D] focus-within:ring-4 focus-within:ring-[#F0C5AE]">
                      <input
                        id="slug"
                        type="text"
                        required
                        placeholder="lamsat-hareer"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        aria-describedby="slug-status"
                        className="min-w-0 flex-1 bg-white px-4 text-base font-medium outline-none"
                        style={{ fontFamily: MONO }}
                      />
                      <span className="flex items-center border-l-[1.5px] border-[#E6DDD6] bg-[#FAF9F8] px-3 text-sm font-medium text-[#6B5B52] sm:px-[18px] sm:text-[15px]" style={{ fontFamily: MONO }}>.rashx.org</span>
                    </div>
                    <div id="slug-status" aria-live="polite" className="mt-2.5 min-h-[22px] text-sm font-medium">
                      {slugStatus.checking ? (
                        <span className="text-[#6B5B52]">جاري التحقق من التوفر...</span>
                      ) : slugStatus.available && slugStatus.valid !== false ? (
                        <span className="flex items-center gap-2">
                          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#91B8C0]"><Check /></span>
                          هذا الرابط متاح، وهو لك إذا أكملت التسجيل
                        </span>
                      ) : slugStatus.message ? (
                        <span className="text-[#8A4B14]">{slugStatus.message}</span>
                      ) : null}
                    </div>
                  </div>
                </>
              )}

              {/* ------------ Step 2 ------------ */}
              {step === 2 && (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="owner" className={labelCls}>اسم المسؤول / المالك <span aria-hidden="true">*</span></label>
                      <input id="owner" className={inputCls} type="text" required placeholder="مثال: نورة محمد العتيبي" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelCls}>رقم الجوال السعودي <span aria-hidden="true">*</span></label>
                      <div dir="ltr" className="flex h-[50px] overflow-hidden rounded-[14px] border-[1.5px] border-[#9A8C83] bg-white focus-within:border-[#54453D] focus-within:ring-4 focus-within:ring-[#F0C5AE]">
                        <span className="flex items-center border-r-[1.5px] border-[#E6DDD6] bg-[#FAF9F8] px-3.5 text-[15px] font-bold" style={{ fontFamily: MONO }}>+966</span>
                        <input id="phone" type="tel" required inputMode="tel" placeholder="05XXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="min-w-0 flex-1 bg-white px-3.5 text-base font-medium outline-none" style={{ fontFamily: MONO }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className={labelCls}>البريد الإلكتروني للدخول والفوترة <span aria-hidden="true">*</span></label>
                    <input id="email" dir="ltr" className={`${inputCls} text-left`} type="email" required placeholder="owner@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="pw" className={labelCls}>كلمة المرور <span aria-hidden="true">*</span></label>
                      <div className="relative">
                        <input id="pw" dir="ltr" className={`${inputCls} pl-[84px] text-left`} type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute left-3 top-[9px] h-8 rounded-[10px] bg-[#F0E9E4] px-3 text-[13px] font-bold cursor-pointer">
                          {showPassword ? 'إخفاء' : 'إظهار'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="pw2" className={labelCls}>تأكيد كلمة المرور <span aria-hidden="true">*</span></label>
                      <input id="pw2" dir="ltr" className={`${inputCls} text-left`} type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                    </div>
                  </div>

                  <div className="-mt-1 flex items-center gap-3.5" aria-live="polite">
                    <div className="flex flex-1 gap-1.5" aria-hidden="true">
                      {[1, 2, 3, 4].map((i) => (
                        <i key={i} className={`block h-1.5 flex-1 rounded-md ${i <= strength ? 'bg-[#54453D]' : 'bg-[#E6DDD6]'}`} />
                      ))}
                    </div>
                    <span className="min-w-[130px] text-sm font-bold">{strengthLabel || 'اختر كلمة مرور'}</span>
                  </div>
                </>
              )}

              {/* ------------ Step 3 ------------ */}
              {step === 3 && (
                <>
                  <div>
                    <label htmlFor="cr" className={labelCls}>رقم السجل التجاري (١٠ أرقام) <span aria-hidden="true">*</span></label>
                    <input
                      id="cr"
                      dir="ltr"
                      type="text"
                      inputMode="numeric"
                      required
                      maxLength={10}
                      placeholder="1010XXXXXX"
                      value={crNumber}
                      onChange={(e) => setCrNumber(e.target.value.replace(/\D/g, ''))}
                      className="h-[60px] w-full rounded-[14px] border-[1.5px] border-[#9A8C83] bg-white px-4 text-left text-xl tracking-[0.25em] outline-none focus:border-[#54453D] focus:ring-4 focus:ring-[#F0C5AE] sm:px-5 sm:text-2xl sm:tracking-[0.32em]"
                      style={{ fontFamily: MONO }}
                    />
                  </div>

                  <div>
                    <span className={labelCls}>شهادة السجل التجاري <span aria-hidden="true">*</span></span>
                    <input type="file" id="certificate-upload" accept=".pdf,image/jpeg,image/png" onChange={handleFileChange} className="sr-only" />

                    {certificateFile ? (
                      <div className="flex items-center gap-4 rounded-[20px] border-[1.5px] border-[#91B8C0] bg-[#F1F6F7] p-4 sm:gap-[18px] sm:px-5 sm:py-[18px]">
                        <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-[#91B8C0] bg-white">
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#54453D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div dir="ltr" className="truncate text-right text-base font-bold" style={{ fontFamily: MONO }}>{certificateFile.name}</div>
                          <div className="mt-1.5 text-sm text-[#6B5B52]">{formatSize(certificateFile.size)} · جاهز للرفع</div>
                        </div>
                        <label htmlFor="certificate-upload" className="inline-flex h-10 shrink-0 items-center rounded-xl border-[1.5px] border-[#9A8C83] bg-white px-4 text-sm font-bold cursor-pointer">استبدال</label>
                      </div>
                    ) : (
                      <label
                        htmlFor="certificate-upload"
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`flex cursor-pointer flex-col items-center rounded-[20px] border-2 border-dashed px-4 py-8 text-center transition-colors ${dragOver ? 'border-[#54453D] bg-[#F8E3D6]' : 'border-[#9A8C83] bg-[#FAF9F8] hover:border-[#54453D]'}`}
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0C5AE]">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#54453D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>
                        </span>
                        <span className="mt-3 text-[15px] font-bold">اضغط لاختيار ملف الشهادة أو اسحبه هنا</span>
                      </label>
                    )}
                    <div className="mt-2.5 text-[13px] text-[#6B5B52]">الصيغ المقبولة: PDF أو JPG أو PNG، وبحد أقصى ٥ ميجابايت.</div>
                  </div>
                </>
              )}
            </div>

            <div className="min-h-8 flex-1" />

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              {step > 1 ? <BackButton onClick={goBack} /> : <span className="hidden text-[13px] text-[#6B5B52] sm:block">الخطوة ١ من ٣</span>}
              <PrimaryButton type="submit" className={step === 3 ? 'h-[60px] flex-1 px-9 text-[17px] sm:flex-none' : step === 1 ? 'flex-1 sm:flex-none' : 'flex-1 sm:flex-none'}>
                {step === 1 && 'التالي: بيانات المالك'}
                {step === 2 && 'التالي: توثيق السجل'}
                {step === 3 && 'تأكيد وإنشاء الصالون'}
                {step === 3 ? <Check size={20} stroke={2.2} /> : <ArrowNext />}
              </PrimaryButton>
            </div>

            {step === 3 && (
              <p className="mt-3.5 text-center text-[13px] leading-[1.7] text-[#6B5B52]">
                بالتسجيل في راش إكس، أنت توافق على <a href="/terms" className="font-bold text-[#54453D] underline">شروط الخدمة</a> و<a href="/privacy" className="font-bold text-[#54453D] underline">سياسة الخصوصية</a>
              </p>
            )}
            <p className="mt-5 text-center text-sm text-[#6B5B52] lg:hidden">
              لديك حساب؟ <a href="/login" className="font-bold text-[#54453D]">تسجيل الدخول</a>
            </p>
          </form>
        </div>
      </section>

      {/* Per-step side panel (desktop only) */}
      {step === 1 && <PanelDetails name={name} slug={slug} />}
      {step === 2 && <PanelOwner displayName={displayName} phone={phoneNumber} email={email} name={name} />}
      {step === 3 && <PanelVerify crNumber={crNumber} hasFile={Boolean(certificateFile)} />}
    </main>
  );
}
