/**
 * Server-side language utilities for React Server Components.
 * Reads the x-rashx-lang header set by middleware.
 */

import { headers } from 'next/headers';
import {
  DEFAULT_LANG,
  LANG_HEADER,
  isValidLang,
  type Lang,
} from '@rashx/i18n/types';

export type { Lang };
export { DEFAULT_LANG };

/** Reads the current language from middleware-set header. RSC-only. */
export async function getLang(): Promise<Lang> {
  const headersList = await headers();
  const lang = headersList.get(LANG_HEADER);
  if (lang !== null && isValidLang(lang)) return lang;
  return DEFAULT_LANG;
}

/** Returns the HTML dir attribute for a given language. */
export function getDir(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/** Returns the HTML lang attribute for a given language. */
export function getLangAttr(lang: Lang): string {
  return lang === 'ar' ? 'ar' : 'en';
}
