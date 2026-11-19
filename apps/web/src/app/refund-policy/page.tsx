/**
 * RASHX Subscription & Refund Policy Page
 *
 * Dedicated Route: /refund-policy
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Authoritative subscription billing and cancellation guidelines.
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
      ? 'سياسة الاشتراكات والاسترداد | RASHX'
      : 'Subscription & Refund Policy | RASHX',
    description: isAr
      ? 'سياسة الاشتراكات السحابية، التجديد الدوري، والإلغاء والاسترداد لمنظومة RASHX لإدارة الصالونات ومراكز التجميل.'
      : 'Official RASHX SaaS subscription renewal, cancellation, and refund policy for salon and beauty center subscribers.',
    path: '/refund-policy',
    lang,
  });
}

export default async function RefundPolicyPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const policyItems = isAr
    ? [
        {
          title: '1. دورة الفوترة والاشتراك',
          desc: 'تُفوتر الاشتراكات على أساس شهري أو سنوي وفق الباقة المختارة، وتصدر فاتورة ضريبية مبسطة معتمدة لكل عملية تجديد.',
        },
        {
          title: '2. سياسة الإلغاء',
          desc: 'يحق للمنشأة المشتركة إلغاء التجديد التلقائي في أي وقت عبر لوحة التحكم الإدارية أو بالتواصل مع فريق الاشتراكات قبل تاريخ التجديد التالي.',
        },
        {
          title: '3. سياسة الاسترداد',
          desc: 'نظراً لأن الخدمة سحابية تُفعل فورياً مع حجز النطاق الفرعي وإعداد البنية السحابية؛ تخضع طلبات الاسترداد لمراجعة فريق نجاح العملاء خلال الأيام الأولى من التفعيل لضمان رضاك التام.',
        },
        {
          title: '4. تصدير البيانات عند إنهاء الخدمة',
          desc: 'في حال عدم الرغبة في التجديد، يحق للمنشأة تصدير كافة سجلات عملائها وفواتيرها الضريبية وقوائم خدماتها بصيغ قياسية (Excel / CSV) قبل إغلاق الحساب.',
        },
      ]
    : [
        {
          title: '1. Billing Cycles & Subscriptions',
          desc: 'Subscriptions are billed on a monthly or annual cadence with verified ZATCA simplified tax invoices issued per renewal.',
        },
        {
          title: '2. Cancellation Terms',
          desc: 'Subscribers may disable auto-renewal at any time via the admin dashboard or by notifying the sales desk prior to the upcoming renewal date.',
        },
        {
          title: '3. Refund Considerations',
          desc: 'As cloud infrastructure and dedicated subdomains are provisioned immediately upon activation, refund requests during early onboarding are handled by Customer Success to ensure complete satisfaction.',
        },
        {
          title: '4. Data Export upon Termination',
          desc: 'Should a subscriber choose not to renew, full export of client rosters, past invoices, and service menus in standard formats (CSV/Excel) is guaranteed prior to account decommissioning.',
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
                eyebrow={isAr ? 'سياسة الاشتراكات' : 'SUBSCRIPTION POLICY'}
                title={
                  isAr
                    ? 'سياسة الاشتراكات السحابية، التجديد والاسترداد'
                    : 'Cloud Subscription, Renewal & Refund Policy'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
                {isAr
                  ? 'شفافية كاملة في الفوترة وحرية تامة في إدارة اشتراك منشأتك وبياناتك.'
                  : 'Total billing transparency and complete sovereignty over your subscription and data.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
              {policyItems.map((item, idx) => (
                <div key={idx} className="rounded-3xl bg-[#FAF9F8] p-6 sm:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-[#54453D] mb-2">{item.title}</h2>
                  <p className="text-sm sm:text-base leading-relaxed text-[#75645B]">{item.desc}</p>
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

