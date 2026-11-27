'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { GoodsReceiptDoc, PurchaseOrderDoc } from '@/lib/firebase-server';
import {
  approvePurchaseOrderAction,
  cancelPurchaseOrderAction,
  receiveGoodsAction,
  submitPurchaseOrderAction,
} from '../../actions';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

export function PoDetailClient({
  po,
  receipts,
  canSubmit,
  canApprove,
  canReceive,
}: {
  po: PurchaseOrderDoc;
  receipts: GoodsReceiptDoc[];
  canSubmit: boolean;
  canApprove: boolean;
  canReceive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [receiveQtys, setReceiveQtys] = useState<Record<string, string>>(
    Object.fromEntries(
      po.lineItems.map((l) => [l.lineId, String(Math.max(0, l.orderedQuantity - l.receivedQuantity))])
    )
  );

  const canDoReceive =
    canReceive && (po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED');

  const handleAction = (fn: () => Promise<{ success: boolean; error?: string }>, okMsg: string) => {
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.success) {
        setError(res.error || 'تعذر تنفيذ العملية.');
        return;
      }
      setMsg(okMsg);
      router.refresh();
    });
  };

  const handleReceive = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = po.lineItems
      .map((l) => ({
        lineId: l.lineId,
        acceptedQuantity: Number(receiveQtys[l.lineId] || 0),
      }))
      .filter((l) => l.acceptedQuantity > 0);
    if (!lines.length) {
      setError('أدخل كمية مستلمة واحدة على الأقل.');
      return;
    }
    handleAction(
      () =>
        receiveGoodsAction({
          purchaseOrderId: po.id,
          idempotencyKey: `gr_${po.id}_${Date.now()}`,
          lines,
        }),
      'تم استلام البضاعة وإضافتها للمخزون وترحيل القيد المحاسبي.'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/inventory/purchase-orders"
            className="text-xs font-bold text-[#54453D] hover:underline"
          >
            ← أوامر الشراء
          </Link>
          <h1 className="text-2xl font-black text-[#2D221D] mt-1 font-mono">{po.poNumber}</h1>
          <p className="text-xs text-[#6B5B52]">
            المورد: {po.supplierNameSnapshot} • الفرع: {po.branchNameSnapshot} • الحالة: {po.status}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {po.status === 'DRAFT' && canSubmit && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleAction(() => submitPurchaseOrderAction(po.id), 'تم تقديم الأمر للاعتماد.')}
              className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold"
            >
              تقديم للاعتماد
            </button>
          )}
          {po.status === 'SUBMITTED' && canApprove && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleAction(() => approvePurchaseOrderAction(po.id), 'تم اعتماد أمر الشراء.')}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              اعتماد أمر الشراء
            </button>
          )}
          {(po.status === 'DRAFT' || po.status === 'SUBMITTED' || po.status === 'APPROVED') && (
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                handleAction(() => cancelPurchaseOrderAction(po.id, 'إلغاء من لوحة التحكم'), 'تم إلغاء أمر الشراء.')
              }
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
            >
              إلغاء الأمر
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
          {error}
        </div>
      )}
      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
          {msg}
        </div>
      )}

      <form onSubmit={handleReceive} className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        <div className="p-4 border-b border-[#E6DDD6] font-black text-sm">بنود أمر الشراء</div>
        <table className="w-full text-right text-xs">
          <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
            <tr>
              <th className="py-3 px-4">المنتج</th>
              <th className="py-3 px-4">المطلوب</th>
              <th className="py-3 px-4">المستلم سابقاً</th>
              <th className="py-3 px-4">تكلفة الوحدة</th>
              <th className="py-3 px-4">الإجمالي</th>
              {canDoReceive && <th className="py-3 px-4">كمية الاستلام الآن</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0E8E2]">
            {po.lineItems.map((l) => {
              const rem = Math.max(0, l.orderedQuantity - l.receivedQuantity);
              return (
                <tr key={l.lineId}>
                  <td className="py-3 px-4 font-bold">{l.nameArSnapshot}</td>
                  <td className="py-3 px-4">{l.orderedQuantity}</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">{l.receivedQuantity}</td>
                  <td className="py-3 px-4">{formatSar(l.unitCostHalalas)} ر.س</td>
                  <td className="py-3 px-4 font-bold">{formatSar(l.totalHalalas)} ر.س</td>
                  {canDoReceive && (
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max={rem}
                        value={receiveQtys[l.lineId] ?? '0'}
                        onChange={(e) =>
                          setReceiveQtys((prev) => ({ ...prev, [l.lineId]: e.target.value }))
                        }
                        className="w-24 px-2 py-1 rounded-lg border border-[#E6DDD6] bg-[#FAF6F3]"
                      />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {canDoReceive && (
          <div className="p-4 border-t border-[#E6DDD6] flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              {isPending ? 'جاري الاستلام...' : 'تأكيد استلام البضاعة وإضافتها للمخزون'}
            </button>
          </div>
        )}
      </form>

      {receipts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-2 text-xs">
          <h2 className="text-sm font-black">سندات الاستلام ({receipts.length})</h2>
          {receipts.map((r) => (
            <div key={r.id} className="flex justify-between border-b border-[#F0E8E2] pb-2">
              <span className="font-mono font-bold">{r.receiptNumber}</span>
              <span>التكلفة المستلمة: {formatSar(r.totalAcceptedCostHalalas)} ر.س</span>
              <span dir="ltr">{r.receivedDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

