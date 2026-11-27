'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CashMovementDoc, PosSessionDoc } from '@/lib/firebase-server';
import { closePosSessionAction, recordCashMovementAction } from '../../actions';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

function makeIdemKey(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export function SessionDetailClient({
  posSession,
  movements,
  branchName,
  canCashMovement,
  canCloseSession,
}: {
  posSession: PosSessionDoc;
  movements: CashMovementDoc[];
  branchName: string;
  canCashMovement: boolean;
  canCloseSession: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cash movement form
  const [moveType, setMoveType] = useState<'CASH_IN' | 'CASH_OUT'>('CASH_IN');
  const [moveAmountSar, setMoveAmountSar] = useState('');
  const [moveReason, setMoveReason] = useState('');

  // Close session form
  const [actualCashSar, setActualCashSar] = useState(
    formatSar(posSession.expectedCashHalalas)
  );
  const [closeNotes, setCloseNotes] = useState('');

  const isOpen = posSession.status === 'OPEN';

  const handleCashMovement = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const amountHalalas = Math.round(Number(moveAmountSar) * 100);
    if (!Number.isFinite(amountHalalas) || amountHalalas <= 0) {
      setError('أدخل مبلغاً صحيحاً أكبر من صفر.');
      return;
    }
    if (!moveReason.trim()) {
      setError('سبب الحركة النقدية مطلوب.');
      return;
    }

    startTransition(async () => {
      const res = await recordCashMovementAction({
        sessionId: posSession.id,
        type: moveType,
        amountHalalas,
        reason: moveReason.trim(),
        idempotencyKey: makeIdemKey('cashmove'),
      });
      if (!res.success) {
        setError(res.error || 'تعذر تسجيل الحركة النقدية.');
        return;
      }
      setMoveAmountSar('');
      setMoveReason('');
      setSuccessMsg('تم تسجيل الحركة النقدية وتحديث رصيد الصندوق.');
      router.refresh();
    });
  };

  const handleCloseSession = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const actualCountedCashHalalas = Math.round(Number(actualCashSar) * 100);
    if (!Number.isFinite(actualCountedCashHalalas) || actualCountedCashHalalas < 0) {
      setError('أدخل مبلغ الجرد الفعلي بشكل صحيح.');
      return;
    }

    startTransition(async () => {
      const res = await closePosSessionAction({
        sessionId: posSession.id,
        actualCountedCashHalalas,
        notes: closeNotes.trim() || undefined,
      });
      if (!res.success) {
        setError(res.error || 'تعذر إغلاق الجلسة.');
        return;
      }
      setSuccessMsg('تم إغلاق جلسة الصندوق ومطابقة الرصيد.');
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pos/sessions"
            className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs font-bold text-[#54453D] hover:bg-[#FAF6F3]"
          >
            ← جلسات الصندوق
          </Link>
          <div>
            <h1 className="text-xl font-black text-[#2D221D]">
              جلسة صندوق — {branchName}
            </h1>
            <p className="text-xs text-[#6B5B52]">الكاشير: {posSession.cashierName}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            isOpen
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-gray-100 text-gray-700 border-gray-200'
          }`}
        >
          {isOpen ? 'مفتوحة' : 'مغلقة'}
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
          {successMsg}
        </div>
      )}

      {/* Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-[11px] text-[#6B5B52]">الافتتاحي</p>
          <p className="text-base font-black text-[#2D221D] mt-1">
            {formatSar(posSession.openingCashHalalas)} ر.س
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-[11px] text-[#6B5B52]">مبيعات نقدية</p>
          <p className="text-base font-black text-emerald-700 mt-1">
            +{formatSar(posSession.cashSalesHalalas)} ر.س
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-[11px] text-[#6B5B52]">إيداعات نقدية</p>
          <p className="text-base font-black text-blue-700 mt-1">
            +{formatSar(posSession.cashInHalalas)} ر.س
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-[11px] text-[#6B5B52]">سحوبات نقدية</p>
          <p className="text-base font-black text-amber-700 mt-1">
            -{formatSar(posSession.cashOutHalalas)} ر.س
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-[11px] text-[#6B5B52]">استردادات نقدية</p>
          <p className="text-base font-black text-purple-700 mt-1">
            -{formatSar(posSession.cashRefundsHalalas)} ر.س
          </p>
        </div>
        <div className="bg-[#FAF6F3] rounded-2xl border-2 border-[#54453D]/30 p-4">
          <p className="text-[11px] text-[#54453D] font-bold">الرصيد المتوقع</p>
          <p className="text-base font-black text-[#2D221D] mt-1">
            {formatSar(posSession.expectedCashHalalas)} ر.س
          </p>
        </div>
      </div>

      {/* Non-cash summary + closing reconciliation */}
      <div className="bg-white rounded-2xl border border-[#E6DDD6] p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-[#6B5B52]">المبيعات غير النقدية (بطاقة / تحويل): </span>
          <span className="font-black text-[#2D221D]">
            {formatSar(posSession.nonCashSalesHalalas)} ر.س
          </span>
        </div>
        {!isOpen && posSession.actualCountedCashHalalas !== null && (
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-[#6B5B52]">الجرد الفعلي عند الإغلاق: </span>
              <span className="font-black text-[#2D221D]">
                {formatSar(posSession.actualCountedCashHalalas)} ر.س
              </span>
            </div>
            <div>
              <span className="text-[#6B5B52]">فرق المطابقة: </span>
              <span
                className={`font-black ${
                  (posSession.cashDifferenceHalalas ?? 0) === 0
                    ? 'text-emerald-700'
                    : (posSession.cashDifferenceHalalas ?? 0) > 0
                      ? 'text-blue-700'
                      : 'text-red-700'
                }`}
              >
                {formatSar(posSession.cashDifferenceHalalas ?? 0)} ر.س
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions for Open Session */}
      {isOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {canCashMovement && (
            <form
              onSubmit={handleCashMovement}
              className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4"
            >
              <h2 className="text-sm font-black text-[#2D221D]">تسجيل حركة نقدية (إيداع / سحب)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">النوع</label>
                  <select
                    value={moveType}
                    onChange={(e) => setMoveType(e.target.value as 'CASH_IN' | 'CASH_OUT')}
                    className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
                  >
                    <option value="CASH_IN">إيداع نقدي (Cash In)</option>
                    <option value="CASH_OUT">سحب نقدي (Cash Out)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">المبلغ (ر.س)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={moveAmountSar}
                    onChange={(e) => setMoveAmountSar(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">السبب</label>
                <input
                  type="text"
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  placeholder="مثال: تغذية الصندوق بالفكة / مصروف نثري"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold disabled:opacity-50"
              >
                {isPending ? 'جاري التسجيل...' : 'تسجيل الحركة'}
              </button>
            </form>
          )}

          {canCloseSession && (
            <form
              onSubmit={handleCloseSession}
              className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4"
            >
              <h2 className="text-sm font-black text-[#2D221D]">إغلاق الجلسة ومطابقة الصندوق</h2>
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  المبلغ الفعلي المعدود في الصندوق (ر.س)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={actualCashSar}
                  onChange={(e) => setActualCashSar(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">ملاحظات الإغلاق</label>
                <input
                  type="text"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="اختياري..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-red-700 text-white text-xs font-bold hover:bg-red-800 disabled:opacity-50"
              >
                {isPending ? 'جاري الإغلاق...' : 'إغلاق الجلسة نهائياً'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Cash Movements Table */}
      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        <div className="p-4 border-b border-[#E6DDD6]">
          <h2 className="text-sm font-black text-[#2D221D]">حركات الصندوق النقدي</h2>
        </div>
        {movements.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B5B52]">
            لا توجد حركات نقدية مسجلة في هذه الجلسة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
                <tr>
                  <th className="py-3 px-4 font-bold">النوع</th>
                  <th className="py-3 px-4 font-bold">المبلغ</th>
                  <th className="py-3 px-4 font-bold">السبب</th>
                  <th className="py-3 px-4 font-bold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E2]">
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 px-4 font-bold">
                      {m.type === 'CASH_IN' ? (
                        <span className="text-emerald-700">إيداع نقدي</span>
                      ) : (
                        <span className="text-red-700">سحب نقدي</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold">{formatSar(m.amountHalalas)} ر.س</td>
                    <td className="py-3 px-4 text-[#54453D]">{m.reason}</td>
                    <td className="py-3 px-4 text-[#6B5B52]" dir="ltr">
                      {new Date(m.createdAt).toLocaleString('ar-SA', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
