'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { Route } from 'next';
import { Menu, X, RashxLockupBilingual } from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import { LanguageSwitcher } from './LanguageSwitcher';

export interface MobileNavLink {
  label: string;
  href: string;
}

export interface MobileNavigationProps {
  lang: Lang;
  navLinks: MobileNavLink[];
  cta: {
    label: string;
    href: string;
  };
}

const EXIT_MS = 700;

/**
 * موبايل: قائمة full-screen بتتفتح بدائرة (clip-path) من زرار الفتح،
 * روابط كبيرة مرقّمة بتظهر ورا بعض.
 */
export function MobileNavigation({ lang, navLinks, cta }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [entered, setEntered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAr = lang === 'ar';
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const t = window.setTimeout(() => setRendered(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  const close = useCallback((returnFocus = true) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!f.length) return;
      const first = f[0]!;
      const last = f[f.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (!rendered) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [rendered]);

  useEffect(() => {
    if (entered) closeRef.current?.focus();
  }, [entered]);

  // نقطة بداية الدائرة = مكان زرار الفتح (يمين في LTR، شمال في RTL)
  const origin = isAr ? '8% 4%' : '92% 4%';

  const overlay = rendered ? (
    <div
      role="dialog"
      id="mobile-navigation-drawer"
      aria-modal="true"
      aria-label={isAr ? 'قائمة التنقل' : 'Navigation menu'}
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[100] bg-[#FAF9F8]"
      style={{
        clipPath: entered ? `circle(150% at ${origin})` : `circle(0% at ${origin})`,
        transition: `clip-path ${EXIT_MS}ms cubic-bezier(.76,0,.24,1)`,
      }}
    >
      <div ref={panelRef} className="relative flex h-full flex-col overflow-y-auto px-6 pb-8 pt-5">
        {/* Top */}
        <div
          className={`flex items-center justify-between transition-all duration-500 delay-300 ${
            entered ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
          }`}
        >
          <Link
            href={(isAr ? '/' : '/?lang=en') as Route}
            onClick={() => close(false)}
            className="inline-flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
          >
            <RashxLockupBilingual height={30} color="ink" />
            <span className="sr-only">{isAr ? 'راش إكس - الرئيسية' : 'RASHX - Home'}</span>
          </Link>

          <button
            ref={closeRef}
            type="button"
            onClick={() => close()}
            aria-label={isAr ? 'إغلاق القائمة' : 'Close menu'}
            className="grid h-11 w-11 place-items-center rounded-full bg-[#54453D] text-white transition-transform duration-500 hover:rotate-90 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Links */}
        <nav
          className="mt-10 flex-1"
          aria-label={isAr ? 'روابط التنقل للجوال' : 'Mobile navigation links'}
        >
          <ul className="flex flex-col">
            {navLinks.map((link, i) => (
              <li
                key={link.href + i}
                style={{ transitionDelay: entered ? `${300 + i * 55}ms` : '0ms' }}
                className={`transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
                  entered ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                <Link
                  href={link.href as Route}
                  onClick={() => close(false)}
                  className="group flex items-baseline gap-4 py-2.5 text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
                >
                  <span className="w-6 text-xs font-semibold text-[#E4A889] tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[1.65rem] font-semibold leading-tight transition-transform duration-300 group-hover:translate-x-2 group-active:translate-x-2 rtl:group-hover:-translate-x-2 rtl:group-active:-translate-x-2">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom */}
        <div
          style={{ transitionDelay: entered ? `${300 + navLinks.length * 55}ms` : '0ms' }}
          className={`mt-8 flex flex-col gap-4 transition-all duration-700 ${
            entered ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#75645B]">{isAr ? 'اللغة' : 'Language'}</span>
            <LanguageSwitcher currentLang={lang} />
          </div>

          <Link
            href={cta.href as Route}
            onClick={() => close(false)}
            className="group/cta flex min-h-[56px] items-center justify-between rounded-full bg-[#54453D] py-1.5 ps-6 pe-1.5 text-base font-semibold text-white active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
          >
            {cta.label}
            <span
              aria-hidden="true"
              className="grid h-11 w-11 place-items-center rounded-full bg-[#F0C5AE] text-[#54453D] rtl:-scale-x-100"
            >
              →
            </span>
          </Link>

          <p className="text-center text-[11px] text-[#75645B]">
            {isAr ? 'راش إكس لتقنية المعلومات · 2026' : 'RASHX Information Technology · 2026'}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        aria-label={isOpen ? (isAr ? 'إغلاق القائمة الرئيسية' : 'Close main menu') : isAr ? 'فتح القائمة الرئيسية' : 'Open main menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
        aria-haspopup="dialog"
        className="grid h-11 w-11 place-items-center rounded-full bg-[#54453D] text-white transition-transform duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </div>
  );
}