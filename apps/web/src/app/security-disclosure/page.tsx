/**
 * RASHX Responsible Security Disclosure Page
 *
 * Dedicated Route: /security-disclosure
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ShieldAlert } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'سياسة الإفصاح الأمني المسؤول | RASHX — حماية المنظومة والبنية السحابية'
      : 'Vulnerability Disclosure Policy | RASHX — Coordinated Security Governance',
    description: isAr
      ? 'إرشادات الإبلاغ عن الثغرات الأمنية والتنسيق المسؤول مع فريق أمن المعلومات في راش إكس لحماية البيانات.'
      : 'Guidelines for security researchers to report vulnerabilities responsibly to the RASHX security engineering team.',
    path: '/security-disclosure',
    lang,
  });
}

export default async function SecurityDisclosurePage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const principles = isAr
    ? [
        {
          title: '1. التزامنا بأمن البيانات',
          content:
            'تولي RASHX أمان بيانات عملائها وبنيتها السحابية أولوية قصوى. نرحب بجهود الباحثين الأمنيين وخبراء التقنية المستقلين لمساعدتنا في اكتشاف ومعالجة أي ثغرات برمجية أو أمنية وفق مبدأ الإفصاح المنسق والمسؤول.',
        },
        {
          title: '2. نطاق البرنامج (In-Scope)',
          content:
            'يشمل نطاق الإفصاح المسؤول: واجهات تطبيقات RASHX السحابية (*.rashx.org)، بوابات العملاء، واجهات برمجة التطبيقات (APIs)، وأنظمة المصادقة والتحكم بالوصول.',
        },
        {
          title: '3. السلوكيات الخارجة عن النطاق (Out-of-Scope)',
          content:
            'يُحظر منعاً باتاً: هجمات حجب الخدمة (DDoS)، الهندسة الاجتماعية وخداع الموظفين، محاولات التسلل المادي، أو المساس ببيانات المنشآت والعملاء الحقيقية أو تعديلها أو نسخها بأي شكل.',
        },
        {
          title: '4. آلية الإبلاغ والتواصل',
          content:
            'يُرجى إرسال تقارير الثغرات متضمنة خطوات إعادة الإنتاج التفصيلية إلى البريد الأمني: security@rashx.org مع إمكانية استخدام مفتاح PGP لتشفير البيانات الحساسة.',
        },
        {
          title: '5. التزامنا تجاه الباحثين (Safe Harbor)',
          content:
            'نلتزم بالرد الأولي خلال 24 ساعة عمل، وتقديم تحديثات منتظمة حول مسار المعالجة، والامتناع عن اتخاذ أي إجراءات قانونية ضد الباحثين الذين يلتزمون بقواعد الإفصاح المسؤول وحسن النية.',
        },
      ]
    : [
        {
          title: '1. Commitment to System Security',
          content:
            'RASHX values the vital contributions of external security researchers. We support coordinated disclosure to identify and mitigate potential vulnerabilities across our cloud stack.',
        },
        {
          title: '2. In-Scope Targets',
          content:
            'The disclosure program encompasses production web services (*.rashx.org), tenant management portals, customer mobile endpoints, external APIs, and identity authentication mechanisms.',
        },
        {
          title: '3. Out-of-Scope & Prohibited Testing',
          content:
            'Strictly prohibited activities include Denial of Service (DoS/DDoS) assaults, social engineering of personnel, physical site testing, and accessing, modifying, or exfiltrating live customer records.',
        },
        {
          title: '4. Reporting Procedures',
          content:
            'Please submit structured technical reports detailing reproduction steps and impact assessments to security@rashx.org. PGP encrypted communications are supported.',
        },
        {
          title: '5. Safe Harbor Guarantee',
          content:
            'We pledge an initial response within 24 business hours, timely remediation status updates, and a safe harbor assurance against legal action for researchers acting in good faith.',
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <Header lang={lang} />

      <main id="main-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2C4349]/10 px-3 py-1 text-xs font-semibold text-[#2C4349]">
                <ShieldAlert className="h-4 w-4" />
                <span>{isAr ? 'الأمن السيبراني والإفصاح' : 'Cybersecurity & Trust'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'سياسة الإفصاح الأمني المسؤول' : 'Responsible Security Disclosure'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'إطار التنسيق والتعاون المسؤول مع مجتمع أمن المعلومات لحماية المنظومة السحابية'
                  : 'Coordinated framework for security researchers to report vulnerabilities safely and ethically'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl space-y-8">
              {principles.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl bg-[#FAF9F8] p-6 sm:p-8 transition-colors duration-200"
                >
                  <h2 className="text-lg font-bold text-[#54453D] sm:text-xl">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80 sm:text-base">
                    {item.content}
                  </p>
                </article>
              ))}

              <div className="rounded-2xl bg-[#2C4349] p-6 text-center text-white sm:p-8">
                <p className="text-sm font-semibold">
                  {isAr
                    ? 'فريق الاستجابة الأمنية السحابية: security@rashx.org'
                    : 'RASHX Cloud Security Incident Response: security@rashx.org'}
                </p>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

