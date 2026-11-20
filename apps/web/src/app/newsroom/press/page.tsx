/**
 * RASHX Press Releases Page
 *
 * Dedicated Route: /newsroom/press
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Newspaper } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'البيانات الصحفية الرسمية | RASHX Press Releases'
      : 'Official Press Releases | RASHX Press Releases',
    description: isAr
      ? 'الأرشيف الكامل للبيانات الصحفية الرسمية الصادرة عن شركة راش إكس لتقنية المعلومات.'
      : 'Chronological archive of all authorized press statements and corporate announcements released by RASHX.',
    path: '/newsroom/press',
    lang,
  });
}

export default async function PressReleasesPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const releases = isAr
    ? [
        {
          date: 'الرياض — 2026',
          title:
            'راش إكس تدشن منصتها السحابية المتخصصة لرقمنة وتشغيل قطاع الصالونات ومراكز التجميل والسبا',
          body:
            'أعلنت شركة راش إكس لتقنية المعلومات، ومقرها الرياض، عن إطلاق منصتها المتكاملة الموجهة لمنشآت الجمال والعناية الشخصية في المملكة، بقيادة المؤسس المهندس محمد عبده رشاد البهي.',
        },
        {
          date: 'الرياض — 2026',
          title: 'اعتماد محرك الفوترة الإلكترونية السحابي لـ راش إكس مع متطلبات المرحلة الثانية لـ ZATCA',
          body:
            'أكدت راش إكس التزامها الكامل باللوائح الضريبية السعودية عبر توفير آلية إصدار فواتير ضريبية مشفرة وموقعة رقمياً تدعم التكامل اللحظي مع منظومة الفوترة الإلكترونية الوطنية.',
        },
      ]
    : [
        {
          date: 'Riyadh — 2026',
          title:
            'RASHX Announces Commercial Launch of Digital Operating Cloud for Beauty Salons and Spas',
          body:
            'RASHX Information Technology, headquartered in Riyadh, officially launches its comprehensive SaaS platform under the leadership of Founder Eng. Mohamed Abdo Rashad El-Bahy.',
        },
        {
          date: 'Riyadh — 2026',
          title:
            'RASHX Delivers Native ZATCA Phase 2 E-Invoicing Cloud Integration for Saudi Beauty Sector',
          body:
            'RASHX certifies its cloud billing engine to generate secure, cryptographically hashed simplified electronic invoices complying with national tax authority standards.',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/newsroom/press" lang={lang} />
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
                <span>{isAr ? 'البيانات الصحفية' : 'Press Statements'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'البيانات الصحفية الرسمية' : 'Corporate Press Releases'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'سجل التغطيات والبيانات الصادرة عن المكتب الإعلامي لشركة راش إكس'
                  : 'Official record of executive statements and releases issued to news organizations'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              {releases.map((rel, idx) => (
                <article
                  key={idx}
                  className="rounded-2xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                >
                  <span className="text-xs font-bold text-[#54453D]/60">{rel.date}</span>
                  <h2 className="mt-2 text-lg font-bold text-[#54453D] sm:text-xl">{rel.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80 sm:text-base">
                    {rel.body}
                  </p>
                </article>
              ))}
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

