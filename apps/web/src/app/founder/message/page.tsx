/**
 * RASHX Founder's Message Page (Executive Manifesto Redesign)
 *
 * Dedicated Route: /founder/message
 * Visual Architecture: Pure Flat — zero borders, zero rings, zero shadows, zero gradients.
 * Preserved Palette: #FAF9F8 · #FFFFFF · #F0C5AE · #54453D · #3D322C · #E8DFD8
 * Founder: Eng. Mohamed Abdo Rashad El-Bahy
 *
 * Layout per screen (single semantic DOM for SEO & readability):
 *  - mobile  (< md): Compact masthead + 3-cell meta strip → reading-first letter sheet → dark signature card → stacked nav
 *  - tablet  (md–lg): Wide masthead + horizontal meta bar → full-width letter folio → 3-col pledges strip → 2-col nav deck
 *  - desktop (lg+): 12-col split masthead (8+4) → 4-col sticky Signatory & Pledges rail + 8-col editorial letter folio
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
import { ArrowLeft, ArrowRight, Sparkles } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'رسالة المؤسس: م. محمد عبده رشاد البهي | RASHX — رؤية رقمنة قطاع التجميل'
      : "Founder's Message: Eng. Mohamed Abdo Rashad El-Bahy | RASHX",
    description: isAr
      ? 'رسالة مؤسس راش إكس المهندس محمد عبده رشاد البهي حول إطلاق المنظومة الرقمية الذكية لتطوير إدارة وتشغيل الصالونات والسبا في المملكة.'
      : 'Founder letter by Eng. Mohamed Abdo Rashad El-Bahy sharing the founding vision and operating thesis of RASHX.',
    path: '/founder/message',
    lang,
  });
}

export default async function FounderMessagePage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const founderHref = (isAr ? routes.founder.index : `${routes.founder.index}?lang=en`) as Route;
  const platformHref = (isAr ? routes.platform : `${routes.platform}?lang=en`) as Route;

  const content = isAr
    ? {
        badge: 'رسالة القيادة',
        title: 'رسالة المؤسس: م. محمد عبده رشاد البهي',
        subtitle:
          'رؤية هندسية طموحة انطلقت عام 2026 لإعادة صياغة التجربة التشغيلية والرقمية لقطاع التجميل والعناية الشخصية',
        meta: [
          { label: 'سنة التأسيس', value: '2026' },
          { label: 'المقر', value: 'الرياض، المملكة العربية السعودية' },
          { label: 'الجهة', value: 'راش إكس لتقنية المعلومات' },
        ],
        invocation: 'بسم الله الرحمن الرحيم،',
        paragraphs: [
          'عندما أسسنا RASHX في عام 2026، لم يكن هدفنا مجرد بناء لوحة تحكم تقليدية لحجز المواعيد أو إصدار الفواتير، بل كانت رؤيتنا تتجاوز ذلك بكثير: نحن نؤمن بأن قطاع العناية الشخصية والجمال في المملكة العربية السعودية والمنطقة يستحق بنية تقنية سيادية، متطورة، وقابلة للتوسع تنافس أحدث المنظومات العالمية.',
          'كل صالون وكل مركز تجميل هو منشأة ذات هوية فريدة وتجربة عملاء خاصة بها. ولذلك كان المبدأ الهندسي الأول في RASHX هو منح كل منشأة منظومتها الرقمية المستقلة: نطاقاً فرعياً مخصصاً، وهوية تجارية كاملة، وتطبيقاً للعملاء، ومساحة تشغيلية لمقدمي الخدمات، مربوطة بسلاسة بلوحة تحكم مركزية تمكّن الإدارة من التحكم في كل تفصيلة بدقة متناهية.',
          'إن التزامنا الراسخ بالامتثال للفوترة الإلكترونية (ZATCA)، وحماية البيانات، وأعلى معايير الاستقرار السحابي، هو العهد الذي نقطعه لكل شريك يضع ثقته في راش إكس لننمو معاً نحو مستقبل مشرق.',
        ],
        pledgesHeading: 'ركائز الرسالة',
        pledges: [
          {
            index: '01',
            title: 'بنية تقنية سيادية',
            detail: 'منظومة سحابية قابلة للتوسع بمعايير عالمية لقطاع التجميل.',
          },
          {
            index: '02',
            title: 'استقلالية كل منشأة',
            detail: 'نطاق فرعي مخصص، هوية كاملة، وتطبيقات مترابطة بلوحة مركزية.',
          },
          {
            index: '03',
            title: 'الامتثال والاستقرار',
            detail: 'التزام كامل بفوترة ZATCA، وحماية البيانات، والاعتمادية السحابية.',
          },
        ],
        signature: {
          monogram: 'م',
          name: 'م. محمد عبده رشاد البهي',
          role: 'المؤسس ورئيس المنظومة · راش إكس لتقنية المعلومات',
          place: 'الرياض · المملكة العربية السعودية (2026)',
        },
        nav: {
          bioLabel: 'السيرة الذاتية للمؤسس',
          bioSub: 'النشأة، الخلفية الأكاديمية، والخط الزمني',
          platformLabel: 'استكشف المنظومة',
          platformSub: 'تعرف على أدوات التشغيل المتكاملة لصالونك',
        },
      }
    : {
        badge: 'Executive Letter',
        title: "Founder's Message: Eng. Mohamed Abdo Rashad El-Bahy",
        subtitle:
          'An engineering vision founded in 2026 to reshape the operating architecture of the beauty and wellness sector',
        meta: [
          { label: 'Founded', value: '2026' },
          { label: 'Location', value: 'Riyadh, Kingdom of Saudi Arabia' },
          { label: 'Entity', value: 'RASHX Information Technology' },
        ],
        invocation: 'In the Name of God, Most Gracious, Most Merciful,',
        paragraphs: [
          'When we founded RASHX in 2026, our objective was never to build just another generic scheduling calendar or simple invoicing tool. We believed that the salon, spa, and beauty industry deserves sovereign, highly scalable, and world-class digital operating architecture.',
          'Every salon, clinic, and spa possesses a distinct brand identity and customer relationship. Our foundational engineering rule at RASHX is sovereign autonomy: granting each facility its dedicated subdomain, customized white-label portal, customer apps, and provider tools, tied directly to an intuitive central command center.',
          'Our steadfast dedication to ZATCA e-invoicing compliance, in-kingdom data residency, and cloud reliability represents our enduring promise to every business that places its trust in RASHX.',
        ],
        pledgesHeading: 'Core Founding Tenets',
        pledges: [
          {
            index: '01',
            title: 'Sovereign Architecture',
            detail: 'Scalable, world-class operating infrastructure built for beauty and wellness.',
          },
          {
            index: '02',
            title: 'Facility Autonomy',
            detail: 'Dedicated subdomains, white-label portals, and apps tied to one core.',
          },
          {
            index: '03',
            title: 'Compliance & Reliability',
            detail: 'Enduring commitment to ZATCA e-invoicing, data residency, and uptime.',
          },
        ],
        signature: {
          monogram: 'M',
          name: 'Eng. Mohamed Abdo Rashad El-Bahy',
          role: 'Founder & Chief Architect · RASHX Information Technology',
          place: 'Riyadh, Kingdom of Saudi Arabia (2026)',
        },
        nav: {
          bioLabel: 'Founder Biography',
          bioSub: 'Background, credentials, and timeline',
          platformLabel: 'Explore Platform',
          platformSub: 'Discover the unified salon operating tools',
        },
      };

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/founder/message" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        {/* ============================================================
            HERO MASTHEAD
            Mobile: stacked + compact meta strip
            Tablet: wide header + horizontal 3-col meta ribbon
            Desktop: 12-col split (8-col title + 4-col white meta card)
           ============================================================ */}
        <section
          className="relative overflow-hidden bg-[#FAF9F8] pb-10 pt-12 sm:pb-14 sm:pt-16 lg:pb-20 lg:pt-24"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {/* Subtle Flat Geometric Backdrop (Desktop) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -end-24 -top-24 hidden h-80 w-80 rounded-full bg-[#F0C5AE]/25 lg:block"
          />

          <PageContainer size="xl">
            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
              {/* Masthead Headline Column */}
              <div className="lg:col-span-8">


                <SectionTitle
                  as="h1"
                  title={content.title}
                  align="start"
                  withWordmark={false}
                />

                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#54453D]/80 sm:mt-5 sm:text-lg lg:text-xl">
                  {content.subtitle}
                </p>
              </div>

              {/* Letter Metadata Dossier: 3-col strip on Mobile/Tablet, Vertical White Card on Desktop */}
              <div className="lg:col-span-4">
                <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-1 lg:gap-3 lg:rounded-[1.75rem] lg:bg-white lg:p-6">
                  {content.meta.map((item, idx) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-white px-4 py-3 lg:bg-[#FAF9F8] lg:px-4 lg:py-3"
                    >
                      <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-[#54453D]/55">
                        {item.label}
                      </dt>
                      <dd
                        className={`mt-1 text-sm font-extrabold text-[#54453D] ${
                          idx === 0 ? 'font-mono' : ''
                        }`}
                      >
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ============================================================
            MAIN LETTER ARCHITECTURE
            Mobile/Tablet: Letter Folio → Pledges Strip → Signature → Nav
            Desktop (lg+): 4-col Sticky Signatory & Pledges + 8-col Folio
           ============================================================ */}
        <section
          className="bg-white py-12 sm:py-16 lg:py-24"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
              {/* ── LETTER FOLIO (Order 1 on Mobile/Tablet, 8 cols on Desktop) ── */}
              <article className="relative overflow-hidden rounded-[1.75rem] bg-[#FAF9F8] p-6 sm:rounded-[2rem] sm:p-10 lg:order-2 lg:col-span-8 lg:rounded-[2.25rem] lg:p-12 xl:p-14">
                {/* Flat Top Editorial Accent Bar */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-8 top-0 h-1.5 rounded-b-full bg-[#F0C5AE] sm:inset-x-12"
                />

                {/* Oversized Subtle Watermark Quote (Tablet & Desktop) */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-8 end-8 hidden select-none font-serif text-[12rem] leading-none text-[#F0C5AE]/25 sm:block"
                >
                  “
                </span>

                <div className="relative pt-2">
                  {/* Opening Invocation Pill + Quotation Mark */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-[#54453D] sm:text-base">
                      {content.invocation}
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-serif text-4xl leading-none text-[#54453D]/25 select-none sm:text-5xl"
                    >
                      “
                    </span>
                  </div>

                  {/* Full Verbatim Executive Letter */}
                  <blockquote className="mt-7 space-y-6 text-base leading-loose text-[#54453D] sm:mt-8 sm:space-y-7 sm:text-lg lg:text-[1.15rem] lg:leading-[2]">
                    {content.paragraphs.map((paragraph, idx) => (
                      <p
                        key={paragraph}
                        className={
                          idx === 0
                            ? 'rounded-2xl bg-white p-5 font-semibold leading-relaxed text-[#54453D] sm:p-7'
                            : 'px-1 text-[#54453D]/90'
                        }
                      >
                        {paragraph}
                      </p>
                    ))}
                  </blockquote>

                  {/* Formal Closing Sign-Off Strip (visible inside folio on all screens) */}
                  <div className="mt-10 rounded-2xl bg-white p-5 sm:mt-12 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
                    <div className="flex items-center gap-4">
                      <span
                        aria-hidden="true"
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0C5AE]/45 text-lg font-black text-[#54453D]"
                      >
                        {content.signature.monogram}
                      </span>
                      <div>
                        <span className="block text-base font-extrabold text-[#54453D] sm:text-lg">
                          {content.signature.name}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium text-[#54453D]/70 sm:text-sm">
                          {content.signature.role}
                        </span>
                      </div>
                    </div>

                    <span className="mt-3 inline-flex w-fit rounded-xl bg-[#FAF9F8] px-3.5 py-1.5 text-xs font-bold text-[#54453D]/65 sm:mt-0">
                      {content.signature.place}
                    </span>
                  </div>
                </div>
              </article>

              {/* ── EXECUTIVE MARGIN RAIL (Order 2 on Mobile/Tablet, Sticky 4 cols on Desktop) ── */}
              <aside className="space-y-5 lg:sticky lg:top-24 lg:order-1 lg:col-span-4">
                {/* Dark Espresso Signatory Plaque (Desktop primary focus, Mobile/Tablet highlight) */}
                <div className="relative overflow-hidden rounded-[1.75rem] bg-[#54453D] p-6 text-[#FAF9F8] sm:p-7 lg:rounded-[2rem]">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -end-14 -top-14 h-36 w-36 rounded-full bg-[#F0C5AE]/10"
                  />

                  <div className="relative flex items-center gap-4 lg:flex-col lg:items-start">
                    <span
                      aria-hidden="true"
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F0C5AE] text-xl font-black text-[#54453D]"
                    >
                      {content.signature.monogram}
                    </span>

                    <div>
                      <span className="inline-flex rounded-full bg-white/10 px-3 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-[#F0C5AE]">
                        {content.badge}
                      </span>
                      <p className="mt-2.5 text-lg font-extrabold leading-snug text-white">
                        {content.signature.name}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#FAF9F8]/75">
                        {content.signature.role}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-5 rounded-xl bg-white/[0.08] px-3.5 py-2.5 text-xs font-semibold text-[#F0C5AE]">
                    {content.signature.place}
                  </div>
                </div>

                {/* 3 Core Founding Pledges: Stacked on Mobile/Desktop, 3-Col Strip on Tablet */}
                <div className="rounded-[1.75rem] bg-[#FAF9F8] p-5 sm:p-6 lg:rounded-[2rem]">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#54453D]/70">
                      {content.pledgesHeading}
                    </span>
                    <span className="rounded-lg bg-white px-2.5 py-0.5 font-mono text-[0.7rem] font-black text-[#54453D]">
                      01 — 03
                    </span>
                  </div>

                  <ol className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-1">
                    {content.pledges.map((pledge) => (
                      <li
                        key={pledge.index}
                        className="rounded-2xl bg-white p-4"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0C5AE]/40 font-mono text-xs font-black text-[#54453D]">
                            {pledge.index}
                          </span>
                          <span className="text-sm font-extrabold text-[#54453D]">
                            {pledge.title}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-[#54453D]/70">
                          {pledge.detail}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>
            </div>

            {/* ============================================================
                BOTTOM EDITORIAL NAVIGATION DECK
                Mobile: stacked full-width cards
                Tablet & Desktop: balanced 2-column action cards
               ============================================================ */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 md:grid-cols-2 lg:mt-14 lg:gap-6">
              <Link
                href={founderHref}
                className="group flex items-center justify-between gap-4 rounded-2xl bg-[#54453D] p-6 text-white transition-colors duration-200 hover:bg-[#3D322C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D] sm:rounded-[1.75rem] sm:p-7"
              >
                <div>
                  <span className="block text-base font-extrabold sm:text-lg">
                    {content.nav.bioLabel}
                  </span>
                  <span className="mt-1 block text-xs text-[#FAF9F8]/75 sm:text-sm">
                    {content.nav.bioSub}
                  </span>
                </div>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0C5AE] text-[#54453D]">
                  <ArrowIcon
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>

              <Link
                href={platformHref}
                className="group flex items-center justify-between gap-4 rounded-2xl bg-[#FAF9F8] p-6 text-[#54453D] transition-colors duration-200 hover:bg-[#E8DFD8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D] sm:rounded-[1.75rem] sm:p-7"
              >
                <div>
                  <span className="block text-base font-extrabold sm:text-lg">
                    {content.nav.platformLabel}
                  </span>
                  <span className="mt-1 block text-xs text-[#54453D]/70 sm:text-sm">
                    {content.nav.platformSub}
                  </span>
                </div>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#54453D]">
                  <ArrowIcon
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}