'use server';

import { revalidatePath } from 'next/cache';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  InventoryRepository,
  InventoryError,
  PurchasingRepository,
  PurchasingError,
  type UnitOfMeasure,
  type ProductStatus,
  type SupplierStatus,
  type AdjustmentReason,
} from '@/lib/firebase-server';

function formatErr(err: unknown, fallback: string): string {
  if (err instanceof InventoryError || err instanceof PurchasingError) {
    return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function revalidateInventoryAll() {
  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard/inventory/products');
  revalidatePath('/dashboard/inventory/balances');
  revalidatePath('/dashboard/inventory/movements');
  revalidatePath('/dashboard/inventory/suppliers');
  revalidatePath('/dashboard/inventory/purchase-orders');
  revalidatePath('/dashboard/inventory/transfers');
  revalidatePath('/dashboard/inventory/adjustments');
  revalidatePath('/dashboard/pos');
}

export async function createProductCategoryAction(input: {
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const category = await repo.createCategory(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, category };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر إنشاء تصنيف المنتج.') };
  }
}

export async function createProductAction(input: {
  sku: string;
  barcode?: string | null;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  categoryId: string;
  brand?: string;
  unit: UnitOfMeasure;
  purchaseCostHalalas: number;
  sellingPriceHalalas?: number | null;
  isSellableInPos?: boolean;
  taxMode?: 'TAX_INCLUSIVE' | 'TAX_EXCLUSIVE' | 'TAX_EXEMPT';
  minStockThreshold?: number;
  reorderQuantity?: number;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const product = await repo.createProduct(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, product };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر إنشاء المنتج.') };
  }
}

export async function updateProductStatusAction(input: {
  productId: string;
  status: ProductStatus;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const product = await repo.updateProduct(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, product };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر تحديث حالة المنتج.') };
  }
}

export async function recordOpeningBalanceAction(input: {
  branchId: string;
  productId: string;
  quantity: number;
  unitCostHalalas: number;
  idempotencyKey: string;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const res = await repo.recordOpeningBalance(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, ...res };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر تسجيل الرصيد الافتتاحي.') };
  }
}

export async function createSupplierAction(input: {
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string | null;
  address?: string;
  vatNumber?: string | null;
  crNumber?: string | null;
  privateNotes?: string;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PurchasingRepository();
    const supplier = await repo.createSupplier(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, supplier };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر إضافة المورد.') };
  }
}

export async function updateSupplierStatusAction(input: {
  supplierId: string;
  status: SupplierStatus;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PurchasingRepository();
    const supplier = await repo.updateSupplier(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, supplier };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر تحديث حالة المورد.') };
  }
}

export async function createPurchaseOrderAction(input: {
  branchId: string;
  supplierId: string;
  notes?: string;
  items: Array<{
    productId: string;
    orderedQuantity: number;
    unitCostHalalas: number;
    taxRateBps?: number;
  }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PurchasingRepository();
    const po = await repo.createPurchaseOrder(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, purchaseOrder: po };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر إنشاء أمر الشراء.') };
  }
}

export async function submitPurchaseOrderAction(purchaseOrderId: string) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PurchasingRepository();
    const po = await repo.submitPurchaseOrder(actor, {
      tenantId: session.tenant.tenantId,
      purchaseOrderId,
    });
    revalidateInventoryAll();
    return { success: true, purchaseOrder: po };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر تقديم أمر الشراء.') };
  }
}

export async function approvePurchaseOrderAction(purchaseOrderId: string) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PurchasingRepository();
    const po = await repo.approvePurchaseOrder(actor, {
      tenantId: session.tenant.tenantId,
      purchaseOrderId,
    });
    revalidateInventoryAll();
    return { success: true, purchaseOrder: po };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر اعتماد أمر الشراء.') };
  }
}

export async function cancelPurchaseOrderAction(purchaseOrderId: string, reason: string) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PurchasingRepository();
    const po = await repo.cancelPurchaseOrder(actor, {
      tenantId: session.tenant.tenantId,
      purchaseOrderId,
      reason,
    });
    revalidateInventoryAll();
    return { success: true, purchaseOrder: po };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر إلغاء أمر الشراء.') };
  }
}

