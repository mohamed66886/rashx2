/**
 * RASHX Cloud Reliability & High Availability Page
 *
 * Dedicated Route: /reliability
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Cloud infrastructure resilience, automated failover, and data redundancy.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Server, ShieldCheck, ArrowLeft, ArrowRight } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'الموثوقية والجاهزية السحابية | RASHX — بنية تحتية عالية الاعتمادية'
      : 'Cloud Reliability & Availability | RASHX — Enterprise Resilient Architecture',
    description: isAr
      ? 'تعرف على معايير الموثوقية العالية في RASHX: استمرارية تشغيل بنسبة 99.9%، نسخ احتياطي لحظي مشفر، وبنية سحابية مقاومة للأعطال.'
      : 'Discover RASHX cloud reliability standards: 99.9% operational availability, automated redundant backups, and zero single points of failure.',
    path: '/reliability',
    lang,
  });
}

export default async function ReliabilityPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const securityHref = (isAr ? routes.security.index : `${routes.security.index}?lang=en`) as Route;
  const platformHref = (isAr ? routes.platform : `${routes.platform}?lang=en`) as Route;

  const pillars = isAr
    ? [
        {
          title: 'جاهزية تشغيل مستمرة 99.9%',
          desc: 'خوادم سحابية موزعة تضمن استمرار عمل نقاط البيع وموقع حجز العميل دون أي توقف في مواسم الذروة والأعياد.',
        },
        {
          title: 'نسخ احتياطي متعدد المستويات',
          desc: 'أرشفة لحظية للعمليات المالية والفواتير الضريبية وقواعد البيانات مع تشفير تام وإمكانية الاسترجاع الفوري.',
        },
        {
          title: 'مقاومة الأعطال والتوسع التلقائي',
          desc: 'بنية خوادم تتوسع تلقائياً مع تزايد عدد الزيارات والحجوزات، مع توجيه ذكي للمرور لتفادي أي بطء في الاستجابة.',
        },
      ]
    : [
        {
          title: '99.9% Operational Uptime',
          desc: 'Distributed cloud clusters guaranteeing uninterrupted POS checkout and online bookings during intense seasonal rushes.',
        },
        {
          title: 'Multi-Layer Redundant Backups',
          desc: 'Real-time encrypted replication of financial ledgers and customer appointments with instant point-in-time recovery.',
        },
        {
          title: 'Fault Tolerance & Auto-Scaling',
          desc: 'Dynamic cloud compute capacity expanding automatically during traffic surges with smart load balancing.',
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
                eyebrow={isAr ? 'الموثوقية والجاهزية' : 'INFRASTRUCTURE RELIABILITY'}
                title={
                  isAr
                    ? 'بنية سحابية صلبة تضمن استمرار أعمال صالونك على مدار الساعة'
                    : 'Resilient Cloud Foundations Powering Your Salon 24/7'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'نعلم أن توقف النظام ولو لدقائق يعني تعطل الاستقبال وضياع المبيعات؛ لذلك بنينا RASHX على خوادم سحابية متطورة توفر أقصى درجات الاستقرار والسرعة.'
                  : 'We know system downtime means frustrated clients and lost revenue. RASHX is engineered for uncompromising availability and low-latency execution.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
                {pillars.map((p, idx) => (
                  <div key={idx} className="rounded-3xl bg-[#FAF9F8] p-7 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#91B8C0]/30 text-[#2C4349] mb-5">
                        <Server className="h-6 w-6 text-[#2C4349]" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-[#54453D] mb-3">{p.title}</h3>
                      <p className="text-sm leading-relaxed text-[#75645B]">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Nav */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={securityHref}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>{isAr ? 'استكشف أمن واستقلالية البيانات' : 'Explore Data Security'}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  href={platformHref}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#FAF9F8] px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30"
                >
                  <span>{isAr ? 'مواصفات المنصة السحابية' : 'Platform Specifications'}</span>
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
