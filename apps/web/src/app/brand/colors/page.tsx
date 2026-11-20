/**
 * RASHX Brand Center: Color Palette & Design Tokens
 * Dedicated Route: /brand/colors
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'لوحة الألوان والرموز اللونية الرسمية | RASHX Color Palette'
      : 'Official Color Palette & Design Tokens | RASHX Brand',
    description: isAr
      ? 'الدليل اللوني الكامل لراش إكس: حبر راش إكس، الكريمي الناعم، الخوخي الدافئ، الأزرق الغباري، وقيم HEX و RGB.'
      : 'Complete RASHX brand color architecture: Ink, Soft Cream, Warm Peach, Dusty Blue, Terracotta, and Deep Slate tokens.',
    path: '/brand/colors',
    lang,
  });
}

export default async function BrandColorsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const swatches = [
    {
      name: isAr ? 'حبر راش إكس الأساسي (Primary Ink)' : 'Primary Brand Ink',
      hex: '#54453D',
      rgb: 'rgb(84, 69, 61)',
      role: isAr ? 'النصوص الرئيسية، الشعارات، والعناصر الأساسية' : 'Headings, primary brand logos, and dark surfaces',
      textColor: 'text-white',
    },
    {
      name: isAr ? 'الكريمي الناعم (Soft Cream)' : 'Soft Cream Background',
      hex: '#FAF9F8',
      rgb: 'rgb(250, 249, 248)',
      role: isAr ? 'الخلفيات العامة، البطاقات، والأسطح المريحة للعين' : 'Primary page background, neutral canvas, and card fills',
      textColor: 'text-[#54453D]',
    },
    {
      name: isAr ? 'الخوخي الدافئ (Warm Peach)' : 'Warm Peach Accent',
      hex: '#F0C5AE',
      rgb: 'rgb(240, 197, 174)',
      role: isAr ? 'شارات التمييز، التنبيهات الإيجابية، والعناصر الداعمة' : 'Secondary accents, badges, and warm focal points',
      textColor: 'text-[#54453D]',
    },
    {
      name: isAr ? 'الأزرق الغباري (Dusty Blue)' : 'Dusty Blue Accent',
      hex: '#91B8C0',
      rgb: 'rgb(145, 184, 192)',
      role: isAr ? 'الميزات التقنية، عناصر الأمان، والبيانات التحليلية' : 'Technical tags, security metrics, and calm UI signals',
      textColor: 'text-[#2C4349]',
    },
    {
      name: isAr ? 'التراكوتا الطيني (Terracotta)' : 'Terracotta Deep Accent',
      hex: '#C78360',
      rgb: 'rgb(199, 131, 96)',
      role: isAr ? 'الأزرار التفاعلية، الرموز التوجيهية، والأولويات' : 'Interactive focus accents and distinctive highlights',
      textColor: 'text-white',
    },
    {
      name: isAr ? 'الإردوازي العميق (Deep Slate)' : 'Deep Slate Neutral',
      hex: '#2C4349',
      rgb: 'rgb(44, 67, 73)',
      role: isAr ? 'الحاويات الأمنية، بطاقات الأداء، والتباين المرتفع' : 'High-contrast security badges and telemetry panels',
      textColor: 'text-white',
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
                title={isAr ? 'لوحة الألوان والرموز اللونية' : 'Brand Color Palette'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'منظومة لونية هادئة، دافئة، ومريحة للعين مستوحاة من رقي قطاع الجمال والعناية'
                  : 'Harmonious, warm, and sophisticated color tokens calibrated for beauty and SaaS clarity'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {swatches.map((swatch) => (
                <div
                  key={swatch.hex}
                  className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-6 transition-colors duration-200"
                >
                  <div
                    className={`flex h-36 w-full items-end justify-between rounded-2xl p-4 ${swatch.textColor}`}
                    style={{ backgroundColor: swatch.hex }}
                  >
                    <span className="font-mono text-sm font-bold">{swatch.hex}</span>
                    <span className="text-xs font-medium opacity-80">{swatch.rgb}</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-[#54453D]">{swatch.name}</h3>
                    <p className="mt-1 text-xs text-[#54453D]/70">{swatch.role}</p>
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

