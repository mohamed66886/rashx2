import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { AccountingRepository, TenantBootstrapService } from '@/lib/firebase-server';

export const dynamic = 'force-dynamic';

export default async function TrialBalancePage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant } = session;
  const accRepo = new AccountingRepository();

  let accounts = await accRepo.listAccounts(tenant.tenantId);
  if (accounts.length === 0) {
    const bootstrap = new TenantBootstrapService();
    await bootstrap.reconcileTenant(tenant.tenantId);
  }

  const trialBalance = await accRepo.getTrialBalance(tenant.tenantId);

  const formatSAR = (halalas: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(halalas / 100) + ' ر.س';
  };

  const accountTypeLabels: Record<string, string> = {
    ASSET: 'أصول',
    LIABILITY: 'خصوم',
    EQUITY: 'حقوق ملكية',
    REVENUE: 'إيراد',
    COST_OF_GOODS: 'تكلفة إيراد',
    EXPENSE: 'مصروفات',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>⚖️</span> ميزان المراجعة بالأرصدة (Trial Balance Report)
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            تقرير مالي رسمي بموجب نظام القيد المزدوج يثبت توازن الأرصدة المدينة والدائنة.
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
            <span>{trialBalance.isBalanced ? 'ميزان المراجعة متزن 100%' : 'تنبيه: ميزان المراجعة غير متزن'}</span>
          </div>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-white rounded-3xl border border-[#54453D]/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF9F8] text-[#54453D]/60 border-b border-[#54453D]/5">
              <tr>
                <th className="px-6 py-3 font-semibold">رمز الحساب</th>
                <th className="px-6 py-3 font-semibold">اسم الحساب المالي</th>
                <th className="px-6 py-3 font-semibold">التصنيف</th>
                <th className="px-6 py-3 font-semibold text-left">الرصيد المدين (Debit)</th>
                <th className="px-6 py-3 font-semibold text-left">الرصيد الدائن (Credit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#54453D]/5">
              {trialBalance.items.map((item) => (
                <tr key={item.accountId} className="hover:bg-[#FAF9F8]/60 transition-colors">
                  <td className="px-6 py-3 font-mono font-bold text-[#54453D]">{item.accountCode}</td>
                  <td className="px-6 py-3 font-bold text-[#54453D]">{item.accountNameAr}</td>
                  <td className="px-6 py-3 text-[#54453D]/70">
                    <span className="bg-[#FAF9F8] px-2 py-0.5 rounded-md border border-[#54453D]/5 text-[11px]">
                      {accountTypeLabels[item.accountType] || item.accountType}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-left font-mono font-bold text-blue-800">
                    {item.debitBalanceHalalas > 0 ? formatSAR(item.debitBalanceHalalas) : '—'}
                  </td>
                  <td className="px-6 py-3 text-left font-mono font-bold text-emerald-800">
                    {item.creditBalanceHalalas > 0 ? formatSAR(item.creditBalanceHalalas) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#FAF9F8] font-bold border-t-2 border-[#54453D]/10">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right text-sm text-[#54453D]">
                  المجموع الكلي المتطابق:
                </td>
                <td className="px-6 py-4 text-left font-mono text-sm text-blue-900 font-black">
                  {formatSAR(trialBalance.totalDebitHalalas)}
                </td>
                <td className="px-6 py-4 text-left font-mono text-sm text-emerald-900 font-black">
                  {formatSAR(trialBalance.totalCreditHalalas)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

