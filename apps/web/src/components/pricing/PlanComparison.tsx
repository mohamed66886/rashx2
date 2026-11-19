import { Fragment } from 'react';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { CheckCircle2, Minus } from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface PlanComparisonProps {
  lang: Lang;
  className?: string;
}

export function PlanComparison({ lang, className }: PlanComparisonProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'مقارنة الباقات والقدرات',
        title: 'مقارنة دقيقة وشاملة بين باقات RASHX',
        subtitle:
          'جدول يوضح الفروقات الفعلية والقدرات المتاحة في كل باقة لمساعدتك على اختيار الخيار الأنسب لحجم منشأتك وطبيعة تشغيلك.',
        plans: ['باقة الانطلاق', 'باقة الصالون المتكامل', 'باقة السلاسل والمراكز'],
        categories: [
          {
            title: 'المواعيد والعمليات الأساسية',
            items: [
              { name: 'تقويم مواعيد تفاعلي يمنع الحجز المزدوج', starter: true, pro: true, ent: true },
              { name: 'إدارة وتصنيف الخدمات وتحديد الأسعار والمدد', starter: true, pro: true, ent: true },
              { name: 'تحديد فترات تنظيف وتجهيز بين الجلسات', starter: true, pro: true, ent: true },
              { name: 'تتبع حالة الموعد (مؤكد، جاري، مكتمل، ملغي)', starter: true, pro: true, ent: true },
            ],
          },
          {
            title: 'نقاط البيع والفواتير الضريبية',
            items: [
              { name: 'كاشير سحابي سريع لتسجيل المبيعات', starter: true, pro: true, ent: true },
              { name: 'فواتير ضريبية مبسطة مع رمز الاستجابة السريع (QR)', starter: true, pro: true, ent: true },
              { name: 'دعم الدفع المجزأ (نقدي + بطاقات)', starter: true, pro: true, ent: true },
              { name: 'مطابقة النقدية مع نقاط البيع اليومية', starter: true, pro: true, ent: true },
            ],
          },
          {
            title: 'إدارة العملاء والفريق',
            items: [
              { name: 'ملفات العملاء وسجل الزيارات السابقة', starter: true, pro: true, ent: true },
              { name: 'أرشفة تركيبات الصبغات والملاحظات الفنية الخاصة', starter: false, pro: true, ent: true },
              { name: 'احتساب عمولات وحوافز الأخصائيات آليًا', starter: false, pro: true, ent: true },
              { name: 'جدول مواعيد خاص لكل أخصائية ومقدم خدمة', starter: true, pro: true, ent: true },
            ],
          },
          {
            title: 'التجربة الرقمية والمخزون والنمو',
            items: [
              { name: 'موقع إلكتروني وبوابة حجز ذاتي للعميلات 24/7', starter: false, pro: true, ent: true },
              { name: 'مراقبة استهلاك مستلزمات الصالون في الجلسات', starter: false, pro: true, ent: true },
              { name: 'تقارير مالية وتشغيلية تفصيلية لحظية', starter: false, pro: true, ent: true },
              { name: 'إدارة موحدة للفروع المتعددة من لوحة واحدة', starter: false, pro: false, ent: true },
              { name: 'جاهزية دعم النطاق المخصص للمنشأة', starter: false, pro: false, ent: true },
              { name: 'مدير حساب مخصص وتدريب ميداني شامل', starter: false, pro: false, ent: true },
            ],
          },
        ],
      }
    : {
        eyebrow: 'Detailed Plan Comparison',
        title: 'Comprehensive Capability Comparison Across Tiers',
        subtitle:
          'A transparent overview detailing the actual operational boundaries and features available across each tier to help you determine the ideal fit.',
        plans: ['Starter Plan', 'Integrated Salon Pro', 'Enterprise & Spas'],
        categories: [
          {
            title: 'Appointments & Core Operations',
            items: [
              { name: 'Interactive visual calendar with conflict prevention', starter: true, pro: true, ent: true },
              { name: 'Service hierarchy, dynamic pricing & duration allocation', starter: true, pro: true, ent: true },
              { name: 'Sanitation and preparation buffers between bookings', starter: true, pro: true, ent: true },
              { name: 'Live appointment status tracking (Confirmed, In Progress, Done)', starter: true, pro: true, ent: true },
            ],
          },
          {
            title: 'Point of Sale & Tax Invoicing',
            items: [
              { name: 'High-speed cloud POS register', starter: true, pro: true, ent: true },
              { name: 'ZATCA-compliant Simplified Tax Invoices with QR', starter: true, pro: true, ent: true },
              { name: 'Split payments (Cash + Mada/Credit)', starter: true, pro: true, ent: true },
              { name: 'Daily cash drawer reconciliation and settlement', starter: true, pro: true, ent: true },
            ],
          },
          {
            title: 'Clients & Team Management',
            items: [
              { name: 'Customer profiles and historical visit timeline', starter: true, pro: true, ent: true },
              { name: 'Color formula notes and treatment archives', starter: false, pro: true, ent: true },
              { name: 'Automated specialist commission calculation engine', starter: false, pro: true, ent: true },
              { name: 'Individual schedule rosters for each team member', starter: true, pro: true, ent: true },
            ],
          },
          {
            title: 'Digital Presence, Stock & Expansion',
            items: [
              { name: '24/7 branded web booking portal', starter: false, pro: true, ent: true },
              { name: 'Real-time backbar stock deduction during treatments', starter: false, pro: true, ent: true },
              { name: 'Detailed financial analytics and operational metrics', starter: false, pro: true, ent: true },
              { name: 'Unified multi-branch executive control center', starter: false, pro: false, ent: true },
              { name: 'Custom domain integration readiness', starter: false, pro: false, ent: true },
              { name: 'Dedicated account manager and onsite training sessions', starter: false, pro: false, ent: true },
            ],
          },
        ],
      };

  return (
    <section
      id="comparison"
      className={`relative bg-[#FAF9F8] py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
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

        {/* Comparison Table Container (Flat, Borderless, Shadowless) */}
        <div className="mt-12 sm:mt-16 overflow-x-auto rounded-3xl bg-white p-6 sm:p-8 lg:p-10 text-[#54453D]">
          <table className="w-full min-w-[640px] text-start">
            <thead>
              <tr>
                <th className="py-4 text-start font-extrabold text-base sm:text-lg text-[#54453D] w-2/5">
                  {isAr ? 'القدرات والوظائف' : 'Capabilities & Features'}
                </th>
                <th className="py-4 text-center font-bold text-sm sm:text-base text-[#54453D] w-1/5">
                  {sectionContent.plans[0]}
                </th>
                <th className="py-4 text-center font-bold text-sm sm:text-base text-[#C78360] w-1/5 bg-[#F0C5AE]/20 rounded-t-2xl">
                  {sectionContent.plans[1]}
                </th>
                <th className="py-4 text-center font-bold text-sm sm:text-base text-[#2C4349] w-1/5">
                  {sectionContent.plans[2]}
                </th>
              </tr>
            </thead>
            <tbody>
              {sectionContent.categories.map((cat) => (
                <Fragment key={cat.title}>
                  {/* Category Header Row */}
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 pt-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#C78360] bg-[#FAF9F8] px-4 rounded-xl"
                    >
                      {cat.title}
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {cat.items.map((item, idx) => (
                    <tr
                      key={item.name}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF9F8]/60'}
                    >
                      <td className="py-3 px-4 text-xs sm:text-sm font-semibold text-[#54453D]">
                        {item.name}
                      </td>
                      <td className="py-3 text-center">
                        {item.starter ? (
                          <CheckCircle2 className="h-4 w-4 text-[#16A34A] mx-auto" aria-hidden="true" />
                        ) : (
                          <Minus className="h-4 w-4 text-[#75645B]/40 mx-auto" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {item.starter ? (isAr ? 'متوفر' : 'Included') : (isAr ? 'غير متوفر' : 'Not included')}
                        </span>
                      </td>
                      <td className="py-3 text-center bg-[#F0C5AE]/10">
                        {item.pro ? (
                          <CheckCircle2 className="h-4 w-4 text-[#16A34A] mx-auto" aria-hidden="true" />
                        ) : (
                          <Minus className="h-4 w-4 text-[#75645B]/40 mx-auto" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {item.pro ? (isAr ? 'متوفر' : 'Included') : (isAr ? 'غير متوفر' : 'Not included')}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {item.ent ? (
                          <CheckCircle2 className="h-4 w-4 text-[#16A34A] mx-auto" aria-hidden="true" />
                        ) : (
                          <Minus className="h-4 w-4 text-[#75645B]/40 mx-auto" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {item.ent ? (isAr ? 'متوفر' : 'Included') : (isAr ? 'غير متوفر' : 'Not included')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </PageContainer>
    </section>
  );
}
