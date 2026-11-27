'use client';

import { useState, useTransition } from 'react';
import { runReconciliationAction } from './actions';

export function InventoryOverviewClient() {
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<{
    balanced: boolean;
    discrepancies: Array<{ type: string; entityId: string; message: string }>;
    repairedOutboxIds: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = (repairOutbox: boolean) => {
    setError(null);
    startTransition(async () => {
      const res = await runReconciliationAction(repairOutbox);
      if (!res.success || !res.result) {
        setError(res.error || 'تعذر تشغيل المطابقة.');
        return;
      }
      setReport(res.result);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-[#2D221D]">أداة مطابقة المخزون والمحاسبة</h2>
          <p className="text-xs text-[#6B5B52]">
            فحص تطابق الأرصدة مع دفتر الحركات والتحويلات والقيود المحاسبية المعلقة
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleRun(false)}
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3F332C] disabled:opacity-50"
          >
            {isPending ? 'جاري الفحص...' : 'تشغيل فحص المطابقة'}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleRun(true)}
            className="px-4 py-2 rounded-xl border border-[#E6DDD6] text-xs font-bold text-[#54453D] hover:bg-[#FAF6F3] disabled:opacity-50"
          >
            فحص + ترحيل المعلق
          </button>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 text-xs text-red-800 font-bold">{error}</div>}

      {report && (
        <div className="space-y-2 text-xs">
          {report.balanced ? (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
              ✓ جميع أرصدة المخزون والحركات والتحويلات والقيود متطابقة 100%.
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="font-bold text-amber-900">
                تم رصد ({report.discrepancies.length}) فروقات:
              </div>
              {report.discrepancies.map((d, i) => (
                <div key={i} className="text-amber-800">
                  • [{d.type}] ({d.entityId}): {d.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

