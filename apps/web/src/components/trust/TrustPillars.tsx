import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import type { Lang } from '@/lib/lang';
import type { TrustProductData } from '@/data/trust';

export interface TrustPillarsProps {
  product: TrustProductData;
  lang: Lang;
  className?: string;
}

export function TrustPillars({ product, lang, className }: TrustPillarsProps) {
  const isAr = lang === 'ar';

  return (
    <section
      id="pillars"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle
            eyebrow={isAr ? 'الركائز والآليات' : 'CORE STANDARDS'}
            title={
              isAr
                ? 'معايير أمان وامتثال دقيقة تحمي عملياتك'
                : 'Rigorous Security & Compliance Mechanisms'
            }
            align="center"
          />
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B]">
            {product.description[lang]}
          </p>
        </div>

        {/* Pillars Grid (Flat Cards, Zero Borders, Zero Shadows) */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {product.pillars.map((pillar, idx) => (
            <div
              key={pillar.id}
              className="group rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 flex flex-col justify-between transition-colors duration-200 hover:bg-[#F0C5AE]/20"
            >
              <div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white font-mono text-xs font-bold text-[#C78360]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-5 text-lg font-bold text-[#54453D]">
                  {pillar.title[lang]}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#75645B]">
                  {pillar.description[lang]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

