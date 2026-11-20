/**
 * RASHX Industries Hub Page
 *
 * Dedicated Route: /industries
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Directory of specialized beauty and wellness industry solutions.
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
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from '@rashx/icons';
import { industriesData } from '@/data/industries';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'قطاعات وحلول RASHX المتخصصة | صالونات ومراكز التجميل والسبا'
      : 'Specialized Industry Solutions | RASHX Salons, Beauty Centers & Spas',
    description: isAr
      ? 'استكشف حلول راش إكس التقنية المصممة خصيصاً لكل قطاع: صالونات التجميل النسائية، صالونات الحلاقة، مراكز التجميل، أندية السبا، ومجموعات الفروع المتعددة.'
      : 'Explore RASHX industry-specific software tailored for women’s salons, barbershops, integrated beauty centers, luxury spas, and multi-branch chains.',
    path: '/industries',
    lang,
  });
}

export default async function IndustriesHubPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const allIndustries = Object.values(industriesData);

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/industries" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        {/* Hero Section */}
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                as="h1"
                eyebrow={isAr ? 'قطاعات الأعمال' : 'SPECIALIZED INDUSTRIES'}
                title={
                  isAr
                    ? 'منظومة رقمية متخصصة ومصممة بدقة لكل نشاط في قطاع الجمال'
                    : 'A Dedicated Operating System Tailored for Every Beauty Niche'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'سواء كنت تدير صالوناً نسائياً راقياً، صالون حلاقة سريع الحركة، مركز تجميل متكامل، نادي سبا فاخر، أو سلسلة فروع واسعة؛ توفر لك RASHX أدوات تشغيلية تفهم أدق تفاصيل عملك.'
                  : 'Whether you run an upscale beauty salon, high-traffic barbershop, multi-service beauty complex, luxury spa, or multi-branch enterprise; RASHX delivers purpose-built workflows.'}
              </p>
            </div>
          </PageContainer>
        </section>

        {/* Industries Grid */}
        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {allIndustries.map((industry) => {
                  const industryHref = (isAr ? industry.path : `${industry.path}?lang=en`) as Route;
                  return (
                    <div
                      key={industry.slug}
                      className="rounded-3xl bg-[#FAF9F8] p-7 sm:p-8 flex flex-col justify-between transition-colors duration-200"
                    >
                      <div>
                        <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-[#C78360] mb-4">
                          {industry.badge[lang]}
                        </span>

                        <h2 className="text-xl font-bold text-[#54453D] mb-3">
                          {industry.title[lang]}
                        </h2>

                        <p className="text-sm leading-relaxed text-[#75645B] mb-6">
                          {industry.description[lang]}
                        </p>

                        <div className="space-y-2.5 mb-8">
                          {industry.keyFeatures.slice(0, 3).map((f, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-[#54453D]">
                              <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                              <span>{f[lang]}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Link
                        href={industryHref}
                        className="inline-flex items-center justify-between rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#54453D] hover:bg-[#F0C5AE]/30 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
                      >
                        <span>{isAr ? 'استكشف الحلول المتخصصة' : 'Explore Sector Solution'}</span>
                        <ArrowIcon className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Global CTA */}
        <section className="bg-[#FAF9F8] py-16 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                eyebrow={isAr ? 'هل تحتاج إلى استشارة؟' : 'NEED PERSONALIZED GUIDANCE?'}
                title={
                  isAr
                    ? 'فريقنا مستعد لتخصيص منظومة RASHX وفق متطلبات منشأتك'
                    : 'Our Advisory Team is Ready to Tailor RASHX to Your Facility'
                }
                align="center"
              />

              <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
                {isAr
                  ? 'تحدث مباشرة مع مستشارينا لمناقشة حجم منشأتك وعدد الأخصائيين وتخصيص باقة العمل المثالية.'
                  : 'Speak directly with our industry specialists to assess your facility scale and implement an optimal setup.'}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={((isAr ? routes.demo : `${routes.demo}?lang=en`) as Route)}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>{isAr ? 'طلب عرض حي مجاني' : 'Book Free Live Demo'}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  href={((isAr ? routes.contact : `${routes.contact}?lang=en`) as Route)}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30"
                >
                  <span>{isAr ? 'تواصل مع فريقنا' : 'Contact Advisory Team'}</span>
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

