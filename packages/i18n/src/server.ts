/**
 * Server-side translation utilities for React Server Components.
 * Import as: import { getTranslation } from '@rashx/i18n/server'
 */

import type { Lang } from './types';
import { ar } from './dictionaries/ar';
import { en } from './dictionaries/en';

export type Dictionary = typeof ar;

/**
 * Returns the translation dictionary for the given language.
 * Use in React Server Components and async functions.
 */
export async function getTranslation(lang: Lang): Promise<Dictionary> {
  if (lang === 'en') return en as unknown as Dictionary;
  return ar;
}

/**
 * Synchronous version for cases where async is not possible.
 * Prefer getTranslation() where possible.
 */
export function getTranslationSync(lang: Lang): Dictionary {
  if (lang === 'en') return en as unknown as Dictionary;
  return ar;
}
