import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, Calendar } from '@rashx/icons';
import { routes } from '@/lib/routes';
import type { Lang } from '@/lib/lang';

export interface GetStartedCTAProps {
  lang: Lang;
  className?: string;
}

export function GetStartedCTA({ lang, className }: GetStartedCTAProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const demoHref = (isAr ? routes.demo : `${routes.demo}?lang=en`) as Route;
  const pricingHref = (isAr ? routes.pricing.index : `${routes.pricing.index}?lang=en`) as Route;

  return (
    <section
      id="get-started-cta"
      className={`relative bg-[#FAF9F8] py-16 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            eyebrow={isAr ? 'هل تفضل رؤية المنظومة أولاً؟' : 'PREFER A LIVE PREVIEW FIRST?'}
            title={
              isAr
                ? 'احجز جلسة عرض حي مخصصة لصالونك'
                : 'Schedule a Dedicated Live Demo for Your Salon'
            }
            align="center"
          />

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
            {isAr
              ? 'إذا كنت ترغب في استعراض لوحة التحكم وتطبيق مقدم الخدمة وتجربة الحجز قبل التفعيل، يسعدنا مرافقتك في جولة حية تفاعلية.'
              : 'If you want to explore the admin dashboard, specialist app, and booking portal before setup, join us for a personalized walkthrough.'}
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={demoHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{isAr ? 'احجز عرضاً حياً الآن' : 'Schedule Live Demo'}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href={pricingHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <span>{isAr ? 'مقارنة باقات الاشتراك' : 'Compare Subscription Plans'}</span>
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
