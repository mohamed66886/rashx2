'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  CustomerRepository,
  CustomerError,
  PosError,
  PosRepository,
  PosSessionError,
  PosSessionRepository,
  type CashMovementDoc,
  type CustomerDoc,
  type DiscountSpec,
  type InvoiceDoc,
  type InvoiceType,
  type PaymentDoc,
  type PaymentMethodCode,
  type PaymentMethodConfigDoc,
  type PosSaleDoc,
  type PosSessionDoc,
  type RefundDoc,
} from '@/lib/firebase-server';

function formatPosError(err: unknown, fallback: string): string {
  if (
    err instanceof PosError ||
    err instanceof PosSessionError ||
    err instanceof CustomerError
  ) {
    return err.message;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export async function searchPosCustomersAction(query: string): Promise<{
  success: boolean;
  customers?: CustomerDoc[];
  error?: string;
}> {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new CustomerRepository();
    const res = await repo.listCustomers(actor, session.tenant.tenantId, {
      search: query.trim() || undefined,
      status: 'ACTIVE',
      limit: 20,
    });
    return { success: true, customers: res.customers };
  } catch (err) {
    return { success: false, error: formatPosError(err, 'تعذر البحث عن العملاء.') };
  }
}

export async function quickCreatePosCustomerAction(input: {
  fullName: string;
  phone?: string;
  isGuest?: boolean;
  idempotencyKey: string;
}): Promise<{ success: boolean; customer?: CustomerDoc; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new CustomerRepository();
    const customer = await repo.createCustomer(actor, {
      tenantId: session.tenant.tenantId,
      fullName: input.fullName,
      phone: input.phone,
      isGuest: Boolean(input.isGuest),
      idempotencyKey: input.idempotencyKey,
    });
    revalidatePath('/dashboard/customers');
    return { success: true, customer };
  } catch (err) {
    return { success: false, error: formatPosError(err, 'تعذر إنشاء العميل.') };
  }
}

export async function createAndFinalizeSaleAction(input: {
  branchId: string;
  sessionId?: string | null;
  customerId: string;
  bookingId?: string | null;
  items: Array<{
    serviceId: string;
    quantity: number;
    discount?: DiscountSpec;
  }>;
  payments: Array<{
    method: PaymentMethodCode;
    amountHalalas: number;
    referenceNumber?: string | null;
    cashierAttestation?: string;
  }>;
  invoiceType?: InvoiceType;
  notes?: string;
  idempotencyKey: string;
}): Promise<{
  success: boolean;
  sale?: PosSaleDoc;
  invoice?: InvoiceDoc;
  payments?: PaymentDoc[];
  deduplicated?: boolean;
  error?: string;
}> {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PosRepository();
    const res = await repo.createAndFinalizeSale(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/pos/invoices');
    revalidatePath('/dashboard/pos/payments');
    revalidatePath('/dashboard/pos/sessions');
    if (input.bookingId) {
      revalidatePath(`/dashboard/bookings/${input.bookingId}`);
      revalidatePath('/dashboard/bookings');
    }

    return { success: true, ...res };
  } catch (err) {
    return { success: false, error: formatPosError(err, 'تعذر إتمام عملية البيع وإصدار الفاتورة.') };
  }
}

export async function recordInvoicePaymentAction(input: {
  invoiceId: string;
  sessionId?: string | null;
  method: PaymentMethodCode;
  amountHalalas: number;
  referenceNumber?: string | null;
  cashierAttestation?: string;
  idempotencyKey: string;
}): Promise<{
  success: boolean;
  payment?: PaymentDoc;
  invoice?: InvoiceDoc;
  deduplicated?: boolean;
  error?: string;
}> {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PosRepository();
    const res = await repo.recordPaymentOnInvoice(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/pos/invoices');
    revalidatePath(`/dashboard/pos/invoices/${input.invoiceId}`);
    revalidatePath('/dashboard/pos/payments');
    revalidatePath('/dashboard/pos/sessions');
    return { success: true, ...res };
  } catch (err) {
    return { success: false, error: formatPosError(err, 'تعذر تسجيل الدفعة.') };
  }
}

