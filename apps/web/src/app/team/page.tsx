/**
 * RASHX Team Page (Editorial People & Squads Redesign)
 *
 * Dedicated Route: /team
 * Visual Architecture: Pure Flat — zero borders, zero rings, zero shadows, zero gradients.
 * Preserved Palette: #FAF9F8 · #FFFFFF · #F0C5AE · #91B8C0 · #CADEE2 · #54453D · #75645B · #C78360 · #2C4349
 *
 * Factual Integrity & Real Photos:
 *  - Founder portrait loads dynamically from `public/images/founder/` via `getFounderPhotos()`.
 *  - Core team cards read from `TEAM_MEMBERS` and resolve real images in `public/images/team/` safely
 *    (falling back to a flat monogram if a file is not uploaded yet — never fabricated stock faces).
 *
 * Layout per screen (single semantic DOM for SEO):
 *  - mobile  (< md): Compact hero → portrait-first founder card → 1-col member cards → stacked squads → dark deck
 *  - tablet  (md–lg): Centered hero + 3-col bar → 5+7 founder card → 2-col member grid → 1+2 balanced squads
 *  - desktop (lg+): 12-col split hero (8+4) → 12-col founder flagship → 3-col member grid → 3-col squads → 7+5 deck
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { PageJsonLd } from '@/components/seo';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { getFounderPhotos } from '@/lib/founder-photos';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from '@rashx/icons';
import { routes } from '@/lib/routes';
import { founderProfile, founderProfiles } from '@rashx/content';

interface TeamMember {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  role: {
    ar: string;
    en: string;
  };
  department: {
    ar: string;
    en: string;
  };
  bio: {
    ar: string;
    en: string;
  };
  location?: {
    ar: string;
    en: string;
  };
  /** Path under `public/`, e.g. `/images/team/member-name.jpg` */
  photo?: string;
  skills: {
    ar: string[];
    en: string[];
  };
  links?: {
    linkedin?: string;
    github?: string;
  };
  accentTone?: 'peach' | 'teal';
}

/**
 * Source of truth for verified core team members (excluding the founder spotlight above).
 * Add real team members here and place their portraits under `public/images/team/`.
 *
 * Example entry:
 * {
 *   id: 'member-slug',
 *   name: { ar: 'الاسم الكامل', en: 'Full Name' },
 *   role: { ar: 'مهندس برمجيات أول', en: 'Senior Software Engineer' },
 *   department: { ar: 'الهندسة السحابية', en: 'Cloud Architecture' },
 *   bio: { ar: 'نبذة حقيقية مختصرة عن الدور والمسؤولية.', en: 'Short factual role summary.' },
 *   location: { ar: 'الرياض، السعودية', en: 'Riyadh, KSA' },
 *   photo: '/images/team/member-slug.jpg',
 *   skills: { ar: ['البنية السحابية', 'قواعد البيانات'], en: ['Cloud Systems', 'Databases'] },
 *   links: { linkedin: 'https://linkedin.com/in/...', github: 'https://github.com/...' },
 *   accentTone: 'teal',
 * }
 */
const TEAM_MEMBERS: TeamMember[] = [];

function resolveTeamPhoto(publicPath?: string): string | null {
  if (!publicPath) return null;
  const relativePath = publicPath.replace(/^\/+/, '');
  const fullPath = join(process.cwd(), 'public', relativePath);
  return existsSync(fullPath) ? publicPath : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'فريق العمل | RASHX — كفاءات تقنية وتشغيلية مكرسة لخدمتكم'
      : 'Our Team | RASHX — Dedicated Engineering & Operational Specialists',
    description: isAr
      ? 'تعرف على الكفاءات الهندسية والاستشارية القائمة على تطوير وتشغيل منظومة راش إكس لخدمة الصالونات في المملكة.'
      : 'Meet the engineering and salon operations team powering RASHX across Saudi Arabia.',
    path: '/team',
    lang,
  });
}

