import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  InventoryRepository,
  PurchasingRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { InventoryOverviewClient } from './overview-client';

export const dynamic = 'force-dynamic';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

export default async function InventoryOverviewPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) redirect('/login');

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'inventory.read')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">لا تملك صلاحية عرض المخزون.</p>
      </div>
    );
  }

  const tenantId = session.tenant.tenantId;
  const invRepo = new InventoryRepository();
  const purchRepo = new PurchasingRepository();
  const branchRepo = new BranchRepository();

  const canReadBalances = hasPermission(actor.role, 'inventory_balances.read');
  const canReadValuation = hasPermission(actor.role, 'inventory_valuation.read');
  const canReadSuppliers = hasPermission(actor.role, 'suppliers.read');
  const canReconcile = hasPermission(actor.role, 'inventory_reconciliation.run');

  const [branches, products, balances, purchaseOrders] = await Promise.all([
    branchRepo.listBranches(tenantId),
    invRepo.listProducts(actor, tenantId, { status: 'ACTIVE' }),
    canReadBalances ? invRepo.listBalances(actor, tenantId) : Promise.resolve([]),
    canReadSuppliers ? purchRepo.listPurchaseOrders(actor, tenantId, { limit: 50 }) : Promise.resolve([]),
  ]);

  const prodMap = new Map(products.map((p) => [p.id, p]));
  const branchMap = new Map(branches.map((b) => [b.id, b.name]));

  const totalValuationHalalas = balances.reduce((s, b) => s + b.totalValueHalalas, 0);
  const totalUnits = balances.reduce((s, b) => s + b.quantityOnHand, 0);

  const lowStockItems = balances
    .filter((b) => {
      const p = prodMap.get(b.productId);
      return p && p.stockTrackingEnabled && b.quantityOnHand <= p.minStockThreshold;
    })
    .map((b) => ({
      balanceId: b.id,
      branchName: branchMap.get(b.branchId) || b.branchId,
      productName: prodMap.get(b.productId)?.nameAr || b.productId,
      sku: prodMap.get(b.productId)?.sku || '',
      qty: b.quantityOnHand,
      threshold: prodMap.get(b.productId)?.minStockThreshold ?? 0,
    }));

  const pendingPoCount = purchaseOrders.filter(
    (po) => po.status === 'SUBMITTED' || po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2D221D]">المخزون والمشتريات</h1>
          <p className="text-xs text-[#6B5B52] mt-1">
            نظرة عامة على أرصدة الفروع، التنبيهات، التقييم المالي، والمطابقة
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/inventory/products"
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3F332C]"
          >
            دليل المنتجات
          </Link>
          <Link
            href="/dashboard/inventory/purchase-orders"
            className="px-4 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs font-bold text-[#54453D] hover:bg-[#FAF6F3]"
          >
            أوامر الشراء
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-xs text-[#6B5B52]">المنتجات النشطة</p>
          <p className="text-2xl font-black text-[#2D221D] mt-1">{products.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-xs text-[#6B5B52]">إجمالي الوحدات بالمخزون</p>
          <p className="text-2xl font-black text-[#2D221D] mt-1">{totalUnits}</p>
        </div>
        {canReadValuation && (
          <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
            <p className="text-xs text-[#6B5B52]">إجمالي تقييم المخزون (WAC)</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {formatSar(totalValuationHalalas)} <span className="text-xs font-normal">ر.س</span>
            </p>
          </div>
        )}
        <div className="bg-white rounded-2xl border border-[#E6DDD6] p-4">
          <p className="text-xs text-[#6B5B52]">أوامر شراء قيد المتابعة</p>
          <p className="text-2xl font-black text-amber-800 mt-1">{pendingPoCount}</p>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-5 space-y-3">
          <h2 className="text-sm font-black text-amber-900">
            تنبيهات انخفاض المخزون ({lowStockItems.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {lowStockItems.map((item) => (
              <div
                key={item.balanceId}
                className="bg-white rounded-xl border border-amber-200 p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#2D221D]">{item.productName}</div>
                  <div className="text-[11px] text-[#6B5B52]">
                    {item.branchName} • SKU: {item.sku}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-black text-red-700">المتاح: {item.qty}</div>
                  <div className="text-[11px] text-[#6B5B52]">الحد الأدنى: {item.threshold}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {canReconcile && <InventoryOverviewClient />}
    </div>
  );
}

