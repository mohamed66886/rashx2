/**
 * RASHX Metadata Helpers
 *
 * Generates consistent Next.js Metadata objects for all pages.
 * Always call generatePageMetadata() in every page's generateMetadata() export.
 */

import type { Metadata } from 'next';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
  buildHreflangUrl,
  buildHreflangAlternates,
  buildRobots,
} from '@rashx/seo/metadata';
import type { Lang } from '@rashx/i18n/types';

export interface GenerateMetadataOptions {
  title: string;
  description: string;
  path: string;
  lang?: Lang;
  ogImage?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

/** Generates a complete Metadata object for a page. */
export function generatePageMetadata({
  title,
  description,
  path,
  lang = 'ar',
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
}: GenerateMetadataOptions): Metadata {
  // Self-referencing canonical per language variant (ar = clean URL, en = ?lang=en).
  // Pointing the English variant at the Arabic URL would stop English from being indexed.
  const canonicalUrl = buildHreflangUrl(path, lang);
  const alternates = buildHreflangAlternates(path);
  const locale = lang === 'ar' ? 'ar_SA' : 'en_US';

  return {
    // `absolute` skips the root `%s | RASHX` template: page titles already carry the brand.
    title: { absolute: title },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages: alternates.languages,
    },
    robots: buildRobots(noIndex),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale,
      alternateLocale: lang === 'ar' ? 'en_US' : 'ar_SA',
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && publishedTime
        ? { publishedTime, modifiedTime }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      images: [ogImage],
    },
  };
}

/** Generates the root metadata used in layout.tsx */
export function generateRootMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | RASHX`,
    },
    description:
      'نظام التشغيل الرقمي المتكامل لصالونات التجميل ومراكز العناية والسبا في المملكة العربية السعودية',
    applicationName: 'RASHX',
    referrer: 'origin-when-cross-origin',
    keywords: [
      'RASHX',
      'راش إكس',
      'صالونات تجميل',
      'نظام إدارة صالونات',
      'برنامج إدارة صالون',
      'SaaS تجميل',
      'المملكة العربية السعودية',
      'نظام حجوزات',
    ],
    authors: [{ name: 'RASHX', url: SITE_URL }],
    creator: 'RASHX',
    publisher: 'RASHX',
    robots: buildRobots(false),
    openGraph: {
      type: 'website',
      locale: 'ar_SA',
      alternateLocale: 'en_US',
      url: SITE_URL,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
    },
    icons: {
      icon: [
        { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
      other: [
        { rel: 'mask-icon', url: '/icons/favicon.svg', color: '#7c3aed' },
      ],
    },
    manifest: '/manifest.webmanifest',
  };
}
