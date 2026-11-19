/**
 * RASHX Graduate & Internship Programs Page
 *
 * Dedicated Route: /careers/internships
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Sparkles, CheckCircle2 } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'برامج التدريب التعاوني والمهني | RASHX Internships'
      : 'Graduate & Internship Programs | RASHX Internships',
    description: isAr
      ? 'برامج التدريب التعاوني والتطوير التقني في راش إكس لطلاب وخريجي كليات علوم الحاسب وهندسة البرمجيات وإدارة الأعمال.'
      : 'Cooperative training and software engineering internships for Saudi university students and fresh graduates.',
    path: '/careers/internships',
    lang,
  });
}

export default async function InternshipsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const tracks = isAr
    ? [
        {
          title: 'مسار هندسة البرمجيات والأنظمة السحابية',
          desc: 'تدريب عملي على تطوير واجهات React/Next.js، المعمارية الموزعة، وتقنيات قواعد البيانات السحابية.',
          duration: '3 إلى 6 أشهر',
        },
        {
          title: 'مسار تجربة المستخدم وتصميم الأنظمة (UI/UX)',
          desc: 'المشاركة في تصميم واجهات الصالونات، أبحاث تجربة المستخدم، وتطبيق نظم التصميم الحديثة.',
          duration: '3 إلى 6 أشهر',
        },
        {
          title: 'مسار العمليات ودعم المنشآت (Ops & Enablement)',
          desc: 'التفاعل المباشر مع أصحاب المنشآت، إدارة قواعد البيانات، وتدريب الكوادر الفنية على المنظومة.',
          duration: '3 إلى 6 أشهر',
        },
      ]
    : [
        {
          title: 'Cloud Software Engineering Track',
          desc: 'Hands-on development of modern Next.js interfaces, distributed event brokers, and scalable database schemas.',
          duration: '3 to 6 Months',
        },
        {
          title: 'Product Design & System UI/UX Track',
          desc: 'Prototyping responsive salon management workflows, design system tokens, and client accessibility audits.',
          duration: '3 to 6 Months',
        },
        {
          title: 'Operations & Facility Enablement Track',
          desc: 'Direct interaction with salon administrators, data onboarding protocols, and customer success management.',
          duration: '3 to 6 Months',
        },
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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#91B8C0]/30 px-3 py-1 text-xs font-semibold text-[#2C4349]">
                <Sparkles className="h-4 w-4" />
                <span>{isAr ? 'برامج الكفاءات الواعدة' : 'Talent Accelerator'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'برامج التدريب التعاوني والمهني' : 'Graduate & Internship Programs'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'فرص تدريب استثنائية لطلاب الجامعات السعودية وحديثي التخرج لاكتساب مهارات تقنية وعملية رائدة'
                  : 'Practical, high-impact internship tracks designed for ambitious Saudi students and fresh graduates'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {tracks.map((t) => (
                <div
                  key={t.title}
                  className="flex flex-col justify-between rounded-2xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                >
                  <div>
                    <span className="text-xs font-bold text-[#54453D]/60">{t.duration}</span>
                    <h3 className="mt-3 text-lg font-bold text-[#54453D]">{t.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#54453D]/80">{t.desc}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#16A34A]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isAr ? 'تدريب معتمد + مكافأة شهرية' : 'Accredited + Monthly Stipend'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-3xl bg-[#FAF9F8] p-8 text-center sm:p-12">
              <h3 className="text-lg font-bold text-[#54453D]">
                {isAr ? 'كيفية التقديم للتدريب' : 'Application Process'}
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#54453D]/80">
                {isAr
                  ? 'أرسل السيرة الذاتية وخطاب الجامعة إلى intern@rashx.org متضمناً المعدل والمسار المطلوب.'
                  : 'Submit your resume and university enrollment verification to intern@rashx.org.'}
              </p>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

