/**
 * RASHX Brand Center: Official Monogram Design
 * Dedicated Route: /brand/logo/monogram
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { RashxMonogram } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'مونوغرام راش إكس الرسمي | RASHX Monogram'
      : 'Official Monogram Specifications | RASHX Brand',
    description: isAr
      ? 'المواصفات الفنية لمونوغرام راش إكس وتطبيقاته في شاشات الجوال وأيقونات البرامج.'
      : 'Technical construction, stroke metrics, and responsive scaling parameters for the official RASHX monogram.',
    path: '/brand/logo/monogram',
    lang,
  });
}

export default async function BrandMonogramPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const specs = isAr
    ? [
        { label: 'الهيكل البصري', value: 'دمج هندسي متوازن لحرفي الراء و R بحواف نظيفة وزوايا دقيقة' },
        { label: 'الاستخدام النموذجي', value: 'أيقونات تطبيقات الهواتف الذكية (iOS & Android)، وصور الملفات الشخصية' },
        { label: 'ألوان الخلفية المفضلة', value: 'خلفية كريمية ناعمة (#FAF9F8) أو حبر داكن (#54453D)' },
        { label: 'المقياس الأصغر', value: '24x24 بكسل' },
      ]
    : [
        { label: 'Topological Form', value: 'Integrated lockup of R letterform engineered with clean angular edges' },
        { label: 'Deployment Domain', value: 'Native mobile app icons (iOS/Android), avatar badges, and tokens' },
        { label: 'Canvas Background', value: 'Soft Cream (#FAF9F8) or Primary Ink (#54453D)' },
        { label: 'Minimum Bounding Box', value: '24x24px' },
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
                title={isAr ? 'مونوغرام راش إكس الرسمي' : 'Official RASHX Monogram'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'الشكل البصري المدمج المخصص لتطبيقات الهواتف والبيئات الرقمية المصغرة'
                  : 'Compact identity mark optimized for mobile operating surfaces and responsive badges'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="flex h-56 items-center justify-center rounded-3xl bg-[#FAF9F8] p-8">
                <RashxMonogram size={88} color="ink" />
              </div>

              <div className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8">
                <h3 className="text-base font-bold text-[#54453D]">
                  {isAr ? 'المعايير الهندسية' : 'Monogram Specifications'}
                </h3>
                <dl className="mt-6 divide-y divide-transparent space-y-4">
                  {specs.map((item) => (
                    <div key={item.label} className="flex flex-col sm:flex-row sm:justify-between py-2">
                      <dt className="text-sm font-semibold text-[#54453D]/70">{item.label}</dt>
                      <dd className="text-sm font-bold text-[#54453D]">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

