/**
 * RASHX Trust & Compliance: E-Invoicing (ZATCA Phase 2)
 *
 * Dedicated Route: /compliance/e-invoicing
 * Visual Direction: Absolute Flat, Clean, Borderless & Shadowless Architecture
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import {
  TrustHero,
  TrustPillars,
  TrustImpact,
  TrustRegulatory,
  TrustCTA,
} from '@/components/trust';
import { trustData } from '@/data/trust';

const product = trustData.eInvoicing;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();

  if (!product) {
    return {};
  }

  return generatePageMetadata({
    title: product.seo.title[lang],
    description: product.seo.description[lang],
    path: product.path,
    lang,
  });
}

export default async function EInvoicingPage() {
  const lang = await getLang();

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      {/* ── Official Public Website Header ───────────────────────── */}
      <PageJsonLd path="/compliance/e-invoicing" lang={lang} />
      <Header lang={lang} />

      {/* ── Section A: Hero ───────────────────────────────────────── */}
      <TrustHero product={product} lang={lang} />

      {/* ── Section B: Pillars ────────────────────────────────────── */}
      <TrustPillars product={product} lang={lang} />

      {/* ── Section C: Strategic Impact ───────────────────────────── */}
      <TrustImpact product={product} lang={lang} />

      {/* ── Section D: Regulatory Standards ───────────────────────── */}
      <TrustRegulatory product={product} lang={lang} />

      {/* ── Section E: Final CTA ──────────────────────────────────── */}
      <TrustCTA product={product} lang={lang} />

      {/* ── Official Public Website Footer ───────────────────────── */}
      <Footer lang={lang} />
    </div>
  );
}

