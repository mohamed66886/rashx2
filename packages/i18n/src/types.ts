/**
 * RASHX i18n Type System
 *
 * Language strategy: query-param based (?lang=ar / ?lang=en)
 * Default language: Arabic (ar)
 * No route prefixes (/ar/ or /en/) — ADR 0003
 */

export const SUPPORTED_LANGS = ['ar', 'en'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: Lang = 'ar';

export const LANG_COOKIE = 'rashx-lang' as const;
export const LANG_HEADER = 'x-rashx-lang' as const;
export const LANG_PARAM = 'lang' as const;

export function isValidLang(value: string): value is Lang {
  return SUPPORTED_LANGS.includes(value as Lang);
}
