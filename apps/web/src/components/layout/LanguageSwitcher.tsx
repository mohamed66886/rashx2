'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { Globe } from '@rashx/icons';
import { LANG_COOKIE } from '@rashx/i18n/types';
import type { Lang } from '@/lib/lang';

export interface LanguageSwitcherProps {
  /** Language passed from server component if available */
  currentLang?: Lang;
  className?: string;
}

function LanguageSwitcherContent({ currentLang, className }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL query parameter takes top priority on client; fall back to server currentLang
  const langParam = searchParams.get('lang');
  const isAr = langParam
    ? langParam === 'ar'
    : currentLang
      ? currentLang === 'ar'
      : true;

  const targetLang = isAr ? 'en' : 'ar';

  // Construct target URL with explicit ?lang=en or ?lang=ar (preserves existing parameters)
  const params = new URLSearchParams(searchParams.toString());
  params.set('lang', targetLang);

  const queryString = params.toString();
  const targetHref = `${pathname}?${queryString}`;

  const accessibleLabel = isAr
    ? 'تغيير اللغة إلى الإنجليزية'
    : 'Change language to Arabic';

  const handleClick = () => {
    // Synchronize client-side cookie immediately
    if (typeof document !== 'undefined') {
      document.cookie = `${LANG_COOKIE}=${targetLang}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  return (
    <Link
      href={targetHref as Route}
      onClick={handleClick}
      className={
        className ??
        'inline-flex items-center gap-1.5 rounded-lg bg-[#FAF9F8] px-3 py-1.5 text-xs font-semibold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] focus-visible:ring-offset-2'
      }
      aria-label={accessibleLabel}
      title={accessibleLabel}
    >
      <Globe className="h-3.5 w-3.5 text-[#54453D]" aria-hidden="true" />
      <span>{isAr ? 'English' : 'العربية'}</span>
    </Link>
  );
}

export function LanguageSwitcher(props: LanguageSwitcherProps) {
  const fallbackLabel = props.currentLang === 'en' ? 'العربية' : 'English';

  return (
    <Suspense
      fallback={
        <span
          className={
            props.className ??
            'inline-flex items-center gap-1.5 rounded-lg bg-[#FAF9F8] px-3 py-1.5 text-xs font-semibold text-[#54453D]'
          }
        >
          <Globe className="h-3.5 w-3.5 text-[#54453D]" aria-hidden="true" />
          <span>{fallbackLabel}</span>
        </span>
      }
    >
      <LanguageSwitcherContent {...props} />
    </Suspense>
  );
}
