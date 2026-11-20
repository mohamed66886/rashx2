/**
 * RASHX Vision Page
 *
 * Dedicated Route: /vision
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Strategic vision for beauty industry digitization in Saudi Arabia.
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Target, Compass, ArrowLeft, ArrowRight } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'رؤيتنا ورسالتنا | RASHX — مستقبل الإدارة الذكية لقطاع التجميل'
      : 'Our Vision & Mission | RASHX — The Future of Smart Salon Operations',
    description: isAr
      ? 'رؤية RASHX الاستراتيجية في تمكين الصالونات ومراكز التجميل من التحول الرقمي الكامل، ورفع الكفاءة التشغيلية، وزيادة الإيرادات.'
      : 'RASHX strategic vision: empowering beauty centers with end-to-end digital transformation, operational efficiency, and revenue growth.',
    path: '/vision',
    lang,
  });
}

export default async function VisionPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const aboutHref = (isAr ? routes.about : `${routes.about}?lang=en`) as Route;

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/vision" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                as="h1"
                eyebrow={isAr ? 'الرؤية والرسالة' : 'OUR VISION & MISSION'}
                title={
                  isAr
                    ? 'بناء البنية الرقمية الأكثر تكاملاً ومرونة لقطاع الجمال'
                    : 'Architecting the Most Unified Digital Platform for Beauty'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'نهدف إلى تحويل كل صالون ومركز تجميل في المملكة إلى منشأة ذكية تدار بلمسة زر، وتقدم تجربة استثنائية لعملائها وفق أعلى المعايير العالمية.'
                  : 'We strive to empower every salon and spa into an agile, highly automated business delivering world-class client journeys.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="rounded-3xl bg-[#FAF9F8] p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0C5AE]/40 text-[#54453D] mb-5">
                  <Compass className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-[#54453D] mb-3">
                  {isAr ? 'رؤيتنا' : 'Our Vision'}
                </h2>
                <p className="text-sm leading-relaxed text-[#75645B]">
                  {isAr
                    ? 'أن تكون RASHX المنظومة التشغيلية السحابية الأولى والأكثر ثقة لصالونات التجميل والسبا في المملكة العربية السعودية والشرق الأوسط.'
                    : 'To be the undisputed, most trusted cloud operating ecosystem for beauty centers and spas across Saudi Arabia and the MENA region.'}
                </p>
              </div>

              <div className="rounded-3xl bg-[#FAF9F8] p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#91B8C0]/30 text-[#2C4349] mb-5">
                  <Target className="h-6 w-6 text-[#2C4349]" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-[#54453D] mb-3">
                  {isAr ? 'رسالتنا' : 'Our Mission'}
                </h2>
                <p className="text-sm leading-relaxed text-[#75645B]">
                  {isAr
                    ? 'تمكين أصحاب المنشآت من التحكم الكامل بإدارة أعمالهم ورفع مستوى جودة الخدمات ومضاعفة الإيرادات من خلال حلول تقنية موحدة وسهلة الاستخدام.'
                    : 'Empower salon founders with complete operational governance, elevating service quality and maximizing recurring profitability via unified software.'}
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href={aboutHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
              >
                <span>{isAr ? 'العودة لصفحة من نحن' : 'Return to About Us'}</span>
                <ArrowIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

