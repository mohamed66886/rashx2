import { z } from 'zod';
import {
  TaxModeEnum,
  calculateServicePricing,
  roundHalfUpBigInt,
  type TaxMode,
} from './service-pricing';
import type { TaxSettingsDoc } from './company.schema';

// ============================================================================
// 1. Payment Methods & Configuration
// ============================================================================

export const PaymentMethodCodeEnum = z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER']);
export type PaymentMethodCode = z.infer<typeof PaymentMethodCodeEnum>;

export const PAYMENT_METHOD_LABELS_AR: Record<PaymentMethodCode, string> = {
  CASH: 'نقداً (كاش)',
  CARD: 'بطاقة / شبكة مدى',
  BANK_TRANSFER: 'تحويل بنكي',
  OTHER: 'وسيلة أخرى',
};

export const PAYMENT_METHOD_LABELS_EN: Record<PaymentMethodCode, string> = {
  CASH: 'Cash',
  CARD: 'Card / Mada POS',
  BANK_TRANSFER: 'Bank Transfer',
  OTHER: 'Other',
};

export const PaymentMethodConfigDocSchema = z
  .object({
    id: PaymentMethodCodeEnum,
    tenantId: z.string().min(1),
    method: PaymentMethodCodeEnum,
    labelAr: z.string().min(1).max(60),
    labelEn: z.string().min(1).max(60),
    isEnabled: z.boolean().default(true),
    requiresReference: z.boolean().default(false),
    settlementAccountCode: z.string().regex(/^\d{1,8}$/).default('1010'),
    displayOrder: z.number().int().min(0).default(0),
    updatedAt: z.string().datetime(),
    updatedBy: z.string().min(1),
  })
  .strict();

export type PaymentMethodConfigDoc = z.infer<typeof PaymentMethodConfigDocSchema>;

export const DEFAULT_PAYMENT_METHOD_CONFIGS: Array<
  Omit<PaymentMethodConfigDoc, 'tenantId' | 'updatedAt' | 'updatedBy'>
> = [
  {
    id: 'CASH',
    method: 'CASH',
    labelAr: 'نقداً (كاش)',
    labelEn: 'Cash',
    isEnabled: true,
    requiresReference: false,
    settlementAccountCode: '1010',
    displayOrder: 1,
  },
  {
    id: 'CARD',
    method: 'CARD',
    labelAr: 'بطاقة / شبكة مدى',
    labelEn: 'Card / POS Terminal',
    isEnabled: true,
    requiresReference: true,
    settlementAccountCode: '1020',
    displayOrder: 2,
  },
  {
    id: 'BANK_TRANSFER',
    method: 'BANK_TRANSFER',
    labelAr: 'تحويل بنكي',
    labelEn: 'Bank Transfer',
    isEnabled: false,
    requiresReference: true,
    settlementAccountCode: '1020',
    displayOrder: 3,
  },
  {
    id: 'OTHER',
    method: 'OTHER',
    labelAr: 'وسيلة أخرى',
    labelEn: 'Other',
    isEnabled: false,
    requiresReference: true,
    settlementAccountCode: '1020',
    displayOrder: 4,
  },
];

// ============================================================================
// 2. Discounts & Pricing Policy
// ============================================================================

export const DiscountTypeEnum = z.enum(['NONE', 'FIXED', 'PERCENT']);
export type DiscountType = z.infer<typeof DiscountTypeEnum>;

/** Standard cashier max discount: 20% (2000 bps). Above requires `discounts.override`. */
export const STANDARD_MAX_DISCOUNT_PERCENT_BPS = 2000;

export const DiscountSpecSchema = z
  .object({
    type: DiscountTypeEnum.default('NONE'),
    /** For FIXED: integer halalas. For PERCENT: basis points (0..10000, where 1500 = 15%). */
    value: z.number().int().nonnegative().default(0),
    reason: z.string().max(200).optional().default(''),
  })
  .strict()
  .refine(
    (d) => (d.type === 'PERCENT' ? d.value <= 10000 : true),
    { message: 'نسبة الخصم لا يمكن أن تتجاوز 100% (10000 نقطة أساس)' }
  );

export type DiscountSpec = z.infer<typeof DiscountSpecSchema>;

export interface LinePricingInput {
  unitPriceHalalas: number;
  quantity: number;
  taxMode: TaxMode;
  customTaxRateBps?: number | null;
  discount?: DiscountSpec;
  transactionDate: string;
}

export interface ComputedInvoiceLine {
  grossBeforeDiscountHalalas: number;
  discountHalalas: number;
  netHalalas: number;
  vatHalalas: number;
  totalHalalas: number;
  taxRateBps: number;
  taxCategory: 'STANDARD' | 'EXEMPT' | 'OUT_OF_SCOPE';
}