export async function receiveGoodsAction(input: {
  purchaseOrderId: string;
  idempotencyKey: string;
  notes?: string;
  lines: Array<{
    lineId: string;
    acceptedQuantity: number;
    rejectedQuantity?: number;
    actualUnitCostHalalas?: number;
  }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PurchasingRepository();
    const res = await repo.receiveGoods(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, ...res };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر تسجيل استلام البضاعة.') };
  }
}

export async function createSupplierInvoiceAction(input: {
  branchId: string;
  supplierId: string;
  supplierInvoiceNumber: string;
  purchaseOrderId?: string | null;
  subtotalHalalas: number;
  vatHalalas?: number;
  notes?: string;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PurchasingRepository();
    const invoice = await repo.createSupplierInvoice(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, invoice };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر تسجيل فاتورة المورد.') };
  }
}

export async function recordSupplierPaymentAction(input: {
  supplierInvoiceId: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
  amountHalalas: number;
  referenceNumber?: string | null;
  idempotencyKey: string;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new PurchasingRepository();
    const res = await repo.recordSupplierPayment(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, ...res };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر تسجيل دفعة المورد.') };
  }
}

export async function createTransferAction(input: {
  sourceBranchId: string;
  destinationBranchId: string;
  lines: Array<{ productId: string; quantity: number }>;
  notes?: string;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const transfer = await repo.createTransfer(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, transfer };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر إنشاء أمر التحويل.') };
  }
}

export async function approveTransferAction(transferId: string) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const transfer = await repo.approveTransfer(actor, {
      tenantId: session.tenant.tenantId,
      transferId,
    });
    revalidateInventoryAll();
    return { success: true, transfer };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر اعتماد أمر التحويل.') };
  }
}

export async function dispatchTransferAction(transferId: string, idempotencyKey: string) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const transfer = await repo.dispatchTransfer(actor, {
      tenantId: session.tenant.tenantId,
      transferId,
      idempotencyKey,
    });
    revalidateInventoryAll();
    return { success: true, transfer };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر شحن التحويل.') };
  }
}

export async function receiveTransferAction(input: {
  transferId: string;
  idempotencyKey: string;
  lines?: Array<{
    lineId: string;
    receivedQuantity: number;
    damagedOrMissingQuantity?: number;
    discrepancyNotes?: string;
  }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const transfer = await repo.receiveTransfer(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, transfer };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر استلام التحويل.') };
  }
}

export async function createStockAdjustmentAction(input: {
  branchId: string;
  productId: string;
  reason: AdjustmentReason;
  reasonDetails: string;
  direction: 'IN' | 'OUT';
  quantity: number;
  unitCostHalalas?: number;
  idempotencyKey: string;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const res = await repo.createStockAdjustment(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, ...res };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر تسجيل التسوية المخزنية.') };
  }
}

export async function approveStockAdjustmentAction(adjustmentId: string) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const adjustment = await repo.approveStockAdjustment(actor, {
      tenantId: session.tenant.tenantId,
      adjustmentId,
    });
    revalidateInventoryAll();
    return { success: true, adjustment };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر اعتماد التسوية.') };
  }
}

export async function startStockCountAction(input: { branchId: string; notes?: string }) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const count = await repo.startStockCount(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, count };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر بدء جلسة الجرد.') };
  }
}

export async function submitStockCountAction(input: {
  countId: string;
  counts: Array<{ productId: string; countedQuantity: number }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const count = await repo.submitStockCount(actor, {
      tenantId: session.tenant.tenantId,
      ...input,
    });
    revalidateInventoryAll();
    return { success: true, count };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر إرسال نتائج الجرد.') };
  }
}

export async function approveStockCountAction(countId: string) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const count = await repo.approveAndApplyStockCount(actor, {
      tenantId: session.tenant.tenantId,
      countId,
    });
    revalidateInventoryAll();
    return { success: true, count };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر اعتماد وتطبيق الجرد.') };
  }
}

export async function runReconciliationAction(repairOutbox = false) {
  const session = await getTenantSubscriptionSession();
  if (!session) return { success: false, error: 'انتهت الجلسة.' };
  try {
    const actor = await resolveOperationsActor(session);
    const repo = new InventoryRepository();
    const result = await repo.runReconciliation(actor, session.tenant.tenantId, {
      repairOutbox,
    });
    revalidateInventoryAll();
    return { success: true, result };
  } catch (err) {
    return { success: false, error: formatErr(err, 'تعذر تشغيل مطابقة المخزون.') };
  }
}

