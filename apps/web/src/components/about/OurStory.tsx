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
        chapters: [
          {
            index: '01',
            label: 'واقع القطاع والتحدي',
            text: 'يتميز قطاع الصالونات ومراكز التجميل بحركته السريعة واعتماده الكبير على التنسيق اللحظي بين العميلات ومقدمي الخدمة؛ ورغم هذا التطور، ظلت العديد من المنشآت تعتمد على أدوات غير مترابطة ودفاتر ورقية وجداول إكسل يدوية تُهدر الوقت وتتسبب في تداخل المواعيد.',
          },
          {
            index: '02',
            label: 'نقطة التأسيس · 2026',
            text: 'تأسست راش إكس (RASHX) عام 2026 على يد المهندس محمد عبده رشاد البهي بهدف بناء نظام تشغيل سحابي سعودي المنشأ، يجمع الإدارة المؤسسية والتشغيل اليومي ونقاط البيع في واجهة موحدة تتوافق بالكامل مع الأنظمة والمعايير المحلية.',
          },
          {
            index: '03',
            label: 'المنهج الهندسي والاعتمادية',
            text: 'ركزنا منذ اليوم الأول على الهندسة النظيفة، وموثوقية الأداء، وحماية بيانات المنشآت، لنقدم حلاً تقنيًا رصينًا يمكّن أصحاب الأعمال من التفرغ الكامل للإبداع وخدمة عملائهم بثقة واطمئنان.',
          },
        ],
        founderCard: {
          monogram: 'م',
          badge: 'المؤسس ورئيس المنظومة',
          name: 'م. محمد عبده رشاد البهي',
          title: 'مؤسس RASHX | راش إكس',
          quote:
            '«رؤيتنا هي تمكين قطاع الجمال بمنظومة تقنية تليق بمستوى تطوره في المملكة، تجمع بين سهولة الاستخدام وقوة البنية التحتية.»',
          year: '2026',
          chaptersLabel: 'فصول القصة',
        },
      }
    : {
        eyebrow: 'Our Story & Genesis',
        title: 'From a Targeted Concept to a Complete Digital Operating System',
        subtitle:
          'The journey of RASHX began in response to a tangible need across the Saudi market for specialized software intimately attuned to the operational realities of beauty and wellness.',
        chapters: [
          {
            index: '01',
            label: 'Industry Reality',
            text: 'The beauty and wellness sector operates in a high-velocity environment requiring precise synchronization between clients and specialists. Despite rapid industry growth, facilities frequently relied on fragmented spreadsheets, generic paper notebooks, and disjointed tools that generated double bookings and administrative friction.',
          },
          {
            index: '02',
            label: 'Genesis · 2026',
            text: 'RASHX was founded in 2026 by Eng. Mohamed Abdo Rashad El-Bahy to build a homegrown cloud operating system uniting enterprise management, day-to-day salon coordination, and point of sale into an integrated interface fully aligned with Saudi business regulations.',
          },
          {
            index: '03',
            label: 'Engineering Discipline',
            text: 'From day one, our focus has been disciplined software engineering, architectural reliability, and multi-tenant data privacy—delivering an institutional software foundation so salon owners can focus fully on creativity and exceptional customer care.',
          },
        ],
        founderCard: {
          monogram: 'M',
          badge: 'Founder & Visionary',
          name: 'Eng. Mohamed Abdo Rashad El-Bahy',
          title: 'Founder of RASHX | راش إكس',
          quote:
            '“Our vision is to empower the beauty sector with digital infrastructure worthy of its sophistication in the Kingdom, blending utmost simplicity with robust architectural depth.”',
          year: '2026',
          chaptersLabel: 'Story Chapters',
        },
      };

  return (
    <section
      id="our-story"
      className={`relative overflow-hidden bg-[#FAF9F8] py-14 transition-colors duration-200 sm:py-20 lg:py-28 xl:py-32 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="mx-auto max-w-4xl text-center">
          <SectionTitle
            eyebrow={sectionContent.eyebrow}
            title={sectionContent.title}
            align="center"
            withWordmark={true}
          />
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[#75645B] sm:mt-5 sm:text-lg xl:text-xl">
            {sectionContent.subtitle}
          </p>
        </div>

        {/* ============================================================
            1. MOBILE LAYOUT (< md): Vertical Story Rail + Dark Quote Card
           ============================================================ */}
        <div className="mt-10 space-y-6 md:hidden">
          <ol className="relative space-y-4">
            {sectionContent.chapters.map((chapter, idx) => {
              const isLast = idx === sectionContent.chapters.length - 1;
              return (
                <li key={chapter.index} className="relative flex items-stretch gap-3.5">
                  {/* Start Vertical Track */}
                  <div
                    aria-hidden="true"
                    className="flex flex-col items-center pt-5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white font-mono text-xs font-black text-[#C78360]">
                      {chapter.index}
                    </span>
                    {!isLast && (
                      <span className="mt-2 w-1 flex-1 rounded-full bg-[#C78360]/25" />
                    )}
                  </div>

                  {/* Chapter Card */}
                  <article className="flex-1 rounded-2xl bg-white p-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF9F8] px-3 py-1 text-[0.7rem] font-bold text-[#C78360]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                      <span>{chapter.label}</span>
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-[#54453D]">
                      {chapter.text}
                    </p>
                  </article>
                </li>
              );
            })}
          </ol>

          {/* Mobile Founder Dark Plaque */}
          <aside className="relative overflow-hidden rounded-[1.75rem] bg-[#54453D] p-6 text-[#FAF9F8]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -end-12 -top-12 h-36 w-36 rounded-full bg-[#C78360]/15"
            />
            <div className="relative">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[0.7rem] font-bold text-[#FAF9F8]">
                  <Sparkles className="h-3.5 w-3.5 text-[#C78360]" aria-hidden="true" />
                  <span>{sectionContent.founderCard.badge}</span>
                </span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-xs font-black text-[#FAF9F8]">
                  {sectionContent.founderCard.year}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C78360] text-lg font-black text-white"
                >
                  {sectionContent.founderCard.monogram}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold leading-snug text-white">
                    {sectionContent.founderCard.name}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#FAF9F8]/75">
                    {sectionContent.founderCard.title}
                  </p>
                </div>
              </div>

              <blockquote className="mt-5 rounded-2xl bg-white/[0.08] p-4 text-sm italic leading-relaxed text-[#FAF9F8]/95">
                {sectionContent.founderCard.quote}
              </blockquote>
            </div>
          </aside>
        </div>

        {/* ============================================================
            2. TABLET LAYOUT (md → lg): Founder Banner + 1+2 Chapter Grid
           ============================================================ */}
        <div className="mt-14 hidden space-y-6 md:block lg:hidden">
          {/* Top Full-Width Founder Statement */}
          <aside className="relative overflow-hidden rounded-[2rem] bg-[#54453D] p-7 text-[#FAF9F8]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -end-10 select-none font-mono text-[9rem] font-black leading-none text-white/[0.04]"
            >
              {sectionContent.founderCard.year}
            </span>

            <div className="relative grid grid-cols-12 items-center gap-6">
              <div className="col-span-5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#FAF9F8]">
                    <Sparkles className="h-3.5 w-3.5 text-[#C78360]" aria-hidden="true" />
                    <span>{sectionContent.founderCard.badge}</span>
                  </span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-xs font-black text-[#FAF9F8]">
                    {sectionContent.founderCard.year}
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-3.5">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C78360] text-lg font-black text-white"
                  >
                    {sectionContent.founderCard.monogram}
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold leading-snug text-white">
                      {sectionContent.founderCard.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-[#FAF9F8]/75">
                      {sectionContent.founderCard.title}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-7">
                <blockquote className="relative overflow-hidden rounded-2xl bg-white/[0.08] p-5 ps-6 text-sm italic leading-relaxed text-[#FAF9F8]/95">
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-4 start-0 w-1.5 rounded-e-full bg-[#C78360]"
                  />
                  {sectionContent.founderCard.quote}
                </blockquote>
              </div>
            </div>
          </aside>

          {/* 1 + 2 Balanced Narrative Chapters */}
          <ol className="grid grid-cols-2 gap-5">
            {sectionContent.chapters.map((chapter, idx) => {
              const isLead = idx === 0;
              return (
                <li
                  key={chapter.index}
                  className={isLead ? 'col-span-2' : 'flex'}
                >
                  <article className="relative flex w-full flex-col justify-between overflow-hidden rounded-[1.75rem] bg-white p-7">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-3 end-5 select-none font-mono text-7xl font-black leading-none text-[#54453D]/[0.04]"
                    >
                      {chapter.index}
                    </span>

                    <div className="relative">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF9F8] px-3.5 py-1 text-xs font-bold text-[#C78360]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                          <span>{chapter.label}</span>
                        </span>
                        <span className="font-mono text-xs font-black text-[#75645B]">
                          {chapter.index} / 03
                        </span>
                      </div>

                      <p
                        className={`mt-4 leading-relaxed text-[#54453D] ${
                          isLead ? 'text-lg font-medium' : 'text-base'
                        }`}
                      >
                        {chapter.text}
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ============================================================
            3. DESKTOP LAYOUT (lg+): 12-Col Editorial Spread
               Sticky Founder Plaque (5) + 3-Chapter Narrative Track (7)
           ============================================================ */}
        <div className="mt-16 hidden lg:block xl:mt-20">
          <div className="grid grid-cols-12 items-start gap-8 xl:gap-12">
            {/* Start 5 cols: Sticky Dark Espresso Founder Card */}
            <aside className="sticky top-24 col-span-5">
              <div className="relative overflow-hidden rounded-[2.25rem] bg-[#54453D] p-8 text-[#FAF9F8] xl:p-10">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-10 -end-6 select-none font-mono text-[10rem] font-black leading-none text-white/[0.04]"
                >
                  {sectionContent.founderCard.year}
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -start-16 -top-16 h-48 w-48 rounded-full bg-[#C78360]/15"
                />

                <div className="relative">
                  {/* Top Badge + Year */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-[#FAF9F8]">
                      <Sparkles className="h-3.5 w-3.5 text-[#C78360]" aria-hidden="true" />
                      <span>{sectionContent.founderCard.badge}</span>
                    </span>
                    <span className="rounded-xl bg-white/10 px-3 py-1 font-mono text-xs font-black text-[#FAF9F8]">
                      {sectionContent.founderCard.year}
                    </span>
                  </div>

                  {/* Founder Identity */}
                  <div className="mt-7 flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#C78360] text-xl font-black text-white"
                    >
                      {sectionContent.founderCard.monogram}
                    </span>
                    <div>
                      <h3 className="text-xl font-extrabold leading-snug text-white xl:text-2xl">
                        {sectionContent.founderCard.name}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-[#FAF9F8]/75 xl:text-sm">
                        {sectionContent.founderCard.title}
                      </p>
                    </div>
                  </div>

                  {/* Quote Block */}
                  <blockquote className="relative mt-7 overflow-hidden rounded-2xl bg-white/[0.08] p-5 ps-6 text-sm italic leading-relaxed text-[#FAF9F8]/95 xl:p-6 xl:ps-7 xl:text-base">
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-4 start-0 w-1.5 rounded-e-full bg-[#C78360]"
                    />
                    {sectionContent.founderCard.quote}
                  </blockquote>

                  {/* Story Chapter Index */}
                  <div className="mt-7 rounded-2xl bg-white/[0.06] p-4">
                    <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-[#FAF9F8]/60">
                      {sectionContent.founderCard.chaptersLabel}
                    </span>
                    <div className="mt-3 space-y-2">
                      {sectionContent.chapters.map((chapter) => (
                        <div
                          key={`index-${chapter.index}`}
                          className="flex items-center gap-3 text-xs font-semibold text-[#FAF9F8]/85"
                        >
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 font-mono text-[0.7rem] font-black text-[#C78360]">
                            {chapter.index}
                          </span>
                          <span className="truncate">{chapter.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* End 7 cols: 3-Chapter Narrative Editorial Stream */}
            <ol className="col-span-7 space-y-5 xl:space-y-6">
              {sectionContent.chapters.map((chapter, idx) => (
                <li key={chapter.index}>
                  <article className="relative overflow-hidden rounded-[2rem] bg-white p-8 ps-10 xl:p-9 xl:ps-12">
                    {/* Flat Start Accent Bar */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-8 start-0 w-1.5 rounded-e-full ${
                        idx === 1 ? 'bg-[#54453D]' : 'bg-[#C78360]'
                      }`}
                    />

                    {/* Subtle Oversized Chapter Index */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-5 end-6 select-none font-mono text-[7rem] font-black leading-none text-[#54453D]/[0.04]"
                    >
                      {chapter.index}
                    </span>

                    <div className="relative">
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF9F8] px-3.5 py-1.5 text-xs font-bold text-[#C78360]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#C78360]" />
                          <span>{chapter.label}</span>
                        </span>
                        <span className="rounded-lg bg-[#FAF9F8] px-2.5 py-1 font-mono text-xs font-black text-[#75645B]">
                          {chapter.index} / 03
                        </span>
                      </div>

                      <p className="mt-5 text-base leading-[1.9] text-[#54453D] xl:text-lg xl:leading-[1.95]">
                        {chapter.text}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}