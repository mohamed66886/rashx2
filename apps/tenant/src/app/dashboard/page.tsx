import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/lib/dashboard-session';
import { getFirebaseAdminFirestore, firestorePaths } from '@/lib/firebase-server';
import type { CommercialRegistrationDoc } from '@rashx/database';
import { Icon, type IconName } from './nav-config';

export const dynamic = 'force-dynamic';

const roleLabels: Record<string, string> = {
  OWNER: 'مالك المنشأة',
  MANAGER: 'مدير الصالون',
  STAFF: 'مقدم خدمة / فريق العمل',
};

const SHORTCUTS: { href: string; icon: IconName; title: string; desc: string }[] = [
  { href: '/dashboard/operations', icon: 'activity', title: 'التشغيل اليومي', desc: 'لوحة اليوم وطابور الانتظار وتسجيل العملاء الفوريين.' },
  { href: '/dashboard/bookings', icon: 'calendar', title: 'الحجوزات والمواعيد', desc: 'إدارة الحجوزات وتقويم المواعيد.' },
  { href: '/dashboard/pos', icon: 'receipt', title: 'نقطة البيع والفوترة', desc: 'الكاشير والفواتير والمدفوعات وجلسات الصندوق.' },
  { href: '/dashboard/customers', icon: 'user-check', title: 'العملاء', desc: 'سجل العملاء وبياناتهم.' },
  { href: '/dashboard/inventory', icon: 'package', title: 'المخزون والمشتريات', desc: 'المنتجات والأرصدة والموردون وأوامر الشراء.' },
  { href: '/dashboard/branches', icon: 'building', title: 'إدارة الفروع ومواقع الصالون', desc: 'عرض الفرع الرئيسي، وتحديث بيانات التواصل ومواعيد العمل الأسبوعية.' },
  { href: '/dashboard/accounting', icon: 'wallet', title: 'المحاسبة والقيود ودفتر الأستاذ', desc: 'شجرة الحسابات المعتمدة، قيد اليومية المزدوج، ميزان المراجعة، ومراكز التكلفة.' },
  { href: '/dashboard/settings/profile', icon: 'settings', title: 'إعدادات المنشأة والامتثال الضريبي', desc: 'تحديث العنوان الوطني (SPL)، الرقم الموحد 700، وحالة ضريبة القيمة المضافة 15%.' },
];

const CR = {
  PENDING_REVIEW: {
    label: 'قيد المراجعة والتدقيق',
    text: 'تم استلام شهادة السجل التجاري وجاري مطابقتها وتدقيقها من قبل فريق الامتثال في راش إكس.',
    tone: 'bg-[#F8E3D6] border-[#F0C5AE]',
    chip: 'bg-[#F0C5AE]',
    icon: <path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  },
  APPROVED: {
    label: 'موثق ومعتمد رسمياً',
    text: 'تم التحقق من السجل التجاري بنجاح. منشأتك موثقة بالكامل في المنصة.',
    tone: 'bg-[#E3EEF0] border-[#91B8C0]',
    chip: 'bg-[#91B8C0]',
    icon: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  },
  REJECTED: {
    label: 'مرفوض - يلزم إعادة الرفع',
    text: 'تعذر اعتماد السجل التجاري. يرجى التواصل مع الدعم الفني أو إعادة رفع الشهادة.',
    tone: 'bg-[#FBEAE7] border-[#A8473B]',
    chip: 'bg-[#A8473B] text-white',
    icon: <path d="M12 8v5M12 16.5v.01M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />,
  },
} as const;

function StatusIcon({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${className}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
    </span>
  );
}

/** Streams in on its own: the rest of the page paints without waiting for Firestore. */
async function CrStatusCard({ tenantId }: { tenantId: string }) {
  const db = getFirebaseAdminFirestore();
  const snap = await db.doc(firestorePaths.commercialRegistration(tenantId)).get();
  const record = snap.exists ? (snap.data() as CommercialRegistrationDoc) : null;
  const status = (record?.status || 'PENDING_REVIEW') as keyof typeof CR;
  const cr = CR[status] ?? CR.PENDING_REVIEW;

  return (
    <div className={`flex h-full flex-col justify-between gap-4 rounded-3xl border p-5 ${cr.tone}`}>
      <div className="flex items-start gap-4">
        <StatusIcon className={cr.chip}>{cr.icon}</StatusIcon>
        <div>
          <h3 className="m-0 text-[15px] font-bold">حالة توثيق السجل التجاري: {cr.label}</h3>
          <p className="mt-1 text-[13px] leading-6">{cr.text}</p>
        </div>
      </div>
      {record && <div className="self-start rounded-lg bg-white px-3 py-1.5 font-mono text-xs">رقم السجل: {record.crNumber}</div>}
    </div>
  );
}

function CrSkeleton() {
  return <div aria-hidden="true" className="h-full min-h-[148px] animate-pulse rounded-3xl border border-[#E6DDD6] bg-white" />;
}

