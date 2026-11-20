import type { MetadataRoute } from 'next';
import { SITE_URL } from '@rashx/seo/metadata';

/**
 * robots.txt
 *
 * Public marketing site is fully crawlable. AI search / answer crawlers are
 * listed explicitly so the policy is visible and auditable. Each named group
 * repeats the Disallow list because a bot that matches a named group ignores
 * the `*` group.
 *
 * Policy choice: training crawlers (GPTBot, Google-Extended, ClaudeBot,
 * Applebot-Extended, CCBot) are ALLOWED so RASHX is part of model knowledge.
 * Remove them from AI_CRAWLERS if you decide to opt out of training.
 *
 * /brand/* is kept out of the index with an X-Robots-Tag header (next.config.ts),
 * NOT with Disallow, so crawlers can actually see the noindex.
 */
const DISALLOW = ['/api/'];

const AI_CRAWLERS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
