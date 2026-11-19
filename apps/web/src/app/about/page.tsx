/**
 * RASHX About Us Page
 *
 * Dedicated Route: /about
 * Visual Direction: Absolute Flat, Clean, Borderless & Shadowless Architecture
 * Audience: Salon & Beauty Center Owners, Operational Managers, and Decision Makers in Saudi Arabia.
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import {
  AboutHero,
  WhoWeAre,
  OurStory,
  VisionMission,
  OurValues,
  OurFocus,
  AboutCTA,
} from '@/components/about';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'من نحن | RASHX — نبني تجربة رقمية أكثر تكاملًا لقطاع الجمال'
      : 'About Us | RASHX — Building a More Connected Digital Experience for Beauty',
    description: isAr
      ? 'تعرف على راش إكس (RASHX): منظومة برمجية سعودية متخصصة في إدارة وتشغيل صالونات ومراكز التجميل والسبا، تأسست عام 2026 على يد المهندس محمد عبده رشاد البهي.'
      : 'Learn about RASHX: a specialized Saudi SaaS operating system for beauty salons, aesthetic centers, and spas, founded in 2026 by Eng. Mohamed Abdo Rashad El-Bahy.',
    path: '/about',
    lang,
  });
}

export default async function AboutPage() {
  const lang = await getLang();

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      {/* ── Official Public Website Header ───────────────────────── */}
      <Header lang={lang} />

      {/* ── Section A: About Hero ─────────────────────────────────── */}
      <AboutHero lang={lang} />

      {/* ── Section B: Who We Are ─────────────────────────────────── */}
      <WhoWeAre lang={lang} />

      {/* ── Section C: Our Story ──────────────────────────────────── */}
      <OurStory lang={lang} />

      {/* ── Sections D & E: Vision & Mission ──────────────────────── */}
      <VisionMission lang={lang} />

      {/* ── Section F: Our Values ─────────────────────────────────── */}
      <OurValues lang={lang} />

      {/* ── Section G: Our Focus ──────────────────────────────────── */}
      <OurFocus lang={lang} />

      {/* ── Section H: Final Call To Action ────────────────────────── */}
      <AboutCTA lang={lang} />

      {/* ── Official Public Website Footer ───────────────────────── */}
      <Footer lang={lang} />
    </div>
  );
}

