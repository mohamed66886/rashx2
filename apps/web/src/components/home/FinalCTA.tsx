/**
 * RASHX — Final Call To Action (Final CTA) Section
 *
 * Server Component compatible (no 'use client').
 * Flat design only: zero borders, zero shadows, zero gradients.
 * Palette: #F0C5AE · #91B8C0 · #FAF9F8 · #FFFFFF · #54453D (+ existing #75645B, #C78360, #2C4349)
 *
 * Visual Architecture:
 *  - Background: Soft Cream (#FAF9F8) providing a natural transition between white FAQ and ink Footer.
 *  - Hierarchy: Clean badge, bold editorial heading, concise value description, dual accessible CTAs.
 *  - Direct Links:
 *      * Primary: /brand (?lang=en) -> "ابدأ الآن" / "Get Started"
 *      * Secondary: mailto:hello@rashx.com -> "تواصل معنا" / "Contact Us"
 *  - Micro-trust signals: No lock-ins, direct support, data privacy.
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
  const contactHref = 'mailto:hello@rashx.com';

  const content = isAr
    ? {
        badge: 'انطلاقة جديدة لصالونك',
        heading: 'جاهز تنقل إدارة صالونك إلى مستوى جديد؟',
        description:
          'ابدأ مع RASHX واكتشف طريقة أكثر تنظيمًا لإدارة أعمال صالونك، من المواعيد والعملاء إلى فريق العمل والعمليات اليومية.',
        primaryButton: 'ابدأ الآن',
        secondaryButton: 'تواصل معنا',
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
        trustPoints: [
          'No lock-in contracts',
          'Direct team onboarding & training',
          'Encrypted & isolated data',
        ],
      };

  return (
    <section
      id="final-cta"
      className={`bg-[#FAF9F8] py-20 sm:py-24 lg:py-28 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-3xl text-center">
          {/* ── Badge ────────────────────────────────────────────── */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#54453D]">
            <Sparkles className="h-3.5 w-3.5 text-[#54453D]" aria-hidden="true" />
            <span>{content.badge}</span>
          </div>

          {/* ── Main Heading ─────────────────────────────────────── */}
          <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#54453D] leading-[1.2]">
            {content.heading}
          </h2>

          {/* ── Description ──────────────────────────────────────── */}
          <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-2xl mx-auto">
            {content.description}
          </p>

          {/* ── Dual Action Buttons ──────────────────────────────── */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
            <Link
              href={getStartedHref}
              className="inline-flex min-h-[52px] w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#F0C5AE] px-8 py-3.5 text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
            >
              <span>{content.primaryButton}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            <a
              href={contactHref}
              className="inline-flex min-h-[52px] w-full sm:w-auto items-center justify-center rounded-xl bg-[#91B8C0] px-8 py-3.5 text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#6E9BA4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
            >
              <span>{content.secondaryButton}</span>
            </a>
          </div>

          {/* ── Micro Trust Points ───────────────────────────────── */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#75645B]">
            {content.trustPoints.map((point, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#2C4349]" aria-hidden="true" />
                <span>{point}</span>
              </span>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
