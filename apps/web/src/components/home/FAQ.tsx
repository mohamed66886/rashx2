/**
 * RASHX — Frequently Asked Questions (FAQ) Section
 *
 * Server Component compatible (no 'use client' needed; uses native accessible HTML details/summary).
 * Flat design only: zero borders, zero shadows, zero gradients.
 * Palette: #F0C5AE · #91B8C0 · #FAF9F8 · #FFFFFF · #54453D (+ existing #75645B, #C78360, #2C4349)
 *
 * Accessibility & Interaction:
 *  - Native HTML <details> and <summary> semantics: full keyboard navigation (Space / Enter)
 *  - Native screen reader state management
 *  - Zero layout shift and zero JS dependency for core accordion behavior
 *  - Factual questions & answers verified against RASHX codebase capabilities
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

export function FAQ({ lang, className }: FAQProps) {
  const isAr = lang === 'ar';
  const supportEmail = 'hello@rashx.com';

  const content = isAr
    ? {
        eyebrow: 'الأسئلة الشائعة',
        title: 'إجابات واضحة لكل ما يهمك عن RASHX.',
        subtitle:
          'كل ما تحتاج معرفته عن بدء استخدام المنصة، إدارة الفروع، الفريق والصلاحيات، والدعم الفني.',
        items: [
          {
            id: 'what-is-rashx',
            question: 'ما هي منصة RASHX؟',
            answer:
              'RASHX هي منظومة سحابية ونظام تشغيل رقمي متكامل مصمم خصيصاً لصالونات التجميل، مراكز العناية، والسبا في المملكة العربية السعودية. تجمع المنصة إدارة المواعيد الذكية، سجلات العميلات، جدولة فريق العمل والورديات، قوائم الخدمات والأسعار، ونقاط البيع في واجهة موحدة وهادئة.',
          },
          {
            id: 'who-is-it-for',
            question: 'لمن صُممت المنصة؟',
            answer:
              'صُممت RASHX لتخدم مختلف أنشطة التجميل والعناية الشخصية: صالونات التجميل النسائية، صالونات الحلاقة والعناية الرجالية، مراكز السبا والاسترخاء، والمنشآت المتعددة الفروع، سواء كانت صالونات جديدة تؤسس أعمالها أو مراكز قائمة تبحث عن إدارة موحدة.',
          },
          {
            id: 'how-to-start',
            question: 'كيف أبدأ استخدام RASHX في صالوني؟',
            answer:
              'تبدأ الرحلة بخطوات بسيطة ومنظمة: تسجيل بيانات الصالون وتأكيد رقم الجوال، ثم إعداد الفروع وقائمة الخدمات والأسعار، وتعيين فريق العمل وجدولة الورديات، لتنطلق فوراً في استقبال الحجوزات وإدارة العمليات اليومية.',
          },
          {
            id: 'multi-branch',
            question: 'هل تدعم المنصة إدارة أكثر من فرع؟',
            answer:
              'نعم، تتيح المنصة إدارة فروع متعددة تحت حساب موحد؛ حيث يمكنك تخصيص الخدمات، الأسعار، وقوائم الأخصائيات لكل فرع على حدة، مع إمكانية متابعة مؤشرات الأداء وجداول المواعيد لكافة الفروع من لوحة تحكم مركزية واحدة.',
          },
          {
            id: 'staff-and-permissions',
            question: 'كيف تتم إدارة فريق العمل وتحديد الصلاحيات؟',
            answer:
              'يمكنك إضافة الموظفات وتعيين تخصص كل أخصائية، وجدولة الورديات وأيام الإجازات، مع احتساب نسب العمولات تلقائياً لكل جلسة منجزة، وتحديد صلاحيات وصول مخصصة لحماية خصوصية بيانات المنشأة والعميلات.',
          },
          {
            id: 'saudi-market-fit',
            question: 'هل المنصة مهيأة لمتطلبات الصالونات في المملكة؟',
            answer:
              'نعم بالكامل؛ المنصة مبنية باللغة العربية أولاً (مع دعم كامل للغة الإنجليزية)، وتدعم أرقام الجوال السعودية (+966)، والتعامل بالريال السعودي (ر.س)، مع جاهزية معمارية لكافة متطلبات الفوترة المعتمدة محلياً.',
          },
          {
            id: 'support-and-training',
            question: 'كيف أحصل على الدعم الفني والتدريب لفريقي؟',
            answer:
              'نقدم دعماً ومساندة مباشرة لتدريب فريق صالونك على النظام والتأكد من انطلاق العمل بسلاسة من اليوم الأول. يمكنك دائماً التواصل مع فريق الدعم المباشر عبر البريد الإلكتروني hello@rashx.com.',
          },
        ],
        footerPrompt: {
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
        items: [
          {
            id: 'what-is-rashx',
            question: 'What is RASHX?',
            answer:
              'RASHX is a comprehensive cloud operating system engineered specifically for beauty salons, wellness centers, and spas in Saudi Arabia. It unifies smart appointment booking, client records, staff shifts, service catalogs, and point-of-sale workflows in one calm, intuitive interface.',
          },
          {
            id: 'who-is-it-for',
            question: 'Who is the platform designed for?',
            answer:
              'RASHX is designed for all personal care and wellness businesses: beauty salons, barbershops, wellness spas, and multi-branch beauty enterprises—whether launching a new salon or consolidating existing operations into one unified system.',
          },
          {
            id: 'how-to-start',
            question: 'How do I get started with RASHX?',
            answer:
              'Getting started follows a simple, structured roadmap: register your salon profile, verify your mobile number (+966), configure your branches and service menu, set up your team and shifts, and begin accepting live bookings immediately.',
          },
          {
            id: 'multi-branch',
            question: 'Does RASHX support multiple branches?',
            answer:
              'Yes, RASHX natively supports multi-branch management under a single workspace. You can customize treatments, pricing, and specialist allocations per branch while monitoring holistic operational metrics from a single dashboard.',
          },
          {
            id: 'staff-and-permissions',
            question: 'How are staff specialists and permissions managed?',
            answer:
              'You can easily add specialists, define roles and services, schedule shifts, automate commission calculations per completed visit, and configure granular permissions to protect salon data privacy.',
          },
          {
            id: 'saudi-market-fit',
            question: 'Is the platform tailored to Saudi market requirements?',
            answer:
              'Yes, completely. RASHX is built Arabic-first (with complete English localization), supports Saudi mobile formats (+966), transacts in Saudi Riyals (SAR), and is architecturally ready for compliant invoicing requirements.',
          },
          {
            id: 'support-and-training',
            question: 'How do we receive technical support and team training?',
            answer:
              'We provide direct team training and ongoing onboarding assistance to ensure smooth daily operations from day one. You can reach our dedicated support team directly at hello@rashx.com.',
          },
        ],
        footerPrompt: {
          text: 'Have a question that is not covered here?',
          actionText: 'Reach out directly to our team via email:',
          email: supportEmail,
        },
      };

  return (
    <section
      id="faq"
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

        {/* ── Accordion List ────────────────────────────────────── */}
        <div className="mx-auto mt-12 sm:mt-16 max-w-3xl space-y-3.5">
          {content.items.map((item) => (
            <details
              key={item.id}
              className="group rounded-2xl bg-[#FAF9F8] p-5 sm:p-6 transition-colors duration-200 open:bg-[#FAF9F8]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2 rounded-xl">
                <span className="text-base sm:text-lg font-bold text-[#54453D] transition-colors duration-200 group-open:text-[#C78360]">
                  {item.question}
                </span>
                <span
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#54453D] transition-transform duration-200 group-open:rotate-180 group-open:bg-[#F0C5AE]"
                  aria-hidden="true"
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>

              <div className="mt-3.5 text-sm sm:text-base leading-relaxed text-[#75645B]">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* ── Direct Support Prompt Banner ──────────────────────── */}
        <div className="mx-auto mt-12 sm:mt-16 max-w-2xl rounded-2xl bg-[#FAF9F8] p-6 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#CADEE2] text-[#2C4349] mb-3">
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#54453D]">
            {content.footerPrompt.text}
          </h3>
          <p className="mt-1 text-sm text-[#75645B]">
            {content.footerPrompt.actionText}{' '}
            <a
              href={`mailto:${content.footerPrompt.email}`}
              className="inline-flex items-center gap-1.5 font-bold text-[#54453D] underline decoration-[#91B8C0] underline-offset-4 hover:text-[#C78360] transition-colors"
              dir="ltr"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{content.footerPrompt.email}</span>
            </a>
          </p>
        </div>
      </PageContainer>
    </section>
  );
}

export { FAQ as Faq };

