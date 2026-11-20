import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';
import robots from './robots';

describe('sitemap.xml', () => {
  const entries = sitemap();

  it('lists the home page and core marketing pages', () => {
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://rashx.org');
    expect(urls).toContain('https://rashx.org/faq');
    expect(urls).toContain('https://rashx.org/solutions/booking');
  });

  it('never lists internal brand pages or duplicates', () => {
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u === 'https://rashx.org/brand' || u.startsWith('https://rashx.org/brand/'))).toBe(false);
    expect(urls).toContain('https://rashx.org/branding');
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('gives every entry ar, en and x-default alternates', () => {
    for (const e of entries) {
      expect(Object.keys(e.alternates?.languages ?? {})).toEqual(['ar', 'en', 'x-default']);
    }
  });
});

describe('robots.txt', () => {
  it('points to the sitemap and does not block the site', () => {
    const r = robots();
    expect(r.sitemap).toBe('https://rashx.org/sitemap.xml');
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(rules.every((x) => x.allow === '/')).toBe(true);
  });
});
