import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  InventoryRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { AdjustmentsClient } from './adjustments-client';

export const dynamic = 'force-dynamic';

export default async function StockAdjustmentsPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) redirect('/login');

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'inventory.read')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
      </div>
    );
  }

  const tenantId = session.tenant.tenantId;
  const invRepo = new InventoryRepository();
  const branchRepo = new BranchRepository();

  const [branches, products, adjustments, counts] = await Promise.all([
    branchRepo.listBranches(tenantId),
    invRepo.listProducts(actor, tenantId, { status: 'ACTIVE' }),
    invRepo.listStockAdjustments(actor, tenantId),
    invRepo.listStockCounts(actor, tenantId),
  ]);

  return (
    <AdjustmentsClient
      branches={branches}
      products={products}
      adjustments={adjustments}
      counts={counts}
      canCreateAdj={hasPermission(actor.role, 'stock_adjustments.create')}
      canApproveAdj={hasPermission(actor.role, 'stock_adjustments.approve')}
      canConductCount={hasPermission(actor.role, 'stock_counts.conduct')}
    />
  );
}

