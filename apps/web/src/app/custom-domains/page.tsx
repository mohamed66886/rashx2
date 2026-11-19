/**
 * RASHX Custom Domains & Subdomains Page
 *
 * Dedicated Route: /custom-domains
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Technical details on subdomain allocation ([salon].rashx.org) and custom domain CNAME linking.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Globe, ArrowLeft, ArrowRight } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'النطاقات الفرعية والمخصصة | RASHX — عنوان رقمي خاص بمنشأتك'
      : 'Custom Domains & Subdomains | RASHX — Dedicated Digital Real Estate',
    description: isAr
      ? 'احصل على نطاق فرعي معتمد فوراً ([salon].rashx.org) مع إمكانية ربط نطاقك التجاري الخاص (Custom Domain) بشهادة أمان SSL تلقائية.'
      : 'Instant subdomain provisioning ([salon].rashx.org) with optional custom domain CNAME routing and automated SSL encryption.',
    path: '/custom-domains',
    lang,
  });
}

export default async function CustomDomainsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const getStartedHref = (isAr ? routes.getStarted : `${routes.getStarted}?lang=en`) as Route;

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
                eyebrow={isAr ? 'النطاقات والاستضافة السحابية' : 'SUBDOMAINS & CUSTOM DOMAINS'}
                title={
                  isAr
                    ? 'رابط سحابي معتمد يمثل علامتك التجارية أمام العميلات'
                    : 'A Dedicated Web Address Anchoring Your Salon Presence'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'تعمل كل منشأة تحت نطاق فرعي فوري وآمن ([salon].rashx.org) مع إمكانية الترقية لربط نطاق صالونك الخاص بسهولة مطلقة.'
                  : 'Every salon operates on an instant, encrypted subdomain ([salon].rashx.org) with seamless custom apex/CNAME DNS integration.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Subdomain */}
                <div className="rounded-3xl bg-[#FAF9F8] p-8">
                  <div className="text-xs font-bold text-[#C78360] uppercase mb-2">
                    {isAr ? 'الخيار القياسي الفوري' : 'Instant Provisioning'}
                  </div>
                  <h2 className="text-xl font-bold text-[#54453D] mb-3">
                    {isAr ? 'نطاق فرعي سحابي مجاني' : 'Approved Subdomain'}
                  </h2>
                  <p className="text-sm text-[#75645B] leading-relaxed mb-6">
                    {isAr
                      ? 'يتم حجز وتفعيل عنوان صالونك فوراً (https://[اسم-الصالون].rashx.org) مع شهادة SSL مجانية وحماية سحابية عالية.'
                      : 'Instant provisioning of your dedicated workspace URL with automated SSL and DDoS mitigation.'}
                  </p>
                  <div className="rounded-xl bg-white p-3 text-xs font-mono font-bold text-[#54453D]" dir="ltr">
                    https://[your-salon].rashx.org
                  </div>
                </div>

                {/* Custom Domain */}
                <div className="rounded-3xl bg-[#FAF9F8] p-8">
                  <div className="text-xs font-bold text-[#2C4349] uppercase mb-2">
                    {isAr ? 'الخيار المتقدم' : 'Enterprise Option'}
                  </div>
                  <h2 className="text-xl font-bold text-[#54453D] mb-3">
                    {isAr ? 'ربط نطاق صالونك الخاص' : 'Custom Domain Linking'}
                  </h2>
                  <p className="text-sm text-[#75645B] leading-relaxed mb-6">
                    {isAr
                      ? 'اربط موقع صالونك بعنوانك التجاري المستقل (salon.com) مباشرة عبر إعدادات DNS البسيطة دون أي تعقيد.'
                      : 'Connect your independent commercial domain (salon.com) with automated certificate renewals.'}
                  </p>
                  <div className="rounded-xl bg-white p-3 text-xs font-mono font-bold text-[#54453D]" dir="ltr">
                    https://www.your-salon.com
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="text-center">
                <Link
                  href={getStartedHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#54453D] px-8 py-4 text-base font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                >
                  <Globe className="h-5 w-5" aria-hidden="true" />
                  <span>{isAr ? 'احجز نطاق صالونك الآن' : 'Reserve Your Subdomain'}</span>
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
