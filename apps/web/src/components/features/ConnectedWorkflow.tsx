import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Scissors,
  CalendarCheck,
  Smartphone,
  Sparkles,
  Receipt,
  TrendingUp,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface ConnectedWorkflowProps {
  lang: Lang;
  className?: string;
}

export function ConnectedWorkflow({ lang, className }: ConnectedWorkflowProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'دورة العمل التشغيلية المترابطة',
        title: 'كيف تترابط وظائف راش إكس في يوم عمل حقيقي؟',
        subtitle:
          'رحلة سلسة ومتماسكة تبدأ من إعداد الخدمة في النظام وحتى إيداع الإيراد وحساب العمولة، دون تكرار إدخال البيانات أو استخدام أوراق متناثرة.',
        steps: [
          {
            number: '01',
            icon: Scissors,
            title: 'إعداد الخدمة والتسعير',
            desc: 'تحديد اسم الخدمة، وتكلفتها، ومدة تنفيذها، وتعيين الأخصائيات المؤهلات لتقديمها داخل المنشأة.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            number: '02',
            icon: CalendarCheck,
            title: 'إتاحة الفترات في التقويم',
            desc: 'انعكاس أوقات العمل والورديات تلقائيًا في التقويم، مع تخصيص فترات تنظيف وتجهيز بين كل موعد وآخر.',
            tone: 'bg-[#91B8C0]/30',
          },
          {
            number: '03',
            icon: Smartphone,
            title: 'استقبال وتأكيد الحجز',
            desc: 'حجز العميلة عبر الرابط الإلكتروني أو كاونتر الاستقبال، مع تثبيت الموعد ومنع أي حجز مزدوج لنفس الأخصائية.',
            tone: 'bg-[#CADEE2]',
          },
          {
            number: '04',
            icon: Sparkles,
            title: 'تنفيذ الخدمة وتحديث الحالة',
            desc: 'دخول العميلة، واطلاع الأخصائية على ملاحظات الصبغات السابقة، وتحديث حالة الزيارة إلى (جاري) ثم (مكتمل).',
            tone: 'bg-[#FAF9F8]',
          },
          {
            number: '05',
            icon: Receipt,
            title: 'المحاسبة والفوترة الضريبية',
            desc: 'تسجيل عملية البيع على الكاشير، وخصم المواد المستهلكة من المخزن، وإصدار الفاتورة الضريبية برمز الاستجابة (QR).',
            tone: 'bg-[#F0C5AE]',
          },
          {
            number: '06',
            icon: TrendingUp,
            title: 'تحديث التقارير والعمولات فوريًا',
            desc: 'انعكاس العملية لحظيًا في إجمالي مبيعات اليوم، وإضافة نسبة العمولة المستحقة لرصيد الأخصائية دون حسابات يدوية.',
            tone: 'bg-[#91B8C0]/30',
          },
        ],
      }
    : {
        eyebrow: 'Connected Operational Lifecycle',
        title: 'How RASHX Features Connect in a Real Business Day',
        subtitle:
          'A seamless, automated sequence from initial service setup to final invoice and commission calculation—with zero duplicate entries or scattered paper trails.',
        steps: [
          {
            number: '01',
            icon: Scissors,
            title: 'Define Service & Pricing',
            desc: 'Configure service titles, rates, duration, and assign qualified specialists qualified for delivery.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            number: '02',
            icon: CalendarCheck,
            title: 'Open Calendar Availability',
            desc: 'Operating rosters automatically populate available slots with preparation and cleanup buffers.',
            tone: 'bg-[#91B8C0]/30',
          },
          {
            number: '03',
            icon: Smartphone,
            title: 'Receive & Confirm Booking',
            desc: 'Client books online or via reception, immediately locking the time slot and preventing double bookings.',
            tone: 'bg-[#CADEE2]',
          },
          {
            number: '04',
            icon: Sparkles,
            title: 'Execute Service & Log Formulas',
            desc: 'Stylist inspects client history, executes treatment, records formula notes, and marks appointment completed.',
            tone: 'bg-[#FAF9F8]',
          },
          {
            number: '05',
            icon: Receipt,
            title: 'Checkout & Tax Invoicing',
            desc: 'Fast POS payment, automatic backbar stock deduction, and instant issuance of a ZATCA QR simplified invoice.',
            tone: 'bg-[#F0C5AE]',
          },
          {
            number: '06',
            icon: TrendingUp,
            title: 'Live Reports & Payout Update',
            desc: 'Daily revenue instantly increases, and the specialist’s commission balance updates automatically.',
            tone: 'bg-[#91B8C0]/30',
          },
        ],
      };

  return (
    <section
      id="workflow"
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

        {/* 6-Step Workflow Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sectionContent.steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.number}
                className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 transition-colors duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${st.tone} text-[#54453D]`}
                    >
                      <Icon className="h-6 w-6 text-[#54453D]" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-base font-bold text-[#C78360]">
                      {st.number}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#54453D]">
                    {st.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                    {st.desc}
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

