import Link from 'next/link';
import { PageContainer } from '@rashx/ui';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface PricingHeroProps {
  lang: Lang;
  className?: string;
}

export function PricingHero({ lang, className }: PricingHeroProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const content = isAr
    ? {
        eyebrow: 'الاشتراك في RASHX',
        title: 'اختر ما يناسب نمو منشأتك.',
        description:
          'اكتشف خيارات الاشتراك المتاحة لإدارة منشأتك من خلال منظومة رقمية متكاملة.',
        primaryCta: 'استعراض الباقات',
        secondaryCta: 'تواصل مع فريقنا',
        highlights: [
          'تسعير مخصص بحسب احتياج صالونك وحجم فريقك',
          'شامل الفاتورة الضريبية ورمز الاستجابة السريع (ZATCA)',
          'جلسات تدريب ودعم فني مخصص لمنشأتك',
        ],
      }
    : {
        eyebrow: 'RASHX SUBSCRIPTION',
        title: 'Choose the Right Plan for Your Business.',
        description:
          'Explore the available subscription options to manage your business through one integrated digital platform.',
        primaryCta: 'View Available Plans',
        secondaryCta: 'Contact Our Team',
        highlights: [
          'Tailored pricing tailored to your salon scale and staff size',
          'Full ZATCA e-invoicing and encrypted QR compliance included',
          'Dedicated onboarding and ongoing technical support',
        ],
      };

  return (
    <section
      id="pricing-hero"
      className={`relative overflow-hidden bg-gradient-to-b from-[#FAF9F8] to-[#FFFFFF] pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="mb-4 inline-flex items-center justify-center">
            <span className="rounded-full bg-[#FAF9F8] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#C78360]">
              {content.eyebrow}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#54453D] leading-[1.18] text-balance">
            {content.title}
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-[#75645B]">
            {content.description}
          </p>

          {/* Value Highlights */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-[#54453D]">
            {content.highlights.map((item) => (
              <div key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex w-full flex-col sm:w-auto sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="#plans"
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#F0C5AE] px-7 py-3.5 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
            >
              <span>{content.primaryCta}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            <a
              href="mailto:hello@rashx.com"
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-xl bg-[#91B8C0] px-7 py-3.5 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#6E9BA4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
            >
              <span>{content.secondaryCta}</span>
            </a>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

