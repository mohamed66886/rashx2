import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Sparkles, LayoutDashboard, CreditCard, Users, Globe } from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import { demoData } from '@/data/commercial';

export interface DemoHighlightsProps {
  lang: Lang;
  className?: string;
}

const highlightIcons = [LayoutDashboard, CreditCard, Users, Globe];

export function DemoHighlights({ lang, className }: DemoHighlightsProps) {
  const isAr = lang === 'ar';
  const { highlights } = demoData;

  return (
    <section
      id="demo-highlights"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-5xl">
          <SectionTitle
            eyebrow={isAr ? 'ماذا ستشاهد في العرض الحي؟' : 'WHAT TO EXPECT IN THE DEMO'}
            title={
              isAr
                ? 'استعراض تطبيقي متكامل لكافة أركان المنظومة الرقمية'
                : 'Comprehensive Real-Time Walkthrough of the Digital Ecosystem'
            }
            align="center"
          />
          <p className="mt-4 text-base leading-relaxed text-[#75645B] max-w-2xl mx-auto text-center">
            {isAr
              ? 'نأخذك في جولة واقعية تحاكي دورة العمل اليومية في صالونك من أول لحظة حجز العميل وحتى إصدار الفاتورة الضريبية وتقارير الأرباح.'
              : 'Experience a live simulation of a salon’s daily operations—from the first customer booking to instant ZATCA invoicing and revenue analytics.'}
          </p>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {highlights.map((item, idx) => {
              const IconComponent = highlightIcons[idx % highlightIcons.length] ?? Sparkles;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8 flex flex-col justify-between transition-colors duration-200"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0C5AE]/40 text-[#54453D] shrink-0">
                        <IconComponent className="h-5 w-5 text-[#54453D]" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#54453D]">
                        {item.title[lang]}
                      </h3>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed text-[#75645B]">
                      {item.description[lang]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
