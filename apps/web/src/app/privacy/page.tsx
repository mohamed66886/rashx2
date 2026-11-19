/**
 * RASHX Privacy Policy Page
 *
 * Dedicated Route: /privacy
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Compliance with the Saudi Personal Data Protection Law (PDPL).
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
      ? 'سياسة الخصوصية وحماية البيانات | RASHX'
      : 'Privacy Policy & Data Protection | RASHX',
    description: isAr
      ? 'سياسة الخصوصية الرسمية لمنظومة RASHX والتزامها بنظام حماية البيانات الشخصية (PDPL) بالمملكة العربية السعودية وعزل بيانات المنشآت.'
      : 'Official RASHX privacy policy detailing compliance with Saudi Personal Data Protection Law (PDPL) and multi-tenant data isolation.',
    path: '/privacy',
    lang,
  });
}

export default async function PrivacyPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const sections = isAr
    ? [
        {
          title: '1. الالتزام بنظام حماية البيانات الشخصية (PDPL)',
          content:
            'تلتزم RASHX بنظام حماية البيانات الشخصية الصادر بالمرسوم الملكي رقم (م/19) وتعديلاته في المملكة العربية السعودية، وتضمن معالجة كافة البيانات المجمعة للأغراض التشغيلية المحددة فقط وفق أعلى معايير الخصوصية.',
        },
        {
          title: '2. البيانات التي نقوم بمعالجتها',
          content:
            'تقتصر البيانات المعالجة على ما يلزم لتشغيل الصالون بكفاءة: بيانات المنشأة ومسؤوليها، سجلات الموظفين والورديات، أرقام هواتف وبيانات حجز العميلات، وتفاصيل الفواتير والمدفوعات الإلكترونية.',
        },
        {
          title: '3. عزل بيانات المنشآت (Tenant Isolation)',
          content:
            'تعتمد المنصة بنية سحابية هرمية تعزل قواعد بيانات وسجلات كل منشأة تماماً عن أي منشأة أخرى؛ بحيث لا يمكن لأي طرف الاطلاع على عميلات أو إيرادات أو أسعار المنشآت المشتركة.',
        },
        {
          title: '4. التشفير وحماية السجلات المالية والضريبية',
          content:
            'تُشفر كافة البيانات أثناء النقل (In-Transit) والتخزين (At-Rest) باستخدام خوارزميات أمنية متقدمة، ويتم حماية أختام الفوترة المشفرة وفق متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).',
        },
        {
          title: '5. حقوق أصحاب البيانات الشخصية',
          content:
            'يحق للمنشأة وعميلاتها الوصول إلى بياناتهم، طلب تصحيحها، أو تصديرها، أو طلب إتلافها بعد انتهاء الغرض النظامي منها وفق ضوابط ولوائح الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا - SDAIA).',
        },
        {
          title: '6. عدم مشاركة أو بيع البيانات',
          content:
            'نلتزم التزاماً قاطعاً بعدم بيع أو تأجير أو مشاركة البيانات الشخصية لأي جهات خارجية أو أطراف دعائية مطلقاً، وتقتصر المعالجة على تقديم الخدمة المتفق عليها فقط.',
        },
      ]
    : [
        {
          title: '1. PDPL Compliance Statement',
          content:
            'RASHX strictly complies with the Saudi Personal Data Protection Law (PDPL) promulgated under Royal Decree No. (M/19), ensuring that all personal data is collected and processed solely for legitimate operational purposes under rigorous safeguards.',
        },
        {
          title: '2. Categories of Processed Data',
          content:
            'Processed data is limited to operational essentials: facility registration information, specialist shift rosters, client contact and appointment preferences, and compliant electronic tax invoice records.',
        },
        {
          title: '3. Multi-Tenant Data Isolation',
          content:
            'Our architecture guarantees strict logical tenant isolation. Each salon’s client profiles, revenue metrics, and commission structures remain strictly inaccessible to other subscriber facilities.',
        },
        {
          title: '4. Encryption & Financial Record Integrity',
          content:
            'All records are encrypted in transit and at rest using modern cryptographic ciphers, and invoice hash records are archived in compliance with ZATCA Phase 2 electronic audit trail standards.',
        },
        {
          title: '5. Data Subject Rights',
          content:
            'Clients and facility owners maintain rights to access, rectify, export, and delete personal data under regulations enacted by the Saudi Data & AI Authority (SDAIA).',
        },
        {
          title: '6. Zero Data Monetization',
          content:
            'RASHX unequivocally never sells, leases, or trades subscriber or client data with third-party advertising networks. Data processing is strictly scoped to delivering platform operations.',
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
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                as="h1"
                eyebrow={isAr ? 'الأمان والخصوصية' : 'DATA PRIVACY & PDPL'}
                title={
                  isAr
                    ? 'سياسة الخصوصية وحماية بيانات المنشآت والعملاء'
                    : 'Privacy Policy & Personal Data Protection Framework'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
                {isAr
                  ? 'ملتزمون بنظام حماية البيانات الشخصية السعودي (PDPL) وعزل البيانات السحابية التام.'
                  : 'Committed to Saudi Personal Data Protection Law (PDPL) and total tenant isolation.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
              {sections.map((section, idx) => (
                <div key={idx} className="rounded-3xl bg-[#FAF9F8] p-6 sm:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-[#54453D] mb-3">
                    {section.title}
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed text-[#75645B]">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

