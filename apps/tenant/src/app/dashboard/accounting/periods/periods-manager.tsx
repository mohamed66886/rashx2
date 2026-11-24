'use client';

import { useState } from 'react';
import type { FiscalYearDoc, AccountingPeriodDoc } from '@rashx/database';
import { closePeriodAction, reopenPeriodAction } from '../actions';

interface PeriodsManagerProps {
  fiscalYear: FiscalYearDoc | null;
  periods: AccountingPeriodDoc[];
  isOwner: boolean;
}

export function PeriodsManager({ fiscalYear, periods, isOwner }: PeriodsManagerProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  async function handleClose(periodId: string) {
    if (!confirm('هل أنت متأكد من إقفال هذه الفترة المالية؟ لن يُسمح بترحيل أي قيود جديدة على هذه الفترة بعد إقفالها.')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    const result = await closePeriodAction(periodId);
    setLoading(false);

    if (result.success) {
      setMessage({ text: 'تم إقفال الفترة المالية بنجاح.', isError: false });
    } else {
      setMessage({ text: result.error || 'فشل إقفال الفترة', isError: true });
    }
  }

  async function handleReopen(periodId: string) {
    const reason = prompt('يرجى ذكر سبب إعادة فتح هذه الفترة المالية:');
    if (!reason || !reason.trim()) return;

    setLoading(true);
    setMessage(null);
    const result = await reopenPeriodAction(periodId, reason.trim());
    setLoading(false);

    if (result.success) {
      setMessage({ text: 'تمت إعادة فتح الفترة المالية بنجاح.', isError: false });
    } else {
      setMessage({ text: result.error || 'فشل إعادة فتح الفترة', isError: true });
    }
  }

  return (
    <div className="space-y-6">
      {/* Fiscal Year Summary Card */}
      {fiscalYear && (
        <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-[#54453D]">{fiscalYear.name}</h3>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {fiscalYear.status === 'OPEN' ? 'سنة مالية نشطة ومفتوحة' : 'مقفلة'}
              </span>
            </div>
            <p className="text-xs text-[#54453D]/60 font-mono">
              تاريخ البداية: {fiscalYear.startDate} • تاريخ النهاية: {fiscalYear.endDate}
            </p>
          </div>

          <div className="text-xs bg-[#FAF9F8] p-3 rounded-2xl border border-[#54453D]/10 text-[#54453D]/70 font-semibold">
            12 فترة محاسبية شهرية
          </div>
        </div>
      )}

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

      {/* Periods Table */}
      <div className="bg-white rounded-3xl border border-[#54453D]/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF9F8] text-[#54453D]/60 border-b border-[#54453D]/5">
              <tr>
                <th className="px-6 py-3 font-semibold">#</th>
                <th className="px-6 py-3 font-semibold">اسم الفترة</th>
                <th className="px-6 py-3 font-semibold">تاريخ البدء</th>
                <th className="px-6 py-3 font-semibold">تاريخ الانتهاء</th>
                <th className="px-6 py-3 font-semibold">الحالة</th>
                <th className="px-6 py-3 font-semibold text-left">إجراءات الإقفال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#54453D]/5">
              {periods.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF9F8]/60 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-[#54453D]">
                    {p.periodNumber}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-[#54453D]">
                    {p.nameAr}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-[#54453D]/70">{p.startDate}</td>
                  <td className="px-6 py-3.5 font-mono text-[#54453D]/70">{p.endDate}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        p.status === 'OPEN'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {p.status === 'OPEN' ? 'مفتوحة (Open)' : 'مقفلة (Closed)'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-left">
                    {isOwner && (
                      p.status === 'OPEN' ? (
                        <button
                          onClick={() => handleClose(p.id)}
                          disabled={loading}
                          className="text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl transition-colors"
                        >
                          إقفال الفترة
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReopen(p.id)}
                          disabled={loading}
                          className="text-[11px] font-bold text-[#2C4349] bg-[#91B8C0]/20 hover:bg-[#91B8C0]/30 border border-[#91B8C0]/40 px-3 py-1 rounded-xl transition-colors"
                        >
                          إعادة فتح الفترة
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

