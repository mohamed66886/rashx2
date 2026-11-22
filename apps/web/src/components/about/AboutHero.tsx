import Link from 'next/link';
import { PageContainer } from '@rashx/ui';
import { ArrowRight, ArrowLeft, CheckCircle2 } from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface AboutHeroProps {
  lang: Lang;
  className?: string;
}

const HIGHLIGHT_ACCENTS = [
  'bg-[#F0C5AE]',
  'bg-[#91B8C0]',
  'bg-[#C78360]',
] as const;

export function AboutHero({ lang, className }: AboutHeroProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const content = isAr
    ? {
        eyebrow: 'من نحن',
        title: 'نبني تجربة رقمية أكثر تكاملًا لقطاع الجمال.',
        description:
          'نعمل على تطوير منظومة رقمية تساعد الصالونات ومراكز التجميل والسبا على إدارة أعمالها وتقديم تجربة أكثر تنظيمًا وترابطًا.',
        primaryCta: 'استكشف المنظومة',
        secondaryCta: 'تواصل معنا',
        panelBadge: 'RASHX',
        panelYear: '2026',
        panelLabel: 'منظومة قطاع الجمال والعناية',
        sectors: [
          {
            label: 'الصالونات',
            tone: 'bg-[#F0C5AE]/40 text-[#54453D]',
          },
          {
            label: 'مراكز التجميل',
            tone: 'bg-[#91B8C0]/35 text-[#54453D]',
          },
          {
            label: 'السبا والعناية',
            tone: 'bg-[#54453D] text-white',
          },
        ],
        highlights: [
          'تأسست في المملكة العربية السعودية · 2026',
          'منظومة سحابية متخصصة لقطاع الجمال والعناية',
          'تركيز هندسي على تبسيط العمليات اليومية',
        ],
      }
    : {
        eyebrow: 'ABOUT RASHX',
        title: 'Building a More Connected Digital Experience for Beauty.',
        description:
          'We develop digital solutions that help salons, beauty centers, and spas manage their operations and deliver a more connected experience.',
        primaryCta: 'Explore the Platform',
        secondaryCta: 'Contact Our Team',
        panelBadge: 'RASHX',
        panelYear: '2026',
        panelLabel: 'Beauty & Wellness Operating System',
        sectors: [
          {
            label: 'Salons',
            tone: 'bg-[#F0C5AE]/40 text-[#54453D]',
          },
          {
            label: 'Beauty Centers',
            tone: 'bg-[#91B8C0]/35 text-[#54453D]',
          },
          {
            label: 'Spas',
            tone: 'bg-[#54453D] text-white',
          },
        ],
        highlights: [
          'Founded in Saudi Arabia · 2026',
          'Specialized Cloud Platform for Beauty & Wellness',
          'Engineered to Simplify Daily Operations',
        ],
      };

  return (
    <section
      id="about-hero"
      className={`relative overflow-hidden bg-[#FAF9F8] pb-14 pt-10 transition-colors duration-200 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-20 xl:pb-28 xl:pt-24 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Flat Geometric Brand Accents (Desktop) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-28 -top-28 hidden h-96 w-96 rounded-full bg-[#F0C5AE]/20 lg:block"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -start-24 hidden h-80 w-80 rounded-full bg-[#91B8C0]/20 lg:block"
      />

      <PageContainer size="full">
        <div className="relative grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-12 lg:items-center lg:gap-12 xl:gap-16">
          {/* ============================================================
              EDITORIAL NARRATIVE COLUMN
              Mobile: start-aligned vertical flow
              Tablet: centered showcase header
              Desktop: 7-col start-aligned architectural hero
             ============================================================ */}
          <div className="flex flex-col items-start text-start md:items-center md:text-center lg:col-span-7 lg:items-start lg:text-start">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#C78360]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[#C78360]"
              />
              <span>{content.eyebrow}</span>
            </span>

            {/* Single Semantic H1 */}
            <h1 className="mt-5 text-3xl font-extrabold leading-[1.18] tracking-tight text-balance text-[#54453D] sm:text-4xl md:max-w-3xl md:text-5xl lg:max-w-none lg:text-5xl xl:text-6xl">
              {content.title}
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#75645B] sm:text-lg xl:text-xl">
              {content.description}
            </p>

            {/* Dual Action Buttons */}
            <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row md:w-auto md:justify-center lg:justify-start sm:gap-4">
              <Link
                href="#who-we-are"
                className="inline-flex min-h-[50px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#F0C5AE] px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D] sm:w-auto sm:text-base"
              >
                <span>{content.primaryCta}</span>
                <ArrowIcon className="h-4 w-4" aria-hidden="true" />
              </Link>

              <a
                href="mailto:hello@rashx.com"
                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-xl bg-[#91B8C0] px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#6E9BA4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D] sm:w-auto sm:text-base"
              >
                <span>{content.secondaryCta}</span>
              </a>
            </div>
          </div>

          {/* ============================================================
              INSTITUTIONAL IDENTITY DECK
              Mobile: compact vertical highlight stack
              Tablet: full-width 3-column horizontal pillar deck
              Desktop: 5-col structured white dossier panel
             ============================================================ */}
          <div className="lg:col-span-5">
            <div className="rounded-[1.75rem] bg-white p-5 sm:rounded-[2rem] sm:p-7 lg:rounded-[2.25rem] lg:p-8">
              {/* Top Institutional Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center rounded-xl bg-[#54453D] px-3 py-1 font-mono text-xs font-black tracking-wider text-white">
                    {content.panelBadge}
                  </span>
                  <span className="text-xs font-bold text-[#75645B]">
                    {content.panelLabel}
                  </span>
                </div>

                <span className="rounded-lg bg-[#F0C5AE]/40 px-2.5 py-1 font-mono text-xs font-black text-[#54453D]">
                  {content.panelYear}
                </span>
              </div>

              {/* Sector Mosaic Strip */}
              <div
                aria-hidden="true"
                className="mt-5 grid grid-cols-3 gap-2 sm:gap-2.5"
              >
                {content.sectors.map((sector) => (
                  <div
                    key={sector.label}
                    className={`flex items-center justify-center rounded-xl px-2.5 py-2.5 text-center text-xs font-extrabold sm:py-3 ${sector.tone}`}
                  >
                    <span className="truncate">{sector.label}</span>
                  </div>
                ))}
              </div>

              {/* Institutional Highlights:
                  Mobile: 1-col stack | Tablet: 3-col horizontal grid | Desktop: 1-col numbered dossier */}
              <ul className="mt-5 grid grid-cols-1 gap-2.5 md:grid-cols-3 md:gap-4 lg:grid-cols-1 lg:gap-3">
                {content.highlights.map((item, idx) => {
                  const num = String(idx + 1).padStart(2, '0');
                  return (
                    <li
                      key={item}
                      className="relative overflow-hidden rounded-2xl bg-[#FAF9F8] p-4 ps-5 md:flex md:flex-col md:justify-between md:p-5 md:pt-6 lg:flex-row lg:items-center lg:justify-start lg:gap-3.5 lg:p-4 lg:ps-5"
                    >
                      {/* Side accent on Mobile & Desktop, Top accent on Tablet */}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-y-3.5 start-0 w-1 rounded-e-full md:inset-x-5 md:inset-y-auto md:top-0 md:h-1.5 md:w-auto md:rounded-b-full md:rounded-e-none lg:inset-x-auto lg:inset-y-3.5 lg:start-0 lg:h-auto lg:w-1 lg:rounded-b-none lg:rounded-e-full ${HIGHLIGHT_ACCENTS[idx]}`}
                      />

                      <div className="flex items-center gap-3 md:w-full md:justify-between lg:w-auto lg:justify-start">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white">
                          <CheckCircle2
                            className="h-4 w-4 text-[#16A34A]"
                            aria-hidden="true"
                          />
                        </span>
                        <span className="hidden font-mono text-xs font-black text-[#C78360] md:inline lg:hidden">
                          {num}
                        </span>
                        <span className="text-xs font-bold leading-relaxed text-[#54453D] md:hidden">
                          {item}
                        </span>
                      </div>

                      <span className="hidden text-sm font-bold leading-snug text-[#54453D] md:mt-4 md:block lg:mt-0 lg:flex-1">
                        {item}
                      </span>

                      <span
                        aria-hidden="true"
                        className="hidden shrink-0 rounded-lg bg-white px-2 py-0.5 font-mono text-[0.7rem] font-black text-[#C78360] lg:inline-flex"
                      >
                        {num}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}