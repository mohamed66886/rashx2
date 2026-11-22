/**
 * RASHX Founder & Leadership Page (Editorial Dossier Redesign)
 *
 * Dedicated Route: /founder
 * Visual Architecture: Pure Flat — zero borders, zero rings, zero shadows, zero gradients.
 * Preserved Palette: #FAF9F8 · #FFFFFF · #F0C5AE · #54453D · #75645B · #C78360
 * Source of Truth: packages/content/src/corporate/founder.ts
 *
 * Search / answer-engine design:
 *  - Single semantic DOM (no duplicated H1, bio, facts, or FAQ for crawlers).
 *  - H1 carries the full name; "also known as" spellings are visible text.
 *  - First paragraph is a self-contained definition an answer engine can quote.
 *  - Age is computed from the birth date on every request.
 *  - Person + ProfilePage + FAQPage + Breadcrumb JSON-LD matching visible content.
 *
 * Layout per screen:
 *  - mobile  (< md): Portrait-first profile hero → single-column editorial reading flow → 2×2 link grid
 *  - tablet  (md–lg): 7+5 split hero + horizontal meta bar → side-by-side Bio/Facts → 2-col highlights
 *  - desktop (lg+): 12-col architectural hero → 7+5 Bio/Dossier → 4-col sticky headers + 8-col streams
 */

import { PageJsonLd, JsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { getFounderPhotos } from '@/lib/founder-photos';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, Compass } from '@rashx/icons';
import { routes } from '@/lib/routes';
import {
  calculateAge,
  formatAge,
  founderProfile,
  founderProfiles,
  getFounderFaq,
} from '@rashx/content';
import { SITE_URL } from '@rashx/seo/metadata';
import {
  buildFaqSchema,
  buildFounderProfileSchema,
} from '@rashx/seo/structured-data';

const NAME = {
  ar: 'محمد عبده رشاد البهي',
  en: 'Mohamed Abdo Rashad El-Bahy',
} as const;

const MONTH_YEAR = {
  ar: '1 ديسمبر 2004',
  en: '1 December 2004',
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const photos = getFounderPhotos();

  return generatePageMetadata({
    title: isAr
      ? 'محمد عبده رشاد البهي (محمد رشاد) | مبرمج ومؤسس راش إكس'
      : 'Mohamed Abdo Rashad El-Bahy | Software Developer & Founder of RASHX',
    description: isAr
      ? 'محمد عبده رشاد البهي، المعروف أيضًا بمحمد رشاد ومحمد البهي: مبرمج مصري من الدقهلية ومؤسس منصة راش إكس. درس علوم الحاسب في الجامعة الأوروبية في ليفكي (EUL) ومعتمد من IEEE.'
      : 'Mohamed Abdo Rashad El-Bahy (Mohamed Rashad, Mohamed El-Bahy): Egyptian software developer from Dakahlia and founder of RASHX. Studied Computer Science at EUL and IEEE-certified.',
    path: '/founder',
    lang,
    ogImage: photos.og ? `${SITE_URL}${photos.og}` : undefined,
  });
}

