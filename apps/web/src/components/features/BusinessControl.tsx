import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  CalendarDays,
  Receipt,
  Users,
  UserRound,
  Boxes,
  Activity,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface BusinessControlProps {
  lang: Lang;
  className?: string;
}

export function BusinessControl({ lang, className }: BusinessControlProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'التحكم الإداري والتشغيلي الشامل',
        title: 'رؤية كاملة وتحكم لحظي في تفاصيل منشأتك',
        subtitle:
          'تمنح راش إكس صاحب المنشأة لوحة قيادة مركزية لمتابعة كافة مؤشرات العمل دون الحاجة للتواجد الدائم في الصالون.',
        pillars: [
          {
            icon: CalendarDays,
            title: 'متابعة الحجوزات والجدول',
            metric: '48 حجز يومي',
            sub: '39 مؤكدة · تحديث فوري',
            desc: 'مراقبة تدفق الحجوزات، ونسب الحضور، وتفادي فترات الركود عبر تنظيم المواعيد بدقة.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            icon: Receipt,
            title: 'التحكم المالي والمبيعات',
            metric: '12,480 ر.س',
            sub: 'إيراد اليوم · مطابقة النقدية',
            desc: 'رصد إجمالي المبيعات، ومقارنة الدفع بالبطاقات مع النقدية، وإغلاق الصندوق دون أخطاء محاسبية.',
            tone: 'bg-[#CADEE2]',
          },
          {
            icon: Users,
            title: 'أداء الفريق والعمولات',
            metric: '4 أخصائيات',
            sub: 'معدل إشغال 85%',
            desc: 'معرفة إنتاجية كل موظفة، وعدد الخدمات المنفذة، والعمولات المستحقة بشفافية تامة.',
            tone: 'bg-[#FAF9F8]',
          },
          {
            icon: UserRound,
            title: 'قاعدة وبيانات العملاء',
            metric: '11 عميلة جديدة',
            sub: 'معدل عودة متنامٍ',
            desc: 'تتبع معدل اكتساب العميلات، وسجل تفضيل الأخصائيات، وتاريخ الزيارات السابقة بدقة.',
            tone: 'bg-[#FAF9F8]',
          },
          {
            icon: Boxes,
            title: 'الرقابة على المخزون',
            metric: 'استهلاك لحظي',
            sub: 'صفر هدر في الجلسات',
            desc: 'خصم تلقائي لمستلزمات الصبغات والزيوت مع كل خدمة، وتنبيهات فورية قبل نفاد أي منتج.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            icon: Activity,
            title: 'الأداء العام للمنشأة',
            metric: 'مؤشرات فورية',
            sub: 'تقارير مالية وتشغيلية',
            desc: 'لوحة قيادة توضح ساعات الذروة، والخدمات الأعلى ربحية لاتخاذ قرارات توسع مدروسة.',
            tone: 'bg-[#91B8C0]/30',
          },
        ],
      }
    : {
        eyebrow: 'Executive Business Governance',
        title: 'Complete Visibility & Real-Time Salon Oversight',
        subtitle:
          'RASHX provides salon owners with a centralized operational cockpit monitoring critical performance indicators without requiring constant physical presence on the salon floor.',
        pillars: [
          {
            icon: CalendarDays,
            title: 'Appointment Flow Oversight',
            metric: '48 Daily Bookings',
            sub: '39 Confirmed · Live Sync',
            desc: 'Monitor chair occupancy, arrival rates, and eliminate idle gaps through coordinated scheduling.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            icon: Receipt,
            title: 'Financial & Sales Control',
            metric: '12,480 SAR',
            sub: 'Today Revenue · Balanced Drawer',
            desc: 'Track sales volume, cross-reference card vs. cash payments, and reconcile cash registers without discrepancies.',
            tone: 'bg-[#CADEE2]',
          },
          {
            icon: Users,
            title: 'Staff Performance & Payouts',
            metric: '4 Specialists',
            sub: '85% Chair Occupancy',
            desc: 'Assess individual stylist productivity, completed services count, and automated commission dues transparently.',
            tone: 'bg-[#FAF9F8]',
          },
          {
            icon: UserRound,
            title: 'Customer Directory & Retention',
            metric: '11 New Clients',
            sub: 'Growing Retention Rate',
            desc: 'Measure client acquisition, specialist preferences, and detailed historical visit notes.',
            tone: 'bg-[#FAF9F8]',
          },
          {
            icon: Boxes,
            title: 'Backbar Inventory Supervision',
            metric: 'Live Consumption',
            sub: 'Zero Backbar Leakage',
            desc: 'Automatic deduction of dyes and treatment products upon service delivery with threshold replenishment alerts.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            icon: Activity,
            title: 'Holistic Salon Performance',
            metric: 'Instant Intelligence',
            sub: 'Financial & Operational Reports',
            desc: 'A unified dashboard pinpointing peak operational hours and top-margin treatments for informed business expansion.',
            tone: 'bg-[#91B8C0]/30',
          },
        ],
      };

  return (
    <section
      id="business-control"
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

        {/* 6 Control Pillars Bento Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sectionContent.pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-8 transition-colors duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${pillar.tone} text-[#54453D]`}
                    >
                      <Icon className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-sm font-bold text-[#C78360]">
                      {pillar.metric}
                    </span>
                  </div>

                  <span className="mt-4 block text-xs font-semibold text-[#75645B]">
                    {pillar.sub}
                  </span>

                  <h3 className="mt-1 text-xl font-bold text-[#54453D]">
                    {pillar.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
