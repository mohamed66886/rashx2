import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Sparkles,
  Globe,
  Palette,
  Users,
  Lock,
  CheckCircle2,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface WhiteLabelSectionProps {
  lang: Lang;
  className?: string;
}

export function WhiteLabelSection({ lang, className }: WhiteLabelSectionProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'الهوية والتخصيص المستقل (White-Labeling)',
        title: 'هوية منشأتك أولًا، وتقنية راش إكس في الخلفية.',
        subtitle:
          'لا نضع علامتنا فوق علامتك؛ تمنح راش إكس كل صالون حضورًا رقميًا مستقلًا يعكس هويته البصرية الراقية، ليبقى عملاؤك على اتصال مباشر بك دون وسيط يروج لمنافسيك.',
        pillars: [
          {
            icon: Globe,
            title: 'نطاق رقمي مخصص للمنشأة',
            description:
              'يحصل كل صالون على رابط وبوابة خاصة مثل (salon.rashx.org) مع جاهزية الربط بنطاقك المخصص، مما يرسخ حضورك الرقمي الاحترافي.',
            badge: 'نطاق فرعي مستقل',
          },
          {
            icon: Palette,
            title: 'ألوان وشعار المنشأة الكامل',
            description:
              'تخصيص كامل لواجهة العميل ولوحة التحكم بشعار صالونك الرسمي وألوانك المعتمدة وقائمة خدماتك بصورها الاحترافية.',
            badge: 'هوية متطابقة 100%',
          },
          {
            icon: Users,
            title: 'علاقة مباشرة ومحمية مع عميلاتك',
            description:
              'عملاؤك ملك لمنشأتك وحدك؛ لا وجود لدليل عام يروج لمراكز تجميل منافسة بجوار اسمك أو يفرض عمولات وسيط على حجوزاتك.',
            badge: 'ملكية تامة للعملاء',
          },
          {
            icon: Lock,
            title: 'استقلالية رقمية وبيانات مشفرة',
            description:
              'تتمتع كل منشأة ببيئة عمل خاصة ومفصولة تمامًا، تضمن سرية الأسعار وأرقام المبيعات وقوائم العملاء تحت أعلى معايير الخصوصية.',
            badge: 'خصوصية مؤسسية',
          },
        ],
        mockupBox: {
          title: 'تجربة رقمية فريدة تُميز اسم صالونك في السوق',
          points: [
            'رابط مباشر للحجز يمكنك وضعه في بايو الإنستغرام وتيك توك',
            'إشعارات وتأكيدات تحمل اسم وهوية الصالون الرسمية',
            'فاتورة ضريبية إلكترونية موثقة باسم وسجل منشأتك التجاري',
          ],
        },
      }
    : {
        eyebrow: 'White-Labeling & Brand Customization',
        title: 'Your Brand in Front, RASHX Technology Powering Behind.',
        subtitle:
          'We never place our logo over your brand. RASHX equips each salon with an independent digital presence embodying its refined aesthetic, so your clients remain directly connected to you without intermediaries.',
        pillars: [
          {
            icon: Globe,
            title: 'Dedicated Salon Subdomain',
            description:
              'Every facility receives a dedicated web portal (e.g. salon.rashx.org) ready for custom domain mapping, solidifying your professional digital presence.',
            badge: 'Dedicated Subdomain',
          },
          {
            icon: Palette,
            title: 'Custom Brand Colors & Logos',
            description:
              'Comprehensive styling across customer-facing interfaces with your official logo, brand color accents, and customized service photography.',
            badge: '100% Brand Identity',
          },
          {
            icon: Users,
            title: 'Direct Client Relationships',
            description:
              'Your clients belong solely to your salon. No open public directories advertising competing salons next to your name, and zero middleman booking commissions.',
            badge: 'Direct Client Retention',
          },
          {
            icon: Lock,
            title: 'Digital Independence & Private Ledgers',
            description:
              'Each business operates within an isolated, private workspace ensuring confidentiality of sales volumes, client contacts, and proprietary formulas.',
            badge: 'Enterprise Privacy',
          },
        ],
        mockupBox: {
          title: 'A Distinguished Digital Experience Reinforcing Your Salon Name',
          points: [
            'Direct booking link tailored for your Instagram bio and TikTok profile',
            'SMS notifications and confirmations carrying your salon brand name',
            'Simplified tax invoices stamped with your business and VAT details',
          ],
        },
      };

  return (
    <section
      id="white-label"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
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

        {/* 4 Pillars Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sectionContent.pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-6 sm:p-7 transition-colors duration-200"
              >
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#54453D]">
                    <Icon className="h-6 w-6 text-[#C78360]" aria-hidden="true" />
                  </div>

                  <span className="mt-4 inline-block text-[0.7rem] font-bold uppercase tracking-wider text-[#75645B]">
                    {pillar.badge}
                  </span>

                  <h3 className="mt-1 text-lg sm:text-xl font-bold text-[#54453D]">
                    {pillar.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Showcase Banner */}
        <div className="mt-10 sm:mt-14 rounded-3xl bg-[#FAF9F8] p-6 sm:p-10 lg:p-12 text-[#54453D]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12">
            <div className="max-w-xl text-start">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C78360]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>{isAr ? 'تميز تنافسي لمنشأتك' : 'Competitive Advantage'}</span>
              </span>
              <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-[#54453D]">
                {sectionContent.mockupBox.title}
              </h3>
            </div>

            <div className="w-full lg:w-auto space-y-3">
              {sectionContent.mockupBox.points.map((pt) => (
                <div
                  key={pt}
                  className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 transition-colors duration-200"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#16A34A] shrink-0" aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-semibold text-[#54453D]">
                    {pt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
