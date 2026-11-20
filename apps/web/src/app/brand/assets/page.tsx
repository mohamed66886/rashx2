/**
 * RASHX Brand Center: Asset Package Downloads
 * Dedicated Route: /brand/assets
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Download, Sparkles, FileText, Image as ImageIcon } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'تحميل ملفات وأصول الهوية الرسمية | RASHX Brand Assets'
      : 'Download Official Brand Assets | RASHX Brand',
    description: isAr
      ? 'حمل الحزمة المتكاملة لأصول هوية راش إكس: ملفات المتجهات SVG، الشعارات المفرغة PNG، ونماذج العرض.'
      : 'Direct vector SVG, high-resolution PNG, and PDF asset downloads for the official RASHX brand system.',
    path: '/brand/assets',
    lang,
  });
}

export default async function BrandAssetsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const packages = isAr
    ? [
        {
          title: 'حزمة الشعارات المتجهة الكاملة (SVG Pack)',
          desc: 'كافة تراكيب الشعار ثنائي اللغة، المونوغرام، والرمز بأشكال متجهة قابلة للتكبير اللانهائي.',
          size: '3.4 MB ZIP',
          icon: FileText,
        },
        {
          title: 'حزمة الصور المفرغة عالية الدقة (PNG Pack)',
          desc: 'شعارات مفرغة بدقة 4K باللون الحبري الأساسي والأبيض النقي للاستخدامات الرقمية السريعة.',
          size: '8.2 MB ZIP',
          icon: ImageIcon,
        },
        {
          title: 'رموز الألوان ونظام التصميم (Tokens & Swatches)',
          desc: 'ملفات تعريف الألوان بصيغ ASE و CSS Tokens للمصممين ومطوري الواجهات.',
          size: '420 KB ZIP',
          icon: Sparkles,
        },
      ]
    : [
        {
          title: 'Complete Vector Logo Suite (SVG Pack)',
          desc: 'Bilingual lockups, standalone monograms, and symbol marks in infinitely scalable vector code.',
          size: '3.4 MB ZIP',
          icon: FileText,
        },
        {
          title: 'High-Resolution Transparent Logos (PNG Pack)',
          desc: 'Transparent 4K resolution PNGs in Primary Ink and Pure White for web and presentation decks.',
          size: '8.2 MB ZIP',
          icon: ImageIcon,
        },
        {
          title: 'Color Palettes & Design Tokens (ASE / CSS)',
          desc: 'Adobe Swatch Exchange files and CSS design tokens for engineers and interface designers.',
          size: '420 KB ZIP',
          icon: Sparkles,
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
                title={isAr ? 'تحميل أصول الهوية الرسمية' : 'Download Official Brand Assets'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'ملفات المصدر الأصلية المعتمدة للمصممين، المهندسين، ومسؤولي العلاقات الإعلامية'
                  : 'Official master vector and raster assets calibrated for print, web, and UI reproduction'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {packages.map((pkg) => {
                const Icon = pkg.icon;
                return (
                  <div
                    key={pkg.title}
                    className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Icon className="h-6 w-6 text-[#54453D]" />
                        <span className="text-xs font-bold text-[#54453D]/60">{pkg.size}</span>
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-[#54453D]">{pkg.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#54453D]/80">{pkg.desc}</p>
                    </div>
                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#54453D] py-3 text-xs font-bold text-white transition-colors hover:bg-[#3D322C]"
                      >
                        <Download className="h-4 w-4" />
                        <span>{isAr ? 'تحميل الملفات' : 'Download Assets'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

