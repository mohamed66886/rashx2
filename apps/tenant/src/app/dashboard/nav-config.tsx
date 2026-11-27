import React from 'react';

export type IconName =
  | 'home'
  | 'building'
  | 'users'
  | 'scissors'
  | 'sparkle'
  | 'lock'
  | 'percent'
  | 'wallet'
  | 'settings'
  | 'calendar'
  | 'user-check'
  | 'activity'
  | 'armchair'
  | 'clock'
  | 'receipt'
  | 'package';

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
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  'user-check': (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </>
  ),
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  armchair: (
    <>
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z" />
      <path d="M5 18v2" />
      <path d="M19 18v2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  receipt: (
    <>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </>
  ),
  package: (
    <>
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </>
  ),
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {ICONS[name]}
    </svg>
  );
}

export interface NavLink {
  href: string;
  label: string;
}
export interface NavGroup {
  title?: string;
  links: NavLink[];
}
export interface NavSection {
  id: string;
  /** short label under the rail icon */
  label: string;
  /** title shown in the section panel / breadcrumb */
  title: string;
  icon: IconName;
  /** landing page of the section */
  href: string;
  groups: NavGroup[];
  /** rendered at the bottom of the rail */
  pinBottom?: boolean;
}

/**
 * Information architecture: 8 sections instead of 15 flat items.
 * The rail shows sections, the side panel shows the pages of the active section.
 */
