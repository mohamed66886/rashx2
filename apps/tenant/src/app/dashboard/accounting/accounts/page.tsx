import { redirect } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { AccountingRepository, TenantBootstrapService } from '@/lib/firebase-server';
import type { AccountType } from '@rashx/database';

export const dynamic = 'force-dynamic';

/* ------------------------------ icons ------------------------------ */
const ico = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const Svg = ({ size = 20, className, children }: { size?: number; className?: string; children: ReactNode }) => (
  <svg {...ico} width={size} height={size} className={className}>{children}</svg>
);

const TreeIcon = () => <Svg size={24}><path d="M4 5h6v4H4zM14 11h6v4h-6zM14 17h6v4h-6zM7 9v10h7M7 13h7" /></Svg>;
const BankIcon = () => <Svg><path d="M3 9l9-5 9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 21h18M3 18h18" /></Svg>;
const CardIcon = () => <Svg><rect x="3" y="5.5" width="18" height="13" rx="3" /><path d="M3 10h18M7 15h3" /></Svg>;
const LayersIcon = () => <Svg><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" /></Svg>;
const TrendUpIcon = () => <Svg><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></Svg>;
const BoxIcon = () => <Svg><path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5v-9zM3.5 7.5L12 12l8.5-4.5M12 12v9" /></Svg>;
const TrendDownIcon = () => <Svg><path d="M3 7l6 6 4-4 8 8M15 17h6v-6" /></Svg>;
const FolderIcon = () => <Svg size={18}><path d="M3.5 7a2 2 0 0 1 2-2H10l2 2.5h6.5a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7z" /></Svg>;
const DocIcon = () => <Svg size={18}><path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7.5 3.5zM14 3.5V8h4M9 13h6M9 16.5h4" /></Svg>;
const ChevronIcon = () => (
  // points left (= "forward" in RTL) when closed, rotates down when its <details> is open
  <Svg size={18} className="rotate-90 transition-transform duration-200 [details[open]>summary_&]:rotate-0"><path d="M6 9l6 6 6-6" strokeWidth={2} /></Svg>
);

/* ------------------------------ meta ------------------------------- */
const categories: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'COST_OF_GOODS', 'EXPENSE'];

const categoryMeta: Record<AccountType, { title: string; en: string; tile: string; icon: ReactNode }> = {
  ASSET: { title: 'الأصول والموجودات', en: 'Assets', tile: 'bg-[#F0C5AE] text-[#54453D]', icon: <BankIcon /> },
  LIABILITY: { title: 'الخصوم والالتزامات', en: 'Liabilities', tile: 'bg-[#91B8C0] text-[#2C4349]', icon: <CardIcon /> },
  EQUITY: { title: 'حقوق الملكية ورأس المال', en: 'Equity', tile: 'bg-[#E4D9F0] text-[#46325E]', icon: <LayersIcon /> },
  REVENUE: { title: 'الإيرادات والمبيعات', en: 'Revenue', tile: 'bg-emerald-200 text-emerald-900', icon: <TrendUpIcon /> },
  COST_OF_GOODS: { title: 'تكلفة الإيراد والبضاعة', en: 'COGS', tile: 'bg-amber-200 text-amber-900', icon: <BoxIcon /> },
  EXPENSE: { title: 'المصروفات التشغيلية', en: 'Expenses', tile: 'bg-rose-200 text-rose-900', icon: <TrendDownIcon /> },
};

/* ------------------------------ helpers ---------------------------- */
const rise = (i: number): CSSProperties => ({ ['--d' as string]: `${i * 70}ms` });
const numberFmt = new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Account = Awaited<ReturnType<AccountingRepository['listAccounts']>>[number];
interface TreeNode {
  acc: Account;
  children: TreeNode[];
  /** own balance (posting accounts) + everything below */
  total: number;
  /** number of accounts below this one */
  count: number;
}

/**
 * Builds the tree from `accountLevel` + code order: an account's parent is the closest
 * account above it (by code) with a lower level. Roll-up totals are computed bottom-up.
 */
