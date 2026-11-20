/**
 * RASHX Brand Center: Tone of Voice & Editorial Guidelines
 * Dedicated Route: /brand/voice
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { MessageSquare } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'نبرة الصوت واللغة التحريرية | RASHX Brand Voice'
      : 'Tone of Voice & Editorial Guidelines | RASHX Brand',
    description: isAr
      ? 'إرشادات نبرة صوت راش إكس: الاحترافية، الثقة الهندسية، الوضوح، والابتعاد عن المبالغات التسويقية.'
      : 'Verbal identity, editorial tone of voice, terminology, and messaging principles for RASHX.',
    path: '/brand/voice',
    lang,
  });
}

export default async function BrandVoicePage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const pillars = isAr
    ? [
        {
          trait: 'واثق وهادئ (Confident & Measured)',
          desc: 'نتحدث بلغة الواثق من حلوله الهندسية دون صخب أو مبالغات ترويجية غير مدعومة بالحقائق والأرقام.',
        },
        {
          trait: 'دقيق ومباشر (Precise & Clear)',
          desc: 'نفضل الجمل الموجزة الواضحة التي تشرح الفائدة التشغيلية المباشرة لمالك الصالون أو المدير.',
        },
        {
          trait: 'محترم للقطاع وداعِم (Empowering)',
          desc: 'ننظر إلى شركائنا من أصحاب الصالونات كرواد أعمال مبدعين، ونخاطبهم كشركاء نجاح متكافئين.',
        },
      ]
    : [
        {
          trait: 'Confident & Measured',
          desc: 'Understated authority grounded in rigorous engineering facts; zero hyperbolic tech buzzwords.',
        },
        {
          trait: 'Precise & Actionable',
          desc: 'Concise, lucid prose that quickly conveys direct operational value to salon proprietors.',
        },
        {
          trait: 'Empowering & Respectful',
          desc: 'Viewing salon founders as creative entrepreneurs and treating them as equal strategic partners.',
        },
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
                title={isAr ? 'نبرة الصوت واللغة التحريرية' : 'Brand Tone of Voice'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'كيف تتحدث راش إكس: لغة تجمع بين الرصانة الهندسية واللباقة الراقية'
                  : 'How RASHX communicates: balancing architectural clarity with salon hospitality'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {pillars.map((item) => (
                <div
                  key={item.trait}
                  className="rounded-3xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                >
                  <MessageSquare className="h-6 w-6 text-[#54453D]" />
                  <h3 className="mt-5 text-lg font-bold text-[#54453D]">{item.trait}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80">{item.desc}</p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
