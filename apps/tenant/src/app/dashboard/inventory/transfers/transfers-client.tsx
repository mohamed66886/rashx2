'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { BranchDoc, ProductDoc, StockTransferDoc } from '@/lib/firebase-server';
import {
  approveTransferAction,
  createTransferAction,
  dispatchTransferAction,
  receiveTransferAction,
} from '../actions';

export function TransfersClient({
  branches,
  products,
  transfers,
  canInitiate,
  canApprove,
  canDispatch,
  canReceive,
}: {
  branches: BranchDoc[];
  products: ProductDoc[];
  transfers: StockTransferDoc[];
  canInitiate: boolean;
  canApprove: boolean;
  canDispatch: boolean;
  canReceive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [srcBranchId, setSrcBranchId] = useState(branches[0]?.id || '');
  const [dstBranchId, setDstBranchId] = useState(branches[1]?.id || branches[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await createTransferAction({
        sourceBranchId: srcBranchId,
        destinationBranchId: dstBranchId,
        lines: [{ productId, quantity: Number(qty) }],
      });
      if (!res.success) {
        setError(res.error || 'تعذر إنشاء التحويل.');
        return;
      }
      setMsg('تم إنشاء مسودة التحويل المخزني.');
      router.refresh();
    });
  };

  const runAction = (fn: () => Promise<{ success: boolean; error?: string }>, okMsg: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#2D221D]">تحويلات المخزون بين الفروع</h1>
        <p className="text-xs text-[#6B5B52] mt-1">
          نقل المخزون بين فروع المنشأة مع تتبع الشحن والاستلام وتكلفة الوحدة
        </p>
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

      {canInitiate && branches.length >= 2 && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4"
        >
          <h2 className="text-sm font-black">طلب تحويل مخزني جديد</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">من فرع</label>
              <select
                value={srcBranchId}
                onChange={(e) => setSrcBranchId(e.target.value)}
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
              <label className="block text-xs font-bold mb-1">إلى فرع</label>
              <select
                value={dstBranchId}
                onChange={(e) => setDstBranchId(e.target.value)}
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
              <label className="block text-xs font-bold mb-1">المنتج</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">الكمية</label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold"
          >
            إنشاء التحويل
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        {transfers.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#6B5B52]">لا توجد تحويلات مسجلة.</div>
        ) : (
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
              <tr>
                <th className="py-3 px-4">الرقم</th>
                <th className="py-3 px-4">من ← إلى</th>
                <th className="py-3 px-4">البنود</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8E2]">
              {transfers.map((tr) => (
                <tr key={tr.id}>
                  <td className="py-3 px-4 font-mono font-bold">{tr.transferNumber}</td>
                  <td className="py-3 px-4">
                    {tr.sourceBranchName} ← {tr.destinationBranchName}
                  </td>
                  <td className="py-3 px-4">
                    {tr.lines.map((l) => `${l.nameArSnapshot} (${l.requestedQuantity})`).join('، ')}
                  </td>
                  <td className="py-3 px-4">{tr.status}</td>
                  <td className="py-3 px-4 flex gap-2">
                    {tr.status === 'DRAFT' && canApprove && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => runAction(() => approveTransferAction(tr.id), 'تم اعتماد التحويل.')}
                        className="px-3 py-1 rounded-lg bg-[#54453D] text-white font-bold"
                      >
                        اعتماد
                      </button>
                    )}
                    {tr.status === 'APPROVED' && canDispatch && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          runAction(
                            () => dispatchTransferAction(tr.id, `disp_${tr.id}_${Date.now()}`),
                            'تم شحن التحويل وخصمه من الفرع المرسل.'
                          )
                        }
                        className="px-3 py-1 rounded-lg bg-amber-700 text-white font-bold"
                      >
                        شحن
                      </button>
                    )}
                    {tr.status === 'IN_TRANSIT' && canReceive && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          runAction(
                            () =>
                              receiveTransferAction({
                                transferId: tr.id,
                                idempotencyKey: `recv_${tr.id}_${Date.now()}`,
                              }),
                            'تم استلام التحويل وإضافته للفرع المستلم.'
                          )
                        }
                        className="px-3 py-1 rounded-lg bg-emerald-700 text-white font-bold"
                      >
                        استلام
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

