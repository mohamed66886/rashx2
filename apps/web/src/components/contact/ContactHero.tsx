import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import type { Lang } from '@/lib/lang';

export interface ContactHeroProps {
  lang: Lang;
  className?: string;
}

export function ContactHero({ lang, className }: ContactHeroProps) {
  const isAr = lang === 'ar';

  const content = isAr
    ? {
        eyebrow: 'تواصل معنا',
        heading: 'نحن هنا لمساعدتك على اتخاذ الخطوة التالية.',
        description:
          'سواء كنت ترغب في التعرف على RASHX أو لديك استفسار حول المنصة، يسعدنا التواصل معك.',
        highlights: [
          'قنوات تواصل مباشرة وسريعة',
          'استشارات تقنية وتشغيلية للمنشآت',
          'دعم مخصص للسوق السعودي',
        ],
      }
    : {
        eyebrow: 'CONTACT US',
        heading: "We're Here to Help You Take the Next Step.",
        description:
          "Whether you want to learn more about RASHX or have a question about the platform, we'd be happy to hear from you.",
        highlights: [
          'Direct and responsive communication',
          'Technical and operational advisory for salons',
          'Tailored for the Saudi market',
        ],
      };

  return (
    <section
      id="contact-hero"
      className={`relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            as="h1"
            eyebrow={content.eyebrow}
            title={content.heading}
            align="center"
            withWordmark={true}
          />
          <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-2xl mx-auto">
            {content.description}
          </p>

          {/* Value Highlights (Tonal Flat Badges, Zero Borders, Zero Shadows) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {content.highlights.map((highlight, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs sm:text-sm font-medium text-[#54453D]"
              >
                <span className="me-2 h-1.5 w-1.5 rounded-full bg-[#C78360]" aria-hidden="true" />
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
