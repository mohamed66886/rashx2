/**
 * RASHX JSON-LD Structured Data Generators
 *
 * Generates valid schema.org structured data.
 * Only generate schemas for verified, real data — never fabricated.
 */

export const RASHX_ORGANIZATION_ID = 'https://rashx.org/#organization' as const;
export const RASHX_WEBSITE_ID = 'https://rashx.org/#website' as const;

/** Organization structured data for rashx.org */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': RASHX_ORGANIZATION_ID,
    name: 'RASHX',
    alternateName: 'راش إكس',
    url: 'https://rashx.org',
    logo: {
      '@type': 'ImageObject',
      url: 'https://rashx.org/icons/icon-512.png',
      width: 512,
      height: 512,
    },
    foundingDate: '2026',
    description:
      'The complete digital operating system for beauty salons, wellness centers, and spas in Saudi Arabia.',
    areaServed: {
      '@type': 'Country',
      name: 'Saudi Arabia',
    },
    knowsAbout: [
      'Beauty salon management software',
      'SaaS',
      'Booking management',
      'CRM',
    ],
  } as const;
}

/** WebSite structured data with Sitelinks Searchbox */
export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': RASHX_WEBSITE_ID,
    url: 'https://rashx.org',
    name: 'RASHX | راش إكس',
    publisher: {
      '@id': RASHX_ORGANIZATION_ID,
    },
    inLanguage: ['ar', 'en'],
  } as const;
}

/** SoftwareApplication structured data */
export function buildSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RASHX',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'SAR',
      availability: 'https://schema.org/ComingSoon',
    },
    description:
      'Complete digital operating system for beauty salons, wellness centers, and spas.',
    url: 'https://rashx.org',
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
