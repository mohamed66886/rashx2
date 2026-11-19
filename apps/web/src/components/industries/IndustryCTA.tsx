import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, Sparkles } from '@rashx/icons';
import { routes } from '@/lib/routes';
import type { Lang } from '@/lib/lang';
import type { IndustryData } from '@/data/industries';

export interface IndustryCTAProps {
  industry: IndustryData;
  lang: Lang;
  className?: string;
}

export function IndustryCTA({ industry, lang, className }: IndustryCTAProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const demoHref = (isAr ? routes.demo : `${routes.demo}?lang=en`) as Route;
  const getStartedHref = (isAr ? routes.getStarted : `${routes.getStarted}?lang=en`) as Route;

  return (
    <section
      id="industry-cta"
      className={`relative bg-[#FAF9F8] py-16 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            eyebrow={isAr ? 'جاهز للتحول الرقمي؟' : 'READY TO TRANSFORM?'}
            title={
              isAr
                ? `ابدأ تشغيل ${industry.badge.ar} بمنظومة RASHX الذكية`
                : `Power Your ${industry.badge.en} with RASHX Today`
            }
            align="center"
          />

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
            {isAr
              ? 'انضم إلى نخبة المنشآت التي حوّلت إدارة صالوناتها إلى تجربة رقمية منظمة ومربحة.'
              : 'Join premier salons and beauty centers elevating their operations into streamlined, profitable digital businesses.'}
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={demoHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>{isAr ? 'طلب عرض حي مخصص' : 'Request Tailored Demo'}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href={getStartedHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <span>{isAr ? 'احجز مساحتك السحابية' : 'Reserve Cloud Space'}</span>
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
