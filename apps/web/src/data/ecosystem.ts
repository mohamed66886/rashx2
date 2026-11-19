export interface LocalizedText {
  ar: string;
  en: string;
}

export interface EcosystemPillar {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface EcosystemProductData {
  slug: string;
  path: string;
  badge: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedText[];
  pillars: EcosystemPillar[];
  keyBenefitsTitle: LocalizedText;
  keyBenefits: {
    title: LocalizedText;
    description: LocalizedText;
  }[];
  architectureSyncTitle: LocalizedText;
  architectureSyncDescription: LocalizedText;
  architectureSyncPoints: LocalizedText[];
  seo: {
    title: LocalizedText;
    description: LocalizedText;
  };
}

export const ecosystemData: Record<string, EcosystemProductData> = {
  websites: {
    slug: 'websites',
    path: '/websites',
    badge: {
      ar: 'الموقع الإلكتروني للمنشأة',
      en: 'SALON DIGITAL WEBSITE',
    },
    title: {
      ar: 'واجهة إلكترونية احترافية تمثل صالونك وتستقبل عميلاتك على مدار الساعة',
      en: 'A Professional Branded Website Welcoming Clients 24/7',
    },
    subtitle: {
      ar: 'موقع إلكتروني متكامل يحمل هوية صالونك ويعمل تحت نطاق فرعي مخصص، يعرض خدماتك، أسعارك، وعروضك مع حجز مباشر.',
      en: 'A dedicated, high-conversion website running under your branded subdomain—showcasing treatments, price lists, and promotions with instant digital booking.',
    },
    description: {
      ar: 'تمنح راش إكس كل صالون ومركز تجميل واجهة إلكترونية متطورة تعكس فخامة المنشأة واحترافيتها، وتتيح للعميلات التعرف على قائمة الخدمات والأسعار، والاطلاع على صور الأعمال والتقييمات، والحجز الإلكتروني السلس دون الحاجة للاتصال.',
      en: 'RASHX equips every beauty salon and wellness clinic with an exquisite web storefront reflecting brand elegance—enabling guests to explore service menus, review verified ratings, and book appointments friction-free.',
    },
    highlights: [
      { ar: 'واجهة إلكترونية احترافية مخصصة لصالونك', en: 'Custom branded digital salon storefront' },
      { ar: 'عرض متكامل للخدمات والأسعار والعروض', en: 'Full showcase of services, prices & bundles' },
      { ar: 'حجز إلكتروني ذاتي متصل بالنظام مباشرة', en: 'Live online booking tied directly to operations' },
      { ar: 'نطاق فرعي معتمد ضمن بنية راش إكس', en: 'Dedicated subdomain powered by RASHX infrastructure' },
    ],
    pillars: [
      {
        id: 'showcase',
        title: {
          ar: 'استعراض المنشأة والخدمات',
          en: 'Facility & Service Showcase',
        },
        description: {
          ar: 'عرض متكامل للمنشأة، وفريق العمل، وقائمة الخدمات المصنفة بدقة مع شرح لكل جلسة وصور توضيحية.',
          en: 'Comprehensive presentation of salon ambiance, specialist team, and categorized treatment menus with descriptions.',
        },
      },
      {
        id: 'transparent-pricing',
        title: {
          ar: 'الأسعار والباقات المحدثة',
          en: 'Real-Time Pricing & Bundles',
        },
        description: {
          ar: 'شفافية كاملة في الأسعار والمدد والعروض الموسمية، يتم تحديثها فورياً بمجرد تعديلها في لوحة التحكم.',
          en: 'Complete transparency for rates, durations, and seasonal specials, synced in real time from the admin dashboard.',
        },
      },
      {
        id: 'direct-booking',
        title: {
          ar: 'حجز رقمي مباشر وسريع',
          en: 'Instant Self-Service Booking',
        },
        description: {
          ar: 'تمكين العميلات من اختيار الفرع والخدمة والأخصائية والوقت المناسب بنقرات معدودة وبدون مكالمات هاتفية.',
          en: 'Empower clients to select branch, service, stylist, and convenient slot in clicks without phone delays.',
        },
      },
      {
        id: 'location-contact',
        title: {
          ar: 'بيانات التواصل والمواقع',
          en: 'Branch Locations & Contact Hub',
        },
        description: {
          ar: 'دمج خرائط الفروع، وأرقام التواصل المباشرة، وحسابات التواصل الاجتماعي لسهولة وصول العميلات لمقرات الصالون.',
          en: 'Interactive branch maps, telephone hotlines, and social media channels ensuring smooth client arrival.',
        },
      },
      {
        id: 'mobile-optimized',
        title: {
          ar: 'تصميم فائق التجاوب مع الجوال',
          en: 'Mobile-First Performance',
        },
        description: {
          ar: 'سرعة تحميل فائقة وتجربة تصفح متوافقة بالكامل مع كافة الشاشات والأجهزة اللوحية دون أي تشوه بصري.',
          en: 'Ultra-fast loading speeds and responsive layouts delivering flawless browsing on all smartphone screens.',
        },
      },
      {
        id: 'subdomain-identity',
        title: {
          ar: 'نطاق فرعي مستقل ومعتمد',
          en: 'Dedicated Subdomain Identity',
        },
        description: {
          ar: 'يعمل موقعك تحت عنوان فرعي خاص بصالونك (yourname.rashx.org) يعزز علامتك التجارية ويحفظ استقلاليتك.',
          en: 'Runs under a distinct branded address (yourname.rashx.org) reinforcing your identity with enterprise stability.',
        },
      },
    ],
    keyBenefitsTitle: {
      ar: 'لماذا يحتاج صالونك إلى موقع إلكتروني مستقل؟',
      en: 'Why Your Salon Needs a Dedicated Digital Storefront',
    },
    keyBenefits: [
      {
        title: {
          ar: 'استقبال الحجوزات بعد ساعات العمل',
          en: 'Capture Bookings After Hours',
        },
        description: {
          ar: 'أكثر من 40% من العميلات يحجزن في المساء أو خارج أوقات الدوام، وموقعك جاهز لاستقبالهن دائماً.',
          en: 'Over 40% of salon clients book appointments after hours; your website works for you 24 hours a day.',
        },
      },
      {
        title: {
          ar: 'انطباع أول يليق بفخامة منشأتك',
          en: 'Prestigious First Impression',
        },
        description: {
          ar: 'واجهة رقمية حديثة تبني الثقة الفورية لدى العميلات الجدد وتظهر احترافية الصالون وتنظيمه.',
          en: 'A modern, polished digital presence builds instant credibility and showcases operational excellence.',
        },
      },
      {
        title: {
          ar: 'تخفيف ضغط الاتصالات على موظف الاستقبال',
          en: 'Eliminate Phone Congestion',
        },
        description: {
          ar: 'الرد الآلي على استفسارات الأسعار والمواعيد يوفر وقت موظفي الاستقبال لخدمة العميلات المتواجدات بالصالون.',
          en: 'Answering pricing and schedule questions digitally frees reception staff to delight on-premise guests.',
        },
      },
    ],
    architectureSyncTitle: {
      ar: 'ترابط الموقع الإلكتروني مع منظومة راش إكس',
      en: 'Storefront Integration with the RASHX Core',
    },
    architectureSyncDescription: {
      ar: 'الموقع ليس صفحة معزولة، بل هو واجهة خارجية حية متصلة لحظة بلحظة مع لوحة التحكم وجدول الصالون.',
      en: 'Your website is not an isolated page, but a dynamic portal wired directly into your salon schedules and admin engine.',
    },
    architectureSyncPoints: [
      {
        ar: 'مزامنة فورية للمواعيد مع جدول الأخصائيات المعتمد لمنع أي حجز مزدوج.',
        en: 'Instant booking synchronization with specialist shift rosters preventing scheduling overlaps.',
      },
      {
        ar: 'انعكاس تلقائي لأي تعديل في الخدمات أو الأسعار من لوحة التحكم إلى الموقع فورياً.',
        en: 'Instant propagation of catalog edits or price updates from the admin dashboard directly to the storefront.',
      },
      {
        ar: 'تسجيل العميلات الجدد آلياً في قاعدة بيانات الـ CRM مع حفظ سجل أول زيارة.',
        en: 'Automatic client record creation in the CRM upon completing their first online booking.',
      },
    ],
    seo: {
      title: {
        ar: 'الموقع الإلكتروني المخصص للصالونات ومراكز التجميل | RASHX',
        en: 'Branded Digital Salon & Spa Storefronts | RASHX',
      },
      description: {
        ar: 'احصل على موقع إلكتروني احترافي متكامل لصالونك تحت نطاق فرعي معتمد من راش إكس: عرض الخدمات والأسعار، والحجز الرقمي المباشر على مدار الساعة.',
        en: 'Launch a professional branded digital salon website under your dedicated subdomain with RASHX: live treatment showcase, pricing, and 24/7 online booking.',
      },
    },
  },

  customerExperience: {
    slug: 'customer-experience',
    path: '/customer-experience',
    badge: {
      ar: 'تطبيق وواجهة العميل',
      en: 'CUSTOMER APPLICATION',
    },
    title: {
      ar: 'تجربة رقمية مخصصة تضع صالونك وخدماتك في جيب كل عميلة',
      en: 'A Tailored Digital Experience in Every Guest’s Pocket',
    },
    subtitle: {
      ar: 'تطبيق وواجهة تفاعلية تمكّن العميلات من استعراض الخدمات، إدارة المواعيد، ومتابعة رصيد نقاط الولاء والعروض بسهولة فائقة.',
      en: 'An intuitive client application enabling guests to browse services, manage appointments, and track loyalty balances effortlessly.',
    },
    description: {
      ar: 'تقدم راش إكس لعميلات صالونك واجهة رقمية أنيقة ومريحة، تمنحهن استقلالية تامة في حجز المواعيد وتعديلها، واستعراض سجل الزيارات السابقة، والاطلاع على نقاط المكافآت المكتسبة، مما يجعل تجربة التعامل مع صالونك سلسة وعصرية.',
      en: 'RASHX provides your salon clients with an elegant digital portal giving complete autonomy to book or reschedule appointments, review past visits, and check accrued loyalty points—delivering a refined modern journey.',
    },
    highlights: [
      { ar: 'تجربة حجز وإدارة مواعيد ذاتية وسلسة', en: 'Frictionless self-service booking & reschedule' },
      { ar: 'محفظة رقمية لرصيد نقاط الولاء والمكافآت', en: 'Digital wallet tracking loyalty points & credits' },
      { ar: 'سجل شامل للزيارات والخدمات المنفذة', en: 'Complete past treatment and transaction logs' },
      { ar: 'إشعارات لحظية وتأكيدات مباشرة للمواعيد', en: 'Instant appointment confirmations & reminders' },
    ],
    pillars: [
      {
        id: 'browsing',
        title: {
          ar: 'استعراض الخدمات والباقات',
          en: 'Treatment Catalog & Menus',
        },
        description: {
          ar: 'تصفح مرئي سلس لكافة أقسام الخدمات والباقات المتاحة مع معرفة تفاصيل كل جلسة وأسعارها بدقة.',
          en: 'Visual browsing of treatment categories and packages with clear descriptions, durations, and transparent pricing.',
        },
      },
      {
        id: 'appointment-management',
        title: {
          ar: 'إدارة الحجوزات والمواعيد',
          en: 'Appointment Management',
        },
        description: {
          ar: 'إمكانية استعراض المواعيد القادمة، وتأكيد الحضور، أو طلب إعادة الجدولة بما يتوافق مع سياسات الصالون.',
          en: 'Review upcoming bookings, confirm check-in, or reschedule effortlessly within salon policy parameters.',
        },
      },
      {
        id: 'specialist-choice',
        title: {
          ar: 'اختيار الأخصائية المفضلة',
          en: 'Favorite Specialist Selection',
        },
        description: {
          ar: 'إتاحة الفرصة للعميلة لاختيار الأخصائية التي تفضل التعامل معها ورؤية أوقات توافرها الفعلية.',
          en: 'Allow clients to book their preferred specialist and view real-time availability on their dedicated roster.',
        },
      },
      {
        id: 'loyalty-wallet',
        title: {
          ar: 'محفظة الولاء والمكافآت',
          en: 'Loyalty Rewards Wallet',
        },
        description: {
          ar: 'رؤية واضحة للنقاط المكتسبة، وقيمتها المالية، والعروض الحصرية المتاحة للاستبدال فورياً.',
          en: 'Transparent dashboard displaying accumulated loyalty points, monetary conversion value, and redeemable perks.',
        },
      },
      {
        id: 'treatment-history',
        title: {
          ar: 'سجل الزيارات والفواتير',
          en: 'Treatment Logs & Receipts',
        },
        description: {
          ar: 'سجل مفصل يوثق كافة الجلسات السابقة، والفواتير الضريبية المسددة، وتفاصيل الخدمات المنفذة.',
          en: 'Itemized archives of past salon visits, electronic receipts, and historical treatment notes.',
        },
      },
      {
        id: 'personalized-offers',
        title: {
          ar: 'عروض حصرية ومخصصة',
          en: 'Personalized Offers & Promos',
        },
        description: {
          ar: 'استقبال خصومات ومكافآت مصممة خصيصاً للعميلة في أعياد ميلادها ومناسباتها الخاصة.',
          en: 'Receive personalized bonuses, birthday packages, and tailor-made promotions crafted for each client.',
        },
      },
    ],
    keyBenefitsTitle: {
      ar: 'كيف يرتقي تطبيق العميل برضا عميلات صالونك؟',
      en: 'How the Customer App Transforms Guest Retention',
    },
    keyBenefits: [
      {
        title: {
          ar: 'سهولة وراحة تفضلها العميلات',
          en: 'Effortless Convenience Guests Love',
        },
        description: {
          ar: 'العميلات العصريات يفضلن إدارة شؤونهن رقمياً في أي وقت دون الحاجة للانتظار في مكالمة هاتفية.',
          en: 'Modern clients expect instant self-service without holding on busy phone lines or texting back and forth.',
        },
      },
      {
        title: {
          ar: 'ارتباط مستمر بعلامتك التجارية',
          en: 'Continuous Brand Affinity',
        },
        description: {
          ar: 'وجود واجهة صالونك على هاتف العميلة يبقي منشأتك في مقدمة خياراتها عند التفكير في أي خدمة تجميل.',
          en: 'Having your branded interface on your client’s screen keeps your salon top-of-mind for every beauty need.',
        },
      },
      {
        title: {
          ar: 'زيادة الإقبال على برامج الولاء',
          en: 'Active Loyalty Engagement',
        },
        description: {
          ar: 'رؤية النقاط تتراكم في المحفظة يحفز العميلات على إتمام المزيد من الخدمات لجمع المكافآت.',
          en: 'Watching reward points accumulate visually motivates guests to book add-ons and repeat treatments.',
        },
      },
    ],
    architectureSyncTitle: {
      ar: 'ترابط تطبيق العميل مع منظومة راش إكس',
      en: 'Client Experience Integration with the RASHX Core',
    },
    architectureSyncDescription: {
      ar: 'كل إجراء تتخذه العميلة في التطبيق ينعكس فورياً في جداول الصالون ونقاط البيع ولوحة الإدارة.',
      en: 'Every action taken by a guest in the app immediately updates salon registers, floor schedules, and dashboards.',
    },
    architectureSyncPoints: [
      {
        ar: 'تحديث فوري لجدول مواعيد الفرع عند تأكيد أو تعديل أي حجز من قبل العميلة.',
        en: 'Instant calendar refresh across reception screens the moment a guest confirms or modifies an appointment.',
      },
      {
        ar: 'مزامنة رصيد نقاط الولاء مباشرة مع نقطة البيع (POS) لاستبدالها عند سداد الفاتورة.',
        en: 'Direct loyalty wallet sync with POS cashier terminals for effortless redemption at checkout.',
      },
      {
        ar: 'ربط الحساب بسجل الـ CRM لحفظ تفضيلات العميلة وخدماتها المفضلة تلقائياً.',
        en: 'Automatic synchronization with the CRM dossier storing personalized preferences seamlessly.',
      },
    ],
    seo: {
      title: {
        ar: 'تطبيق وواجهة العميل للصالونات ومراكز التجميل | RASHX',
        en: 'Salon Customer App & Digital Guest Experience | RASHX',
      },
      description: {
        ar: 'واجهة وتطبيق العميل المخصص من راش إكس: حجز ذاتي سلس، متابعة المواعيد، محفظة نقاط الولاء والمكافآت، واستعراض سجل الخدمات السابقة.',
        en: 'Specialized salon customer app by RASHX: self-service bookings, appointment management, loyalty rewards wallet, and treatment history tracking.',
      },
    },
  },

  providerExperience: {
    slug: 'provider-experience',
    path: '/provider-experience',
    badge: {
      ar: 'واجهة مقدم الخدمة',
      en: 'PROVIDER APPLICATION',
    },
    title: {
      ar: 'مساحة عمل رقمية متطورة تمكّن الأخصائيات من متابعة جداولهن والارتقاء بالأداء',
      en: 'A Dedicated Specialist Workspace for Seamless Daily Scheduling',
    },
    subtitle: {
      ar: 'تطبيق عملي لمقدمي الخدمات والموظفين لمتابعة جدول العمل اليومي، الحجوزات، تفاصيل الخدمات، واحتساب العمولات بدقة وشفافية.',
      en: 'A focused mobile workspace helping stylists and therapists manage daily bookings, client notes, and real-time earned commissions.',
    },
    description: {
      ar: 'تمنح راش إكس الأخصائيات ومقدمي الخدمات واجهة عمل مخصصة على هواتفهن أو أجهزتهن اللوحية، تساعدهن على معرفة مواعيد اليوم التالية، وتفاصيل رغبات كل عميلة، وتسجيل إتمام الجلسات، مع متابعة رصيد العمولات اليومية والشهرية بشفافية كاملة.',
      en: 'RASHX provides stylists, estheticians, and therapists with a clean dedicated workspace to view upcoming appointments, inspect technical client formulas, mark treatments completed, and audit personal commissions in real time.',
    },
    highlights: [
      { ar: 'متابعة لحظية لجدول الحجوزات والورديات', en: 'Live daily shift schedule & appointment queues' },
      { ar: 'استعراض تفاصيل العميلات وتفضيلاتهن الفنية', en: 'Client treatment formulas and technical notes' },
      { ar: 'شفافية كاملة في متابعة العمولات والمستحقات', en: 'Transparent earned commission ledger' },
      { ar: 'تسجيل بدء وإتمام الجلسات بنقرة زر واحدة', en: 'One-click treatment start and completion tracking' },
    ],
    pillars: [
      {
        id: 'daily-roster',
        title: {
          ar: 'جدول المواعيد اليومي',
          en: 'Daily Appointment Queue',
        },
        description: {
          ar: 'عرض زمني منظم لكافة جلسات اليوم الموكلة للأخصائية مع التوقيت، ومدة الخدمة، واسم العميلة.',
          en: 'Chronological timeline of assigned appointments with precise treatment durations, timing, and client details.',
        },
      },
      {
        id: 'client-specs',
        title: {
          ar: 'ملاحظات وتفضيلات العميلة',
          en: 'Client Formulas & Preferences',
        },
        description: {
          ar: 'الاطلاع على تفاصيل الجلسات السابقة ودرجات صبغات الشعر أو منتجات العناية المفضلة لضمان الإتقان.',
          en: 'Access technical notes from previous visits (hair dye formulas, allergies, preferences) for perfect execution.',
        },
      },
      {
        id: 'treatment-lifecycle',
        title: {
          ar: 'تسجيل مراحل الخدمة',
          en: 'Treatment Status Logging',
        },
        description: {
          ar: 'تحديث حالة الجلسة (بدء التنفيذ / اكتملت الخدمة) ليعرف موظف الاستقبال جاهزية الكرسي والعميلة التالية.',
          en: 'Update appointment lifecycle (in-service / completed) notifying reception that the station is ready for the next guest.',
        },
      },
      {
        id: 'commission-auditing',
        title: {
          ar: 'متابعة العمولات المكتسبة',
          en: 'Real-Time Commission Auditing',
        },
        description: {
          ar: 'شاشة خاصة تعرض إجمالي عمولات الخدمات والمنتجات المحققة اليوم وخلال الشهر بحسابات دقيقة وواضحة.',
          en: 'Dedicated financial ledger showing daily and monthly commissions earned on treatments and retail take-homes.',
        },
      },
      {
        id: 'shift-breaks',
        title: {
          ar: 'إدارة الورديات وفترات الاستراحة',
          en: 'Shift Hours & Break Management',
        },
        description: {
          ar: 'معرفة مواعيد بداية ونهاية الوردية وأوقات الاستراحة المجدولة لتنظيم يوم العمل بأعلى درجات الهدوء.',
          en: 'Visibility into daily shift start/finish times and assigned break intervals for structured, peaceful workdays.',
        },
      },
      {
        id: 'notifications',
        title: {
          ar: 'تنبيهات فورية بأي تعديل',
          en: 'Instant Schedule Alteration Alerts',
        },
        description: {
          ar: 'إشعار فوري عند حجز عميلة لموعد جديد، أو وصولها لصالة الانتظار، أو تعديل توقيت جلسة قادمة.',
          en: 'Instant notifications when a new booking is allocated, a client arrives at the salon, or a slot is rescheduled.',
        },
      },
    ],
    keyBenefitsTitle: {
      ar: 'كيف تسهم واجهة مقدم الخدمة في استقرار الصالون؟',
      en: 'How the Provider App Empowers Your Salon Floor',
    },
    keyBenefits: [
      {
        title: {
          ar: 'القضاء على الخلافات حول العمولات',
          en: 'Zero Commission Disputes',
        },
        description: {
          ar: 'الشفافية المطلقة في احتساب العمولات ترفع الروح المعنوية للأخصائيات وتمنحهن حافزاً إضافياً للإنتاج.',
          en: 'Unambiguous, automated commission accounting builds deep trust and boosts specialist morale and retail drive.',
        },
      },
      {
        title: {
          ar: 'تنظيم هادئ للصالة بدون نداءات',
          en: 'Quiet, Luxurious Salon Environment',
        },
        description: {
          ar: 'معرفة الأخصائية بمواعيدها ووصول عميلاتها عبر هاتفها يجعل العمل منضبطاً وخالياً من الفوضى والنداء الصوتي.',
          en: 'Knowing upcoming visits digitally eliminates verbal shouting across the floor, preserving an upscale spa ambiance.',
        },
      },
      {
        title: {
          ar: 'تنفيذ احترافي ومخصص للخدمات',
          en: 'Personalized Treatment Precision',
        },
        description: {
          ar: 'مراجعة الملاحظات الفنية قبل دخول العميلة يضمن تنفيذ الخدمة وفق أدق المعايير التي طلبتها في الزيارة السابقة.',
          en: 'Reviewing guest specs prior to seating ensures service execution precisely according to previous expectations.',
        },
      },
    ],
    architectureSyncTitle: {
      ar: 'ترابط واجهة الأخصائية مع منظومة راش إكس',
      en: 'Provider App Integration with the RASHX Core',
    },
    architectureSyncDescription: {
      ar: 'تعتبر واجهة مقدم الخدمة نافذة الموظفة على العمليات المركزية لنقاط البيع والحضور والانصراف.',
      en: 'The specialist interface serves as the frontline bridge syncing salon floor actions with POS and management.',
    },
    architectureSyncPoints: [
      {
        ar: 'ربط إتمام الخدمة بنقاط البيع (POS) لتجهيز فاتورة السداد فور خروج العميلة من مقعد الخدمة.',
        en: 'Triggering checkout invoice preparation at the POS register the moment a specialist marks service done.',
      },
      {
        ar: 'مزامنة أوقات الاستراحة والغياب مع خوارزميات الحجز الإلكتروني لمنع استقبال مواعيد في أوقات الراحة.',
        en: 'Locking out booking slots automatically during scheduled specialist breaks or logged absences.',
      },
      {
        ar: 'تسجيل مساهمة الموظفة في مبيعات التجزئة لحساب عمولة بيع المنتجات آلياً.',
        en: 'Attribute product recommendations directly to the stylist for automated retail commission tracking.',
      },
    ],
    seo: {
      title: {
        ar: 'واجهة وتطبيق مقدم الخدمة للأخصائيات والموظفين | RASHX',
        en: 'Salon Specialist & Service Provider Workspace | RASHX',
      },
      description: {
        ar: 'واجهة مقدم الخدمة المتخصصة للأخصائيات في الصالونات من راش إكس: متابعة جدول العمل، تفاصيل العميلات، إدارة الجلسات، واحتساب العمولات بدقة.',
        en: 'Dedicated mobile workspace for beauty therapists and stylists by RASHX: shift schedules, guest formulas, appointment management, and real-time commission tracking.',
      },
    },
  },

  whiteLabel: {
    slug: 'white-label',
    path: '/white-label',
    badge: {
      ar: 'الهوية التجارية والتخصيص المستقل',
      en: 'WHITE LABEL & CUSTOMIZATION',
    },
    title: {
      ar: 'علامتك التجارية في الواجهة وبنيتنا السحابية المتقدمة في الخلفية',
      en: 'Your Brand at the Forefront, Our Enterprise Cloud Behind You',
    },
    subtitle: {
      ar: 'منظومة رقمية متكاملة تحمل هويتك البصرية، شعارك، وألوانك وتعمل تحت نطاق فرعي معتمد خاص بصالونك.',
      en: 'A fully branded digital operating system tailored with your visual identity, logo, colors, and dedicated subdomain.',
    },
    description: {
      ar: 'تمنحك راش إكس ميزة الاستقلالية الكاملة، حيث نوفر لكل منشأة بيئة تشغيل متكاملة تحمل اسمها وعلامتها التجارية دون أن يظهر اسم مزود الخدمة بشكل مشتت، لتحافظ على هيبتك ومكانتك السوقية مع الاستفادة من بنيتنا البرمجية الآمنة.',
      en: 'RASHX delivers full white-label independence—providing each beauty enterprise with a dedicated operational ecosystem carrying its distinctive brand identity, custom subdomain, and personalized interfaces backed by rock-solid cloud infrastructure.',
    },
    highlights: [
      { ar: 'اسم المنشأة وشعارها في كافة الواجهات', en: 'Salon name and logo across all interfaces' },
      { ar: 'تخصيص الألوان والهوية البصرية بدقة', en: 'Custom brand color palettes and typography' },
      { ar: 'نطاق فرعي مستقل ومعتمد لكل منشأة', en: 'Independent branded subdomain for every salon' },
      { ar: 'تخصيص القوائم وإعدادات التشغيل والإدارة', en: 'Tailored catalogs, operational rules & permissions' },
    ],
    pillars: [
      {
        id: 'brand-identity',
        title: {
          ar: 'اسم المنشأة وشعارها',
          en: 'Brand Name & Official Logo',
        },
        description: {
          ar: 'ظهور شعار صالونك واسمك التجاري الرسمي على الموقع، وتطبيق العميل، والفواتير الضريبية، والرسائل.',
          en: 'Prominent display of your salon logo and trading name on websites, client apps, tax invoices, and SMS.',
        },
      },
      {
        id: 'visual-palette',
        title: {
          ar: 'الألوان والهوية البصرية',
          en: 'Bespoke Color Palette & Styling',
        },
        description: {
          ar: 'تطبيق ألوان هوية صالونك البصرية على كافة الواجهات الرقمية لتقديم تجربة جمالية تعكس طابع منشأتك الفاخر.',
          en: 'Apply your custom color schemes across all digital portals to deliver a cohesive visual experience.',
        },
      },
      {
        id: 'subdomain-routing',
        title: {
          ar: 'نطاق فرعي مستقل (Subdomain)',
          en: 'Dedicated Subdomain (Subdomain)',
        },
        description: {
          ar: 'تشغيل منظومتك تحت نطاق معتمد (salon.rashx.org) يوفر لعميلاتك رابطاً سهلاً وسريعاً يعزز علامتك.',
          en: 'Operate under an authorized dedicated subdomain (salon.rashx.org) giving clients a direct, memorable link.',
        },
      },
      {
        id: 'interface-tailoring',
        title: {
          ar: 'تخصيص واجهات الموقع والعميل',
          en: 'Customized Storefront & Client UI',
        },
        description: {
          ar: 'ضبط المحتوى الترحيبي، وبانرات العروض، وأقسام الموقع بما يتطابق مع توجهات وتطلعات علامتك التجارية.',
          en: 'Customize welcome banners, promotional galleries, and storefront sections to align with marketing goals.',
        },
      },
      {
        id: 'catalog-pricing',
        title: {
          ar: 'تخصيص الخدمات والأسعار',
          en: 'Bespoke Menus & Pricing Rules',
        },
        description: {
          ar: 'حرية كاملة في تحديد مسميات الخدمات، والأسعار، وسياسات الدفع، وإعدادات الضريبة بما يناسب نموذج عملك.',
          en: 'Total freedom to define treatment naming, pricing structures, payment policies, and tax settings.',
        },
      },
      {
        id: 'operational-settings',
        title: {
          ar: 'إعدادات التشغيل والإدارة',
          en: 'Operational & Governance Settings',
        },
        description: {
          ar: 'تكييف سياسات الإلغاء، وأوقات العمل، وبرامج الولاء، وصلاحيات الموظفين وفق معايير إدارة منشأتك الخاصة.',
          en: 'Configure cancellation rules, working schedules, loyalty policies, and staff roles to your governance standards.',
        },
      },
    ],
    keyBenefitsTitle: {
      ar: 'لماذا يُعد التخصيص والهوية المستقلة خيارك الأذكى؟',
      en: 'Why White-Label Customization is Your Smartest Choice',
    },
    keyBenefits: [
      {
        title: {
          ar: 'تعزيز القيمة السوقية لعلامتك التجارية',
          en: 'Elevated Brand Equity',
        },
        description: {
          ar: 'العميلات يرتبطن باسم صالونك مباشرة، مما يبني علامة تجارية قوية تدوم وتتوسع في السوق دون الاعتماد على اسم وسيط.',
          en: 'Guests bond directly with your brand name, cementing enterprise reputation without reliance on third-party aggregators.',
        },
      },
      {
        title: {
          ar: 'منظومة احترافية بتكلفة استثمارية ذكية',
          en: 'Enterprise Tech Without Capital Risk',
        },
        description: {
          ar: 'الحصول على قدرات تقنية متقدمة تضاهي كبرى السلاسل العالمية دون الحاجة لإنفاق مئات الآلاف على بناء برمجيات خاصة.',
          en: 'Deploy technology matching global beauty chains without spending hundreds of thousands on custom development.',
        },
      },
      {
        title: {
          ar: 'تجربة حصرية وموثوقة لعميلاتك',
          en: 'Exclusive, Trustworthy Guest Experience',
        },
        description: {
          ar: 'التعامل مع موقع وتطبيق يحمل اسم صالونك يمنح العميلات راحة نفسية وشعوراً بالخصوصية والأمان المالي.',
          en: 'Engaging with portals carrying your salon name builds customer peace of mind, privacy, and payment trust.',
        },
      },
    ],
    architectureSyncTitle: {
      ar: 'ترابط التخصيص مع البنية السحابية لمنصة راش إكس',
      en: 'White-Label Integration with RASHX Infrastructure',
    },
    architectureSyncDescription: {
      ar: 'تحظى منشأتك بواجهة مخصصة بالكامل مع الاستفادة من صلابة واستقرار التحديثات التقنية للمنصة المركزية.',
      en: 'Your salon enjoys customized individuality paired with the security, speed, and continuous updates of our core cloud.',
    },
    architectureSyncPoints: [
      {
        ar: 'عزل منطقي كامل لبيانات منشأتك وحساباتها وفق أعلى معايير الخصوصية وأمن المعلومات (Multi-Tenant Isolation).',
        en: 'Logical tenant isolation protecting your customer records, financial ledgers, and operational data.',
      },
      {
        ar: 'استفادة تلقائية من التحديثات المستمرة للأنظمة والامتثال للفوترة الإلكترونية دون تعطيل مظهر موقعك.',
        en: 'Automatic rollouts of regulatory compliance and performance enhancements without altering your visual identity.',
      },
      {
        ar: 'بنية سحابية قابلة للتوسع تدعم إضافة فروع جديدة لمنشأتك تحت نفس الهوية بسلاسة تامة.',
        en: 'Scalable multi-branch cloud architecture expanding seamlessly as your salon footprint grows across regions.',
      },
    ],
    seo: {
      title: {
        ar: 'الهوية التجارية والتخصيص المستقل للصالونات (White Label) | RASHX',
        en: 'Salon White Label & Custom Brand Identity | RASHX',
      },
      description: {
        ar: 'حلول التخصيص والهوية المستقلة للصالونات من راش إكس: موقع وتطبيقات بهوية صالونك، نطاق فرعي مخصص، تخصيص الخدمات والأسعار، واستقلالية كاملة لعلامتك التجارية.',
        en: 'Salon white-label operating system by RASHX: custom branded websites, dedicated subdomains, personalized color styling, and total brand independence.',
      },
    },
  },
};

