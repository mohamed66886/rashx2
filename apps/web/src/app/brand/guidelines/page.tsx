/**
 * RASHX Brand Center: Guidelines & Complete Manual
 * Dedicated Route: /brand/guidelines
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { BookOpen, Download, ShieldCheck } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'دليل الهوية الكامل والمواصفات القياسية | RASHX Brand Manual'
      : 'Comprehensive Brand Guidelines Manual | RASHX',
    description: isAr
      ? 'المرجع الشامل لجميع معايير ومواصفات الهوية المؤسسية لراش إكس: الشعارات، الألوان، الخطوط، وتطبيقات الواجهات.'
      : 'Complete brand manual document synthesizing logo systems, typography scales, colors, and interface guidelines.',
    path: '/brand/guidelines',
    lang,
  });
}

export default async function BrandGuidelinesPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const chapters = isAr
    ? [
        { chapter: 'الفصل الأول', title: 'الرؤية والرسالة والقيم التأسيسية لعام 2026' },
        { chapter: 'الفصل الثاني', title: 'منظومة الشعار، التراكيب، والمسافات الآمنة' },
        { chapter: 'الفصل الثالث', title: 'لوحة الألوان المعتمدة ونسب التباين اللوني' },
        { chapter: 'الفصل الرابع', title: 'معايير الخطوط العربية والإنجليزية (Ping AR + LT)' },
        { chapter: 'الفصل الخامس', title: 'نظام التصميم المسطح وتطبيقات الواجهات (UI Tokens)' },
      ]
    : [
        { chapter: 'Chapter 1', title: 'Vision, Mission & Core 2026 Founding Thesis' },
        { chapter: 'Chapter 2', title: 'Logo System, Lockup Geometry & Clearspace Rules' },
        { chapter: 'Chapter 3', title: 'Official Color Palette & Accessibility Ratios' },
        { chapter: 'Chapter 4', title: 'Typography Hierarchy & Font Specifications' },
        { chapter: 'Chapter 5', title: 'Borderless & Shadowless Design Architecture' },
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
                title={isAr ? 'دليل الهوية الكامل' : 'Official Brand Guidelines Manual'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'المرجع التأسيسي الشامل لحفظ الاتساق البصري والهندسي لمنظومة راش إكس'
                  : 'Comprehensive standard specification guaranteeing cohesive visual and spatial harmony'}
              </p>
              <div className="mt-8">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-[#3D322C]"
                >
                  <Download className="h-4 w-4" />
                  <span>{isAr ? 'تحميل دليل الهوية الكامل (PDF)' : 'Download Full Manual (PDF)'}</span>
                </button>
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-4">
              {chapters.map((ch) => (
                <div
                  key={ch.chapter}
                  className="flex items-center justify-between rounded-2xl bg-[#FAF9F8] p-6 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <BookOpen className="h-5 w-5 text-[#54453D]" />
                    <div>
                      <span className="text-xs font-bold text-[#54453D]/60">{ch.chapter}</span>
                      <h3 className="text-base font-bold text-[#54453D]">{ch.title}</h3>
                    </div>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-[#16A34A]" />
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
