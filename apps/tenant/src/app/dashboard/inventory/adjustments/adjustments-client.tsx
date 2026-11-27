'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  AdjustmentReason,
  BranchDoc,
  ProductDoc,
  StockAdjustmentDoc,
  StockCountDoc,
} from '@/lib/firebase-server';
import {
  approveStockAdjustmentAction,
  approveStockCountAction,
  createStockAdjustmentAction,
  startStockCountAction,
  submitStockCountAction,
} from '../actions';

export function AdjustmentsClient({
  branches,
  products,
  adjustments,
  counts,
  canCreateAdj,
  canApproveAdj,
  canConductCount,
}: {
  branches: BranchDoc[];
  products: ProductDoc[];
  adjustments: StockAdjustmentDoc[];
  counts: StockCountDoc[];
  canCreateAdj: boolean;
  canApproveAdj: boolean;
  canConductCount: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [direction, setDirection] = useState<'IN' | 'OUT'>('OUT');
  const [reason, setReason] = useState<AdjustmentReason>('DAMAGE');
  const [qty, setQty] = useState('1');
  const [reasonDetails, setReasonDetails] = useState('');
  const [countInputs, setCountInputs] = useState<Record<string, Record<string, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const handleAdj = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await createStockAdjustmentAction({
        branchId,
        productId,
        reason,
        reasonDetails: reasonDetails.trim(),
        direction,
        quantity: Number(qty),
        idempotencyKey: `adj_${branchId}_${productId}_${Date.now()}`,
      });
      if (!res.success) {
        setError(res.error || 'تعذر تسجيل التسوية.');
        return;
      }
      setReasonDetails('');
      setMsg('تم تسجيل التسوية المخزنية.');
      router.refresh();
    });
  };

  const handleStartCount = () => {
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await startStockCountAction({ branchId });
      if (!res.success) {
        setError(res.error || 'تعذر بدء الجرد.');
        return;
      }
      setMsg('تم بدء جلسة الجرد الفعلي.');
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2D221D]">التسويات المخزنية والجرد الفعلي</h1>
          <p className="text-xs text-[#6B5B52] mt-1">
            معالجة التالف والمنتهي الصلاحية وجلسات الجرد والمطابقة المعتمدة
          </p>
        </div>
        {canConductCount && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleStartCount}
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold"
          >
            + بدء جلسة جرد للفرع المحدد
          </button>
        )}
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

      {canCreateAdj && (
        <form
          onSubmit={handleAdj}
          className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4"
        >
          <h2 className="text-sm font-black">تسجيل تسوية مخزنية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameAr}
                </option>
              ))}
            </select>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as 'IN' | 'OUT')}
              className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
            >
              <option value="OUT">نقص / تخفيض (OUT)</option>
              <option value="IN">زيادة (IN)</option>
            </select>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as AdjustmentReason)}
              className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
            >
              <option value="DAMAGE">تلف</option>
              <option value="EXPIRATION">انتهاء صلاحية</option>
              <option value="LOSS">فقدان</option>
              <option value="CORRECTION">تصحيح</option>
              <option value="OTHER">أخرى</option>
            </select>
            <input
              type="number"
              min="1"
              required
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
            />
            <input
              type="text"
              required
              placeholder="تفاصيل السبب..."
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold"
          >
            تسجيل التسوية
          </button>
        </form>
      )}

      {/* Stock Counts */}
      {counts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4">
          <h2 className="text-sm font-black">جلسات الجرد الفعلي</h2>
          {counts.map((c) => (
            <div key={c.id} className="border border-[#E6DDD6] rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {c.branchName} — {c.countDate}
                </span>
                <span className="font-mono font-bold">{c.status}</span>
              </div>
              <div className="space-y-2">
                {c.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-3">
                    <span>
                      {item.productNameAr} (المتوقع: {item.expectedQuantity})
                    </span>
                    {c.status === 'IN_PROGRESS' ? (
                      <input
                        type="number"
                        min="0"
                        defaultValue={item.expectedQuantity}
                        onChange={(e) =>
                          setCountInputs((prev) => ({
                            ...prev,
                            [c.id]: {
                              ...(prev[c.id] || {}),
                              [item.productId]: e.target.value,
                            },
                          }))
                        }
                        className="w-24 px-2 py-1 rounded-lg border border-[#E6DDD6] bg-[#FAF6F3]"
                      />
                    ) : (
                      <span>
                        المعدود: {item.countedQuantity} (الفرق: {item.varianceQuantity})
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {c.status === 'IN_PROGRESS' && canConductCount && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const map = countInputs[c.id] || {};
                      await submitStockCountAction({
                        countId: c.id,
                        counts: c.items.map((item) => ({
                          productId: item.productId,
                          countedQuantity: Number(map[item.productId] ?? item.expectedQuantity),
                        })),
                      });
                      router.refresh();
                    });
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#54453D] text-white font-bold"
                >
                  إرسال الجرد للاعتماد
                </button>
              )}
              {c.status === 'SUBMITTED' && canApproveAdj && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await approveStockCountAction(c.id);
                      router.refresh();
                    });
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-bold"
                >
                  اعتماد وتطبيق الفروقات
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Adjustments Table */}
      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        <div className="p-4 border-b border-[#E6DDD6] font-black text-sm">سجل التسويات</div>
        {adjustments.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B5B52]">لا توجد تسويات مسجلة.</div>
        ) : (
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
              <tr>
                <th className="py-3 px-4">المنتج</th>
                <th className="py-3 px-4">السبب</th>
                <th className="py-3 px-4">الكمية</th>
                <th className="py-3 px-4">قبل ← بعد</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8E2]">
              {adjustments.map((a) => (
                <tr key={a.id}>
                  <td className="py-3 px-4 font-bold">{a.productNameAr}</td>
                  <td className="py-3 px-4">
                    {a.reason}: {a.reasonDetails}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {a.direction === 'IN' ? `+${a.quantity}` : `-${a.quantity}`}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {a.beforeQuantity} → {a.afterQuantity}
                  </td>
                  <td className="py-3 px-4">{a.status}</td>
                  <td className="py-3 px-4">
                    {a.status === 'PENDING_APPROVAL' && canApproveAdj && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            await approveStockAdjustmentAction(a.id);
                            router.refresh();
                          });
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-700 text-white font-bold"
                      >
                        اعتماد
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

