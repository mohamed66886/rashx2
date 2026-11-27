import { notFound, redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  PosRepository,
  PosSessionRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { InvoiceDetailClient } from './invoice-detail-client';

export const dynamic = 'force-dynamic';

export default async function PosInvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) redirect('/login');

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'invoices.read')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">لا تملك صلاحية عرض تفاصيل الفاتورة.</p>
      </div>
    );
  }

  const { invoiceId } = await params;
  const tenantId = session.tenant.tenantId;
  const posRepo = new PosRepository();
  const posSessionRepo = new PosSessionRepository();

  const invoice = await posRepo.getInvoiceById(actor, tenantId, invoiceId);
  if (!invoice) {
    notFound();
  }

  const canReadPayments = hasPermission(actor.role, 'payments.read');
  const canRecordPayment = hasPermission(actor.role, 'payments.record');
  const canRefund = hasPermission(actor.role, 'refunds.record');
  const canVoid = hasPermission(actor.role, 'invoices.void');

  const [payments, refunds, paymentMethods, activeSession] = await Promise.all([
    canReadPayments ? posRepo.listPayments(actor, tenantId, { invoiceId: invoice.id }) : Promise.resolve([]),
    canReadPayments ? posRepo.listRefundsForInvoice(actor, tenantId, invoice.id) : Promise.resolve([]),
    posSessionRepo.listPaymentMethodConfigs(actor, tenantId),
    posSessionRepo.getActiveSession(actor, tenantId, invoice.branchId),
  ]);

  return (
    <InvoiceDetailClient
      invoice={invoice}
      payments={payments}
      refunds={refunds}
      paymentMethods={paymentMethods}
      activeSessionId={activeSession?.id || null}
      canRecordPayment={canRecordPayment}
      canRefund={canRefund}
      canVoid={canVoid}
    />
  );
}

