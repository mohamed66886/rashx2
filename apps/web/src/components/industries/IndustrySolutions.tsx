import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Zap } from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import type { IndustryData } from '@/data/industries';

export interface IndustrySolutionsProps {
  industry: IndustryData;
  lang: Lang;
  className?: string;
}

export function IndustrySolutions({ industry, lang, className }: IndustrySolutionsProps) {
  const isAr = lang === 'ar';

  return (
    <section
      id="industry-solutions"
      className={`relative bg-[#FAF9F8] py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-5xl">
          <SectionTitle
            eyebrow={isAr ? 'منظومة الحلول الذكية' : 'INTELLIGENT SOLUTIONS'}
            title={industry.solutionsTitle[lang]}
            align="center"
          />

          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {industry.solutions.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white p-6 sm:p-8 flex flex-col justify-between transition-colors duration-200"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#91B8C0]/20 text-[#2C4349] mb-5">
                    <Zap className="h-5 w-5 text-[#2C4349]" aria-hidden="true" />
                  </div>

                  <h3 className="text-lg font-bold text-[#54453D] mb-3">
                    {s.title[lang]}
                  </h3>

                  <p className="text-sm leading-relaxed text-[#75645B]">
                    {s.description[lang]}
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
