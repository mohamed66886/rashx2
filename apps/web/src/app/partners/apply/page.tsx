/**
 * RASHX Partner Application Page
 *
 * Dedicated Route: /partners/apply
 * Visual Architecture: Absolute Flat, Clean, Borderless & Shadowless
 */

import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { Handshake } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'طلب الانضمام لشبكة شركاء راش إكس | RASHX Partners'
      : 'Apply to Become a RASHX Partner | RASHX Partners',
    description: isAr
      ? 'سجل اهتمامك بالانضمام إلى برنامج شركاء راش إكس للمستشارين التشغيليين والتقنيين في قطاع التجميل.'
      : 'Submit your organization profile to join the certified RASHX beauty technology partner network.',
    path: '/partners/apply',
    lang,
  });
}

export default async function PartnerApplyPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

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
                <Handshake className="h-4 w-4" />
                <span>{isAr ? 'نموذج طلب الشراكة' : 'Partner Application'}</span>
              </div>
              <SectionTitle
                title={isAr ? 'انضم إلى شبكة شركاء النجاح' : 'Partner With RASHX'}
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'املأ النموذج التالي ليتواصل معك مدير علاقات الشركاء خلال يوم عمل واحد لمناقشة فرص التعاون'
                  : 'Complete the form below and our partner relations team will connect within 1 business day'}
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
                    {isAr ? 'اسم الشركة أو المنشأة' : 'Company or Agency Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: شركة آفاق للاستشارات' : 'e.g. Horizon Advisory Group'}
                    className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder-[#54453D]/40 outline-none focus:ring-2 focus:ring-[#54453D]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-[#54453D]">
                      {isAr ? 'اسم المسؤول' : 'Contact Person Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isAr ? 'الاسم الكامل' : 'Full Name'}
                      className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder-[#54453D]/40 outline-none focus:ring-2 focus:ring-[#54453D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#54453D]">
                      {isAr ? 'المسمى الوظيفي' : 'Job Title'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isAr ? 'مثال: الرئيس التنفيذي / مدير الشراكات' : 'e.g. CEO / Partnerships Director'}
                      className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder-[#54453D]/40 outline-none focus:ring-2 focus:ring-[#54453D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-[#54453D]">
                      {isAr ? 'البريد الإلكتروني المهني' : 'Work Email'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder-[#54453D]/40 outline-none focus:ring-2 focus:ring-[#54453D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#54453D]">
                      {isAr ? 'رقم الجوال' : 'Mobile Number'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+966 5X XXX XXXX"
                      className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder-[#54453D]/40 outline-none focus:ring-2 focus:ring-[#54453D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#54453D]">
                    {isAr ? 'مسار الشراكة المقترح' : 'Target Partner Track'}
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] outline-none focus:ring-2 focus:ring-[#54453D]"
                  >
                    <option>{isAr ? 'شريك إحالة معتمد (Referral)' : 'Certified Referral Partner'}</option>
                    <option>{isAr ? 'شريك حلول واستشارات (Solutions)' : 'Solutions & Advisory Partner'}</option>
                    <option>{isAr ? 'شريك تكامل تقني ونظم (Technology Alliance)' : 'Technology Alliance Partner'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#54453D]">
                    {isAr ? 'نبذة عن طبيعة أعمالكم وفرص التعاون' : 'Brief Overview of Partnership Scope'}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={
                      isAr
                        ? 'اذكر نبذة عن قاعدة عملائكم أو الخدمات التي تقدمونها للصالونات...'
                        : 'Describe your client base, geographic coverage, or services...'
                    }
                    className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-[#54453D] placeholder-[#54453D]/40 outline-none focus:ring-2 focus:ring-[#54453D]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#54453D] py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-[#3D322C]"
                >
                  {isAr ? 'إرسال طلب الانضمام' : 'Submit Partner Application'}
                </button>
              </form>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

