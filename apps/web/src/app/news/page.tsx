/**
 * RASHX News & Press Hub Page
 *
 * Dedicated Route: /news
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Newspaper, ArrowLeft, ArrowRight } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'أخبار وتحديثات المنظومة | RASHX — المركز الإعلامي الرسمي'
      : 'News & Platform Updates | RASHX — Official Newsroom',
    description: isAr
      ? 'آخر أخبار منصة راش إكس، إعلانات التحديثات التقنية، والشراكات الجديدة في قطاع التجميل والعناية الشخصية في السعودية.'
      : 'Stay updated with RASHX company news, platform feature releases, and strategic developments across Saudi Arabia.',
    path: '/news',
    lang,
  });
}

export default async function NewsPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const contactHref = (isAr ? routes.contact : `${routes.contact}?lang=en`) as Route;

  const newsItems = isAr
    ? [
        {
          date: '2026',
          category: 'إعلان المنظومة',
          title: 'راش إكس تدشن منصتها السحابية المتكاملة لصالونات ومراكز التجميل في السعودية',
          excerpt:
            'أعلن المهندس محمد عبده رشاد البهي عن التدشين الرسمي لمنصة RASHX لتمكين المنشآت من امتلاك منظومة رقمية كاملة تحت هويتها التجارية ونطاقها المستقل.',
        },
        {
          date: '2026',
          category: 'الامتثال التقني',
          title: 'اكتمال ربط محرك الفوترة الإلكترونية مع متطلبات ZATCA للمرحلة الثانية',
          excerpt:
            'نجحت RASHX في توفير حلول فوترة سحابية معتمدة تدعم متطلبات الربط والتكامل مع هيئة الزكاة والضريبة والجمارك مع إصدار الفواتير اللحظية المشفرة.',
        },
        {
          date: '2026',
          category: 'تحديثات المنتجات',
          title: 'إطلاق الجيل الجديد من واجهات مقدمي الخدمات وتطبيقات العملاء الذكية',
          excerpt:
            'تحديث شامل لمنظومة تجربة العملاء (Customer Experience) وإدارة الكوادر الفنية يقلص زمن انتظار الحجوزات ويرفع معدل تكرار الزيارات بنسبة 35%.',
        },
      ]
    : [
        {
          date: '2026',
          category: 'Platform Launch',
          title: 'RASHX Officially Launches Its Unified Cloud Operating System in Saudi Arabia',
          excerpt:
            'Founder Eng. Mohamed Abdo Rashad El-Bahy announces the commercial deployment of RASHX, providing sovereign white-label tech stacks for salons and wellness centers.',
        },
        {
          date: '2026',
          category: 'Compliance',
          title: 'ZATCA Phase 2 E-Invoicing Cloud Engine Certified for Kingdom-wide Deployment',
          excerpt:
            'RASHX achieves full operational alignment with ZATCA Phase 2 mandates, generating compliant cryptographic electronic invoices across point-of-sale stations.',
        },
        {
          date: '2026',
          category: 'Product Update',
          title: 'Next-Generation Provider Workspaces & Client Apps Enter Active Service',
          excerpt:
            'Comprehensive rollout of bespoke branded customer portals and stylist apps, driving a 35% boost in client retention and streamlined booking schedules.',
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
                <Newspaper className="h-4 w-4" />
                <span>{isAr ? 'المركز الإعلامي' : 'Official Newsroom'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'أخبار وتحديثات راش إكس' : 'RASHX News & Updates'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'متابعة شاملة لآخر الإعلانات، الإطلاقات التقنية، ومستجدات المنظومة في المملكة'
                  : 'Latest announcements, product releases, and technology updates across our platform'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-4xl space-y-8">
              {newsItems.map((item, idx) => (
                <article
                  key={idx}
                  className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8 transition-colors duration-200"
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                    <span className="rounded-md bg-[#54453D] px-2.5 py-1 text-white">
                      {item.category}
                    </span>
                    <span className="text-[#54453D]/60">{item.date}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-[#54453D] sm:text-xl">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80 sm:text-base">
                    {item.excerpt}
                  </p>
                </article>
              ))}

              <div className="rounded-2xl bg-[#FAF9F8] p-8 text-center">
                <p className="text-sm text-[#54453D]/80">
                  {isAr
                    ? 'للاستفسارات الصحفية والتواصل الإعلامي: press@rashx.org'
                    : 'For press inquiries and media relations: press@rashx.org'}
                </p>
                <Link
                  href={contactHref}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#54453D] hover:underline"
                >
                  <span>{isAr ? 'تواصل مع الفريق الإعلامي' : 'Contact Press Office'}</span>
                  <ArrowIcon className="h-4 w-4" />
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

