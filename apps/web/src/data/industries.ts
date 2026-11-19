export interface LocalizedText {
  ar: string;
  en: string;
}

export interface IndustryData {
  slug: string;
  path: string;
  badge: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  challengesTitle: LocalizedText;
  challenges: {
    title: LocalizedText;
    description: LocalizedText;
  }[];
  solutionsTitle: LocalizedText;
  solutions: {
    title: LocalizedText;
    description: LocalizedText;
  }[];
  keyFeatures: LocalizedText[];
  stats: {
    value: string;
    label: LocalizedText;
  }[];
  seo: {
    title: LocalizedText;
    description: LocalizedText;
  };
}

export type IndustryKey =
  | 'beautySalons'
  | 'barbershops'
  | 'beautyCenters'
  | 'spa'
  | 'personalCare'
  | 'multiBranch';

export const industriesData: Record<IndustryKey, IndustryData> = {
  beautySalons: {
    slug: 'beauty-salons',
    path: '/industries/beauty-salons',
    badge: {
      ar: 'صالونات التجميل النسائية',
      en: "WOMEN'S BEAUTY SALONS",
    },
    title: {
      ar: 'إدارة متكاملة لصالونات التجميل النسائية ومراكز العناية',
      en: 'Unified Management for Women’s Beauty Salons & Care Centers',
    },
    subtitle: {
      ar: 'منظومة سحابية ذكية تمنح صالونك موقعاً خاصاً للحجز، وإدارة دقيقة لحجوزات الخبيرات، وحساب فوري لعمولات الشعر والمكياج والعناية مع فوترة ZATCA.',
      en: 'A dedicated cloud ecosystem providing your salon with an online booking engine, specialist roster management, instant commission calculations, and ZATCA compliance.',
    },
    description: {
      ar: 'صُممت راش إكس خصيصاً لتلائم طبيعة العمل اليومي في الصالونات النسائية بالمملكة، بدءاً من استقبال الزبائن وتنسيق مواعيد الخدمات المتداخلة (مكياج، تسريح، صبغات)، وصولاً إلى نقاط البيع السريعة وتطبيق العميل المخصص.',
      en: 'Engineered specifically for beauty salons in Saudi Arabia, streamlining service coordination across styling, color, and makeup with multi-service checkout and a client booking app.',
    },
    challengesTitle: {
      ar: 'تحديات إدارة الصالونات النسائية التقليدية',
      en: 'Common Operational Bottlenecks in Beauty Salons',
    },
    challenges: [
      {
        title: { ar: 'تزاحم المواعيد والانتظار الطويل', en: 'Overbooking & Customer Waiting' },
        description: {
          ar: 'تداخل مواعيد الخدمات الطويلة وضياع وقت العميلات نتيجة الاعتماد على الدفاتر الورقية أو الرسائل العشوائية.',
          en: 'Conflicting appointments and lost client time due to manual paper ledgers and unstructured chat messages.',
        },
      },
      {
        title: { ar: 'تعقيد حساب عمولات الكوافيرات', en: 'Complex Specialist Commission Accounting' },
        description: {
          ar: 'صعوبة رصد نسب العمولات المتغيرة للخدمات ومبيعات المنتجات بين مقدمات الخدمات في نهاية كل شهر.',
          en: 'Time-consuming monthly calculations of variable service tiers, product sales incentives, and tips.',
        },
      },
      {
        title: { ar: 'غياب ملف رقمي لتفضيلات العميلة', en: 'Missing Digital Client Profiles' },
        description: {
          ar: 'عدم توثيق درجات الصبغة وتفضيلات تسريحة العميلات، مما يضعف جودة الخدمة عند تغيير الأخصائية.',
          en: 'Lack of centralized notes on hair dye formulas and customer styling preferences.',
        },
      },
    ],
    solutionsTitle: {
      ar: 'كيف ترتقي RASHX بتشغيل صالونك النسائي؟',
      en: 'How RASHX Elevates Your Salon Operations',
    },
    solutions: [
      {
        title: { ar: 'بوابة حجز إلكترونية بهوية صالونك', en: 'Branded Online Booking Portal' },
        description: {
          ar: 'موقع إلكتروني يعرض باقاتك وصور أعمالك ويتيح للعميلات اختيار الأخصائية والوقت والدفع المسبق بكل سلاسة.',
          en: 'A private website showcasing service packages, portfolio photos, and live specialist availability.',
        },
      },
      {
        title: { ar: 'تطبيق مقدم الخدمة للأخصائيات', en: 'Specialist Mobile App' },
        description: {
          ar: 'شاشة خاصة لكل كوافيرة لمتابعة جدول مواعيدها اليومية، وتأكيد بدء الخدمة ورصد استحقاق العمولات لحظياً.',
          en: 'Direct staff dashboard to review today’s appointments, launch service sessions, and view earnings.',
        },
      },
      {
        title: { ar: 'كاشير سريع متوافق مع هيئة الزكاة', en: 'Fast POS & ZATCA E-Invoicing' },
        description: {
          ar: 'إصدار فواتير ضريبية مبسطة بلمسة واحدة مع دعم تفتيت الفاتورة بين خدمات متعددة وطرق دفع منوعة.',
          en: 'Instant simplified tax invoices with QR codes, supporting split bills and multi-tender payments.',
        },
      },
    ],
    keyFeatures: [
      { ar: 'حجز ذكي متعدد الخدمات في موعد واحد', en: 'Smart multi-service appointment bundling' },
      { ar: 'حساب تلقائي لعمولات مبيعات الصالون والخدمات', en: 'Automatic retail & service commission splits' },
      { ar: 'إشعارات WhatsApp وتذكير آلي بالمواعيد', en: 'Automated SMS/WhatsApp appointment reminders' },
      { ar: 'إدارة متقدمة لمنتجات ومواد العناية والشعر', en: 'Salon inventory & professional treatment supplies' },
    ],
    stats: [
      { value: '100%', label: { ar: 'توافق مع اشتراطات هيئة الزكاة ZATCA', en: 'ZATCA Phase 2 Compliance' } },
      { value: '4 في 1', label: { ar: 'منظومة موحدة (موقع، لوحة، وتطبيقين)', en: 'Unified 4-in-1 Ecosystem' } },
      { value: '0', label: { ar: 'تعارض في حجوزات المواعيد والخدمات', en: 'Zero Booking Conflicts' } },
    ],
    seo: {
      title: {
        ar: 'برنامج إدارة الصالونات النسائية ومراكز التجميل | RASHX',
        en: "Women's Beauty Salon Management System | RASHX",
      },
      description: {
        ar: 'نظام سحابي متكامل لإدارة الصالونات النسائية في السعودية: حجوزات رقمية، نقاط بيع POS، حساب العمولات، وفوترة إلكترونية معتمدة.',
        en: 'All-in-one cloud salon software in Saudi Arabia: online booking, POS, stylist commissions, and ZATCA compliance.',
      },
    },
  },

  barbershops: {
    slug: 'barbershops',
    path: '/industries/barbershops',
    badge: {
      ar: 'صالونات الحلاقة والعناية الرجالية',
      en: "MEN'S BARBERSHOPS & GROOMING",
    },
    title: {
      ar: 'المنظومة الرقمية الأسرع لإدارة صالونات الحلاقة الرجالية',
      en: 'The Fastest Operating System for Men’s Barbershops',
    },
    subtitle: {
      ar: 'تحكم فوري في طابور الانتظار، حجز مواعيد الحلاق المفضل، كاشير سريع البرق، وحساب عمولات الخدمات والمنتجات بدقة متناهية.',
      en: 'Queue management, client booking for preferred barbers, lightning-fast POS checkout, and transparent commission calculations.',
    },
    description: {
      ar: 'تتميز صالونات الحلاقة الرجالية بالسرعة العالية وتدفق العملاء السريع. توفر RASHX أدوات كاشير فائقة السلاسة، وشاشات طابور انتظار تفاعلية، مع تمكين العميل من الحجز المسبق لتقليل الازدحام في أوقات الذروة والمواسم.',
      en: 'Barbershops demand speed and rapid turnover. RASHX equips barbershops with swift POS terminals, live queue tracking, and advance booking to conquer seasonal peaks.',
    },
    challengesTitle: {
      ar: 'تحديات التشغيل في صالونات الحلاقة',
      en: 'Operational Pressures in Modern Barbershops',
    },
    challenges: [
      {
        title: { ar: 'ازدحام عطلات نهاية الأسبوع والأعياد', en: 'Peak-Hour Chaos & Holiday Crowds' },
        description: {
          ar: 'تكدس الزبائن في صالة الانتظار لساعات وفقدان العملاء نتيجة غياب نظام تنظيم الطابور أو الحجز المسبق.',
          en: 'Overcrowded waiting lounges leading to walkouts and lost revenue during peak weekends.',
        },
      },
      {
        title: { ar: 'بطء الدفع الورقي والمحاسبة', en: 'Slow Checkout & Paper Slips' },
        description: {
          ar: 'تأخر المحاسبة بين الحلاقين وتراكم الإيصالات الورقية التي تعرقل إتمام الخدمات بسرعة.',
          en: 'Manual ticket handling causing bottlenecks between barber chairs and cashier counters.',
        },
      },
      {
        title: { ar: 'غياب المتابعة الرقمية للعميل', en: 'Zero Client Retention Records' },
        description: {
          ar: 'صعوبة استعادة العملاء المنقطعين أو إرسال عروض ترويجية للخدمات الإضافية كالبكجات والعناية بالبشرة.',
          en: 'Inability to re-engage lapsed customers or promote value-added grooming packages.',
        },
      },
    ],
    solutionsTitle: {
      ar: 'حلول RASHX لصالونات الحلاقة الرجالية',
      en: 'RASHX Solutions Tailored for Barbershops',
    },
    solutions: [
      {
        title: { ar: 'كاشير نقرة واحدة مع مدى وApple Pay', en: '1-Tap Fast Checkout' },
        description: {
          ar: 'واجهة نقاط بيع مهيأة للشاشات اللمسية لإصدار الفاتورة الضريبية في ثوانٍ معدودة دون تأخير.',
          en: 'Touch-optimized POS completing compliant transactions in seconds with Mada and Apple Pay.',
        },
      },
      {
        title: { ar: 'نظام إدارة طابور الانتظار الذكي', en: 'Smart Live Queue Management' },
        description: {
          ar: 'إمكانية انضمام العميل للطابور الرقمي ومتابعة دوره عبر هاتفه، مما يمنحه راحة ويقلل تكدس الصالون.',
          en: 'Digital queue allowing clients to monitor their wait time via mobile without waiting in crowded lounges.',
        },
      },
      {
        title: { ar: 'جدولة الحلاق المفضل وباقات الخدمات', en: 'Preferred Barber Scheduling & Packages' },
        description: {
          ar: 'تمكين العميل من حجز كرسيه المفضل واختيار باقات العناية المتكاملة (شعر، لحية، عناية بالبشرة).',
          en: 'Empower clients to reserve specific barbers and multi-tier grooming combo packages online.',
        },
      },
    ],
    keyFeatures: [
      { ar: 'حجز فوري لكرسي الحلاق المفضل', en: 'Chair and barber preference booking' },
      { ar: 'حساب عمولات الحلاقين لكل خدمة ومنتج', en: 'Individual barber commission ledger' },
      { ar: 'نقاط بيع سريعة تدعم تفتيت الفاتورة', en: 'High-speed touch POS with split payments' },
      { ar: 'تقارير يومية فورية بالمبيعات والأداء', en: 'Daily live performance & sales analytics' },
    ],
    stats: [
      { value: '3 ثوانٍ', label: { ar: 'متوسط زمن إصدار الفاتورة الضريبية', en: 'Average Tax Invoice Speed' } },
      { value: '40%+', label: { ar: 'انخفاض في فترات انتظار العميل', en: 'Reduction in Client Waiting Time' } },
      { value: '100%', label: { ar: 'دقة في حساب نسب وعمولات الحلاقين', en: 'Accurate Barber Commission Ledger' } },
    ],
    seo: {
      title: {
        ar: 'برنامج إدارة صالونات الحلاقة الرجالية | RASHX',
        en: "Men's Barbershop POS & Booking Software | RASHX",
      },
      description: {
        ar: 'نظام سحابي ذكي لإدارة صالونات الحلاقة: نقاط بيع كاشير سريعة، تنظيم طابور المواعيد، حساب العمولات، وفوترة إلكترونية معتمدة ZATCA.',
        en: 'Smart barbershop POS and appointment system in Saudi Arabia: fast checkout, queue management, and ZATCA Phase 2 billing.',
      },
    },
  },

  beautyCenters: {
    slug: 'beauty-centers',
    path: '/industries/beauty-centers',
    badge: {
      ar: 'مراكز التجميل المتكاملة',
      en: 'INTEGRATED BEAUTY CENTERS',
    },
    title: {
      ar: 'إدارة تشغيلية شاملة لمراكز التجميل الكبرى ومتعددة الأقسام',
      en: 'Comprehensive Enterprise Management for Beauty Centers',
    },
    subtitle: {
      ar: 'ربط متكامل بين أقسام الشعر، البشرة، المكياج، والأظافر في شاشة إدارة واحدة مع مراقبة حية للمخزون والغرف والكادر.',
      en: 'Unified orchestration connecting hair, skincare, makeup, and nail departments with real-time room, inventory, and staff management.',
    },
    description: {
      ar: 'تحتوي مراكز التجميل المتكاملة على أقسام متعددة وكادر ضخم يتطلب تنسيقاً دقيقاً للمواعيد والغرف والمواد المستهلكة. تمنحك راش إكس تحكماً شاملاً في الموارد البشرية، وتتبعاً دقيقاً للمخزون، وتحليلات أداء تفصيلية لكل قسم.',
      en: 'Integrated beauty complexes operate across multiple specialized zones. RASHX delivers multi-department resource scheduling, room allocation, batch inventory tracking, and division-level revenue reporting.',
    },
    challengesTitle: {
      ar: 'تحديات إدارة مراكز التجميل الكبيرة',
      en: 'Key Challenges in Running Large Beauty Centers',
    },
    challenges: [
      {
        title: { ar: 'تشتت إدارة الأقسام المتعددة', en: 'Fragmented Multi-Department Operations' },
        description: {
          ar: 'صعوبة التنسيق بين قسم الشعر وقسم البشرة وقسم المكياج عند زيارة العميلة الواحدة لعدة أقسام.',
          en: 'Friction when a client receives services across hair, aesthetic, and nail departments in one visit.',
        },
      },
      {
        title: { ar: 'هدر المواد المستهلكة في الجلسات', en: 'Inventory Leakage in Treatment Sessions' },
        description: {
          ar: 'صعوبة تتبع كميات المستحضرات ومواد العناية المستخدمة في كل جلسة وتأثيرها على هامش الربح.',
          en: 'Unmonitored professional product usage leading to margin erosion across beauty treatments.',
        },
      },
      {
        title: { ar: 'إشغال الغرف والأجهزة المتخصصة', en: 'Room & Specialized Equipment Bottlenecks' },
        description: {
          ar: 'تعارض حجز غرف العناية الخاصة أو أجهزة التنظيف والترطيب بين الأخصائيات في نفس الوقت.',
          en: 'Overlapping bookings for VIP treatment rooms and specialized facial apparatus.',
        },
      },
    ],
    solutionsTitle: {
      ar: 'حلول RASHX لمراكز التجميل المتكاملة',
      en: 'RASHX Capabilities for Beauty Centers',
    },
    solutions: [
      {
        title: { ar: 'فاتورة موحدة لعدة أقسام وأخصائيات', en: 'Unified Multi-Department Checkout' },
        description: {
          ar: 'إصدار فاتورة إلكترونية واحدة تجمع كافة خدمات العميلة عبر مختلف الأقسام مع توزيع عمولاتها بدقة.',
          en: 'Consolidate multiple treatments across different departments into a single invoice with automated commission splits.',
        },
      },
      {
        title: { ar: 'جدولة الغرف والمعدات والأخصائيات', en: 'Resource, Room & Machine Scheduling' },
        description: {
          ar: 'منع التعارض تلقائياً عبر ربط حجز الخدمة بالأخصائية المتاحة والغرفة الشاغرة في نفس التوقيت.',
          en: 'Automated 3-way conflict checking ensuring specialist, room, and equipment are all simultaneously available.',
        },
      },
      {
        title: { ar: 'خصم تلقائي للمواد من المخزون', en: 'Automated Recipe Consumption from Stock' },
        description: {
          ar: 'ربط كل خدمة بالمقادير المعيارية لخصم الكميات المستهلكة من المستودع فور تأكيد إتمام الجلسة.',
          en: 'Automatic inventory deduction based on standardized service formulas upon session completion.',
        },
      },
    ],
    keyFeatures: [
      { ar: 'إدارة متزامنة لعدة أقسام تشغيلية', en: 'Simultaneous multi-department management' },
      { ar: 'حجز وربط الغرف والمعدات المتخصصة', en: 'VIP room and apparatus reservation engine' },
      { ar: 'تتبع هدر المخزون ومراقبة صلاحيات المواد', en: 'Batch tracking and consumption auditing' },
      { ar: 'تقارير أرباح مفصلة على مستوى كل قسم', en: 'Departmental P&L and contribution analysis' },
    ],
    stats: [
      { value: '1', label: { ar: 'لوحة مركزية لجميع الأقسام والغرف', en: 'Centralized Dashboard for All Divisions' } },
      { value: '100%', label: { ar: 'مزامنة فورية بين الحجوزات والمخزون', en: 'Real-Time Inventory Auto-Sync' } },
      { value: '0', label: { ar: 'تعارض في إشغال غرف الجلسات الخاصة', en: 'Zero VIP Room Scheduling Clashes' } },
    ],
    seo: {
      title: {
        ar: 'نظام إدارة مراكز التجميل الكبرى المتكاملة | RASHX',
        en: 'Integrated Beauty Center Software & POS | RASHX',
      },
      description: {
        ar: 'منظومة سحابية متقدمة لإدارة مراكز التجميل متعددة الأقسام: جدولة الغرف، تتبع المخزون المستهلك، ونقاط بيع ZATCA موحدة.',
        en: 'Advanced cloud platform for multi-department beauty complexes: room allocation, recipe-based inventory, and unified POS.',
      },
    },
  },

  spa: {
    slug: 'spa',
    path: '/industries/spa',
    badge: {
      ar: 'السبا ونوادي الاستجمام الصحي',
      en: 'SPA & WELLNESS SANCTUARIES',
    },
    title: {
      ar: 'إدارة فاخرة وهادئة لنوادي السبا ومراكز الاستجمام',
      en: 'Elevated Management for Spas & Wellness Sanctuaries',
    },
    subtitle: {
      ar: 'جدولة دقيقة لجلسات المساج، الحمام المغربي، والعناية بالبشرة، مع تخصيص غرف الاسترخاء وإدارة اشتراكات العضويات.',
      en: 'Meticulous scheduling for massage therapies, baths, and wellness rituals with suite allocation and membership management.',
    },
    description: {
      ar: 'يقوم نجاح السبا على توفير تجربة هادئة ومنظمة للعميل دون أي إرباك أو انتظار. توفر RASHX منصة حجز رقمية راقية تتيح اختيار المعالج، تحديد الباقة العلاجية، وتنسيق أوقات التعقيم بين الجلسات آلياً.',
      en: 'Spa excellence hinges on tranquility, discretion, and precision. RASHX orchestrates therapist assignments, luxury ritual packaging, automated suite sanitation buffers, and recurring memberships.',
    },
    challengesTitle: {
      ar: 'تحديات إدارة مراكز السبا والاستجمام',
      en: 'Operational Nuances of Luxury Spas',
    },
    challenges: [
      {
        title: { ar: 'تنسيق أوقات التجهيز والتعقيم بين الجلسات', en: 'Sanitation & Room Reset Buffers' },
        description: {
          ar: 'تداخل المواعيد عند إهمال احتساب فترات تنظيف وتعقيم أجنحة السبا والحمام بين كل عميلة وأخرى.',
          en: 'Booking clashes caused by failing to enforce turnaround times between hydrothermal and massage sessions.',
        },
      },
      {
        title: { ar: 'إدارة باقات العضويات وجلسات البكجات', en: 'Package Bundles & Membership Tracking' },
        description: {
          ar: 'صعوبة تتبع عدد الجلسات المتبقية في باقات المساج والحمام المباعة مسبقاً للعميلات.',
          en: 'Errors in tracking remaining session balances across prepaid multi-visit wellness packages.',
        },
      },
      {
        title: { ar: 'توثيق الحالات الصحية والتفضيلات', en: 'Medical Intake & Client Preferences' },
        description: {
          ar: 'الحاجة إلى تسجيل الملاحظات الصحية (حساسية الزيوت، الضغط، الحمل) لضمان سلامة الجلسة العلاجية.',
          en: 'Need for discreet medical notes regarding pressure preferences, allergies, and pregnancy status.',
        },
      },
    ],
    solutionsTitle: {
      ar: 'مزايا RASHX المتخصصة لقطاع السبا',
      en: 'How RASHX Powers Luxury Spa Operations',
    },
    solutions: [
      {
        title: { ar: 'فترات تعقيم تلقائية بين الحجوزات', en: 'Automatic Post-Service Sanitation Buffers' },
        description: {
          ar: 'إضافة فترة راحة وتعقيم محددة آلياً بعد كل جلسة لضمان جاهزية الجناح دون أي تداخل في المواعيد.',
          en: 'Built-in turnaround buffer time automatically added to schedules after each ritual for seamless suite sanitation.',
        },
      },
      {
        title: { ar: 'نظام إدارة باقات الجلسات والعضويات', en: 'Prepaid Bundles & Member Wallets' },
        description: {
          ar: 'متابعة آلية لخصم الجلسات المتبقية في حساب العميلة مع إشعار فوري برصيد باقتها بعد كل زيارة.',
          en: 'Automated package ledger debiting sessions upon check-in and sending instant balance notifications to clients.',
        },
      },
      {
        title: { ar: 'سجل صحي سري وتفضيلات الجلسة', en: 'Confidential Wellness Preferences' },
        description: {
          ar: 'حفظ آمن لتفضيلات العميل (درجة ضغط المساج، الزيوت العطرية، وموانع الاستخدام) في ملف رقمي مشفر.',
          en: 'Securely encrypted client notes recording essential sensory preferences and therapeutic contraindications.',
        },
      },
    ],
    keyFeatures: [
      { ar: 'فترات تنظيف وتعقيم مجدولة آلياً بين الجلسات', en: 'Automated suite sanitation turnaround buffers' },
      { ar: 'تتبع رصيد البكجات والعضويات والاشتراكات', en: 'Prepaid package and membership session wallets' },
      { ar: 'سجل رقمي سري لتفضيلات الزيوت والضغط', en: 'Confidential therapist and preference profiles' },
      { ar: 'فوترة ضريبية مبسطة معتمدة من هيئة الزكاة', en: 'Certified ZATCA Phase 2 compliant billing' },
    ],
    stats: [
      { value: '100%', label: { ar: 'دقة في جدولة أجنحة السبا وأوقات التعقيم', en: 'Automated Suite Turnaround Precision' } },
      { value: '0', label: { ar: 'أخطاء في رصد الجلسات المتبقية بالباقات', en: 'Zero Errors in Member Session Balances' } },
      { value: 'سري', label: { ar: 'تشفير تام لبيانات العملاء وتفضيلاتهم', en: 'Discreet End-to-End Preference Encryption' } },
    ],
    seo: {
      title: {
        ar: 'برنامج إدارة السبا ومراكز الاستجمام الصحي | RASHX',
        en: 'Luxury Spa Management Software & Booking | RASHX',
      },
      description: {
        ar: 'حلول رقمية راقية لإدارة السبا ومراكز الاستجمام: جدولة الجلسات، إدارة باقات العضويات، وفترات تعقيم تلقائية مع فوترة ZATCA.',
        en: 'Elevated cloud software for luxury spas and wellness clubs: automated sanitation buffers, prepaid packages, and ZATCA compliance.',
      },
    },
  },

  personalCare: {
    slug: 'personal-care',
    path: '/industries/personal-care',
    badge: {
      ar: 'مراكز العناية الشخصية والأظافر',
      en: 'PERSONAL CARE & NAIL BARS',
    },
    title: {
      ar: 'المنظومة الرقمية المثالية لصالونات الأظافر ومراكز العناية السريعة',
      en: 'The Ultimate Platform for Nail Bars & Rapid Care Studios',
    },
    subtitle: {
      ar: 'إدارة محطات المانيكير والباديكير، حجز أخصائيات رسم الأظافر، تتبع درجات الألوان، وتسريع دورة العمل في أوقات الذروة.',
      en: 'Manicure and pedicure station allocation, nail artist booking, color shade records, and streamlined workflow velocity.',
    },
    description: {
      ar: 'تتميز صالونات الأظافر والعناية السريعة بحجم معاملات مرتفع ومدد خدمات قصيرة ومتزامنة. توفر RASHX واجهة كاشير لمسية رشيقة، وسجلاً لحفظ ألوان التصاميم، ونظام ولاء ذكي يحفز العميلة على تكرار الزيارة باستمرار.',
      en: 'Nail bars operate at high velocity with shorter, simultaneous treatments. RASHX provides rapid touch POS, shade code cataloging, and automated loyalty mechanics that drive repeat appointments.',
    },
    challengesTitle: {
      ar: 'تحديات صالونات الأظافر والعناية',
      en: 'Key Bottlenecks in Nail Bars & Fast Care',
    },
    challenges: [
      {
        title: { ar: 'تزاحم محطات المانيكير والباديكير', en: 'Station & Chair Scheduling Overlaps' },
        description: {
          ar: 'صعوبة توزيع كراسي البديكير ومحطات المانيكير بدقة عند طلب العميلة خدمتين متزامنتين من فنيتين.',
          en: 'Friction coordinating dual-technician treatments (e.g. simultaneous mani-pedi) across busy stations.',
        },
      },
      {
        title: { ar: 'فقدان أرقام درجات ألوان الأظافر', en: 'Lost Shade Codes & Polish Formulas' },
        description: {
          ar: 'نسيان رقم اللون أو الماركة التي اختارتها العميلة في الزيارة السابقة مما يطيل وقت الاستشارة.',
          en: 'Customers forgetting preferred gel shade codes, leading to prolonged consultations and delays.',
        },
      },
      {
        title: { ar: 'تكرار الزيارات والحفاظ على الولاء', en: 'Client Retention & Rebooking Lag' },
        description: {
          ar: 'تأخر العميلات في إعادة حجز جلسات الصيانة الدورية دون وجود رسائل تذكير تلقائية مجدولة.',
          en: 'Lack of timely rebooking nudges when gel maintenance or refills are due every 2-3 weeks.',
        },
      },
    ],
    solutionsTitle: {
      ar: 'حلول RASHX لصالونات الأظافر والعناية',
      en: 'How RASHX Powers Nail Bars',
    },
    solutions: [
      {
        title: { ar: 'حجز متزامن لمحطات اليدين والقدمين', en: 'Dual-Tech Simultaneous Booking' },
        description: {
          ar: 'جدولة فنيتين لخدمة عميلة واحدة في نفس الوقت على شاشة واحدة دون أي تداخل في الحجوزات.',
          en: 'Easily book two nail artists to serve a single client simultaneously with unified station tracking.',
        },
      },
      {
        title: { ar: 'سجل ألوان الأظافر ومكتبة التصاميم', en: 'Color Code & Nail Art Vault' },
        description: {
          ar: 'حفظ رقم درجة اللون وصورة التصميم في ملف العميلة الرقمي للرجوع إليها بلمسة زر في الزيارات القادمة.',
          en: 'Save exact polish codes and reference photos in the client’s digital profile for instant re-creation.',
        },
      },
      {
        title: { ar: 'تذكير ذكي بمواعيد الصيانة الدورية', en: 'Automated 3-Week Maintenance Reminders' },
        description: {
          ar: 'إرسال إشعار ودي تلقائي بعد أسبوعين من الخدمة لحجز موعد تجديد أو إزالة الجيل بدقة.',
          en: 'Automated reminders sent at the optimal interval to invite clients back for refill appointments.',
        },
      },
    ],
    keyFeatures: [
      { ar: 'جدولة متزامنة لفنيتين في نفس التوقيت', en: 'Simultaneous 2-technician appointment booking' },
      { ar: 'سجل رقمي لدرجات الألوان وماركات الجيل', en: 'Digital color code and styling photo vault' },
      { ar: 'نقاط بيع سريعة مع فواتير ZATCA فورية', en: 'Rapid checkout with compliant instant ZATCA billing' },
      { ar: 'برنامج مكافآت ونقاط ولاء لزيادة تكرار الزيارات', en: 'Automated loyalty rewards driving repeat visits' },
    ],
    stats: [
      { value: '2 في 1', label: { ar: 'حجز متزامن لخدمات اليدين والقدمين', en: 'Dual Simultaneous Service Booking' } },
      { value: '35%+', label: { ar: 'ارتفاع في معدل تكرار زيارات العميلات', en: 'Boost in 3-Week Repeat Bookings' } },
      { value: '100%', label: { ar: 'امتثال تام مع الفوترة الإلكترونية ZATCA', en: 'Full ZATCA E-Invoicing Compliance' } },
    ],
    seo: {
      title: {
        ar: 'برنامج إدارة صالونات الأظافر ومراكز العناية | RASHX',
        en: 'Nail Bar & Fast Care Management Software | RASHX',
      },
      description: {
        ar: 'نظام سحابي ذكي مخصص لصالونات الأظافر والعناية: حجز متزامن، سجل درجات الألوان، كاشير سريع، وفوترة إلكترونية معتمدة.',
        en: 'Tailored cloud platform for nail bars: dual-tech booking, color shade memory, fast POS, and ZATCA Phase 2 billing.',
      },
    },
  },

  multiBranch: {
    slug: 'multi-branch',
    path: '/industries/multi-branch',
    badge: {
      ar: 'سلاسل الصالونات والمراكز متعددة الفروع',
      en: 'MULTI-BRANCH SALON CHAINS & ENTERPRISE',
    },
    title: {
      ar: 'المنصة السحابية المركزية لإدارة سلاسل الصالونات ومجموعات التجميل',
      en: 'Centralized Multi-Branch Enterprise Salon Operating System',
    },
    subtitle: {
      ar: 'تحكم موحد في كافة الفروع، لوحة تقارير مركزية موحدة، تنقل سلس للعملاء بين الفروع، ومزامنة فورية للأسعار والمخزون والعمولات.',
      en: 'Unified headquarters control across all salon branches: consolidated KPIs, cross-branch client profiles, and synchronized catalog pricing.',
    },
    description: {
      ar: 'تتطلب إدارة سلاسل الصالونات مراقبة مركزية دقيقة تسمح لمدير المنشأة بمتابعة مبيعات كل فرع وأداء كوادره، مع منح كل فرع استقلاليته التشغيلية. توفر راش إكس بنية سحابية هرمية تدعم تعدد الفروع بكفاءة مطلقة.',
      en: 'Managing multiple salon locations demands centralized oversight without sacrificing local agility. RASHX provides enterprise role-based governance, branch-level POS synchronization, and unified analytics.',
    },
    challengesTitle: {
      ar: 'تحديات إدارة الفروع المتعددة',
      en: 'Enterprise Challenges in Multi-Branch Expansion',
    },
    challenges: [
      {
        title: { ar: 'انفصال بيانات الفروع وتشتت التقارير', en: 'Data Silos & Scattered Branch Reports' },
        description: {
          ar: 'صعوبة تجميع مبيعات الفروع المختلفة في تقرير واحد ومقارنة مؤشرات أداء كل موقع بدقة وسرعة.',
          en: 'Manual spreadsheet consolidation across disconnected branch databases, slowing strategic decisions.',
        },
      },
      {
        title: { ar: 'فقدان سجل العميل عند زيارة فرع آخر', en: 'Lost Client Context Between Branches' },
        description: {
          ar: 'عدم تعرف الفرع الثاني على ملف العميلة وباقة عضويتها المسجلة في الفرع الأول.',
          en: 'Clients having to re-register when visiting a sister branch, failing to honor existing package credits.',
        },
      },
      {
        title: { ar: 'صعوبة ضبط الأسعار وتوحيد السياسات', en: 'Pricing Inconsistencies & Staff Policies' },
        description: {
          ar: 'تفاوت أسعار الخدمات والعمولات بين الفروع نتيجة غياب لوحة تحكم مركزية تفرض المعايير الموحدة.',
          en: 'Discrepancies in service pricing, commission tiers, and stock replenishment policies across sites.',
        },
      },
    ],
    solutionsTitle: {
      ar: 'قدرات RASHX للمنشآت متعددة الفروع',
      en: 'Enterprise Multi-Branch Power by RASHX',
    },
    solutions: [
      {
        title: { ar: 'لوحة قيادة مركزية للمقر الرئيسي', en: 'Headquarters Executive Dashboard' },
        description: {
          ar: 'متابعة حية وشاملة لمبيعات كل فرع، نسب الإشغال، وإيرادات الكوادر مع مقارنة الأداء بلمحة واحدة.',
          en: 'Real-time birds-eye view of revenue, occupancy rates, and staff velocity across all locations.',
        },
      },
      {
        title: { ar: 'ملف عميل موحد ومشترك بين الفروع', en: 'Cross-Branch Unified Client Profiles' },
        description: {
          ar: 'سجل رقمي واحد للعميلة يتيح لها الاستفادة من رصيد محفظتها وباقات عضويتها في أي فرع تزوره بسلاسة.',
          en: 'Single shared customer record recognizing package balances, loyalty tiers, and history at any venue.',
        },
      },
      {
        title: { ar: 'نقل المخزون والمشتريات المركزية', en: 'Central Warehouse & Inter-Branch Stock Transfers' },
        description: {
          ar: 'إدارة المستودع الرئيسي وتوزيع شحنات المنتجات والمواد بين الفروع بأوامر نقل إلكترونية معتمدة.',
          en: 'Manage central distribution, issue verified transfer orders, and monitor branch inventory levels.',
        },
      },
    ],
    keyFeatures: [
      { ar: 'لوحة تحكم مركزية وتقارير مجمعة لكافة الفروع', en: 'Consolidated executive HQ analytics and branch comparison' },
      { ar: 'ملف عميل موحد وعضويات مشتركة عبر السلسلة', en: 'Cross-branch client identity and shared package wallets' },
      { ar: 'إدارة نقل المخزون بين الفروع والمستودع الرئيسي', en: 'Inter-branch stock transfer orders and central warehousing' },
      { ar: 'صلاحيات وصول دقيقة لكل مدير فرع ومحاسب', en: 'Granular role-based permissions per branch and region' },
    ],
    stats: [
      { value: '∞', label: { ar: 'قابلية غير محدودة للتوسع وإضافة الفروع', en: 'Unlimited Scalability for New Locations' } },
      { value: '1', label: { ar: 'حساب مركزي يدير كافة الفروع بسلاسة', en: 'Single Unified Administrative Master Account' } },
      { value: '100%', label: { ar: 'ربط سحابي مشفر مع استقلالية كل فرع', en: 'Encrypted Cloud Sync with Local Resilience' } },
    ],
    seo: {
      title: {
        ar: 'برنامج إدارة سلاسل الصالونات والمراكز متعددة الفروع | RASHX',
        en: 'Multi-Branch Salon Chain Management Software | RASHX',
      },
      description: {
        ar: 'منظومة سحابية متقدمة لسلاسل الصالونات في السعودية: تقارير مركزية، ملف عميل موحد بين الفروع، ونقل المخزون مع فوترة ZATCA.',
        en: 'Enterprise cloud platform for multi-branch salon chains: consolidated analytics, cross-branch client wallets, and ZATCA POS.',
      },
    },
  },
};
