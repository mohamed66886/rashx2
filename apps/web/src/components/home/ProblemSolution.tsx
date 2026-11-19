import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Calendar, UserRound, Users, TrendingUp } from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface ProblemSolutionProps {
  lang: Lang;
  className?: string;
}

/**
 * Layout per screen:
 *  - mobile  (< sm): vertical "chain" — compact cards linked by a centered dashed line that drops into the hub
 *  - tablet  (sm–lg): 2×2 grid, a "+" joint in the middle, one line into the hub
 *  - desktop (lg+): 4 tilted/staggered "scattered" cards, animated SVG lines converging into the hub
 *  - hub: text + orbit diagram (stacked on small screens, side by side on lg+)
 */

// Tones for the icon tiles (palette colors only)
const TONES = [
  'bg-[#91B8C0]/30',
  'bg-[#F0C5AE]/50',
  'bg-[#C78360]/20',
  'bg-[#6E9BA4]/25',
] as const;

// Desktop-only "scattered" tilt per card
const TILTS = [
  'lg:-rotate-2 lg:translate-y-3 lg:hover:rotate-0 lg:hover:translate-y-0',
  'lg:rotate-1 lg:translate-y-0 lg:hover:rotate-0 lg:hover:-translate-y-1',
  'lg:-rotate-1 lg:translate-y-4 lg:hover:rotate-0 lg:hover:translate-y-1',
  'lg:rotate-2 lg:translate-y-1 lg:hover:rotate-0 lg:hover:-translate-y-0.5',
] as const;

// Converging paths (viewBox 0 0 1000 100, 4 equal columns → 125 / 375 / 625 / 875)
const CONVERGE_PATHS = [
  'M125 0 C125 70, 500 36, 500 100',
  'M375 0 C375 62, 500 46, 500 100',
  'M625 0 C625 62, 500 46, 500 100',
  'M875 0 C875 70, 500 36, 500 100',
] as const;

