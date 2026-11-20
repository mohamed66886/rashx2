/**
 * RASHX Milestones Page
 *
 * Dedicated Route: /milestones
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Calendar, CheckCircle2 } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'محطات وإنجازات راش إكس | RASHX — مسيرة التحول الرقمي'
      : 'Company Milestones & Journey | RASHX — Evolution of Beauty Tech',
    description: isAr
      ? 'سجل محطات راش إكس منذ تأسيسها في عام 2026، من تطوير النواة الهندسية وتكامل ZATCA وحتى إطلاق منظومات الصالونات متعددة الفروع.'
      : 'Chronological timeline of RASHX milestones since its founding in 2026, from core multi-tenant architecture to ZATCA Phase 2 integration.',
    path: '/milestones',
    lang,
  });
}

export default async function MilestonesPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const milestones = isAr
    ? [
        {
          year: '2026',
          quarter: 'الربع الأول',
          title: 'التأسيس وإطلاق النواة الهندسية',
          desc: 'تأسيس RASHX على يد المهندس محمد عبده رشاد البهي وتدشين البنية السحابية متناهية الصغر (Microservices) القائمة على النطاقات الفرعية المستقلة لكل صالون.',
        },
        {
          year: '2026',
          quarter: 'الربع الثاني',
          title: 'اعتماد الفوترة الإلكترونية والمرحلة الثانية (ZATCA)',
          desc: 'اكتمال جاهزية محرك الفوترة الضريبية وإصدار الفواتير المتوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك والربط المباشر مع المنظومة.',
        },
        {
          year: '2026',
          quarter: 'الربع الثالث',
          title: 'إطلاق حزمة الهوية التجارية وتطبيقات مقدمي الخدمات',
          desc: 'تدشين ميزات White Label الكاملة التي تتيح لكل منشأة إطلاق موقعها وتطبيقاتها تحت علامتها الخاصة، مع إطلاق واجهات الخدمة الذاتية للكوادر الفنية.',
        },
        {
          year: '2026',
          quarter: 'الربع الرابع',
          title: 'توسيع شبكة السلاسل متعددة الفروع والشراكات الاستراتيجية',
          desc: 'تفعيل محرك إدارة الفروع المتعددة المركزي، والمستودعات الإقليمية الموحدة، وتوسيع شبكة الصالونات ومراكز السبا المعتمدة عبر المملكة.',
        },
      ]
    : [
        {
          year: '2026',
          quarter: 'Q1',
          title: 'Founding & Multi-Tenant Core Deployment',
          desc: 'RASHX founded by Eng. Mohamed Abdo Rashad El-Bahy, establishing the core cloud architecture with sovereign subdomains for every tenant facility.',
        },
        {
          year: '2026',
          quarter: 'Q2',
          title: 'ZATCA Phase 2 E-Invoicing Certification',
          desc: 'Full tax integration rollout enabling streamlined simplified tax invoices and cryptographic compliance for beauty centers.',
        },
        {
          year: '2026',
          quarter: 'Q3',
          title: 'White Label & Provider Suite Release',
          desc: 'Delivery of complete white-label branding, localized customer booking portals, and the dedicated staff workspace application.',
        },
        {
          year: '2026',
          quarter: 'Q4',
          title: 'Multi-Branch Engine & Strategic Network',
          desc: 'Launch of centralized multi-unit inventory transfer, global customer profiles, and expansion across nationwide salon chains.',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/milestones" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <Calendar className="h-4 w-4" />
                <span>{isAr ? 'مسيرة النمو والابتكار' : 'Growth & Journey'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'محطات وإنجازات راش إكس' : 'RASHX Milestones'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'محطات مضيئة في بناء وتطوير المنظومة السحابية المتخصصة لقطاع التجميل'
                  : 'Key technical and operational landmarks shaping the future of digital salon management'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              {milestones.map((item, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl bg-[#FAF9F8] p-6 sm:p-8 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex rounded-lg bg-[#54453D] px-3 py-1 text-xs font-bold text-white">
                      {item.year} · {item.quarter}
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#54453D] sm:text-xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#54453D]/80 sm:text-base">
                    {item.desc}
                  </p>
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

