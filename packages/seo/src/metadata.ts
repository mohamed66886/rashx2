/**
 * RASHX SEO Metadata Utilities
 *
 * Helpers for generating typed Next.js Metadata objects.
 * No business logic — pure SEO utility functions.
 */

export const SITE_URL = 'https://rashx.org' as const;
export const APP_URL = 'https://app.rashx.org' as const;
export const SITE_NAME = 'RASHX | راش إكس' as const;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og/default.png` as const;
export const TWITTER_HANDLE = '@rashxsa' as const;

/** Official profiles — keep identical everywhere (schema sameAs, footer, llms.txt). */
export const SOCIAL_PROFILES = [
  'https://x.com/rashxsa',
  'https://www.linkedin.com/company/rashx',
  'https://www.instagram.com/rashx.sa',
  'https://www.facebook.com/rashx.sa',
  'https://www.tiktok.com/@rashx.sa',
  'https://t.me/rashxsa',
  'https://snapchat.com/t/MuwsbAAK',
] as const;

export interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  locale?: 'ar_SA' | 'en_US';
}

/** Builds a canonical URL from a path */
export function buildCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/** Builds an hreflang URL with language parameter */
export function buildHreflangUrl(path: string, lang: 'ar' | 'en'): string {
  const canonical = buildCanonicalUrl(path);
  if (lang === 'ar') return canonical; // ar is default, no param needed
  return `${canonical}?lang=${lang}`;
}

/** Generates hreflang alternate links for a page */
export function buildHreflangAlternates(path: string): {
  languages: Record<string, string>;
} {
  return {
    languages: {
      ar: buildHreflangUrl(path, 'ar'),
      en: buildHreflangUrl(path, 'en'),
      'x-default': buildCanonicalUrl(path),
    },
  };
}

/** Generates robots directives */
export function buildRobots(noIndex = false) {
  if (noIndex) {
    return {
      index: false,
      follow: false,
    };
  }
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  };
}