function buildTree(list: Account[], nets: Map<string, number>): TreeNode[] {
  const sorted = [...list].sort((a, b) => String(a.code).localeCompare(String(b.code), 'en', { numeric: true }));
  const roots: TreeNode[] = [];
  const stack: TreeNode[] = [];

  for (const acc of sorted) {
    const node: TreeNode = { acc, children: [], total: 0, count: 0 };
    while (stack.length && stack[stack.length - 1].acc.accountLevel >= acc.accountLevel) stack.pop();
    if (stack.length) stack[stack.length - 1].children.push(node);
    else roots.push(node);
    stack.push(node);
  }

  const fill = (n: TreeNode) => {
    let sum = 0;
    let count = 0;
    for (const c of n.children) {
      fill(c);
      sum += c.total;
      count += 1 + c.count;
    }
    n.count = count;
    n.total = (n.acc.isPosting ? nets.get(n.acc.id) ?? 0 : 0) + sum;
  };
  roots.forEach(fill);
  return roots;
}

function Amount({ halalas, muted }: { halalas: number; muted?: boolean }) {
  return (
    <span className={`flex items-baseline justify-end gap-1 font-mono text-[13px] leading-tight @lg:text-sm ${muted ? 'font-semibold text-[#54453D]/70' : 'font-black'}`}>
      <span>{numberFmt.format(halalas / 100)}</span>
      <span className="font-sans text-[10px] font-bold opacity-60">ر.س</span>
    </span>
  );
}

