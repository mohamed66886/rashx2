/**
 * RASHX Customer Support & Help Desk Page
 *
 * Dedicated Route: /support
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
import { HelpCircle, Mail, Phone, MessageSquare, ArrowLeft, ArrowRight } from '@rashx/icons';
import { routes } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'الدعم الفني وخدمة العملاء | RASHX Support'
      : 'Customer Care & Technical Support | RASHX',
    description: isAr
      ? 'فريق الدعم الفني المتخصص في راش إكس جاهز لمساعدتك عبر التذاكر، الاتصال المباشر، وخدمة العملاء على مدار الساعة.'
      : 'Dedicated customer care, live assistance, and technical ticketing for RASHX salon partners across Saudi Arabia.',
    path: '/support',
    lang,
  });
}

export default async function SupportPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const reportHref = (isAr ? routes.support.report : `${routes.support.report}?lang=en`) as Route;
  const statusHref = (isAr ? routes.status : `${routes.status}?lang=en`) as Route;

  const channels = isAr
    ? [
        {
          title: 'فتح تذكرة دعم فني',
          desc: 'للطلبات التقنية المفصلة أو الإبلاغ عن مشكلة مع تتبع حالة التذكرة من قبل فريق الهندسة.',
          icon: HelpCircle,
          action: 'فتح تذكرة جديدة',
          href: reportHref,
        },
        {
          title: 'البريد الإلكتروني المباشر',
          desc: 'تواصل مع فريق الدعم والمساندة التشغيلية عبر support@rashx.org مع رد خلال أقل من ساعتين.',
          icon: Mail,
          action: 'support@rashx.org',
          href: 'mailto:support@rashx.org' as Route,
        },
        {
          title: 'مركز الاتصال الموحد',
          desc: 'دعم هاتفي مباشر للرد على الاستفسارات العاجلة وحالات الطوارئ التشغيلية أثناء ساعات العمل.',
          icon: Phone,
          action: '+966 11 000 0000',
          href: 'tel:+966110000000' as Route,
        },
      ]
    : [
        {
          title: 'Submit a Technical Ticket',
          desc: 'Detailed issue logging and incident tracking with dedicated engineering support specialists.',
          icon: HelpCircle,
          action: 'Open New Ticket',
          href: reportHref,
        },
        {
          title: 'Direct Support Email',
          desc: 'Connect with operations specialists via support@rashx.org with average response under 2 hours.',
          icon: Mail,
          action: 'support@rashx.org',
          href: 'mailto:support@rashx.org' as Route,
        },
        {
          title: 'Dedicated Helpline',
          desc: 'Immediate phone support for urgent POS or scheduling inquiries during operational hours.',
          icon: Phone,
          action: '+966 11 000 0000',
          href: 'tel:+966110000000' as Route,
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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0C5AE]/40 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <MessageSquare className="h-4 w-4" />
                <span>{isAr ? 'خدمة العملاء والدعم' : 'Support Headquarters'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'الدعم الفني وخدمة العملاء' : 'Customer Support & Assistance'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'فريق متخصص يقف معك لضمان استمرارية تشغيل صالونك بسلاسة واحترافية تامة'
                  : 'Specialized support engineers dedicated to keeping your salon operations completely uninterrupted'}
              </p>
              <div className="mt-6">
                <Link
                  href={statusHref}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#16A34A] hover:underline"
                >
                  <span className="h-2 w-2 rounded-full bg-[#16A34A]"></span>
                  <span>{isAr ? 'كافة الأنظمة السحابية تعمل بكفاءة 100%' : 'All Cloud Systems Operational 100%'}</span>
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {channels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <div
                    key={ch.title}
                    className="flex flex-col justify-between rounded-3xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                  >
                    <div>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#54453D] text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 text-lg font-bold text-[#54453D]">{ch.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80">{ch.desc}</p>
                    </div>
                    <div className="mt-6">
                      <Link
                        href={ch.href}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#54453D] py-3 text-xs font-bold text-white transition-colors hover:bg-[#3D322C]"
                      >
                        <span>{ch.action}</span>
                        <ArrowIcon className="h-4 w-4" />
                      </Link>
                    </div>
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

