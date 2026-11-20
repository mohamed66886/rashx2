import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import { ROUTE_NAMES } from './route-names';

describe('route names (JSON-LD breadcrumbs)', () => {
  it('has a bilingual name for every sitemap URL and every breadcrumb parent', () => {
    for (const e of sitemap()) {
      const path = new URL(e.url).pathname.replace(/\/$/, '') || '/';
      if (path === '/') continue;
      const parts = path.split('/').filter(Boolean);
      parts.forEach((_, i) => {
        const p = '/' + parts.slice(0, i + 1).join('/');
        expect(ROUTE_NAMES[p], `missing name for ${p}`).toBeDefined();
        expect(ROUTE_NAMES[p]!.ar.length).toBeGreaterThan(0);
        expect(ROUTE_NAMES[p]!.en.length).toBeGreaterThan(0);
      });
    }
  });
});