export function ProblemSolution({ lang, className }: ProblemSolutionProps) {
  const isAr = lang === 'ar';

  const challenges = isAr
    ? [
        {
          number: '01',
          title: 'المواعيد',
          description: 'حجوزات متفرقة وصعوبة المتابعة.',
          icon: Calendar,
        },
        {
          number: '02',
          title: 'العملاء',
          description: 'بيانات موزعة وتجربة غير متسقة.',
          icon: UserRound,
        },
        {
          number: '03',
          title: 'الفريق',
          description: 'متابعة الموظفين والمهام يدويًا.',
          icon: Users,
        },
        {
          number: '04',
          title: 'المبيعات',
          description: 'صعوبة متابعة الأداء والإيرادات.',
          icon: TrendingUp,
        },
      ]
    : [
        {
          number: '01',
          title: 'Appointments',
          description: 'Scattered bookings and difficult follow-ups.',
          icon: Calendar,
        },
        {
          number: '02',
          title: 'Customers',
          description: 'Disconnected information and inconsistent experiences.',
          icon: UserRound,
        },
        {
          number: '03',
          title: 'Team',
          description: 'Manual employee and task coordination.',
          icon: Users,
        },
        {
          number: '04',
          title: 'Sales',
          description: 'Limited visibility into performance and revenue.',
          icon: TrendingUp,
        },
      ];

  const isolatedLabel = isAr ? 'منفصل' : 'Isolated';
  const brandLabel = isAr ? 'راش إكس' : 'RASHX';

  // Orbit node positions (top / end / bottom / start of the ring)
  const orbitNodes = [
    'left-1/2 top-[8%]',
    'left-[92%] top-1/2',
    'left-1/2 top-[92%]',
    'left-[8%] top-1/2',
  ] as const;

  return (
    <section
      id="problem-solution"
      className={`relative overflow-hidden bg-white py-16 sm:py-20 lg:py-28 xl:py-32 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <style>{`
        @keyframes rx-ps-flow { to { stroke-dashoffset: -28; } }
        .rx-ps-flow { animation: rx-ps-flow 1.6s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .rx-ps-flow { animation: none; } }
      `}</style>


      <PageContainer size="full">
        <div className="relative">
          {/* ── Section Header ───────────────────────────────────── */}
          <div className="mx-auto max-w-3xl text-center">
            <SectionTitle
              title={
                isAr
                  ? 'إدارة صالونك ما المفروض تكون معقدة.'
                  : "Managing your salon shouldn't be complicated."
              }
              align="center"
            />
            <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-[#75645B]">
              {isAr
                ? 'لما كل جزء من شغلك يُدار بطريقة مختلفة، بتفقد الصورة الكاملة.'
                : "When every part of your business is managed separately, it's difficult to see the full picture."}
            </p>
          </div>

          {/* ── Fragmented operations ────────────────────────────── */}
          <div className="relative mt-12 sm:mt-14 lg:mt-20">
            <div className="relative z-10 flex flex-col sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:gap-7">
              {challenges.map((challenge, i) => {
                const Icon = challenge.icon;
                return (
                  <div key={challenge.title} className="contents">
                    <article
                      className={`group relative isolate flex h-full flex-col overflow-hidden rounded-2xl bg-[#FAF9F8] p-5 sm:p-6 xl:p-7 transition-all duration-300 motion-reduce:transition-none lg:min-h-[13rem] xl:min-h-[14.5rem] ${TILTS[i]}`}
                    >
                      {/* Oversized index watermark */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-3 end-3 select-none font-mono text-[4.5rem] font-black leading-none text-[#54453D]/[0.05] sm:text-[5.5rem] xl:text-[7rem]"
                      >
                        {challenge.number}
                      </span>

                      <div className="relative flex items-start gap-4 sm:flex-col sm:gap-5">
                        {/* Icon + "isolated" tag */}
                        <div className="flex shrink-0 items-center sm:w-full sm:justify-between">
                          <div
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#54453D] xl:h-12 xl:w-12 ${TONES[i]}`}
                          >
                            <Icon className="h-5 w-5 xl:h-6 xl:w-6" aria-hidden="true" />
                          </div>
                          <span className="hidden items-center gap-1.5 rounded-full bg-[#54453D]/5 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-[#75645B] sm:inline-flex">
                            <svg
                              viewBox="0 0 16 16"
                              className="h-3 w-3"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M1.5 8h4M10.5 8h4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                            {isolatedLabel}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-lg font-bold tracking-tight text-[#54453D] sm:text-xl xl:text-2xl">
                            {challenge.title}
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-[#75645B] sm:mt-2 sm:text-base">
                            {challenge.description}
                          </p>
                        </div>
                      </div>
                    </article>

                    {/* Mobile chain link between cards (centered) */}
                    {i < challenges.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="mx-auto flex flex-col items-center sm:hidden"
                      >
                        <span className="h-3 w-[1px] bg-[#C78360]/40" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                        <span className="h-3 w-[1px] bg-[#C78360]/40" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tablet joint: a "+" where the four pieces meet */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 z-20 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-base font-extrabold leading-none text-[#54453D] sm:flex lg:hidden ring-4 ring-[#F0C5AE]"
            >
              +
            </div>
          </div>

          {/* ── Connector zone → hub ─────────────────────────────── */}
          <div className="relative z-0 h-10 sm:h-14 lg:h-24 xl:h-28" aria-hidden="true">
            {/* Desktop: converging animated lines */}
            <svg
              className="absolute inset-0 hidden h-full w-full overflow-visible lg:block"
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
              fill="none"
            >
              {CONVERGE_PATHS.map((d) => (
                <path
                  key={`base-${d}`}
                  d={d}
                  stroke="#54453D"
                  strokeOpacity="0.1"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {CONVERGE_PATHS.map((d) => (
                <path
                  key={`flow-${d}`}
                  d={d}
                  className="rx-ps-flow"
                  stroke="#C78360"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="6 8"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* Mobile + tablet: single centered dashed line */}
            <div className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-[#C78360]/40 lg:hidden" />

            {/* Convergence node (sits on the hub's top edge) */}
            <div className="absolute bottom-0 left-1/2 z-20 h-10 w-10 -translate-x-1/2 translate-y-1/2">
              <span className="absolute inset-0 rounded-full bg-[#F0C5AE] motion-safe:animate-ping" />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white ring-4 ring-[#F0C5AE]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#54453D]" />
              </span>
            </div>
          </div>

          {/* ── Solution hub ─────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-[1.75rem] bg-[#F0C5AE] px-5 pb-8 pt-12 text-[#54453D] sm:rounded-3xl sm:px-8 sm:pb-10 sm:pt-14 lg:rounded-[2rem] lg:px-12 lg:pb-12 lg:pt-16 xl:px-16 xl:pb-14">
            {/* Decorative rings (SVG vectors) */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute -end-24 -top-24 h-72 w-72"
              viewBox="0 0 288 288"
              fill="none"
            >
              <circle cx="144" cy="144" r="143" stroke="#54453D" strokeOpacity="0.1" strokeWidth="1" />
            </svg>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 -start-20 h-80 w-80"
              viewBox="0 0 320 320"
              fill="none"
            >
              <circle cx="160" cy="160" r="159" stroke="#54453D" strokeOpacity="0.1" strokeWidth="1" />
            </svg>

            <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-20">
              {/* Copy */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#54453D]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#54453D]" aria-hidden="true" />
                  <span>{isAr ? 'المنظومة الموحدة' : 'CONNECTED OPERATING SYSTEM'}</span>
                </div>

                <h3 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight text-balance text-[#54453D] sm:text-3xl md:text-4xl xl:text-5xl">
                  {isAr
                    ? 'كل أعمالك في منظومة واحدة.'
                    : 'Your entire business, connected in one system.'}
                </h3>

                <p className="mt-3 max-w-xl text-base font-medium leading-relaxed text-balance text-[#54453D]/90 sm:mt-4 sm:text-lg md:text-xl">
                  {isAr
                    ? 'إدارة مترابطة تمنحك رؤية أوضح وتحكمًا أكبر في تفاصيل صالونك.'
                    : 'An integrated management experience that gives you a clearer view and greater control over your salon.'}
                </p>

                <ul
                  className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-3 lg:justify-start"
                  aria-label={isAr ? 'الأقسام المترابطة' : 'Connected Pillars'}
                >
                  {challenges.map((c) => {
                    const Icon = c.icon;
                    return (
                      <li
                        key={c.title}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#54453D] sm:px-3.5 sm:text-sm"
                      >
                        <Icon className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
                        {c.title}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Orbit diagram: four pillars wired to one core */}
              <div
                aria-hidden="true"
                className="relative mx-auto aspect-square w-full max-w-[15rem] sm:max-w-[19rem] lg:max-w-[22rem] xl:max-w-[27rem]"
              >
                <div className="absolute inset-0 rounded-full border border-dashed border-[#54453D]/30 motion-safe:animate-[spin_40s_linear_infinite]" />
                <div className="absolute inset-[18%] rounded-full border border-[#54453D]/15 bg-white/30" />

                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <path
                    d="M50 50V8M50 50H92M50 50V92M50 50H8"
                    stroke="#54453D"
                    strokeOpacity="0.35"
                    strokeWidth="0.6"
                    strokeDasharray="1.6 2.2"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Core */}
                <div className="absolute left-1/2 top-1/2 h-[28%] w-[28%] -translate-x-1/2 -translate-y-1/2">
                  <span className="absolute inset-0 rounded-full bg-[#54453D]/30 motion-safe:animate-ping" />
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#54453D] text-[0.7rem] font-extrabold tracking-tight text-[#FAF9F8] sm:text-xs xl:text-sm">
                    {brandLabel}
                  </span>
                </div>

                {/* Pillar nodes */}
                {challenges.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.title}
                      className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white text-[#54453D] sm:h-12 sm:w-12 xl:h-14 xl:w-14 ${orbitNodes[i]}`}
                    >
                      <Icon className="h-5 w-5 xl:h-6 xl:w-6" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}