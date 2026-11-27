'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth, signOut } from '@/lib/firebase-client';

interface LogoutButtonProps {
  /** "button" = outlined button (default) · "menu" = full-width row for dropdown menus */
  variant?: 'button' | 'menu';
}

const Icon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9" />
  </svg>
);

export function LogoutButton({ variant = 'button' }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'X-RASHX-CSRF': '1',
          },
        });
        const auth = getFirebaseAuth();
        await signOut(auth);
      } catch {
        // Continue even if client call fails
      }
      router.push('/login');
      router.refresh();
    });
  };

  // dialog: focus cancel, Escape closes (unless logging out)
  useEffect(() => {
    if (!confirmOpen) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !isPending && setConfirmOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmOpen, isPending]);

  // Light by default; inside an ancestor with class "rx-on-dark" (mobile drawer) it flips to the dark style.
  const triggerCls =
    variant === 'menu'
      ? 'flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-bold text-[#54453D] transition-colors hover:bg-[#F0E9E4] cursor-pointer'
      : 'inline-flex h-10 items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#9A8C83] bg-white px-4 text-[13px] font-bold text-[#54453D] transition-colors hover:bg-[#F0E9E4] cursor-pointer [.rx-on-dark_&]:w-full [.rx-on-dark_&]:border-white/30 [.rx-on-dark_&]:bg-transparent [.rx-on-dark_&]:text-white [.rx-on-dark_&]:hover:bg-white/10';

  return (
    <>
      <button type="button" role={variant === 'menu' ? 'menuitem' : undefined} onClick={() => setConfirmOpen(true)} className={triggerCls}>
        <Icon />
        تسجيل الخروج
      </button>

      {confirmOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div dir="rtl" className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ fontFamily: "'Ping AR + LT','IBM Plex Sans Arabic',Tahoma,sans-serif" }}>
            <div className="rx-fade absolute inset-0 bg-[#54453D]/50 backdrop-blur-[2px]" onClick={() => !isPending && setConfirmOpen(false)} />
            <div role="alertdialog" aria-modal="true" aria-labelledby="rx-logout-title" aria-describedby="rx-logout-desc" className="rx-dialog relative w-full max-w-[400px] rounded-3xl bg-white p-7 text-center text-[#54453D] shadow-[0_30px_80px_rgba(84,69,61,0.3)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0C5AE]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9" /></svg>
              </div>
              <h2 id="rx-logout-title" className="mb-2 mt-5 text-xl font-bold">تسجيل الخروج؟</h2>
              <p id="rx-logout-desc" className="m-0 text-[15px] leading-[1.7] text-[#6B5B52]">سيتم إنهاء جلستك على هذا الجهاز، وتحتاج لتسجيل الدخول مرة أخرى للعودة.</p>
              <div className="mt-6 flex gap-3">
                <button ref={cancelRef} type="button" onClick={() => setConfirmOpen(false)} disabled={isPending} className="h-12 flex-1 rounded-2xl border-[1.5px] border-[#9A8C83] bg-white text-[15px] font-bold transition hover:bg-[#F0E9E4] disabled:opacity-50 cursor-pointer">
                  إلغاء
                </button>
                <button type="button" onClick={handleLogout} disabled={isPending} aria-busy={isPending} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#54453D] text-[15px] font-bold text-[#FAF9F8] transition hover:bg-[#433730] active:scale-[0.98] disabled:opacity-70 cursor-pointer">
                  {isPending && <i className="block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" aria-hidden="true" />}
                  {isPending ? 'جاري الخروج...' : 'تسجيل الخروج'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}