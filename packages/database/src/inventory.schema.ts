import { z } from 'zod';
import { TaxModeEnum } from './service-pricing';
import { roundHalfUpBigInt } from './service-pricing';

// ============================================================================
// 1. Units of Measure & Dimension Compatibility
// ============================================================================

export const UnitOfMeasureEnum = z.enum([
  'PIECE',
  'BOTTLE',
  'BOX',
  'PACK',
  'ML',
  'LITER',
  'GRAM',
  'KG',
]);
export type UnitOfMeasure = z.infer<typeof UnitOfMeasureEnum>;

export type UnitDimension = 'COUNT' | 'VOLUME' | 'WEIGHT';

export const UNIT_METADATA: Record<
  UnitOfMeasure,
  { labelAr: string; labelEn: string; dimension: UnitDimension; baseFactor: number }
> = {
  PIECE: { labelAr: 'قطعة', labelEn: 'Piece', dimension: 'COUNT', baseFactor: 1 },
  BOTTLE: { labelAr: 'عبوة / زجاجة', labelEn: 'Bottle', dimension: 'COUNT', baseFactor: 1 },
  BOX: { labelAr: 'صندوق / كرتون', labelEn: 'Box', dimension: 'COUNT', baseFactor: 1 },
  PACK: { labelAr: 'حزمة / باكيت', labelEn: 'Pack', dimension: 'COUNT', baseFactor: 1 },
  ML: { labelAr: 'ملليلتر', labelEn: 'Milliliter', dimension: 'VOLUME', baseFactor: 1 },
  LITER: { labelAr: 'لتر', labelEn: 'Liter', dimension: 'VOLUME', baseFactor: 1000 },
  GRAM: { labelAr: 'جرام', labelEn: 'Gram', dimension: 'WEIGHT', baseFactor: 1 },
  KG: { labelAr: 'كيلوجرام', labelEn: 'Kilogram', dimension: 'WEIGHT', baseFactor: 1000 },
};

/**
 * Converts an integer quantity between compatible units (e.g. LITER <-> ML, KG <-> GRAM).
 * Rejects incompatible dimensions (e.g. KG -> LITER) or non-integer results.
 */
export function convertUnitQuantity(
  quantity: number,
  fromUnit: UnitOfMeasure,
  toUnit: UnitOfMeasure
): number {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error('الكمية يجب أن تكون رقماً صحيحاً غير سالب');
  }
  if (fromUnit === toUnit) return quantity;

  const fromMeta = UNIT_METADATA[fromUnit];
  const toMeta = UNIT_METADATA[toUnit];
  if (fromMeta.dimension !== toMeta.dimension || fromMeta.dimension === 'COUNT') {
    throw new Error(`لا يمكن التحويل بين وحدتين غير متوافقتين (${fromMeta.labelAr} → ${toMeta.labelAr})`);
  }

  const baseQty = quantity * fromMeta.baseFactor;
  if (baseQty % toMeta.baseFactor !== 0) {
    throw new Error('ناتج التحويل بين الوحدات يجب أن يكون عدداً صحيحاً');
  }
  return baseQty / toMeta.baseFactor;
}

// ============================================================================
// 2. Product Categories & Product Catalog
// ============================================================================

export const ProductCategoryStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);
export type ProductCategoryStatus = z.infer<typeof ProductCategoryStatusEnum>;

export const ProductCategoryDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    nameAr: z.string().min(1).max(100),
    nameEn: z.string().max(100).optional().default(''),
    descriptionAr: z.string().max(500).optional().default(''),
    status: ProductCategoryStatusEnum.default('ACTIVE'),
    displayOrder: z.number().int().nonnegative().default(0),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().min(1),
    updatedBy: z.string().min(1),
  })
  .strict();

export type ProductCategoryDoc = z.infer<typeof ProductCategoryDocSchema>;

export const ProductStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);
export type ProductStatus = z.infer<typeof ProductStatusEnum>;

