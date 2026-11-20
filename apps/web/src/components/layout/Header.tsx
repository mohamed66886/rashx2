'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { RashxLockupBilingual, ChevronDown } from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileNavigation, type MobileNavLink } from './MobileNavigation';

export interface HeaderProps {
  lang: Lang;
  className?: string;
}

type MenuId = 'solutions' | 'industries' | 'more';

interface MenuItem {
  label: string;
  href: string;
  desc?: string;
}

interface NavItem {
  label: string;
  href: string;
  menu?: MenuId;
}

const EASE = 'ease-[cubic-bezier(.22,1,.36,1)]';

/**
 * التصميم الجديد
 * ─ فوق (scrollY < 8): شفاف 100% — بدون خلفية ولا blur، اللوجو يمين/شمال والروابط في النص.
 * ─ بعد الاسكرول: يتحول لـ "جزيرة" عايمة (pill) بخلفية زجاجية، أضيق ومتوسّطة.
 * ─ مؤشر (pill) بيتحرك بين الروابط مع الماوس.
 * ─ Mega-menu للحلول والقطاعات بدل القوائم الصغيرة.
 * ─ بيستخبى مع النزول ويرجع مع الطلوع + شريط تقدم داخل الجزيرة.
 */
export function Header({ lang, className }: HeaderProps) {
  const isAr = lang === 'ar';
  const q = isAr ? '' : '?lang=en';

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState<MenuId | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  const barRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openRef = useRef<MenuId | null>(null);
  openRef.current = open;

  // ── Scroll behaviour ─────────────────────────────────────────────
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      if (barRef.current) {
        const p = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
        barRef.current.style.transform = `scaleX(${p})`;
      }

      setScrolled(y > 8);

      const delta = y - lastY;
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 240 && !openRef.current);
        lastY = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  }, [cancelClose]);

  const hoverItem = (e: MouseEvent<HTMLElement> | { currentTarget: HTMLElement }, menu?: MenuId) => {
    const el = e.currentTarget;
    setPill({ left: el.offsetLeft, width: el.offsetWidth });
    cancelClose();
    setOpen(menu ?? null);
  };

  // ── Hrefs ────────────────────────────────────────────────────────
  const homeHref = isAr ? '/' : '/?lang=en';
  const brandHref = `/brand${q}`;
  const pillarsHref = isAr ? '/#pillars' : '/?lang=en#pillars';
  const platformHref = `/platform${q}`;
  const solutionsHref = `/solutions${q}`;
  const industriesHref = `/industries${q}`;
  const pricingHref = `/pricing${q}`;
  const aboutHref = `/about${q}`;
  const contactHref = `/contact${q}`;
  const demoHref = `/demo${q}`;

  const solutions: MenuItem[] = isAr
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

  const industries: MenuItem[] = isAr
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

  const more: MenuItem[] = [
    { label: isAr ? 'دليل الهوية' : 'Brand Showcase', href: brandHref, desc: isAr ? 'الألوان والشعار والخطوط' : 'Logo, colors & type' },
    { label: isAr ? 'الركائز الهندسية' : 'Engineering Pillars', href: pillarsHref, desc: isAr ? 'أسس بناء المنظومة' : 'How the platform is built' },
  ];

  const navItems: NavItem[] = [
    { label: isAr ? 'المنظومة' : 'Platform', href: platformHref },
    { label: isAr ? 'الحلول' : 'Solutions', href: solutionsHref, menu: 'solutions' },
    { label: isAr ? 'القطاعات' : 'Industries', href: industriesHref, menu: 'industries' },
    { label: isAr ? 'الأسعار' : 'Pricing', href: pricingHref },
    { label: isAr ? 'عن راش إكس' : 'About', href: aboutHref },
    { label: isAr ? 'تواصل معنا' : 'Contact', href: contactHref },
    { label: isAr ? 'المزيد' : 'More', href: brandHref, menu: 'more' },
  ];

  const mobileLinks: MobileNavLink[] = [
    { label: isAr ? 'الرئيسية' : 'Home', href: homeHref },
    { label: isAr ? 'المنظومة' : 'Platform', href: platformHref },
    { label: isAr ? 'الحلول' : 'Solutions', href: solutionsHref },
    { label: isAr ? 'القطاعات' : 'Industries', href: industriesHref },
    { label: isAr ? 'الأسعار' : 'Pricing', href: pricingHref },
    { label: isAr ? 'عن راش إكس' : 'About', href: aboutHref },
    { label: isAr ? 'تواصل معنا' : 'Contact', href: contactHref },
    { label: isAr ? 'دليل الهوية' : 'Brand Showcase', href: brandHref },
    { label: isAr ? 'الركائز الهندسية' : 'Engineering Pillars', href: pillarsHref },
  ];

  const cta = { label: isAr ? 'اكتشف RASHX' : 'Discover RASHX', href: brandHref };

  // ── Panel shell ──────────────────────────────────────────────────
  const panelClass = (id: MenuId, width: string) =>
    `absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 transition-all duration-300 ${EASE} ${width} ${
      open === id
        ? 'visible translate-y-0 opacity-100'
        : 'pointer-events-none invisible translate-y-3 opacity-0'
    }`;

  const panelSurface =
    'overflow-hidden rounded-[28px] bg-[#FAF9F8] p-3 shadow-[0_30px_70px_-24px_rgba(84,69,61,.35)]';

  const itemStyle = (id: MenuId, i: number) => ({
    transitionDelay: open === id ? `${70 + i * 35}ms` : '0ms',
  });
  const itemReveal = (id: MenuId) =>
    open === id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0';

  return (
    <div className="relative h-[76px]" dir={isAr ? 'rtl' : 'ltr'}>
      <header
        className={`fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 transition-transform duration-500 ${EASE} ${
          hidden ? '-translate-y-[130%]' : 'translate-y-0'
        } ${className ?? ''}`}
      >
        <div
          className={`relative w-full transition-[max-width] duration-700 ${EASE}`}
          style={{ maxWidth: scrolled ? 1220 : 1440 }}
          onMouseEnter={cancelClose}
          onMouseLeave={() => {
            scheduleClose();
            setPill(null);
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setOpen(null);
              setPill(null);
            }
          }}
        >
          {/* ── The bar ────────────────────────────────────────── */}
          <div
            className={`relative overflow-hidden rounded-full transition-all duration-700 ${EASE} ${
              scrolled
                ? 'bg-[#FAF9F8]/80 px-3 py-1.5 backdrop-blur-xl'
                : 'bg-transparent px-2 py-1 backdrop-blur-0'
            }`}
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 xl:gap-3">
              {/* Logo */}
              <Link
                href={homeHref as Route}
                aria-label={isAr ? 'راش إكس - الصفحة الرئيسية' : 'RASHX - Home'}
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 transition-transform duration-500 ${EASE} hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] ${
                  scrolled ? 'scale-90' : 'scale-100'
                }`}
                style={{ transformOrigin: isAr ? 'right center' : 'left center' }}
              >
                <RashxLockupBilingual height={34} color="ink" />
                <span className="sr-only">
                  {isAr ? 'راش إكس لتقنية المعلومات' : 'RASHX Information Technology'}
                </span>
              </Link>

              {/* Centered nav with sliding highlight */}
              <nav
                aria-label={isAr ? 'الملاحة الرئيسية' : 'Main navigation'}
                className="relative mx-auto hidden items-center gap-0.5 p-1 lg:flex"
                onMouseLeave={() => setPill(null)}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute bottom-1 top-1 rounded-full bg-[#F0C5AE]/50 transition-[left,width,opacity] duration-300 ${EASE}`}
                  style={{
                    left: pill?.left ?? 0,
                    width: pill?.width ?? 0,
                    opacity: pill ? 1 : 0,
                  }}
                />
                {navItems.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href as Route}
                    onMouseEnter={(e) => hoverItem(e, item.menu)}
                    onFocus={(e) => hoverItem(e, item.menu)}
                    aria-haspopup={item.menu ? 'true' : undefined}
                    aria-expanded={item.menu ? open === item.menu : undefined}
                    className="relative z-10 inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium text-[#54453D] xl:px-3.5 xl:text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0]"
                  >
                    {item.label}
                    {item.menu ? (
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-3 w-3 text-[#54453D]/50 transition-transform duration-300 ${
                          open === item.menu ? 'rotate-180' : ''
                        }`}
                      />
                    ) : null}
                  </Link>
                ))}
              </nav>

              {/* Actions */}
              <div className="flex shrink-0 items-center justify-end gap-2">
                <div className="hidden whitespace-nowrap lg:block">
                  <LanguageSwitcher currentLang={lang} />
                </div>

                <Link
                  href={demoHref as Route}
                  className="hidden whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/40 2xl:inline-flex"
                >
                  {isAr ? 'عرض توضيحي' : 'Demo'}
                </Link>

                <Link
                  href={cta.href as Route}
                  className="group/cta hidden shrink-0 items-center gap-3 whitespace-nowrap rounded-full bg-[#54453D] py-1 ps-4 pe-1 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#3F332D] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54453D] focus-visible:ring-offset-2 lg:inline-flex"
                >
                  {cta.label}
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 place-items-center rounded-full bg-[#F0C5AE] text-[#54453D] transition-transform duration-500 group-hover/cta:rotate-45 rtl:-scale-x-100 rtl:group-hover/cta:-rotate-45"
                  >
                    →
                  </span>
                </Link>

                <MobileNavigation lang={lang} navLinks={mobileLinks} cta={cta} />
              </div>
            </div>

            {/* Scroll progress (داخل الجزيرة) */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-6 bottom-0 h-[2px] transition-opacity duration-300 ${
                scrolled ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                ref={barRef}
                className="h-full w-full rounded-full bg-[#E4A889] will-change-transform"
                style={{
                  transform: 'scaleX(0)',
                  transformOrigin: isAr ? 'right' : 'left',
                }}
              />
            </div>
          </div>

          {/* ── Mega: Solutions ───────────────────────────────── */}
          <div className={panelClass('solutions', 'w-[min(46rem,calc(100vw-1.5rem))]')}>
            <div className={panelSurface}>
              <div className="flex items-center justify-between px-3 pb-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#54453D]/60">
                  {isAr ? 'الأنظمة التشغيلية' : 'Operating Modules'}
                </span>
                <Link
                  href={solutionsHref as Route}
                  className="text-xs font-semibold text-[#54453D] underline-offset-4 hover:underline"
                >
                  {isAr ? 'عرض كل الحلول' : 'View all solutions'}
                </Link>
              </div>
              <div className="grid gap-1 md:grid-cols-2">
                {solutions.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    style={itemStyle('solutions', i)}
                    className={`group/item flex items-center gap-3 rounded-2xl p-3 transition-all duration-300 hover:bg-white ${itemReveal('solutions')}`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F0C5AE]/40 text-[11px] font-bold text-[#54453D] transition-colors duration-300 group-hover/item:bg-[#F0C5AE]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[13px] font-bold text-[#54453D]">{item.label}</span>
                      <span className="truncate text-[11px] text-[#54453D]/60">{item.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Mega: Industries ──────────────────────────────── */}
          <div className={panelClass('industries', 'w-[min(44rem,calc(100vw-1.5rem))]')}>
            <div className={`${panelSurface} grid gap-3 md:grid-cols-[1fr_15rem]`}>
              <div>
                <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-[#54453D]/60">
                  {isAr ? 'الأنشطة المعتمدة' : 'Specialized Sectors'}
                </div>
                <div className="grid gap-1 sm:grid-cols-2">
                  {industries.map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href as Route}
                      style={itemStyle('industries', i)}
                      className={`group/item flex items-center justify-between rounded-2xl px-3 py-3 text-[13px] font-semibold text-[#54453D] transition-all duration-300 hover:bg-white ${itemReveal('industries')}`}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className="text-[#E4A889] opacity-0 transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:opacity-100 rtl:-scale-x-100 rtl:group-hover/item:-translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href={demoHref as Route}
                style={itemStyle('industries', 3)}
                className={`group/card relative flex min-h-[10rem] flex-col justify-end overflow-hidden rounded-3xl bg-[#54453D] p-5 text-white transition-all duration-500 ${itemReveal('industries')}`}
              >
                <span
                  aria-hidden="true"
                  className="rx-float absolute -top-8 h-28 w-28 rounded-full bg-[#F0C5AE] opacity-90 transition-transform duration-700 group-hover/card:scale-125 ltr:-right-8 rtl:-left-8"
                />
                <span className="relative text-lg font-bold leading-snug">
                  {isAr ? 'شوف راش إكس على منشأتك' : 'See RASHX on your venue'}
                </span>
                <span className="relative mt-1 text-xs text-white/70">
                  {isAr ? 'احجز عرضًا توضيحيًا' : 'Book a live demo'}
                </span>
              </Link>
            </div>
          </div>

          {/* ── Menu: More ────────────────────────────────────── */}
          <div className={panelClass('more', 'w-72')}>
            <div className={panelSurface}>
              {more.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  style={itemStyle('more', i)}
                  className={`group/item flex flex-col rounded-2xl px-3 py-3 transition-all duration-300 hover:bg-white ${itemReveal('more')}`}
                >
                  <span className="text-[13px] font-bold text-[#54453D]">{item.label}</span>
                  <span className="text-[11px] text-[#54453D]/60">{item.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}