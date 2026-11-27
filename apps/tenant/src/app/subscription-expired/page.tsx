import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { LogoutButton } from '../dashboard/logout-button';

export const dynamic = 'force-dynamic';

/* ------------------------------ icons ------------------------------ */
const ico = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

const HourglassIcon = ({ size = 40 }: { size?: number }) => (
  <svg {...ico} width={size} height={size}><path d="M6 3h12M6 21h12M7 3v3.5a5 5 0 0 0 2 4L12 12l-3 1.5a5 5 0 0 0-2 4V21M17 3v3.5a5 5 0 0 1-2 4L12 12l3 1.5a5 5 0 0 1 2 4V21" /></svg>
);
const ShieldIcon = () => (
  <svg {...ico} width={22} height={22}><path d="M12 3l7 3v5.5c0 4.2-2.9 7.7-7 9.5-4.1-1.8-7-5.3-7-9.5V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
);
const MailIcon = () => (
  <svg {...ico} width={18} height={18}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></svg>
);
const RefreshIcon = () => (
  <svg {...ico} width={18} height={18} className="transition-transform duration-500 group-hover:rotate-180"><path d="M20 11a8 8 0 0 0-14.5-4M4 5v3.5h3.5M4 13a8 8 0 0 0 14.5 4M20 19v-3.5h-3.5" /></svg>
);

/* --------------------------- small pieces -------------------------- */
const rise = (i: number): CSSProperties => ({ ['--d' as string]: `${i * 70}ms` });

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 text-sm lg:bg-[#FAF9F8]">
      <dt className="text-[#54453D]/60">{label}</dt>
      <dd className="m-0 text-end font-bold">{children}</dd>
    </div>
  );
}

function Actions({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <a
        href="mailto:support@rashx.org?subject=طلب%20تفعيل%20اشتراك%20صالون%20-%20"
        className="group inline-flex h-12 shrink-0 items-center md:flex-1 justify-center gap-2 rounded-xl bg-[#54453D] px-6 text-sm font-bold text-white transition-all duration-150 hover:bg-[#3D322C] active:scale-[0.97]"
      >
        <span className="transition-transform duration-200 group-hover:-translate-y-0.5"><MailIcon /></span>
        مراسلة الدعم
      </a>
      <Link
        href="/dashboard"
        className="group inline-flex h-12 shrink-0 items-center md:flex-1 justify-center gap-2 rounded-xl bg-[#F8E3D6] px-6 text-sm font-bold text-[#54453D] transition-all duration-150 hover:bg-[#F0C5AE] active:scale-[0.97]"
      >
        <RefreshIcon />
        تحقق من التفعيل
      </Link>
    </div>
  );
}

