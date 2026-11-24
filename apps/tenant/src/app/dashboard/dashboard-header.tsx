'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCrumbs } from './nav-config';
import { CommandPalette } from './command-palette';

interface DashboardHeaderProps {
  userName: string;
  roleLabel: string;
  tenantSlug: string;
  /** <LogoutButton variant="menu" /> rendered by the server layout */
  logout: React.ReactNode;
}

export function DashboardHeader({ userName, roleLabel, tenantSlug, logout }: DashboardHeaderProps) {
  const pathname = usePathname();
  const crumbs = getCrumbs(pathname);
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  useEffect(() => setMenu(false), [pathname]);

  // close user menu on outside click / Escape
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${tenantSlug}.rashx.org`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <>
      <CommandPalette />
      <header className="sticky top-0 z-20 hidden items-center justify-between gap-6 border-b border-[#E6DDD6] bg-white/85 px-10 py-3 backdrop-blur lg:flex">
        {/* Breadcrumb */}
        <nav aria-label="مسار الصفحة" className="min-w-0">
          <ol className="m-0 flex list-none items-center gap-2 p-0 text-sm">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={c.label} className="flex items-center gap-2">
                  {c.href && !last ? (
                    <Link href={c.href} className="text-[#6B5B52] transition-colors hover:text-[#54453D] hover:underline">{c.label}</Link>
                  ) : (
                    <span aria-current={last ? 'page' : undefined} className={last ? 'font-bold text-[#54453D]' : 'text-[#6B5B52]'}>{c.label}</span>
                  )}
                  {!last && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A8C83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex items-center gap-3">
          {/* Quick search */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('rx:open-palette'))}
            className="group flex h-10 w-[260px] items-center gap-3 rounded-xl border-[1.5px] border-[#E6DDD6] bg-[#FAF9F8] px-3.5 text-sm text-[#6B5B52] transition hover:border-[#9A8C83] hover:bg-white cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <span className="flex-1 text-start">بحث وانتقال سريع</span>
            <kbd className="rounded-md border border-[#E6DDD6] bg-white px-1.5 py-0.5 font-mono text-[11px]">{isMac ? '⌘ K' : 'Ctrl K'}</kbd>
          </button>

          {/* Copy public link */}
          <button
            type="button"
            onClick={copyLink}
            aria-label="نسخ رابط الصالون"
            title="نسخ رابط الصالون"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border-[1.5px] border-[#E6DDD6] text-[#54453D] transition hover:bg-[#F0E9E4] active:scale-95 cursor-pointer"
          >
            {copied ? (
              <svg key="ok" className="rx-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#54453D" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
            )}
            <span role="status" aria-live="polite" className={`pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#54453D] px-2.5 py-1 text-xs font-bold text-white transition-opacity duration-200 ${copied ? 'opacity-100' : 'opacity-0'}`}>
              {copied ? 'تم نسخ الرابط' : ''}
            </span>
          </button>

          <span className="h-6 w-px bg-[#E6DDD6]" aria-hidden="true" />

          {/* User menu */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-haspopup="menu"
              aria-expanded={menu}
              className="flex items-center gap-3 rounded-xl py-1 pe-2 ps-1 transition hover:bg-[#F0E9E4] cursor-pointer"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0C5AE] text-sm font-bold text-[#54453D]">{userName.charAt(0)}</span>
              <span className="text-start">
                <span className="block max-w-[160px] truncate text-sm font-bold leading-tight">{userName}</span>
                <span className="block text-[11px] text-[#6B5B52]">{roleLabel}</span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B5B52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform duration-200 ${menu ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
            </button>

            {menu && (
              <div role="menu" className="rx-pop absolute left-0 top-full z-30 mt-2 w-[260px] origin-top-left overflow-hidden rounded-2xl border border-[#E6DDD6] bg-white p-1.5 shadow-[0_20px_50px_rgba(84,69,61,0.18)]">
                <div className="px-3 pb-2.5 pt-2">
                  <div className="truncate text-sm font-bold">{userName}</div>
                  <span className="mt-1 inline-block rounded-md bg-[#F0C5AE] px-2 py-0.5 text-[11px] font-bold">{roleLabel}</span>
                </div>
                <div className="my-1 h-px bg-[#E6DDD6]" />
                <Link role="menuitem" href="/dashboard/settings/profile" className="flex h-10 items-center rounded-xl px-3 text-sm font-medium transition hover:bg-[#F0E9E4]">ملف المنشأة</Link>
                <Link role="menuitem" href="/dashboard/settings/general" className="flex h-10 items-center rounded-xl px-3 text-sm font-medium transition hover:bg-[#F0E9E4]">الإعدادات العامة</Link>
                <div className="my-1 h-px bg-[#E6DDD6]" />
                {logout}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