export default async function FounderPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const profile = founderProfile;
  const photos = getFounderPhotos();

  const age = calculateAge(profile.birth);
  const ageText = formatAge(age, lang);
  const faq = getFounderFaq(lang, ageText);
  const displayName = NAME[lang];
  const aliases = [...profile.aliases[lang], ...(isAr ? profile.aliases.en : [])];

  const aboutHref = (isAr ? routes.about : `${routes.about}?lang=en`) as Route;
  const platformHref = (isAr ? routes.platform : `${routes.platform}?lang=en`) as Route;
  const teamHref = (isAr ? routes.team : `${routes.team}?lang=en`) as Route;
  const messageHref = (
    isAr ? routes.founder.message : `${routes.founder.message}?lang=en`
  ) as Route;
  const contactHref = (isAr ? routes.contact : `${routes.contact}?lang=en`) as Route;

  const personSchema = buildFounderProfileSchema({
    lang,
    name: NAME.en,
    alternateNames: [NAME.ar, ...profile.aliases.ar, ...profile.aliases.en],
    birthDate: `${profile.birth.year}-${String(profile.birth.month).padStart(2, '0')}-${String(profile.birth.day).padStart(2, '0')}`,
    birthPlace: {
      name: "Mansha'at Abd El-Rahman, Dakarnis, Dakahlia, Egypt",
      addressRegion: 'Dakahlia',
      addressCountry: 'EG',
    },
    description: profile.summary[lang],
    images: photos.main ? [`${SITE_URL}${photos.main}`] : [],
    sameAs: [founderProfiles.linkedin, founderProfiles.instagram, founderProfiles.github],
    knowsAbout: profile.expertise.en,
    education: {
      name: 'European University of Lefke',
      faculty: 'Computer Science',
    },
  });

  const heroBadges = [
    ageText,
    isAr ? 'الدقهلية، مصر' : 'Dakahlia, Egypt',
    isAr ? 'جامعة EUL ليفكي' : 'EUL Lefke',
    isAr ? 'معتمد من IEEE' : 'IEEE-certified',
  ];

  const facts: Array<{ label: string; value: string }> = [
    { label: isAr ? 'الاسم الكامل' : 'Full name', value: displayName },
    { label: isAr ? 'يُعرف أيضًا بـ' : 'Also known as', value: aliases.join(isAr ? '، ' : ', ') },
    { label: isAr ? 'تاريخ الميلاد' : 'Born', value: MONTH_YEAR[lang] },
    { label: isAr ? 'العمر' : 'Age', value: ageText },
    { label: isAr ? 'البلد' : 'Country', value: isAr ? 'مصر' : 'Egypt' },
    { label: isAr ? 'القرية والمركز' : 'Hometown', value: profile.birthPlace[lang] },
    { label: isAr ? 'التعليم' : 'Education', value: profile.education[lang] },
    {
      label: isAr ? 'الخبرة' : 'Experience',
      value: isAr
        ? `أكثر من ${profile.yearsOfExperience} سنوات في البرمجيات`
        : `More than ${profile.yearsOfExperience} years in software`,
    },
    { label: isAr ? 'الشركة' : 'Company', value: isAr ? 'راش إكس (RASHX)، مؤسس' : 'RASHX, founder' },
  ];

  const links: Array<{ label: string; href: string }> = [
    { label: 'LinkedIn', href: founderProfiles.linkedin },
    { label: 'Instagram', href: founderProfiles.instagram },
    { label: 'GitHub', href: founderProfiles.github },
  ];

  const secondaryNav: Array<{ label: string; sub: string; href: Route }> = [
    {
      label: isAr ? 'رسالة المؤسس' : "Founder's message",
      sub: isAr ? 'رؤية البناء والقيادة' : 'Vision & leadership note',
      href: messageHref,
    },
    {
      label: isAr ? 'فريق العمل' : 'The team',
      sub: isAr ? 'الأشخاص خلف المنظومة' : 'The people behind RASHX',
      href: teamHref,
    },
    {
      label: isAr ? 'استكشف المنصة' : 'Explore the platform',
      sub: isAr ? 'أدوات إدارة الصالونات' : 'Salon operating tools',
      href: platformHref,
    },
    {
      label: isAr ? 'تواصل معنا' : 'Contact',
      sub: isAr ? 'تواصل مباشر مع الفريق' : 'Direct channel to us',
      href: contactHref,
    },
  ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/founder" lang={lang} />
      <JsonLd data={[personSchema, buildFaqSchema(faq, lang)]} />
      <Header lang={lang} />

      <div id="page-content">
        {/* ============================================================
            HERO: Portrait-First on Mobile → 7+5 on Tablet → 8+4 on Desktop
           ============================================================ */}
        <section
          className="relative overflow-hidden bg-[#FAF9F8] pb-12 pt-12 sm:pb-16 sm:pt-16 lg:pb-24 lg:pt-24"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {/* Subtle Flat Geometric Backdrop (Desktop) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -end-28 -top-28 hidden h-96 w-96 rounded-full bg-[#F0C5AE]/20 lg:block"
          />

          <PageContainer size="full">
            <div className="relative mx-auto max-w-6xl">
              <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10 lg:gap-14">
                {/* Portrait Pedestal: First on Mobile, End column on Tablet/Desktop */}
                <div className="order-first mx-auto w-56 sm:w-64 md:order-last md:col-span-5 md:w-full lg:col-span-4">
                  <div className="rounded-[2rem] bg-white p-3 sm:p-3.5 lg:p-4">
                    {photos.main ? (
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#F0C5AE]/30">
                        <Image
                          src={photos.main}
                          alt={
                            isAr
                              ? `${displayName}، مؤسس راش إكس`
                              : `${displayName}, founder of RASHX`
                          }
                          fill
                          priority
                          sizes="(min-width: 1024px) 340px, (min-width: 768px) 300px, 256px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex aspect-[4/5] items-center justify-center rounded-[1.5rem] bg-[#F0C5AE]/30 text-6xl font-black text-[#54453D]"
                        aria-hidden="true"
                      >
                        {isAr ? 'م' : 'M'}
                      </div>
                    )}

                    {/* Pedestal Caption Strip */}
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-[#FAF9F8] px-3.5 py-2.5">
                      <span className="text-xs font-extrabold tracking-tight text-[#54453D]">
                        {isAr ? 'مؤسس راش إكس' : 'Founder · RASHX'}
                      </span>
                      <span className="rounded-lg bg-[#F0C5AE]/40 px-2.5 py-0.5 font-mono text-[0.7rem] font-black text-[#54453D]">
                        +{profile.yearsOfExperience}y
                      </span>
                    </div>
                  </div>
                </div>

                {/* Editorial Identity Column */}
                <div className="md:col-span-7 lg:col-span-8">
                  <SectionTitle
                    as="h1"
                    eyebrow={isAr ? 'المؤسس والمبرمج' : 'FOUNDER & SOFTWARE DEVELOPER'}
                    title={displayName}
                    align="start"
                    withWordmark={false}
                  />

                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#75645B] sm:text-lg lg:text-xl">
                    {profile.summary[lang]}
                  </p>

                  {/* Visible Identity Badges: 2×2 Grid on Mobile, Flex Row on Tablet/Desktop */}
                  <ul className="mt-6 grid grid-cols-2 gap-2 text-xs font-bold text-[#54453D] sm:flex sm:flex-wrap sm:gap-2.5 sm:text-sm">
                    {heroBadges.map((badge) => (
                      <li
                        key={badge}
                        className="flex items-center justify-center rounded-xl bg-white px-3.5 py-2 text-center sm:rounded-full sm:bg-[#F0C5AE]/40 sm:px-4 sm:py-1.5"
                      >
                        {badge}
                      </li>
                    ))}
                  </ul>

                  {/* Quick Desktop / Tablet Action Links */}
                  <div className="mt-7 hidden flex-wrap items-center gap-3 md:flex">
                    <Link
                      href={messageHref}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#54453D] px-5 py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                    >
                      <span>{isAr ? 'رسالة المؤسس' : "Founder's message"}</span>
                      <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href={aboutHref}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/35"
                    >
                      <span>{isAr ? 'قصة راش إكس' : 'About RASHX'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ============================================================
            MAIN EDITORIAL CONTENT
           ============================================================ */}
        <section
          className="bg-white py-14 sm:py-20 lg:py-28"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="full">
            <div className="mx-auto max-w-6xl space-y-16 sm:space-y-20 lg:space-y-28">
              {/* ── BAND 1: Biography + Quick Facts Dossier ─────────── */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start lg:gap-12">
                {/* Bio Narrative (7 cols on md+) */}
                <div className="md:col-span-7">
                  <div className="mb-5 flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-8 rounded-full bg-[#F0C5AE]"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C78360]">
                      {isAr ? 'السيرة والتعريف' : 'BIOGRAPHY'}
                    </span>
                  </div>

                  <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-[#54453D] sm:text-3xl">
                    {isAr ? `من هو ${displayName}؟` : `Who is ${displayName}?`}
                  </h2>

                  <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#75645B] sm:text-base lg:text-[1.05rem] lg:leading-loose">
                    {profile.intro[lang].map((paragraph, idx) => (
                      <p
                        key={paragraph}
                        className={
                          idx === 0
                            ? 'rounded-2xl bg-[#FAF9F8] p-5 font-medium text-[#54453D] sm:p-6'
                            : ''
                        }
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Quick Facts Dossier Card (5 cols on md+) */}
                <aside className="rounded-[2rem] bg-[#FAF9F8] p-6 sm:p-7 md:col-span-5 lg:p-8">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-extrabold text-[#54453D] sm:text-xl">
                      {isAr ? 'معلومات سريعة' : 'Quick facts'}
                    </h2>
                    <span className="rounded-full bg-white px-3 py-1 font-mono text-[0.7rem] font-bold text-[#C78360]">
                      {isAr ? 'بطاقة تعريف' : 'DOSSIER'}
                    </span>
                  </div>

                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                    {facts.map((fact, idx) => (
                      <div
                        key={fact.label}
                        className={`rounded-2xl bg-white p-3.5 ${
                          idx === 0 || idx === 1 || idx === 6
                            ? 'sm:col-span-2 md:col-span-1 lg:col-span-2'
                            : ''
                        }`}
                      >
                        <dt className="text-[0.7rem] font-bold uppercase tracking-wider text-[#75645B]">
                          {fact.label}
                        </dt>
                        <dd className="mt-1 text-sm font-bold leading-snug text-[#54453D]">
                          {fact.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </aside>
              </div>

              {/* ── BAND 2: Highlights (Sticky 4-col header on Desktop) ─ */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-12">
                <div className="lg:sticky lg:top-24 lg:col-span-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF9F8] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#C78360]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                    {isAr ? 'مسيرة ومنجزات' : 'KEY MILESTONES'}
                  </span>
                  <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#54453D] sm:text-3xl">
                    {isAr ? 'أبرز المحطات' : 'Highlights'}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#75645B] sm:text-base">
                    {isAr
                      ? 'الركائز التقنية والأكاديمية التي شكّلت خبرة التأسيس وبناء المنظومة.'
                      : 'Core technical, academic, and entrepreneurial foundations behind RASHX.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:col-span-8">
                  {profile.highlights.map((item, idx) => {
                    const num = String(idx + 1).padStart(2, '0');
                    const accent = idx % 2 === 0 ? 'bg-[#F0C5AE]' : 'bg-[#C78360]/40';
                    return (
                      <article
                        key={item.title.en}
                        className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#FAF9F8] p-6 sm:p-7"
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-7 top-0 h-1.5 rounded-b-full ${accent}`}
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -bottom-3 end-4 select-none font-mono text-6xl font-black leading-none text-[#54453D]/[0.05]"
                        >
                          {num}
                        </span>

                        <div className="relative pt-1">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white font-mono text-xs font-black text-[#C78360]">
                            {num}
                          </span>
                          <h3 className="mt-4 text-base font-extrabold leading-snug text-[#54453D] sm:text-lg">
                            {item.title[lang]}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                            {item.text[lang]}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* ── BAND 3: Timeline (Vertical Spine on Mobile/Desktop) ─ */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-12">
                <div className="lg:sticky lg:top-24 lg:col-span-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF9F8] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#C78360]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                    {isAr ? 'التسلسل الزمني' : 'CHRONOLOGY'}
                  </span>
                  <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#54453D] sm:text-3xl">
                    {isAr ? 'الخط الزمني' : 'Timeline'}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#75645B] sm:text-base">
                    {isAr
                      ? 'تطور المسار العلمي والبرمجي حتى إطلاق راش إكس.'
                      : 'Progression across education, software engineering, and founding RASHX.'}
                  </p>
                </div>

                <ol className="relative space-y-4 lg:col-span-8">
                  {profile.milestones.map((item, idx) => {
                    const isLast = idx === profile.milestones.length - 1;
                    return (
                      <li key={item.when.en} className="relative flex items-stretch gap-4 sm:gap-5">
                        {/* Continuous Vertical Track */}
                        <div
                          aria-hidden="true"
                          className="flex flex-col items-center pt-5"
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F0C5AE]">
                            <span className="h-2 w-2 rounded-full bg-[#C78360]" />
                          </span>
                          {!isLast && (
                            <span className="mt-2 w-1 flex-1 rounded-full bg-[#F0C5AE]/45" />
                          )}
                        </div>

                        {/* Milestone Card */}
                        <div className="flex-1 rounded-2xl bg-[#FAF9F8] p-5 sm:grid sm:grid-cols-[10rem_1fr] sm:items-center sm:gap-6 sm:p-6">
                          <span className="inline-flex w-fit rounded-xl bg-white px-3 py-1.5 font-mono text-xs font-black text-[#C78360] sm:text-sm">
                            {item.when[lang]}
                          </span>
                          <span className="mt-2.5 block text-sm font-medium leading-relaxed text-[#54453D] sm:mt-0 sm:text-base">
                            {item.text[lang]}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* ── BAND 4: Areas of Expertise + Official Profiles ──── */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-stretch lg:gap-8">
                {/* Expertise (7 cols md, 8 cols lg) */}
                <div className="rounded-[2rem] bg-[#FAF9F8] p-6 sm:p-8 md:col-span-7 lg:col-span-8 lg:p-10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-extrabold text-[#54453D] sm:text-2xl">
                      {isAr ? 'مجالات الخبرة' : 'Areas of expertise'}
                    </h2>
                    <span className="rounded-full bg-white px-3 py-1 font-mono text-xs font-bold text-[#75645B]">
                      {String(profile.expertise[lang].length).padStart(2, '0')}
                    </span>
                  </div>

                  <ul className="mt-6 flex flex-wrap gap-2.5">
                    {profile.expertise[lang].map((item, idx) => (
                      <li
                        key={item}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#54453D]"
                      >
                        <span
                          aria-hidden="true"
                          className={`h-2 w-2 rounded-full ${
                            idx % 2 === 0 ? 'bg-[#F0C5AE]' : 'bg-[#C78360]'
                          }`}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Official Profiles (5 cols md, 4 cols lg) */}
                <div className="flex flex-col justify-between rounded-[2rem] bg-[#F0C5AE]/25 p-6 sm:p-8 md:col-span-5 lg:col-span-4 lg:p-10">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#54453D] sm:text-2xl">
                      {isAr ? 'الحسابات الرسمية' : 'Official profiles'}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                      {isAr
                        ? 'الروابط الموثّقة الوحيدة للمؤسس.'
                        : 'Verified external profiles of the founder.'}
                    </p>
                  </div>

                  <ul className="mt-6 space-y-2.5">
                    {links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="me noopener noreferrer"
                          className="group flex items-center justify-between rounded-xl bg-white px-4 py-3.5 text-sm font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#54453D] hover:text-white"
                        >
                          <span>{link.label}</span>
                          <ArrowIcon
                            className="h-4 w-4 text-[#C78360] transition-colors duration-200 group-hover:text-[#F0C5AE]"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── BAND 5: Gallery (only when real photos exist) ────── */}
              {photos.gallery.length > 0 && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-[#54453D] sm:text-3xl">
                      {isAr ? 'صور' : 'Photos'}
                    </h2>
                    <span className="rounded-full bg-[#FAF9F8] px-3.5 py-1 font-mono text-xs font-bold text-[#75645B]">
                      {String(photos.gallery.length).padStart(2, '0')}
                    </span>
                  </div>
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
                    {photos.gallery.map((src, index) => (
                      <li
                        key={src}
                        className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-[#FAF9F8]"
                      >
                        <Image
                          src={src}
                          alt={
                            isAr
                              ? `${displayName}، صورة ${index + 1}`
                              : `${displayName}, photo ${index + 1}`
                          }
                          fill
                          loading="lazy"
                          sizes="(min-width: 1024px) 360px, (min-width: 640px) 256px, 50vw"
                          className="object-cover"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── BAND 6: Vision Statement (#54453D Flat Espresso Deck) ─ */}
              <div className="relative overflow-hidden rounded-[2rem] bg-[#54453D] p-7 text-[#FAF9F8] sm:p-10 lg:rounded-[2.25rem] lg:p-12 xl:p-14">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-[#F0C5AE]/[0.08]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-24 -start-16 h-60 w-60 rounded-full bg-[#C78360]/[0.1]"
                />

                <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center lg:gap-12">
                  <div className="lg:col-span-5">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0C5AE] text-[#54453D]">
                      <Compass className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h2 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight text-balance sm:text-3xl xl:text-4xl">
                      {isAr ? 'فلسفة التطوير في RASHX' : 'The Engineering Philosophy of RASHX'}
                    </h2>
                  </div>

                  <div className="space-y-4 text-sm leading-relaxed text-[#FAF9F8]/85 sm:text-base lg:col-span-7 lg:text-lg">
                    <p className="rounded-2xl bg-white/[0.07] p-5 sm:p-6">
                      {isAr
                        ? 'انطلقت راش إكس لتجاوز مفهوم «البرامج التقليدية» إلى بناء منظومة رقمية متكاملة تمنح كل صالون هويته المستقلة ونطاقه الفرعي الخاص، مع ربط دقيق بين إدارة الموارد البشرية، ونقاط البيع، والفوترة الإلكترونية، وتجربة العميل.'
                        : 'RASHX was conceived to move beyond rudimentary point solutions into an interconnected operating system providing private subdomain websites, staff apps, and ZATCA compliance.'}
                    </p>
                    <p className="px-1">
                      {isAr
                        ? 'الهدف الأسمى هو تمكين أصحاب المنشآت من التحكم الكامل بأعمالهم ورفع هوامش أرباحهم عبر أدوات ذكية مبنية على أسس برمجية صلبة ومعايير أمنية صارمة.'
                        : 'The ultimate objective is empowering salon founders with total operational command, enhanced profitability, and robust data isolation.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── BAND 7: FAQ (Sticky 4-col header + 8-col Drawers) ── */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-12">
                <div className="lg:sticky lg:top-24 lg:col-span-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF9F8] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#C78360]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                    {isAr ? 'إجابات موثّقة' : 'VERIFIED ANSWERS'}
                  </span>
                  <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#54453D] sm:text-3xl">
                    {isAr ? 'أسئلة شائعة' : 'Frequently asked questions'}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#75645B] sm:text-base">
                    {isAr
                      ? 'إجابات مباشرة حول الخلفية الأكاديمية والمهنية ودور المؤسس في راش إكس.'
                      : 'Direct answers covering background, credentials, and leadership at RASHX.'}
                  </p>
                </div>

                <div className="space-y-3.5 lg:col-span-8">
                  {faq.map((item, idx) => {
                    const num = String(idx + 1).padStart(2, '0');
                    return (
                      <details
                        key={item.question}
                        className="group overflow-hidden rounded-2xl bg-[#FAF9F8] transition-colors duration-200 open:bg-[#F0C5AE]/20"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 select-none rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D] sm:p-6 [&::-webkit-details-marker]:hidden">
                          <div className="flex min-w-0 items-center gap-3.5">
                            <span
                              aria-hidden="true"
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white font-mono text-xs font-black text-[#54453D] transition-colors duration-200 group-open:bg-[#F0C5AE]"
                            >
                              {num}
                            </span>
                            <span className="text-sm font-bold leading-snug text-[#54453D] transition-colors duration-200 group-open:text-[#C78360] sm:text-base lg:text-lg">
                              {item.question}
                            </span>
                          </div>
                          <span
                            aria-hidden="true"
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#54453D] transition-all duration-200 group-open:rotate-180 group-open:bg-[#54453D] group-open:text-[#FAF9F8]"
                          >
                            <svg
                              viewBox="0 0 16 16"
                              className="h-4 w-4"
                              fill="none"
                            >
                              <path
                                d="M4 6l4 4 4-4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                          <div className="rounded-xl bg-white p-4 sm:p-5">
                            <p className="text-sm leading-relaxed text-[#75645B] sm:text-base">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>

              {/* ── BAND 8: Bottom Navigation Deck ──────────────────── */}
              <div className="rounded-[2rem] bg-[#FAF9F8] p-5 sm:p-7 lg:p-8">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
                  {/* Primary Featured Route */}
                  <Link
                    href={aboutHref}
                    className="group flex flex-col justify-between rounded-2xl bg-[#54453D] p-6 text-white transition-colors duration-200 hover:bg-[#75645B] lg:col-span-4 lg:p-7"
                  >
                    <span className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#F0C5AE]">
                      RASHX
                    </span>
                    <div className="mt-6 flex items-end justify-between gap-4">
                      <div>
                        <span className="block text-lg font-extrabold leading-snug sm:text-xl">
                          {isAr ? 'تعرف على قصة راش إكس' : 'Explore About RASHX'}
                        </span>
                        <span className="mt-1 block text-xs text-[#FAF9F8]/75">
                          {isAr ? 'النشأة، الرؤية، والرسالة' : 'Origin, vision, and mission'}
                        </span>
                      </div>
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0C5AE] text-[#54453D]">
                        <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>

                  {/* 4 Secondary Routes: 2×2 Grid on Mobile/Desktop, 2×2 on Tablet */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-8">
                    {secondaryNav.map((nav) => (
                      <Link
                        key={nav.href}
                        href={nav.href}
                        className="group flex flex-col justify-between rounded-2xl bg-white p-4 transition-colors duration-200 hover:bg-[#F0C5AE]/30 sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-extrabold text-[#54453D] sm:text-base">
                            {nav.label}
                          </span>
                          <ArrowIcon
                            className="h-4 w-4 shrink-0 text-[#C78360] transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="mt-2 block text-xs leading-snug text-[#75645B]">
                          {nav.sub}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}