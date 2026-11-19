'use client';

import { useState } from 'react';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ChevronDown, HelpCircle } from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface PricingFAQProps {
  lang: Lang;
  className?: string;
}

export function PricingFAQ({ lang, className }: PricingFAQProps) {
  const isAr = lang === 'ar';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const sectionContent = isAr
    ? {
        eyebrow: 'الأسئلة الشائعة حول الاشتراكات',
        title: 'إجابات واضحة ومباشرة عن باقات RASHX',
        subtitle:
          'إجابات مستندة إلى سياسات التشغيل والأنظمة المعتمدة في راش إكس لضمان شفافية كاملة قبل اتخاذ قرار الاشتراك.',
        items: [
          {
            q: 'كيف يتم تحديد تكلفة اشتراك راش إكس لمنشأتي؟',
            a: 'يتم تحديد قيمة الاشتراك بناءً على دراسة دقيقة لاحتياج منشأتك، وعدد الأخصائيات ومقدمي الخدمة، وطبيعة العمليات المطلوبة، مما يضمن حصولك على القيمة التشغيلية المناسبة لصالونك دون أي تكاليف مجهولة أو مبالغ فيها.',
          },
          {
            q: 'هل يتضمن الاشتراك التوافق مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA)؟',
            a: 'نعم؛ تتضمن كافة باقات راش إكس إصدار الفواتير الضريبية المبسطة الفورية مع رمز الاستجابة السريع المشفر (TLV Base64 QR Code) المتوافق بالكامل مع متطلبات المرحلة الأولى، مع جاهزية معمارية لمرحلة الربط والتكامل.',
          },
          {
            q: 'هل يشمل الاشتراك تدريب طاقم العمل وتجهيز قائمة الخدمات؟',
            a: 'نعم؛ يتضمن الاشتراك جلسات إعداد تقني متكاملة لتهيئة خدمات الصالون، وأسعاره، وفترات التنفيذ، وتدريب مديري الصالون وموظفي الاستقبال والأخصائيات لضمان بداية تشغيلية سلسة منذ اليوم الأول.',
          },
          {
            q: 'هل يمكنني الترقية أو إضافة فروع جديدة مستقبلاً؟',
            a: 'بالتأكيد؛ بُنيت منصة راش إكس بهندسة مؤسسية مرنة تتيح التدرج والترقية الفورية عند نمو أعمالك، سواءً بإضافة موظفات جدد أو تفعيل إدارة فروع متعددة دون أي توقف في سير أعمالك اليومية.',
          },
          {
            q: 'كيف يمكنني البدء وتفعيل المنظومة لصالوني؟',
            a: 'يمكنك التواصل مباشرة مع فريقنا عبر البريد الإلكتروني أو طلب استشارة، حيث يقوم مستشار متخصص بجدولة عرض تجريبي حي لاحتياجات صالونك وبدء خطوات التهيئة والتفعيل فورًا.',
          },
        ],
      }
    : {
        eyebrow: 'Frequently Asked Questions',
        title: 'Clear & Transparent Answers Regarding RASHX Plans',
        subtitle:
          'Verified factual answers regarding subscription policies and onboarding procedures to ensure total clarity before making an investment.',
        items: [
          {
            q: 'How is the subscription price calculated for my facility?',
            a: 'Your subscription investment is calculated based on a detailed assessment of your facility size, staff headcount, and operational requirements, ensuring you pay only for the exact capabilities your salon requires.',
          },
          {
            q: 'Is ZATCA e-invoicing compliance included in all plans?',
            a: 'Yes; all RASHX plans natively include instant Simplified Tax Invoice issuance with cryptographic TLV Base64 QR codes fully compliant with ZATCA Phase 1 mandates, alongside architectural readiness for Phase 2.',
          },
          {
            q: 'Does onboarding include staff training and service catalog configuration?',
            a: 'Yes; every subscription includes dedicated onboarding sessions to configure your service catalog, prices, turnaround durations, and provide hands-on training for receptionists and stylists.',
          },
          {
            q: 'Can I upgrade my plan or add new branches as my business expands?',
            a: 'Absolutely; RASHX is built on scalable enterprise architecture allowing seamless tier upgrades and multi-branch onboarding at any time without business disruption or downtime.',
          },
          {
            q: 'How do I get started and activate the platform for my salon?',
            a: 'You can contact our team directly or request a consultation. A dedicated specialist will arrange a live interactive demo tailored to your salon operations and initiate onboarding immediately.',
          },
        ],
      };

  return (
    <section
      id="pricing-faq"
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

        {/* FAQ Accordion Stack */}
        <div className="mt-12 sm:mt-16 mx-auto max-w-3xl space-y-4">
          {sectionContent.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl bg-[#FAF9F8] transition-colors duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91B8C0] focus-visible:ring-offset-2"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3 font-bold text-base sm:text-lg text-[#54453D]">
                    <HelpCircle className="h-5 w-5 text-[#C78360] shrink-0" aria-hidden="true" />
                    <span>{item.q}</span>
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#75645B] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm leading-relaxed text-[#75645B]">
                    <p className="pt-2">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
