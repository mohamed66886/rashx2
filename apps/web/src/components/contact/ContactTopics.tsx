import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Layers,
  CreditCard,
  MessageSquare,
  Handshake,
  HelpCircle,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface ContactTopicsProps {
  lang: Lang;
  className?: string;
}

export interface TopicItem {
  id: string;
  title: string;
  description: string;
  icon: typeof Layers;
}

export function ContactTopics({ lang, className }: ContactTopicsProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'مجالات الاستفسار',
        title: 'كيف يمكننا مساعدتك اليوم؟',
        subtitle:
          'صنفنا مواضيع الاستفسارات الأساسية لمساعدتك في الحصول على التوجيه والمعلومات الدقيقة التي تناسب احتياج منشأتك.',
        disclaimer:
          '* مواضيع الاستفسار أعلاه تهدف لتنظيم وتسهيل المتابعة، وليست دلالة على وجود أقسام أو إدارات مستقلة منفصلة.',
        topics: [
          {
            id: 'platform',
            title: 'معلومات المنصة',
            description:
              'استكشاف وحدات النظام السحابي، وآليات إدارة المواعيد ونقاط البيع، والربط التشغيلي.',
            icon: Layers,
          },
          {
            id: 'subscription',
            title: 'استفسارات الاشتراك',
            description:
              'التعرف على خيارات الاشتراك المتوفرة وملاءمتها لحجم أعمال صالونك وفروعه.',
            icon: CreditCard,
          },
          {
            id: 'support',
            title: 'الدعم الفني',
            description:
              'المساندة التقنية حول إعدادات الحساب وتهيئة بيئة العمل والواجهات الرقمية.',
            icon: MessageSquare,
          },
          {
            id: 'partnership',
            title: 'شراكات الأعمال',
            description:
              'فرص التعاون المهني والتكامل مع الموردين والمؤسسات العاملة في قطاع العناية والتجميل.',
            icon: Handshake,
          },
          {
            id: 'general',
            title: 'استفسارات عامة',
            description:
              'أي أسئلة إضافية حول راش إكس وكيفية تطوير تجربة منشأتك عبر التحول الرقمي.',
            icon: HelpCircle,
          },
        ] satisfies TopicItem[],
      }
    : {
        eyebrow: 'INQUIRY TOPICS',
        title: 'What Can We Help You With?',
        subtitle:
          'We have categorized primary inquiry topics to help you receive precise guidance tailored to your business needs.',
        disclaimer:
          '* These contact topics are intended to organize and guide inquiries, not to imply dedicated standalone corporate departments.',
        topics: [
          {
            id: 'platform',
            title: 'Platform Information',
            description:
              'Explore cloud architecture, booking management workflows, POS modules, and operational connectivity.',
            icon: Layers,
          },
          {
            id: 'subscription',
            title: 'Subscription Inquiries',
            description:
              'Learn about available subscription plans and their suitability for your salon structure and branch count.',
            icon: CreditCard,
          },
          {
            id: 'support',
            title: 'Technical Support',
            description:
              'Technical assistance regarding account setup, operational configuration, and platform interfaces.',
            icon: MessageSquare,
          },
          {
            id: 'partnership',
            title: 'Business Partnerships',
            description:
              'Collaboration opportunities and ecosystem integration for suppliers and beauty industry partners.',
            icon: Handshake,
          },
          {
            id: 'general',
            title: 'General Inquiries',
            description:
              'Any further questions regarding RASHX and advancing your salon journey through digital transformation.',
            icon: HelpCircle,
          },
        ] satisfies TopicItem[],
      };

  return (
    <section
      id="inquiry-topics"
      className={`relative bg-white py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <PageContainer size="full">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle
            eyebrow={sectionContent.eyebrow}
            title={sectionContent.title}
            align="center"
          />
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#75645B]">
            {sectionContent.subtitle}
          </p>
        </div>

        {/* Topics Grid (Flat Cards, Zero Borders, Zero Shadows) */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {sectionContent.topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <a
                key={topic.id}
                href="#contact-form"
                className="group rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 flex flex-col justify-between transition-colors duration-200 hover:bg-[#F0C5AE]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C78360]"
              >
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#C78360] transition-transform duration-200 group-hover:scale-105">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#54453D]">
                    {topic.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#75645B]">
                    {topic.description}
                  </p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Clarification Disclaimer */}
        <p className="mt-8 text-center text-xs text-[#75645B]/80 max-w-2xl mx-auto leading-relaxed">
          {sectionContent.disclaimer}
        </p>
      </PageContainer>
    </section>
  );
}
