/**
 * RASHX Digital Experience: White Label & Customization
 *
 * Dedicated Route: /white-label
 * Visual Direction: Absolute Flat, Clean, Borderless & Shadowless Architecture
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import {
  EcosystemHero,
  EcosystemPillars,
  EcosystemBenefits,
  EcosystemSync,
  EcosystemCTA,
} from '@/components/ecosystem';
import { ecosystemData } from '@/data/ecosystem';

const product = ecosystemData.whiteLabel;

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

export default async function WhiteLabelPage() {
  const lang = await getLang();

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      {/* ── Official Public Website Header ───────────────────────── */}
      <PageJsonLd path="/white-label" lang={lang} />
      <Header lang={lang} />

      {/* ── Section A: Hero ───────────────────────────────────────── */}
      <EcosystemHero product={product} lang={lang} />

      {/* ── Section B: Pillars ────────────────────────────────────── */}
      <EcosystemPillars product={product} lang={lang} />

      {/* ── Section C: Strategic Benefits ─────────────────────────── */}
      <EcosystemBenefits product={product} lang={lang} />

      {/* ── Section D: Architecture Sync ──────────────────────────── */}
      <EcosystemSync product={product} lang={lang} />

      {/* ── Section E: Final CTA ──────────────────────────────────── */}
      <EcosystemCTA product={product} lang={lang} />

      {/* ── Official Public Website Footer ───────────────────────── */}
      <Footer lang={lang} />
    </div>
  );
}

