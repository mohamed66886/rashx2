/**
 * RASHX Solutions Index Hub
 *
 * Dedicated Route: /solutions
 * Visual Direction: Absolute Flat, Clean, Borderless & Shadowless Architecture
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { ArrowLeft, ArrowRight, Layers, CheckCircle2 } from '@rashx/icons';
import { solutionsData } from '@/data/solutions';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'حلول المنظومة التشغيلية للصالونات ومراكز التجميل | RASHX'
      : 'Comprehensive Salon & Spa Operating Solutions | RASHX',
    description: isAr
      ? 'استكشف 10 أنظمة تقنية ذكية تقدمها راش إكس لإدارة وتشغيل الصالونات والسبا: الموارد البشرية، العملاء، الحجوزات، المبيعات، المخزون، المشتريات، والتحليلات.'
      : 'Explore the 10 intelligent SaaS modules engineered by RASHX for salons and spas: HR, CRM, booking, sales, POS, inventory, procurement, and analytics.',
    path: '/solutions',
    lang,
  });
}

export default async function SolutionsHubPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const solutionsList = Object.values(solutionsData);

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      {/* ── Official Public Website Header ───────────────────────── */}
      <PageJsonLd path="/solutions" lang={lang} />
      <Header lang={lang} />

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section
        id="solutions-hub-hero"
        className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 transition-colors duration-200"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <PageContainer size="full">
          <div className="mx-auto max-w-4xl text-center">
            <SectionTitle
              as="h1"
              eyebrow={isAr ? 'منظومة الحلول المتخصصة' : 'SPECIALIZED SOLUTIONS ECOSYSTEM'}
              title={
                isAr
                  ? 'منظومة متكاملة من 10 أنظمة تشغيلية ذكية لصالونك'
                  : 'An Integrated Suite of 10 Smart Salon Operating Systems'
              }
              align="center"
              withWordmark={true}
            />

            <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
              {isAr
                ? 'توفر راش إكس لصالونات ومراكز التجميل والسبا منظومة رقمية موحدة تغطي كافة تفاصيل العمليات اليومية، لتبسيط الإدارة ومضاعفة الإنتاجية وتقديم تجربة عملاء استثنائية.'
                : 'RASHX equips beauty salons, aesthetic clinics, and spas with a unified platform orchestrating every facet of daily operations to maximize productivity and customer retention.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {[
                isAr ? '10 أنظمة متكاملة ومترابطة' : '10 Natively Integrated Modules',
                isAr ? 'متوافقة بالكامل مع اللوائح السعودية' : 'Fully Compliant with Saudi Standards',
                isAr ? 'تعمل تحت نطاق فرعي بهوية منشأتك' : 'Branded Subdomain for Each Facility',
              ].map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#54453D]"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── Solutions 10-Grid Section ────────────────────────────── */}
      <section
        id="solutions-grid"
        className="relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <PageContainer size="full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {solutionsList.map((sol, idx) => {
              const solHref = (isAr ? sol.path : `${sol.path}?lang=en`) as Route;
              return (
                <Link
                  key={sol.slug}
                  href={solHref}
                  className="group rounded-3xl bg-[#FAF9F8] p-7 sm:p-9 flex flex-col justify-between transition-colors duration-200 hover:bg-[#F0C5AE]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-bold text-[#C78360]">
                        {sol.badge[lang]}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#75645B]/60">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-[#54453D] group-hover:text-[#2C4349] transition-colors">
                      {sol.title[lang]}
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-[#75645B]">
                      {sol.subtitle[lang]}
                    </p>

                    {/* Capabilities preview */}
                    <div className="mt-6 flex flex-wrap gap-2">
                      {sol.capabilities.slice(0, 3).map((cap) => (
                        <span
                          key={cap.id}
                          className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-[#54453D]"
                        >
                          {cap.title[lang]}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-5 flex items-center justify-between text-xs font-bold text-[#54453D] group-hover:text-[#C78360] transition-colors">
                    <span>{isAr ? 'استكشف تفاصيل النظام' : 'Explore System Details'}</span>
                    <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* ── Hub CTA ──────────────────────────────────────────────── */}
      <section
        id="hub-cta"
        className="relative bg-[#FAF9F8] py-16 sm:py-20 lg:py-24 transition-colors duration-200"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <PageContainer size="full">
          <div className="mx-auto max-w-4xl text-center">
            <SectionTitle
              eyebrow={isAr ? 'ابدأ تحولك الرقمي' : 'START YOUR DIGITAL TRANSFORMATION'}
              title={
                isAr
                  ? 'هل أنت مستعد لنقل إدارة صالونك إلى مستوى جديد من الاحترافية؟'
                  : 'Ready to Elevate Your Salon Management to the Next Level?'
              }
              align="center"
            />
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
              {isAr
                ? 'تواصل مع فريق راش إكس لمساعدتك على اختيار الحلول المناسبة لحجم منشأتك وفروعها.'
                : 'Connect with our team to discover the ideal module bundle tailored for your facility scale and branches.'}
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={(isAr ? routes.contact : `${routes.contact}?lang=en`) as Route}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
              >
                <span>{isAr ? 'تواصل معنا الآن' : 'Contact Us Now'}</span>
                <ArrowIcon className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href={(isAr ? routes.platform : `${routes.platform}?lang=en`) as Route}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
              >
                <Layers className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
                <span>{isAr ? 'استكشف معمارية المنظومة' : 'Explore Platform Architecture'}</span>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── Official Public Website Footer ───────────────────────── */}
      <Footer lang={lang} />
    </div>
  );
}
