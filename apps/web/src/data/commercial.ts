export interface LocalizedText {
  ar: string;
  en: string;
}

export interface DemoTopicOption {
  value: string;
  label: LocalizedText;
}

export const demoData = {
  hero: {
    eyebrow: {
      ar: 'احجز عرضاً حياً مخصصاً',
      en: 'SCHEDULE A PERSONALIZED LIVE DEMO',
    },
    title: {
      ar: 'شاهد منظومة RASHX المتكاملة قيد التشغيل الفعلي',
      en: 'See the RASHX Unified Operating System in Live Action',
    },
    subtitle: {
      ar: 'جلسة حية تفاعلية مدتها 25 دقيقة مع أحد خبراء المنظومة، نستعرض خلالها تجربة العميل، ولوحة تحكم الإدارة، وتطبيق الكوافيرات ومقدمي الخدمات، ونقاط البيع المتكاملة.',
      en: 'A 25-minute interactive walkthrough with a product specialist showcasing customer booking, admin management, staff interfaces, and ZATCA-compliant POS.',
    },
  },
  highlights: [
    {
      title: {
        ar: 'واجهات حية متعددة الأدوار',
        en: 'Multi-Role Live Walkthrough',
      },
      description: {
        ar: 'استعراض فوري لكيفية ترابط تجربة العميل على الويب مع شاشة الاستقبال وتطبيق مقدم الخدمة.',
        en: 'Real-time demonstration showing seamless sync between customer portal, front desk, and staff app.',
      },
    },
    {
      title: {
        ar: 'الفوترة ونقاط البيع ZATCA',
        en: 'ZATCA E-Invoicing & POS',
      },
      description: {
        ar: 'تجربة إصدار فاتورة ضريبية مبسطة برمز QR مشفر واختبار سرعة إتمام عمليات الدفع المتعددة.',
        en: 'Instant generation of simplified tax invoices with cryptographic QR codes and fast checkout.',
      },
    },
    {
      title: {
        ar: 'إدارة الموظفين والعمولات الذكية',
        en: 'Staff Rosters & Automated Commissions',
      },
      description: {
        ar: 'رؤية عملية لحساب عمولات الخدمات والمنتجات وتوزيع الورديات والحوافز آلياً بدقة متناهية.',
        en: 'Practical demonstration of automatic commission calculation, scheduling, and tip allocations.',
      },
    },
    {
      title: {
        ar: 'الهوية المخصصة والنطاق الفرعي',
        en: 'Custom Subdomain & Brand Identity',
      },
      description: {
        ar: 'معاينة كيف يظهر موقع صالونك وعلامتك التجارية للجمهور تحت رابطك المعتمد المستقل.',
        en: 'Preview your salon’s bespoke digital store and client booking engine under your private subdomain.',
      },
    },
  ],
  businessTypes: [
    { value: 'women-salon', label: { ar: 'صالون نسائي / مركز تجميل', en: "Women's Salon / Beauty Center" } },
    { value: 'men-barbershop', label: { ar: 'صالون رجالي / حلاقة والعناية', en: "Men's Barbershop / Grooming" } },
    { value: 'spa-wellness', label: { ar: 'سبا ونادي استجمام صحي', en: 'Spa & Wellness Sanctuary' } },
    { value: 'aesthetic-care', label: { ar: 'عيادة تجميل وعناية شخصية', en: 'Aesthetic & Personal Care Clinic' } },
    { value: 'chain-multibranch', label: { ar: 'سلسلة صالونات متعددة الفروع', en: 'Multi-Branch Salon Chain' } },
  ],
  branchOptions: [
    { value: '1', label: { ar: 'فرع واحد', en: '1 Branch' } },
    { value: '2-3', label: { ar: 'من 2 إلى 3 فروع', en: '2 - 3 Branches' } },
    { value: '4-10', label: { ar: 'من 4 إلى 10 فروع', en: '4 - 10 Branches' } },
    { value: '10+', label: { ar: 'أكثر من 10 فروع (Enterprise)', en: '10+ Branches (Enterprise)' } },
  ],
  preferredTimes: [
    { value: 'morning', label: { ar: 'الفترة الصباحية (10 ص - 1 م)', en: 'Morning (10 AM - 1 PM)' } },
    { value: 'afternoon', label: { ar: 'الفترة المسائية (2 م - 6 م)', en: 'Afternoon (2 PM - 6 PM)' } },
    { value: 'evening', label: { ar: 'الفترة الليلية (7 م - 10 م)', en: 'Evening (7 PM - 10 PM)' } },
  ],
};

