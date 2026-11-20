/**
 * RASHX Report an Issue / Incident Ticket Page
 *
 * Dedicated Route: /support/report
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { AlertCircle } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'الإبلاغ عن مشكلة فنية أو فتح تذكرة | RASHX Support'
      : 'Report an Issue / Incident Ticket | RASHX Support',
    description: isAr
      ? 'أرسل تفاصيل المشكلة الفنية أو الاستفسار التشغيلي مباشرة إلى فريق المهندسين في راش إكس.'
      : 'Submit incident reports and technical tickets directly to the RASHX platform engineering team.',
    path: '/support/report',
    lang,
  });
}

export default async function SupportReportPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/support/report" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#C78360]/20 px-3 py-1 text-xs font-semibold text-[#54453D]">
                <AlertCircle className="h-4 w-4 text-[#C78360]" />
                <span>{isAr ? 'تذكرة دعم فني' : 'Incident Ticketing'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'الإبلاغ عن مشكلة فنية' : 'Report an Issue'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'املأ تفاصيل التذكرة بدقة ليتم توجيهها فوراً للمهندس المختص ومتابعتها حتى الحل الكامل'
                  : 'Submit detailed incident diagnostics for rapid triage by our on-call engineering squad'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="mx-auto max-w-2xl rounded-3xl bg-[#FAF9F8] p-8 sm:p-12 transition-colors duration-200">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#54453D]">
                    {isAr ? 'اسم المنشأة أو النطاق الفرعي' : 'Salon Name or Subdomain'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: salon-name.rashx.org' : 'e.g. salon-name.rashx.org'}
                    className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder-[#54453D]/40 outline-none focus:ring-2 focus:ring-[#54453D]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-[#54453D]">
                      {isAr ? 'البريد الإلكتروني للإشعار' : 'Notification Email'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@salon.com"
                      className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder-[#54453D]/40 outline-none focus:ring-2 focus:ring-[#54453D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#54453D]">
                      {isAr ? 'مستوى الأهمية' : 'Severity Level'}
                    </label>
                    <select className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] outline-none focus:ring-2 focus:ring-[#54453D]">
                      <option>{isAr ? 'عادي - استفسار أو طلب مساعدة' : 'Low - Inquiry'}</option>
                      <option>{isAr ? 'متوسط - بطء أو خلل جزئي' : 'Medium - Partial issue'}</option>
                      <option>{isAr ? 'حرج - توقف عمليات البيع أو الحجز' : 'High - Critical outage'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#54453D]">
                    {isAr ? 'عنوان المشكلة' : 'Issue Summary'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'وصف موجز للمشكلة...' : 'Brief summary of the issue...'}
                    className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder-[#54453D]/40 outline-none focus:ring-2 focus:ring-[#54453D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#54453D]">
                    {isAr ? 'تفاصيل المشكلة وخطوات تكرارها' : 'Detailed Description & Reproduction Steps'}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={
                      isAr
                        ? 'اذكر بالتفصيل ما حدث، ورسائل الخطأ التي ظهرت إن وجدت...'
                        : 'Describe what happened, any error messages, and steps taken...'
                    }
                    className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder-[#54453D]/40 outline-none focus:ring-2 focus:ring-[#54453D]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#54453D] py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#3D322C]"
                >
                  {isAr ? 'إرسال التذكرة إلى فريق الهندسة' : 'Submit Ticket to Engineering'}
                </button>
              </form>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

