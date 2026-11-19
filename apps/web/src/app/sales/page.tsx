/**
 * RASHX Commercial Sales Page
 *
 * Dedicated Route: /sales
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Direct contact with enterprise sales specialists and subscription advisors.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Phone, ArrowLeft, ArrowRight, Sparkles } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'فريق المبيعات والاشتراكات | RASHX — تواصل مباشر مع مستشاري الأعمال'
      : 'Sales & Subscriptions Desk | RASHX — Speak with Commercial Advisors',
    description: isAr
      ? 'تواصل مع فريق مبيعات واشتراكات راش إكس المباشر لمناقشة باقات المنشآت والحلول المخصصة وسلاسل الصالونات الكبرى.'
      : 'Connect directly with the RASHX enterprise sales team to discuss custom subscription tiers, multi-branch contracts, and platform onboarding.',
    path: '/sales',
    lang,
  });
}

export default async function SalesPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const demoHref = (isAr ? routes.demo : `${routes.demo}?lang=en`) as Route;

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
                eyebrow={isAr ? 'المبيعات والاشتراكات' : 'SALES & COMMERCIAL DESK'}
                title={
                  isAr
                    ? 'فريق مبيعات RASHX مستعد لمساعدتك على اتخاذ القرار الأنسب'
                    : 'RASHX Sales Advisors Ready to Guide Your Business Growth'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'نوفر لك استشارة تجارية دقيقة تناسب خططك التوسعية وتضمن حصول صالونك على التكوين الأمثل للمنظومة.'
                  : 'We provide specialized commercial advisory aligning with your expansion targets and ensuring optimal platform deployment.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl">
              {/* Direct Phone Highlight Card */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-12 text-center mb-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0C5AE]/40 text-[#54453D] mb-5">
                  <Phone className="h-8 w-8 text-[#54453D]" aria-hidden="true" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-2">
                  {isAr ? 'الخط الساخن للمبيعات والاستشارات' : 'Direct Commercial Hotline'}
                </h2>
                <p className="text-sm sm:text-base text-[#75645B] max-w-md mx-auto mb-6">
                  {isAr
                    ? 'اتصل مباشرة بمستشار المبيعات لمناقشة عروض الأسعار والاشتراكات السنوية'
                    : 'Call our dedicated sales representative directly to discuss quotes and enterprise contracts'}
                </p>

                <a
                  href="tel:+966548082945"
                  dir="ltr"
                  className="inline-block text-2xl sm:text-3xl font-black text-[#54453D] hover:text-[#C78360] transition-colors duration-200 mb-6"
                >
                  +966 54 808 2945
                </a>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="tel:+966548082945"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    <span>{isAr ? 'اتصال هاتفي فوري' : 'Call Directly Now'}</span>
                  </a>

                  <Link
                    href={demoHref}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>{isAr ? 'طلب عرض حي تفاعلي' : 'Schedule Live Demo'}</span>
                    <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Assurances */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="rounded-2xl bg-[#FAF9F8] p-6">
                  <div className="text-sm font-bold text-[#54453D] mb-1">{isAr ? 'شفافية كاملة' : 'Transparent Pricing'}</div>
                  <div className="text-xs text-[#75645B]">{isAr ? 'بدون رسوم خفية أو تكاليف غير معلنة' : 'Zero hidden fees or surprise charges'}</div>
                </div>
                <div className="rounded-2xl bg-[#FAF9F8] p-6">
                  <div className="text-sm font-bold text-[#54453D] mb-1">{isAr ? 'تأهيل وتدريب مجاني' : 'Complimentary Training'}</div>
                  <div className="text-xs text-[#75645B]">{isAr ? 'جلسات تدريب شاملة لمدير الصالون والكادر' : 'Complete onboarding for managers and staff'}</div>
                </div>
                <div className="rounded-2xl bg-[#FAF9F8] p-6">
                  <div className="text-sm font-bold text-[#54453D] mb-1">{isAr ? 'ترحيل مجاني للبيانات' : 'Free Migration'}</div>
                  <div className="text-xs text-[#75645B]">{isAr ? 'نقل سجلات عميلاتك السابقة بكل أمان' : 'Zero-loss historical data import'}</div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
