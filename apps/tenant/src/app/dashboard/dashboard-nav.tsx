'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, navItems, isItemActive } from './nav-config';

interface DashboardNavProps {
  tenantName: string;
  tenantSlug: string;
  userName: string;
  roleLabel: string;
  /** <LogoutButton /> rendered by the server layout */
  logout: React.ReactNode;
}

const STORAGE_KEY = 'rx.sidebar.collapsed';

function NavList({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  // manual open/close overrides; cleared whenever the route changes
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  useEffect(() => setOverrides({}), [pathname]);

  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {navItems.map((item) => {
        const active = isItemActive(item, pathname);
        const hasSubs = Boolean(item.subItems);
        const open = hasSubs && !collapsed && (overrides[item.href] ?? active);

        return (
          <li key={item.href}>
            <div className="flex items-center gap-1">
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                aria-current={active && !hasSubs ? 'page' : undefined}
                className={`group flex min-h-11 flex-1 items-center gap-3 rounded-xl px-3.5 text-sm font-bold transition-all duration-200 ${
                  active ? 'bg-[#F0C5AE] text-[#54453D] shadow-[0_4px_14px_rgba(0,0,0,0.18)]' : 'text-[#F4EDE8] hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="transition-transform duration-200 group-hover:scale-110"><Icon name={item.icon} /></span>
                <span className={`flex-1 overflow-hidden whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'w-0 opacity-0' : 'opacity-100'}`}>{item.label}</span>
              </Link>
              {hasSubs && !collapsed && (
                <button
                  type="button"
                  onClick={() => setOverrides((o) => ({ ...o, [item.href]: !open }))}
                  aria-expanded={open}
                  aria-label={`${open ? 'طي' : 'فتح'} قائمة ${item.label}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#E4D9D1] transition hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform duration-300 ${open ? '-rotate-90' : ''}`}>
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
              )}
            </div>

            {hasSubs && !collapsed && (
              <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`} aria-hidden={!open}>
                <ul className={`m-0 me-[22px] flex min-h-0 list-none flex-col gap-0.5 overflow-hidden border-e-2 border-white/15 p-0 pe-3 transition-opacity duration-300 ${open ? 'my-1 opacity-100' : 'opacity-0'}`}>
                  {item.subItems!.map((sub) => {
                    const subActive = pathname === sub.href;
                    return (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          tabIndex={open ? 0 : -1}
                          aria-current={subActive ? 'page' : undefined}
                          className={`flex min-h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] transition-all duration-200 ${
                            subActive ? 'bg-white/15 font-bold text-white' : 'font-medium text-[#E4D9D1] hover:translate-x-[-2px] hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <i className={`block h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${subActive ? 'bg-[#91B8C0]' : 'bg-white/25'}`} />
                          {sub.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function TenantCard({ name, slug, compact }: { name: string; slug: string; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-white/10 transition-all duration-300 ${compact ? 'justify-center p-2' : 'p-3'}`} title={compact ? `${name} — ${slug}.rashx.org` : undefined}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0C5AE] text-lg font-bold text-[#54453D]">{name.charAt(0)}</div>
      {!compact && (
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white">{name}</div>
          <div dir="ltr" className="truncate font-mono text-xs text-[#E4D9D1]" style={{ textAlign: 'right' }}>{slug}.rashx.org</div>
        </div>
      )}
    </div>
  );
}

export function DashboardNav({ tenantName, tenantSlug, userName, roleLabel, logout }: DashboardNavProps) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // restore collapsed preference (per browser)
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === '1');
    } catch {}
  }, []);
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? '0' : '1');
      } catch {}
      return !c;
    });

  // close drawer on navigation / Escape
  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [drawer]);

  return (
    <>
      {/* Mobile / tablet top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#54453D] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setDrawer(true)} aria-label="فتح القائمة" aria-expanded={drawer} className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition hover:bg-white/10 active:scale-95 cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <button type="button" onClick={() => window.dispatchEvent(new Event('rx:open-palette'))} aria-label="بحث وانتقال سريع" className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition hover:bg-white/10 active:scale-95 cursor-pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          </button>
        </div>
        <div className="flex items-center gap-2.5 text-white">
          <span className="max-w-[160px] truncate text-sm font-bold">{tenantName}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0C5AE] text-sm font-bold text-[#54453D]">{tenantName.charAt(0)}</span>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="القائمة الرئيسية">
          <button type="button" aria-label="إغلاق القائمة" onClick={() => setDrawer(false)} className="rx-fade absolute inset-0 bg-[#54453D]/50 backdrop-blur-[2px]" />
          <div className="rx-drawer absolute inset-y-0 right-0 flex w-[88%] max-w-[340px] flex-col bg-[#54453D] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/wordmark-arabic-white.svg" alt="راش إكس" className="h-6 w-auto" />
              <button type="button" onClick={() => setDrawer(false)} aria-label="إغلاق" className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/10 cursor-pointer">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <TenantCard name={tenantName} slug={tenantSlug} />
            <nav aria-label="التنقل" className="mt-5 flex-1 overflow-y-auto"><NavList pathname={pathname} collapsed={false} /></nav>
            <div className="mt-4 border-t border-white/15 pt-4">
              <div className="text-sm font-bold text-white">{userName}</div>
              <span className="mt-1 inline-block rounded-md bg-[#F0C5AE] px-2 py-0.5 text-[11px] font-bold text-[#54453D]">{roleLabel}</span>
              <div className="rx-on-dark mt-3">{logout}</div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar (collapsible) */}
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden bg-[#54453D] py-6 transition-[width,padding] duration-300 ease-out lg:flex ${collapsed ? 'w-[84px] px-3' : 'w-[288px] px-5'}`}>
        <div className={`mb-6 flex h-7 items-center ${collapsed ? 'justify-center' : 'px-1'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={collapsed ? '/brand/symbol-rx-white.svg' : '/brand/wordmark-arabic-white.svg'} alt="راش إكس" className={collapsed ? 'h-7 w-auto' : 'h-6 w-auto'} />
        </div>
        <TenantCard name={tenantName} slug={tenantSlug} compact={collapsed} />
        <nav aria-label="التنقل" className="mt-6 flex-1 overflow-y-auto overflow-x-hidden">
          <NavList pathname={pathname} collapsed={collapsed} />
        </nav>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-pressed={collapsed}
          aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          title={collapsed ? 'توسيع القائمة' : undefined}
          className="mt-4 flex h-11 items-center gap-3 rounded-xl px-3.5 text-[13px] font-bold text-[#E4D9D1] transition hover:bg-white/10 hover:text-white cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
            <path d="M13 6l6 6-6 6M5 6l6 6-6 6" />
          </svg>
          {!collapsed && <span className="whitespace-nowrap">طي القائمة</span>}
        </button>
      </aside>
    </>
  );
}
