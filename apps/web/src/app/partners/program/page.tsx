/**
 * RASHX Partner Program Tracks & Tiers
 *
 * Dedicated Route: /partners/program
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Handshake, ArrowLeft, ArrowRight, CheckCircle2 } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'مسارات ومستويات برنامج الشركاء | RASHX Partners'
      : 'Partner Program Tiers & Tracks | RASHX Partners',
    description: isAr
      ? 'تعرف على مستويات برنامج الشركاء في راش إكس وعوائد الإحالة وحوافز التكامل لمستشاري الصالونات ومزودي الحلول.'
      : 'Explore RASHX partner tiers, revenue-sharing models, and certification benefits for salon industry consultants.',
    path: '/partners/program',
    lang,
  });
}

export default async function PartnerProgramPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const applyHref = (isAr ? routes.partners.apply : `${routes.partners.apply}?lang=en`) as Route;

  const tiers = isAr
    ? [
        {
          name: 'شريك إحالة معتمد (Referral Partner)',
          benefits: [
            'عوائد سنوية مجزية على كل اشتراك جديد',
            'لوحة تحكم خاصة لتتبع الإحالات والأرباح',
            'مواد تسويقية ورقمية مخصصة للصالونات',
          ],
        },
        {
          name: 'شريك حلول وتكامل (Solutions Partner)',
          benefits: [
            'دعم فني واستشاري مخصص ذو أولوية',
            'تدريب معتمد على تطبيق وتهيئة المنظومة',
            'مشاركة في الفعاليات وورش العمل المشتركة',
          ],
        },
        {
          name: 'شريك استراتيجي ونظم (Enterprise Alliance)',
          benefits: [
            'تخصيص مشترك للواجهات البرمجية وتكاملات السلاسل الكبرى',
            'جلسات تخطيط استراتيجي مع فريق القيادة الهندسية',
            'مدير حساب تنفيذي مخصص على مدار الساعة',
          ],
        },
      ]
    : [
        {
          name: 'Certified Referral Partner',
          benefits: [
            'Generous recurring commissions on new tenant activations',
            'Dedicated partner portal tracking deals and payouts',
            'Co-branded sales enablement materials for salons',
          ],
        },
        {
          name: 'Solutions & Implementation Partner',
          benefits: [
            'Priority technical advisory and onboarding support',
            'Official implementation engineer certification program',
            'Joint participation in executive beauty tech roadshows',
          ],
        },
        {
          name: 'Enterprise Alliance Partner',
          benefits: [
            'Tailored API integrations for enterprise beauty conglomerates',
            'Strategic roadmap alignment with RASHX executive engineers',
            'Dedicated 24/7 technical partner account manager',
          ],
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/partners/program" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <Handshake className="h-4 w-4" />
                <span>{isAr ? 'برنامج الشراكات الرسمي' : 'Partner Ecosystem'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'مسارات ومستويات الشراكة' : 'Partner Program Tracks & Tiers'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'نموذج تعاون مستدام يتيح لك تحقيق دخل متكرر والمساهمة في رقمنة قطاع التجميل السعودي'
                  : 'A sustainable commercial framework providing recurring returns and digital leadership across Saudi Arabia'}
              </p>
              <div className="mt-8">
                <Link
                  href={applyHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3D322C]"
                >
                  <span>{isAr ? 'قدم طلب الانضمام كشريك' : 'Apply to Partner Program'}</span>
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="flex flex-col justify-between rounded-2xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                >
                  <div>
                    <h3 className="text-lg font-bold text-[#54453D]">{tier.name}</h3>
                    <ul className="mt-6 space-y-4">
                      {tier.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-[#54453D]/80">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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

