/**
 * RASHX — Platform Features Section (bento redesign)
 *
 * Server Component compatible (no 'use client').
 * Flat design only: zero borders, zero shadows, zero gradients.
 * Palette: #F0C5AE · #91B8C0 · #FAF9F8 · #FFFFFF · #54453D (+ existing #75645B, #C78360, #2C4349)
 *
 * Layout per screen:
 *  - mobile  (< sm): compact stacked cards, anchor shows a simple live list, mini visuals hidden
 *  - tablet  (sm–lg): 2-column bento, anchor spans full width with a swimlane calendar below its copy
 *  - desktop (lg+): 12-column bento — anchor (8 cols, tall) beside POS + Clients, then Staff (5) + Stock (7),
 *                   then a full-width insights panel with a revenue chart
 */

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

// Swimlane geometry: window 10:00 → 15:00 (5h). Values are % of lane height.
const LANE_BLOCKS = [
  { top: 0, height: 20 }, // 10:00 → 11:00
  { top: 30, height: 30 }, // 11:30 → 13:00
  { top: 60, height: 30 }, // 13:00 → 14:30
] as const;
const LANE_TONES = ['bg-[#91B8C0]/35', 'bg-[#F0C5AE]', 'bg-white'] as const;
const LANE_DOTS = ['bg-[#2C4349]', 'bg-[#C78360] motion-safe:animate-pulse', 'bg-[#91B8C0]'] as const;
const HOURS = ['10:00', '11:00', '12:00', '13:00', '14:00'] as const;

const CHART_BARS = [38, 58, 46, 80, 64, 100, 52] as const;
const CHART_PEAK = 5;