export const ProductDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    sku: z.string().min(1).max(64),
    barcode: z.string().max(64).nullable().default(null),
    nameAr: z.string().min(1).max(120),
    nameEn: z.string().max(120).optional().default(''),
    descriptionAr: z.string().max(1000).optional().default(''),
    descriptionEn: z.string().max(1000).optional().default(''),
    categoryId: z.string().min(1),
    categoryNameAr: z.string().min(1),
    brand: z.string().max(100).optional().default(''),
    unit: UnitOfMeasureEnum.default('PIECE'),
    purchaseCostHalalas: z.number().int().nonnegative(),
    sellingPriceHalalas: z.number().int().nonnegative().nullable().default(null),
    isSellableInPos: z.boolean().default(true),
    taxMode: TaxModeEnum.default('TAX_INCLUSIVE'),
    stockTrackingEnabled: z.boolean().default(true),
    minStockThreshold: z.number().int().nonnegative().default(0),
    reorderQuantity: z.number().int().nonnegative().default(0),
    status: ProductStatusEnum.default('ACTIVE'),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().min(1),
    updatedBy: z.string().min(1),
  })
  .strict();

export type ProductDoc = z.infer<typeof ProductDocSchema>;

// ============================================================================
// 3. Branch Inventory Balances & Weighted Average Valuation
// ============================================================================

export function makeInventoryBalanceId(branchId: string, productId: string): string {
  return `${branchId}__${productId}`;
}

export const InventoryBalanceDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    productId: z.string().min(1),
    unit: UnitOfMeasureEnum,
    quantityOnHand: z.number().int().nonnegative(),
    reservedQuantity: z.number().int().nonnegative().default(0),
    availableQuantity: z.number().int().nonnegative(),
    /** Weighted Average Cost per unit in integer halalas */
    averageCostHalalas: z.number().int().nonnegative(),
    /** Authoritative total valuation in integer halalas */
    totalValueHalalas: z.number().int().nonnegative(),
    lastMovementId: z.string().nullable().default(null),
    lastMovementAt: z.string().datetime().nullable().default(null),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type InventoryBalanceDoc = z.infer<typeof InventoryBalanceDocSchema>;

/**
 * Deterministic Weighted Average Cost (WAC) calculator using integer arithmetic.
 * Incoming positive quantities update WAC; outgoing quantities consume at current WAC
 * (or explicit unitCostHalalas when provided for returns), capping totalValueHalalas at 0 when stock hits 0.
 */
export function applyWeightedAverageMovement(params: {
  currentQtyOnHand: number;
  currentReservedQty: number;
  currentAvgCostHalalas: number;
  currentTotalValueHalalas: number;
  direction: 'IN' | 'OUT';
  quantity: number;
  unitCostHalalas: number;
}): {
  newQtyOnHand: number;
  newAvailableQty: number;
  newAvgCostHalalas: number;
  newTotalValueHalalas: number;
  movementUnitCostHalalas: number;
  movementTotalCostHalalas: number;
} {
  const {
    currentQtyOnHand,
    currentReservedQty,
    currentAvgCostHalalas,
    currentTotalValueHalalas,
    direction,
    quantity,
    unitCostHalalas,
  } = params;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('كمية الحركة يجب أن تكون رقماً صحيحاً موجباً');
  }
  if (!Number.isInteger(unitCostHalalas) || unitCostHalalas < 0) {
    throw new Error('تكلفة الوحدة يجب أن تكون رقماً صحيحاً غير سالب بالهللات');
  }

  if (direction === 'IN') {
    const incomingTotalCost = quantity * unitCostHalalas;
    const newQtyOnHand = currentQtyOnHand + quantity;
    const newTotalValueHalalas = currentTotalValueHalalas + incomingTotalCost;
    const newAvgCostHalalas =
      newQtyOnHand > 0
        ? Number(roundHalfUpBigInt(BigInt(newTotalValueHalalas), BigInt(newQtyOnHand)))
        : currentAvgCostHalalas;

    return {
      newQtyOnHand,
      newAvailableQty: Math.max(0, newQtyOnHand - currentReservedQty),
      newAvgCostHalalas,
      newTotalValueHalalas,
      movementUnitCostHalalas: unitCostHalalas,
      movementTotalCostHalalas: incomingTotalCost,
    };
  }

  // OUT direction
  if (currentQtyOnHand < quantity) {
    throw new Error(
      `الرصيد المتاح غير كافٍ: المطلوب (${quantity})، المتاح (${currentQtyOnHand}).`
    );
  }

  const newQtyOnHand = currentQtyOnHand - quantity;
  const effectiveUnitCost = unitCostHalalas > 0 ? unitCostHalalas : currentAvgCostHalalas;
  const rawOutgoingCost = quantity * effectiveUnitCost;
  const movementTotalCostHalalas =
    newQtyOnHand === 0
      ? currentTotalValueHalalas
      : Math.min(currentTotalValueHalalas, rawOutgoingCost);
  const newTotalValueHalalas = Math.max(0, currentTotalValueHalalas - movementTotalCostHalalas);
  const newAvgCostHalalas =
    newQtyOnHand > 0
      ? Number(roundHalfUpBigInt(BigInt(newTotalValueHalalas), BigInt(newQtyOnHand)))
      : currentAvgCostHalalas;

  return {
    newQtyOnHand,
    newAvailableQty: Math.max(0, newQtyOnHand - currentReservedQty),
    newAvgCostHalalas,
    newTotalValueHalalas,
    movementUnitCostHalalas: effectiveUnitCost,
    movementTotalCostHalalas,
  };
}

