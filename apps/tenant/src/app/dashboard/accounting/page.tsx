import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { AccountingRepository, TenantBootstrapService } from '@/lib/firebase-server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccountingOverviewPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant } = session;
  const accRepo = new AccountingRepository();
  let accounts = await accRepo.listAccounts(tenant.tenantId);

  // Self-healing: if no chart of accounts, reconcile tenant
  if (accounts.length === 0) {
    const bootstrap = new TenantBootstrapService();
    await bootstrap.reconcileTenant(tenant.tenantId);
    accounts = await accRepo.listAccounts(tenant.tenantId);
  }

  const [balances, trialBalance, periods] = await Promise.all([
    accRepo.listAccountBalances(tenant.tenantId),
    accRepo.getTrialBalance(tenant.tenantId),
    accRepo.listAccountingPeriods(tenant.tenantId),
  ]);

  const currentPeriod = periods.find((p) => p.status === 'OPEN') || periods[0];

  // Group balances by account type in Halalas
  const typeTotalsHalalas = {
    ASSET: 0,
    LIABILITY: 0,
    EQUITY: 0,
    REVENUE: 0,
    COST_OF_GOODS: 0,
    EXPENSE: 0,
  };

  for (const b of balances) {
    if (b.accountType in typeTotalsHalalas) {
      typeTotalsHalalas[b.accountType] += b.netBalanceHalalas;
    }
  }

  const formatSAR = (halalas: number) => {
    const sar = halalas / 100;
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(sar) + ' ر.س';
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>💰</span> المركز المالي والمحاسبة (Accounting Core)
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            نظام القيد المزدوج، شجرة الحسابات السعودية المعتمدة، ومراقبة التوازن المالي بالهللات.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              trialBalance.isBalanced
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span>{trialBalance.isBalanced ? '✓' : '⚠️'}</span>
            <span>{trialBalance.isBalanced ? 'ميزان المراجعة متزن' : 'غير متزن'}</span>
          </div>

          {currentPeriod && (
            <div className="text-xs bg-[#91B8C0]/20 text-[#2C4349] font-bold px-3 py-1.5 rounded-xl border border-[#91B8C0]/30">
              الفترة الحالية: {currentPeriod.nameAr}
            </div>
          )}
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#54453D]/10 shadow-2xs">
          <span className="text-[11px] font-bold text-[#54453D]/60 block mb-1">
            إجمالي الأصول (Assets)
          </span>
          <span className="text-base font-black text-[#54453D] font-mono">
            {formatSAR(typeTotalsHalalas.ASSET)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#54453D]/10 shadow-2xs">
          <span className="text-[11px] font-bold text-[#54453D]/60 block mb-1">
            الالتزامات والخصوم (Liabilities)
          </span>
          <span className="text-base font-black text-[#54453D] font-mono">
            {formatSAR(typeTotalsHalalas.LIABILITY)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#54453D]/10 shadow-2xs">
          <span className="text-[11px] font-bold text-[#54453D]/60 block mb-1">
            حقوق الملكية (Equity)
          </span>
          <span className="text-base font-black text-[#54453D] font-mono">
            {formatSAR(typeTotalsHalalas.EQUITY)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#54453D]/10 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 block mb-1">
            الإيرادات التشغيلية (Revenue)
          </span>
          <span className="text-base font-black text-emerald-700 font-mono">
            {formatSAR(typeTotalsHalalas.REVENUE)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#54453D]/10 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-800 block mb-1">
            المصروفات والتكلفة (Expenses)
          </span>
          <span className="text-base font-black text-amber-700 font-mono">
            {formatSAR(typeTotalsHalalas.COST_OF_GOODS + typeTotalsHalalas.EXPENSE)}
          </span>
        </div>
      </div>

      {/* Navigation Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/accounting/accounts"
          className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs hover:border-[#54453D]/30 transition-all block group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-[#54453D] flex items-center gap-2">
              <span>📋</span> شجرة الحسابات (Chart of Accounts)
            </h3>
            <span className="text-xs text-[#91B8C0] font-bold group-hover:translate-x-1 transition-transform">←</span>
          </div>
          <p className="text-xs text-[#54453D]/70 mb-3">
            عرض وتصنيف الحسابات الـ 22 المعتمدة بالمملكة، الحسابات الرئيسية والفرعية، وأرصدتها الحالية.
          </p>
          <span className="text-xs font-bold text-[#2C4349] bg-[#91B8C0]/20 px-2.5 py-1 rounded-lg">
            {accounts.length} حساب مسجل
          </span>
        </Link>

        <Link
          href="/dashboard/accounting/journals"
          className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs hover:border-[#54453D]/30 transition-all block group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-[#54453D] flex items-center gap-2">
              <span>✍️</span> القيود اليومية (Journal Entries)
            </h3>
            <span className="text-xs text-[#91B8C0] font-bold group-hover:translate-x-1 transition-transform">←</span>
          </div>
          <p className="text-xs text-[#54453D]/70 mb-3">
            تسجيل وترحيل قيود اليومية المزدوجة (مدين/دائن)، الترقيم التسلسلي، وعكس القيود.
          </p>
          <span className="text-xs font-bold text-[#54453D] bg-[#FAF9F8] border border-[#54453D]/10 px-2.5 py-1 rounded-lg">
            إدارة القيود والترحيل
          </span>
        </Link>

        <Link
          href="/dashboard/accounting/trial-balance"
          className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs hover:border-[#54453D]/30 transition-all block group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-[#54453D] flex items-center gap-2">
              <span>⚖️</span> ميزان المراجعة (Trial Balance)
            </h3>
            <span className="text-xs text-[#91B8C0] font-bold group-hover:translate-x-1 transition-transform">←</span>
          </div>
          <p className="text-xs text-[#54453D]/70 mb-3">
            تقرير مالي شامل يطابق مجموع الأرصدة المدينة مع الدائنة ويضمن سلامة الدفاتر المحاسبية.
          </p>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            توازن فوري لحظي
          </span>
        </Link>
      </div>
    </div>
  );
}

