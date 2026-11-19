/**
 * RASHX Blog & Knowledge Hub Page
 *
 * Dedicated Route: /blog
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { BookOpen, Sparkles } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'مدونة راش إكس | مقالات وأفكار تشغيل الصالونات الذكية'
      : 'RASHX Blog | Insights on Modern Salon Operations',
    description: isAr
      ? 'مقالات متخصصة حول أفضل الممارسات التشغيلية، إدارة الصالونات، الفوترة الإلكترونية، وتحسين ولاء العملاء.'
      : 'Expert articles, operational guides, and growth strategies for beauty salons, barbershops, and luxury spas.',
    path: '/blog',
    lang,
  });
}

export default async function BlogPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const articles = isAr
    ? [
        {
          category: 'التشغيل والأتمتة',
          date: '2026',
          title: 'كيف ترفع إنتاجية صالونك وتقلل فترات الفراغ بين المواعيد بنسبة 40%؟',
          readTime: '4 دقائق قراءة',
        },
        {
          category: 'الامتثال والضرائب',
          date: '2026',
          title: 'دليل المرحلة الثانية من الفوترة الإلكترونية (ZATCA) لمراكز التجميل والسبا',
          readTime: '6 دقائق قراءة',
        },
        {
          category: 'تجربة العملاء والولاء',
          date: '2026',
          title: 'استراتيجيات تحويل الزوار العابرين إلى عملاء دائمين عبر برامج النقاط الذكية',
          readTime: '5 دقائق قراءة',
        },
        {
          category: 'إدارة الكوادر والموظفين',
          date: '2026',
          title: 'هيكلة العمولات والحوافز لمصففي الشعر وأخصائيي العناية لزيادة المبيعات',
          readTime: '5 دقائق قراءة',
        },
      ]
    : [
        {
          category: 'Automation & Ops',
          date: '2026',
          title: 'How to Eliminate Dead Booking Gaps and Elevate Stylist Utilization by 40%',
          readTime: '4 min read',
        },
        {
          category: 'Compliance & Tax',
          date: '2026',
          title: 'Complete ZATCA Phase 2 E-Invoicing Blueprint for Salons & Wellness Centers',
          readTime: '6 min read',
        },
        {
          category: 'Client Loyalty',
          date: '2026',
          title: 'Converting Walk-In Guests Into Repeat Clientele with Dynamic Rewards Systems',
          readTime: '5 min read',
        },
        {
          category: 'Workforce & Talent',
          date: '2026',
          title: 'Optimizing Commission Structures & Performance Incentives in Beauty Hubs',
          readTime: '5 min read',
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
                <BookOpen className="h-4 w-4" />
                <span>{isAr ? 'المعرفة والرؤى التشغيلية' : 'Knowledge Hub'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'مدونة راش إكس' : 'RASHX Knowledge Hub'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'رؤى تشغيلية ودراسات تطبيقية تساعد أصحاب الصالونات ومراكز التجميل على النمو والتوسع'
                  : 'Actionable strategies, tactical operations guides, and market trends for the salon industry'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {articles.map((art, idx) => (
                <article
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#54453D]/60">
                      <span className="rounded-md bg-[#54453D]/10 px-2.5 py-1 text-[#54453D]">
                        {art.category}
                      </span>
                      <span>{art.readTime}</span>
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-[#54453D] sm:text-xl">{art.title}</h2>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#54453D]/60">
                    <Sparkles className="h-3.5 w-3.5 text-[#C78360]" />
                    <span>{art.date} · RASHX Research</span>
                  </div>
                </article>
              ))}
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