export function computePosLinePricing(
  input: LinePricingInput,
  taxSettings?: TaxSettingsDoc | null
): ComputedInvoiceLine {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error('الكمية يجب أن تكون رقماً صحيحاً موجباً');
  }
  if (!Number.isInteger(input.unitPriceHalalas) || input.unitPriceHalalas < 0) {
    throw new Error('سعر الوحدة يجب أن يكون رقماً صحيحاً غير سالب بالهللات');
  }

  const grossBeforeDiscountHalalas = input.unitPriceHalalas * input.quantity;
  const discountSpec = input.discount ?? { type: 'NONE' as const, value: 0, reason: '' };

  let discountHalalas = 0;
  if (discountSpec.type === 'FIXED') {
    if (discountSpec.value > grossBeforeDiscountHalalas) {
      throw new Error('قيمة الخصم لا يمكن أن تتجاوز إجمالي البند');
    }
    discountHalalas = discountSpec.value;
  } else if (discountSpec.type === 'PERCENT') {
    discountHalalas = Number(
      roundHalfUpBigInt(
        BigInt(grossBeforeDiscountHalalas) * BigInt(discountSpec.value),
        10000n
      )
    );
  }

  const discountedBaseHalalas = grossBeforeDiscountHalalas - discountHalalas;
  const calc = calculateServicePricing(
    {
      basePriceHalalas: discountedBaseHalalas,
      taxMode: input.taxMode,
      customTaxRateBps: input.customTaxRateBps,
      transactionDate: input.transactionDate,
    },
    taxSettings
  );

  const taxCategory: ComputedInvoiceLine['taxCategory'] =
    input.taxMode === 'TAX_EXEMPT'
      ? 'EXEMPT'
      : calc.taxRateBps === 0
        ? 'OUT_OF_SCOPE'
        : 'STANDARD';

  return {
    grossBeforeDiscountHalalas,
    discountHalalas,
    netHalalas: calc.netPriceHalalas,
    vatHalalas: calc.calculatedTaxHalalas,
    totalHalalas: calc.totalPriceHalalas,
    taxRateBps: calc.taxRateBps,
    taxCategory,
  };
}

// ============================================================================
// 3. POS Sessions & Cash Drawer
// ============================================================================

export const PosSessionStatusEnum = z.enum(['OPEN', 'CLOSING', 'CLOSED']);
export type PosSessionStatus = z.infer<typeof PosSessionStatusEnum>;

export const PosSessionDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    branchName: z.string().min(1),
    cashierUid: z.string().min(1),
    cashierName: z.string().min(1),
    status: PosSessionStatusEnum.default('OPEN'),
    openingCashHalalas: z.number().int().nonnegative(),
    cashSalesHalalas: z.number().int().nonnegative().default(0),
    cashRefundsHalalas: z.number().int().nonnegative().default(0),
    cashInHalalas: z.number().int().nonnegative().default(0),
    cashOutHalalas: z.number().int().nonnegative().default(0),
    nonCashSalesHalalas: z.number().int().nonnegative().default(0),
    nonCashRefundsHalalas: z.number().int().nonnegative().default(0),
    expectedCashHalalas: z.number().int(),
    actualCountedCashHalalas: z.number().int().nonnegative().nullable().default(null),
    cashDifferenceHalalas: z.number().int().nullable().default(null),
    openedAt: z.string().datetime(),
    openedBy: z.string().min(1),
    closingStartedAt: z.string().datetime().nullable().default(null),
    closingBy: z.string().nullable().default(null),
    closedAt: z.string().datetime().nullable().default(null),
    closedBy: z.string().nullable().default(null),
    notes: z.string().max(500).optional().default(''),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type PosSessionDoc = z.infer<typeof PosSessionDocSchema>;

export function calculateExpectedCashHalalas(session: {
  openingCashHalalas: number;
  cashSalesHalalas: number;
  cashInHalalas: number;
  cashRefundsHalalas: number;
  cashOutHalalas: number;
}): number {
  return (
    session.openingCashHalalas +
    session.cashSalesHalalas +
    session.cashInHalalas -
    session.cashRefundsHalalas -
    session.cashOutHalalas
  );
}

export const CashMovementTypeEnum = z.enum([
  'OPENING_FLOAT',
  'CASH_SALE',
  'CASH_REFUND',
  'CASH_IN',
  'CASH_OUT',
]);
export type CashMovementType = z.infer<typeof CashMovementTypeEnum>;

