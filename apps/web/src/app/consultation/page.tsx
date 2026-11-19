/**
 * RASHX Operational Consultation Request Page
 *
 * Dedicated Route: /consultation
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Request a free 30-minute operational workflow consultation with RASHX experts.
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ConsultationForm } from './ConsultationForm';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'طلب استشارة تشغيلية مجانية | RASHX — طور إدارة صالونك مع الخبراء'
      : 'Free Operational Consultation | RASHX — Transform Your Salon Operations',
    description: isAr
      ? 'احجز جلسة استشارية تشغيلية مجانية مدتها 30 دقيقة لمراجعة سير العمل في صالونك وتحسين حساب العمولات، الحجوزات، والفوترة الإلكترونية.'
      : 'Book a free 30-minute consultation with RASHX specialists to optimize booking flows, staff commissions, and ZATCA Phase 2 compliance.',
    path: '/consultation',
    lang,
  });
}

export default async function ConsultationPage() {
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
                eyebrow={isAr ? 'استشارة تشغيلية متخصصة' : 'OPERATIONAL CONSULTATION'}
                title={
                  isAr
                    ? 'جلسة استشارية مجانية لمراجعة كفاءة تشغيل صالونك'
                    : 'Complimentary 30-Minute Salon Workflow Advisory Session'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'يناقش معك خبراؤنا كيفية القضاء على الازدحام، تنظيم حساب العمولات، إتمام الفوترة الضريبية بسلاسة، وبناء تجربة عميل رقمية ترفع الإيرادات.'
                  : 'Our advisors analyze your appointment velocity, commission accounting, ZATCA e-invoicing readiness, and client retention strategies.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-3xl">
              <ConsultationForm lang={lang} />
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

