import Link from 'next/link';
import { PageContainer } from '@rashx/ui';
import {
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Globe,
  Smartphone,
  CheckCircle2,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface PlatformHeroProps {
  lang: Lang;
  className?: string;
}

export function PlatformHero({ lang, className }: PlatformHeroProps) {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const content = isAr
    ? {
        eyebrow: 'المنظومة التقنية المتخصصة لقطاع الجمال',
        title: 'منظومة رقمية متكاملة لقطاع الجمال.',
        description:
          'راش إكس (RASHX) هي منصة تقنية متخصصة في إدارة وتشغيل الصالونات ومراكز التجميل والسبا في المملكة العربية السعودية، تقدم منظومة برمجية موحدة تجمع بين الإدارة والتشغيل والمبيعات وتجربة العملاء في مكان واحد.',
        primaryCta: 'طلب عرض تجريبي',
        secondaryCta: 'استكشف مكونات المنظومة',
        highlights: [
          'مركز تحكم إداري وتشغيلي شامل',
          'واجهة وتطبيق مستقل بهوية منشأتك',
          'متوافق مع معايير الفوترة السعودية',
        ],
        badge: 'تأسست في المملكة العربية السعودية · 2026',
        ecosystemPillars: [
          {
            icon: LayoutDashboard,
            name: 'لوحة التحكم الإدارية',
            desc: 'إدارة العمليات والموظفين والمواعيد والمخزون',
            tone: 'bg-[#F0C5AE] text-[#54453D]',
          },
          {
            icon: Globe,
            name: 'الموقع الإلكتروني للمنشأة',
            desc: 'واجهة تعريفية وحجز مباشر بهوية الصالون',
            tone: 'bg-[#91B8C0]/25 text-[#2C4349]',
          },
          {
            icon: Smartphone,
            name: 'تطبيق العملاء ومقدمي الخدمة',
            desc: 'تجربة حجز سلسة وجداول عمل لحظية للموظفين',
            tone: 'bg-white text-[#54453D]',
          },
        ],
      }
    : {
        eyebrow: 'Specialized Digital Operating System for Beauty & Wellness',
        title: 'A Complete Digital Ecosystem for the Beauty Industry.',
        description:
          'RASHX is a unified SaaS platform engineered specifically for beauty salons, wellness centers, and spas in Saudi Arabia, bringing enterprise management, daily operations, point of sale, and customer experience together under one roof.',
        primaryCta: 'Request a Demo',
        secondaryCta: 'Explore the Ecosystem',
        highlights: [
          'Unified operations & staff control center',
          'Custom brand identity & dedicated domain',
          'Full Saudi e-invoicing compliance',
        ],
        badge: 'Founded in Saudi Arabia · 2026',
        ecosystemPillars: [
          {
            icon: LayoutDashboard,
            name: 'Admin Dashboard',
            desc: 'Central control for appointments, staff, inventory & sales',
            tone: 'bg-[#F0C5AE] text-[#54453D]',
          },
          {
            icon: Globe,
            name: 'Custom Salon Website',
            desc: 'Public showcase & direct booking with your brand',
            tone: 'bg-[#91B8C0]/25 text-[#2C4349]',
          },
          {
            icon: Smartphone,
            name: 'Client & Provider Apps',
            desc: 'Effortless client booking & live specialist schedules',
            tone: 'bg-white text-[#54453D]',
          },
        ],
      };

  return (
    <section
      id="platform-intro"
      className={`relative overflow-hidden bg-gradient-to-b from-[#FAF9F8] to-[#FFFFFF] pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Eyebrow & Corporate Foundation Badge */}
          <div className="mb-4 inline-flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-[#FAF9F8] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#C78360]">
              {content.eyebrow}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#75645B]">
              {content.badge}
            </span>
          </div>

          {/* Primary Section 1 Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#54453D] leading-[1.18] text-balance">
            {content.title}
          </h1>

          {/* Value Proposition Description */}
          <p className="mt-5 max-w-3xl text-base sm:text-lg md:text-xl leading-relaxed text-[#75645B]">
            {content.description}
          </p>

          {/* Key Value Highlights */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-[#54453D]">
            {content.highlights.map((item) => (
              <div key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex w-full flex-col sm:w-auto sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="mailto:hello@rashx.com"
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#F0C5AE] px-7 py-3.5 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
            >
              <span>{content.primaryCta}</span>
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </a>

            <Link
              href="#ecosystem"
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-xl bg-[#91B8C0] px-7 py-3.5 text-sm sm:text-base font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#6E9BA4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
            >
              <span>{content.secondaryCta}</span>
            </Link>
          </div>

          {/* Visual Architecture Showcase: 3 Connected Pillars */}
          <div className="mt-10 sm:mt-14 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-start">
              {content.ecosystemPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.name}
                    className="flex flex-col justify-between rounded-2xl bg-[#FAF9F8] p-6 sm:p-7 transition-colors duration-200"
                  >
                    <div>
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${pillar.tone}`}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h2 className="mt-4 text-lg sm:text-xl font-bold text-[#54453D]">
                        {pillar.name}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                        {pillar.desc}
                      </p>
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
