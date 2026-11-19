import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  Scissors,
  Store,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface PricingPlansProps {
  lang: Lang;
  className?: string;
}

export function PricingPlans({ lang, className }: PricingPlansProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const sectionContent = isAr
    ? {
        eyebrow: 'باقات الاشتراك المعتمدة',
        title: 'خيارات اشتراك مرنة مصممة حسب حجم أعمالك',
        subtitle:
          'نقدم باقات اشتراك مصممة بدقة لتواكب مرحلة نمو صالونك، مع تسعير مخصص يضمن حصولك على القيمة التشغيلية الكاملة دون أي تكاليف غير مستغلة.',
        plans: [
          {
            id: 'starter',
            name: 'باقة الانطلاق',
            englishName: 'Starter Tier',
            target: 'للصالونات وصالونات الحلاقة الفردية والناشئة',
            icon: Store,
            priceLabel: 'تسعير مخصص',
            priceSub: 'بحسب حجم فريق العمل والعمليات',
            popular: false,
            tone: 'bg-[#FAF9F8]',
            accent: 'bg-[#FAF9F8]',
            badge: 'الأساسيات التشغيلية',
            ctaLabel: 'تواصل لطلب الباقة',
            ctaHref: 'mailto:hello@rashx.com?subject=RASHX%20Starter%20Plan%20Inquiry',
            features: [
              'تقويم وجدول مواعيد تفاعلي يمنع التعارض',
              'ملفات العملاء الأساسية وسجل الزيارات',
              'كاشير ونقاط بيع سحابية سريعة',
              'فواتير ضريبية مبسطة مع رمز الاستجابة (ZATCA)',
              'صلاحيات وصول محددة لطاقم العمل',
              'دعم فني وإعداد أولي للخدمات والأسعار',
            ],
          },
          {
            id: 'pro',
            name: 'باقة الصالون المتكامل',
            englishName: 'Pro Tier',
            target: 'لمراكز التجميل ذات الكثافة التشغيلية العالية',
            icon: Scissors,
            priceLabel: 'تسعير مخصص',
            priceSub: 'الأكثر ملاءمة لصالونات التجميل والعناية',
            popular: true,
            tone: 'bg-[#F0C5AE]',
            accent: 'bg-white',
            badge: 'الخيار الأكثر طلبًا',
            ctaLabel: 'طلب استشارة وعرض تجريبي',
            ctaHref: 'mailto:hello@rashx.com?subject=RASHX%20Pro%20Plan%20Consultation',
            features: [
              'جميع مميزات باقة الانطلاق الأساسية',
              'احتساب آلي ومباشر لعمولات الأخصائيات',
              'أرشفة تركيبات الصبغات والملاحظات الفنية',
              'مراقبة استهلاك منتجات ومستلزمات الصالون',
              'موقع وبوابة حجز إلكتروني مباشر بهوية صالونك',
              'تقارير مالية وتشغيلية لحظية قابلة للتصدير',
              'جلسات تدريب شاملة لمدير الصالون والأخصائيات',
            ],
          },
          {
            id: 'enterprise',
            name: 'باقة السلاسل ومراكز السبا',
            englishName: 'Enterprise Tier',
            target: 'لسلاسل الصالونات الكبرى ومراكز السبا الفاخرة',
            icon: Building2,
            priceLabel: 'حلول مؤسسية مخصصة',
            priceSub: 'مرونة كاملة لتعدد الفروع والعمليات',
            popular: false,
            tone: 'bg-[#CADEE2]',
            accent: 'bg-[#CADEE2]',
            badge: 'سلاسل الفروع الكبرى',
            ctaLabel: 'تواصل مع فريق المؤسسات',
            ctaHref: 'mailto:hello@rashx.com?subject=RASHX%20Enterprise%20Plan%20Inquiry',
            features: [
              'جميع مميزات باقة الصالون المتكامل',
              'إدارة مركزية موحدة لشبكات الفروع المتعددة',
              'جاهزية دعم النطاقات الرقمية المخصصة',
              'عزل مؤسسي متقدم لبيانات وتقارير كل فرع',
              'مدير حساب مخصص وتدريب ميداني شامل',
              'أولوية قصوى في الدعم الفني والاستجابة',
            ],
          },
        ],
        pricingNotice: {
          title: 'سياسة التسعير العادل والشفافية التامة',
          desc:
            'في راش إكس لا نعتمد أرقامًا غير مدروسة أو باقات نمطية؛ يتحدد استثمارك بناءً على دراسة دقيقة لاحتياج منشأتك وعدد مقدمي الخدمة والفروع لضمان تحقيق أعلى عائد على الاستثمار.',
        },
      }
    : {
        eyebrow: 'Verified Subscription Tiers',
        title: 'Flexible Subscription Plans Aligned with Your Scale',
        subtitle:
          'Thoughtfully structured plans engineered to match your salon’s development stage, backed by tailored pricing ensuring maximum operational yield without unutilized overhead.',
        plans: [
          {
            id: 'starter',
            name: 'Starter Plan',
            englishName: 'Starter Tier',
            target: 'For emerging salons, studios, and individual barbershops',
            icon: Store,
            priceLabel: 'Custom Quote',
            priceSub: 'Based on staff size and operational volume',
            popular: false,
            tone: 'bg-[#FAF9F8]',
            accent: 'bg-[#FAF9F8]',
            badge: 'Operational Essentials',
            ctaLabel: 'Inquire for Starter Plan',
            ctaHref: 'mailto:hello@rashx.com?subject=RASHX%20Starter%20Plan%20Inquiry',
            features: [
              'Interactive visual calendar with conflict prevention',
              'Essential client profiles and past visit logs',
              'Fast cloud-based Point of Sale (POS)',
              'ZATCA-compliant Simplified Tax Invoices with QR codes',
              'Granular role-based staff access permissions',
              'Technical onboarding and initial catalog configuration',
            ],
          },
          {
            id: 'pro',
            name: 'Integrated Salon Pro',
            englishName: 'Pro Tier',
            target: 'For bustling beauty centers with high appointment velocity',
            icon: Scissors,
            priceLabel: 'Custom Quote',
            priceSub: 'Most popular choice for beauty & wellness centers',
            popular: true,
            tone: 'bg-[#F0C5AE]',
            accent: 'bg-white',
            badge: 'Most Popular Choice',
            ctaLabel: 'Request Consultation & Demo',
            ctaHref: 'mailto:hello@rashx.com?subject=RASHX%20Pro%20Plan%20Consultation',
            features: [
              'All core capabilities included in Starter',
              'Automated specialist commission calculation engine',
              'Permanent color formula archive and technical notes',
              'Real-time backbar inventory consumption tracking',
              'Custom branded web booking portal available 24/7',
              'Exportable financial analytics and operational metrics',
              'Comprehensive onboarding sessions for managers and staff',
            ],
          },
          {
            id: 'enterprise',
            name: 'Enterprise & Spa Chains',
            englishName: 'Enterprise Tier',
            target: 'For multi-branch chains, luxury day spas, and wellness resorts',
            icon: Building2,
            priceLabel: 'Tailored Enterprise',
            priceSub: 'Complete scalability for multi-location groups',
            popular: false,
            tone: 'bg-[#CADEE2]',
            accent: 'bg-[#CADEE2]',
            badge: 'Multi-Branch Chains',
            ctaLabel: 'Contact Enterprise Team',
            ctaHref: 'mailto:hello@rashx.com?subject=RASHX%20Enterprise%20Plan%20Inquiry',
            features: [
              'All advanced capabilities included in Pro',
              'Centralized oversight across multi-branch networks',
              'Custom domain integration readiness',
              'Advanced logical tenant isolation for branch data',
              'Dedicated account manager and onsite training sessions',
              'Highest priority SLA and rapid technical response',
            ],
          },
        ],
        pricingNotice: {
          title: 'Fair Pricing & Absolute Transparency Commitment',
          desc:
            'At RASHX, we never publish arbitrary figures or rigid cookie-cutter packages. Your exact investment is tailored to your facility size, staff headcount, and operational requirements to guarantee peak return on investment.',
        },
      };

  return (
    <section
      id="plans"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            eyebrow={sectionContent.eyebrow}
            title={sectionContent.title}
            align="center"
            withWordmark={true}
          />
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B]">
            {sectionContent.subtitle}
          </p>
        </div>

        {/* 3 Plans Bento Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {sectionContent.plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <article
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 lg:p-10 transition-colors duration-200 ${
                  plan.popular ? 'bg-[#F0C5AE] text-[#54453D]' : 'bg-[#FAF9F8] text-[#54453D]'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#54453D]">
                      <Sparkles className="h-3.5 w-3.5 text-[#C78360]" aria-hidden="true" />
                      <span>{plan.badge}</span>
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#54453D]`}
                    >
                      <Icon className="h-6 w-6 text-[#C78360]" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#75645B]">
                      {plan.englishName}
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#54453D]">
                    {plan.name}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-[#75645B] min-h-[38px]">
                    {plan.target}
                  </p>

                  {/* Price Block */}
                  <div className="my-6 rounded-2xl bg-white/70 p-4 sm:p-5">
                    <span className="text-xl sm:text-2xl font-extrabold text-[#54453D] block">
                      {plan.priceLabel}
                    </span>
                    <span className="mt-1 text-xs text-[#75645B] block">
                      {plan.priceSub}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#54453D]">
                      {isAr ? 'المميزات المتضمنة في الباقة:' : 'Included Capabilities:'}
                    </h4>
                    <ul className="space-y-2.5 text-xs sm:text-sm">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span className="leading-snug text-[#54453D]">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Plan Subscription CTA */}
                <div className="mt-8 pt-6">
                  <a
                    href={plan.ctaHref}
                    className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      plan.popular
                        ? 'bg-[#54453D] text-white hover:bg-[#3D322B] focus-visible:ring-white'
                        : 'bg-white text-[#54453D] hover:bg-white/80 focus-visible:ring-[#54453D]'
                    }`}
                  >
                    <span>{plan.ctaLabel}</span>
                    <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pricing Policy Box */}
        <div className="mt-10 sm:mt-14 rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 text-[#54453D]">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#91B8C0]/30 text-[#2C4349]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-[#54453D]">
                {sectionContent.pricingNotice.title}
              </h4>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#75645B]">
                {sectionContent.pricingNotice.desc}
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

