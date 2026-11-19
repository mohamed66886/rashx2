/**
 * RASHX Salon Directory Search Engine Page
 *
 * Dedicated Route: /salons/search
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Search, Sliders } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'البحث في دليل صالونات ومراكز راش إكس | RASHX Search'
      : 'Search Salons & Wellness Venues | RASHX Search',
    description: isAr
      ? 'ابحث بالمدينة، الحي، أو نوع الخدمة عن أفضل صالونات ومراكز التجميل المعتمدة في المملكة.'
      : 'Filter and search verified salons by city, district, rating, and service category across Saudi Arabia.',
    path: '/salons/search',
    lang,
  });
}

export default async function SalonSearchPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const cities = isAr
    ? ['الرياض', 'جدة', 'الدمام والخبر', 'مكة المكرمة', 'المدينة المنورة']
    : ['Riyadh', 'Jeddah', 'Dammam & Khobar', 'Makkah', 'Madinah'];

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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#91B8C0]/30 px-3 py-1 text-xs font-semibold text-[#2C4349]">
                <Search className="h-4 w-4" />
                <span>{isAr ? 'محرك البحث والاستكشاف' : 'Search Engine'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'ابحث عن صالون أو مركز تجميل' : 'Find Your Next Beauty Experience'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'اختر المدينة أو الخدمة المطلوبة واستعرض الصالونات المعتمدة ذات التقييمات العالية'
                  : 'Search by location, specialty, or treatment to discover certified salon venues'}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={
                      isAr
                        ? 'ابحث باسم الصالون، الحي، أو الخدمة (مثل: عناية بالشعر، سبا)...'
                        : 'Search by salon name, district, or treatment...'
                    }
                    className="w-full rounded-2xl bg-white px-5 py-4 text-sm text-[#54453D] placeholder-[#54453D]/40 outline-none focus:ring-2 focus:ring-[#54453D]"
                  />
                </div>
                <button
                  type="button"
                  className="rounded-2xl bg-[#54453D] px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-[#3D322C]"
                >
                  {isAr ? 'بحث' : 'Search'}
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-semibold text-[#54453D]/60">
                  {isAr ? 'المدن الأكثر بحثاً:' : 'Popular Cities:'}
                </span>
                {cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#54453D] transition-colors hover:bg-[#F0C5AE]/30"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="rounded-3xl bg-[#FAF9F8] p-12 text-center">
              <Sliders className="mx-auto h-8 w-8 text-[#54453D]/40" />
              <h3 className="mt-4 text-base font-bold text-[#54453D]">
                {isAr ? 'حدد معايير البحث لاستعراض النتائج' : 'Adjust filters to explore matching venues'}
              </h3>
              <p className="mt-1 text-xs text-[#54453D]/60">
                {isAr
                  ? 'يتم تحديث الدليل باستمرار مع كل منشأة جديدة تنضم إلى شبكة راش إكس في المملكة.'
                  : 'Directory is continuously updated as new salons join the nationwide RASHX cloud network.'}
              </p>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
