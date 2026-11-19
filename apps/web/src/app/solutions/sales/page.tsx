/**
 * RASHX Solution: Sales & POS Management
 *
 * Dedicated Route: /solutions/sales
 * Visual Direction: Absolute Flat, Clean, Borderless & Shadowless Architecture
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import {
  SolutionHero,
  SolutionCapabilities,
  SolutionImpact,
  SolutionEcosystem,
  SolutionCTA,
} from '@/components/solutions';
import { solutionsData } from '@/data/solutions';

const solution = solutionsData.sales;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();

  if (!solution) {
    return {};
  }

  return generatePageMetadata({
    title: solution.seo.title[lang],
    description: solution.seo.description[lang],
    path: solution.path,
    lang,
  });
}

export default async function SalesSolutionPage() {
  const lang = await getLang();

  if (!solution) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      {/* ── Official Public Website Header ───────────────────────── */}
      <Header lang={lang} />

      {/* ── Section A: Solution Hero ──────────────────────────────── */}
      <SolutionHero solution={solution} lang={lang} />

      {/* ── Section B: Core Capabilities ──────────────────────────── */}
      <SolutionCapabilities solution={solution} lang={lang} />

      {/* ── Section C: Operational Impact ─────────────────────────── */}
      <SolutionImpact solution={solution} lang={lang} />

      {/* ── Section D: Ecosystem Integration ──────────────────────── */}
      <SolutionEcosystem solution={solution} lang={lang} />

      {/* ── Section E: Final Call To Action ────────────────────────── */}
      <SolutionCTA solution={solution} lang={lang} />

      {/* ── Official Public Website Footer ───────────────────────── */}
      <Footer lang={lang} />
    </div>
  );
}

