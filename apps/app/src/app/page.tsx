'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth, createUserWithEmailAndPassword } from '@/lib/firebase-client';

export default function RegisterSalonPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form Fields
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

  // Validation & Advisory States
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available?: boolean;
    valid?: boolean;
    message?: string;
  }>({ checking: false });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);

  // Debounced Slug Availability Check
  useEffect(() => {
    const trimmedSlug = slug.trim().toLowerCase();
    if (!trimmedSlug) {
      setSlugStatus({ checking: false });
      return;
    }

    if (trimmedSlug.length < 3) {
      setSlugStatus({
        checking: false,
        valid: false,
        message: 'يجب أن يتكون اسم النطاق من 3 أحرف على الأقل',
      });
      return;
    }

    setSlugStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(trimmedSlug)}`);
        const data = await res.json();
        setSlugStatus({
          checking: false,
          available: data.available,
          valid: data.valid,
          message: data.reason,
        });
      } catch (err) {
        setSlugStatus({
          checking: false,
          available: false,
          message: 'تعذر التحقق من توفر النطاق حالياً',
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug]);

  // Handle Certificate File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Client-Side Validations
    if (!name.trim()) {
      setFormError('يرجى إدخال اسم الصالون أو المركز');
      return;
    }
    if (!displayName.trim()) {
      setFormError('يرجى إدخال اسم المسؤول أو المالك');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    if (!phoneNumber.trim()) {
      setFormError('يرجى إدخال رقم الجوال');
      return;
    }
    if (slugStatus.available === false || slugStatus.valid === false) {
      setFormError('يرجى اختيار اسم نطاق متاح وصحيح');
      return;
    }
    if (password.length < 8) {
      setFormError('كلمة المرور يجب ألا تقل عن 8 خانات');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }
    if (!/^\d{10}$/.test(crNumber.trim())) {
      setFormError('رقم السجل التجاري يجب أن يتكون من 10 أرقام دقيقة');
      return;
    }
    if (!certificateFile) {
      setFormError('يرجى إرفاق صورة أو نسخة من شهادة السجل التجاري');
      return;
    }

    // Normalize Saudi Phone Number
    let normalizedPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (normalizedPhone.startsWith('05')) {
      normalizedPhone = '+966' + normalizedPhone.substring(1);
    } else if (normalizedPhone.startsWith('5')) {
      normalizedPhone = '+966' + normalizedPhone;
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+' + normalizedPhone;
    }

    startTransition(async () => {
      try {
        setLoadingStep('إنشاء حساب المالك...');
        const auth = getFirebaseAuth();

        // 2. Firebase Client Account Creation
        let userCredential;
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        } catch (authErr: any) {
          if (authErr.code === 'auth/email-already-in-use') {
            throw new Error('البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول بدلاً من ذلك.');
          }
          if (authErr.code === 'auth/weak-password') {
            throw new Error('كلمة المرور ضعيفة جداً. يرجى اختيار كلمة مرور أقوى.');
          }
          throw new Error(authErr.message || 'فشل إنشاء حساب المستخدم');
        }

        const idToken = await userCredential.user.getIdToken();

        setLoadingStep('تهيئة المنشأة وحجز النطاق...');

        // 3. Prepare FormData for Atomic Provisioning
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('commercialName', commercialName.trim() || name.trim());
        formData.append('displayName', displayName.trim());
        formData.append('email', email.trim().toLowerCase());
        formData.append('phoneNumber', normalizedPhone);
        formData.append('slug', slug.trim().toLowerCase());
        formData.append('crNumber', crNumber.trim());
        formData.append('certificate', certificateFile);

        setLoadingStep('رفع شهادة السجل وتوثيق البيانات...');

        const provisionRes = await fetch('/api/tenant/provision', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'X-RASHX-CSRF': '1',
          },
          body: formData,
        });

        const provisionData = await provisionRes.json();

        if (!provisionRes.ok || !provisionData.success) {
          throw new Error(provisionData.error || 'فشلت تهيئة الصالون. يرجى المحاولة لاحقاً.');
        }

        setLoadingStep('تم بنجاح! جاري توجيهك إلى صالونك...');

        // Compute redirect target
        const currentHostname = window.location.hostname;
        let redirectUrl = provisionData.redirectUrl;

        // In local development environment, adapt redirect to localhost port 3002 (tenant app)
        if (currentHostname.includes('localhost') || currentHostname === '127.0.0.1') {
          redirectUrl = `http://${provisionData.slug}.localhost:3002/login`;
        }

        // Redirect to tenant login page
        window.location.href = redirectUrl;
      } catch (err: any) {
        setLoadingStep(null);
        setFormError(err.message || 'حدث خطأ غير متوقع أثناء التسجيل');
      }
    });
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#FAF9F8] text-[#54453D] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F0C5AE] text-[#54453D] font-black text-2xl mb-3 shadow-xs">
            R
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#54453D]">
            تسجيل صالون جديد
          </h1>
          <p className="mt-2 text-sm text-[#54453D]/75">
            انضم إلى منظومة راش إكس لإدارة الصالونات ومراكز التجميل في المملكة العربية السعودية
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#54453D]/10 shadow-xs">
          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2">
              <span className="font-bold text-red-600">تنبيه:</span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Salon Details */}
            <div className="border-b border-[#54453D]/10 pb-6">
              <h2 className="text-lg font-bold text-[#54453D] mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F0C5AE]/40 text-[#54453D] text-xs font-bold">
                  ١
                </span>
                بيانات المنشأة والعلامة التجارية
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#54453D] mb-1">
                    اسم الصالون / المركز التجاري <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: صالون لمسة حرير"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:outline-none focus:ring-2 focus:ring-[#F0C5AE] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#54453D] mb-1">
                    الاسم القانوني بالسجل التجاري
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: مؤسسة لمسة حرير للتزيين النسائي"
                    value={commercialName}
                    onChange={(e) => setCommercialName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:outline-none focus:ring-2 focus:ring-[#F0C5AE] text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#54453D] mb-1">
                    اسم النطاق الفرعي المطلوب (رابط صالونك) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-[#54453D]/20 focus-within:ring-2 focus-within:ring-[#F0C5AE] overflow-hidden bg-white">
                    <span className="px-3.5 py-2.5 bg-[#FAF9F8] text-[#54453D]/60 text-xs font-mono border-l border-[#54453D]/10 select-none">
                      .rashx.org
                    </span>
                    <input
                      type="text"
                      dir="ltr"
                      required
                      placeholder="lamsat-hareer"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full px-3.5 py-2.5 text-sm font-mono focus:outline-none text-left"
                    />
                  </div>
                  {slugStatus.message && (
                    <p
                      className={`mt-1.5 text-xs ${
                        slugStatus.available
                          ? 'text-emerald-600 font-medium'
                          : 'text-amber-700 font-medium'
                      }`}
                    >
                      {slugStatus.checking ? 'جاري التحقق من التوفر...' : slugStatus.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Owner & Access */}
            <div className="border-b border-[#54453D]/10 pb-6">
              <h2 className="text-lg font-bold text-[#54453D] mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F0C5AE]/40 text-[#54453D] text-xs font-bold">
                  ٢
                </span>
                بيانات المالك وحساب الدخول
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#54453D] mb-1">
                    اسم المسؤول / المالك <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: نورة محمد العتيبي"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:outline-none focus:ring-2 focus:ring-[#F0C5AE] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#54453D] mb-1">
                    رقم الجوال السعودي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    required
                    placeholder="05XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:outline-none focus:ring-2 focus:ring-[#F0C5AE] text-sm text-left"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#54453D] mb-1">
                    البريد الإلكتروني للفوترة والإدارة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    required
                    placeholder="owner@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:outline-none focus:ring-2 focus:ring-[#F0C5AE] text-sm text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#54453D] mb-1">
                    كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:outline-none focus:ring-2 focus:ring-[#F0C5AE] text-sm text-left"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-2.5 text-xs text-[#54453D]/60 hover:text-[#54453D]"
                    >
                      {showPassword ? 'إخفاء' : 'عرض'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#54453D] mb-1">
                    تأكيد كلمة المرور <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:outline-none focus:ring-2 focus:ring-[#F0C5AE] text-sm text-left"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Commercial Registration & Verification */}
            <div>
              <h2 className="text-lg font-bold text-[#54453D] mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F0C5AE]/40 text-[#54453D] text-xs font-bold">
                  ٣
                </span>
                توثيق السجل التجاري السعودي
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#54453D] mb-1">
                    رقم السجل التجاري (10 أرقام) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    maxLength={10}
                    placeholder="1010XXXXXX"
                    value={crNumber}
                    onChange={(e) => setCrNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:outline-none focus:ring-2 focus:ring-[#F0C5AE] text-sm text-left font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#54453D] mb-1">
                    شهادة السجل التجاري (PDF أو JPG أو PNG بحجم أقصى 5 ميجابايت){' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-[#54453D]/20 rounded-2xl p-6 text-center hover:border-[#F0C5AE] transition-colors cursor-pointer bg-[#FAF9F8]/50">
                    <input
                      type="file"
                      id="certificate-upload"
                      required
                      accept=".pdf,image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="certificate-upload" className="cursor-pointer block">
                      <div className="text-2xl mb-1">📄</div>
                      <span className="text-sm font-semibold text-[#54453D] block">
                        {certificateFile ? certificateFile.name : 'اضغط لاختيار ملف الشهادة أو اسحبه هنا'}
                      </span>
                      <span className="text-xs text-[#54453D]/60 mt-1 block">
                        الملفات المعتمدة: PDF، صور JPG و PNG (حتى 5 ميجابايت)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending || Boolean(loadingStep)}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#54453D] text-white font-bold text-base hover:bg-[#433730] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer"
              >
                {loadingStep ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{loadingStep}</span>
                  </span>
                ) : (
                  'تأكيد وإنشاء الصالون'
                )}
              </button>

              <p className="mt-3 text-center text-xs text-[#54453D]/60">
                بالتسجيل في راش إكس، أنت توافق على شروط الخدمة وسياسة الخصوصية للمنصة
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-[#54453D]/50 mt-8">
        منظومة راش إكس (RASHX) — نظام إدارة وتشغيل الصالونات الذكي © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
