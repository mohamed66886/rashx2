/**
 * RASHX Brand Center: Identity & Core Thesis
 * Dedicated Route: /brand/identity
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Sparkles, Compass, ShieldCheck } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'فلسفة وركائز الهوية المؤسسية | RASHX Brand Identity'
      : 'Brand Identity & Core Principles | RASHX Brand Identity',
    description: isAr
      ? 'الركائز الاستراتيجية لهوية راش إكس: الرؤية، الرسالة، والقيم الهندسية التي تأسست عليها المنظومة عام 2026.'
      : 'Strategic brand identity principles, mission, vision, and core architectural values of RASHX.',
    path: '/brand/identity',
    lang,
  });
}

export default async function BrandIdentityPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const pillars = isAr
    ? [
        {
          title: 'الاستقلالية والسيادة (Autonomy)',
          desc: 'نؤمن بحق كل صالون في امتلاك واجهته وهوية علامته الخاصة دون التبعية لمنصات مجمعة تذيب تميزه.',
          icon: Compass,
        },
        {
          title: 'الدقة الهندسية والاعتمادية (Precision)',
          desc: 'بنية برمجية فائقة الاستقرار، سريعة الاستجابة، خالية من التعقيد، ومصممة لتحمل ضغط العمل اليومي.',
          icon: ShieldCheck,
        },
        {
          title: 'الرقي الجمالي الوظيفي (Elegance)',
          desc: 'تصميم مسطح، نظيف، خالٍ تماماً من الحواف والظلال الزخرفية، يضع راحة المستخدم وتجربته في المقام الأول.',
          icon: Sparkles,
        },
      ]
    : [
        {
          title: 'Tenant Sovereignty & Autonomy',
          desc: 'Empowering every beauty venue to thrive under its dedicated brand identity rather than a diluted aggregator portal.',
          icon: Compass,
        },
        {
          title: 'Architectural Precision & Trust',
          desc: 'High-availability, microsecond-grade cloud execution engineered for resilient, uninterrupted salon workflows.',
          icon: ShieldCheck,
        },
        {
          title: 'Functional Elegance',
          desc: 'Absolute flat design philosophy eliminating decorative borders and shadows to prioritize user clarity and speed.',
          icon: Sparkles,
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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <Sparkles className="h-4 w-4" />
                <span>{isAr ? 'مركز الهوية الرسمية' : 'Brand Center'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'فلسفة وركائز الهوية المؤسسية' : 'Brand Identity & Principles'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'المبادئ التأسيسية التي تُشكّل ملامح راش إكس كمنظومة تقنية رائدة في قطاع التجميل'
                  : 'Foundational values shaping RASHX as a premier digital operating system for beauty and care'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {pillars.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex flex-col rounded-3xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#54453D] text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-lg font-bold text-[#54453D]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

