import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { AlertCircle } from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import type { IndustryData } from '@/data/industries';

export interface IndustryChallengesProps {
  industry: IndustryData;
  lang: Lang;
  className?: string;
}

export function IndustryChallenges({ industry, lang, className }: IndustryChallengesProps) {
  const isAr = lang === 'ar';

  return (
    <section
      id="industry-challenges"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-5xl">
          <SectionTitle
            eyebrow={isAr ? 'نقاط الألم التشغيلية' : 'OPERATIONAL BOTTLENECK'}
            title={industry.challengesTitle[lang]}
            align="center"
          />

          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {industry.challenges.map((c, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8 flex flex-col justify-between transition-colors duration-200"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0C5AE]/30 text-[#C78360] mb-5">
                    <AlertCircle className="h-5 w-5 text-[#C78360]" aria-hidden="true" />
                  </div>

                  <h3 className="text-lg font-bold text-[#54453D] mb-3">
                    {c.title[lang]}
                  </h3>

                  <p className="text-sm leading-relaxed text-[#75645B]">
                    {c.description[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

