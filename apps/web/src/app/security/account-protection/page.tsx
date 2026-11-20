/**
 * RASHX Security: Account Protection & Multi-Factor Auth
 * Dedicated Route: /security/account-protection
 */

import { PageJsonLd } from '@/components/seo';
import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { generatePageMetadata } from '@/lib/metadata';
import { Header, Footer } from '@/components/layout';
import { PageContainer } from '@rashx/ui';
import { SectionTitle } from '@/components/sections';
import { ShieldCheck, Key, Lock, CheckCircle2 } from '@rashx/icons';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const isAr = lang === 'ar';

  return generatePageMetadata({
    title: isAr
      ? 'حماية الحسابات والمصادقة متعددة العوامل (MFA) | RASHX'
      : 'Account Protection & Multi-Factor Authentication | RASHX',
    description: isAr
      ? 'طبقات الحماية المتقدمة والمصادقة الثنائية وسياسات كلمات المرور المشفرة لحسابات الصالونات ومراكز التجميل على راش إكس.'
      : 'Advanced account security, multi-factor authentication, and credential encryption protecting salon operations on RASHX.',
    path: '/security/account-protection',
    lang,
  });
}

export default async function AccountProtectionPage() {
  const lang = await getLang();
  const isAr = lang === 'ar';

  const features = isAr
    ? [
        {
          title: 'المصادقة الثنائية الإلزامية (2FA)',
          desc: 'حماية تسجيل الدخول للمديرين والمشرفين عبر رموز التحقق لمرة واحدة (TOTP) عبر تطبيقات المصادقة الآمنة.',
          icon: Key,
        },
        {
          title: 'كشف الجلسات غير المصرح بها',
          desc: 'مراقبة الجلسات النشطة، تسجيل الأجهزة والمواقع الجغرافية لتسجيل الدخول، والإنهاء الفوري لأي جلسة مشبوهة.',
          icon: ShieldCheck,
        },
        {
          title: 'تشفير كلمات المرور والبيانات السرية',
          desc: 'تشفير أمان تام باستخدام أحدث خوارزميات التجزئة الآمنة (Argon2id / bcrypt) مع سياسات تعقيد مشددة.',
          icon: Lock,
        },
      ]
    : [
        {
          title: 'Enforced Multi-Factor Authentication (2FA)',
          desc: 'Admin and managerial logins safeguarded by time-based one-time passwords (TOTP) via certified authenticator apps.',
          icon: Key,
        },
        {
          title: 'Session Auditing & Anomaly Alerts',
          desc: 'Continuous real-time tracking of active sessions, device fingerprints, and instant revocation of suspicious sessions.',
          icon: ShieldCheck,
        },
        {
          title: 'Resilient Credential Hashing',
          desc: 'Passwords protected using industry standard cryptographic hash algorithms with strict entropy enforcement.',
          icon: Lock,
        },
      ];

  return (
    <div className="min-h-screen bg-[--surface-background] text-[--surface-foreground] transition-colors duration-200">
      <PageJsonLd path="/security/account-protection" lang={lang} />
      <Header lang={lang} />

      <div id="page-content">
        <section
          className="relative bg-[#FAF9F8] pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <PageContainer size="xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2C4349]/10 px-3 py-1 text-xs font-semibold text-[#2C4349]">
                <ShieldCheck className="h-4 w-4" />
                <span>{isAr ? 'أمن الحسابات والمصادقة' : 'Identity & Access'}</span>
              </div>
              <SectionTitle
                title={
                  isAr
                    ? 'حماية الحسابات والمصادقة متعددة العوامل'
                    : 'Account Protection & Multi-Factor Auth'
                }
                align="center"
              />
              <p className="mt-4 text-base leading-relaxed text-[#54453D]/80 sm:text-lg">
                {isAr
                  ? 'منظومة حماية متكاملة تؤمّن وصول الكوادر الإدارية ومقدمي الخدمات وتمنع الاختراق وسرقة البيانات'
                  : 'Robust security architecture safeguarding administrative and staff access against unauthorized compromise'}
              </p>
            </div>
          </PageContainer>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20" dir={isAr ? 'rtl' : 'ltr'}>
          <PageContainer size="xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((item) => {
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

            <div className="mt-12 rounded-2xl bg-[#F0C5AE]/20 p-8 text-center">
              <div className="mx-auto flex max-w-2xl flex-col items-center">
                <CheckCircle2 className="h-8 w-8 text-[#16A34A]" />
                <h4 className="mt-3 text-base font-bold text-[#54453D]">
                  {isAr ? 'بيئة تشغيل آمنة ومحمية بالكامل' : 'End-to-End Enterprise Hardening'}
                </h4>
                <p className="mt-2 text-sm text-[#54453D]/80">
                  {isAr
                    ? 'كل محاولة دخول تُسجل وتُدقق في سجلات الرقابة (Audit Trails) لضمان حماية أصول المنشأة وسرية بيانات عملائها.'
                    : 'Every administrative request is logged in immutable audit trails ensuring full accountability across all salon operations.'}
                </p>
              </div>
            </div>
          </PageContainer>
        </section>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