/* ------------------------------- page ------------------------------ */
export default async function SubscriptionExpiredPage() {
  const session = await getTenantSubscriptionSession();

  if (!session) {
    redirect('/login');
  }

  const { tenant, user, subscription, subscriptionEvaluation } = session;

  // If subscription was manually activated by platform admin, redirect to operational dashboard
  if (subscriptionEvaluation?.allowed) {
    redirect('/dashboard');
  }

  const trialEndsFormatted = subscription?.trialEndsAt
    ? new Date(subscription.trialEndsAt).toLocaleString('ar-SA', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Riyadh',
      })
    : 'منتهية';

  return (
    <main dir="rtl" className="flex min-h-dvh flex-col bg-[#FAF9F8] text-[#54453D]">
      {/* Header — same on every screen, collapses the user name on phones */}
      <header className="flex items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0C5AE] text-base font-bold">{tenant.name.charAt(0)}</span>
          <div className="min-w-0">
            <h1 className="m-0 truncate text-[15px] font-bold leading-tight">{tenant.name}</h1>
            <span dir="ltr" className="block truncate font-mono text-[11px] text-[#54453D]/60" style={{ textAlign: 'right' }}>{tenant.slug}.rashx.org</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden max-w-[220px] truncate text-sm text-[#54453D]/70 md:inline">{user.displayName || user.email}</span>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 items-center px-4 pb-32 pt-2 md:px-6 md:pb-10 lg:max-w-5xl lg:py-8">
        {/* phone: flat, on the page · tablet: single white card · desktop: split card */}
        <section className="w-full md:rounded-3xl md:bg-white lg:grid lg:grid-cols-[5fr_7fr] lg:overflow-hidden">
          {/* Status side */}
          <div className="rx-rise text-center md:px-8 md:pb-2 md:pt-10 lg:flex lg:flex-col lg:justify-between lg:bg-[#F0C5AE] lg:p-10 lg:text-start">
            <div>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0C5AE] text-[#54453D] lg:mx-0 lg:h-24 lg:w-24 lg:bg-[#FAF9F8]">
                <span className="rx-flip inline-flex"><HourglassIcon size={40} /></span>
              </div>
              <span className="mt-5 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 lg:bg-white">الاشتراك منتهي</span>
              <h2 className="m-0 mt-3 text-2xl font-black leading-snug lg:text-3xl">انتهت فترة التجربة المجانية</h2>
              <p className="mx-auto mb-0 mt-3 max-w-md text-sm leading-relaxed text-[#54453D]/80 lg:mx-0 lg:text-[15px] lg:text-[#54453D]">
                مرّت الـ 72 ساعة التجريبية لصالون <span className="font-bold">{tenant.name}</span>. عمليات النظام متوقفة مؤقتاً إلى أن تفعّل إدارة راش إكس اشتراككم.
              </p>
            </div>

            {/* desktop only: the date lives here, big and readable */}
            <div className="mt-10 hidden rounded-2xl bg-[#FAF9F8] p-4 lg:block">
              <div className="text-xs text-[#54453D]/60">انتهت التجربة في</div>
              <div className="mt-1 text-sm font-bold leading-snug">{trialEndsFormatted}</div>
            </div>
          </div>

          {/* Details side */}
          <div className="mt-6 space-y-4 md:px-8 md:pb-8 md:pt-6 lg:mt-0 lg:p-10">
            <dl className="m-0 flex flex-col gap-1.5">
              <div style={rise(1)} className="rx-rise"><Row label="المنشأة">{tenant.name}</Row></div>
              <div style={rise(2)} className="rx-rise"><Row label="النطاق"><span dir="ltr" className="font-mono">{tenant.slug}.rashx.org</span></Row></div>
              <div style={rise(3)} className="rx-rise"><Row label="الخطة">{subscription?.planId || 'STARTER'} (الأساسية)</Row></div>
              <div style={rise(4)} className="rx-rise lg:hidden"><Row label="انتهت في"><span className="text-red-700">{trialEndsFormatted}</span></Row></div>
            </dl>

            <div style={rise(5)} className="rx-rise flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-900">
              <span className="mt-0.5 shrink-0 text-emerald-700"><ShieldIcon /></span>
              <div>
                <p className="m-0 text-sm font-bold">بياناتكم محفوظة بالكامل</p>
                <p className="m-0 mt-1 text-xs leading-relaxed opacity-90">
                  الخدمات والحجوزات والموظفون وكل سجلات الصالون باقية في حسابكم. بمجرد تفعيل الاشتراك يعود العمل فوراً.
                </p>
              </div>
            </div>

            <div style={rise(6)} className="rx-rise">
              <h3 className="m-0 mb-1 text-sm font-bold">كيف أفعّل الاشتراك؟</h3>
              <p className="m-0 text-xs leading-relaxed text-[#54453D]/70">راسلوا الدعم وسيفعّل مسؤول راش إكس حسابكم يدوياً. بعدها اضغطوا «تحقق من التفعيل».</p>
            </div>

            {/* tablet + desktop: inline buttons */}
            <Actions className="hidden gap-3 md:flex" />
          </div>
        </section>
      </div>

      {/* phone: actions stay reachable with the thumb */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
        <Actions className="flex flex-col gap-2" />
      </div>

      <footer className="hidden px-6 py-4 text-center text-xs text-[#54453D]/40 md:block">
        نظام راش إكس السحابي للصالونات والسبا — المملكة العربية السعودية {new Date().getFullYear()}
      </footer>
    </main>
  );
}