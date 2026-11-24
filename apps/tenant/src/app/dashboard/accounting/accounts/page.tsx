import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { AccountingRepository, TenantBootstrapService } from '@/lib/firebase-server';
import type { AccountType } from '@rashx/database';

export const dynamic = 'force-dynamic';

export default async function ChartOfAccountsPage() {
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
    accounts = await accRepo.listAccounts(tenant.tenantId);
  }

  const balances = await accRepo.listAccountBalances(tenant.tenantId);
  const balanceMap = new Map(balances.map((b) => [b.accountId, b]));

  const categoryLabels: Record<AccountType, { title: string; color: string; icon: string }> = {
    ASSET: { title: '1. الأصول والموجودات (Assets)', color: 'text-blue-900 bg-blue-50/60 border-blue-200', icon: '🏛️' },
    LIABILITY: { title: '2. الخصوم والالتزامات (Liabilities)', color: 'text-amber-900 bg-amber-50/60 border-amber-200', icon: '💳' },
    EQUITY: { title: '3. حقوق الملكية ورأس المال (Equity)', color: 'text-purple-900 bg-purple-50/60 border-purple-200', icon: '💎' },
    REVENUE: { title: '4. الإيرادات والمبيعات (Revenue)', color: 'text-emerald-900 bg-emerald-50/60 border-emerald-200', icon: '📈' },
    COST_OF_GOODS: { title: '5. تكلفة الإيراد والبضاعة (COGS)', color: 'text-orange-900 bg-orange-50/60 border-orange-200', icon: '📦' },
    EXPENSE: { title: '6. المصروفات التشغيلية (Expenses)', color: 'text-rose-900 bg-rose-50/60 border-rose-200', icon: '📉' },
  };

  const categories: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'COST_OF_GOODS', 'EXPENSE'];

  const formatSAR = (halalas: number) => {
    const sar = halalas / 100;
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(sar) + ' ر.س';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>📋</span> شجرة الحسابات المعتمدة (Chart of Accounts)
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            دليل الحسابات الموحد لقطاع صالونات التجميل في السعودية وفقاً للمعايير المحاسبية المعتمدة (SOCPA).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#91B8C0]/20 text-[#2C4349] font-bold px-3 py-1.5 rounded-xl border border-[#91B8C0]/30">
            إجمالي الحسابات: {accounts.length}
          </span>
        </div>
      </div>

      {/* Account Categories Accordions / Tables */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const catAccounts = accounts.filter((a) => a.type === cat);
          const meta = categoryLabels[cat];

          return (
            <div
              key={cat}
              className="bg-white rounded-3xl border border-[#54453D]/10 overflow-hidden shadow-2xs"
            >
              <div className={`px-6 py-4 border-b border-[#54453D]/10 flex items-center justify-between ${meta.color}`}>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span>{meta.icon}</span>
                  <span>{meta.title}</span>
                </h3>
                <span className="text-xs font-mono font-bold">
                  {catAccounts.length} حساب
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#FAF9F8] text-[#54453D]/60 border-b border-[#54453D]/5">
                    <tr>
                      <th className="px-6 py-3 font-semibold">رمز الحساب</th>
                      <th className="px-6 py-3 font-semibold">اسم الحساب (عربي / إنجليزي)</th>
                      <th className="px-6 py-3 font-semibold">طبيعة الحساب</th>
                      <th className="px-6 py-3 font-semibold">النوع والترحيل</th>
                      <th className="px-6 py-3 font-semibold text-left">الرصيد الحالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#54453D]/5">
                    {catAccounts.map((acc) => {
                      const bal = balanceMap.get(acc.id);
                      const net = bal?.netBalanceHalalas || 0;

                      return (
                        <tr
                          key={acc.id}
                          className={`hover:bg-[#FAF9F8]/60 transition-colors ${
                            !acc.isPosting ? 'bg-[#FAF9F8]/30 font-bold' : ''
                          }`}
                        >
                          <td className="px-6 py-3.5 font-mono font-bold text-[#54453D]">
                            {acc.code}
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                              {acc.accountLevel > 1 && (
                                <span className="text-[#91B8C0] font-mono">↳</span>
                              )}
                              <span className="text-[#54453D]">{acc.nameAr}</span>
                            </div>
                            {acc.nameEn && (
                              <div className="text-[11px] text-[#54453D]/50 font-mono">
                                {acc.nameEn}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                acc.normalBalance === 'DEBIT'
                                  ? 'bg-blue-50 text-blue-800'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {acc.normalBalance === 'DEBIT' ? 'مدين (Debit)' : 'دائن (Credit)'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                acc.isPosting
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {acc.isPosting ? 'يقبل القيود (Posting)' : 'تجميعي رئيسي (Summary)'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-left font-mono font-bold text-[#54453D]">
                            {acc.isPosting ? formatSAR(net) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

