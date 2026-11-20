/**
 * RASHX Compliance Hub Page
 *
 * Dedicated Route: /compliance
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Overview of regulatory, ZATCA, and tax compliance frameworks.
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
import { ShieldCheck, ArrowLeft, ArrowRight, QrCode } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'الامتثال والفوترة الإلكترونية | RASHX — اعتماد هيئة الزكاة والضريبة والجمارك'
      : 'Regulatory Compliance & ZATCA | RASHX E-Invoicing Certified Framework',
    description: isAr
      ? 'مركز الامتثال الرسمي لمنظومة RASHX: الفوترة الإلكترونية المعتمدة للمرحلة الثانية (الربط والتكامل) لقطاع الصالونات ومراكز التجميل في السعودية.'
      : 'Official compliance hub for RASHX: certified ZATCA Phase 2 e-invoicing integration for beauty salons and spas across Saudi Arabia.',
    path: '/compliance',
    lang,
  });
}

export default async function ComplianceHubPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const eInvoicingHref = (isAr ? routes.compliance.eInvoicing : `${routes.compliance.eInvoicing}?lang=en`) as Route;
  const securityHref = (isAr ? routes.security.index : `${routes.security.index}?lang=en`) as Route;

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/compliance" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                as="h1"
                eyebrow={isAr ? 'الامتثال والتوافق النظامي' : 'REGULATORY COMPLIANCE'}
                title={
                  isAr
                    ? 'منظومة سحابية متوافقة بالكامل مع المتطلبات التنظيمية في المملكة'
                    : 'Fully Aligned with Saudi Regulatory & ZATCA Mandates'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'صُممت RASHX لتمنح أصحاب الصالونات ومراكز التجميل والسبا راحة بال تامة؛ من خلال اعتماد الفوترة الإلكترونية للمرحلة الثانية، وحماية البيانات وفق لوائح سدايا وهيئة الزكاة.'
                  : 'Engineered to grant salon owners total operational peace of mind with ZATCA Phase 2 clearance, simplified tax invoices, and SDAIA personal data compliance.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* E-Invoicing Card */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0C5AE]/40 text-[#54453D] mb-6">
                    <QrCode className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-3">
                    {isAr ? 'الفوترة الإلكترونية (ZATCA)' : 'ZATCA E-Invoicing Phase 2'}
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed text-[#75645B] mb-6">
                    {isAr
                      ? 'توليد فوري للفواتير الضريبية المبسطة برمز QR مشفر وأختام التشفير الرقمي مع الربط المباشر مع منصة «فاتورة» التابعة للهيئة.'
                      : 'Compliant simplified tax invoices with cryptographic QR codes, tamper-proof hashes, and direct API clearance with ZATCA’s Fatoora platform.'}
                  </p>
                </div>
                <Link
                  href={eInvoicingHref}
                  className="inline-flex items-center justify-between rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#54453D] hover:bg-[#F0C5AE]/30 transition-colors duration-200"
                >
                  <span>{isAr ? 'تفاصيل اعتماد الفوترة' : 'Explore E-Invoicing Details'}</span>
                  <ArrowIcon className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
                </Link>
              </div>

              {/* Security & Tenant Isolation Card */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#91B8C0]/30 text-[#2C4349] mb-6">
                    <ShieldCheck className="h-6 w-6 text-[#2C4349]" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-3">
                    {isAr ? 'أمن واستقلالية البيانات' : 'Security & Tenant Isolation'}
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed text-[#75645B] mb-6">
                    {isAr
                      ? 'بيئة برمجية سحابية مستقلة لكل منشأة تمنع التداخل وتضمن تشفيراً شاملاً لكافة السجلات المالية والعملاء وفق نظام (PDPL).'
                      : 'Rigorous multi-tenant logical isolation ensuring complete encryption of client profiles and financials under Saudi PDPL regulations.'}
                  </p>
                </div>
                <Link
                  href={securityHref}
                  className="inline-flex items-center justify-between rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#54453D] hover:bg-[#F0C5AE]/30 transition-colors duration-200"
                >
                  <span>{isAr ? 'استكشف معايير الأمان' : 'Explore Security Standards'}</span>
                  <ArrowIcon className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
