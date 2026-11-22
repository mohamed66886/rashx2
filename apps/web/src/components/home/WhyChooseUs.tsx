/**
 * RASHX — Why Choose Us Section (Paired Matrix Redesign)
 *
 * Server Component compatible (no 'use client').
 * Pure Flat Design: zero borders, zero rings, zero shadows, zero gradients.
 * Preserved Palette: #F0C5AE · #91B8C0 · #CADEE2 · #FAF9F8 · #FFFFFF · #54453D · #75645B · #C78360 · #2C4349
 *
 * Layout per screen:
 *  - mobile  (< md): Paired before→after stacked cards → numbered full-width pillars → stacked guarantees
 *  - tablet  (md–lg): 2-column comparison board → 1+2 balanced pillar grid → 3-col reassurance cards
 *  - desktop (lg+): Horizontal 3-row Transformation Matrix (12 cols) → 3-column equal pillars → 5+7 reassurance deck
 */

import { PageContainer } from '@rashx/ui';
import {
  Workflow,
  HeartHandshake,
  Store,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  Clock,
} from '@rashx/icons';
import { SectionTitle } from '@/components/sections';
import type { Lang } from '@/lib/lang';

export interface WhyChooseUsProps {
  lang: Lang;
  className?: string;
}

export function WhyChooseUs({ lang, className }: WhyChooseUsProps) {
  const isAr = lang === 'ar';

  const content = isAr
    ? {
        eyebrow: 'لماذا RASHX؟',
        title: 'لأن إدارة صالونك تستحق تجربة أفضل.',
        subtitle:
          'بدل إهدار الوقت بين دفاتر المواعيد ورسائل الواتساب والتطبيقات المتفرقة، تجمع RASHX كافة تفاصيل نشاطك في منظومة واحدة تمنحك الوضوح والهدوء التشغيلي.',
        anchor: {
          badge: 'التحول التشغيلي',
          title: 'منظومة واحدة متكاملة تغنيك عن تشتت الأدوات التقليدية',
          description:
            'القيمة الحقيقية في RASHX لا تقتصر على تسجيل العمليات، بل في ترابطها التلقائي: الحجز يُسجل في التقويم، تنبيه واتساب يُرسل للعميلة، الوردية والعمولة تُحتسب للأخصائية، وسجل الزيارات يُحدث فوراً دون أي إدخال مكرر.',
          traditionalLabel: 'الطرق التقليدية المشتتة',
          traditionalPoints: [
            'دفاتر مواعيد ورقية معرضة للتداخل والضياع',
            'تنسيق يدوي مجهد للمواعيد ورسائل التذكير',
            'حساب يدوي معقد لعمولات الموظفات نهاية الشهر',
          ],
          rashxLabel: 'في منظومة RASHX المترابطة',
          rashxPoints: [
            'تقويم سحابي فوري يمنع تعارض المواعيد آلياً',
            'تأكيد وتذكير تلقائي عبر واتساب يقلل الغياب',
            'احتساب فوري وشفاف للعمولات والورديات لكل جلسة',
          ],
          pulseLabel: 'تدفق عمل مترابط لحظة بلحظة',
          pulsePills: ['مواعيد مؤكدة', 'عميلات راضيات', 'فريق منظم'],
        },
        pillars: [
          {
            index: '01',
            icon: Workflow,
            badge: 'إدارة بلا مفاجآت',
            title: 'رؤية واضحة لكل ما يحدث في الصالون لحظة بلحظة',
            description:
              'لوحة تحكم فورية تظهر الحجوزات القادمة، الجلسات الجارية، وتوافر المقاعد والأخصائيات بنظرة سريعة، مما يقضي على الارتباك في أوقات الذروة.',
            tag: 'تتبع فوري · منع التعارض',
            iconTone: 'bg-[#CADEE2] text-[#2C4349]',
            accentBar: 'bg-[#CADEE2]',
          },
          {
            index: '02',
            icon: HeartHandshake,
            badge: 'علاقات العميلات',
            title: 'سجل رقمي موحد يبني ولاء حقيقي مع كل زيارة',
            description:
              'احتفظ ببيانات كل عميلة، الخدمات السابقة، الأخصائية المفضلة، والملاحظات الخاصة، لتوفير تجربة شخصية متسقة تجعل العميلة تشعر بالاهتمام والتقدير.',
            tag: 'سجل الزيارات · التفضيلات الشخصية',
            iconTone: 'bg-[#F0C5AE] text-[#54453D]',
            accentBar: 'bg-[#F0C5AE]',
          },
          {
            index: '03',
            icon: Store,
            badge: 'السوق السعودي',
            title: 'متوافقة بالكامل مع طبيعة ونشاط الصالونات المحلية',
            description:
              'واجهة عربية أصيلة صُممت لأسلوب عمل الصالونات في المملكة، مع دعم أرقام الجوال السعودية (+966)، إدارة الفروع المتعددة، والتعامل بالريال السعودي (ر.س).',
            tag: 'أرقام +966 · عملة ر.س · فروع متعددة',
            iconTone: 'bg-[#91B8C0]/35 text-[#2C4349]',
            accentBar: 'bg-[#91B8C0]',
          },
        ],
        reassurance: {
          title: 'نظام يعمل بهدوء في الخلفية لتتفرغ لنمو صالونك',
          subtitle:
            'بدون تعقيد تقني وبدون عقود ملزمة، مع دعم مباشر وتدريب متكامل لفريق عملك من اليوم الأول.',
          guarantees: [
            { text: 'دعم وتدريب مباشر للفريق', icon: Sparkles },
            { text: 'بيانات مشفرة ومعزولة لكل صالون', icon: ShieldCheck },
            { text: 'جاهزية تشغيل فورية بدون تجهيزات', icon: Clock },
          ],
        },
      }
    : {
        eyebrow: 'WHY RASHX?',
        title: 'Your salon deserves a better way to operate.',
        subtitle:
          'Instead of juggling paper notebooks, scattered chats, and disconnected apps, RASHX brings your entire salon workflow into one coherent system built for clarity and control.',
        anchor: {
          badge: 'OPERATIONAL TRANSFORMATION',
          title: 'One connected system replacing fragmented traditional tools',
          description:
            'The true value of RASHX is how everything links automatically: a booking updates the calendar, a WhatsApp confirmation is sent, specialist shifts and commissions are logged, and client visit history updates instantly without double entry.',
          traditionalLabel: 'Fragmented Traditional Methods',
          traditionalPoints: [
            'Paper appointment logbooks prone to double-bookings',
            'Tedious manual WhatsApp booking coordination',
            'Complex manual end-of-month commission math',
          ],
          rashxLabel: 'The Connected RASHX System',
          rashxPoints: [
            'Live cloud calendar preventing overlaps automatically',
            'Automated WhatsApp reminders reducing no-shows',
            'Instant transparent specialist commission tracking',
          ],
          pulseLabel: 'Continuous real-time workflow',
          pulsePills: ['Confirmed Bookings', 'Delighted Clients', 'Organized Team'],
        },
        pillars: [
          {
            index: '01',
            icon: Workflow,
            badge: 'CALM OPERATIONS',
            title: 'Live visibility into salon activities as they happen',
            description:
              'A real-time overview of upcoming bookings, active sessions, and specialist availability at a single glance, eliminating peak-hour confusion.',
            tag: 'Live tracking · Auto conflict prevention',
            iconTone: 'bg-[#CADEE2] text-[#2C4349]',
            accentBar: 'bg-[#CADEE2]',
          },
          {
            index: '02',
            icon: HeartHandshake,
            badge: 'CLIENT RELATIONSHIPS',
            title: 'A unified client record that builds lasting loyalty',
            description:
              "Keep track of each client's history, past services, preferred specialists, and custom notes to deliver a personalized visit every time.",
            tag: 'Visit history · Personal preferences',
            iconTone: 'bg-[#F0C5AE] text-[#54453D]',
            accentBar: 'bg-[#F0C5AE]',
          },
          {
            index: '03',
            icon: Store,
            badge: 'SAUDI MARKET FIT',
            title: 'Built specifically for local beauty business requirements',
            description:
              'Native Arabic RTL interface, Saudi mobile (+966) support, multi-branch management across Saudi cities, and SAR currency transactions.',
            tag: '+966 mobile · SAR currency · Multi-branch',
            iconTone: 'bg-[#91B8C0]/35 text-[#2C4349]',
            accentBar: 'bg-[#91B8C0]',
          },
        ],
        reassurance: {
          title: 'A quiet backend system so you can focus on salon growth',
          subtitle:
            'No technical complexity and no lock-ins, with direct team onboarding and training from day one.',
          guarantees: [
            { text: 'Direct team onboarding & training', icon: Sparkles },
            { text: 'Encrypted & tenant-isolated salon data', icon: ShieldCheck },
            { text: 'Instant setup with zero hardware lock', icon: Clock },
          ],
        },
      };

  const pairs = content.anchor.traditionalPoints.map((traditional, idx) => ({
    traditional,
    rashx: content.anchor.rashxPoints[idx] ?? '',
  }));

  return (
    <section
      id="why-choose-us"
      className={`bg-white py-16 sm:py-20 lg:py-28 xl:py-32 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle
            eyebrow={content.eyebrow}
            title={content.title}
            align="center"
            withWordmark
          />
          <p className="mt-4 text-base leading-relaxed text-[#75645B] sm:text-lg md:text-xl">
            {content.subtitle}
          </p>
        </div>

        {/* ============================================================
            1. MOBILE LAYOUT (< md): Paired Before→After Cards + Stack
           ============================================================ */}
        <div className="mt-10 space-y-5 md:hidden">
          {/* Transformation Anchor */}
          <article className="rounded-[1.75rem] bg-[#FAF9F8] p-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#91B8C0]/25 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#2C4349]">
              <Sparkles className="h-3.5 w-3.5 text-[#2C4349]" aria-hidden="true" />
              <span>{content.anchor.badge}</span>
            </div>

            <h3 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-[#54453D]">
              {content.anchor.title}
            </h3>

            <p className="mt-2.5 text-sm leading-relaxed text-[#75645B]">
              {content.anchor.description}
            </p>

            {/* Paired Before → After Cards */}
            <div className="mt-6 space-y-3.5">
              {pairs.map((pair, idx) => (
                <div key={idx} className="relative overflow-hidden rounded-2xl">
                  {/* Before */}
                  <div className="bg-white px-4 pb-5 pt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#54453D]/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-[#75645B]">
                      <XCircle className="h-3 w-3" aria-hidden="true" />
                      {content.anchor.traditionalLabel}
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-[#75645B]">
                      {pair.traditional}
                    </p>
                  </div>

                  {/* Center Bridge Arrow */}
                  <div
                    aria-hidden="true"
                    className="relative z-10 -my-3.5 flex justify-center"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0C5AE] text-[#54453D]">
                      <svg
                        viewBox="0 0 16 16"
                        className="h-3.5 w-3.5"
                        fill="none"
                      >
                        <path
                          d="M8 3.5v9m0 0-3-3m3 3 3-3"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>

                  {/* After (RASHX) */}
                  <div className="bg-[#F0C5AE]/30 px-4 pb-4 pt-5">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F0C5AE] px-2.5 py-0.5 text-[0.65rem] font-bold text-[#54453D]">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      {content.anchor.rashxLabel}
                    </span>
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-[#54453D]">
                      {pair.rashx}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Workflow Pulse */}
            <div className="mt-5 rounded-2xl bg-white p-4">
              <span className="block text-xs font-semibold text-[#75645B]">
                {content.anchor.pulseLabel}
              </span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {content.anchor.pulsePills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#FAF9F8] px-2.5 py-1 text-xs font-bold text-[#54453D]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#91B8C0]" />
                    <span>{pill}</span>
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Mobile Strategic Pillars */}
          <div className="space-y-3.5">
            {content.pillars.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <article
                  key={pillar.index}
                  className="relative overflow-hidden rounded-2xl bg-[#FAF9F8] p-5"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-3 end-4 select-none font-mono text-6xl font-black leading-none text-[#54453D]/[0.05]"
                  >
                    {pillar.index}
                  </span>

                  <div className="relative flex items-center justify-between gap-3">
                    <div
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${pillar.iconTone}`}
                    >
                      <PillarIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#75645B]">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="relative mt-4 text-lg font-extrabold leading-snug text-[#54453D]">
                    {pillar.title}
                  </h3>

                  <p className="relative mt-2 text-sm leading-relaxed text-[#75645B]">
                    {pillar.description}
                  </p>

                  <div className="relative mt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-[#54453D]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                      <span>{pillar.tag}</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Mobile Reassurance Strip */}
          <div className="rounded-[1.75rem] bg-[#FAF9F8] p-5">
            <div className="text-center">
              <h4 className="text-xl font-extrabold tracking-tight text-[#54453D]">
                {content.reassurance.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                {content.reassurance.subtitle}
              </p>
            </div>

            <div className="mt-5 space-y-2.5">
              {content.reassurance.guarantees.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-xs font-bold text-[#54453D]"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0C5AE]/35 text-[#C78360]">
                      <ItemIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================
            2. TABLET LAYOUT (md → lg): 2-Col Board + 1+2 Bento + Strip
           ============================================================ */}
        <div className="mt-14 hidden space-y-6 md:block lg:hidden">
          {/* Tablet Transformation Board */}
          <article className="rounded-[2rem] bg-[#FAF9F8] p-7">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#91B8C0]/25 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#2C4349]">
                <Sparkles className="h-3.5 w-3.5 text-[#2C4349]" aria-hidden="true" />
                <span>{content.anchor.badge}</span>
              </div>

              <h3 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#54453D]">
                {content.anchor.title}
              </h3>

              <p className="mt-3 text-base leading-relaxed text-[#75645B]">
                {content.anchor.description}
              </p>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="flex flex-col rounded-2xl bg-white p-5">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg bg-[#54453D]/10 px-3 py-1 text-xs font-bold text-[#75645B]">
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{content.anchor.traditionalLabel}</span>
                </div>
                <ul className="space-y-3">
                  {content.anchor.traditionalPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-[#75645B]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#54453D]/30" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col rounded-2xl bg-[#F0C5AE]/30 p-5">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg bg-[#F0C5AE] px-3 py-1 text-xs font-bold text-[#54453D]">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{content.anchor.rashxLabel}</span>
                </div>
                <ul className="space-y-3">
                  {content.anchor.rashxPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-[#54453D]"
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
            </div>

            {/* Pulse Footer */}
            <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-3.5">
              <span className="text-xs font-semibold text-[#75645B]">
                {content.anchor.pulseLabel}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {content.anchor.pulsePills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#FAF9F8] px-3 py-1 text-xs font-bold text-[#54453D]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#91B8C0]" />
                    <span>{pill}</span>
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Tablet 1 + 2 Balanced Pillars Grid */}
          <div className="grid grid-cols-2 gap-5">
            {content.pillars.map((pillar, idx) => {
              const PillarIcon = pillar.icon;
              const isFirst = idx === 0;

              if (isFirst) {
                return (
                  <article
                    key={pillar.index}
                    className="relative col-span-2 overflow-hidden rounded-[1.75rem] bg-[#FAF9F8] p-7"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-4 end-6 select-none font-mono text-8xl font-black leading-none text-[#54453D]/[0.04]"
                    >
                      {pillar.index}
                    </span>

                    <div className="relative grid grid-cols-12 items-center gap-6">
                      <div className="col-span-7">
                        <div className="flex items-center gap-3">
                          <div
                            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${pillar.iconTone}`}
                          >
                            <PillarIcon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#75645B]">
                            {pillar.badge}
                          </span>
                        </div>
                        <h3 className="mt-4 text-xl font-extrabold leading-snug text-[#54453D]">
                          {pillar.title}
                        </h3>
                      </div>

                      <div className="col-span-5">
                        <p className="text-sm leading-relaxed text-[#75645B]">
                          {pillar.description}
                        </p>
                        <div className="mt-4">
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-[#54453D]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                            <span>{pillar.tag}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={pillar.index}
                  className="relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#FAF9F8] p-6"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-3 end-4 select-none font-mono text-7xl font-black leading-none text-[#54453D]/[0.04]"
                  >
                    {pillar.index}
                  </span>

                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${pillar.iconTone}`}
                      >
                        <PillarIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#75645B]">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-extrabold leading-snug text-[#54453D]">
                      {pillar.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="relative mt-5">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-[#54453D]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                      <span>{pillar.tag}</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Tablet Reassurance Strip */}
          <div className="rounded-[2rem] bg-[#FAF9F8] p-7">
            <div className="mx-auto max-w-2xl text-center">
              <h4 className="text-2xl font-extrabold tracking-tight text-[#54453D]">
                {content.reassurance.title}
              </h4>
              <p className="mt-2 text-base leading-relaxed text-[#75645B]">
                {content.reassurance.subtitle}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {content.reassurance.guarantees.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.text}
                    className="flex flex-col items-center rounded-2xl bg-white p-4 text-center"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0C5AE]/35 text-[#C78360]">
                      <ItemIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="mt-3 text-xs font-bold leading-snug text-[#54453D]">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================
            3. DESKTOP LAYOUT (lg+): Horizontal Matrix + 3-Col Pillars + Deck
           ============================================================ */}
        <div className="mt-16 hidden space-y-7 lg:block xl:mt-20 xl:space-y-8">
          {/* ── ACT 1: Synchronized Transformation Matrix ──────────── */}
          <article className="rounded-[2.25rem] bg-[#FAF9F8] p-10 xl:p-12">
            {/* Editorial Intro Row */}
            <div className="grid grid-cols-12 items-end gap-8 xl:gap-12">
              <div className="col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#91B8C0]/25 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2C4349]">
                  <Sparkles className="h-3.5 w-3.5 text-[#2C4349]" aria-hidden="true" />
                  <span>{content.anchor.badge}</span>
                </div>

                <h3 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#54453D] xl:text-4xl">
                  {content.anchor.title}
                </h3>
              </div>

              <div className="col-span-6">
                <p className="text-base leading-relaxed text-[#75645B] xl:text-lg">
                  {content.anchor.description}
                </p>
              </div>
            </div>

            {/* Matrix Column Headers */}
            <div className="mt-9 grid grid-cols-[1fr_4rem_1fr] items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#75645B]">
                  <XCircle className="h-4 w-4 text-[#75645B]" aria-hidden="true" />
                  <span>{content.anchor.traditionalLabel}</span>
                </span>
              </div>
              <span aria-hidden="true" />
              <div>
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#F0C5AE] px-4 py-2 text-xs font-bold text-[#54453D]">
                  <CheckCircle2 className="h-4 w-4 text-[#54453D]" aria-hidden="true" />
                  <span>{content.anchor.rashxLabel}</span>
                </span>
              </div>
            </div>

            {/* 3 Synchronized Transformation Rows */}
            <div className="mt-4 space-y-3.5">
              {pairs.map((pair, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_4rem_1fr] items-center"
                >
                  {/* Traditional Cell */}
                  <div className="flex h-full items-center gap-3.5 rounded-2xl bg-white px-5 py-4 xl:px-6 xl:py-5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#54453D]/10 text-[#75645B]">
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-relaxed text-[#75645B] xl:text-base">
                      {pair.traditional}
                    </span>
                  </div>

                  {/* Center Transformation Bridge */}
                  <div
                    aria-hidden="true"
                    className="relative flex items-center justify-center"
                  >
                    <span className="absolute inset-x-0 h-[2px] bg-[#F0C5AE]/60" />
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#F0C5AE] text-[#54453D]">
                      <svg
                        viewBox="0 0 16 16"
                        className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`}
                        fill="none"
                      >
                        <path
                          d="M3.5 8h9m0 0-3-3m3 3-3 3"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>

                  {/* Connected RASHX Cell */}
                  <div className="flex h-full items-center gap-3.5 rounded-2xl bg-[#F0C5AE]/30 px-5 py-4 xl:px-6 xl:py-5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#2C4349]">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold leading-relaxed text-[#54453D] xl:text-base">
                      {pair.rashx}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Workflow Pulse Bar */}
            <div className="mt-7 flex items-center justify-between gap-4 rounded-2xl bg-white px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#91B8C0] motion-safe:animate-pulse" />
                <span className="text-sm font-bold text-[#54453D]">
                  {content.anchor.pulseLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {content.anchor.pulsePills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-3.5 py-1.5 text-xs font-bold text-[#54453D]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                    <span>{pill}</span>
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* ── ACT 2: 3-Column Equal Strategic Pillars ────────────── */}
          <div className="grid grid-cols-3 gap-6 xl:gap-7">
            {content.pillars.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <article
                  key={pillar.index}
                  className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[#FAF9F8] p-7 xl:p-8"
                >
                  {/* Top Subtle Flat Accent Strip */}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-8 top-0 h-1.5 rounded-b-full ${pillar.accentBar}`}
                  />

                  {/* Oversized Index Watermark */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-4 end-5 select-none font-mono text-[6.5rem] font-black leading-none text-[#54453D]/[0.04]"
                  >
                    {pillar.index}
                  </span>

                  <div className="relative pt-2">
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${pillar.iconTone}`}
                      >
                        <PillarIcon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <span className="rounded-full bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#75645B]">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-extrabold leading-snug tracking-tight text-[#54453D] xl:text-2xl">
                      {pillar.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-[#75645B] xl:text-base">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="relative mt-7">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[#54453D]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                      <span>{pillar.tag}</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* ── ACT 3: Full-Width Quiet Confidence Deck (5 + 7) ────── */}
          <div className="rounded-[2rem] bg-[#FAF9F8] p-8 xl:p-10">
            <div className="grid grid-cols-12 items-center gap-8 xl:gap-10">
              <div className="col-span-5">
                <h4 className="text-2xl font-extrabold leading-snug tracking-tight text-[#54453D] xl:text-3xl">
                  {content.reassurance.title}
                </h4>
                <p className="mt-2.5 text-sm leading-relaxed text-[#75645B] xl:text-base">
                  {content.reassurance.subtitle}
                </p>
              </div>

              <div className="col-span-7 grid grid-cols-3 gap-4">
                {content.reassurance.guarantees.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.text}
                      className="flex flex-col justify-between rounded-2xl bg-white p-5"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0C5AE]/35 text-[#C78360]">
                        <ItemIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="mt-4 text-sm font-bold leading-snug text-[#54453D]">
                        {item.text}
                      </span>
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