import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { AccountingRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { PeriodsManager } from './periods-manager';

export const dynamic = 'force-dynamic';

export default async function PeriodsPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership } = session;
  const accRepo = new AccountingRepository();

  let fiscalYears = await accRepo.listFiscalYears(tenant.tenantId);
  if (fiscalYears.length === 0) {
    const bootstrap = new TenantBootstrapService();
    await bootstrap.reconcileTenant(tenant.tenantId);
    fiscalYears = await accRepo.listFiscalYears(tenant.tenantId);
  }

  const periods = await accRepo.listAccountingPeriods(tenant.tenantId);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
          <span>📅</span> الفترات المحاسبية والسنوات المالية (Fiscal Periods)
        </h2>
        <p className="text-xs text-[#54453D]/70 mt-1">
          إدارة إقفال الفترات الشهرية الـ 12 وحظر ترحيل القيود بأثر رجعي على الفترات المقفلة.
        </p>
      </div>

      <PeriodsManager
        fiscalYear={fiscalYears[0] || null}
        periods={periods}
        isOwner={membership.role === 'OWNER'}
      />
    </div>
  );
}

