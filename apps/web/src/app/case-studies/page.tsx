/**
 * RASHX Case Studies & Success Stories Page
 *
 * Dedicated Route: /case-studies
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { TrendingUp, CheckCircle2 } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'قصص نجاح وتجارب المنشآت | RASHX Case Studies'
      : 'Client Case Studies & Proven Results | RASHX',
    description: isAr
      ? 'اطلع على نتائج تحول الصالونات ومراكز التجميل في السعودية بعد تطبيق منظومة راش إكس الرقمية.'
      : 'Discover real-world operational results and measurable revenue growth achieved by salons powered by RASHX.',
    path: '/case-studies',
    lang,
  });
}

export default async function CaseStudiesPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const cases = isAr
    ? [
        {
          name: 'مركز لوميير للعناية الشاملة',
          type: 'مركز تجميل نسائي وسبا (الرياض)',
          metric: '+48%',
          metricLabel: 'نمو الإيرادات السنوية',
          summary:
            'تم استبدال 4 برامج مشتتة بمنظومة RASHX الموحدة، مما مكن الإدارة من أتمتة حجوزات 85 موعداً يومياً دون أي تضارب وتقليص هدر المخزون بنسبة 30%.',
        },
        {
          name: 'سلسلة صالونات النخبة للرجال',
          type: 'سلسلة صالونات حلاقة رجالية (3 فروع - جدة)',
          metric: '92%',
          metricLabel: 'معدل حجز العملاء عبر النطاق المخصص',
          summary:
            'إطلاق موقع وتطبيق مستقل لكل فرع تحت نطاق فرعي معتمد، مما ضاعف نسبة الحجوزات المؤكدة مسبقاً وتخلص تماماً من طوابير الانتظار.',
        },
        {
          name: 'أورورا ميديكال سبا',
          type: 'سبا استرخاء وعناية صحية (الدمام)',
          metric: '100%',
          metricLabel: 'امتثال ضريبي ومرحلة ثانية ZATCA',
          summary:
            'ربط محاسبي لحظي ونظام عمولات مؤتمت لـ 24 أخصائية مع إصدار فوري للفواتير المشفرة وربطها ببوابات الدفع الإلكتروني.',
        },
      ]
    : [
        {
          name: 'Lumiere Beauty & Wellness',
          type: 'Luxury Women’s Salon & Spa (Riyadh)',
          metric: '+48%',
          metricLabel: 'Annual Revenue Growth',
          summary:
            'Consolidated 4 fragmented legacy tools into unified RASHX operating stack, scheduling 85 daily appointments with zero collision and reducing consumable waste by 30%.',
        },
        {
          name: 'Elite Grooming Lounge',
          type: 'Multi-Branch Men’s Barbershop (3 Branches - Jeddah)',
          metric: '92%',
          metricLabel: 'Online Self-Booking Share',
          summary:
            'Rolled out white-label booking portals across all locations, shifting customers from walk-in queues to scheduled pre-paid slots.',
        },
        {
          name: 'Aurora Wellness Retreat',
          type: 'Medical Spa & Relaxation Sanctuary (Dammam)',
          metric: '100%',
          metricLabel: 'ZATCA Phase 2 Tax Compliance',
          summary:
            'Instant cryptographic point-of-sale invoicing, automated staff commission splits for 24 therapists, and real-time inventory ledger audits.',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/case-studies" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#16A34A]/10 px-3 py-1 text-xs font-semibold text-[#16A34A]">
                <TrendingUp className="h-4 w-4" />
                <span>{isAr ? 'نتائج مثبتة وأرقام تشغيلية' : 'Proven Track Record'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'قصص نجاح منشآت راش إكس' : 'RASHX Client Case Studies'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'شواهد حية على كيفية مساعدة RASHX لأصحاب الصالونات على تنظيم أعمالهم ورفع كفاءتهم وأرباحهم'
                  : 'Concrete stories of operational modernization, workforce productivity, and commercial growth'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="space-y-8">
              {cases.map((cs) => (
                <div
                  key={cs.name}
                  className="rounded-3xl bg-[#FAF9F8] p-8 sm:p-12 transition-colors duration-200"
                >
                  <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                      <span className="text-xs font-semibold text-[#54453D]/60">{cs.type}</span>
                      <h3 className="mt-2 text-xl font-bold text-[#54453D] sm:text-2xl">
                        {cs.name}
                      </h3>
                      <p className="mt-4 text-base leading-relaxed text-[#54453D]/80">
                        {cs.summary}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#16A34A]">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{isAr ? 'منظومة RASHX المعتمدة' : 'Verified RASHX Deployment'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 text-center lg:col-span-4">
                      <span className="text-4xl font-black text-[#54453D] sm:text-5xl">
                        {cs.metric}
                      </span>
                      <span className="mt-2 text-xs font-bold uppercase tracking-wider text-[#54453D]/70">
                        {cs.metricLabel}
                      </span>
                    </div>
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

