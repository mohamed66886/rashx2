import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  InventoryRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { ProductsClient } from './products-client';

export const dynamic = 'force-dynamic';

export default async function InventoryProductsPage() {
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

  const [categories, products, branches] = await Promise.all([
    invRepo.listCategories(actor, tenantId),
    invRepo.listProducts(actor, tenantId),
    branchRepo.listBranches(tenantId),
  ]);

  return (
    <ProductsClient
      categories={categories}
      products={products}
      branches={branches}
      canManageProducts={hasPermission(actor.role, 'products.manage')}
      canManageCategories={hasPermission(actor.role, 'product_categories.manage')}
      canRecordOpening={hasPermission(actor.role, 'stock_adjustments.create')}
    />
  );
}

