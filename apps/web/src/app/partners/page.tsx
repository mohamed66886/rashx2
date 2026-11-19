/**
 * RASHX Partners Program Page
 *
 * Dedicated Route: /partners
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Business partnerships, system integrators, and consultant network.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ArrowLeft, ArrowRight, Handshake } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'برنامج الشركاء | RASHX — انضم إلى شبكة شركاء النجاح والتحول الرقمي'
      : 'Partners Program | RASHX — Join Our Strategic Ecosystem',
    description: isAr
      ? 'انضم إلى برنامج شركاء راش إكس للمستشارين التشغيليين، وكالات التسويق، ومزودي الحلول التقنية لقطاع الجمال والعناية في السعودية.'
      : 'Partner with RASHX: empowering operational consultants, digital marketing agencies, and beauty tech integrators across Saudi Arabia.',
    path: '/partners',
    lang,
  });
}

export default async function PartnersPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const contactHref = (isAr ? routes.contact : `${routes.contact}?lang=en`) as Route;

  const partnerTracks = isAr
    ? [
        {
          title: 'شركاء الاستشارات التشغيلية',
          desc: 'لخبراء ومستشاري إدارة الصالونات ومراكز التجميل لمساعدة عملائهم على تطبيق أفضل الممارسات التشغيلية المؤتمتة.',
        },
        {
          title: 'وكالات التسويق وتطوير الأعمال',
          desc: 'للشركات التي تدير الحضور الرقمي وحملات الصالونات لربط عملائها بنظام حجز وتتبع عملاء عالي التحويل.',
        },
        {
          title: 'شركاء التقنية ومزودو الأجهزة',
          desc: 'لموردي نقاط البيع، أجهزة الدفع، والطابعات المتوافقة لتقديم حلول متكاملة للمنشآت.',
        },
      ]
    : [
        {
          title: 'Operational Consultants',
          desc: 'For salon management advisors helping clients adopt modern automated cloud operating workflows.',
        },
        {
          title: 'Marketing & Creative Agencies',
          desc: 'For agencies running marketing campaigns seeking seamless integration with high-converting booking portals.',
        },
        {
          title: 'Hardware & System Integrators',
          desc: 'For POS terminal vendors and receipt printer suppliers offering end-to-end salon fitouts.',
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
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                as="h1"
                eyebrow={isAr ? 'شبكة شركاء RASHX' : 'PARTNERS ECOSYSTEM'}
                title={
                  isAr
                    ? 'نبني معاً منظومة رقمية أقوى لقطاع الجمال والعناية'
                    : 'Building a Stronger Digital Operating Ecosystem Together'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-[#75645B] max-w-3xl mx-auto">
                {isAr
                  ? 'نوفر لشركائنا من المستشارين والوكالات حوافز تجارية، ودعماً تقنياً مباشراً، وأولوية في تهيئة وتدريب عملائهم على المنظومة.'
                  : 'We equip consulting and technology partners with commercial incentives, direct API engineering support, and priority onboarding.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
                {partnerTracks.map((track, idx) => (
                  <div key={idx} className="rounded-3xl bg-[#FAF9F8] p-7 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0C5AE]/40 text-[#54453D] mb-5">
                        <Handshake className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-[#54453D] mb-3">{track.title}</h3>
                      <p className="text-sm leading-relaxed text-[#75645B]">{track.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Apply Box */}
              <div className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-12 text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-[#54453D] mb-3">
                  {isAr ? 'هل ترغب في الانضمام إلى برنامج الشركاء؟' : 'Ready to Join Our Partner Network?'}
                </h3>
                <p className="text-sm sm:text-base text-[#75645B] max-w-xl mx-auto mb-8">
                  {isAr
                    ? 'تواصل مع فريق شراكات الأعمال لمناقشة فرص التعاون والتكامل المشترك.'
                    : 'Connect with our partnerships team to explore commercial collaboration and technical synergy.'}
                </p>

                <Link
                  href={contactHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#54453D] px-8 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#75645B]"
                >
                  <span>{isAr ? 'تقديم طلب شراكة أعمال' : 'Apply for Partnership'}</span>
                  <ArrowIcon className="h-4 w-4" aria-hidden="true" />
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
