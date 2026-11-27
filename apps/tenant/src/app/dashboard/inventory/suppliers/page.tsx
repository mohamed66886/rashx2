import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import { PurchasingRepository, hasPermission } from '@/lib/firebase-server';
import { SuppliersClient } from './suppliers-client';

export const dynamic = 'force-dynamic';

export default async function InventorySuppliersPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) redirect('/login');

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'suppliers.read')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
      </div>
    );
  }

  const purchRepo = new PurchasingRepository();
  const suppliers = await purchRepo.listSuppliers(actor, session.tenant.tenantId);

  return (
    <SuppliersClient
      suppliers={suppliers}
      canManage={hasPermission(actor.role, 'suppliers.manage')}
      canReadNotes={hasPermission(actor.role, 'suppliers.read_notes')}
    />
  );
}

