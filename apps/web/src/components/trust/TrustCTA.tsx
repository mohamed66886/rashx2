import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, ShieldCheck, Phone } from '@rashx/icons';
import { routes } from '@/lib/routes';
import type { Lang } from '@/lib/lang';
import type { TrustProductData } from '@/data/trust';

export interface TrustCTAProps {
  product: TrustProductData;
  lang: Lang;
  className?: string;
}

export function TrustCTA({ product, lang, className }: TrustCTAProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const contactHref = (isAr ? routes.contact : `${routes.contact}?lang=en`) as Route;
  const platformHref = (isAr ? routes.platform : `${routes.platform}?lang=en`) as Route;

  return (
    <section
      id="trust-cta"
      className={`relative bg-[#FAF9F8] py-16 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            eyebrow={isAr ? 'أمان أعمالك أولاً' : 'PRIORITIZE COMPLIANCE'}
            title={
              isAr
                ? `اضمن امتثال وأمان ${product.badge.ar} لصالونك اليوم`
                : `Ensure ${product.badge.en} for Your Salon Today`
            }
            align="center"
          />

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
            {isAr
              ? 'تحدث مع فريقنا للتحقق من جاهزية منشأتك وضمان تشغيل آمن وممتثل بالكامل للمتطلبات التنظيمية في المملكة.'
              : 'Consult with our compliance specialists to verify your facility readiness and safeguard your business.'}
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={contactHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>{isAr ? 'تواصل مع مستشار الامتثال' : 'Speak with an Advisor'}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href={platformHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <ShieldCheck className="h-4 w-4 text-[#16A34A]" aria-hidden="true" />
              <span>{isAr ? 'استكشف البنية السحابية' : 'Explore Cloud Security'}</span>
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

