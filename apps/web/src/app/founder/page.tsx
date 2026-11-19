/**
 * RASHX Founder & Leadership Page
 *
 * Dedicated Route: /founder
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Source of Truth: Verified project data (Eng. Mohamed Abdo Rashad El-Bahy, Founded 2026).
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, Compass } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'مؤسس المنظومة: م. محمد عبده رشاد البهي | RASHX'
      : 'Founder: Eng. Mohamed Abdo Rashad El-Bahy | RASHX',
    description: isAr
      ? 'تعرف على رؤية مؤسس RASHX المهندس محمد عبده رشاد البهي في رقمنة وتطوير قطاع الصالونات ومراكز التجميل والسبا في المملكة العربية السعودية.'
      : 'Learn about the vision of RASHX founder Eng. Mohamed Abdo Rashad El-Bahy in digitizing the salon, beauty, and spa industry in Saudi Arabia.',
    path: '/founder',
    lang,
  });
}

export default async function FounderPage() {
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
                eyebrow={isAr ? 'القيادة والرؤية' : 'LEADERSHIP & VISION'}
                title={
                  isAr
                    ? 'المؤسس: م. محمد عبده رشاد البهي'
                    : 'Founder: Eng. Mohamed Abdo Rashad El-Bahy'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'تأسست RASHX عام 2026 برؤية تهدف إلى بناء منظومة تقنية متخصصة في رقمنة قطاع التجميل، وتوفير بنية تشغيلية متطورة وقابلة للتوسع تلبي احتياجات المنشآت الصغيرة والمتوسطة والكبيرة.'
                  : 'Founded in 2026 with a dedicated vision to digitize the beauty and spa sector, delivering a scalable cloud architecture that powers boutique salons, premier centers, and enterprise chains.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
              {/* Vision Card */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0C5AE]/40 text-[#54453D] mb-6">
                  <Compass className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-4">
                  {isAr ? 'فلسفة التطوير في RASHX' : 'The Engineering Philosophy of RASHX'}
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-[#75645B] mb-4">
                  {isAr
                    ? 'انطلقت راش إكس لتجاوز مفهوم «البرامج التقليدية» إلى بناء منظومة رقمية متكاملة تمنح كل صالون هويته المستقلة ونطاقه الفرعي الخاص، مع ربط دقيق بين إدارة الموارد البشرية، ونقاط البيع، والفوترة الإلكترونية، وتجربة العميل.'
                    : 'RASHX was conceived to move beyond rudimentary point solutions into an interconnected operating system providing private subdomain websites, staff apps, and ZATCA compliance.'}
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-[#75645B]">
                  {isAr
                    ? 'الهدف الأسمى هو تمكين أصحاب المنشآت من التحكم الكامل بأعمالهم ورفع هوامش أرباحهم عبر أدوات ذكية مبنية على أسس برمجية صلبة ومعايير أمنية صارمة.'
                    : 'The ultimate objective is empowering salon founders with total operational command, enhanced profitability, and robust data isolation.'}
                </p>
              </div>

              {/* Verified Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-[#FAF9F8] p-6 text-center">
                  <div className="text-xs font-bold text-[#75645B] mb-1">{isAr ? 'سنة التأسيس' : 'Founded'}</div>
                  <div className="text-2xl font-black text-[#54453D]">2026</div>
                </div>
                <div className="rounded-2xl bg-[#FAF9F8] p-6 text-center">
                  <div className="text-xs font-bold text-[#75645B] mb-1">{isAr ? 'المقر' : 'Location'}</div>
                  <div className="text-xl font-black text-[#54453D]">{isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'}</div>
                </div>
                <div className="rounded-2xl bg-[#FAF9F8] p-6 text-center">
                  <div className="text-xs font-bold text-[#75645B] mb-1">{isAr ? 'الموقع الرسمي' : 'Official Portal'}</div>
                  <div className="text-base font-black text-[#54453D]" dir="ltr">https://rashx.org</div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={aboutHref}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                >
                  <span>{isAr ? 'تعرف على قصة راش إكس' : 'Explore About RASHX'}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  href={platformHref}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#FAF9F8] px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30"
                >
                  <span>{isAr ? 'استكشف البنية التقنية' : 'Explore Cloud Platform'}</span>
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
