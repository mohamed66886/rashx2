import Link from 'next/link';
import { PageContainer } from '@rashx/ui';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface AboutHeroProps {
  lang: Lang;
  className?: string;
}

export function AboutHero({ lang, className }: AboutHeroProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const content = isAr
    ? {
        eyebrow: 'من نحن',
        title: 'نبني تجربة رقمية أكثر تكاملًا لقطاع الجمال.',
        description:
          'نعمل على تطوير منظومة رقمية تساعد الصالونات ومراكز التجميل والسبا على إدارة أعمالها وتقديم تجربة أكثر تنظيمًا وترابطًا.',
        primaryCta: 'استكشف المنظومة',
        secondaryCta: 'تواصل معنا',
        highlights: [
          'تأسست في المملكة العربية السعودية · 2026',
          'منظومة سحابية متخصصة لقطاع الجمال والعناية',
          'تركيز هندسي على تبسيط العمليات اليومية',
        ],
      }
    : {
        eyebrow: 'ABOUT RASHX',
        title: 'Building a More Connected Digital Experience for Beauty.',
        description:
          'We develop digital solutions that help salons, beauty centers, and spas manage their operations and deliver a more connected experience.',
        primaryCta: 'Explore the Platform',
        secondaryCta: 'Contact Our Team',
        highlights: [
          'Founded in Saudi Arabia · 2026',
          'Specialized Cloud Platform for Beauty & Wellness',
          'Engineered to Simplify Daily Operations',
        ],
      };

  return (
    <section
      id="about-hero"
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
          <p className="mt-5 max-w-3xl text-base sm:text-lg md:text-xl leading-relaxed text-[#75645B]">
            {content.description}
          </p>

          {/* Institutional Highlights */}
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
              href="#who-we-are"
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

