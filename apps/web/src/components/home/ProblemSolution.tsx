import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Calendar, UserRound, Users, TrendingUp } from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface ProblemSolutionProps {
  lang: Lang;
  className?: string;
}

const ICON_TONES = [
  'bg-[#91B8C0]/25 text-[#54453D]',
  'bg-[#F0C5AE]/45 text-[#54453D]',
  'bg-[#C78360]/20 text-[#54453D]',
  'bg-[#6E9BA4]/25 text-[#54453D]',
] as const;

const DARK_ICON_TONES = [
  'bg-[#91B8C0]/20 text-[#91B8C0]',
  'bg-[#F0C5AE]/20 text-[#F0C5AE]',
  'bg-[#C78360]/25 text-[#F0C5AE]',
  'bg-[#6E9BA4]/25 text-[#91B8C0]',
] as const;

// Desktop horizontal convergence paths (4 card centers → hub center)
const DESKTOP_FLOW_PATHS = [
  'M0 12 C48 12, 52 50, 100 50',
  'M0 37.3 C48 37.3, 52 50, 100 50',
  'M0 62.7 C48 62.7, 52 50, 100 50',
  'M0 88 C48 88, 52 50, 100 50',
] as const;

// Tablet dual-column merge paths (left col 25% & right col 75% → center 50%)
const TABLET_MERGE_PATHS = [
  'M150 0 C150 42, 300 24, 300 68',
  'M450 0 C450 42, 300 24, 300 68',
] as const;