// ============================================================================
// 4. Immutable Stock Movement Ledger
// ============================================================================

export const StockMovementTypeEnum = z.enum([
  'OPENING_BALANCE',
  'PURCHASE_RECEIPT',
  'SALE',
  'SALE_RETURN',
  'PURCHASE_RETURN',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
  'TRANSFER_OUT',
  'TRANSFER_IN',
  'DAMAGE',
  'EXPIRED',
  'RESERVED',
  'RELEASED',
]);
export type StockMovementType = z.infer<typeof StockMovementTypeEnum>;

export const StockMovementDirectionEnum = z.enum(['IN', 'OUT', 'RESERVE', 'RELEASE']);
export type StockMovementDirection = z.infer<typeof StockMovementDirectionEnum>;

export const StockMovementDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    productId: z.string().min(1),
    productNameAr: z.string().min(1),
    movementType: StockMovementTypeEnum,
    direction: StockMovementDirectionEnum,
    quantity: z.number().int().positive(),
    unit: UnitOfMeasureEnum,
    unitCostHalalas: z.number().int().nonnegative(),
    totalCostHalalas: z.number().int().nonnegative(),
    balanceBefore: z.number().int().nonnegative(),
    balanceAfter: z.number().int().nonnegative(),
    relatedDocumentType: z.string().max(64).nullable().default(null),
    relatedDocumentId: z.string().max(120).nullable().default(null),
    reason: z.string().max(400).default(''),
    idempotencyKey: z.string().min(1),
    actorUid: z.string().min(1),
    auditId: z.string().nullable().default(null),
    timestamp: z.string().datetime(),
  })
  .strict();

export type StockMovementDoc = z.infer<typeof StockMovementDocSchema>;

// ============================================================================
// 5. Suppliers Management
// ============================================================================

export const SupplierStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);
export type SupplierStatus = z.infer<typeof SupplierStatusEnum>;

export const SupplierDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    name: z.string().min(1).max(150),
    contactPerson: z.string().max(120).optional().default(''),
    normalizedPhone: z.string().min(8).max(20),
    displayPhone: z.string().min(8).max(25),
    email: z.string().email().nullable().default(null),
    address: z.string().max(400).optional().default(''),
    vatNumber: z.string().max(30).nullable().default(null),
    crNumber: z.string().max(30).nullable().default(null),
    privateNotes: z.string().max(2000).optional().default(''),
    status: SupplierStatusEnum.default('ACTIVE'),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().min(1),
    updatedBy: z.string().min(1),
  })
  .strict();

export type SupplierDoc = z.infer<typeof SupplierDocSchema>;

// ============================================================================
// 6. Purchase Orders & Goods Receiving
// ============================================================================

export const PurchaseOrderStatusEnum = z.enum([
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED',
]);
export type PurchaseOrderStatus = z.infer<typeof PurchaseOrderStatusEnum>;

