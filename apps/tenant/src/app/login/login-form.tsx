'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth, signInWithEmailAndPassword } from '@/lib/firebase-client';

interface LoginFormProps {
  tenantName?: string;
  tenantSlug?: string;
}

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
          headers: {
            'Content-Type': 'application/json',
            'X-RASHX-CSRF': '1',
          },
          body: JSON.stringify({ idToken }),
        });

        const sessionData = await sessionRes.json();

        if (!sessionRes.ok || sessionData.status !== 'success') {
          throw new Error(
            sessionData.error || 'ليس لديك صلاحية وصول إلى هذا الصالون'
          );
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

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2">
          <span className="font-bold text-red-600">خطأ:</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#54453D] mb-1.5 text-right">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            dir="ltr"
            required
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:outline-none focus:ring-2 focus:ring-[#91B8C0] text-sm text-left font-sans"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#54453D]">
              كلمة المرور
            </label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:outline-none focus:ring-2 focus:ring-[#91B8C0] text-sm text-left font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-2.5 text-xs text-[#54453D]/60 hover:text-[#54453D] select-none"
            >
              {showPassword ? 'إخفاء' : 'عرض'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || Boolean(loadingState)}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#54453D] text-white font-bold text-sm hover:bg-[#433730] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xs cursor-pointer mt-2"
        >
          {loadingState ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

