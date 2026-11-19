import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Languages,
  BadgePercent,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface SaudiComplianceProps {
  lang: Lang;
  className?: string;
}

export function SaudiCompliance({ lang, className }: SaudiComplianceProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'الامتثال المحلي والفوترة الإلكترونية',
        title: 'جاهزية تامة للسوق السعودي ومعايير هيئة الزكاة والضريبة والجمارك.',
        subtitle:
          'صُممت راش إكس منذ السطر الأول لتتوافق تمامًا مع متطلبات قطاع الأعمال في المملكة العربية السعودية ومعايير الفوترة الإلكترونية المعتمدة.',
        cards: [
          {
            icon: QrCode,
            title: 'الفاتورة الضريبية المبسطة ورمز الاستجابة السريع (QR)',
            badge: 'المرحلة الأولى · جاهزية كاملة',
            description:
              'إصدار فوري للفواتير الضريبية المبسطة متضمنة كافة الحقول الإلزامية ورمز الاستجابة السريع المشفر (TLV Base64 QR Code) المتوافق مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).',
            features: [
              'رمز QR مشفر وفق معايير هيئة الزكاة (TLV)',
              'إدراج الرقم الضريبي للمنشأة واسمها التجاري',
              'تاريخ ووقت الإصدار وإجمالي الضريبة بدقة',
              'طباعة فورية أو إرسال رقمي عبر الرسائل للعميلة',
            ],
            tone: 'bg-[#F0C5AE]/30',
          },
          {
            icon: ShieldCheck,
            title: 'الجاهزية الهندسية لمرحلة الربط والتكامل (المرحلة الثانية)',
            badge: 'المرحلة الثانية · جاهزية معمارية',
            description:
              'بنية برمجية مهيأة تقنيًا لدعم الربط والتكامل مع منصة (فاتورة) وفق الموجات المعتمدة من الهيئة، عبر تجهيز المعرفات الفريدة (UUID)، وسلاسل التشفير، وصيغ التبادل القياسية.',
            features: [
              'توليد المعرفات الفريدة العالمية (UUID) لكل فاتورة',
              'هيكلة الحقول والبيانات المالية المتوافقة مع متطلبات الربط',
              'سجلات تدقيق غير قابلة للتعديل أو التلاعب',
              'بنية تحتية مرنة للتكامل عبر واجهات البرمجة (APIs)',
            ],
            tone: 'bg-[#91B8C0]/25',
          },
          {
            icon: BadgePercent,
            title: 'حساب ضريبة القيمة المضافة (15% VAT)',
            badge: 'أتمتة الحسابات الضريبية',
            description:
              'احتساب آلي دقيق لنسبة ضريبة القيمة المضافة على مستوى كل خدمة أو منتج مع إيضاح المبلغ قبل الضريبة وقيمة الضريبة وإجمالي الفاتورة بوضوح تام.',
            features: [
              'فصل واضح للضريبة في كل بند من بنود الفاتورة',
              'تقارير دورية لإجمالي المبيعات وقيمة الضريبة المستحقة',
              'دعم الإعفاءات أو التسعير الشامل للضريبة',
              'سهولة استخراج البيانات للإقرار الضريبي الربع سنوي',
            ],
            tone: 'bg-[#FAF9F8]',
          },
          {
            icon: Languages,
            title: 'الملاءمة التشغيلية والثقافية للسوق السعودي',
            badge: 'تجربة محلية أصيلة',
            description:
              'نظام ناطق بالعربية كلغة أساسية أولى، مع دعم تنسيق أرقام الجوال السعودية (+966)، والتوافق مع التقويمين الهجري والميلادي، ومراعاة جداول عطلات نهاية الأسبوع المحلية.',
            features: [
              'واجهة عربية أصيلة مصممة لراحة المستخدم المحلي',
              'التحقق التلقائي من صحة أرقام الجوال السعودية',
              'مراعاة عطلات نهاية الأسبوع وساعات العمل الخاصة',
              'دعم كامل للغة الإنجليزية لطواقم العمل متعددة الجنسيات',
            ],
            tone: 'bg-[#FAF9F8]',
          },
        ],
        commitmentBox: {
          title: 'شفافية والتزام بالأنظمة الرسمية',
          text:
            'تلتزم راش إكس بتقديم معلومات تقنية موثقة دون أي ادعاءات غير مثبتة؛ نظام الفوترة يولد فواتير المرحلة الأولى المعتمدة بالكامل، والبنية التحتية مصممة للربط مع متطلبات المرحلة الثانية فور حلول مواعيد الإلزام للمنشأة.',
        },
      }
    : {
        eyebrow: 'Local Compliance & E-Invoicing',
        title: 'Tailored for Saudi Regulations & ZATCA Standards.',
        subtitle:
          'RASHX was engineered from day one to strictly comply with Saudi business regulations and official ZATCA electronic invoicing mandates.',
        cards: [
          {
            icon: QrCode,
            title: 'Simplified Tax Invoices & Encrypted QR Codes',
            badge: 'Phase 1 · Fully Compliant',
            description:
              'Instant issuance of Simplified Tax Invoices featuring all mandatory statutory fields and cryptographic TLV Base64 QR codes adhering strictly to ZATCA regulations.',
            features: [
              'ZATCA-compliant cryptographic TLV Base64 QR code',
              'Automated display of VAT registration and commercial name',
              'Accurate timestamp and segregated tax calculations',
              'Instant thermal receipt printing or digital SMS dispatch',
            ],
            tone: 'bg-[#F0C5AE]/30',
          },
          {
            icon: ShieldCheck,
            title: 'Architectural Readiness for Integration & Clearance',
            badge: 'Phase 2 · Architecturally Prepared',
            description:
              'A robust software architecture prepared for integration with the FATOORAH platform across applicable enforcement waves, featuring UUID generation and audit-proof schemas.',
            features: [
              'Universal Unique Identifier (UUID) generation per invoice',
              'Standardized payload structures prepared for clearance APIs',
              'Immutable, tamper-evident audit logs and transaction sequence',
              'Seamless integration path for future enforcement waves',
            ],
            tone: 'bg-[#91B8C0]/25',
          },
          {
            icon: BadgePercent,
            title: 'Automated 15% VAT Tax Calculations',
            badge: 'Automated Tax Engine',
            description:
              'Precise automated calculation of the 15% Value Added Tax on each service and product item, with transparent line-item itemization.',
            features: [
              'Clear separation of subtotal, tax amount, and total bill',
              'Exportable tax summaries for quarterly VAT filings',
              'Support for tax-inclusive and tax-exclusive pricing',
              'Zero manual calculation errors for salon staff',
            ],
            tone: 'bg-[#FAF9F8]',
          },
          {
            icon: Languages,
            title: 'Saudi Cultural & Operational Alignment',
            badge: 'Native Saudi Experience',
            description:
              'Engineered with Arabic as the primary interface language, validated GCC / Saudi phone format (+966 5X), dual Hijri/Gregorian dates, and local weekend scheduling.',
            features: [
              'Native Arabic interface crafted for local salon workflows',
              'Automated validation for Saudi mobile phone numbers',
              'Support for local weekend schedules and prayer breaks',
              'Full bilingual English toggle for multinational salon crews',
            ],
            tone: 'bg-[#FAF9F8]',
          },
        ],
        commitmentBox: {
          title: 'Transparency & Regulatory Integrity',
          text:
            'RASHX adheres to strictly verified technical facts without exaggerated claims. The system generates compliant Phase 1 invoices today, and is architected for Phase 2 integration as enforcement rollout schedules dictate.',
        },
      };

  return (
    <section
      id="saudi-compliance"
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

        {/* 4 Compliance Bento Cards */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {sectionContent.cards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 lg:p-10 transition-colors duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone} text-[#54453D]`}
                    >
                      <Icon className="h-6 w-6 text-[#C78360]" aria-hidden="true" />
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#54453D]">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl sm:text-2xl font-bold text-[#54453D]">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#75645B]">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 space-y-2.5">
                  <ul className="space-y-2 text-xs sm:text-sm text-[#54453D]">
                    {card.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* Regulatory Commitment Box */}
        <div className="mt-10 sm:mt-14 rounded-3xl bg-[#FAF9F8] p-6 sm:p-8 text-[#54453D]">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16A34A]/15 text-[#16A34A]">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-[#54453D]">
                {sectionContent.commitmentBox.title}
              </h4>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#75645B]">
                {sectionContent.commitmentBox.text}
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
