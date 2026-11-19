export interface LocalizedText {
  ar: string;
  en: string;
}

export interface TrustPillar {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface TrustProductData {
  slug: string;
  path: string;
  badge: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedText[];
  pillars: TrustPillar[];
  impactTitle: LocalizedText;
  impacts: {
    title: LocalizedText;
    description: LocalizedText;
  }[];
  regulatoryTitle: LocalizedText;
  regulatoryDescription: LocalizedText;
  regulatoryPoints: LocalizedText[];
  seo: {
    title: LocalizedText;
    description: LocalizedText;
  };
}

export type TrustKey = 'eInvoicing' | 'security';

export const trustData: Record<TrustKey, TrustProductData> = {
  eInvoicing: {
    slug: 'e-invoicing',
    path: '/compliance/e-invoicing',
    badge: {
      ar: 'الامتثال والفوترة الإلكترونية',
      en: 'E-INVOICING & ZATCA COMPLIANCE',
    },
    title: {
      ar: 'فوترة إلكترونية معتمدة ومتوافقة بالكامل مع متطلبات المرحلة الثانية (الربط والتكامل)',
      en: 'Certified E-Invoicing Fully Compliant with ZATCA Phase 2 Integration',
    },
    subtitle: {
      ar: 'تدعم RashX متطلبات الفوترة الإلكترونية في المملكة العربية السعودية، مع اعتماد المرحلة الثانية وفق حالة المنشأة ومتطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).',
      en: 'RASHX supports all Saudi e-invoicing mandates, enabling Phase 2 (Integration & Clearance) compliance tailored to your facility status under ZATCA regulations.',
    },
    description: {
      ar: 'صُممت منظومة الفوترة في راش إكس لتسهيل إدارة العمليات المالية والضريبية لصاحب الصالون، مع توليد فواتير ضريبية مبسطة تتضمن رمز الاستجابة السريعة المشفر (QR Code)، والتوقيع الرقمي، وختم التشفير الأمني، لمنحك امتثالاً قانونياً كاملاً بدون أي تعقيد تشغيلي.',
      en: 'Engineered to streamline financial operations, RASHX generates compliant simplified tax invoices with cryptographic QR codes, digital signatures, and tamper-proof hashes—delivering total regulatory compliance with zero operational friction.',
    },
    highlights: [
      { ar: 'متوافق مع المرحلة الثانية لهيئة الزكاة والضريبة والجمارك (ZATCA)', en: 'Aligned with ZATCA Phase 2 Integration Phase' },
      { ar: 'توليد فوري لرمز الاستجابة السريعة المشفر (QR Code)', en: 'Instant cryptographic QR code generation' },
      { ar: 'حساب ضريبة القيمة المضافة (15% VAT) تلقائياً', en: 'Automated 15% VAT tax calculations' },
      { ar: 'أرشفة ضريبية غير قابلة للتعديل أو الحذف', en: 'Immutable, tamper-proof audit trails' },
    ],
    pillars: [
      {
        id: 'simplified-tax-invoice',
        title: {
          ar: 'الفاتورة الضريبية المبسطة (B2C)',
          en: 'Simplified Tax Invoices (B2C)',
        },
        description: {
          ar: 'إصدار فواتير بيع للعميلات مطابقة لكافة الشروط النظامية تشمل الرقم التسلسلي، وبيانات المنشأة، وتفاصيل الضريبة.',
          en: 'Issue customer invoices meeting all regulatory requirements: sequential numbering, VAT IDs, and itemized tax breakdowns.',
        },
      },
      {
        id: 'qr-code-generation',
        title: {
          ar: 'رمز الاستجابة السريعة المشفر (QR Code)',
          en: 'Cryptographic QR Code Standard',
        },
        description: {
          ar: 'تضمين رمز QR ذكي يحتوي على اسم المنشأة، والرقم الضريبي، وتوقيت الفاتورة، وقيمة الضريبة المشفرة وفق متطلبات الهيئة.',
          en: 'Embed compliant QR codes encoding vendor name, tax registration number, timestamp, and cryptographic digital stamp.',
        },
      },
      {
        id: 'zatca-phase-two',
        title: {
          ar: 'اعتماد المرحلة الثانية (الربط والتكامل)',
          en: 'ZATCA Phase 2 Integration',
        },
        description: {
          ar: 'بنية تقنية مهيأة للربط المباشر عبر واجهات البرمجة (APIs) مع منصة «فاتورة» التابعة للهيئة لمشاركة البيانات الضريبية.',
          en: 'API-ready architecture communicating seamlessly with ZATCA’s Fatoora platform for direct data transmission.',
        },
      },
      {
        id: 'tamper-proof',
        title: {
          ar: 'سجل تدقيق محمي يمنع التلاعب',
          en: 'Tamper-Proof Audit Trail',
        },
        description: {
          ar: 'حماية الفواتير الصادرة بتسلسل رقمي مشفر وترابط يمنع تعديل أو حذف أي فاتورة بعد إصدارها لضمان النزاهة.',
          en: 'Sequential hash-chaining preventing invoice modification or retroactive deletion, ensuring total audit integrity.',
        },
      },
      {
        id: 'tax-reporting',
        title: {
          ar: 'تقارير إقرارات القيمة المضافة',
          en: 'VAT Return Reconciliation',
        },
        description: {
          ar: 'استخراج تقارير ضريبية دورية بنقرة زر توضح إجمالي المبيعات، ومبالغ الضريبة المحصلة، لتسهيل تقديم الإقرار الضريبي.',
          en: 'Generate periodic VAT return ledgers summarizing gross sales and tax collected for effortless tax authority filings.',
        },
      },
      {
        id: 'financial-compliance',
        title: {
          ar: 'تسهيل العمليات المالية للمنشأة',
          en: 'Streamlined Financial Governance',
        },
        description: {
          ar: 'مطابقة المبيعات النقدية والإلكترونية مع الفواتير الصادرة لمنع أي فروقات حسابية بين السجلات الدفترية والإقرارات.',
          en: 'Reconcile card transactions and cash receipts against issued invoices to prevent accounting discrepancies.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر التشغيلي والمالي على صالونك',
      en: 'Operational Impact on Salon Governance',
    },
    impacts: [
      {
        title: {
          ar: 'أمان قانوني وتجنب المخالفات',
          en: 'Zero Penalty Exposure',
        },
        description: {
          ar: 'الامتثال الكامل لمتطلبات هيئة الزكاة والضريبة والجمارك يحمي صالونك من الغرامات والعقوبات المالية.',
          en: 'Strict compliance with ZATCA technical standards shields your business from costly audit fines and closures.',
        },
      },
      {
        title: {
          ar: 'إصدار سريع للفاتورة في ثوانٍ',
          en: 'Sub-Second Invoice Dispatch',
        },
        description: {
          ar: 'توليد رمز QR وطباعة الفاتورة أو إرسالها رقمياً يتم فورياً دون أي تأخير في حركة الكاشير والاستقبال.',
          en: 'QR generation and digital invoice printing complete in fractions of a second, preventing checkout bottlenecks.',
        },
      },
      {
        title: {
          ar: 'تقديم الإقرار الضريبي في دقائق',
          en: 'Minutes-Fast VAT Filing',
        },
        description: {
          ar: 'التقارير الجاهزة والمفصلة تجعل إعداد وتقديم الإقرار الضريبي الربع سنوي أمراً في غاية السهولة والدقة.',
          en: 'Pre-reconciled tax ledgers make quarterly VAT return submissions effortless, accurate, and audit-ready.',
        },
      },
    ],
    regulatoryTitle: {
      ar: 'التكامل التنظيمي مع هيئة الزكاة والضريبة والجمارك',
      en: 'Regulatory Integration with Saudi ZATCA Mandates',
    },
    regulatoryDescription: {
      ar: 'تحرص راش إكس على مواكبة كافة اللوائح والتعاميم الصادرة عن الهيئة لضمان استمرار عمل صالونك بأعلى معايير الالتزام.',
      en: 'RASHX continually tracks ZATCA regulatory updates and circulars to keep your salon operations fully compliant.',
    },
    regulatoryPoints: [
      {
        ar: 'اعتماد الفواتير الضريبية المبسطة والإشعارات الدائنة والمدينة المتوافقة.',
        en: 'Certified issuance of compliant simplified tax invoices, credit notes, and debit notes.',
      },
      {
        ar: 'تشفير وحفظ الفواتير وفق متطلبات التخزين الآمن المنصوص عليها في اللائحة.',
        en: 'Secure encrypted invoice archiving adhering strictly to national data retention mandates.',
      },
      {
        ar: 'تحديثات برمجية سحابية تلقائية لمواكبة أي تعديلات تنظيمية مستقبلية دون انقطاع الخدمة.',
        en: 'Automatic cloud updates deploying future regulatory changes seamlessly with zero salon downtime.',
      },
    ],
    seo: {
      title: {
        ar: 'الفوترة الإلكترونية للصالونات (المرحلة الثانية ZATCA) | RASHX',
        en: 'Saudi Salon E-Invoicing & ZATCA Phase 2 Compliance | RASHX',
      },
      description: {
        ar: 'نظام الفوترة الإلكترونية المعتمد للصالونات ومراكز التجميل من راش إكس: متوافق مع المرحلة الثانية ZATCA، إصدار فواتير ضريبية مبسطة برمز QR مشفر وأرشفة آمنة.',
        en: 'Compliant beauty salon e-invoicing by RASHX: fully aligned with Saudi ZATCA Phase 2, automated simplified tax invoices, cryptographic QR codes, and secure archiving.',
      },
    },
  },

  security: {
    slug: 'security',
    path: '/security',
    badge: {
      ar: 'أمن المعلومات وحماية البيانات',
      en: 'DATA SECURITY & ENTERPRISE TRUST',
    },
    title: {
      ar: 'بنية سحابية محصنة تضمن سرية بيانات صالونك وعملائك واستمرارية أعمالك',
      en: 'Hardened Cloud Infrastructure Protecting Your Data and Salon Continuity',
    },
    subtitle: {
      ar: 'تنظيم دقيق للصلاحيات، إدارة الأدوار، والفصل المنطقي بين المنشآت (Tenant Isolation) لتوفير بيئة تشغيل موثوقة بمعايير عالمية.',
      en: 'Granular access controls, role-based governance, and logical tenant isolation delivering an enterprise-grade operational fortress.',
    },
    description: {
      ar: 'تولي راش إكس أهمية قصوى لأمن وحماية بيانات المنشآت والعملاء، وتعتمد معمارية برمجية صارمة تعزل بيانات كل منشأة منطقياً وتمنع أي وصول غير مصرح به، مع تشفير شامل وسجلات تدقيق تضمن استمرارية الأعمال وسلامة المعلومات.',
      en: 'RASHX prioritizes customer and business data security above all else—implementing a zero-compromise architecture with logical tenant isolation, end-to-end encryption, and comprehensive audit logs that safeguard continuity.',
    },
    highlights: [
      { ar: 'الفصل المنطقي الكامل بين بيانات المنشآت', en: 'Logical multi-tenant data isolation' },
      { ar: 'إدارة متطورة للأدوار والصلاحيات الوظيفية', en: 'Granular role-based access management' },
      { ar: 'تشفير شامل للبيانات في السكون وأثناء النقل', en: 'End-to-end encryption in transit and at rest' },
      { ar: 'بيئة تشغيل موثوقة مع نسخ احتياطي دوري', en: 'Highly reliable infrastructure with automated backups' },
    ],
    pillars: [
      {
        id: 'access-control',
        title: {
          ar: 'تنظيم الوصول وفق الصلاحيات',
          en: 'Permission-Based Access Control',
        },
        description: {
          ar: 'تحديد ما يمكن لكل مستخدم رؤيته أو تعديله بدقة، لمنع اطلاع الموظفين على أرقام الإيرادات أو التقارير المالية دون إذن.',
          en: 'Define exactly what each user can view or edit, preventing unauthorized staff from accessing financial reports or sales totals.',
        },
      },
      {
        id: 'user-management',
        title: {
          ar: 'إدارة الأدوار والمستخدمين',
          en: 'Role & User Lifecycle Management',
        },
        description: {
          ar: 'إنشاء أدوار وظيفية مستقلة (مالك، مدير فرع، محاسب، كاشير، أخصائية) مع إمكانية إيقاف أو تعديل الحسابات فورياً.',
          en: 'Create dedicated operational roles (owner, branch manager, cashier, stylist) with instant account provisioning and revoking.',
        },
      },
      {
        id: 'account-protection',
        title: {
          ar: 'حماية الحسابات وسلامة الدخول',
          en: 'Account Protection & Login Security',
        },
        description: {
          ar: 'حماية تسجيل الدخول بكلمات مرور قوية وجلسات عمل آمنة تنتهي تلقائياً عند عدم النشاط لمنع الاختراق.',
          en: 'Secure authentication, strong password enforcement, and automatic session timeouts preventing unauthorized physical access.',
        },
      },
      {
        id: 'tenant-isolation',
        title: {
          ar: 'الفصل المنطقي بين بيانات المنشآت',
          en: 'Logical Multi-Tenant Data Isolation',
        },
        description: {
          ar: 'عزل تام لقاعدة بيانات وملفات كل صالون، بحيث يستحيل على أي منشأة أو مستخدم الوصول لبيانات منشأة أخرى.',
          en: 'Strict logical boundary enforcement guaranteeing that no facility or user can ever access or leak another salon’s data.',
        },
      },
      {
        id: 'confidentiality-encryption',
        title: {
          ar: 'تعزيز سرية المعلومات والتشفير',
          en: 'Data Confidentiality & Encryption',
        },
        description: {
          ar: 'تشفير كافة البيانات الحساسة (بيانات العميلات، سجلات الدفع، التقارير) باستخدام بروتوكولات التشفير الحديثة (TLS/HTTPS).',
          en: 'Industry-standard encryption for sensitive customer profiles, payment logs, and financial metrics in transit and at rest.',
        },
      },
      {
        id: 'continuity-backups',
        title: {
          ar: 'دعم استمرارية الأعمال وسلامة البيانات',
          en: 'Business Continuity & Automated Backups',
        },
        description: {
          ar: 'نسخ احتياطي سحابي دوري ومستمر يضمن استعادة بيانات الصالون فورياً في حال حدوث أي طارئ دون فقدان أي حجز.',
          en: 'Continuous cloud snapshots and disaster recovery safeguards ensuring immediate data restoration without booking loss.',
        },
      },
    ],
    impactTitle: {
      ar: 'الأثر الاستراتيجي للأمان على أعمال صالونك',
      en: 'Strategic Value of Enterprise Security for Your Business',
    },
    impacts: [
      {
        title: {
          ar: 'ثقة وراحة بال مطلقة للعميلات',
          en: 'Absolute Client Privacy Trust',
        },
        description: {
          ar: 'حماية أرقام هواتف العميلات وسجلاتهن من التسريب يعزز سمعة صالونك ويبني ثقة تدوم لسنوات.',
          en: 'Protecting client contact details and treatment notes from leakage cements customer confidence and brand reputation.',
        },
      },
      {
        title: {
          ar: 'منع السرقات والتلاعب المالي',
          en: 'Fraud Prevention & Revenue Integrity',
        },
        description: {
          ar: 'قفل الصلاحيات وسجلات التدقيق تمنع تعديل الفواتير أو تطبيق خصومات غير معتمدة خلف ظهر الإدارة.',
          en: 'Locked permissions and comprehensive audit trails eliminate invoice tampering and unauthorized cashier markdowns.',
        },
      },
      {
        title: {
          ar: 'تشغيل مستقر وموثوق 24/7',
          en: 'Unbroken Operational Uptime',
        },
        description: {
          ar: 'البنية التحتية السحابية المحصنة تضمن عمل الصالون واستقبال الحجوزات دون انقطاع أو أعطال مفاجئة.',
          en: 'High-availability infrastructure guarantees that appointment booking and checkout registers stay online without interruption.',
        },
      },
    ],
    regulatoryTitle: {
      ar: 'معايير الأمان والحوكمة المعتمدة في راش إكس',
      en: 'Security Standards and Governance in RASHX',
    },
    regulatoryDescription: {
      ar: 'نطبق سياسات حوكمة صارمة تلبي أعلى معايير أمن المعلومات وحماية البيانات في المملكة.',
      en: 'We enforce stringent governance controls aligned with enterprise information security best practices in the Kingdom.',
    },
    regulatoryPoints: [
      {
        ar: 'مراقبة أمنية مستمرة للأنظمة لرصد ومكافحة أي محاولات وصول مشبوهة.',
        en: 'Continuous vulnerability monitoring and automated intrusion detection algorithms.',
      },
      {
        ar: 'فصل الصلاحيات بين مهام الاستقبال وإدارة الخزينة والتقارير التنفيذية.',
        en: 'Strict segregation of duties between frontline reception, cash reconciliation, and executive dashboards.',
      },
      {
        ar: 'استضافة سحابية آمنة في بيئات بيانات عالية الاعتمادية.',
        en: 'Encrypted cloud hosting hosted in highly reliable, enterprise-certified data centers.',
      },
    ],
    seo: {
      title: {
        ar: 'أمن المعلومات وحماية البيانات للصالونات | RASHX',
        en: 'Salon Data Security & Multi-Tenant Protection | RASHX',
      },
      description: {
        ar: 'معايير أمن المعلومات وحماية البيانات في راش إكس: الفصل المنطقي بين المنشآت، إدارة الصلاحيات والأدوار، التشفير الشامل، ودعم استمرارية الأعمال.',
        en: 'Enterprise data security and privacy architecture by RASHX: multi-tenant data isolation, role-based access controls, encryption, and automated disaster recovery.',
      },
    },
  },
};

