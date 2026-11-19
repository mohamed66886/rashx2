import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import type { Lang } from '@/lib/lang';
import { getStartedData } from '@/data/commercial';

export interface GetStartedStepsProps {
  lang: Lang;
  className?: string;
}

export function GetStartedSteps({ lang, className }: GetStartedStepsProps) {
  const isAr = lang === 'ar';
  const { onboardingSteps } = getStartedData;

  return (
    <section
      id="get-started-steps"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-5xl">
          <SectionTitle
            eyebrow={isAr ? 'خارطة طريق الانطلاق' : 'ONBOARDING ROADMAP'}
            title={
              isAr
                ? 'أربع خطوات عملية لتهيئة وتشغيل منظومتك الرقمية'
                : 'Four Practical Steps to Launch Your Digital Salon Platform'
            }
            align="center"
          />
          <p className="mt-4 text-base leading-relaxed text-[#75645B] max-w-2xl mx-auto text-center">
            {isAr
              ? 'صممنا مسار انتقال سلس ومحكم يضمن تحويل صالونك إلى العمل الرقمي بأسرع وقت دون أي انقطاع في خدمة عميلاتك.'
              : 'A structured onboarding transition ensuring zero downtime and immediate operational value.'}
          </p>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {onboardingSteps.map((stepItem, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-7 flex flex-col justify-between transition-colors duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl sm:text-3xl font-black text-[#C78360] font-mono">
                      {stepItem.step}
                    </span>
                    <span className="inline-block h-2 w-2 rounded-full bg-[#C78360]" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#54453D] mb-3">
                    {stepItem.title[lang]}
                  </h3>

                  <p className="text-xs sm:text-sm leading-relaxed text-[#75645B]">
                    {stepItem.description[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
