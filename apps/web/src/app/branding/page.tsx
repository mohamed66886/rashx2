/**
 * RASHX Salon Branding & White-Label Customization Page
 *
 * Dedicated Route: /branding
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Custom brand identity, color themes, logo upload, and portfolio showcase.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Palette, ArrowLeft, ArrowRight, Sparkles } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'تخصيص الهوية والعلامة التجارية | RASHX — صالونك بهويتك المستقلة'
      : 'Brand Customization & Identity | RASHX — Your Salon, Your Brand',
    description: isAr
      ? 'تخصيص كامل للهوية البصرية: شعار صالونك، لوحة الألوان الخاصة، صور المعرض، والنطاق الفرعي المستقل.'
      : 'Full visual identity customization: brand logo, bespoke color palettes, portfolio gallery, and approved subdomain.',
    path: '/branding',
    lang,
  });
}

export default async function BrandingPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const whiteLabelHref = (isAr ? routes.whiteLabel : `${routes.whiteLabel}?lang=en`) as Route;
  const demoHref = (isAr ? routes.demo : `${routes.demo}?lang=en`) as Route;

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <Header lang={lang} />

      <main id="main-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                as="h1"
                eyebrow={isAr ? 'الهوية البصرية والتخصيص' : 'BRAND IDENTITY & CUSTOMIZATION'}
                title={
                  isAr
                    ? 'منظومة تعكس هوية صالونك وعلامتك التجارية بالكامل'
                    : 'A Digital Presence Reflecting Your Salon Brand Identity'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'لا تظهر RASHX أمام عميلاتك كوسيط، بل تظهر علامتك التجارية المستقلة بشعارك، وألوانك، ومعرض أعمالك، على موقعك ونظام حجزك الخاص.'
                  : 'RASHX stays behind the scenes. Your customers interact solely with your branded digital presence, colors, and portfolio.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-12 mb-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0C5AE]/40 text-[#54453D] mb-5">
                  <Palette className="h-7 w-7 text-[#54453D]" aria-hidden="true" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-3">
                  {isAr ? 'تخصيص ألوان وشعار المنشأة (White-Label)' : 'White-Label Branding Suite'}
                </h2>
                <p className="text-sm sm:text-base text-[#75645B] max-w-xl mx-auto mb-8 leading-relaxed">
                  {isAr
                    ? 'تحكم كامل في درجات الألوان لتطابق ديكور صالونك وهوية علامتك، مع تخصيص قوالب الرسائل والفواتير الضريبية.'
                    : 'Comprehensive control over color themes matching your physical salon decor, custom invoice styling, and messaging.'}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href={whiteLabelHref}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#54453D] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                  >
                    <span>{isAr ? 'تفاصيل حلول التخصيص المستقل' : 'Explore White-Label Solution'}</span>
                    <ArrowIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>

                  <Link
                    href={demoHref}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#54453D] transition-colors duration-200 hover:bg-[#F0C5AE]/30"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>{isAr ? 'معاينة تجربة صالونك' : 'Preview Brand Demo'}</span>
                  </Link>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
