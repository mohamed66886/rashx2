import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, Layers, Sparkles } from '@rashx/icons';
import { routes } from '@/lib/routes';
import type { Lang } from '@/lib/lang';

export interface ContactCTAProps {
  lang: Lang;
  className?: string;
}

export function ContactCTA({ lang, className }: ContactCTAProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const content = isAr
    ? {
        eyebrow: 'الخطوة التالية',
        title: 'هل ترغب في التعرف على RASHX بشكل أفضل؟',
        description:
          'اكتشف بنيتنا السحابية وقدرات المنظومة التشغيلية المصممة لتمكين صالونات ومراكز التجميل من إدارة أعمالها باحترافية.',
        platformCta: 'استكشف المنظومة',
        featuresCta: 'استكشف مميزات المنصة',
      }
    : {
        eyebrow: 'NEXT STEP',
        title: 'Would you like to learn more about RASHX?',
        description:
          'Discover our cloud architecture and operational capabilities crafted to empower salons and beauty centers with professional precision.',
        platformCta: 'Explore Platform',
        featuresCta: 'Explore Features',
      };

  const platformHref = (isAr ? routes.platform : `${routes.platform}?lang=en`) as Route;
  const featuresHref = (isAr ? routes.features : `${routes.features}?lang=en`) as Route;

  return (
    <section
      id="contact-cta"
      className={`relative bg-[#FAF9F8] py-16 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            eyebrow={content.eyebrow}
            title={content.title}
            align="center"
          />
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
            {content.description}
          </p>

          {/* Action Buttons (Zero Borders, Zero Shadows, Flat Tonal Styling) */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={platformHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              <span>{content.platformCta}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href={featuresHref}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
            >
              <Sparkles className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
              <span>{content.featuresCta}</span>
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
