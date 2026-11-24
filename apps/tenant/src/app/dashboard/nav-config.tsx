import React from 'react';

export type IconName = 'home' | 'building' | 'users' | 'scissors' | 'sparkle' | 'lock' | 'percent' | 'wallet' | 'settings';

const ICONS: Record<IconName, React.ReactNode> = {
  home: <path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6" />,
  building: <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 10h5a1 1 0 0 1 1 1v10M3 21h18M8 8h2M8 12h2M8 16h2" />,
  users: <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.3M15.5 5.2a3.5 3.5 0 0 1 0 6.6" />,
  scissors: <path d="M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.1 7.9L20 18M8.1 16.1L20 6" />,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" />,
  lock: <path d="M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V8a4 4 0 0 1 8 0v3" />,
  percent: <path d="M19 5L5 19M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />,
  wallet: <path d="M4 7a2 2 0 0 1 2-2h11v4M4 7v11a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6a2 2 0 0 1-2-2zM16 14.5h.01" />,
  settings: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {ICONS[name]}
    </svg>
  );
}

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  subItems?: { href: string; label: string }[];
}

export const navItems: NavItem[] = [
  { href: '/dashboard', label: 'الرئيسية', icon: 'home' },
  { href: '/dashboard/branches', label: 'الفروع', icon: 'building' },
  { href: '/dashboard/employees', label: 'الموظفون', icon: 'users' },
  { href: '/dashboard/providers', label: 'مقدمو الخدمات', icon: 'scissors' },
  {
    href: '/dashboard/services',
    label: 'دليل الخدمات',
    icon: 'sparkle',
    subItems: [
      { href: '/dashboard/services', label: 'قائمة الخدمات' },
      { href: '/dashboard/service-categories', label: 'تصنيفات الخدمات' },
    ],
  },
  { href: '/dashboard/users', label: 'المستخدمون والصلاحيات', icon: 'lock' },
  { href: '/dashboard/commission-policies', label: 'سياسات العمولات', icon: 'percent' },
  {
    href: '/dashboard/accounting',
    label: 'المحاسبة والمالية',
    icon: 'wallet',
    subItems: [
      { href: '/dashboard/accounting', label: 'نظرة مالية' },
      { href: '/dashboard/accounting/accounts', label: 'شجرة الحسابات' },
      { href: '/dashboard/accounting/journals', label: 'القيود اليومية' },
      { href: '/dashboard/accounting/ledger', label: 'دفتر الأستاذ' },
      { href: '/dashboard/accounting/trial-balance', label: 'ميزان المراجعة' },
      { href: '/dashboard/accounting/periods', label: 'الفترات المالية' },
      { href: '/dashboard/accounting/cost-centers', label: 'مراكز التكلفة' },
    ],
  },
  {
    href: '/dashboard/settings/profile',
    label: 'إعدادات المنشأة',
    icon: 'settings',
    subItems: [
      { href: '/dashboard/settings/profile', label: 'ملف المنشأة' },
      { href: '/dashboard/settings/tax', label: 'الضريبة والزكاة' },
      { href: '/dashboard/settings/general', label: 'الإعدادات العامة' },
      { href: '/dashboard/settings/seo', label: 'الملف العام و SEO' },
    ],
  },
];

/** Same section-matching rules as the original nav. */
export function isItemActive(item: NavItem, pathname: string) {
  if (item.href === '/dashboard') return pathname === '/dashboard';
  return (
    pathname.startsWith(item.href) ||
    (item.href === '/dashboard/services' && pathname.startsWith('/dashboard/service-categories')) ||
    (item.href === '/dashboard/settings/profile' && pathname.startsWith('/dashboard/settings'))
  );
}

/** Breadcrumb trail for the header. */
export function getCrumbs(pathname: string): { label: string; href?: string }[] {
  const home = { label: 'الرئيسية', href: '/dashboard' };
  if (pathname === '/dashboard') return [{ label: 'الرئيسية' }];
  let best: { crumbs: { label: string; href?: string }[]; len: number } | null = null;
  for (const item of navItems) {
    if (item.href !== '/dashboard' && pathname.startsWith(item.href) && (!best || item.href.length > best.len)) {
      best = { crumbs: [home, { label: item.label }], len: item.href.length };
    }
    for (const sub of item.subItems ?? []) {
      if (pathname.startsWith(sub.href) && (!best || sub.href.length >= best.len)) {
        best = {
          crumbs: sub.label === item.label ? [home, { label: item.label }] : [home, { label: item.label, href: item.href }, { label: sub.label }],
          len: sub.href.length,
        };
      }
    }
  }
  return best ? best.crumbs : [home];
}