export const PurchaseOrderLineSchema = z
  .object({
    lineId: z.string().min(1),
    productId: z.string().min(1),
    skuSnapshot: z.string().min(1),
    nameArSnapshot: z.string().min(1),
    nameEnSnapshot: z.string().optional().default(''),
    unitSnapshot: UnitOfMeasureEnum,
    orderedQuantity: z.number().int().positive(),
    receivedQuantity: z.number().int().nonnegative().default(0),
    rejectedQuantity: z.number().int().nonnegative().default(0),
    unitCostHalalas: z.number().int().nonnegative(),
    discountHalalas: z.number().int().nonnegative().default(0),
    taxRateBps: z.number().int().min(0).max(10000).default(0),
    netHalalas: z.number().int().nonnegative(),
    taxHalalas: z.number().int().nonnegative(),
    totalHalalas: z.number().int().nonnegative(),
  })
  .strict();

export type PurchaseOrderLine = z.infer<typeof PurchaseOrderLineSchema>;

export const PurchaseOrderDocSchema = z
  .object({
    id: z.string().min(1),
    poNumber: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    branchNameSnapshot: z.string().min(1),
    supplierId: z.string().min(1),
    supplierNameSnapshot: z.string().min(1),
    orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    expectedDeliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
    currency: z.literal('SAR').default('SAR'),
    lineItems: z.array(PurchaseOrderLineSchema).min(1),
    subtotalHalalas: z.number().int().nonnegative(),
    discountTotalHalalas: z.number().int().nonnegative().default(0),
    taxTotalHalalas: z.number().int().nonnegative().default(0),
    totalHalalas: z.number().int().nonnegative(),
    status: PurchaseOrderStatusEnum.default('DRAFT'),
    notes: z.string().max(1000).optional().default(''),
    createdBy: z.string().min(1),
    submittedBy: z.string().nullable().default(null),
    submittedAt: z.string().datetime().nullable().default(null),
    approvedBy: z.string().nullable().default(null),
    approvedAt: z.string().datetime().nullable().default(null),
    cancelledBy: z.string().nullable().default(null),
    cancelledAt: z.string().datetime().nullable().default(null),
    cancelReason: z.string().max(500).nullable().default(null),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type PurchaseOrderDoc = z.infer<typeof PurchaseOrderDocSchema>;

export const GoodsReceiptLineSchema = z
  .object({
    lineId: z.string().min(1),
    productId: z.string().min(1),
    nameArSnapshot: z.string().min(1),
    unitSnapshot: UnitOfMeasureEnum,
    acceptedQuantity: z.number().int().nonnegative(),
    rejectedQuantity: z.number().int().nonnegative().default(0),
    actualUnitCostHalalas: z.number().int().nonnegative(),
    totalAcceptedCostHalalas: z.number().int().nonnegative(),
    movementId: z.string().nullable().default(null),
  })
  .strict();

export type GoodsReceiptLine = z.infer<typeof GoodsReceiptLineSchema>;

export const GoodsReceiptDocSchema = z
  .object({
    id: z.string().min(1),
    receiptNumber: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    purchaseOrderId: z.string().min(1),
    poNumber: z.string().min(1),
    supplierId: z.string().min(1),
    supplierNameSnapshot: z.string().min(1),
    receivedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    lines: z.array(GoodsReceiptLineSchema).min(1),
    totalAcceptedCostHalalas: z.number().int().nonnegative(),
    notes: z.string().max(500).optional().default(''),
    idempotencyKey: z.string().min(1),
    journalEntryId: z.string().nullable().default(null),
    receivedBy: z.string().min(1),
    receivedAt: z.string().datetime(),
    createdAt: z.string().datetime(),
  })
  .strict();

export type GoodsReceiptDoc = z.infer<typeof GoodsReceiptDocSchema>;

// ============================================================================
// 7. Supplier Invoices & Supplier Payments (AP)
// ============================================================================

export const SupplierInvoiceStatusEnum = z.enum([
  'OPEN',
  'PARTIALLY_PAID',
  'PAID',
  'VOIDED',
]);
export type SupplierInvoiceStatus = z.infer<typeof SupplierInvoiceStatusEnum>;

export const SupplierInvoiceDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    supplierId: z.string().min(1),
    supplierNameSnapshot: z.string().min(1),
    supplierInvoiceNumber: z.string().min(1).max(80),
    purchaseOrderId: z.string().nullable().default(null),
    goodsReceiptIds: z.array(z.string().min(1)).default([]),
    invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
    subtotalHalalas: z.number().int().nonnegative(),
    vatHalalas: z.number().int().nonnegative().default(0),
    totalHalalas: z.number().int().positive(),
    paidAmountHalalas: z.number().int().nonnegative().default(0),
    balanceDueHalalas: z.number().int().nonnegative(),
    status: SupplierInvoiceStatusEnum.default('OPEN'),
    notes: z.string().max(500).optional().default(''),
    journalEntryId: z.string().nullable().default(null),
    createdBy: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type SupplierInvoiceDoc = z.infer<typeof SupplierInvoiceDocSchema>;

export const SupplierPaymentDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    supplierId: z.string().min(1),
    supplierInvoiceId: z.string().min(1),
    method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'OTHER']),
    amountHalalas: z.number().int().positive(),
    paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    referenceNumber: z.string().max(100).nullable().default(null),
    notes: z.string().max(400).optional().default(''),
    idempotencyKey: z.string().min(1),
    journalEntryId: z.string().nullable().default(null),
    recordedBy: z.string().min(1),
    recordedAt: z.string().datetime(),
    createdAt: z.string().datetime(),
  })
  .strict();

