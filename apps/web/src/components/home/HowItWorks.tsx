/**
 * RASHX — How It Works Section (Editorial Journey Redesign)
 *
 * Server Component compatible (no 'use client').
 * Pure Flat Design: zero borders, zero rings, zero shadows, zero gradients.
 * Preserved Palette: #F0C5AE · #91B8C0 · #FAF9F8 · #FFFFFF · #54453D · #75645B · #C78360 · #2C4349
 *
 * Layout per screen:
 *  - mobile  (< md): Full-width stacked step cards with 4-segment progress bars + centered connectors
 *  - tablet  (md–lg): Top horizontal 4-step roadmap bar + balanced 2×2 showcase grid
 *  - desktop (lg+): Centered vertical journey spine with alternating Copy ↔ Visual split chapters
 */

import type { ReactNode } from 'react';
import { PageContainer } from '@rashx/ui';
import {
  Building2,
  Store,
  Users,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
} from '@rashx/icons';
import { SectionTitle } from '@/components/sections';
import type { Lang } from '@/lib/lang';

export interface HowItWorksProps {
  lang: Lang;
  className?: string;
}

export function HowItWorks({ lang, className }: HowItWorksProps) {
  const isAr = lang === 'ar';

  const steps = isAr
    ? [
        {
          step: '01',
          icon: Building2,
          category: 'الخطوة الأولى',
          title: 'إنشاء حساب الصالون وبيانات المنشأة',
          description:
            'تسجيل بيانات الصالون وتأكيد رقم الجوال، وإضافة هوية المنشأة وشعارها لتأسيس مساحة عمل سحابية مخصصة لعلامتك.',
          previewTag: 'صالون معتمد · +966',
          previewSub: 'تأسيس فوري ومستقل للنشاط',
          visualLabel: 'ملف المنشأة',
          toneBg: 'bg-[#F0C5AE]',
          toneSoft: 'bg-[#F0C5AE]/25',
          toneText: 'text-[#54453D]',
        },
        {
          step: '02',
          icon: Store,
          category: 'الخطوة الثانية',
          title: 'إعداد الفروع وتحديد قائمة الخدمات',
          description:
            'إضافة فروع الصالون وتصنيف الخدمات (شعر، عناية، سبا) مع تحديد الأسعار والمدة الزمنية المخصصة لكل جلسة.',
          previewTag: 'فروع متعددة · قائمة أسعار',
          previewSub: 'هيكلة منظمة لكافة الخدمات',
          visualLabel: 'الفروع والخدمات',
          toneBg: 'bg-[#91B8C0]',
          toneSoft: 'bg-[#91B8C0]/25',
          toneText: 'text-[#2C4349]',
        },
        {
          step: '03',
          icon: Users,
          category: 'الخطوة الثالثة',
          title: 'تعيين فريق العمل وجدولة الورديات',
          description:
            'إضافة الموظفات وتحديد تخصص كل أخصائية، مع جدولة فترات العمل وأيام الإجازات وضبط نسب العمولات التلقائية.',
          previewTag: 'توزيع الأخصائيات · ورديات حية',
          previewSub: 'احتساب دقيق للعمولات والمهام',
          visualLabel: 'الفريق والورديات',
          toneBg: 'bg-[#F0C5AE]',
          toneSoft: 'bg-[#F0C5AE]/25',
          toneText: 'text-[#54453D]',
        },
        {
          step: '04',
          icon: CalendarCheck,
          category: 'الخطوة الرابعة',
          title: 'بدء استقبال الحجوزات وإدارة العمليات',
          description:
            'تفعيل جدول المواعيد الفوري، واستقبال حجوزات العميلات مع إرسال تأكيدات واتساب الآلية وإتمام المدفوعات بسلاسة.',
          previewTag: 'تقويم حي · تأكيد واتساب فوري',
          previewSub: 'تشغيل مترابط من اللحظة الأولى',
          visualLabel: 'التشغيل المباشر',
          toneBg: 'bg-[#91B8C0]',
          toneSoft: 'bg-[#91B8C0]/25',
          toneText: 'text-[#2C4349]',
        },
      ]
    : [
        {
          step: '01',
          icon: Building2,
          category: 'STEP ONE',
          title: 'Create Salon Account & Business Profile',
          description:
            'Register your salon information, verify contact details, and upload brand assets to establish a dedicated workspace.',
          previewTag: 'Verified Salon · +966',
          previewSub: 'Instant dedicated workspace',
          visualLabel: 'Workspace Setup',
          toneBg: 'bg-[#F0C5AE]',
          toneSoft: 'bg-[#F0C5AE]/25',
          toneText: 'text-[#54453D]',
        },
        {
          step: '02',
          icon: Store,
          category: 'STEP TWO',
          title: 'Configure Branches & Service Menu',
          description:
            'Set up salon locations and categorize treatments (hair, skincare, spa) with clear pricing and session durations.',
          previewTag: 'Multi-branch · Service menu',
          previewSub: 'Structured treatment catalog',
          visualLabel: 'Branches & Catalog',
          toneBg: 'bg-[#91B8C0]',
          toneSoft: 'bg-[#91B8C0]/25',
          toneText: 'text-[#2C4349]',
        },
        {
          step: '03',
          icon: Users,
          category: 'STEP THREE',
          title: 'Add Staff Specialists & Working Shifts',
          description:
            'Enroll your team, link specialists to assigned services and branches, and set automated commission rules.',
          previewTag: 'Specialist routing · Shifts',
          previewSub: 'Automated staff commissions',
          visualLabel: 'Team & Rosters',
          toneBg: 'bg-[#F0C5AE]',
          toneSoft: 'bg-[#F0C5AE]/25',
          toneText: 'text-[#54453D]',
        },
        {
          step: '04',
          icon: CalendarCheck,
          category: 'STEP FOUR',
          title: 'Launch Live Bookings & Operations',
          description:
            'Open the real-time calendar, accept client appointments, trigger automated WhatsApp alerts, and handle fast checkouts.',
          previewTag: 'Live calendar · Auto WhatsApp',
          previewSub: 'Seamless daily management',
          visualLabel: 'Live Operations',
          toneBg: 'bg-[#91B8C0]',
          toneSoft: 'bg-[#91B8C0]/25',
          toneText: 'text-[#2C4349]',
        },
      ];

  const bannerCopy = isAr
    ? {
        title: 'منظومة جاهزة للعمل فور اكتمال الإعداد',
        subtitle: 'دعم فني وتدريب مباشر لفريق صالونك من اليوم الأول',
        status: 'جاهز للانطلاق',
      }
    : {
        title: 'Fully operational workspace ready upon setup',
        subtitle: 'Hands-on onboarding and direct team support from day one',
        status: 'Ready to launch',
      };

  /* ── Flat UI Illustrations (same palette, zero borders/shadows) ── */
  const illustrations: ReactNode[] = [
    // 01 · Account & brand profile
    <div key="v1" aria-hidden="true" className="space-y-3 rounded-2xl bg-[#FAF9F8] p-4 xl:p-5">
      <div className="flex items-center gap-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F0C5AE] text-[#54453D]">
          <Building2 className="h-5 w-5" />
        </span>
        <div className="flex-1 space-y-2">
          <span className="block h-2.5 w-3/4 rounded-full bg-[#54453D]/25" />
          <span className="block h-2 w-1/2 rounded-full bg-[#54453D]/10" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-white px-3 py-2.5">
          <span className="block text-[0.65rem] font-semibold text-[#75645B]">
            {isAr ? 'الهوية والشعار' : 'Brand Identity'}
          </span>
          <span className="mt-1.5 block h-2 w-4/5 rounded-full bg-[#F0C5AE]" />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
          <span className="font-mono text-[0.7rem] font-bold text-[#54453D]">+966</span>
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16a34a]" />
        </div>
      </div>
    </div>,

    // 02 · Branches & service catalog
    <div key="v2" aria-hidden="true" className="space-y-2.5 rounded-2xl bg-[#FAF9F8] p-4 xl:p-5">
      {[
        { tone: 'bg-[#F0C5AE]', label: isAr ? 'العناية بالشعر' : 'Hair Care', w: '68%' },
        { tone: 'bg-[#91B8C0]', label: isAr ? 'جلسات البشرة' : 'Skincare', w: '54%' },
        { tone: 'bg-[#C78360]', label: isAr ? 'سبا ومساج' : 'Spa & Massage', w: '62%' },
      ].map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className={`h-3 w-3 shrink-0 rounded-full ${row.tone}`} />
            <span className="truncate text-xs font-bold text-[#54453D]">{row.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden h-2 w-12 rounded-full bg-[#FAF9F8] xl:block">
              <span
                className={`block h-full rounded-full ${row.tone}`}
                style={{ width: row.w }}
              />
            </span>
            <span className="rounded-lg bg-[#FAF9F8] px-2 py-0.5 font-mono text-[0.65rem] font-bold text-[#75645B]">
              45m
            </span>
          </div>
        </div>
      ))}
    </div>,

    // 03 · Staff & shift rosters
    <div key="v3" aria-hidden="true" className="space-y-3 rounded-2xl bg-[#FAF9F8] p-4 xl:p-5">
      {[
        { tone: 'bg-[#91B8C0]', text: 'text-[#2C4349]', init: isAr ? 'س' : 'S', w: 82 },
        { tone: 'bg-[#F0C5AE]', text: 'text-[#54453D]', init: isAr ? 'ن' : 'N', w: 64 },
        { tone: 'bg-[#C78360]', text: 'text-white', init: isAr ? 'ر' : 'R', w: 74 },
      ].map((row) => (
        <div key={row.init} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${row.tone} ${row.text}`}
          >
            {row.init}
          </span>
          <div className="flex-1">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#FAF9F8]">
              <span
                className={`block h-full rounded-full ${row.tone}`}
                style={{ width: `${row.w}%` }}
              />
            </div>
          </div>
          <span className="font-mono text-[0.65rem] font-bold text-[#75645B]">{row.w}%</span>
        </div>
      ))}
    </div>,

    // 04 · Live bookings & WhatsApp
    <div key="v4" aria-hidden="true" className="rounded-2xl bg-[#FAF9F8] p-4 xl:p-5">
      <div className="grid grid-cols-7 gap-1.5">
        {[0, 0, 1, 0, 2, 0, 0, 1, 0, 2, 1, 0, 1, 0].map((s, n) => (
          <span
            key={n}
            className={`h-7 rounded-lg ${
              s === 1 ? 'bg-[#F0C5AE]' : s === 2 ? 'bg-[#91B8C0]' : 'bg-white'
            }`}
          />
        ))}
      </div>
      <div className="mt-3.5 flex items-center justify-between gap-2 rounded-xl bg-white px-3.5 py-2.5">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-[#54453D]">
          <span className="h-2 w-2 rounded-full bg-[#16a34a] motion-safe:animate-pulse" />
          {isAr ? 'تأكيد واتساب تلقائي' : 'Auto WhatsApp Confirm'}
        </span>
        <span className="rounded-lg bg-[#91B8C0]/25 px-2 py-0.5 text-[0.65rem] font-bold text-[#2C4349]">
          {isAr ? 'مباشر' : 'Live'}
        </span>
      </div>
    </div>,
  ];

  return (
    <section
      id="how-it-works"
      className={`relative overflow-hidden bg-[#FAF9F8] py-16 sm:py-20 lg:py-28 xl:py-32 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle
            eyebrow={isAr ? 'رحلة الاستخدام' : 'HOW IT WORKS'}
            title={
              isAr
                ? 'ابدأ مع RASHX بخطوات بسيطة.'
                : 'Getting started with RASHX is simple.'
            }
            align="center"
          />
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#75645B] sm:mt-5 sm:text-lg md:text-xl">
            {isAr
              ? 'من إعداد بيانات صالونك وفريقك حتى استقبال أول حجز ومتابعة العمليات، صُممت المنصة لتنطلق بأعمالك بسلاسة ووضوح.'
              : 'From setting up your salon profile and staff to managing appointments and daily checkout, every step is designed for clarity and speed.'}
          </p>
        </div>

        {/* ============================================================
            1. MOBILE LAYOUT (< md): Full-Width Cards + Progress Strips
           ============================================================ */}
        <div className="mt-10 md:hidden">
          <ol className="flex flex-col">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === steps.length - 1;
              return (
                <li key={item.step} className="flex flex-col">
                  <article className="relative overflow-hidden rounded-2xl bg-white p-5">
                    {/* Top Bar: Step badge + 4-step progress strip */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-black ${item.toneBg} ${item.toneText}`}
                        >
                          {item.step}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
                          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#75645B]">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* 4-Segment Progress Indicator */}
                      <div aria-hidden="true" className="flex items-center gap-1">
                        {steps.map((seg, segIdx) => (
                          <span
                            key={seg.step}
                            className={`h-1.5 rounded-full ${
                              segIdx <= index
                                ? `w-4 ${item.toneBg}`
                                : 'w-2 bg-[#FAF9F8]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className="mt-4 text-lg font-extrabold tracking-tight text-[#54453D]">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                      {item.description}
                    </p>

                    <div className="mt-4 rounded-xl bg-[#FAF9F8] p-3.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-[#16a34a]"
                          aria-hidden="true"
                        />
                        <span className="truncate text-xs font-bold text-[#54453D]">
                          {item.previewTag}
                        </span>
                      </div>
                      <span className="mt-1 block truncate text-[0.7rem] text-[#75645B]">
                        {item.previewSub}
                      </span>
                    </div>
                  </article>

                  {/* Centered Step Flow Connector */}
                  <div
                    aria-hidden="true"
                    className="mx-auto flex flex-col items-center py-1.5"
                  >
                    <span className={`h-5 w-1 rounded-full ${item.toneBg}`} />
                    {isLast && (
                      <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#54453D] text-[#FAF9F8]">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Mobile Convergence Banner */}
          <div className="mt-1 rounded-2xl bg-[#F0C5AE] p-5 text-center text-[#54453D]">
            <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#54453D]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-base font-extrabold tracking-tight">
              {bannerCopy.title}
            </p>
            <p className="mt-1.5 text-sm font-medium text-[#54453D]/90">
              {bannerCopy.subtitle}
            </p>
          </div>
        </div>

        {/* ============================================================
            2. TABLET LAYOUT (md → lg): Roadmap Bar + 2×2 Editorial Grid
           ============================================================ */}
        <div className="mt-12 hidden md:block lg:hidden">
          {/* Top Horizontal Overview Stepper */}
          <div
            aria-hidden="true"
            className="mb-6 flex items-center justify-between gap-2 rounded-2xl bg-white px-5 py-3.5"
          >
            {steps.map((item, idx) => (
              <div
                key={item.step}
                className="flex flex-1 items-center gap-2.5 last:flex-none"
              >
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black ${item.toneBg} ${item.toneText}`}
                >
                  {item.step}
                </span>
                <span className="truncate text-xs font-bold text-[#54453D]">
                  {item.visualLabel}
                </span>
                {idx < steps.length - 1 && (
                  <span className={`h-1 flex-1 rounded-full ${item.toneSoft}`} />
                )}
              </div>
            ))}
          </div>

          {/* 2×2 Step Cards Grid */}
          <ol className="grid grid-cols-2 gap-5">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.step} className="flex">
                  <article className="relative flex w-full flex-col overflow-hidden rounded-3xl bg-white p-6">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-3 end-4 select-none font-mono text-7xl font-black leading-none text-[#54453D]/[0.04]"
                    >
                      {item.step}
                    </span>

                    <div className="relative flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-mono text-base font-black ${item.toneBg} ${item.toneText}`}
                      >
                        {item.step}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF9F8] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#75645B]">
                        <Icon className="h-3.5 w-3.5 text-[#C78360]" aria-hidden="true" />
                        {item.category}
                      </span>
                    </div>

                    <h3 className="relative mt-4 text-xl font-extrabold leading-snug tracking-tight text-[#54453D]">
                      {item.title}
                    </h3>

                    <p className="relative mt-2 text-sm leading-relaxed text-[#75645B]">
                      {item.description}
                    </p>

                    <div className="relative mt-5">{illustrations[index]}</div>

                    <div className="relative mt-auto pt-4">
                      <div className="rounded-2xl bg-[#FAF9F8] p-3.5">
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className="h-4 w-4 shrink-0 text-[#16a34a]"
                            aria-hidden="true"
                          />
                          <span className="truncate text-xs font-bold text-[#54453D]">
                            {item.previewTag}
                          </span>
                        </div>
                        <span className="mt-1 block truncate text-[0.7rem] text-[#75645B]">
                          {item.previewSub}
                        </span>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>

          {/* Tablet Convergence Banner */}
          <div className="mt-6 rounded-3xl bg-[#F0C5AE] p-6 text-[#54453D]">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#54453D]">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-lg font-extrabold tracking-tight">
                    {bannerCopy.title}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-[#54453D]/90">
                    {bannerCopy.subtitle}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-[#54453D]">
                {bannerCopy.status}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. DESKTOP LAYOUT (lg+): Centered Spine + Alternating Chapters
           ============================================================ */}
        <div className="mt-16 hidden lg:block xl:mt-20">
          <ol className="relative">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const isEven = index % 2 === 0;
              const isLast = index === steps.length - 1;

              const copyCard = (
                <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] bg-white p-8 xl:p-9">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-4 end-5 select-none font-mono text-[6.5rem] font-black leading-none text-[#54453D]/[0.04]"
                  >
                    {item.step}
                  </span>

                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF9F8] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#75645B]">
                        <Icon className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
                        {item.category}
                      </span>
                      <span
                        className={`rounded-lg px-2.5 py-1 font-mono text-xs font-extrabold ${item.toneSoft} ${item.toneText}`}
                      >
                        {item.step} / 04
                      </span>
                    </div>

                    <h3 className="mt-5 text-2xl font-extrabold leading-snug tracking-tight text-[#54453D] xl:text-[1.65rem]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-base leading-relaxed text-[#75645B]">
                      {item.description}
                    </p>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between gap-4 rounded-2xl bg-[#FAF9F8] px-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-[#16a34a]"
                        aria-hidden="true"
                      />
                      <span className="truncate text-sm font-bold text-[#54453D]">
                        {item.previewTag}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-[#75645B]">
                      {item.previewSub}
                    </span>
                  </div>
                </article>
              );

              const visualCard = (
                <div className="flex h-full flex-col justify-between rounded-[2rem] bg-white p-7 xl:p-8">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${item.toneBg} ${item.toneText}`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-bold text-[#54453D]">
                        {item.visualLabel}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF9F8] px-3 py-1 text-[0.7rem] font-semibold text-[#75645B]">
                      <span className={`h-2 w-2 rounded-full ${item.toneBg}`} />
                      {item.step}
                    </span>
                  </div>

                  {illustrations[index]}
                </div>
              );

              return (
                <li
                  key={item.step}
                  className="grid grid-cols-[1fr_5.5rem_1fr] items-stretch xl:grid-cols-[1fr_6.5rem_1fr]"
                >
                  {/* Start Column */}
                  <div className={isLast ? 'pb-6' : 'pb-8 xl:pb-10'}>
                    {isEven ? copyCard : visualCard}
                  </div>

                  {/* Center Spine Column */}
                  <div aria-hidden="true" className="flex flex-col items-center">
                    {/* Upper Track */}
                    <span
                      className={`w-1.5 rounded-full ${
                        index === 0 ? 'h-8 bg-transparent' : `h-8 ${steps[index - 1]!.toneBg}`
                      }`}
                    />

                    {/* Step Number Node */}
                    <div className="relative my-2 flex items-center justify-center">
                      <span
                        className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl font-mono text-xl font-black xl:h-[4.5rem] xl:w-[4.5rem] xl:text-2xl ${item.toneBg} ${item.toneText}`}
                      >
                        {item.step}
                      </span>
                    </div>

                    {/* Lower Track */}
                    <span className={`w-1.5 flex-1 rounded-full ${item.toneBg}`} />

                    {/* End Launch Cap */}
                    {isLast && (
                      <span className="mt-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#54453D] text-[#FAF9F8]">
                        <Sparkles className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  {/* End Column */}
                  <div className={isLast ? 'pb-6' : 'pb-8 xl:pb-10'}>
                    {isEven ? visualCard : copyCard}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Desktop Convergence Banner */}
          <div className="mt-4 rounded-[2rem] bg-[#F0C5AE] px-10 py-8 text-[#54453D] xl:px-12">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#54453D]">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <span className="block text-xl font-extrabold tracking-tight xl:text-2xl">
                    {bannerCopy.title}
                  </span>
                  <span className="mt-1 block text-base font-medium text-[#54453D]/90">
                    {bannerCopy.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a] motion-safe:animate-pulse" />
                <span className="text-sm font-extrabold text-[#54453D]">
                  {bannerCopy.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}