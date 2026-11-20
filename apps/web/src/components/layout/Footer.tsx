import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import {
  RashxLockupBilingual,
  Twitter,
  Linkedin,
  Instagram,
  ExternalLink,
  Phone,
  Send,
} from '@rashx/icons';
import { routes } from '@/lib/routes';
import type { Lang } from '@/lib/lang';
import { Reveal } from './Reveal';

export interface FooterProps {
  lang: Lang;
  className?: string;
}

interface FooterItem {
  label: string;
  href: string;
}

/** قلب SVG بنبض خفيف (الأنيميشن في rashx-motion.css → .rx-heart) */
function HeartSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );
}

function FooterColumn({
  title,
  items,
  index,
  className,
}: {
  title: string;
  items: FooterItem[];
  index: number;
  className?: string;
}) {
  return (
    <Reveal variant="up" delay={index * 90} className={className}>
      {/* ── موبايل/تابلت: accordion (بدون JS) ─────────────────── */}
      <details className="group/acc rounded-2xl bg-[#54453D]/[0.04] lg:hidden">
        <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 text-sm font-bold text-[#54453D] transition-colors duration-200 active:bg-[#54453D]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#E4A889]" />
            {title}
          </span>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#F0C5AE]/45">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M5 12h14" />
              <path
                d="M12 5v14"
                className="origin-center transition-transform duration-300 [transform-box:fill-box] group-open/acc:scale-y-0"
              />
            </svg>
          </span>
        </summary>
        <ul className="flex flex-col px-4 pb-3 group-open/acc:animate-[rx-fade-down_300ms_ease-out]">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href as Route}
                className="flex min-h-[44px] items-center text-sm text-[#54453D]/80 transition-colors duration-200 active:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </details>

      {/* ── ديسكتوب: عمود مفتوح ──────────────────────────────── */}
      <div className="hidden flex-col gap-5 lg:flex">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#54453D]">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#E4A889]" />
          {title}
        </h3>
        <ul className="flex flex-col gap-2.5 text-xs">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href as Route}
                className="group/fl relative inline-block text-[#54453D]/70 transition-all duration-300 hover:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] ltr:hover:translate-x-1 rtl:hover:-translate-x-1"
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-0.5 h-px origin-[var(--rx-origin,left)] scale-x-0 bg-[#E4A889] transition-transform duration-300 group-hover/fl:scale-x-100 rtl:[--rx-origin:right]"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export function Footer({ lang, className }: FooterProps) {
  const isAr = lang === 'ar';

  const homeHref = (isAr ? '/' : '/?lang=en') as Route;

  const socialLinks = [
    { name: isAr ? 'منصة إكس (تويتر)' : 'X (Twitter)', href: routes.external.twitter, icon: Twitter },
    { name: isAr ? 'لينكدإن' : 'LinkedIn', href: routes.external.linkedin, icon: Linkedin },
    { name: isAr ? 'إنستغرام' : 'Instagram', href: routes.external.instagram, icon: Instagram },
    { name: isAr ? 'تيليجرام' : 'Telegram', href: routes.external.telegram, icon: Send },
  ];

  const solutionsLinks: FooterItem[] = isAr
    ? [
        { label: 'لوحة التحكم الإدارية', href: '/solutions/management' },
        { label: 'الموارد البشرية والكوادر (HR)', href: '/solutions/hr' },
        { label: 'إدارة علاقات العملاء (CRM)', href: '/solutions/crm' },
        { label: 'الحجوزات والمواعيد الذكية', href: '/solutions/booking' },
        { label: 'المبيعات ونقاط البيع (POS)', href: '/solutions/pos' },
        { label: 'إدارة المخزون والمشتريات', href: '/solutions/inventory' },
        { label: 'نظام الولاء والمكافآت', href: '/solutions/loyalty' },
        { label: 'التقارير والتحليلات (KPIs)', href: '/solutions/analytics' },
        { label: 'إدارة السلاسل والفروع', href: '/solutions/branches' },
        { label: 'الفوترة الإلكترونية (ZATCA)', href: '/compliance/e-invoicing' },
      ]
    : [
        { label: 'Central Command Hub', href: '/solutions/management?lang=en' },
        { label: 'Workforce & HR Ops', href: '/solutions/hr?lang=en' },
        { label: 'Customer Relations (CRM)', href: '/solutions/crm?lang=en' },
        { label: 'Smart Appointment Matrix', href: '/solutions/booking?lang=en' },
        { label: 'Cloud POS & Invoicing', href: '/solutions/pos?lang=en' },
        { label: 'Inventory & Purchasing', href: '/solutions/inventory?lang=en' },
        { label: 'Loyalty & Rewards', href: '/solutions/loyalty?lang=en' },
        { label: 'Analytics & BI Telemetry', href: '/solutions/analytics?lang=en' },
        { label: 'Multi-Branch Engine', href: '/solutions/branches?lang=en' },
        { label: 'ZATCA E-Invoicing Phase 2', href: '/compliance/e-invoicing?lang=en' },
      ];

  const industriesLinks: FooterItem[] = isAr
    ? [
        { label: 'الصالونات النسائية', href: '/industries/beauty-salons' },
        { label: 'صالونات الحلاقة الرجالية', href: '/industries/barbershops' },
        { label: 'مراكز التجميل الشاملة', href: '/industries/beauty-centers' },
        { label: 'مراكز السبا والاسترخاء', href: '/industries/spa' },
        { label: 'المنشآت المستقلة والمتوسطة', href: '/industries/personal-care' },
        { label: 'السلاسل متعددة الفروع', href: '/industries/multi-branch' },
        { label: 'المواقع الإلكترونية المستقلة', href: '/websites' },
        { label: 'تجربة العميل والتطبيقات', href: '/customer-experience' },
        { label: 'واجهة مقدم الخدمة', href: '/provider-experience' },
        { label: 'الهوية والتخصيص White Label', href: '/white-label' },
      ]
    : [
        { label: 'Women’s Beauty Salons', href: '/industries/beauty-salons?lang=en' },
        { label: 'Men’s Barbershops', href: '/industries/barbershops?lang=en' },
        { label: 'Comprehensive Beauty Centers', href: '/industries/beauty-centers?lang=en' },
        { label: 'Spas & Wellness Sanctuaries', href: '/industries/spa?lang=en' },
        { label: 'Independent Venues', href: '/industries/personal-care?lang=en' },
        { label: 'Multi-Branch Enterprises', href: '/industries/multi-branch?lang=en' },
        { label: 'Independent Facility Websites', href: '/websites?lang=en' },
        { label: 'Client Apps & Experience', href: '/customer-experience?lang=en' },
        { label: 'Service Provider Workspace', href: '/provider-experience?lang=en' },
        { label: 'White Label & Custom Branding', href: '/white-label?lang=en' },
      ];

  const companyLinks: FooterItem[] = isAr
    ? [
        { label: 'عن راش إكس', href: '/about' },
        { label: 'المؤسس: م. محمد عبده رشاد البهي', href: '/founder' },
        { label: 'رسالة المؤسس الرسمية', href: '/founder/message' },
        { label: 'الرؤية والرسالة الاستراتيجية', href: '/vision' },
        { label: 'قيمنا وأهدافنا التأسيسية', href: '/values' },
        { label: 'قصة التأسيس والانطلاق', href: '/story' },
        { label: 'محطات النمو والإنجازات', href: '/milestones' },
        { label: 'فريق العمل والقيادة', href: '/team' },
        { label: 'الركائز الهندسية للمنظومة', href: '/#pillars' },
        { label: 'دليل ومواصفات الهوية', href: '/brand' },
      ]
    : [
        { label: 'About RASHX', href: '/about?lang=en' },
        { label: 'Founder: Eng. Mohamed Abdo Rashad El-Bahy', href: '/founder?lang=en' },
        { label: 'Founder’s Official Letter', href: '/founder/message?lang=en' },
        { label: 'Vision & Mission', href: '/vision?lang=en' },
        { label: 'Core Values & Goals', href: '/values?lang=en' },
        { label: 'Founding Story', href: '/story?lang=en' },
        { label: 'Company Milestones', href: '/milestones?lang=en' },
        { label: 'Engineering Team', href: '/team?lang=en' },
        { label: 'Engineering Pillars', href: '/?lang=en#pillars' },
        { label: 'Brand Identity Showcase', href: '/brand?lang=en' },
      ];

  const legalAndTrustLinks: FooterItem[] = isAr
    ? [
        { label: 'باقات الأسعار والاشتراكات', href: '/pricing' },
        { label: 'طلب عرض توضيحي (Demo)', href: '/demo' },
        { label: 'تواصل معنا والمبيعات', href: '/contact' },
        { label: 'برنامج الشركاء والموزعين', href: '/partners' },
        { label: 'أمان البيانات وعزل المنشآت', href: '/security' },
        { label: 'شروط الاستخدام والخدمة', href: '/terms' },
        { label: 'سياسة الخصوصية وحماية البيانات', href: '/privacy' },
        { label: 'اتفاقية معالجة البيانات (DPA)', href: '/data-processing' },
        { label: 'شروط باقات الاشتراكات', href: '/subscription-terms' },
        { label: 'اتفاقية مستوى الخدمة (SLA)', href: '/sla' },
        { label: 'سياسة الاسترداد وإلغاء الاشتراك', href: '/refund-policy' },
        { label: 'سياسة الاستخدام المقبول', href: '/acceptable-use' },
        { label: 'حالة النظام والتوفر السحابي 99.9%', href: '/status' },
      ]
    : [
        { label: 'Pricing & Plans', href: '/pricing?lang=en' },
        { label: 'Request a Live Demo', href: '/demo?lang=en' },
        { label: 'Contact Sales & Support', href: '/contact?lang=en' },
        { label: 'Partners Program', href: '/partners?lang=en' },
        { label: 'Data Security & Isolation', href: '/security?lang=en' },
        { label: 'Terms of Service', href: '/terms?lang=en' },
        { label: 'Privacy & PDPL Compliance', href: '/privacy?lang=en' },
        { label: 'Data Processing Agreement', href: '/data-processing?lang=en' },
        { label: 'Subscription Conditions', href: '/subscription-terms?lang=en' },
        { label: 'Service Level Agreement (SLA)', href: '/sla?lang=en' },
        { label: 'Refund & Billing Policy', href: '/refund-policy?lang=en' },
        { label: 'Acceptable Use Policy', href: '/acceptable-use?lang=en' },
        { label: 'Cloud Status & Telemetry', href: '/status?lang=en' },
      ];

  return (
    <footer
      className={`bg-[#FAF9F8] text-[#54453D] ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full" className="pb-8 pt-12 md:pt-20">
        {/* ── Main grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <Reveal variant="up" className="mb-6 flex flex-col gap-6 lg:col-span-4 lg:mb-0">
            <Link
              href={homeHref}
              className="inline-flex w-fit items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] focus-visible:ring-offset-2"
              aria-label={isAr ? 'راش إكس - الصفحة الرئيسية' : 'RASHX - Home'}
            >
              <RashxLockupBilingual height={36} color="ink" />
              <span className="sr-only">
                {isAr ? 'راش إكس لتقنية المعلومات' : 'RASHX Information Technology'}
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-[#54453D]/75">
              {isAr
                ? 'راش إكس منظومة رقمية متكاملة تساعد صالونات التجميل والحلاقة والسبا على إدارة أعمالها وتطوير تجربة عملائها.'
                : 'RASHX is a complete digital operating system helping beauty salons, barbershops, and spas manage their operations and elevate customer experiences.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#54453D]/70">
              <span className="whitespace-nowrap rounded-full bg-[#F0C5AE]/35 px-3 py-1.5">
                {isAr ? 'المملكة العربية السعودية · الرياض' : 'Kingdom of Saudi Arabia · Riyadh'}
              </span>
              <span className="whitespace-nowrap rounded-full bg-[#F0C5AE]/35 px-3 py-1.5">
                {isAr ? 'التأسيس: 2026' : 'Founded: 2026'}
              </span>
            </div>

            {/* Phone */}
            <a
              href="tel:+966548082945"
              className="group/phone inline-flex w-fit items-center gap-2.5 text-xs font-medium text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#54453D] text-white transition-transform duration-300 group-hover/phone:-rotate-12 group-hover/phone:scale-110">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span dir="ltr">+966 54 808 2945</span>
            </a>

            {/* Social */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-11 w-11 place-items-center rounded-full bg-[#F0C5AE]/35 sm:h-10 sm:w-10 text-[#54453D] transition-all duration-300 hover:-translate-y-1 hover:bg-[#54453D] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] focus-visible:ring-offset-2"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>

            {/* Portal */}
            <a
              href={routes.external.app}
              target="_blank"
              rel="noopener noreferrer"
              className="group/portal flex w-full items-center justify-between gap-2 rounded-full bg-[#54453D] py-1.5 ps-5 pe-1.5 text-sm font-semibold sm:inline-flex sm:w-fit sm:justify-start sm:py-1 sm:ps-4 sm:pe-1 sm:text-xs text-white transition-all duration-300 hover:bg-[#3F332D] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
            >
              <span className="whitespace-nowrap">
                {isAr ? 'بوابة المنظومة السحابية' : 'Cloud Platform Portal'}
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F0C5AE] text-[#54453D] transition-transform duration-500 group-hover/portal:rotate-45">
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </span>
            </a>
          </Reveal>

          <FooterColumn
            index={1}
            className="lg:col-span-2"
            title={isAr ? 'الأنظمة والحلول' : 'Solutions & Systems'}
            items={solutionsLinks}
          />
          <FooterColumn
            index={2}
            className="lg:col-span-2"
            title={isAr ? 'القطاعات والتخصيص' : 'Sectors & Experience'}
            items={industriesLinks}
          />
          <FooterColumn
            index={3}
            className="lg:col-span-2"
            title={isAr ? 'الشركة والمؤسس' : 'Company & Leadership'}
            items={companyLinks}
          />
          <FooterColumn
            index={4}
            className="lg:col-span-2"
            title={isAr ? 'الثقة والأساس القانوني' : 'Trust & Legal'}
            items={legalAndTrustLinks}
          />
        </div>

        {/* ── Legal bar (tonal, no borders) ─────────────────────── */}
        <Reveal
          variant="fade"
          delay={150}
          rootMargin="0px"
          className="mt-8 rounded-3xl bg-[#54453D]/[0.05] p-5 md:mt-14 md:p-6"
        >
          <div className="flex flex-col items-center justify-between gap-3 text-center text-xs leading-relaxed text-[#54453D]/70 md:flex-row md:text-start">
            <p className="font-medium text-[#54453D]">
              {isAr
                ? 'المؤسس: م. محمد عبده رشاد البهي · جميع الحقوق محفوظة © 2026 راش إكس لتقنية المعلومات'
                : 'Founder: Eng. Mohamed Abdo Rashad El-Bahy · All rights reserved © 2026 RASHX Information Technology'}
            </p>
            <p>
              {isAr
                ? 'نظام التشغيل الرقمي المعتمد لصالونات التجميل ومراكز العناية'
                : 'The verified digital operating system for beauty salons and wellness centers'}
            </p>
          </div>
        </Reveal>

        {/* ── Made with ♥ in Riyadh ─────────────────────────────── */}
        <Reveal
          variant="up"
          delay={250}
          threshold={0.1}
          rootMargin="0px"
          className="mt-10 flex w-full justify-center pb-4"
        >
          <p
            className="inline-flex items-center justify-center gap-2.5 text-center text-base font-semibold text-[#54453D]"
            aria-label={isAr ? 'صُنع بحب في الرياض' : 'Made with love in Riyadh'}
          >
            <span aria-hidden="true">{isAr ? 'صُنع بـ' : 'Made with'}</span>
            <HeartSvg className="rx-heart h-5 w-5 text-[#D9534F]" />
            <span aria-hidden="true">{isAr ? 'في الريــــــــاض' : 'in Riyadh'}</span>
          </p>
        </Reveal>
      </PageContainer>
    </footer>
  );
}