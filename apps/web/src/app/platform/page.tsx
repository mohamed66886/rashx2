/**
 * RASHX Platform Overview Page
 *
 * Dedicated Route: /platform
 * Visual Direction: Absolute Flat, Clean, Borderless & Shadowless Architecture
 * Audience: Salon & Beauty Center Owners, Operational Managers, and Decision Makers in Saudi Arabia.
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import {
  PlatformHero,
  ConnectedEcosystem,
  CoreSystems,
  WhiteLabelSection,
  TenancySecurity,
  SaudiCompliance,
  VisionMissionGoals,
  PlatformCTA,
} from '@/components/platform';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'المنصة التقنية المتكاملة لإدارة الصالونات ومراكز التجميل | RASHX'
      : 'Complete Digital Platform for Salons & Spas | RASHX',
    description: isAr
      ? 'تعرف على منظومة راش إكس (RASHX) التقنية المتكاملة لإدارة وتشغيل الصالونات ومراكز التجميل والسبا في المملكة العربية السعودية: الأوجه الأربعة للمنظومة، 10 أنظمة إدارية وتشغيلية، التخصيص المستقل، والامتثال للفوترة الإلكترونية.'
      : 'Explore the RASHX digital operating system engineered for beauty salons, wellness centers, and spas in Saudi Arabia: the 4 core surfaces, 10 management systems, white-labeling, and full Saudi e-invoicing compliance.',
    path: '/platform',
    lang,
  });
}

export default async function PlatformPage() {
  const lang = await getLang();

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      {/* ── Official Public Website Header ───────────────────────── */}
      <PageJsonLd path="/platform" lang={lang} />
      <Header lang={lang} />

      {/* ── Section 1: Platform Introduction Hero ─────────────────── */}
      <PlatformHero lang={lang} />

      {/* ── Section 2: One Connected Ecosystem (4 Touchpoints) ───── */}
      <ConnectedEcosystem lang={lang} />

      {/* ── Section 3: Core Management Systems (10 Systems) ───────── */}
      <CoreSystems lang={lang} />

      {/* ── Section 4: White-Labeling & Brand Customization ────────── */}
      <WhiteLabelSection lang={lang} />

      {/* ── Section 5: Multi-Tenant Architecture & Enterprise Security */}
      <TenancySecurity lang={lang} />

      {/* ── Section 6: Saudi Regulatory Alignment & ZATCA E-Invoicing ─ */}
      <SaudiCompliance lang={lang} />

      {/* ── Section 7: Vision, Mission & Strategic Goals ───────────── */}
      <VisionMissionGoals lang={lang} />

      {/* ── Section 8: Final Call To Action ────────────────────────── */}
      <PlatformCTA lang={lang} />

      {/* ── Official Public Website Footer ───────────────────────── */}
      <Footer lang={lang} />
    </div>
  );
}

