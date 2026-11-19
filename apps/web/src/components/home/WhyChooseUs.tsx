/**
 * RASHX — Why Choose Us Section
 *
 * Server Component compatible (no 'use client').
 * Flat design only: zero borders, zero shadows, zero gradients.
 * Palette: #F0C5AE · #91B8C0 · #FAF9F8 · #FFFFFF · #54453D (+ existing #75645B, #C78360, #2C4349)
 *
 * Visual Architecture:
 *  - Header: SectionTitle with official brand wordmark watermark + balanced lead paragraph.
 *  - Asymmetric Stage:
 *      * Column 1 (7 cols on lg+): Transformation Anchor — contrasting fragmented traditional methods with RASHX's integrated system.
 *      * Column 2 (5 cols on lg+): 3 distinct strategic value pillars (Operational Calm, Client Loyalty, Saudi Market Fit).
 *  - Bottom Full-width Reassurance Strip: Quiet background confidence with direct training, data privacy, and instant setup guarantees.
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
            icon: Workflow,
            badge: 'إدارة بلا مفاجآت',
            title: 'رؤية واضحة لكل ما يحدث في الصالون لحظة بلحظة',
            description:
              'لوحة تحكم فورية تظهر الحجوزات القادمة، الجلسات الجارية، وتوافر المقاعد والأخصائيات بنظرة سريعة، مما يقضي على الارتباك في أوقات الذروة.',
            tag: 'تتبع فوري · منع التعارض',
            iconTone: 'bg-[#CADEE2] text-[#2C4349]',
          },
          {
            icon: HeartHandshake,
            badge: 'علاقات العميلات',
            title: 'سجل رقمي موحد يبني ولاء حقيقي مع كل زيارة',
            description:
              'احتفظ ببيانات كل عميلة، الخدمات السابقة، الأخصائية المفضلة، والملاحظات الخاصة، لتوفير تجربة شخصية متسقة تجعل العميلة تشعر بالاهتمام والتقدير.',
            tag: 'سجل الزيارات · التفضيلات الشخصية',
            iconTone: 'bg-[#F0C5AE] text-[#54453D]',
          },
          {
            icon: Store,
            badge: 'السوق السعودي',
            title: 'متوافقة بالكامل مع طبيعة ونشاط الصالونات المحلية',
            description:
              'واجهة عربية أصيلة صُممت لأسلوب عمل الصالونات في المملكة، مع دعم أرقام الجوال السعودية (+966)، إدارة الفروع المتعددة، والتعامل بالريال السعودي (ر.س).',
            tag: 'أرقام +966 · عملة ر.س · فروع متعددة',
            iconTone: 'bg-[#91B8C0]/35 text-[#2C4349]',
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
            icon: Workflow,
            badge: 'CALM OPERATIONS',
            title: 'Live visibility into salon activities as they happen',
            description:
              'A real-time overview of upcoming bookings, active sessions, and specialist availability at a single glance, eliminating peak-hour confusion.',
            tag: 'Live tracking · Auto conflict prevention',
            iconTone: 'bg-[#CADEE2] text-[#2C4349]',
          },
          {
            icon: HeartHandshake,
            badge: 'CLIENT RELATIONSHIPS',
            title: 'A unified client record that builds lasting loyalty',
            description:
              "Keep track of each client's history, past services, preferred specialists, and custom notes to deliver a personalized visit every time.",
            tag: 'Visit history · Personal preferences',
            iconTone: 'bg-[#F0C5AE] text-[#54453D]',
          },
          {
            icon: Store,
            badge: 'SAUDI MARKET FIT',
            title: 'Built specifically for local beauty business requirements',
            description:
              'Native Arabic RTL interface, Saudi mobile (+966) support, multi-branch management across Saudi cities, and SAR currency transactions.',
            tag: '+966 mobile · SAR currency · Multi-branch',
            iconTone: 'bg-[#91B8C0]/35 text-[#2C4349]',
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

  return (
    <section
      id="why-choose-us"
      className={`bg-white py-16 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* ── Section Header ────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle
            eyebrow={content.eyebrow}
            title={content.title}
            align="center"
            withWordmark
          />
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B]">
            {content.subtitle}
          </p>
        </div>

        {/* ── Asymmetric Value Stage ────────────────────────────── */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-stretch">
          {/* ── Column 1: Transformation Anchor (7 cols) ────────── */}
          <article className="flex flex-col justify-between rounded-[2rem] bg-[#FAF9F8] p-6 sm:p-8 lg:col-span-7 lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#91B8C0]/25 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#2C4349]">
                <Sparkles className="h-3.5 w-3.5 text-[#2C4349]" aria-hidden="true" />
                <span>{content.anchor.badge}</span>
              </div>

              <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-[#54453D]">
                {content.anchor.title}
              </h3>

              <p className="mt-3.5 text-base sm:text-lg leading-relaxed text-[#75645B]">
                {content.anchor.description}
              </p>

              {/* ── Contrast Visual Blocks ───────────────────────── */}
              <div className="mt-8 space-y-4">
                {/* Traditional Methods (Muted) */}
                <div className="rounded-2xl bg-white p-5">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-[#54453D]/10 px-3 py-1 text-xs font-bold text-[#75645B]">
                    <XCircle className="h-3.5 w-3.5 text-[#75645B]" aria-hidden="true" />
                    <span>{content.anchor.traditionalLabel}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {content.anchor.traditionalPoints.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2.5 text-xs sm:text-sm text-[#75645B]"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#54453D]/30" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Connected RASHX System (Brand Highlight) */}
                <div className="rounded-2xl bg-[#F0C5AE]/30 p-5">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-[#F0C5AE] px-3 py-1 text-xs font-bold text-[#54453D]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#54453D]" aria-hidden="true" />
                    <span>{content.anchor.rashxLabel}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {content.anchor.rashxPoints.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#54453D]"
                      >
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-[#2C4349]"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ── Anchor Footer: Live Workflow Pulse ────────────── */}
            <div className="mt-8 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                <span className="text-xs font-semibold text-[#75645B]">
                  {content.anchor.pulseLabel}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {content.anchor.pulsePills.map((pill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#FAF9F8] px-2.5 py-1 text-xs font-bold text-[#54453D]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#91B8C0]" />
                      <span>{pill}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* ── Column 2: Strategic Pillars (5 cols) ────────────── */}
          <div className="flex flex-col justify-between gap-6 lg:col-span-5">
            {content.pillars.map((pillar, idx) => {
              const PillarIcon = pillar.icon;
              return (
                <article
                  key={idx}
                  className="flex flex-1 flex-col justify-between rounded-2xl bg-[#FAF9F8] p-6 sm:p-7"
                >
                  <div>
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

                    <h3 className="mt-4 text-lg sm:text-xl font-bold leading-snug text-[#54453D]">
                      {pillar.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-5">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-medium text-[#54453D]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                      <span>{pillar.tag}</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* ── Bottom Reassurance Strip ──────────────────────────── */}
        <div className="mt-8 sm:mt-10 rounded-2xl bg-[#FAF9F8] p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center lg:text-start">
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#54453D]">
              {content.reassurance.title}
            </h4>
            <p className="mt-2 text-sm sm:text-base text-[#75645B] leading-relaxed">
              {content.reassurance.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {content.reassurance.guarantees.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#54453D]"
                >
                  <ItemIcon className="h-4 w-4 text-[#C78360]" aria-hidden="true" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

