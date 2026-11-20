/**
 * RASHX Newsroom & Press Hub Page
 *
 * Dedicated Route: /newsroom
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Newspaper, ArrowLeft, ArrowRight, Download } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'غرفة الأخبار والمركز الصحفي | RASHX Newsroom'
      : 'Newsroom & Media Headquarters | RASHX Newsroom',
    description: isAr
      ? 'المصدر الرسمي للبيانات الصحفية، أصول الهوية، وتصريحات القيادة لشركة راش إكس لتقنية المعلومات.'
      : 'Official source for press releases, company backgrounders, brand assets, and media announcements.',
    path: '/newsroom',
    lang,
  });
}

export default async function NewsroomPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const pressHref = (isAr ? routes.newsroom.press : `${routes.newsroom.press}?lang=en`) as Route;
  const mediaHref = (isAr ? routes.media : `${routes.media}?lang=en`) as Route;

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/newsroom" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#91B8C0]/30 px-3 py-1 text-xs font-semibold text-[#2C4349]">
                <Newspaper className="h-4 w-4" />
                <span>{isAr ? 'المركز الصحفي' : 'Media Communications'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'غرفة الأخبار الرسمية لـ راش إكس' : 'RASHX Corporate Newsroom'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'البيانات الصحفية المعتمدة، المواد الإعلامية، وحقيبة الوسائط الرسمية للصحفيين والباحثين'
                  : 'Authorized press releases, executive commentary, and verified brand resources for journalists'}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={pressHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3D322C]"
                >
                  <span>{isAr ? 'تصفح البيانات الصحفية' : 'View Press Releases'}</span>
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  href={mediaHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-6 py-3 text-sm font-semibold text-[#54453D] transition-colors hover:bg-[#E8DFD8]"
                >
                  <Download className="h-4 w-4" />
                  <span>{isAr ? 'حقيبة الوسائط (Media Kit)' : 'Media Kit'}</span>
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl rounded-3xl bg-[#FAF9F8] p-8 sm:p-12">
              <h3 className="text-lg font-bold text-[#54453D]">
                {isAr ? 'عن راش إكس (Factsheet)' : 'About RASHX (Fast Facts)'}
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4">
                  <span className="text-xs text-[#54453D]/60">{isAr ? 'سنة التأسيس' : 'Founded'}</span>
                  <p className="font-bold text-[#54453D]">2026</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <span className="text-xs text-[#54453D]/60">{isAr ? 'المؤسس' : 'Founder'}</span>
                  <p className="font-bold text-[#54453D]">
                    {isAr ? 'م. محمد عبده رشاد البهي' : 'Eng. Mohamed Abdo Rashad El-Bahy'}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <span className="text-xs text-[#54453D]/60">{isAr ? 'المقر الرئيسي' : 'Headquarters'}</span>
                  <p className="font-bold text-[#54453D]">
                    {isAr ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <span className="text-xs text-[#54453D]/60">{isAr ? 'القطاع التقني' : 'Industry'}</span>
                  <p className="font-bold text-[#54453D]">Beauty & Wellness SaaS</p>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

