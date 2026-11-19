import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  HeartHandshake,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface OurValuesProps {
  lang: Lang;
  className?: string;
}

export function OurValues({ lang, className }: OurValuesProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'مبادئنا وقيمنا التوجيهية',
        title: 'القيم التي تحكم طريقة بنائنا للمنظومة',
        subtitle:
          'نلتزم بمجموعة من المبادئ التوجيهية الراسخة التي تنعكس في كل سطر برمجيات نكتبه وكل ميزة نطورها لخدمة أصحاب الصالونات.',
        values: [
          {
            number: '01',
            name: 'البساطة',
            englishName: 'Simplicity',
            icon: Zap,
            desc: 'نؤمن بأن البرمجيات القوية يجب ألا تكون معقدة؛ نصمم واجهات واضحة ومباشرة يستطيع فريق عمل الصالون استخدامها بسلاسة منذ اليوم الأول.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            number: '02',
            name: 'التكامل',
            englishName: 'Integration',
            icon: Layers,
            desc: 'نربط كافة الوظائف الإدارية والتشغيلية في قاعدة بيانات سحابية موحدة، لتتدفق البيانات بين المواعيد والمبيعات والمخزون دون أي انقطاع.',
            tone: 'bg-[#CADEE2]',
          },
          {
            number: '03',
            name: 'الموثوقية',
            englishName: 'Reliability',
            icon: ShieldCheck,
            desc: 'نعتمد أعلى معايير الاستقرار والأمان المؤسسي وحماية البيانات، لنوفر بنية تحتية يعتمد عليها صاحب العمل باطمئنان كامل ودون مفاجآت.',
            tone: 'bg-[#FAF9F8]',
          },
          {
            number: '04',
            name: 'التطوير المستمر',
            englishName: 'Continuous Development',
            icon: Sparkles,
            desc: 'نستمع باهتمام لملاحظات أصحاب الصالونات، ونواصل تحديث وتطوير المنظومة لتواكب أحدث المتطلبات والأنظمة في المملكة العربية السعودية.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            number: '05',
            name: 'تجربة العميل',
            englishName: 'Customer Experience',
            icon: HeartHandshake,
            desc: 'نجعل راحة العميل وسهولة تجربته محور كل تفاعل؛ فكلما كانت رحلة الحجز والزيارة سهلة وأنيقة، زاد ولاء العميلات للمنشأة.',
            tone: 'bg-[#91B8C0]/30',
          },
        ],
      }
    : {
        eyebrow: 'Guiding Principles',
        title: 'Core Values Governing How We Build RASHX',
        subtitle:
          'We hold ourselves to foundational principles that guide every line of code we write and every capability we engineer for salon operators.',
        values: [
          {
            number: '01',
            name: 'Simplicity',
            englishName: 'Simplicity',
            icon: Zap,
            desc: 'We believe powerful software should never be complicated. We craft intuitive, clutter-free interfaces that staff can master from day one.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            number: '02',
            name: 'Integration',
            englishName: 'Integration',
            icon: Layers,
            desc: 'We unite every operational touchpoint onto a single cloud data engine, ensuring effortless synchronization across bookings, POS, and inventory.',
            tone: 'bg-[#CADEE2]',
          },
          {
            number: '03',
            name: 'Reliability',
            englishName: 'Reliability',
            icon: ShieldCheck,
            desc: 'We uphold strict standards of cloud uptime, data encryption, and tenant privacy, providing a dependable foundation business owners trust completely.',
            tone: 'bg-[#FAF9F8]',
          },
          {
            number: '04',
            name: 'Continuous Development',
            englishName: 'Continuous Development',
            icon: Sparkles,
            desc: 'We actively listen to salon owners and continuously evolve our platform to meet modern operational demands and Saudi regulatory mandates.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            number: '05',
            name: 'Customer Experience',
            englishName: 'Customer Experience',
            icon: HeartHandshake,
            desc: 'We place client delight and frictionless interactions at the center of our design, crafting refined booking journeys that cultivate enduring retention.',
            tone: 'bg-[#91B8C0]/30',
          },
        ],
      };

  return (
    <section
      id="our-values"
      className={`relative bg-[#FAF9F8] py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
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

        {/* 5 Values Bento Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sectionContent.values.map((val) => {
            const Icon = val.icon;
            return (
              <div
                key={val.name}
                className="flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-8 transition-colors duration-200 text-start"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${val.tone} text-[#54453D]`}
                    >
                      <Icon className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-sm font-bold text-[#C78360]">
                      {val.number}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#54453D]">
                    {val.name}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                    {val.desc}
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

