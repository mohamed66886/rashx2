import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from '@rashx/icons';
import { routes } from '@/lib/routes';
import type { Lang } from '@/lib/lang';
import type { SolutionData } from '@/data/solutions';

export interface SolutionHeroProps {
  solution: SolutionData;
  lang: Lang;
  className?: string;
}

export function SolutionHero({ solution, lang, className }: SolutionHeroProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const contactHref = (isAr ? routes.contact : `${routes.contact}?lang=en`) as Route;
  const platformHref = (isAr ? routes.platform : `${routes.platform}?lang=en`) as Route;

  return (
    <section
      id="solution-hero"
      className={`relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow & Main Section Title */}
          <SectionTitle
            as="h1"
            eyebrow={solution.badge[lang]}
            title={solution.title[lang]}
            align="center"
            withWordmark={true}
          />

          {/* Subtitle / Narrative */}
          <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
            {solution.subtitle[lang]}
          </p>

          {/* Key Value Highlights (Flat Badges, Zero Borders, Zero Shadows) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {solution.highlights.map((h, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#54453D]"
              >
                <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                <span>{h[lang]}</span>
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href={contactHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm sm:text-base font-bold text-white transition-colors duration-200 hover:bg-[#75645B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <span>{isAr ? 'احجز استشارة للمنظومة' : 'Book a Consultation'}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href={platformHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <Sparkles className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
              <span>{isAr ? 'استكشف معمارية المنصة' : 'Explore Platform Architecture'}</span>
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

