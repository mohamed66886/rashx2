/**
 * RASHX Features Overview Page
 *
 * Dedicated Route: /features
 * Visual Direction: Absolute Flat, Clean, Borderless & Shadowless Architecture
 * Audience: Salon & Beauty Center Owners, Operational Managers, and Decision Makers in Saudi Arabia.
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import {
  FeaturesHero,
  FeatureCategories,
  DetailedFeatureShowcase,
  ConnectedWorkflow,
  BusinessControl,
  FeaturesCTA,
} from '@/components/features';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'مميزات المنصة والقدرات التشغيلية لإدارة الصالونات | RASHX'
      : 'Platform Features & Operational Salon Management Tools | RASHX',
    description: isAr
      ? 'استكشف المميزات والوظائف الفعلية لمنظومة راش إكس (RASHX): تنظيم المواعيد بدون تعارض، نقاط البيع والفوترة المبسطة، ملفات العملاء الفنية، وحساب العمولات الأوتوماتيكي.'
      : 'Discover the real operational features of RASHX: conflict-free appointment scheduling, cloud POS & simplified tax invoicing, client CRM formula archives, and automated staff commissions.',
    path: '/features',
    lang,
  });
}

export default async function FeaturesPage() {
  const lang = await getLang();

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      {/* ── Official Public Website Header ───────────────────────── */}
      <Header lang={lang} />

      {/* ── Section 1: Features Hero ──────────────────────────────── */}
      <FeaturesHero lang={lang} />

      {/* ── Section 2: Feature Categories ─────────────────────────── */}
      <FeatureCategories lang={lang} />

      {/* ── Section 3: Detailed Feature Showcase (5 Core Features) ── */}
      <DetailedFeatureShowcase lang={lang} />

      {/* ── Section 4: Connected Operational Workflow ─────────────── */}
      <ConnectedWorkflow lang={lang} />

      {/* ── Section 5: Executive Business Control ─────────────────── */}
      <BusinessControl lang={lang} />

      {/* ── Section 6: Final Call To Action ────────────────────────── */}
      <FeaturesCTA lang={lang} />

      {/* ── Official Public Website Footer ───────────────────────── */}
      <Footer lang={lang} />
    </div>
  );
}

