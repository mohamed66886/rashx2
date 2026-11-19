/**
 * RASHX Pricing & Plans Page
 *
 * Dedicated Route: /pricing
 * Visual Direction: Absolute Flat, Clean, Borderless & Shadowless Architecture
 * Audience: Salon & Beauty Center Owners, Operational Managers, and Decision Makers in Saudi Arabia.
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import {
  PricingHero,
  PricingPlans,
  PlanComparison,
  PricingFAQ,
  PricingCTA,
} from '@/components/pricing';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'باقات الاشتراك والتسعير للصالونات ومراكز التجميل | RASHX'
      : 'Pricing & Subscription Plans for Salons & Spas | RASHX',
    description: isAr
      ? 'تعرف على باقات الاشتراك المتاحة في راش إكس (RASHX) لإدارة الصالونات ومراكز التجميل والسبا في السعودية: تسعير مخصص، شامل الفوترة الإلكترونية، وإعداد متكامل.'
      : 'Explore subscription tiers for RASHX salon & spa operating system in Saudi Arabia: custom pricing tailored to your scale, full ZATCA compliance, and dedicated onboarding.',
    path: '/pricing',
    lang,
  });
}

export default async function PricingPage() {
  const lang = await getLang();

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      {/* ── Official Public Website Header ───────────────────────── */}
      <Header lang={lang} />

      {/* ── Section A: Pricing Hero ────────────────────────────────── */}
      <PricingHero lang={lang} />

      {/* ── Section B: Verified Pricing Plans ───────────────────────── */}
      <PricingPlans lang={lang} />

      {/* ── Section C: Plan Capability Comparison ──────────────────── */}
      <PlanComparison lang={lang} />

      {/* ── Section D: Frequently Asked Questions ──────────────────── */}
      <PricingFAQ lang={lang} />

      {/* ── Section E: Final Call To Action ────────────────────────── */}
      <PricingCTA lang={lang} />

      {/* ── Official Public Website Footer ───────────────────────── */}
      <Footer lang={lang} />
    </div>
  );
}

