/**
 * RASHX Help & Support Center Page
 *
 * Dedicated Route: /help
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { HelpCircle, BookOpen, Cpu, ArrowLeft, ArrowRight } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'مركز المساعدة والتوثيق | RASHX Help Center'
      : 'Help Center & Documentation | RASHX Help Center',
    description: isAr
      ? 'مركز المساعدة الشامل لمنصة راش إكس: إرشادات الإعداد السريع، إدارة الحجوزات، المبيعات، والفوترة الضريبية.'
      : 'Comprehensive help center for RASHX: setup guides, operational walkthroughs, POS troubleshooting, and ZATCA guidelines.',
    path: '/help',
    lang,
  });
}

export default async function HelpPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const guidesHref = (isAr ? routes.help.guides : `${routes.help.guides}?lang=en`) as Route;
  const techHref = (isAr ? routes.help.technical : `${routes.help.technical}?lang=en`) as Route;
  const supportHref = (isAr ? routes.support.index : `${routes.support.index}?lang=en`) as Route;

  const categories = isAr
    ? [
        {
          title: 'أدلة الاستخدام والتشغيل اليومي',
          desc: 'شروحات خطوة بخطوة لإدارة المواعيد، تسجيل العملاء، إضافة الخدمات، وصرف فواتير نقاط البيع.',
          icon: BookOpen,
          href: guidesHref,
        },
        {
          title: 'الدعم التقني والربط السحابي',
          desc: 'إعدادات النطاق الفرعي المخصص، ربط طابعات البلوتوث والشبكة، وحلول الفوترة الإلكترونية ZATCA.',
          icon: Cpu,
          href: techHref,
        },
        {
          title: 'خدمة العملاء والتواصل المباشر',
          desc: 'تواصل مع فريق الدعم الفني المتخصص عبر التذاكر، الدردشة المباشرة، أو القنوات الهاتفية.',
          icon: HelpCircle,
          href: supportHref,
        },
      ]
    : [
        {
          title: 'User & Operations Guides',
          desc: 'Step-by-step tutorials on appointment booking, customer onboarding, pricing setup, and POS checkouts.',
          icon: BookOpen,
          href: guidesHref,
        },
        {
          title: 'Technical Setup & Hardware',
          desc: 'Custom domain mapping, thermal printer setup, barcode integration, and ZATCA tax parameters.',
          icon: Cpu,
          href: techHref,
        },
        {
          title: 'Support & Help Desk',
          desc: 'Connect directly with technical specialists via support tickets, live messaging, or dedicated phone lines.',
          icon: HelpCircle,
          href: supportHref,
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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#91B8C0]/30 px-3 py-1 text-xs font-semibold text-[#2C4349]">
                <HelpCircle className="h-4 w-4" />
                <span>{isAr ? 'مركز المساعدة والمعرفة' : 'Help & Support'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'كيف يمكننا مساعدتك اليوم؟' : 'How Can We Help You Today?'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'إرشادات تشغيلية شاملة وتوثيق فني لمساعدتك على الاستفادة القصوى من كل أدوات راش إكس'
                  : 'Comprehensive operational guides and technical walkthroughs to maximize your salon performance'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.title}
                    href={cat.href}
                    className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-8 transition-colors duration-200 hover:bg-[#F2ECE7]"
                  >
                    <div>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#54453D] text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 text-lg font-bold text-[#54453D]">{cat.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80">{cat.desc}</p>
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#54453D]">
                      <span>{isAr ? 'عرض القسم' : 'Explore Section'}</span>
                      <ArrowIcon className="h-4 w-4" />
                    </div>
                  </Link>
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

