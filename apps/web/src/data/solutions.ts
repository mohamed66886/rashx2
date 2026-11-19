export interface LocalizedText {
  ar: string;
  en: string;
}

export interface SolutionCapability {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface SolutionImpact {
  title: LocalizedText;
  description: LocalizedText;
}

export interface SolutionData {
  slug: string;
  path: string;
  badge: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedText[];
  capabilities: SolutionCapability[];
  impactTitle: LocalizedText;
  impacts: SolutionImpact[];
  ecosystemTitle: LocalizedText;
  ecosystemDescription: LocalizedText;
  ecosystemConnections: LocalizedText[];
  seo: {
    title: LocalizedText;
    description: LocalizedText;
  };
}

export type SolutionKey =
  | 'hr'
  | 'crm'
  | 'booking'
  | 'services'
  | 'sales'
  | 'purchasing'
  | 'inventory'
  | 'loyalty'
  | 'notifications'
  | 'analytics';

export const solutionsData: Record<SolutionKey, SolutionData> = {
  hr: {
    slug: 'hr',
    path: '/solutions/hr',
    badge: {
      ar: 'إدارة الموارد البشرية',
      en: 'HR MANAGEMENT',
    },
    title: {
      ar: 'إدارة متكاملة للموظفين ومقدمي الخدمات وفرق العمل',
      en: 'Unified Workforce, Shift, and Specialist Management',
    },
    subtitle: {
      ar: 'نظام تشغيل ذكي يجمع الملفات الوظيفية، وتنظيم الورديات، ومتابعة الأداء، واحتساب العمولات والمستحقات في واجهة موحدة.',
      en: 'An intelligent operating module unifying specialist profiles, shift scheduling, performance tracking, and automated commission accounting.',
    },
    description: {
      ar: 'توفر وحدة إدارة الموارد البشرية في راش إكس لأصحاب ومديري المنشآت سيطرة كاملة ومرنة على الكوادر البشرية، بدءًا من تحديد الصلاحيات والأدوار وصولاً إلى ضبط جداول العمل اليومية ومتابعة الحضور والانصراف بدقة.',
      en: 'The RASHX HR module gives salon and spa managers complete visibility and control over team operations—from granular access permissions to daily shift rosters and commission payouts.',
    },
    highlights: [
      { ar: 'ملفات وظيفية موحدة لكل أخصائية', en: 'Unified specialist personnel profiles' },
      { ar: 'إدارة مرنة للصلاحيات والأدوار', en: 'Granular role-based access controls' },
      { ar: 'احتساب دقيق للعمولات والمستحقات', en: 'Accurate commission and entitlement tracking' },
      { ar: 'تنظيم جداول العمل والورديات', en: 'Shift rostering and attendance monitoring' },
    ],
    capabilities: [
      {
        id: 'staff-profiles',
        title: {
          ar: 'إدارة الموظفين ومقدمي الخدمات',
          en: 'Staff & Specialist Profiles',
        },
        description: {
          ar: 'إنشاء وحفظ ملف وظيفي متكامل لكل موظف وأخصائية، يشمل المهارات، والتخصصات، وتفاصيل التعاقد، والخدمات المسندة.',
          en: 'Create and maintain full personnel profiles for each specialist, covering skillsets, specialties, contact details, and assigned services.',
        },
      },
      {
        id: 'roles-permissions',
        title: {
          ar: 'إدارة الصلاحيات والأدوار الوظيفية',
          en: 'Roles & Granular Permissions',
        },
        description: {
          ar: 'تحديد صلاحيات وصول دقيقة لكل دور وظيفي (مدير فرع، كاشير، أخصائية، موظف استقبال) لحماية البيانات الحساسة.',
          en: 'Define precise access levels for every operational role (branch manager, cashier, specialist, receptionist) to protect business data.',
        },
      },
      {
        id: 'shifts-schedules',
        title: {
          ar: 'تنظيم جداول العمل والورديات',
          en: 'Work Schedules & Shift Rosters',
        },
        description: {
          ar: 'تخطيط ورديات العمل اليومية والأسبوعية، وتعيين أوقات الاستراحة، وضمان تغطية كافة ساعات العمل بدون تعارض.',
          en: 'Roster daily and weekly working shifts, schedule rest intervals, and ensure smooth operational coverage without booking overlap.',
        },
      },
      {
        id: 'performance-tracking',
        title: {
          ar: 'متابعة أداء الموظفين',
          en: 'Staff Performance Analytics',
        },
        description: {
          ar: 'مؤشرات لحظية تقيس إنتاجية كل موظف، وعدد الجلسات المنفذة، ومعدلات رضا العميلات، ونسب الالتزام بالمواعيد.',
          en: 'Real-time indicators measuring individual productivity, completed treatment counts, client ratings, and schedule adherence.',
        },
      },
      {
        id: 'commissions-payroll',
        title: {
          ar: 'إدارة العمولات والمستحقات',
          en: 'Commissions & Earnings Calculation',
        },
        description: {
          ar: 'نظام آلي شفاف لحساب عمولات مبيعات الخدمات والمنتجات بدقة، وربطها بنقاط البيع لمنع الأخطاء الحسابية.',
          en: 'A transparent automated engine calculating commissions on services and retail products, tied directly to POS for complete accuracy.',
        },
      },
      {
        id: 'attendance-tracking',
        title: {
          ar: 'متابعة الحضور والانصراف',
          en: 'Attendance & Punctuality Tracking',
        },
        description: {
          ar: 'تسجيل ومتابعة حضور وانصراف الكادر التشغيلي وفق الإمكانات والإعدادات المفعلة لكل فرع لمنع التأخير وتأجيل المواعيد.',
          en: 'Log and monitor staff check-ins and check-outs according to enabled branch policies to prevent appointment delays.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر التشغيلي على صالونك ومركزك',
      en: 'Operational Impact on Your Facility',
    },
    impacts: [
      {
        title: {
          ar: 'شفافية مالية مطلقة للعمولات',
          en: 'Total Commission Transparency',
        },
        description: {
          ar: 'القضاء على الخلافات الحسابية بفضل احتساب العمولات آلياً مع كل فاتورة مسجلة في نقاط البيع.',
          en: 'Eliminate accounting disputes with instant, automated commission tallying linked to every settled invoice.',
        },
      },
      {
        title: {
          ar: 'استثمار أمثل لأوقات الأخصائيات',
          en: 'Optimized Specialist Utilization',
        },
        description: {
          ar: 'توزيع عادل وذكي للجلسات يضمن استغلال الطاقة الاستيعابية للصالون ويقلل فترات الركود غير المنتجة.',
          en: 'Fair and intelligent booking distribution maximizing station capacity and minimizing unproductive idle gaps.',
        },
      },
      {
        title: {
          ar: 'حماية وأمان صلاحيات المنشأة',
          en: 'Rock-Solid Role Security',
        },
        description: {
          ar: 'منع وصول الكادر إلى التقارير المالية أو إعدادات الأسعار إلا للأشخاص المخولين فقط بصلاحيات موثقة.',
          en: 'Prevent unauthorized personnel from accessing sensitive financial totals or pricing controls through verified permissions.',
        },
      },
    ],
    ecosystemTitle: {
      ar: 'ترابط الموارد البشرية مع منظومة راش إكس',
      en: 'HR Integration with the RASHX Ecosystem',
    },
    ecosystemDescription: {
      ar: 'تعمل وحدة الموارد البشرية بتوافق تام مع باقي مكونات المنصة لتمنحك منظومة لا تنفصل فيها قرارات الإدارة عن واقع التشغيل اليومي.',
      en: 'The HR module communicates natively with all other platform components, ensuring administrative decisions synchronize with floor operations.',
    },
    ecosystemConnections: [
      {
        ar: 'ربط مباشر مع جدول الحجوزات يتيح للعميلات اختيار الأخصائية المتواجدة والمتاحة فورياً.',
        en: 'Direct linkage to online booking allowing clients to pick available, on-duty specialists in real time.',
      },
      {
        ar: 'ربط لحظي مع نقاط البيع (POS) يحدد نسبة عمولة منفذة الخدمة تلقائياً عند إصدار الفاتورة.',
        en: 'Instant synchronization with POS automatically attributing specialist commission upon bill creation.',
      },
      {
        ar: 'مزامنة مع تطبيق مقدم الخدمة تتيح لكل موظفة استعراض جدول مواعيدها وعمولاتها اليومية.',
        en: 'Seamless sync with the Provider App allowing staff to inspect their daily appointments and earnings.',
      },
    ],
    seo: {
      title: {
        ar: 'إدارة الموارد البشرية للصالونات ومراكز التجميل | RASHX',
        en: 'Salon & Spa HR Management System | RASHX',
      },
      description: {
        ar: 'نظام إدارة الموارد البشرية المتخصص من راش إكس: تنظيم ورديات العمل، ملفات الموظفين، إدارة الصلاحيات، ومتابعة الأداء واحتساب العمولات بدقة.',
        en: 'Specialized HR management module by RASHX: staff profiles, shift scheduling, role permissions, performance tracking, and automated commission payroll for salons.',
      },
    },
  },

  crm: {
    slug: 'crm',
    path: '/solutions/crm',
    badge: {
      ar: 'إدارة علاقات العملاء',
      en: 'CRM & CLIENT MANAGEMENT',
    },
    title: {
      ar: 'بناء علاقات طويلة الأمد مع عميلاتك وفهم تفضيلاتهن',
      en: 'Fostering Long-Term Client Relationships and Preferences',
    },
    subtitle: {
      ar: 'قاعدة بيانات موحدة تسجل سجل الزيارات والخدمات السابقة، وتصنيف العميلات، وتحليل السلوك الشرائي لتقديم تجربة استثنائية.',
      en: 'A unified database preserving treatment history, visit logs, client segmentation, and purchasing insights for exceptional experiences.',
    },
    description: {
      ar: 'تمنحك وحدة إدارة علاقات العملاء (CRM) في راش إكس ملفاً شاملاً لكل عميلة، يوثق تاريخ الحجوزات، والملاحظات الخاصة، والمستحضرات المفضلة، مما يمكّن فريقك من تقديم خدمة مخصصة تعزز الولاء وتكرار الزيارات.',
      en: 'The RASHX CRM module provides comprehensive guest dossiers tracking booking history, personalized preferences, and favored formulas—empowering your team to deliver bespoke customer care that maximizes retention.',
    },
    highlights: [
      { ar: 'قاعدة بيانات متكاملة لعميلات المنشأة', en: 'Comprehensive client and guest profiles' },
      { ar: 'سجل الزيارات والخدمات والمدفوعات', en: 'Complete visit, treatment, and payment logs' },
      { ar: 'تصنيف العميلات وتحليل السلوك الشرائي', en: 'Client segmentation and spend analytics' },
      { ar: 'إدارة التفضيلات والملاحظات الفنية', en: 'Technical notes and bespoke preferences' },
    ],
    capabilities: [
      {
        id: 'client-database',
        title: {
          ar: 'قاعدة بيانات متكاملة للعملاء',
          en: 'Unified Client Profiles',
        },
        description: {
          ar: 'إنشاء وحفظ سجل رقمي موحد لكل عميلة يضم بيانات التواصل، وتاريخ أول زيارة، ورصيد المحفظة ونقاط الولاء.',
          en: 'Build unified client records containing contact details, initial visit date, digital wallet balance, and accrued loyalty points.',
        },
      },
      {
        id: 'visit-history',
        title: {
          ar: 'سجل الزيارات والخدمات السابقة',
          en: 'Visit & Treatment History',
        },
        description: {
          ar: 'توثيق كل جلسة تمت في الصالون مع تفاصيل الخدمة، والأخصائية المنفذة، وتاريخ وتوقيت الزيارة.',
          en: 'Archive every completed salon appointment with treatment details, servicing specialist, and exact visit timestamps.',
        },
      },
      {
        id: 'booking-tracking',
        title: {
          ar: 'متابعة تاريخ الحجوزات والمعاملات',
          en: 'Booking & Transaction Ledger',
        },
        description: {
          ar: 'رصد فوري لجميع الحجوزات المؤكدة والملغاة وحالات عدم الحضور، مع إجمالي المبالغ المصروفة وفواتير الشراء.',
          en: 'Real-time auditing of confirmed, canceled, and no-show appointments alongside cumulative customer lifetime spend.',
        },
      },
      {
        id: 'client-segmentation',
        title: {
          ar: 'تصنيف العملاء وتحليل السلوك الشرائي',
          en: 'Segmentation & Spending Analysis',
        },
        description: {
          ar: 'تصنيف العميلات آلياً (عميلات دائمات، VIP، عميلات جديدات، منقطعات) لتوجيه العروض والحملات التسويقية بكفاءة.',
          en: 'Automatically segment guests (VIP, regulars, newcomers, dormant) to direct promotional campaigns with laser precision.',
        },
      },
      {
        id: 'preferences-notes',
        title: {
          ar: 'إدارة ملاحظات العملاء وتفضيلاتهم',
          en: 'Client Notes & Treatment Preferences',
        },
        description: {
          ar: 'تسجيل الملاحظات الفنية الدقيقة (مثل درجات صبغة الشعر، حساسية البشرة، المشروب المفضل) لتكرار التجربة المثالية.',
          en: 'Log technical formulas (hair dye shade codes, skin sensitivities, beverage preferences) to recreate flawless visits consistently.',
        },
      },
      {
        id: 'retention-engagement',
        title: {
          ar: 'تحسين التواصل وبناء علاقات طويلة الأمد',
          en: 'Retention & Lifecycle Engagement',
        },
        description: {
          ar: 'أدوات ذكية للتواصل المباشر في المناسبات وتذكير العميلات بمواعيد التجديد الدورية للحفاظ على استمرارية الزيارات.',
          en: 'Automated milestone messaging and personalized replenishment reminders to keep clients engaged and returning consistently.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر التشغيلي على تجربة العميلات',
      en: 'Operational Impact on Client Experience',
    },
    impacts: [
      {
        title: {
          ar: 'رفع معدل العودة وتكرار الزيارات',
          en: 'Accelerated Client Retention',
        },
        description: {
          ar: 'معرفة اهتمامات العميلات وتفضيلاتهن السابقة تمنحهن شعوراً بالاهتمام والتقدير، مما يرفع ولاءهن للصالون.',
          en: 'Recognizing customer preferences fosters deep personal appreciation, dramatically increasing repeat visit frequency.',
        },
      },
      {
        title: {
          ar: 'استهداف تسويقي أعلى كفاءة',
          en: 'High-Conversion Marketing',
        },
        description: {
          ar: 'إرسال عروض مخصصة لكل شريحة من العميلات بناءً على سلوكهن الشرائي الفعلي بدلاً من الحملات العشوائية.',
          en: 'Broadcast tailored promotions to precise segments based on actual spending behavior rather than generic messaging.',
        },
      },
      {
        title: {
          ar: 'خدمة خالية من الأخطاء الفنية',
          en: 'Error-Free Treatment Execution',
        },
        description: {
          ar: 'توثيق التركيبات ودرجات الألوان يحمي سمعة الصالون ويضمن نتائج دقيقة حتى لو تغيرت الأخصائية المنفذة.',
          en: 'Archiving exact color and skincare formulas protects service consistency even if staffing changes occur.',
        },
      },
    ],
    ecosystemTitle: {
      ar: 'ترابط إدارة العملاء مع منظومة راش إكس',
      en: 'CRM Integration with the RASHX Ecosystem',
    },
    ecosystemDescription: {
      ar: 'يعمل نظام الـ CRM كعصب رئيسي يغذي باقي مكونات المنصة ببيانات وافية عن رغبات العميلات وتاريخهن.',
      en: 'The CRM serves as the central data backbone feeding client context across all operational touchpoints.',
    },
    ecosystemConnections: [
      {
        ar: 'مزامنة مع تطبيق العميل تتيح للعميلة متابعة مواعيدها ورصيد نقاط الولاء وعروضها الخاصة.',
        en: 'Real-time synchronization with the Customer App displaying loyalty points balance and exclusive offers.',
      },
      {
        ar: 'ظهور ملف العميلة وملاحظاتها الفنية فورياً على شاشة الكاشير ونقاط البيع (POS) أثناء تقديم الخدمة.',
        en: 'Instant profile popup on the POS cashier display highlighting technical notes and VIP status during checkout.',
      },
      {
        ar: 'ربط مباشر مع نظام الإشعارات لإرسال تأكيدات الحجز والتذكير بالمواعيد بشكل مؤتمت بالكامل.',
        en: 'Direct linkage to the Notification Engine sending automated appointment confirmations and reminder alerts.',
      },
    ],
    seo: {
      title: {
        ar: 'نظام إدارة العملاء للصالونات والسبا (CRM) | RASHX',
        en: 'Salon & Spa Client Relationship Management (CRM) | RASHX',
      },
      description: {
        ar: 'نظام إدارة علاقات العملاء (CRM) المتخصص للصالونات ومراكز التجميل من راش إكس: سجل الزيارات، تفضيلات العميلات، تصنيف الشرائح، وتعزيز الولاء.',
        en: 'Specialized beauty salon and spa CRM system by RASHX: visit history, treatment preferences, client segmentation, and automated guest retention.',
      },
    },
  },

  booking: {
    slug: 'booking',
    path: '/solutions/booking',
    badge: {
      ar: 'إدارة الحجوزات والمواعيد',
      en: 'BOOKING MANAGEMENT',
    },
    title: {
      ar: 'تنظيم ذكي للمواعيد وجداول الأخصائيات بدون أي تعارض',
      en: 'Intelligent Scheduling & Conflict-Free Specialist Calendars',
    },
    subtitle: {
      ar: 'منظومة حجز متطورة تربط جدول الصالون الداخلي بالحجوزات الرقمية، لتضمن تدفقاً سلساً للجلسات واستثماراً كاملاً للطاقة الاستيعابية.',
      en: 'An advanced reservation engine syncing internal salon calendars with digital bookings for seamless flow and maximized station occupancy.',
    },
    description: {
      ar: 'توفر وحدة إدارة الحجوزات والمواعيد في راش إكس تقويماً ذكياً متعدد العروض (يومي، أسبوعي، وحسب الأخصائية) مع إدارة لحالات الحجز (مؤكد، قيد الانتظار، ملغي، مكتمل) لمنع التعارض وتقليل نسب عدم الحضور.',
      en: 'The RASHX Booking module offers multi-view smart calendars (daily, weekly, per specialist) tracking booking statuses (confirmed, pending, canceled, completed) to eliminate scheduling clashes and minimize no-shows.',
    },
    highlights: [
      { ar: 'تنظيم المواعيد وفق مدد الخدمات الفعلية', en: 'Dynamic duration-based scheduling' },
      { ar: 'إدارة جداول مقدمي الخدمة وتوافرهم', en: 'Specialist roster and availability controls' },
      { ar: 'متابعة لحظية لحالات الحجز والتأكيد', en: 'Live status tracking and check-in audits' },
      { ar: 'تقليل التعارض والتداخل بين المواعيد', en: 'Zero double-booking conflict mitigation' },
    ],
    capabilities: [
      {
        id: 'service-scheduling',
        title: {
          ar: 'تنظيم مواعيد الخدمات',
          en: 'Service Scheduling & Allocations',
        },
        description: {
          ar: 'جدولة دقيقة تأخذ في الحسبان مدة الخدمة، وأوقات التجهيز بين الجلسات، لضمان استقبال كل عميلة في موعدها المحدد.',
          en: 'Precise scheduling accounting for service durations and station turnaround buffer times to ensure punctual appointments.',
        },
      },
      {
        id: 'specialist-rosters',
        title: {
          ar: 'إدارة جداول مقدمي الخدمة',
          en: 'Specialist Roster Management',
        },
        description: {
          ar: 'عرض جدول كل أخصائية على حدة مع تحديد أوقات توافرها وساعات الاستراحة والمهام الموكلة إليها.',
          en: 'Individual specialist calendar views detailing availability windows, break times, and scheduled appointments.',
        },
      },
      {
        id: 'status-tracking',
        title: {
          ar: 'متابعة الحجوزات وحالاتها',
          en: 'Booking Lifecycle Tracking',
        },
        description: {
          ar: 'تحديث فوري لحالة الموعد (جديد، مؤكد، تم الوصول، جاري التنفيذ، مكتمل، ملغي) لتوفير رؤية واضحة للاستقبال.',
          en: 'Live status indicators (new, confirmed, arrived, in-progress, completed, canceled) providing clarity for reception desks.',
        },
      },
      {
        id: 'hours-availability',
        title: {
          ar: 'تنظيم أوقات العمل والتوافر',
          en: 'Working Hours & Availability Controls',
        },
        description: {
          ar: 'ضبط ساعات العمل الرسمية للصالون، وأيام العطلات والمناسبات، والتحكم في إتاحة الحجز الإلكتروني بحرية.',
          en: 'Configure salon operating hours, seasonal holidays, and digital booking availability thresholds effortlessly.',
        },
      },
      {
        id: 'conflict-prevention',
        title: {
          ar: 'تقليل التعارض بين المواعيد',
          en: 'Automated Conflict Prevention',
        },
        description: {
          ar: 'خوارزميات فحص تمنع الحجز المزدوج لنفس الأخصائية أو نفس الكرسي/الغرفة في نفس التوقيت تلقائياً.',
          en: 'Smart verification algorithms automatically blocking double bookings for the same specialist or room concurrently.',
        },
      },
      {
        id: 'client-booking-experience',
        title: {
          ar: 'تحسين تجربة الحجز للعملاء',
          en: 'Elevated Client Booking Journeys',
        },
        description: {
          ar: 'تجربة حجز سلسة تتيح للعميلات اختيار الفرع والخدمة والأخصائية والوقت المناسب في خطوات معدودة.',
          en: 'Frictionless digital booking flows allowing guests to choose branch, service, specialist, and slot in seconds.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر التشغيلي على إنتاجية الصالون',
      en: 'Operational Impact on Salon Productivity',
    },
    impacts: [
      {
        title: {
          ar: 'القضاء على تضارب المواعيد نهائياً',
          en: 'Zero Double-Booking Friction',
        },
        description: {
          ar: 'تنسيق مركزي يضمن عدم تداخل المواعيد حتى مع تعدد قنوات الحجز (الموقع، الهاتف، الحضور المباشر).',
          en: 'Centralized coordination eliminating calendar clashes across walk-ins, phone bookings, and online reservations.',
        },
      },
      {
        title: {
          ar: 'تقليل نسب التغيب وعدم الحضور',
          en: 'Dramatically Reduced No-Shows',
        },
        description: {
          ar: 'التأكيد الآلي والتذكير المسبق يقلل المواعيد المنسية ويوفر فرصة لإعادة شغل الأوقات الشاغرة.',
          en: 'Automated appointment reminders significantly curb no-shows and open up slots for waitlisted clients.',
        },
      },
      {
        title: {
          ar: 'استيعاب أعلى للإيرادات اليومية',
          en: 'Maximized Chair Revenue Yield',
        },
        description: {
          ar: 'ترتيب متتالي للجلسات يقلل الأوقات المهدرة بين المواعيد ويزيد من عدد العميلات المخدومات يومياً.',
          en: 'Consecutive slot packing minimizes idle gaps between treatments, driving higher daily revenue per chair.',
        },
      },
    ],
    ecosystemTitle: {
      ar: 'ترابط الحجوزات مع منظومة راش إكس',
      en: 'Booking Integration with the RASHX Ecosystem',
    },
    ecosystemDescription: {
      ar: 'يرتبط نظام الحجوزات بشكل حيوي مع إدارة الموظفين ونقاط البيع وتطبيق العميل لضمان سير العمل بدقة.',
      en: 'The booking module interfaces directly with staff rostering, POS checkouts, and customer apps for total cohesion.',
    },
    ecosystemConnections: [
      {
        ar: 'تحويل الحجز المكتمل إلى فاتورة مبيعات بنقرة واحدة داخل نقطة البيع (POS) لاختصار وقت الانتظار.',
        en: 'One-click conversion of completed appointments into POS checkout invoices to eliminate reception bottlenecks.',
      },
      {
        ar: 'تحديث جداول الأخصائيات في تطبيق مقدم الخدمة فور حجز العميل لأي موعد جديد.',
        en: 'Immediate calendar updates in the Specialist App the moment a guest confirms an appointment.',
      },
      {
        ar: 'ربط أوقات التوافر بالحضور الفعلي للموظفات المسجل في وحدة الموارد البشرية (HR).',
        en: 'Synchronizing available booking slots with actual staff check-ins logged in the HR module.',
      },
    ],
    seo: {
      title: {
        ar: 'نظام إدارة الحجوزات والمواعيد للصالونات | RASHX',
        en: 'Salon Appointment & Booking Management System | RASHX',
      },
      description: {
        ar: 'نظام إدارة الحجوزات المتطور للصالونات ومراكز التجميل من راش إكس: تنظيم مواعيد الخدمات، جداول الأخصائيات، منع التعارض، وتحسين تجربة الحجز.',
        en: 'Advanced salon booking and appointment scheduling software by RASHX: conflict-free calendars, specialist availability, and elevated client booking journeys.',
      },
    },
  },

  services: {
    slug: 'services',
    path: '/solutions/services',
    badge: {
      ar: 'إدارة الخدمات والأسعار',
      en: 'SERVICES & PRICING MANAGEMENT',
    },
    title: {
      ar: 'هيكلة مرنة لقائمة الخدمات، الأسعار، والباقات المخصصة',
      en: 'Flexible Menu Structuring, Pricing, and Bundled Packages',
    },
    subtitle: {
      ar: 'إدارة متكاملة لقوائم خدمات الصالون، وتحديد مدد التنفيذ، وربطها بالأخصائيات المؤهلات مع إمكانية تصميم عروض وباقات استثنائية.',
      en: 'Comprehensive salon service catalog management: configuring durations, pricing tiers, qualified specialist allocations, and tailored service packages.',
    },
    description: {
      ar: 'توفر وحدة إدارة الخدمات في راش إكس لأصحاب الأعمال تصنيفاً دقيقاً لكافة خدمات الشعر، البشرة، الأظافر، والسبا، مع تحديد مدد التنفيذ وأسعار الباقات، وربطها بنقاط البيع والحجز الرقمي تلقائياً.',
      en: 'The RASHX Services module provides detailed taxonomy for all hair, skin, nail, and spa treatments—defining execution durations, bundle rates, and automatic sync across POS and online booking.',
    },
    highlights: [
      { ar: 'إضافة وتصنيف الخدمات بدقة', en: 'Structured treatment categorization' },
      { ar: 'تحديد الأسعار ومدد التنفيذ', en: 'Configurable prices and durations' },
      { ar: 'ربط الخدمات بالأخصائيات المؤهلات', en: 'Specialist service qualifications' },
      { ar: 'إدارة الباقات والعروض الموسمية', en: 'Bundled packages and promotions' },
    ],
    capabilities: [
      {
        id: 'service-catalog',
        title: {
          ar: 'إضافة وتصنيف الخدمات',
          en: 'Treatment Catalog & Hierarchy',
        },
        description: {
          ar: 'هيكلة الخدمات في تصنيفات رئيسية وفرعية (شعر، أظافر، عناية بالبشرة، مساج) مع إضافة الوصف وتفاصيل الجلسة.',
          en: 'Structure treatments into clean primary and sub-categories (hair, nails, skincare, massage) with descriptions.',
        },
      },
      {
        id: 'pricing-duration',
        title: {
          ar: 'تحديد الأسعار ومدد تقديم الخدمات',
          en: 'Duration & Tiered Pricing',
        },
        description: {
          ar: 'ضبط السعر ومدة التنفيذ بدقة، مع إمكانية تسعير مخصص حسب درجة خبرة الأخصائية أو طول الشعر.',
          en: 'Set precise prices and execution durations, with support for tier pricing based on specialist seniority.',
        },
      },
      {
        id: 'specialist-assignment',
        title: {
          ar: 'ربط الخدمات بمقدمي الخدمة',
          en: 'Specialist Assignment & Eligibility',
        },
        description: {
          ar: 'تعيين الخدمات التي تتقنها كل أخصائية، لضمان عدم حجز أي عميلة لخدمة إلا مع الأخصائية المؤهلة لتقديمها.',
          en: 'Map treatments exclusively to certified specialists, ensuring clients only book qualified team members.',
        },
      },
      {
        id: 'packages-bundles',
        title: {
          ar: 'إدارة الباقات والعروض',
          en: 'Packages, Memberships & Bundles',
        },
        description: {
          ar: 'تصميم باقات متعددة الجلسات وعروض موسمية مجمعة تشجع العميلات على الشراء المسبق وتضمن تدفقاً نقدياً مستمراً.',
          en: 'Design multi-treatment packages and seasonal bundles that incentivize advance bookings and recurring revenue.',
        },
      },
      {
        id: 'facility-customization',
        title: {
          ar: 'تخصيص الخدمات حسب طبيعة المنشأة',
          en: 'Facility-Specific Customization',
        },
        description: {
          ar: 'مرونة كاملة لتخصيص متطلبات الخدمات وقوائم الأسعار بما يناسب الصالونات النسائية أو الرجالية أو مراكز السبا.',
          en: 'Total flexibility to adapt catalogs and price lists for women’s salons, barbershops, or luxury wellness spas.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر التشغيلي على المبيعات وجودة الخدمة',
      en: 'Operational Impact on Revenue & Quality',
    },
    impacts: [
      {
        title: {
          ar: 'انضباط زمني تام للجلسات',
          en: 'Strict Treatment Punctuality',
        },
        description: {
          ar: 'تحديد مدد الخدمات يمنع تأخير المواعيد ويساعد الاستقبال والأخصائيات على الالتزام بالجدول بدقة.',
          en: 'Fixed duration rules prevent treatment spillovers, keeping the floor running on schedule all day.',
        },
      },
      {
        title: {
          ar: 'زيادة متوسط قيمة الفاتورة',
          en: 'Higher Average Ticket Size',
        },
        description: {
          ar: 'الباقات المجمعة والخدمات الإضافية الذكية ترفع من متوسط إنفاق العميلة في الزيارة الواحدة.',
          en: 'Smart bundled packages and add-on suggestions systematically increase average client spend.',
        },
      },
      {
        title: {
          ar: 'حماية معايير الجودة والاحترافية',
          en: 'Standardized Service Excellence',
        },
        description: {
          ar: 'ربط الخدمات بالأخصائيات المؤهلات يضمن تقديم الخدمة بأعلى معايير الإتقان ورضا العميلة.',
          en: 'Assigning qualified specialists guarantees consistent service quality and guest delight.',
        },
      },
    ],
    ecosystemTitle: {
      ar: 'ترابط قائمة الخدمات مع منظومة راش إكس',
      en: 'Services Integration with the RASHX Ecosystem',
    },
    ecosystemDescription: {
      ar: 'تعتبر قائمة الخدمات حجر الزاوية الذي تتغذى منه واجهات الحجز ونقاط البيع وتقارير الإيرادات.',
      en: 'The services catalog is the foundational layer feeding online booking engines, POS checkouts, and revenue metrics.',
    },
    ecosystemConnections: [
      {
        ar: 'عرض قائمة الخدمات وأسعارها وعروضها آلياً على موقع الصالون وتطبيق العميل مع إمكانية التحديث اللحظي.',
        en: 'Dynamic catalog display on the salon website and Customer App with instant real-time price updates.',
      },
      {
        ar: 'تحميل بنود الخدمة وأسعارها فوراً على شاشة الكاشير (POS) لتسجيل الفواتير بسرعة وبدون أخطاء يدوية.',
        en: 'Instant line-item population on the POS cashier screen for fast, error-free checkout invoicing.',
      },
      {
        ar: 'احتساب عمولات الأخصائيات ومواد الاستهلاك في المخزون تلقائياً بناءً على الخدمة المنفذة.',
        en: 'Automatic calculation of specialist commissions and inventory deductions linked to completed services.',
      },
    ],
    seo: {
      title: {
        ar: 'إدارة الخدمات والأسعار للصالونات والسبا | RASHX',
        en: 'Salon Treatment & Pricing Management System | RASHX',
      },
      description: {
        ar: 'نظام إدارة وتصنيف خدمات الصالونات من راش إكس: تحديد الأسعار والمدد، إدارة الباقات والعروض، وربط الخدمات بمقدمي الخدمة.',
        en: 'Comprehensive salon service management system by RASHX: treatment taxonomy, tiered pricing, package bundles, and specialist qualification mapping.',
      },
    },
  },

  sales: {
    slug: 'sales',
    path: '/solutions/sales',
    badge: {
      ar: 'إدارة المبيعات ونقاط البيع',
      en: 'SALES & POS MANAGEMENT',
    },
    title: {
      ar: 'نقاط بيع ذكية وسريعة، وإصدار فواتير متوافق بالكامل',
      en: 'Intelligent Cloud POS & Compliant Checkout Billing',
    },
    subtitle: {
      ar: 'إدارة مبيعات الخدمات والمنتجات اليومية، وتعدد طرق الدفع، وتطبيق الخصومات مع إصدار فواتير إلكترونية فورية.',
      en: 'Manage daily treatment and retail sales, multiple payment methods, discounts, and compliant instant e-invoicing.',
    },
    description: {
      ar: 'صُممت نقطة البيع في راش إكس لتناسب إيقاع العمل السريع داخل الصالونات ومراكز التجميل، حيث تتيح للكاشير إنهاء المعاملات في ثوانٍ معدودة، مع تقسيم الفاتورة وتطبيق العروض والخصومات بدقة وشفافية.',
      en: 'RASHX POS is engineered for the fast-paced salon environment, enabling receptionists to settle bills in seconds with split payments, automated discounts, and immediate electronic invoicing.',
    },
    highlights: [
      { ar: 'تسجيل فواتير الخدمات والمنتجات بسرعة', en: 'Fast service and retail product invoicing' },
      { ar: 'دعم وتعدد طرق الدفع المعتمدة', en: 'Comprehensive payment method support' },
      { ar: 'إدارة الخصومات والعروض الترويجية', en: 'Dynamic promotional discounts management' },
      { ar: 'تقارير مالية وتشغيلية تفصيلية يومية', en: 'Daily financial and operational ledgering' },
    ],
    capabilities: [
      {
        id: 'daily-sales',
        title: {
          ar: 'إدارة عمليات البيع اليومية',
          en: 'Daily Sales & Register Operations',
        },
        description: {
          ar: 'واجهة كاشير سريعة وبديهية لإدارة الجلسات الحالية، وفتح وإغلاق اليوميات المالية بدقة وسلاسة.',
          en: 'A rapid, intuitive cashier UI to manage active salon visits and handle shift opening/closing reconciliations.',
        },
      },
      {
        id: 'invoice-billing',
        title: {
          ar: 'تسجيل فواتير الخدمات والمنتجات',
          en: 'Service & Retail Product Invoicing',
        },
        description: {
          ar: 'إمكانية الجمع بين خدمات الصالون ومنتجات العناية المنزلية في فاتورة واحدة واضحة ومفصلة للعميلة.',
          en: 'Combine treatment charges and retail take-home products into a single itemized, transparent invoice.',
        },
      },
      {
        id: 'revenue-auditing',
        title: {
          ar: 'متابعة الإيرادات والتدفق المالي',
          en: 'Live Revenue & Cashflow Auditing',
        },
        description: {
          ar: 'رصد فوري لصافي الإيرادات، والمبيعات النقدية والإلكترونية، ومقارنتها بالأهداف اليومية للمنشأة.',
          en: 'Instant monitoring of net revenues, electronic vs. cash payments, benchmarked against daily targets.',
        },
      },
      {
        id: 'discounts-promotions',
        title: {
          ar: 'إدارة الخصومات والعروض الترويجية',
          en: 'Discount & Promotion Controls',
        },
        description: {
          ar: 'تطبيق نسب أو مبالغ الخصم المعتمدة، وقسائم الشراء، وأكواد العروض مع ضبط صلاحيات التخفيض للكاشير.',
          en: 'Apply authorized percentage/fixed discounts, vouchers, and promo codes with strict cashier permission limits.',
        },
      },
      {
        id: 'payment-methods',
        title: {
          ar: 'متابعة طرق الدفع المتعددة',
          en: 'Multi-Payment Method Tracking',
        },
        description: {
          ar: 'دعم الدفع عبر مدى، البطاقات الائتمانية، التحويل البنكي، رصيد المحفظة، مع إمكانية تقسيم الفاتورة الواحدة.',
          en: 'Accept Mada, credit cards, bank transfers, digital wallet balances, and effortless split-tender transactions.',
        },
      },
      {
        id: 'financial-reporting',
        title: {
          ar: 'استخراج التقارير المالية والتشغيلية',
          en: 'Financial & Operational Reporting',
        },
        description: {
          ar: 'إصدار تقارير مبيعات ختامية ملخصة ومفصلة حسب الفرع، الكاشير، طريقة الدفع، أو فترة زمنية محددة.',
          en: 'Generate end-of-day sales summaries and detailed breakdowns by branch, register, payment type, or custom dates.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر التشغيلي على الكفاءة والمالية',
      en: 'Operational Impact on Cash Flow & Speed',
    },
    impacts: [
      {
        title: {
          ar: 'إنهاء طوابير الانتظار عند الكاشير',
          en: 'Zero Reception Checkout Queues',
        },
        description: {
          ar: 'واجهة تسجيل سريعة تقلل وقت إصدار الفاتورة إلى ثوانٍ، مما يحافظ على رضا العميلات في ختام الزيارة.',
          en: 'Lightning-fast invoice checkout settling bills in seconds, preserving guest delight at visit departure.',
        },
      },
      {
        title: {
          ar: 'مطابقة نقدية ومالية خالية من الفروقات',
          en: 'Flawless Daily Reconciliation',
        },
        description: {
          ar: 'تطابق كامل بين مبيعات النظام والمقبوضات البنكية والنقدية ينهي أخطاء الحسابات وعجز الصندوق.',
          en: 'Exact reconciliation between system sales, card POS settlements, and cash drawers eliminates discrepancies.',
        },
      },
      {
        title: {
          ar: 'حماية الإيرادات وضبط التخفيضات',
          en: 'Revenue Protection & Fraud Prevention',
        },
        description: {
          ar: 'تسجيل الصلاحيات يمنع التلاعب بالخصومات أو إلغاء الفواتير دون إشعار وموافقة الإدارة.',
          en: 'Permission-locked discounting prevents unauthorized markdowns and unnotified invoice voids.',
        },
      },
    ],
    ecosystemTitle: {
      ar: 'ترابط المبيعات مع منظومة راش إكس',
      en: 'Sales Integration with the RASHX Ecosystem',
    },
    ecosystemDescription: {
      ar: 'ترتبط نقطة البيع (POS) بصورة لحظية مع المخزون والعمولات والمواعيد لتحديث البيانات تلقائياً.',
      en: 'The POS terminal syncs immediately with inventory stock, specialist payroll, and calendar appointments.',
    },
    ecosystemConnections: [
      {
        ar: 'خصم المنتجات المباعة من رصيد المستودع والمخزن فور إتمام المعاملة.',
        en: 'Automatic stock decrement from inventory upon invoice finalization.',
      },
      {
        ar: 'تسجيل عمولة الأخصائية فورياً في وحدة الموارد البشرية مع كل خدمة يتم سدادها.',
        en: 'Instant attribution of specialist commission to HR payroll upon bill payment.',
      },
      {
        ar: 'إضافة نقاط الولاء تلقائياً إلى حساب العميلة في الـ CRM عند إغلاق الفاتورة.',
        en: 'Automatic loyalty point accrual to the client’s CRM profile upon invoice completion.',
      },
    ],
    seo: {
      title: {
        ar: 'نظام نقاط البيع وإدارة المبيعات للصالونات (POS) | RASHX',
        en: 'Salon Point of Sale & Invoicing Software (POS) | RASHX',
      },
      description: {
        ar: 'نظام نقاط البيع وإدارة مبيعات الصالونات من راش إكس: فواتير سريعة، تعدد طرق الدفع، إدارة الخصومات، والتقارير المالية اليومية.',
        en: 'Modern beauty salon POS and sales management platform by RASHX: fast cashier checkout, split payments, discount rules, and daily revenue reporting.',
      },
    },
  },

  purchasing: {
    slug: 'purchasing',
    path: '/solutions/purchasing',
    badge: {
      ar: 'إدارة المشتريات والموردين',
      en: 'PURCHASING & SUPPLIERS',
    },
    title: {
      ar: 'تنظيم أوامر الشراء، فواتير الموردين، وضبط تكاليف التشغيل',
      en: 'Purchase Orders, Supplier Ledgering, and Cost Control',
    },
    subtitle: {
      ar: 'منظومة دقيقة لتسجيل المشتريات ومتابعة حسابات الموردين ومراقبة حركة التوريد لضمان استقرار مستلزمات الصالون بأفضل الأسعار.',
      en: 'A dedicated module for purchase order logging, supplier reconciliation, and cost auditing ensuring uninterrupted salon supplies.',
    },
    description: {
      ar: 'تساعدك وحدة إدارة المشتريات في راش إكس على تتبع كافة مدخلات ومستلزمات الصالون، بدءاً من تسجيل الموردين وفواتير الشراء، وصولاً إلى مراقبة تكلفة المواد المستهلكة ومطابقة الكميات الموردة مع المخزون.',
      en: 'The RASHX Purchasing module streamlines salon supply chains—from supplier profiles and purchase bills to tracking chemical formula costs and reconciling incoming shipments with warehouse stock.',
    },
    highlights: [
      { ar: 'تسجيل ومتابعة عمليات الشراء بدقة', en: 'Accurate purchase transaction auditing' },
      { ar: 'سجل متكامل للموردين والتعاملات', en: 'Comprehensive vendor and supplier directory' },
      { ar: 'مراقبة تكاليف المواد والمستلزمات', en: 'Material cost and expenditure tracking' },
      { ar: 'متابعة حركة التوريد ومواعيد الاستلام', en: 'Supply movement and delivery monitoring' },
    ],
    capabilities: [
      {
        id: 'purchase-logging',
        title: {
          ar: 'تسجيل عمليات الشراء',
          en: 'Purchase Order & Bill Logging',
        },
        description: {
          ar: 'توثيق طلبات الشراء الواردة وتفاصيل المواد والكميات وتواريخ الشراء بدقة في سجل رقمي منظم.',
          en: 'Log purchase orders, batch details, purchased volumes, and receipt dates in an organized digital register.',
        },
      },
      {
        id: 'supplier-management',
        title: {
          ar: 'إدارة الموردين',
          en: 'Supplier Directory & Balances',
        },
        description: {
          ar: 'قاعدة بيانات متكاملة لشركات وموردي مستحضرات التجميل والمعدات، مع متابعة الأرصدة والمستحقات المالية.',
          en: 'Complete vendor directory for beauty distributors, tracking contact records, payables, and outstanding dues.',
        },
      },
      {
        id: 'bill-auditing',
        title: {
          ar: 'متابعة فواتير المشتريات',
          en: 'Purchasing Invoices & Receipts',
        },
        description: {
          ar: 'أرشفة إلكترونية لجميع فواتير الشراء الضريبية ومطابقتها مع ما تم استلامه فعلياً في الصالون.',
          en: 'Electronic archiving of supplier tax invoices with itemized verification against physical stock receipts.',
        },
      },
      {
        id: 'cost-monitoring',
        title: {
          ar: 'مراقبة تكاليف المواد والمستلزمات',
          en: 'Material Cost Analysis',
        },
        description: {
          ar: 'تحليل دقيق لتكلفة المواد الاستهلاكية (كالصبغات، مستحضرات العناية، المناشف) ومقارنتها بأسعار الخدمات.',
          en: 'Granular cost auditing for treatment consumables (hair dye, skincare ampoules, towels) against service retail prices.',
        },
      },
      {
        id: 'supply-tracking',
        title: {
          ar: 'متابعة حركة التوريد',
          en: 'Supply Delivery & Shipment Tracking',
        },
        description: {
          ar: 'متابعة مراحل الشحنات من لحظة الطلب وحتى وصولها إلى فرع الصالون والتأكد من مطابقة المواصفات.',
          en: 'Track purchase order fulfilment status from dispatch to delivery at the salon door with quality checkoffs.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر التشغيلي على تكلفة المنشأة',
      en: 'Operational Impact on Salon Overhead',
    },
    impacts: [
      {
        title: {
          ar: 'ضبط وتخفيض تكاليف التشغيل',
          en: 'Reduced Operational Expenses',
        },
        description: {
          ar: 'مراقبة المشتريات تكشف الهدر وتوفر بيانات تاريخية للتفاوض على أسعار أفضل مع كبار الموردين.',
          en: 'Auditing purchase trends uncovers waste and equips management with historical leverage to negotiate supplier rates.',
        },
      },
      {
        title: {
          ar: 'منع نفاد المواد الأساسية في الصالون',
          en: 'Zero Treatment Stockouts',
        },
        description: {
          ar: 'جدولة التوريد المنظمة تحمي الصالون من تعطل الخدمات الحيوية بسبب نفاد مستحضرات أساسية فجأة.',
          en: 'Structured procurement scheduling protects the floor from canceling appointments due to missing treatment products.',
        },
      },
      {
        title: {
          ar: 'إدارة مالية دقيقة لمستحقات الموردين',
          en: 'Disciplined Payables Management',
        },
        description: {
          ar: 'تتبع تواريخ الاستحقاق يضمن سداد الموردين في الوقت المناسب وبناء علاقات تجارية موثوقة.',
          en: 'Clear payables visibility ensures timely supplier settlements and establishes premier vendor partnerships.',
        },
      },
    ],
    ecosystemTitle: {
      ar: 'ترابط المشتريات مع منظومة راش إكس',
      en: 'Purchasing Integration with the RASHX Ecosystem',
    },
    ecosystemDescription: {
      ar: 'تتصل المشتريات مباشرة مع إدارة المخزون والمحاسبة لتحديث كميات المستودع آلياً.',
      en: 'Purchasing interfaces directly with stock control and finance for automated inventory increments.',
    },
    ecosystemConnections: [
      {
        ar: 'إضافة المنتجات المشتراة آلياً إلى رصيد المخزون فور تأكيد استلام فاتورة الشراء.',
        en: 'Automatic stock quantity increments in warehouse inventory upon verifying purchase delivery receipts.',
      },
      {
        ar: 'تحديث أسعار تكلفة الخدمات والمنتجات لحساب هوامش الربحية بدقة في التقارير التحليلية.',
        en: 'Automatic recalculation of service cost margins within analytical revenue reporting.',
      },
    ],
    seo: {
      title: {
        ar: 'نظام إدارة المشتريات والموردين للصالونات | RASHX',
        en: 'Salon Purchasing & Vendor Management System | RASHX',
      },
      description: {
        ar: 'نظام إدارة مشتريات الصالونات ومراكز التجميل من راش إكس: تسجيل المشتريات، متابعة الموردين وفواتير التوريد، ومراقبة تكاليف المواد والمستلزمات.',
        en: 'Specialized procurement and vendor management module by RASHX: purchase orders, supplier directory, shipment auditing, and material cost control.',
      },
    },
  },

  inventory: {
    slug: 'inventory',
    path: '/solutions/inventory',
    badge: {
      ar: 'إدارة المخزون والمستودعات',
      en: 'INVENTORY & WAREHOUSE',
    },
    title: {
      ar: 'تحكم ذكي في المستلزمات والمبيعات مع تنبيهات عند انخفاض الكميات',
      en: 'Intelligent Stock Control, Wastage Prevention, & Low-Stock Alerts',
    },
    subtitle: {
      ar: 'إدارة المنتجات الاستهلاكية المخصصة لجلسات الصالون ومنتجات البيع بالتجزئة، مع تنظيم الجرد وتسجيل حركات الصرف والإضافة.',
      en: 'Control both backbar professional supplies and retail take-home products with automated audits and reorder alerts.',
    },
    description: {
      ar: 'تمنحك وحدة إدارة المخزون في راش إكس رؤية لحظية لكميات المستحضرات المتاحة في صالونك وفروعه، وتفصل بين مواد الاستهلاك الداخلي (Professional Use) ومنتجات البيع التجاري (Retail)، مع تنبيهات تلقائية قبل نفاد أي منتج.',
      en: 'The RASHX Inventory module gives complete real-time visibility across backbar professional supplies and retail shelves—monitoring internal consumption, preventing leakage, and alerting managers before stockouts occur.',
    },
    highlights: [
      { ar: 'فصل مواد الاستهلاك الداخلي عن منتجات البيع', en: 'Segregated backbar and retail inventory' },
      { ar: 'تسجيل حركات الصرف والإضافة بدقة', en: 'Automated usage and restock logging' },
      { ar: 'تنبيهات فورية عند وصول الكميات للحد الأدنى', en: 'Automated minimum-threshold reorder alerts' },
      { ar: 'أدوات مساعدة لتسهيل وتسريع عمليات الجرد', en: 'Streamlined physical stocktaking workflows' },
    ],
    capabilities: [
      {
        id: 'product-tracking',
        title: {
          ar: 'إدارة المنتجات والمواد الاستهلاكية',
          en: 'Product & Consumables Catalog',
        },
        description: {
          ar: 'تصنيف المنتجات برمز الباركود، والشركة المصنعة، وتاريخ الصلاحية، مع التمييز بين مواد الاستخدام الداخلي والبيع.',
          en: 'Track products via barcode, brand, expiry dates, and clear segregation between backbar and retail.',
        },
      },
      {
        id: 'stock-balances',
        title: {
          ar: 'متابعة الكميات المتاحة لحظياً',
          en: 'Real-Time Stock Quantities',
        },
        description: {
          ar: 'رصد فوري لأرصدة المنتجات في كل فرع أو مستودع، وتحديث الكميات آلياً مع كل عملية بيع أو صرف للجلسات.',
          en: 'Live stock balances across branches and warehouses, updating automatically with every POS sale or session use.',
        },
      },
      {
        id: 'usage-logging',
        title: {
          ar: 'تسجيل عمليات الصرف والإضافة',
          en: 'Disbursements & Inward Receipts',
        },
        description: {
          ar: 'تسجيل أذونات صرف المواد للأخصائيات وسندات استلام البضائع لتوثيق حركة كل عبوة داخل الصالون.',
          en: 'Log internal disbursement vouchers to stylists alongside incoming delivery receipts to track every single bottle.',
        },
      },
      {
        id: 'movement-monitoring',
        title: {
          ar: 'مراقبة حركة المخزون ومنع الهدر',
          en: 'Stock Movement & Wastage Control',
        },
        description: {
          ar: 'سجل تدقيق يوضح مسار كل منتج من وقت دخوله حتى استهلاكه لمنع الفقد أو التلف أو الاستخدام غير المبرر.',
          en: 'Comprehensive audit trails tracking items from receipt to application, minimizing leakage and unauthorized usage.',
        },
      },
      {
        id: 'low-stock-alerts',
        title: {
          ar: 'متابعة مستويات المخزون والتنبيهات',
          en: 'Minimum Level Alerts & Reorders',
        },
        description: {
          ar: 'تنبيهات تلقائية تظهر للإدارة عند اقتراب أي مادة من حد الأمان، لإعادة الطلب في الوقت المناسب.',
          en: 'Automated dashboard notifications flagging items reaching reorder thresholds for timely replenishment.',
        },
      },
      {
        id: 'stocktaking-tools',
        title: {
          ar: 'تنظيم وتسهيل عمليات الجرد الدوري',
          en: 'Periodic Stocktaking & Reconciliation',
        },
        description: {
          ar: 'واجهات جرد رقمية سريعة تتيح مقارنة الجرد الفعلي بالأرصدة الدفترية وتسوية الفروقات بضغطة زر.',
          en: 'Digital stocktaking tools comparing physical counts with ledger balances to reconcile variances instantly.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر التشغيلي على كفاءة المخزن',
      en: 'Operational Impact on Salon Supply Flow',
    },
    impacts: [
      {
        title: {
          ar: 'القضاء التام على الهدر والاستهلاك الزائد',
          en: 'Eradicate Product Wastage',
        },
        description: {
          ar: 'ربط الصرف بالأخصائيات والخدمات يضمن ضبط كميات المواد المستهلكة في كل جلسة بدقة.',
          en: 'Attributing product consumption directly to appointments ensures measured, standardized portion controls.',
        },
      },
      {
        title: {
          ar: 'عدم تجميد السيولة في مخزون راكد',
          en: 'Optimized Working Capital',
        },
        description: {
          ar: 'معرفة المنتجات سريعة وبطيئة الحركة تساعد في شراء الكميات المطلوبة فقط وحماية التدفق المالي.',
          en: 'Identifying fast-moving vs slow-moving inventory optimizes purchasing cycles without tying up cashflow.',
        },
      },
      {
        title: {
          ar: 'جرد أسرع بنسبة 80% وبدون أخطاء ورقية',
          en: 'Fast, Paperless Stock Audits',
        },
        description: {
          ar: 'تحويل الجرد إلى تجربة رقمية سريعة بالباركود يوفر ساعات طويلة من العمل اليدوي المرهق.',
          en: 'Barcode-enabled digital stocktaking saves hours of manual paperwork and prevents counting blunders.',
        },
      },
    ],
    ecosystemTitle: {
      ar: 'ترابط المخزون مع منظومة راش إكس',
      en: 'Inventory Integration with the RASHX Ecosystem',
    },
    ecosystemDescription: {
      ar: 'يعمل المخزون بتناغم تام مع نقاط البيع والمشتريات لضمان دقة الأرصدة في كل لحظة.',
      en: 'Inventory integrates natively with POS sales and procurement to keep counts synchronized 24/7.',
    },
    ecosystemConnections: [
      {
        ar: 'خصم رصيد المنتجات المباعة في نقطة البيع (POS) فور إصدار الفاتورة للعميلة.',
        en: 'Instant stock deductions at POS checkout upon issuing customer receipts.',
      },
      {
        ar: 'تغذية تلقائية لكميات المستودع فور تأكيد استلام أوامر الشراء من الموردين.',
        en: 'Automatic stock count increments upon receiving validated supplier purchase orders.',
      },
    ],
    seo: {
      title: {
        ar: 'نظام إدارة المخزون والمستودعات للصالونات | RASHX',
        en: 'Salon Inventory & Stock Control System | RASHX',
      },
      description: {
        ar: 'نظام إدارة مخزون ومستودعات الصالونات من راش إكس: متابعة المنتجات الاستهلاكية، حركات الصرف والإضافة، تنبيهات انخفاض الكميات، وتنظيم الجرد.',
        en: 'Intelligent salon inventory and warehouse software by RASHX: backbar vs retail tracking, stocktaking tools, and automated low-stock reorder alerts.',
      },
    },
  },

  loyalty: {
    slug: 'loyalty',
    path: '/solutions/loyalty',
    badge: {
      ar: 'نظام الولاء والمكافآت',
      en: 'LOYALTY & REWARDS',
    },
    title: {
      ar: 'برامج ولاء ذكية تعزز ولاء العميلات وتشجع تكرار الزيارات',
      en: 'Intelligent Loyalty Programs Driving Repeat Visits & Guest Delight',
    },
    subtitle: {
      ar: 'منظومة نقاط ومكافآت مخصصة تكافئ عميلاتك الدائمات وتقدم امتيازات حصرية تضمن بقاء صالونك خيارهن الأول دائماً.',
      en: 'A bespoke points and rewards system incentivizing regular clients with VIP privileges that make your salon their default choice.',
    },
    description: {
      ar: 'تتيح لك وحدة الولاء والمكافآت في راش إكس تصميم برامج ولاء مرنة وفق سياسات منشأتك، سواء بمنح نقاط مع كل ريال يُصرف، أو مكافأة العميلات عند تجربة خدمات جديدة، مع محفظة رقمية سهلة الاستخدام داخل تطبيق العميل.',
      en: 'The RASHX Loyalty module lets you craft tailored reward policies—accruing points per spend or granting tiered perks—managed effortlessly through the Customer App digital wallet.',
    },
    highlights: [
      { ar: 'إنشاء برامج ولاء مخصصة تناسب منشأتك', en: 'Customizable loyalty point policies' },
      { ar: 'منح النقاط واستبدالها بنقرة واحدة', en: 'One-click point earning & redemption' },
      { ar: 'مكافأة العميلات الدائمات وشرائح الـ VIP', en: 'Exclusive perks for loyal and VIP guests' },
      { ar: 'تشجيع تكرار الزيارات وزيادة الاحتفاظ', en: 'Proven repeat visit & retention drivers' },
    ],
    capabilities: [
      {
        id: 'loyalty-rules',
        title: {
          ar: 'إنشاء برامج ولاء مخصصة',
          en: 'Bespoke Program Configuration',
        },
        description: {
          ar: 'تحديد قواعد اكتساب النقاط (مثلاً: نقطة لكل 10 ريالات) وقيمتها المالية عند الاستبدال بما يتناسب مع ميزانية الصالون.',
          en: 'Define point earning ratios (e.g. 1 pt per 10 SAR) and conversion values tailored to your business model.',
        },
      },
      {
        id: 'points-awarding',
        title: {
          ar: 'منح النقاط وفق سياسات المنشأة',
          en: 'Automated Point Accrual',
        },
        description: {
          ar: 'إضافة النقاط تلقائياً إلى محفظة العميلة فور سداد الفاتورة بدون أي تدخل يدوي من موظف الاستقبال.',
          en: 'Points are deposited into the guest’s digital balance automatically upon bill settlement with zero manual steps.',
        },
      },
      {
        id: 'vip-rewards',
        title: {
          ar: 'مكافأة العملاء الدائمين والـ VIP',
          en: 'VIP Tier Privileges & Rewards',
        },
        description: {
          ar: 'تصميم مستويات ولاء (فضي، ذهبي، بلاتيني) تمنح العميلات الأكثر إنفاقاً ميزات حصرية ومعاملة مميزة.',
          en: 'Design tiered tiers (Silver, Gold, Platinum) giving top-spending guests exclusive perks and prioritized booking.',
        },
      },
      {
        id: 'special-privileges',
        title: {
          ar: 'تقديم عروض وامتيازات خاصة',
          en: 'Exclusive Perks & Promotions',
        },
        description: {
          ar: 'إطلاق هدايا أعياد الميلاد، وباقات الترحيب، وخصومات مضاعفة في أوقات الركود لتحفيز الزيارات.',
          en: 'Launch birthday bonuses, welcome packages, and off-peak double points to maintain steady appointment volume.',
        },
      },
      {
        id: 'repeat-visits',
        title: {
          ar: 'تشجيع تكرار الزيارات وزيادة الاحتفاظ',
          en: 'Retention & Visit Frequency Lift',
        },
        description: {
          ar: 'إشعارات ذكية تنبه العميلة برصيد نقاطها القابل للاستبدال لتحفيزها على حجز جلستها القادمة.',
          en: 'Automated prompts reminding guests of redeemable balances, motivating them to book their next visit.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر التشغيلي على نمو قاعدة العميلات',
      en: 'Operational Impact on Customer Lifetime Value',
    },
    impacts: [
      {
        title: {
          ar: 'ارتفاع القيمة الدائمة للعميلة (LTV)',
          en: 'Maximized Customer Lifetime Value',
        },
        description: {
          ar: 'العميلات المرتبطات ببرنامج الولاء ينفقن أكثر بنسبة تتجاوز 30% مقارنة بالزائرات العابرات.',
          en: 'Enrolled loyalty members spend on average 30%+ more over their lifecycle than non-participating visitors.',
        },
      },
      {
        title: {
          ar: 'ميزة تنافسية مستدامة لصالونك',
          en: 'Unmatched Competitive Moat',
        },
        description: {
          ar: 'النقاط والمكافآت التراكمية تجعل العميلة تفضل صالونك دائماً بدلاً من تجربة صالونات منافسة.',
          en: 'Accumulated loyalty balances create powerful incentives for clients to stay dedicated exclusively to your salon.',
        },
      },
      {
        title: {
          ar: 'تنشيط فترات الهدوء بذكاء',
          en: 'Smart Off-Peak Slot Activation',
        },
        description: {
          ar: 'منح نقاط مضاعفة في أوقات وسط الأسبوع يساعد في ملء الجداول في الأيام الهادئة.',
          en: 'Offering 2x points during midweek hours effectively fills chairs during otherwise slow periods.',
        },
      },
    ],
    ecosystemTitle: {
      ar: 'ترابط الولاء مع منظومة راش إكس',
      en: 'Loyalty Integration with the RASHX Ecosystem',
    },
    ecosystemDescription: {
      ar: 'يعمل نظام الولاء بتكامل مباشر مع نقاط البيع وتطبيق العميل لتقديم تجربة دفع واستبدال سلسة.',
      en: 'The loyalty engine interfaces directly with checkout POS and customer apps for smooth redemption.',
    },
    ecosystemConnections: [
      {
        ar: 'استبدال النقاط والخصومات مباشرة عند الدفع في نقطة البيع (POS) بنقرة واحدة.',
        en: 'Instant one-click point redemption towards bill discounts directly at the POS register.',
      },
      {
        ar: 'عرض رصيد النقاط والمكافآت المتاحة داخل تطبيق العميل بشفافية تامة.',
        en: 'Transparent real-time display of accumulated points balance within the Customer App.',
      },
    ],
    seo: {
      title: {
        ar: 'نظام الولاء والمكافآت للصالونات ومراكز التجميل | RASHX',
        en: 'Salon Customer Loyalty & Rewards Platform | RASHX',
      },
      description: {
        ar: 'نظام الولاء والمكافآت للصالونات من راش إكس: تصميم برامج الولاء، إدارة النقاط، مكافأة العميلات الدائمات، وزيادة معدل تكرار الزيارات.',
        en: 'Intelligent salon loyalty and client rewards software by RASHX: points configuration, VIP member tiers, and proven customer retention engines.',
      },
    },
  },

  notifications: {
    slug: 'notifications',
    path: '/solutions/notifications',
    badge: {
      ar: 'الإشعارات والتنبيهات',
      en: 'NOTIFICATIONS & ALERTS',
    },
    title: {
      ar: 'قنوات تواصل مؤتمتة وتنبيهات تشغيلية لحظية تبقيك على اطلاع دائم',
      en: 'Automated Messaging & Real-Time Operational Alerts',
    },
    subtitle: {
      ar: 'نظام إشعارات ذكي يرسل تأكيدات الحجوزات والتذكيرات للعميلات، وتنبيهات العمليات للإدارة والموظفين لمنع أي خلل.',
      en: 'An intelligent alerting engine dispatching booking confirmations, guest reminders, and operational alerts across teams.',
    },
    description: {
      ar: 'توفر وحدة الإشعارات والتنبيهات في راش إكس تواصلاً رقمياً فورياً عبر الرسائل النصية وتطبيق العميل وتنبيهات لوحة التحكم، لإشعار العميلات بمواعيدهن، وإعلام الأخصائيات بالحجوزات الجديدة، وتنبيه الإدارة بالأحداث التشغيلية المهمة.',
      en: 'The RASHX Notification module powers automated communication via SMS, push notifications, and dashboard alerts—confirming guest bookings, notifying specialists of schedule changes, and pinging managers on key operational events.',
    },
    highlights: [
      { ar: 'إشعارات تأكيد وتذكير المواعيد للعميلات', en: 'Automated appointment confirmation & reminders' },
      { ar: 'تنبيهات فورية للأخصائيات بالمهام الجديدة', en: 'Instant specialist schedule & shift updates' },
      { ar: 'إشعارات العروض الترويجية والتحديثات', en: 'Promotional broadcast campaigns and alerts' },
      { ar: 'تنبيهات تشغيلية وإدارية لحماية العمليات', en: 'Critical management & security event pings' },
    ],
    capabilities: [
      {
        id: 'booking-alerts',
        title: {
          ar: 'إشعارات الحجوزات والمواعيد',
          en: 'Booking Confirmations & Reminders',
        },
        description: {
          ar: 'رسائل فورية للعميلة عند تأكيد الحجز، وتذكير قبل الموعد بـ 24 ساعة وساعتين للحد من التأخير.',
          en: 'Instant notification on booking confirmation, followed by 24h and 2h automated reminders curbing no-shows.',
        },
      },
      {
        id: 'staff-pings',
        title: {
          ar: 'تنبيهات الإدارة والموظفين',
          en: 'Staff & Specialist Task Alerts',
        },
        description: {
          ar: 'إشعار فوري للأخصائية عند إسناد موعد جديد أو تعديل وقت جلسة، وتنبيه موظفي الاستقبال عند وصول العميلة.',
          en: 'Instant notifications to stylists upon appointment additions or rescheduling, and desk alerts upon guest check-in.',
        },
      },
      {
        id: 'promo-broadcasts',
        title: {
          ar: 'إشعارات العروض والتحديثات',
          en: 'Marketing & Promotional Broadcasts',
        },
        description: {
          ar: 'إرسال حملات ترويجية مستهدفة للعميلات حول الباقات الجديدة والمناسبات لزيادة وتيرة الحجز.',
          en: 'Broadcast tailored promotional announcements for seasonal packages and holiday offers to accelerate bookings.',
        },
      },
      {
        id: 'operational-flags',
        title: {
          ar: 'التنبيهات التشغيلية والرقابية',
          en: 'Operational Threshold Warnings',
        },
        description: {
          ar: 'تنبيه الإدارة عند إلغاء فاتورة، أو تسجيل خصم استثنائي، أو انخفاض مخزون مادة أساسية عن حد الأمان.',
          en: 'Instant management flags when invoices are voided, high discounts applied, or stock falls below critical thresholds.',
        },
      },
      {
        id: 'event-tracking',
        title: {
          ar: 'متابعة الأحداث المهمة داخل المنشأة',
          en: 'Critical Event Auditing',
        },
        description: {
          ar: 'سجل إشعارات وتنبيهات منظم يرصد كافة الأنشطة والمستجدات على مدار الساعة لضمان الانضباط.',
          en: 'An organized notification center recording all operational milestones and events around the clock.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر التشغيلي على تدفق العمليات',
      en: 'Operational Impact on Salon Responsiveness',
    },
    impacts: [
      {
        title: {
          ar: 'انخفاض مواعيد عدم الحضور بنسبة تفوق 75%',
          en: '75%+ Slashing of No-Show Rates',
        },
        description: {
          ar: 'التذكير التلقائي يمنح العميلات فرصة تأكيد أو إعادة جدولة الموعد مبكراً بدلاً من تفويت الجلسة.',
          en: 'Automated reminders give guests timely prompts to confirm or reschedule rather than missing slots.',
        },
      },
      {
        title: {
          ar: 'فريق عمل متناغم وخالٍ من سوء الفهم',
          en: 'Synchronized Team Coordination',
        },
        description: {
          ar: 'إخطار الأخصائيات اللحظي يلغي حاجة الاستقبال للمناداة اليدوية ويجعل بيئة الصالون أكثر هدوءاً.',
          en: 'Instant mobile alerts remove the need for reception yelling, preserving a calm, luxurious salon ambiance.',
        },
      },
      {
        title: {
          ar: 'رقابة إدارية استباقية ومستمرة',
          en: 'Proactive Managerial Governance',
        },
        description: {
          ar: 'وصول التنبيهات المهمة للإدارة يتيح التدخل السريع لمعالجة أي خلل تشغيلي قبل تفاقمه.',
          en: 'Immediate escalation of critical events enables managers to resolve bottlenecks before they impact service.',
        },
      },
    ],
    ecosystemTitle: {
      ar: 'ترابط الإشعارات مع منظومة راش إكس',
      en: 'Notifications Integration with the RASHX Ecosystem',
    },
    ecosystemDescription: {
      ar: 'تعمل الإشعارات كجهاز إنذار وتواصل يربط جميع وحدات المنصة ببعضها في الوقت الفعلي.',
      en: 'The notification engine functions as the real-time communications nervous system connecting all modules.',
    },
    ecosystemConnections: [
      {
        ar: 'إرسال إشعارات فورية عبر تطبيق العميل والرسائل النصية بمجرد تأكيد الحجز.',
        en: 'Instant push & SMS notifications triggered the second a booking is confirmed.',
      },
      {
        ar: 'تنبيه شاشات الكاشير (POS) والأخصائيات بوصول العميلة إلى صالة الاستقبال.',
        en: 'Real-time alert delivery to POS desks and specialist apps upon customer check-in.',
      },
    ],
    seo: {
      title: {
        ar: 'نظام الإشعارات والتنبيهات للصالونات ومراكز التجميل | RASHX',
        en: 'Salon Notifications & Automated Alerts System | RASHX',
      },
      description: {
        ar: 'نظام الإشعارات والتنبيهات للصالونات من راش إكس: إشعارات الحجوزات والمواعيد، تنبيهات الأخصائيات، الحملات الترويجية، والتنبيهات التشغيلية.',
        en: 'Automated notification and alert system for beauty salons by RASHX: appointment reminders, staff notifications, operational flags, and promotional SMS.',
      },
    },
  },

  analytics: {
    slug: 'analytics',
    path: '/solutions/analytics',
    badge: {
      ar: 'التقارير والتحليلات',
      en: 'REPORTS & ANALYTICS',
    },
    title: {
      ar: 'مؤشرات أداء دقيقة ورؤى بيانية تدعم قراراتك الاستثمارية والإدارية',
      en: 'Precision KPIs & Analytical Dashboards for Strategic Decisions',
    },
    subtitle: {
      ar: 'تقارير مالية وتشغيلية شاملة تمنحك رؤية كاملة لأداء المبيعات، ومعدلات إشغال الأخصائيات، وحركة العملاء والمخزون.',
      en: 'Comprehensive financial and operational reporting providing 360-degree visibility over sales, occupancy, and inventory health.',
    },
    description: {
      ar: 'تحول وحدة التقارير والتحليلات في راش إكس البيانات التشغيلية اليومية إلى مؤشرات أداء رئيسية (KPIs) واضحة وقابلة للتنفيذ، لتساعد ملاك الصالونات ومراكز التجميل على فهم مصادر الربحية، واكتشاف نقاط القوة، واتخاذ القرارات بثقة.',
      en: 'The RASHX Analytics module transforms raw floor data into actionable KPIs and intuitive charts—empowering salon and spa owners to pinpoint profit centers, evaluate team performance, and steer growth with confidence.',
    },
    highlights: [
      { ar: 'تقارير المبيعات والإيرادات وصافي الأرباح', en: 'Sales, revenue, and net profit ledgering' },
      { ar: 'مؤشرات أداء الموظفين ونسب الإنتاجية', en: 'Specialist productivity & utilization rates' },
      { ar: 'تحليلات الحجوزات ومعدلات إشغال الصالون', en: 'Appointment volumes & chair occupancy KPIs' },
      { ar: 'تقارير سلوك العملاء والمشتريات والمخزون', en: 'Customer retention, inventory, and purchasing' },
    ],
    capabilities: [
      {
        id: 'sales-revenue',
        title: {
          ar: 'تقارير المبيعات والإيرادات',
          en: 'Revenue & Sales Breakdown',
        },
        description: {
          ar: 'تحليلات دقيقة لإجمالي الإيرادات اليومية والشهرية، وصافي المبيعات حسب الفروع، وطرق الدفع المستخدمة.',
          en: 'Granular analysis of daily/monthly revenue, net sales by branch, and payment method distribution.',
        },
      },
      {
        id: 'staff-kpis',
        title: {
          ar: 'تقارير أداء وإنتاجية الموظفين',
          en: 'Specialist Performance & Productivity',
        },
        description: {
          ar: 'مقارنة إنتاجية الأخصائيات، وإجمالي الدخل المحقق لكل موظفة، وعمولاتها المستحقة، ومعدلات رضا العميلات.',
          en: 'Benchmarking specialist output, revenue generated per stylist, earned commissions, and client review scores.',
        },
      },
      {
        id: 'booking-occupancy',
        title: {
          ar: 'تقارير الحجوزات والخدمات الأكثر طلباً',
          en: 'Bookings & Service Popularity Trends',
        },
        description: {
          ar: 'إحصائيات توضح الخدمات الأكثر تحقيقاً للأرباح، وساعات الذروة، ونسب إلغاء وتأكيد المواعيد.',
          en: 'Statistics highlighting top-earning treatments, peak demand hours, cancellation rates, and chair occupancy.',
        },
      },
      {
        id: 'customer-insights',
        title: {
          ar: 'تقارير العملاء والزيارات والاحتفاظ',
          en: 'Client Retention & Acquisition Analytics',
        },
        description: {
          ar: 'قياس معدل نمو قاعدة العميلات، ونسب العميلات الجدد مقابل الدائمات، ومتوسط إنفاق العميلة في الزيارة.',
          en: 'Tracking guest acquisition rates, new vs. returning ratios, and average spend per client ticket.',
        },
      },
      {
        id: 'inventory-purchasing-reports',
        title: {
          ar: 'تقارير المشتريات والمخزون',
          en: 'Procurement & Inventory Turn Reports',
        },
        description: {
          ar: 'رصد تكاليف التوريد، ومعدل دوران المنتجات، وقيمة المخزون الحالي لتفادي تجميد الأموال في سلع راكدة.',
          en: 'Monitor procurement expenditure, stock turnover velocity, and total inventory value to optimize liquidity.',
        },
      },
      {
        id: 'strategic-kpis',
        title: {
          ar: 'مؤشرات الأداء الرئيسية (KPIs)',
          en: 'Executive KPI Dashboard',
        },
        description: {
          ar: 'لوحة قيادة تنفيذية تجمع أهم المؤشرات في شاشة واحدة لتوفير رؤية واضحة تدعم اتخاذ القرارات الإدارية والاستثمارية.',
          en: 'An executive cockpit consolidating vital metrics into a single screen to back administrative and expansion decisions.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر التشغيلي على اتخاذ القرار',
      en: 'Operational Impact on Strategic Growth',
    },
    impacts: [
      {
        title: {
          ar: 'قرارات قائمة على أرقام وحقائق',
          en: 'Data-Backed Management',
        },
        description: {
          ar: 'الاستغناء عن التخمين بالاعتماد على بيانات موثقة تحدد الخدمات الرابحة والفرص الاستثمارية الواعدة.',
          en: 'Replace guesswork with verifiable facts identifying top-margin services and prime expansion opportunities.',
        },
      },
      {
        title: {
          ar: 'اكتشاف ومكافأة الكفاءات المتميزة',
          en: 'Reward Top Performers',
        },
        description: {
          ar: 'تقارير الأداء الواضحة تكشف الأخصائيات الأكثر إنتاجية لمكافأتهن وتحفيز باقي الفريق على التطور.',
          en: 'Transparent performance metrics spotlight stellar specialists to incentivize the entire team effectively.',
        },
      },
      {
        title: {
          ar: 'تحسين هوامش الربحية الصافية',
          en: 'Maximized Net Margins',
        },
        description: {
          ar: 'المقارنة المستمرة بين تكاليف المواد وإيرادات الخدمات تكشف مواطن الهدر وتضاعف الأرباح الصافية.',
          en: 'Continuous comparison between product costs and service income uncovers leakage to maximize net profits.',
        },
      },
    ],
    ecosystemTitle: {
      ar: 'ترابط التحليلات مع منظومة راش إكس',
      en: 'Analytics Integration with the RASHX Ecosystem',
    },
    ecosystemDescription: {
      ar: 'تجمع وحدة التحليلات بياناتها آلياً من المبيعات، والحجوزات، والمخزون، والموارد البشرية لتحديث المؤشرات لحظة بلحظة.',
      en: 'The analytics engine pulls data automatically across POS, bookings, stock, and HR to update metrics in real time.',
    },
    ecosystemConnections: [
      {
        ar: 'تحديث مؤشرات المبيعات والإيرادات آلياً مع كل فاتورة تُسجل في نقطة البيع (POS).',
        en: 'Instant revenue index refresh with every invoice closed at the POS checkout counter.',
      },
      {
        ar: 'مزامنة معدلات إشغال الصالون والخدمات المنفذة مع جدول المواعيد الإلكترونية.',
        en: 'Live correlation between salon occupancy rates and active digital appointment calendars.',
      },
      {
        ar: 'ربط أداء الأخصائيات ومبيعاتهن بتقارير الموارد البشرية والرواتب.',
        en: 'Seamless integration of specialist productivity with HR payroll and commission statements.',
      },
    ],
    seo: {
      title: {
        ar: 'التقارير والتحليلات للصالونات ومراكز التجميل (KPIs) | RASHX',
        en: 'Salon Analytics, KPIs & Business Reporting | RASHX',
      },
      description: {
        ar: 'نظام التقارير والتحليلات المتطور للصالونات ومراكز التجميل من راش إكس: تقارير المبيعات، أداء الموظفين، الحجوزات، المشتريات والمخزون، ومؤشرات الأداء.',
        en: 'Executive salon analytics and business intelligence platform by RASHX: sales dashboards, specialist KPIs, treatment demand trends, and inventory auditing.',
      },
    },
  },
};
