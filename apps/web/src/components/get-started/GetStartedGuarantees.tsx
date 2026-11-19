import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Database, BookOpen, ShieldCheck } from '@rashx/icons';
import type { Lang } from '@/lib/lang';
import { getStartedData } from '@/data/commercial';

export interface GetStartedGuaranteesProps {
  lang: Lang;
  className?: string;
}

const guaranteeIcons = [Database, BookOpen, ShieldCheck];

export function GetStartedGuarantees({ lang, className }: GetStartedGuaranteesProps) {
  const isAr = lang === 'ar';
  const { guarantees } = getStartedData;

  return (
    <section
      id="get-started-guarantees"
      className={`relative bg-[#FAF9F8] py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        <div className="mx-auto max-w-5xl">
          <SectionTitle
            eyebrow={isAr ? 'ضمانات الانطلاق الآمن' : 'ONBOARDING ASSURANCES'}
            title={
              isAr
                ? 'انتقال موثوق بدعم كامل من خبراء RASHX'
                : 'Reliable Transition Supported by RASHX Specialists'
            }
            align="center"
          />
          <p className="mt-4 text-base leading-relaxed text-[#75645B] max-w-2xl mx-auto text-center">
            {isAr
              ? 'نرافقك خطوة بخطوة من اللحظة الأولى لضمان نجاح التحول الرقمي لمنشأتك دون أي تعقيد تقني.'
              : 'We walk with you every step of the journey to ensure smooth salon digitization without friction.'}
          </p>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {guarantees.map((item, idx) => {
              const IconComponent = guaranteeIcons[idx % guaranteeIcons.length] ?? ShieldCheck;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white p-6 sm:p-8 flex flex-col justify-between transition-colors duration-200"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0C5AE]/40 text-[#54453D] mb-5">
                      <IconComponent className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                    </div>

                    <h3 className="text-lg font-bold text-[#54453D] mb-3">
                      {item.title[lang]}
                    </h3>

                    <p className="text-sm leading-relaxed text-[#75645B]">
                      {item.description[lang]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
