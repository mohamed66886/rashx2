/**
 * RASHX Careers & Talent Page
 *
 * Dedicated Route: /careers
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Briefcase, ArrowLeft, ArrowRight, Sparkles } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'الوظائف والانضمام إلى فريق راش إكس | RASHX Careers'
      : 'Careers & Join Our Team | RASHX Careers',
    description: isAr
      ? 'انضم إلى فريق راش إكس وساهم في بناء الجيل القادم من التكنولوجيا السحابية لقطاع التجميل في السعودية.'
      : 'Join RASHX and engineer the future of vertical SaaS for the beauty, wellness, and salon industry in Saudi Arabia.',
    path: '/careers',
    lang,
  });
}

export default async function CareersPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const internshipsHref = (isAr
    ? routes.careers.internships
    : `${routes.careers.internships}?lang=en`) as Route;

  const openings = isAr
    ? [
        {
          role: 'مهندس برمجيات أول (Full-Stack Engineer)',
          department: 'فريق الهندسة السحابية',
          type: 'دوام كامل · الرياض',
          desc: 'المساهمة في بناء وتوسيع معمارية النطاقات الفرعية متعددة المنشآت وربط واجهات ZATCA.',
        },
        {
          role: 'أخصائي نجاح العملاء والتشغيل (Customer Success)',
          department: 'العمليات والمساندة',
          type: 'دوام كامل · الرياض',
          desc: 'مساعدة مديري الصالونات ومراكز التجميل على تدريب الكوادر وتهيئة النظام وضمان نجاح أعمالهم.',
        },
        {
          role: 'مدير تطوير أعمال ومبيعات SaaS (Business Development)',
          department: 'المبيعات والشراكات',
          type: 'دوام كامل · الرياض / جدة',
          desc: 'قيادة التوسع التجاري وعقد الشراكات مع كبرى سلاسل الصالونات ومراكز السبا الفاخرة.',
        },
      ]
    : [
        {
          role: 'Senior Full-Stack Engineer',
          department: 'Cloud Platform Engineering',
          type: 'Full-time · Riyadh',
          desc: 'Scale high-availability multi-tenant microservices and optimize ZATCA Phase 2 transaction nodes.',
        },
        {
          role: 'Salon Customer Success Specialist',
          department: 'Operations & Enablement',
          type: 'Full-time · Riyadh',
          desc: 'Onboard salon managers, conduct staff masterclasses, and guarantee uninterrupted workflow adoption.',
        },
        {
          role: 'Enterprise SaaS Business Development Lead',
          department: 'Growth & Strategic Accounts',
          type: 'Full-time · Riyadh / Jeddah',
          desc: 'Accelerate commercial footprint and structure enterprise agreements with major salon chains.',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/careers" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <Briefcase className="h-4 w-4" />
                <span>{isAr ? 'الانضمام لفريق راش إكس' : 'Join Our Team'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'اصنع مستقبلك المهني مع راش إكس' : 'Build the Future With RASHX'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'بيئة عمل طموحة ومرنة تجمع أمهر الكفاءات الهندسية والتشغيلية في المملكة'
                  : 'An ambitious, high-trust engineering environment shaping Saudi Arabia’s vertical SaaS future'}
              </p>
              <div className="mt-8">
                <Link
                  href={internshipsHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FAF9F8] px-5 py-2.5 text-xs font-semibold text-[#54453D] transition-colors hover:bg-[#E8DFD8]"
                >
                  <Sparkles className="h-4 w-4 text-[#C78360]" />
                  <span>{isAr ? 'برامج التدريب للطلاب وحديثي التخرج' : 'Graduate & Internship Programs'}</span>
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="space-y-6">
              {openings.map((job) => (
                <div
                  key={job.role}
                  className="flex flex-col justify-between gap-6 rounded-2xl bg-[#FAF9F8] p-8 sm:flex-row sm:items-center transition-colors duration-200"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#54453D]/60">
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-[#54453D] sm:text-xl">{job.role}</h3>
                    <p className="mt-2 text-sm text-[#54453D]/80">{job.desc}</p>
                  </div>
                  <div className="shrink-0">
                    <a
                      href="mailto:careers@rashx.org"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#54453D] px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-[#3D322C]"
                    >
                      <span>{isAr ? 'التقديم الآن' : 'Apply Now'}</span>
                      <ArrowIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

