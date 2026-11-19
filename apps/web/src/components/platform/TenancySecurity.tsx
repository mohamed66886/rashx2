import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import {
  Lock,
  Database,
  Server,
  KeyRound,
} from '@rashx/icons';
import type { Lang } from '@/lib/lang';

export interface TenancySecurityProps {
  lang: Lang;
  className?: string;
}

export function TenancySecurity({ lang, className }: TenancySecurityProps) {
  const isAr = lang === 'ar';

  const sectionContent = isAr
    ? {
        eyebrow: 'الأمان والبنية السحابية',
        title: 'عزل رقمي مستقل وأمان مؤسسي صارم.',
        subtitle:
          'بُنيت راش إكس على أسس معمارية مؤسسية تضمن فصل بيانات كل صالون تمامًا وحمايتها بأقوى بروتوكولات التشفير والتحكم في الوصول.',
        pillars: [
          {
            icon: Database,
            title: 'عزل منطقي كامل للمستأجرين (Tenant Isolation)',
            description:
              'تُفصل بيانات كل صالون وقوائم عملائه وسجلاته المالية منطقيًا على مستوى قاعدة البيانات مع معرّف مشفر لكل منشأة، مما يستحيل معه أي تداخل أو تسريب بين الصالونات.',
            badge: 'عزل بيانات 100%',
          },
          {
            icon: KeyRound,
            title: 'صلاحيات دقيقة بحسب الدور الوظيفي (Granular RBAC)',
            description:
              'منظومة أذونات تفصيلية تمنح كل مستخدم الصلاحية المناسبة لمهامه فقط؛ فلا يستطيع موظف الاستقبال الاطلاع على تقارير الأرباح، ولا تعديل نسب العمولات المحددة من الإدارة.',
            badge: 'حماية البيانات الحساسة',
          },
          {
            icon: Lock,
            title: 'تشفير شامل للبيانات أثناء النقل والاستقرار',
            description:
              'تشفير صارم لكافة الاتصالات عبر بروتوكول TLS 1.3 وتشفير البيانات الحساسة في السجلات عبر خوارزميات AES-256، مع تخزين كلمات المرور بتشفير غير قابل للاسترجاع.',
            badge: 'تشفير مؤسسي متقدم',
          },
          {
            icon: Server,
            title: 'بنية تحتية سحابية عالية الموثوقية والنسخ الاحتياطي',
            description:
              'استضافة على خوادم سحابية حديثة توفر جاهزية تشغيلية مستمرة (High Availability) مع نسخ احتياطي دوري آلي لضمان استمرارية أعمال صالونك دون أي توقف.',
            badge: 'استمرارية الأعمال 99.9%',
          },
        ],
        specifications: [
          { label: 'بروتوكول التشفير أثناء النقل', value: 'TLS 1.3 / HTTPS' },
          { label: 'تشفير البيانات المخزنة', value: 'AES-256 Standard' },
          { label: 'هندسة العزل الرقمي', value: 'Logical Multi-Tenant Isolation' },
          { label: 'سجلات المراجعة والتدقيق', value: 'Tamper-Evident Audit Trails' },
        ],
      }
    : {
        eyebrow: 'Security & Cloud Infrastructure',
        title: 'Multi-Tenant Isolation & Enterprise Security.',
        subtitle:
          'RASHX is engineered on robust architectural foundations ensuring complete separation of each salon’s records and protecting sensitive operations with rigorous encryption and access protocols.',
        pillars: [
          {
            icon: Database,
            title: 'Strict Multi-Tenant Logical Isolation',
            description:
              'Every salon’s customer directories, transaction logs, and financial records are logically partitioned at the database layer with cryptographic tenant boundaries, preventing cross-tenant data exposure.',
            badge: '100% Data Partitioning',
          },
          {
            icon: KeyRound,
            title: 'Granular Role-Based Access Control (RBAC)',
            description:
              'Definitive permission hierarchies restricting access strictly to job duties: receptionists handle appointments without seeing owner-level profit margins or modifying commission algorithms.',
            badge: 'Sensitive Ledger Protection',
          },
          {
            icon: Lock,
            title: 'End-to-End Encryption in Transit & at Rest',
            description:
              'All traffic is safeguarded using TLS 1.3, sensitive database fields are encrypted via AES-256, and credentials undergo secure salted one-way cryptographic hashing.',
            badge: 'Enterprise Encryption',
          },
          {
            icon: Server,
            title: 'High Availability Cloud with Automated Backups',
            description:
              'Hosted on top-tier cloud architecture designed for high availability and minimal latency, backed by automated redundant snapshots to guarantee business continuity.',
            badge: '99.9% Target Uptime',
          },
        ],
        specifications: [
          { label: 'In-Transit Encryption', value: 'TLS 1.3 / HTTPS' },
          { label: 'At-Rest Storage Encryption', value: 'AES-256 Standard' },
          { label: 'Isolation Architecture', value: 'Logical Multi-Tenant Isolation' },
          { label: 'Audit Logging', value: 'Tamper-Evident Audit Trails' },
        ],
      };

  return (
    <section
      id="security-architecture"
      className={`relative bg-[#FAF9F8] py-14 sm:py-20 lg:py-24 transition-colors duration-200 ${className ?? ''}`}
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
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {sectionContent.pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-8 lg:p-10 transition-colors duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#91B8C0]/20 text-[#2C4349]">
                      <Icon className="h-6 w-6 text-[#2C4349]" aria-hidden="true" />
                    </div>
                    <span className="rounded-full bg-[#FAF9F8] px-3 py-1 text-xs font-bold text-[#54453D]">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl sm:text-2xl font-bold text-[#54453D]">
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#75645B]">
                    {pillar.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Technical Specifications Bar */}
        <div className="mt-10 sm:mt-14 rounded-3xl bg-white p-6 sm:p-8 transition-colors duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {sectionContent.specifications.map((spec) => (
              <div key={spec.label} className="rounded-2xl bg-[#FAF9F8] p-4 text-start">
                <span className="text-xs font-semibold text-[#75645B]">
                  {spec.label}
                </span>
                <p className="mt-1 font-mono text-sm sm:text-base font-bold text-[#54453D]">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
