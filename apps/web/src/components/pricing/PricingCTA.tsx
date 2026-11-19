import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface PricingCTAProps {
  lang: Lang;
  className?: string;
}

export function PricingCTA({ lang, className }: PricingCTAProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const featuresHref = (isAr ? '/features' : '/features?lang=en') as Route;

  const content = isAr
    ? {
        eyebrow: 'استشارة مجانية مخصصة',
        title: 'هل تحتاج إلى مساعدة في اختيار الاشتراك المناسب؟',
        description:
          'فريق خبرائنا جاهز لمساعدتك على تقييم احتياجات صالونك التشغيلية واقتراح الباقة المثالية التي تحقق أعلى عائد لاستثمارك.',
        primaryCta: 'تواصل مع مستشار الاشتراكات',
        secondaryCta: 'استكشف مميزات المنظومة',
        highlights: [
          'جلسة استشارية وعرض حي لكافة الوظائف',
          'تحليل لعدد الأخصائيات وحجم العمليات',
          'عرض سعر مخصص ومفصل بدون أي التزام',
        ],
      }
    : {
        eyebrow: 'Complimentary Consultation',
        title: 'Need help choosing the right subscription?',
        description:
          'Our advisory team is ready to assess your operational scale and recommend the optimal package delivering maximum ROI for your facility.',
        primaryCta: 'Speak with an Advisor',
        secondaryCta: 'Explore Platform Features',
        highlights: [
          'Tailored consultation & live functional walkthrough',
          'Workload and specialist roster capacity assessment',
          'Detailed transparent custom quote with zero obligation',
        ],
      };

  return (
    <section
      id="pricing-cta"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="rounded-[2rem] bg-[#F0C5AE] p-8 sm:p-12 lg:p-16 text-[#54453D] text-center">
          <div className="mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#54453D]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>{content.eyebrow}</span>
            </span>

            <h2 className="mt-5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#54453D] leading-tight text-balance">
              {content.title}
            </h2>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#54453D]/90 max-w-2xl mx-auto">
              {content.description}
            </p>

            {/* Checklist */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-[#54453D]">
              {content.highlights.map((h) => (
                <div key={h} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#54453D] shrink-0" aria-hidden="true" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex w-full flex-col sm:w-auto sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <a
                href="mailto:hello@rashx.com?subject=RASHX%20Subscription%20Consultation%20Request"
                className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm sm:text-base font-bold text-white transition-colors duration-200 hover:bg-[#3D322B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#F0C5AE]"
              >
                <span>{content.primaryCta}</span>
                <ArrowIcon className="h-4 w-4" aria-hidden="true" />
              </a>

              <Link
                href={featuresHref}
                className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-xl bg-white/80 px-7 py-3.5 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
              >
                <span>{content.secondaryCta}</span>
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

