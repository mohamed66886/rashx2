import { notFound, redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  PurchasingRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { SupplierDetailClient } from './supplier-detail-client';

export const dynamic = 'force-dynamic';

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
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

  const { supplierId } = await params;
  const tenantId = session.tenant.tenantId;
  const purchRepo = new PurchasingRepository();
  const branchRepo = new BranchRepository();

  const supplier = await purchRepo.getSupplierById(actor, tenantId, supplierId);
  if (!supplier) notFound();

  const [branches, purchaseOrders, invoices, payments] = await Promise.all([
    branchRepo.listBranches(tenantId),
    purchRepo.listPurchaseOrders(actor, tenantId, { supplierId }),
    purchRepo.listSupplierInvoices(actor, tenantId, { supplierId }),
    purchRepo.listSupplierPayments(actor, tenantId, { supplierId }),
  ]);

  return (
    <SupplierDetailClient
      supplier={supplier}
      branches={branches}
      purchaseOrders={purchaseOrders}
      invoices={invoices}
      payments={payments}
      canManageInvoices={hasPermission(actor.role, 'supplier_invoices.manage')}
      canRecordPayments={hasPermission(actor.role, 'supplier_payments.record')}
    />
  );
}

