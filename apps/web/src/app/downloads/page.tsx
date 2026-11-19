/**
 * RASHX Resource Downloads Page
 *
 * Dedicated Route: /downloads
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Download, FileText, Sparkles } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'مركز التحميلات والكتيبات | RASHX Downloads'
      : 'Resource Downloads & Guides | RASHX Downloads',
    description: isAr
      ? 'تحميل كتيبات التعريف بالمنظومة، أدلة التشغيل، معايير الفوترة، ومواصفات الأجهزة المتوافقة مع راش إكس.'
      : 'Download RASHX product brochures, technical specifications, ZATCA e-invoicing compliance whitepapers, and hardware setup guides.',
    path: '/downloads',
    lang,
  });
}

export default async function DownloadsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const documents = isAr
    ? [
        {
          title: 'الكتيب التعريفي الشامل لمنظومة راش إكس (Brochure)',
          desc: 'شرح مفصل لكافة الأنظمة العشرة، النطاقات الفرعية، وحلول التخصيص والهوية التجارية.',
          size: '3.8 MB PDF',
        },
        {
          title: 'دليل الامتثال والفوترة الإلكترونية للمرحلة الثانية (ZATCA)',
          desc: 'المتطلبات النظامية، نماذج الفواتير المبسطة، وتوجيهات الربط المباشر لهيئة الزكاة والضريبة والجمارك.',
          size: '2.1 MB PDF',
        },
        {
          title: 'دليل الأجهزة المتوافقة وطابعات نقاط البيع (Hardware Guide)',
          desc: 'قائمة طابعات الإيصالات الحرارية، أجهزة الباركود، وشاشات نقاط البيع السحابية المعتمدة.',
          size: '1.9 MB PDF',
        },
        {
          title: 'دليل إعداد ونقل البيانات للصالونات (Migration Checklist)',
          desc: 'قوائم التحقق لاستيراد بيانات العملاء، الخدمات، وأرصدة المخزون القديمة إلى منصة راش إكس.',
          size: '1.2 MB PDF',
        },
      ]
    : [
        {
          title: 'Comprehensive RASHX Platform Brochure',
          desc: 'Complete overview of the 10 operational modules, dedicated subdomains, and white-label capabilities.',
          size: '3.8 MB PDF',
        },
        {
          title: 'ZATCA Phase 2 E-Invoicing Compliance Whitepaper',
          desc: 'Regulatory roadmap, simplified tax invoice schemas, and cryptographic API security specs.',
          size: '2.1 MB PDF',
        },
        {
          title: 'Certified POS Hardware & Terminal Matrix',
          desc: 'Verified thermal receipt printers, barcode scanners, and tablet stands optimized for RASHX.',
          size: '1.9 MB PDF',
        },
        {
          title: 'Data Migration & Onboarding Checklist',
          desc: 'Step-by-step workbook for importing client profiles, price lists, and inventory tallies into RASHX.',
          size: '1.2 MB PDF',
        },
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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <Download className="h-4 w-4" />
                <span>{isAr ? 'الأدلة والكتيبات' : 'Resource Center'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'مركز التحميلات والملفات المعتمدة' : 'Official Downloads & Guides'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'مجموعة متكاملة من الكتيبات الرسمية والأدلة التشغيلية لمساعدتك في كل خطوة'
                  : 'Download official platform specifications, regulatory guides, and hardware documentation'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {documents.map((doc) => (
                <div
                  key={doc.title}
                  className="flex flex-col justify-between rounded-2xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <FileText className="h-6 w-6 text-[#54453D]" />
                      <span className="text-xs font-bold text-[#54453D]/60">{doc.size}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-[#54453D]">{doc.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#54453D]/80">{doc.desc}</p>
                  </div>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#54453D] py-3 text-xs font-bold text-white transition-colors hover:bg-[#3D322C]"
                    >
                      <Download className="h-4 w-4" />
                      <span>{isAr ? 'تحميل الملف' : 'Download Document'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-2xl bg-[#FAF9F8] p-6 text-center">
              <Sparkles className="mx-auto h-5 w-5 text-[#C78360]" />
              <p className="mt-2 text-xs text-[#54453D]/70">
                {isAr
                  ? 'يتم تحديث الكتيبات دورياً لتواكب أحدث المتطلبات النظامية وتحديثات المنظومة في المملكة.'
                  : 'Documentation is periodically refreshed to maintain alignment with Saudi regulations and features.'}
              </p>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

