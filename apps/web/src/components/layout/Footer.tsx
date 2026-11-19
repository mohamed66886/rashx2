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

export interface FooterProps {
  lang: Lang;
  className?: string;
}

export function Footer({ lang, className }: FooterProps) {
  const isAr = lang === 'ar';

  const homeHref = (isAr ? '/' : '/?lang=en') as Route;

  const socialLinks = [
    {
      name: isAr ? 'منصة إكس (تويتر)' : 'X (Twitter)',
      href: routes.external.twitter,
      icon: Twitter,
    },
    {
      name: isAr ? 'لينكدإن' : 'LinkedIn',
      href: routes.external.linkedin,
      icon: Linkedin,
    },
    {
      name: isAr ? 'إنستغرام' : 'Instagram',
      href: routes.external.instagram,
      icon: Instagram,
    },
    {
      name: isAr ? 'تيليجرام' : 'Telegram',
      href: routes.external.telegram,
      icon: Send,
    },
  ];

  const solutionsLinks = isAr
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

  const industriesLinks = isAr
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

  const companyLinks = isAr
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

  const legalAndTrustLinks = isAr
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
      className={`bg-[#54453D] text-white transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full" className="py-16 md:py-20">
        {/* ── Main Footer Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Description (Span 4 on desktop) */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <Link
              href={homeHref}
              className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#54453D]"
              aria-label={isAr ? 'راش إكس - الصفحة الرئيسية' : 'RASHX - Home'}
            >
              <RashxLockupBilingual height={36} color="white" />
              <span className="sr-only">
                {isAr ? 'راش إكس لتقنية المعلومات' : 'RASHX Information Technology'}
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-white/75">
              {isAr
                ? 'راش إكس منظومة رقمية متكاملة تساعد صالونات التجميل والحلاقة والسبا على إدارة أعمالها وتطوير تجربة عملائها.'
                : 'RASHX is a complete digital operating system helping beauty salons, barbershops, and spas manage their operations and elevate customer experiences.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
              <span className="rounded-md bg-white/10 px-2.5 py-1">
                {isAr ? 'المملكة العربية السعودية · الرياض' : 'Kingdom of Saudi Arabia · Riyadh'}
              </span>
              <span className="rounded-md bg-white/10 px-2.5 py-1">
                {isAr ? 'التأسيس: 2026' : 'Founded: 2026'}
              </span>
            </div>

            {/* Direct Telephone Contact */}
            <div className="flex items-center gap-2 text-xs text-white/80">
              <Phone className="h-3.5 w-3.5 text-[#F0C5AE]" aria-hidden="true" />
              <a
                href="tel:+966548082945"
                className="hover:text-white transition-colors duration-200"
                dir="ltr"
              >
                +966 54 808 2945
              </a>
            </div>

            {/* Official Social Links */}
            <div className="mt-1 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#54453D]"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>

            {/* External App Cloud Portal */}
            <div className="mt-2">
              <a
                href={routes.external.app}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#F0C5AE] hover:underline"
              >
                <span>{isAr ? 'بوابة المنظومة السحابية' : 'Cloud Platform Portal'}</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Group 1: Platform & Solutions (Span 2 on desktop) */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0C5AE]">
              {isAr ? 'الأنظمة والحلول' : 'Solutions & Systems'}
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              {solutionsLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href as Route}
                    className="inline-block text-white/75 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Group 2: Specialized Industries & Ecosystem (Span 2 on desktop) */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0C5AE]">
              {isAr ? 'القطاعات والتخصيص' : 'Sectors & Experience'}
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              {industriesLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href as Route}
                    className="inline-block text-white/75 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Group 3: Company & Leadership (Span 2 on desktop) */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0C5AE]">
              {isAr ? 'الشركة والمؤسس' : 'Company & Leadership'}
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href as Route}
                    className="inline-block text-white/75 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Group 4: Legal & Trust (Span 2 on desktop) */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0C5AE]">
              {isAr ? 'الثقة والأساس القانوني' : 'Trust & Legal'}
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              {legalAndTrustLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href as Route}
                    className="inline-block text-white/75 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Legal & Attribution Bar (Tonal Differentiation, Zero Borders) ─ */}
        <div className="mt-14 rounded-2xl bg-white/5 p-6 transition-colors duration-200">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-white/70 md:flex-row">
            <p className="font-medium text-white/90">
              {isAr
                ? 'المؤسس: م. محمد عبده رشاد البهي · جميع الحقوق محفوظة © 2026 راش إكس لتقنية المعلومات'
                : 'Founder: Eng. Mohamed Abdo Rashad El-Bahy · All rights reserved © 2026 RASHX Information Technology'}
            </p>

            <p className="text-white/60">
              {isAr
                ? 'نظام التشغيل الرقمي المعتمد لصالونات التجميل ومراكز العناية'
                : 'The verified digital operating system for beauty salons and wellness centers'}
            </p>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
