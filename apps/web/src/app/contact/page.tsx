/**
 * RASHX Contact Page
 *
 * Dedicated Route: /contact
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Audience: Salon owners, beauty center decision-makers, and business partners in Saudi Arabia.
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import {
  ContactHero,
  ContactTopics,
  ContactForm,
  DirectContact,
  ContactCTA,
} from '@/components/contact';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'تواصل معنا | RASHX — نحن هنا لمساعدتك على اتخاذ الخطوة التالية'
      : "Contact Us | RASHX — We're Here to Help You Take the Next Step",
    description: isAr
      ? 'تواصل مع فريق راش إكس (RASHX). سواء كنت ترغب في التعرف على المنظومة السحابية أو لديك استفسار تشغيلي، يسعدنا التواصل معك مباشرة عبر الهاتف والمنصات المعتمدة.'
      : "Connect with the RASHX team. Whether you want to explore our cloud platform or have operational inquiries, we'd be happy to hear from you directly through our verified channels.",
    path: '/contact',
    lang,
  });
}

export default async function ContactPage() {
  const lang = await getLang();

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      {/* ── Official Public Website Header ───────────────────────── */}
      <PageJsonLd path="/contact" lang={lang} />
      <Header lang={lang} />

      {/* ── Section A: Contact Hero ───────────────────────────────── */}
      <ContactHero lang={lang} />

      {/* ── Section D: What Can We Help You With? ─────────────────── */}
      <ContactTopics lang={lang} />

      {/* ── Section B: Direct Contact Form ────────────────────────── */}
      <ContactForm lang={lang} />

      {/* ── Section C: Verified Direct Contact ────────────────────── */}
      <DirectContact lang={lang} />

      {/* ── Section E: Final Call To Action ────────────────────────── */}
      <ContactCTA lang={lang} />

      {/* ── Official Public Website Footer ───────────────────────── */}
      <Footer lang={lang} />
    </div>
  );
}

