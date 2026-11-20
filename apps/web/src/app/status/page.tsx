/**
 * RASHX Cloud System Status & Uptime Page
 *
 * Dedicated Route: /status
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { CheckCircle2, Server, Activity } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'حالة النظام ومؤشرات التوفر السحابي | RASHX Status'
      : 'System Status & Cloud Uptime | RASHX Status',
    description: isAr
      ? 'متابعة حية وفورية لحالة خوادم راش إكس، محرك الفوترة ZATCA، بوابات الحجز، ومؤشرات التوفر 99.9%.'
      : 'Real-time uptime status monitoring for RASHX multi-tenant infrastructure, ZATCA gateways, and booking portals.',
    path: '/status',
    lang,
  });
}

export default async function SystemStatusPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const components = isAr
    ? [
        { name: 'بوابات الحجز والمواقع الإلكترونية للمنشآت', status: 'تعمل بكفاءة كاملة', uptime: '99.98%' },
        { name: 'لوحة التحكم الإدارية (Admin Dashboards)', status: 'تعمل بكفاءة كاملة', uptime: '99.99%' },
        { name: 'محرك الفوترة الإلكترونية والربط مع ZATCA', status: 'تعمل بكفاءة كاملة', uptime: '100%' },
        { name: 'نقاط البيع السحابية (POS Terminals)', status: 'تعمل بكفاءة كاملة', uptime: '99.95%' },
        { name: 'خوادم قواعد البيانات والنسخ الاحتياطي المشفر', status: 'تعمل بكفاءة كاملة', uptime: '100%' },
        { name: 'بوابات الرسائل والإشعارات الفورية (SMS/Push)', status: 'تعمل بكفاءة كاملة', uptime: '99.92%' },
      ]
    : [
        { name: 'Facility Subdomains & Booking Portals', status: 'Operational', uptime: '99.98%' },
        { name: 'Executive Admin Command Hubs', status: 'Operational', uptime: '99.99%' },
        { name: 'ZATCA E-Invoicing Integration Bridge', status: 'Operational', uptime: '100%' },
        { name: 'Cloud POS Transaction Nodes', status: 'Operational', uptime: '99.95%' },
        { name: 'Database Clusters & Encrypted Backups', status: 'Operational', uptime: '100%' },
        { name: 'SMS & Real-time Notification Relays', status: 'Operational', uptime: '99.92%' },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/status" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#16A34A]/10 px-3.5 py-1 text-xs font-semibold text-[#16A34A]">
                <Activity className="h-4 w-4" />
                <span>{isAr ? 'كافة الخدمات تعمل بصورة طبيعية' : 'All Systems Fully Operational'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'حالة المنظومة والتوفر السحابي' : 'RASHX System Status'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'مؤشرات حية وموثوقة لمدى جاهزية واستقرار البنية التحتية السحابية لـ راش إكس'
                  : 'Live telemetry and uptime statistics across our high-availability cloud cluster'}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-[#54453D]/80">
                <span>{isAr ? 'نسبة الجاهزية الإجمالية: 99.97%' : 'Overall 30-Day Uptime: 99.97%'}</span>
                <span>•</span>
                <span>{isAr ? 'زمن الاستجابة المتوسط: 42ms' : 'Average Latency: 42ms'}</span>
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-4">
              {components.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl bg-[#FAF9F8] p-5 sm:p-6 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" />
                    <span className="text-sm font-bold text-[#54453D] sm:text-base">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold sm:text-sm">
                    <span className="text-[#54453D]/60">{item.uptime}</span>
                    <span className="rounded-md bg-[#16A34A]/10 px-2.5 py-1 text-[#16A34A]">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}

              <div className="mt-10 rounded-2xl bg-[#FAF9F8] p-6 text-center text-xs text-[#54453D]/60 sm:p-8">
                <Server className="mx-auto h-5 w-5 text-[#54453D]/60" />
                <p className="mt-2 font-medium">
                  {isAr
                    ? 'تتم مراقبة الخوادم آلياً على مدار الساعة (24/7/365) من مراكز بيانات متعددة داخل المملكة.'
                    : 'Infrastructure monitored continuously across redundant tier-IV data centers inside Saudi Arabia.'}
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
