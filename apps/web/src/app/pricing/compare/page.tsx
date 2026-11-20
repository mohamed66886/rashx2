/**
 * RASHX Pricing & System Comparison Page
 *
 * Dedicated Route: /pricing/compare
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Full feature and module breakdown across subscription tiers.
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
import { CheckCircle2, ArrowLeft, ArrowRight, Minus } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'مقارنة باقات وأنظمة RASHX | استعرض الفروقات والمزايا التشغيلية'
      : 'Compare RASHX Plans & Capabilities | Feature Breakdown',
    description: isAr
      ? 'جدول مقارنة تفصيلي شامل لكافة الحلول والأنظمة والقدرات المتاحة ضمن منظومة RASHX لإدارة الصالونات ومراكز التجميل والسبا.'
      : 'Detailed comparison of all solutions, operational modules, and capabilities available in the RASHX unified salon ecosystem.',
    path: '/pricing/compare',
    lang,
  });
}

interface FeatureComparison {
  category: { ar: string; en: string };
  items: {
    name: { ar: string; en: string };
    starter: boolean | string;
    pro: boolean | string;
    enterprise: boolean | string;
  }[];
}

const comparisonMatrix: FeatureComparison[] = [
  {
    category: { ar: 'المنظومة الرقمية والتخصيص', en: 'Digital Ecosystem & Customization' },
    items: [
      { name: { ar: 'موقع إلكتروني مستقل للمنشأة (Website)', en: 'Independent Subdomain Facility Website' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'نطاق فرعي معتمد ([salon].rashx.org)', en: 'Approved Subdomain' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'لوحة التحكم الإدارية (Admin Dashboard)', en: 'Central Management Dashboard' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'بوابة وتطبيق العميل (Customer App/Portal)', en: 'Customer Portal & Web App' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'واجهة وتطبيق مقدم الخدمة (Staff App)', en: 'Specialist / Staff Mobile App' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'الهوية البصرية والألوان الخاصة (White Label)', en: 'Custom Brand Colors & Logo' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'ربط نطاق خاص مخصص (Custom Domain)', en: 'Custom Domain Linking' }, starter: false, pro: true, enterprise: true },
    ],
  },
  {
    category: { ar: 'الأنظمة التشغيلية الأساسية', en: 'Core Operational Modules' },
    items: [
      { name: { ar: 'إدارة الحجوزات والمواعيد الذكية', en: 'Smart Real-Time Appointment Scheduling' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'نقاط البيع السريعة والكاشير (POS)', en: 'Fast Touch POS & Cashier' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'الفوترة الإلكترونية واعتماد ZATCA المرحلة الثانية', en: 'ZATCA Phase 2 E-Invoicing' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'إدارة الخدمات والأسعار والباقات', en: 'Services, Duration & Package Setup' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'إدارة سجلات وملفات العملاء (CRM)', en: 'Customer Profile History & CRM' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'إدارة الموظفين والورديات', en: 'Staff Shifts & Roster Scheduling' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'حساب العمولات التلقائي لمقدمي الخدمات', en: 'Automated Commission Engine' }, starter: true, pro: true, enterprise: true },
    ],
  },
  {
    category: { ar: 'القدرات المتقدمة وإدارة الفروع', en: 'Advanced Capabilities & Scalability' },
    items: [
      { name: { ar: 'إدارة المخزون والتنبيه بالنواقص', en: 'Inventory & Low Stock Alerts' }, starter: true, pro: true, enterprise: true },
      { name: { ar: 'إدارة المشتريات والموردين', en: 'Purchasing & Vendor Records' }, starter: false, pro: true, enterprise: true },
      { name: { ar: 'نظام الولاء ونقاط المكافآت', en: 'Loyalty Rewards & Wallets' }, starter: false, pro: true, enterprise: true },
      { name: { ar: 'تقارير أداء متقدمة وتحليلات KPIs', en: 'Advanced Analytics & P&L Reports' }, starter: false, pro: true, enterprise: true },
      { name: { ar: 'إدارة السلاسل والفروع المتعددة المركزية', en: 'Centralized Multi-Branch Control' }, starter: false, pro: false, enterprise: true },
      { name: { ar: 'ترحيل المخزون المتبادل بين الفروع', en: 'Inter-Branch Stock Transfers' }, starter: false, pro: false, enterprise: true },
      { name: { ar: 'مدير نجاح عملاء مخصص (Dedicated CSM)', en: 'Dedicated Customer Success Manager' }, starter: false, pro: false, enterprise: true },
    ],
  },
];

export default async function PricingComparePage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const contactHref = (isAr ? routes.contact : `${routes.contact}?lang=en`) as Route;
  const demoHref = (isAr ? routes.demo : `${routes.demo}?lang=en`) as Route;

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/pricing/compare" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        {/* Hero */}
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                as="h1"
                eyebrow={isAr ? 'مقارنة الباقات والأنظمة' : 'PLANS & CAPABILITIES MATRIX'}
                title={
                  isAr
                    ? 'جدول مقارنة شامل لكافة أنظمة وحلول منظومة RASHX'
                    : 'Comprehensive Feature Comparison Across All RASHX Editions'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'اطلع على كافة الإمكانيات التشغيلية والتقنية لتحديد الخيار الأنسب لحجم ونمو منشأتك، بدءاً من الصالونات الناشئة وحتى السلاسل الكبرى.'
                  : 'Review every operational module and technical capability to choose the exact edition for your facility scale and growth trajectory.'}
              </p>
            </div>
          </PageContainer>
        </section>

        {/* Comparison Table */}
        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-6xl">
              {/* Tier Headers */}
              <div className="grid grid-cols-12 gap-4 pb-6 mb-8 text-center sm:text-start">
                <div className="col-span-12 sm:col-span-6 p-4">
                  <h3 className="text-xl font-black text-[#54453D]">
                    {isAr ? 'الأنظمة والميزات التشغيلية' : 'Operational Systems & Modules'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#75645B] mt-1">
                    {isAr ? 'بيانات حقيقية مبنية على البنية البرمجية المعتمدة' : 'Verified against platform architecture'}
                  </p>
                </div>
                <div className="col-span-4 sm:col-span-2 rounded-2xl bg-[#FAF9F8] p-4 text-center">
                  <h4 className="text-sm sm:text-base font-bold text-[#54453D]">{isAr ? 'الصالون الأساسي' : 'Starter'}</h4>
                  <p className="text-[11px] text-[#75645B] mt-1">{isAr ? 'للصالونات المستقلة' : 'Single Boutique'}</p>
                </div>
                <div className="col-span-4 sm:col-span-2 rounded-2xl bg-[#F0C5AE]/30 p-4 text-center">
                  <h4 className="text-sm sm:text-base font-bold text-[#54453D]">{isAr ? 'المركز المتقدم' : 'Professional'}</h4>
                  <p className="text-[11px] text-[#75645B] mt-1">{isAr ? 'للمراكز النشطة والسبا' : 'Active Center & Spa'}</p>
                </div>
                <div className="col-span-4 sm:col-span-2 rounded-2xl bg-[#54453D] p-4 text-center text-white">
                  <h4 className="text-sm sm:text-base font-bold text-white">{isAr ? 'الفروع والمجموعات' : 'Enterprise'}</h4>
                  <p className="text-[11px] text-[#FAF9F8]/80 mt-1">{isAr ? 'للسلاسل المتعددة' : 'Multi-Branch Chain'}</p>
                </div>
              </div>

              {/* Matrix Categories */}
              <div className="space-y-12">
                {comparisonMatrix.map((section, sIdx) => (
                  <div key={sIdx} className="rounded-3xl bg-[#FAF9F8] p-6 sm:p-8">
                    <h3 className="text-lg font-black text-[#54453D] mb-6">
                      {section.category[lang]}
                    </h3>

                    <div className="divide-y-0 space-y-3">
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="grid grid-cols-12 gap-4 items-center rounded-2xl bg-white p-4"
                        >
                          <div className="col-span-12 sm:col-span-6 font-semibold text-xs sm:text-sm text-[#54453D]">
                            {item.name[lang]}
                          </div>

                          {/* Starter */}
                          <div className="col-span-4 sm:col-span-2 flex justify-center">
                            {item.starter ? (
                              <CheckCircle2 className="h-5 w-5 text-[#16A34A]" aria-hidden="true" />
                            ) : (
                              <Minus className="h-4 w-4 text-[#A89F91]" aria-hidden="true" />
                            )}
                          </div>

                          {/* Pro */}
                          <div className="col-span-4 sm:col-span-2 flex justify-center">
                            {item.pro ? (
                              <CheckCircle2 className="h-5 w-5 text-[#16A34A]" aria-hidden="true" />
                            ) : (
                              <Minus className="h-4 w-4 text-[#A89F91]" aria-hidden="true" />
                            )}
                          </div>

                          {/* Enterprise */}
                          <div className="col-span-4 sm:col-span-2 flex justify-center">
                            {item.enterprise ? (
                              <CheckCircle2 className="h-5 w-5 text-[#16A34A]" aria-hidden="true" />
                            ) : (
                              <Minus className="h-4 w-4 text-[#A89F91]" aria-hidden="true" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Conversion Box */}
              <div className="mt-12 sm:mt-16 rounded-3xl bg-[#FAF9F8] p-8 sm:p-12 text-center">
                <h3 className="text-xl sm:text-2xl font-black text-[#54453D] mb-3">
                  {isAr ? 'احصل على تسعير مخصص لمنشأتك مع استشارة مجانية' : 'Request Tailored Pricing & Free Consultation'}
                </h3>
                <p className="text-sm sm:text-base text-[#75645B] max-w-2xl mx-auto mb-8 leading-relaxed">
                  {isAr
                    ? 'يتولى فريقنا دراسة حجم نشاطك وعدد الكراسي والفروع ليقدم لك أفضل باقة تناسب ميزانيتك التشغيلية بدقة وشفافية تامة.'
                    : 'Our advisory team assesses your chair count and branch footprint to configure a custom tier matching your budget transparently.'}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href={contactHref}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                  >
                    <span>{isAr ? 'تواصل مع فريق الاشتراكات' : 'Speak with Sales Team'}</span>
                    <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>

                  <Link
                    href={demoHref}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30"
                  >
                    <span>{isAr ? 'احجز عرضاً حياً للمنظومة' : 'Book a Live Demo'}</span>
                  </Link>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

