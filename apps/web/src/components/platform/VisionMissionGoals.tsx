import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Compass,
  Target,
  TrendingUp,
  HeartHandshake,
  Cpu,
  Building2,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface VisionMissionGoalsProps {
  lang: Lang;
  className?: string;
}

export function VisionMissionGoals({ lang, className }: VisionMissionGoalsProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'الرؤية والرسالة والأهداف',
        title: 'الرؤية، الرسالة، والأهداف الاستراتيجية.',
        subtitle:
          'ننطلق من رؤية واضحة تهدف إلى تطوير قطاع الجمال والعناية الشخصية عبر حلول برمجية حديثة تُحدث نقلة نوعية في كفاءة وربحية المنشآت.',
        vision: {
          icon: Compass,
          title: 'رؤيتنا (Our Vision)',
          text:
            'أن تكون راش إكس (RASHX) نظام التشغيل الرقمي والمنظومة التقنية الأكثر موثوقية وريادة لقطاع الجمال والعناية الشخصية في المملكة العربية السعودية والشرق الأوسط.',
          tone: 'bg-[#F0C5AE]',
        },
        mission: {
          icon: Target,
          title: 'رسالتنا (Our Mission)',
          text:
            'تمكين أصحاب الصالونات ومراكز التجميل والسبا من إدارة أعمالهم بأعلى مستويات الكفاءة والاحترافية، وتطوير جودة الخدمات، ورفع الإنتاجية، مع تقديم تجربة رقمية استثنائية لعملائهم.',
          tone: 'bg-[#CADEE2]',
        },
        goalsTitle: 'الأهداف الاستراتيجية لمنظومة راش إكس',
        goals: [
          {
            icon: Cpu,
            title: 'أتمتة العمليات اليومية',
            desc: 'القضاء على المعاملات اليدوية والورقية وتنظيم دورة المواعيد والمخزون والمبيعات بسلاسة كاملة.',
          },
          {
            icon: HeartHandshake,
            title: 'الارتقاء بتجربة العميل',
            desc: 'توفير حجز رقمي مباشر وسهل يعزز ولاء العميلات ويزيد معدل تكرار الزيارة للمنشأة.',
          },
          {
            icon: TrendingUp,
            title: 'قرارات مبنية على بيانات دقيقة',
            desc: 'تزويد الإدارة بتقارير مالية وتشغيلية لحظية تمكّنها من رفع الأرباح وتقليل التكاليف المهدرة.',
          },
          {
            icon: Building2,
            title: 'المساهمة في رؤية السعودية 2030',
            desc: 'دفع عجلة التحول الرقمي في قطاع التجزئة والخدمات الشخصية ودعم نمو المنشآت الصغيرة والمتوسطة.',
          },
        ],
        founderCard: {
          badge: 'تأسيس وطني أصيل',
          text: 'تأسست RASHX عام 2026 على يد المهندس محمد عبده رشاد البهي.',
        },
      }
    : {
        eyebrow: 'Corporate Purpose & Roadmap',
        title: 'Vision, Mission, and Strategic Goals.',
        subtitle:
          'Driven by a definitive vision to transform the beauty and personal care industry through modern software delivering measurable operational excellence and sustained profitability.',
        vision: {
          icon: Compass,
          title: 'Our Vision',
          text:
            'To establish RASHX as the premier, most trusted digital operating system empowering the beauty and personal care sector across Saudi Arabia and the Middle East.',
          tone: 'bg-[#F0C5AE]',
        },
        mission: {
          icon: Target,
          title: 'Our Mission',
          text:
            'Empowering salon and spa owners to govern their operations with peak efficiency and professionalism, elevating service standards, boosting productivity, and crafting unforgettable digital customer journeys.',
          tone: 'bg-[#CADEE2]',
        },
        goalsTitle: 'Strategic Goals of RASHX Platform',
        goals: [
          {
            icon: Cpu,
            title: 'Operational Automation',
            desc: 'Eliminating manual spreadsheets and paper slips with fully unified appointment, inventory, and sales workflows.',
          },
          {
            icon: HeartHandshake,
            title: 'Elevated Client Experience',
            desc: 'Delivering frictionless 24/7 direct digital booking that strengthens customer retention and visit frequency.',
          },
          {
            icon: TrendingUp,
            title: 'Data-Driven Governance',
            desc: 'Equipping owners with real-time financial intelligence and operational analytics to maximize profit margins.',
          },
          {
            icon: Building2,
            title: 'Saudi Vision 2030 Alignment',
            desc: 'Accelerating digital transformation across personal care and empowering sustainable growth for SME businesses.',
          },
        ],
        founderCard: {
          badge: 'Founded in Saudi Arabia',
          text: 'Founded in 2026 by Eng. Mohamed Abdo Rashad El-Bahy.',
        },
      };

  return (
    <section
      id="vision-mission"
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

        {/* Vision & Mission 2 Cards */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Vision */}
          <div className="flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-10 transition-colors duration-200">
            <div>
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${sectionContent.vision.tone} text-[#54453D]`}
              >
                <Compass className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-[#54453D]">
                {sectionContent.vision.title}
              </h3>
              <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#75645B]">
                {sectionContent.vision.text}
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-10 transition-colors duration-200">
            <div>
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${sectionContent.mission.tone} text-[#2C4349]`}
              >
                <Target className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-[#54453D]">
                {sectionContent.mission.title}
              </h3>
              <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#75645B]">
                {sectionContent.mission.text}
              </p>
            </div>
          </div>
        </div>

        {/* Strategic Goals Bento */}
        <div className="mt-12 sm:mt-16 rounded-3xl bg-white p-6 sm:p-10 lg:p-12 transition-colors duration-200">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C78360]">
              {isAr ? 'خريطة الطريق' : 'Strategic Roadmap'}
            </span>
            <h3 className="mt-1 text-2xl sm:text-3xl font-bold text-[#54453D]">
              {sectionContent.goalsTitle}
            </h3>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-start">
            {sectionContent.goals.map((goal, idx) => {
              const Icon = goal.icon;
              return (
                <div
                  key={goal.title}
                  className="rounded-2xl bg-[#FAF9F8] p-5 sm:p-6 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#54453D]">
                      <Icon className="h-5 w-5 text-[#C78360]" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#75645B]">
                      0{idx + 1}
                    </span>
                  </div>
                  <h4 className="mt-4 text-base sm:text-lg font-bold text-[#54453D]">
                    {goal.title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#75645B]">
                    {goal.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Founder Attribution Bar */}
          <div className="mt-8 rounded-2xl bg-[#FAF9F8] p-4 text-center">
            <p className="text-xs sm:text-sm font-semibold text-[#54453D]">
              {sectionContent.founderCard.text}
            </p>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