/* ------------------------------ tree ------------------------------- */
function NodeRow({ node }: { node: TreeNode }) {
  const { acc, children } = node;
  const isBranch = children.length > 0;
  const showTotal = isBranch || acc.isPosting;

  return (
    <div className="flex items-center gap-2.5 px-2 py-2.5 @lg:gap-3 @lg:px-3">
      {/* expander slot — keeps leaves aligned with branches */}
      <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center text-[#54453D]/60">
        {isBranch ? <ChevronIcon /> : <span className="size-1.5 rounded-full bg-[#9A8C83]" />}
      </span>

      <span
        aria-hidden="true"
        className={`hidden size-8 shrink-0 place-items-center rounded-lg @sm:grid ${acc.isPosting ? 'bg-[#FAF9F8] text-[#54453D]/70' : 'bg-[#E3EEF0] text-[#2C4349]'}`}
      >
        {acc.isPosting ? <DocIcon /> : <FolderIcon />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span dir="ltr" className="rounded-md bg-[#F0E9E4] px-1.5 py-0.5 font-mono text-[11px] font-bold">{acc.code}</span>
          <span className={`text-sm leading-6 ${acc.isPosting ? 'font-medium' : 'font-bold'}`}>{acc.nameAr}</span>
          {isBranch && (
            <span className="rounded-md bg-[#E3EEF0] px-1.5 py-0.5 text-[10px] font-bold text-[#2C4349]">{node.count} فرعي</span>
          )}
        </div>
        {acc.nameEn && <div dir="ltr" className="truncate text-start font-mono text-[11px] text-[#54453D]/50">{acc.nameEn}</div>}
      </div>

      <div className="shrink-0 text-end">
        {showTotal ? <Amount halalas={node.total} muted={!acc.isPosting} /> : <span className="text-sm text-[#54453D]/40">—</span>}
        <span className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold ${acc.normalBalance === 'DEBIT' ? 'text-sky-800' : 'text-emerald-800'}`}>
          <span aria-hidden="true" className={`size-1.5 rounded-full ${acc.normalBalance === 'DEBIT' ? 'bg-sky-500' : 'bg-emerald-500'}`} />
          {acc.normalBalance === 'DEBIT' ? 'مدين' : 'دائن'}
        </span>
      </div>
    </div>
  );
}

function TreeBranch({ node }: { node: TreeNode }) {
  if (node.children.length === 0) {
    return <div className="rounded-xl transition-colors hover:bg-[#FAF9F8]"><NodeRow node={node} /></div>;
  }
  return (
    <details open>
      <summary className="cursor-pointer list-none rounded-xl transition-colors select-none hover:bg-[#FAF9F8] focus-visible:outline-2 focus-visible:outline-[#91B8C0] [&::-webkit-details-marker]:hidden">
        <NodeRow node={node} />
      </summary>
      {/* the guide line is a 1px bar, so the tree reads as a tree without any card borders */}
      <div className="rx-rise relative ms-3 ps-2 before:absolute before:inset-y-1 before:start-0 before:w-px before:bg-[#E6DDD6] @lg:ms-[22px] @lg:ps-3">
        {node.children.map((c) => (
          <TreeBranch key={c.acc.id} node={c} />
        ))}
      </div>
    </details>
  );
}

/* ------------------------------- page ------------------------------ */
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
  const nets = new Map<string, number>(balances.map((b) => [b.accountId, b.netBalanceHalalas]));

  return (
    // @container: layout follows the page box (the dashboard rail + panel take ~340px), not the screen
    <div className="@container space-y-6 text-[#54453D]">
      {/* ───────── header ───────── */}
      <header className="rx-rise space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#F0C5AE] sm:size-12"><TreeIcon /></span>
            <div className="min-w-0">
              <h1 className="m-0 text-xl font-bold leading-tight sm:text-2xl">شجرة الحسابات</h1>
              <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-[#6B5B52] sm:text-sm sm:leading-7">
                الدليل الموحد لحسابات صالونات التجميل في السعودية وفق معايير SOCPA. اضغط على أي حساب تجميعي لطيّ فروعه أو فتحها.
              </p>
            </div>
          </div>
          <span className="rounded-xl bg-[#E3EEF0] px-3 py-1.5 text-xs font-bold text-[#2C4349]">إجمالي الحسابات: {accounts.length}</span>
        </div>

        {/* legend */}
        <ul className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-2 p-0 text-xs text-[#6B5B52]">
          <li className="flex items-center gap-1.5"><span className="grid size-6 place-items-center rounded-md bg-[#E3EEF0] text-[#2C4349]"><FolderIcon /></span>حساب تجميعي</li>
          <li className="flex items-center gap-1.5"><span className="grid size-6 place-items-center rounded-md bg-white text-[#54453D]/70"><DocIcon /></span>يقبل القيود</li>
          <li className="flex items-center gap-1.5 font-bold text-sky-800"><span aria-hidden="true" className="size-1.5 rounded-full bg-sky-500" />مدين</li>
          <li className="flex items-center gap-1.5 font-bold text-emerald-800"><span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />دائن</li>
        </ul>
      </header>

      {/* ───────── one tree per account class ───────── */}
      <div className="space-y-3 @xl:space-y-4">
        {categories.map((cat, i) => {
          const meta = categoryMeta[cat];
          const roots = buildTree(accounts.filter((a) => a.type === cat), nets);
          const total = roots.reduce((s, r) => s + r.total, 0);
          const count = roots.reduce((s, r) => s + 1 + r.count, 0);

          return (
            <details key={cat} open style={rise(i + 1)} className="rx-rise rounded-3xl bg-white">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-3xl p-4 transition-colors select-none hover:bg-[#FFFDFB] focus-visible:outline-2 focus-visible:outline-[#91B8C0] @xl:gap-4 @xl:p-5 [&::-webkit-details-marker]:hidden">
                <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-2xl ${meta.tile}`}>{meta.icon}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="m-0 text-[15px] font-bold leading-tight">{meta.title}</h2>
                  <p className="m-0 mt-0.5 flex items-center gap-2 text-[11px] text-[#6B5B52]">
                    <span dir="ltr" className="font-mono">{meta.en}</span>
                    <span aria-hidden="true" className="size-1 rounded-full bg-[#9A8C83]" />
                    <span>{count} حساب</span>
                  </p>
                </div>
                {count > 0 && (
                  <div className="shrink-0 text-end">
                    <div className="text-[10px] text-[#6B5B52]">الإجمالي</div>
                    <Amount halalas={total} />
                  </div>
                )}
                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-[#FAF9F8] text-[#54453D]"><ChevronIcon /></span>
              </summary>

              <div className="rx-rise px-2 pb-3 @xl:px-3 @xl:pb-4">
                {roots.length === 0 ? (
                  <p className="m-0 rounded-xl bg-[#FAF9F8] px-4 py-6 text-center text-sm text-[#6B5B52]">لا توجد حسابات في هذا التصنيف.</p>
                ) : (
                  roots.map((r) => <TreeBranch key={r.acc.id} node={r} />)
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}