export const CashMovementDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    sessionId: z.string().min(1),
    type: CashMovementTypeEnum,
    amountHalalas: z.number().int().nonnegative(),
    referenceId: z.string().nullable().default(null),
    reason: z.string().min(1).max(300),
    idempotencyKey: z.string().nullable().default(null),
    actorUid: z.string().min(1),
    createdAt: z.string().datetime(),
  })
  .strict();

export type CashMovementDoc = z.infer<typeof CashMovementDocSchema>;

// ============================================================================
// 4. Invoices & Line Items
// ============================================================================

export const InvoiceTypeEnum = z.enum(['SIMPLIFIED_TAX', 'STANDARD_TAX', 'NON_TAX']);
export type InvoiceType = z.infer<typeof InvoiceTypeEnum>;

export const INVOICE_TYPE_LABELS_AR: Record<InvoiceType, string> = {
  SIMPLIFIED_TAX: 'فاتورة ضريبية مبسطة',
  STANDARD_TAX: 'فاتورة ضريبية',
  NON_TAX: 'فاتورة غير ضريبية',
};

export const InvoiceStatusEnum = z.enum([
  'DRAFT',
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'VOIDED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

export const INVOICE_STATUS_LABELS_AR: Record<InvoiceStatus, string> = {
  DRAFT: 'مسودة',
  ISSUED: 'صادرة (غير مدفوعة)',
  PARTIALLY_PAID: 'مدفوعة جزئياً',
  PAID: 'مدفوعة بالكامل',
  VOIDED: 'ملغاة',
  PARTIALLY_REFUNDED: 'مستردة جزئياً',
  REFUNDED: 'مستردة بالكامل',
};

export const InvoicePaymentStatusEnum = z.enum([
  'UNPAID',
  'PARTIAL',
  'PAID',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
]);
export type InvoicePaymentStatus = z.infer<typeof InvoicePaymentStatusEnum>;

export const InvoiceLineItemSchema = z
  .object({
    lineId: z.string().min(1),
    itemType: z.enum(['SERVICE', 'PRODUCT']).default('SERVICE'),
    serviceId: z.string().min(1).nullable().optional().default(null),
    productId: z.string().min(1).nullable().optional().default(null),
    nameAr: z.string().min(1),
    nameEn: z.string().optional().default(''),
    quantity: z.number().int().positive(),
    returnedQuantity: z.number().int().nonnegative().default(0),
    unitPriceHalalas: z.number().int().nonnegative(),
    unitCostHalalas: z.number().int().nonnegative().default(0),
    stockMovementId: z.string().nullable().default(null),
    grossBeforeDiscountHalalas: z.number().int().nonnegative(),
    discountType: DiscountTypeEnum.default('NONE'),
    discountValue: z.number().int().nonnegative().default(0),
    discountHalalas: z.number().int().nonnegative().default(0),
    discountReason: z.string().max(200).optional().default(''),
    taxMode: TaxModeEnum,
    taxCategory: z.enum(['STANDARD', 'EXEMPT', 'OUT_OF_SCOPE']),
    taxRateBps: z.number().int().min(0).max(10000),
    netHalalas: z.number().int().nonnegative(),
    vatHalalas: z.number().int().nonnegative(),
    totalHalalas: z.number().int().nonnegative(),
  })
  .strict();

export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>;

export const InvoiceTenantSnapshotSchema = z
  .object({
    tenantId: z.string().min(1),
    legalNameAr: z.string().min(1),
    legalNameEn: z.string().optional().default(''),
    commercialName: z.string().optional().default(''),
    crNumber: z.string().nullable().default(null),
    vatNumber: z.string().nullable().default(null),
    vatStatus: z.string().default('NOT_REGISTERED'),
    branchId: z.string().min(1),
    branchName: z.string().min(1),
    branchAddress: z.string().optional().default(''),
    branchCity: z.string().optional().default(''),
  })
  .strict();

export const InvoiceCustomerSnapshotSchema = z
  .object({
    customerId: z.string().min(1),
    fullName: z.string().min(1),
    phone: z.string().nullable().default(null),
    isGuest: z.boolean().default(false),
  })
  .strict();

export const InvoiceDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    invoiceNumber: z.string().min(1),
    invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    issuedAt: z.string().datetime(),
    invoiceType: InvoiceTypeEnum,
    status: InvoiceStatusEnum,
    paymentStatus: InvoicePaymentStatusEnum,
    tenantSnapshot: InvoiceTenantSnapshotSchema,
    customerSnapshot: InvoiceCustomerSnapshotSchema,
    lineItems: z.array(InvoiceLineItemSchema).min(1),
    subtotalBeforeDiscountHalalas: z.number().int().nonnegative(),
    totalDiscountHalalas: z.number().int().nonnegative(),
    netAmountHalalas: z.number().int().nonnegative(),
    vatAmountHalalas: z.number().int().nonnegative(),
    totalAmountHalalas: z.number().int().nonnegative(),
    paidAmountHalalas: z.number().int().nonnegative().default(0),
    refundedAmountHalalas: z.number().int().nonnegative().default(0),
    balanceDueHalalas: z.number().int().nonnegative(),
    currency: z.literal('SAR').default('SAR'),
    saleId: z.string().min(1),
    bookingId: z.string().nullable().default(null),
    sessionId: z.string().nullable().default(null),
    journalEntryId: z.string().nullable().default(null),
    voidReason: z.string().nullable().default(null),
    voidedAt: z.string().datetime().nullable().default(null),
    voidedBy: z.string().nullable().default(null),
    createdBy: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type InvoiceDoc = z.infer<typeof InvoiceDocSchema>;

// ============================================================================
// 5. POS Sales, Payments, Refunds, Outbox, Audit
// ============================================================================

export const PosSaleStatusEnum = z.enum(['DRAFT', 'FINALIZED', 'VOIDED']);
export type PosSaleStatus = z.infer<typeof PosSaleStatusEnum>;

export const PosSaleDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    sessionId: z.string().nullable().default(null),
    source: z.enum(['WALK_IN', 'BOOKING']),
    bookingId: z.string().nullable().default(null),
    customerId: z.string().min(1),
    customerName: z.string().min(1),
    status: PosSaleStatusEnum,
    lineItems: z.array(InvoiceLineItemSchema).min(1),
    subtotalBeforeDiscountHalalas: z.number().int().nonnegative(),
    totalDiscountHalalas: z.number().int().nonnegative(),
    netAmountHalalas: z.number().int().nonnegative(),
    vatAmountHalalas: z.number().int().nonnegative(),
    totalAmountHalalas: z.number().int().nonnegative(),
    invoiceId: z.string().nullable().default(null),
    invoiceNumber: z.string().nullable().default(null),
    idempotencyKey: z.string().min(1),
    notes: z.string().max(500).optional().default(''),
    createdBy: z.string().min(1),
    finalizedBy: z.string().nullable().default(null),
    createdAt: z.string().datetime(),
    finalizedAt: z.string().datetime().nullable().default(null),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type PosSaleDoc = z.infer<typeof PosSaleDocSchema>;

export const PosPaymentStatusEnum = z.enum(['RECORDED', 'FAILED', 'REVERSED']);
export type PosPaymentStatus = z.infer<typeof PosPaymentStatusEnum>;

export const PaymentDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    invoiceId: z.string().min(1),
    invoiceNumber: z.string().min(1),
    saleId: z.string().min(1),
    sessionId: z.string().nullable().default(null),
    amountHalalas: z.number().int().positive(),
    method: PaymentMethodCodeEnum,
    status: PosPaymentStatusEnum,
    referenceNumber: z.string().max(100).nullable().default(null),
    /** Explicit cashier attestation for internal CASH / CARD / BANK_TRANSFER recording */
    cashierAttestation: z.string().min(1).max(300),
    refundedAmountHalalas: z.number().int().nonnegative().default(0),
    receivedAt: z.string().datetime(),
    recordedBy: z.string().min(1),
    idempotencyKey: z.string().min(1),
    journalEntryId: z.string().nullable().default(null),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type PaymentDoc = z.infer<typeof PaymentDocSchema>;

export const RefundDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    paymentId: z.string().min(1),
    invoiceId: z.string().min(1),
    invoiceNumber: z.string().min(1),
    sessionId: z.string().nullable().default(null),
    amountHalalas: z.number().int().positive(),
    method: PaymentMethodCodeEnum,
    reason: z.string().min(3).max(300),
    idempotencyKey: z.string().min(1),
    journalEntryId: z.string().nullable().default(null),
    recordedBy: z.string().min(1),
    recordedAt: z.string().datetime(),
    createdAt: z.string().datetime(),
  })
  .strict();

