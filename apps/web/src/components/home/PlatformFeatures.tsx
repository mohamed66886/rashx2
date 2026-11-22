/**
 * RASHX — Platform Features Section (Editorial OS Showcase)
 *
 * Server Component compatible (no 'use client').
 * Pure Flat Design: zero borders, zero rings, zero shadows, zero gradients.
 * Palette: #F0C5AE · #91B8C0 · #FAF9F8 · #FFFFFF · #54453D · #75645B · #C78360 · #2C4349
 *
 * Layout per screen:
 *  - mobile  (< md): Dark live-queue card → tonal feature stack → compact deep-teal insights deck
 *  - tablet  (md–lg): Full-width horizontal Gantt spotlight → 2×2 tonal feature showcase → analytics deck
 *  - desktop (lg+): 3-Act Editorial Architecture:
 *      Act 1: 12-col split dark command card with RTL-safe horizontal Gantt timeline
 *      Act 2: Asymmetric editorial rows (7+5, then 5+7) with bespoke flat UI widgets
 *      Act 3: Full-width #2C4349 executive insights panel with labeled revenue chart
 */

import type { ReactNode } from 'react';
import { PageContainer } from '@rashx/ui';
import {
  CalendarCheck,
  Receipt,
  UserRound,
  Users,
  Package,
  BarChart3,
  Clock,
  Sparkles,
} from '@rashx/icons';
import { SectionTitle } from '@/components/sections';
import type { Lang } from '@/lib/lang';

export interface PlatformFeaturesProps {
  lang: Lang;
  className?: string;
}

type FeatureKey = 'pos' | 'clients' | 'staff' | 'stock';

// Horizontal Gantt geometry (10:00 → 15:00 = 100%, uses insetInlineStart for automatic RTL/LTR)
const GANTT_TRACKS = [
  { start: 0, width: 34, tone: 'bg-[#91B8C0] text-[#2C4349]', dot: 'bg-[#2C4349]' },
  {
    start: 30,
    width: 38,
    tone: 'bg-[#F0C5AE] text-[#54453D]',
    dot: 'bg-[#C78360] motion-safe:animate-pulse',
  },
  { start: 58, width: 38, tone: 'bg-white text-[#54453D]', dot: 'bg-[#91B8C0]' },
] as const;

const HOURS = ['10:00', '11:00', '12:00', '13:00', '14:00'] as const;
const CHART_BARS = [38, 58, 46, 80, 64, 100, 52] as const;
const CHART_PEAK = 5;

