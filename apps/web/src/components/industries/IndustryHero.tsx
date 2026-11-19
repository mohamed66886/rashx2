import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, Sparkles } from '@rashx/icons';
import { routes } from '@/lib/routes';
import type { Lang } from '@/lib/lang';
import type { IndustryData } from '@/data/industries';

export interface IndustryHeroProps {
  industry: IndustryData;
  lang: Lang;
  className?: string;
}

export function IndustryHero({ industry, lang, className }: IndustryHeroProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const demoHref = (isAr ? routes.demo : `${routes.demo}?lang=en`) as Route;
  const getStartedHref = (isAr ? routes.getStarted : `${routes.getStarted}?lang=en`) as Route;

  return (
    <section
      id="industry-hero"
      className={`relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            as="h1"
            eyebrow={industry.badge[lang]}
            title={industry.title[lang]}
            align="center"
            withWordmark={true}
          />

          <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
            {industry.subtitle[lang]}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {industry.stats.map((stat, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white px-5 py-3 text-center min-w-[130px]"
              >
                <div className="text-xl sm:text-2xl font-black text-[#C78360]">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-[#54453D] mt-0.5">
                  {stat.label[lang]}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href={demoHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm sm:text-base font-bold text-white transition-colors duration-200 hover:bg-[#75645B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>{isAr ? 'احجز عرضاً حياً مخصصاً' : 'Book a Tailored Demo'}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href={getStartedHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <span>{isAr ? 'ابدأ الاستخدام فوراً' : 'Get Started Now'}</span>
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
