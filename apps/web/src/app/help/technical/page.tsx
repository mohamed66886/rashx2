/**
 * RASHX Technical Guides & Integration Troubleshooting Page
 *
 * Dedicated Route: /help/technical
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Cpu, Server, ShieldCheck, Printer } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'الدليل التقني وإرشادات التكامل | RASHX Technical Help'
      : 'Technical Support & Integration Guides | RASHX',
    description: isAr
      ? 'حلول المشكلات التقنية، إعدادات طابعات الفواتير، تكاملات بوابات الدفع، وإعدادات شبكة الصالون.'
      : 'Technical troubleshooting, hardware bridge configurations, payment terminal setups, and network diagnostics for RASHX.',
    path: '/help/technical',
    lang,
  });
}

export default async function TechnicalHelpPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const topics = isAr
    ? [
        {
          title: 'إعداد طابعات الإيصالات الحرارية (Thermal Printers)',
          desc: 'ربط طابعات ESC/POS عبر الشبكة المحلية (LAN/Wi-Fi) أو البلوتوث لطباعة الفواتير الضريبية ذات الرمز المشفر.',
          icon: Printer,
        },
        {
          title: 'تهيئة النطاقات الفرعية وشهادات الأمان (SSL/DNS)',
          desc: 'ربط النطاق المعتمد للمنشأة وتفعيل شهادات التشفير التلقائية لضمان تصفح آمن لعملائك.',
          icon: Server,
        },
        {
          title: 'الربط السحابي ومرحلة التكامل مع ZATCA',
          desc: 'تثبيت شهادات التشفير الرقمية (CSID) وإجراء اختبارات التوافق مع منصة الفاتورة الإلكترونية الوطنية.',
          icon: ShieldCheck,
        },
        {
          title: 'إعداد قارئات الباركود وأجهزة الدفع المحمولة',
          desc: 'تهيئة الماسحات الضوئية للمنتجات وأجهزة مدى عبر البلوتوث لتسريع وتيرة عمليات البيع والمخزون.',
          icon: Cpu,
        },
      ]
    : [
        {
          title: 'Thermal ESC/POS Printer Bridge Configuration',
          desc: 'Connecting thermal receipt printers via local Wi-Fi or Bluetooth for immediate ZATCA QR-code printing.',
          icon: Printer,
        },
        {
          title: 'Subdomain DNS & Automated SSL Provisioning',
          desc: 'Mapping your facility custom domain and managing end-to-end TLS encryption certificates.',
          icon: Server,
        },
        {
          title: 'ZATCA Cryptographic Stamp & CSID Setup',
          desc: 'Installing cryptographic client certificates and running end-to-end sandbox tax validation tests.',
          icon: ShieldCheck,
        },
        {
          title: 'Barcode Scanners & Mada POS Terminals',
          desc: 'Configuring wireless handheld scanners and Bluetooth payment terminals for expedited checkouts.',
          icon: Cpu,
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/help/technical" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2C4349]/10 px-3 py-1 text-xs font-semibold text-[#2C4349]">
                <Cpu className="h-4 w-4" />
                <span>{isAr ? 'الدعم الفني والربط' : 'Technical Support'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'الدليل التقني وإرشادات التكامل' : 'Technical Integration & Hardware'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'إرشادات هندسية للمهندسين ومديري التقنية لتهيئة بيئة التشغيل السحابية والأجهزة المتوافقة'
                  : 'Engineering blueprints and troubleshooting steps for IT managers configuring RASHX hardware'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {topics.map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.title}
                    className="flex flex-col justify-between rounded-2xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                  >
                    <div>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#2C4349] text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-[#54453D]">{t.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#54453D]/80">{t.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