export function PlatformFeatures({ lang, className }: PlatformFeaturesProps) {
  const isAr = lang === 'ar';

  const days = isAr
    ? ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة']
    : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const header = isAr
    ? {
        eyebrow: 'إمكانيات المنظومة',
        title: 'كل ما تحتاجه لإدارة صالونك باحترافية وتكامل.',
        subtitle:
          'أدوات مترابطة تعمل معًا بسلاسة لتبسيط العمليات اليومية وتوفير تجربة استثنائية لعميلاتك وفريق عملك.',
        liveLabel: 'مباشر',
        nowLabel: 'الآن 12:00',
      }
    : {
        eyebrow: 'PLATFORM CAPABILITIES',
        title: 'Everything you need to run your salon with precision and ease.',
        subtitle:
          'Connected tools working in unison to streamline daily operations and elevate the experience for your clients and team.',
        liveLabel: 'Live',
        nowLabel: 'Now 12:00',
      };

  const anchorFeature = isAr
    ? {
        badge: 'المحرك الأساسي',
        title: 'جدول مواعيد ذكي وفوري يربط الحجوزات بالفريق',
        description:
          'تنظيم شامل للمواعيد وتفادي التداخلات، مع تحديث حي لكل زيارة وتحديد الأخصائية والخدمة تلقائيًا لضمان تدفق عمل منظم داخل الصالون.',
        tags: ['منع تعارض المواعيد', 'توزيع فوري على الموظفات', 'تتبع حالة الزيارة'],
        previewTitle: 'اليوم · جدول المواعيد الحي',
        previewSlots: [
          {
            time: '10:00 ص',
            service: 'قص وتصفيف شعر',
            specialist: 'سارة',
            status: 'مكتمل',
            mobileTone: 'bg-[#91B8C0]/25 text-[#91B8C0]',
          },
          {
            time: '11:30 ص',
            service: 'جلسة عناية بالبشرة',
            specialist: 'نورة',
            status: 'جاري الآن',
            mobileTone: 'bg-[#F0C5AE] text-[#54453D] font-bold',
          },
          {
            time: '01:00 م',
            service: 'مساج وسبا متكامل',
            specialist: 'ريم',
            status: 'قادم',
            mobileTone: 'bg-white/15 text-[#FAF9F8]',
          },
        ],
      }
    : {
        badge: 'CORE SCHEDULING ENGINE',
        title: 'Intelligent Real-Time Calendar Connecting Bookings to Staff',
        description:
          'Comprehensive schedule coordination preventing double-bookings, with live visit tracking and automated specialist assignment to keep salon operations flowing smoothly.',
        tags: ['Conflict prevention', 'Instant staff routing', 'Live status tracking'],
        previewTitle: 'Today · Live Salon Schedule',
        previewSlots: [
          {
            time: '10:00 AM',
            service: 'Hair Styling & Cut',
            specialist: 'Sarah',
            status: 'Completed',
            mobileTone: 'bg-[#91B8C0]/25 text-[#91B8C0]',
          },
          {
            time: '11:30 AM',
            service: 'Facial Skincare Treatment',
            specialist: 'Noura',
            status: 'In Progress',
            mobileTone: 'bg-[#F0C5AE] text-[#54453D] font-bold',
          },
          {
            time: '01:00 PM',
            service: 'Full Body Spa & Massage',
            specialist: 'Reem',
            status: 'Upcoming',
            mobileTone: 'bg-white/15 text-[#FAF9F8]',
          },
        ],
      };

  const supportingFeatures: Array<{
    key: FeatureKey;
    index: string;
    icon: typeof Receipt;
    category: string;
    title: string;
    description: string;
    tags: string[];
    surface: string;
    iconBg: string;
    iconColor: string;
    tagBg: string;
    desktopSpan: string;
    isWide: boolean;
  }> = isAr
    ? [
        {
          key: 'pos',
          index: '01',
          icon: Receipt,
          category: 'المدفوعات والمبيعات',
          title: 'نقطة بيع سريعة وفوترة معتمدة',
          description:
            'تسجيل المدفوعات النقدية وعبر الشبكة في ثوانٍ، وتطبيق الخصومات والباقات، وإصدار فواتير رقمية موثقة ودقيقة.',
          tags: ['دفع متعدد', 'فواتير رقمية', 'باقات وعروض'],
          surface: 'bg-[#FAF9F8]',
          iconBg: 'bg-[#F0C5AE]',
          iconColor: 'text-[#54453D]',
          tagBg: 'bg-white text-[#54453D]',
          desktopSpan: 'lg:col-span-7',
          isWide: true,
        },
        {
          key: 'clients',
          index: '02',
          icon: UserRound,
          category: 'علاقات العميلات',
          title: 'ملف شامل لكل عميلة وسجل الزيارات',
          description:
            'سجل تفصيلي لحجوزات العميلة السابقة والخدمات المفضلة وملاحظات الجلسات لتقديم خدمة مخصصة تعزز ولائها ورضاها.',
          tags: ['سجل الزيارات', 'تفضيلات مخصصة', 'نقاط الولاء'],
          surface: 'bg-[#91B8C0]/20',
          iconBg: 'bg-[#2C4349]',
          iconColor: 'text-[#FAF9F8]',
          tagBg: 'bg-white/85 text-[#2C4349]',
          desktopSpan: 'lg:col-span-5',
          isWide: false,
        },
        {
          key: 'staff',
          index: '03',
          icon: Users,
          category: 'فريق العمل والإنتاجية',
          title: 'تنظيم الورديات واحتساب العمولات تلقائياً',
          description:
            'جدولة فترات العمل وإجازات الموظفات، مع احتساب فوري لعمولات الخدمات ومبيعات المنتجات بدقة دون حسابات يدوية.',
          tags: ['جدولة الورديات', 'عمولات تلقائية', 'صلاحيات الأدوار'],
          surface: 'bg-[#F0C5AE]/30',
          iconBg: 'bg-[#54453D]',
          iconColor: 'text-[#FAF9F8]',
          tagBg: 'bg-white/85 text-[#54453D]',
          desktopSpan: 'lg:col-span-5',
          isWide: false,
        },
        {
          key: 'stock',
          index: '04',
          icon: Package,
          category: 'المخزون والمشتريات',
          title: 'متابعة دقيقة للمخزون ومستهلكات الجلسات',
          description:
            'تتبع مباشر للكميات ومواد العناية المستخدمة في كل خدمة، مع تنبيهات مسبقة قبل نفاد المنتجات لتفادي أي انقطاع في العمل.',
          tags: ['جرد فوري', 'تنبيهات النقص', 'ربط بالخدمات'],
          surface: 'bg-[#FAF9F8]',
          iconBg: 'bg-[#91B8C0]/45',
          iconColor: 'text-[#2C4349]',
          tagBg: 'bg-white text-[#54453D]',
          desktopSpan: 'lg:col-span-7',
          isWide: true,
        },
      ]
    : [
        {
          key: 'pos',
          index: '01',
          icon: Receipt,
          category: 'POS & PAYMENTS',
          title: 'Rapid POS & Compliant Invoicing',
          description:
            'Process card and cash payments in seconds, apply discounts and packages, and generate accurate digital invoices instantly.',
          tags: ['Split payments', 'Digital invoices', 'Custom packages'],
          surface: 'bg-[#FAF9F8]',
          iconBg: 'bg-[#F0C5AE]',
          iconColor: 'text-[#54453D]',
          tagBg: 'bg-white text-[#54453D]',
          desktopSpan: 'lg:col-span-7',
          isWide: true,
        },
        {
          key: 'clients',
          index: '02',
          icon: UserRound,
          category: 'CLIENT RELATIONSHIPS',
          title: 'Complete Client Profiles & History',
          description:
            'Detailed history of past visits, preferred treatments, and specialist notes to deliver continuous personalized care that builds loyalty.',
          tags: ['Visit logs', 'Custom preferences', 'Loyalty points'],
          surface: 'bg-[#91B8C0]/20',
          iconBg: 'bg-[#2C4349]',
          iconColor: 'text-[#FAF9F8]',
          tagBg: 'bg-white/85 text-[#2C4349]',
          desktopSpan: 'lg:col-span-5',
          isWide: false,
        },
        {
          key: 'staff',
          index: '03',
          icon: Users,
          category: 'STAFF & PERFORMANCE',
          title: 'Shift Rosters & Automated Commissions',
          description:
            'Manage shifts, duties, and leaves with automated calculation of service and product commissions—eliminating manual errors.',
          tags: ['Shift scheduling', 'Auto commissions', 'Role permissions'],
          surface: 'bg-[#F0C5AE]/30',
          iconBg: 'bg-[#54453D]',
          iconColor: 'text-[#FAF9F8]',
          tagBg: 'bg-white/85 text-[#54453D]',
          desktopSpan: 'lg:col-span-5',
          isWide: false,
        },
        {
          key: 'stock',
          index: '04',
          icon: Package,
          category: 'INVENTORY CONTROL',
          title: 'Stock Control & Treatment Supplies',
          description:
            'Live tracking of products and supplies consumed during treatments, with smart alerts before stock runs low to prevent disruptions.',
          tags: ['Live stock counts', 'Low-stock alerts', 'Service linking'],
          surface: 'bg-[#FAF9F8]',
          iconBg: 'bg-[#91B8C0]/45',
          iconColor: 'text-[#2C4349]',
          tagBg: 'bg-white text-[#54453D]',
          desktopSpan: 'lg:col-span-7',
          isWide: true,
        },
      ];

  const metricsFeature = isAr
    ? {
        badge: 'التقارير والرؤى',
        title: 'رؤية تشغيلية وتحليلات فورية لأداء صالونك',
        description:
          'مؤشرات أداء مباشرة ترصد إيراداتك اليومية وساعات الذروة والخدمات الأكثر طلباً لاتخاذ قرارات مدروسة لتطوير عملك.',
        chartTitle: 'الإيرادات اليومية',
        peak: 'ذروة الأسبوع',
        metrics: [
          { value: '100%', label: 'ترابط كامل بين المواعيد ونقاط البيع' },
          { value: '0', label: 'أخطاء في احتساب العمولات اليدوية' },
          { value: '24/7', label: 'متابعة حية من أي شاشة وجهاز' },
        ],
      }
    : {
        badge: 'EXECUTIVE INSIGHTS',
        title: 'Real-Time Operational Visibility & Growth Insights',
        description:
          'Instant executive metrics tracking daily revenues, peak appointment hours, and top-requested services to drive confident growth.',
        chartTitle: 'Daily revenue',
        peak: 'Weekly peak',
        metrics: [
          { value: '100%', label: 'Appointment-to-POS integration' },
          { value: '0', label: 'Manual commission calculation errors' },
          { value: '24/7', label: 'Live monitoring across all devices' },
        ],
      };

  /* ── Flat UI Widgets for Tablet & Desktop ─────────────────────── */
  const widgets: Record<FeatureKey, ReactNode> = {
    pos: (
      <div aria-hidden="true" className="flex h-full flex-col justify-between rounded-2xl bg-white p-5">
        <div>
          <div className="flex items-center justify-between pb-3.5">
            <span className="rounded-lg bg-[#FAF9F8] px-2.5 py-1 font-mono text-[0.7rem] font-bold text-[#75645B]">
              #INV-2048
            </span>
            <span className="rounded-full bg-[#91B8C0]/25 px-2.5 py-0.5 text-[0.65rem] font-bold text-[#2C4349]">
              {isAr ? 'معتمدة' : 'Verified'}
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: isAr ? 'عناية بالبشرة' : 'Skincare Session', width: 'w-24' },
              { label: isAr ? 'تصفيف شعر' : 'Hair Styling', width: 'w-16' },
              { label: isAr ? 'سيروم عناية' : 'Care Serum', width: 'w-14' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl bg-[#FAF9F8] px-3 py-2"
              >
                <span className="text-xs font-semibold text-[#54453D]">{item.label}</span>
                <span className={`h-2 rounded-full bg-[#54453D]/20 ${item.width}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#54453D] px-3.5 py-2.5 text-[#FAF9F8]">
          <span className="text-xs font-bold">{isAr ? 'الإجمالي · شبكة' : 'Total · Card'}</span>
          <span className="rounded-lg bg-[#F0C5AE] px-2.5 py-0.5 text-[0.7rem] font-extrabold text-[#54453D]">
            {isAr ? 'تم الدفع' : 'Paid'}
          </span>
        </div>
      </div>
    ),
    clients: (
      <div aria-hidden="true" className="rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#91B8C0] text-sm font-black text-[#2C4349]">
              {isAr ? 'ل' : 'L'}
            </span>
            <div>
              <span className="block text-sm font-bold text-[#54453D]">
                {isAr ? 'لمى العتيبي' : 'Lama Al-Otaibi'}
              </span>
              <span className="block text-[0.7rem] text-[#75645B]">
                {isAr ? '14 زيارة · عميلة مميزة' : '14 visits · VIP client'}
              </span>
            </div>
          </div>
          <span className="rounded-lg bg-[#F0C5AE]/45 px-2.5 py-1 font-mono text-[0.7rem] font-bold text-[#54453D]">
            VIP
          </span>
        </div>

        <div className="mt-4 rounded-xl bg-[#FAF9F8] p-3">
          <div className="flex items-center justify-between text-[0.7rem] font-semibold text-[#75645B]">
            <span>{isAr ? 'مسار الولاء' : 'Loyalty progress'}</span>
            <span className="font-mono text-[#2C4349]">4 / 5</span>
          </div>
          <div className="mt-2.5 flex items-center">
            {[0, 1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-1 items-center last:flex-none">
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${
                    step < 4 ? 'bg-[#2C4349]' : 'bg-[#F0C5AE]'
                  }`}
                />
                {step < 4 && (
                  <span
                    className={`h-1 flex-1 ${step < 3 ? 'bg-[#91B8C0]' : 'bg-[#54453D]/10'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    staff: (
      <div aria-hidden="true" className="rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between text-[0.7rem] font-bold text-[#75645B]">
          <span>{isAr ? 'جدول الأسبوع' : 'Weekly shifts'}</span>
          <span className="rounded-full bg-[#F0C5AE]/45 px-2 py-0.5 text-[#54453D]">
            {isAr ? '5 ورديات' : '5 shifts'}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {[1, 1, 0, 1, 1, 1, 0].map((active, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span
                className={`h-10 w-full rounded-lg ${active ? 'bg-[#54453D]' : 'bg-[#FAF9F8]'}`}
              />
              <span className="text-[0.6rem] font-semibold text-[#75645B]">
                {days[i]?.slice(0, isAr ? 2 : 1)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-[#FAF9F8] p-3">
          <div className="flex items-center justify-between text-[0.7rem] font-bold text-[#54453D]">
            <span>{isAr ? 'عمولات تلقائية' : 'Auto commission'}</span>
            <span className="font-mono text-[#C78360]">+18%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
            <span className="block h-full w-[74%] rounded-full bg-[#C78360]" />
          </div>
        </div>
      </div>
    ),
    stock: (
      <div aria-hidden="true" className="flex h-full flex-col justify-between rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-bold text-[#54453D]">
            {isAr ? 'حالة المستهلكات' : 'Treatment supplies'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C78360]/15 px-2.5 py-0.5 text-[0.65rem] font-bold text-[#C78360]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C78360] motion-safe:animate-pulse" />
            {isAr ? '1 تنبيه نقص' : '1 low alert'}
          </span>
        </div>
        <div className="space-y-3">
          {[
            {
              name: isAr ? 'قناع ترطيب عضوي' : 'Organic Hydration Mask',
              pct: 84,
              bar: 'bg-[#91B8C0]',
              low: false,
            },
            {
              name: isAr ? 'زيت أرغان علاجي' : 'Treatment Argan Oil',
              pct: 58,
              bar: 'bg-[#2C4349]',
              low: false,
            },
            {
              name: isAr ? 'سيروم فيتامين C' : 'Vitamin C Serum',
              pct: 16,
              bar: 'bg-[#C78360]',
              low: true,
            },
          ].map((item) => (
            <div key={item.name} className="rounded-xl bg-[#FAF9F8] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#54453D]">{item.name}</span>
                <span
                  className={`font-mono text-[0.7rem] font-bold ${
                    item.low ? 'text-[#C78360]' : 'text-[#75645B]'
                  }`}
                >
                  {item.pct}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                <span
                  className={`block h-full rounded-full ${item.bar}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  /* ── Horizontal Gantt Board (shared by Tablet & Desktop) ──────── */
  const renderHorizontalGantt = () => (
    <div
      aria-hidden="true"
      className="rounded-2xl bg-[#FAF9F8]/[0.07] p-4 sm:p-5 xl:p-6"
    >
      {/* Panel Top Bar */}
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#F0C5AE]" />
          <span className="text-xs font-bold text-[#FAF9F8] sm:text-sm">
            {anchorFeature.previewTitle}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.7rem] font-semibold text-[#91B8C0]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#91B8C0] motion-safe:animate-pulse" />
          {header.liveLabel}
        </span>
      </div>

      {/* Time Scale Header */}
      <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3 pb-2.5">
        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#FAF9F8]/50">
          {isAr ? 'الأخصائية' : 'Specialist'}
        </span>
        <div className="grid grid-cols-5">
          {HOURS.map((h) => (
            <span
              key={h}
              className="font-mono text-[0.65rem] font-semibold text-[#FAF9F8]/60"
            >
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Specialist Horizontal Rows + Now Playhead */}
      <div className="relative space-y-2.5">
        {anchorFeature.previewSlots.map((slot, i) => {
          const track = GANTT_TRACKS[i]!;
          return (
            <div
              key={slot.specialist}
              className="grid grid-cols-[5.5rem_1fr] items-center gap-3"
            >
              {/* Specialist Identity */}
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    i === 0
                      ? 'bg-[#91B8C0] text-[#2C4349]'
                      : i === 1
                        ? 'bg-[#F0C5AE] text-[#54453D]'
                        : 'bg-white/15 text-[#FAF9F8]'
                  }`}
                >
                  {slot.specialist.charAt(0)}
                </span>
                <span className="truncate text-xs font-bold text-[#FAF9F8]">
                  {slot.specialist}
                </span>
              </div>

              {/* Track */}
              <div className="relative h-14 rounded-xl bg-white/[0.06]">
                <div
                  className={`absolute inset-y-1.5 flex flex-col justify-center overflow-hidden rounded-lg px-3 ${track.tone}`}
                  style={{
                    insetInlineStart: `${track.start}%`,
                    width: `${track.width}%`,
                  }}
                >
                  <span className="truncate text-xs font-extrabold leading-tight">
                    {slot.service}
                  </span>
                  <span className="mt-0.5 inline-flex items-center gap-1.5 text-[0.65rem] font-semibold opacity-80">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${track.dot}`} />
                    <span className="truncate">{slot.status}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Vertical "Now" Playhead positioned over the track area (at 40% = 12:00) */}
        <div className="pointer-events-none absolute inset-y-0 inset-x-0 grid grid-cols-[5.5rem_1fr] gap-3">
          <span />
          <div className="relative">
            <div
              className="absolute inset-y-0 flex flex-col items-center"
              style={{ insetInlineStart: '40%' }}
            >
              <span className="-mt-1.5 rounded-full bg-[#C78360] px-2 py-0.5 font-mono text-[0.6rem] font-bold text-[#FAF9F8]">
                {header.nowLabel}
              </span>
              <span className="w-[2px] flex-1 bg-[#C78360]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="platform-features"
      className={`relative overflow-hidden bg-white py-16 sm:py-20 lg:py-28 xl:py-32 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle
            title={header.title}
            align="center"
          />
        </div>

        {/* ============================================================
            1. MOBILE LAYOUT (< md): Dark Queue → Tonal Stack → Pulse Deck
           ============================================================ */}
        <div className="mt-10 space-y-4 md:hidden">
          {/* Mobile Anchor: Dark Espresso Card */}
          <article className="relative overflow-hidden rounded-[1.75rem] bg-[#54453D] p-5 text-[#FAF9F8]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-16 -top-16 h-44 w-44 rounded-full bg-[#F0C5AE]/[0.08]"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#F0C5AE]">
                <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {anchorFeature.badge}
              </span>

              <h3 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-balance">
                {anchorFeature.title}
              </h3>

              <p className="mt-2.5 text-sm leading-relaxed text-[#FAF9F8]/80">
                {anchorFeature.description}
              </p>

              {/* Mobile Live Queue */}
              <div className="mt-5 rounded-2xl bg-white/[0.07] p-3.5">
                <div className="flex items-center justify-between pb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FAF9F8]">
                    <Clock className="h-3.5 w-3.5 text-[#F0C5AE]" aria-hidden="true" />
                    {anchorFeature.previewTitle}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-semibold text-[#91B8C0]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#91B8C0] motion-safe:animate-pulse" />
                    {header.liveLabel}
                  </span>
                </div>

                <div className="space-y-2">
                  {anchorFeature.previewSlots.map((slot) => (
                    <div
                      key={slot.time}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.07] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <span className="block font-mono text-[0.7rem] font-semibold text-[#F0C5AE]">
                          {slot.time} · {slot.specialist}
                        </span>
                        <span className="block truncate text-xs font-bold text-[#FAF9F8]">
                          {slot.service}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 rounded-lg px-2.5 py-1 text-[0.65rem] font-semibold ${slot.mobileTone}`}
                      >
                        {slot.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {anchorFeature.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1 text-xs font-semibold text-[#FAF9F8]"
                  >
                    <Sparkles className="h-3 w-3 text-[#F0C5AE]" aria-hidden="true" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Mobile Supporting Modules: Tonal Flat Cards */}
          <div className="space-y-3.5">
            {supportingFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <article
                  key={feat.key}
                  className={`relative overflow-hidden rounded-[1.5rem] p-5 ${feat.surface}`}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-2 end-4 select-none font-mono text-6xl font-black leading-none text-[#54453D]/[0.05]"
                  >
                    {feat.index}
                  </span>

                  <div className="relative flex items-center justify-between gap-3">
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feat.iconBg} ${feat.iconColor}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#75645B]">
                      {feat.category}
                    </span>
                  </div>

                  <h3 className="relative mt-4 text-lg font-extrabold tracking-tight text-[#54453D]">
                    {feat.title}
                  </h3>

                  <p className="relative mt-2 text-sm leading-relaxed text-[#75645B]">
                    {feat.description}
                  </p>

                  <div className="relative mt-4 flex flex-wrap gap-1.5">
                    {feat.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${feat.tagBg}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Mobile Executive Insights: Deep Slate-Teal */}
          <article className="relative overflow-hidden rounded-[1.75rem] bg-[#2C4349] p-5 text-[#FAF9F8]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -start-16 h-44 w-44 rounded-full bg-[#91B8C0]/[0.09]"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#91B8C0]">
                <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                {metricsFeature.badge}
              </span>

              <h3 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-balance">
                {metricsFeature.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-[#FAF9F8]/80">
                {metricsFeature.description}
              </p>

              {/* Compact Sparkline Chart */}
              <div aria-hidden="true" className="mt-5 rounded-2xl bg-white/[0.07] p-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{metricsFeature.chartTitle}</span>
                  <span className="text-[#F0C5AE]">{metricsFeature.peak}</span>
                </div>
                <div className="mt-3 flex h-20 items-end gap-1.5">
                  {CHART_BARS.map((h, i) => (
                    <span
                      key={i}
                      className={`flex-1 rounded-t-md ${
                        i === CHART_PEAK ? 'bg-[#F0C5AE]' : 'bg-[#91B8C0]/45'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Metrics List */}
              <div className="mt-3 space-y-2">
                {metricsFeature.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center gap-4 rounded-xl bg-white/[0.08] px-4 py-3"
                  >
                    <span className="w-16 shrink-0 font-mono text-2xl font-black text-[#F0C5AE]">
                      {m.value}
                    </span>
                    <span className="text-xs font-semibold leading-snug text-[#FAF9F8]/85">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        {/* ============================================================
            2. TABLET LAYOUT (md → lg): Gantt Spotlight → 2×2 Showcase → Deck
           ============================================================ */}
        <div className="mt-14 hidden space-y-5 md:block lg:hidden">
          {/* Tablet Act 1: Full-width Dark Spotlight */}
          <article className="relative overflow-hidden rounded-[2rem] bg-[#54453D] p-8 text-[#FAF9F8]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-[#F0C5AE]/[0.07]"
            />

            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F0C5AE]">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  {anchorFeature.badge}
                </span>
                <div className="flex flex-wrap gap-2">
                  {anchorFeature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-[#FAF9F8]/90"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <h3 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-balance">
                {anchorFeature.title}
              </h3>

              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#FAF9F8]/80">
                {anchorFeature.description}
              </p>

              <div className="mt-7">{renderHorizontalGantt()}</div>
            </div>
          </article>

          {/* Tablet Act 2: 2×2 Tonal Feature Modules */}
          <div className="grid grid-cols-2 gap-5">
            {supportingFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <article
                  key={feat.key}
                  className={`flex flex-col rounded-[1.75rem] p-6 ${feat.surface}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feat.iconBg} ${feat.iconColor}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#75645B]">
                      {feat.category}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-extrabold tracking-tight text-[#54453D]">
                    {feat.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                    {feat.description}
                  </p>

                  <div className="mt-5">{widgets[feat.key]}</div>

                  <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {feat.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${feat.tagBg}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Tablet Act 3: Deep Slate-Teal Analytics Deck */}
          <article className="relative overflow-hidden rounded-[2rem] bg-[#2C4349] p-8 text-[#FAF9F8]">
            <div className="grid grid-cols-12 items-center gap-6">
              <div className="col-span-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#91B8C0]">
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  {metricsFeature.badge}
                </span>

                <h3 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-balance">
                  {metricsFeature.title}
                </h3>

                <p className="mt-3 text-base leading-relaxed text-[#FAF9F8]/80">
                  {metricsFeature.description}
                </p>
              </div>

              <div aria-hidden="true" className="col-span-6 rounded-2xl bg-white/[0.07] p-5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{metricsFeature.chartTitle}</span>
                  <span className="inline-flex items-center gap-1.5 text-[#F0C5AE]">
                    <span className="h-2 w-2 rounded-full bg-[#F0C5AE]" />
                    {metricsFeature.peak}
                  </span>
                </div>
                <div className="mt-4 flex h-32 items-end gap-2">
                  {CHART_BARS.map((h, i) => (
                    <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                      <span
                        className={`w-full rounded-t-lg ${
                          i === CHART_PEAK ? 'bg-[#F0C5AE]' : 'bg-[#91B8C0]/45'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[0.6rem] font-semibold text-[#FAF9F8]/60">
                        {days[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {metricsFeature.metrics.map((m) => (
                <div key={m.label} className="rounded-2xl bg-white/[0.08] p-5">
                  <span className="block font-mono text-3xl font-black text-[#F0C5AE]">
                    {m.value}
                  </span>
                  <span className="mt-1.5 block text-xs font-semibold leading-snug text-[#FAF9F8]/80">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* ============================================================
            3. DESKTOP LAYOUT (lg+): 3-Act Architectural Editorial Suite
           ============================================================ */}
        <div className="mt-16 hidden space-y-6 lg:block xl:mt-20 xl:space-y-7">
          {/* ── ACT 1: Core Scheduling Engine Split (#54453D) ──────── */}
          <article className="relative overflow-hidden rounded-[2.25rem] bg-[#54453D] p-10 text-[#FAF9F8] xl:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full bg-[#F0C5AE]/[0.07]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -start-20 h-72 w-72 rounded-full bg-[#91B8C0]/[0.07]"
            />

            <div className="relative grid grid-cols-12 items-center gap-10 xl:gap-14">
              {/* Start 5 cols: Editorial Narrative */}
              <div className="col-span-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#F0C5AE]">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  {anchorFeature.badge}
                </span>

                <h3 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-balance xl:text-4xl">
                  {anchorFeature.title}
                </h3>

                <p className="mt-4 text-base leading-relaxed text-[#FAF9F8]/80 xl:text-lg">
                  {anchorFeature.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {anchorFeature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#FAF9F8] xl:text-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#F0C5AE]" aria-hidden="true" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* End 7 cols: Horizontal Gantt Studio Board */}
              <div className="col-span-7">{renderHorizontalGantt()}</div>
            </div>
          </article>

          {/* ── ACT 2: Asymmetric Editorial Grid (7+5, then 5+7) ───── */}
          <div className="grid grid-cols-12 gap-6 xl:gap-7">
            {supportingFeatures.map((feat) => {
              const Icon = feat.icon;

              if (feat.isWide) {
                return (
                  <article
                    key={feat.key}
                    className={`relative overflow-hidden rounded-[2rem] p-8 xl:p-9 ${feat.surface} ${feat.desktopSpan}`}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-4 end-6 select-none font-mono text-8xl font-black leading-none text-[#54453D]/[0.04]"
                    >
                      {feat.index}
                    </span>

                    <div className="relative grid h-full grid-cols-12 items-stretch gap-6 xl:gap-8">
                      <div className="col-span-6 flex flex-col">
                        <div className="flex items-center gap-3">
                          <div
                            className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${feat.iconBg} ${feat.iconColor}`}
                          >
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#75645B]">
                            {feat.category}
                          </span>
                        </div>

                        <h3 className="mt-5 text-2xl font-extrabold leading-snug tracking-tight text-[#54453D]">
                          {feat.title}
                        </h3>

                        <p className="mt-3 text-sm leading-relaxed text-[#75645B] xl:text-base">
                          {feat.description}
                        </p>

                        <div className="mt-auto flex flex-wrap gap-2 pt-6">
                          {feat.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${feat.tagBg}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-6">{widgets[feat.key]}</div>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={feat.key}
                  className={`relative flex flex-col overflow-hidden rounded-[2rem] p-8 xl:p-9 ${feat.surface} ${feat.desktopSpan}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${feat.iconBg} ${feat.iconColor}`}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#54453D]/70">
                      {feat.category}
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-extrabold leading-snug tracking-tight text-[#54453D]">
                    {feat.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-[#54453D]/80 xl:text-base">
                    {feat.description}
                  </p>

                  <div className="mt-6">{widgets[feat.key]}</div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    {feat.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${feat.tagBg}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {/* ── ACT 3: Executive Insights Command Deck (#2C4349) ───── */}
          <article className="relative overflow-hidden rounded-[2.25rem] bg-[#2C4349] p-10 text-[#FAF9F8] xl:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -end-20 h-72 w-72 rounded-full bg-[#91B8C0]/[0.08]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -start-16 -top-24 h-64 w-64 rounded-full bg-[#F0C5AE]/[0.07]"
            />

            <div className="relative grid grid-cols-12 items-center gap-10 xl:gap-14">
              {/* Start 5 cols: Copy + KPI Row */}
              <div className="col-span-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#91B8C0]">
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  {metricsFeature.badge}
                </span>

                <h3 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-balance xl:text-4xl">
                  {metricsFeature.title}
                </h3>

                <p className="mt-4 text-base leading-relaxed text-[#FAF9F8]/80 xl:text-lg">
                  {metricsFeature.description}
                </p>

                <div className="mt-7 space-y-2.5">
                  {metricsFeature.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center gap-4 rounded-2xl bg-white/[0.08] px-5 py-3.5"
                    >
                      <span className="w-20 shrink-0 font-mono text-2xl font-black text-[#F0C5AE] xl:text-3xl">
                        {m.value}
                      </span>
                      <span className="text-sm font-semibold leading-snug text-[#FAF9F8]/85">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* End 7 cols: Full-Scale Daily Revenue Chart */}
              <div aria-hidden="true" className="col-span-7 rounded-3xl bg-white/[0.07] p-7 xl:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-bold text-[#FAF9F8] xl:text-base">
                      {metricsFeature.chartTitle}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#FAF9F8]/60">
                      {isAr ? 'متابعة لحظية لأداء الأسبوع' : 'Live weekly performance tracking'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE] px-3 py-1 text-xs font-extrabold text-[#54453D]">
                    <span className="h-2 w-2 rounded-full bg-[#54453D]" />
                    {metricsFeature.peak}
                  </span>
                </div>

                <div className="mt-8 flex h-56 items-end gap-3 xl:h-64 xl:gap-4">
                  {CHART_BARS.map((h, i) => {
                    const isPeak = i === CHART_PEAK;
                    return (
                      <div
                        key={i}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2.5"
                      >
                        {isPeak && (
                          <span className="rounded-lg bg-[#F0C5AE] px-2 py-0.5 font-mono text-[0.65rem] font-black text-[#54453D]">
                            100%
                          </span>
                        )}
                        <span
                          className={`w-full rounded-t-xl transition-opacity duration-200 ${
                            isPeak ? 'bg-[#F0C5AE]' : 'bg-[#91B8C0]/45 hover:bg-[#91B8C0]/70'
                          }`}
                          style={{ height: `${h}%` }}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            isPeak ? 'text-[#F0C5AE]' : 'text-[#FAF9F8]/65'
                          }`}
                        >
                          {days[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>
        </div>
      </PageContainer>
    </section>
  );
}