/**
 * RASHX Team Page
 *
 * Dedicated Route: /team
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Professional overview of the RASHX engineering and operations team.
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
      ? 'فريق العمل | RASHX — كفاءات تقنية وتشغيلية مكرسة لخدمتكم'
      : 'Our Team | RASHX — Dedicated Engineering & Operational Specialists',
    description: isAr
      ? 'تعرف على الكفاءات الهندسية والاستشارية القائمة على تطوير وتشغيل منظومة راش إكس لخدمة الصالونات في المملكة.'
      : 'Meet the engineering and salon operations team powering RASHX across Saudi Arabia.',
    path: '/team',
    lang,
  });
}

export default async function TeamPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const founderHref = (isAr ? routes.founder.index : `${routes.founder.index}?lang=en`) as Route;

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
                eyebrow={isAr ? 'الكفاءات والخبرات' : 'RASHX TEAM'}
                title={
                  isAr
                    ? 'كفاءات هندسية وتشغيلية تقود التحول الرقمي للصالونات'
                    : 'Engineering & Operational Talent Digitizing Beauty Facilities'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'يجمع فريقنا بين الخبرة العميقة في هندسة البرمجيات السحابية والامتثال الضريبي (ZATCA)، والفهم الواقعي لأدق تفاصيل تشغيل الصالونات اليومية.'
                  : 'Our team blends deep distributed cloud architecture and ZATCA compliance expertise with practical salon operations fluency.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl space-y-8">
              {/* Founder Spotlight */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-bold text-[#C78360] uppercase mb-1">
                    {isAr ? 'القيادة والتأسيس' : 'Executive Leadership'}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-2">
                    {isAr ? 'م. محمد عبده رشاد البهي' : 'Eng. Mohamed Abdo Rashad El-Bahy'}
                  </h2>
                  <p className="text-sm text-[#75645B] leading-relaxed max-w-lg">
                    {isAr
                      ? 'مؤسس المنظومة ومهندس البنية السحابية لـ RASHX، قاد رؤية المنصة لتوحيد تشغيل الصالونات تحت مظلة رقمية موحدة.'
                      : 'Founder and chief cloud architect of RASHX, driving the unified platform vision for the Saudi beauty industry.'}
                  </p>
                </div>

                <Link
                  href={founderHref}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#54453D] hover:bg-[#F0C5AE]/30 transition-colors duration-200"
                >
                  <span>{isAr ? 'الملف الشخصي للمؤسس' : 'Founder Profile'}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {/* Department Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="rounded-2xl bg-[#FAF9F8] p-6">
                  <div className="text-sm font-bold text-[#54453D] mb-1">{isAr ? 'فريق الهندسة السحابية' : 'Cloud Architecture'}</div>
                  <div className="text-xs text-[#75645B]">{isAr ? 'تطوير وتحديث المنظومة وضمان الجاهزية 99.9%' : 'Microservices & high-availability uptime'}</div>
                </div>
                <div className="rounded-2xl bg-[#FAF9F8] p-6">
                  <div className="text-sm font-bold text-[#54453D] mb-1">{isAr ? 'فريق الامتثال وZATCA' : 'ZATCA Compliance'}</div>
                  <div className="text-xs text-[#75645B]">{isAr ? 'متابعة المتطلبات الضريبية والربط المعتمد' : 'Continuous fiscal alignment & clearance'}</div>
                </div>
                <div className="rounded-2xl bg-[#FAF9F8] p-6">
                  <div className="text-sm font-bold text-[#54453D] mb-1">{isAr ? 'نجاح العملاء والتهيئة' : 'Customer Success'}</div>
                  <div className="text-xs text-[#75645B]">{isAr ? 'تدريب الكوادر وترحيل البيانات والدعم الفني' : 'Specialist training & seamless data migration'}</div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