export async function recordRefundAction(input: {
  paymentId: string;
  sessionId?: string | null;
  amountHalalas: number;
  reason: string;
  idempotencyKey: string;
}): Promise<{
  success: boolean;
  refund?: RefundDoc;
  invoice?: InvoiceDoc;
  deduplicated?: boolean;
  error?: string;
}> {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PosRepository();
    const res = await repo.recordRefund(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/pos/invoices');
    revalidatePath(`/dashboard/pos/invoices/${res.invoice.id}`);
    revalidatePath('/dashboard/pos/payments');
    revalidatePath('/dashboard/pos/sessions');
    return { success: true, refund: res.refund, invoice: res.invoice, deduplicated: res.deduplicated };
  } catch (err) {
    return { success: false, error: formatPosError(err, 'تعذر تنفيذ الاسترداد.') };
  }
}

export async function voidInvoiceAction(input: {
  invoiceId: string;
  reason: string;
}): Promise<{ success: boolean; invoice?: InvoiceDoc; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PosRepository();
    const invoice = await repo.voidInvoice(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/pos/invoices');
    revalidatePath(`/dashboard/pos/invoices/${input.invoiceId}`);
    return { success: true, invoice };
  } catch (err) {
    return { success: false, error: formatPosError(err, 'تعذر إلغاء الفاتورة.') };
  }
}

export async function openPosSessionAction(input: {
  branchId: string;
  openingCashHalalas: number;
  notes?: string;
}): Promise<{ success: boolean; session?: PosSessionDoc; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PosSessionRepository();
    const posSession = await repo.openSession(actor, {
      tenantId: session.tenant.tenantId,
      branchId: input.branchId,
      cashierName: session.user.displayName || session.user.email || session.user.uid,
      openingCashHalalas: input.openingCashHalalas,
      notes: input.notes,
    });

    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/pos/sessions');
    return { success: true, session: posSession };
  } catch (err) {
    return { success: false, error: formatPosError(err, 'تعذر فتح جلسة الصندوق.') };
  }
}

export async function recordCashMovementAction(input: {
  sessionId: string;
  type: 'CASH_IN' | 'CASH_OUT';
  amountHalalas: number;
  reason: string;
  idempotencyKey: string;
}): Promise<{
  success: boolean;
  session?: PosSessionDoc;
  movement?: CashMovementDoc;
  error?: string;
}> {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PosSessionRepository();
    const res = await repo.recordCashMovement(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/pos/sessions');
    return { success: true, session: res.session, movement: res.movement };
  } catch (err) {
    return { success: false, error: formatPosError(err, 'تعذر تسجيل الحركة النقدية.') };
  }
}

export async function closePosSessionAction(input: {
  sessionId: string;
  actualCountedCashHalalas: number;
  notes?: string;
}): Promise<{ success: boolean; session?: PosSessionDoc; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PosSessionRepository();
    const closed = await repo.closeSession(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/pos/sessions');
    return { success: true, session: closed };
  } catch (err) {
    return { success: false, error: formatPosError(err, 'تعذر إغلاق جلسة الصندوق.') };
  }
}

export async function upsertPaymentMethodConfigAction(input: {
  method: PaymentMethodCode;
  isEnabled: boolean;
  requiresReference?: boolean;
  labelAr?: string;
  labelEn?: string;
}): Promise<{ success: boolean; config?: PaymentMethodConfigDoc; error?: string }> {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };

  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PosSessionRepository();
    const config = await repo.upsertPaymentMethodConfig(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });

    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/pos/settings');
    return { success: true, config };
  } catch (err) {
    return { success: false, error: formatPosError(err, 'تعذر تحديث إعداد وسيلة الدفع.') };
  }
}

