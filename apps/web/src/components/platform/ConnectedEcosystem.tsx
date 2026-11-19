import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Globe,
  LayoutDashboard,
  Smartphone,
  UserCheck,
  CheckCircle2,
  Database,
  Zap,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface ConnectedEcosystemProps {
  lang: Lang;
  className?: string;
}

export function ConnectedEcosystem({ lang, className }: ConnectedEcosystemProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'الأوجه الأربعة للمنظومة',
        title: 'كل منشأة، منظومة رقمية متكاملة.',
        subtitle:
          'تحصل كل منشأة على بنية رقمية متكاملة تجمع كافة أطراف العمل تحت هويتها التجارية الخاصة، مترابطة لحظيًا دون الحاجة لأدوات خارجية متفرقة.',
        components: [
          {
            id: 'website',
            number: '01',
            icon: Globe,
            title: 'الموقع الإلكتروني للمنشأة (Website)',
            subtitle: 'واجهة رقمية احترافية تحمل هويتك',
            description:
              'بوابة إلكترونية متكاملة باسم ونطاق الصالون، تعرض قائمة الخدمات والأسعار والباقات، وتتيح للعملاء حجز مواعيدهم ذاتيًا على مدار الساعة بكل سهولة ودون وسطاء.',
            capabilities: [
              'نطاق مستقل باسم المنشأة',
              'عرض قائمة الخدمات والباقات والتسعير',
              'محرك حجز ذاتي ومباشر للعملاء',
              'متوافق بالكامل مع الجوال ومحركات البحث',
            ],
            badge: 'واجهة العملاء العامة',
            tone: 'bg-[#F0C5AE]',
          },
          {
            id: 'dashboard',
            number: '02',
            icon: LayoutDashboard,
            title: 'لوحة التحكم الإدارية (Admin Dashboard)',
            subtitle: 'مركز القيادة والعمليات اليومية',
            description:
              'المقر المركزي لإدارة كافة تفاصيل المنشأة: جدول المواعيد، ورديات الموظفات، سجلات العملاء، الفواتير ونقاط البيع، متابعة المخزون، والتقارير المالية والتشغيلية.',
            capabilities: [
              'جدول مواعيد تقويمي لحظي بدون تعارض',
              'نظام نقاط البيع السحابي والفوترة المبسطة',
              'إدارة الصلاحيات والفروع المتعددة',
              'لوحات متابعة الإيرادات والأداء لحظة بلحظة',
            ],
            badge: 'مركز التحكم الإداري',
            tone: 'bg-[#CADEE2]',
          },
          {
            id: 'customer-app',
            number: '03',
            icon: Smartphone,
            title: 'تطبيق العملاء (Customer Experience)',
            subtitle: 'تجربة حجز سلسة تزيد ولاء العميلات',
            description:
              'تجربة جوال متطورة تُمكّن عميلات الصالون من استعراض الخدمات، واختيار الأخصائية المفضلة، وإعادة جدولة المواعيد، وتتبع رصيد نقاط الولاء والعروض الترويجية.',
            capabilities: [
              'حجز سريع في خطوات معدودة',
              'اختيار الأخصائية وموعد الزيارة بدقة',
              'إشعارات وتذكير بالمواعيد عبر الرسائل',
              'سجل الزيارات السابقة ونقاط المكافآت',
            ],
            badge: 'تجربة العميل',
            tone: 'bg-[#FAF9F8]',
          },
          {
            id: 'provider-app',
            number: '04',
            icon: UserCheck,
            title: 'تطبيق مقدمي الخدمة (Staff & Specialists)',
            subtitle: 'تمكين فريق العمل ومتابعة الأداء',
            description:
              'واجهة تشغيلية مخصصة للأخصائيات ومقدمي الخدمة لمعرفة جدول حجوزات اليوم، وملاحظات وتفضيلات كل عميلة، وتتبع احتساب العمولات والحوافز بنزاهة وشفافية.',
            capabilities: [
              'جدول مهام وزيارات اليوم في متناول اليد',
              'متابعة تفاصيل الخدمة وملاحظات العميلات',
              'احتساب فوري لنسب العمولات والمبيعات',
              'تقليل الأخطاء الإدارية والورقية بنسبة 100%',
            ],
            badge: 'فريق العمل والأخصائيات',
            tone: 'bg-[#FAF9F8]',
          },
        ],
        diagram: {
          title: 'كيف تترابط المكونات في منظومة واحدة متماسكة؟',
          subtitle: 'قاعدة بيانات سحابية موحدة تجمع كافة التعاملات وتحدّثها لحظيًا',
          centralCore: 'محرك راش إكس السحابي المركزي',
          syncPoints: [
            'مزامنة فورية للمواعيد وتفادي التعارض',
            'قاعدة عملاء موحدة مع تاريخ المعاملات',
            'تحديث آلي للمخزون مع كل فاتورة',
            'أمان وعزل كامل لبيانات كل صالون',
          ],
        },
      }
    : {
        eyebrow: 'Four Unified Touchpoints',
        title: 'Every Facility, A Unified Digital Ecosystem.',
        subtitle:
          'Each facility receives an integrated digital infrastructure connecting every stakeholder under its distinct brand, seamlessly synchronized in real time without fragmented tools.',
        components: [
          {
            id: 'website',
            number: '01',
            icon: Globe,
            title: 'Dedicated Salon Website',
            subtitle: 'A professional storefront carrying your brand',
            description:
              'A fully branded web portal under your salon domain, showcasing service catalogs, tiered packages, and location details, with 24/7 direct online booking without third-party fees.',
            capabilities: [
              'Custom branded subdomain / domain',
              'Interactive service menu, pricing & packages',
              'Frictionless self-service client booking',
              'Mobile-optimized and search-engine ready',
            ],
            badge: 'Public Front-End',
            tone: 'bg-[#F0C5AE]',
          },
          {
            id: 'dashboard',
            number: '02',
            icon: LayoutDashboard,
            title: 'Admin Management Dashboard',
            subtitle: 'Central command & daily operational control',
            description:
              'The central hub to oversee salon operations: master appointment calendar, staff shifts, CRM client profiles, cloud POS checkout, inventory levels, and financial analytics.',
            capabilities: [
              'Live visual scheduling preventing double bookings',
              'Cloud POS with simplified tax invoicing',
              'Granular roles, permissions & multi-branch support',
              'Real-time revenue and operational reports',
            ],
            badge: 'Operational Nerve Center',
            tone: 'bg-[#CADEE2]',
          },
          {
            id: 'customer-app',
            number: '03',
            icon: Smartphone,
            title: 'Customer Experience App',
            subtitle: 'Frictionless booking elevating client retention',
            description:
              'A dedicated mobile experience enabling clients to browse services, select their favorite specialist, manage appointments, and track their loyalty points and offers.',
            capabilities: [
              'Rapid 3-step appointment booking',
              'Specialist selection & live availability',
              'Automated reminders & confirmation notifications',
              'Past visit history & loyalty rewards balance',
            ],
            badge: 'Client Interface',
            tone: 'bg-[#FAF9F8]',
          },
          {
            id: 'provider-app',
            number: '04',
            icon: UserCheck,
            title: 'Service Provider & Staff App',
            subtitle: 'Empowering specialists with transparent tools',
            description:
              'A purpose-built operational view for stylists and therapists to review their daily appointment lineup, access client preferences, and track earned commissions transparently.',
            capabilities: [
              'Daily appointment lineup always in hand',
              'Client treatment history & formula notes',
              'Automated real-time commission calculations',
              'Zero manual paper slips or schedule confusion',
            ],
            badge: 'Staff & Specialists',
            tone: 'bg-[#FAF9F8]',
          },
        ],
        diagram: {
          title: 'How All 4 Touchpoints Connect Into One Cohesive Core',
          subtitle: 'A unified cloud data engine synchronizing all actions with zero delay',
          centralCore: 'RASHX Central Cloud Engine',
          syncPoints: [
            'Instant calendar sync preventing double booking',
            'Unified client profiles & visit histories',
            'Automated inventory deduction with each receipt',
            'Strict tenant data isolation and security',
          ],
        },
      };

  return (
    <section
      id="ecosystem"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
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

        {/* 4 Touchpoints Bento Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {sectionContent.components.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 lg:p-10 transition-colors duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone} text-[#54453D]`}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-sm font-bold tracking-wider text-[#C78360]">
                      {item.number}
                    </span>
                  </div>

                  <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-[#75645B]">
                    {item.badge}
                  </span>

                  <h3 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#54453D]">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-[#C78360]">
                    {item.subtitle}
                  </p>

                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#75645B]">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-6 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#54453D]">
                    {isAr ? 'أبرز الإمكانيات:' : 'Key Capabilities:'}
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#54453D]">
                    {item.capabilities.map((cap) => (
                      <li key={cap} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* Centralized Cloud Core Architecture Schematic */}
        <div className="mt-12 sm:mt-16 rounded-3xl bg-[#FAF9F8] p-6 sm:p-10 lg:p-12 text-[#54453D]">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#91B8C0]/25 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#2C4349]">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{sectionContent.diagram.centralCore}</span>
            </span>
            <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-[#54453D]">
              {sectionContent.diagram.title}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-[#75645B]">
              {sectionContent.diagram.subtitle}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectionContent.diagram.syncPoints.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 sm:p-5 transition-colors duration-200"
              >
                <div className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F0C5AE] text-[#54453D]">
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <span className="text-xs sm:text-sm font-semibold leading-relaxed text-[#54453D]">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
