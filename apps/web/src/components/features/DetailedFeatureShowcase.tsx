import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  CalendarDays,
  Receipt,
  UserRound,
  Percent,
  Globe,
  CheckCircle2,
  AlertTriangle,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface DetailedFeatureShowcaseProps {
  lang: Lang;
  className?: string;
}

export function DetailedFeatureShowcase({ lang, className }: DetailedFeatureShowcaseProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'استعراض المميزات الأساسية',
        title: 'تفاصيل دقيقة تعالج تحديات تشغيل الصالونات اليومية',
        subtitle:
          'تعرف على أبرز 5 مميزات عملية صُممت لحل مشكلات الإدارة الواقعية وتحويلها إلى كفاءة تشغيلية وأرباح ملموسة.',
        showcases: [
          {
            id: 'feat-calendar',
            number: '01',
            icon: CalendarDays,
            title: 'جدول المواعيد والتقويم الذكي التفاعلي',
            englishTitle: 'Smart Visual Calendar & Conflict-Free Booking',
            problem: 'تداخل المواعيد وضياع وقت العميلات والارتباك الناتج عن الجداول الورقية أو الرسائل المتفرقة.',
            benefit: 'تنظيم آلي يمنع الحجز المزدوج تمامًا، مع توزيع المواعيد على الأخصائيات وحساب أوقات التنظيف بين الجلسات.',
            layoutReverse: false,
            tone: 'bg-[#F0C5AE]',
            mockup: {
              title: 'جدول مواعيد اليوم المباشر',
              badge: 'محدّث لحظيًا',
              items: [
                {
                  client: 'مِيلا',
                  service: 'صبغة وتصفيف',
                  specialist: 'سارة',
                  time: '10:00 ص',
                  status: 'مؤكد',
                  statusTone: 'bg-[#91B8C0]/30 text-[#2C4349]',
                },
                {
                  client: 'سلمى',
                  service: 'مانيكير وباديكير',
                  specialist: 'لمى',
                  time: '11:30 ص',
                  status: 'جاري الآن',
                  statusTone: 'bg-[#F0C5AE] text-[#54453D] font-bold',
                },
                {
                  client: 'داليا',
                  service: 'جلسة كيراتين',
                  specialist: 'نور',
                  time: '01:00 م',
                  status: 'قادم',
                  statusTone: 'bg-white text-[#75645B]',
                },
              ],
            },
          },
          {
            id: 'feat-pos',
            number: '02',
            icon: Receipt,
            title: 'كاشير نقاط البيع السريع والفوترة الضريبية المبسطة',
            englishTitle: 'High-Speed Cloud POS & ZATCA-Compliant Invoicing',
            problem: 'طوابير الانتظار عند المحاسبة وقت الذروة، وصعوبة تجزئة الدفع، ومخاوف عدم الامتثال لمتطلبات هيئة الزكاة.',
            benefit: 'إنهاء المعاملة في ثوانٍ معدودة، ودعم الدفع المقسم (شبكة + كاش)، وإصدار فوري لفاتورة ضريبية مبسطة مع رمز QR.',
            layoutReverse: true,
            tone: 'bg-[#CADEE2]',
            mockup: {
              title: 'فاتورة ضريبية مبسطة #24071',
              badge: 'متوافق مع هيئة الزكاة (ZATCA)',
              details: [
                { label: 'الخدمة الأساسية', val: 'صبغة شعر وتصفيف (304.35 ر.س)' },
                { label: 'ضريبة القيمة المضافة (15%)', val: '45.65 ر.س' },
                { label: 'الإجمالي الشامل للضريبة', val: '350.00 ر.س' },
                { label: 'طريقة السداد', val: 'دفع مجزأ: 200 ر.س مدى + 150 ر.س نقدًا' },
              ],
            },
          },
          {
            id: 'feat-crm',
            number: '03',
            icon: UserRound,
            title: 'ملف العميل المتكامل وتوثيق تركيبات الصبغة',
            englishTitle: 'Client CRM & Precision Formula History',
            problem: 'نسيان درجات ألوان الصبغة وملاحظات الحساسية والتفضيلات السابقة، مما يقلل من جودة التجربة ورضا العميلة.',
            benefit: 'سجل رقمي دائم يوثق تاريخ الجلسات والتركيبات بدقة، لتقديم نفس النتيجة المبهرة في كل زيارة وبناء ولاء مستمر.',
            layoutReverse: false,
            tone: 'bg-[#FAF9F8]',
            mockup: {
              title: 'الملف الفني للعميلة: مِيلا',
              badge: 'عميلة دائمة · 8 زيارات',
              details: [
                { label: 'الأخصائية المفضلة', val: 'سارة (قسم الشعر والعناية)' },
                { label: 'تركيبة الصبغة المعتمدة', val: 'Ash Blonde #8.1 مع أوكسجين 20Vol' },
                { label: 'ملاحظة خاصة', val: 'تفضل القهوة بدون سكر وماء فاتر أثناء الغسيل' },
                { label: 'إجمالي المشتريات', val: '2,800 ر.س خلال آخر 6 أشهر' },
              ],
            },
          },
          {
            id: 'feat-commissions',
            number: '04',
            icon: Percent,
            title: 'أتمتة عمولات وحوافز الأخصائيات بنزاهة وشفافية',
            englishTitle: 'Automated Specialist Commissions & Incentives',
            problem: 'الخلافات المستمرة والوقت الطويل الضائع نهاية كل شهر في حساب نسب العمولات يدويًا عبر دفاتر أو ملفات إكسل.',
            benefit: 'احتساب فوري وتلقائي لعمولة كل أخصائية على الخدمات ومبيعات المنتجات، مع كشوفات واضحة تزيد التحفيز والإنتاجية.',
            layoutReverse: true,
            tone: 'bg-[#F0C5AE]',
            mockup: {
              title: 'عمولات الأخصائيات لهذا الأسبوع',
              badge: 'إجمالي العمولات: 8,920 ر.س',
              bars: [
                { name: 'سارة', pct: '35%', val: '3,122 ر.س' },
                { name: 'لمى', pct: '28%', val: '2,497 ر.س' },
                { name: 'نور', pct: '22%', val: '1,962 ر.س' },
                { name: 'ريم', pct: '15%', val: '1,339 ر.س' },
              ],
            },
          },
          {
            id: 'feat-online',
            number: '05',
            icon: Globe,
            title: 'الموقع الإلكتروني الخاص وبوابة الحجز الذاتي 24/7',
            englishTitle: 'Custom Salon Website & 24/7 Self-Service Booking',
            problem: 'تفويت مكالمات الحجز خارج ساعات العمل وانشغال موظف الاستقبال المستمر بالرد على استفسارات الأسعار والمواعيد.',
            benefit: 'واجهة حجز إلكترونية بهوية صالونك تستقبل حجوزات العميلات المؤكدة على مدار الساعة وترتبط بالتقويم فورًا.',
            layoutReverse: false,
            tone: 'bg-[#91B8C0]/30',
            mockup: {
              title: 'واجهة حجز العميلة عبر الجوال',
              badge: 'حجز مباشر ومؤكد',
              details: [
                { label: 'الخدمة المختارة', val: 'صبغة وتصفيف شعر' },
                { label: 'الموعد المتاح', val: 'الخميس 12 نوفمبر · 10:00 ص' },
                { label: 'الأخصائية', val: 'سارة (متوفرة في هذا الموعد)' },
                { label: 'السعر النهائي', val: '350 ر.س (شامل الضريبة)' },
              ],
            },
          },
        ],
      }
    : {
        eyebrow: 'Core Feature Deep Dive',
        title: 'Precision Tools Addressing Real Salon Operational Challenges',
        subtitle:
          'Explore 5 key operational capabilities engineered to resolve day-to-day salon bottlenecks and unlock tangible efficiency and profitability.',
        showcases: [
          {
            id: 'feat-calendar',
            number: '01',
            icon: CalendarDays,
            title: 'Smart Visual Calendar & Conflict-Free Booking',
            englishTitle: 'Automated Schedule Engine',
            problem: 'Double bookings, chaotic client waiting times, and human scheduling errors from manual notebooks or fragmented chats.',
            benefit: 'Flawless automated coordination eliminating double bookings, distributing appointments across staff, and allocating sanitation buffers.',
            layoutReverse: false,
            tone: 'bg-[#F0C5AE]',
            mockup: {
              title: 'Live Today Appointments Lineup',
              badge: 'Real-Time Sync',
              items: [
                {
                  client: 'Mila',
                  service: 'Hair Dye & Styling',
                  specialist: 'Sarah',
                  time: '10:00 AM',
                  status: 'Confirmed',
                  statusTone: 'bg-[#91B8C0]/30 text-[#2C4349]',
                },
                {
                  client: 'Salma',
                  service: 'Manicure & Pedicure',
                  specialist: 'Lama',
                  time: '11:30 AM',
                  status: 'In Progress',
                  statusTone: 'bg-[#F0C5AE] text-[#54453D] font-bold',
                },
                {
                  client: 'Dalia',
                  service: 'Keratin Treatment',
                  specialist: 'Nour',
                  time: '01:00 PM',
                  status: 'Upcoming',
                  statusTone: 'bg-white text-[#75645B]',
                },
              ],
            },
          },
          {
            id: 'feat-pos',
            number: '02',
            icon: Receipt,
            title: 'High-Speed Cloud POS & ZATCA-Compliant Invoicing',
            englishTitle: 'Fast Checkout & Simplified Tax Invoices',
            problem: 'Long checkout bottlenecks during peak hours, inability to split bills, and statutory compliance risks.',
            benefit: 'Instant payment completion in seconds, multi-tender split payments (card + cash), and automated ZATCA QR tax invoices.',
            layoutReverse: true,
            tone: 'bg-[#CADEE2]',
            mockup: {
              title: 'Simplified Tax Invoice #24071',
              badge: 'ZATCA Phase 1 Compliant',
              details: [
                { label: 'Core Service', val: 'Hair Dye & Styling (304.35 SAR)' },
                { label: 'Value Added Tax (15%)', val: '45.65 SAR' },
                { label: 'Total Tax-Inclusive', val: '350.00 SAR' },
                { label: 'Payment Method', val: 'Split: 200 SAR Mada + 150 SAR Cash' },
              ],
            },
          },
          {
            id: 'feat-crm',
            number: '03',
            icon: UserRound,
            title: 'Client CRM & Precision Formula History',
            englishTitle: 'Permanent Formula & Treatment Archive',
            problem: 'Forgetting exact hair dye mixtures, skin sensitivities, and past client preferences, degrading service quality and retention.',
            benefit: 'A permanent digital record preserving color formulas and visit timelines, ensuring consistent results that keep clients coming back.',
            layoutReverse: false,
            tone: 'bg-[#FAF9F8]',
            mockup: {
              title: 'Client Profile: Mila',
              badge: 'VIP Client · 8 Visits',
              details: [
                { label: 'Preferred Specialist', val: 'Sarah (Hair Styling Department)' },
                { label: 'Color Formula', val: 'Ash Blonde #8.1 with 20Vol Developer' },
                { label: 'Special Preference', val: 'Prefers black coffee & lukewarm wash' },
                { label: 'Total Spend', val: '2,800 SAR in past 6 months' },
              ],
            },
          },
          {
            id: 'feat-commissions',
            number: '04',
            icon: Percent,
            title: 'Automated Specialist Commissions & Incentives',
            englishTitle: 'Transparent Real-Time Commission Engine',
            problem: 'Endless staff disputes and lost hours reconciling complex commission formulas on manual spreadsheets at month-end.',
            benefit: 'Instant, transparent calculation of staff payouts on both services and retail product sales, boosting team morale and output.',
            layoutReverse: true,
            tone: 'bg-[#F0C5AE]',
            mockup: {
              title: 'This Week Specialist Commissions',
              badge: 'Total Payouts: 8,920 SAR',
              bars: [
                { name: 'Sarah', pct: '35%', val: '3,122 SAR' },
                { name: 'Lama', pct: '28%', val: '2,497 SAR' },
                { name: 'Nour', pct: '22%', val: '1,962 SAR' },
                { name: 'Reem', pct: '15%', val: '1,339 SAR' },
              ],
            },
          },
          {
            id: 'feat-online',
            number: '05',
            icon: Globe,
            title: 'Custom Salon Website & 24/7 Self-Service Booking',
            englishTitle: 'Branded Storefront & Direct Online Booking',
            problem: 'Missed calls outside operating hours and reception staff perpetually overwhelmed answering routine price and time queries.',
            benefit: 'A dedicated web booking storefront with your salon brand taking confirmed bookings 24/7 and syncing instantly to your calendar.',
            layoutReverse: false,
            tone: 'bg-[#91B8C0]/30',
            mockup: {
              title: 'Client Mobile Booking Experience',
              badge: 'Instant Confirmation',
              details: [
                { label: 'Selected Service', val: 'Hair Dye & Professional Styling' },
                { label: 'Available Slot', val: 'Thursday Nov 12 · 10:00 AM' },
                { label: 'Specialist', val: 'Sarah (Available)' },
                { label: 'Total Price', val: '350 SAR (VAT Inclusive)' },
              ],
            },
          },
        ],
      };

  return (
    <section
      id="detailed-showcase"
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

        {/* Feature Showcases Stack */}
        <div className="mt-14 sm:mt-20 space-y-12 sm:space-y-16">
          {sectionContent.showcases.map((feat) => {
            const Icon = feat.icon;
            return (
              <article
                key={feat.id}
                className="overflow-hidden rounded-3xl bg-white p-6 sm:p-10 lg:p-12 transition-colors duration-200"
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                    feat.layoutReverse ? 'lg:grid-flow-dense' : ''
                  }`}
                >
                  {/* Left / Text Side */}
                  <div
                    className={`space-y-5 lg:col-span-6 ${
                      feat.layoutReverse ? 'lg:col-start-7' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feat.tone} text-[#54453D]`}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-sm font-bold text-[#C78360]">
                        {feat.number}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#54453D]">
                      {feat.title}
                    </h3>

                    {/* Problem Solved */}
                    <div className="rounded-2xl bg-[#FAF9F8] p-4 text-start">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-[#C78360] shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                          <span className="text-xs font-bold text-[#C78360] block">
                            {isAr ? 'المشكلة السابقة في الصالون:' : 'The Previous Challenge:'}
                          </span>
                          <p className="mt-1 text-xs sm:text-sm text-[#75645B] leading-relaxed">
                            {feat.problem}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Operational Benefit */}
                    <div className="rounded-2xl bg-[#FAF9F8] p-4 text-start">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                          <span className="text-xs font-bold text-[#16A34A] block">
                            {isAr ? 'الفائدة المباشرة مع راش إكس:' : 'The RASHX Advantage:'}
                          </span>
                          <p className="mt-1 text-xs sm:text-sm text-[#54453D] font-semibold leading-relaxed">
                            {feat.benefit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right / Visual Preview Side */}
                  <div
                    className={`lg:col-span-6 ${
                      feat.layoutReverse ? 'lg:col-start-1' : ''
                    }`}
                  >
                    <div className="rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 text-[#54453D]">
                      <div className="flex items-center justify-between gap-2 pb-4">
                        <span className="text-sm font-bold text-[#54453D]">
                          {feat.mockup.title}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-[0.7rem] font-bold text-[#2C4349]">
                          {feat.mockup.badge}
                        </span>
                      </div>

                      {/* Mockup Type A: Schedule Items */}
                      {feat.mockup.items && (
                        <div className="space-y-3 pt-2">
                          {feat.mockup.items.map((slot) => (
                            <div
                              key={slot.time + slot.client}
                              className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3.5 sm:p-4 text-xs sm:text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-[#C78360]">
                                  {slot.time}
                                </span>
                                <div>
                                  <p className="font-bold text-[#54453D]">{slot.client}</p>
                                  <span className="text-xs text-[#75645B]">
                                    {slot.service} · {slot.specialist}
                                  </span>
                                </div>
                              </div>
                              <span className={`rounded-lg px-2.5 py-1 text-xs ${slot.statusTone}`}>
                                {slot.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Mockup Type B: Key-Value Details */}
                      {feat.mockup.details && (
                        <div className="space-y-2.5 pt-2">
                          {feat.mockup.details.map((row) => (
                            <div
                              key={row.label}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-2xl bg-white p-3.5 text-xs sm:text-sm"
                            >
                              <span className="font-semibold text-[#75645B]">{row.label}</span>
                              <span className="font-bold text-[#54453D] text-start sm:text-end">
                                {row.val}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Mockup Type C: Commission Progress Bars */}
                      {feat.mockup.bars && (
                        <div className="space-y-3.5 pt-2">
                          {feat.mockup.bars.map((bar) => (
                            <div key={bar.name} className="rounded-2xl bg-white p-3.5 space-y-2">
                              <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                                <span className="text-[#54453D]">{bar.name}</span>
                                <span className="text-[#C78360]">{bar.val} ({bar.pct})</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-[#FAF9F8] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#F0C5AE]"
                                  style={{ width: bar.pct }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
