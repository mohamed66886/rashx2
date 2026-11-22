import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Layers, Sparkles, Zap, HeartHandshake } from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface WhoWeAreProps {
  lang: Lang;
  className?: string;
}

export function WhoWeAre({ lang, className }: WhoWeAreProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'الهوية المؤسسية',
        title: 'منصة رقمية متخصصة تُعيد تعريف إدارة قطاع الجمال',
        subtitle:
          'انطلقت راش إكس برؤية واضحة تهدف إلى سد الفجوة التقنية في قطاع الصالونات ومراكز التجميل والسبا، عبر تقديم حلول برمجية تعالج التحديات التشغيلية المعقدة بأبسط الطرق الممكنة.',
        unifiedModulesLabel: 'كل الأدوات في نواة واحدة',
        unifiedModules: ['الحجوزات', 'العملاء', 'نقاط البيع', 'المخزون', 'العمولات'],
        syncFlowLabel: 'تسلسل مترابط لحظياً',
        syncSteps: ['حجز الموعد', 'حضور العميلة', 'الدفع والكاشير', 'خصم المخزون', 'عمولة الأخصائية'],
        journeyStages: [
          { step: '01', label: 'حجز ذاتي سلس' },
          { step: '02', label: 'زيارة مخصصة بالتفضيلات' },
          { step: '03', label: 'ولاء وتجربة مستمرة' },
        ],
        pillars: [
          {
            index: '01',
            tag: 'التوحيد',
            icon: Layers,
            title: 'توحيد كافة العمليات في مكان واحد',
            desc: 'تجميع الحجوزات، والعملاء، ونقاط البيع، والمخزون، والعمولات في منصة موحدة تقضي نهائيًا على تشتت البيانات بين دفاتر يدوية وتطبيقات متعددة.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            index: '02',
            tag: 'الأتمتة',
            icon: Zap,
            title: 'تبسيط الإدارة اليومية للصالون',
            desc: 'أتمتة المهام الروتينية المتكررة لتمكين أصحاب المنشآت ومديري الفروع من التفرغ لتطوير أعمالهم ورفع جودة الخدمات دون إرهاق في الحسابات اليدوية.',
            tone: 'bg-[#CADEE2]',
          },
          {
            index: '03',
            tag: 'الترابط اللحظي',
            icon: Sparkles,
            title: 'ترابط تلقائي بين الوظائف التشغيلية',
            desc: 'ربط لحظي بين حجز الموعد، وحضور العميلة، وتوثيق الخدمة، وتسجيل الدفع على الكاشير، وخصم المخزون، وتحديث عمولة الأخصائية فوريًا وبسلاسة تامة.',
            tone: 'bg-[#FAF9F8]',
          },
          {
            index: '04',
            tag: 'تجربة العميلة',
            icon: HeartHandshake,
            title: 'دعم تجربة عملاء منظمة واستثنائية',
            desc: 'الارتقاء بتجربة العميلة منذ لحظة الحجز الذاتي وحتى مغادرة المنشأة، مع حفظ تفضيلاتها وتاريخ زياراتها لضمان تجربة شخصية مميزة تدوم طويلاً.',
            tone: 'bg-[#91B8C0]/30',
          },
        ],
      }
    : {
        eyebrow: 'Corporate Identity',
        title: 'A Specialized Digital Platform Redefining Beauty Operations',
        subtitle:
          'RASHX was founded with a singular focus: to bridge the technological gap in salons, aesthetic centers, and spas through purpose-built software that solves complex workflows with utmost simplicity.',
        unifiedModulesLabel: 'All modules in one core',
        unifiedModules: ['Bookings', 'Clients', 'POS', 'Inventory', 'Commissions'],
        syncFlowLabel: 'Instant real-time chain',
        syncSteps: ['Booking', 'Execution', 'POS Checkout', 'Stock Deduction', 'Commission'],
        journeyStages: [
          { step: '01', label: 'Effortless Booking' },
          { step: '02', label: 'Personalized Care' },
          { step: '03', label: 'Lasting Loyalty' },
        ],
        pillars: [
          {
            index: '01',
            tag: 'UNIFICATION',
            icon: Layers,
            title: 'Unifying Operations in One Single Platform',
            desc: 'Consolidating bookings, customer profiles, point of sale, backbar inventory, and staff commissions into a cohesive hub that eliminates data fragmentation.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            index: '02',
            tag: 'SIMPLICITY',
            icon: Zap,
            title: 'Simplifying Day-to-Day Salon Management',
            desc: 'Automating repetitive administrative chores so salon owners and branch managers can focus on service quality and strategic expansion without administrative fatigue.',
            tone: 'bg-[#CADEE2]',
          },
          {
            index: '03',
            tag: 'LIVE SYNC',
            icon: Sparkles,
            title: 'Seamless Operational Interconnectivity',
            desc: 'Real-time synchronization connecting appointment bookings, specialist execution, POS checkout, stock deductions, and commission ledgers without delays.',
            tone: 'bg-[#FAF9F8]',
          },
          {
            index: '04',
            tag: 'CLIENT JOURNEY',
            icon: HeartHandshake,
            title: 'Empowering Refined Customer Journeys',
            desc: 'Elevating the client experience from effortless online booking to checkout, preserving service history and personal preferences to nurture long-term loyalty.',
            tone: 'bg-[#91B8C0]/30',
          },
        ],
      };

  const [p1, p2, p3, p4] = sectionContent.pillars as [
    (typeof sectionContent.pillars)[number],
    (typeof sectionContent.pillars)[number],
    (typeof sectionContent.pillars)[number],
    (typeof sectionContent.pillars)[number],
  ];
  const Icon1 = p1.icon;
  const Icon2 = p2.icon;
  const Icon3 = p3.icon;
  const Icon4 = p4.icon;

  return (
    <section
      id="who-we-are"
      className={`relative overflow-hidden bg-white py-14 transition-colors duration-200 sm:py-20 lg:py-28 xl:py-32 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            eyebrow={sectionContent.eyebrow}
            title={sectionContent.title}
            align="center"
            withWordmark={true}
          />
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[#75645B] sm:mt-5 sm:text-lg xl:text-xl">
            {sectionContent.subtitle}
          </p>
        </div>

        {/* ============================================================
            1. MOBILE LAYOUT (< md): Tonal Stacked Identity Cards
           ============================================================ */}
        <div className="mt-10 space-y-4 md:hidden">
          {/* 01 · Unifying Operations */}
          <article className="relative overflow-hidden rounded-[1.5rem] bg-[#FAF9F8] p-5 ps-6">
            <span
              aria-hidden="true"
              className="absolute inset-y-5 start-0 w-1.5 rounded-e-full bg-[#F0C5AE]"
            />
            <div className="flex items-center justify-between gap-3">
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${p1.tone} text-[#54453D]`}
              >
                <Icon1 className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="rounded-full bg-white px-3 py-1 font-mono text-xs font-black text-[#54453D]">
                {p1.index} · {p1.tag}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-extrabold leading-snug text-[#54453D]">
              {p1.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#75645B]">{p1.desc}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {sectionContent.unifiedModules.map((mod) => (
                <span
                  key={mod}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#54453D]"
                >
                  {mod}
                </span>
              ))}
            </div>
          </article>

          {/* 02 · Simplifying Management */}
          <article className="relative overflow-hidden rounded-[1.5rem] bg-[#CADEE2]/30 p-5 ps-6">
            <span
              aria-hidden="true"
              className="absolute inset-y-5 start-0 w-1.5 rounded-e-full bg-[#91B8C0]"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#54453D]">
                <Icon2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="rounded-full bg-white px-3 py-1 font-mono text-xs font-black text-[#54453D]">
                {p2.index} · {p2.tag}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-extrabold leading-snug text-[#54453D]">
              {p2.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#75645B]">{p2.desc}</p>
          </article>

          {/* 03 · Operational Interconnectivity (Dark Anchor using #FAF9F8 icon tile) */}
          <article className="relative overflow-hidden rounded-[1.75rem] bg-[#54453D] p-5 text-[#FAF9F8]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -end-12 -top-12 h-36 w-36 rounded-full bg-[#F0C5AE]/[0.08]"
            />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${p3.tone} text-[#54453D]`}
                >
                  <Icon3 className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-black text-[#F0C5AE]">
                  {p3.index} · {p3.tag}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-extrabold leading-snug text-white">
                {p3.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#FAF9F8]/80">{p3.desc}</p>

              {/* Compact Sync Chain */}
              <div className="mt-4 rounded-2xl bg-white/[0.08] p-3.5">
                <span className="block text-[0.7rem] font-bold text-[#F0C5AE]">
                  {sectionContent.syncFlowLabel}
                </span>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {sectionContent.syncSteps.map((step, i) => (
                    <span
                      key={step}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[0.7rem] font-semibold text-[#FAF9F8]"
                    >
                      <span className="font-mono text-[#F0C5AE]">{i + 1}</span>
                      <span>{step}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* 04 · Customer Journeys */}
          <article className="relative overflow-hidden rounded-[1.5rem] bg-[#F0C5AE]/25 p-5 ps-6">
            <span
              aria-hidden="true"
              className="absolute inset-y-5 start-0 w-1.5 rounded-e-full bg-[#54453D]"
            />
            <div className="flex items-center justify-between gap-3">
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#54453D]`}
              >
                <Icon4 className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="rounded-full bg-white px-3 py-1 font-mono text-xs font-black text-[#54453D]">
                {p4.index} · {p4.tag}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-extrabold leading-snug text-[#54453D]">
              {p4.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#75645B]">{p4.desc}</p>
            <div className="mt-4 space-y-2">
              {sectionContent.journeyStages.map((stage) => (
                <div
                  key={stage.step}
                  className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5"
                >
                  <span className="rounded-lg bg-[#F0C5AE]/45 px-2 py-0.5 font-mono text-[0.7rem] font-black text-[#54453D]">
                    {stage.step}
                  </span>
                  <span className="text-xs font-bold text-[#54453D]">{stage.label}</span>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* ============================================================
            2. TABLET LAYOUT (md → lg): 1 + 2 + 1 Editorial Rhythm
           ============================================================ */}
        <div className="mt-14 hidden grid-cols-2 gap-5 md:grid lg:hidden">
          {/* Row 1 (Full Width): 01 · Unifying Operations */}
          <article className="relative col-span-2 overflow-hidden rounded-[2rem] bg-[#FAF9F8] p-7">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-4 end-6 select-none font-mono text-8xl font-black leading-none text-[#54453D]/[0.04]"
            >
              {p1.index}
            </span>
            <div className="relative grid grid-cols-12 items-center gap-6">
              <div className="col-span-7">
                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${p1.tone} text-[#54453D]`}
                  >
                    <Icon1 className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#75645B]">
                    {p1.index} · {p1.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-extrabold leading-snug text-[#54453D]">
                  {p1.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#75645B]">{p1.desc}</p>
              </div>

              <div className="col-span-5 rounded-2xl bg-white p-5">
                <span className="block text-xs font-bold text-[#75645B]">
                  {sectionContent.unifiedModulesLabel}
                </span>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  {sectionContent.unifiedModules.map((mod, idx) => (
                    <span
                      key={mod}
                      className={`rounded-xl px-3 py-2 text-xs font-extrabold text-[#54453D] ${
                        idx % 2 === 0 ? 'bg-[#FAF9F8]' : 'bg-[#F0C5AE]/35'
                      }`}
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* Row 2 Start: 02 · Simplifying Management */}
          <article className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#CADEE2]/35 p-7">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-3 end-4 select-none font-mono text-7xl font-black leading-none text-[#54453D]/[0.05]"
            >
              {p2.index}
            </span>
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#54453D]">
                  <Icon2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className="rounded-full bg-white px-3 py-1 font-mono text-xs font-black text-[#54453D]">
                  {p2.index}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-extrabold leading-snug text-[#54453D]">
                {p2.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#54453D]/80">{p2.desc}</p>
            </div>
          </article>

          {/* Row 2 End: 03 · Operational Interconnectivity (Dark Anchor) */}
          <article className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#54453D] p-7 text-[#FAF9F8]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -end-12 -top-12 h-40 w-40 rounded-full bg-[#F0C5AE]/[0.08]"
            />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${p3.tone} text-[#54453D]`}
                >
                  <Icon3 className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-black text-[#F0C5AE]">
                  {p3.index}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-extrabold leading-snug text-white">
                {p3.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#FAF9F8]/80">{p3.desc}</p>
            </div>
          </article>

          {/* Row 3 (Full Width): 04 · Customer Journeys */}
          <article className="relative col-span-2 overflow-hidden rounded-[2rem] bg-[#F0C5AE]/25 p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#54453D]">
                    <Icon4 className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#54453D]">
                    {p4.index} · {p4.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-extrabold leading-snug text-[#54453D]">
                  {p4.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#54453D]/85">{p4.desc}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3.5">
              {sectionContent.journeyStages.map((stage) => (
                <div
                  key={stage.step}
                  className="rounded-2xl bg-white p-4"
                >
                  <span className="inline-flex rounded-lg bg-[#91B8C0]/30 px-2.5 py-0.5 font-mono text-xs font-black text-[#54453D]">
                    {stage.step}
                  </span>
                  <span className="mt-2.5 block text-sm font-extrabold text-[#54453D]">
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* ============================================================
            3. DESKTOP LAYOUT (lg+): Alternating 12-Col Architectural Grid
               Row 1: 7 + 5  |  Row 2: 5 + 7
           ============================================================ */}
        <div className="mt-16 hidden grid-cols-12 gap-6 lg:grid xl:mt-20 xl:gap-8">
          {/* ── 01 (7 cols): Unifying Operations Split Card ────────── */}
          <article className="relative col-span-7 overflow-hidden rounded-[2.25rem] bg-[#FAF9F8] p-9 xl:p-11">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-5 end-6 select-none font-mono text-[8rem] font-black leading-none text-[#54453D]/[0.04]"
            >
              {p1.index}
            </span>

            <div className="relative grid h-full grid-cols-12 items-stretch gap-7 xl:gap-9">
              <div className="col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-flex h-13 w-13 items-center justify-center rounded-2xl ${p1.tone} text-[#54453D]`}
                    >
                      <Icon1 className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#75645B]">
                      {p1.index} · {p1.tag}
                    </span>
                  </div>

                  <h3 className="mt-6 text-2xl font-extrabold leading-snug tracking-tight text-[#54453D] xl:text-3xl">
                    {p1.title}
                  </h3>

                  <p className="mt-3.5 text-sm leading-relaxed text-[#75645B] xl:text-base">
                    {p1.desc}
                  </p>
                </div>
              </div>

              {/* Flat Unification Hub Visual */}
              <div
                aria-hidden="true"
                className="col-span-5 flex flex-col justify-between rounded-2xl bg-white p-5 xl:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#75645B]">
                    {sectionContent.unifiedModulesLabel}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#F0C5AE]" />
                </div>

                <div className="my-5 space-y-2">
                  {sectionContent.unifiedModules.map((mod, idx) => (
                    <div
                      key={mod}
                      className="flex items-center justify-between rounded-xl bg-[#FAF9F8] px-3.5 py-2.5"
                    >
                      <span className="text-xs font-extrabold text-[#54453D]">{mod}</span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          idx % 2 === 0 ? 'bg-[#F0C5AE]' : 'bg-[#91B8C0]'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-[#54453D] px-3.5 py-2 text-center font-mono text-xs font-black tracking-wider text-[#FAF9F8]">
                  RASHX
                </div>
              </div>
            </div>
          </article>

          {/* ── 02 (5 cols): Simplifying Management Vertical Card ──── */}
          <article className="relative col-span-5 flex flex-col justify-between overflow-hidden rounded-[2.25rem] bg-[#CADEE2]/35 p-9 xl:p-11">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-5 end-5 select-none font-mono text-[8rem] font-black leading-none text-[#54453D]/[0.05]"
            >
              {p2.index}
            </span>

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-[#54453D]">
                  <Icon2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className="rounded-full bg-white px-3.5 py-1 font-mono text-xs font-black text-[#54453D]">
                  {p2.index} · {p2.tag}
                </span>
              </div>

              <h3 className="mt-6 text-2xl font-extrabold leading-snug tracking-tight text-[#54453D] xl:text-3xl">
                {p2.title}
              </h3>

              <p className="mt-3.5 text-sm leading-relaxed text-[#54453D]/80 xl:text-base">
                {p2.desc}
              </p>
            </div>

            <div
              aria-hidden="true"
              className="relative mt-8 flex items-center gap-2 rounded-2xl bg-white p-4"
            >
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#FAF9F8]">
                <span className="block h-full w-4/5 rounded-full bg-[#91B8C0]" />
              </span>
              <span className="rounded-lg bg-[#CADEE2]/45 px-2.5 py-1 font-mono text-xs font-black text-[#54453D]">
                100%
              </span>
            </div>
          </article>

          {/* ── 03 (5 cols): Live Interconnectivity Dark Espresso Card ─ */}
          <article className="relative col-span-5 flex flex-col justify-between overflow-hidden rounded-[2.25rem] bg-[#54453D] p-9 text-[#FAF9F8] xl:p-11">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-[#F0C5AE]/[0.08]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -start-16 h-48 w-48 rounded-full bg-[#91B8C0]/[0.08]"
            />

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`inline-flex h-13 w-13 items-center justify-center rounded-2xl ${p3.tone} text-[#54453D]`}
                >
                  <Icon3 className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className="rounded-full bg-white/10 px-3.5 py-1 font-mono text-xs font-black text-[#F0C5AE]">
                  {p3.index} · {p3.tag}
                </span>
              </div>

              <h3 className="mt-6 text-2xl font-extrabold leading-snug tracking-tight text-white xl:text-3xl">
                {p3.title}
              </h3>

              <p className="mt-3.5 text-sm leading-relaxed text-[#FAF9F8]/80 xl:text-base">
                {p3.desc}
              </p>
            </div>

            {/* Live Sync Chain */}
            <div className="relative mt-8 rounded-2xl bg-white/[0.08] p-4 xl:p-5">
              <span className="block text-xs font-bold text-[#F0C5AE]">
                {sectionContent.syncFlowLabel}
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {sectionContent.syncSteps.map((step, i) => (
                  <span
                    key={step}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#FAF9F8]"
                  >
                    <span className="font-mono text-[#F0C5AE]">0{i + 1}</span>
                    <span>{step}</span>
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* ── 04 (7 cols): Refined Customer Journeys Card ────────── */}
          <article className="relative col-span-7 flex flex-col justify-between overflow-hidden rounded-[2.25rem] bg-[#F0C5AE]/25 p-9 xl:p-11">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-5 end-6 select-none font-mono text-[8rem] font-black leading-none text-[#54453D]/[0.05]"
            >
              {p4.index}
            </span>

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-[#54453D]">
                    <Icon4 className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#54453D]">
                    {p4.index} · {p4.tag}
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className={`h-3 w-3 rounded-full ${p4.tone}`}
                />
              </div>

              <h3 className="mt-6 max-w-xl text-2xl font-extrabold leading-snug tracking-tight text-[#54453D] xl:text-3xl">
                {p4.title}
              </h3>

              <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-[#54453D]/85 xl:text-base">
                {p4.desc}
              </p>
            </div>

            {/* 3-Stage Client Journey Ribbon */}
            <div className="relative mt-8 grid grid-cols-3 gap-4">
              {sectionContent.journeyStages.map((stage, idx) => (
                <div
                  key={stage.step}
                  className="flex flex-col justify-between rounded-2xl bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-[#91B8C0]/30 px-2.5 py-1 font-mono text-xs font-black text-[#54453D]">
                      {stage.step}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rounded-full ${
                        idx === 0
                          ? 'bg-[#F0C5AE]'
                          : idx === 1
                            ? 'bg-[#91B8C0]'
                            : 'bg-[#54453D]'
                      }`}
                    />
                  </div>
                  <span className="mt-4 text-sm font-extrabold leading-snug text-[#54453D]">
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </PageContainer>
    </section>
  );
}