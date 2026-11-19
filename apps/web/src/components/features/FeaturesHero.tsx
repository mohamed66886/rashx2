import Link from 'next/link';
import { PageContainer } from '@rashx/ui';
import {
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  Receipt,
  Users,
  CheckCircle2,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface FeaturesHeroProps {
  lang: Lang;
  className?: string;
}

export function FeaturesHero({ lang, className }: FeaturesHeroProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const content = isAr
    ? {
        eyebrow: 'المميزات والقدرات التشغيلية للمنصة',
        title: 'كل الأدوات التي تحتاجها لإدارة منشأتك.',
        description:
          'اكتشف مجموعة من الأدوات المترابطة التي تساعدك على تنظيم عمليات الصالون وإدارة فريقك وعملائك ومتابعة أعمالك اليومية من مكان واحد.',
        primaryCta: 'استكشف المميزات بالتفصيل',
        secondaryCta: 'طلب عرض تجريبي',
        pills: [
          'تنظيم مواعيد لحظي بدون تعارض',
          'نقاط بيع وفوترة ضريبية مبسطة',
          'ملفات عملاء متكاملة وتاريخ المعاملات',
          'احتساب آلي لعمولات الأخصائيات',
        ],
        kpis: [
          {
            label: 'إدارة المواعيد',
            val: 'جدول حي فوري',
            sub: 'منع التعارض تلقائيًا',
            icon: CalendarCheck,
          },
          {
            label: 'نقاط البيع والفوترة',
            val: 'كاشير سحابي سريع',
            sub: 'فواتير ضريبية برمز QR',
            icon: Receipt,
          },
          {
            label: 'إدارة الفريق',
            val: 'عمولات وصلاحيات',
            sub: 'حسابات دقيقة بدون إكسل',
            icon: Users,
          },
        ],
      }
    : {
        eyebrow: 'Platform Features & Operational Capabilities',
        title: 'Everything You Need to Manage Your Business.',
        description:
          'Explore connected tools that help you organize salon operations, manage your team and customers, and oversee daily business activities in one place.',
        primaryCta: 'Explore All Features',
        secondaryCta: 'Request a Demo',
        pills: [
          'Real-time conflict-free scheduling',
          'Cloud POS & simplified tax invoicing',
          'Complete client CRM & history',
          'Automated staff commission engine',
        ],
        kpis: [
          {
            label: 'Scheduling',
            val: 'Live Calendar',
            sub: 'Automatic conflict prevention',
            icon: CalendarCheck,
          },
          {
            label: 'Point of Sale',
            val: 'Cloud Checkout',
            sub: 'Instant QR tax invoices',
            icon: Receipt,
          },
          {
            label: 'Team Management',
            val: 'Staff & Commissions',
            sub: 'Zero manual calculation errors',
            icon: Users,
          },
        ],
      };

  return (
    <section
      id="features-hero"
      className={`relative overflow-hidden bg-gradient-to-b from-[#FAF9F8] to-[#FFFFFF] pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="mb-4 inline-flex items-center justify-center">
            <span className="rounded-full bg-[#FAF9F8] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#C78360]">
              {content.eyebrow}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#54453D] leading-[1.18] text-balance">
            {content.title}
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-3xl text-base sm:text-lg md:text-xl leading-relaxed text-[#75645B]">
            {content.description}
          </p>

          {/* Feature highlights checklist */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-[#54453D]">
            {content.pills.map((pill) => (
              <div key={pill} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                <span>{pill}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex w-full flex-col sm:w-auto sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="#categories"
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#F0C5AE] px-7 py-3.5 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
            >
              <span>{content.primaryCta}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>

            <a
              href="mailto:hello@rashx.com"
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-xl bg-[#91B8C0] px-7 py-3.5 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#6E9BA4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
            >
              <span>{content.secondaryCta}</span>
            </a>
          </div>

          {/* Hero KPI Cards Bar */}
          <div className="mt-10 sm:mt-14 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-start">
              {content.kpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div
                    key={kpi.label}
                    className="flex items-center gap-4 rounded-2xl bg-[#FAF9F8] p-5 sm:p-6 transition-colors duration-200"
                  >
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#54453D]">
                      <Icon className="h-6 w-6 text-[#C78360]" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#75645B] block">
                        {kpi.label}
                      </span>
                      <p className="text-base sm:text-lg font-bold text-[#54453D]">
                        {kpi.val}
                      </p>
                      <span className="text-xs text-[#75645B]">
                        {kpi.sub}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

