/**
 * RASHX — Testimonials & Experience Section (Editorial Redesign)
 *
 * Server Component compatible (no 'use client').
 * Pure Flat Design: zero borders, zero rings, zero shadows, zero gradients.
 * Preserved Palette: #F0C5AE · #91B8C0 · #FAF9F8 · #FFFFFF · #54453D · #75645B · #C78360 · #2C4349
 *
 * Policy Compliance:
 *  - Factual Integrity: No fabricated reviews, fake quotes, or imaginary salon endorsements.
 *  - Extensible Architecture: Renders verified testimonials automatically when `VERIFIED_TESTIMONIALS` is populated.
 *  - Experience Fallback: Renders authentic RASHX experience principles with required copy:
 *    AR: "تجربة إدارة أكثر وضوحًا." | EN: "A clearer way to manage your salon."
 *
 * Layout per screen:
 *  - mobile  (< md): Manifesto card + vertical 01→03 flow → stacked perspective cards → full-width CTA
 *  - tablet  (md–lg): Full-width manifesto + 3-col horizontal steps → 2-col twin perspectives → split CTA
 *  - desktop (lg+): 12-col split manifesto (7-col quote + 5-col vertical flow board) → 2-col wide perspectives → 2-zone CTA deck
 */

import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import {
  Sparkles,
  HeartHandshake,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from '@rashx/icons';
import { SectionTitle } from '@/components/sections';
import type { Lang } from '@/lib/lang';

export interface TestimonialsProps {
  lang: Lang;
  className?: string;
}

/**
 * Data model for verified salon customer testimonials.
 * Empty by default to respect RASHX content integrity policy until verified customer permissions are obtained.
 */
export interface VerifiedTestimonial {
  id: string;
  quote: {
    ar: string;
    en: string;
  };
  author: {
    ar: string;
    en: string;
  };
  role: {
    ar: string;
    en: string;
  };
  salon: {
    ar: string;
    en: string;
  };
  city?: {
    ar: string;
    en: string;
  };
}

/**
 * Source of truth for verified testimonials.
 * Strictly empty until written founder/customer authorization is provided.
 */
export const VERIFIED_TESTIMONIALS: VerifiedTestimonial[] = [];

export function Testimonials({ lang, className }: TestimonialsProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const exploreHref = (isAr ? '/brand' : '/brand?lang=en') as Route;

  const hasRealTestimonials = VERIFIED_TESTIMONIALS.length > 0;

  const content = isAr
    ? {
        eyebrow: 'تجربة RASHX',
        title: 'تجربة إدارة أكثر وضوحًا.',
        subtitle:
          'صُممت الواجهة لتكون سهلة ومريحة لكل من في الصالون، من الاستقبال إلى الإدارة، لتتحول المهام اليومية المعقدة إلى خطوات بسيطة ومنظمة.',
        flowTitle: 'تجربة العمل اليومية السلسة',
        heroQuote: {
          badge: 'الهدوء البصري وسرعة الاستقبال',
          quote:
            'واجهة صالونك يجب ألا تكون مصدراً إضافياً للتوتر. صممنا كل شاشة في RASHX لتُظهر فقط ما تحتاجه في اللحظة المناسبة، بدون تعقيد، ليبقى تركيز فريقك على إكرام العميلات وتقديم أفضل خدمة.',
          highlight: 'مبدأ RASHX: تبسيط التشغيل ليتفرغ الفريق لخدمة العميلات',
          steps: [
            'استقبال وتسجيل الحجز في ثوانٍ معدودة',
            'إشعار فوري للأخصائية ببدء الجلسة',
            'إصدار الفاتورة وإغلاق الحساب بلمسة واحدة',
          ],
        },
        cards: [
          {
            index: '01',
            icon: HeartHandshake,
            badge: 'تجربة فريق العمل',
            quote:
              'لا تحتاج الأخصائية إلى تدريب طويل أو قراءة كتيبات معقدة؛ جدول المواعيد متاح على جوالها بوضوح، مع معرفة تفاصيل الخدمة والوقت بدقة متناهية.',
            roleTag: 'واجهة واضحة لجميع أعضاء الفريق',
            tone: 'bg-[#91B8C0]/25 text-[#2C4349]',
            accentBar: 'bg-[#91B8C0]',
            dotTone: 'bg-[#91B8C0]',
          },
          {
            index: '02',
            icon: MessageSquare,
            badge: 'رؤية الإدارة والتحكم',
            quote:
              'راحة البال تبدأ عندما تتابع أداء الفروع وحركة المبيعات ونسب الإشغال في ثوانٍ، دون الحاجة للاتصال المتكرر بموظفي الاستقبال للتأكد من سير العمل.',
            roleTag: 'متابعة لحظية بدون مجهود مكرر',
            tone: 'bg-[#F0C5AE] text-[#54453D]',
            accentBar: 'bg-[#F0C5AE]',
            dotTone: 'bg-[#C78360]',
          },
        ],
        ctaBanner: {
          title: 'جرب تجربة RASHX بنفسك واكتشف الفرق التشغيلي',
          description:
            'نؤمن بأن التجربة المباشرة هي أصدق مقياس لجودة المنظومة وسهولة استخدامها اليومي.',
          buttonText: 'استكشف أدوات المنصة',
        },
      }
    : {
        eyebrow: 'THE RASHX EXPERIENCE',
        title: 'A clearer way to manage your salon.',
        subtitle:
          'Thoughtfully designed to feel intuitive and calm for everyone in your salon, turning complex operational routines into effortless, clear workflows.',
        flowTitle: 'Seamless Daily Salon Flow',
        heroQuote: {
          badge: 'VISUAL CALM & FRONT DESK SPEED',
          quote:
            'Your salon software should never be a source of daily stress. We crafted every screen in RASHX to surface only what matters at the right moment, keeping your team focused on exceptional client care.',
          highlight: 'The RASHX Principle: Streamlining ops so your team thrives',
          steps: [
            'Check in appointments in seconds',
            'Automated specialist notification on session start',
            'One-tap checkout and receipt generation',
          ],
        },
        cards: [
          {
            index: '01',
            icon: HeartHandshake,
            badge: 'STAFF EXPERIENCE',
            quote:
              'Specialists need zero training manuals; their schedule is clearly visible on their phone with exact treatment durations, notes, and preferences.',
            roleTag: 'Intuitive for every staff specialist',
            tone: 'bg-[#91B8C0]/25 text-[#2C4349]',
            accentBar: 'bg-[#91B8C0]',
            dotTone: 'bg-[#91B8C0]',
          },
          {
            index: '02',
            icon: MessageSquare,
            badge: 'MANAGEMENT INSIGHT',
            quote:
              'Peace of mind begins when you can track branch performance, occupancy rates, and daily sales in seconds, without constant check-in calls to front desks.',
            roleTag: 'Real-time visibility without micromanagement',
            tone: 'bg-[#F0C5AE] text-[#54453D]',
            accentBar: 'bg-[#F0C5AE]',
            dotTone: 'bg-[#C78360]',
          },
        ],
        ctaBanner: {
          title: 'Experience RASHX firsthand and discover the difference',
          description:
            'We believe direct hands-on experience is the truest measure of system quality and daily ease of use.',
          buttonText: 'Explore Platform Tools',
        },
      };

  const stepNumbers = ['01', '02', '03'] as const;

  return (
    <section
      id="testimonials"
      className={`bg-[#FAF9F8] py-16 sm:py-20 lg:py-28 xl:py-32 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle
            eyebrow={content.eyebrow}
            title={content.title}
            align="center"
            withWordmark
          />
          <p className="mt-4 text-base leading-relaxed text-[#75645B] sm:text-lg md:text-xl">
            {content.subtitle}
          </p>
        </div>

        {/* ── Content Stage ────────────────────────────────────────── */}
        {hasRealTestimonials ? (
          /* Verified Testimonials Grid (renders immediately once populated) */
          <div className="mt-12 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-7">
            {VERIFIED_TESTIMONIALS.map((item, idx) => {
              const authorName = isAr ? item.author.ar : item.author.en;
              const roleText = isAr ? item.role.ar : item.role.en;
              const salonText = isAr ? item.salon.ar : item.salon.en;
              const cityText = item.city
                ? isAr
                  ? item.city.ar
                  : item.city.en
                : null;
              const accent = idx % 2 === 0 ? 'bg-[#F0C5AE]' : 'bg-[#91B8C0]';

              return (
                <article
                  key={item.id}
                  className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-white p-6 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-8 top-0 h-1.5 rounded-b-full ${accent}`}
                  />

                  <div className="pt-2">
                    <span
                      aria-hidden="true"
                      className="block font-serif text-4xl leading-none text-[#C78360]/45 select-none"
                    >
                      “
                    </span>
                    <blockquote className="mt-2 text-base font-medium leading-relaxed text-[#54453D] sm:text-lg">
                      «{isAr ? item.quote.ar : item.quote.en}»
                    </blockquote>
                  </div>

                  <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#FAF9F8] p-3.5">
                    <span
                      aria-hidden="true"
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-[#54453D] ${accent}`}
                    >
                      {authorName.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-[#54453D]">
                        {authorName}
                      </div>
                      <div className="truncate text-xs text-[#75645B]">
                        {roleText} · {salonText}
                        {cityText ? ` · ${cityText}` : ''}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Authentic Experience Principles (3 Screen-Specific Layouts) */
          <>
            {/* ============================================================
                1. MOBILE LAYOUT (< md): Vertical Manifesto + Compact Stack
               ============================================================ */}
            <div className="mt-10 space-y-4 md:hidden">
              {/* Mobile Manifesto Card */}
              <article className="relative overflow-hidden rounded-[1.75rem] bg-white p-5">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-6 top-0 h-1.5 rounded-b-full bg-[#F0C5AE]"
                />

                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#54453D]">
                    <Sparkles className="h-3.5 w-3.5 text-[#54453D]" aria-hidden="true" />
                    <span>{content.heroQuote.badge}</span>
                  </div>

                  <div
                    aria-hidden="true"
                    className="mt-4 font-serif text-4xl leading-none text-[#C78360]/45 select-none"
                  >
                    “
                  </div>

                  <blockquote className="mt-1 text-lg font-bold leading-relaxed text-[#54453D]">
                    «{content.heroQuote.quote}»
                  </blockquote>

                  {/* Mobile 01→03 Flow */}
                  <div className="mt-6 rounded-2xl bg-[#FAF9F8] p-4">
                    <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-[#75645B]">
                      {content.flowTitle}
                    </span>
                    <ol className="mt-3 space-y-2.5">
                      {content.heroQuote.steps.map((step, idx) => (
                        <li
                          key={step}
                          className="flex items-start gap-3 rounded-xl bg-white p-3"
                        >
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#91B8C0]/25 font-mono text-[0.7rem] font-black text-[#2C4349]">
                            {stepNumbers[idx]}
                          </span>
                          <span className="text-xs font-medium leading-relaxed text-[#54453D]">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="mt-5">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-3.5 py-2 text-xs font-semibold text-[#54453D]">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#91B8C0]" />
                      <span>{content.heroQuote.highlight}</span>
                    </span>
                  </div>
                </div>
              </article>

              {/* Mobile Role Perspective Cards */}
              {content.cards.map((card) => {
                const CardIcon = card.icon;
                return (
                  <article
                    key={card.index}
                    className="relative overflow-hidden rounded-[1.5rem] bg-white p-5"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-6 top-0 h-1.5 rounded-b-full ${card.accentBar}`}
                    />

                    <div className="flex items-center justify-between gap-3 pt-1.5">
                      <div
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
                      >
                        <CardIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="rounded-full bg-[#FAF9F8] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#75645B]">
                        {card.badge}
                      </span>
                    </div>

                    <blockquote className="mt-4 text-base leading-relaxed text-[#54453D]">
                      «{card.quote}»
                    </blockquote>

                    <div className="mt-5">
                      <span className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-3 py-1.5 text-xs font-medium text-[#75645B]">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${card.dotTone}`} />
                        <span>{card.roleTag}</span>
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* ============================================================
                2. TABLET LAYOUT (md → lg): Wide Manifesto + Twin Roles
               ============================================================ */}
            <div className="mt-12 hidden space-y-5 md:block lg:hidden">
              {/* Tablet Full-Width Editorial Manifesto */}
              <article className="relative overflow-hidden rounded-[2rem] bg-white p-8">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-10 top-0 h-1.5 rounded-b-full bg-[#F0C5AE]"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#54453D]">
                    <Sparkles className="h-3.5 w-3.5 text-[#54453D]" aria-hidden="true" />
                    <span>{content.heroQuote.badge}</span>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-3.5 py-1.5 text-xs font-semibold text-[#54453D]">
                    <span className="h-2 w-2 rounded-full bg-[#91B8C0]" />
                    <span>{content.heroQuote.highlight}</span>
                  </span>
                </div>

                <div className="mt-6 flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-serif text-5xl leading-none text-[#C78360]/45 select-none"
                  >
                    “
                  </span>
                  <blockquote className="text-2xl font-bold leading-relaxed text-[#54453D]">
                    «{content.heroQuote.quote}»
                  </blockquote>
                </div>

                {/* Tablet 3-Column Horizontal Flow Tray */}
                <div className="mt-7 rounded-2xl bg-[#FAF9F8] p-5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#75645B]">
                    {content.flowTitle}
                  </span>
                  <ol className="mt-3.5 grid grid-cols-3 gap-3.5">
                    {content.heroQuote.steps.map((step, idx) => (
                      <li
                        key={step}
                        className="flex flex-col justify-between rounded-xl bg-white p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#91B8C0]/25 font-mono text-xs font-black text-[#2C4349]">
                            {stepNumbers[idx]}
                          </span>
                          <CheckCircle2
                            className="h-4 w-4 text-[#2C4349]"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="mt-3 text-xs font-semibold leading-relaxed text-[#54453D]">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </article>

              {/* Tablet 2-Column Equal Role Perspectives */}
              <div className="grid grid-cols-2 gap-5">
                {content.cards.map((card) => {
                  const CardIcon = card.icon;
                  return (
                    <article
                      key={card.index}
                      className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-white p-7"
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-8 top-0 h-1.5 rounded-b-full ${card.accentBar}`}
                      />

                      <div className="pt-1">
                        <div className="flex items-center justify-between gap-3">
                          <div
                            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
                          >
                            <CardIcon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <span className="rounded-full bg-[#FAF9F8] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#75645B]">
                            {card.badge}
                          </span>
                        </div>

                        <blockquote className="mt-5 text-lg leading-relaxed text-[#54453D]">
                          «{card.quote}»
                        </blockquote>
                      </div>

                      <div className="mt-6">
                        <span className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-3.5 py-2 text-xs font-semibold text-[#75645B]">
                          <span className={`h-1.5 w-1.5 rounded-full ${card.dotTone}`} />
                          <span>{card.roleTag}</span>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* ============================================================
                3. DESKTOP LAYOUT (lg+): 12-Col Manifesto Split + Twin Cards
               ============================================================ */}
            <div className="mt-16 hidden space-y-7 lg:block xl:mt-20 xl:space-y-8">
              {/* ── ACT 1: Full-Width Editorial Manifesto (7 + 5 cols) ── */}
              <article className="relative overflow-hidden rounded-[2.25rem] bg-white p-10 xl:p-12">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-10 end-10 select-none font-serif text-[14rem] leading-none text-[#F0C5AE]/20"
                >
                  “
                </span>

                <div className="relative grid grid-cols-12 items-stretch gap-10 xl:gap-14">
                  {/* Start 7 cols: Editorial Quote Block */}
                  <div className="col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#54453D]">
                        <Sparkles className="h-3.5 w-3.5 text-[#54453D]" aria-hidden="true" />
                        <span>{content.heroQuote.badge}</span>
                      </div>

                      <div
                        aria-hidden="true"
                        className="mt-7 font-serif text-6xl leading-none text-[#C78360]/45 select-none"
                      >
                        “
                      </div>

                      <blockquote className="mt-2 text-2xl font-bold leading-relaxed text-[#54453D] xl:text-[1.75rem] xl:leading-[1.6]">
                        «{content.heroQuote.quote}»
                      </blockquote>
                    </div>

                    <div className="mt-8">
                      <span className="inline-flex items-center gap-2.5 rounded-2xl bg-[#FAF9F8] px-4 py-2.5 text-sm font-bold text-[#54453D]">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#91B8C0]" />
                        <span>{content.heroQuote.highlight}</span>
                      </span>
                    </div>
                  </div>

                  {/* End 5 cols: Connected Daily Flow Panel */}
                  <div className="col-span-5 flex flex-col justify-between rounded-[1.75rem] bg-[#FAF9F8] p-7 xl:p-8">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#75645B]">
                        {content.flowTitle}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[0.7rem] font-bold text-[#2C4349]">
                        01 — 03
                      </span>
                    </div>

                    <ol className="relative my-6 space-y-3.5">
                      {content.heroQuote.steps.map((step, idx) => {
                        const isLast = idx === content.heroQuote.steps.length - 1;
                        return (
                          <li key={step} className="relative flex items-stretch gap-3.5">
                            {/* Step Rail */}
                            <div
                              aria-hidden="true"
                              className="flex flex-col items-center pt-1"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#91B8C0]/30 font-mono text-xs font-black text-[#2C4349]">
                                {stepNumbers[idx]}
                              </span>
                              {!isLast && (
                                <span className="mt-1.5 w-1 flex-1 rounded-full bg-[#91B8C0]/30" />
                              )}
                            </div>

                            {/* Step Pill */}
                            <div className="flex flex-1 items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5">
                              <span className="text-sm font-semibold leading-snug text-[#54453D]">
                                {step}
                              </span>
                              <CheckCircle2
                                className="h-4 w-4 shrink-0 text-[#2C4349]"
                                aria-hidden="true"
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ol>

                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#75645B]">
                      <span className="h-2 w-2 rounded-full bg-[#C78360]" />
                      <span>
                        {isAr
                          ? 'خطوات موحدة من الاستقبال حتى إغلاق الفاتورة'
                          : 'Unified flow from check-in to final receipt'}
                      </span>
                    </div>
                  </div>
                </div>
              </article>

              {/* ── ACT 2: Twin Role Perspectives (2 Equal Editorial Cards) ─ */}
              <div className="grid grid-cols-2 gap-7 xl:gap-8">
                {content.cards.map((card) => {
                  const CardIcon = card.icon;
                  return (
                    <article
                      key={card.index}
                      className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-white p-8 ps-10 xl:p-10 xl:ps-12"
                    >
                      {/* Flat Vertical Identity Bar */}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-y-8 start-0 w-2 rounded-e-full ${card.accentBar}`}
                      />

                      {/* Oversized Index Watermark */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-4 end-6 select-none font-mono text-[6.5rem] font-black leading-none text-[#54453D]/[0.04]"
                      >
                        {card.index}
                      </span>

                      <div className="relative">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}
                            >
                              <CardIcon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <span className="rounded-full bg-[#FAF9F8] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#75645B]">
                              {card.badge}
                            </span>
                          </div>
                          <span
                            aria-hidden="true"
                            className="font-serif text-4xl leading-none text-[#C78360]/35 select-none"
                          >
                            “
                          </span>
                        </div>

                        <blockquote className="mt-6 text-lg font-medium leading-relaxed text-[#54453D] xl:text-xl">
                          «{card.quote}»
                        </blockquote>
                      </div>

                      <div className="relative mt-8">
                        <span className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-4 py-2 text-xs font-bold text-[#54453D]">
                          <span className={`h-2 w-2 rounded-full ${card.dotTone}`} />
                          <span>{card.roleTag}</span>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Bottom Hands-on Invitation Banner (Screen-Tailored) ──── */}
        <div className="mt-6 overflow-hidden rounded-[1.75rem] bg-white md:mt-8 lg:mt-10 lg:rounded-[2rem]">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Copy Zone */}
            <div className="p-6 text-center md:flex md:items-center md:justify-between md:gap-6 md:p-8 md:text-start lg:col-span-8 lg:block lg:p-10 xl:p-12">
              <div className="max-w-2xl">
                <h3 className="text-xl font-extrabold tracking-tight text-[#54453D] sm:text-2xl xl:text-3xl">
                  {content.ctaBanner.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#75645B] sm:text-base xl:text-lg">
                  {content.ctaBanner.description}
                </p>
              </div>

              {/* Tablet Inline Button */}
              <div className="mt-5 hidden md:mt-0 md:block lg:hidden">
                <Link
                  href={exploreHref}
                  className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F0C5AE] px-6 py-3 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D]"
                >
                  <span>{content.ctaBanner.buttonText}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Action Zone (Mobile full-width tray + Desktop tonal block) */}
            <div className="flex items-center justify-center bg-[#F0C5AE]/25 p-5 md:hidden lg:col-span-4 lg:flex lg:p-10">
              <Link
                href={exploreHref}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#F0C5AE] px-7 py-3.5 text-sm font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D] lg:w-auto lg:text-base"
              >
                <span>{content.ctaBanner.buttonText}</span>
                <ArrowIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}