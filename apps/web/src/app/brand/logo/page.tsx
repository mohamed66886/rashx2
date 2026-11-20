/**
 * RASHX Brand Center: Official Logo System
 * Dedicated Route: /brand/logo
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { RashxLockupBilingual, RashxSymbol, RashxWordmark, RashxMonogram } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'منظومة الشعار الرسمي والمواصفات | RASHX Logo System'
      : 'Official Logo System & Specifications | RASHX',
    description: isAr
      ? 'المواصفات القياسية لشعار راش إكس: التراكيب الثنائية، المسافات الآمنة، والنسب الهندسية المعتمدة.'
      : 'Official logo specifications, bilingual lockups, clearspace rules, and minimum sizing guidelines for RASHX.',
    path: '/brand/logo',
    lang,
  });
}

export default async function BrandLogoPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

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
                title={isAr ? 'منظومة الشعار الرسمي' : 'Official Logo System'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'الشعار ثنائي اللغة والأشكال المعتمدة للتطبيقات الرقمية والمطبوعة'
                  : 'Bilingual lockups, mark anatomy, and technical deployment standards across touchpoints'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="space-y-12">
              {/* Primary Lockup Showcase */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-14 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#54453D]/60">
                  {isAr ? 'الشعار الرئيسي المعتمد (Bilingual Lockup)' : 'Primary Bilingual Lockup'}
                </span>
                <div className="mt-8 flex items-center justify-center py-6">
                  <RashxLockupBilingual height={54} color="ink" />
                </div>
                <p className="mx-auto mt-6 max-w-lg text-xs leading-relaxed text-[#54453D]/70">
                  {isAr
                    ? 'يُستخدم هذا التركيب في الترويسات الرسمية، والمواقع، والمواد الإعلامية متناهية الأهمية ليعكس هوية راش إكس ثنائية اللغة.'
                    : 'Primary lockup deployed on official web applications, headers, and verified publications.'}
                </p>
              </div>

              {/* Variations Grid */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FAF9F8] p-8 text-center">
                  <span className="text-xs font-bold text-[#54453D]/60">
                    {isAr ? 'الرمز الهندسي (Symbol)' : 'Brand Symbol'}
                  </span>
                  <div className="my-8 flex h-24 items-center justify-center">
                    <RashxSymbol size={64} color="ink" />
                  </div>
                  <span className="text-xs text-[#54453D]/70">
                    {isAr ? 'للأيقونات وشاشات التوقف' : 'Favicons & System Glyphs'}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FAF9F8] p-8 text-center">
                  <span className="text-xs font-bold text-[#54453D]/60">
                    {isAr ? 'اللفظي المنفصل (Wordmark)' : 'Standalone Wordmark'}
                  </span>
                  <div className="my-8 flex h-24 items-center justify-center">
                    <RashxWordmark height={28} color="ink" />
                  </div>
                  <span className="text-xs text-[#54453D]/70">
                    {isAr ? 'للتطبيقات المحدودة المساحة' : 'Compact Horizontal Usages'}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FAF9F8] p-8 text-center">
                  <span className="text-xs font-bold text-[#54453D]/60">
                    {isAr ? 'المونوغرام (Monogram)' : 'Monogram'}
                  </span>
                  <div className="my-8 flex h-24 items-center justify-center">
                    <RashxMonogram size={56} color="ink" />
                  </div>
                  <span className="text-xs text-[#54453D]/70">
                    {isAr ? 'لتطبيقات الجوال والرموز' : 'Mobile App Avatars'}
                  </span>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

