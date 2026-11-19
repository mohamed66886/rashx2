import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Layers, ArrowRight, ArrowLeft } from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import type { EcosystemProductData } from '@/data/ecosystem';

export interface EcosystemSyncProps {
  product: EcosystemProductData;
  lang: Lang;
  className?: string;
}

export function EcosystemSync({ product, lang, className }: EcosystemSyncProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section
      id="ecosystem-sync"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center">
            <SectionTitle
              eyebrow={isAr ? 'البنية التقنية' : 'CLOUD ARCHITECTURE'}
              title={product.architectureSyncTitle[lang]}
              align="center"
            />
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B]">
              {product.architectureSyncDescription[lang]}
            </p>
          </div>

          {/* Sync Points List (Flat Cards, Zero Borders, Zero Shadows) */}
          <div className="mt-10 sm:mt-12 space-y-4">
            {product.architectureSyncPoints.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-2xl bg-[#FAF9F8] p-5 sm:p-6 transition-colors duration-200 hover:bg-[#F0C5AE]/20"
              >
                <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#C78360]">
                  <Layers className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base leading-relaxed font-medium text-[#54453D]">
                    {item[lang]}
                  </p>
                </div>
                <ArrowIcon className="h-4 w-4 shrink-0 text-[#75645B]/60 mt-1" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

