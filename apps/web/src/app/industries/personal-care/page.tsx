/**
 * RASHX Industry: Personal Care & Nail Bars
 * Dedicated Route: /industries/personal-care
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import {
  IndustryHero,
  IndustryChallenges,
  IndustrySolutions,
  IndustryFeatures,
  IndustryCTA,
} from '@/components/industries';
import { industriesData } from '@/data/industries';

const industry = industriesData.personalCare;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return generatePageMetadata({
    title: industry.seo.title[lang],
    description: industry.seo.description[lang],
    path: industry.path,
    lang,
  });
}

export default async function PersonalCarePage() {
  const lang = await getLang();

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/industries/personal-care" lang={lang} />
      <Header lang={lang} />
      <div id="page-content">
        <IndustryHero industry={industry} lang={lang} />
        <IndustryChallenges industry={industry} lang={lang} />
        <IndustrySolutions industry={industry} lang={lang} />
        <IndustryFeatures industry={industry} lang={lang} />
        <IndustryCTA industry={industry} lang={lang} />
      </div>
      <Footer lang={lang} />
    </div>
  );
}

