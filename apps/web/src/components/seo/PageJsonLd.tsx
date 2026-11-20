import { SITE_URL, buildHreflangUrl } from '@rashx/seo/metadata';
import {
  RASHX_ORGANIZATION_ID,
  RASHX_WEBSITE_ID,
  buildBreadcrumbSchema,
} from '@rashx/seo/structured-data';
import { HOME_NAME, ROUTE_NAMES } from '@/lib/route-names';
import type { Lang } from '@rashx/i18n/types';
import { JsonLd } from './JsonLd';

const PAGE_TYPES: Record<string, string> = {
  '/about': 'AboutPage',
  '/contact': 'ContactPage',
};

/**
 * WebPage + BreadcrumbList JSON-LD for any public route, built from the URL path.
 * Breadcrumb parents are derived from path segments, so every parent must exist in ROUTE_NAMES.
 */
export function PageJsonLd({ path, lang }: { path: string; lang: Lang }) {
  const name = ROUTE_NAMES[path];
  if (!name) return null;

  const url = buildHreflangUrl(path, lang);
  const segments = path.split('/').filter(Boolean);
  const crumbs = [{ name: HOME_NAME[lang], url: buildHreflangUrl('/', lang) }];
  segments.forEach((_, i) => {
    const p = '/' + segments.slice(0, i + 1).join('/');
    const n = ROUTE_NAMES[p];
    if (n) crumbs.push({ name: n[lang], url: buildHreflangUrl(p, lang) });
  });

  const webPage = {
    '@context': 'https://schema.org',
    '@type': PAGE_TYPES[path] ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: name[lang],
    inLanguage: lang,
    isPartOf: { '@id': RASHX_WEBSITE_ID },
    about: { '@id': RASHX_ORGANIZATION_ID },
    breadcrumb: { '@id': `${url}#breadcrumb` },
  };
  const breadcrumb = { ...buildBreadcrumbSchema(crumbs), '@id': `${url}#breadcrumb` };

  return <JsonLd data={[webPage, breadcrumb]} />;
}

export { SITE_URL };
