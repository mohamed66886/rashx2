/**
 * RASHX Company Information
 *
 * Factual company data. Do NOT invent or fabricate claims.
 * All content must be verified before publishing.
 */

import type { LocalizedString, SocialLink } from '../types';

export const company = {
  name: {
    ar: 'راش إكس',
    en: 'RASHX',
  } satisfies LocalizedString,

  fullName: {
    ar: 'RASHX | راش إكس',
    en: 'RASHX | راش إكس',
  } satisfies LocalizedString,

  tagline: {
    ar: 'أكثر من مجرد إدارة، تجربة رقمية متكاملة',
    en: 'More Than Management, A Complete Digital Experience',
  } satisfies LocalizedString,

  description: {
    ar: 'نظام التشغيل الرقمي المتكامل لصالونات التجميل ومراكز العناية والسبا في المملكة العربية السعودية',
    en: 'The complete digital operating system for beauty salons, wellness centers, and spas in Saudi Arabia',
  } satisfies LocalizedString,

  founded: '2026',

  market: {
    ar: 'المملكة العربية السعودية',
    en: 'Saudi Arabia',
  } satisfies LocalizedString,

  industry: {
    ar: 'التقنية / SaaS / التجميل والعناية',
    en: 'Technology / SaaS / Beauty & Wellness',
  } satisfies LocalizedString,

  website: 'https://rashx.org',
  appUrl: 'https://app.rashx.org',

  social: [] satisfies SocialLink[], // Add real social links when available

  /**
   * Content integrity notice:
   * Customer counts, testimonials, case study metrics, and performance
   * statistics must be real and verified before publishing.
   * Never fabricate claims. Mark planned features as "Coming Soon".
   */
  _contentPolicy: {
    noFabricatedTestimonials: true,
    noFabricatedMetrics: true,
    noUnverifiedCertifications: true,
  },
} as const;
