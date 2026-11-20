/**
 * RASHX Brand Center: Typography Standards
 * Dedicated Route: /brand/typography
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'قواعد ونظم الخطوط الرسمية | RASHX Typography Standards'
      : 'Official Typography Standards | RASHX Brand',
    description: isAr
      ? 'دليل الخطوط الرسمية لراش إكس: Ping AR + LT، مقاييس الخطوط، أوزان النصوص، وارتفاعات الأسطر المتناسقة.'
      : 'Bilingual typography scale, Ping AR + LT font pairings, typographic hierarchy, and leading ratios on RASHX.',
    path: '/brand/typography',
    lang,
  });
}

export default async function BrandTypographyPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const typeScale = [
    { tag: 'Display (h1)', size: '48px - 60px', weight: 'Black / ExtraBold', sample: isAr ? 'راش إكس لتقنية المعلومات' : 'RASHX Cloud Platform' },
    { tag: 'Heading (h2)', size: '30px - 36px', weight: 'Bold (700)', sample: isAr ? 'منظومة إدارة الصالونات الذكية' : 'Intelligent Salon Architecture' },
    { tag: 'Subheading (h3)', size: '20px - 24px', weight: 'SemiBold (600)', sample: isAr ? 'إدارة المبيعات والحجوزات والمخزون' : 'Sales, Booking & Workforce Ops' },
    { tag: 'Body Large', size: '18px', weight: 'Regular (400) / Medium (500)', sample: isAr ? 'واجهة إلكترونية احترافية تعرض المنشأة وخدماتها.' : 'Bespoke web experiences customized for your brand.' },
    { tag: 'Body Regular', size: '14px - 16px', weight: 'Regular (400)', sample: isAr ? 'تدعم المنظومة متطلبات الفوترة الضريبية ZATCA المرحلة الثانية.' : 'Native compliance with ZATCA Phase 2 e-invoicing.' },
    { tag: 'Caption / Badge', size: '11px - 13px', weight: 'Bold / SemiBold', sample: isAr ? 'المملكة العربية السعودية · 2026' : 'KINGDOM OF SAUDI ARABIA · 2026' },
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
                title={isAr ? 'قواعد ونظم الخطوط الرسمية' : 'Official Typography Standards'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'خطوط Ping AR + LT المعتمدة لتوفير أعلى درجات الوضوح والراحة البصرية باللغتين'
                  : 'Harmonized Ping AR + LT type hierarchy delivering effortless clarity across Arabic and English'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="space-y-6">
              {typeScale.map((item) => (
                <div
                  key={item.tag}
                  className="flex flex-col justify-between gap-4 rounded-2xl bg-[#FAF9F8] p-6 sm:flex-row sm:items-center sm:p-8 transition-colors duration-200"
                >
                  <div className="sm:w-1/3">
                    <span className="text-xs font-bold text-[#54453D]/60">{item.tag}</span>
                    <p className="text-xs text-[#54453D]/80">
                      {item.size} · {item.weight}
                    </p>
                  </div>
                  <div className="sm:w-2/3">
                    <p className="text-base font-medium text-[#54453D] sm:text-xl">{item.sample}</p>
                  </div>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

