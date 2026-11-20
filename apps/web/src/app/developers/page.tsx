/**
 * RASHX Developer Portal Page
 *
 * Dedicated Route: /developers
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
import { Code, Cpu, Server, ArrowLeft, ArrowRight } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'بوابة المطورين والربط التقني | RASHX — واجهات برمجية متطورة'
      : 'Developer Portal & Platform Architecture | RASHX — Open APIs & Webhooks',
    description: isAr
      ? 'استكشف واجهات برمجة التطبيقات (APIs)، الويب هوك، وحزم التكامل التقني لربط منصة راش إكس مع أنظمة الدفع وبوابات الرسائل.'
      : 'Explore RASHX RESTful APIs, Webhooks, and SDK integrations powering bespoke beauty salon and enterprise spa applications.',
    path: '/developers',
    lang,
  });
}

export default async function DevelopersPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const apiHref = (isAr ? routes.developers.api : `${routes.developers.api}?lang=en`) as Route;
  const integrationsHref = (isAr ? routes.integrations : `${routes.integrations}?lang=en`) as Route;

  const capabilities = isAr
    ? [
        {
          title: 'واجهات برمجة RESTful سريعة',
          desc: 'وصول موثوق ومحمي بمفاتيح API لإدارة بيانات المواعيد، العملاء، الخدمات، والمنتجات بسرعة استجابة تقل عن 50ms.',
          icon: Code,
        },
        {
          title: 'أحداث الويب هوك اللحظية (Webhooks)',
          desc: 'إشعارات برمجية فورية عند إنشاء حجز جديد، سداد فاتورة، تحديث رصيد المخزون، أو تعديل حالة موظف.',
          icon: Cpu,
        },
        {
          title: 'تكامل بوابات الدفع وأجهزة POS',
          desc: 'دعم المعايير المعتمدة في المملكة (مدى، Apple Pay، وسداد) وربط مباشر مع طابعات الإيصالات وأجهزة نقاط البيع السحابية.',
          icon: Server,
        },
      ]
    : [
        {
          title: 'High-Throughput REST APIs',
          desc: 'Secure API token authentication for querying appointments, customers, services, and inventory balances under 50ms latency.',
          icon: Code,
        },
        {
          title: 'Real-Time Event Webhooks',
          desc: 'Instant event notifications triggered on appointment confirmations, POS transactions, stock alerts, and staff rosters.',
          icon: Cpu,
        },
        {
          title: 'Payment Gateway & Terminal Bridges',
          desc: 'Seamless integration with Saudi payment networks (Mada, Apple Pay, Sadad) and cloud thermal receipt printers.',
          icon: Server,
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/developers" lang={lang} />
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
                <span>{isAr ? 'بنية المطورين والربط التقني' : 'Developer Ecosystem'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'بوابة المطورين والربط السحابي' : 'RASHX Developer Platform'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'أدوات تقنية وواجهات برمجية حديثة تمنح المهندسين والشركاء القدرة على بناء تكاملات قوية وموثوقة'
                  : 'Robust API primitives and developer tooling enabling enterprise integrations and custom extensions'}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={apiHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3D322C]"
                >
                  <span>{isAr ? 'مرجع واجهات البرمجة (API Docs)' : 'API Reference'}</span>
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  href={integrationsHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-6 py-3 text-sm font-semibold text-[#54453D] transition-colors hover:bg-[#E8DFD8]"
                >
                  <span>{isAr ? 'دليل التكاملات المعتمدة' : 'Verified Integrations'}</span>
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {capabilities.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex flex-col rounded-2xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                  >
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#2C4349] text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#54453D]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80">{item.desc}</p>
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

