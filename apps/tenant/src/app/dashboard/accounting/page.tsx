import { redirect } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { AccountingRepository, TenantBootstrapService } from '@/lib/firebase-server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/* ------------------------------ icons ------------------------------ */
const ico = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const Svg = ({ size = 22, children }: { size?: number; children: ReactNode }) => (
  <svg {...ico} width={size} height={size}>{children}</svg>
);

const CoinsIcon = () => <Svg size={24}><circle cx="9" cy="9" r="5.5" /><path d="M14.5 9.6A5.5 5.5 0 1 1 9.6 14.5M9 7v4M7.5 8.5h3" /></Svg>;
const ScaleIcon = ({ size }: { size?: number }) => <Svg size={size}><path d="M12 4v16M8 20h8M5 7h14M5 7l-3 7a3 3 0 0 0 6 0L5 7zM19 7l-3 7a3 3 0 0 0 6 0l-3-7z" /></Svg>;
const LayersIcon = () => <Svg size={24}><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" /></Svg>;
const TrendUpIcon = () => <Svg><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></Svg>;
const TrendDownIcon = () => <Svg><path d="M3 7l6 6 4-4 8 8M15 17h6v-6" /></Svg>;
const ListIcon = () => <Svg><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" strokeWidth={2.4} /></Svg>;
const PenIcon = () => <Svg><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1zM14 7l3 3" /></Svg>;
const CheckIcon = () => <Svg size={16}><path d="M5 12.5l4.5 4.5L19 7.5" strokeWidth={2.4} /></Svg>;
const AlertIcon = () => <Svg size={16}><path d="M12 4l9 16H3L12 4zM12 10v4M12 17h.01" strokeWidth={2} /></Svg>;
const CalendarIcon = () => <Svg size={16}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>;
const ChevronIcon = () => <Svg size={18}><path d="M15 6l-6 6 6 6" strokeWidth={2} /></Svg>;

/* ----------------------------- helpers ----------------------------- */
const rise = (i: number): CSSProperties => ({ ['--d' as string]: `${i * 70}ms` });

const numberFmt = new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatHalalas = (halalas: number) => numberFmt.format(halalas / 100);

function Amount({ halalas, className = '' }: { halalas: number; className?: string }) {
  return (
    <p className={`m-0 flex flex-wrap items-baseline gap-x-1.5 font-mono font-black leading-tight tracking-tight ${className}`}>
      <span className="min-w-0 break-all">{formatHalalas(halalas)}</span>
      <span className="font-sans text-[0.55em] font-bold opacity-60">ر.س</span>
    </p>
  );
}

function Operator({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className="mx-auto grid size-8 place-items-center rounded-full bg-[#F0E9E4] text-lg font-bold leading-none text-[#54453D]/70">
      {children}
    </span>
  );
}

