/**
 * RASHX Brand Center: Photography & Art Direction
 * Dedicated Route: /brand/photography
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Image as ImageIcon } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'التوجيه الفني للتصوير والتوثيق البصري | RASHX Photography'
      : 'Photography Art Direction & Imagery Standards | RASHX Brand',
    description: isAr
      ? 'معايير التصوير الفوتوغرافي لراش إكس: الضوء الطبيعي، بيئات الصالونات الحقيقية، والواقعية الدافئة.'
      : 'Photography guidelines, natural lighting, authentic salon environments, and warm color grading rules for RASHX.',
    path: '/brand/photography',
    lang,
  });
}

export default async function BrandPhotographyPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const guidelines = isAr
    ? [
        {
          title: 'الواقعية والأصالة (Authenticity)',
          desc: 'نفضل صوراً توثق لحظات تشغيلية حقيقية داخل الصالونات ومراكز التجميل بدلاً من الصور التمثيلية المصطنعة.',
        },
        {
          title: 'الإضاءة الطبيعية والدافئة',
          desc: 'الاعتماد على إضاءة محيطية ناعمة تحاكي أجواء السبا ومراكز العناية الفاخرة مع تجنب الفلاش القاسي.',
        },
        {
          title: 'التركيز على التجربة الإنسانية',
          desc: 'إبراز التفاعل الإيجابي بين مصففي الشعر وأخصائيي التجميل وعملائهم، وسلاسة استخدام أجهزة نقاط البيع.',
        },
      ]
    : [
        {
          title: 'Authenticity & Genuine Moments',
          desc: 'Prioritize unforced documentary captures of actual salon and spa workflows over artificial stock staging.',
        },
        {
          title: 'Warm Natural Ambient Lighting',
          desc: 'Soft, diffuse illumination mirroring serene wellness retreats; avoid harsh direct artificial flashes.',
        },
        {
          title: 'Human-Centered Interactions',
          desc: 'Highlight tactile craftsmanship, intuitive stylist-client consultations, and fluid checkout touchpoints.',
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
              <SectionTitle
                title={isAr ? 'التوجيه الفني للتصوير' : 'Photography Art Direction'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'معايير التقاط وتوثيق بيئات الصالونات ومراكز العناية بأناقة ودفء'
                  : 'Standards for documenting salon operations, architectural sanctuaries, and customer care'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {guidelines.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                >
                  <ImageIcon className="h-6 w-6 text-[#54453D]" />
                  <h3 className="mt-5 text-lg font-bold text-[#54453D]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80">{item.desc}</p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
