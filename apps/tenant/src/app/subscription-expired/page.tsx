import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { LogoutButton } from '../dashboard/logout-button';

export const dynamic = 'force-dynamic';

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
    <main dir="rtl" className="min-h-screen bg-[#FAF9F8] text-[#54453D] flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-[#54453D]/10 px-6 py-4 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 font-black flex items-center justify-center text-lg">
              !
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
            <span className="text-xs text-[#54453D]/70 hidden sm:inline-block">
              {user.displayName || user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Expired Card */}
      <div className="max-w-2xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-8 border border-red-200/80 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 mx-auto flex items-center justify-center text-3xl mb-6 shadow-2xs">
            ⏳
          </div>

          <span className="inline-block rounded-full bg-red-100 text-red-800 px-3 py-1 text-xs font-bold mb-3">
            حالة الاشتراك: منتهي الصلاحية (EXPIRED)
          </span>

          <h2 className="text-2xl font-black text-[#54453D] mb-3">
            انتهت فترة التجربة المجانية (3 أيام)
          </h2>

          <p className="text-sm text-[#54453D]/80 leading-relaxed mb-6">
            لقد انتهت فترة الـ 72 ساعة التجريبية الممنوحة لصالونكم (<span className="font-bold">{tenant.name}</span>).
            تم تعليق العمليات التشغيلية مؤقتاً إلى حين اعتماد وتفعيل الاشتراك من قبل إدارة منصة راش إكس.
          </p>

          {/* Details Table */}
          <div className="bg-[#FAF9F8] rounded-2xl p-5 border border-[#54453D]/10 text-right mb-6 text-xs space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-[#54453D]/5">
              <span className="text-[#54453D]/60 font-medium">اسم المنشأة:</span>
              <span className="font-bold">{tenant.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#54453D]/5">
              <span className="text-[#54453D]/60 font-medium">النطاق التعريفي:</span>
              <span className="font-mono text-[#54453D]">{tenant.slug}.rashx.org</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#54453D]/5">
              <span className="text-[#54453D]/60 font-medium">الخطة المطلوبة:</span>
              <span className="font-bold">{subscription?.planId || 'STARTER'} (الأساسية)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#54453D]/60 font-medium">تاريخ انتهاء التجربة:</span>
              <span className="text-red-700 font-semibold">{trialEndsFormatted}</span>
            </div>
          </div>

          {/* Data Preservation Assurance */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4 text-xs text-emerald-900 leading-relaxed text-right mb-6 flex items-start gap-3">
            <span className="text-lg">🛡️</span>
            <div>
              <p className="font-bold">بياناتكم محفوظة بالكامل بأمان</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                كافة معلومات الصالون، والخدمات، وسجلات الحجوزات، والموظفين لا تزال محفوظة في حسابكم ولن يتم حذفها. فور اعتماد الاشتراك سيتم استئناف العمل فوراً.
              </p>
            </div>
          </div>

          {/* Contact Support & Next Action */}
          <div className="border-t border-[#54453D]/10 pt-6 space-y-4">
            <h4 className="text-xs font-bold text-[#54453D]">
              كيفية تفعيل الاشتراك واستعادة الوصول:
            </h4>
            <p className="text-xs text-[#54453D]/70 leading-relaxed">
              يرجى التواصل مع إدارة المنصة لتأكيد الاشتراك وسيقوم مسؤول راش إكس بتفعيل حسابكم يدوياً:
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href="mailto:support@rashx.org?subject=طلب%20تفعيل%20اشتراك%20صالون%20-%20"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#54453D] text-white text-xs font-bold shadow-2xs hover:bg-[#3D322C] transition-colors"
              >
                <span>✉️</span>
                <span>مراسلة الدعم: support@rashx.org</span>
              </a>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-[#54453D]/20 text-[#54453D] text-xs font-bold hover:bg-[#FAF9F8] transition-colors"
              >
                <span>🔄</span>
                <span>التحقق من تفعيل الحساب</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-[#54453D]/40 border-t border-[#54453D]/5">
        نظام راش إكس السحابي للصالونات والسبا — المملكة العربية السعودية 2026
      </footer>
    </main>
  );
}

