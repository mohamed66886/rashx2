/**
 * RASHX Cookies Policy Page
 *
 * Dedicated Route: /cookies
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 * Purpose: Transparent cookie usage policy under Saudi PDPL regulations.
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'سياسة ملفات تعريف الارتباط (الكوكيز) | RASHX'
      : 'Cookie Policy | RASHX',
    description: isAr
      ? 'سياسة RASHX في استخدام ملفات تعريف الارتباط الضرورية لتشغيل المنظومة وحفظ تفضيلات الجلسة واللغة بأمان.'
      : 'RASHX policy regarding essential cookies used strictly for session security and language preferences.',
    path: '/cookies',
    lang,
  });
}

export default async function CookiesPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const cookieTypes = isAr
    ? [
        {
          title: '1. ملفات تعريف الارتباط الضرورية للتشغيل',
          desc: 'ملفات أساسية لتمكين تسجيل الدخول الآمن، والتحقق من الجلسة، وضمان حماية بيانات الحساب ولا يمكن تعطيلها.',
        },
        {
          title: '2. ملفات التفضيلات واللغة',
          desc: 'تُستخدم لحفظ تفضيل اللغة (العربية أو الإنجليزية) وتفضيلات العرض لتسهيل تجربة استخدامك عبر الجلسات.',
        },
        {
          title: '3. انعدام ملفات التتبع الإعلاني الخارجي',
          desc: 'لا تستخدم RASHX أي ملفات تعريف ارتباط خاصة بشبكات الإعلانات أو التتبع الترويجي لأطراف ثالثة.',
        },
      ]
    : [
        {
          title: '1. Essential Operational Cookies',
          desc: 'Strictly necessary for secure authentication, session verification, and account security. These cannot be disabled.',
        },
        {
          title: '2. Preference & Language Cookies',
          desc: 'Used to remember your preferred language (Arabic or English) and display parameters across visits.',
        },
        {
          title: '3. Zero Third-Party Advertising Trackers',
          desc: 'RASHX employs zero tracking cookies from commercial advertising exchanges or external data brokers.',
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
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                as="h1"
                eyebrow={isAr ? 'الشفافية الرقمية' : 'COOKIE POLICY'}
                title={
                  isAr
                    ? 'سياسة ملفات تعريف الارتباط والتقنيات المماثلة'
                    : 'Cookie Usage & Essential Tracking Policy'
                }
                align="center"
                withWordmark={true}
              />

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#75645B] max-w-2xl mx-auto">
                {isAr
                  ? 'نستخدم فقط ملفات تعريف الارتباط الأساسية لضمان عمل المنظومة بأمان وسرعة.'
                  : 'We strictly employ essential cookies to ensure safe, authenticated session management.'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-14 sm:py-20 lg:py-24" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="full">
            <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
              {cookieTypes.map((c, idx) => (
                <div key={idx} className="rounded-3xl bg-[#FAF9F8] p-6 sm:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-[#54453D] mb-2">{c.title}</h2>
                  <p className="text-sm sm:text-base leading-relaxed text-[#75645B]">{c.desc}</p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

