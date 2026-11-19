/**
 * RASHX Digital Accessibility Statement Page
 *
 * Dedicated Route: /accessibility-statement
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Eye } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'بيان إمكانية الوصول وسهولة الاستخدام | RASHX — تصميم شامل للجميع'
      : 'Digital Accessibility Statement | RASHX — Inclusive Design Standards',
    description: isAr
      ? 'التزام راش إكس بتوفير تجارب رقمية شاملة وسهلة الوصول لذوي الإعاقة وفق معايير WCAG 2.1 AA الدولية.'
      : 'RASHX accessibility commitment aligning our web applications with WCAG 2.1 AA accessibility guidelines.',
    path: '/accessibility-statement',
    lang,
  });
}

export default async function AccessibilityStatementPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const standards = isAr
    ? [
        {
          title: '1. التزامنا بالشمول الرقمي',
          content:
            'تؤمن RASHX بأن التكنولوجيا يجب أن تكون في متناول جميع المستخدمين بغض النظر عن قدراتهم الجسدية أو التقنية. نعمل باستمرار على جعل واجهات الصالونات، وتطبيقات العملاء، ولوحات التحكم متوافقة وسهلة الاستخدام.',
        },
        {
          title: '2. المعايير المعتمدة (WCAG 2.1 AA)',
          content:
            'نتبع المبادئ التوجيهية للوصول إلى محتوى الويب (WCAG 2.1) بمستوى المطابقة (AA)، مع التركيز على تباين الألوان العالي، قابلية التصفح بلوحة المفاتيح، ودعم قارئات الشاشة باللغتين العربية والإنجليزية.',
        },
        {
          title: '3. الميزات المدمجة لسهولة الوصول',
          content:
            'تشمل ميزات المنظومة: دعم كامل للاتجاه من اليمين إلى اليسار (RTL) مع خطوط واضحة، نص بديل لجميع الصور التوضيحية، تسلسل تركيز بصري منطقي، والابتعاد عن التباينات اللونية غير المتوافقة.',
        },
        {
          title: '4. المراجعة والتحسين المستمر',
          content:
            'تخضع مكونات نظام التصميم (Design System) لاختبارات دورية آلية ويدوية لضمان عدم وجود عوائق وصول في التحديثات البرمجية الدورية لكافة بوابات المشتركين.',
        },
        {
          title: '5. الملاحظات والدعم المخصص',
          content:
            'إذا واجهت أي صعوبة في الوصول إلى أي جزء من خدماتنا، نرحب بملاحظاتك واقتراحاتك عبر accessibility@rashx.org لتقديم الدعم الفوري وتحديث الواجهات.',
        },
      ]
    : [
        {
          title: '1. Commitment to Inclusion',
          content:
            'RASHX believes modern technology must be empowering and accessible to every user. We continuously engineer our management portals and booking interfaces to eliminate operational friction.',
        },
        {
          title: '2. Adopted Standards (WCAG 2.1 AA)',
          content:
            'Our platform aligns with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, optimizing high-contrast typography, seamless keyboard navigation, and screen-reader compatibility.',
        },
        {
          title: '3. Core Accessibility Capabilities',
          content:
            'Features include native bidirectional RTL support, semantic HTML landmarks, structured ARIA roles, descriptive media attributes, and clear visual focus indicators without disruptive elements.',
        },
        {
          title: '4. Auditing & Continuous Integration',
          content:
            'UI components in the RASHX design system undergo automated and human accessibility regression tests with each cloud release to ensure zero barriers across subscriber touchpoints.',
        },
        {
          title: '5. Feedback & Support',
          content:
            'If you encounter accessibility impediments when using RASHX, please contact accessibility@rashx.org for immediate assistance and interface refinement.',
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
                <Eye className="h-4 w-4" />
                <span>{isAr ? 'الشمول وسهولة الاستخدام' : 'Inclusive Design'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'بيان إمكانية الوصول الرقمي' : 'Digital Accessibility Statement'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'معايير التصميم الشامل وتيسير الوصول إلى التقنية لجميع أفراد المجتمع'
                  : 'Delivering accessible, barrier-free digital experiences across our salon operating network'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              {standards.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8 transition-colors duration-200"
                >
                  <h2 className="text-lg font-bold text-[#54453D] sm:text-xl">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80 sm:text-base">
                    {item.content}
                  </p>
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

