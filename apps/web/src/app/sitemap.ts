import type { MetadataRoute } from 'next';
import { SITE_URL } from '@rashx/seo/metadata';

/**
 * Production Sitemap Configuration
 *
 * Generates /sitemap.xml at build/runtime.
 * Excludes internal or review routes such as /brand.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          ar: SITE_URL,
          en: `${SITE_URL}?lang=en`,
          'x-default': SITE_URL,
        },
      },
    },
  ];
}

