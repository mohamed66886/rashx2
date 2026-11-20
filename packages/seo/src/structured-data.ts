/**
 * RASHX JSON-LD Structured Data Generators
 *
 * Generates valid schema.org structured data.
 * Only generate schemas for verified, real data — never fabricated.
 * Every value here must also be visible on the site (about / contact / footer).
 */

import { SITE_URL, SOCIAL_PROFILES } from './metadata';

export const RASHX_ORGANIZATION_ID = `${SITE_URL}/#organization` as const;
export const RASHX_WEBSITE_ID = `${SITE_URL}/#website` as const;
export const RASHX_FOUNDER_ID = `${SITE_URL}/founder#person` as const;

/** Organization structured data for rashx.org */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': RASHX_ORGANIZATION_ID,
    name: 'RASHX',
    alternateName: ['راش إكس', 'RashX'],
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icons/icon-512.png`,
      width: 512,
      height: 512,
    },
    foundingDate: '2026',
    founder: { '@id': RASHX_FOUNDER_ID },
    description:
      'RASHX (راش إكس) is a cloud management platform for beauty salons, beauty centers and spas in Saudi Arabia: bookings, CRM, HR, sales, inventory, loyalty and ZATCA e-invoicing in one system.',
    areaServed: { '@type': 'Country', name: 'Saudi Arabia' },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+966548082945',
        contactType: 'customer support',
        areaServed: 'SA',
        availableLanguage: ['ar', 'en'],
      },
    ],
    sameAs: [...SOCIAL_PROFILES],
    knowsAbout: [
      'Beauty salon management software',
      'Spa management software',
      'Salon booking management',
      'ZATCA e-invoicing',
      'Salon CRM and loyalty programs',
    ],
  } as const;
}

/** Founder Person (matches /founder page). */
export function buildFounderSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': RASHX_FOUNDER_ID,
    name: 'Mohamed Abdo Rashad El-Bahy',
    alternateName: 'محمد عبده رشاد البهي',
    jobTitle: 'Founder',
    worksFor: { '@id': RASHX_ORGANIZATION_ID },
    url: `${SITE_URL}/founder`,
  } as const;
}

export interface FounderProfileSchemaInput {
  lang: 'ar' | 'en';
  /** Primary display name in English (matches the visible H1 spelling). */
  name: string;
  /** Every other spelling: Arabic name, short forms, handles. */
  alternateNames: readonly string[];
  /** Partial ISO 8601 date, e.g. "2004-12". Month precision only on purpose. */
  birthDate: string;
  birthPlace: { name: string; addressRegion: string; addressCountry: string };
  description: string;
  /** Absolute URLs. Only pass photos that really exist on the site. */
  images: readonly string[];
  /** Personal profiles, no tracking parameters. */
  sameAs: readonly string[];
  knowsAbout: readonly string[];
  education: { name: string; faculty: string };
}

/**
 * Rich Person for /founder. Same @id as buildFounderSchema(), so crawlers merge
 * both into one entity. Every value must also appear visibly on the page.
 */
export function buildFounderProfileSchema(input: FounderProfileSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': RASHX_FOUNDER_ID,
    name: input.name,
    alternateName: [...input.alternateNames],
    url: `${SITE_URL}/founder`,
    mainEntityOfPage: `${SITE_URL}/founder`,
    description: input.description,
    jobTitle: ['Founder', 'Software Developer'],
    worksFor: { '@id': RASHX_ORGANIZATION_ID },
    birthDate: input.birthDate,
    birthPlace: {
      '@type': 'Place',
      name: input.birthPlace.name,
      address: {
        '@type': 'PostalAddress',
        addressRegion: input.birthPlace.addressRegion,
        addressCountry: input.birthPlace.addressCountry,
      },
    },
    nationality: { '@type': 'Country', name: 'Egypt' },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: input.education.name,
      department: { '@type': 'Organization', name: input.education.faculty },
    },
    memberOf: {
      '@type': 'Organization',
      name: 'IEEE',
      url: 'https://www.ieee.org',
    },
    knowsAbout: [...input.knowsAbout],
    ...(input.images.length > 0 ? { image: [...input.images] } : {}),
    sameAs: [...input.sameAs],
  };
}

/** WebSite structured data (no SearchAction: the site has no sitewide search). */
export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': RASHX_WEBSITE_ID,
    url: SITE_URL,
    name: 'RASHX | راش إكس',
    publisher: { '@id': RASHX_ORGANIZATION_ID },
    inLanguage: ['ar', 'en'],
  } as const;
}

/**
 * SoftwareApplication structured data.
 * No `offers` on purpose: pricing is custom/quote-based, and an Offer without a
 * real price is invalid for Google. Add `offers` only when public prices exist.
 */
export function buildSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#software`,
    name: 'RASHX',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Cloud platform for beauty salons, beauty centers and spas: booking, CRM, HR and commissions, sales and POS, inventory, loyalty, notifications, reports and ZATCA e-invoicing.',
    url: SITE_URL,
    inLanguage: ['ar', 'en'],
    publisher: { '@id': RASHX_ORGANIZATION_ID },
  } as const;
}

/** FAQPage — pass the same Q&A that is rendered visibly on the page. */
export function buildFaqSchema(
  items: ReadonlyArray<{ question: string; answer: string }>,
  lang: 'ar' | 'en',
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } as const;
}

/** BreadcrumbList structured data */
export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  } as const;
}
