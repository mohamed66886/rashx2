/**
 * RASHX Security: Tenant Isolation
 * Dedicated Route: /security/tenant-isolation
 */

import type { Metadata } from 'next';
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

const product = trustData.security;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return generatePageMetadata({
    title: product.seo.title[lang],
    description: product.seo.description[lang],
    path: '/security/tenant-isolation',
    lang,
  });
}

export default async function TenantIsolationPage() {
  const lang = await getLang();

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <Header lang={lang} />
      <main id="main-content">
        <TrustHero product={product} lang={lang} />
        <TrustPillars product={product} lang={lang} />
        <TrustImpact product={product} lang={lang} />
        <TrustRegulatory product={product} lang={lang} />
        <TrustCTA product={product} lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}

