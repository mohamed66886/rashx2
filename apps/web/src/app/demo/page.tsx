/**
 * RASHX Live Demo Request Page
 *
 * Dedicated Route: /demo
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Interactive walkthrough scheduling for salon and spa owners in Saudi Arabia.
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import {
  DemoHero,
  DemoHighlights,
  DemoForm,
  DemoCTA,
} from '@/components/demo';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'طلب عرض حي | RASHX — شاهد منظومة إدارة الصالونات المتكاملة قيد التشغيل'
      : 'Schedule a Live Demo | RASHX — See the Unified Salon Management Platform in Action',
    description: isAr
      ? 'احجز جلسة حية تفاعلية مدتها 25 دقيقة لاستعراض تجربة العميل ولوحة الإدارة وتطبيق مقدم الخدمة ونقاط البيع المتوافقة مع متطلبات الزكاة والضريبة (ZATCA).'
      : 'Schedule a 25-minute interactive walkthrough of RASHX customer experience, management dashboard, specialist app, and ZATCA-compliant POS.',
    path: '/demo',
    lang,
  });
}

export default async function DemoPage() {
  const lang = await getLang();

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/demo" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <DemoHero lang={lang} />
        <DemoHighlights lang={lang} />
        <DemoForm lang={lang} />
        <DemoCTA lang={lang} />
      </div>

      <Footer lang={lang} />
    </div>
  );
}

