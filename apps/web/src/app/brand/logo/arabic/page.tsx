/**
 * RASHX Brand Center: Arabic Wordmark Specifications
 * Dedicated Route: /brand/logo/arabic
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { RashxLockupBilingual } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'مواصفات الشعار اللفظي العربي | RASHX Arabic Wordmark'
      : 'Arabic Wordmark Specifications | RASHX Brand',
    description: isAr
      ? 'الدليل الهندسي لرسم وتركيب كلمة (راش إكس) في الشعار الرسمي ونسبها وخط الأساس المعتمد.'
      : 'Geometrical anatomy, baseline alignment, and typographical construction of the Arabic RASHX wordmark.',
    path: '/brand/logo/arabic',
    lang,
  });
}

export default async function ArabicWordmarkPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const specs = isAr
    ? [
        { label: 'الرسم الخطي', value: 'تصميم هندسي مخصص مشتق من الخط الكوفي الهندسي المعاصر' },
        { label: 'خط الأساس (Baseline)', value: 'محاذاة كاملة مع خط الأساس للشعار الإنجليزي المقابل' },
        { label: 'المسافة الآمنة', value: 'ما لا يقل عن نصف ارتفاع حرف الراء (0.5X) في جميع الاتجاهات' },
        { label: 'الحد الأدنى للارتفاع', value: '18 بكسل للشاشات الرقمية / 6 مم للمطبوعات' },
      ]
    : [
        { label: 'Letterform Design', value: 'Bespoke geometric typography rooted in modern Kufic architecture' },
        { label: 'Baseline Alignment', value: 'Strict optical alignment with Latin baseline' },
        { label: 'Clearance Margin', value: 'Minimum of 0.5X clearspace across all boundaries' },
        { label: 'Minimum Height', value: '18px on digital screens / 6mm in print media' },
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
                title={isAr ? 'مواصفات الشعار اللفظي العربي' : 'Arabic Wordmark Specifications'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'الهندسة البصرية لكلمة «راش إكس» وقواعد تطبيقها السليم'
                  : 'Typographical anatomy and geometric rendering of the Arabic RASHX wordmark'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="flex h-48 items-center justify-center rounded-3xl bg-[#FAF9F8] p-8">
                <RashxLockupBilingual height={60} color="ink" />
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
      </div>

      <Footer lang={lang} />
    </div>
  );
}

