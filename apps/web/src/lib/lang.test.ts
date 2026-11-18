import { describe, it, expect } from 'vitest';
import { getDir, getLangAttr, DEFAULT_LANG } from './lang';
import { isValidLang, SUPPORTED_LANGS } from '@rashx/i18n/types';

describe('Language Utilities', () => {
  it('should have Arabic as default language', () => {
    expect(DEFAULT_LANG).toBe('ar');
  });

  it('should support ar and en', () => {
    expect(SUPPORTED_LANGS).toContain('ar');
    expect(SUPPORTED_LANGS).toContain('en');
    expect(isValidLang('ar')).toBe(true);
    expect(isValidLang('en')).toBe(true);
    expect(isValidLang('fr')).toBe(false);
  });

  it('should return correct direction for language', () => {
    expect(getDir('ar')).toBe('rtl');
    expect(getDir('en')).toBe('ltr');
  });

  it('should return correct lang attribute', () => {
    expect(getLangAttr('ar')).toBe('ar');
    expect(getLangAttr('en')).toBe('en');
  });
});

