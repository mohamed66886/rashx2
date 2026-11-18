/**
 * Server-side translation utilities for React Server Components.
 * Import as: import { getTranslation } from '@rashx/i18n/server'
 */

import type { Lang } from './types';
import { ar } from './dictionaries/ar';
import { en } from './dictionaries/en';

type DeepStringRecord<T> = {
  readonly [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
      ? DeepStringRecord<T[K]>
      : T[K];
};

export type Dictionary = DeepStringRecord<typeof ar>;

/**
 * Returns the translation dictionary for the given language.
 * Use in React Server Components and async functions.
 */
export async function getTranslation(lang: Lang): Promise<Dictionary> {
  if (lang === 'en') return en;
  return ar;
}

/**
 * Synchronous version for cases where async is not possible.
 * Prefer getTranslation() where possible.
 */
export function getTranslationSync(lang: Lang): Dictionary {
  if (lang === 'en') return en;
  return ar;
}
