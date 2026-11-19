import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { CheckCircle2 } from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import { getStartedData } from '@/data/commercial';

export interface GetStartedHeroProps {
  lang: Lang;
  className?: string;
}

export function GetStartedHero({ lang, className }: GetStartedHeroProps) {
  const isAr = lang === 'ar';
  const { hero } = getStartedData;

  const quickBadges = isAr
    ? ['نطاق فرعي مستقل لكل صالون', 'امتثال تام مع ZATCA', 'ترحيل مجاني للبيانات السابقة', 'تدريب مباشر وشامل لفريقك']
    : ['Dedicated Subdomain per Salon', 'Full ZATCA Phase 2 Compliance', 'Zero-Loss Data Migration', 'Comprehensive Team Onboarding'];

  return (
    <section
      id="get-started-hero"
      className={`relative bg-[#FAF9F8] pt-14 pb-10 sm:pt-20 sm:pb-14 lg:pt-24 lg:pb-16 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            as="h1"
            eyebrow={hero.eyebrow[lang]}
            title={hero.title[lang]}
            align="center"
            withWordmark={true}
          />

          <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
            {hero.subtitle[lang]}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {quickBadges.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#54453D]"
              >
                <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                <span>{badge}</span>
              </span>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

