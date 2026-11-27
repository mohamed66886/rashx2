import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  InventoryRepository,
  hasPermission,
  type StockMovementDoc,
} from '@/lib/firebase-server';

export const dynamic = 'force-dynamic';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

const MOVEMENT_LABELS: Record<StockMovementDoc['movementType'], string> = {
  OPENING_BALANCE: 'رصيد افتتاحي',
  PURCHASE_RECEIPT: 'استلام مشتريات',
  SALE: 'بيع نقطة بيع',
  SALE_RETURN: 'مرتجع مبيعات',
  PURCHASE_RETURN: 'مرتجع مشتريات',
  ADJUSTMENT_IN: 'تسوية بالزيادة',
  ADJUSTMENT_OUT: 'تسوية بالعجز',
  TRANSFER_OUT: 'تحويل صادر',
  TRANSFER_IN: 'تحويل وارد',
  DAMAGE: 'تالف',
  EXPIRED: 'منتهي الصلاحية',
  RESERVED: 'حجز مخزون',
  RELEASED: 'فك حجز',
};

export default async function StockMovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) redirect('/login');

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'stock_movements.read')) {
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

  const [branches, movements] = await Promise.all([
    branchRepo.listBranches(tenantId),
    invRepo.listMovements(actor, tenantId, {
      branchId: sp.branchId || undefined,
      limit: 150,
    }),
  ]);
  const branchMap = new Map(branches.map((b) => [b.id, b.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#2D221D]">دفتر حركات المخزون (غير قابل للتعديل)</h1>
        <p className="text-xs text-[#6B5B52] mt-1">
          سجل تاريخي ثابت لجميع الحركات المخزنية وتغيرات الأرصدة والتكاليف
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        {movements.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#6B5B52]">لا توجد حركات مسجلة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
                <tr>
                  <th className="py-3 px-4 font-bold">التاريخ</th>
                  <th className="py-3 px-4 font-bold">الفرع</th>
                  <th className="py-3 px-4 font-bold">المنتج</th>
                  <th className="py-3 px-4 font-bold">نوع الحركة</th>
                  <th className="py-3 px-4 font-bold">الكمية</th>
                  <th className="py-3 px-4 font-bold">قبل ← بعد</th>
                  <th className="py-3 px-4 font-bold">التكلفة</th>
                  <th className="py-3 px-4 font-bold">السبب / المرجع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E2]">
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 px-4 text-[#6B5B52]" dir="ltr">
                      {new Date(m.timestamp).toLocaleString('ar-SA', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4 text-[#54453D]">
                      {branchMap.get(m.branchId) || m.branchId}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2D221D]">{m.productNameAr}</td>
                    <td className="py-3 px-4">{MOVEMENT_LABELS[m.movementType]}</td>
                    <td
                      className={`py-3 px-4 font-black ${
                        m.direction === 'IN' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {m.direction === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {m.balanceBefore} → {m.balanceAfter}
                    </td>
                    <td className="py-3 px-4">{formatSar(m.totalCostHalalas)} ر.س</td>
                    <td className="py-3 px-4 text-[#6B5B52]">{m.reason}</td>
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

