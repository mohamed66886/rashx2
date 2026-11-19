import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Sparkles, Trophy, Star } from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import type { EcosystemProductData } from '@/data/ecosystem';

export interface EcosystemBenefitsProps {
  product: EcosystemProductData;
  lang: Lang;
  className?: string;
}

const benefitIcons = [Sparkles, Trophy, Star];

export function EcosystemBenefits({
  product,
  lang,
  className,
}: EcosystemBenefitsProps) {
  const isAr = lang === 'ar';

  return (
    <section
      id="benefits"
      className={`relative bg-[#FAF9F8] py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* Section Title */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle
            eyebrow={isAr ? 'القيمة الاستراتيجية' : 'STRATEGIC VALUE'}
            title={product.keyBenefitsTitle[lang]}
            align="center"
          />
        </div>

        {/* Benefits Cards Grid (Flat Cards, Zero Borders, Zero Shadows) */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {product.keyBenefits.map((benefit, idx) => {
            const Icon = benefitIcons[idx % benefitIcons.length]!;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-white p-6 sm:p-8 flex flex-col justify-between transition-colors duration-200"
              >
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF9F8] text-[#C78360]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#54453D]">
                    {benefit.title[lang]}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#75645B]">
                    {benefit.description[lang]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}

