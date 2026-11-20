/**
 * RASHX — Frequently Asked Questions (FAQ) Section (Editorial Knowledge Center)
 *
 * Server Component compatible (no 'use client'; native accessible HTML details/summary).
 * Pure Flat Design: zero borders, zero rings, zero shadows, zero gradients.
 * Preserved Palette: #F0C5AE · #91B8C0 · #CADEE2 · #FAF9F8 · #FFFFFF · #54453D · #75645B · #C78360 · #2C4349
 *
 * Layout per screen:
 *  - mobile  (< md): Numbered accordion stack with inset white answers + full-width support card
 *  - tablet  (md–lg): 2 independent columns (01–04 | 05–07 + Support Card) preventing cross-column stretch
 *  - desktop (lg+): 12-col split — sticky 4-col Support & Topics rail + 8-col numbered editorial drawers
 */

import { PageContainer } from '@rashx/ui';
import { ChevronDown, HelpCircle, Mail } from '@rashx/icons';
import { SectionTitle } from '@/components/sections';
import type { Lang } from '@/lib/lang';

export interface FAQProps {
  lang: Lang;
  className?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface EnrichedFAQItem extends FAQItem {
  index: string;
  topic: string;
  accentTone: string;
}

export function FAQ({ lang, className }: FAQProps) {
  const isAr = lang === 'ar';
  const supportEmail = 'hello@rashx.com';

  const content = isAr
    ? {
        eyebrow: 'الأسئلة الشائعة',
        title: 'إجابات واضحة لكل ما يهمك عن RASHX.',
        subtitle:
          'كل ما تحتاج معرفته عن بدء استخدام المنصة، إدارة الفروع، الفريق والصلاحيات، والدعم الفني.',
        topicsHeading: 'المحاور المغطاة',
        countLabel: '07 إجابات مباشرة',
        items: [
          {
            id: 'what-is-rashx',
            index: '01',
            topic: 'عن المنصة',
            accentTone: 'bg-[#F0C5AE]',
            question: 'ما هي منصة RASHX؟',
            answer:
              'RASHX هي منظومة سحابية ونظام تشغيل رقمي متكامل مصمم خصيصاً لصالونات التجميل، مراكز العناية، والسبا في المملكة العربية السعودية. تجمع المنصة إدارة المواعيد الذكية، سجلات العميلات، جدولة فريق العمل والورديات، قوائم الخدمات والأسعار، ونقاط البيع في واجهة موحدة وهادئة.',
          },
          {
            id: 'who-is-it-for',
            index: '02',
            topic: 'الأنشطة',
            accentTone: 'bg-[#91B8C0]',
            question: 'لمن صُممت المنصة؟',
            answer:
              'صُممت RASHX لتخدم مختلف أنشطة التجميل والعناية الشخصية: صالونات التجميل النسائية، صالونات الحلاقة والعناية الرجالية، مراكز السبا والاسترخاء، والمنشآت المتعددة الفروع، سواء كانت صالونات جديدة تؤسس أعمالها أو مراكز قائمة تبحث عن إدارة موحدة.',
          },
          {
            id: 'how-to-start',
            index: '03',
            topic: 'البداية',
            accentTone: 'bg-[#F0C5AE]',
            question: 'كيف أبدأ استخدام RASHX في صالوني؟',
            answer:
              'تبدأ الرحلة بخطوات بسيطة ومنظمة: تسجيل بيانات الصالون وتأكيد رقم الجوال، ثم إعداد الفروع وقائمة الخدمات والأسعار، وتعيين فريق العمل وجدولة الورديات، لتنطلق فوراً في استقبال الحجوزات وإدارة العمليات اليومية.',
          },
          {
            id: 'multi-branch',
            index: '04',
            topic: 'الفروع',
            accentTone: 'bg-[#91B8C0]',
            question: 'هل تدعم المنصة إدارة أكثر من فرع؟',
            answer:
              'نعم، تتيح المنصة إدارة فروع متعددة تحت حساب موحد؛ حيث يمكنك تخصيص الخدمات، الأسعار، وقوائم الأخصائيات لكل فرع على حدة، مع إمكانية متابعة مؤشرات الأداء وجداول المواعيد لكافة الفروع من لوحة تحكم مركزية واحدة.',
          },
          {
            id: 'staff-and-permissions',
            index: '05',
            topic: 'الفريق',
            accentTone: 'bg-[#F0C5AE]',
            question: 'كيف تتم إدارة فريق العمل وتحديد الصلاحيات؟',
            answer:
              'يمكنك إضافة الموظفات وتعيين تخصص كل أخصائية، وجدولة الورديات وأيام الإجازات، مع احتساب نسب العمولات تلقائياً لكل جلسة منجزة، وتحديد صلاحيات وصول مخصصة لحماية خصوصية بيانات المنشأة والعميلات.',
          },
          {
            id: 'saudi-market-fit',
            index: '06',
            topic: 'السوق السعودي',
            accentTone: 'bg-[#91B8C0]',
            question: 'هل المنصة مهيأة لمتطلبات الصالونات في المملكة؟',
            answer:
              'نعم بالكامل؛ المنصة مبنية باللغة العربية أولاً (مع دعم كامل للغة الإنجليزية)، وتدعم أرقام الجوال السعودية (+966)، والتعامل بالريال السعودي (ر.س)، مع جاهزية معمارية لكافة متطلبات الفوترة المعتمدة محلياً.',
          },
          {
            id: 'support-and-training',
            index: '07',
            topic: 'الدعم والتدريب',
            accentTone: 'bg-[#F0C5AE]',
            question: 'كيف أحصل على الدعم الفني والتدريب لفريقي؟',
            answer:
              'نقدم دعماً ومساندة مباشرة لتدريب فريق صالونك على النظام والتأكد من انطلاق العمل بسلاسة من اليوم الأول. يمكنك دائماً التواصل مع فريق الدعم المباشر عبر البريد الإلكتروني hello@rashx.com.',
          },
        ] as EnrichedFAQItem[],
        footerPrompt: {
          badge: 'الدعم المباشر',
          text: 'لديك استفسار آخر لم تجد إجابته هنا؟',
          actionText: 'تواصل مباشرة مع فريقنا عبر البريد الإلكتروني:',
          email: supportEmail,
        },
      }
    : {
        eyebrow: 'FREQUENTLY ASKED QUESTIONS',
        title: 'Clear answers to everything about RASHX.',
        subtitle:
          'Everything you need to know about getting started, multi-branch management, staff permissions, and technical support.',
        topicsHeading: 'Topics covered',
        countLabel: '07 direct answers',
        items: [
          {
            id: 'what-is-rashx',
            index: '01',
            topic: 'Platform',
            accentTone: 'bg-[#F0C5AE]',
            question: 'What is RASHX?',
            answer:
              'RASHX is a comprehensive cloud operating system engineered specifically for beauty salons, wellness centers, and spas in Saudi Arabia. It unifies smart appointment booking, client records, staff shifts, service catalogs, and point-of-sale workflows in one calm, intuitive interface.',
          },
          {
            id: 'who-is-it-for',
            index: '02',
            topic: 'Businesses',
            accentTone: 'bg-[#91B8C0]',
            question: 'Who is the platform designed for?',
            answer:
              'RASHX is designed for all personal care and wellness businesses: beauty salons, barbershops, wellness spas, and multi-branch beauty enterprises—whether launching a new salon or consolidating existing operations into one unified system.',
          },
          {
            id: 'how-to-start',
            index: '03',
            topic: 'Onboarding',
            accentTone: 'bg-[#F0C5AE]',
            question: 'How do I get started with RASHX?',
            answer:
              'Getting started follows a simple, structured roadmap: register your salon profile, verify your mobile number (+966), configure your branches and service menu, set up your team and shifts, and begin accepting live bookings immediately.',
          },
          {
            id: 'multi-branch',
            index: '04',
            topic: 'Branches',
            accentTone: 'bg-[#91B8C0]',
            question: 'Does RASHX support multiple branches?',
            answer:
              'Yes, RASHX natively supports multi-branch management under a single workspace. You can customize treatments, pricing, and specialist allocations per branch while monitoring holistic operational metrics from a single dashboard.',
          },
          {
            id: 'staff-and-permissions',
            index: '05',
            topic: 'Team & Roles',
            accentTone: 'bg-[#F0C5AE]',
            question: 'How are staff specialists and permissions managed?',
            answer:
              'You can easily add specialists, define roles and services, schedule shifts, automate commission calculations per completed visit, and configure granular permissions to protect salon data privacy.',
          },
          {
            id: 'saudi-market-fit',
            index: '06',
            topic: 'Saudi Market',
            accentTone: 'bg-[#91B8C0]',
            question: 'Is the platform tailored to Saudi market requirements?',
            answer:
              'Yes, completely. RASHX is built Arabic-first (with complete English localization), supports Saudi mobile formats (+966), transacts in Saudi Riyals (SAR), and is architecturally ready for compliant invoicing requirements.',
          },
          {
            id: 'support-and-training',
            index: '07',
            topic: 'Support',
            accentTone: 'bg-[#F0C5AE]',
            question: 'How do we receive technical support and team training?',
            answer:
              'We provide direct team training and ongoing onboarding assistance to ensure smooth daily operations from day one. You can reach our dedicated support team directly at hello@rashx.com.',
          },
        ] as EnrichedFAQItem[],
        footerPrompt: {
          badge: 'DIRECT SUPPORT',
          text: 'Have a question that is not covered here?',
          actionText: 'Reach out directly to our team via email:',
          email: supportEmail,
        },
      };

  const tabletStartItems = content.items.slice(0, 4);
  const tabletEndItems = content.items.slice(4);

  /* ── Flat Accessible Accordion Drawer (no borders, rings, or shadows) ── */
  const renderAccordionItem = (
    item: EnrichedFAQItem,
    density: 'mobile' | 'tablet' | 'desktop',
  ) => {
    const isDesktop = density === 'desktop';
    const isMobile = density === 'mobile';

    return (
      <details
        key={`${density}-${item.id}`}
        className={`group overflow-hidden bg-[#FAF9F8] transition-colors duration-200 open:bg-[#F0C5AE]/20 ${
          isDesktop
            ? 'rounded-[1.5rem]'
            : isMobile
              ? 'rounded-2xl'
              : 'rounded-[1.35rem]'
        }`}
      >
        <summary
          className={`flex cursor-pointer list-none items-center justify-between gap-4 select-none rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D] [&::-webkit-details-marker]:hidden ${
            isDesktop ? 'p-6 xl:p-7' : isMobile ? 'p-4' : 'p-5'
          }`}
        >
          <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
            {/* Number Badge */}
            <span
              aria-hidden="true"
              className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-white font-mono font-black text-[#54453D] transition-colors duration-200 group-open:bg-[#F0C5AE] ${
                isDesktop
                  ? 'h-11 w-11 text-sm'
                  : isMobile
                    ? 'h-9 w-9 text-xs'
                    : 'h-10 w-10 text-xs'
              }`}
            >
              {item.index}
            </span>

            <div className="min-w-0">
              <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#75645B] sm:text-[0.7rem]">
                {item.topic}
              </span>
              <span
                className={`mt-0.5 block font-bold leading-snug text-[#54453D] transition-colors duration-200 group-open:text-[#C78360] ${
                  isDesktop
                    ? 'text-lg xl:text-xl'
                    : isMobile
                      ? 'text-sm'
                      : 'text-base'
                }`}
              >
                {item.question}
              </span>
            </div>
          </div>

          <span
            aria-hidden="true"
            className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white text-[#54453D] transition-all duration-200 group-open:rotate-180 group-open:bg-[#54453D] group-open:text-[#FAF9F8] ${
              isDesktop ? 'h-9 w-9' : 'h-8 w-8'
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </summary>

        {/* Flat White Answer Inset */}
        <div
          className={
            isDesktop
              ? 'px-6 pb-6 xl:px-7 xl:pb-7'
              : isMobile
                ? 'px-4 pb-4'
                : 'px-5 pb-5'
          }
        >
          <div className="relative overflow-hidden rounded-2xl bg-white p-4 ps-6 sm:p-5 sm:ps-7">
            <span
              aria-hidden="true"
              className={`absolute inset-y-4 start-0 w-1.5 rounded-e-full ${item.accentTone}`}
            />
            <p
              className={`leading-relaxed text-[#75645B] ${
                isDesktop ? 'text-base' : 'text-sm'
              }`}
            >
              {item.answer}
            </p>
          </div>
        </div>
      </details>
    );
  };

  return (
    <section
      id="faq"
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
            1. MOBILE LAYOUT (< md): Numbered Stack + Full-Width Support
           ============================================================ */}
        <div className="mt-10 md:hidden">
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#FAF9F8] px-4 py-2.5">
            <span className="text-xs font-bold text-[#54453D]">
              {content.topicsHeading}
            </span>
            <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-[0.7rem] font-bold text-[#2C4349]">
              {content.countLabel}
            </span>
          </div>

          <div className="space-y-3">
            {content.items.map((item) => renderAccordionItem(item, 'mobile'))}
          </div>

          {/* Mobile Direct Support Card */}
          <div className="mt-6 rounded-[1.75rem] bg-[#FAF9F8] p-5 text-center">
            <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#CADEE2] text-[#2C4349]">
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-3.5 text-lg font-extrabold text-[#54453D]">
              {content.footerPrompt.text}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#75645B]">
              {content.footerPrompt.actionText}
            </p>
            <a
              href={`mailto:${content.footerPrompt.email}`}
              dir="ltr"
              className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#F0C5AE] px-5 py-3 text-sm font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D]"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>{content.footerPrompt.email}</span>
            </a>
          </div>
        </div>

        {/* ============================================================
            2. TABLET LAYOUT (md → lg): 2 Independent Columns + Support
           ============================================================ */}
        <div className="mt-12 hidden md:block lg:hidden">
          <div className="grid grid-cols-2 items-start gap-5">
            {/* Start Column: Q01 → Q04 */}
            <div className="space-y-3.5">
              {tabletStartItems.map((item) =>
                renderAccordionItem(item, 'tablet'),
              )}
            </div>

            {/* End Column: Q05 → Q07 + Integrated Support Card */}
            <div className="space-y-3.5">
              {tabletEndItems.map((item) =>
                renderAccordionItem(item, 'tablet'),
              )}

              <div className="rounded-[1.5rem] bg-[#FAF9F8] p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#CADEE2] text-[#2C4349]">
                    <HelpCircle className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#2C4349]">
                    {content.footerPrompt.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-extrabold leading-snug text-[#54453D]">
                  {content.footerPrompt.text}
                </h3>

                <p className="mt-1.5 text-sm leading-relaxed text-[#75645B]">
                  {content.footerPrompt.actionText}
                </p>

                <a
                  href={`mailto:${content.footerPrompt.email}`}
                  dir="ltr"
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#F0C5AE] px-4 py-2.5 text-sm font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>{content.footerPrompt.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. DESKTOP LAYOUT (lg+): 12-Col Sticky Guide + Editorial Stream
           ============================================================ */}
        <div className="mt-16 hidden lg:block xl:mt-20">
          <div className="grid grid-cols-12 items-start gap-8 xl:gap-12">
            {/* Start 4 cols: Sticky Knowledge & Support Sidebar */}
            <aside className="sticky top-24 col-span-4 space-y-5">
              {/* Covered Topics Overview */}
              <div className="rounded-[2rem] bg-[#FAF9F8] p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#75645B]">
                    {content.topicsHeading}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 font-mono text-xs font-bold text-[#2C4349]">
                    {content.countLabel}
                  </span>
                </div>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {content.items.map((item) => (
                    <li
                      key={`topic-${item.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-[#54453D]"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${item.accentTone}`}
                      />
                      <span>{item.topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct Support Card */}
              <div className="relative overflow-hidden rounded-[2rem] bg-[#FAF9F8] p-7 xl:p-8">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-8 top-0 h-1.5 rounded-b-full bg-[#91B8C0]"
                />

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#CADEE2] text-[#2C4349]">
                    <HelpCircle className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[#2C4349]">
                    {content.footerPrompt.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-extrabold leading-snug text-[#54453D] xl:text-2xl">
                  {content.footerPrompt.text}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-[#75645B] xl:text-base">
                  {content.footerPrompt.actionText}
                </p>

                <a
                  href={`mailto:${content.footerPrompt.email}`}
                  dir="ltr"
                  className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#F0C5AE] px-5 py-3 text-sm font-extrabold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54453D]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>{content.footerPrompt.email}</span>
                </a>
              </div>
            </aside>

            {/* End 8 cols: Numbered Editorial Accordion Stream */}
            <div className="col-span-8 space-y-4">
              {content.items.map((item) => renderAccordionItem(item, 'desktop'))}
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

export { FAQ as Faq };