/**
 * RASHX Values Page
 *
 * Dedicated Route: /values
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Core operating values of RASHX.
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
import { ShieldCheck, ArrowLeft, ArrowRight, Target, CheckCircle2 } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'قيمنا ومبادئنا | RASHX — الموثوقية، الابتكار، والخصوصية'
      : 'Our Core Values | RASHX — Reliability, Innovation & Privacy',
    description: isAr
      ? 'المبادئ والقيم الجوهرية التي تحكم تطوير وتشغيل منظومة RASHX لخدمة قطاع الجمال والعناية في السعودية.'
      : 'The fundamental values guiding RASHX engineering and operations: unyielding reliability, continuous innovation, and strict privacy.',
    path: '/values',
    lang,
  });
}

export default async function ValuesPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const aboutHref = (isAr ? routes.about : `${routes.about}?lang=en`) as Route;

  const coreValues = isAr
    ? [
        {
          title: 'الموثوقية والجاهزية التامة',
          desc: 'نضع استقرار النظام فوق كل اعتبار؛ لا مجال لتوقف الحجوزات أو تعطل نقاط البيع في مواسم العمل.',
        },
        {
          title: 'الخصوصية وعزل البيانات',
          desc: 'بيانات صالونك وعميلاتك ملك حصري لك؛ نطبق أعلى معايير التشفير وعزل المنشآت البرمجي الصارم.',
        },
        {
          title: 'البساطة والسرعة في التجربة',
          desc: 'برمجيات متقدمة بواجهات فائقة السهولة يستطيع أي فرد من فريقك استيعابها خلال دقائق معدودة.',
        },
      ]
    : [
        {
          title: 'Unyielding Reliability',
          desc: 'Operational uptime is paramount. No downtime during holiday rushes or critical retail hours.',
        },
        {
          title: 'Strict Privacy & Isolation',
          desc: 'Your salon data belongs solely to you, safeguarded with rigorous encryption and tenant isolation.',
        },
        {
          title: 'Simplicity & Speed',
          desc: 'Enterprise capabilities wrapped in intuitive interfaces that your specialists master within minutes.',
        },
      ];

  const officialGoals = isAr
    ? [
        'رقمنة عمليات الصالونات ومراكز التجميل.',
        'تقليل التعقيد الإداري والتشغيلي.',
        'رفع كفاءة استخدام الموارد البشرية.',
        'تحسين تجربة العملاء وزيادة ولائهم.',
        'توفير بيانات دقيقة لدعم اتخاذ القرارات.',
        'تطوير بيئة عمل مترابطة بين الإدارة والموظفين والعملاء.',
        'دعم نمو المنشآت وتوسعها.',
        'المساهمة في تطوير مستقبل قطاع التجميل رقميًا.',
      ]
    : [
        'Digitizing salon and beauty center operations.',
        'Minimizing administrative and operational complexity.',
        'Maximizing human resource efficiency and productivity.',
        'Elevating customer satisfaction and brand loyalty.',
        'Delivering precise data to support strategic decisions.',
        'Fostering connected workflows between management, staff, and clients.',
        'Empowering multi-unit facility expansion and scalable growth.',
        'Pioneering the digital future of the beauty and care industry.',
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/values" lang={lang} />
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
                eyebrow={isAr ? 'مبادئنا وقيمنا' : 'OUR CORE VALUES'}
                title={
                  isAr
                    ? 'القيم الراسخة التي تحرك هندسة وتطوير RASHX'
                    : 'The Guiding Principles Shaping RASHX Engineering'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'نبني أدوات تثق بها يومياً لإدارة مصدر رزقك؛ لذلك تظل قيم الأمان والموثوقية والسرعة في صميم كل سطر برمجي نكتبه.'
                  : 'You trust our software to run your daily livelihood. Reliability, security, and velocity are woven into every line of code.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
                {coreValues.map((v, idx) => (
                  <div key={idx} className="rounded-3xl bg-[#FAF9F8] p-7 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0C5AE]/40 text-[#54453D] mb-5">
                        <ShieldCheck className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-[#54453D] mb-3">{v.title}</h3>
                      <p className="text-sm leading-relaxed text-[#75645B]">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Official Platform Goals Section ────────────────── */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-12 mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#54453D] text-white">
                    <Target className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#54453D]">
                      {isAr ? 'أهدافنا الاستراتيجية (Our Goals)' : 'Our Strategic Platform Goals'}
                    </h2>
                    <p className="text-xs text-[#75645B]">
                      {isAr
                        ? 'الغايات التشغيلية والتقنية التي تسعى راش إكس لتحقيقها لكل منشأة'
                        : 'Operational objectives RASHX commits to delivering for every beauty partner'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {officialGoals.map((goal, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-2xl bg-white p-4">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" aria-hidden="true" />
                      <span className="text-sm font-semibold text-[#54453D]">{goal}</span>
                    </div>
                  ))}
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
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
