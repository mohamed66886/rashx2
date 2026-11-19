/**
 * RASHX — How It Works Section (redesign)
 *
 * Server Component compatible (no 'use client').
 * Flat design only: zero borders, zero shadows, zero gradients.
 * Palette: #F0C5AE · #91B8C0 · #FAF9F8 · #FFFFFF · #54453D (+ existing #75645B, #C78360, #2C4349)
 *
 * Layout per screen:
 *  - mobile  (< sm): vertical rail on the start edge; each step is a numbered node linked to the next by a colored segment
 *  - tablet  (sm–lg): same rail, larger nodes, each card splits into text + a flat mini-illustration
 *  - desktop (lg+): one continuous colored track with 4 big nodes, cards hang below each node, track ends in a "live" cap
 */

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
          toneBg: 'bg-[#F0C5AE]',
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
          toneBg: 'bg-[#91B8C0]',
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
          toneBg: 'bg-[#F0C5AE]',
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
          toneBg: 'bg-[#91B8C0]',
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
          toneBg: 'bg-[#F0C5AE]',
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
          toneBg: 'bg-[#91B8C0]',
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
          toneBg: 'bg-[#F0C5AE]',
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
          toneBg: 'bg-[#91B8C0]',
          toneText: 'text-[#2C4349]',
        },
      ];

  /* ── Flat mini-illustrations (decorative, tablet + desktop only) ── */
  const illustrations: React.ReactNode[] = [
    // 1 · Account & profile
    <div key="v1" aria-hidden="true" className="space-y-2.5 rounded-2xl bg-[#FAF9F8] p-4">
      <div className="flex items-center gap-3">
        <span className="h-11 w-11 shrink-0 rounded-xl bg-[#F0C5AE]" />
        <div className="flex-1 space-y-2">
          <span className="block h-2.5 w-3/4 rounded-full bg-[#54453D]/20" />
          <span className="block h-2 w-1/2 rounded-full bg-[#54453D]/10" />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
        <span className="h-2 w-20 rounded-full bg-[#54453D]/20" />
        <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
      </div>
    </div>,
    // 2 · Branches & services
    <div key="v2" aria-hidden="true" className="space-y-2 rounded-2xl bg-[#FAF9F8] p-4">
      {['bg-[#F0C5AE]', 'bg-[#91B8C0]', 'bg-[#C78360]'].map((tone, n) => (
        <div
          key={tone}
          className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className={`h-3 w-3 shrink-0 rounded-full ${tone}`} />
            <span
              className="h-2 rounded-full bg-[#54453D]/20"
              style={{ width: `${[70, 52, 62][n]}%` }}
            />
          </div>
          <span className="h-5 w-10 shrink-0 rounded-md bg-[#FAF9F8]" />
        </div>
      ))}
    </div>,
    // 3 · Staff & shifts
    <div key="v3" aria-hidden="true" className="space-y-2.5 rounded-2xl bg-[#FAF9F8] p-4">
      {[
        { tone: 'bg-[#91B8C0]', w: 80 },
        { tone: 'bg-[#F0C5AE]', w: 55 },
        { tone: 'bg-[#C78360]', w: 68 },
      ].map((row) => (
        <div key={row.tone} className="flex items-center gap-3">
          <span className={`h-8 w-8 shrink-0 rounded-full ${row.tone}`} />
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white">
            <span
              className={`block h-full rounded-full ${row.tone}`}
              style={{ width: `${row.w}%` }}
            />
          </span>
        </div>
      ))}
    </div>,
    // 4 · Live bookings
    <div key="v4" aria-hidden="true" className="rounded-2xl bg-[#FAF9F8] p-4">
      <div className="grid grid-cols-7 gap-1.5">
        {[0, 0, 1, 0, 2, 0, 0, 1, 0, 0, 2, 0, 1, 0].map((s, n) => (
          <span
            key={n}
            className={`h-6 rounded-md ${s === 1 ? 'bg-[#F0C5AE]' : s === 2 ? 'bg-[#91B8C0]' : 'bg-white'}`}
          />
        ))}
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[0.7rem] font-bold text-[#54453D]">
        <span className="h-2 w-2 rounded-full bg-[#16a34a] motion-safe:animate-pulse" />
        WhatsApp
      </div>
    </div>,
  ];

  /* ── One card, reused by the rail (< lg) and the roadmap (lg+) ── */
  const renderCard = (item: (typeof steps)[number], index: number) => {
    const Icon = item.icon;
    return (
      <article className="h-full rounded-2xl bg-white p-5 sm:grid sm:grid-cols-5 sm:items-center sm:gap-6 sm:rounded-3xl sm:p-6 lg:flex lg:flex-col lg:items-stretch lg:gap-0 xl:p-7">
        {/* Illustration: right of the text on tablet, on top on desktop */}
        <div className="hidden sm:order-2 sm:col-span-2 sm:block lg:order-first lg:mb-6">
          {illustrations[index]}
        </div>

        <div className="sm:order-1 sm:col-span-3 lg:order-none lg:flex lg:flex-1 lg:flex-col">
          <div className="mb-3 flex items-center gap-2">
            <Icon className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#75645B] sm:text-xs">
              {item.category}
            </span>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-[#54453D] sm:text-xl xl:text-[1.35rem]">
            {item.title}
          </h3>

          <p className="mt-2.5 text-sm leading-relaxed text-[#75645B] sm:text-base lg:mb-6 lg:text-sm xl:text-base">
            {item.description}
          </p>

          <div className="mt-5 rounded-2xl bg-[#FAF9F8] p-3.5 lg:mt-auto">
            <div className="flex items-center gap-1.5">
              <CheckCircle2
                className="h-3.5 w-3.5 shrink-0 text-[#16a34a]"
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
    );
  };

  return (
    <section
      id="how-it-works"
      className={`relative overflow-hidden bg-[#FAF9F8] py-16 sm:py-20 lg:py-28 xl:py-32 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="relative">
          {/* ── Section Header ───────────────────────────────────── */}
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
            <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-[#75645B]">
              {isAr
                ? 'من إعداد بيانات صالونك وفريقك حتى استقبال أول حجز ومتابعة العمليات، صُممت المنصة لتنطلق بأعمالك بسلاسة ووضوح.'
                : 'From setting up your salon profile and staff to managing appointments and daily checkout, every step is designed for clarity and speed.'}
            </p>
          </div>

          {/* ── Journey ──────────────────────────────────────────── */}
          <div className="mt-12 sm:mt-14 lg:mt-20">
            {/* Mobile + tablet: start-edge rail */}
            <ol className="relative space-y-6 lg:hidden">
              {steps.map((item, index) => {
                const isLast = index === steps.length - 1;
                return (
                  <li key={item.step} className="relative ps-16 sm:ps-20">
                    <span
                      aria-hidden="true"
                      className={`absolute start-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-2xl font-mono text-sm font-black sm:h-14 sm:w-14 sm:text-lg ${item.toneBg} ${item.toneText}`}
                    >
                      {item.step}
                    </span>
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={`absolute -bottom-6 top-11 w-1 rounded-full start-[calc(1.375rem-2px)] sm:top-14 sm:start-[calc(1.75rem-2px)] ${item.toneBg}`}
                      />
                    )}
                    {renderCard(item, index)}
                  </li>
                );
              })}
            </ol>

            {/* Desktop: continuous track + hanging cards */}
            <ol className="hidden lg:grid lg:grid-cols-4">
              {steps.map((item, index) => {
                const isLast = index === steps.length - 1;
                return (
                  <li key={item.step} className="flex flex-col">
                    <div aria-hidden="true" className="flex items-center">
                      <span
                        className={`inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-mono text-xl font-black xl:h-[4.5rem] xl:w-[4.5rem] xl:text-2xl ${item.toneBg} ${item.toneText}`}
                      >
                        {item.step}
                      </span>
                      <span
                        className={`mx-2 h-1.5 flex-1 rounded-full xl:mx-3 ${item.toneBg}`}
                      />
                      {isLast && (
                        <span className="me-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#54453D] text-[#FAF9F8]">
                          <Sparkles className="h-4 w-4" />
                        </span>
                      )}
                    </div>

                    <div className="mt-6 flex-1 pe-5 xl:pe-7">
                      {renderCard(item, index)}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* ── Journey Convergence Banner ────────────────────────── */}
          <div className="mt-10 sm:mt-12 lg:mt-16">
            <div className="rounded-2xl bg-[#F0C5AE] p-5 text-[#54453D] sm:rounded-3xl sm:p-6 lg:p-8">
              <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:gap-6 sm:text-start">
                <div className="inline-flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#54453D]">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-base font-extrabold tracking-tight text-[#54453D] sm:text-lg lg:text-xl">
                    {isAr
                      ? 'منظومة جاهزة للعمل فور اكتمال الإعداد'
                      : 'Fully operational workspace ready upon setup'}
                  </span>
                </div>
                <span className="max-w-md text-sm font-medium text-[#54453D]/90 sm:text-base">
                  {isAr
                    ? 'دعم فني وتدريب مباشر لفريق صالونك من اليوم الأول'
                    : 'Hands-on onboarding and direct team support from day one'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}