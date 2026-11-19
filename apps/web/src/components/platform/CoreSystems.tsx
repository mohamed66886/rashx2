import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  GitBranch,
  Users,
  CalendarDays,
  UserRound,
  Scissors,
  Receipt,
  Boxes,
  Percent,
  Gift,
  BarChart3,
  CheckCircle2,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface CoreSystemsProps {
  lang: Lang;
  className?: string;
}

export function CoreSystems({ lang, className }: CoreSystemsProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'المحرك التشغيلي المتكامل',
        title: 'الأنظمة الأساسية لإدارة وتشغيل الصالونات ومراكز التجميل',
        subtitle:
          '10 أنظمة تخصصية تغطي دورة العمل اليومية بالكامل من لحظة حجز الموعد وحتى إصدار الفاتورة وحساب العمولات وتحليل الأرباح.',
        categories: [
          {
            categoryTitle: '1. الهيكل التنظيمي وإدارة فريق العمل',
            categoryTone: 'bg-[#F0C5AE]/40 text-[#54453D]',
            systems: [
              {
                id: 'sys-branches',
                title: 'نظام إدارة المنشأة والفروع',
                englishTitle: 'Multi-Branch & Facility Management',
                icon: GitBranch,
                description:
                  'إدارة متكاملة لفرع واحد أو شبكة فروع متعددة من شاشة واحدة، مع ضبط ساعات العمل وأيام الإجازات وتحديد الخدمات والموظفين المتاحين في كل فرع بشكل مستقل.',
                features: [
                  'لوحة قيادة مركزية لمتابعة كافة الفروع',
                  'إعدادات وساعات عمل مخصصة لكل فرع',
                  'فصل الحسابات المالية وإيرادات الفروع',
                  'نقل الموظفين وتوزيع الخدمات بمرونة',
                ],
              },
              {
                id: 'sys-staff',
                title: 'نظام إدارة الموظفين والصلاحيات',
                englishTitle: 'Staff Profiles & Role-Based Access',
                icon: Users,
                description:
                  'هيكلة صلاحيات دقيقة ومحكمة تحمي بيانات الصالون وتحدد مهام كل فرد (مدير، موظف استقبال، أخصائية)، مع جدولة ورديات العمل وأيام الإجازات وساعات الراحة.',
                features: [
                  'صلاحيات وصول دقيقة بحسب الدور الوظيفي',
                  'جدولة الورديات والإجازات وساعات العمل',
                  'ملف وظيفي شامل لكل أخصائية ومقدم خدمة',
                  'حماية التقارير المالية والبيانات الحساسة',
                ],
              },
            ],
          },
          {
            categoryTitle: '2. المواعيد وإدارة علاقات العملاء (CRM)',
            categoryTone: 'bg-[#91B8C0]/30 text-[#2C4349]',
            systems: [
              {
                id: 'sys-bookings',
                title: 'نظام الحجوزات والمواعيد والتقويم',
                englishTitle: 'Calendar & Smart Booking Engine',
                icon: CalendarDays,
                description:
                  'تقويم تفاعلي ذكي يمنع تضارب المواعيد تلقائيًا، ويدعم الحجز الذاتي أو اليدوي، مع فترات راحة ذكية بين الجلسات وتحديث حالة الزيارة لحظيًا (مؤكد، جاري، مكتمل، ملغي).',
                features: [
                  'تقويم مرئي حسب اليوم، الأسبوع، أو الأخصائية',
                  'منع التعارض والتكرار في المواعيد تلقائيًا',
                  'إتاحة فترات إعداد وتنظيف بين الجلسات',
                  'تأكيد المواعيد وتنبيهات فورية للعملاء',
                ],
              },
              {
                id: 'sys-crm',
                title: 'نظام إدارة العملاء وسجل المعاملات',
                englishTitle: 'Client CRM & Treatment History',
                icon: UserRound,
                description:
                  'ملف رقمي مفصل لكل عميلة يوثق تاريخ الزيارات، والخدمات السابقة، وتفضيلات الأخصائيات، وملاحظات الصبغات والتركيبات الخاصة، وإجمالي الإنفاق ومستوى الولاء.',
                features: [
                  'سجل تاريخي كامل لزيارات ومعاملات العميلة',
                  'تدوين ملاحظات الخدمة وتركيبات الصبغة بدقة',
                  'معرفة الأخصائية المفضلة وتكرار الزيارة',
                  'تتبع إجمالي المبيعات ومتوسط قيمة الفاتورة',
                ],
              },
            ],
          },
          {
            categoryTitle: '3. الخدمات ونقاط البيع السحابية (POS)',
            categoryTone: 'bg-[#F0C5AE]/40 text-[#54453D]',
            systems: [
              {
                id: 'sys-services',
                title: 'نظام إدارة الخدمات والتسعير',
                englishTitle: 'Services Catalog & Dynamic Pricing',
                icon: Scissors,
                description:
                  'تصنيف ذكي للخدمات في فئات رئيسية وفرعية، وتحديد مدد التنفيذ، وتعيين الأخصائيات المؤهلات لكل خدمة، وتحديد الأسعار والباقات الترويجية المتنوعة.',
                features: [
                  'تصنيف شجري للخدمات (شعر، بشرة، سبا، أظافر)',
                  'تحديد مدة تنفيذ كل خدمة بدقة متناهية',
                  'باقات مجمعة (Packages) وعروض مخصصة',
                  'ربط الخدمات بالأخصائيات والمنتجات المستهلكة',
                ],
              },
              {
                id: 'sys-pos',
                title: 'نظام نقاط البيع والفواتير السحابية',
                englishTitle: 'Cloud POS & Smart Checkout',
                icon: Receipt,
                description:
                  'كاشير سحابي فائق السرعة يدعم طرق الدفع المتعددة (نقدي، شبكة، دفع مقسم)، مع إغلاق درج الكاش اليومي ومطابقة الحسابات وإصدار الفواتير الضريبية المبسطة فورًا.',
                features: [
                  'إتمام عملية الدفع في ثوانٍ معدودة',
                  'دعم الدفع المجزأ (Split Payment) وتعدد البطاقات',
                  'إصدار فواتير ضريبية مبسطة مع رمز الاستجابة السريع (QR)',
                  'إغلاق اليومية ومطابقة النقدية مع مبيعات الشبكة',
                ],
              },
            ],
          },
          {
            categoryTitle: '4. المخزون والعمولات التشغيلية',
            categoryTone: 'bg-[#91B8C0]/30 text-[#2C4349]',
            systems: [
              {
                id: 'sys-inventory',
                title: 'نظام إدارة المخزون والمشتريات',
                englishTitle: 'Inventory & Consumption Tracking',
                icon: Boxes,
                description:
                  'تتبع دقيق لمنتجات البيع بالتجزئة ومنتجات الاستهلاك الداخلي لجلسات الصالون، مع الخصم التلقائي عند تقديم الخدمات وإرسال تنبيهات عند وصول الكميات للحد الأدنى.',
                features: [
                  'فصل منتجات البيع عن مستهلكات جلسات الصالون',
                  'خصم استهلاك الجلسات من المخزن آليًا',
                  'تنبيهات فورية عند انخفاض كمية أي منتج',
                  'إدارة أوامر الشراء والموردين وسجل الوارد',
                ],
              },
              {
                id: 'sys-commissions',
                title: 'نظام العمولات والحوافز الذكية',
                englishTitle: 'Commissions & Staff Performance',
                icon: Percent,
                description:
                  'أتمتة كاملة لاحتساب عمولات الأخصائيات على الخدمات ومبيعات المنتجات بنسب ثابتة أو متدرجة، مما يقضي على الحسابات اليدوية ويعزز الشفافية والتحفيز.',
                features: [
                  'احتساب تلقائي لعمولات الخدمات والمنتجات',
                  'دعم النسب المئوية أو المبالغ الثابتة',
                  'تقارير تفصيلية لكل أخصائية بنهاية كل فترة',
                  'تحفيز المبيعات ورفع إنتاجية فريق العمل',
                ],
              },
            ],
          },
          {
            categoryTitle: '5. النمو والولاء والتحليلات المؤسسية',
            categoryTone: 'bg-[#FAF9F8] text-[#54453D]',
            systems: [
              {
                id: 'sys-loyalty',
                title: 'نظام ولاء العملاء والعروض والخصومات',
                englishTitle: 'Loyalty Engine & Promotional Campaigns',
                icon: Gift,
                description:
                  'أدوات تسويقية متقدمة لزيادة معدل تكرار الزيارة، تشمل برامج نقاط المكافآت، وكوبونات الخصم، والاشتراكات الشهرية، وعروض المناسبات الخاصة.',
                features: [
                  'برنامج نقاط ولاء مع كل ريال يُنفق في الصالون',
                  'كوبونات وخصومات بنسب مئوية أو مبالغ محددة',
                  'عروض ترويجية محدودة بفترة زمنية أو فرع معين',
                  'زيادة معدل ولاء العميلات وعودتهن للصالون',
                ],
              },
              {
                id: 'sys-analytics',
                title: 'نظام التقارير والتحليلات ولوحات المتابعة',
                englishTitle: 'Business Intelligence & Executive Analytics',
                icon: BarChart3,
                description:
                  'لوحات متابعة بيانية ترصد مؤشرات الأداء الرئيسية: الإيرادات اليومية والشهرية، الخدمات الأكثر طلبًا، ساعات الذروة، ونسب إشغال الموظفات لاتخاذ قرارات مدروسة.',
                features: [
                  'تقارير إيرادات وأرباح لحظية وقابلة للتصدير',
                  'تحليل الخدمات الأكثر مبيعًا والأنشطة الأعلى ربحية',
                  'قياس معدلات إشغال وإنتاجية كل أخصائية',
                  'تحديد أوقات الذروة لتوزيع المواعيد بكفاءة',
                ],
              },
            ],
          },
        ],
      }
    : {
        eyebrow: 'The Operational Engine',
        title: 'Core Systems for Salon & Spa Operations',
        subtitle:
          '10 specialized management systems covering every stage of daily operations, from appointment reservation to POS checkout, commission payouts, and growth analytics.',
        categories: [
          {
            categoryTitle: '1. Organizational Structure & Staff Management',
            categoryTone: 'bg-[#F0C5AE]/40 text-[#54453D]',
            systems: [
              {
                id: 'sys-branches',
                title: 'Multi-Branch & Facility Management',
                englishTitle: 'Centralized Branch Control',
                icon: GitBranch,
                description:
                  'Centralized oversight across single or multi-location salons, with custom operating hours, individual tax setups, and branch-specific service assignments from a single screen.',
                features: [
                  'Unified multi-branch executive control center',
                  'Branch-specific operating schedules & holidays',
                  'Isolated branch financial ledgers & performance',
                  'Flexible staff and service allocation',
                ],
              },
              {
                id: 'sys-staff',
                title: 'Staff Profiles & Role-Based Access',
                englishTitle: 'Security & Shift Scheduling',
                icon: Users,
                description:
                  'Granular access controls safeguarding sensitive salon data across roles (Owner, Manager, Receptionist, Specialist), with work shift rosters and leave management.',
                features: [
                  'Fine-grained role boundaries per employee',
                  'Working shift scheduling, breaks & leave tracking',
                  'Comprehensive profiles for every stylist & therapist',
                  'Protection of financial reports and client data',
                ],
              },
            ],
          },
          {
            categoryTitle: '2. Appointments & Client Relationship Management (CRM)',
            categoryTone: 'bg-[#91B8C0]/30 text-[#2C4349]',
            systems: [
              {
                id: 'sys-bookings',
                title: 'Calendar & Smart Booking Engine',
                englishTitle: 'Conflict-Free Scheduling',
                icon: CalendarDays,
                description:
                  'An intelligent visual calendar automatically preventing double bookings, supporting online or manual booking, clean-up buffer buffers, and real-time status updates.',
                features: [
                  'Visual schedule by day, week, or specialist',
                  'Automated double-booking prevention logic',
                  'Buffer times for cleaning and preparation between visits',
                  'Instant booking confirmation & client reminders',
                ],
              },
              {
                id: 'sys-crm',
                title: 'Client CRM & Treatment History',
                englishTitle: 'Formulas & Spending Records',
                icon: UserRound,
                description:
                  'Detailed digital client profiles tracking visit histories, past services, preferred specialists, hair color formula notes, and total lifetime value.',
                features: [
                  'Complete timeline of client visits & treatments',
                  'Precise technical formula & preference notes',
                  'Preferred specialist tracking & rebooking frequency',
                  'Lifetime spend and average ticket value metrics',
                ],
              },
            ],
          },
          {
            categoryTitle: '3. Services & Cloud Point of Sale (POS)',
            categoryTone: 'bg-[#F0C5AE]/40 text-[#54453D]',
            systems: [
              {
                id: 'sys-services',
                title: 'Services Catalog & Dynamic Pricing',
                englishTitle: 'Menu & Packages Hierarchy',
                icon: Scissors,
                description:
                  'Hierarchical categorization of salon services, precise duration allocations, qualification assignments for specialists, and package bundles.',
                features: [
                  'Category hierarchy (Hair, Nails, Skincare, Spa)',
                  'Exact duration and turnaround buffers per service',
                  'Curated service bundles and seasonal packages',
                  'Direct linkage between services and consumed products',
                ],
              },
              {
                id: 'sys-pos',
                title: 'Cloud POS & Smart Checkout',
                englishTitle: 'Fast Billing & Split Payments',
                icon: Receipt,
                description:
                  'Lightning-fast checkout supporting multiple payment methods (cash, card, split payments), daily cash drawer reconciliation, and instant simplified tax invoices.',
                features: [
                  'Checkout completed in seconds per client',
                  'Flexible split payments across cards and cash',
                  'Instant Simplified Tax Invoices with ZATCA QR codes',
                  'Daily register reconciliation matching cash and terminal totals',
                ],
              },
            ],
          },
          {
            categoryTitle: '4. Operations & Commission Automation',
            categoryTone: 'bg-[#91B8C0]/30 text-[#2C4349]',
            systems: [
              {
                id: 'sys-inventory',
                title: 'Inventory & Consumption Tracking',
                englishTitle: 'Stock & Supplier Orders',
                icon: Boxes,
                description:
                  'Meticulous tracking of retail merchandise versus internal backbar consumption, with automated deductions upon service completion and low-stock alerts.',
                features: [
                  'Distinct retail products vs. backbar internal supplies',
                  'Automated stock deduction upon service delivery',
                  'Instant low-stock threshold notifications',
                  'Purchase orders and supplier receiving logs',
                ],
              },
              {
                id: 'sys-commissions',
                title: 'Commissions & Staff Performance',
                englishTitle: 'Automated Incentive Engine',
                icon: Percent,
                description:
                  'Fully automated commission calculations on services and retail sales with tiered or flat percentages, eliminating spreadsheets and driving staff motivation.',
                features: [
                  'Automated service and product sales commission calculation',
                  'Support for percentage tiers or fixed monetary bonuses',
                  'Detailed transparent payout summaries for each specialist',
                  'Incentivizes sales and elevates overall team productivity',
                ],
              },
            ],
          },
          {
            categoryTitle: '5. Growth, Loyalty & Executive Analytics',
            categoryTone: 'bg-[#FAF9F8] text-[#54453D]',
            systems: [
              {
                id: 'sys-loyalty',
                title: 'Loyalty Engine & Promotional Campaigns',
                englishTitle: 'Rewards & Retention',
                icon: Gift,
                description:
                  'Strategic marketing tools designed to maximize client retention: point accrual per riyal spent, promo discount codes, and seasonal campaign incentives.',
                features: [
                  'Points program earning rewards on every riyal spent',
                  'Percentage and fixed-amount promotional vouchers',
                  'Time-limited campaigns targeted by branch or service',
                  'Measurable increase in repeat salon visits',
                ],
              },
              {
                id: 'sys-analytics',
                title: 'Business Intelligence & Executive Analytics',
                englishTitle: 'Actionable Performance Insights',
                icon: BarChart3,
                description:
                  'Real-time executive dashboards monitoring key performance indicators: daily revenues, peak operational hours, specialist utilization, and client retention.',
                features: [
                  'Live exportable financial and operational reports',
                  'Top-performing services and high-margin treatments',
                  'Specialist utilization and booking occupancy rates',
                  'Peak hour identification for smart schedule distribution',
                ],
              },
            ],
          },
        ],
      };

  return (
    <section
      id="core-systems"
      className={`relative bg-[#FAF9F8] py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* Section Header with SectionTitle */}
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

        {/* 5 Categories Bento Stream */}
        <div className="mt-12 sm:mt-16 space-y-10 sm:space-y-12">
          {sectionContent.categories.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-4">
              {/* Category Pill Header */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block rounded-xl px-4 py-1.5 text-xs sm:text-sm font-bold ${cat.categoryTone}`}
                >
                  {cat.categoryTitle}
                </span>
              </div>

              {/* Systems 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {cat.systems.map((sys) => {
                  const Icon = sys.icon;
                  return (
                    <article
                      key={sys.id}
                      className="flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-8 transition-colors duration-200"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF9F8] text-[#54453D]">
                            <Icon className="h-6 w-6 text-[#C78360]" aria-hidden="true" />
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#91B8C0]/20 px-2.5 py-0.5 text-[0.7rem] font-bold text-[#2C4349]">
                            <CheckCircle2 className="h-3 w-3 text-[#16A34A]" aria-hidden="true" />
                            <span>{isAr ? 'نظام معتمد' : 'Verified Module'}</span>
                          </span>
                        </div>

                        <h3 className="mt-4 text-xl sm:text-2xl font-bold text-[#54453D]">
                          {sys.title}
                        </h3>

                        <p className="mt-0.5 text-xs font-semibold text-[#75645B]">
                          {sys.englishTitle}
                        </p>

                        <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#75645B]">
                          {sys.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-5 space-y-2">
                        <ul className="space-y-2 text-xs sm:text-sm text-[#54453D]">
                          {sys.features.map((feat) => (
                            <li key={feat} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C78360] shrink-0" />
                              <span className="leading-relaxed">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
