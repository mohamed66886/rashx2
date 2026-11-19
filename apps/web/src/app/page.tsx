/**
 * RASHX Corporate Website — Official Holding Page
 *
 * Route: / (Reserved for future corporate website)
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 *
 * For full brand identity specifications and design system inspection,
 * visit the dedicated showcase route at /brand
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import {
  Typography,
  PageContainer,
  SectionContainer,
} from '@rashx/ui';
import {
  Sparkles,
  ShieldCheck,
  Layers,
} from '@rashx/icons';
import { Header, Footer } from '@/components/layout';
import {
  Hero,
  ProblemSolution,
  PlatformFeatures,
  HowItWorks,
  WhyChooseUs,
  Testimonials,
  FAQ,
  FinalCTA,
} from '@/components/home';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: 'RASHX | راش إكس — نظام التشغيل الرقمي لقطاع التجميل والعناية',
    description:
      'راش إكس (RASHX) — نظام التشغيل والمنصة السحابية المتكاملة لإدارة صالونات التجميل، مراكز العناية، والسبا في المملكة العربية السعودية والشرق الأوسط.',
    path: '/',
  });
}

export default async function HomePage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      {/* ── Official Public Website Header ───────────────────────── */}
      <Header lang={lang} />

      {/* ── Official Homepage Hero Section ────────────────────────── */}
      <Hero lang={lang} />

      {/* ── Problem & Solution Section ────────────────────────────── */}
      <ProblemSolution lang={lang} />

      {/* ── Platform Features Section ──────────────────────────────── */}
      <PlatformFeatures lang={lang} />

      {/* ── How It Works Section ───────────────────────────────────── */}
      <HowItWorks lang={lang} />

      {/* ── Why Choose RASHX Section ───────────────────────────────── */}
      <WhyChooseUs lang={lang} />

      {/* ── Testimonials & Experience Section ──────────────────────── */}
      <Testimonials lang={lang} />

      {/* ── Frequently Asked Questions (FAQ) Section ───────────────── */}
      <FAQ lang={lang} />

      {/* ── Final Call To Action (Final CTA) Section ───────────────── */}
      <FinalCTA lang={lang} />

      {/* ── Key Architectural Pillars (Flat & Borderless) ──────────── */}
      <SectionContainer id="pillars" spacing="lg">
        <PageContainer size="full">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <Typography variant="h2" className="font-bold text-[#54453D]">
              {isAr ? 'الركائز الهندسية والتقنية للمنظومة' : 'Architectural & Technical Pillars'}
            </Typography>
            <Typography variant="body" color="muted" className="mt-2 text-[#75645B]">
              {isAr
                ? 'بنية تحتية مؤسسية حديثة مصممة لأعلى درجات الأداء والموثوقية وإمكانية الوصول.'
                : 'Modern corporate infrastructure engineered for peak performance, reliability, and accessibility.'}
            </Typography>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Pillar 1 */}
            <div className="rounded-2xl bg-[#FAF9F8] p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0C5AE] text-[#54453D]">
                <Layers className="h-6 w-6" />
              </div>
              <Typography variant="h4" className="font-bold text-[#54453D]">
                {isAr ? 'بنية مؤسسية موحدة' : 'Enterprise Monorepo'}
              </Typography>
              <Typography variant="body-sm" color="muted" className="mt-2 text-[#75645B]">
                {isAr
                  ? 'منظومة حزم مستقلة مبنية بتقنيات Next.js 15 و React 19 و TypeScript Strict، مع إدارة مركزية للحزم وتكامل صارم.'
                  : 'Isolated multi-package architecture built on Next.js 15, React 19, and TypeScript Strict with Turborepo acceleration.'}
              </Typography>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl bg-[#FAF9F8] p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#CADEE2] text-[#2C4349]">
                <Sparkles className="h-6 w-6" />
              </div>
              <Typography variant="h4" className="font-bold text-[#54453D]">
                {isAr ? 'هوية بصرية معتمدة' : 'Official Brand Identity'}
              </Typography>
              <Typography variant="body-sm" color="muted" className="mt-2 text-[#75645B]">
                {isAr
                  ? 'خط Ping AR + LT الرسمي المعتمد، رموز متجهات صافية، وتصميم مسطح خالي تماماً من الحواف والظلال التزيينية.'
                  : 'Official Ping AR + LT typography, pure vector artwork, and clean borderless & shadowless visual language.'}
              </Typography>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl bg-[#FAF9F8] p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#15803D]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <Typography variant="h4" className="font-bold text-[#54453D]">
                {isAr ? 'إمكانية وصول عالمية' : 'WCAG 2.2 Compliance'}
              </Typography>
              <Typography variant="body-sm" color="muted" className="mt-2 text-[#75645B]">
                {isAr
                  ? 'تحقيق نسب تباين تتجاوز معايير WCAG 2.2 AA و AAA لكافة عناصر الواجهة مع ملاحة كاملة عبر لوحة المفاتيح وقارئات الشاشة.'
                  : 'Verified color contrast exceeding WCAG 2.2 AA and AAA standards across all components with full keyboard and screen reader support.'}
              </Typography>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>

      {/* ── Official Public Website Footer ───────────────────────── */}
      <Footer lang={lang} />
    </div>
  );
}
