import Link from 'next/link';
import { PageContainer } from '@rashx/ui';
import {
  RashxLockupBilingual,
  Twitter,
  Linkedin,
  Instagram,
  ExternalLink,
} from '@rashx/icons';
import { routes } from '@/lib/routes';
import type { Lang } from '@/lib/lang';

export interface FooterProps {
  lang: Lang;
  className?: string;
}

export function Footer({ lang, className }: FooterProps) {
  const isAr = lang === 'ar';

  const homeHref = isAr ? '/' : '/?lang=en';
  const brandHref = isAr ? '/brand' : '/brand?lang=en';
  const pillarsHref = isAr ? '/#pillars' : '/?lang=en#pillars';
  const heroHref = isAr ? '/#hero' : '/?lang=en#hero';

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
  ];

  return (
    <footer
      className={`bg-[#54453D] text-white transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="xl" className="py-16 md:py-20">
        {/* ── Main Footer Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Description (Span 6 on desktop) */}
          <div className="flex flex-col gap-6 lg:col-span-6">
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

            <p className="max-w-md text-sm leading-relaxed text-white/75">
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

            {/* Official Social Links */}
            <div className="mt-2 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#54453D]"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Group 1: Platform & Architecture (Span 3 on desktop) */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0C5AE]">
              {isAr ? 'المنصة والتقنية' : 'Platform & Tech'}
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  href={pillarsHref}
                  className="inline-flex items-center gap-1 text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE]"
                >
                  <span>{isAr ? 'الركائز الهندسية للمنظومة' : 'Engineering Pillars'}</span>
                </Link>
              </li>
              <li>
                <Link
                  href={brandHref}
                  className="inline-flex items-center gap-1 text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE]"
                >
                  <span>{isAr ? 'دليل ومواصفات الهوية' : 'Brand Identity Showcase'}</span>
                </Link>
              </li>
              <li>
                <a
                  href={routes.external.app}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE]"
                >
                  <span>{isAr ? 'بوابة المنظومة السحابية' : 'Cloud Platform Portal'}</span>
                  <ExternalLink className="h-3 w-3 text-white/60" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Group 2: Company & Leadership (Span 3 on desktop) */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0C5AE]">
              {isAr ? 'الشركة والمؤسس' : 'Company & Leadership'}
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  href={heroHref}
                  className="inline-flex items-center gap-1 text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE]"
                >
                  <span>{isAr ? 'عن راش إكس' : 'About RASHX'}</span>
                </Link>
              </li>
              <li>
                <Link
                  href={heroHref}
                  className="inline-flex items-center gap-1 text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE]"
                >
                  <span>
                    {isAr
                      ? 'المؤسس: م. محمد عبده رشاد البهي'
                      : 'Founder: Eng. Mohamed Abdo Rashad El-Bahy'}
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href={heroHref}
                  className="inline-flex items-center gap-1 text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0C5AE]"
                >
                  <span>
                    {isAr
                      ? 'المملكة العربية السعودية · 2026'
                      : 'Kingdom of Saudi Arabia · 2026'}
                  </span>
                </Link>
              </li>
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
