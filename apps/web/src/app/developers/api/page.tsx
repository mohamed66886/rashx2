/**
 * RASHX API Documentation & Webhooks Page
 *
 * Dedicated Route: /developers/api
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Code, Key, ShieldCheck } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'توثيق واجهات البرمجة والويب هوك | RASHX API'
      : 'API Reference & Webhook Endpoints | RASHX API',
    description: isAr
      ? 'دليل التوثيق الفني لواجهات برمجة RASHX السحابية، نماذج الطلبات والاستجابة، وطرق المصادقة الآمنة.'
      : 'Technical API documentation, request schemas, authentication tokens, and webhook payloads for RASHX.',
    path: '/developers/api',
    lang,
  });
}

export default async function ApiReferencePage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const endpoints = isAr
    ? [
        {
          method: 'GET',
          path: '/v1/appointments',
          desc: 'استعلام عن قائمة الحجوزات اليومية والمستقبلية لفرع محدد مع تصفية حسب مقدم الخدمة أو الحالة.',
        },
        {
          method: 'POST',
          path: '/v1/appointments',
          desc: 'إنشاء حجز جديد، تخصيص الأخصائي، والتحقق التلقائي من عدم وجود تعارض في الجداول الزمنية.',
        },
        {
          method: 'GET',
          path: '/v1/customers',
          desc: 'البحث في قاعدة بيانات العملاء، استرجاع سجل الزيارات، رصيد نقاط الولاء، والملاحظات الخاصة.',
        },
        {
          method: 'POST',
          path: '/v1/invoices/zatca',
          desc: 'توليد فاتورة ضريبية مبسطة متوافقة مع المرحلة الثانية لـ ZATCA متضمنة ختم التشفير ورمز الاستجابة السريعة (QR).',
        },
        {
          method: 'GET',
          path: '/v1/inventory/stock',
          desc: 'مراقبة أرصدة المنتجات والمواد الاستهلاكية وتنبيهات انخفاض المخزون في مستودعات الفروع.',
        },
      ]
    : [
        {
          method: 'GET',
          path: '/v1/appointments',
          desc: 'Query appointments roster for a branch with filters by stylist, status, or date intervals.',
        },
        {
          method: 'POST',
          path: '/v1/appointments',
          desc: 'Create an appointment, lock slot allocations, and resolve schedule collisions automatically.',
        },
        {
          method: 'GET',
          path: '/v1/customers',
          desc: 'Retrieve customer profiles, visit history, loyalty balance, and preferences securely.',
        },
        {
          method: 'POST',
          path: '/v1/invoices/zatca',
          desc: 'Emit ZATCA Phase 2 compliant simplified electronic tax invoices with ECDSA cryptographic signatures and QR codes.',
        },
        {
          method: 'GET',
          path: '/v1/inventory/stock',
          desc: 'Monitor branch consumable levels and retrieve automated replenishment threshold alerts.',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/developers/api" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2C4349]/10 px-3 py-1 text-xs font-semibold text-[#2C4349]">
                <Code className="h-4 w-4" />
                <span>{isAr ? 'واجهات REST السحابية' : 'REST API v1.0'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'توثيق واجهات البرمجة (API Reference)' : 'RASHX API Reference'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'واجهات برمجية قياسية تعتمد معيار JSON ومحمية بمفاتيح Bearer Token مع تشفير TLS 1.3'
                  : 'JSON-driven enterprise endpoints authenticated via Bearer tokens over end-to-end TLS 1.3'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-[#54453D]" />
                  <h3 className="text-base font-bold text-[#54453D]">
                    {isAr ? 'المصادقة والأمان' : 'Authentication & Security'}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#54453D]/80">
                  {isAr
                    ? 'يتم تمرير مفتاح الواجهة البرمجية في ترويسة الطلب: Authorization: Bearer rx_live_...'
                    : 'Pass your facility production API key in the request header: Authorization: Bearer rx_live_...'}
                </p>
              </div>

              <div className="space-y-4">
                {endpoints.map((ep) => (
                  <div
                    key={ep.path + ep.method}
                    className="rounded-2xl bg-[#FAF9F8] p-6 transition-colors duration-200"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                          ep.method === 'GET'
                            ? 'bg-[#91B8C0] text-[#2C4349]'
                            : 'bg-[#54453D] text-white'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <code className="text-sm font-semibold text-[#54453D]">{ep.path}</code>
                    </div>
                    <p className="mt-3 text-sm text-[#54453D]/80">{ep.desc}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-[#91B8C0]/20 p-6 text-center sm:p-8">
                <ShieldCheck className="mx-auto h-6 w-6 text-[#2C4349]" />
                <p className="mt-2 text-sm font-semibold text-[#2C4349]">
                  {isAr
                    ? 'لطلب بيئة الاختبار (Sandbox) ومفاتيح التطوير: api@rashx.org'
                    : 'To request a sandbox environment and staging keys: api@rashx.org'}
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

