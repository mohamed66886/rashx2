import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  CalendarDays,
  UserRound,
  Users,
  Receipt,
  Boxes,
  BarChart3,
  CheckCircle2,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface FeatureCategoriesProps {
  lang: Lang;
  className?: string;
}

export function FeatureCategories({ lang, className }: FeatureCategoriesProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'تصنيف وظائف المنظومة',
        title: 'تنظيم شامل لكافة جوانب العمل في منشأتك',
        subtitle:
          'مجموعة متكاملة من الأدوات التخصصية المصممة لتلبية متطلبات صالونات ومراكز التجميل في السعودية، موزعة في 6 محاور تشغيلية أساسية.',
        categories: [
          {
            id: 'operations',
            title: 'إدارة العمليات والمواعيد',
            englishTitle: 'Operations & Scheduling',
            icon: CalendarDays,
            tone: 'bg-[#F0C5AE]',
            description: 'تنظيم جدول الصالون ومنع التضارب وتسهيل تدفق العميلات يوميًا.',
            features: [
              'تقويم مواعيد تفاعلي يمنع التضارب تلقائيًا',
              'تصنيف شجري للخدمات وتحديد مدد التنفيذ',
              'فترات تجهيز وتنظيف بين الجلسات',
              'تتبع حالة الموعد (مؤكد، جاري، مكتمل، ملغي)',
            ],
          },
          {
            id: 'crm',
            title: 'إدارة علاقات العملاء (CRM)',
            englishTitle: 'Client CRM & Profiles',
            icon: UserRound,
            tone: 'bg-[#91B8C0]/30',
            description: 'بناء علاقات طويلة الأمد مع عميلاتك وتوثيق كافة تفاصيل زياراتهن.',
            features: [
              'ملف رقمي مفصل لكل عميلة مع سجل الزيارات',
              'تدوين ملاحظات الصبغة والتركيبات الفنية الخاصة',
              'معرفة الأخصائية المفضلة وتكرار الحجوزات',
              'تتبع إجمالي المبيعات ومتوسط قيمة الفاتورة',
            ],
          },
          {
            id: 'team',
            title: 'إدارة الفريق والعمولات',
            englishTitle: 'Staff & Commissions',
            icon: Users,
            tone: 'bg-[#CADEE2]',
            description: 'تمكين الأخصائيات وتنظيم الورديات واحتساب الحوافز بنزاهة وشفافية.',
            features: [
              'ملف وظيفي لكل أخصائية ومقدم خدمة',
              'صلاحيات محكمة بحسب الدور (مدير، استقبال، أخصائية)',
              'جدول حجوزات خاص لكل موظفة في فريق العمل',
              'احتساب فوري لعمولات الخدمات ومبيعات المنتجات',
            ],
          },
          {
            id: 'pos',
            title: 'نقاط البيع والفواتير (POS)',
            englishTitle: 'Cloud POS & Billing',
            icon: Receipt,
            tone: 'bg-[#FAF9F8]',
            description: 'تسريع عمليات الدفع وإصدار فواتير ضريبية نظامية متوافقة.',
            features: [
              'كاشير سحابي سريع الاستجابة في أوقات الذروة',
              'دعم الدفع المجزأ (نقدي + شبكة في نفس المعاملة)',
              'فواتير ضريبية مبسطة مع رمز الاستجابة السريع (QR)',
              'مطابقة النقدية مع نقاط البيع وإغلاق الوردية اليومية',
            ],
          },
          {
            id: 'inventory',
            title: 'إدارة المخزون والاستهلاك',
            englishTitle: 'Inventory & Supplies',
            icon: Boxes,
            tone: 'bg-[#FAF9F8]',
            description: 'مراقبة دقيقة لمخزون المنتجات وتفادي نفاد المستلزمات فجأة.',
            features: [
              'فصل منتجات التجزئة عن مستهلكات الصالون الداخلية',
              'خصم آلي للكميات المستهلكة مع كل خدمة منفذة',
              'تنبيهات فورية عند وصول أي منتج للحد الأدنى',
              'سجل حركات المخزون والواردات بوضوح',
            ],
          },
          {
            id: 'analytics',
            title: 'التقارير ومؤشرات الأداء',
            englishTitle: 'Analytics & Dashboards',
            icon: BarChart3,
            tone: 'bg-[#F0C5AE]',
            description: 'لوحات بيانية لحظية تمنح الإدارة رؤية واضحة للنمو والأرباح.',
            features: [
              'تقارير إيرادات يومية وشهرية دقيقة وقابلة للتصدير',
              'متابعة الخدمات الأكثر مبيعًا ومعدلات إشغال الكراسي',
              'قياس إنتاجية الأخصائيات ومساهمتهن في الدخل',
              'عزل كامل وسرية تامة لكافة البيانات المالية',
            ],
          },
        ],
      }
    : {
        eyebrow: 'Platform Functional Hierarchy',
        title: 'Comprehensive Organization for Every Facet of Your Salon',
        subtitle:
          'A specialized suite of verified management capabilities engineered for beauty centers and spas in Saudi Arabia, organized across 6 core operational pillars.',
        categories: [
          {
            id: 'operations',
            title: 'Operations & Scheduling',
            englishTitle: 'Calendar & Services',
            icon: CalendarDays,
            tone: 'bg-[#F0C5AE]',
            description: 'Organize your salon schedule, prevent double bookings, and streamline client flow.',
            features: [
              'Interactive calendar with automatic conflict prevention',
              'Hierarchical service catalog with exact durations',
              'Turnaround preparation & sanitation buffer buffers',
              'Live appointment status tracking (Confirmed, In Progress, Completed)',
            ],
          },
          {
            id: 'crm',
            title: 'Client Management (CRM)',
            englishTitle: 'Profiles & History',
            icon: UserRound,
            tone: 'bg-[#91B8C0]/30',
            description: 'Cultivate enduring client relationships and document treatment preferences.',
            features: [
              'Detailed client profile with historical visit records',
              'Color formula notes and treatment specifications',
              'Favorite specialist tracking and booking frequency',
              'Total spend tracking and average ticket value metrics',
            ],
          },
          {
            id: 'team',
            title: 'Staff & Commission Automation',
            englishTitle: 'Rosters & Incentives',
            icon: Users,
            tone: 'bg-[#CADEE2]',
            description: 'Empower stylists, regulate shifts, and calculate incentives transparently.',
            features: [
              'Staff profiles with service qualifications and schedules',
              'Strict role boundaries (Manager, Receptionist, Specialist)',
              'Individual appointment lineup for each team member',
              'Automated commission calculation on services and retail sales',
            ],
          },
          {
            id: 'pos',
            title: 'Point of Sale & Invoicing',
            englishTitle: 'POS & ZATCA Billing',
            icon: Receipt,
            tone: 'bg-[#FAF9F8]',
            description: 'Accelerate checkout and issue compliant simplified tax invoices.',
            features: [
              'High-speed cloud POS built for peak business hours',
              'Split payments across multiple cards and cash in one bill',
              'Compliant Simplified Tax Invoices with encrypted QR codes',
              'Daily register reconciliation and terminal matching',
            ],
          },
          {
            id: 'inventory',
            title: 'Inventory & Supplies',
            englishTitle: 'Stock & Backbar',
            icon: Boxes,
            tone: 'bg-[#FAF9F8]',
            description: 'Meticulous stock supervision preventing unexpected product depletion.',
            features: [
              'Distinct tracking for retail merchandise vs. backbar supplies',
              'Automated inventory deduction upon service completion',
              'Instant notifications when inventory hits low-stock limits',
              'Complete movement logs and incoming delivery records',
            ],
          },
          {
            id: 'analytics',
            title: 'Reports & Business Intelligence',
            englishTitle: 'Insights & Metrics',
            icon: BarChart3,
            tone: 'bg-[#F0C5AE]',
            description: 'Live performance dashboards giving owners crystal-clear financial clarity.',
            features: [
              'Real-time exportable daily and monthly revenue reports',
              'Top-selling services and chair occupancy metrics',
              'Specialist productivity and revenue contribution rates',
              'Complete logical isolation safeguarding financial data',
            ],
          },
        ],
      };

  return (
    <section
      id="categories"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* Section Title */}
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

        {/* Categories 6-Card Bento Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sectionContent.categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <article
                key={cat.id}
                className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 transition-colors duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${cat.tone} text-[#54453D]`}
                    >
                      <Icon className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#75645B]">
                      {cat.englishTitle}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl sm:text-2xl font-bold text-[#54453D]">
                    {cat.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#54453D]">
                    {isAr ? 'الوظائف المعتمدة:' : 'Verified Capabilities:'}
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#54453D]">
                    {cat.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}

