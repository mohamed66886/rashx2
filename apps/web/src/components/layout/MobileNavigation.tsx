'use client';

import { useState, useEffect, useRef } from 'react';
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

export function MobileNavigation({ lang, navLinks, cta }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isAr = lang === 'ar';
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Set mounted flag for safe client-side portal rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer on Escape key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Focus close button on open
      closeButtonRef.current?.focus();
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const menuOpenLabel = isAr ? 'فتح القائمة الرئيسية' : 'Open main menu';
  const menuCloseLabel = isAr ? 'إغلاق القائمة الرئيسية' : 'Close main menu';
  const drawerCloseLabel = isAr ? 'إغلاق القائمة' : 'Close menu';

  const drawerContent = isOpen ? (
    <div
      role="dialog"
      id="mobile-navigation-drawer"
      aria-modal="true"
      aria-label={isAr ? 'قائمة التنقل' : 'Navigation menu'}
      className="fixed inset-0 z-[100] flex"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Backdrop (Full screen overlay, semi-transparent) */}
      <div
        className="fixed inset-0 bg-[#54453D]/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
        aria-hidden="true"
      />

      {/* Drawer Panel (Solid Opaque White, Zero Borders, Zero Shadows) */}
      <div
        className={`fixed inset-y-0 ${
          isAr ? 'right-0' : 'left-0'
        } z-[101] flex h-full w-[85%] max-w-sm flex-col justify-between bg-white p-6 overflow-y-auto transition-transform duration-300 ease-out`}
      >
        {/* Top Bar inside Drawer */}
        <div>
          <div className="flex items-center justify-between">
            <Link
              href={(isAr ? '/' : '/?lang=en') as Route}
              onClick={handleLinkClick}
              className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
            >
              <RashxLockupBilingual height={30} color="ink" />
              <span className="sr-only">
                {isAr ? 'راش إكس - الرئيسية' : 'RASHX - Home'}
              </span>
            </Link>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => {
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#54453D] hover:bg-[#FAF9F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] focus-visible:ring-offset-2"
              aria-label={drawerCloseLabel}
            >
              <X className="h-5 w-5 text-[#54453D]" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            className="mt-8"
            aria-label={isAr ? 'روابط التنقل للجوال' : 'Mobile navigation links'}
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as Route}
                    onClick={handleLinkClick}
                    className="flex min-h-[44px] items-center rounded-xl px-4 py-3 text-base font-medium text-[#54453D] transition-colors duration-200 hover:bg-[#FAF9F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Actions inside Drawer */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-semibold text-[#75645B]">
              {isAr ? 'اللغة' : 'Language'}
            </span>
            <LanguageSwitcher currentLang={lang} />
          </div>

          <Link
            href={cta.href as Route}
            onClick={handleLinkClick}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#F0C5AE] px-4 py-3 text-sm font-semibold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
          >
            {cta.label}
          </Link>

          <div className="text-center text-[11px] text-[#75645B]">
            <p>
              {isAr
                ? 'راش إكس لتقنية المعلومات · 2026'
                : 'RASHX Information Technology · 2026'}
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="md:hidden">
      {/* ── Accessible Mobile Menu Trigger Button ──────────────────── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#54453D] transition-colors duration-200 hover:bg-[#FAF9F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] focus-visible:ring-offset-2"
        aria-label={isOpen ? menuCloseLabel : menuOpenLabel}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
        aria-haspopup="dialog"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-[#54453D]" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5 text-[#54453D]" aria-hidden="true" />
        )}
      </button>

      {/* ── Accessible Modal Drawer Portaled to document.body ──────── */}
      {mounted && drawerContent ? createPortal(drawerContent, document.body) : null}
    </div>
  );
}
