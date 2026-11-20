/**
 * RASHX Brand Center: Illustration Guidelines
 * Dedicated Route: /brand/illustrations
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Sparkles } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'أسلوب الرسوم التوضيحية والتعبير البصري | RASHX Illustrations'
      : 'Illustration Guidelines & Visual Expression | RASHX Brand',
    description: isAr
      ? 'دليل أسلوب الرسوم التوضيحية لراش إكس: التجريد الهندسي، الألوان المسطحة، وغياب الظلال المصطنعة.'
      : 'Illustration art direction, flat geometric abstraction, warm palette integration, and shadowless rendering.',
    path: '/brand/illustrations',
    lang,
  });
}

export default async function BrandIllustrationsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const principles = isAr
    ? [
        {
          title: 'التسطيح التام (Pure Flat)',
          desc: 'نبتعد كلياً عن الظلال التدرجية المعقدة (Drop Shadows) واللمعان المصطنع، ونعتمد على تباين الكتل اللونية الهادئة.',
        },
        {
          title: 'التجريد الهندسي الوظيفي',
          desc: 'استخدام أشكال مستوحاة من العمارة الحديثة وأدوات العناية الشخصية بأسلوب رمزي نظيف وغير مزدحم.',
        },
        {
          title: 'التناغم مع الألوان الرسمية',
          desc: 'الاعتماد على درجات الخوخي الدافئ، والأزرق الغباري، والتراكوتا لإضفاء طابع إنساني راقٍ على الرسوم التقنية.',
        },
      ]
    : [
        {
          title: 'Absolute Flat Architecture',
          desc: 'Strictly zero gradient drop shadows or faux skeuomorphism; depth is achieved solely through tonal field shifts.',
        },
        {
          title: 'Functional Geometric Abstraction',
          desc: 'Clean symbolic shapes inspired by architectural geometry and modern salon tools with zero visual clutter.',
        },
        {
          title: 'Harmonious Brand Palette Ingestion',
          desc: 'Subtle applications of Warm Peach, Dusty Blue, and Terracotta infusing technical concepts with human warmth.',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <SectionTitle
                title={isAr ? 'أسلوب الرسوم التوضيحية' : 'Illustration Style Guidelines'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'لغة بصرية مجردة وهادئة تعكس فخامة قطاع التجميل وتكامل الحلول السحابية'
                  : 'Minimalist visual metaphors balancing salon sophistication with cloud technical rigor'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {principles.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                >
                  <Sparkles className="h-6 w-6 text-[#C78360]" />
                  <h3 className="mt-5 text-lg font-bold text-[#54453D]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80">{item.desc}</p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
