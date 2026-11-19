/**
 * RASHX Brand Center: English Wordmark Specifications
 * Dedicated Route: /brand/logo/english
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { RashxWordmark } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'مواصفات الشعار اللفظي الإنجليزي | RASHX English Wordmark'
      : 'English Wordmark Specifications | RASHX Brand',
    description: isAr
      ? 'الأبعاد الهندسية والنسب البصرية لكلمة RASHX بحروفها الكبيرة والمسافات البينية المعتمدة.'
      : 'Visual proportions, letter-spacing, and geometric metrics of the uppercase Latin RASHX wordmark.',
    path: '/brand/logo/english',
    lang,
  });
}

export default async function EnglishWordmarkPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const specs = isAr
    ? [
        { label: 'حالة الأحرف', value: 'أحرف كبيرة حصراً (Uppercase: RASHX)' },
        { label: 'التباعد البيني (Kerning)', value: 'تباعد بصري دقيق يضمن توازناً هندسياً تاماً' },
        { label: 'اللون المعتمد', value: 'حبر راش إكس الأساسي (#54453D) أو الأبيض النقي (#FFFFFF)' },
        { label: 'الحد الأدنى للارتفاع', value: '14 بكسل للشاشات الرقمية / 5 مم للمطبوعات' },
      ]
    : [
        { label: 'Letter Case', value: 'Strictly Uppercase (RASHX)' },
        { label: 'Optical Kerning', value: 'Engineered optical spacing ensuring structural harmony' },
        { label: 'Primary Palette', value: 'Core Brand Ink (#54453D) or Pure White (#FFFFFF)' },
        { label: 'Minimum Height', value: '14px on digital screens / 5mm in print' },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <Header lang={lang} />

      <main id="main-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <SectionTitle
                title={isAr ? 'مواصفات الشعار اللفظي الإنجليزي' : 'English Wordmark Specifications'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'الهندسة البصرية لكلمة RASHX وقواعد التباعد والتموضع'
                  : 'Geometric metrics and optical spacing for the uppercase Latin RASHX mark'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="flex h-48 items-center justify-center rounded-3xl bg-[#FAF9F8] p-8">
                <RashxWordmark height={40} color="ink" />
              </div>

              <div className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8">
                <h3 className="text-base font-bold text-[#54453D]">
                  {isAr ? 'المعايير الهندسية والقياسات' : 'Construction Parameters'}
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
      </main>

      <Footer lang={lang} />
    </div>
  );
}

