import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Scissors,
  Store,
  Building2,
  CheckCircle2,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface OurFocusProps {
  lang: Lang;
  className?: string;
}

export function OurFocus({ lang, className }: OurFocusProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'مجال تخصصنا',
        title: 'تركيز دقيق وحصري على قطاع الجمال والعناية',
        subtitle:
          'لا نقدم برمجيات عامة؛ بل نُكرس كافة جهودنا الهندسية والتطويرية لخدمة ثلاثة قطاعات متخصصة ترتبط ارتباطًا وثيقًا بالجمال والراحة الشخصية.',
        sectors: [
          {
            icon: Scissors,
            title: 'صالونات التجميل والحلاقة',
            englishTitle: 'Beauty Salons & Barbershops',
            desc: 'حلول عملية تضبط تدفق المواعيد، وتدير كراسي الخدمة، وتسهل الحسابات السريعة على الكاشير، مع حساب عمولات مصففي الشعر والأخصائيات بدقة تامة.',
            features: [
              'تنظيم جداول مصففات الشعر والأظافر',
              'تسجيل مبيعات الكاشير وسرعة إتمام الفاتورة',
              'إتاحة الحجز الذاتي المباشر للعملاء',
            ],
            tone: 'bg-[#F0C5AE]',
          },
          {
            icon: Store,
            title: 'مراكز التجميل والعناية الشاملة',
            englishTitle: 'Beauty & Aesthetic Centers',
            desc: 'منظومة متقدمة تناسب المنشآت ذات الأقسام المتعددة، تتيح توثيق التاريخ الفني لخدمات البشرة والشعر، ومتابعة استهلاك المواد والصبغات في كل جلسة.',
            features: [
              'أرشفة تركيبات الصبغات والملاحظات الخاصة',
              'إدارة ورديات طواقم العمل متعددة التخصصات',
              'مراقبة استهلاك مستلزمات الصالون بدقة',
            ],
            tone: 'bg-[#CADEE2]',
          },
          {
            icon: Building2,
            title: 'مراكز السبا والاسترخاء',
            englishTitle: 'Spas & Wellness Centers',
            desc: 'أدوات لإدارة الغرف والجلسات العلاجية ذات الفترات المحددة، وتنظيم الباقات المجمعة، وتوفير تجربة استقبال هادئة ومنظمة للعملاء.',
            features: [
              'جدولة غرف المساج وجلسات الاسترخاء',
              'إدارة باقات الخدمات والاشتراكات المتنوعة',
              'توزيع فترات الراحة والتجهيز بين الجلسات',
            ],
            tone: 'bg-[#FAF9F8]',
          },
        ],
      }
    : {
        eyebrow: 'Our Sector Focus',
        title: 'Exclusive, Purpose-Built Focus on Beauty & Wellness',
        subtitle:
          'We do not build generic software. Every engineering effort is dedicated exclusively to serving three specialized verticals in personal care and aesthetic wellness.',
        sectors: [
          {
            icon: Scissors,
            title: 'Beauty Salons & Barbershops',
            englishTitle: 'Hair & Grooming Studios',
            desc: 'Targeted tools regulating chair occupancy, accelerating POS checkout, and transparently calculating stylist commissions.',
            features: [
              'Hair and nail specialist scheduling',
              'Lightning-fast checkout and tax invoicing',
              'Direct 24/7 client online self-booking',
            ],
            tone: 'bg-[#F0C5AE]',
          },
          {
            icon: Store,
            title: 'Aesthetic & Beauty Centers',
            englishTitle: 'Comprehensive Beauty Clinics',
            desc: 'An advanced operational hub for multi-department centers, documenting skin treatment formulas, notes, and backbar product consumption.',
            features: [
              'Color formula archiving and technical notes',
              'Multi-department shift coordination',
              'Real-time backbar stock tracking',
            ],
            tone: 'bg-[#CADEE2]',
          },
          {
            icon: Building2,
            title: 'Spas & Wellness Centers',
            englishTitle: 'Day Spas & Retreats',
            desc: 'Specialized suite managing therapy rooms, fixed session durations, bundled packages, and serene reception journeys.',
            features: [
              'Therapy room and massage slot management',
              'Service package and bundle coordination',
              'Sanitation and turnaround buffers between bookings',
            ],
            tone: 'bg-[#FAF9F8]',
          },
        ],
      };

  return (
    <section
      id="our-focus"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            eyebrow={sectionContent.eyebrow}
            title={sectionContent.title}
            align="center"
            withWordmark={true}
          />
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B]">
            {sectionContent.subtitle}
          </p>
        </div>

        {/* 3 Sectors Bento Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {sectionContent.sectors.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.title}
                className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 lg:p-10 transition-colors duration-200 text-start"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${sec.tone} text-[#54453D]`}
                    >
                      <Icon className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#75645B]">
                      {sec.englishTitle}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl sm:text-2xl font-bold text-[#54453D]">
                    {sec.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                    {sec.desc}
                  </p>
                </div>

                <div className="mt-6 pt-5 space-y-2">
                  <ul className="space-y-2 text-xs sm:text-sm text-[#54453D]">
                    {sec.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}

