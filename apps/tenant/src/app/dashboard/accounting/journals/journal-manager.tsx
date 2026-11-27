'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { JournalEntryDoc, AccountDoc, AccountingPeriodDoc } from '@rashx/database';
import {
  createDraftJournalAction,
  postJournalAction,
  reverseJournalAction,
} from '../actions';

interface JournalManagerProps {
  entries: JournalEntryDoc[];
  accounts: AccountDoc[];
  openPeriods: AccountingPeriodDoc[];
  isOwner: boolean;
}

/* ------------------------------ icons ------------------------------ */
const ico = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const Svg = ({ size = 20, className, children }: { size?: number; className?: string; children: ReactNode }) => (
  <svg {...ico} width={size} height={size} className={className}>{children}</svg>
);
const BookIcon = () => <Svg size={24}><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3M9 8h6M9 12h4" /></Svg>;
const PlusIcon = ({ size = 18 }: { size?: number }) => <Svg size={size}><path d="M12 5v14M5 12h14" strokeWidth={2.2} /></Svg>;
const CloseIcon = ({ size = 20 }: { size?: number }) => <Svg size={size}><path d="M6 6l12 12M18 6L6 18" strokeWidth={2} /></Svg>;
const CheckIcon = ({ size = 16 }: { size?: number }) => <Svg size={size}><path d="M5 12.5l4.5 4.5L19 7.5" strokeWidth={2.4} /></Svg>;
const AlertIcon = ({ size = 16 }: { size?: number }) => <Svg size={size}><path d="M12 4l9 16H3L12 4zM12 10v4M12 17h.01" strokeWidth={2} /></Svg>;
const PenIcon = ({ size = 16 }: { size?: number }) => <Svg size={size}><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1zM14 7l3 3" /></Svg>;
const UndoIcon = ({ size = 16 }: { size?: number }) => <Svg size={size}><path d="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></Svg>;
const SendIcon = () => <Svg size={18}><path d="M4 12l16-8-6 16-3-7-7-1z" /></Svg>;
const TrashIcon = () => <Svg size={18}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 19l1-12M9 7V4.5h6V7" /></Svg>;
const CalendarIcon = () => <Svg size={14}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>;
const ChevronIcon = () => (
  <Svg size={18} className="transition-transform duration-200"><path d="M6 9l6 6 6-6" strokeWidth={2} /></Svg>
);

