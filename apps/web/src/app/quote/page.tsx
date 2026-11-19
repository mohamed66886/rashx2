/**
 * RASHX Instant Quotation Request Page
 *
 * Dedicated Route: /quote
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Request a customized commercial quote based on facility size and specialist count.
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ConsultationForm } from '@/app/consultation/ConsultationForm';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'طلب عرض سعر مخصص | RASHX — تسعير مرن يناسب حجم منشأتك'
      : 'Request a Custom Quotation | RASHX — Flexible Pricing for Salons & Spas',
    description: isAr
      ? 'احصل على عرض سعر رسمي مخصص لمنشأتك بناءً على عدد الفروع، كراسي الخدمة، وحجم الكوادر مع استشارة مجانية.'
      : 'Obtain a customized quotation tailored to your salon chair count, branch footprint, and specialist team with complimentary advisory.',
    path: '/quote',
    lang,
  });
}

export default async function QuotePage() {
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
                eyebrow={isAr ? 'عروض الأسعار المخصصة' : 'CUSTOM COMMERCIAL QUOTES'}
                title={
                  isAr
                    ? 'احصل على عرض سعر رسمي مخصص لحجم ونشاط صالونك'
                    : 'Receive a Formal Quotation Tailored to Your Salon Scale'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'سواء كنت تدير صالوناً واحداً أو سلسلة فروع كبرى؛ يقوم فريقنا بإعداد باقة اشتراك مدروسة تلبي متطلباتك التشغيلية وتمنحك أعلى عائد استثماري.'
                  : 'Whether operating a single boutique or a large enterprise chain, our team configures a subscription tier maximizing your ROI and operational velocity.'}
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

