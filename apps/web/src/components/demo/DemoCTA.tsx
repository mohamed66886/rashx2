import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, Sparkles } from '@rashx/icons';
import { routes } from '@/lib/routes';
import type { Lang } from '@/lib/lang';

export interface DemoCTAProps {
  lang: Lang;
  className?: string;
}

export function DemoCTA({ lang, className }: DemoCTAProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const getStartedHref = (isAr ? routes.getStarted : `${routes.getStarted}?lang=en`) as Route;
  const pricingHref = (isAr ? routes.pricing.index : `${routes.pricing.index}?lang=en`) as Route;

  return (
    <section
      id="demo-cta"
      className={`relative bg-white py-16 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            eyebrow={isAr ? 'جاهز للانطلاق؟' : 'READY TO COMMENCE?'}
            title={
              isAr
                ? 'ابدأ تهيئة منظومة صالونك الرقمية الآن'
                : 'Start Configuring Your Digital Salon Operating System Today'
            }
            align="center"
          />

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
            {isAr
              ? 'هل ترغب في البدء الفوري بحجز نطاقك المستقل وتفعيل خدماتك؟ انتقل مباشرة إلى صفحة بدء الاستخدام أو تواصل مع مستشارنا.'
              : 'Prefer to directly reserve your subdomain and initialize setup? Proceed to onboarding or consult our advisory team.'}
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={getStartedHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>{isAr ? 'ابدأ الاستخدام فوراً' : 'Get Started Now'}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href={pricingHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#FAF9F8] px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <span>{isAr ? 'اطّلع على باقات الاشتراك' : 'View Subscription Plans'}</span>
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
