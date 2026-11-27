'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import type { AccountDoc, JournalEntryDoc, AccountBalanceDoc } from '@rashx/database';

interface LedgerViewerProps {
  accounts: AccountDoc[];
  journals: JournalEntryDoc[];
  balances: AccountBalanceDoc[];
}

/* ------------------------------ icons ------------------------------ */
const ico = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const Svg = ({ size = 20, className, children }: { size?: number; className?: string; children: ReactNode }) => (
  <svg {...ico} width={size} height={size} className={className}>{children}</svg>
);
const LedgerIcon = () => <Svg size={24}><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3M9 7.5h6M9 11h6M9 14.5h3" /></Svg>;
const ChevronDown = () => <Svg size={18}><path d="M6 9l6 6 6-6" strokeWidth={2} /></Svg>;
const ArrowDownIcon = () => <Svg size={14}><path d="M12 5v14M6 13l6 6 6-6" strokeWidth={2.2} /></Svg>;
const ArrowUpIcon = () => <Svg size={14}><path d="M12 19V5M6 11l6-6 6 6" strokeWidth={2.2} /></Svg>;
const CalendarIcon = () => <Svg size={14}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>;
const EmptyIcon = () => <Svg size={26}><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3M9.5 10h5" /></Svg>;

/* ------------------------------ helpers ---------------------------- */
const rise = (i: number): CSSProperties => ({ ['--d' as string]: `${Math.min(i, 8) * 40}ms` });
const numberFmt = new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Amount({ halalas, className = '' }: { halalas: number; className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1 font-mono font-black leading-tight ${className}`}>
      <span>{numberFmt.format(halalas / 100)}</span>
      <span className="font-sans text-[0.65em] font-bold opacity-60">ر.س</span>
    </span>
  );
}

const TYPE_LABELS: Record<string, string> = {
  ASSET: 'الأصول',
  LIABILITY: 'الخصوم',
  EQUITY: 'حقوق الملكية',
  REVENUE: 'الإيرادات',
  COST_OF_GOODS: 'تكلفة الإيراد',
  EXPENSE: 'المصروفات',
};

// wide layout column template (date · entry · description · debit · credit · running)
const COLS = '@2xl:grid-cols-[104px_104px_minmax(0,1fr)_128px_128px_148px]';

/** Running-balance sparkline. Starts from 0 so a single movement still draws a line. */
function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const pts = [0, ...values];
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const coords = pts.map((v, i) => [(i / (pts.length - 1)) * 100, 28 - ((v - min) / span) * 24 - 2] as const);
  const line = coords.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true" className="h-10 w-full text-[#54453D]">
      <polygon points={`0,30 ${line} 100,30`} fill="currentColor" opacity="0.1" />
      <polyline points={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ------------------------------ viewer ----------------------------- */
export function LedgerViewer({ accounts, journals, balances }: LedgerViewerProps) {
  const postingAccounts = accounts.filter((a) => a.isPosting);
  const [selectedAccountId, setSelectedAccountId] = useState(postingAccounts[0]?.id || '');

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedBalance = balances.find((b) => b.accountId === selectedAccountId);

  // Extract all lines affecting this account from POSTED journals
  const ledgerLines: Array<{
    date: string;
    entryNumber: string;
    description: string;
    debitHalalas: number;
    creditHalalas: number;
  }> = [];

  const postedJournals = journals
    .filter((j) => j.status === 'POSTED')
    .sort((a, b) => {
      const dateA = a.entryDate || a.transactionDate || '';
      const dateB = b.entryDate || b.transactionDate || '';
      return dateA.localeCompare(dateB);
    });

  for (const j of postedJournals) {
    for (const line of j.lines) {
      if (line.accountId === selectedAccountId) {
        ledgerLines.push({
          date: j.entryDate || j.transactionDate || '',
          entryNumber: j.entryNumber,
          description: line.description || j.descriptionAr || j.description || '',
          debitHalalas: line.debitHalalas || 0,
          creditHalalas: line.creditHalalas || 0,
        });
      }
    }
  }

  // Calculate running balances
  let runningHalalas = 0;
  const linesWithRunning = ledgerLines.map((line) => {
    if (selectedAccount?.normalBalance === 'DEBIT') {
      runningHalalas += line.debitHalalas - line.creditHalalas;
    } else {
      runningHalalas += line.creditHalalas - line.debitHalalas;
    }
    return { ...line, runningBalanceHalalas: runningHalalas };
  });

  const totalDebit = linesWithRunning.reduce((s, l) => s + l.debitHalalas, 0);
  const totalCredit = linesWithRunning.reduce((s, l) => s + l.creditHalalas, 0);
  const isDebitNature = selectedAccount?.normalBalance === 'DEBIT';

  return (
    // @container: the dashboard rail + panel take ~340px, so layout follows this box, not the screen
    <div className="@container space-y-5 text-[#54453D]">
      {/* ───────── header + account picker ───────── */}
      <header className="rx-rise flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#F0C5AE] sm:size-12"><LedgerIcon /></span>
          <div className="min-w-0">
            <h1 className="m-0 text-xl font-bold leading-tight sm:text-2xl">دفتر الأستاذ</h1>
            <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-[#6B5B52] sm:text-sm sm:leading-7">
              حركات القيود المرحّلة لكل حساب، مع الرصيد التراكمي بعد كل حركة.
            </p>
          </div>
        </div>

        <div className="w-full @2xl:w-[360px]">
          <label htmlFor="ledger-account" className="mb-1.5 block text-xs font-bold">الحساب</label>
          <div className="relative">
            <select
              id="ledger-account"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="h-12 w-full cursor-pointer appearance-none rounded-xl bg-white pe-11 ps-4 text-base font-bold outline-none transition-[box-shadow,background-color] hover:bg-[#F5F0EC] focus:ring-[3px] focus:ring-[#F0C5AE] md:text-sm"
            >
              {Object.keys(TYPE_LABELS).map((t) => {
                const group = postingAccounts.filter((a) => a.type === t);
                if (!group.length) return null;
                return (
                  <optgroup key={t} label={TYPE_LABELS[t]}>
                    {group.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.code} - {acc.nameAr}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#54453D]/60"><ChevronDown /></span>
          </div>
        </div>
      </header>

      {/* ───────── selected account ───────── */}
      {selectedAccount && (
        <section key={selectedAccount.id} aria-label="ملخص الحساب" className="rx-rise space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span dir="ltr" className="rounded-lg bg-[#F0E9E4] px-2.5 py-1 font-mono text-sm font-bold">{selectedAccount.code}</span>
            <h2 className="m-0 text-lg font-bold">{selectedAccount.nameAr}</h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${isDebitNature ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'}`}>
              <span aria-hidden="true" className={`size-1.5 rounded-full ${isDebitNature ? 'bg-sky-500' : 'bg-emerald-500'}`} />
              طبيعته {isDebitNature ? 'مدين' : 'دائن'}
            </span>
            <span className="text-xs text-[#6B5B52]">{linesWithRunning.length} حركة مرحّلة</span>
          </div>

          <div className="grid grid-cols-2 gap-3 @xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] @xl:gap-4">
            {/* closing balance — the one hero element */}
            <div className="col-span-2 flex flex-col justify-between gap-4 rounded-3xl bg-[#F0C5AE] p-5 @xl:col-span-1 @xl:p-6">
              <div>
                <div className="text-xs font-bold text-[#54453D]/70">الرصيد الختامي الحالي</div>
                <Amount halalas={selectedBalance?.netBalanceHalalas || 0} className="mt-1 text-2xl @xl:text-3xl" />
              </div>
              <Sparkline values={linesWithRunning.map((l) => l.runningBalanceHalalas)} />
            </div>

            <div className="rounded-3xl bg-white p-4 @xl:p-5">
              <span className="grid size-9 place-items-center rounded-xl bg-sky-100 text-sky-800"><ArrowDownIcon /></span>
              <div className="mt-3 text-xs text-[#6B5B52]">إجمالي المدين</div>
              <Amount halalas={totalDebit} className="mt-0.5 text-base text-sky-800 @xl:text-lg" />
            </div>

            <div className="rounded-3xl bg-white p-4 @xl:p-5">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><ArrowUpIcon /></span>
              <div className="mt-3 text-xs text-[#6B5B52]">إجمالي الدائن</div>
              <Amount halalas={totalCredit} className="mt-0.5 text-base text-emerald-800 @xl:text-lg" />
            </div>
          </div>
        </section>
      )}

      {/* ───────── movements ───────── */}
      <section key={`lines-${selectedAccountId}`} aria-label="حركات الحساب" className="rx-rise rounded-3xl bg-white p-3 @xl:p-4" style={rise(2)}>
        {linesWithRunning.length === 0 ? (
          <div className="grid place-items-center gap-3 px-6 py-14 text-center">
            <span aria-hidden="true" className="grid size-14 place-items-center rounded-2xl bg-[#F8E3D6]"><EmptyIcon /></span>
            <p className="m-0 max-w-xs text-sm leading-7 text-[#6B5B52]">لا توجد حركات مرحّلة على هذا الحساب حتى الآن.</p>
          </div>
        ) : (
          <>
            {/* column titles — only when there is room for columns */}
            <div aria-hidden="true" className={`hidden gap-3 px-3 pb-2 text-[11px] font-bold text-[#6B5B52] @2xl:grid ${COLS}`}>
              <span>التاريخ</span><span>رقم القيد</span><span>البيان</span>
              <span className="text-end">مدين</span><span className="text-end">دائن</span><span className="text-end">الرصيد التراكمي</span>
            </div>

            <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
              {linesWithRunning.map((line, idx) => (
                <li key={idx} style={rise(idx)} className="rx-rise rounded-2xl bg-[#FAF9F8] px-3 py-3 transition-colors hover:bg-[#F5F0EC]">
                  {/* narrow: stacked */}
                  <div className="space-y-2 @2xl:hidden">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <span dir="ltr" className="rounded-md bg-[#F0E9E4] px-1.5 py-0.5 font-mono text-[11px] font-bold">{line.entryNumber}</span>
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-[#6B5B52]"><CalendarIcon />{line.date}</span>
                      </div>
                      {line.debitHalalas ? (
                        <span className="shrink-0 text-end text-sm text-sky-800"><Amount halalas={line.debitHalalas} /><span className="block text-[10px] font-bold">مدين</span></span>
                      ) : (
                        <span className="shrink-0 text-end text-sm text-emerald-800"><Amount halalas={line.creditHalalas} /><span className="block text-[10px] font-bold">دائن</span></span>
                      )}
                    </div>
                    {line.description && <p className="m-0 text-sm leading-6">{line.description}</p>}
                    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs">
                      <span className="text-[#6B5B52]">الرصيد بعد الحركة</span>
                      <Amount halalas={line.runningBalanceHalalas} className="text-sm" />
                    </div>
                  </div>

                  {/* wide: columns */}
                  <div className={`hidden items-center gap-3 @2xl:grid ${COLS}`}>
                    <span className="font-mono text-xs text-[#6B5B52]">{line.date}</span>
                    <span dir="ltr" className="justify-self-start rounded-md bg-[#F0E9E4] px-1.5 py-0.5 font-mono text-[11px] font-bold">{line.entryNumber}</span>
                    <span className="min-w-0 text-sm leading-6">{line.description}</span>
                    <span className="text-end text-sm text-sky-800">{line.debitHalalas ? <Amount halalas={line.debitHalalas} /> : <span className="text-[#54453D]/30">—</span>}</span>
                    <span className="text-end text-sm text-emerald-800">{line.creditHalalas ? <Amount halalas={line.creditHalalas} /> : <span className="text-[#54453D]/30">—</span>}</span>
                    <span className="text-end text-sm"><Amount halalas={line.runningBalanceHalalas} /></span>
                  </div>
                </li>
              ))}
            </ol>

            {/* totals */}
            <div className="mt-2 rounded-2xl bg-[#F8E3D6] px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 text-xs font-bold @2xl:hidden">
                <span>الإجمالي</span>
                <span className="inline-flex items-center gap-1.5 text-sky-900">مدين <Amount halalas={totalDebit} className="text-sm" /></span>
                <span className="inline-flex items-center gap-1.5 text-emerald-900">دائن <Amount halalas={totalCredit} className="text-sm" /></span>
              </div>
              <div className={`hidden items-center gap-3 text-sm font-bold @2xl:grid ${COLS}`}>
                <span className="col-span-3">الإجمالي</span>
                <span className="text-end text-sky-900"><Amount halalas={totalDebit} /></span>
                <span className="text-end text-emerald-900"><Amount halalas={totalCredit} /></span>
                <span className="text-end"><Amount halalas={selectedBalance?.netBalanceHalalas || 0} /></span>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}