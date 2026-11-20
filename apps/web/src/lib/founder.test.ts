import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  formatAge,
  founderProfile,
  getFounderFaq,
} from '@rashx/content';
import { buildFounderProfileSchema, RASHX_FOUNDER_ID } from '@rashx/seo/structured-data';

const BIRTH = { year: 2004, month: 12, day: 1 };

describe('calculateAge (born 1 December 2004, day precision, Africa/Cairo)', () => {
  it('is 20 in November 2025 and 21 from December 2025', () => {
    expect(calculateAge(BIRTH, new Date('2025-11-15T10:00:00Z'))).toBe(20);
    expect(calculateAge(BIRTH, new Date('2025-12-15T10:00:00Z'))).toBe(21);
  });

  it('is 21 on 2026-11-20 and 22 from 1 December 2026', () => {
    expect(calculateAge(BIRTH, new Date('2026-11-20T07:00:00Z'))).toBe(21);
    expect(calculateAge(BIRTH, new Date('2026-12-01T07:00:00Z'))).toBe(22);
    expect(calculateAge(BIRTH, new Date('2026-12-02T07:00:00Z'))).toBe(22);
  });

  it('rolls over on Cairo time, not UTC', () => {
    // 2026-11-30 22:30 UTC is already 2026-12-01 in Cairo (UTC+2).
    expect(calculateAge(BIRTH, new Date('2026-11-30T22:30:00Z'))).toBe(22);
    expect(calculateAge(BIRTH, new Date('2026-11-30T21:30:00Z'))).toBe(21);
  });
});

describe('formatAge', () => {
  it('formats Arabic and English', () => {
    expect(formatAge(21, 'ar')).toBe('21 عامًا');
    expect(formatAge(21, 'en')).toBe('21 years old');
  });
});

describe('founder FAQ', () => {
  it('has the same number of questions in both languages and includes the age', () => {
    const ar = getFounderFaq('ar', formatAge(21, 'ar'));
    const en = getFounderFaq('en', formatAge(21, 'en'));
    expect(ar.length).toBe(en.length);
    expect(ar.some((item) => item.answer.includes('21 عامًا'))).toBe(true);
    expect(en.some((item) => item.answer.includes('21 years old'))).toBe(true);
  });
});

describe('founder Person JSON-LD', () => {
  const schema = buildFounderProfileSchema({
    lang: 'ar',
    name: 'Mohamed Abdo Rashad El-Bahy',
    alternateNames: ['محمد عبده رشاد البهي', ...founderProfile.aliases.ar],
    birthDate: '2004-12-01',
    birthPlace: { name: 'Dakarnis, Dakahlia, Egypt', addressRegion: 'Dakahlia', addressCountry: 'EG' },
    description: founderProfile.summary.ar,
    images: [],
    sameAs: ['https://github.com/mohamed66886'],
    knowsAbout: founderProfile.expertise.en,
    education: { name: 'European University of Lefke', faculty: 'Computer Science' },
  });

  it('uses the shared founder @id and full birth date', () => {
    expect(schema['@id']).toBe(RASHX_FOUNDER_ID);
    expect(schema.birthDate).toBe('2004-12-01');
  });

  it('omits image when no photo exists', () => {
    expect('image' in schema).toBe(false);
  });

  it('covers the short-name searches', () => {
    expect(schema.alternateName).toContain('محمد رشاد');
    expect(schema.alternateName).toContain('محمد البهي');
  });
});
