/**
 * RASHX Subscription Terms Page
 *
 * Dedicated Route: /subscription-terms
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { CreditCard } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'شروط الاشتراك وباقات الخدمة | RASHX — العقود والمدفوعات والتجديد'
      : 'Subscription & Commercial Terms | RASHX — SaaS Agreements & Billing',
    description: isAr
      ? 'شروط وأحكام باقات الاشتراكات السحابية، الرسوم، دورات الدفع، وسياسات التجديد لمنصة راش إكس في السعودية.'
      : 'Commercial subscription terms, recurring billing, tier specifications, and renewal conditions on RASHX.',
    path: '/subscription-terms',
    lang,
  });
}

export default async function SubscriptionTermsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const terms = isAr
    ? [
        {
          title: '1. نماذج وباقات الاشتراك',
          content:
            'توفر RASHX باقات اشتراك مرنة (شهرية وسنوية) مصممة لتناسب مختلف أحجام المنشآت: الصالونات المستقلة، المراكز المتكاملة، والسلاسل متعددة الفروع، متضمنة كافة الأنظمة الإدارية والنطاق الفرعي المستقل.',
        },
        {
          title: '2. رسوم الاشتراك والفوترة',
          content:
            'تُسدد رسوم الاشتراكات مقدماً في بداية كل دورة فوترة بالريال السعودي (SAR). تخضع كافة الأسعار المعلنة لضريبة القيمة المضافة (15%) وفق أحكام هيئة الزكاة والضريبة والجمارك وتُصدر بفواتير ضريبية نظامية.',
        },
        {
          title: '3. رسوم التأسيس والتهيئة الأولية',
          content:
            'تغطي رسوم الإعداد لمرة واحدة (Setup Fees) عمليات تكوين النطاق الفرعي، إعداد الهوية البصرية، استيراد قواعد بيانات العملاء والخدمات، وتدريب الكوادر الإدارية على استخدام المنظومة.',
        },
        {
          title: '4. التجديد التلقائي والترقية',
          content:
            'تتجدد الاشتراكات تلقائياً في نهاية كل مدة تعاقدية ما لم تطلب المنشأة إلغاء التجديد قبل موعد الاستحقاق بـ 7 أيام عمل. يمكن ترقية الباقة أو إضافة فروع جديدة في أي وقت مع احتساب الفارق النسبي.',
        },
        {
          title: '5. سياسة الإلغاء والتعليق',
          content:
            'يحق للمنشأة إلغاء الاشتراك في أي وقت مع استمرار إمكانية الوصول إلى نهاية الفترة المدفوعة. في حال تعثر السداد، يُمنح حساب المنشأة فترة سماح مدتها 7 أيام عمل قبل تعليق العمليات.',
        },
      ]
    : [
        {
          title: '1. Plans & Subscription Tiers',
          content:
            'RASHX delivers monthly and annual SaaS plans calibrated for independent salons, comprehensive beauty hubs, and multi-branch chains, incorporating all core operating modules and dedicated subdomains.',
        },
        {
          title: '2. Billing Currency & VAT',
          content:
            'Subscription fees are billed in advance in Saudi Riyals (SAR). All quoted pricing is subject to 15% Value Added Tax in accordance with ZATCA regulations, verified with compliant tax invoices.',
        },
        {
          title: '3. Onboarding & Configuration Fees',
          content:
            'One-time onboarding fees cover tenant subdomain provisioning, custom visual brand integration, catalog and client dataset ingestion, and specialized staff onboarding sessions.',
        },
        {
          title: '4. Automatic Renewals & Tier Upgrades',
          content:
            'Subscriptions renew automatically at the conclusion of each billing term unless written cancellation notice is received 7 days prior. Upgrades and branch additions can be applied dynamically pro-rata.',
        },
        {
          title: '5. Account Suspension & Grace Periods',
          content:
            'Tenants maintain uninterrupted platform access until the end of the paid term upon cancellation. A 7-day grace period is provided for payment re-attempts prior to service pause.',
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
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <CreditCard className="h-4 w-4" />
                <span>{isAr ? 'الاشتراكات والفوترة' : 'Billing & Subscriptions'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'شروط وأحكام الاشتراكات' : 'Subscription Terms'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'الشروط التجارية والتعاقدية المنظمة لباقات الاشتراكات السحابية، التجديد، والخدمات المضافة'
                  : 'Commercial guidelines governing plan agreements, renewal cycles, and platform tier provisions'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              {terms.map((item) => (
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
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

