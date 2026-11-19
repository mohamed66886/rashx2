import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Compass, Target } from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface VisionMissionProps {
  lang: Lang;
  className?: string;
}

export function VisionMission({ lang, className }: VisionMissionProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'الرؤية والرسالة',
        title: 'بوصلتنا نحو قيادة التحول الرقمي في قطاع الجمال',
        subtitle:
          'نسترشد بمبادئ واضحة وأهداف طموحة تسعى للارتقاء بقطاع الجمال والعناية وتقديم قيمة حقيقية تدعم نمو واستدامة الأعمال.',
        vision: {
          icon: Compass,
          title: 'رؤيتنا (Our Vision)',
          statement:
            'أن نكون من الحلول الرقمية الرائدة في تطوير تجربة إدارة وتشغيل منشآت قطاع الجمال.',
          tone: 'bg-[#F0C5AE]',
        },
        mission: {
          icon: Target,
          title: 'رسالتنا (Our Mission)',
          statement:
            'تطوير حلول رقمية مترابطة تساعد منشآت قطاع الجمال على تنظيم عملياتها، وتحسين تجربة عملائها، وإدارة أعمالها بكفاءة أكبر.',
          tone: 'bg-[#CADEE2]',
        },
      }
    : {
        eyebrow: 'Vision & Mission',
        title: 'Guiding the Digital Evolution of Beauty Operations',
        subtitle:
          'Guided by clear principles and strategic purpose, we are dedicated to advancing the beauty and personal care industry with sustainable operational value.',
        vision: {
          icon: Compass,
          title: 'Our Vision',
          statement:
            'To become a leading digital solution in transforming how beauty businesses manage and operate their services.',
          tone: 'bg-[#F0C5AE]',
        },
        mission: {
          icon: Target,
          title: 'Our Mission',
          statement:
            'To build connected digital solutions that help beauty businesses organize operations, improve customer experiences, and manage their businesses more effectively.',
          tone: 'bg-[#CADEE2]',
        },
      };

  return (
    <section
      id="vision-mission"
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

        {/* Vision & Mission 2-Card Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Vision Card */}
          <div className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-6 sm:p-10 lg:p-12 transition-colors duration-200 text-start">
            <div>
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${sectionContent.vision.tone} text-[#54453D]`}
              >
                <Compass className="h-6 w-6" aria-hidden="true" />
              </div>

              <h3 className="mt-5 text-2xl font-bold text-[#54453D]">
                {sectionContent.vision.title}
              </h3>

              <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#54453D] font-medium">
                {sectionContent.vision.statement}
              </p>
            </div>
          </div>

          {/* Mission Card */}
          <div className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-6 sm:p-10 lg:p-12 transition-colors duration-200 text-start">
            <div>
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${sectionContent.mission.tone} text-[#2C4349]`}
              >
                <Target className="h-6 w-6" aria-hidden="true" />
              </div>

              <h3 className="mt-5 text-2xl font-bold text-[#54453D]">
                {sectionContent.mission.title}
              </h3>

              <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#54453D] font-medium">
                {sectionContent.mission.statement}
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

