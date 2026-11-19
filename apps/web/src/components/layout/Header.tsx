import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@rashx/ui';
import { RashxLockupBilingual } from '@rashx/icons';
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

  const navLinks: MobileNavLink[] = [
    {
      label: isAr ? 'الرئيسية' : 'Home',
      href: homeHref,
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
      <PageContainer size="full" className="flex items-center justify-between py-4">
        {/* ── Brand Logo ────────────────────────────────────────────── */}
        <div className="flex items-center gap-8">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] focus-visible:ring-offset-2"
            aria-label={isAr ? 'راش إكس - الصفحة الرئيسية' : 'RASHX - Home'}
          >
            <RashxLockupBilingual height={36} color="ink" />
            <span className="sr-only">
              {isAr ? 'راش إكس لتقنية المعلومات' : 'RASHX Information Technology'}
            </span>
          </Link>

          {/* ── Desktop Main Navigation ─────────────────────────────── */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label={isAr ? 'الملاحة الرئيسية' : 'Main navigation'}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as Route}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-[#54453D]/80 transition-colors duration-200 hover:bg-[#FAF9F8] hover:text-[#54453D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] focus-visible:ring-offset-2"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Desktop Right Actions (Language + CTA) ────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher currentLang={lang} />

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
