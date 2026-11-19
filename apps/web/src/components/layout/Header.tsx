import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { RashxLockupBilingual, ChevronDown } from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileNavigation, type MobileNavLink } from './MobileNavigation';

export interface HeaderProps {
  lang: Lang;
  className?: string;
}

export function Header({ lang, className }: HeaderProps) {
  const isAr = lang === 'ar';

  const homeHref = isAr ? '/' : '/?lang=en';
  const brandHref = isAr ? '/brand' : '/brand?lang=en';
  const pillarsHref = isAr ? '/#pillars' : '/?lang=en#pillars';
  const platformHref = isAr ? '/platform' : '/platform?lang=en';
  const solutionsHref = isAr ? '/solutions' : '/solutions?lang=en';
  const industriesHref = isAr ? '/industries' : '/industries?lang=en';
  const pricingHref = isAr ? '/pricing' : '/pricing?lang=en';
  const aboutHref = isAr ? '/about' : '/about?lang=en';
  const contactHref = isAr ? '/contact' : '/contact?lang=en';
  const demoHref = isAr ? '/demo' : '/demo?lang=en';

  const solutionDropdownItems = isAr
    ? [
        { label: 'لوحة التحكم الإدارية', href: '/solutions/management', desc: 'إدارة العمليات والمنشأة' },
        { label: 'إدارة الموارد البشرية (HR)', href: '/solutions/hr', desc: 'الكوادر والورديات والعمولات' },
        { label: 'إدارة العملاء (CRM)', href: '/solutions/crm', desc: 'سجل الزيارات والبيانات' },
        { label: 'الحجوزات والمواعيد', href: '/solutions/booking', desc: 'تنظيم المواعيد وتجنب التعارض' },
        { label: 'المبيعات ونقاط البيع (POS)', href: '/solutions/pos', desc: 'فواتير ضريبية و ZATCA مبسطة' },
        { label: 'المخزون والمشتريات', href: '/solutions/inventory', desc: 'متابعة استهلاك المواد' },
        { label: 'الولاء والمكافآت', href: '/solutions/loyalty', desc: 'نقاط وعروض مخصصة' },
        { label: 'التقارير والتحليلات', href: '/solutions/analytics', desc: 'مؤشرات الأداء ورؤية الإيرادات' },
      ]
    : [
        { label: 'Executive Admin Dashboard', href: '/solutions/management?lang=en', desc: 'Central operations control' },
        { label: 'HR & Workforce Management', href: '/solutions/hr?lang=en', desc: 'Staff rosters & commissions' },
        { label: 'Customer Relations (CRM)', href: '/solutions/crm?lang=en', desc: 'Profiles & visit history' },
        { label: 'Smart Appointment Matrix', href: '/solutions/booking?lang=en', desc: 'Collision-free scheduling' },
        { label: 'Cloud POS & Invoicing', href: '/solutions/pos?lang=en', desc: 'Simplified ZATCA billing' },
        { label: 'Inventory & Purchasing', href: '/solutions/inventory?lang=en', desc: 'Consumables & stock levels' },
        { label: 'Loyalty & Rewards Program', href: '/solutions/loyalty?lang=en', desc: 'Automated points & perks' },
        { label: 'Analytics & BI Reports', href: '/solutions/analytics?lang=en', desc: 'Financial & operational KPIs' },
      ];

  const industryDropdownItems = isAr
    ? [
        { label: 'الصالونات النسائية', href: '/industries/beauty-salons' },
        { label: 'صالونات الحلاقة الرجالية', href: '/industries/barbershops' },
        { label: 'مراكز التجميل الشاملة', href: '/industries/beauty-centers' },
        { label: 'مراكز السبا والاسترخاء', href: '/industries/spa' },
        { label: 'المنشآت المستقلة والمتوسطة', href: '/industries/personal-care' },
        { label: 'السلاسل متعددة الفروع', href: '/industries/multi-branch' },
      ]
    : [
        { label: 'Women’s Beauty Salons', href: '/industries/beauty-salons?lang=en' },
        { label: 'Men’s Barbershops', href: '/industries/barbershops?lang=en' },
        { label: 'Comprehensive Beauty Centers', href: '/industries/beauty-centers?lang=en' },
        { label: 'Spas & Wellness Sanctuaries', href: '/industries/spa?lang=en' },
        { label: 'Independent Venues', href: '/industries/personal-care?lang=en' },
        { label: 'Multi-Branch Enterprises', href: '/industries/multi-branch?lang=en' },
      ];

  const navLinks: MobileNavLink[] = [
    {
      label: isAr ? 'الرئيسية' : 'Home',
      href: homeHref,
    },
    {
      label: isAr ? 'المنظومة' : 'Platform',
      href: platformHref,
    },
    {
      label: isAr ? 'الحلول' : 'Solutions',
      href: solutionsHref,
    },
    {
      label: isAr ? 'القطاعات' : 'Industries',
      href: industriesHref,
    },
    {
      label: isAr ? 'الأسعار' : 'Pricing',
      href: pricingHref,
    },
    {
      label: isAr ? 'عن راش إكس' : 'About',
      href: aboutHref,
    },
    {
      label: isAr ? 'تواصل معنا' : 'Contact',
      href: contactHref,
    },
    {
      label: isAr ? 'دليل الهوية' : 'Brand Showcase',
      href: brandHref,
    },
    {
      label: isAr ? 'الركائز الهندسية' : 'Engineering Pillars',
      href: pillarsHref,
    },
  ];

  const cta = {
    label: isAr ? 'اكتشف RASHX' : 'Discover RASHX',
    href: brandHref,
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full" className="flex items-center justify-between py-3.5">
        {/* ── Brand Logo ────────────────────────────────────────────── */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href={homeHref as Route}
            className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] focus-visible:ring-offset-2"
            aria-label={isAr ? 'راش إكس - الصفحة الرئيسية' : 'RASHX - Home'}
          >
            <RashxLockupBilingual height={34} color="ink" />
            <span className="sr-only">
              {isAr ? 'راش إكس لتقنية المعلومات' : 'RASHX Information Technology'}
            </span>
          </Link>

          {/* ── Desktop Main Navigation ─────────────────────────────── */}
          <nav
            className="hidden md:flex items-center gap-0.5 lg:gap-1"
            aria-label={isAr ? 'الملاحة الرئيسية' : 'Main navigation'}
          >
            {/* Home */}
            <Link
              href={homeHref as Route}
              className="rounded-lg px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-[#54453D]/80 transition-colors duration-200 hover:bg-[#FAF9F8] hover:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>

            {/* Platform */}
            <Link
              href={platformHref as Route}
              className="rounded-lg px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-[#54453D]/80 transition-colors duration-200 hover:bg-[#FAF9F8] hover:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
            >
              {isAr ? 'المنظومة' : 'Platform'}
            </Link>

            {/* Solutions Dropdown */}
            <div className="relative group">
              <Link
                href={solutionsHref as Route}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-[#54453D]/80 transition-colors duration-200 hover:bg-[#FAF9F8] hover:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
              >
                <span>{isAr ? 'الحلول' : 'Solutions'}</span>
                <ChevronDown className="h-3 w-3 text-[#54453D]/50 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
              </Link>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute top-full start-0 z-50 w-72 pt-2 pointer-events-none group-hover:pointer-events-auto">
                <div className="rounded-2xl bg-[#FAF9F8] p-3">
                  <div className="text-[11px] font-bold text-[#54453D]/60 px-3 py-1 uppercase tracking-wider">
                    {isAr ? 'الأنظمة التشغيلية' : 'Operating Modules'}
                  </div>
                  {solutionDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href as Route}
                      className="flex flex-col rounded-xl px-3 py-1.5 text-xs transition-colors duration-200 hover:bg-white text-[#54453D]"
                    >
                      <span className="font-bold">{item.label}</span>
                      <span className="text-[10px] text-[#54453D]/60">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Industries Dropdown */}
            <div className="relative group">
              <Link
                href={industriesHref as Route}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-[#54453D]/80 transition-colors duration-200 hover:bg-[#FAF9F8] hover:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
              >
                <span>{isAr ? 'القطاعات' : 'Industries'}</span>
                <ChevronDown className="h-3 w-3 text-[#54453D]/50 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
              </Link>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute top-full start-0 z-50 w-64 pt-2 pointer-events-none group-hover:pointer-events-auto">
                <div className="rounded-2xl bg-[#FAF9F8] p-3">
                  <div className="text-[11px] font-bold text-[#54453D]/60 px-3 py-1 uppercase tracking-wider">
                    {isAr ? 'الأنشطة المعتمدة' : 'Specialized Sectors'}
                  </div>
                  {industryDropdownItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href as Route}
                      className="flex items-center rounded-xl px-3 py-2 text-xs font-semibold text-[#54453D] transition-colors duration-200 hover:bg-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <Link
              href={pricingHref as Route}
              className="rounded-lg px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-[#54453D]/80 transition-colors duration-200 hover:bg-[#FAF9F8] hover:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
            >
              {isAr ? 'الأسعار' : 'Pricing'}
            </Link>

            {/* About */}
            <Link
              href={aboutHref as Route}
              className="rounded-lg px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-[#54453D]/80 transition-colors duration-200 hover:bg-[#FAF9F8] hover:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
            >
              {isAr ? 'عن راش إكس' : 'About'}
            </Link>

            {/* Contact */}
            <Link
              href={contactHref as Route}
              className="rounded-lg px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-[#54453D]/80 transition-colors duration-200 hover:bg-[#FAF9F8] hover:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
            >
              {isAr ? 'تواصل معنا' : 'Contact'}
            </Link>

            {/* Brand Showcase */}
            <Link
              href={brandHref as Route}
              className="rounded-lg px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-[#54453D]/80 transition-colors duration-200 hover:bg-[#FAF9F8] hover:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
            >
              {isAr ? 'دليل الهوية' : 'Brand Showcase'}
            </Link>

            {/* Engineering Pillars */}
            <Link
              href={pillarsHref as Route}
              className="rounded-lg px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-[#54453D]/80 transition-colors duration-200 hover:bg-[#FAF9F8] hover:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
            >
              {isAr ? 'الركائز الهندسية' : 'Engineering Pillars'}
            </Link>
          </nav>
        </div>

        {/* ── Desktop Right Actions (Language + Demo + CTA) ─────────── */}
        <div className="hidden md:flex items-center gap-2.5">
          <LanguageSwitcher currentLang={lang} />

          <Link
            href={demoHref as Route}
            className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-[#54453D] hover:bg-[#FAF9F8] transition-colors duration-200"
          >
            {isAr ? 'عرض توضيحي' : 'Demo'}
          </Link>

          <Link
            href={cta.href as Route}
            className="inline-flex items-center justify-center rounded-lg bg-[#F0C5AE] px-4 py-2 text-xs font-semibold text-[#54453D] transition-colors duration-200 hover:bg-[#E4A889] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2"
          >
            {cta.label}
          </Link>
        </div>

        {/* ── Mobile Navigation Trigger & Drawer ─────────────────────── */}
        <MobileNavigation lang={lang} navLinks={navLinks} cta={cta} />
      </PageContainer>
    </header>
  );
}
