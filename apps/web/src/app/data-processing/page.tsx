/**
 * RASHX Data Processing Agreement (DPA) Page
 *
 * Dedicated Route: /data-processing
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Lock } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'اتفاقية معالجة البيانات (DPA) | RASHX — الامتثال لنظام حماية البيانات الشخصية'
      : 'Data Processing Agreement (DPA) | RASHX — PDPL Compliant Architecture',
    description: isAr
      ? 'اتفاقية معالجة البيانات الرسمية لمنصة راش إكس لضمان الامتثال التام لنظام حماية البيانات الشخصية السعودي (PDPL) والمعايير السحابية.'
      : 'Official Data Processing Agreement governing customer data processing, tenant rights, and PDPL compliance on RASHX.',
    path: '/data-processing',
    lang,
  });
}

export default async function DataProcessingPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const clauses = isAr
    ? [
        {
          title: '1. أطراف الاتفاقية والصفة القانونية',
          content:
            'تحدد هذه الاتفاقية العلاقة بين المنشأة المشتركة بصفتها (المتحكم في البيانات - Data Controller) ومنصة RASHX بصفتها (المعالج للبيانات - Data Processor) وفقاً للأنظمة واللوائح الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).',
        },
        {
          title: '2. طبيعة البيانات المعالجة والغرض منها',
          content:
            'تقتصر معالجة البيانات على المعلومات التشغيلية الضرورية: بيانات الحجوزات، ملفات العملاء، سجلات الخدمات، معاملات نقاط البيع والفوترة، وسجلات الموظفين اللازمة لتقديم وتشغيل خدمات المنظومة.',
        },
        {
          title: '3. الالتزامات والتدابير الأمنية الفنية',
          content:
            'تلتزم RASHX بتطبيق أعلى المعايير الفنية والتنظيمية: تشفير البيانات أثناء النقل (TLS 1.3) وأثناء التخزين (AES-256)، الفصل المنطقي الصارم بين بيانات المشتركين (Multi-Tenant Isolation)، والمراقبة الأمنية المستمرة.',
        },
        {
          title: '4. استضافة البيانات داخل المملكة',
          content:
            'تتم استضافة كافة قواعد البيانات والنسخ الاحتياطية داخل مراكز بيانات سحابية معتمدة ومتطورة جغرافياً داخل حدود المملكة العربية السعودية بما يتوافق مع السياسات الوطنية لسيادة البيانات.',
        },
        {
          title: '5. حقوق أصحاب البيانات الشخصية',
          content:
            'توفر المنظومة للمنشآت أدوات رقمية تمكّنها من الاستجابة الفورية لطلبات عملائها بموجب النظام: الوصول إلى البيانات، تصحيحها، تحديثها، أو محوها عند انتهاء الغرض النظامي لمعالجتها.',
        },
        {
          title: '6. حذف البيانات وإنهاء الاشتراك',
          content:
            'عند انتهاء الاشتراك، تتيح RASHX للمنشأة تصدير كامل بياناتها التشغيلية والمالية بصيغ معيارية، ثم يتم إتلاف وحذف السجلات وفق دورة الاحتفاظ النظامية المعتمدة.',
        },
      ]
    : [
        {
          title: '1. Roles & Legal Capacities',
          content:
            'This agreement governs the relationship between the subscriber salon as Data Controller and RASHX as Data Processor in adherence to SDAIA regulations and the Saudi PDPL.',
        },
        {
          title: '2. Scope & Categories of Processed Data',
          content:
            'Processing is limited strictly to operational datasets: bookings, customer profiles, POS invoices, inventory movements, and staff shift records essential for platform execution.',
        },
        {
          title: '3. Technical & Organizational Safeguards',
          content:
            'RASHX implements enterprise-grade technical safeguards including end-to-end TLS 1.3 in-transit encryption, AES-256 rest encryption, strict multi-tenant logical partitioning, and continuous anomaly auditing.',
        },
        {
          title: '4. In-Kingdom Data Sovereignty',
          content:
            'All tenant databases, audit trails, and automated backups are physically hosted inside certified tier-IV data centers located within the Kingdom of Saudi Arabia.',
        },
        {
          title: '5. Data Subject Rights Fulfillment',
          content:
            'The platform delivers embedded self-service workflows enabling tenants to honor customer rights under the law: right to access, rectify, export, and delete records seamlessly.',
        },
        {
          title: '6. Data Return & Secure Purging',
          content:
            'Upon subscription cessation, subscribers can export their entire operational archive in open standards, after which data is purged following scheduled retention policies.',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/data-processing" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#91B8C0]/30 px-3 py-1 text-xs font-semibold text-[#2C4349]">
                <Lock className="h-4 w-4" />
                <span>{isAr ? 'سيادة وحماية البيانات' : 'Data Privacy & Sovereignty'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'اتفاقية معالجة البيانات (DPA)' : 'Data Processing Agreement'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'التزامات المعالجة السحابية والحماية الفنية المتوافقة مع نظام حماية البيانات الشخصية السعودي (PDPL)'
                  : 'Contractual technical provisions ensuring PDPL alignment and multi-tenant security architecture'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              {clauses.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8 transition-colors duration-200"
                >
                  <h2 className="text-lg font-bold text-[#54453D] sm:text-xl">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80 sm:text-base">
                    {item.content}
                  </p>
                </article>
              ))}

              <div className="rounded-2xl bg-[#91B8C0]/20 p-6 text-center sm:p-8">
                <p className="text-sm font-semibold text-[#2C4349]">
                  {isAr
                    ? 'مسؤول حماية البيانات (DPO): dpo@rashx.org · المملكة العربية السعودية · الرياض'
                    : 'Data Protection Officer (DPO): dpo@rashx.org · Riyadh, Kingdom of Saudi Arabia'}
                </p>
              </div>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

