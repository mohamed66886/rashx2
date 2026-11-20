/**
 * RASHX Get Started / Onboarding Page
 *
 * Dedicated Route: /get-started
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Facility onboarding, subdomain reservation, and digital setup initiation.
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import {
  GetStartedHero,
  GetStartedSteps,
  GetStartedGuarantees,
  GetStartedForm,
  GetStartedCTA,
} from '@/components/get-started';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'بدء الاستخدام وتفعيل المنظومة | RASHX — انطلق بذكاء في إدارة صالونك'
      : 'Get Started & Activate Your Platform | RASHX — Smart Beauty Facility Management',
    description: isAr
      ? 'احجز النطاق الفرعي المستقل لصالونك وابدأ إعداد موقعك الإلكتروني، ولوحة التحكم الإدارية، ونقاط البيع المتوافقة مع متطلبات الزكاة والضريبة (ZATCA).'
      : 'Reserve your salon subdomain and initialize your website, management dashboard, and ZATCA Phase 2 compliant POS.',
    path: '/get-started',
    lang,
  });
}

export default async function GetStartedPage() {
  const lang = await getLang();

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/get-started" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <GetStartedHero lang={lang} />
        <GetStartedSteps lang={lang} />
        <GetStartedGuarantees lang={lang} />
        <GetStartedForm lang={lang} />
        <GetStartedCTA lang={lang} />
      </div>

      <Footer lang={lang} />
    </div>
  );
}