export function ProblemSolution({ lang, className }: ProblemSolutionProps) {
  const isAr = lang === 'ar';

  const challenges = isAr
    ? [
        {
          number: '01',
          title: 'المواعيد',
          description: 'حجوزات متفرقة وصعوبة المتابعة.',
          syncedOutcome: 'حجوزات منظمة تلقائياً',
          icon: Calendar,
        },
        {
          number: '02',
          title: 'العملاء',
          description: 'بيانات موزعة وتجربة غير متسقة.',
          syncedOutcome: 'ملف عميل موحد',
          icon: UserRound,
        },
        {
          number: '03',
          title: 'الفريق',
          description: 'متابعة الموظفين والمهام يدويًا.',
          syncedOutcome: 'جداول ومهام واضحة',
          icon: Users,
        },
        {
          number: '04',
          title: 'المبيعات',
          description: 'صعوبة متابعة الأداء والإيرادات.',
          syncedOutcome: 'رؤية لحظية للإيرادات',
          icon: TrendingUp,
        },
      ]
    : [
        {
          number: '01',
          title: 'Appointments',
          description: 'Scattered bookings and difficult follow-ups.',
          syncedOutcome: 'Auto-synced bookings',
          icon: Calendar,
        },
        {
          number: '02',
          title: 'Customers',
          description: 'Disconnected information and inconsistent experiences.',
          syncedOutcome: 'Unified client profiles',
          icon: UserRound,
        },
        {
          number: '03',
          title: 'Team',
          description: 'Manual employee and task coordination.',
          syncedOutcome: 'Clear shifts & tasks',
          icon: Users,
        },
        {
          number: '04',
          title: 'Sales',
          description: 'Limited visibility into performance and revenue.',
          syncedOutcome: 'Real-time revenue view',
          icon: TrendingUp,
        },
      ];

  const copy = isAr
    ? {
        sectionTitle: 'إدارة صالونك المفروض ما تكون معقدة.',
        beforeLabel: 'قبل التوحيد · أدوات متفرقة',
        isolatedLabel: 'منفصل',
        mergeLabel: 'توحيد في نظام واحد',
        badge: 'المنظومة الموحدة',
        brand: 'راش إكس',
        hubTitle: 'كل أعمالك في منظومة واحدة.',
        hubSubtitle:
          'إدارة مترابطة تمنحك رؤية أوضح وتحكمًا أكبر في تفاصيل صالونك.',
        syncedBar: '4 أقسام مترابطة في الوقت الفعلي',
        syncedTag: 'متصل',
        pillarsAria: 'الأقسام المترابطة',
      }
    : {
        sectionTitle: "Managing your salon shouldn't be complicated.",
        beforeLabel: 'BEFORE · FRAGMENTED TOOLS',
        isolatedLabel: 'Isolated',
        mergeLabel: 'Unified into one core',
        badge: 'CONNECTED OPERATING SYSTEM',
        brand: 'RASHX',
        hubTitle: 'Your entire business, connected in one system.',
        hubSubtitle:
          'An integrated management experience that gives you a clearer view and greater control over your salon.',
        syncedBar: '4 synced modules · Real-time',
        syncedTag: 'Synced',
        pillarsAria: 'Connected Pillars',
      };

  return (
    <section
      id="problem-solution"
      className={`relative overflow-hidden bg-white py-16 sm:py-20 lg:py-28 xl:py-32 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <style>{`
        @keyframes rx-ps-dash {
          to { stroke-dashoffset: -24; }
        }
        .rx-ps-dash {
          animation: rx-ps-dash 1.4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .rx-ps-dash { animation: none; }
        }
      `}</style>

      <PageContainer size="full">
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle title={copy.sectionTitle} align="center" />
        </div>

        {/* ============================================================
            1. MOBILE LAYOUT (< md): Vertical Story Funnel
           ============================================================ */}
        <div className="mt-10 md:hidden">
          <div className="mb-4 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF9F8] px-3.5 py-1 text-[0.7rem] font-semibold tracking-wide text-[#75645B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
              {copy.beforeLabel}
            </span>
          </div>

          {/* Fragmented vertical rail + compact cards */}
          <div className="relative space-y-3 ps-5">
            <span
              aria-hidden="true"
              className="absolute bottom-5 start-1.5 top-5 w-[1.5px] bg-[#C78360]/30"
            />
            {challenges.map((challenge, i) => {
              const Icon = challenge.icon;
              return (
                <article
                  key={challenge.title}
                  className="relative rounded-2xl bg-[#FAF9F8] p-4"
                >
                  {/* Rail node */}
                  <span
                    aria-hidden="true"
                    className="absolute -start-[1.21875rem] top-1/2 flex h-3.5 w-3.5 -translate-y-1/2 items-center justify-center rounded-full bg-[#F0C5AE]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                  </span>

                  <div className="flex items-start gap-3.5">
                    <div
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ICON_TONES[i]}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-[#54453D]">
                          {challenge.title}
                        </h3>
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-[0.65rem] font-semibold text-[#75645B]">
                          {copy.isolatedLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[#75645B]">
                        {challenge.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Vertical Funnel Bridge */}
          <div
            aria-hidden="true"
            className="relative flex flex-col items-center py-2"
          >
            <svg className="h-7 w-6" viewBox="0 0 24 28" fill="none">
              <path
                d="M12 0V28"
                stroke="#54453D"
                strokeOpacity="0.15"
                strokeWidth="2"
              />
              <path
                d="M12 0V28"
                className="rx-ps-dash"
                stroke="#C78360"
                strokeWidth="2"
                strokeDasharray="4 6"
                strokeLinecap="round"
              />
            </svg>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/45 px-3.5 py-1 text-xs font-bold text-[#54453D]">
              <span className="h-2 w-2 rounded-full bg-[#C78360] motion-safe:animate-pulse" />
              {copy.mergeLabel}
            </span>
            <svg className="h-7 w-6" viewBox="0 0 24 28" fill="none">
              <path
                d="M12 0V28"
                stroke="#54453D"
                strokeOpacity="0.15"
                strokeWidth="2"
              />
              <path
                d="M12 0V28"
                className="rx-ps-dash"
                stroke="#C78360"
                strokeWidth="2"
                strokeDasharray="4 6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Mobile Solution Hub */}
          <div className="relative overflow-hidden rounded-[1.75rem] bg-[#54453D] px-5 py-7 text-[#FAF9F8]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-[#F0C5AE]/[0.08]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -start-16 h-44 w-44 rounded-full bg-[#91B8C0]/[0.08]"
            />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[0.7rem] font-bold tracking-wider text-[#F0C5AE]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F0C5AE]" />
                {copy.badge}
              </div>

              <h3 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-balance">
                {copy.hubTitle}
              </h3>

              <p className="mt-2.5 text-sm leading-relaxed text-[#FAF9F8]/80">
                {copy.hubSubtitle}
              </p>

              {/* 2×2 Connected Matrix with Central Core */}
              <div className="relative mt-6">
                <ul
                  aria-label={copy.pillarsAria}
                  className="grid grid-cols-2 gap-2.5"
                >
                  {challenges.map((c, i) => {
                    const Icon = c.icon;
                    return (
                      <li
                        key={c.title}
                        className="rounded-2xl bg-white/[0.08] p-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${DARK_ICON_TONES[i]}`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="h-2 w-2 rounded-full bg-[#91B8C0]" />
                        </div>
                        <p className="mt-2.5 text-sm font-bold text-[#FAF9F8]">
                          {c.title}
                        </p>
                        <p className="mt-0.5 text-[0.7rem] text-[#FAF9F8]/70">
                          {c.syncedOutcome}
                        </p>
                      </li>
                    );
                  })}
                </ul>

                {/* Center Brand Medallion */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#54453D] p-1"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0C5AE] text-[0.65rem] font-black tracking-tight text-[#54453D]">
                    {copy.brand}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            2. TABLET LAYOUT (md → lg): 2×2 Bento → Dual-Branch Dock
           ============================================================ */}
        <div className="mt-12 hidden md:block lg:hidden">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#75645B]">
              <span className="h-2 w-2 rounded-full bg-[#C78360]" />
              {copy.beforeLabel}
            </span>
            <span className="text-xs font-medium text-[#75645B]">01 — 04</span>
          </div>

          {/* 2×2 Problem Grid */}
          <div className="grid grid-cols-2 gap-4">
            {challenges.map((challenge, i) => {
              const Icon = challenge.icon;
              return (
                <article
                  key={challenge.title}
                  className="relative overflow-hidden rounded-2xl bg-[#FAF9F8] p-5"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-3 end-4 select-none font-mono text-6xl font-black leading-none text-[#54453D]/[0.05]"
                  >
                    {challenge.number}
                  </span>

                  <div className="relative flex items-center justify-between">
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${ICON_TONES[i]}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-[#75645B]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]/70" />
                      {copy.isolatedLabel}
                    </span>
                  </div>

                  <h3 className="relative mt-4 text-lg font-bold text-[#54453D]">
                    {challenge.title}
                  </h3>
                  <p className="relative mt-1.5 text-sm leading-relaxed text-[#75645B]">
                    {challenge.description}
                  </p>
                </article>
              );
            })}
          </div>

          {/* Tablet Dual-Branch Merge Bridge */}
          <div className="relative h-16" aria-hidden="true">
            <svg
              className="h-full w-full"
              viewBox="0 0 600 68"
              preserveAspectRatio="none"
              fill="none"
            >
              {TABLET_MERGE_PATHS.map((d) => (
                <path
                  key={`tb-base-${d}`}
                  d={d}
                  stroke="#54453D"
                  strokeOpacity="0.14"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {TABLET_MERGE_PATHS.map((d) => (
                <path
                  key={`tb-flow-${d}`}
                  d={d}
                  className="rx-ps-dash"
                  stroke="#C78360"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2 rounded-full bg-white p-1">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE] px-4 py-1 text-xs font-extrabold text-[#54453D]">
                <span className="h-2 w-2 rounded-full bg-[#54453D]" />
                {copy.brand}
              </span>
            </div>
          </div>

          {/* Tablet Solution Hub: Header + Horizontal Connected Dock */}
          <div className="relative overflow-hidden rounded-3xl bg-[#54453D] px-8 pb-8 pt-11 text-[#FAF9F8]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-56 w-96 -translate-x-1/2 rounded-full bg-[#F0C5AE]/[0.08]"
            />

            <div className="relative text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold tracking-wider text-[#F0C5AE]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F0C5AE]" />
                {copy.badge}
              </span>

              <h3 className="mx-auto mt-4 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-balance">
                {copy.hubTitle}
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-[#FAF9F8]/80">
                {copy.hubSubtitle}
              </p>
            </div>

            {/* Connected Horizontal 4-Module Dock */}
            <div className="relative mt-8">
              <div
                aria-hidden="true"
                className="absolute inset-x-10 top-1/2 h-[2px] -translate-y-1/2 bg-[#F0C5AE]/25"
              />
              <ul
                aria-label={copy.pillarsAria}
                className="relative grid grid-cols-4 gap-3"
              >
                {challenges.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <li
                      key={c.title}
                      className="rounded-2xl bg-[#54453D]"
                    >
                      <div className="flex h-full flex-col items-center rounded-2xl bg-white/[0.08] p-4 text-center">
                        <span
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${DARK_ICON_TONES[i]}`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="mt-3 text-sm font-bold text-[#FAF9F8]">
                          {c.title}
                        </span>
                        <span className="mt-1 text-[0.7rem] leading-snug text-[#FAF9F8]/70">
                          {c.syncedOutcome}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. DESKTOP LAYOUT (lg+): 12-Col Architectural Split
               Fragmented Stack (5) → Flow Bridge (1) → Unified Hub (6)
           ============================================================ */}
        <div className="mt-16 hidden lg:block xl:mt-20">
          <div className="grid grid-cols-12 items-stretch">
            {/* Start 5 cols: Stacked Fragmented Operations */}
            <div className="col-span-5 grid grid-rows-4 gap-3.5 xl:gap-4">
              {challenges.map((challenge, i) => {
                const Icon = challenge.icon;
                return (
                  <article
                    key={challenge.title}
                    className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-[#FAF9F8] px-5 py-4 transition-colors duration-200 hover:bg-[#F0C5AE]/20 xl:px-6 xl:py-5"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-2 end-4 select-none font-mono text-5xl font-black leading-none text-[#54453D]/[0.045] transition-colors group-hover:text-[#C78360]/[0.12] xl:text-6xl"
                    >
                      {challenge.number}
                    </span>

                    <div
                      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${ICON_TONES[i]}`}
                    >
                      <Icon className="h-5 w-5 xl:h-6 xl:w-6" aria-hidden="true" />
                    </div>

                    <div className="relative min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-bold tracking-tight text-[#54453D] xl:text-xl">
                          {challenge.title}
                        </h3>
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[#75645B]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]/70" />
                          {copy.isolatedLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[#75645B] xl:text-[0.95rem]">
                        {challenge.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Center 1 col: Horizontal Animated Convergence Cables */}
            <div className="relative col-span-1" aria-hidden="true">
              <svg
                className={`h-full w-full overflow-visible ${isAr ? '-scale-x-100' : ''}`}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                fill="none"
              >
                {DESKTOP_FLOW_PATHS.map((d) => (
                  <path
                    key={`dt-base-${d}`}
                    d={d}
                    stroke="#54453D"
                    strokeOpacity="0.12"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {DESKTOP_FLOW_PATHS.map((d) => (
                  <path
                    key={`dt-flow-${d}`}
                    d={d}
                    className="rx-ps-dash"
                    stroke="#C78360"
                    strokeWidth="2"
                    strokeDasharray="5 8"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
            </div>

            {/* End 6 cols: Unified Dark Espresso Command Hub */}
            <div className="relative col-span-6 flex">
              {/* Convergence Anchor Node */}
              <div
                aria-hidden="true"
                className="absolute -start-5 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-1"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0C5AE]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#54453D]" />
                </span>
              </div>

              <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-[2rem] bg-[#54453D] p-8 text-[#FAF9F8] xl:p-10">
                {/* Flat Ambient Shapes */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-[#F0C5AE]/[0.07]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-24 -start-16 h-64 w-64 rounded-full bg-[#91B8C0]/[0.07]"
                />

                {/* Top Copy Block */}
                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold tracking-wider text-[#F0C5AE]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#F0C5AE]" />
                      {copy.badge}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-[#F0C5AE] px-3 py-1 text-xs font-black tracking-tight text-[#54453D]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#54453D] motion-safe:animate-pulse" />
                      {copy.brand}
                    </span>
                  </div>

                  <h3 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-balance xl:text-4xl">
                    {copy.hubTitle}
                  </h3>

                  <p className="mt-3 max-w-xl text-base leading-relaxed text-[#FAF9F8]/80 xl:text-lg">
                    {copy.hubSubtitle}
                  </p>
                </div>

                {/* Bottom Connected Architecture Matrix */}
                <div className="relative mt-8 rounded-2xl bg-white/[0.07] p-4 xl:p-5">
                  <div className="mb-3.5 flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#FAF9F8]/85">
                      <span className="h-2 w-2 rounded-full bg-[#91B8C0] motion-safe:animate-pulse" />
                      {copy.syncedBar}
                    </span>
                    <span className="font-mono text-[0.7rem] font-bold text-[#F0C5AE]">
                      100%
                    </span>
                  </div>

                  <ul
                    aria-label={copy.pillarsAria}
                    className="grid grid-cols-2 gap-3"
                  >
                    {challenges.map((c, i) => {
                      const Icon = c.icon;
                      return (
                        <li
                          key={c.title}
                          className="flex items-start gap-3 rounded-xl bg-[#54453D]/75 p-3.5 transition-colors duration-200 hover:bg-[#54453D]"
                        >
                          <span
                            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${DARK_ICON_TONES[i]}`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-[#FAF9F8]">
                                {c.title}
                              </span>
                              <span className="rounded-full bg-[#91B8C0]/15 px-2 py-0.5 text-[0.65rem] font-semibold text-[#91B8C0]">
                                {copy.syncedTag}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-snug text-[#FAF9F8]/70">
                              {c.syncedOutcome}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}