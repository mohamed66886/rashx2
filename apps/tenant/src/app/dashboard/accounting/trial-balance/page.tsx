import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { AccountingRepository, TenantBootstrapService } from '@/lib/firebase-server';
import { PrintButton } from './print-button';

export const dynamic = 'force-dynamic';

/* ------------------------------ icons ------------------------------ */
const ico = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const Svg = ({ size = 20, children }: { size?: number; children: ReactNode }) => (
  <svg {...ico} width={size} height={size}>{children}</svg>
);
const ScaleIcon = () => <Svg size={24}><path d="M12 4v16M8 20h8M5 7h14M5 7l-3 7a3 3 0 0 0 6 0L5 7zM19 7l-3 7a3 3 0 0 0 6 0l-3-7z" /></Svg>;
const CheckIcon = () => <Svg size={16}><path d="M5 12.5l4.5 4.5L19 7.5" strokeWidth={2.4} /></Svg>;
const AlertIcon = () => <Svg size={16}><path d="M12 4l9 16H3L12 4zM12 10v4M12 17h.01" strokeWidth={2} /></Svg>;

/* ------------------------------ helpers ---------------------------- */
const numberFmt = new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt = (halalas: number) => numberFmt.format(halalas / 100);

// column header carries the currency, so cells hold the bare figure (standard in formal statements)
const num = 'whitespace-nowrap text-end font-mono tabular-nums';

const accountTypeLabels: Record<string, string> = {
  ASSET: 'أصول',
  LIABILITY: 'خصوم',
  EQUITY: 'حقوق ملكية',
  REVENUE: 'إيرادات',
  COST_OF_GOODS: 'تكلفة إيراد',
  EXPENSE: 'مصروفات',
};
const TYPE_ORDER = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'COST_OF_GOODS', 'EXPENSE'];

