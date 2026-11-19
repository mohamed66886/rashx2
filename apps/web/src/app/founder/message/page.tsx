/**
 * RASHX Founder's Message Page
 *
 * Dedicated Route: /founder/message
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Founder: Eng. Mohamed Abdo Rashad El-Bahy
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, Sparkles } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'رسالة المؤسس: م. محمد عبده رشاد البهي | RASHX — رؤية رقمنة قطاع التجميل'
      : "Founder's Message: Eng. Mohamed Abdo Rashad El-Bahy | RASHX",
    description: isAr
      ? 'رسالة مؤسس راش إكس المهندس محمد عبده رشاد البهي حول إطلاق المنظومة الرقمية الذكية لتطوير إدارة وتشغيل الصالونات والسبا في المملكة.'
      : 'Founder letter by Eng. Mohamed Abdo Rashad El-Bahy sharing the founding vision and operating thesis of RASHX.',
    path: '/founder/message',
    lang,
  });
}

export default async function FounderMessagePage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const founderHref = (isAr ? routes.founder.index : `${routes.founder.index}?lang=en`) as Route;
  const platformHref = (isAr ? routes.platform : `${routes.platform}?lang=en`) as Route;

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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3.5 py-1 text-xs font-semibold text-[#54453D]">
                <Sparkles className="h-4 w-4" />
                <span>{isAr ? 'رسالة القيادة' : "Executive Letter"}</span>
              </div>
              <SectionTitle
                title={
                  isAr
                    ? 'رسالة المؤسس: م. محمد عبده رشاد البهي'
                    : "Founder's Message: Eng. Mohamed Abdo Rashad El-Bahy"
                }
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'رؤية هندسية طموحة انطلقت عام 2026 لإعادة صياغة التجربة التشغيلية والرقمية لقطاع التجميل والعناية الشخصية'
                  : 'An engineering vision founded in 2026 to reshape the operating architecture of the beauty and wellness sector'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-12 transition-colors duration-200">
                <blockquote className="space-y-6 text-base leading-relaxed text-[#54453D] sm:text-lg">
                  <p>
                    {isAr
                      ? 'بسم الله الرحمن الرحيم،'
                      : 'In the Name of God, Most Gracious, Most Merciful,'}
                  </p>
                  <p>
                    {isAr
                      ? 'عندما أسسنا RASHX في عام 2026، لم يكن هدفنا مجرد بناء لوحة تحكم تقليدية لحجز المواعيد أو إصدار الفواتير، بل كانت رؤيتنا تتجاوز ذلك بكثير: نحن نؤمن بأن قطاع العناية الشخصية والجمال في المملكة العربية السعودية والمنطقة يستحق بنية تقنية سيادية، متطورة، وقابلة للتوسع تنافس أحدث المنظومات العالمية.'
                      : 'When we founded RASHX in 2026, our objective was never to build just another generic scheduling calendar or simple invoicing tool. We believed that the salon, spa, and beauty industry deserves sovereign, highly scalable, and world-class digital operating architecture.'}
                  </p>
                  <p>
                    {isAr
                      ? 'كل صالون وكل مركز تجميل هو منشأة ذات هوية فريدة وتجربة عملاء خاصة بها. ولذلك كان المبدأ الهندسي الأول في RASHX هو منح كل منشأة منظومتها الرقمية المستقلة: نطاقاً فرعياً مخصصاً، وهوية تجارية كاملة، وتطبيقاً للعملاء، ومساحة تشغيلية لمقدمي الخدمات، مربوطة بسلاسة بلوحة تحكم مركزية تمكّن الإدارة من التحكم في كل تفصيلة بدقة متناهية.'
                      : 'Every salon, clinic, and spa possesses a distinct brand identity and customer relationship. Our foundational engineering rule at RASHX is sovereign autonomy: granting each facility its dedicated subdomain, customized white-label portal, customer apps, and provider tools, tied directly to an intuitive central command center.'}
                  </p>
                  <p>
                    {isAr
                      ? 'إن التزامنا الراسخ بالامتثال للفوترة الإلكترونية (ZATCA)، وحماية البيانات، وأعلى معايير الاستقرار السحابي، هو العهد الذي نقطعه لكل شريك يضع ثقته في راش إكس لننمو معاً نحو مستقبل مشرق.'
                      : 'Our steadfast dedication to ZATCA e-invoicing compliance, in-kingdom data residency, and cloud reliability represents our enduring promise to every business that places its trust in RASHX.'}
                  </p>
                </blockquote>

                <div className="mt-10 pt-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-[#54453D]">
                      {isAr ? 'م. محمد عبده رشاد البهي' : 'Eng. Mohamed Abdo Rashad El-Bahy'}
                    </span>
                    <span className="text-sm text-[#54453D]/70">
                      {isAr
                        ? 'المؤسس ورئيس المنظومة · راش إكس لتقنية المعلومات'
                        : 'Founder & Chief Architect · RASHX Information Technology'}
                    </span>
                    <span className="text-xs text-[#54453D]/50">
                      {isAr ? 'الرياض · المملكة العربية السعودية (2026)' : 'Riyadh, Kingdom of Saudi Arabia (2026)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href={founderHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3D322C]"
                >
                  <span>{isAr ? 'السيرة الذاتية للمؤسس' : 'Founder Biography'}</span>
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  href={platformHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-6 py-3 text-sm font-semibold text-[#54453D] transition-colors hover:bg-[#E8DFD8]"
                >
                  <span>{isAr ? 'استكشف المنظومة' : 'Explore Platform'}</span>
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