export const getStartedData = {
  hero: {
    eyebrow: {
      ar: 'ابدأ التحول الرقمي لمنشأتك',
      en: 'EMBARK ON DIGITAL TRANSFORMATION',
    },
    title: {
      ar: 'انقل إدارة صالونك إلى المستقبل في خطوات منظمة',
      en: 'Elevate Your Salon Management to the Future in Structured Steps',
    },
    subtitle: {
      ar: 'منظومة سحابية متكاملة تمنحك موقعاً إلكترونياً، ونظام حجوزات ذكي، وتطبيقاً لفريق العمل، ونقاط بيع معتمدة ضريبياً، تحت هويتك التجارية المستقلة.',
      en: 'A unified cloud ecosystem providing your facility with a dedicated website, smart booking, staff application, and ZATCA-certified POS under your independent brand.',
    },
  },
  onboardingSteps: [
    {
      step: '01',
      title: {
        ar: 'حجز النطاق الفرعي وهوية المنشأة',
        en: 'Subdomain Reservation & Branding',
      },
      description: {
        ar: 'تخصيص الرابط السحابي الخاص بصالونك ([salon-name].rashx.org) ورفع الشعار وألوان الهوية وصور المعرض.',
        en: 'Reserve your salon cloud workspace ([salon-name].rashx.org), brand logo, color palette, and portfolio.',
      },
    },
    {
      step: '02',
      title: {
        ar: 'تهيئة قائمة الخدمات والأسعار والكادر',
        en: 'Services, Pricing & Team Configuration',
      },
      description: {
        ar: 'إدخال تصنيفات الخدمات، مدد التنفيذ، باقات العناية، وتعيين الموظفات وتوزيع الصلاحيات ونسب العمولات.',
        en: 'Set up service categories, durations, combo packages, specialist assignments, permissions, and commissions.',
      },
    },
    {
      step: '03',
      title: {
        ar: 'تفعيل نقاط البيع والفوترة الإلكترونية',
        en: 'Activate POS & ZATCA E-Invoicing',
      },
      description: {
        ar: 'ربط أجهزة الدفع وطابعات الفواتير، وإعداد الرقم الضريبي لإنشاء فواتير إلكترونية متوافقة تلقائياً.',
        en: 'Connect payment terminals, receipt printers, and configure VAT registration for automatic compliant billing.',
      },
    },
    {
      step: '04',
      title: {
        ar: 'إطلاق الحجز الرقمي واستقبال العملاء',
        en: 'Launch Digital Booking & Welcome Clients',
      },
      description: {
        ar: 'نشر رابط موقع صالونك على شبكات التواصل الاجتماعي، والبدء في تلقي الحجوزات وإدارة العمليات بدقة متناهية.',
        en: 'Share your booking link across social channels, start accepting appointments, and orchestrate salon operations.',
      },
    },
  ],
  guarantees: [
    {
      title: {
        ar: 'ترحيل سلس للبيانات السابقة',
        en: 'Seamless Data Migration',
      },
      description: {
        ar: 'نساعدك على نقل بيانات عميلاتك وقوائم خدماتك السابقة من جداول Excel أو الأنظمة القديمة بكل موثوقية.',
        en: 'Dedicated assistance migrating customer histories and services from Excel or legacy systems.',
      },
    },
    {
      title: {
        ar: 'تدريب مباشر ومستمر للمديرين وفريق العمل',
        en: 'Direct & Ongoing Team Training',
      },
      description: {
        ar: 'جلسات تعريفية مكثفة وتدريب تطبيقي على لوحة الإدارة وتطبيق مقدم الخدمة لضمان استيعاب كامل المنظومة.',
        en: 'Comprehensive onboarding and hands-on workshops for receptionists, managers, and service providers.',
      },
    },
    {
      title: {
        ar: 'بنية سحابية معزولة وأمان بيانات كامل',
        en: 'Isolated Cloud Architecture & Privacy',
      },
      description: {
        ar: 'بيانات صالونك وعميلاتك وفواتيرك مشفرة ومحمية بمعايير عالية ضمن قاعدة بيانات مستقلة وخوادم سحابية مؤمنة.',
        en: 'Tenant isolation guarantees complete confidentiality of financial records, staff rosters, and customer lists.',
      },
    },
  ],
};

