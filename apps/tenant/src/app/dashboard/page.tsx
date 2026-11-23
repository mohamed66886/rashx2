import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { getFirebaseAdminFirestore, firestorePaths } from '@/lib/firebase-server';
import { LogoutButton } from './logout-button';
import type { CommercialRegistrationDoc } from '@rashx/database';

export const dynamic = 'force-dynamic';

export default async function TenantDashboardPage() {
  const sessionData = await getTenantSubscriptionSession();

  if (!sessionData) {
    redirect('/login');
  }

  const { user, tenant, membership, subscription, subscriptionEvaluation } = sessionData;

  // Strict Server Guard: if subscription has expired or is restricted, redirect to expired renewal view
  if (!subscriptionEvaluation?.allowed) {
    redirect('/subscription-expired');
  }

  // Retrieve Commercial Registration status from private Firestore collection
  const db = getFirebaseAdminFirestore();
  const crSnap = await db.doc(firestorePaths.commercialRegistration(tenant.tenantId)).get();
  const crRecord = crSnap.exists ? (crSnap.data() as CommercialRegistrationDoc) : null;

  const roleLabels: Record<string, string> = {
    OWNER: 'مالك المنشأة',
    MANAGER: 'مدير الصالون',
    STAFF: 'مقدم خدمة / فريق العمل',
  };

  const crStatusBadges: Record<string, { label: string; class: string }> = {
    PENDING_REVIEW: {
      label: 'قيد المراجعة والتدقيق',
      class: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    APPROVED: {
      label: 'موثق ومعتمد رسمياً',
      class: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    REJECTED: {
      label: 'مرفوض - يلزم إعادة الرفع',
      class: 'bg-red-50 text-red-800 border-red-200',
    },
  };

  const defaultCrBadge = {
    label: 'قيد المراجعة والتدقيق',
    class: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  const currentCrStatus = crRecord?.status || 'PENDING_REVIEW';
  const crBadge = crStatusBadges[currentCrStatus] ?? defaultCrBadge;

  return (
    <main dir="rtl" className="min-h-screen bg-[#FAF9F8] text-[#54453D] flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="bg-white border-b border-[#54453D]/10 px-6 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#91B8C0]/30 text-[#2C4349] font-black flex items-center justify-center text-lg shadow-2xs">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-base font-bold text-[#54453D] leading-tight">
                {tenant.name}
              </h1>
              <span className="text-xs text-[#54453D]/60 font-mono">
                {tenant.slug}.rashx.org
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-[#54453D]">
                {user.displayName || user.email}
              </p>
              <span className="inline-block rounded-md bg-[#F0C5AE]/40 px-2 py-0.5 text-[11px] font-semibold text-[#54453D]">
                {roleLabels[membership.role] || membership.role}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        {/* Subscription Status Alert Banner */}
        {subscriptionEvaluation?.isTrial ? (
          <div className="mb-6 p-5 rounded-2xl border border-[#91B8C0]/40 bg-[#91B8C0]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[#2C4349]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span>فترة تجربة مجانية (3 أيام)</span>
                  <span className="rounded-full bg-[#2C4349] text-white px-2 py-0.5 text-[10px] font-mono">
                    متبقي {subscriptionEvaluation.remainingTrialHours} ساعة
                  </span>
                </h3>
                <p className="text-xs mt-0.5 opacity-90">
                  صالونكم قيد التجربة التشغيلية الكاملة حتى{' '}
                  <span className="font-semibold font-mono">
                    {new Date(subscriptionEvaluation.trialEndsAt).toLocaleString('ar-SA', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Asia/Riyadh',
                    })}
                  </span>
                  . جميع المزايا التشغيلية متاحة بالكامل.
                </p>
              </div>
            </div>

            <div className="text-xs font-bold bg-white/80 px-3.5 py-1.5 rounded-xl border border-[#91B8C0]/30 self-stretch sm:self-auto text-center shrink-0">
              باقة التجربة: {subscription?.planId || 'STARTER'}
            </div>
          </div>
        ) : subscriptionEvaluation?.effectiveStatus === 'ACTIVE' ? (
          <div className="mb-6 p-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-emerald-900">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💎</span>
              <div>
                <h3 className="text-sm font-bold">
                  اشتراك الصالون مفعل ونشط رسمياً
                </h3>
                <p className="text-xs mt-0.5 opacity-90">
                  تم اعتماد وتفعيل اشتراككم من قبل إدارة المنصة
                  {subscription?.currentPeriodEndsAt
                    ? ` وساري حتى ${new Date(subscription.currentPeriodEndsAt).toLocaleDateString('ar-SA', { timeZone: 'Asia/Riyadh' })}.`
                    : '.'}
                </p>
              </div>
            </div>
            <div className="text-xs font-bold bg-white/80 px-3.5 py-1.5 rounded-xl border border-emerald-200 self-stretch sm:self-auto text-center shrink-0">
              باقة: {subscription?.planId || 'STARTER'} (ACTIVE)
            </div>
          </div>
        ) : null}

        {/* Verification Status Alert */}
        <div
          className={`mb-8 p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${crBadge.class}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="text-sm font-bold">
                حالة توثيق السجل التجاري: {crBadge.label}
              </h3>
              <p className="text-xs mt-0.5 opacity-90">
                {currentCrStatus === 'PENDING_REVIEW'
                  ? 'تم استلام شهادة السجل التجاري وجاري مطابقتها وتدقيقها من قبل فريق الامتثال في راش إكس.'
                  : currentCrStatus === 'APPROVED'
                  ? 'تم التحقق من السجل التجاري بنجاح. منشأتك موثقة بالكامل في المنصة.'
                  : 'تعذر اعتماد السجل التجاري. يرجى التواصل مع الدعم الفني أو إعادة رفع الشهادة.'}
              </p>
            </div>
          </div>

          {crRecord && (
            <div className="text-xs font-mono bg-white/70 px-3 py-1.5 rounded-lg border border-black/5 self-stretch sm:self-auto text-center">
              رقم السجل: {crRecord.crNumber}
            </div>
          )}
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#54453D]/10 shadow-2xs">
            <span className="text-xs text-[#54453D]/60 block mb-1">حالة المنشأة</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-base font-bold text-[#54453D]">
                {tenant.status === 'ACTIVE' ? 'نشط وقيد التشغيل' : tenant.status}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#54453D]/10 shadow-2xs">
            <span className="text-xs text-[#54453D]/60 block mb-1">الباقة الحالية</span>
            <span className="text-base font-bold text-[#54453D]">
              {tenant.subscriptionTier} (الأساسية)
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#54453D]/10 shadow-2xs">
            <span className="text-xs text-[#54453D]/60 block mb-1">المنطقة الزمنية والعملة</span>
            <span className="text-base font-bold text-[#54453D]">
              {tenant.currency} • {tenant.timezone}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#54453D]/10 shadow-2xs">
            <span className="text-xs text-[#54453D]/60 block mb-1">دورك الحالي</span>
            <span className="text-base font-bold text-[#54453D]">
              {roleLabels[membership.role] || membership.role}
            </span>
          </div>
        </div>

        {/* Operational Workspace Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
            <h3 className="font-bold text-sm text-[#54453D] mb-2 flex items-center gap-2">
              <span>📅</span> المواعيد والحجوزات
            </h3>
            <p className="text-xs text-[#54453D]/70 mb-4">
              إدارة جدول المواعيد وحجوزات العملاء المباشرة والفورية.
            </p>
            <div className="text-xs bg-[#FAF9F8] p-3 rounded-xl border border-[#54453D]/5 text-[#54453D]/60">
              جاهز لاستقبال الحجوزات مع قفل المواعيد التزامني.
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
            <h3 className="font-bold text-sm text-[#54453D] mb-2 flex items-center gap-2">
              <span>💇‍♀️</span> فريق العمل والمصففات
            </h3>
            <p className="text-xs text-[#54453D]/70 mb-4">
              إدارة الكادر، جداول الحضور، وتحديد الصلاحيات الميدانية.
            </p>
            <div className="text-xs bg-[#FAF9F8] p-3 rounded-xl border border-[#54453D]/5 text-[#54453D]/60">
              عضوية المالك مسجلة بنجاح برتبة OWNER.
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
            <h3 className="font-bold text-sm text-[#54453D] mb-2 flex items-center gap-2">
              <span>✂️</span> قائمة الخدمات والأسعار
            </h3>
            <p className="text-xs text-[#54453D]/70 mb-4">
              إعداد باقات التجميل وتخصيص الأسعار والمدد الزمنية للخدمات.
            </p>
            <div className="text-xs bg-[#FAF9F8] p-3 rounded-xl border border-[#54453D]/5 text-[#54453D]/60">
              تكامل التسعير والضريبة متوافق مع نظام الفاتورة الإلكترونية.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#54453D]/10 bg-white px-6 py-4 text-center text-xs text-[#54453D]/50">
        منظومة راش إكس (RASHX) — لوحة التحكم التشغيلية للصالون © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
