/**
 * RASHX Solution: POS (Point of Sale)
 * Dedicated Route: /solutions/pos
 * Maps directly to the unified Sales & POS operational module.
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
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
  return generatePageMetadata({
    title: solution.seo.title[lang],
    description: solution.seo.description[lang],
    path: '/solutions/pos',
    lang,
  });
}

export default async function POSSolutionPage() {
  const lang = await getLang();

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/solutions/pos" lang={lang} />
      <Header lang={lang} />
      <div id="page-content">
        <SolutionHero solution={solution} lang={lang} />
        <SolutionCapabilities solution={solution} lang={lang} />
        <SolutionImpact solution={solution} lang={lang} />
        <SolutionEcosystem solution={solution} lang={lang} />
        <SolutionCTA solution={solution} lang={lang} />
      </div>
      <Footer lang={lang} />
    </div>
  );
}

