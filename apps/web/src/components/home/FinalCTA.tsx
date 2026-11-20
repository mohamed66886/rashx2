/**
 * RASHX — Final Call To Action (Final CTA) Section (Architectural Split Redesign)
 *
 * Server Component compatible (no 'use client').
 * Pure Flat Design: zero borders, zero rings, zero shadows, zero gradients.
 * Preserved Palette: #F0C5AE · #91B8C0 · #FAF9F8 · #FFFFFF · #54453D · #75645B · #C78360 · #2C4349
 *
 * Layout per screen:
 *  - mobile  (< md): Stacked 2-zone card (White narrative top + Dark #54453D full-width CTA & trust tray)
 *  - tablet  (md–lg): Centered editorial top + Dark #54453D deck with 2-col CTAs and 3-col trust tiles
 *  - desktop (lg+): 12-col asymmetric split card — 7-col White editorial stage + 5-col Dark #54453D action deck
 */

import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface FinalCTAProps {
  lang: Lang;
  className?: string;
}

export function FinalCTA({ lang, className }: FinalCTAProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const getStartedHref = (isAr ? '/brand' : '/brand?lang=en') as Route;
  const contactEmail = 'hello@rashx.com';
  const contactHref = `mailto:${contactEmail}`;

  const content = isAr
    ? {
        badge: 'انطلاقة جديدة لصالونك',
        heading: 'جاهز تنقل إدارة صالونك إلى مستوى جديد؟',
        description:
          'ابدأ مع RASHX واكتشف طريقة أكثر تنظيمًا لإدارة أعمال صالونك، من المواعيد والعملاء إلى فريق العمل والعمليات اليومية.',
        primaryButton: 'ابدأ الآن',
        secondaryButton: 'تواصل معنا',
        brandLabel: 'RASHX',
        directContactLabel: 'تواصل مباشر:',
        trustPoints: [
          'بدون عقود إلزامية',
          'إعداد وتدريب مباشر للفريق',
          'بيانات آمنة ومعزولة',
        ],
      }
    : {
        badge: 'A NEW CHAPTER FOR YOUR SALON',
        heading: 'Ready to take your salon management further?',
        description:
          'Get started with RASHX and discover a more organized way to manage your salon, from appointments and customers to your team and daily operations.',
        primaryButton: 'Get Started',
        secondaryButton: 'Contact Us',
        brandLabel: 'RASHX',
        directContactLabel: 'Direct email:',
        trustPoints: [
          'No lock-in contracts',
          'Direct team onboarding & training',
          'Encrypted & isolated data',
        ],
      };

  return (
    <section
      id="final-cta"
      className={`bg-[#FAF9F8] py-16 sm:py-20 lg:py-28 xl:py-32 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* ============================================================
            1. MOBILE LAYOUT (< md): 2-Zone Vertical Conversion Card
           ============================================================ */}
        <div className="overflow-hidden rounded-[1.75rem] bg-white md:hidden">
          {/* Top White Narrative Zone */}
          <div className="relative px-5 pb-7 pt-8 text-center">
            <span
              aria-hidden="true"
              className="absolute inset-x-10 top-0 h-1.5 rounded-b-full bg-[#F0C5AE]"
            />

            <div className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider text-[#54453D]">
              <Sparkles className="h-3.5 w-3.5 text-[#54453D]" aria-hidden="true" />
              <span>{content.badge}</span>
            </div>

            <h2 className="mt-5 text-2xl font-extrabold leading-snug tracking-tight text-balance text-[#54453D]">
              {content.heading}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[#75645B]">
              {content.description}
            </p>
          </div>

          {/* Bottom Dark Action & Trust Deck */}
          <div className="relative overflow-hidden bg-[#54453D] px-5 py-6 text-[#FAF9F8]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-16 -top-16 h-40 w-40 rounded-full bg-[#F0C5AE]/[0.08]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -start-16 h-36 w-36 rounded-full bg-[#91B8C0]/[0.08]"
            />

            <div className="relative">
              <div className="space-y-3">
                <Link
                  href={getStartedHref}
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#F0C5AE] px-6 py-3.5 text-base font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0C5AE]"
                >
                  <span>{content.primaryButton}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </Link>

                <a
                  href={contactHref}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#91B8C0] px-6 py-3.5 text-base font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#6E9BA4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91B8C0]"
                >
                  <span>{content.secondaryButton}</span>
                </a>
              </div>

              <ul className="mt-5 space-y-2">
                {content.trustPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2.5 rounded-xl bg-white/[0.08] px-3.5 py-2.5 text-xs font-semibold text-[#FAF9F8]/90"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-[#91B8C0]"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ============================================================
            2. TABLET LAYOUT (md → lg): Centered Stage + Dark Deck
           ============================================================ */}
        <div className="hidden overflow-hidden rounded-[2rem] bg-white md:block lg:hidden">
          {/* Top Centered Editorial Stage */}
          <div className="relative overflow-hidden px-10 py-11 text-center">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-[#F0C5AE]/20"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full bg-[#91B8C0]/20"
            />

            <div className="relative mx-auto max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#54453D]">
                <Sparkles className="h-3.5 w-3.5 text-[#54453D]" aria-hidden="true" />
                <span>{content.badge}</span>
              </div>

              <h2 className="mt-5 text-4xl font-extrabold leading-[1.2] tracking-tight text-balance text-[#54453D]">
                {content.heading}
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-[#75645B]">
                {content.description}
              </p>
            </div>
          </div>

          {/* Bottom Dark Action & Trust Deck */}
          <div className="relative overflow-hidden bg-[#54453D] px-10 py-9 text-[#FAF9F8]">
            <div className="relative mx-auto max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href={getStartedHref}
                  className="inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-xl bg-[#F0C5AE] px-7 py-3.5 text-base font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0C5AE]"
                >
                  <span>{content.primaryButton}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </Link>

                <a
                  href={contactHref}
                  className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-[#91B8C0] px-7 py-3.5 text-base font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#6E9BA4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91B8C0]"
                >
                  <span>{content.secondaryButton}</span>
                </a>
              </div>

              <ul className="mt-6 grid grid-cols-3 gap-3">
                {content.trustPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.08] px-3.5 py-3 text-center text-xs font-semibold text-[#FAF9F8]/90"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-[#91B8C0]"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. DESKTOP LAYOUT (lg+): 12-Col Architectural Split Card
               White Editorial Stage (7) + Dark #54453D Action Deck (5)
           ============================================================ */}
        <div className="hidden overflow-hidden rounded-[2.25rem] bg-white lg:grid lg:grid-cols-12">
          {/* Start 7 cols: Calm Editorial Stage */}
          <div className="relative col-span-7 flex flex-col justify-between overflow-hidden p-11 xl:p-14">
            {/* Flat Geometric Brand Accents */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -end-20 h-64 w-64 rounded-full bg-[#F0C5AE]/20"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -end-10 h-44 w-44 rounded-full bg-[#91B8C0]/15"
            />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#54453D]">
                <Sparkles className="h-3.5 w-3.5 text-[#54453D]" aria-hidden="true" />
                <span>{content.badge}</span>
              </div>

              <h2 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.18] tracking-tight text-balance text-[#54453D] xl:text-5xl">
                {content.heading}
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#75645B] xl:text-xl">
                {content.description}
              </p>
            </div>

            {/* Quiet Direct Contact Bar */}
            <div className="relative mt-10 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-4 py-2.5 text-xs font-bold text-[#75645B]">
                <span className="h-2 w-2 rounded-full bg-[#91B8C0]" />
                <span>{content.directContactLabel}</span>
                <a
                  href={contactHref}
                  dir="ltr"
                  className="font-mono text-[#54453D] transition-colors duration-200 hover:text-[#C78360]"
                >
                  {contactEmail}
                </a>
              </span>
            </div>
          </div>

          {/* End 5 cols: Focused Dark Espresso Action Deck */}
          <div className="relative col-span-5 flex flex-col justify-between overflow-hidden bg-[#54453D] p-10 text-[#FAF9F8] xl:p-12">
            {/* Flat Subtle Background Geometry */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -end-20 -top-20 h-56 w-56 rounded-full bg-[#F0C5AE]/[0.08]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -start-16 h-56 w-56 rounded-full bg-[#91B8C0]/[0.08]"
            />

            {/* Top Action Buttons */}
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 font-mono text-xs font-black tracking-wider text-[#F0C5AE]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F0C5AE]" />
                  {content.brandLabel}
                </span>
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-[#91B8C0] motion-safe:animate-pulse"
                />
              </div>

              <div className="space-y-3.5">
                <Link
                  href={getStartedHref}
                  className="inline-flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#F0C5AE] px-8 py-4 text-base font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0C5AE]"
                >
                  <span>{content.primaryButton}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </Link>

                <a
                  href={contactHref}
                  className="inline-flex min-h-[56px] w-full items-center justify-center rounded-xl bg-[#91B8C0] px-8 py-4 text-base font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#6E9BA4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91B8C0]"
                >
                  <span>{content.secondaryButton}</span>
                </a>
              </div>
            </div>

            {/* Bottom Structured Trust Guarantees */}
            <div className="relative mt-8 rounded-2xl bg-white/[0.07] p-5">
              <ul className="space-y-3">
                {content.trustPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-3 text-sm font-semibold text-[#FAF9F8]/90"
                  >
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#91B8C0]">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}