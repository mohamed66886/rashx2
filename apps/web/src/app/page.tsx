/**
 * RASHX Home Page
 *
 * Phase 1: Minimal shell. Full implementation in Phase 4.
 * This page delegates to the home feature module.
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { getTranslation } from '@rashx/i18n/server';
import { generatePageMetadata } from '@/lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: 'RASHX | راش إكس — نظام التشغيل الرقمي لصالونات التجميل',
    description:
      'نظام التشغيل الرقمي المتكامل لصالونات التجميل ومراكز العناية والسبا في المملكة العربية السعودية. إدارة، حجوزات، CRM، مبيعات، وتجربة رقمية متكاملة.',
    path: '/',
  });
}

export default async function HomePage() {
  const lang = await getLang();
  const t = await getTranslation(lang);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Phase 1 — Foundation placeholder. Full home page built in Phase 4. */}
      <div className="max-w-2xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[--color-accent]">
          Phase 1 — Foundation Active
        </p>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
          {t.metadata.siteName}
        </h1>
        <p className="mb-6 text-lg text-[--surface-muted-foreground] md:text-xl">
          {t.metadata.siteTagline}
        </p>
        <p className="text-sm text-[--surface-muted-foreground]">
          {lang === 'ar'
            ? 'الموقع قيد الإنشاء — سيتم الإطلاق قريباً'
            : 'Website under construction — Launching soon'}
        </p>
      </div>
    </div>
  );
}
