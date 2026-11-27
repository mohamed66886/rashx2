'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, sections, hasPanel, resolveActive, type NavSection } from './nav-config';

interface DashboardNavProps {
  tenantName: string;
  tenantSlug: string;
  userName: string;
  roleLabel: string;
  /** <LogoutButton /> rendered by the server layout (used in the mobile sheet) */
  logout: React.ReactNode;
}

const railSections = sections.filter((s) => !s.pinBottom);
const pinned = sections.filter((s) => s.pinBottom);
// bottom tab bar on mobile: 4 sections + "more"
const tabSections = sections.filter((s) => ['home', 'ops', 'pos', 'customers'].includes(s.id));

const landing = (s: NavSection) => s.href;

/* ------------------------------ rail ------------------------------ */
function RailItem({ s, active }: { s: NavSection; active: boolean }) {
  return (
    <Link
      href={landing(s)}
      aria-current={active ? 'page' : undefined}
      className={`group flex w-[68px] flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-center text-[11px] font-bold leading-tight transition-all duration-200 active:scale-95 ${
        active ? 'bg-[#54453D] text-[#FAF9F8]' : 'text-[#54453D] hover:bg-[#F8E3D6]'
      }`}
    >
      <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:-translate-y-0.5 group-hover:scale-110'}`}>
        <Icon name={s.icon} size={22} />
      </span>
      <span>{s.label}</span>
    </Link>
  );
}

