/**
 * RASHX Founder & Leadership Page
 *
 * Dedicated Route: /founder
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Source of Truth: packages/content/src/corporate/founder.ts (one place for the
 * visible text, the FAQ and the Person JSON-LD, so they can never disagree).
 *
 * Search / answer-engine design:
 * - H1 carries the full name; "also known as" spellings are visible text, not hidden.
 * - The first paragraph is a self-contained definition an answer engine can quote.
 * - Age is computed from the birth date on every request (never hard-coded).
 * - Person + ProfilePage + FAQPage + Breadcrumb JSON-LD, all matching visible content.
 * - Photos come from public/images/founder/ and are skipped if the files are missing.
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

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/founder" lang={lang} />
      <JsonLd data={[personSchema, buildFaqSchema(faq, lang)]} />
      <Header lang={lang} />

      <div id="page-content">
        {/* Hero: name, definition, portrait */}
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="full">
            <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1fr_auto]">
              <div>
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

                <ul className="mt-6 flex flex-wrap gap-2 text-sm font-bold text-[#54453D]">
                  <li className="rounded-full bg-[#F0C5AE]/40 px-4 py-1.5">{ageText}</li>
                  <li className="rounded-full bg-[#F0C5AE]/40 px-4 py-1.5">
                    {isAr ? 'الدقهلية، مصر' : 'Dakahlia, Egypt'}
                  </li>
                  <li className="rounded-full bg-[#F0C5AE]/40 px-4 py-1.5">
                    {isAr ? 'جامعة EUL ليفكي' : 'EUL Lefke'}
                  </li>
                  <li className="rounded-full bg-[#F0C5AE]/40 px-4 py-1.5">
                    {isAr ? 'معتمد من IEEE' : 'IEEE-certified'}
                  </li>
                </ul>
              </div>

              <div className="mx-auto w-48 sm:w-56 md:w-64">
                {photos.main ? (
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#F0C5AE]/30">
                    <Image
                      src={photos.main}
                      alt={isAr ? `${displayName}، مؤسس راش إكس` : `${displayName}, founder of RASHX`}
                      fill
                      priority
                      sizes="(min-width: 768px) 256px, 224px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-[#F0C5AE]/30 text-6xl font-black text-[#54453D]"
                    aria-hidden="true"
                  >
                    {isAr ? 'م' : 'M'}
                  </div>
                )}
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl space-y-12 sm:space-y-16">
              {/* Who is he: the quotable definition + full bio */}
              <div>
                <h2 className="mb-4 text-xl font-bold text-[#54453D] sm:text-2xl">
                  {isAr ? `من هو ${displayName}؟` : `Who is ${displayName}?`}
                </h2>
                <div className="space-y-4 text-sm leading-relaxed text-[#75645B] sm:text-base">
                  {profile.intro[lang].map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Quick facts */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-10">
                <h2 className="mb-6 text-xl font-bold text-[#54453D] sm:text-2xl">
                  {isAr ? 'معلومات سريعة' : 'Quick facts'}
                </h2>
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-xs font-bold text-[#75645B]">{fact.label}</dt>
                      <dd className="mt-1 text-sm font-bold text-[#54453D] sm:text-base">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Highlights */}
              <div>
                <h2 className="mb-6 text-xl font-bold text-[#54453D] sm:text-2xl">
                  {isAr ? 'أبرز المحطات' : 'Highlights'}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {profile.highlights.map((item) => (
                    <div key={item.title.en} className="rounded-2xl bg-[#FAF9F8] p-6">
                      <h3 className="mb-1 text-sm font-bold text-[#54453D]">{item.title[lang]}</h3>
                      <p className="text-sm leading-relaxed text-[#75645B]">{item.text[lang]}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h2 className="mb-6 text-xl font-bold text-[#54453D] sm:text-2xl">
                  {isAr ? 'الخط الزمني' : 'Timeline'}
                </h2>
                <ol className="space-y-4">
                  {profile.milestones.map((item) => (
                    <li
                      key={item.when.en}
                      className="grid gap-1 rounded-2xl bg-[#FAF9F8] p-5 sm:grid-cols-[11rem_1fr] sm:gap-6"
                    >
                      <span className="text-sm font-black text-[#C78360]">{item.when[lang]}</span>
                      <span className="text-sm leading-relaxed text-[#54453D]">{item.text[lang]}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Expertise */}
              <div>
                <h2 className="mb-6 text-xl font-bold text-[#54453D] sm:text-2xl">
                  {isAr ? 'مجالات الخبرة' : 'Areas of expertise'}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {profile.expertise[lang].map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-[#FAF9F8] px-4 py-2 text-sm font-bold text-[#54453D]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gallery: only when real photos exist */}
              {photos.gallery.length > 0 && (
                <div>
                  <h2 className="mb-6 text-xl font-bold text-[#54453D] sm:text-2xl">
                    {isAr ? 'صور' : 'Photos'}
                  </h2>
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {photos.gallery.map((src, index) => (
                      <li
                        key={src}
                        className="relative aspect-square overflow-hidden rounded-2xl bg-[#FAF9F8]"
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
                          sizes="(min-width: 640px) 256px, 50vw"
                          className="object-cover"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vision */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-10">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0C5AE]/40 text-[#54453D]">
                  <Compass className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                </div>
                <h2 className="mb-4 text-xl font-bold text-[#54453D] sm:text-2xl">
                  {isAr ? 'فلسفة التطوير في RASHX' : 'The Engineering Philosophy of RASHX'}
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-[#75645B] sm:text-base">
                  {isAr
                    ? 'انطلقت راش إكس لتجاوز مفهوم «البرامج التقليدية» إلى بناء منظومة رقمية متكاملة تمنح كل صالون هويته المستقلة ونطاقه الفرعي الخاص، مع ربط دقيق بين إدارة الموارد البشرية، ونقاط البيع، والفوترة الإلكترونية، وتجربة العميل.'
                    : 'RASHX was conceived to move beyond rudimentary point solutions into an interconnected operating system providing private subdomain websites, staff apps, and ZATCA compliance.'}
                </p>
                <p className="text-sm leading-relaxed text-[#75645B] sm:text-base">
                  {isAr
                    ? 'الهدف الأسمى هو تمكين أصحاب المنشآت من التحكم الكامل بأعمالهم ورفع هوامش أرباحهم عبر أدوات ذكية مبنية على أسس برمجية صلبة ومعايير أمنية صارمة.'
                    : 'The ultimate objective is empowering salon founders with total operational command, enhanced profitability, and robust data isolation.'}
                </p>
              </div>

              {/* FAQ: same Q&A as the FAQPage JSON-LD */}
              <div>
                <h2 className="mb-6 text-xl font-bold text-[#54453D] sm:text-2xl">
                  {isAr ? 'أسئلة شائعة' : 'Frequently asked questions'}
                </h2>
                <div className="space-y-3">
                  {faq.map((item) => (
                    <details key={item.question} className="group rounded-2xl bg-[#FAF9F8] p-5">
                      <summary className="cursor-pointer list-none text-sm font-bold text-[#54453D] sm:text-base">
                        {item.question}
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-[#75645B]">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>

              {/* Official profiles */}
              <div>
                <h2 className="mb-4 text-xl font-bold text-[#54453D] sm:text-2xl">
                  {isAr ? 'الحسابات الرسمية' : 'Official profiles'}
                </h2>
                <ul className="flex flex-wrap gap-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="me noopener noreferrer"
                        className="inline-flex items-center rounded-xl bg-[#FAF9F8] px-5 py-3 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom actions */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
                <Link
                  href={aboutHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B] sm:w-auto"
                >
                  <span>{isAr ? 'تعرف على قصة راش إكس' : 'Explore About RASHX'}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href={messageHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FAF9F8] px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30 sm:w-auto"
                >
                  <span>{isAr ? 'رسالة المؤسس' : "Founder's message"}</span>
                </Link>
                <Link
                  href={teamHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FAF9F8] px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30 sm:w-auto"
                >
                  <span>{isAr ? 'فريق العمل' : 'The team'}</span>
                </Link>
                <Link
                  href={platformHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FAF9F8] px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30 sm:w-auto"
                >
                  <span>{isAr ? 'استكشف المنصة' : 'Explore the platform'}</span>
                </Link>
                <Link
                  href={contactHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FAF9F8] px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30 sm:w-auto"
                >
                  <span>{isAr ? 'تواصل معنا' : 'Contact'}</span>
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
