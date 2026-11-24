'use client';

import { useState } from 'react';
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

export function JournalManager({
  entries,
  accounts,
  openPeriods,
  isOwner,
}: JournalManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // New Journal State
  const [descriptionAr, setDescriptionAr] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]!);
  const [periodId, setPeriodId] = useState(openPeriods[0]?.id || '');
  const [lines, setLines] = useState<
    Array<{
      accountId: string;
      description: string;
      debitSar: string;
      creditSar: string;
    }>
  >([
    { accountId: accounts.find((a) => a.code === '1010')?.id || accounts[0]?.id || '', description: '', debitSar: '', creditSar: '' },
    { accountId: accounts.find((a) => a.code === '4010')?.id || accounts[1]?.id || '', description: '', debitSar: '', creditSar: '' },
  ]);

  const postingAccounts = accounts.filter((a) => a.isPosting);

  // Live total calculation
  const totalDebitSar = lines.reduce((acc, l) => acc + (parseFloat(l.debitSar) || 0), 0);
  const totalCreditSar = lines.reduce((acc, l) => acc + (parseFloat(l.creditSar) || 0), 0);
  const isBalanced = totalDebitSar > 0 && Math.abs(totalDebitSar - totalCreditSar) < 0.001;

  function handleAddLine() {
    setLines([
      ...lines,
      { accountId: postingAccounts[0]?.id || '', description: '', debitSar: '', creditSar: '' },
    ]);
  }

  function handleRemoveLine(index: number) {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  }

  function handleLineChange(
    index: number,
    field: 'accountId' | 'description' | 'debitSar' | 'creditSar',
    val: string
  ) {
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

    const result = await createDraftJournalAction({
      descriptionAr,
      entryDate,
      periodId,
      lines: formattedLines,
    });

    setLoading(false);
    if (result.success) {
      setMessage({ text: 'تم حفظ مسودة القيد بنجاح! يمكنك الآن مراجعتها وترحيلها.', isError: false });
      setShowCreateModal(false);
      setDescriptionAr('');
    } else {
      setMessage({ text: result.error || 'فشل حفظ القيد', isError: true });
    }
  }

  async function handlePost(entryId: string) {
    if (!confirm('هل أنت متأكد من ترحيل هذا القيد؟ بعد الترحيل، يصبح القيد نهائياً ولا يمكن تعديله أو حذفه.')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    const result = await postJournalAction(entryId);
    setLoading(false);

    if (result.success) {
      setMessage({ text: 'تم ترحيل القيد وتحديث أرصدة دفتر الأستاذ بنجاح!', isError: false });
    } else {
      setMessage({ text: result.error || 'فشل ترحيل القيد', isError: true });
    }
  }

  async function handleReverse(entryId: string) {
    const reason = prompt('يرجى كتابة سبب عكس هذا القيد:');
    if (!reason || !reason.trim()) {
      return;
    }

    setLoading(true);
    setMessage(null);
    const result = await reverseJournalAction(entryId, reason.trim());
    setLoading(false);

    if (result.success) {
      setMessage({ text: 'تم إنشاء القيد العكسي وترحيله بنجاح!', isError: false });
    } else {
      setMessage({ text: result.error || 'فشل عكس القيد', isError: true });
    }
  }

  const formatSAR = (halalas: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(halalas / 100) + ' ر.س';
  };

  const statusBadges: Record<string, { label: string; class: string }> = {
    DRAFT: { label: 'مسودة (Draft)', class: 'bg-amber-50 text-amber-800 border-amber-200' },
    POSTED: { label: 'مرحل ومعتمد (Posted)', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    REVERSED: { label: 'معكوس بقيد آخر (Reversed)', class: 'bg-rose-50 text-rose-800 border-rose-200' },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>✍️</span> القيود اليومية (General Journal Entries)
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            تسجيل وترحيل قيود اليومية بنظام القيد المزدوج، ترحيل لحظي آمن لدفتر الأستاذ، وعكس القيود.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3d322c] transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <span>➕</span>
          <span>إنشاء قيد يومية يدوي</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border ${
            message.isError
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Modal / Dialog for New Journal Entry */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#54453D]/10 shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#54453D]/10">
              <h3 className="text-base font-bold text-[#54453D] flex items-center gap-2">
                <span>📝</span> قيد يومية يدوي جديد
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDraft} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    شرح القيد (البيان بالعربية) *
                  </label>
                  <input
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    required
                    placeholder="مثال: إثبات إيراد مبيعات الخدمات نقداً"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    تاريخ القيد *
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  الفترة المالية المحاسبية *
                </label>
                <select
                  value={periodId}
                  onChange={(e) => setPeriodId(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                >
                  {openPeriods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameAr} ({p.startDate} إلى {p.endDate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Journal Lines Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#54453D]">
                    بنود القيد (الحسابات، المدين، الدائن):
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-[#2C4349] font-bold bg-[#91B8C0]/20 hover:bg-[#91B8C0]/30 px-3 py-1 rounded-lg border border-[#91B8C0]/30"
                  >
                    + إضافة سطر
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-[#FAF9F8] p-3 rounded-2xl border border-[#54453D]/10"
                    >
                      <div className="col-span-5">
                        <label className="block text-[10px] text-[#54453D]/60 mb-0.5">الحساب</label>
                        <select
                          value={line.accountId}
                          onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                          className="w-full text-xs p-1.5 rounded-lg border border-[#54453D]/15 bg-white"
                        >
                          {postingAccounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code} - {a.nameAr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-[#54453D]/60 mb-0.5">البيان الفرعي</label>
                        <input
                          placeholder="اختياري"
                          value={line.description}
                          onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                          className="w-full text-xs p-1.5 rounded-lg border border-[#54453D]/15 bg-white"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-blue-800 mb-0.5">مدين (ر.س)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={line.debitSar}
                          onChange={(e) => handleLineChange(idx, 'debitSar', e.target.value)}
                          className="w-full text-xs p-1.5 rounded-lg border border-[#54453D]/15 bg-white font-mono text-left font-bold"
                        />
                      </div>

                      <div className="col-span-2 flex items-center gap-1">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-emerald-800 mb-0.5">دائن (ر.س)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={line.creditSar}
                            onChange={(e) => handleLineChange(idx, 'creditSar', e.target.value)}
                            className="w-full text-xs p-1.5 rounded-lg border border-[#54453D]/15 bg-white font-mono text-left font-bold"
                          />
                        </div>
                        {lines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold pt-3"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Balancer Footer */}
                <div className="p-4 rounded-2xl bg-white border border-[#54453D]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <span>
                      إجمالي المدين: <strong className="font-mono text-blue-800">{totalDebitSar.toFixed(2)} ر.س</strong>
                    </span>
                    <span>
                      إجمالي الدائن: <strong className="font-mono text-emerald-800">{totalCreditSar.toFixed(2)} ر.س</strong>
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-lg font-bold border ${
                      isBalanced
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    {isBalanced ? '✓ القيد متزن وجاهز' : '⚠️ القيد غير متزن'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#54453D]/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#54453D]/20 text-xs font-bold text-[#54453D]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading || !isBalanced}
                  className="px-6 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3d322c] disabled:opacity-50 transition-all"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ كمسودة (Save Draft)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Journal Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#54453D]/10 text-center text-xs text-[#54453D]/60">
            لا توجد قيود يومية مسجلة بعد. يمكنك البدء بإنشاء أول قيد يومية يدوي.
          </div>
        ) : (
          entries.map((entry) => {
            const badge = statusBadges[entry.status] || {
              label: entry.status,
              class: 'bg-gray-100 text-gray-700',
            };

            return (
              <div
                key={entry.id}
                className="bg-white rounded-3xl border border-[#54453D]/10 p-6 shadow-2xs space-y-4"
              >
                {/* Header of Entry */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#54453D]/5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[#54453D] bg-[#FAF9F8] px-3 py-1 rounded-xl border border-[#54453D]/5">
                      {entry.entryNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.class}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-[#54453D]/60 font-mono">
                      {entry.entryDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {entry.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePost(entry.id)}
                        disabled={loading}
                        className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-xl transition-colors"
                      >
                        ترحيل القيد (Post)
                      </button>
                    )}

                    {entry.status === 'POSTED' && isOwner && !entry.reversedByEntryId && (
                      <button
                        onClick={() => handleReverse(entry.id)}
                        disabled={loading}
                        className="text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 px-3.5 py-1.5 rounded-xl transition-colors"
                      >
                        عكس القيد (Reverse)
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#54453D] font-medium">
                  {entry.descriptionAr}
                </p>

                {/* Lines breakdown */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#FAF9F8] text-[#54453D]/60 border-b border-[#54453D]/5">
                      <tr>
                        <th className="px-4 py-2 font-semibold">رمز الحساب</th>
                        <th className="px-4 py-2 font-semibold">اسم الحساب</th>
                        <th className="px-4 py-2 font-semibold">البيان</th>
                        <th className="px-4 py-2 font-semibold text-left">مدين</th>
                        <th className="px-4 py-2 font-semibold text-left">دائن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#54453D]/5">
                      {entry.lines.map((l, i) => (
                        <tr key={i} className="hover:bg-[#FAF9F8]/60">
                          <td className="px-4 py-2 font-mono text-[#54453D]">{l.accountCode}</td>
                          <td className="px-4 py-2 font-bold text-[#54453D]">{l.accountNameAr}</td>
                          <td className="px-4 py-2 text-[#54453D]/70">{l.description}</td>
                          <td className="px-4 py-2 text-left font-mono font-bold text-blue-800">
                            {l.debitHalalas ? formatSAR(l.debitHalalas) : '—'}
                          </td>
                          <td className="px-4 py-2 text-left font-mono font-bold text-emerald-800">
                            {l.creditHalalas ? formatSAR(l.creditHalalas) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#FAF9F8]/60 font-bold border-t border-[#54453D]/10">
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right">
                          المجموع المتوازن:
                        </td>
                        <td className="px-4 py-2 text-left font-mono text-blue-900">
                          {formatSAR(entry.totalDebitHalalas)}
                        </td>
                        <td className="px-4 py-2 text-left font-mono text-emerald-900">
                          {formatSAR(entry.totalCreditHalalas)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

