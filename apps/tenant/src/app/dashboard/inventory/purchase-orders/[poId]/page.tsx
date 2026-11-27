import { notFound, redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import { PurchasingRepository, hasPermission } from '@/lib/firebase-server';
import { PoDetailClient } from './po-detail-client';

export const dynamic = 'force-dynamic';

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ poId: string }>;
}) {
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

  const { poId } = await params;
  const tenantId = session.tenant.tenantId;
  const purchRepo = new PurchasingRepository();
  const po = await purchRepo.getPurchaseOrderById(actor, tenantId, poId);
  if (!po) notFound();

  const receipts = await purchRepo.listGoodsReceipts(actor, tenantId, { purchaseOrderId: po.id });

  return (
    <PoDetailClient
      po={po}
      receipts={receipts}
      canSubmit={hasPermission(actor.role, 'purchase_orders.submit')}
      canApprove={hasPermission(actor.role, 'purchase_orders.approve')}
      canReceive={hasPermission(actor.role, 'goods_receipts.record')}
    />
  );
}