/* ------------------------------- page ------------------------------ */
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

  const links = [
    {
      href: '/dashboard/accounting/accounts',
      icon: <ListIcon />,
      tile: 'bg-[#F0C5AE]',
      title: 'شجرة الحسابات',
      desc: 'الحسابات الرئيسية والفرعية المعتمدة بالمملكة وأرصدتها الحالية.',
      chip: `${accounts.length} حساب مسجل`,
      chipCls: 'bg-[#E3EEF0] text-[#2C4349]',
    },
    {
      href: '/dashboard/accounting/journals',
      icon: <PenIcon />,
      tile: 'bg-[#91B8C0]',
      title: 'القيود اليومية',
      desc: 'تسجيل وترحيل القيود المزدوجة (مدين/دائن) بترقيم تسلسلي وعكس القيود.',
      chip: 'إدارة القيود والترحيل',
      chipCls: 'bg-[#F0E9E4] text-[#54453D]',
    },
    {
      href: '/dashboard/accounting/trial-balance',
      icon: <ScaleIcon />,
      tile: 'bg-[#F8E3D6]',
      title: 'ميزان المراجعة',
      desc: 'مطابقة مجموع الأرصدة المدينة بالدائنة لضمان سلامة الدفاتر.',
      chip: 'توازن فوري لحظي',
      chipCls: 'bg-emerald-100 text-emerald-800',
    },
  ];

  return (
    // @container: the dashboard rail + panel eat ~340px, so layout follows this box, not the screen
    <div className="@container space-y-6 text-[#54453D]">
      {/* ───────── header ───────── */}
      <header className="rx-rise flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#F0C5AE] sm:size-12">
            <ScaleIcon size={24} />
          </span>
          <div className="min-w-0">
            <h1 className="m-0 text-xl font-bold leading-tight sm:text-2xl">المركز المالي</h1>
            <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-[#6B5B52] sm:text-sm sm:leading-7">
              القيد المزدوج وشجرة الحسابات السعودية ومراقبة توازن الدفاتر بالهللات.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            role="status"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${
              trialBalance.isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {trialBalance.isBalanced ? <CheckIcon /> : <AlertIcon />}
            {trialBalance.isBalanced ? 'ميزان المراجعة متزن' : 'ميزان المراجعة غير متزن'}
          </span>
          {currentPeriod && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#E3EEF0] px-3 py-1.5 text-xs font-bold text-[#2C4349]">
              <CalendarIcon />
              {currentPeriod.nameAr}
            </span>
          )}
        </div>
      </header>

      {/* ───────── accounting equation: Assets = Liabilities + Equity ───────── */}
      <section aria-label="المعادلة المحاسبية" className="grid gap-1 @3xl:grid-cols-[minmax(0,1.3fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] @3xl:items-stretch @3xl:gap-3">
        <article style={rise(1)} className="rx-rise flex flex-col justify-between gap-6 rounded-3xl bg-[#F0C5AE] p-5 @xl:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-sm font-bold">إجمالي الأصول</h2>
              <span dir="ltr" className="block text-start text-[11px] text-[#54453D]/60">Assets</span>
            </div>
            <span aria-hidden="true" className="grid size-11 place-items-center rounded-2xl bg-[#FAF9F8]/70"><CoinsIcon /></span>
          </div>
          <Amount halalas={typeTotalsHalalas.ASSET} className="text-2xl @xl:text-3xl" />
        </article>

        <Operator>=</Operator>

        <article style={rise(2)} className="rx-rise flex flex-col justify-between gap-6 rounded-3xl bg-[#E3EEF0] p-5 @xl:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-sm font-bold">الالتزامات والخصوم</h2>
              <span dir="ltr" className="block text-start text-[11px] text-[#54453D]/60">Liabilities</span>
            </div>
            <span aria-hidden="true" className="grid size-11 place-items-center rounded-2xl bg-white/70"><ScaleIcon size={24} /></span>
          </div>
          <Amount halalas={typeTotalsHalalas.LIABILITY} className="text-xl @xl:text-2xl" />
        </article>

        <Operator>+</Operator>

        <article style={rise(3)} className="rx-rise flex flex-col justify-between gap-6 rounded-3xl bg-white p-5 @xl:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-sm font-bold">حقوق الملكية</h2>
              <span dir="ltr" className="block text-start text-[11px] text-[#54453D]/60">Equity</span>
            </div>
            <span aria-hidden="true" className="grid size-11 place-items-center rounded-2xl bg-[#FAF9F8]"><LayersIcon /></span>
          </div>
          <Amount halalas={typeTotalsHalalas.EQUITY} className="text-xl @xl:text-2xl" />
        </article>
      </section>

      {/* ───────── performance: revenue + expenses ───────── */}
      <section aria-label="الأداء التشغيلي" className="grid gap-3 @lg:grid-cols-2 @lg:gap-4">
        <article style={rise(4)} className="rx-rise flex items-center gap-4 rounded-3xl bg-white p-5">
          <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><TrendUpIcon /></span>
          <div className="min-w-0">
            <h2 className="m-0 text-sm font-bold">الإيرادات التشغيلية</h2>
            <Amount halalas={typeTotalsHalalas.REVENUE} className="mt-1 text-lg text-emerald-700 @xl:text-xl" />
          </div>
        </article>

        <article style={rise(5)} className="rx-rise flex items-center gap-4 rounded-3xl bg-white p-5">
          <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700"><TrendDownIcon /></span>
          <div className="min-w-0">
            <h2 className="m-0 text-sm font-bold">المصروفات والتكلفة</h2>
            <Amount halalas={typeTotalsHalalas.COST_OF_GOODS + typeTotalsHalalas.EXPENSE} className="mt-1 text-lg text-amber-700 @xl:text-xl" />
          </div>
        </article>
      </section>

      {/* ───────── where to go next ───────── */}
      <nav aria-label="أقسام المحاسبة" className="grid gap-3 @3xl:grid-cols-3 @3xl:gap-4">
        {links.map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            style={rise(6 + i)}
            className="rx-rise group flex flex-col gap-4 rounded-3xl bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFFDFB] active:scale-[0.98] @xl:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span aria-hidden="true" className={`grid size-12 place-items-center rounded-2xl text-[#54453D] transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6 ${l.tile}`}>
                {l.icon}
              </span>
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-[#FAF9F8] text-[#54453D] transition-all duration-200 group-hover:bg-[#54453D] group-hover:text-white rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
                <ChevronIcon />
              </span>
            </div>
            <div className="flex-1">
              <h3 className="m-0 text-[15px] font-bold">{l.title}</h3>
              <p className="mb-0 mt-1.5 text-[13px] leading-6 text-[#6B5B52]">{l.desc}</p>
            </div>
            <span className={`self-start rounded-lg px-2.5 py-1 text-xs font-bold ${l.chipCls}`}>{l.chip}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}