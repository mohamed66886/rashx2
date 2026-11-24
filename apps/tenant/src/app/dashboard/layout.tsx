import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { TenantBootstrapService } from '@rashx/database/server';
import { LogoutButton } from './logout-button';
import { DashboardNav } from './dashboard-nav';
import { DashboardHeader } from './dashboard-header';
import './dashboard-anim.css';

export const dynamic = 'force-dynamic';

const FONT = "'Ping AR + LT','IBM Plex Sans Arabic',Tahoma,sans-serif";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getTenantSubscriptionSession();

  if (!sessionData) {
    redirect('/login');
  }

  const { user, tenant, membership, subscriptionEvaluation } = sessionData;

  // Strict Server Guard: if subscription has expired, redirect to expired page
  if (!subscriptionEvaluation?.allowed) {
    redirect('/subscription-expired');
  }

  // Strict Server Guard: verify tenant foundational bootstrap is READY
  const bootstrapService = new TenantBootstrapService();
  let bootstrapStatus = await bootstrapService.getBootstrapStatus(tenant.tenantId);
  if (!bootstrapStatus || bootstrapStatus.status !== 'READY') {
    try {
      const recon = await bootstrapService.reconcileTenant(tenant.tenantId);
      bootstrapStatus = recon.bootstrapStatus;
    } catch (err) {
      console.error('[DashboardLayout] Failed to reconcile tenant bootstrap:', err);
    }
  }

  if (!bootstrapStatus || bootstrapStatus.status !== 'READY') {
    return (
      <div dir="rtl" style={{ fontFamily: FONT }} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAF9F8] p-6 text-[#54453D]">
        <div aria-hidden="true" className="absolute -right-48 -top-52 h-[520px] w-[520px] rounded-full bg-[#F0C5AE]" />
        <div aria-hidden="true" className="absolute -bottom-56 -left-44 h-[520px] w-[520px] rounded-full bg-[#91B8C0]" />
        <div role="status" className="relative w-full max-w-[520px] rounded-[28px] bg-white p-8 text-center shadow-[0_30px_80px_rgba(84,69,61,0.14)] sm:p-10">
          <div className="relative mx-auto flex h-[104px] w-[104px] items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#E6DDD6]" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[#91B8C0] border-t-[#54453D] motion-reduce:animate-none" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/symbol-rx-ink.svg" alt="" aria-hidden="true" className="w-9" />
          </div>
          <h2 className="mb-2 mt-6 text-2xl font-bold">جاري تهيئة البيانات التأسيسية للمنشأة</h2>
          <p className="mb-7 text-[15px] leading-[1.8] text-[#6B5B52]">
            النظام يعمل الآن على استكمال شجرة الحسابات والفرع الرئيسي والإعدادات القانونية. يرجى الانتظار لحظات وتحديث الصفحة.
          </p>
          <a
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#54453D] px-7 text-[15px] font-bold text-[#FAF9F8] transition hover:bg-[#433730]"
          >
            تحديث الصفحة
          </a>
        </div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    OWNER: 'مالك المنشأة',
    MANAGER: 'مدير الصالون',
    STAFF: 'مقدم خدمة / فريق العمل',
  };
  const userName = user.displayName || user.email;
  const roleLabel = roleLabels[membership.role] || membership.role;

  return (
    <div dir="rtl" style={{ fontFamily: FONT }} className="flex min-h-screen flex-col bg-[#FAF9F8] text-[#54453D] lg:flex-row">
      {/* Sidebar (desktop) + top bar & drawer (mobile) */}
      <DashboardNav
        tenantName={tenant.name}
        tenantSlug={tenant.slug}
        userName={userName}
        roleLabel={roleLabel}
        logout={<LogoutButton />}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop top bar: breadcrumb, quick search (Ctrl/⌘+K), copy link, user menu */}
        <DashboardHeader userName={userName} roleLabel={roleLabel} tenantSlug={tenant.slug} logout={<LogoutButton variant="menu" />} />

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>

        <footer className="border-t border-[#E6DDD6] bg-white px-6 py-4 text-center text-xs text-[#6B5B52]">
          منظومة راش إكس (RASHX) — لوحة التحكم التشغيلية للصالون © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
