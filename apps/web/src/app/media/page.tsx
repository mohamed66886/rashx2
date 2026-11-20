/**
 * RASHX Media Center & Press Assets Page
 *
 * Dedicated Route: /media
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Download, Sparkles, Image as ImageIcon } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'حقيبة الوسائط والأصول الإعلامية | RASHX Media Center'
      : 'Media Kit & Press Assets | RASHX Media Center',
    description: isAr
      ? 'حمل الأصول الإعلامية الرسمية لشركة راش إكس: الشعارات، صور الواجهات، وبيانات الشركة المعتمدة.'
      : 'Download official RASHX brand assets, vector logos, executive portraits, and product mockups for press use.',
    path: '/media',
    lang,
  });
}

export default async function MediaPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const assetPacks = isAr
    ? [
        {
          title: 'حزمة الشعارات المعتمدة (Vector & Raster)',
          desc: 'شعار راش إكس باللغتين العربية والإنجليزية، المونوغرام، والأيقونات بصيغ SVG و PNG عالية الدقة.',
          size: '4.2 MB',
        },
        {
          title: 'صور واجهات وتطبيقات المنظومة',
          desc: 'لقطات شاشة معتمدة للوحة التحكم، تطبيق العميل، وواجهة مقدم الخدمة للاستخدام في التغطيات الصحفية.',
          size: '12.8 MB',
        },
        {
          title: 'الملف التعريفي للشركة والمؤسس (Factsheet)',
          desc: 'موجز تعريفي رسمي بالسيرة الذاتية للمهندس محمد عبده رشاد البهي وأرقام المنظومة الأساسية.',
          size: '1.5 MB',
        },
      ]
    : [
        {
          title: 'Official Logo Suite (Vector & Raster)',
          desc: 'Bilingual RASHX lockups, standalone monograms, and icon glyphs in high-resolution SVG and PNG formats.',
          size: '4.2 MB',
        },
        {
          title: 'Product Interfaces & App Mockups',
          desc: 'High-fidelity screenshots of the admin dashboard, booking portal, and provider workspace for editorial use.',
          size: '12.8 MB',
        },
        {
          title: 'Corporate Factsheet & Executive Bio',
          desc: 'Verified executive backgrounder for Founder Eng. Mohamed Abdo Rashad El-Bahy and platform architecture summary.',
          size: '1.5 MB',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/media" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <ImageIcon className="h-4 w-4" />
                <span>{isAr ? 'الأصول والوسائط' : 'Media Kit'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'حقيبة الوسائط والمواد الإعلامية' : 'Official Media Kit & Assets'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'أصول الهوية البصرية الرسمية والمواد الصحفية المعتمدة للاستخدام الإعلامي والتحريري'
                  : 'Curated editorial assets, high-resolution logos, and company factsheets for press usage'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {assetPacks.map((pack) => (
                <div
                  key={pack.title}
                  className="flex flex-col justify-between rounded-2xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                >
                  <div>
                    <span className="text-xs font-bold text-[#54453D]/60">{pack.size}</span>
                    <h3 className="mt-2 text-lg font-bold text-[#54453D]">{pack.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80">{pack.desc}</p>
                  </div>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#54453D] py-3 text-xs font-bold text-white transition-colors hover:bg-[#3D322C]"
                    >
                      <Download className="h-4 w-4" />
                      <span>{isAr ? 'تحميل الحزمة' : 'Download Pack'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl bg-[#FAF9F8] p-8 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-[#C78360]" />
              <p className="mt-2 text-sm text-[#54453D]/80">
                {isAr
                  ? 'تخضع كافة أصول الهوية والشعارات لشروط الاستخدام وحقوق الملكية الفكرية لـ راش إكس لتقنية المعلومات 2026.'
                  : 'All brand identity elements and trademarks are proprietary assets of RASHX Information Technology 2026.'}
              </p>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

