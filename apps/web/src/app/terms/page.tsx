/**
 * RASHX Terms of Service Page
 *
 * Dedicated Route: /terms
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Authoritative SaaS terms of use governed by Saudi Arabian law.
 */

import { PageJsonLd } from '@/components/seo';
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
      ? 'شروط الاستخدام وأحكام الاشتراك | RASHX'
      : 'Terms of Service & Subscription Conditions | RASHX',
    description: isAr
      ? 'الشروط والأحكام الرسمية المنظمة لاستخدام منصة RASHX والخدمات السحابية والاشتراكات للصالونات ومراكز التجميل في المملكة العربية السعودية.'
      : 'Official terms of service governing subscription and use of the RASHX cloud platform under the laws of the Kingdom of Saudi Arabia.',
    path: '/terms',
    lang,
  });
}

export default async function TermsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const sections = isAr
    ? [
        {
          title: '1. تمهيد والتعريفات',
          content:
            'تسري هذه الشروط والأحكام على كافة المنشآت والاشتراكات في منصة RASHX (راش إكس)، وهي منصة سحابية متخصصة في إدارة وتشغيل الصالونات ومراكز التجميل والسبا، تأسست عام 2026 على يد المهندس محمد عبده رشاد البهي بالمملكة العربية السعودية.',
        },
        {
          title: '2. حساب المنشأة والنطاق الفرعي',
          content:
            'تمنح المنصة كل منشأة مساحة سحابية مستقلة تعمل تحت نطاق فرعي معتمد ([salon].rashx.org). تلتزم المنشأة بالحفاظ على سرية بيانات تسجيل الدخول وتحديد صلاحيات المستخدمين والكوادر وفق أدوارهم التشغيلية.',
        },
        {
          title: '3. الالتزام بالأنظمة والفوترة الضريبية (ZATCA)',
          content:
            'تلتزم المنشأة بإدخال بياناتها الضريبية الصحيحة وقيم الخدمات والمنتجات المعتمدة. توفر المنصة بنية متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك لإصدار الفواتير الضريبية المبسطة، وتتحمل المنشأة مسؤولية دقة البيانات المدخلة.',
        },
        {
          title: '4. الملكية الفكرية وحقوق الاستخدام',
          content:
            'تظل كافة البرمجيات، الواجهات، الأكواد، والعلامات التجارية لـ RASHX ملكية حصرية للمنصة. تحتفظ المنشأة بكامل ملكية وحقوق بياناتها التشغيلية، وسجلات عملائها، وشعارها وهويتها التجارية الخاصة.',
        },
        {
          title: '5. استمرارية الخدمة والنسخ الاحتياطي',
          content:
            'تحرص RASHX على توفير أعلى معايير الجاهزية والاعتمادية السحابية بنسبة تشغيل مرتفعة، مع إجراء نسخ احتياطي دوري مشفر للبيانات لضمان استمرارية أعمال المنشأة دون أي انقطاع.',
        },
        {
          title: '6. القانون الواجب التطبيق وحل النزاعات',
          content:
            'تخضع هذه الاتفاقية وتُفسر وفقاً للأنظمة واللوائح السارية في المملكة العربية السعودية، وتختص المحاكم السعودية بالنظر في أي نزاع قد ينشأ عن تنفيذها.',
        },
      ]
    : [
        {
          title: '1. Preamble & Definitions',
          content:
            'These terms govern all subscriptions and services provided by RASHX, a cloud operating platform specialized in beauty salons and spas, founded in 2026 by Eng. Mohamed Abdo Rashad El-Bahy in Saudi Arabia.',
        },
        {
          title: '2. Facility Accounts & Subdomains',
          content:
            'Each subscriber facility is allocated an isolated cloud workspace operating on an approved subdomain ([salon].rashx.org). The facility is solely responsible for credential confidentiality and internal role-based access management.',
        },
        {
          title: '3. Regulatory & ZATCA E-Invoicing Compliance',
          content:
            'The subscriber must provide accurate tax and commercial registration data. RASHX generates compliant electronic invoices under ZATCA guidelines; the subscriber remains legally liable for submitted tax data accuracy.',
        },
        {
          title: '4. Intellectual Property & Data Ownership',
          content:
            'All software engines, algorithms, and RASHX trademarks are proprietary assets. The subscriber facility retains complete ownership and rights over customer profiles, financial transaction logs, and brand assets.',
        },
        {
          title: '5. Service Continuity & Redundancy',
          content:
            'RASHX strives for maximum platform availability through resilient cloud infrastructure and encrypted daily backups, ensuring business continuity without operational interruptions.',
        },
        {
          title: '6. Governing Law & Jurisdiction',
          content:
            'These terms are governed by and construed in accordance with the applicable laws and regulations of the Kingdom of Saudi Arabia, and competent Saudi courts hold jurisdiction over disputes.',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/terms" lang={lang} />
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
                eyebrow={isAr ? 'الاتفاقية الرسمية' : 'TERMS OF SERVICE'}
                title={
                  isAr
                    ? 'شروط الاستخدام وأحكام الاشتراك السحابي في RASHX'
                    : 'Terms of Use & SaaS Subscription Agreement'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
                {isAr
                  ? 'آخر تحديث: 2026. يرجى قراءة هذه البنود بعناية لضمان استخدام آمن وممتثل للمنظومة.'
                  : 'Last updated: 2026. Please read these provisions carefully to ensure compliant and secure operations.'}
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
      </div>

      <Footer lang={lang} />
    </div>
  );
}

