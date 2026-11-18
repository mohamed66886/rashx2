import { describe, it, expect } from 'vitest';
import { generatePageMetadata } from './metadata';
import { SITE_URL } from '@rashx/seo/metadata';

describe('Metadata Generator', () => {
  it('should generate valid page metadata for Arabic', () => {
    const meta = generatePageMetadata({
      title: 'عن راش إكس',
      description: 'وصف عن راش إكس',
      path: '/about',
      lang: 'ar',
    });

    expect(meta.title).toBe('عن راش إكس');
    expect(meta.description).toBe('وصف عن راش إكس');
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/about`);
    expect(meta.openGraph?.locale).toBe('ar_SA');
    expect(meta.openGraph?.alternateLocale).toBe('en_US');
  });

  it('should generate valid page metadata for English', () => {
    const meta = generatePageMetadata({
      title: 'About RASHX',
      description: 'About RASHX description',
      path: '/about',
      lang: 'en',
    });

    expect(meta.title).toBe('About RASHX');
    expect(meta.openGraph?.locale).toBe('en_US');
    expect(meta.openGraph?.alternateLocale).toBe('ar_SA');
  });
});
