import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  InventoryRepository,
  UNIT_METADATA,
  hasPermission,
} from '@/lib/firebase-server';

export const dynamic = 'force-dynamic';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

export default async function InventoryBalancesPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) redirect('/login');

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'inventory_balances.read')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
      </div>
    );
  }

  const sp = await searchParams;
  const tenantId = session.tenant.tenantId;
  const invRepo = new InventoryRepository();
  const branchRepo = new BranchRepository();
  const canReadValuation = hasPermission(actor.role, 'inventory_valuation.read');

  const [branches, products, balances] = await Promise.all([
    branchRepo.listBranches(tenantId),
    invRepo.listProducts(actor, tenantId),
    invRepo.listBalances(actor, tenantId, { branchId: sp.branchId || undefined }),
  ]);

  const branchMap = new Map(branches.map((b) => [b.id, b.name]));
  const prodMap = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#2D221D]">أرصدة المخزون وتقييم الفروع</h1>
        <p className="text-xs text-[#6B5B52] mt-1">
          الكميات المتاحة ومتوسط التكلفة المرجح (WAC) لكل فرع ومنتج
        </p>
      </div>

      <form
        method="GET"
        className="bg-white rounded-2xl border border-[#E6DDD6] p-4 flex flex-wrap items-end gap-4"
      >
        <div className="min-w-[200px] max-w-xs flex-1">
          <label className="block text-xs font-bold text-[#54453D] mb-1">الفرع</label>
          <select
            name="branchId"
            defaultValue={sp.branchId || ''}
            className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
          >
            <option value="">جميع الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold"
        >
          تصفية
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        {balances.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#6B5B52]">لا توجد أرصدة مسجلة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
                <tr>
                  <th className="py-3 px-4 font-bold">الفرع</th>
                  <th className="py-3 px-4 font-bold">المنتج</th>
                  <th className="py-3 px-4 font-bold">الوحدة</th>
                  <th className="py-3 px-4 font-bold">المتوفر</th>
                  {canReadValuation && <th className="py-3 px-4 font-bold">متوسط التكلفة</th>}
                  {canReadValuation && <th className="py-3 px-4 font-bold">القيمة الإجمالية</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E2]">
                {balances.map((b) => {
                  const prod = prodMap.get(b.productId);
                  const isLow = prod && b.quantityOnHand <= prod.minStockThreshold;
                  return (
                    <tr key={b.id}>
                      <td className="py-3 px-4 font-bold text-[#54453D]">
                        {branchMap.get(b.branchId) || b.branchId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#2D221D]">{prod?.nameAr || b.productId}</div>
                        <div className="text-[11px] text-[#6B5B52] font-mono">{prod?.sku}</div>
                      </td>
                      <td className="py-3 px-4">{UNIT_METADATA[b.unit].labelAr}</td>
                      <td className={`py-3 px-4 font-black ${isLow ? 'text-red-700' : 'text-[#2D221D]'}`}>
                        {b.quantityOnHand} {isLow ? '(منخفض)' : ''}
                      </td>
                      {canReadValuation && (
                        <td className="py-3 px-4">{formatSar(b.averageCostHalalas)} ر.س</td>
                      )}
                      {canReadValuation && (
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          {formatSar(b.totalValueHalalas)} ر.س
                        </td>
                      )}
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

