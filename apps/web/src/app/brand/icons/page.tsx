/**
 * RASHX Brand Center: Iconography System
 * Dedicated Route: /brand/icons
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Calendar,
  Users,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Layers,
  Activity,
  Compass,
} from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'منظومة الأيقونات الرسمية | RASHX Iconography'
      : 'Official Iconography System | RASHX Brand',
    description: isAr
      ? 'قواعد رسم وتطبيق أيقونات راش إكس: شبكة 24x24، سمك الخط المتناسق، ونظافة المسارات الهندسية.'
      : 'Vector iconography standards, 24x24 grid alignment, stroke weighting, and corner radii rules on RASHX.',
    path: '/brand/icons',
    lang,
  });
}

export default async function BrandIconsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const icons = [
    { name: isAr ? 'التقويم والمواعيد' : 'Calendar & Schedule', icon: Calendar },
    { name: isAr ? 'العملاء والكوادر' : 'Customers & Staff', icon: Users },
    { name: isAr ? 'المبيعات ونقاط البيع' : 'Sales & POS', icon: ShoppingBag },
    { name: isAr ? 'الولاء والمكافآت' : 'Loyalty & Rewards', icon: Sparkles },
    { name: isAr ? 'الأمان والامتثال' : 'Security & Trust', icon: ShieldCheck },
    { name: isAr ? 'المدفوعات والفوترة' : 'Billing & Cards', icon: CreditCard },
    { name: isAr ? 'الأنظمة والطبقات' : 'Ecosystem & Layers', icon: Layers },
    { name: isAr ? 'الأداء والنشاط' : 'Telemetry & Activity', icon: Activity },
    { name: isAr ? 'الاستكشاف والتوجيه' : 'Directory & Explore', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <SectionTitle
                title={isAr ? 'منظومة الأيقونات الرسمية' : 'Official Iconography System'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'أيقونات خطية دقيقة مبنية على شبكة 24×24 بكسل مع زوايا ناعمة وتناسق بصري تام'
                  : 'Minimalist line icons mapped to a 24x24 grid with optical consistency and soft radii'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3">
              {icons.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex flex-col items-center justify-center rounded-2xl bg-[#FAF9F8] p-8 text-center transition-colors duration-200"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#54453D] text-white">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="mt-4 text-sm font-bold text-[#54453D]">{item.name}</span>
                    <span className="mt-1 text-xs text-[#54453D]/60">24x24px · 1.75px stroke</span>
                  </div>
                );
              })}
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

