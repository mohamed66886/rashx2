/**
 * RASHX Integrations & Hardware Compatibility Page
 *
 * Dedicated Route: /integrations
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Payment gateways, hardware peripherals (receipt printers, barcode scanners), and ZATCA APIs.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Cpu, ArrowLeft, ArrowRight } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'التكامل والربط التقني | RASHX — أجهزة نقاط البيع، بوابات الدفع، والفوترة'
      : 'Integrations & Hardware Compatibility | RASHX — POS, Payments & APIs',
    description: isAr
      ? 'توافق شامل مع أجهزة نقاط البيع اللمسية، طابعات الفواتير الحرارية، أجهزة الدفع (مدى، Apple Pay)، والربط المباشر مع هيئة الزكاة (ZATCA).'
      : 'Comprehensive compatibility with thermal receipt printers, Mada/Apple Pay payment terminals, and ZATCA Phase 2 APIs.',
    path: '/integrations',
    lang,
  });
}

export default async function IntegrationsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const contactHref = (isAr ? routes.contact : `${routes.contact}?lang=en`) as Route;

  const integrationGroups = isAr
    ? [
        {
          title: 'المدفوعات الإلكترونية وبوابات الدفع',
          desc: 'دعم كامل لشبكة «مدى»، بطاقات Visa وMastercard، ومحافظ Apple Pay في نقاط البيع وعلى موقع الحجز الإلكتروني.',
        },
        {
          title: 'الأجهزة الطرفية وطابعات الفواتير',
          desc: 'توافق مباشر مع طابعات الإيصالات الحرارية (Bluetooth/LAN/USB)، وأدراج النقدية الإلكترونية، وقارئات الباركود.',
        },
        {
          title: 'الربط المباشر مع منصة «فاتورة» (ZATCA)',
          desc: 'واجهات برمجة (APIs) مؤمنة لمشاركة الفواتير الضريبية وتوليد الأختام الرقمية المشفرة وفق متطلبات الهيئة.',
        },
      ]
    : [
        {
          title: 'Payment Gateways & Card Terminals',
          desc: 'Full native support for Saudi Mada network, Visa/Mastercard, and Apple Pay both at cashier desks and online checkout.',
        },
        {
          title: 'Hardware Peripherals & Thermal Printers',
          desc: 'Plug-and-play support for standard thermal receipt printers (Bluetooth, LAN, USB), cash drawers, and barcode scanners.',
        },
        {
          title: 'ZATCA Fatoora Platform APIs',
          desc: 'Certified secure API channels transmitting fiscal invoice hashes and clearance receipts in compliance with Phase 2.',
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
                eyebrow={isAr ? 'التكامل والأجهزة' : 'HARDWARE & SYSTEM INTEGRATIONS'}
                title={
                  isAr
                    ? 'منظومة مفتوحة تتكامل بسلاسة مع أجهزتك وبوابات الدفع'
                    : 'Open Interoperability with Your Hardware & Payment Terminals'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'لا نلزمك بشراء أجهزة محددة؛ صممت RASHX لتعمل على متصفحات الويب، وأجهزة iPad والتابلت، وطابعات الفواتير القياسية بكفاءة تامة.'
                  : 'Zero proprietary hardware lock-in. RASHX runs effortlessly on tablets, touch iPads, laptops, and standard thermal receipt printers.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
                {integrationGroups.map((g, idx) => (
                  <div key={idx} className="rounded-3xl bg-[#FAF9F8] p-7 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0C5AE]/40 text-[#54453D] mb-5">
                        <Cpu className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-[#54453D] mb-3">{g.title}</h3>
                      <p className="text-sm leading-relaxed text-[#75645B]">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Consultation Link */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-12 text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-3">
                  {isAr ? 'هل لديك أجهزة قائمة تود التحقق من توافقها؟' : 'Have Existing Equipment to Verify?'}
                </h3>
                <p className="text-sm sm:text-base text-[#75645B] max-w-xl mx-auto mb-8">
                  {isAr
                    ? 'فريق الدعم الفني مستعد لمساعدتك في اختبار وتأكيد توافق طابعاتك وأجهزة الدفع مع المنظومة.'
                    : 'Our technical support team is available to verify printer models and terminal compatibility for your setup.'}
                </p>

                <Link
                  href={contactHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#54453D] px-8 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                >
                  <span>{isAr ? 'استشر فريق الدعم الفني' : 'Consult Technical Support'}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
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
