import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Sparkles } from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface OurStoryProps {
  lang: Lang;
  className?: string;
}

export function OurStory({ lang, className }: OurStoryProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'قصتنا ومسار التأسيس',
        title: 'من فكرة متخصصة إلى منظومة تشغيل رقمية متكاملة',
        subtitle:
          'بدأت رحلة راش إكس استجابةً للحاجة الحقيقية في السوق السعودي لمنصة برمجية متخصصة تفهم الطبيعة الدقيقة لقطاع التجميل والعناية.',
        narrative: [
          'يتميز قطاع الصالونات ومراكز التجميل بحركته السريعة واعتماده الكبير على التنسيق اللحظي بين العميلات ومقدمي الخدمة؛ ورغم هذا التطور، ظلت العديد من المنشآت تعتمد على أدوات غير مترابطة ودفاتر ورقية وجداول إكسل يدوية تُهدر الوقت وتتسبب في تداخل المواعيد.',
          'تأسست راش إكس (RASHX) عام 2026 على يد المهندس محمد عبده رشاد البهي بهدف بناء نظام تشغيل سحابي سعودي المنشأ، يجمع الإدارة المؤسسية والتشغيل اليومي ونقاط البيع في واجهة موحدة تتوافق بالكامل مع الأنظمة والمعايير المحلية.',
          'ركزنا منذ اليوم الأول على الهندسة النظيفة، وموثوقية الأداء، وحماية بيانات المنشآت، لنقدم حلاً تقنيًا رصينًا يمكّن أصحاب الأعمال من التفرغ الكامل للإبداع وخدمة عملائهم بثقة واطمئنان.',
        ],
        founderCard: {
          badge: 'المؤسس ورئيس المنظومة',
          name: 'م. محمد عبده رشاد البهي',
          title: 'مؤسس RASHX | راش إكس',
          quote: '«رؤيتنا هي تمكين قطاع الجمال بمنظومة تقنية تليق بمستوى تطوره في المملكة، تجمع بين سهولة الاستخدام وقوة البنية التحتية.»',
          year: '2026',
        },
      }
    : {
        eyebrow: 'Our Story & Genesis',
        title: 'From a Targeted Concept to a Complete Digital Operating System',
        subtitle:
          'The journey of RASHX began in response to a tangible need across the Saudi market for specialized software intimately attuned to the operational realities of beauty and wellness.',
        narrative: [
          'The beauty and wellness sector operates in a high-velocity environment requiring precise synchronization between clients and specialists. Despite rapid industry growth, facilities frequently relied on fragmented spreadsheets, generic paper notebooks, and disjointed tools that generated double bookings and administrative friction.',
          'RASHX was founded in 2026 by Eng. Mohamed Abdo Rashad El-Bahy to build a homegrown cloud operating system uniting enterprise management, day-to-day salon coordination, and point of sale into an integrated interface fully aligned with Saudi business regulations.',
          'From day one, our focus has been disciplined software engineering, architectural reliability, and multi-tenant data privacy—delivering an institutional software foundation so salon owners can focus fully on creativity and exceptional customer care.',
        ],
        founderCard: {
          badge: 'Founder & Visionary',
          name: 'Eng. Mohamed Abdo Rashad El-Bahy',
          title: 'Founder of RASHX | راش إكس',
          quote: '“Our vision is to empower the beauty sector with digital infrastructure worthy of its sophistication in the Kingdom, blending utmost simplicity with robust architectural depth.”',
          year: '2026',
        },
      };

  return (
    <section
      id="our-story"
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

        {/* Narrative & Founder Block */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Narrative Text */}
          <div className="space-y-5 lg:col-span-7 text-start">
            {sectionContent.narrative.map((p, idx) => (
              <p
                key={idx}
                className="text-base sm:text-lg leading-relaxed text-[#54453D]"
              >
                {p}
              </p>
            ))}
          </div>

          {/* Founder Institutional Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white p-6 sm:p-8 lg:p-10 text-[#54453D] space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF9F8] px-3.5 py-1 text-xs font-bold text-[#C78360]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{sectionContent.founderCard.badge}</span>
                </span>
                <span className="font-mono text-xs font-bold text-[#75645B]">
                  {sectionContent.founderCard.year}
                </span>
              </div>

              <div className="pt-2">
                <h3 className="text-xl sm:text-2xl font-bold text-[#54453D]">
                  {sectionContent.founderCard.name}
                </h3>
                <p className="text-xs font-semibold text-[#75645B] mt-0.5">
                  {sectionContent.founderCard.title}
                </p>
              </div>

              <blockquote className="rounded-2xl bg-[#FAF9F8] p-4 text-xs sm:text-sm italic leading-relaxed text-[#54453D]">
                {sectionContent.founderCard.quote}
              </blockquote>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
