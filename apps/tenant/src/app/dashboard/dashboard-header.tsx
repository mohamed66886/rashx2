'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCrumbs } from './nav-config';

// Palette JS is only downloaded the first time search is opened.
const CommandPalette = dynamic(() => import('./command-palette').then((m) => m.CommandPalette), { ssr: false });

interface DashboardHeaderProps {
  userName: string;
  roleLabel: string;
  tenantName: string;
  tenantSlug: string;
  /** <LogoutButton variant="menu" /> rendered by the server layout */
  logout: React.ReactNode;
}

/* small inline icons used in this header */
const svgProps = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const SearchIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...svgProps} width={size} height={size} strokeWidth={2}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
const LinkIcon = () => (
  <svg {...svgProps}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
);
const CheckIcon = () => (
  <svg className="rx-check" {...svgProps} stroke="#54453D" strokeWidth={2.6}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
const StoreIcon = () => (
  <svg {...svgProps}><path d="M4 9l1.5-5h13L20 9M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M4 9h16M9 20v-6h6v6" /></svg>
);
const SlidersIcon = () => (
  <svg {...svgProps}><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></svg>
);
const ChevronDown = ({ open }: { open: boolean }) => (
  <svg {...svgProps} width={16} height={16} strokeWidth={2} className={`text-[#6B5B52] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
);

const menuItemClass =
  'group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#54453D] transition-all duration-150 hover:bg-white active:scale-[0.98]';

export function DashboardHeader({ userName, roleLabel, tenantName, tenantSlug, logout }: DashboardHeaderProps) {
  const pathname = usePathname();
  const crumbs = useMemo(() => getCrumbs(pathname), [pathname]);
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [palette, setPalette] = useState<{ mounted: boolean; open: boolean }>({ mounted: false, open: false });
  const menuRef = useRef<HTMLDivElement>(null);

  const openPalette = () => setPalette({ mounted: true, open: true });
  const closePalette = () => setPalette((p) => ({ ...p, open: false }));

  useEffect(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => ({ mounted: true, open: !p.open }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
      {palette.mounted && <CommandPalette open={palette.open} onClose={closePalette} />}

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-[#FAF9F8] px-4 py-3 lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0C5AE] text-sm font-bold">{tenantName.charAt(0)}</span>
          <span className="truncate text-[15px] font-bold">{tenantName}</span>
        </div>
        <button type="button" onClick={openPalette} aria-label="بحث وانتقال سريع" className="flex h-11 w-11 items-center justify-center rounded-xl bg-white transition-transform duration-150 active:scale-90 cursor-pointer">
          <SearchIcon size={20} />
        </button>
      </header>

      {/* Desktop top bar */}
      <header className="sticky top-0 z-20 hidden items-center justify-between gap-6 bg-[#FAF9F8] px-8 py-3 lg:flex">
        <nav aria-label="مسار الصفحة" className="min-w-0">
          <ol className="m-0 flex list-none items-center gap-2 p-0 text-sm">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={c.label} className="flex items-center gap-2">
                  {c.href && !last ? (
                    <Link href={c.href} className="text-[#6B5B52] transition-colors hover:text-[#54453D] hover:underline">{c.label}</Link>
                  ) : (
                    <span aria-current={last ? 'page' : undefined} className={last ? 'font-bold' : 'text-[#6B5B52]'}>{c.label}</span>
                  )}
                  {!last && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A8C83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex items-center gap-3">
          {/* Search */}
          <button type="button" onClick={openPalette} className="group flex h-10 w-[260px] items-center gap-3 rounded-xl bg-white px-3.5 text-sm text-[#6B5B52] transition-all duration-150 hover:bg-[#F0E9E4] active:scale-[0.98] cursor-pointer">
            <span className="transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12"><SearchIcon /></span>
            <span className="flex-1 text-start">بحث وانتقال سريع</span>
            <kbd className="rounded-md bg-[#F0E9E4] px-1.5 py-0.5 font-mono text-[11px] transition-colors group-hover:bg-white">{isMac ? '⌘ K' : 'Ctrl K'}</kbd>
          </button>

          {/* Copy link */}
          <button type="button" onClick={copyLink} aria-label="نسخ رابط الصالون" title="نسخ رابط الصالون" className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white transition-all duration-150 hover:bg-[#F0E9E4] active:scale-90 cursor-pointer">
            {copied ? (
              <CheckIcon />
            ) : (
              <span className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12"><LinkIcon /></span>
            )}
            <span role="status" aria-live="polite" className={`pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#54453D] px-2.5 py-1 text-xs font-bold text-white transition-all duration-200 ${copied ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'}`}>{copied ? 'تم نسخ الرابط' : ''}</span>
          </button>

          {/* User menu */}
          <div ref={menuRef} className="relative">
            <button type="button" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} className={`flex items-center gap-3 rounded-xl py-1 pe-2 ps-1 transition-colors duration-150 hover:bg-[#F0E9E4] cursor-pointer ${menu ? 'bg-[#F0E9E4]' : ''}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0C5AE] text-sm font-bold">{userName.charAt(0)}</span>
              <span className="text-start">
                <span className="block max-w-[160px] truncate text-sm font-bold leading-tight">{userName}</span>
                <span className="block text-[11px] text-[#6B5B52]">{roleLabel}</span>
              </span>
              <ChevronDown open={menu} />
            </button>
            {menu && (
              <div role="menu" className="rx-pop absolute left-0 top-full z-30 mt-2 flex w-[260px] origin-top-left flex-col gap-0.5 overflow-hidden rounded-2xl bg-[#F5F0EC] p-1.5">
                <div className="mb-1.5 rounded-xl bg-white px-3 pb-2.5 pt-2">
                  <div className="truncate text-sm font-bold">{userName}</div>
                  <span className="mt-1 inline-block rounded-md bg-[#F0C5AE] px-2 py-0.5 text-[11px] font-bold">{roleLabel}</span>
                </div>
                <Link role="menuitem" href="/dashboard/settings/profile" className={menuItemClass}>
                  <span className="text-[#6B5B52] transition-transform duration-200 group-hover:scale-110 group-hover:text-[#54453D]"><StoreIcon /></span>
                  ملف المنشأة
                </Link>
                <Link role="menuitem" href="/dashboard/settings/general" className={menuItemClass}>
                  <span className="text-[#6B5B52] transition-transform duration-200 group-hover:rotate-90 group-hover:text-[#54453D]"><SlidersIcon /></span>
                  الإعدادات العامة
                </Link>
                <div className="mt-1.5">{logout}</div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}