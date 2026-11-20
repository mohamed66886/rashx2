/**
 * RASHX Dual Applications Page
 *
 * Dedicated Route: /apps
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Overview of the customer booking interface and specialist/staff mobile app.
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
import { Smartphone, Users, ArrowLeft, ArrowRight } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'تطبيقات المنظومة الرقمية | RASHX — واجهة العميل وتطبيق مقدم الخدمة'
      : 'RASHX Dual Applications | Client Portal & Specialist Mobile App',
    description: isAr
      ? 'استعرض تطبيقات راش إكس المتكاملة: تطبيق حجز العميل المستقل وتطبيق الكوافيرات ومقدمي الخدمة لإدارة المواعيد والعمولات.'
      : 'Explore RASHX dual mobile interfaces: the client booking portal and the specialist app for appointment tracking and commissions.',
    path: '/apps',
    lang,
  });
}

export default async function AppsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const clientAppHref = (isAr ? routes.customerExperience : `${routes.customerExperience}?lang=en`) as Route;
  const staffAppHref = (isAr ? routes.providerExperience : `${routes.providerExperience}?lang=en`) as Route;

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/apps" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                as="h1"
                eyebrow={isAr ? 'تطبيقات الهاتف والويب' : 'MOBILE & WEB APPS'}
                title={
                  isAr
                    ? 'واجهات وتطبيقات متخصصة لكل من العميل ومقدم الخدمة'
                    : 'Tailored Mobile Interfaces for Both Clients and Staff'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'لا نكتفي بإدارة الصالون من المكتب؛ بل نمنح عميلاتك تجربة حجز عصرية، ونوفر لكادرك أداة ذكية في جيوبهم لمتابعة جدول اليوم وعمولاتهم لحظة بلحظة.'
                  : 'RASHX extends management beyond the reception desk, equipping customers with booking convenience and specialists with mobile empowerment.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer App Card */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0C5AE]/40 text-[#54453D] mb-6">
                    <Smartphone className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-3">
                    {isAr ? 'بوابة وتطبيق حجز العميل' : 'Client Booking Portal & App'}
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed text-[#75645B] mb-6">
                    {isAr
                      ? 'رحلة حجز سلسة تحمل هوية صالونك بالكامل، تتيح للعميلة اختيار الخدمات، تحديد الأخصائية المفضلة، الدفع المسبق، ومتابعة رصيد نقاط الولاء.'
                      : 'Frictionless customer booking carrying your salon brand, enabling service selection, specialist preferences, and loyalty point tracking.'}
                  </p>
                </div>
                <Link
                  href={clientAppHref}
                  className="inline-flex items-center justify-between rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#54453D] hover:bg-[#F0C5AE]/30 transition-colors duration-200"
                >
                  <span>{isAr ? 'استكشف تجربة العميل' : 'Explore Customer Portal'}</span>
                  <ArrowIcon className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
                </Link>
              </div>

              {/* Specialist / Staff App Card */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#91B8C0]/30 text-[#2C4349] mb-6">
                    <Users className="h-6 w-6 text-[#2C4349]" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-3">
                    {isAr ? 'تطبيق مقدم الخدمة (Staff App)' : 'Specialist & Staff Mobile App'}
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed text-[#75645B] mb-6">
                    {isAr
                      ? 'تطبيق مخصص للكوافيرات والأخصائيين لمتابعة جدول مواعيد اليوم، وتأكيد بدء الخدمة وإنهائها، ورصد استحقاق العمولات بدقة وشفافية.'
                      : 'Specialist mobile hub for reviewing daily appointments, confirming session starts, and verifying calculated service commissions.'}
                  </p>
                </div>
                <Link
                  href={staffAppHref}
                  className="inline-flex items-center justify-between rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#54453D] hover:bg-[#F0C5AE]/30 transition-colors duration-200"
                >
                  <span>{isAr ? 'استكشف تطبيق مقدم الخدمة' : 'Explore Staff App'}</span>
                  <ArrowIcon className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