export function PlatformFeatures({ lang, className }: PlatformFeaturesProps) {
  const isAr = lang === 'ar';

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
            statusTone: 'bg-[#91B8C0]/25 text-[#2C4349]',
          },
          {
            time: '11:30 ص',
            service: 'جلسة عناية بالبشرة',
            specialist: 'نورة',
            status: 'جاري الآن',
            statusTone: 'bg-[#F0C5AE] text-[#54453D] font-bold',
          },
          {
            time: '01:00 م',
            service: 'مساج وسبا متكامل',
            specialist: 'ريم',
            status: 'قادم',
            statusTone: 'bg-white text-[#75645B]',
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
            statusTone: 'bg-[#91B8C0]/25 text-[#2C4349]',
          },
          {
            time: '11:30 AM',
            service: 'Facial Skincare Treatment',
            specialist: 'Noura',
            status: 'In Progress',
            statusTone: 'bg-[#F0C5AE] text-[#54453D] font-bold',
          },
          {
            time: '01:00 PM',
            service: 'Full Body Spa & Massage',
            specialist: 'Reem',
            status: 'Upcoming',
            statusTone: 'bg-white text-[#75645B]',
          },
        ],
      };

  const supportingFeatures: Array<{
    key: FeatureKey;
    icon: typeof Receipt;
    category: string;
    title: string;
    description: string;
    tags: string[];
    iconBg: string;
    iconColor: string;
    span: string;
  }> = isAr
    ? [
        {
          key: 'pos',
          icon: Receipt,
          category: 'المدفوعات والمبيعات',
          title: 'نقطة بيع سريعة وفوترة معتمدة',
          description:
            'تسجيل المدفوعات النقدية وعبر الشبكة في ثوانٍ، وتطبيق الخصومات والباقات، وإصدار فواتير رقمية موثقة ودقيقة.',
          tags: ['دفع متعدد', 'فواتير رقمية', 'باقات وعروض'],
          iconBg: 'bg-[#F0C5AE]',
          iconColor: 'text-[#54453D]',
          span: 'lg:col-span-4',
        },
        {
          key: 'clients',
          icon: UserRound,
          category: 'علاقات العميلات',
          title: 'ملف شامل لكل عميلة وسجل الزيارات',
          description:
            'سجل تفصيلي لحجوزات العميلة السابقة والخدمات المفضلة وملاحظات الجلسات لتقديم خدمة مخصصة تعزز ولائها ورضاها.',
          tags: ['سجل الزيارات', 'تفضيلات مخصصة', 'نقاط الولاء'],
          iconBg: 'bg-[#91B8C0]',
          iconColor: 'text-[#2C4349]',
          span: 'lg:col-span-4',
        },
        {
          key: 'staff',
          icon: Users,
          category: 'فريق العمل والإنتاجية',
          title: 'تنظيم الورديات واحتساب العمولات تلقائياً',
          description:
            'جدولة فترات العمل وإجازات الموظفات، مع احتساب فوري لعمولات الخدمات ومبيعات المنتجات بدقة دون حسابات يدوية.',
          tags: ['جدولة الورديات', 'عمولات تلقائية', 'صلاحيات الأدوار'],
          iconBg: 'bg-white',
          iconColor: 'text-[#54453D]',
          span: 'lg:col-span-5',
        },
        {
          key: 'stock',
          icon: Package,
          category: 'المخزون والمشتريات',
          title: 'متابعة دقيقة للمخزون ومستهلكات الجلسات',
          description:
            'تتبع مباشر للكميات ومواد العناية المستخدمة في كل خدمة، مع تنبيهات مسبقة قبل نفاد المنتجات لتفادي أي انقطاع في العمل.',
          tags: ['جرد فوري', 'تنبيهات النقص', 'ربط بالخدمات'],
          iconBg: 'bg-[#F0C5AE]/60',
          iconColor: 'text-[#54453D]',
          span: 'lg:col-span-7',
        },
      ]
    : [
        {
          key: 'pos',
          icon: Receipt,
          category: 'POS & PAYMENTS',
          title: 'Rapid POS & Compliant Invoicing',
          description:
            'Process card and cash payments in seconds, apply discounts and packages, and generate accurate digital invoices instantly.',
          tags: ['Split payments', 'Digital invoices', 'Custom packages'],
          iconBg: 'bg-[#F0C5AE]',
          iconColor: 'text-[#54453D]',
          span: 'lg:col-span-4',
        },
        {
          key: 'clients',
          icon: UserRound,
          category: 'CLIENT RELATIONSHIPS',
          title: 'Complete Client Profiles & History',
          description:
            'Detailed history of past visits, preferred treatments, and specialist notes to deliver continuous personalized care that builds loyalty.',
          tags: ['Visit logs', 'Custom preferences', 'Loyalty points'],
          iconBg: 'bg-[#91B8C0]',
          iconColor: 'text-[#2C4349]',
          span: 'lg:col-span-4',
        },
        {
          key: 'staff',
          icon: Users,
          category: 'STAFF & PERFORMANCE',
          title: 'Shift Rosters & Automated Commissions',
          description:
            'Manage shifts, duties, and leaves with automated calculation of service and product commissions—eliminating manual errors.',
          tags: ['Shift scheduling', 'Auto commissions', 'Role permissions'],
          iconBg: 'bg-white',
          iconColor: 'text-[#54453D]',
          span: 'lg:col-span-5',
        },
        {
          key: 'stock',
          icon: Package,
          category: 'INVENTORY CONTROL',
          title: 'Stock Control & Treatment Supplies',
          description:
            'Live tracking of products and supplies consumed during treatments, with smart alerts before stock runs low to prevent disruptions.',
          tags: ['Live stock counts', 'Low-stock alerts', 'Service linking'],
          iconBg: 'bg-[#F0C5AE]/60',
          iconColor: 'text-[#54453D]',
          span: 'lg:col-span-7',
        },
      ];

  const metricsFeature = isAr
    ? {
        badge: 'التقارير والرؤى',
        title: 'رؤية تشغيلية وتحليلات فورية لأداء صالونك',
        description:
          'مؤشرات أداء مباشرة ترصد إيراداتك اليومية وساعات الذروة والخدمات الأكثر طلباً لاتخاذ قرارات مدروسة لتطوير عملك.',
        chartTitle: 'الإيرادات اليومية',
        peak: 'الذروة',
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
        peak: 'Peak',
        metrics: [
          { value: '100%', label: 'Appointment-to-POS integration' },
          { value: '0', label: 'Manual commission calculation errors' },
          { value: '24/7', label: 'Live monitoring across all devices' },
        ],
      };

  /* ── Mini visuals (decorative, flat, hidden on mobile) ─────────── */
  const visuals: Record<FeatureKey, React.ReactNode> = {
    pos: (
      <div aria-hidden="true" className="rounded-2xl bg-white p-4">
        <div className="space-y-3">
          {[72, 54, 38].map((w) => (
            <div key={w} className="flex items-center justify-between gap-4">
              <span className="h-2 rounded-full bg-[#54453D]/15" style={{ width: `${w}%` }} />
              <span className="h-2 w-8 shrink-0 rounded-full bg-[#54453D]/25" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#FAF9F8] px-3 py-2.5">
          <span className="text-xs font-bold text-[#54453D]">{isAr ? 'المجموع' : 'Total'}</span>
          <span className="rounded-lg bg-[#F0C5AE] px-2.5 py-1 text-[0.7rem] font-bold text-[#54453D]">
            {isAr ? 'مدفوع' : 'Paid'}
          </span>
        </div>
      </div>
    ),
    clients: (
      <div aria-hidden="true" className="rounded-2xl bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 shrink-0 rounded-full bg-[#91B8C0]" />
          <div className="flex-1 space-y-2">
            <span className="block h-2 w-2/3 rounded-full bg-[#54453D]/20" />
            <span className="block h-2 w-1/3 rounded-full bg-[#54453D]/10" />
          </div>
        </div>
        <div className="mt-5 flex items-center">
          {[0, 1, 2, 3, 4].map((n) => (
            <div key={n} className="flex flex-1 items-center last:flex-none">
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${n < 4 ? 'bg-[#C78360]' : 'bg-[#F0C5AE]'}`}
              />
              {n < 4 && <span className="h-0.5 flex-1 bg-[#C78360]/30" />}
            </div>
          ))}
        </div>
      </div>
    ),
    staff: (
      <div aria-hidden="true" className="rounded-2xl bg-white p-4">
        <div className="grid grid-cols-7 gap-1.5">
          {[1, 1, 0, 1, 1, 1, 0].map((on, n) => (
            <span
              key={n}
              className={`h-9 rounded-lg ${on ? 'bg-[#F0C5AE]' : 'bg-[#FAF9F8]'}`}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#FAF9F8]">
            <span className="block h-full w-[70%] rounded-full bg-[#91B8C0]" />
          </span>
          <span className="h-2 w-8 rounded-full bg-[#54453D]/25" />
        </div>
      </div>
    ),
    stock: (
      <div aria-hidden="true" className="space-y-3.5 rounded-2xl bg-white p-4">
        {[
          { w: 86, tone: 'bg-[#91B8C0]', low: false },
          { w: 62, tone: 'bg-[#91B8C0]', low: false },
          { w: 18, tone: 'bg-[#C78360]', low: true },
        ].map((bar, n) => (
          <div key={n} className="flex items-center gap-3">
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#FAF9F8]">
              <span className={`block h-full rounded-full ${bar.tone}`} style={{ width: `${bar.w}%` }} />
            </span>
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${bar.low ? 'bg-[#C78360] motion-safe:animate-pulse' : 'bg-[#FAF9F8]'}`}
            />
          </div>
        ))}
      </div>
    ),
  };

  return (
    <section
      id="platform-features"
      className={`relative overflow-hidden bg-white py-16 sm:py-20 lg:py-28 xl:py-32 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="relative">
          {/* ── Section Header ───────────────────────────────────── */}
          <div className="mx-auto max-w-3xl text-center">
            <SectionTitle
              eyebrow={isAr ? 'إمكانيات المنظومة' : 'PLATFORM CAPABILITIES'}
              title={
                isAr
                  ? 'كل ما تحتاجه لإدارة صالونك باحترافية وتكامل.'
                  : 'Everything you need to run your salon with precision and ease.'
              }
              align="center"
            />
            <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-[#75645B]">
              {isAr
                ? 'أدوات مترابطة تعمل معًا بسلاسة لتبسيط العمليات اليومية وتوفير تجربة استثنائية لعميلاتك وفريق عملك.'
                : 'Connected tools working in unison to streamline daily operations and elevate the experience for your clients and team.'}
            </p>
          </div>

          {/* ── Bento ────────────────────────────────────────────── */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:mt-20 lg:grid-cols-12 lg:gap-6">
            {/* Anchor: smart calendar */}
            <article className="relative overflow-hidden rounded-[1.5rem] bg-[#FAF9F8] p-5 sm:col-span-2 sm:rounded-[1.75rem] sm:p-8 lg:col-span-8 lg:row-span-2 lg:p-10 xl:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#54453D]">
                <CalendarCheck className="h-4 w-4 text-[#54453D]" aria-hidden="true" />
                <span>{anchorFeature.badge}</span>
              </div>

              <h3 className="mt-4 max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-balance text-[#54453D] sm:text-3xl xl:text-4xl">
                {anchorFeature.title}
              </h3>

              <p className="mt-3.5 max-w-2xl text-base leading-relaxed text-[#75645B] sm:text-lg">
                {anchorFeature.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-2.5">
                {anchorFeature.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-[#54453D] sm:text-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#C78360]" aria-hidden="true" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Live panel */}
              <div className="mt-7 rounded-2xl bg-white p-4 text-[#54453D] sm:mt-9 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
                    <span className="text-xs font-bold text-[#54453D] sm:text-sm">
                      {anchorFeature.previewTitle}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF9F8] px-2.5 py-0.5 text-[0.7rem] font-semibold text-[#75645B]">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[#16a34a] motion-safe:animate-pulse"
                      aria-hidden="true"
                    />
                    {isAr ? 'مباشر' : 'Live'}
                  </span>
                </div>

                {/* Mobile: simple list */}
                <div className="space-y-2.5 sm:hidden">
                  {anchorFeature.previewSlots.map((slot) => (
                    <div
                      key={slot.time}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[#FAF9F8] p-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="block font-mono text-[0.75rem] font-semibold text-[#75645B]">
                          {slot.time}
                        </span>
                        <span className="block truncate font-bold text-[#54453D]">
                          {slot.service}
                        </span>
                        <span className="block text-[0.75rem] text-[#75645B]">
                          {slot.specialist}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 rounded-lg px-2.5 py-1 text-[0.7rem] font-semibold ${slot.statusTone}`}
                      >
                        {slot.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tablet + desktop: swimlane calendar (specialists as lanes) */}
                <div className="hidden sm:block" aria-hidden="true">
                  {/* Lane headers */}
                  <div className="grid grid-cols-[3.25rem_repeat(3,minmax(0,1fr))] gap-x-2">
                    <span />
                    {anchorFeature.previewSlots.map((slot, i) => (
                      <div key={slot.specialist} className="flex items-center gap-2 pb-2">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#54453D] ${i === 0 ? 'bg-[#91B8C0]' : i === 1 ? 'bg-[#F0C5AE]' : 'bg-[#FAF9F8]'}`}
                        >
                          {slot.specialist.charAt(0)}
                        </span>
                        <span className="truncate text-xs font-bold text-[#54453D] sm:text-sm">
                          {slot.specialist}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Lanes */}
                  <div className="relative grid grid-cols-[3.25rem_repeat(3,minmax(0,1fr))] gap-x-2">
                    {/* Hour axis */}
                    <div className="relative h-64 lg:h-80">
                      {HOURS.map((h, i) => (
                        <span
                          key={h}
                          className="absolute start-0 font-mono text-[0.7rem] font-semibold text-[#75645B]"
                          style={{ top: `${i * 20}%` }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    {anchorFeature.previewSlots.map((slot, i) => (
                      <div
                        key={slot.time}
                        className="relative h-64 rounded-xl bg-[#FAF9F8] lg:h-80"
                      >
                        <div
                          className={`absolute inset-x-1.5 overflow-hidden rounded-lg p-2 sm:p-2.5 ${LANE_TONES[i]}`}
                          style={{
                            top: `${LANE_BLOCKS[i]!.top}%`,
                            height: `${LANE_BLOCKS[i]!.height}%`,
                          }}
                        >
                          <span className="block font-mono text-[0.65rem] font-semibold text-[#75645B]">
                            {slot.time}
                          </span>
                          <span className="mt-0.5 block truncate text-xs font-bold text-[#54453D]">
                            {slot.service}
                          </span>
                          <span className="mt-1 inline-flex items-center gap-1.5 text-[0.65rem] font-semibold text-[#54453D]">
                            <span className={`h-1.5 w-1.5 rounded-full ${LANE_DOTS[i]}`} />
                            {slot.status}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* "Now" marker (12:00) */}
                    <div
                      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                      style={{ top: '40%' }}
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#C78360]" />
                      <span className="h-0.5 flex-1 bg-[#C78360]" />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Supporting features */}
            {supportingFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <article
                  key={feat.key}
                  className={`flex flex-col rounded-[1.5rem] bg-[#FAF9F8] p-5 transition-colors duration-200 sm:rounded-[1.75rem] sm:p-7 xl:p-8 ${feat.span}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12 ${feat.iconBg} ${feat.iconColor}`}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                    </div>
                    <span className="text-end text-[0.65rem] font-bold uppercase tracking-wider text-[#75645B] sm:text-xs">
                      {feat.category}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold tracking-tight text-[#54453D] sm:mt-5 sm:text-xl xl:text-2xl">
                    {feat.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#75645B] sm:mt-2.5 sm:text-base">
                    {feat.description}
                  </p>

                  <div className="mt-5 hidden sm:block">{visuals[feat.key]}</div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-5 sm:pt-6">
                    {feat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-[#54453D]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}

            {/* Insights panel */}
            <article className="overflow-hidden rounded-[1.5rem] bg-[#F0C5AE] p-5 text-[#54453D] sm:col-span-2 sm:rounded-[1.75rem] sm:p-8 lg:col-span-12 lg:p-10 xl:p-12">
              <div className="grid items-center gap-7 lg:grid-cols-12 lg:gap-10 xl:gap-14">
                <div className="lg:col-span-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#54453D]">
                    <BarChart3 className="h-4 w-4 text-[#54453D]" aria-hidden="true" />
                    <span>{metricsFeature.badge}</span>
                  </div>

                  <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-balance text-[#54453D] sm:text-3xl xl:text-4xl">
                    {metricsFeature.title}
                  </h3>

                  <p className="mt-3 text-base font-medium leading-relaxed text-[#54453D]/90 sm:text-lg">
                    {metricsFeature.description}
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4 lg:col-span-7">
                  {/* Revenue chart (tablet + desktop) */}
                  <div aria-hidden="true" className="hidden rounded-2xl bg-white p-5 sm:block lg:p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#54453D] sm:text-sm">
                        {metricsFeature.chartTitle}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-[#75645B]">
                        <span className="h-2 w-2 rounded-full bg-[#54453D]" />
                        {metricsFeature.peak}
                      </span>
                    </div>
                    <div className="mt-4 flex h-28 items-end gap-2 sm:gap-3 lg:h-36 xl:h-44">
                      {CHART_BARS.map((h, i) => (
                        <span
                          key={i}
                          className={`flex-1 rounded-t-lg ${i === CHART_PEAK ? 'bg-[#54453D]' : 'bg-[#F0C5AE]'}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    {metricsFeature.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="flex items-center gap-4 rounded-2xl bg-white p-4 sm:flex-col sm:items-start sm:justify-center sm:gap-1 sm:p-5"
                      >
                        <span className="w-20 shrink-0 font-mono text-2xl font-black text-[#54453D] sm:w-auto sm:text-3xl xl:text-4xl">
                          {m.value}
                        </span>
                        <span className="text-xs font-semibold leading-snug text-[#75645B] sm:text-sm">
                          {m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}