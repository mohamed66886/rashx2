import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { CheckCircle2 } from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import type { IndustryData } from '@/data/industries';

export interface IndustryFeaturesProps {
  industry: IndustryData;
  lang: Lang;
  className?: string;
}

export function IndustryFeatures({ industry, lang, className }: IndustryFeaturesProps) {
  const isAr = lang === 'ar';

  return (
    <section
      id="industry-features"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            eyebrow={isAr ? 'أهم الإمكانيات' : 'CORE CAPABILITIES'}
            title={
              isAr
                ? `مزايا مصممة خصيصاً لتناسب ${industry.badge.ar}`
                : `Capabilities Tailored for ${industry.badge.en}`
            }
            align="center"
          />

          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-start">
            {industry.keyFeatures.map((f, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 rounded-2xl bg-[#FAF9F8] p-5 sm:p-6"
              >
                <CheckCircle2 className="h-5 w-5 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm sm:text-base font-semibold text-[#54453D] leading-snug">
                  {f[lang]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

