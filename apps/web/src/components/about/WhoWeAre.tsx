import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Layers,
  Sparkles,
  Zap,
  HeartHandshake,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface WhoWeAreProps {
  lang: Lang;
  className?: string;
}

export function WhoWeAre({ lang, className }: WhoWeAreProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'الهوية المؤسسية',
        title: 'منصة رقمية متخصصة تُعيد تعريف إدارة قطاع الجمال',
        subtitle:
          'انطلقت راش إكس برؤية واضحة تهدف إلى سد الفجوة التقنية في قطاع الصالونات ومراكز التجميل والسبا، عبر تقديم حلول برمجية تعالج التحديات التشغيلية المعقدة بأبسط الطرق الممكنة.',
        pillars: [
          {
            icon: Layers,
            title: 'توحيد كافة العمليات في مكان واحد',
            desc: 'تجميع الحجوزات، والعملاء، ونقاط البيع، والمخزون، والعمولات في منصة موحدة تقضي نهائيًا على تشتت البيانات بين دفاتر يدوية وتطبيقات متعددة.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            icon: Zap,
            title: 'تبسيط الإدارة اليومية للصالون',
            desc: 'أتمتة المهام الروتينية المتكررة لتمكين أصحاب المنشآت ومديري الفروع من التفرغ لتطوير أعمالهم ورفع جودة الخدمات دون إرهاق في الحسابات اليدوية.',
            tone: 'bg-[#CADEE2]',
          },
          {
            icon: Sparkles,
            title: 'ترابط تلقائي بين الوظائف التشغيلية',
            desc: 'ربط لحظي بين حجز الموعد، وحضور العميلة، وتوثيق الخدمة، وتسجيل الدفع على الكاشير، وخصم المخزون، وتحديث عمولة الأخصائية فوريًا وبسلاسة تامة.',
            tone: 'bg-[#FAF9F8]',
          },
          {
            icon: HeartHandshake,
            title: 'دعم تجربة عملاء منظمة واستثنائية',
            desc: 'الارتقاء بتجربة العميلة منذ لحظة الحجز الذاتي وحتى مغادرة المنشأة، مع حفظ تفضيلاتها وتاريخ زياراتها لضمان تجربة شخصية مميزة تدوم طويلاً.',
            tone: 'bg-[#91B8C0]/30',
          },
        ],
      }
    : {
        eyebrow: 'Corporate Identity',
        title: 'A Specialized Digital Platform Redefining Beauty Operations',
        subtitle:
          'RASHX was founded with a singular focus: to bridge the technological gap in salons, aesthetic centers, and spas through purpose-built software that solves complex workflows with utmost simplicity.',
        pillars: [
          {
            icon: Layers,
            title: 'Unifying Operations in One Single Platform',
            desc: 'Consolidating bookings, customer profiles, point of sale, backbar inventory, and staff commissions into a cohesive hub that eliminates data fragmentation.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            icon: Zap,
            title: 'Simplifying Day-to-Day Salon Management',
            desc: 'Automating repetitive administrative chores so salon owners and branch managers can focus on service quality and strategic expansion without administrative fatigue.',
            tone: 'bg-[#CADEE2]',
          },
          {
            icon: Sparkles,
            title: 'Seamless Operational Interconnectivity',
            desc: 'Real-time synchronization connecting appointment bookings, specialist execution, POS checkout, stock deductions, and commission ledgers without delays.',
            tone: 'bg-[#FAF9F8]',
          },
          {
            icon: HeartHandshake,
            title: 'Empowering Refined Customer Journeys',
            desc: 'Elevating the client experience from effortless online booking to checkout, preserving service history and personal preferences to nurture long-term loyalty.',
            tone: 'bg-[#91B8C0]/30',
          },
        ],
      };

  return (
    <section
      id="who-we-are"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
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

        {/* 4 Pillars Bento Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {sectionContent.pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 lg:p-10 transition-colors duration-200"
              >
                <div>
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${pillar.tone} text-[#54453D]`}
                  >
                    <Icon className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                  </div>

                  <h3 className="mt-5 text-xl sm:text-2xl font-bold text-[#54453D]">
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#75645B]">
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

