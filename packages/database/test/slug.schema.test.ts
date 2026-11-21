import { describe, it, expect } from 'vitest';
import {
  SlugFormatSchema,
  TenantSlugDocSchema,
  RESERVED_SLUGS,
} from '../src/slug.schema';

describe('Slug Schema & Routing Foundation', () => {
  describe('SlugFormatSchema', () => {
    it('accepts valid alphanumeric slugs with hyphens', () => {
      expect(SlugFormatSchema.parse('salon-al-olaya')).toBe('salon-al-olaya');
      expect(SlugFormatSchema.parse('rashx-barbers')).toBe('rashx-barbers');
      expect(SlugFormatSchema.parse('riyadh-spa-2026')).toBe('riyadh-spa-2026');
      expect(SlugFormatSchema.parse('abc')).toBe('abc');
    });

    it('rejects slugs shorter than 3 characters', () => {
      expect(() => SlugFormatSchema.parse('ab')).toThrow();
      expect(() => SlugFormatSchema.parse('a')).toThrow();
    });

    it('rejects slugs longer than 32 characters', () => {
      const longSlug = 'a'.repeat(33);
      expect(() => SlugFormatSchema.parse(longSlug)).toThrow();
    });

    it('rejects uppercase characters', () => {
      expect(() => SlugFormatSchema.parse('Salon-Riyadh')).toThrow();
      expect(() => SlugFormatSchema.parse('SALON')).toThrow();
    });

    it('rejects double hyphens, leading hyphens, and trailing hyphens', () => {
      expect(() => SlugFormatSchema.parse('-salon')).toThrow();
      expect(() => SlugFormatSchema.parse('salon-')).toThrow();
      expect(() => SlugFormatSchema.parse('salon--spa')).toThrow();
      expect(() => SlugFormatSchema.parse('salon---spa')).toThrow();
    });

    it('rejects special characters, spaces, and punctuation', () => {
      expect(() => SlugFormatSchema.parse('salon spa')).toThrow();
      expect(() => SlugFormatSchema.parse('salon_spa')).toThrow();
      expect(() => SlugFormatSchema.parse('salon.spa')).toThrow();
      expect(() => SlugFormatSchema.parse('salon@spa')).toThrow();
    });

    it('strictly rejects all reserved platform subdomains', () => {
      for (const reserved of RESERVED_SLUGS) {
        expect(() => SlugFormatSchema.parse(reserved)).toThrow(/reserved platform keyword/);
      }
    });
  });

  describe('TenantSlugDocSchema', () => {
    const validSlugDoc = {
      slug: 'al-olaya-spa',
      tenantId: 'tenant_olaya_01',
      status: 'ACTIVE' as const,
      allocatedAt: new Date().toISOString(),
    };

    it('validates a complete active slug routing document', () => {
      const result = TenantSlugDocSchema.parse(validSlugDoc);
      expect(result.slug).toBe('al-olaya-spa');
      expect(result.tenantId).toBe('tenant_olaya_01');
      expect(result.status).toBe('ACTIVE');
    });

    it('rejects invalid statuses', () => {
      expect(() =>
        TenantSlugDocSchema.parse({
          ...validSlugDoc,
          status: 'DELETED',
        })
      ).toThrow();
    });

    it('fails closed on unrecognized keys (.strict enforcement)', () => {
      expect(() =>
        TenantSlugDocSchema.parse({
          ...validSlugDoc,
          customRoutingTarget: 'http://malicious.com',
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('rejects invalid datetime format for allocatedAt', () => {
      expect(() =>
        TenantSlugDocSchema.parse({
          ...validSlugDoc,
          allocatedAt: '2026-13-99 99:99:99',
        })
      ).toThrow();
    });
  });
});

