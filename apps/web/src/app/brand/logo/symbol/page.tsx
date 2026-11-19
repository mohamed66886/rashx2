/**
 * RASHX Brand Center: Official Brand Symbol & Geometry
 * Dedicated Route: /brand/logo/symbol
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { RashxSymbol } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'رمز راش إكس الهندسي | RASHX Brand Symbol'
      : 'Brand Symbol & Geometrical Construction | RASHX',
    description: isAr
      ? 'تحليل هندسي لأيقونة ورمز راش إكس: الأقواس، المنحنيات المتوازنة، ومواصفات التكبير والتصغير المتجهي.'
      : 'Geometrical blueprint, circular arc ratios, and vector scaling precision of the official RASHX symbol.',
    path: '/brand/logo/symbol',
    lang,
  });
}

export default async function BrandSymbolPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const specs = isAr
    ? [
        { label: 'الشبكة الهندسية', value: 'شبكة متحدة المركز قائمة على النسبة الذهبية والتناظر المحوري' },
        { label: 'المرونة الاتجاهية', value: 'متوافق تماماً مع البيئات ثنائية الاتجاه (RTL & LTR)' },
        { label: 'الاستخدام الأساسي', value: 'أيقونات التطبيقات، الرموز المصغرة (Favicons)، وتوقيعات الواجهات' },
        { label: 'الحد الأدنى للحجم', value: '16x16 بكسل مع احتفاظ كامل بوضوح المعالم' },
      ]
    : [
        { label: 'Geometrical Grid', value: 'Concentric circle construction aligned to golden ratio arcs' },
        { label: 'Bidirectional Flow', value: 'Symmetric harmony across RTL and LTR operational contexts' },
        { label: 'Primary Context', value: 'App launchers, favicons, watermarks, and micro-interfaces' },
        { label: 'Minimum Size', value: '16x16px preserving crisp topological legibility' },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <Header lang={lang} />

      <main id="main-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <SectionTitle
                title={isAr ? 'رمز راش إكس الهندسي' : 'RASHX Brand Symbol'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'الهندسة المعمارية والنسب الدائرية للأيقونة الرسمية لمنظومة راش إكس'
                  : 'Geometric construction and circular arc blueprints of the primary platform glyph'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="flex h-56 items-center justify-center rounded-3xl bg-[#FAF9F8] p-8">
                <RashxSymbol size={96} color="ink" />
              </div>

              <div className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8">
                <h3 className="text-base font-bold text-[#54453D]">
                  {isAr ? 'المواصفات الفنية للرمز' : 'Symbol Specifications'}
                </h3>
                <dl className="mt-6 divide-y divide-transparent space-y-4">
                  {specs.map((item) => (
                    <div key={item.label} className="flex flex-col sm:flex-row sm:justify-between py-2">
                      <dt className="text-sm font-semibold text-[#54453D]/70">{item.label}</dt>
                      <dd className="text-sm font-bold text-[#54453D]">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