export const sections: NavSection[] = [
  { id: 'home', label: 'الرئيسية', title: 'الرئيسية', icon: 'home', href: '/dashboard', groups: [] },
  {
    id: 'ops',
    label: 'التشغيل',
    title: 'التشغيل اليومي',
    icon: 'activity',
    href: '/dashboard/operations',
    groups: [
      {
        title: 'اليوم',
        links: [
          { href: '/dashboard/operations', label: 'لوحة التشغيل اليومي' },
          { href: '/dashboard/queue', label: 'طابور الانتظار والنداء' },
          { href: '/dashboard/operations/walk-in', label: 'تسجيل عميل فوري (Walk-in)' },
        ],
      },
      {
        title: 'المواعيد',
        links: [
          { href: '/dashboard/calendar', label: 'تقويم المواعيد' },
          { href: '/dashboard/bookings', label: 'الحجوزات والمواعيد' },
        ],
      },
      { title: 'الموارد', links: [{ href: '/dashboard/resources', label: 'الكراسي والموارد' }] },
    ],
  },
  {
    id: 'pos',
    label: 'المبيعات',
    title: 'نقطة البيع والفوترة',
    icon: 'receipt',
    href: '/dashboard/pos',
    groups: [
      {
        links: [
          { href: '/dashboard/pos', label: 'شاشة البيع والكاشير' },
          { href: '/dashboard/pos/invoices', label: 'الفواتير' },
          { href: '/dashboard/pos/payments', label: 'المدفوعات والاسترداد' },
          { href: '/dashboard/pos/sessions', label: 'جلسات الصندوق والوردية' },
          { href: '/dashboard/pos/settings', label: 'وسائل الدفع' },
        ],
      },
    ],
  },
  {
    id: 'customers',
    label: 'العملاء',
    title: 'العملاء',
    icon: 'user-check',
    href: '/dashboard/customers',
    groups: [{ links: [{ href: '/dashboard/customers', label: 'العملاء' }] }],
  },
  {
    id: 'inventory',
    label: 'المخزون',
    title: 'المخزون والمشتريات',
    icon: 'package',
    href: '/dashboard/inventory',
    groups: [
      {
        title: 'المخزون',
        links: [
          { href: '/dashboard/inventory', label: 'نظرة عامة والتقييم' },
          { href: '/dashboard/inventory/products', label: 'المنتجات والتصنيفات' },
          { href: '/dashboard/inventory/balances', label: 'أرصدة الفروع' },
          { href: '/dashboard/inventory/movements', label: 'سجل حركات المخزون' },
        ],
      },
      {
        title: 'المشتريات',
        links: [
          { href: '/dashboard/inventory/suppliers', label: 'الموردون والذمم' },
          { href: '/dashboard/inventory/purchase-orders', label: 'أوامر الشراء والاستلام' },
        ],
      },
      {
        title: 'العمليات',
        links: [
          { href: '/dashboard/inventory/transfers', label: 'تحويلات الفروع' },
          { href: '/dashboard/inventory/adjustments', label: 'التسويات والجرد الفعلي' },
        ],
      },
    ],
  },
  {
    id: 'team',
    label: 'المنشأة',
    title: 'المنشأة والفريق',
    icon: 'users',
    href: '/dashboard/branches',
    groups: [
      {
        title: 'الهيكل',
        links: [
          { href: '/dashboard/branches', label: 'الفروع' },
          { href: '/dashboard/employees', label: 'الموظفون' },
          { href: '/dashboard/providers', label: 'مقدمو الخدمات' },
        ],
      },
      {
        title: 'الخدمات',
        links: [
          { href: '/dashboard/services', label: 'قائمة الخدمات' },
          { href: '/dashboard/service-categories', label: 'تصنيفات الخدمات' },
        ],
      },
      {
        title: 'الوصول والعمولات',
        links: [
          { href: '/dashboard/users', label: 'المستخدمون والصلاحيات' },
          { href: '/dashboard/commission-policies', label: 'سياسات العمولات' },
        ],
      },
    ],
  },
  {
    id: 'finance',
    label: 'المالية',
    title: 'المحاسبة والمالية',
    icon: 'wallet',
    href: '/dashboard/accounting',
    groups: [
      { title: 'نظرة', links: [{ href: '/dashboard/accounting', label: 'نظرة مالية' }] },
      {
        title: 'الدفاتر',
        links: [
          { href: '/dashboard/accounting/accounts', label: 'شجرة الحسابات' },
          { href: '/dashboard/accounting/journals', label: 'القيود اليومية' },
          { href: '/dashboard/accounting/ledger', label: 'دفتر الأستاذ' },
          { href: '/dashboard/accounting/trial-balance', label: 'ميزان المراجعة' },
        ],
      },
      {
        title: 'الضبط',
        links: [
          { href: '/dashboard/accounting/periods', label: 'الفترات المالية' },
          { href: '/dashboard/accounting/cost-centers', label: 'مراكز التكلفة' },
        ],
      },
    ],
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    title: 'إعدادات المنشأة',
    icon: 'settings',
    href: '/dashboard/settings/profile',
    pinBottom: true,
    groups: [
      {
        links: [
          { href: '/dashboard/settings/profile', label: 'ملف المنشأة' },
          { href: '/dashboard/settings/tax', label: 'الضريبة والزكاة' },
          { href: '/dashboard/settings/general', label: 'الإعدادات العامة' },
          { href: '/dashboard/settings/seo', label: 'الملف العام و SEO' },
        ],
      },
    ],
  },
];

export const hasPanel = (s: NavSection) => s.groups.reduce((n, g) => n + g.links.length, 0) > 1;

// flat lookup built once at module load (not per render)
const FLAT: { section: NavSection; link: NavLink }[] = sections.flatMap((section) =>
  section.groups.flatMap((g) => g.links.map((link) => ({ section, link }))),
);

/** Longest-prefix match → active section + active link. */
export function resolveActive(pathname: string): { section: NavSection; link: NavLink | null } {
  if (pathname === '/dashboard') return { section: sections[0], link: null };
  let best: { section: NavSection; link: NavLink } | null = null;
  for (const e of FLAT) {
    const h = e.link.href;
    if ((pathname === h || pathname.startsWith(h + '/')) && (!best || h.length > best.link.href.length)) best = e;
  }
  return best ?? { section: sections[0], link: null };
}

export function getCrumbs(pathname: string): { label: string; href?: string }[] {
  if (pathname === '/dashboard') return [{ label: 'الرئيسية' }];
  const { section, link } = resolveActive(pathname);
  const crumbs: { label: string; href?: string }[] = [{ label: 'الرئيسية', href: '/dashboard' }];
  if (!link || link.label === section.title) crumbs.push({ label: section.title });
  else crumbs.push({ label: section.title, href: section.href }, { label: link.label });
  return crumbs;
}
