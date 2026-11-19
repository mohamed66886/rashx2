/**
 * RASHX Story Page
 *
 * Dedicated Route: /story
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: The founding story and journey of RASHX.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'قصة راش إكس | RASHX — رحلة رقمنة وتطوير قطاع الجمال والعناية'
      : 'The Story of RASHX | Transforming Beauty & Spa Operations',
    description: isAr
      ? 'تعرف على قصة تأسيس RASHX عام 2026 برؤية المهندس محمد عبده رشاد البهي لبناء منظومة برمجية توحد إدارة الصالونات وتطور تجربة العملاء.'
      : 'Discover the founding journey of RASHX in 2026, conceived by Eng. Mohamed Abdo Rashad El-Bahy to unify salon operations and elevate client experiences.',
    path: '/story',
    lang,
  });
}

export default async function StoryPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const aboutHref = (isAr ? routes.about : `${routes.about}?lang=en`) as Route;
  const platformHref = (isAr ? routes.platform : `${routes.platform}?lang=en`) as Route;

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <Header lang={lang} />

      <main id="main-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                as="h1"
                eyebrow={isAr ? 'قصة التأسيس والبداية' : 'OUR ORIGIN STORY'}
                title={
                  isAr
                    ? 'كيف بدأت فكرة RASHX وما الذي نسعى لتحقيقه؟'
                    : 'The Genesis of RASHX & Our Mission for Beauty Tech'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'انطلقت RASHX من ملاحظة بسيطة: قطاع الجمال والعناية في السعودية ينمو بسرعة استثنائية، لكن أدوات الإدارة لا تزال مجزأة وبدائية. هنا بدأنا بناء منظومة موحدة.'
                  : 'RASHX was born from an insight: the beauty sector is expanding rapidly in Saudi Arabia, yet operational tools remained fragmented and manual.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-10 leading-relaxed text-sm sm:text-base text-[#75645B]">
                <h2 className="text-xl font-bold text-[#54453D] mb-4">
                  {isAr ? 'الانتقال من الفوضى إلى التنظيم المؤتمت' : 'Transitioning from Friction to Harmony'}
                </h2>
                <p className="mb-4">
                  {isAr
                    ? 'تأسست المنصة عام 2026 على يد المهندس محمد عبده رشاد البهي بهدف إحداث نقلة نوعية في طريقة تشغيل الصالونات، وربط كافة العمليات اليومية من أول لحظة حجز العميل وحتى صدور الفاتورة الضريبية وتقارير الأرباح.'
                    : 'Founded in 2026 by Eng. Mohamed Abdo Rashad El-Bahy, RASHX bridges the gap between client booking and back-office accounting with end-to-end cloud automation.'}
                </p>
                <p>
                  {isAr
                    ? 'واليوم تمثل RASHX شريك التحول الرقمي المعتمد للمنشآت الطموحة الراغبة في التوسع وبناء هوية تجارية قوية تدوم.'
                    : 'Today, RASHX stands as the trusted operating partner for forward-looking salons scaling their brand equity.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={aboutHref}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                >
                  <span>{isAr ? 'عن راش إكس وفريقنا' : 'About RASHX Company'}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  href={platformHref}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#FAF9F8] px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30"
                >
                  <span>{isAr ? 'استكشف البنية السحابية' : 'Explore Cloud Platform'}</span>
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