/* ------------------------------ helpers ---------------------------- */
const rise = (i: number): CSSProperties => ({ ['--d' as string]: `${Math.min(i, 6) * 60}ms` });
const numberFmt = new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Amount({ halalas, className = '' }: { halalas: number; className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1 font-mono font-black leading-tight ${className}`}>
      <span>{numberFmt.format(halalas / 100)}</span>
      <span className="font-sans text-[0.7em] font-bold opacity-60">ر.س</span>
    </span>
  );
}

const STATUS: Record<string, { label: string; cls: string; icon: ReactNode }> = {
  DRAFT: { label: 'مسودة', cls: 'bg-amber-100 text-amber-800', icon: <PenIcon size={14} /> },
  POSTED: { label: 'مرحّل', cls: 'bg-emerald-100 text-emerald-800', icon: <CheckIcon size={14} /> },
  REVERSED: { label: 'معكوس', cls: 'bg-rose-100 text-rose-800', icon: <UndoIcon size={14} /> },
};

const TYPE_LABELS: Record<string, string> = {
  ASSET: 'الأصول',
  LIABILITY: 'الخصوم',
  EQUITY: 'حقوق الملكية',
  REVENUE: 'الإيرادات',
  COST_OF_GOODS: 'تكلفة الإيراد',
  EXPENSE: 'المصروفات',
};

// filled inputs — no borders; focus is shown with a soft peach ring
const fieldBase =
  'w-full h-11 rounded-xl px-3 text-base font-medium text-[#54453D] outline-none transition-[box-shadow,background-color] duration-150 placeholder:text-[#8A7B72] md:text-sm focus:ring-[3px] focus:ring-[#F0C5AE]';
const fieldCream = `${fieldBase} bg-[#FAF9F8] hover:bg-[#F5F0EC] focus:bg-white`;
const fieldWhite = `${fieldBase} bg-white`;

function Label({ htmlFor, children, tone = '' }: { htmlFor?: string; children: ReactNode; tone?: string }) {
  return <label htmlFor={htmlFor} className={`mb-1.5 block text-xs font-bold ${tone}`}>{children}</label>;
}

interface Line { accountId: string; description: string; debitSar: string; creditSar: string }

/* ------------------------------ manager ---------------------------- */
export function JournalManager({ entries, accounts, openPeriods, isOwner }: JournalManagerProps) {
  const postingAccounts = accounts.filter((a) => a.isPosting);

  const makeDefaultLines = (): Line[] => [
    { accountId: postingAccounts.find((a) => a.code === '1010')?.id || postingAccounts[0]?.id || '', description: '', debitSar: '', creditSar: '' },
    { accountId: postingAccounts.find((a) => a.code === '4010')?.id || postingAccounts[1]?.id || '', description: '', debitSar: '', creditSar: '' },
  ];

  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'POSTED' | 'REVERSED'>('ALL');
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(entries.filter((e) => e.status === 'DRAFT').map((e) => e.id)));
  const [dialog, setDialog] = useState<{ kind: 'post' | 'reverse'; entry: JournalEntryDoc } | null>(null);
  const [reason, setReason] = useState('');

  // New Journal State
  const [descriptionAr, setDescriptionAr] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]!);
  const [periodId, setPeriodId] = useState(openPeriods[0]?.id || '');
  const [lines, setLines] = useState<Line[]>(makeDefaultLines);

  // Live total calculation
  const totalDebitSar = lines.reduce((acc, l) => acc + (parseFloat(l.debitSar) || 0), 0);
  const totalCreditSar = lines.reduce((acc, l) => acc + (parseFloat(l.creditSar) || 0), 0);
  const isBalanced = totalDebitSar > 0 && Math.abs(totalDebitSar - totalCreditSar) < 0.001;
  const diffSar = Math.abs(totalDebitSar - totalCreditSar);

  // Esc closes the top-most layer · page behind does not scroll while a layer is open
  useEffect(() => {
    if (!drawer && !dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (dialog) setDialog(null);
      else setDrawer(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [drawer, dialog]);

  function handleAddLine() {
    setLines([...lines, { accountId: postingAccounts[0]?.id || '', description: '', debitSar: '', creditSar: '' }]);
  }

  function handleRemoveLine(index: number) {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  }

  function handleLineChange(index: number, field: 'accountId' | 'description' | 'debitSar' | 'creditSar', val: string) {
    const updated = [...lines];
    updated[index] = { ...updated[index]!, [field]: val };

    // Debit XOR Credit
    if (field === 'debitSar' && parseFloat(val) > 0) {
      updated[index]!.creditSar = '';
    } else if (field === 'creditSar' && parseFloat(val) > 0) {
      updated[index]!.debitSar = '';
    }

    setLines(updated);
  }

  async function handleCreateDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!isBalanced) {
      setMessage({ text: 'يجب أن يتطابق مجموع المدين مع مجموع الدائن تماماً.', isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formattedLines = lines.map((l, idx) => {
      const acc = postingAccounts.find((a) => a.id === l.accountId);
      const debitHalalas = Math.round((parseFloat(l.debitSar) || 0) * 100);
      const creditHalalas = Math.round((parseFloat(l.creditSar) || 0) * 100);

      return {
        lineId: `line-${idx + 1}`,
        accountId: l.accountId,
        accountCode: acc?.code || '0000',
        accountNameAr: acc?.nameAr || 'حساب',
        description: l.description || descriptionAr,
        debitHalalas,
        creditHalalas,
      };
    });

    const result = await createDraftJournalAction({ descriptionAr, entryDate, periodId, lines: formattedLines });

    setLoading(false);
    if (result.success) {
      setMessage({ text: 'تم حفظ مسودة القيد بنجاح! يمكنك الآن مراجعتها وترحيلها.', isError: false });
      setDrawer(false);
      setDescriptionAr('');
      setLines(makeDefaultLines());
    } else {
      setMessage({ text: result.error || 'فشل حفظ القيد', isError: true });
    }
  }

  async function runPost(entryId: string) {
    setLoading(true);
    setMessage(null);
    const result = await postJournalAction(entryId);
    setLoading(false);
    setDialog(null);

    if (result.success) {
      setMessage({ text: 'تم ترحيل القيد وتحديث أرصدة دفتر الأستاذ بنجاح!', isError: false });
    } else {
      setMessage({ text: result.error || 'فشل ترحيل القيد', isError: true });
    }
  }

  async function runReverse(entryId: string) {
    if (!reason.trim()) return;
    setLoading(true);
    setMessage(null);
    const result = await reverseJournalAction(entryId, reason.trim());
    setLoading(false);
    setDialog(null);
    setReason('');

    if (result.success) {
      setMessage({ text: 'تم إنشاء القيد العكسي وترحيله بنجاح!', isError: false });
    } else {
      setMessage({ text: result.error || 'فشل عكس القيد', isError: true });
    }
  }

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const counts = {
    ALL: entries.length,
    DRAFT: entries.filter((e) => e.status === 'DRAFT').length,
    POSTED: entries.filter((e) => e.status === 'POSTED').length,
    REVERSED: entries.filter((e) => e.status === 'REVERSED').length,
  };
  const visible = filter === 'ALL' ? entries : entries.filter((e) => e.status === filter);

  const banner = message && (
    <div
      role={message.isError ? 'alert' : 'status'}
      className={`rx-pop flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-bold ${message.isError ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}
    >
      <span className="mt-0.5 shrink-0">{message.isError ? <AlertIcon /> : <CheckIcon />}</span>
      <span className="flex-1">{message.text}</span>
      <button type="button" onClick={() => setMessage(null)} aria-label="إغلاق الرسالة" className="shrink-0 opacity-60 transition-opacity hover:opacity-100 cursor-pointer"><CloseIcon size={16} /></button>
    </div>
  );

  return (
    // @container: the dashboard rail + panel take ~340px, so layout follows this box, not the screen
    <div className="@container space-y-5 text-[#54453D]">
      {/* ───────── header ───────── */}
      <header className="rx-rise flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#F0C5AE] sm:size-12"><BookIcon /></span>
          <div className="min-w-0">
            <h1 className="m-0 text-xl font-bold leading-tight sm:text-2xl">القيود اليومية</h1>
            <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-[#6B5B52] sm:text-sm sm:leading-7">
              سجّل قيود القيد المزدوج ورحّلها إلى دفتر الأستاذ، أو اعكس قيداً مرحّلاً عند الحاجة.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="group inline-flex h-11 items-center gap-2 rounded-xl bg-[#54453D] px-5 text-sm font-bold text-white transition-all duration-150 hover:bg-[#433730] active:scale-[0.97] cursor-pointer max-sm:w-full max-sm:justify-center"
        >
          <span className="transition-transform duration-200 group-hover:rotate-90"><PlusIcon /></span>
          قيد جديد
        </button>
      </header>

      {!drawer && banner}

      {/* ───────── filters ───────── */}
      {entries.length > 0 && (
        <div role="tablist" aria-label="تصفية القيود" className="rx-rise flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {([['ALL', 'الكل'], ['DRAFT', 'مسودة'], ['POSTED', 'مرحّل'], ['REVERSED', 'معكوس']] as const).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              type="button"
              onClick={() => setFilter(key)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all duration-150 active:scale-95 cursor-pointer ${
                filter === key ? 'bg-[#54453D] text-white' : 'bg-white hover:bg-[#F0E9E4]'
              }`}
            >
              {label}
              <span className={`rounded-md px-1.5 text-[11px] font-mono ${filter === key ? 'bg-white/20' : 'bg-[#F0E9E4]'}`}>{counts[key]}</span>
            </button>
          ))}
        </div>
      )}

      {/* ───────── entries ───────── */}
      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="rx-rise grid place-items-center gap-3 rounded-3xl bg-white px-6 py-14 text-center">
            <span aria-hidden="true" className="grid size-14 place-items-center rounded-2xl bg-[#F8E3D6]"><BookIcon /></span>
            <p className="m-0 max-w-xs text-sm leading-7 text-[#6B5B52]">
              {entries.length === 0 ? 'لا توجد قيود بعد. ابدأ بأول قيد يومية يدوي.' : 'لا توجد قيود بهذه الحالة.'}
            </p>
            {entries.length === 0 && (
              <button type="button" onClick={() => setDrawer(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#F0C5AE] px-5 text-sm font-bold transition-transform active:scale-95 cursor-pointer">
                <PlusIcon /> إنشاء قيد
              </button>
            )}
          </div>
        ) : (
          visible.map((entry, i) => {
            const st = STATUS[entry.status] || { label: entry.status, cls: 'bg-gray-100 text-gray-700', icon: null };
            const open = openIds.has(entry.id);

            return (
              <article key={entry.id} style={rise(i)} className="rx-rise overflow-hidden rounded-3xl bg-white">
                <button
                  type="button"
                  onClick={() => toggle(entry.id)}
                  aria-expanded={open}
                  className="block w-full cursor-pointer p-4 text-start transition-colors hover:bg-[#FFFDFB] focus-visible:outline-2 focus-visible:outline-[#91B8C0] @xl:p-5"
                >
                  <span className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                    <span aria-hidden="true" className={`grid size-7 place-items-center rounded-full bg-[#FAF9F8] ${open ? '[&>svg]:rotate-180' : ''}`}><ChevronIcon /></span>
                    <span dir="ltr" className="rounded-lg bg-[#F0E9E4] px-2.5 py-1 font-mono text-sm font-bold">{entry.entryNumber}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${st.cls}`}>{st.icon}{st.label}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-[#6B5B52]"><CalendarIcon />{entry.entryDate}</span>
                    <span className="ms-auto text-base"><Amount halalas={entry.totalDebitHalalas} /></span>
                  </span>
                  <span className="mt-2.5 block text-sm font-medium leading-6">{entry.descriptionAr}</span>
                </button>

                {open && (
                  <div className="rx-rise px-4 pb-4 @xl:px-5 @xl:pb-5">
                    {/* lines */}
                    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                      {/* column titles only when there is room */}
                      <li aria-hidden="true" className="hidden grid-cols-[72px_minmax(0,1fr)_132px_132px] gap-3 px-3 text-[11px] font-bold text-[#6B5B52] @2xl:grid">
                        <span>الرمز</span><span>الحساب</span><span className="text-end">مدين</span><span className="text-end">دائن</span>
                      </li>
                      {entry.lines.map((l, idx) => (
                        <li key={idx} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-2xl bg-[#FAF9F8] px-3 py-2.5 @2xl:grid-cols-[72px_minmax(0,1fr)_132px_132px]">
                          <span dir="ltr" className="hidden text-start font-mono text-xs font-bold @2xl:block">{l.accountCode}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span dir="ltr" className="rounded-md bg-[#F0E9E4] px-1.5 py-0.5 font-mono text-[11px] font-bold @2xl:hidden">{l.accountCode}</span>
                              <span className="text-sm font-bold">{l.accountNameAr}</span>
                            </div>
                            {l.description && <div className="mt-0.5 text-xs leading-5 text-[#6B5B52]">{l.description}</div>}
                          </div>

                          {/* compact amount (narrow) */}
                          <span className="text-end @2xl:hidden">
                            {l.debitHalalas ? (
                              <span className="block text-sm text-sky-800"><Amount halalas={l.debitHalalas} /><span className="block text-[10px] font-bold">مدين</span></span>
                            ) : (
                              <span className="block text-sm text-emerald-800"><Amount halalas={l.creditHalalas} /><span className="block text-[10px] font-bold">دائن</span></span>
                            )}
                          </span>
                          {/* debit / credit columns (wide) */}
                          <span className="hidden text-end text-sm text-sky-800 @2xl:block">{l.debitHalalas ? <Amount halalas={l.debitHalalas} /> : <span className="text-[#54453D]/30">—</span>}</span>
                          <span className="hidden text-end text-sm text-emerald-800 @2xl:block">{l.creditHalalas ? <Amount halalas={l.creditHalalas} /> : <span className="text-[#54453D]/30">—</span>}</span>
                        </li>
                      ))}
                    </ul>

                    {/* totals + actions */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F8E3D6] px-4 py-3">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-bold">
                        <span className="inline-flex items-center gap-1.5 text-sky-900">مدين <Amount halalas={entry.totalDebitHalalas} className="text-sm" /></span>
                        <span className="inline-flex items-center gap-1.5 text-emerald-900">دائن <Amount halalas={entry.totalCreditHalalas} className="text-sm" /></span>
                      </div>

                      <div className="flex gap-2">
                        {entry.status === 'DRAFT' && (
                          <button
                            type="button"
                            onClick={() => setDialog({ kind: 'post', entry })}
                            disabled={loading}
                            className="group inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition-all duration-150 hover:bg-emerald-800 active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <span className="transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"><SendIcon /></span>
                            ترحيل القيد
                          </button>
                        )}
                        {entry.status === 'POSTED' && isOwner && !entry.reversedByEntryId && (
                          <button
                            type="button"
                            onClick={() => { setReason(''); setDialog({ kind: 'reverse', entry }); }}
                            disabled={loading}
                            className="group inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-rose-800 transition-all duration-150 hover:bg-rose-100 active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <span className="transition-transform duration-300 group-hover:-rotate-45"><UndoIcon size={18} /></span>
                            عكس القيد
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* ───────── side drawer: new journal entry ───────── */}
      {drawer && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="journal-drawer-title">
          <button type="button" aria-label="إغلاق" onClick={() => setDrawer(false)} className="rx-fade absolute inset-0 cursor-default bg-[#54453D]/50" />

          {/* full-height panel on the end side of the screen (left in RTL); full width on phones */}
          <form
            onSubmit={handleCreateDraft}
            className="rx-drawer @container absolute inset-y-0 end-0 flex h-full w-full flex-col bg-white sm:w-[min(100vw,640px)] sm:rounded-s-3xl"
          >
            <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-5 @xl:px-6">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="grid size-11 place-items-center rounded-2xl bg-[#F0C5AE]"><PenIcon size={22} /></span>
                <div>
                  <h2 id="journal-drawer-title" className="m-0 text-base font-bold leading-tight">قيد يومية جديد</h2>
                  <p className="m-0 mt-0.5 text-xs text-[#6B5B52]">يُحفظ كمسودة ثم تراجعه وترحّله</p>
                </div>
              </div>
              <button type="button" onClick={() => setDrawer(false)} aria-label="إغلاق" className="grid size-10 place-items-center rounded-xl bg-[#FAF9F8] transition-all hover:bg-[#F0E9E4] active:scale-90 cursor-pointer"><CloseIcon /></button>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-3 @xl:px-6">
              {banner}

              <div className="grid gap-4 @lg:grid-cols-[minmax(0,1fr)_170px]">
                <div className="min-w-0">
                  <Label htmlFor="jd-desc">شرح القيد (البيان)<span className="ms-1 text-[#A8473B]" aria-hidden="true">*</span></Label>
                  <input id="jd-desc" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} required autoFocus placeholder="مثال: إثبات إيراد مبيعات الخدمات نقداً" className={fieldCream} />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="jd-date">تاريخ القيد<span className="ms-1 text-[#A8473B]" aria-hidden="true">*</span></Label>
                  <input id="jd-date" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required dir="ltr" className={`${fieldCream} text-start font-mono`} />
                </div>
              </div>

              <div>
                <Label htmlFor="jd-period">الفترة المحاسبية<span className="ms-1 text-[#A8473B]" aria-hidden="true">*</span></Label>
                <select id="jd-period" value={periodId} onChange={(e) => setPeriodId(e.target.value)} required className={fieldCream}>
                  {openPeriods.map((p) => (
                    <option key={p.id} value={p.id}>{p.nameAr} ({p.startDate} إلى {p.endDate})</option>
                  ))}
                </select>
              </div>

              {/* lines */}
              <section aria-label="بنود القيد" className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="m-0 text-sm font-bold">بنود القيد</h3>
                  <button type="button" onClick={handleAddLine} className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#E3EEF0] px-3 text-xs font-bold text-[#2C4349] transition-all hover:bg-[#D3E4E8] active:scale-95 cursor-pointer">
                    <span className="transition-transform duration-200 group-hover:rotate-90"><PlusIcon size={16} /></span>
                    إضافة بند
                  </button>
                </div>

                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                  {lines.map((line, idx) => (
                    <li key={idx} className="rx-pop space-y-3 rounded-2xl bg-[#FAF9F8] p-3 @xl:p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#6B5B52]">بند {idx + 1}</span>
                        {lines.length > 2 && (
                          <button type="button" onClick={() => handleRemoveLine(idx)} aria-label={`حذف البند ${idx + 1}`} className="grid size-8 place-items-center rounded-lg text-rose-700 transition-all hover:bg-rose-100 active:scale-90 cursor-pointer"><TrashIcon /></button>
                        )}
                      </div>

                      <div className="grid gap-3 @lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                        <div className="min-w-0">
                          <Label htmlFor={`jd-acc-${idx}`}>الحساب</Label>
                          <select id={`jd-acc-${idx}`} value={line.accountId} onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)} className={fieldWhite}>
                            {Object.keys(TYPE_LABELS).map((t) => {
                              const group = postingAccounts.filter((a) => a.type === t);
                              if (!group.length) return null;
                              return (
                                <optgroup key={t} label={TYPE_LABELS[t]}>
                                  {group.map((a) => <option key={a.id} value={a.id}>{a.code} - {a.nameAr}</option>)}
                                </optgroup>
                              );
                            })}
                          </select>
                        </div>
                        <div className="min-w-0">
                          <Label htmlFor={`jd-desc-${idx}`}>البيان الفرعي</Label>
                          <input id={`jd-desc-${idx}`} placeholder="اختياري" value={line.description} onChange={(e) => handleLineChange(idx, 'description', e.target.value)} className={fieldWhite} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="min-w-0">
                          <Label htmlFor={`jd-dr-${idx}`} tone="text-sky-800">مدين (ر.س)</Label>
                          <input id={`jd-dr-${idx}`} type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00" dir="ltr" value={line.debitSar} onChange={(e) => handleLineChange(idx, 'debitSar', e.target.value)} className={`${fieldWhite} text-start font-mono font-bold`} />
                        </div>
                        <div className="min-w-0">
                          <Label htmlFor={`jd-cr-${idx}`} tone="text-emerald-800">دائن (ر.س)</Label>
                          <input id={`jd-cr-${idx}`} type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00" dir="ltr" value={line.creditSar} onChange={(e) => handleLineChange(idx, 'creditSar', e.target.value)} className={`${fieldWhite} text-start font-mono font-bold`} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* sticky footer: live balance + actions */}
            <footer className="space-y-3 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 @xl:px-6">
              <div className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl px-4 py-3 transition-colors duration-300 ${isBalanced ? 'bg-emerald-100' : 'bg-[#F8E3D6]'}`}>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-bold">
                  <span className="inline-flex items-center gap-1.5 text-sky-900">مدين <span dir="ltr" className="font-mono text-sm">{totalDebitSar.toFixed(2)}</span></span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-900">دائن <span dir="ltr" className="font-mono text-sm">{totalCreditSar.toFixed(2)}</span></span>
                </div>
                <span role="status" className={`inline-flex items-center gap-1.5 text-xs font-bold ${isBalanced ? 'text-emerald-800' : 'text-[#8A4A2B]'}`}>
                  {isBalanced ? <CheckIcon /> : <AlertIcon />}
                  {isBalanced ? 'القيد متزن وجاهز للحفظ' : totalDebitSar + totalCreditSar === 0 ? 'أدخل مبالغ المدين والدائن' : `الفرق ${diffSar.toFixed(2)} ر.س`}
                </span>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setDrawer(false)} className="h-12 flex-1 rounded-xl bg-[#FAF9F8] px-5 text-sm font-bold transition-all hover:bg-[#F0E9E4] active:scale-[0.97] cursor-pointer @lg:flex-none">إلغاء</button>
                <button
                  type="submit"
                  disabled={loading || !isBalanced}
                  aria-busy={loading}
                  className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-[#54453D] px-6 text-sm font-bold text-white transition-all duration-150 hover:bg-[#433730] active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed @lg:flex-none"
                >
                  {loading && <i aria-hidden="true" className="block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" />}
                  {loading ? 'جاري الحفظ...' : 'حفظ كمسودة'}
                </button>
              </div>
            </footer>
          </form>
        </div>
      )}

      {/* ───────── confirm dialogs (replace the browser's confirm / prompt) ───────── */}
      {dialog && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="journal-dialog-title">
          <button type="button" aria-label="إغلاق" onClick={() => setDialog(null)} className="rx-fade absolute inset-0 cursor-default bg-[#54453D]/50" />
          <div className="rx-pop relative w-full max-w-md space-y-4 rounded-3xl bg-white p-6">
            <span aria-hidden="true" className={`grid size-12 place-items-center rounded-2xl ${dialog.kind === 'post' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {dialog.kind === 'post' ? <SendIcon /> : <UndoIcon size={22} />}
            </span>
            <div>
              <h2 id="journal-dialog-title" className="m-0 text-base font-bold">
                {dialog.kind === 'post' ? `ترحيل القيد ${dialog.entry.entryNumber}؟` : `عكس القيد ${dialog.entry.entryNumber}؟`}
              </h2>
              <p className="mb-0 mt-2 text-sm leading-7 text-[#6B5B52]">
                {dialog.kind === 'post'
                  ? 'بعد الترحيل يصبح القيد نهائياً ولا يمكن تعديله أو حذفه.'
                  : 'سيُنشأ قيد عكسي ويُرحّل تلقائياً. اكتب سبب العكس ليُحفظ في سجل القيد.'}
              </p>
            </div>

            {dialog.kind === 'reverse' && (
              <div>
                <Label htmlFor="jd-reason">سبب العكس<span className="ms-1 text-[#A8473B]" aria-hidden="true">*</span></Label>
                <textarea id="jd-reason" autoFocus rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={`${fieldCream} h-auto resize-none py-2.5 leading-7`} />
              </div>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => setDialog(null)} className="h-11 flex-1 rounded-xl bg-[#FAF9F8] text-sm font-bold transition-all hover:bg-[#F0E9E4] active:scale-95 cursor-pointer">إلغاء</button>
              {dialog.kind === 'post' ? (
                <button type="button" disabled={loading} onClick={() => runPost(dialog.entry.id)} className="flex h-11 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-bold text-white transition-all hover:bg-emerald-800 active:scale-95 disabled:opacity-50 cursor-pointer">
                  {loading && <i aria-hidden="true" className="block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" />}
                  تأكيد الترحيل
                </button>
              ) : (
                <button type="button" disabled={loading || !reason.trim()} onClick={() => runReverse(dialog.entry.id)} className="flex h-11 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-rose-700 text-sm font-bold text-white transition-all hover:bg-rose-800 active:scale-95 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                  {loading && <i aria-hidden="true" className="block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" />}
                  تأكيد العكس
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}