export type RefundDoc = z.infer<typeof RefundDocSchema>;

export const PosAccountingOutboxDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    eventType: z.enum(['INVOICE_ISSUED', 'PAYMENT_RECORDED', 'REFUND_RECORDED', 'INVOICE_VOIDED']),
    sourceId: z.string().min(1),
    entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodId: z.string().min(1),
    descriptionAr: z.string().min(1),
    status: z.enum(['PENDING', 'POSTED', 'FAILED']),
    journalEntryId: z.string().nullable().default(null),
    errorMessage: z.string().nullable().default(null),
    createdAt: z.string().datetime(),
    postedAt: z.string().datetime().nullable().default(null),
  })
  .strict();

export type PosAccountingOutboxDoc = z.infer<typeof PosAccountingOutboxDocSchema>;

export const PosAuditActionEnum = z.enum([
  'SALE_CREATED',
  'SALE_FINALIZED',
  'INVOICE_ISSUED',
  'PAYMENT_RECORDED',
  'PAYMENT_FAILED',
  'REFUND_CREATED',
  'INVOICE_VOIDED',
  'DISCOUNT_APPLIED',
  'CASH_SESSION_OPENED',
  'CASH_MOVEMENT_RECORDED',
  'CASH_SESSION_CLOSED',
  'ACCOUNTING_JOURNAL_POSTED',
  'ACCOUNTING_JOURNAL_REVERSED',
  'PAYMENT_METHOD_CONFIGURED',
]);

