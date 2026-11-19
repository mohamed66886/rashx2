/**
 * RASHX Product & Interface Gallery Page
 *
 * Dedicated Route: /gallery
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Layers, LayoutDashboard, Calendar, Users, ShoppingBag } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'معرض واجهات وتطبيقات راش إكس | RASHX Interface Gallery'
      : 'Product & Interface Gallery | RASHX',
    description: isAr
      ? 'استعرض تصاميم وواجهات منظومة راش إكس: لوحة التحكم، نظام نقاط البيع، تطبيق العميل، وجدول مواعيد الكوادر.'
      : 'Explore visual previews of RASHX cloud interfaces across admin consoles, POS checkouts, customer apps, and staff schedules.',
    path: '/gallery',
    lang,
  });
}

export default async function GalleryPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const screens = isAr
    ? [
        {
          title: 'لوحة التحكم المركزية (Admin Dashboard)',
          desc: 'شاشة التحكم الشاملة التي تمنح الإدارة رؤية لحظية للمبيعات، الإشغال، وأداء الفروع والكوادر.',
          icon: LayoutDashboard,
          category: 'الإدارة والتحليلات',
        },
        {
          title: 'نظام إدارة الحجوزات والتقويم (Calendar)',
          desc: 'تقويم ذكي تفاعلي ينظم مواعيد مقدمي الخدمات ويمنع التعارض مع إشعارات فورية للعملاء.',
          icon: Calendar,
          category: 'المواعيد والتشغيل',
        },
        {
          title: 'نقاط البيع والفوترة الضريبية (POS)',
          desc: 'واجهة سريعة لإتمام المعاملات النقدية والبطاقات وإصدار فواتير ZATCA الإلكترونية في ثوانٍ.',
          icon: ShoppingBag,
          category: 'المبيعات والفوترة',
        },
        {
          title: 'بوابة العميل الرقمية وتطبيق الحجز (Customer App)',
          desc: 'تجربة حجز فاخرة تعكس هوية الصالون وتمكّن العميل من اختيار الخدمة والأخصائي وسداد الرسوم.',
          icon: Users,
          category: 'تجربة العميل',
        },
      ]
    : [
        {
          title: 'Executive Admin Dashboard',
          desc: 'Central command console providing real-time intelligence over gross sales, facility utilization, and staff benchmarks.',
          icon: LayoutDashboard,
          category: 'Administration & Analytics',
        },
        {
          title: 'Dynamic Booking Matrix & Calendar',
          desc: 'Interactive schedule grid coordinating service bays and stylist shifts with automated collision resolution.',
          icon: Calendar,
          category: 'Scheduling & Ops',
        },
        {
          title: 'Cloud POS & ZATCA Invoicing Terminal',
          desc: 'Ultra-fast checkout interface accepting multi-currency tenders and producing compliant tax e-invoices instantly.',
          icon: ShoppingBag,
          category: 'Sales & POS',
        },
        {
          title: 'Branded Client Booking Portal',
          desc: 'Seamless mobile-first experience showcasing bespoke salon aesthetics, specialist profiles, and direct payments.',
          icon: Users,
          category: 'Client Experience',
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
                <Layers className="h-4 w-4" />
                <span>{isAr ? 'واجهات المنظومة الرقمية' : 'Interface Showcase'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'معرض واجهات وتطبيقات راش إكس' : 'RASHX Interface Gallery'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'تصاميم هندسية عصرية ومدروسة بعناية لتوفير أقصى درجات السهولة والسرعة والجمال'
                  : 'Engineered interfaces built with functional minimalism, speed, and elegance for modern beauty venues'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {screens.map((sc) => {
                const Icon = sc.icon;
                return (
                  <div
                    key={sc.title}
                    className="flex flex-col rounded-3xl bg-[#FAF9F8] p-8 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#54453D] text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-[#54453D]/10 px-3 py-1 text-xs font-semibold text-[#54453D]">
                        {sc.category}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-[#54453D]">{sc.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#54453D]/80">{sc.desc}</p>
                    <div className="mt-8 flex h-48 items-center justify-center rounded-2xl bg-white/70 p-6 text-center">
                      <span className="text-xs font-semibold text-[#54453D]/60">
                        {isAr ? 'معاينة الواجهة الرسمية المعتمدة' : 'Official System UI Preview'}
                      </span>
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

