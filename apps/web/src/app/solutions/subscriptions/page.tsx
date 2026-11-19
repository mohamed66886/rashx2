/**
 * RASHX Solution: Subscriptions & Loyalty Memberships
 * Dedicated Route: /solutions/subscriptions
 */

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

const solution = solutionsData.loyalty;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return generatePageMetadata({
    title: solution.seo.title[lang],
    description: solution.seo.description[lang],
    path: '/solutions/subscriptions',
    lang,
  });
}

export default async function SubscriptionsSolutionPage() {
  const lang = await getLang();

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <Header lang={lang} />
      <main id="main-content">
        <SolutionHero solution={solution} lang={lang} />
        <SolutionCapabilities solution={solution} lang={lang} />
        <SolutionImpact solution={solution} lang={lang} />
        <SolutionEcosystem solution={solution} lang={lang} />
        <SolutionCTA solution={solution} lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}

