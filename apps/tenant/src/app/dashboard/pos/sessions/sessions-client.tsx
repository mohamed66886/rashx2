'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BranchDoc, PosSessionDoc } from '@/lib/firebase-server';
import { openPosSessionAction } from '../actions';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

export function SessionsClient({
  branches,
  sessions,
  canOpenSession,
}: {
  branches: BranchDoc[];
  sessions: PosSessionDoc[];
  canOpenSession: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [openingCashSar, setOpeningCashSar] = useState('0');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const branchMap = new Map(branches.map((b) => [b.id, b.name]));
  const openSessions = sessions.filter((s) => s.status === 'OPEN');
  const closedSessions = sessions.filter((s) => s.status !== 'OPEN');

  const handleOpenSession = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const openingCashHalalas = Math.round(Number(openingCashSar) * 100);
    if (!Number.isFinite(openingCashHalalas) || openingCashHalalas < 0) {
      setError('الرصيد الافتتاحي يجب أن يكون رقماً غير سالب.');
      return;
    }

    startTransition(async () => {
      const res = await openPosSessionAction({
        branchId,
        openingCashHalalas,
        notes: notes.trim() || undefined,
      });
      if (!res.success || !res.session) {
        setError(res.error || 'تعذر فتح الجلسة.');
        return;
      }
      setShowOpenForm(false);
      setNotes('');
      router.push(`/dashboard/pos/sessions/${res.session.id}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2D221D]">جلسات الصندوق (الورديات)</h1>
          <p className="text-xs text-[#6B5B52] mt-1">
            متابعة الصندوق النقدي، الإيداعات والسحوبات، ومطابقة الإغلاق
          </p>
        </div>
        {canOpenSession && (
          <button
            type="button"
            onClick={() => setShowOpenForm((v) => !v)}
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3F332C]"
          >
            + فتح جلسة صندوق جديدة
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
          {error}
        </div>
      )}

      {showOpenForm && canOpenSession && (
        <form
          onSubmit={handleOpenSession}
          className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4"
        >
          <h2 className="text-sm font-black text-[#2D221D]">فتح جلسة صندوق جديدة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">الفرع</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">
                الرصيد الافتتاحي (ر.س)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={openingCashSar}
                onChange={(e) => setOpeningCashSar(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">ملاحظات</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اختياري..."
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
            >
              {isPending ? 'جاري الفتح...' : 'فتح الجلسة'}
            </button>
            <button
              type="button"
              onClick={() => setShowOpenForm(false)}
              className="px-4 py-2 rounded-xl border border-[#E6DDD6] text-xs font-bold text-[#54453D]"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Active Open Sessions */}
      {openSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-black text-emerald-800">الجلسات المفتوحة حالياً</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openSessions.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/pos/sessions/${s.id}`}
                className="block bg-emerald-50/50 rounded-2xl border-2 border-emerald-200 p-5 hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-[#2D221D]">
                    {branchMap.get(s.branchId) || s.branchId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    مفتوحة
                  </span>
                </div>
                <p className="text-xs text-[#6B5B52] mt-1">الكاشير: {s.cashierName}</p>
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div>
                    <div className="text-[11px] text-[#6B5B52]">الافتتاحي</div>
                    <div className="font-bold">{formatSar(s.openingCashHalalas)} ر.س</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B5B52]">المبيعات النقدية</div>
                    <div className="font-bold text-emerald-700">
                      {formatSar(s.cashSalesHalalas)} ر.س
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B5B52]">الرصيد المتوقع</div>
                    <div className="font-black text-[#2D221D]">
                      {formatSar(s.expectedCashHalalas)} ر.س
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All / Closed Sessions Table */}
      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        <div className="p-4 border-b border-[#E6DDD6]">
          <h2 className="text-sm font-black text-[#2D221D]">سجل الجلسات السابقة</h2>
        </div>
        {closedSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B5B52]">
            لا توجد جلسات مغلقة حتى الآن.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
                <tr>
                  <th className="py-3 px-4 font-bold">الفرع</th>
                  <th className="py-3 px-4 font-bold">الكاشير</th>
                  <th className="py-3 px-4 font-bold">وقت الفتح</th>
                  <th className="py-3 px-4 font-bold">الرصيد المتوقع</th>
                  <th className="py-3 px-4 font-bold">الجرد الفعلي</th>
                  <th className="py-3 px-4 font-bold">الفرق</th>
                  <th className="py-3 px-4 font-bold">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E2]">
                {closedSessions.map((s) => {
                  const diff = s.cashDifferenceHalalas ?? 0;
                  return (
                    <tr key={s.id} className="hover:bg-[#FAF6F3]/60">
                      <td className="py-3 px-4 font-bold text-[#2D221D]">
                        {branchMap.get(s.branchId) || s.branchId}
                      </td>
                      <td className="py-3 px-4 text-[#54453D]">{s.cashierName}</td>
                      <td className="py-3 px-4 text-[#6B5B52]" dir="ltr">
                        {new Date(s.openedAt).toLocaleString('ar-SA', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {formatSar(s.expectedCashHalalas)} ر.س
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {s.actualCountedCashHalalas !== null
                          ? `${formatSar(s.actualCountedCashHalalas)} ر.س`
                          : '—'}
                      </td>
                      <td
                        className={`py-3 px-4 font-bold ${
                          diff === 0
                            ? 'text-emerald-700'
                            : diff > 0
                              ? 'text-blue-700'
                              : 'text-red-700'
                        }`}
                      >
                        {diff > 0 ? `+${formatSar(diff)}` : formatSar(diff)} ر.س
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/pos/sessions/${s.id}`}
                          className="px-3 py-1.5 rounded-lg bg-[#FAF6F3] border border-[#E6DDD6] text-[#54453D] font-bold"
                        >
                          التفاصيل
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
