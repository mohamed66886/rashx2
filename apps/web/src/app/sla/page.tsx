/**
 * RASHX Service Level Agreement (SLA) Page
 *
 * Dedicated Route: /sla
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Authoritative cloud platform SLA commitments and uptime guarantees.
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
      ? 'اتفاقية مستوى الخدمة (SLA) | RASHX'
      : 'Service Level Agreement (SLA) | RASHX',
    description: isAr
      ? 'اتفاقية مستوى الخدمة الرسمية لمنظومة RASHX: ضمانات الجاهزية بنسبة 99.9%، زمن الاستجابة للدعم الفني، وخطط استمرارية الأعمال.'
      : 'Official RASHX SLA: 99.9% cloud availability commitments, priority support response times, and business continuity guarantees.',
    path: '/sla',
    lang,
  });
}

export default async function SLAPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const slaCommitments = isAr
    ? [
        {
          title: '1. ضمان الجاهزية السحابية 99.9%',
          desc: 'تلتزم المنصة بتوفير نسبة توفر تشغيلي لا تقل عن 99.9% لخدمات نقاط البيع، وبوابة حجز العميل، ولوحة التحكم الإدارية شهرياً.',
        },
        {
          title: '2. فترات الصيانة المجدولة',
          desc: 'تُجرى أي تحديثات بنيوية كبرى في ساعات الفجر الهادئة مع إشعار مسبق لإدارة المنشأة بوقت كافٍ لتفادي أي تأثير على العمليات.',
        },
        {
          title: '3. أوقات الاستجابة للدعم الفني',
          desc: 'يتوفر دعم فني مباشر للبلاغات الحرجة (مثل تعطل الكاشير) بزمن استجابة فوري لا يتجاوز 15 دقيقة لضمان استمرار مبيعاتك.',
        },
        {
          title: '4. استعادة البيانات في الكوارث (RTO / RPO)',
          desc: 'نسخ احتياطي فوري متكرر يضمن هدف استرجاع للبيانات (RPO) لا يتجاوز دقائق معدودة في الحالات الطارئة.',
        },
      ]
    : [
        {
          title: '1. 99.9% Uptime Commitment',
          desc: 'RASHX commits to maintaining at least 99.9% operational availability for POS, customer booking, and administrative modules monthly.',
        },
        {
          title: '2. Scheduled Maintenance Windows',
          desc: 'Major infrastructural maintenance occurs during off-peak overnight hours with advance notice to avoid interfering with salon rush hours.',
        },
        {
          title: '3. Technical Support Response SLAs',
          desc: 'Critical cashier and payment blocking incidents receive immediate support with response times under 15 minutes.',
        },
        {
          title: '4. Disaster Recovery (RTO / RPO)',
          desc: 'Automated replication guarantees a recovery point objective (RPO) within minutes under disaster failover scenarios.',
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
                eyebrow={isAr ? 'اتفاقية مستوى الخدمة' : 'SERVICE LEVEL AGREEMENT'}
                title={
                  isAr
                    ? 'التزامات الجاهزية واستمرارية التشغيل السحابي لـ RASHX'
                    : 'Uptime Commitments & Operational Availability Guarantees'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
                {isAr
                  ? 'معايير واضحة تضمن استقرار عمليات منشأتك المالية والتشغيلية بأعلى موثوقية.'
                  : 'Clear operational commitments ensuring your salon runs smoothly with enterprise resilience.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
              {slaCommitments.map((s, idx) => (
                <div key={idx} className="rounded-3xl bg-[#FAF9F8] p-6 sm:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-[#54453D] mb-2">{s.title}</h2>
                  <p className="text-sm sm:text-base leading-relaxed text-[#75645B]">{s.desc}</p>
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

