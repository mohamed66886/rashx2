/**
 * RASHX Acceptable Use Policy Page
 *
 * Dedicated Route: /acceptable-use
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ShieldCheck } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'سياسة الاستخدام المقبول | RASHX — ضوابط استخدام المنظومة السحابية'
      : 'Acceptable Use Policy | RASHX — Cloud Operating Platform Guidelines',
    description: isAr
      ? 'ضوابط وسياسات الاستخدام العادل والمقبول للبنية السحابية لمنصة راش إكس للصالونات ومراكز التجميل في السعودية.'
      : 'Acceptable use guidelines governing subscriber conduct, security, and cloud infrastructure usage on RASHX.',
    path: '/acceptable-use',
    lang,
  });
}

export default async function AcceptableUsePage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const articles = isAr
    ? [
        {
          title: '1. الغرض ونطاق السياسة',
          content:
            'تهدف هذه السياسة إلى تحديد المعايير السلوكية والتشغيلية المقبولة عند استخدام منصة RASHX وبنيتها التحتية السحابية لضمان استقرار وأمان كافة المنشآت المشتركة وعملائها في المملكة العربية السعودية.',
        },
        {
          title: '2. الاستخدام المصرح به',
          content:
            'تُستخدم المنظومة حصرياً لإدارة العمليات التشغيلية، الحجوزات، المبيعات، الفوترة الضريبية، شؤون الموظفين، والمخزون للصالونات ومراكز التجميل والسبا المرخصة وفق الأنظمة التجارية السارية.',
        },
        {
          title: '3. السلوكيات المحظورة أمنياً وتشغيلياً',
          content:
            'يُحظر تماماً أي محاولة لإجراء فحوصات اختراق غير مصرح بها، أو إرسال رسائل ترويجية مزعجة (Spam) عبر قنوات الإشعارات، أو استغلال واجهات المنظومة في أي أنشطة تتنافى مع الأنظمة السعودية أو تضر بسلامة الشبكة.',
        },
        {
          title: '4. حماية بيانات العملاء وخصوصيتهم',
          content:
            'تلتزم المنشأة باستخدام بيانات العملاء المدخلة في النظام لأغراض تقديم الخدمات المباشرة والتواصل المشروع فقط، مع الالتزام التام بنظام حماية البيانات الشخصية المعمول به في المملكة.',
        },
        {
          title: '5. الاستخدام العادل للموارد السحابية',
          content:
            'تخضع سعات التخزين ومعدلات استدعاء واجهات البرمجة (APIs) لسياسة الاستخدام العادل لضمان أداء فائق ومستقر لجميع المشتركين دون تأخير أو استهلاك مفرط غير مبرر.',
        },
        {
          title: '6. التدابير عند مخالفة السياسة',
          content:
            'تحتفظ RASHX بالحق في تقييد أو تعليق وصول أي حساب ينتهك هذه الضوابط بعد إشعار مسبق، أو فورياً في الحالات الأمنية الحرجة التي تهدد أمن البيانات والمنظومة.',
        },
      ]
    : [
        {
          title: '1. Purpose & Scope',
          content:
            'This policy outlines acceptable operational and behavioral standards across RASHX cloud infrastructure to safeguard system resilience and tenant security across Saudi Arabia.',
        },
        {
          title: '2. Authorized Business Use',
          content:
            'The platform is dedicated solely to licensed salon, spa, and beauty center management including scheduling, point-of-sale, inventory, ZATCA e-invoicing, and workforce administration.',
        },
        {
          title: '3. Prohibited Conduct',
          content:
            'Subscribers must not perform unauthorized security testing, dispatch unsolicited marketing messages, or misuse platform APIs in ways that compromise service integrity or violate Saudi regulations.',
        },
        {
          title: '4. Customer Privacy & Compliance',
          content:
            'Tenant facilities must handle end-user customer data strictly for legitimate service delivery, fully adhering to the Saudi Personal Data Protection Law (PDPL).',
        },
        {
          title: '5. Fair Resource Consumption',
          content:
            'Cloud storage, bandwidth, and API request quotas are governed by fair use principles to guarantee sustained high performance for all multi-tenant nodes.',
        },
        {
          title: '6. Enforcement & Remedies',
          content:
            'RASHX reserves the right to suspend or terminate tenant accounts engaging in non-compliant actions after due notification, or immediately in critical security events.',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/acceptable-use" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/30 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <ShieldCheck className="h-4 w-4" />
                <span>{isAr ? 'ضوابط وأمن المنظومة' : 'Platform Governance'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'سياسة الاستخدام المقبول' : 'Acceptable Use Policy'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'معايير الاستخدام العادل والمسؤول للبنية الرقمية والخدمات السحابية لمنصة راش إكس'
                  : 'Operational and governance guidelines ensuring security, fairness, and compliance across RASHX'}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#54453D]/60">
                <span>{isAr ? 'الإصدار المعتمد: 1.0 (2026)' : 'Approved Version: 1.0 (2026)'}</span>
                <span>•</span>
                <span>{isAr ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}</span>
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              {articles.map((item) => (
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

              <div className="rounded-2xl bg-[#F0C5AE]/20 p-6 text-center sm:p-8">
                <p className="text-sm font-semibold text-[#54453D]">
                  {isAr
                    ? 'لأي استفسارات قانونية أو بلاغات تتعلق بالاستخدام، تواصل مع فريق الامتثال عبر legal@rashx.org'
                    : 'For legal or compliance inquiries regarding platform policies, contact legal@rashx.org'}
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