export const PosAuditDocSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    branchId: z.string().nullable().default(null),
    action: PosAuditActionEnum,
    entityType: z.enum([
      'POS_SALE',
      'INVOICE',
      'PAYMENT',
      'REFUND',
      'POS_SESSION',
      'CASH_MOVEMENT',
      'PAYMENT_METHOD_CONFIG',
      'JOURNAL_ENTRY',
    ]),
    entityId: z.string().min(1),
    actorUid: z.string().min(1),
    idempotencyKey: z.string().nullable().default(null),
    details: z.record(z.unknown()).default({}),
    timestamp: z.string().datetime(),
  })
  .strict();

export type PosAuditDoc = z.infer<typeof PosAuditDocSchema>;

// ============================================================================
// 6. Input Schemas for POS Actions & Repository
// ============================================================================

export const PosSaleLineInputSchema = z
  .object({
    itemType: z.enum(['SERVICE', 'PRODUCT']).optional().default('SERVICE'),
    serviceId: z.string().min(1).optional(),
    productId: z.string().min(1).optional(),
    quantity: z.number().int().positive().max(100).default(1),
    discount: DiscountSpecSchema.optional(),
  })
  .strict()
  .refine(
    (data) =>
      (data.itemType === 'SERVICE' && Boolean(data.serviceId)) ||
      (data.itemType === 'PRODUCT' && Boolean(data.productId)),
    { message: 'يجب تحديد معرف الخدمة أو المنتج حسب نوع البند.' }
  );

export const PosPaymentAllocationInputSchema = z
  .object({
    method: PaymentMethodCodeEnum,
    amountHalalas: z.number().int().positive(),
    referenceNumber: z.string().max(100).nullable().optional(),
    cashierAttestation: z.string().min(1).max(300).optional(),
  })
  .strict();

export const CreateAndFinalizePosSaleInputSchema = z
  .object({
    tenantId: z.string().min(1),
    branchId: z.string().min(1),
    sessionId: z.string().nullable().optional(),
    customerId: z.string().min(1),
    bookingId: z.string().nullable().optional(),
    items: z.array(PosSaleLineInputSchema).min(1, 'يجب إضافة خدمة واحدة على الأقل'),
    payments: z.array(PosPaymentAllocationInputSchema).default([]),
    invoiceType: InvoiceTypeEnum.optional(),
    notes: z.string().max(500).optional().default(''),
    idempotencyKey: z.string().min(6, 'مفتاح منع التكرار مطلوب'),
  })
  .strict();

export type CreateAndFinalizePosSaleInput = z.input<typeof CreateAndFinalizePosSaleInputSchema>;

export const RecordInvoicePaymentInputSchema = z
  .object({
    tenantId: z.string().min(1),
    invoiceId: z.string().min(1),
    sessionId: z.string().nullable().optional(),
    method: PaymentMethodCodeEnum,
    amountHalalas: z.number().int().positive(),
    referenceNumber: z.string().max(100).nullable().optional(),
    cashierAttestation: z.string().min(1).max(300).optional(),
    idempotencyKey: z.string().min(6),
  })
  .strict();

export type RecordInvoicePaymentInput = z.input<typeof RecordInvoicePaymentInputSchema>;

export const RecordRefundInputSchema = z
  .object({
    tenantId: z.string().min(1),
    paymentId: z.string().min(1),
    sessionId: z.string().nullable().optional(),
    amountHalalas: z.number().int().positive(),
    reason: z.string().min(3, 'سبب الاسترداد مطلوب (3 أحرف على الأقل)').max(300),
    idempotencyKey: z.string().min(6),
  })
  .strict();

export type RecordRefundInput = z.input<typeof RecordRefundInputSchema>;