export default async function TeamPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const founderPhotos = getFounderPhotos();
  const founderHref = (isAr ? routes.founder.index : `${routes.founder.index}?lang=en`) as Route;
  const messageHref = (
    isAr ? routes.founder.message : `${routes.founder.message}?lang=en`
  ) as Route;
  const aboutHref = (isAr ? routes.about : `${routes.about}?lang=en`) as Route;
  const contactHref = (isAr ? routes.contact : `${routes.contact}?lang=en`) as Route;
  const supportEmail = 'hello@rashx.com';

  const heroMeta = isAr
    ? [
        { label: 'التخصصات الأساسية', value: '03 فرق متكاملة' },
        { label: 'الامتثال التنظيمي', value: 'معايير ZATCA' },
        { label: 'الجاهزية التشغيلية', value: '99.9% استقرار سحابي' },
      ]
    : [
        { label: 'Core Disciplines', value: '03 Specialized Squads' },
        { label: 'Regulatory Alignment', value: 'ZATCA Standards' },
        { label: 'Cloud Reliability', value: '99.9% Availability' },
      ];

  const founderLinks = [
    { label: 'LinkedIn', href: founderProfiles.linkedin },
    { label: 'GitHub', href: founderProfiles.github },
    { label: 'Instagram', href: founderProfiles.instagram },
  ];

  const founderSkills = founderProfile.expertise[lang].slice(0, 4);

  const departments = isAr
    ? [
        {
          index: '01',
          icon: Workflow,
          badge: 'البنية التقنية',
          title: 'فريق الهندسة السحابية',
          description:
            'تطوير وتحديث المنظومة وضمان الجاهزية 99.9% مع عزل كامل وآمن لبيانات كل صالون.',
          focusPoints: [
            'معمارية سحابية عالية التوافر',
            'حماية وعزل بيانات المنشآت',
            'تحديثات مستمرة بدون توقف الخدمة',
          ],
          iconTone: 'bg-[#91B8C0]/30 text-[#2C4349]',
          accentBar: 'bg-[#91B8C0]',
        },
        {
          index: '02',
          icon: ShieldCheck,
          badge: 'الامتثال المالي',
          title: 'فريق الامتثال وZATCA',
          description:
            'متابعة المتطلبات الضريبية والربط المعتمد لضمان دقة الفواتير الإلكترونية والتقارير.',
          focusPoints: [
            'مواءمة متطلبات الفوترة الإلكترونية',
            'دقة ضريبة القيمة المضافة والريال السعودي',
            'مراجعة مستمرة للتحديثات التنظيمية',
          ],
          iconTone: 'bg-[#F0C5AE]/50 text-[#54453D]',
          accentBar: 'bg-[#F0C5AE]',
        },
        {
          index: '03',
          icon: HeartHandshake,
          badge: 'التشغيل والدعم',
          title: 'نجاح العملاء والتهيئة',
          description:
            'تدريب الكوادر وترحيل البيانات والدعم الفني المباشر لضمان انطلاقة هادئة لكل صالون.',
          focusPoints: [
            'تهيئة الفروع وترحيل قوائم الخدمات',
            'تدريب الاستقبال والأخصائيات عملياً',
            'مساندة تشغيلية مباشرة من اليوم الأول',
          ],
          iconTone: 'bg-[#CADEE2] text-[#2C4349]',
          accentBar: 'bg-[#CADEE2]',
        },
      ]
    : [
        {
          index: '01',
          icon: Workflow,
          badge: 'INFRASTRUCTURE',
          title: 'Cloud Architecture',
          description:
            'Microservices & high-availability uptime engineered with strict per-salon data isolation.',
          focusPoints: [
            '99.9% high-availability cloud backbone',
            'Strict multi-tenant data isolation',
            'Zero-downtime platform updates',
          ],
          iconTone: 'bg-[#91B8C0]/30 text-[#2C4349]',
          accentBar: 'bg-[#91B8C0]',
        },
        {
          index: '02',
          icon: ShieldCheck,
          badge: 'FISCAL RIGOR',
          title: 'ZATCA Compliance',
          description:
            'Continuous fiscal alignment & clearance keeping e-invoicing and reporting audit-ready.',
          focusPoints: [
            'E-invoicing architectural compliance',
            'Accurate VAT & SAR calculation flows',
            'Ongoing regulatory specification tracking',
          ],
          iconTone: 'bg-[#F0C5AE]/50 text-[#54453D]',
          accentBar: 'bg-[#F0C5AE]',
        },
        {
          index: '03',
          icon: HeartHandshake,
          badge: 'OPERATIONS & CARE',
          title: 'Customer Success',
          description:
            'Specialist training & seamless data migration ensuring calm daily operations from day one.',
          focusPoints: [
            'Branch setup & service catalog migration',
            'Hands-on front-desk & specialist training',
            'Direct onboarding support from day one',
          ],
          iconTone: 'bg-[#CADEE2] text-[#2C4349]',
          accentBar: 'bg-[#CADEE2]',
        },
      ];

  const resolvedMembers = TEAM_MEMBERS.map((member) => ({
    ...member,
    resolvedPhoto: resolveTeamPhoto(member.photo),
  }));

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/team" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        {/* ============================================================
            HERO MASTHEAD
            Mobile: stacked headline + 3-row highlights
            Tablet: centered headline + 3-col horizontal bar
            Desktop: 12-col split (8-col headline + 4-col white card)
           ============================================================ */}
        <section
          className="relative overflow-hidden bg-[#FAF9F8] pb-12 pt-12 sm:pb-16 sm:pt-16 lg:pb-24 lg:pt-24"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -end-28 -top-28 hidden h-96 w-96 rounded-full bg-[#F0C5AE]/20 lg:block"
          />

          <PageContainer size="full">
            <div className="relative mx-auto max-w-6xl">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
                <div className="text-center lg:col-span-8 lg:text-start">
                  <SectionTitle
                    as="h1"
                    eyebrow={isAr ? 'الكفاءات والخبرات' : 'RASHX TEAM'}
                    title={
                      isAr
                        ? 'كفاءات هندسية وتشغيلية تقود التحول الرقمي للصالونات'
                        : 'Engineering & Operational Talent Digitizing Beauty Facilities'
                    }
                    align="start"
                    withWordmark={true}
                  />

                  <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[#75645B] sm:text-lg lg:mx-0 lg:text-xl">
                    {isAr
                      ? 'يجمع فريقنا بين الخبرة العميقة في هندسة البرمجيات السحابية والامتثال الضريبي (ZATCA)، والفهم الواقعي لأدق تفاصيل تشغيل الصالونات اليومية.'
                      : 'Our team blends deep distributed cloud architecture and ZATCA compliance expertise with practical salon operations fluency.'}
                  </p>
                </div>

                {/* Operational Identity Card */}
                <div className="lg:col-span-4">
                  <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-1 lg:gap-3 lg:rounded-[1.75rem] lg:bg-white lg:p-6">
                    {heroMeta.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl bg-white px-4 py-3.5 text-center sm:text-start lg:bg-[#FAF9F8]"
                      >
                        <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-[#75645B]">
                          {item.label}
                        </dt>
                        <dd className="mt-1 text-sm font-extrabold text-[#54453D]">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ============================================================
            MAIN TEAM CONTENT
           ============================================================ */}
        <section
          className="bg-white py-14 sm:py-20 lg:py-28"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="full">
            <div className="mx-auto max-w-6xl space-y-16 sm:space-y-20 lg:space-y-28">
              {/* ── BAND 1: Executive Leadership & Founder Portrait ───── */}
              <div>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-8 rounded-full bg-[#F0C5AE]"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C78360]">
                      {isAr ? 'القيادة والتأسيس' : 'EXECUTIVE LEADERSHIP'}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#FAF9F8] px-3.5 py-1 text-xs font-bold text-[#75645B]">
                    {isAr ? 'المؤسس ورئيس المنظومة' : 'Founder & Chief Architect'}
                  </span>
                </div>

                <article className="relative overflow-hidden rounded-[2rem] bg-[#FAF9F8] p-5 sm:p-8 lg:rounded-[2.25rem] lg:p-10 xl:p-12">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-16 -end-16 hidden h-64 w-64 rounded-full bg-[#F0C5AE]/20 lg:block"
                  />

                  <div className="relative grid grid-cols-1 items-center gap-7 md:grid-cols-12 md:gap-8 lg:gap-12">
                    {/* Real Founder Portrait Pedestal */}
                    <div className="mx-auto w-56 sm:w-64 md:col-span-5 md:w-full lg:col-span-4">
                      <div className="rounded-[1.75rem] bg-white p-3">
                        {founderPhotos.main ? (
                          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[#F0C5AE]/30">
                            <Image
                              src={founderPhotos.main}
                              alt={
                                isAr
                                  ? 'م. محمد عبده رشاد البهي، مؤسس راش إكس'
                                  : 'Eng. Mohamed Abdo Rashad El-Bahy, Founder of RASHX'
                              }
                              fill
                              priority
                              sizes="(min-width: 1024px) 340px, (min-width: 768px) 280px, 256px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            aria-hidden="true"
                            className="flex aspect-[4/5] items-center justify-center rounded-[1.25rem] bg-[#F0C5AE]/30 text-6xl font-black text-[#54453D]"
                          >
                            {isAr ? 'م' : 'M'}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#FAF9F8] px-3.5 py-2">
                          <span className="text-xs font-extrabold text-[#54453D]">
                            {isAr ? 'راش إكس · RASHX' : 'RASHX'}
                          </span>
                          <span className="rounded-lg bg-[#F0C5AE]/45 px-2 py-0.5 font-mono text-[0.7rem] font-black text-[#54453D]">
                            +{founderProfile.yearsOfExperience}y
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Founder Narrative, Skills & Links */}
                    <div className="md:col-span-7 lg:col-span-8">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3.5 py-1 text-xs font-bold text-[#54453D]">
                        <span>{isAr ? 'القيادة والتأسيس' : 'Executive Leadership'}</span>
                      </span>

                      <h2 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-[#54453D] sm:text-3xl xl:text-4xl">
                        {isAr ? 'م. محمد عبده رشاد البهي' : 'Eng. Mohamed Abdo Rashad El-Bahy'}
                      </h2>

                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#75645B] sm:text-base lg:text-lg">
                        {isAr
                          ? 'مؤسس المنظومة ومهندس البنية السحابية لـ RASHX، قاد رؤية المنصة لتوحيد تشغيل الصالونات تحت مظلة رقمية موحدة.'
                          : 'Founder and chief cloud architect of RASHX, driving the unified platform vision for the Saudi beauty industry.'}
                      </p>

                      {/* Verified Core Expertise Tags */}
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {founderSkills.map((skill) => (
                          <li
                            key={skill}
                            className="rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-[#54453D] sm:text-sm"
                          >
                            {skill}
                          </li>
                        ))}
                      </ul>

                      {/* Official External Profiles */}
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        {founderLinks.map((social) => (
                          <a
                            key={social.href}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-lg bg-white/80 px-3 py-1.5 text-xs font-bold text-[#75645B] transition-colors duration-200 hover:bg-white hover:text-[#54453D]"
                          >
                            {social.label}
                          </a>
                        ))}
                      </div>

                      {/* Profile & Letter Actions */}
                      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Link
                          href={founderHref}
                          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-sm font-extrabold text-white transition-colors duration-200 hover:bg-[#75645B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D]"
                        >
                          <span>{isAr ? 'الملف الشخصي للمؤسس' : 'Founder Profile'}</span>
                          <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                        </Link>

                        <Link
                          href={messageHref}
                          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D]"
                        >
                          <span>{isAr ? 'رسالة المؤسس' : "Founder's Message"}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              {/* ── BAND 2: Core Team Members Grid (Auto-Renders with Real Members & Photos) ── */}
              {resolvedMembers.length > 0 && (
                <div>
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF9F8] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#2C4349]">
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{isAr ? 'أعضاء الفريق' : 'CORE TEAM'}</span>
                      </span>
                      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#54453D] sm:text-3xl">
                        {isAr ? 'الكفاءات القائمة على المنظومة' : 'The People Behind RASHX'}
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#FAF9F8] px-3.5 py-1.5 font-mono text-xs font-bold text-[#75645B]">
                      {String(resolvedMembers.length).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                    {resolvedMembers.map((member, idx) => {
                      const isPeach =
                        member.accentTone === 'peach' ||
                        (!member.accentTone && idx % 2 === 0);
                      const accentBar = isPeach ? 'bg-[#F0C5AE]' : 'bg-[#91B8C0]';
                      const badgeTone = isPeach
                        ? 'bg-[#F0C5AE]/40 text-[#54453D]'
                        : 'bg-[#91B8C0]/30 text-[#2C4349]';
                      const memberName = member.name[lang];

                      return (
                        <article
                          key={member.id}
                          className="relative flex flex-col overflow-hidden rounded-[1.75rem] bg-[#FAF9F8] p-5 sm:p-6"
                        >
                          <span
                            aria-hidden="true"
                            className={`absolute inset-x-7 top-0 h-1.5 rounded-b-full ${accentBar}`}
                          />

                          {/* Member Portrait (4:5) */}
                          <div className="mt-1 rounded-2xl bg-white p-2.5">
                            {member.resolvedPhoto ? (
                              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#FAF9F8]">
                                <Image
                                  src={member.resolvedPhoto}
                                  alt={`${memberName} — ${member.role[lang]}`}
                                  fill
                                  loading="lazy"
                                  sizes="(min-width: 1024px) 340px, (min-width: 768px) 45vw, 90vw"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                aria-hidden="true"
                                className={`flex aspect-[4/5] items-center justify-center rounded-xl text-5xl font-black ${badgeTone}`}
                              >
                                {memberName.charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Identity & Role */}
                          <div className="mt-5 flex flex-1 flex-col">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-[0.7rem] font-bold ${badgeTone}`}
                              >
                                {member.department[lang]}
                              </span>
                              {member.location && (
                                <span className="text-[0.7rem] font-semibold text-[#75645B]">
                                  {member.location[lang]}
                                </span>
                              )}
                            </div>

                            <h3 className="mt-3 text-xl font-extrabold text-[#54453D]">
                              {memberName}
                            </h3>
                            <p className="mt-0.5 text-sm font-bold text-[#C78360]">
                              {member.role[lang]}
                            </p>

                            <p className="mt-3 text-sm leading-relaxed text-[#75645B]">
                              {member.bio[lang]}
                            </p>

                            {/* Skills */}
                            <ul className="mt-4 flex flex-wrap gap-1.5">
                              {member.skills[lang].map((skill) => (
                                <li
                                  key={skill}
                                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-[#54453D]"
                                >
                                  {skill}
                                </li>
                              ))}
                            </ul>

                            {/* Optional Links */}
                            {member.links &&
                              (member.links.linkedin || member.links.github) && (
                                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                                  {member.links.linkedin && (
                                    <a
                                      href={member.links.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#54453D] hover:text-white"
                                    >
                                      LinkedIn
                                    </a>
                                  )}
                                  {member.links.github && (
                                    <a
                                      href={member.links.github}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#54453D] hover:text-white"
                                    >
                                      GitHub
                                    </a>
                                  )}
                                </div>
                              )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── BAND 3: Specialized Operational Squads ────────────── */}
              <div>
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF9F8] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#2C4349]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#91B8C0]" />
                      {isAr ? 'الهيكل التشغيلي' : 'SPECIALIZED SQUADS'}
                    </span>
                    <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#54453D] sm:text-3xl">
                      {isAr
                        ? 'ثلاثة مسارات متكاملة تضمن استقرار صالونك'
                        : 'Three integrated disciplines powering your salon'}
                    </h2>
                  </div>
                  <p className="max-w-md text-sm leading-relaxed text-[#75645B]">
                    {isAr
                      ? 'كل مسار مسؤول عن جانب حرج من تجربة التشغيل اليومية، من الخوادم حتى تدريب فريق الاستقبال.'
                      : 'Each squad owns a critical layer of daily salon reliability, from cloud infrastructure to hands-on onboarding.'}
                  </p>
                </div>

                {/* Mobile: 1-col | Tablet: 1+2 balanced bento | Desktop: 3 equal cols */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {departments.map((dept, idx) => {
                    const DeptIcon = dept.icon;
                    const isTabletWide = idx === 0;

                    return (
                      <article
                        key={dept.index}
                        className={`relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#FAF9F8] p-6 sm:p-7 lg:rounded-[2rem] lg:p-8 ${
                          isTabletWide ? 'md:col-span-2 lg:col-span-1' : ''
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-8 top-0 h-1.5 rounded-b-full ${dept.accentBar}`}
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -bottom-4 end-5 select-none font-mono text-7xl font-black leading-none text-[#54453D]/[0.04]"
                        >
                          {dept.index}
                        </span>

                        <div
                          className={`relative pt-1 ${
                            isTabletWide
                              ? 'md:grid md:grid-cols-12 md:items-center md:gap-6 lg:block'
                              : ''
                          }`}
                        >
                          <div className={isTabletWide ? 'md:col-span-6 lg:col-span-12' : ''}>
                            <div className="flex items-center justify-between gap-3">
                              <span
                                className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${dept.iconTone}`}
                              >
                                <DeptIcon className="h-6 w-6" aria-hidden="true" />
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#75645B]">
                                {dept.badge}
                              </span>
                            </div>

                            <h3 className="mt-5 text-xl font-extrabold text-[#54453D]">
                              {dept.title}
                            </h3>

                            <p className="mt-2.5 text-sm leading-relaxed text-[#75645B]">
                              {dept.description}
                            </p>
                          </div>

                          <ul
                            className={`mt-5 space-y-2 rounded-2xl bg-white p-4 ${
                              isTabletWide ? 'md:col-span-6 md:mt-0 lg:mt-6' : ''
                            }`}
                          >
                            {dept.focusPoints.map((point) => (
                              <li
                                key={point}
                                className="flex items-start gap-2.5 text-xs font-semibold leading-relaxed text-[#54453D]"
                              >
                                <CheckCircle2
                                  className="mt-0.5 h-4 w-4 shrink-0 text-[#2C4349]"
                                  aria-hidden="true"
                                />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* ── BAND 4: Connect & Join RASHX Deck (#54453D Flat Espresso) ── */}
              <div className="relative overflow-hidden rounded-[2rem] bg-[#54453D] p-6 text-[#FAF9F8] sm:p-9 lg:rounded-[2.25rem] lg:p-12">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -end-20 -top-20 h-60 w-60 rounded-full bg-[#F0C5AE]/[0.08]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-24 -start-16 h-56 w-56 rounded-full bg-[#91B8C0]/[0.08]"
                />

                <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                  <div className="lg:col-span-7">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F0C5AE]">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isAr ? 'ننمو معاً' : 'WORK WITH US'}</span>
                    </span>

                    <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-balance sm:text-3xl xl:text-4xl">
                      {isAr
                        ? 'هل ترغب بالتواصل مع فريقنا أو الانضمام لمسيرة راش إكس؟'
                        : 'Want to connect with our team or join the RASHX journey?'}
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#FAF9F8]/80 sm:text-base lg:text-lg">
                      {isAr
                        ? 'سواء كنت تدير صالوناً وتبحث عن دعم وتهيئة مباشرة، أو كفاءة تقنية تؤمن ببناء منتجات عربية بمعايير عالمية، يسعدنا تواصلك.'
                        : 'Whether you run a salon seeking hands-on onboarding or you are a builder passionate about crafting category-defining software, we would love to hear from you.'}
                    </p>
                  </div>

                  <div className="space-y-3 lg:col-span-5">
                    <Link
                      href={contactHref}
                      className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#F0C5AE] px-6 py-3.5 text-sm font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0C5AE] sm:text-base"
                    >
                      <span>{isAr ? 'تواصل مع الفريق' : 'Contact the Team'}</span>
                      <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                    </Link>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <a
                        href={`mailto:${supportEmail}`}
                        dir="ltr"
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#91B8C0] px-4 py-3 text-xs font-extrabold text-[#2C4349] transition-colors duration-200 hover:bg-[#6E9BA4] sm:text-sm"
                      >
                        <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{supportEmail}</span>
                      </a>

                      <Link
                        href={aboutHref}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-extrabold text-[#FAF9F8] transition-colors duration-200 hover:bg-white/20 sm:text-sm"
                      >
                        <span>{isAr ? 'قصة راش إكس' : 'About RASHX'}</span>
                      </Link>
                    </div>
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