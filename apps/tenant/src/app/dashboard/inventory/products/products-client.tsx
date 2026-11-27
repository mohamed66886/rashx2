'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  UNIT_METADATA,
  type BranchDoc,
  type ProductCategoryDoc,
  type ProductDoc,
  type UnitOfMeasure,
} from '@/lib/firebase-server';
import {
  createProductAction,
  createProductCategoryAction,
  recordOpeningBalanceAction,
  updateProductStatusAction,
} from '../actions';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

export function ProductsClient({
  categories,
  products,
  branches,
  canManageProducts,
  canManageCategories,
  canRecordOpening,
}: {
  categories: ProductCategoryDoc[];
  products: ProductDoc[];
  branches: BranchDoc[];
  canManageProducts: boolean;
  canManageCategories: boolean;
  canRecordOpening: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Category form
  const [catNameAr, setCatNameAr] = useState('');
  // Product form
  const [showProdForm, setShowProdForm] = useState(false);
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [unit, setUnit] = useState<UnitOfMeasure>('PIECE');
  const [costSar, setCostSar] = useState('0');
  const [sellSar, setSellSar] = useState('0');
  const [minThreshold, setMinThreshold] = useState('5');
  // Opening balance modal/inline
  const [openProdId, setOpenProdId] = useState<string | null>(null);
  const [openBranchId, setOpenBranchId] = useState(branches[0]?.id || '');
  const [openQty, setOpenQty] = useState('10');
  const [openCostSar, setOpenCostSar] = useState('0');

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      p.nameAr.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    if (!catNameAr.trim()) return;
    startTransition(async () => {
      const res = await createProductCategoryAction({ nameAr: catNameAr.trim() });
      if (!res.success) {
        setError(res.error || 'تعذر إضافة التصنيف.');
        return;
      }
      setCatNameAr('');
      setMsg('تمت إضافة تصنيف المنتج.');
      router.refresh();
    });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    const purchaseCostHalalas = Math.round(Number(costSar) * 100);
    const sellingPriceHalalas = Number(sellSar) > 0 ? Math.round(Number(sellSar) * 100) : null;
    startTransition(async () => {
      const res = await createProductAction({
        sku: sku.trim(),
        barcode: barcode.trim() || null,
        nameAr: nameAr.trim(),
        categoryId,
        unit,
        purchaseCostHalalas,
        sellingPriceHalalas,
        isSellableInPos: sellingPriceHalalas !== null,
        minStockThreshold: Number(minThreshold) || 0,
      });
      if (!res.success) {
        setError(res.error || 'تعذر إضافة المنتج.');
        return;
      }
      setShowProdForm(false);
      setSku('');
      setBarcode('');
      setNameAr('');
      setMsg('تمت إضافة المنتج بنجاح.');
      router.refresh();
    });
  };

  const handleOpeningBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openProdId) return;
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await recordOpeningBalanceAction({
        branchId: openBranchId,
        productId: openProdId,
        quantity: Number(openQty),
        unitCostHalalas: Math.round(Number(openCostSar) * 100),
        idempotencyKey: `open_${openBranchId}_${openProdId}_${Date.now()}`,
      });
      if (!res.success) {
        setError(res.error || 'تعذر تسجيل الرصيد الافتتاحي.');
        return;
      }
      setOpenProdId(null);
      setMsg('تم تسجيل الرصيد الافتتاحي وتحديث المخزون.');
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2D221D]">دليل المنتجات والتصنيفات</h1>
          <p className="text-xs text-[#6B5B52] mt-1">
            إدارة المنتجات، الوحدات، رموز SKU والباركود، والأرصدة الافتتاحية
          </p>
        </div>
        {canManageProducts && (
          <button
            type="button"
            onClick={() => setShowProdForm((v) => !v)}
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3F332C]"
          >
            + إضافة منتج جديد
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

      {canManageCategories && (
        <form
          onSubmit={handleAddCategory}
          className="bg-white rounded-2xl border border-[#E6DDD6] p-4 flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-[#54453D] mb-1">
              تصنيف منتجات جديد
            </label>
            <input
              type="text"
              value={catNameAr}
              onChange={(e) => setCatNameAr(e.target.value)}
              placeholder="مثال: العناية بالشعر، مستلزمات الحلاقة..."
              className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold"
          >
            إضافة تصنيف
          </button>
        </form>
      )}

      {showProdForm && canManageProducts && (
        <form
          onSubmit={handleAddProduct}
          className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4"
        >
          <h2 className="text-sm font-black text-[#2D221D]">بيانات المنتج الجديد</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">اسم المنتج</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">رمز SKU (فريد)</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">الباركود (اختياري)</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">التصنيف</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">الوحدة</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              >
                {Object.entries(UNIT_METADATA).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.labelAr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">
                تكلفة الشراء (ر.س)
              </label>
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
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">
                سعر البيع في POS (ر.س)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={sellSar}
                onChange={(e) => setSellSar(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">حد التنبيه الأدنى</label>
              <input
                type="number"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
          >
            {isPending ? 'جاري الحفظ...' : 'حفظ المنتج'}
          </button>
        </form>
      )}

      {openProdId && canRecordOpening && (
        <form
          onSubmit={handleOpeningBalance}
          className="bg-[#FAF6F3] rounded-2xl border border-[#E6DDD6] p-5 space-y-4"
        >
          <h2 className="text-sm font-black text-[#2D221D]">تسجيل رصيد افتتاحي للمنتج</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">الفرع</label>
              <select
                value={openBranchId}
                onChange={(e) => setOpenBranchId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
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
                value={openQty}
                onChange={(e) => setOpenQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">تكلفة الوحدة (ر.س)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={openCostSar}
                onChange={(e) => setOpenCostSar(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              تأكيد الرصيد الافتتاحي
            </button>
            <button
              type="button"
              onClick={() => setOpenProdId(null)}
              className="px-4 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs font-bold"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو SKU أو الباركود..."
          className="w-full max-w-md px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#6B5B52]">لا توجد منتجات.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
                <tr>
                  <th className="py-3 px-4 font-bold">المنتج</th>
                  <th className="py-3 px-4 font-bold">SKU</th>
                  <th className="py-3 px-4 font-bold">التصنيف</th>
                  <th className="py-3 px-4 font-bold">الوحدة</th>
                  <th className="py-3 px-4 font-bold">التكلفة</th>
                  <th className="py-3 px-4 font-bold">سعر البيع</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                  <th className="py-3 px-4 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E2]">
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 font-bold text-[#2D221D]">{p.nameAr}</td>
                    <td className="py-3 px-4 font-mono text-[#54453D]">{p.sku}</td>
                    <td className="py-3 px-4">{p.categoryNameAr}</td>
                    <td className="py-3 px-4">{UNIT_METADATA[p.unit].labelAr}</td>
                    <td className="py-3 px-4">{formatSar(p.purchaseCostHalalas)} ر.س</td>
                    <td className="py-3 px-4 font-bold">
                      {p.sellingPriceHalalas !== null ? `${formatSar(p.sellingPriceHalalas)} ر.س` : '—'}
                    </td>
                    <td className="py-3 px-4">{p.status}</td>
                    <td className="py-3 px-4 flex flex-wrap gap-2">
                      {canRecordOpening && p.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenProdId(p.id);
                            setOpenCostSar(formatSar(p.purchaseCostHalalas));
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF6F3] border border-[#E6DDD6] font-bold text-[#54453D]"
                        >
                          رصيد افتتاحي
                        </button>
                      )}
                      {canManageProducts && p.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() => {
                            startTransition(async () => {
                              await updateProductStatusAction({
                                productId: p.id,
                                status: 'ARCHIVED',
                              });
                              router.refresh();
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 font-bold"
                        >
                          أرشفة
                        </button>
                      )}
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

