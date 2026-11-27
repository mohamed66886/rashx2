import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  InventoryRepository,
  PurchasingRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { PurchaseOrdersClient } from './po-client';

export const dynamic = 'force-dynamic';

export default async function PurchaseOrdersPage() {
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
  const purchRepo = new PurchasingRepository();
  const invRepo = new InventoryRepository();
  const branchRepo = new BranchRepository();

  const [branches, products, suppliers, orders] = await Promise.all([
    branchRepo.listBranches(tenantId),
    invRepo.listProducts(actor, tenantId, { status: 'ACTIVE' }),
    hasPermission(actor.role, 'suppliers.read')
      ? purchRepo.listSuppliers(actor, tenantId, { status: 'ACTIVE' })
      : Promise.resolve([]),
    purchRepo.listPurchaseOrders(actor, tenantId),
  ]);

  return (
    <PurchaseOrdersClient
      branches={branches}
      products={products}
      suppliers={suppliers}
      orders={orders}
      canCreate={hasPermission(actor.role, 'purchase_orders.create')}
    />
  );
}