/* ----------------------------- panel ------------------------------ */
function SectionPanel({ section, pathname, tenantName, tenantSlug }: { section: NavSection; pathname: string; tenantName: string; tenantSlug: string }) {
  const { link: activeLink } = resolveActive(pathname);
  return (
    // key => the panel re-animates when you switch section
    <aside key={section.id} className="rx-panel sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col overflow-y-auto bg-white lg:flex" aria-label={section.title}>
      <div className="px-3 pt-3">
        <div className="flex items-center gap-3 rounded-2xl bg-[#FAF9F8] px-3 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#91B8C0] text-base font-bold text-[#54453D]">{tenantName.charAt(0)}</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{tenantName}</div>
            <div dir="ltr" className="truncate font-mono text-[11px] text-[#6B5B52]" style={{ textAlign: 'right' }}>{tenantSlug}.rashx.org</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-6 pt-5">
        <h2 className="m-0 px-3 text-lg font-bold">{section.title}</h2>
        {section.groups.map((g, i) => (
          <div key={g.title ?? i} className="mt-4">
            {g.title && <div className="mb-1 px-3 text-[11px] font-bold tracking-wide text-[#6B5B52]">{g.title}</div>}
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {g.links.map((l) => {
                const active = activeLink?.href === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? 'page' : undefined}
                      className={`group relative flex min-h-10 items-center justify-between rounded-xl pe-3 text-sm transition-[padding,background-color] duration-200 active:scale-[0.98] ${
                        active ? 'bg-[#F8E3D6] ps-4 font-bold' : 'ps-3 font-medium text-[#54453D] hover:bg-[#F5F0EC] hover:ps-4'
                      }`}
                    >
                      {active && <span aria-hidden="true" className="rx-bar absolute inset-y-2.5 start-0 w-[3px] rounded-full bg-[#54453D]" />}
                      {l.label}
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 transition-opacity duration-200 group-hover:opacity-60"><path d="M15 6l-6 6 6 6" /></svg>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-3 mb-3 rounded-xl bg-[#FAF9F8] px-4 py-2.5 text-[11px] text-[#6B5B52]">راش إكس (RASHX) © {new Date().getFullYear()}</div>
    </aside>
  );
}

/* ---------------------------- mobile sheet -------------------------- */
function MoreSheet({ onClose, pathname, tenantName, tenantSlug, userName, roleLabel, logout }: { onClose: () => void; pathname: string } & DashboardNavProps) {
  const { link: activeLink } = resolveActive(pathname);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="كل الأقسام">
      <button type="button" aria-label="إغلاق" onClick={onClose} className="rx-fade absolute inset-0 bg-[#54453D]/50" />
      <div className="rx-sheet absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-3">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#E6DDD6]" aria-hidden="true" />
        <div className="flex items-center gap-3 rounded-2xl bg-[#FAF9F8] p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#91B8C0] text-lg font-bold">{tenantName.charAt(0)}</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{tenantName}</div>
            <div dir="ltr" className="truncate font-mono text-xs text-[#6B5B52]" style={{ textAlign: 'right' }}>{tenantSlug}.rashx.org</div>
          </div>
        </div>

        {sections.filter((s) => s.groups.length > 0).map((s) => (
          <section key={s.id} className="mt-5">
            <h3 className="m-0 mb-2 flex items-center gap-2 text-[13px] font-bold text-[#6B5B52]"><Icon name={s.icon} size={16} />{s.title}</h3>
            <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0">
              {s.groups.flatMap((g) => g.links).map((l) => {
                const on = activeLink?.href === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={onClose}
                      aria-current={on ? 'page' : undefined}
                      className={`flex min-h-12 items-center rounded-xl px-3 py-2 text-[13px] font-bold leading-snug transition-all duration-150 active:scale-[0.96] ${on ? 'bg-[#F8E3D6] text-[#54453D]' : 'bg-[#FAF9F8] hover:bg-[#F5F0EC]'}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <div className="mt-6 rounded-2xl bg-[#FAF9F8] p-4">
          <div className="text-sm font-bold">{userName}</div>
          <span className="mt-1 inline-block rounded-md bg-[#F0C5AE] px-2 py-0.5 text-[11px] font-bold">{roleLabel}</span>
          <div className="mt-3">{logout}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ shell ------------------------------ */
export function DashboardNav(props: DashboardNavProps) {
  const pathname = usePathname();
  const active = useMemo(() => resolveActive(pathname), [pathname]);
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [pathname]);

  return (
    <>
      {/* Desktop rail */}
      <nav aria-label="الأقسام" className="sticky top-0 hidden h-dvh w-[88px] shrink-0 flex-col items-center gap-1 overflow-y-auto bg-[#F0C5AE] py-4 lg:flex">
        <Link href="/dashboard" aria-label="راش إكس — الرئيسية" className="group mb-4 flex h-11 w-11 items-center justify-center transition-transform duration-300 hover:scale-110 hover:-rotate-6 active:scale-95">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/symbol-rx-ink.svg" alt="" width={34} height={32} />
        </Link>
        {railSections.map((s) => (
          <RailItem key={s.id} s={s} active={active.section.id === s.id} />
        ))}
        <div className="mt-auto flex flex-col gap-1">
          {pinned.map((s) => (
            <RailItem key={s.id} s={s} active={active.section.id === s.id} />
          ))}
        </div>
      </nav>

      {/* Desktop section panel (only for sections with several pages) */}
      {hasPanel(active.section) && <SectionPanel section={active.section} pathname={pathname} tenantName={props.tenantName} tenantSlug={props.tenantSlug} />}

      {/* Mobile bottom tab bar */}
      <nav aria-label="التنقل السريع" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {tabSections.map((s) => {
          const on = active.section.id === s.id;
          return (
            <Link key={s.id} href={landing(s)} aria-current={on ? 'page' : undefined} className={`group flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors active:scale-95 ${on ? 'text-[#54453D]' : 'text-[#6B5B52]'}`}>
              <span className={`flex h-7 items-center justify-center rounded-full transition-all duration-300 ${on ? 'w-12 bg-[#F0C5AE]' : 'w-7 bg-transparent'}`}>
                <span className={`transition-transform duration-300 ${on ? 'scale-110' : 'group-active:scale-90'}`}><Icon name={s.icon} size={20} /></span>
              </span>
              {s.label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setMore(true)} aria-haspopup="dialog" className="group flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-bold text-[#6B5B52] transition-transform active:scale-95 cursor-pointer">
          <span className="flex h-7 w-7 items-center justify-center rounded-full">
            <svg className="transition-transform duration-300 group-active:scale-125" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>
          </span>
          المزيد
        </button>
      </nav>

      {more && <MoreSheet onClose={() => setMore(false)} pathname={pathname} {...props} />}
    </>
  );
}