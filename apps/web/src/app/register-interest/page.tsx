/**
 * RASHX Register Interest Page
 *
 * Dedicated Route: /register-interest
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Pre-registration of interest for salons under establishment or future partners.
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { RegisterInterestForm } from './RegisterInterestForm';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'تسجيل الاهتمام | RASHX — انضم إلى أوائل المنشآت المستفيدة'
      : 'Register Interest | RASHX — Early Access for Salons & Spas',
    description: isAr
      ? 'سجل اهتمام منشأتك بالانضمام إلى منظومة RASHX الرقمية سواء كنت في مرحلة التأسيس أو التوسع للاستفادة من أولوية الإطلاق والشروط التفضيلية.'
      : 'Register your salon or spa’s interest in joining RASHX to secure priority onboarding and tailored digital transformation guidance.',
    path: '/register-interest',
    lang,
  });
}

export default async function RegisterInterestPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

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
                eyebrow={isAr ? 'أولوية الانضمام' : 'EARLY ACCESS & INTEREST'}
                title={
                  isAr
                    ? 'سجل اهتمام منشأتك لتكون من أوائل المستفيدين من المنظومة'
                    : 'Register Your Facility for Priority Access to RASHX'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'سواء كنت تؤسس صالونك الجديد، أو تخطط لافتتاح فروع جديدة، أو ترغب في نقل إدارة صالونك القائم إلى بنية سحابية متطورة؛ سجل بياناتك لنوفر لك استشارة مسبقة وأولوية في التفعيل.'
                  : 'Whether you are launching a new beauty concept, expanding branch locations, or upgrading legacy operations; register today for early consulting and priority activation.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-3xl">
              <RegisterInterestForm lang={lang} />
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