export type SupplierPaymentDoc = z.infer<typeof SupplierPaymentDocSchema>;

// ============================================================================
// 8. Branch Transfers
// ============================================================================

export const StockTransferStatusEnum = z.enum([
  'DRAFT',
  'APPROVED',
  'IN_TRANSIT',
  'RECEIVED',
  'CANCELLED',
]);
export type StockTransferStatus = z.infer<typeof StockTransferStatusEnum>;

export const StockTransferLineSchema = z
  .object({
    lineId: z.string().min(1),
    productId: z.string().min(1),
    nameArSnapshot: z.string().min(1),
    unitSnapshot: UnitOfMeasureEnum,
    requestedQuantity: z.number().int().positive(),
    dispatchedQuantity: z.number().int().nonnegative().default(0),
    receivedQuantity: z.number().int().nonnegative().default(0),
    damagedOrMissingQuantity: z.number().int().nonnegative().default(0),
    unitCostHalalas: z.number().int().nonnegative().default(0),
    discrepancyNotes: z.string().max(300).optional().default(''),
  })
  .strict();

export type StockTransferLine = z.infer<typeof StockTransferLineSchema>;

export const StockTransferDocSchema = z
  .object({
    id: z.string().min(1),
    transferNumber: z.string().min(1),
    tenantId: z.string().min(1),
    sourceBranchId: z.string().min(1),
    sourceBranchName: z.string().min(1),
    destinationBranchId: z.string().min(1),
    destinationBranchName: z.string().min(1),
    lines: z.array(StockTransferLineSchema).min(1),
    status: StockTransferStatusEnum.default('DRAFT'),
    notes: z.string().max(500).optional().default(''),
    createdBy: z.string().min(1),
    approvedBy: z.string().nullable().default(null),
    approvedAt: z.string().datetime().nullable().default(null),
    dispatchedBy: z.string().nullable().default(null),
    dispatchedAt: z.string().datetime().nullable().default(null),
    dispatchIdempotencyKey: z.string().nullable().default(null),
    receivedBy: z.string().nullable().default(null),
    receivedAt: z.string().datetime().nullable().default(null),
    receiveIdempotencyKey: z.string().nullable().default(null),
    cancelledBy: z.string().nullable().default(null),
    cancelledAt: z.string().datetime().nullable().default(null),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type StockTransferDoc = z.infer<typeof StockTransferDocSchema>;

// ============================================================================
// 9. Stock Adjustments & Stock Counts
// ============================================================================

export const AdjustmentReasonEnum = z.enum([
  'INITIAL_COUNT',
  'PHYSICAL_COUNT',
  'DAMAGE',
  'EXPIRATION',
  'LOSS',
  'CORRECTION',
  'OTHER',
]);
export type AdjustmentReason = z.infer<typeof AdjustmentReasonEnum>;

export const StockAdjustmentStatusEnum = z.enum([
  'PENDING_APPROVAL',
  'APPLIED',
  'REJECTED',
]);
export type StockAdjustmentStatus = z.infer<typeof StockAdjustmentStatusEnum>;

export const StockAdjustmentDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    productId: z.string().min(1),
    productNameAr: z.string().min(1),
    unit: UnitOfMeasureEnum,
    reason: AdjustmentReasonEnum,
    reasonDetails: z.string().min(2).max(400),
    direction: z.enum(['IN', 'OUT']),
    quantity: z.number().int().positive(),
    beforeQuantity: z.number().int().nonnegative(),
    afterQuantity: z.number().int().nonnegative(),
    unitCostHalalas: z.number().int().nonnegative(),
    totalValueHalalas: z.number().int().nonnegative(),
    status: StockAdjustmentStatusEnum,
    movementId: z.string().nullable().default(null),
    journalEntryId: z.string().nullable().default(null),
    idempotencyKey: z.string().min(1),
    requestedBy: z.string().min(1),
    approvedBy: z.string().nullable().default(null),
    approvedAt: z.string().datetime().nullable().default(null),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type StockAdjustmentDoc = z.infer<typeof StockAdjustmentDocSchema>;

export const StockCountStatusEnum = z.enum([
  'IN_PROGRESS',
  'SUBMITTED',
  'APPROVED_AND_APPLIED',
  'CANCELLED',
]);
export type StockCountStatus = z.infer<typeof StockCountStatusEnum>;

export const StockCountItemSchema = z
  .object({
    productId: z.string().min(1),
    productNameAr: z.string().min(1),
    unit: UnitOfMeasureEnum,
    expectedQuantity: z.number().int().nonnegative(),
    countedQuantity: z.number().int().nonnegative().nullable().default(null),
    varianceQuantity: z.number().int().default(0),
    unitCostHalalas: z.number().int().nonnegative(),
    varianceValueHalalas: z.number().int().default(0),
  })
  .strict();

export type StockCountItem = z.infer<typeof StockCountItemSchema>;

export const StockCountDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    branchName: z.string().min(1),
    countDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    items: z.array(StockCountItemSchema).min(1),
    status: StockCountStatusEnum.default('IN_PROGRESS'),
    notes: z.string().max(500).optional().default(''),
    createdBy: z.string().min(1),
    submittedBy: z.string().nullable().default(null),
    submittedAt: z.string().datetime().nullable().default(null),
    approvedBy: z.string().nullable().default(null),
    approvedAt: z.string().datetime().nullable().default(null),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type StockCountDoc = z.infer<typeof StockCountDocSchema>;

// ============================================================================
// 10. Inventory Audit & Accounting Outbox
// ============================================================================

export const InventoryAccountingOutboxDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    eventType: z.enum([
      'GOODS_RECEIPT',
      'SUPPLIER_INVOICE',
      'SUPPLIER_PAYMENT',
      'STOCK_ADJUSTMENT',
      'PRODUCT_COGS',
      'PRODUCT_RETURN_COGS',
    ]),
    sourceId: z.string().min(1),
    entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodId: z.string().min(1),
    descriptionAr: z.string().min(1),
    lines: z.array(
      z.object({
        accountId: z.string().min(1),
        accountCode: z.string().min(1),
        accountNameAr: z.string().min(1),
        debitHalalas: z.number().int().nonnegative(),
        creditHalalas: z.number().int().nonnegative(),
        descriptionAr: z.string().optional().default(''),
        branchId: z.string().optional(),
      })
    ),
    status: z.enum(['PENDING', 'POSTED', 'FAILED']),
    journalEntryId: z.string().nullable().default(null),
    errorMessage: z.string().nullable().default(null),
    createdAt: z.string().datetime(),
    postedAt: z.string().datetime().nullable().default(null),
  })
  .strict();

export type InventoryAccountingOutboxDoc = z.infer<typeof InventoryAccountingOutboxDocSchema>;

export const InventoryAuditDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().nullable().default(null),
    action: z.string().min(1),
    entityType: z.string().min(1),
    entityId: z.string().min(1),
    actorUid: z.string().min(1),
    idempotencyKey: z.string().nullable().default(null),
    details: z.record(z.unknown()).default({}),
    timestamp: z.string().datetime(),
  })
  .strict();

export type InventoryAuditDoc = z.infer<typeof InventoryAuditDocSchema>;

