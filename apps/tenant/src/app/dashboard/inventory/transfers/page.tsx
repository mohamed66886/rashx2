import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  InventoryRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { TransfersClient } from './transfers-client';

export const dynamic = 'force-dynamic';

export default async function StockTransfersPage() {
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

  const [branches, products, transfers] = await Promise.all([
    branchRepo.listBranches(tenantId),
    invRepo.listProducts(actor, tenantId, { status: 'ACTIVE' }),
    invRepo.listTransfers(actor, tenantId),
  ]);

  return (
    <TransfersClient
      branches={branches}
      products={products}
      transfers={transfers}
      canInitiate={hasPermission(actor.role, 'stock_transfers.initiate')}
      canApprove={hasPermission(actor.role, 'stock_transfers.approve')}
      canDispatch={hasPermission(actor.role, 'stock_transfers.dispatch')}
      canReceive={hasPermission(actor.role, 'stock_transfers.receive')}
    />
  );
}

