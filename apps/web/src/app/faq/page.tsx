/**
 * RASHX Official FAQ Page
 *
 * Dedicated Route: /faq
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Authoritative operational, compliance, and technical answers.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { JsonLd } from '@/components/seo';
import { buildFaqSchema } from '@rashx/seo/structured-data';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, HelpCircle, Phone, Sparkles } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'الأسئلة الشائعة | RASHX — إجابات وافية حول المنظومة الرقمية والتشغيل'
      : 'Frequently Asked Questions | RASHX — Cloud Salon Platform Answers',
    description: isAr
      ? 'إجابات رسمية ومفصلة حول منظومة RASHX: الفوترة الإلكترونية ZATCA، النطاق الفرعي المستقل، حساب العمولات، أمن البيانات، وبدء الاستخدام.'
      : 'Comprehensive verified answers regarding RASHX features, ZATCA Phase 2 compliance, custom subdomains, specialist commissions, and data security.',
    path: '/faq',
    lang,
  });
}

interface FAQItem {
  question: { ar: string; en: string };
  answer: { ar: string; en: string };
  category: { ar: string; en: string };
}

const faqs: FAQItem[] = [
  {
    category: { ar: 'المنظومة والهوية الرقمية', en: 'Ecosystem & Brand Identity' },
    question: {
      ar: 'ما هي منظومة RASHX وكيف تختلف عن البرامج العادية؟',
      en: 'What is RASHX and how does it differ from standard salon software?',
    },
    answer: {
      ar: 'لا تقدم RASHX مجرد لوحة تحكم عادية، بل توفر لكل منشأة منظومة رقمية متكاملة (4 في 1) تعمل تحت نطاق فرعي معتمد ([salon].rashx.org). تشمل المنظومة: موقعاً إلكترونياً خاصاً للمنشأة، لوحة تحكم إدارية مركزية، تطبيقاً أو بوابة لحجز العميل، وتطبيقاً خاصاً لمقدمي الخدمة.',
      en: 'RASHX is not just an admin portal; it equips each facility with a 4-in-1 digital ecosystem operating on a dedicated subdomain ([salon].rashx.org). It includes a branded public website, central management dashboard, client booking portal, and a specialist mobile app.',
    },
  },
  {
    category: { ar: 'الفوترة والامتثال النظامي', en: 'Invoicing & ZATCA Compliance' },
    question: {
      ar: 'هل تدعم المنظومة متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) للمرحلة الثانية؟',
      en: 'Does RASHX support ZATCA Phase 2 (Integration Phase) mandates?',
    },
    answer: {
      ar: 'نعم، تدعم RASHX متطلبات الفوترة الإلكترونية في المملكة العربية السعودية بالكامل، مع اعتماد المرحلة الثانية (الربط والتكامل) وفق حالة المنشأة. يتم توليد فواتير ضريبية مبسطة تحتوي على رمز الاستجابة السريعة المشفر (QR Code) والتوقيع الرقمي وسجل تدقيق غير قابل للتعديل.',
      en: 'Yes. RASHX is architected in full alignment with Saudi ZATCA e-invoicing regulations, supporting Phase 2 clearance and reporting. It generates compliant simplified tax invoices with cryptographic QR codes and tamper-proof digital audit trails.',
    },
  },
  {
    category: { ar: 'العمليات والموظفون', en: 'Operations & Staff Rostering' },
    question: {
      ar: 'كيف يتعامل النظام مع عمولات الكوافيرات ومقدمي الخدمات؟',
      en: 'How does RASHX calculate specialist commissions and tips?',
    },
    answer: {
      ar: 'يوفر نظام الموارد البشرية محركاً حسابياً مرناً يتيح ضبط نسب عمولات مخصصة لكل خدمة أو فئة خدمات أو مبيعات منتجات التجزئة. تُحسب العمولات تلقائياً بمجرد إتمام الخدمة وتأكيد الفاتورة، مع شاشات تقارير شفافة لمقدم الخدمة وإدارة الصالون.',
      en: 'The HR module features an automated commission engine supporting custom percentages per service category or retail sale. Earnings compute immediately upon session checkout, giving specialists and managers real-time earnings visibility.',
    },
  },
  {
    category: { ar: 'ترحيل البيانات والأجهزة', en: 'Data Migration & Hardware' },
    question: {
      ar: 'هل يمكن نقل بيانات عميلاتي وخدماتي السابقة من Excel أو نظام آخر؟',
      en: 'Can I migrate my existing customer records and service lists from Excel?',
    },
    answer: {
      ar: 'نعم بكل تأكيد. يقدم فريق التهيئة والدعم الفني في RASHX مساعدة مخصصة لاستيراد بيانات العملاء، سجلات أرقام الهواتف، وقوائم الخدمات والأسعار من جداول Excel والأنظمة السابقة دون أي فقدان أو انقطاع تشغيلي.',
      en: 'Absolutely. Our onboarding engineers provide seamless data migration services, importing client rosters, phone numbers, and service catalogs from spreadsheets or legacy software with zero downtime.',
    },
  },
  {
    category: { ar: 'الأمان وعزل البيانات', en: 'Data Privacy & Tenant Isolation' },
    question: {
      ar: 'كيف تضمن RASHX خصوصية وأمان بيانات صالوني وعميلاتي؟',
      en: 'How does RASHX ensure data confidentiality and tenant isolation?',
    },
    answer: {
      ar: 'تعمل المنصة بنظام عزل المنشآت (Tenant Isolation)، حيث تُحفظ بيانات كل منشأة وسجلاتها المالية وقوائم عملائها في بيئة برمجية مشفرة ومستقلة، متوافقة مع نظام حماية البيانات الشخصية (PDPL) بالمملكة.',
      en: 'RASHX implements strict logical tenant isolation. Financial transactions, staff commissions, and customer profiles are encrypted and siloed, fully adhering to Saudi Personal Data Protection Law (PDPL).',
    },
  },
  {
    category: { ar: 'التوسع والفروع', en: 'Branch Expansion & Scalability' },
    question: {
      ar: 'هل تدعم المنظومة تشغيل عدة فروع بحساب إداري واحد؟',
      en: 'Can I manage multiple salon branches from a single dashboard?',
    },
    answer: {
      ar: 'نعم، تدعم المنظومة إدارة السلاسل متعددة الفروع مركزياً؛ حيث يمكنك مراقبة مبيعات كافة الفروع، توحيد سياسات التسعير، مشاركة باقات العضويات ومحافظ العميلات عبر السلسلة، وإدارة نقل المخزون بين الفروع بكل مرونة.',
      en: 'Yes. RASHX provides enterprise multi-branch capabilities: aggregated executive dashboards, synchronized catalog pricing, cross-branch member wallets, and inter-branch inventory transfer workflows.',
    },
  },
];

export default async function FAQPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const demoHref = (isAr ? routes.demo : `${routes.demo}?lang=en`) as Route;
  const contactHref = (isAr ? routes.contact : `${routes.contact}?lang=en`) as Route;

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <JsonLd
        data={buildFaqSchema(
          faqs.map((f) => ({
            question: f.question[lang],
            answer: f.answer[lang],
          })),
          lang,
        )}
      />
      <Header lang={lang} />

      <main id="main-content">
        {/* Hero */}
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                as="h1"
                eyebrow={isAr ? 'مركز الأسئلة والأجوبة' : 'KNOWLEDGE & FAQ'}
                title={
                  isAr
                    ? 'كل ما تود معرفته حول منظومة RASHX وتشغيل الصالونات'
                    : 'Everything You Need to Know About the RASHX Platform'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'إجابات واضحة وموثقة حول البنية السحابية، الفوترة الإلكترونية، حساب العمولات، استقلالية البيانات، وكيفية بدء الاستخدام فوراً.'
                  : 'Clear, authoritative answers covering cloud architecture, ZATCA e-invoicing, commissions, data privacy, and onboarding.'}
              </p>
            </div>
          </PageContainer>
        </section>

        {/* FAQs List */}
        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 transition-colors duration-200"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#C78360] mb-2">
                    <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{faq.category[lang]}</span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-[#54453D] mb-3">
                    {faq.question[lang]}
                  </h2>

                  <p className="text-sm sm:text-base leading-relaxed text-[#75645B]">
                    {faq.answer[lang]}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Support Callout */}
            <div className="mt-14 sm:mt-20 max-w-4xl mx-auto rounded-3xl bg-[#FAF9F8] p-8 sm:p-12 text-center" dir={isAr ? 'rtl' : 'ltr'}>
              <h3 className="text-xl sm:text-2xl font-black text-[#54453D] mb-3">
                {isAr ? 'هل لديك استفسار إضافي لم تجد إجابته هنا؟' : 'Have a Specific Question Not Listed Here?'}
              </h3>
              <p className="text-sm sm:text-base text-[#75645B] max-w-xl mx-auto mb-8 leading-relaxed">
                {isAr
                  ? 'فريق الدعم الفني والاستشارات مستعد للإجابة على جميع استفساراتك التشغيلية ومساعدتك في اختيار الإعداد المناسب.'
                  : 'Our product specialists are ready to answer your questions and assist with tailored recommendations.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={contactHref}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span>{isAr ? 'تواصل مع فريقنا المباشر' : 'Contact Support Team'}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  href={demoHref}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>{isAr ? 'طلب عرض حي تفاعلي' : 'Schedule a Demo'}</span>
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