export default async function TenantDashboardPage() {
  const sessionData = await getDashboardSession();
  if (!sessionData) redirect('/login');

  const { user, tenant, membership, subscription, subscriptionEvaluation } = sessionData;
  const firstName = (user.displayName || '').trim().split(/\s+/)[0];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F0C5AE] p-6 sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/symbol-rx-ink.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-12 w-64 opacity-[0.09]" />
        <p className="relative m-0 text-sm font-bold">{tenant.name}</p>
        <h1 className="relative mt-1 text-[28px] font-bold leading-tight sm:text-[34px]">{firstName ? `أهلًا، ${firstName}` : 'أهلًا بك'}</h1>
        <p className="relative mt-2 max-w-xl text-[15px] leading-7">هذه نظرة سريعة على حالة منشأتك واشتراكك. ابدأ من الاختصارات أدناه أو اضغط Ctrl/⌘+K للانتقال لأي صفحة.</p>
      </section>

      {/* Status row */}
      <section aria-label="حالة الاشتراك والتوثيق" className="grid gap-4 lg:grid-cols-2">
        {subscriptionEvaluation?.isTrial ? (
          <div className="flex h-full flex-col justify-between gap-4 rounded-3xl border border-[#91B8C0] bg-[#E3EEF0] p-5">
            <div className="flex items-start gap-4">
              <StatusIcon className="bg-[#91B8C0]"><path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></StatusIcon>
              <div>
                <h3 className="m-0 flex flex-wrap items-center gap-2 text-[15px] font-bold">
                  فترة تجربة مجانية (3 أيام)
                  <span className="rounded-full bg-[#54453D] px-2.5 py-0.5 font-mono text-[11px] text-white">متبقي {subscriptionEvaluation.remainingTrialHours} ساعة</span>
                </h3>
                <p className="mt-1 text-[13px] leading-6">
                  صالونكم قيد التجربة التشغيلية الكاملة حتى{' '}
                  <span className="font-mono font-bold">
                    {new Date(subscriptionEvaluation.trialEndsAt).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Riyadh' })}
                  </span>
                  . جميع المزايا التشغيلية متاحة بالكامل.
                </p>
              </div>
            </div>
            <div className="self-start rounded-lg bg-white px-3 py-1.5 text-xs font-bold">باقة التجربة: {subscription?.planId || 'STARTER'}</div>
          </div>
        ) : subscriptionEvaluation?.effectiveStatus === 'ACTIVE' ? (
          <div className="flex h-full flex-col justify-between gap-4 rounded-3xl border border-[#91B8C0] bg-[#E3EEF0] p-5">
            <div className="flex items-start gap-4">
              <StatusIcon className="bg-[#91B8C0]"><path d="M5 12.5l4.5 4.5L19 7.5" /></StatusIcon>
              <div>
                <h3 className="m-0 text-[15px] font-bold">اشتراك الصالون مفعل ونشط رسمياً</h3>
                <p className="mt-1 text-[13px] leading-6">
                  تم اعتماد وتفعيل اشتراككم من قبل إدارة المنصة
                  {subscription?.currentPeriodEndsAt ? ` وساري حتى ${new Date(subscription.currentPeriodEndsAt).toLocaleDateString('ar-SA', { timeZone: 'Asia/Riyadh' })}.` : '.'}
                </p>
              </div>
            </div>
            <div className="self-start rounded-lg bg-white px-3 py-1.5 text-xs font-bold">باقة: {subscription?.planId || 'STARTER'} (ACTIVE)</div>
          </div>
        ) : (
          <div className="hidden lg:block" />
        )}

        <Suspense fallback={<CrSkeleton />}>
          <CrStatusCard tenantId={tenant.tenantId} />
        </Suspense>
      </section>

      {/* Key facts */}
      <dl className="m-0 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['حالة المنشأة', tenant.status === 'ACTIVE' ? 'نشط وقيد التشغيل' : tenant.status, true],
          ['الباقة الحالية', `${tenant.subscriptionTier} (الأساسية)`, false],
          ['المنطقة الزمنية والعملة', `${tenant.currency} • ${tenant.timezone}`, false],
          ['دورك الحالي', roleLabels[membership.role] || membership.role, false],
        ].map(([k, v, dot]) => (
          <div key={String(k)} className="rounded-2xl border border-[#E6DDD6] bg-white p-4">
            <dt className="text-xs text-[#6B5B52]">{k}</dt>
            <dd className="m-0 mt-1.5 flex items-center gap-2 text-[15px] font-bold">
              {dot && <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#91B8C0]" />}
              <span className="min-w-0 break-words">{v}</span>
            </dd>
          </div>
        ))}
      </dl>

      {/* Shortcuts */}
      <section aria-label="اختصارات">
        <h2 className="m-0 mb-3 text-lg font-bold">اختصارات</h2>
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4">
          {SHORTCUTS.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="group flex h-full flex-col gap-3 rounded-2xl border border-[#E6DDD6] bg-white p-5 transition-colors hover:border-[#54453D]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8E3D6] transition-colors group-hover:bg-[#F0C5AE]"><Icon name={s.icon} size={20} /></span>
                <span className="text-[15px] font-bold leading-snug">{s.title}</span>
                <span className="text-[13px] leading-6 text-[#6B5B52]">{s.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
