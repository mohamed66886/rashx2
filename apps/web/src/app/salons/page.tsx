/**
 * RASHX Verified Salons & Spas Directory Page
 *
 * Dedicated Route: /salons
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
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
import { Compass, Sparkles, MapPin, ArrowLeft, ArrowRight } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'دليل الصالونات ومراكز التجميل المعتمدة | RASHX Directory'
      : 'Verified Salons & Spas Directory | RASHX Directory',
    description: isAr
      ? 'استكشف واحجز في أفضل الصالونات، صالونات الحلاقة، ومراكز السبا المعتمدة العاملة بنظام راش إكس في السعودية.'
      : 'Discover and book top-rated salons, luxury spas, and barbershops operating on the RASHX digital cloud system in Saudi Arabia.',
    path: '/salons',
    lang,
  });
}

export default async function SalonsDirectoryPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const searchHref = (isAr ? routes.salons.search : `${routes.salons.search}?lang=en`) as Route;

  const featured = isAr
    ? [
        {
          name: 'مركز لوميير بيوتي آند سبا',
          city: 'الرياض · حي العليا',
          type: 'مركز تجميل نسائي وسبا متكامل',
          rating: '4.9',
          reviews: '1,240 تقييم',
        },
        {
          name: 'صالون النخبة للعناية بالرجل',
          city: 'جدة · حي الروضة',
          type: 'صالون حلاقة رجالي وعناية شخصية',
          rating: '4.8',
          reviews: '890 تقييم',
        },
        {
          name: 'أورورا ريلاكسيشن سبا',
          city: 'الخبر · الكورنيش',
          type: 'سبا صحي واستجمام',
          rating: '5.0',
          reviews: '640 تقييم',
        },
      ]
    : [
        {
          name: 'Lumiere Beauty & Wellness',
          city: 'Riyadh · Al Olaya',
          type: 'Luxury Women’s Salon & Spa',
          rating: '4.9',
          reviews: '1,240 reviews',
        },
        {
          name: 'Elite Men’s Grooming Lounge',
          city: 'Jeddah · Al Rawdah',
          type: 'Premium Barbershop & Care',
          rating: '4.8',
          reviews: '890 reviews',
        },
        {
          name: 'Aurora Relaxation Retreat',
          city: 'Khobar · Corniche',
          type: 'Holistic Spa Sanctuary',
          rating: '5.0',
          reviews: '640 reviews',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/salons" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <Compass className="h-4 w-4" />
                <span>{isAr ? 'الدليل الوطني المعتمد' : 'Verified Directory'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'دليل الصالونات ومراكز التجميل' : 'Verified Salons & Spas'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'اكتشف أرقى المنشآت التي تقدم تجربة حجز رقمية متكاملة وسلسة مدعومة بتقنية راش إكس'
                  : 'Discover premier beauty venues offering seamless booking experiences powered by RASHX'}
              </p>
              <div className="mt-8">
                <Link
                  href={searchHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3D322C]"
                >
                  <span>{isAr ? 'ابحث عن صالون في مدينتك' : 'Search Salons by City'}</span>
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {featured.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-[#54453D]">
                      <span className="flex items-center gap-1 text-[#C78360]">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>★ {item.rating}</span>
                      </span>
                      <span className="text-[#54453D]/60">{item.reviews}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-[#54453D]">{item.name}</h3>
                    <p className="mt-1 text-xs text-[#54453D]/70">{item.type}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-[#54453D]/60">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{item.city}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <span className="inline-flex w-full items-center justify-center rounded-xl bg-[#54453D]/10 py-2.5 text-xs font-bold text-[#54453D]">
                      {isAr ? 'منظومة حجز معتمدة' : 'Verified Booking Portal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

