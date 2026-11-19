/**
 * RASHX Security: Access Control & Permissions
 * Dedicated Route: /security/access-control
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ShieldCheck, Users, Lock, Sliders } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'إدارة الصلاحيات والتحكم بالوصول (RBAC) | RASHX'
      : 'Role-Based Access Control (RBAC) & Permissions | RASHX',
    description: isAr
      ? 'نظام دقيق لإدارة أدوار وصلاحيات الموظفين، المحاسبين، ومقدمي الخدمات لحماية سرية العمليات والتقارير المالية في الصالونات.'
      : 'Granular role-based access control protecting salon financial logs, inventory data, and client databases on RASHX.',
    path: '/security/access-control',
    lang,
  });
}

export default async function AccessControlPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const roles = isAr
    ? [
        {
          title: 'مالك المنشأة / الإدارة العليا',
          desc: 'صلاحيات شاملة لإدارة الفروع، الاطلاع على كامل التقارير المالية والتحليلية، إدارة الحسابات البنكية وإعدادات الضرائب.',
          icon: ShieldCheck,
        },
        {
          title: 'مدير الفرع / مشرف العمليات',
          desc: 'إدارة العمليات اليومية للفرع، تنظيم الورديات، اعتماد الحجوزات، متابعة المخزون، وإصدار الفواتير دون كشف أرقام الأرباح الشاملة.',
          icon: Sliders,
        },
        {
          title: 'مقدم الخدمة / الكادر الفني',
          desc: 'الوصول المخصص لجدول المواعيد الخاص به، قائمة المهام والخدمات المسندة، وسجل العمولات دون إمكانية تصدير بيانات العملاء.',
          icon: Users,
        },
        {
          title: 'المحاسب وأمين الصندوق',
          desc: 'التعامل مع نقاط البيع (POS)، إصدار فواتير ZATCA الضريبية، إقفال الصناديق اليومية، وإدارة المشتريات والموردين.',
          icon: Lock,
        },
      ]
    : [
        {
          title: 'Facility Owner / Executive Admin',
          desc: 'Comprehensive authority over all branches, financial audits, profit margins, tax configurations, and strategic metrics.',
          icon: ShieldCheck,
        },
        {
          title: 'Branch Operations Manager',
          desc: 'Daily execution authority over branch schedules, shift assignments, POS reconciliation, and local inventory balances.',
          icon: Sliders,
        },
        {
          title: 'Service Specialist & Stylist',
          desc: 'Restricted role focused exclusively on assigned client appointments, service checklists, and personal commission calculations.',
          icon: Users,
        },
        {
          title: 'Cashier & Financial Accountant',
          desc: 'POS terminal access, ZATCA tax invoice generation, daily register cash-out, and purchasing accounts control.',
          icon: Lock,
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
                <ShieldCheck className="h-4 w-4" />
                <span>{isAr ? 'حوكمة الأدوار والصلاحيات' : 'Role-Based Governance'}</span>
              </div>
              <SectionTitle
                title={
                  isAr
                    ? 'إدارة الصلاحيات والتحكم بالوصول'
                    : 'Role-Based Access Control'
                }
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'هيكلة رقمية متطورة تضمن وصول كل موظف للأدوات والبيانات المرتبطة بدوره الوظيفي فقط'
                  : 'Precise permission boundaries ensuring each team member accesses only what is necessary for their role'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {roles.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex flex-col rounded-2xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                  >
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#2C4349] text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#54453D]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

