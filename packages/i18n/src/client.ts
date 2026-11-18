/**
 * Client-side translation utilities for React Client Components.
 * Import as: import { ... } from '@rashx/i18n/client'
 *
 * The LangProvider should be set up in apps/web — this package
 * only exports the hook and context types.
 */

'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import type { Lang } from './types';
import type { ARDictionary } from './dictionaries/ar';

export type Dictionary = ARDictionary;

export type LangContextValue = {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  t: Dictionary;
};

export const LangContext = createContext<LangContextValue | null>(null);

export function useTranslation(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error(
      'useTranslation() must be used within a LangProvider. ' +
        'Make sure your component is wrapped by LangProvider in the root layout.',
    );
  }
  return ctx;
}

export type { Lang, ReactNode };
