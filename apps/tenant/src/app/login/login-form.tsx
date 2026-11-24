'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth, signInWithEmailAndPassword } from '@/lib/firebase-client';

interface LoginFormProps {
  tenantName?: string;
  tenantSlug?: string;
}

const inputCls =
  'w-full h-[52px] rounded-[14px] border-[1.5px] border-[#9A8C83] bg-white px-4 text-base font-medium text-[#54453D] placeholder:text-[#8A7B72] outline-none focus:border-[#54453D] focus:ring-4 focus:ring-[#91B8C0]/50 transition-shadow text-left';
const labelCls = 'block text-sm font-bold text-[#54453D] mb-2';

export function LoginForm({ tenantName, tenantSlug }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    startTransition(async () => {
      try {
        setLoadingState('التحقق من بيانات الدخول...');
        const auth = getFirebaseAuth();

        // 1. Authenticate with Firebase Client SDK
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (authError: any) {
          if (
            authError.code === 'auth/invalid-credential' ||
            authError.code === 'auth/user-not-found' ||
            authError.code === 'auth/wrong-password'
          ) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          }
          if (authError.code === 'auth/user-disabled') {
            throw new Error('تم تعطيل هذا الحساب. يرجى التواصل مع الإدارة.');
          }
          if (authError.code === 'auth/too-many-requests') {
            throw new Error('تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار قليلاً والمحاولة مجدداً.');
          }
          throw new Error('تعذر تسجيل الدخول. يرجى التحقق من البيانات والمحاولة ثانية.');
        }

        const idToken = await userCredential.user.getIdToken();

        setLoadingState('إنشاء جلسة العمل الآمنة...');

        // 2. Establish Server Session & Authoritative Membership Verification
        const sessionRes = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-RASHX-CSRF': '1' },
          body: JSON.stringify({ idToken }),
        });

        const sessionData = await sessionRes.json();

        if (!sessionRes.ok || sessionData.status !== 'success') {
          throw new Error(sessionData.error || 'ليس لديك صلاحية وصول إلى هذا الصالون');
        }

        setLoadingState('تم الدخول بنجاح! جاري التوجيه...');
        router.push('/dashboard');
        router.refresh();
      } catch (err: any) {
        setLoadingState(null);
        setError(err.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول');
      }
    });
  };

  const busy = isPending || Boolean(loadingState);

  return (
    <div className="w-full">
      {error && (
        <div role="alert" className="mb-6 flex items-start gap-2 rounded-xl border border-[#E8B8A6] bg-[#FDF1EB] p-4 text-sm leading-relaxed text-[#7A2E12]">
          <span className="font-bold">خطأ:</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={busy}>
        <div>
          <label htmlFor="login-email" className={labelCls}>البريد الإلكتروني</label>
          <input
            id="login-email"
            type="email"
            dir="ltr"
            required
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="login-password" className={labelCls}>كلمة المرور</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls} pl-[84px]`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-pressed={showPassword}
              className="absolute left-3 top-2.5 h-8 rounded-[10px] bg-[#F0E9E4] px-3 text-[13px] font-bold text-[#54453D] cursor-pointer select-none"
            >
              {showPassword ? 'إخفاء' : 'إظهار'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-[#54453D] px-6 text-base font-bold text-[#FAF9F8] transition hover:bg-[#433730] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 cursor-pointer"
        >
          {loadingState ? (
            <span role="status" className="flex items-center justify-center gap-2.5">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" />
              <span>{loadingState}</span>
            </span>
          ) : (
            'تسجيل الدخول'
          )}
        </button>
      </form>
    </div>
  );
}
