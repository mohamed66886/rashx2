/**
 * RASHX User Guides & Tutorials Page
 *
 * Dedicated Route: /help/guides
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { BookOpen, Calendar, Users, ShoppingBag, Sliders } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'أدلة الاستخدام والتشغيل | RASHX User Guides'
      : 'User & Operations Guides | RASHX User Guides',
    description: isAr
      ? 'شروحات مبسطة وخطوات تشغيلية لاستخدام أنظمة راش إكس في الصالونات ومراكز التجميل والسبا.'
      : 'Comprehensive guides for salon staff and administrators on navigating RASHX modules seamlessly.',
    path: '/help/guides',
    lang,
  });
}

export default async function HelpGuidesPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const guides = isAr
    ? [
        {
          title: 'دليل بدء الاستخدام السريع وتكوين المنشأة',
          desc: 'خطوات إعداد بيانات الصالون، وتفعيل النطاق الفرعي، وتخصيص ساعات العمل وسجلات الفروع.',
          icon: Sliders,
        },
        {
          title: 'دليل إدارة الحجوزات وتنظيم جداول الكوادر',
          desc: 'كيفية جدولة المواعيد، التعامل مع الإلغاءات، وتخصيص فترات الراحة والتنقل بين الخدمات.',
          icon: Calendar,
        },
        {
          title: 'دليل نظام نقاط البيع (POS) والفوترة السريعة',
          desc: 'إصدار الفواتير، تطبيق الخصومات، تسجيل المدفوعات المجزأة، وإغلاق الصندوق اليومي.',
          icon: ShoppingBag,
        },
        {
          title: 'دليل إدارة العملاء (CRM) وبرامج الولاء',
          desc: 'بناء ملفات العملاء، تتبع تاريخ الخدمات، وإعداد قسائم المكافآت التلقائية.',
          icon: Users,
        },
      ]
    : [
        {
          title: 'Quickstart & Initial Facility Configuration',
          desc: 'How to configure your salon profile, verify subdomain routing, and calibrate branch business hours.',
          icon: Sliders,
        },
        {
          title: 'Appointment Scheduling & Bay Orchestration',
          desc: 'Managing bookings, handling last-minute cancellations, and synchronizing specialist breaks.',
          icon: Calendar,
        },
        {
          title: 'Point of Sale & Expedited Checkout',
          desc: 'Processing multi-tender payments, applying seasonal discounts, and running end-of-day register audits.',
          icon: ShoppingBag,
        },
        {
          title: 'Customer Directory & Automated Loyalty',
          desc: 'Maintaining customer profiles, recording visit history, and setting automated reward tiers.',
          icon: Users,
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/help/guides" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <BookOpen className="h-4 w-4" />
                <span>{isAr ? 'أدلة التشغيل اليومي' : 'Operations Guides'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'أدلة الاستخدام والتشغيل' : 'RASHX User Guides'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'تعليمات عملية مفصلة تمكّن فريق عملك من إدارة المنشأة بأعلى درجات الاحترافية'
                  : 'Practical, step-by-step guidance enabling your salon team to operate at peak efficiency'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {guides.map((g) => {
                const Icon = g.icon;
                return (
                  <div
                    key={g.title}
                    className="flex flex-col justify-between rounded-2xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                  >
                    <div>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#54453D] text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-[#54453D]">{g.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#54453D]/80">{g.desc}</p>
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

