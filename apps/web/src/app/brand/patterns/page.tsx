/**
 * RASHX Brand Center: Architectural Geometric Patterns
 * Dedicated Route: /brand/patterns
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Layers } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'الأنماط الهندسية والمعمارية | RASHX Brand Patterns'
      : 'Architectural Geometric Patterns | RASHX Brand',
    description: isAr
      ? 'الأنماط والشبكات الهندسية المعتمدة لهوية راش إكس: الخلفيات الرقيقة، والزخارف المعمارية المعاصرة.'
      : 'Architectural patterns, modular grid textures, and surface overlays defining the spatial rhythm of RASHX.',
    path: '/brand/patterns',
    lang,
  });
}

export default async function BrandPatternsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const patterns = isAr
    ? [
        {
          name: 'نمط الشبكة المعمارية (Architectural Grid)',
          desc: 'شبكة خطية دقيقة بشفافية 4% تُستخدم كخلفيات خفية تعبر عن البنية الهندسية المنظمة.',
        },
        {
          name: 'نمط الأقواس المتراكبة (Concentric Arcs)',
          desc: 'منحنيات رقيقة مستوحاة من رمز راش إكس تُستخدم في بطاقات الدعوات ووثائق الشراكات الرسمية.',
        },
        {
          name: 'نمط التدرج المساحي المسطح (Tonal Field)',
          desc: 'مساحات متجاورة بدون فواصل أو حدود تعتمد على التباين الناعم بين درجات الكريمي والحبر.',
        },
      ]
    : [
        {
          name: 'Modular Architecture Grid',
          desc: 'Ultra-subtle line matrix rendered at 4% opacity evoking structured software systems.',
        },
        {
          name: 'Concentric Brand Arcs',
          desc: 'Graceful overlapping curves derived from the RASHX symbol, tailored for executive collateral.',
        },
        {
          name: 'Tonal Field Partitions',
          desc: 'Borderless contiguous tone blocks juxtaposing Soft Cream and deep Ink surfaces.',
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
                title={isAr ? 'الأنماط الهندسية والمعمارية' : 'Architectural Brand Patterns'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'بنية إيقاعية هادئة تمنح المساحات والتطبيقات هوية بصرية متماسكة دون تشتيت'
                  : 'Minimalist geometric textures providing tactile depth and spatial rhythm'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {patterns.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                >
                  <div className="flex h-32 items-center justify-center rounded-2xl bg-white/60">
                    <Layers className="h-10 w-10 text-[#54453D]/30" />
                  </div>
                  <div className="mt-6">
                    <h3 className="text-base font-bold text-[#54453D]">{item.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#54453D]/70">{item.desc}</p>
                  </div>
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