/* ------------------------------- page ------------------------------ */
export default async function TrialBalancePage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant } = session;
  const accRepo = new AccountingRepository();

  const accounts = await accRepo.listAccounts(tenant.tenantId);
  if (accounts.length === 0) {
    const bootstrap = new TenantBootstrapService();
    await bootstrap.reconcileTenant(tenant.tenantId);
  }

  const trialBalance = await accRepo.getTrialBalance(tenant.tenantId);

  // group by account class (assets → expenses), accounts sorted by code, with a subtotal per class
  const items = trialBalance.items;
  const types = [...TYPE_ORDER, ...Array.from(new Set(items.map((i) => i.accountType))).filter((t) => !TYPE_ORDER.includes(t))];
  const groups = types
    .map((type) => {
      const rows = items
        .filter((i) => i.accountType === type)
        .sort((a, b) => String(a.accountCode).localeCompare(String(b.accountCode), 'en', { numeric: true }));
      return {
        type,
        rows,
        debit: rows.reduce((s, r) => s + r.debitBalanceHalalas, 0),
        credit: rows.reduce((s, r) => s + r.creditBalanceHalalas, 0),
      };
    })
    .filter((g) => g.rows.length > 0);

  const diffHalalas = Math.abs(trialBalance.totalDebitHalalas - trialBalance.totalCreditHalalas);
  const issuedAt = new Date().toLocaleDateString('ar-SA', { dateStyle: 'full', timeZone: 'Asia/Riyadh' });

  return (
    // @container: layout follows this box (dashboard rail + panel take ~340px), not the screen
    <div className="@container space-y-5 text-[#54453D] print:space-y-0">
      {/* ───────── page header (screen only) ───────── */}
      <header className="rx-rise flex flex-wrap items-start justify-between gap-x-4 gap-y-3 print:hidden">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#F0C5AE] sm:size-12"><ScaleIcon /></span>
          <div className="min-w-0">
            <h1 className="m-0 text-xl font-bold leading-tight sm:text-2xl">ميزان المراجعة</h1>
            <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-[#6B5B52] sm:text-sm sm:leading-7">
              تقرير رسمي بأرصدة الحسابات المدينة والدائنة وفق نظام القيد المزدوج.
            </p>
          </div>
        </div>
        <PrintButton />
      </header>

      {/* ───────── the report sheet ───────── */}
      <article style={{ ['--d' as string]: '80ms' }} className="rx-rise rounded-3xl bg-white p-4 @xl:p-8 print:rounded-none print:p-0">
        {/* letterhead */}
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 pb-6">
          <div className="flex min-w-0 items-center gap-3 @xl:gap-4">
            <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#F0C5AE] text-lg font-bold @xl:size-14 @xl:text-xl">{tenant.name.charAt(0)}</span>
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-bold text-[#6B5B52]">{tenant.name}</p>
              <h2 className="m-0 text-lg font-black leading-tight @xl:text-2xl">ميزان المراجعة بالأرصدة</h2>
              <p className="m-0 mt-0.5 text-xs text-[#6B5B52]">Trial Balance — بالريال السعودي</p>
            </div>
          </div>

          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
            <dt className="text-[#6B5B52]">تاريخ الإصدار</dt>
            <dd className="m-0 font-bold">{issuedAt}</dd>
            <dt className="text-[#6B5B52]">عدد الحسابات</dt>
            <dd className="m-0 font-bold">{items.length}</dd>
            <dt className="text-[#6B5B52]">الحالة</dt>
            <dd className="m-0">
              <span
                role="status"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 font-bold ${trialBalance.isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
              >
                {trialBalance.isBalanced ? <CheckIcon /> : <AlertIcon />}
                {trialBalance.isBalanced ? 'متزن' : 'غير متزن'}
              </span>
            </dd>
          </dl>
        </div>

        {!trialBalance.isBalanced && (
          <div role="alert" className="mb-5 flex items-center gap-2.5 rounded-2xl bg-red-100 px-4 py-3 text-sm font-bold text-red-800">
            <AlertIcon />
            الميزان غير متزن — الفرق بين المدين والدائن {fmt(diffHalalas)} ر.س
          </div>
        )}

        {/* the statement */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[340px] border-separate border-spacing-0 text-right text-[13px]">
            <caption className="sr-only">ميزان المراجعة مصنف حسب نوع الحساب مع إجمالي لكل نوع</caption>
            <thead>
              <tr className="bg-[#54453D] text-white">
                <th scope="col" className="hidden w-[96px] rounded-s-xl px-4 py-3 text-start text-xs font-bold @lg:table-cell">الرمز</th>
                <th scope="col" className="rounded-s-xl px-3 py-3 text-start text-xs font-bold @lg:rounded-s-none @lg:px-4">اسم الحساب</th>
                <th scope="col" className={`${num} w-[112px] px-3 py-3 text-xs font-bold @lg:w-[150px] @lg:px-4`}>مدين (ر.س)</th>
                <th scope="col" className={`${num} w-[112px] rounded-e-xl px-3 py-3 text-xs font-bold @lg:w-[150px] @lg:px-4`}>دائن (ر.س)</th>
              </tr>
            </thead>

            {groups.map((g) => (
              <tbody key={g.type} className="print:break-inside-avoid">
                {/* class heading */}
                <tr>
                  <th colSpan={4} scope="colgroup" className="px-3 pb-2 pt-6 text-start @lg:px-4">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-[#F8E3D6] px-3 py-1 text-xs font-black">
                      {accountTypeLabels[g.type] || g.type}
                      <span className="font-mono font-bold opacity-60">{g.rows.length}</span>
                    </span>
                  </th>
                </tr>

                {g.rows.map((item) => (
                  <tr key={item.accountId} className="transition-colors even:bg-[#FAF9F8] hover:bg-[#F5F0EC]">
                    <td dir="ltr" className="hidden rounded-s-xl px-4 py-2.5 text-start font-mono font-bold @lg:table-cell">{item.accountCode}</td>
                    <th scope="row" className="rounded-s-xl px-3 py-2.5 text-start font-bold @lg:rounded-s-none @lg:px-4">
                      {item.accountNameAr}
                      <span dir="ltr" className="mt-0.5 block text-start font-mono text-[11px] font-bold text-[#6B5B52] @lg:hidden">{item.accountCode}</span>
                    </th>
                    <td className={`${num} px-3 py-2.5 text-sky-800 @lg:px-4`}>{item.debitBalanceHalalas > 0 ? fmt(item.debitBalanceHalalas) : <span className="text-[#54453D]/30">—</span>}</td>
                    <td className={`${num} rounded-e-xl px-3 py-2.5 text-emerald-800 @lg:px-4`}>{item.creditBalanceHalalas > 0 ? fmt(item.creditBalanceHalalas) : <span className="text-[#54453D]/30">—</span>}</td>
                  </tr>
                ))}

                {/* class subtotal */}
                <tr className="bg-[#F0E9E4] font-bold">
                  <td colSpan={1} className="rounded-s-xl px-3 py-2.5 text-start @lg:hidden">إجمالي {accountTypeLabels[g.type] || g.type}</td>
                  <td colSpan={2} className="hidden rounded-s-xl px-4 py-2.5 text-start @lg:table-cell">إجمالي {accountTypeLabels[g.type] || g.type}</td>
                  <td className={`${num} px-3 py-2.5 @lg:px-4`}>{g.debit > 0 ? fmt(g.debit) : '—'}</td>
                  <td className={`${num} rounded-e-xl px-3 py-2.5 @lg:px-4`}>{g.credit > 0 ? fmt(g.credit) : '—'}</td>
                </tr>
              </tbody>
            ))}

            {groups.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={4} className="px-4 py-14 text-center text-sm text-[#6B5B52]">لا توجد أرصدة لعرضها بعد.</td>
                </tr>
              </tbody>
            )}

            {/* grand total */}
            <tfoot>
              <tr aria-hidden="true"><td colSpan={4} className="h-5" /></tr>
              <tr className="bg-[#54453D] text-white">
                <th scope="row" colSpan={1} className="rounded-s-xl px-3 py-4 text-start text-sm font-black @lg:hidden">المجموع الكلي</th>
                <th scope="row" colSpan={2} className="hidden rounded-s-xl px-4 py-4 text-start text-sm font-black @lg:table-cell">المجموع الكلي المتطابق</th>
                <td className={`${num} px-3 py-4 text-sm font-black @lg:px-4 @lg:text-base`}>{fmt(trialBalance.totalDebitHalalas)}</td>
                <td className={`${num} rounded-e-xl px-3 py-4 text-sm font-black @lg:px-4 @lg:text-base`}>{fmt(trialBalance.totalCreditHalalas)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="m-0 mt-5 text-center text-[11px] text-[#6B5B52]">
          نظام راش إكس السحابي — صدر بتاريخ {issuedAt}
        </p>
      </article>
    </div>
  );
}