'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  BranchDoc,
  ProductDoc,
  PurchaseOrderDoc,
  SupplierDoc,
} from '@/lib/firebase-server';
import { createPurchaseOrderAction } from '../actions';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

export function PurchaseOrdersClient({
  branches,
  products,
  suppliers,
  orders,
  canCreate,
}: {
  branches: BranchDoc[];
  products: ProductDoc[];
  suppliers: SupplierDoc[];
  orders: PurchaseOrderDoc[];
  canCreate: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState('10');
  const [costSar, setCostSar] = useState(
    products[0] ? formatSar(products[0].purchaseCostHalalas) : '0'
  );
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createPurchaseOrderAction({
        branchId,
        supplierId,
        items: [
          {
            productId,
            orderedQuantity: Number(qty),
            unitCostHalalas: Math.round(Number(costSar) * 100),
          },
        ],
      });
      if (!res.success || !res.purchaseOrder) {
        setError(res.error || 'تعذر إنشاء أمر الشراء.');
        return;
      }
      setShowForm(false);
      router.push(`/dashboard/inventory/purchase-orders/${res.purchaseOrder.id}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2D221D]">أوامر الشراء والاستلام</h1>
          <p className="text-xs text-[#6B5B52] mt-1">
            إنشاء واعتماد أوامر الشراء واستلام البضائع بالمخزون
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold"
          >
            + أمر شراء جديد
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
          {error}
        </div>
      )}

      {showForm && canCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">الفرع</label>
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
              <label className="block text-xs font-bold mb-1">المورد</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">المنتج</label>
              <select
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  const p = products.find((x) => x.id === e.target.value);
                  if (p) setCostSar(formatSar(p.purchaseCostHalalas));
                }}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameAr} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">الكمية المطلوبة</label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">تكلفة الوحدة (ر.س)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={costSar}
                onChange={(e) => setCostSar(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
          >
            {isPending ? 'جاري الإنشاء...' : 'إنشاء مسودة أمر الشراء'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#6B5B52]">لا توجد أوامر شراء.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
                <tr>
                  <th className="py-3 px-4 font-bold">رقم الأمر</th>
                  <th className="py-3 px-4 font-bold">المورد</th>
                  <th className="py-3 px-4 font-bold">الفرع</th>
                  <th className="py-3 px-4 font-bold">التاريخ</th>
                  <th className="py-3 px-4 font-bold">الإجمالي</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                  <th className="py-3 px-4 font-bold">تفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E2]">
                {orders.map((po) => (
                  <tr key={po.id}>
                    <td className="py-3 px-4 font-mono font-bold">{po.poNumber}</td>
                    <td className="py-3 px-4 font-bold">{po.supplierNameSnapshot}</td>
                    <td className="py-3 px-4">{po.branchNameSnapshot}</td>
                    <td className="py-3 px-4" dir="ltr">
                      {po.orderDate}
                    </td>
                    <td className="py-3 px-4 font-bold">{formatSar(po.totalHalalas)} ر.س</td>
                    <td className="py-3 px-4">{po.status}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/inventory/purchase-orders/${po.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF6F3] border border-[#E6DDD6] font-bold text-[#54453D]"
                      >
                        عرض واستلام
                      </Link>
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

