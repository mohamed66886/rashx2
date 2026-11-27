import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import { hasPermission } from '../../permissions';
import { BranchDocSchema } from '../../branch.schema';
import { BookingDocSchema } from '../../booking.schema';
import { CompanyProfileDocSchema, TaxSettingsDocSchema } from '../../company.schema';
import { CustomerDocSchema } from '../../customer.schema';
import { ServiceDocSchema } from '../../service.schema';
import { ProductDocSchema, makeInventoryBalanceId } from '../../inventory.schema';
import { getCurrentRiyadhDate } from '../../availability.types';
import { roundHalfUpBigInt } from '../../service-pricing';
import type { AccountDoc, JournalLine } from '../../accounting.schema';
import {
  CashMovementDocSchema,
  CreateAndFinalizePosSaleInputSchema,
  DEFAULT_PAYMENT_METHOD_CONFIGS,
  InvoiceDocSchema,
  PaymentDocSchema,
  PaymentMethodConfigDocSchema,
  PosAccountingOutboxDocSchema,
  PosAuditDocSchema,
  PosSaleDocSchema,
  PosSessionDocSchema,
  RecordInvoicePaymentInputSchema,
  RecordRefundInputSchema,
  RefundDocSchema,
  STANDARD_MAX_DISCOUNT_PERCENT_BPS,
  calculateExpectedCashHalalas,
  computePosLinePricing,
  type CreateAndFinalizePosSaleInput,
  type InvoiceDoc,
  type InvoiceLineItem,
  type InvoiceType,
  type PaymentDoc,
  type PaymentMethodCode,
  type PaymentMethodConfigDoc,
  type PosAccountingOutboxDoc,
  type PosAuditDoc,
  type PosSaleDoc,
  type PosSessionDoc,
  type RecordInvoicePaymentInput,
  type RecordRefundInput,
  type RefundDoc,
} from '../../pos.schema';
import { AccountingRepository } from './accounting.repository';
import { InventoryRepository } from './inventory.repository';
import { TrustedSystemContext } from './trusted-context';
import type { PosActor } from './pos-session.repository';

export enum PosErrorCode {
  FORBIDDEN = 'POS_FORBIDDEN',
  BRANCH_FORBIDDEN = 'POS_BRANCH_FORBIDDEN',
  INVALID_PAYLOAD = 'POS_INVALID_PAYLOAD',
  NOT_FOUND = 'POS_NOT_FOUND',
  BOOKING_ALREADY_BILLED = 'POS_BOOKING_ALREADY_BILLED',
  BOOKING_NOT_ELIGIBLE = 'POS_BOOKING_NOT_ELIGIBLE',
  SERVICE_INVALID = 'POS_SERVICE_INVALID',
  DISCOUNT_FORBIDDEN = 'POS_DISCOUNT_FORBIDDEN',
  PAYMENT_METHOD_DISABLED = 'POS_PAYMENT_METHOD_DISABLED',
  OVERPAYMENT = 'POS_OVERPAYMENT',
  OVER_REFUND = 'POS_OVER_REFUND',
  SESSION_NOT_OPEN = 'POS_SESSION_NOT_OPEN',
  FISCAL_PERIOD_CLOSED = 'POS_FISCAL_PERIOD_CLOSED',
  ACCOUNTING_CONFIG_MISSING = 'POS_ACCOUNTING_CONFIG_MISSING',
  INVOICE_STATE_INVALID = 'POS_INVOICE_STATE_INVALID',
}

export class PosError extends Error {
  constructor(
    public readonly code: PosErrorCode,
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PosError';
  }
}

interface ResolvedPosAccounts {
  cash: AccountDoc;
  bank: AccountDoc;
  receivable: AccountDoc;
  vatOutput: AccountDoc;
  serviceRevenue: AccountDoc;
  discounts: AccountDoc;
  retailRevenue?: AccountDoc | null;
  cogsRetail?: AccountDoc | null;
  inventory?: AccountDoc | null;
}

export class PosRepository {
  private readonly accountingRepo: AccountingRepository;
  private readonly inventoryRepo: InventoryRepository;

  constructor(private readonly firestore: Firestore = getFirebaseAdminFirestore()) {
    this.accountingRepo = new AccountingRepository(firestore);
    this.inventoryRepo = new InventoryRepository(firestore);
  }

  private getActorUid(actor: PosActor): string {
    return TrustedSystemContext.isTrusted(actor) ? 'SYSTEM' : actor.uid;
  }

  private verifyPermission(
    actor: PosActor,
    capability: Parameters<typeof hasPermission>[1]
  ): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin) return;
    if (!hasPermission(actor.role, capability, actor.customPermissions)) {
      throw new PosError(
        PosErrorCode.FORBIDDEN,
        `غير مصرح: تفتقر إلى الصلاحية المطلوبة (${capability}).`
      );
    }
  }

  private verifyBranchAccess(actor: PosActor, branchId: string): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin || actor.role === 'OWNER') return;
    if (actor.assignedBranchIds && actor.assignedBranchIds.length > 0) {
      if (!actor.assignedBranchIds.includes(branchId)) {
        throw new PosError(
          PosErrorCode.BRANCH_FORBIDDEN,
          'غير مصرح: لا تملك صلاحية الوصول إلى هذا الفرع.'
        );
      }
    }
  }

  private async resolveOpenPeriod(tenantId: string, dateStr: string): Promise<string> {
    const period = await this.accountingRepo.resolvePeriodForDate(tenantId, dateStr);
    if (!period) {
      throw new PosError(
        PosErrorCode.FISCAL_PERIOD_CLOSED,
        `لا توجد فترة محاسبية مفتوحة تغطي تاريخ المعاملة (${dateStr}).`
      );
    }
    if (period.status !== 'OPEN') {
      throw new PosError(
        PosErrorCode.FISCAL_PERIOD_CLOSED,
        `الفترة المحاسبية (${period.nameAr}) مغلقة. لا يمكن ترحيل عمليات مالية إليها.`
      );
    }
    return period.id;
  }

  private async resolvePosAccounts(
    tenantId: string,
    requireRetailInventory = false
  ): Promise<ResolvedPosAccounts> {
    const [
      cash,
      bank,
      receivable,
      vatOutput2030,
      vatOutput2040,
      serviceRevenue,
      discounts,
      retailRevenue,
      cogsRetail,
      inventory,
    ] = await Promise.all([
      this.accountingRepo.getAccountByCode(tenantId, '1010'),
      this.accountingRepo.getAccountByCode(tenantId, '1020'),
      this.accountingRepo.getAccountByCode(tenantId, '1030'),
      this.accountingRepo.getAccountByCode(tenantId, '2030'),
      this.accountingRepo.getAccountByCode(tenantId, '2040'),
      this.accountingRepo.getAccountByCode(tenantId, '4010'),
      this.accountingRepo.getAccountByCode(tenantId, '4030'),
      this.accountingRepo.getAccountByCode(tenantId, '4020'),
      this.accountingRepo.getAccountByCode(tenantId, '5020'),
      this.accountingRepo.getAccountByCode(tenantId, '1040'),
    ]);

    const vatOutput = vatOutput2030 || vatOutput2040;
    if (!cash || !bank || !receivable || !vatOutput || !serviceRevenue || !discounts) {
      throw new PosError(
        PosErrorCode.ACCOUNTING_CONFIG_MISSING,
        'دليل الحسابات غير مكتمل للترحيل الآلي (مطلوب: 1010، 1020، 1030، 2030، 4010، 4030).'
      );
    }
    if (requireRetailInventory && (!retailRevenue || !cogsRetail || !inventory)) {
      throw new PosError(
        PosErrorCode.ACCOUNTING_CONFIG_MISSING,
        'دليل الحسابات غير مكتمل لبيع المنتجات والمخزون (مطلوب: 1040، 4020، 5020).'
      );
    }

    return {
      cash,
      bank,
      receivable,
      vatOutput,
      serviceRevenue,
      discounts,
      retailRevenue,
      cogsRetail,
      inventory,
    };
  }

  private async getEnabledPaymentMethodsMap(
    tenantId: string
  ): Promise<Map<PaymentMethodCode, PaymentMethodConfigDoc>> {
    const snap = await this.firestore
      .collection(firestorePaths.paymentMethodConfigs(tenantId))
      .get();
    const map = new Map<PaymentMethodCode, PaymentMethodConfigDoc>();
    for (const d of snap.docs) {
      const parsed = PaymentMethodConfigDocSchema.parse(d.data());
      map.set(parsed.method, parsed);
    }
    const nowIso = new Date().toISOString();
    for (const def of DEFAULT_PAYMENT_METHOD_CONFIGS) {
      if (!map.has(def.method)) {
        map.set(
          def.method,
          PaymentMethodConfigDocSchema.parse({
            ...def,
            tenantId,
            updatedAt: nowIso,
            updatedBy: 'system_default',
          })
        );
      }
    }
    return map;
  }

  private buildInvoiceIssuedLines(
    invoice: InvoiceDoc,
    accounts: ResolvedPosAccounts
  ): JournalLine[] {
    const lines: JournalLine[] = [];

    if (invoice.totalAmountHalalas > 0) {
      lines.push({
        lineId: 'inv-ar',
        accountId: accounts.receivable.id,
        accountCode: accounts.receivable.code,
        accountNameAr: accounts.receivable.nameAr,
        debitHalalas: invoice.totalAmountHalalas,
        creditHalalas: 0,
        description: `استحقاق فاتورة رقم ${invoice.invoiceNumber}`,
        branchId: invoice.branchId,
      });
    }

    if (invoice.totalDiscountHalalas > 0) {
      lines.push({
        lineId: 'inv-disc',
        accountId: accounts.discounts.id,
        accountCode: accounts.discounts.code,
        accountNameAr: accounts.discounts.nameAr,
        debitHalalas: invoice.totalDiscountHalalas,
        creditHalalas: 0,
        description: `خصم ممنوح على فاتورة ${invoice.invoiceNumber}`,
        branchId: invoice.branchId,
      });
    }

    const serviceGrossRev = invoice.lineItems
      .filter((l) => l.itemType !== 'PRODUCT')
      .reduce((acc, l) => acc + l.netHalalas + l.discountHalalas, 0);
    const productGrossRev = invoice.lineItems
      .filter((l) => l.itemType === 'PRODUCT')
      .reduce((acc, l) => acc + l.netHalalas + l.discountHalalas, 0);

    if (serviceGrossRev > 0) {
      lines.push({
        lineId: 'inv-rev',
        accountId: accounts.serviceRevenue.id,
        accountCode: accounts.serviceRevenue.code,
        accountNameAr: accounts.serviceRevenue.nameAr,
        debitHalalas: 0,
        creditHalalas: serviceGrossRev,
        description: `إيراد خدمات فاتورة ${invoice.invoiceNumber}`,
        branchId: invoice.branchId,
      });
    }

    if (productGrossRev > 0 && accounts.retailRevenue) {
      lines.push({
        lineId: 'inv-retail-rev',
        accountId: accounts.retailRevenue.id,
        accountCode: accounts.retailRevenue.code,
        accountNameAr: accounts.retailRevenue.nameAr,
        debitHalalas: 0,
        creditHalalas: productGrossRev,
        description: `إيراد مبيعات منتجات فاتورة ${invoice.invoiceNumber}`,
        branchId: invoice.branchId,
      });
    }

    const totalCogsHalalas = invoice.lineItems
      .filter((l) => l.itemType === 'PRODUCT')
      .reduce((acc, l) => acc + (l.unitCostHalalas || 0) * l.quantity, 0);

    if (totalCogsHalalas > 0 && accounts.cogsRetail && accounts.inventory) {
      lines.push(
        {
          lineId: 'inv-cogs-dr',
          accountId: accounts.cogsRetail.id,
          accountCode: accounts.cogsRetail.code,
          accountNameAr: accounts.cogsRetail.nameAr,
          debitHalalas: totalCogsHalalas,
          creditHalalas: 0,
          description: `تكلفة البضاعة المباعة - فاتورة ${invoice.invoiceNumber}`,
          branchId: invoice.branchId,
        },
        {
          lineId: 'inv-inv-cr',
          accountId: accounts.inventory.id,
          accountCode: accounts.inventory.code,
          accountNameAr: accounts.inventory.nameAr,
          debitHalalas: 0,
          creditHalalas: totalCogsHalalas,
          description: `صرف مخزون مبيعات - فاتورة ${invoice.invoiceNumber}`,
          branchId: invoice.branchId,
        }
      );
    }

    if (invoice.vatAmountHalalas > 0) {
      lines.push({
        lineId: 'inv-vat',
        accountId: accounts.vatOutput.id,
        accountCode: accounts.vatOutput.code,
        accountNameAr: accounts.vatOutput.nameAr,
        debitHalalas: 0,
        creditHalalas: invoice.vatAmountHalalas,
        description: `ضريبة قيمة مضافة مخرجات - ${invoice.invoiceNumber}`,
        branchId: invoice.branchId,
      });
    }

    return lines;
  }

  private buildPaymentLines(
    payment: PaymentDoc,
    accounts: ResolvedPosAccounts
  ): JournalLine[] {
    const settlementAcc = payment.method === 'CASH' ? accounts.cash : accounts.bank;
    return [
      {
        lineId: 'pay-debit',
        accountId: settlementAcc.id,
        accountCode: settlementAcc.code,
        accountNameAr: settlementAcc.nameAr,
        debitHalalas: payment.amountHalalas,
        creditHalalas: 0,
        description: `تحصيل (${payment.method}) للفاتورة ${payment.invoiceNumber}`,
        branchId: payment.branchId,
      },
      {
        lineId: 'pay-credit',
        accountId: accounts.receivable.id,
        accountCode: accounts.receivable.code,
        accountNameAr: accounts.receivable.nameAr,
        debitHalalas: 0,
        creditHalalas: payment.amountHalalas,
        description: `تسوية ذمة عميل - فاتورة ${payment.invoiceNumber}`,
        branchId: payment.branchId,
      },
    ];
  }

  private buildRefundLines(
    refund: RefundDoc,
    invoice: InvoiceDoc,
    accounts: ResolvedPosAccounts
  ): JournalLine[] {
    const settlementAcc = refund.method === 'CASH' ? accounts.cash : accounts.bank;
    let refundVatHalalas = 0;
    if (invoice.vatAmountHalalas > 0 && invoice.totalAmountHalalas > 0) {
      refundVatHalalas = Number(
        roundHalfUpBigInt(
          BigInt(refund.amountHalalas) * BigInt(invoice.vatAmountHalalas),
          BigInt(invoice.totalAmountHalalas)
        )
      );
      if (refundVatHalalas > refund.amountHalalas) {
        refundVatHalalas = refund.amountHalalas;
      }
    }
    const refundNetHalalas = refund.amountHalalas - refundVatHalalas;

    const lines: JournalLine[] = [];
    if (refundNetHalalas > 0) {
      lines.push({
        lineId: 'ref-rev',
        accountId: accounts.serviceRevenue.id,
        accountCode: accounts.serviceRevenue.code,
        accountNameAr: accounts.serviceRevenue.nameAr,
        debitHalalas: refundNetHalalas,
        creditHalalas: 0,
        description: `عكس إيراد استرداد - فاتورة ${invoice.invoiceNumber}`,
        branchId: refund.branchId,
      });
    }
    if (refundVatHalalas > 0) {
      lines.push({
        lineId: 'ref-vat',
        accountId: accounts.vatOutput.id,
        accountCode: accounts.vatOutput.code,
        accountNameAr: accounts.vatOutput.nameAr,
        debitHalalas: refundVatHalalas,
        creditHalalas: 0,
        description: `عكس ضريبة مخرجات - فاتورة ${invoice.invoiceNumber}`,
        branchId: refund.branchId,
      });
    }
    lines.push({
      lineId: 'ref-cr',
      accountId: settlementAcc.id,
      accountCode: settlementAcc.code,
      accountNameAr: settlementAcc.nameAr,
      debitHalalas: 0,
      creditHalalas: refund.amountHalalas,
      description: `صرف استرداد (${refund.method}) - ${refund.reason}`,
      branchId: refund.branchId,
    });
    return lines;
  }

  private async flushOutboxEntry(
    tenantId: string,
    outbox: PosAccountingOutboxDoc,
    lines: JournalLine[],
    actorUid: string,
    targetDocPath?: string
  ): Promise<string | null> {
    if (lines.length === 0) return null;

    const outboxRef = this.firestore.doc(
      firestorePaths.posAccountingOutboxItem(tenantId, outbox.id)
    );
    const currentOutbox = await outboxRef.get();
    if (currentOutbox.exists && currentOutbox.data()?.status === 'POSTED') {
      return (currentOutbox.data()?.journalEntryId as string) || null;
    }

    try {
      const draft = await this.accountingRepo.createDraftJournal(
        tenantId,
        {
          descriptionAr: outbox.descriptionAr,
          entryDate: outbox.entryDate,
          periodId: outbox.periodId,
          lines,
          sourceDocumentRef: outbox.sourceId,
        },
        actorUid
      );
      const posted = await this.accountingRepo.postJournalEntry(tenantId, draft.id, actorUid);

      const nowIso = new Date().toISOString();
      const auditRef = this.firestore.collection(firestorePaths.posAuditTrail(tenantId)).doc();
      const auditDoc = PosAuditDocSchema.parse({
        id: auditRef.id,
        tenantId,
        branchId: lines[0]?.branchId || null,
        action: 'ACCOUNTING_JOURNAL_POSTED',
        entityType: 'JOURNAL_ENTRY',
        entityId: posted.id,
        actorUid,
        idempotencyKey: outbox.id,
        details: {
          entryNumber: posted.entryNumber,
          eventType: outbox.eventType,
          sourceId: outbox.sourceId,
          totalDebitHalalas: posted.totalDebitHalalas,
        },
        timestamp: nowIso,
      });

      await this.firestore.runTransaction(async (tx) => {
        tx.set(
          outboxRef,
          PosAccountingOutboxDocSchema.parse({
            ...outbox,
            status: 'POSTED',
            journalEntryId: posted.id,
            errorMessage: null,
            postedAt: nowIso,
          })
        );
        if (targetDocPath) {
          tx.update(
            this.firestore.doc(targetDocPath),
            outbox.eventType === 'REFUND_RECORDED'
              ? { journalEntryId: posted.id }
              : { journalEntryId: posted.id, updatedAt: nowIso }
          );
        }
        tx.set(auditRef, auditDoc);
      });

      return posted.id;
    } catch (err: any) {
      await outboxRef.set(
        PosAccountingOutboxDocSchema.parse({
          ...outbox,
          status: 'FAILED',
          errorMessage: err?.message || 'Accounting posting failed',
        })
      );
      throw err;
    }
  }

  /**
   * Creates and finalizes a POS sale, issues an immutable invoice, optionally records
   * split/partial/full payments, updates cash drawer (for CASH only), and posts journals.
   */
  async createAndFinalizeSale(
    actor: PosActor,
    rawInput: CreateAndFinalizePosSaleInput
  ): Promise<{
    sale: PosSaleDoc;
    invoice: InvoiceDoc;
    payments: PaymentDoc[];
    deduplicated: boolean;
  }> {
    this.verifyPermission(actor, 'pos.sales.create');
    this.verifyPermission(actor, 'invoices.issue');

    const parseRes = CreateAndFinalizePosSaleInputSchema.safeParse(rawInput);
    if (!parseRes.success) {
      throw new PosError(
        PosErrorCode.INVALID_PAYLOAD,
        `بيانات عملية البيع غير صالحة: ${parseRes.error.issues[0]?.message || parseRes.error.message}`,
        parseRes.error
      );
    }
    const input = parseRes.data;
    this.verifyBranchAccess(actor, input.branchId);

    if (input.payments.length > 0) {
      this.verifyPermission(actor, 'payments.record');
    }

    // Check discount permissions upfront
    for (const item of input.items) {
      if (item.discount && item.discount.type !== 'NONE' && item.discount.value > 0) {
        this.verifyPermission(actor, 'discounts.apply');
        if (
          item.discount.type === 'PERCENT' &&
          item.discount.value > STANDARD_MAX_DISCOUNT_PERCENT_BPS
        ) {
          this.verifyPermission(actor, 'discounts.override');
        }
      }
    }

    const actorUid = this.getActorUid(actor);
    const invoiceDate = getCurrentRiyadhDate();

    // Check idempotency early
    const idemRef = this.firestore.doc(
      firestorePaths.posSaleIdempotency(input.tenantId, input.idempotencyKey)
    );
    const earlyIdem = await idemRef.get();
    if (earlyIdem.exists) {
      const existingSaleId = earlyIdem.data()?.saleId as string;
      const existingSaleSnap = await this.firestore
        .doc(firestorePaths.posSale(input.tenantId, existingSaleId))
        .get();
      if (existingSaleSnap.exists) {
        const sale = PosSaleDocSchema.parse(existingSaleSnap.data());
        const invSnap = await this.firestore
          .doc(firestorePaths.invoice(input.tenantId, sale.invoiceId!))
          .get();
        const paysSnap = await this.firestore
          .collection(firestorePaths.payments(input.tenantId))
          .where('saleId', '==', sale.id)
          .get();
        return {
          sale,
          invoice: InvoiceDocSchema.parse(invSnap.data()),
          payments: paysSnap.docs.map((d) => PaymentDocSchema.parse(d.data())),
          deduplicated: true,
        };
      }
    }

    // Pre-validate fiscal period, chart of accounts, and enabled payment methods
    const hasProductItems = input.items.some((i) => i.itemType === 'PRODUCT');
    const [periodId, accounts, methodsMap] = await Promise.all([
      this.resolveOpenPeriod(input.tenantId, invoiceDate),
      this.resolvePosAccounts(input.tenantId, hasProductItems),
      this.getEnabledPaymentMethodsMap(input.tenantId),
    ]);

    for (const p of input.payments) {
      const cfg = methodsMap.get(p.method);
      if (!cfg || !cfg.isEnabled) {
        throw new PosError(
          PosErrorCode.PAYMENT_METHOD_DISABLED,
          `وسيلة الدفع (${p.method}) غير مفعلة لهذه المنشأة.`
        );
      }
      if (cfg.requiresReference && (!p.referenceNumber || p.referenceNumber.trim() === '')) {
        throw new PosError(
          PosErrorCode.INVALID_PAYLOAD,
          `وسيلة الدفع (${cfg.labelAr}) تتطلب إدخال رقم مرجعي للعملية.`
        );
      }
    }

    const saleRef = this.firestore.collection(firestorePaths.posSales(input.tenantId)).doc();
    const invoiceRef = this.firestore.collection(firestorePaths.invoices(input.tenantId)).doc();
    const yearStr = invoiceDate.slice(0, 4);
    const seqRef = this.firestore.doc(firestorePaths.invoiceSequence(input.tenantId, yearStr));

    const outboxJobs: Array<{ outbox: PosAccountingOutboxDoc; lines: JournalLine[]; targetPath: string }> =
      [];

    const txResult = await this.firestore.runTransaction(async (transaction) => {
      // Step 1: All reads FIRST
      const [idemSnap, branchSnap, customerSnap, companySnap, taxSnap, seqSnap] = await Promise.all([
        transaction.get(idemRef),
        transaction.get(this.firestore.doc(firestorePaths.branch(input.tenantId, input.branchId))),
        transaction.get(
          this.firestore.doc(firestorePaths.tenantCustomer(input.tenantId, input.customerId))
        ),
        transaction.get(this.firestore.doc(firestorePaths.companyProfile(input.tenantId))),
        transaction.get(this.firestore.doc(firestorePaths.taxSettings(input.tenantId))),
        transaction.get(seqRef),
      ]);

      if (idemSnap.exists) {
        const existingSaleId = idemSnap.data()?.saleId as string;
        const sSnap = await transaction.get(
          this.firestore.doc(firestorePaths.posSale(input.tenantId, existingSaleId))
        );
        if (sSnap.exists) {
          const sale = PosSaleDocSchema.parse(sSnap.data());
          const invSnap = await transaction.get(
            this.firestore.doc(firestorePaths.invoice(input.tenantId, sale.invoiceId!))
          );
          return {
            sale,
            invoice: InvoiceDocSchema.parse(invSnap.data()),
            payments: [] as PaymentDoc[],
            deduplicated: true,
          };
        }
      }

      if (!branchSnap.exists) {
        throw new PosError(PosErrorCode.NOT_FOUND, 'الفرع غير موجود.');
      }
      const branch = BranchDocSchema.parse(branchSnap.data());

      if (!customerSnap.exists) {
        throw new PosError(PosErrorCode.NOT_FOUND, 'العميل غير موجود.');
      }
      const customer = CustomerDocSchema.parse(customerSnap.data());

      const companyProfile = companySnap.exists
        ? CompanyProfileDocSchema.parse(companySnap.data())
        : null;
      const taxSettings = taxSnap.exists ? TaxSettingsDocSchema.parse(taxSnap.data()) : null;

      // Booking lock check if bookingId provided
      const bookingLockRef = input.bookingId
        ? this.firestore.doc(firestorePaths.posBookingLock(input.tenantId, input.bookingId))
        : null;

      if (input.bookingId && bookingLockRef) {
        const [bookingSnap, bookingLockSnap] = await Promise.all([
          transaction.get(this.firestore.doc(firestorePaths.booking(input.tenantId, input.bookingId))),
          transaction.get(bookingLockRef),
        ]);

        if (!bookingSnap.exists) {
          throw new PosError(PosErrorCode.NOT_FOUND, 'الحجز المرتبط غير موجود.');
        }
        const booking = BookingDocSchema.parse(bookingSnap.data());
        if (booking.branchId !== input.branchId) {
          throw new PosError(PosErrorCode.BOOKING_NOT_ELIGIBLE, 'الحجز لا يتبع هذا الفرع.');
        }
        if (
          booking.status !== 'CONFIRMED' &&
          booking.status !== 'CHECKED_IN' &&
          booking.status !== 'IN_SERVICE' &&
          booking.status !== 'COMPLETED'
        ) {
          throw new PosError(
            PosErrorCode.BOOKING_NOT_ELIGIBLE,
            `لا يمكن فوترة الحجز في حالته الحالية (${booking.status}).`
          );
        }
        if (bookingLockSnap.exists && bookingLockSnap.data()?.status === 'BILLED') {
          throw new PosError(
            PosErrorCode.BOOKING_ALREADY_BILLED,
            'تم إصدار فاتورة مسبقاً لهذا الحجز ولا يمكن فوترته مرتين.'
          );
        }
      }

      // Session check if sessionId provided (or required when CASH payment exists)
      const hasCashPayment = input.payments.some((p) => p.method === 'CASH');
      if (hasCashPayment && !input.sessionId) {
        throw new PosError(
          PosErrorCode.SESSION_NOT_OPEN,
          'يتطلب الدفع النقدي (كاش) وجود جلسة صندوق مفتوحة.'
        );
      }

      let session: PosSessionDoc | null = null;
      const sessionRef = input.sessionId
        ? this.firestore.doc(firestorePaths.posSession(input.tenantId, input.sessionId))
        : null;
      if (sessionRef) {
        const sSnap = await transaction.get(sessionRef);
        if (!sSnap.exists) {
          throw new PosError(PosErrorCode.SESSION_NOT_OPEN, 'جلسة الصندوق غير موجودة.');
        }
        session = PosSessionDocSchema.parse(sSnap.data());
        if (session.branchId !== input.branchId || session.status !== 'OPEN') {
          throw new PosError(
            PosErrorCode.SESSION_NOT_OPEN,
            'جلسة الصندوق مغلقة أو لا تتبع هذا الفرع.'
          );
        }
      }

      // Load all authoritative services & products
      const uniqueServiceIds = Array.from(
        new Set(input.items.filter((i) => i.itemType !== 'PRODUCT' && i.serviceId).map((i) => i.serviceId!))
      );
      const uniqueProductIds = Array.from(
        new Set(input.items.filter((i) => i.itemType === 'PRODUCT' && i.productId).map((i) => i.productId!))
      );

      const [serviceSnaps, productSnaps] = await Promise.all([
        Promise.all(
          uniqueServiceIds.map((sid) =>
            transaction.get(this.firestore.doc(firestorePaths.service(input.tenantId, sid)))
          )
        ),
        Promise.all(
          uniqueProductIds.map((pid) =>
            transaction.get(this.firestore.doc(firestorePaths.product(input.tenantId, pid)))
          )
        ),
      ]);

      const servicesById = new Map<string, ReturnType<typeof ServiceDocSchema.parse>>();
      for (const sSnap of serviceSnaps) {
        if (!sSnap.exists) {
          throw new PosError(PosErrorCode.SERVICE_INVALID, 'إحدى الخدمات المختارة غير موجودة.');
        }
        const srv = ServiceDocSchema.parse(sSnap.data());
        if (!srv.isActive || !srv.assignedBranchIds.includes(input.branchId)) {
          throw new PosError(
            PosErrorCode.SERVICE_INVALID,
            `الخدمة (${srv.nameAr}) غير نشطة أو غير متاحة في هذا الفرع.`
          );
        }
        servicesById.set(srv.id, srv);
      }

      const productsById = new Map<string, ReturnType<typeof ProductDocSchema.parse>>();
      for (const pSnap of productSnaps) {
        if (!pSnap.exists) {
          throw new PosError(PosErrorCode.SERVICE_INVALID, 'أحد المنتجات المختارة غير موجود.');
        }
        const prod = ProductDocSchema.parse(pSnap.data());
        if (
          prod.status !== 'ACTIVE' ||
          !prod.isSellableInPos ||
          prod.sellingPriceHalalas === null
        ) {
          throw new PosError(
            PosErrorCode.SERVICE_INVALID,
            `المنتج (${prod.nameAr}) غير نشط أو غير متاح للبيع في نقطة البيع.`
          );
        }
        productsById.set(prod.id, prod);
      }

      // Preload inventory balances & movement idempotency snaps before writes
      const preloadedBalances = new Map<string, FirebaseFirestore.DocumentSnapshot>();
      const preloadedMoveIdems = new Map<string, FirebaseFirestore.DocumentSnapshot>();
      await Promise.all([
        ...uniqueProductIds.map(async (pid) => {
          const balId = makeInventoryBalanceId(input.branchId, pid);
          const snap = await transaction.get(
            this.firestore.doc(firestorePaths.inventoryBalance(input.tenantId, balId))
          );
          preloadedBalances.set(pid, snap);
        }),
        ...input.items.map(async (item, idx) => {
          if (item.itemType === 'PRODUCT') {
            const mKey = `pos_sale_${input.idempotencyKey}_line_${idx}`;
            const snap = await transaction.get(
              this.firestore.doc(firestorePaths.stockMovementIdempotency(input.tenantId, mKey))
            );
            preloadedMoveIdems.set(mKey, snap);
          }
        }),
      ]);

      const nowIsoForStock = new Date().toISOString();
      const computedLines: InvoiceLineItem[] = [];

      // Step 2: Authoritative Server-Side Pricing, Tax Computation & Atomic Stock Deduction
      for (let idx = 0; idx < input.items.length; idx++) {
        const item = input.items[idx]!;
        if (item.itemType === 'PRODUCT') {
          const prod = productsById.get(item.productId!)!;
          const unitPriceHalalas = prod.sellingPriceHalalas!;
          const calc = computePosLinePricing(
            {
              unitPriceHalalas,
              quantity: item.quantity,
              taxMode: prod.taxMode,
              discount: item.discount,
              transactionDate: invoiceDate,
            },
            taxSettings
          );

          if (
            item.discount?.type === 'FIXED' &&
            calc.grossBeforeDiscountHalalas > 0 &&
            calc.discountHalalas * 10000 >
              calc.grossBeforeDiscountHalalas * STANDARD_MAX_DISCOUNT_PERCENT_BPS
          ) {
            this.verifyPermission(actor, 'discounts.override');
          }

          let unitCostHalalas = prod.purchaseCostHalalas;
          let stockMovementId: string | null = null;
          if (prod.stockTrackingEnabled) {
            const mKey = `pos_sale_${input.idempotencyKey}_line_${idx}`;
            const moved = await this.inventoryRepo.applyStockMovementInTx(transaction, {
              tenantId: input.tenantId,
              branchId: input.branchId,
              product: prod,
              movementType: 'SALE',
              direction: 'OUT',
              quantity: item.quantity,
              unitCostHalalas: 0,
              relatedDocumentType: 'POS_SALE',
              relatedDocumentId: saleRef.id,
              reason: `بيع منتج عبر نقطة البيع (${prod.nameAr})`,
              idempotencyKey: mKey,
              actorUid,
              nowIso: nowIsoForStock,
              preloadedBalanceSnap: preloadedBalances.get(prod.id),
              preloadedIdemSnap: preloadedMoveIdems.get(mKey),
            });
            unitCostHalalas = moved.movement.unitCostHalalas;
            stockMovementId = moved.movement.id;
          }

          computedLines.push({
            lineId: `line-${idx + 1}`,
            itemType: 'PRODUCT',
            serviceId: null,
            productId: prod.id,
            nameAr: prod.nameAr,
            nameEn: prod.nameEn || '',
            quantity: item.quantity,
            returnedQuantity: 0,
            unitPriceHalalas,
            unitCostHalalas,
            stockMovementId,
            grossBeforeDiscountHalalas: calc.grossBeforeDiscountHalalas,
            discountType: item.discount?.type || 'NONE',
            discountValue: item.discount?.value || 0,
            discountHalalas: calc.discountHalalas,
            discountReason: item.discount?.reason || '',
            taxMode: prod.taxMode,
            taxCategory: calc.taxCategory,
            taxRateBps: calc.taxRateBps,
            netHalalas: calc.netHalalas,
            vatHalalas: calc.vatHalalas,
            totalHalalas: calc.totalHalalas,
          });
        } else {
          const srv = servicesById.get(item.serviceId!)!;
          const calc = computePosLinePricing(
            {
              unitPriceHalalas: srv.basePriceHalalas,
              quantity: item.quantity,
              taxMode: srv.taxMode,
              discount: item.discount,
              transactionDate: invoiceDate,
            },
            taxSettings
          );

          if (
            item.discount?.type === 'FIXED' &&
            calc.grossBeforeDiscountHalalas > 0 &&
            calc.discountHalalas * 10000 >
              calc.grossBeforeDiscountHalalas * STANDARD_MAX_DISCOUNT_PERCENT_BPS
          ) {
            this.verifyPermission(actor, 'discounts.override');
          }

          computedLines.push({
            lineId: `line-${idx + 1}`,
            itemType: 'SERVICE',
            serviceId: srv.id,
            productId: null,
            nameAr: srv.nameAr,
            nameEn: srv.nameEn || '',
            quantity: item.quantity,
            returnedQuantity: 0,
            unitPriceHalalas: srv.basePriceHalalas,
            unitCostHalalas: 0,
            stockMovementId: null,
            grossBeforeDiscountHalalas: calc.grossBeforeDiscountHalalas,
            discountType: item.discount?.type || 'NONE',
            discountValue: item.discount?.value || 0,
            discountHalalas: calc.discountHalalas,
            discountReason: item.discount?.reason || '',
            taxMode: srv.taxMode,
            taxCategory: calc.taxCategory,
            taxRateBps: calc.taxRateBps,
            netHalalas: calc.netHalalas,
            vatHalalas: calc.vatHalalas,
            totalHalalas: calc.totalHalalas,
          });
        }
      }

      const subtotalBeforeDiscountHalalas = computedLines.reduce(
        (acc, l) => acc + l.grossBeforeDiscountHalalas,
        0
      );
      const totalDiscountHalalas = computedLines.reduce((acc, l) => acc + l.discountHalalas, 0);
      const netAmountHalalas = computedLines.reduce((acc, l) => acc + l.netHalalas, 0);
      const vatAmountHalalas = computedLines.reduce((acc, l) => acc + l.vatHalalas, 0);
      const totalAmountHalalas = computedLines.reduce((acc, l) => acc + l.totalHalalas, 0);

      // Validate payment allocations
      const totalPaymentsHalalas = input.payments.reduce((acc, p) => acc + p.amountHalalas, 0);
      if (totalPaymentsHalalas > totalAmountHalalas) {
        throw new PosError(
          PosErrorCode.OVERPAYMENT,
          'مجموع المدفوعات يتجاوز إجمالي الفاتورة المستحق.'
        );
      }

      // Allocate sequential invoice number
      const currentSeq = seqSnap.exists ? (seqSnap.data()?.currentValue as number) || 0 : 0;
      const nextSeq = currentSeq + 1;
      const invoiceNumber = `INV-${yearStr}-${String(nextSeq).padStart(5, '0')}`;
      const nowIso = new Date().toISOString();

      const resolvedInvoiceType: InvoiceType =
        input.invoiceType ||
        (taxSettings?.vatStatus === 'REGISTERED' && !taxSettings?.isVatExempt
          ? 'SIMPLIFIED_TAX'
          : 'NON_TAX');

      const paidAmountHalalas = totalPaymentsHalalas;
      const balanceDueHalalas = totalAmountHalalas - paidAmountHalalas;
      const invoiceStatus =
        balanceDueHalalas === 0
          ? 'PAID'
          : paidAmountHalalas > 0
            ? 'PARTIALLY_PAID'
            : 'ISSUED';
      const paymentStatus =
        balanceDueHalalas === 0 ? 'PAID' : paidAmountHalalas > 0 ? 'PARTIAL' : 'UNPAID';

      const invoiceDoc = InvoiceDocSchema.parse({
        id: invoiceRef.id,
        tenantId: input.tenantId,
        branchId: input.branchId,
        invoiceNumber,
        invoiceDate,
        issuedAt: nowIso,
        invoiceType: resolvedInvoiceType,
        status: invoiceStatus,
        paymentStatus,
        tenantSnapshot: {
          tenantId: input.tenantId,
          legalNameAr: companyProfile?.legalNameAr || branch.name,
          legalNameEn: companyProfile?.legalNameEn || '',
          commercialName: companyProfile?.commercialName || branch.name,
          crNumber: companyProfile?.crNumber || null,
          vatNumber: taxSettings?.vatNumber || null,
          vatStatus: taxSettings?.vatStatus || 'NOT_REGISTERED',
          branchId: branch.id,
          branchName: branch.name,
          branchAddress: branch.address || '',
          branchCity: branch.city || '',
        },
        customerSnapshot: {
          customerId: customer.id,
          fullName: customer.fullName,
          phone: customer.displayPhone || customer.normalizedPhone || null,
          isGuest: customer.isGuest,
        },
        lineItems: computedLines,
        subtotalBeforeDiscountHalalas,
        totalDiscountHalalas,
        netAmountHalalas,
        vatAmountHalalas,
        totalAmountHalalas,
        paidAmountHalalas,
        refundedAmountHalalas: 0,
        balanceDueHalalas,
        currency: 'SAR',
        saleId: saleRef.id,
        bookingId: input.bookingId || null,
        sessionId: input.sessionId || null,
        journalEntryId: null,
        voidReason: null,
        voidedAt: null,
        voidedBy: null,
        createdBy: actorUid,
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      const saleDoc = PosSaleDocSchema.parse({
        id: saleRef.id,
        tenantId: input.tenantId,
        branchId: input.branchId,
        sessionId: input.sessionId || null,
        source: input.bookingId ? 'BOOKING' : 'WALK_IN',
        bookingId: input.bookingId || null,
        customerId: customer.id,
        customerName: customer.fullName,
        status: 'FINALIZED',
        lineItems: computedLines,
        subtotalBeforeDiscountHalalas,
        totalDiscountHalalas,
        netAmountHalalas,
        vatAmountHalalas,
        totalAmountHalalas,
        invoiceId: invoiceDoc.id,
        invoiceNumber,
        idempotencyKey: input.idempotencyKey,
        notes: input.notes || '',
        createdBy: actorUid,
        finalizedBy: actorUid,
        createdAt: nowIso,
        finalizedAt: nowIso,
        updatedAt: nowIso,
      });

      // Write sequence, sale, invoice, idempotency, booking lock
      transaction.set(seqRef, { currentValue: nextSeq, updatedAt: nowIso });
      transaction.set(saleRef, saleDoc);
      transaction.set(invoiceRef, invoiceDoc);
      transaction.set(idemRef, { id: input.idempotencyKey, saleId: saleDoc.id, createdAt: nowIso });
      if (bookingLockRef && input.bookingId) {
        transaction.set(bookingLockRef, {
          id: input.bookingId,
          bookingId: input.bookingId,
          saleId: saleDoc.id,
          invoiceId: invoiceDoc.id,
          status: 'BILLED',
          createdAt: nowIso,
        });
      }

      // Outbox for INVOICE_ISSUED
      const invOutboxRef = this.firestore
        .collection(firestorePaths.posAccountingOutbox(input.tenantId))
        .doc();
      const invOutbox = PosAccountingOutboxDocSchema.parse({
        id: invOutboxRef.id,
        tenantId: input.tenantId,
        eventType: 'INVOICE_ISSUED',
        sourceId: invoiceDoc.id,
        entryDate: invoiceDate,
        periodId,
        descriptionAr: `إصدار فاتورة مبيعات رقم ${invoiceNumber}`,
        status: 'PENDING',
        journalEntryId: null,
        errorMessage: null,
        createdAt: nowIso,
        postedAt: null,
      });
      transaction.set(invOutboxRef, invOutbox);
      outboxJobs.push({
        outbox: invOutbox,
        lines: this.buildInvoiceIssuedLines(invoiceDoc, accounts),
        targetPath: firestorePaths.invoice(input.tenantId, invoiceDoc.id),
      });

      // Payments + Cash Drawer updates
      const paymentDocs: PaymentDoc[] = [];
      let cashAddedHalalas = 0;
      let nonCashAddedHalalas = 0;

      for (let i = 0; i < input.payments.length; i++) {
        const pIn = input.payments[i]!;
        const payRef = this.firestore.collection(firestorePaths.payments(input.tenantId)).doc();
        const payIdemKey = `${input.idempotencyKey}_pay_${i}`;
        const payDoc = PaymentDocSchema.parse({
          id: payRef.id,
          tenantId: input.tenantId,
          branchId: input.branchId,
          invoiceId: invoiceDoc.id,
          invoiceNumber,
          saleId: saleDoc.id,
          sessionId: input.sessionId || null,
          amountHalalas: pIn.amountHalalas,
          method: pIn.method,
          status: 'RECORDED',
          referenceNumber: pIn.referenceNumber || null,
          cashierAttestation:
            pIn.cashierAttestation?.trim() ||
            `إقرار الكاشير باستلام مبلغ ${pIn.amountHalalas / 100} ريال (${pIn.method})`,
          refundedAmountHalalas: 0,
          receivedAt: nowIso,
          recordedBy: actorUid,
          idempotencyKey: payIdemKey,
          journalEntryId: null,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        transaction.set(payRef, payDoc);
        transaction.set(
          this.firestore.doc(firestorePaths.paymentIdempotency(input.tenantId, payIdemKey)),
          { id: payIdemKey, paymentId: payDoc.id, createdAt: nowIso }
        );
        paymentDocs.push(payDoc);

        if (pIn.method === 'CASH') {
          cashAddedHalalas += pIn.amountHalalas;
          if (session) {
            const mvRef = this.firestore
              .collection(firestorePaths.posCashMovements(input.tenantId))
              .doc();
            transaction.set(
              mvRef,
              CashMovementDocSchema.parse({
                id: mvRef.id,
                tenantId: input.tenantId,
                branchId: input.branchId,
                sessionId: session.id,
                type: 'CASH_SALE',
                amountHalalas: pIn.amountHalalas,
                referenceId: payDoc.id,
                reason: `تحصيل نقدي فاتورة ${invoiceNumber}`,
                idempotencyKey: `cash_sale_${payDoc.id}`,
                actorUid,
                createdAt: nowIso,
              })
            );
          }
        } else {
          nonCashAddedHalalas += pIn.amountHalalas;
        }

        // Outbox for PAYMENT_RECORDED
        const payOutboxRef = this.firestore
          .collection(firestorePaths.posAccountingOutbox(input.tenantId))
          .doc();
        const payOutbox = PosAccountingOutboxDocSchema.parse({
          id: payOutboxRef.id,
          tenantId: input.tenantId,
          eventType: 'PAYMENT_RECORDED',
          sourceId: payDoc.id,
          entryDate: invoiceDate,
          periodId,
          descriptionAr: `تحصيل دفعة (${payDoc.method}) لفاتورة ${invoiceNumber}`,
          status: 'PENDING',
          journalEntryId: null,
          errorMessage: null,
          createdAt: nowIso,
          postedAt: null,
        });
        transaction.set(payOutboxRef, payOutbox);
        outboxJobs.push({
          outbox: payOutbox,
          lines: this.buildPaymentLines(payDoc, accounts),
          targetPath: firestorePaths.payment(input.tenantId, payDoc.id),
        });
      }

      if (session && sessionRef && (cashAddedHalalas > 0 || nonCashAddedHalalas > 0)) {
        const nextCashSales = session.cashSalesHalalas + cashAddedHalalas;
        const nextNonCashSales = session.nonCashSalesHalalas + nonCashAddedHalalas;
        const nextExpected = calculateExpectedCashHalalas({
          openingCashHalalas: session.openingCashHalalas,
          cashSalesHalalas: nextCashSales,
          cashInHalalas: session.cashInHalalas,
          cashRefundsHalalas: session.cashRefundsHalalas,
          cashOutHalalas: session.cashOutHalalas,
        });
        transaction.set(
          sessionRef,
          PosSessionDocSchema.parse({
            ...session,
            cashSalesHalalas: nextCashSales,
            nonCashSalesHalalas: nextNonCashSales,
            expectedCashHalalas: nextExpected,
            updatedAt: nowIso,
          })
        );
      }

      // Audits
      const writeAudit = (
        action: PosAuditDoc['action'],
        entityType: PosAuditDoc['entityType'],
        entityId: string,
        details: Record<string, unknown>
      ) => {
        const aRef = this.firestore.collection(firestorePaths.posAuditTrail(input.tenantId)).doc();
        transaction.set(
          aRef,
          PosAuditDocSchema.parse({
            id: aRef.id,
            tenantId: input.tenantId,
            branchId: input.branchId,
            action,
            entityType,
            entityId,
            actorUid,
            idempotencyKey: input.idempotencyKey,
            details,
            timestamp: nowIso,
          })
        );
      };

      writeAudit('SALE_CREATED', 'POS_SALE', saleDoc.id, { source: saleDoc.source });
      writeAudit('SALE_FINALIZED', 'POS_SALE', saleDoc.id, {
        totalAmountHalalas,
        invoiceNumber,
      });
      writeAudit('INVOICE_ISSUED', 'INVOICE', invoiceDoc.id, {
        invoiceNumber,
        totalAmountHalalas,
        vatAmountHalalas,
      });
      if (totalDiscountHalalas > 0) {
        writeAudit('DISCOUNT_APPLIED', 'INVOICE', invoiceDoc.id, {
          totalDiscountHalalas,
        });
      }
      for (const p of paymentDocs) {
        writeAudit('PAYMENT_RECORDED', 'PAYMENT', p.id, {
          method: p.method,
          amountHalalas: p.amountHalalas,
          invoiceNumber,
        });
      }

      return {
        sale: saleDoc,
        invoice: invoiceDoc,
        payments: paymentDocs,
        deduplicated: false,
      };
    });

    if (txResult.deduplicated) {
      return txResult;
    }

    // Flush accounting outbox sequentially via AccountingRepository
    for (const job of outboxJobs) {
      const jId = await this.flushOutboxEntry(
        input.tenantId,
        job.outbox,
        job.lines,
        actorUid,
        job.targetPath
      );
      if (jId && job.outbox.eventType === 'INVOICE_ISSUED') {
        txResult.invoice.journalEntryId = jId;
      } else if (jId && job.outbox.eventType === 'PAYMENT_RECORDED') {
        const matchedPay = txResult.payments.find((p) => p.id === job.outbox.sourceId);
        if (matchedPay) matchedPay.journalEntryId = jId;
      }
    }

    return txResult;
  }

  /**
   * Records an additional or split payment against an existing ISSUED or PARTIALLY_PAID invoice.
   */
  async recordPaymentOnInvoice(
    actor: PosActor,
    rawInput: RecordInvoicePaymentInput
  ): Promise<{ payment: PaymentDoc; invoice: InvoiceDoc; deduplicated: boolean }> {
    this.verifyPermission(actor, 'payments.record');

    const parseRes = RecordInvoicePaymentInputSchema.safeParse(rawInput);
    if (!parseRes.success) {
      throw new PosError(
        PosErrorCode.INVALID_PAYLOAD,
        `بيانات الدفع غير صالحة: ${parseRes.error.issues[0]?.message || parseRes.error.message}`,
        parseRes.error
      );
    }
    const input = parseRes.data;
    const actorUid = this.getActorUid(actor);
    const todayDate = getCurrentRiyadhDate();

    const idemRef = this.firestore.doc(
      firestorePaths.paymentIdempotency(input.tenantId, input.idempotencyKey)
    );
    const earlyIdem = await idemRef.get();
    if (earlyIdem.exists) {
      const existingPayId = earlyIdem.data()?.paymentId as string;
      const pSnap = await this.firestore
        .doc(firestorePaths.payment(input.tenantId, existingPayId))
        .get();
      if (pSnap.exists) {
        const payment = PaymentDocSchema.parse(pSnap.data());
        const iSnap = await this.firestore
          .doc(firestorePaths.invoice(input.tenantId, payment.invoiceId))
          .get();
        return {
          payment,
          invoice: InvoiceDocSchema.parse(iSnap.data()),
          deduplicated: true,
        };
      }
    }

    const [periodId, accounts, methodsMap] = await Promise.all([
      this.resolveOpenPeriod(input.tenantId, todayDate),
      this.resolvePosAccounts(input.tenantId),
      this.getEnabledPaymentMethodsMap(input.tenantId),
    ]);

    const cfg = methodsMap.get(input.method);
    if (!cfg || !cfg.isEnabled) {
      throw new PosError(
        PosErrorCode.PAYMENT_METHOD_DISABLED,
        `وسيلة الدفع (${input.method}) غير مفعلة لهذه المنشأة.`
      );
    }
    if (cfg.requiresReference && (!input.referenceNumber || input.referenceNumber.trim() === '')) {
      throw new PosError(
        PosErrorCode.INVALID_PAYLOAD,
        `وسيلة الدفع (${cfg.labelAr}) تتطلب إدخال رقم مرجعي للعملية.`
      );
    }

    const invoiceRef = this.firestore.doc(firestorePaths.invoice(input.tenantId, input.invoiceId));
    const payRef = this.firestore.collection(firestorePaths.payments(input.tenantId)).doc();
    const outboxRef = this.firestore
      .collection(firestorePaths.posAccountingOutbox(input.tenantId))
      .doc();
    const auditRef = this.firestore.collection(firestorePaths.posAuditTrail(input.tenantId)).doc();

    let createdOutbox: PosAccountingOutboxDoc | null = null;

    const txRes = await this.firestore.runTransaction(async (transaction) => {
      const [idemSnap, invoiceSnap] = await Promise.all([
        transaction.get(idemRef),
        transaction.get(invoiceRef),
      ]);

      if (!invoiceSnap.exists) {
        throw new PosError(PosErrorCode.NOT_FOUND, 'الفاتورة غير موجودة.');
      }
      const invoice = InvoiceDocSchema.parse(invoiceSnap.data());
      this.verifyBranchAccess(actor, invoice.branchId);

      if (idemSnap.exists) {
        const pId = idemSnap.data()?.paymentId as string;
        const pSnap = await transaction.get(
          this.firestore.doc(firestorePaths.payment(input.tenantId, pId))
        );
        if (pSnap.exists) {
          return {
            payment: PaymentDocSchema.parse(pSnap.data()),
            invoice,
            deduplicated: true,
          };
        }
      }

      if (invoice.status !== 'ISSUED' && invoice.status !== 'PARTIALLY_PAID') {
        throw new PosError(
          PosErrorCode.INVOICE_STATE_INVALID,
          `لا يمكن تحصيل دفعات لفاتورة في حالة (${invoice.status}).`
        );
      }

      if (input.amountHalalas > invoice.balanceDueHalalas) {
        throw new PosError(
          PosErrorCode.OVERPAYMENT,
          'مبلغ الدفعة يتجاوز الرصيد المتبقي على الفاتورة.'
        );
      }

      if (input.method === 'CASH' && !input.sessionId) {
        throw new PosError(
          PosErrorCode.SESSION_NOT_OPEN,
          'يتطلب الدفع النقدي (كاش) وجود جلسة صندوق مفتوحة.'
        );
      }

      let session: PosSessionDoc | null = null;
      const sessionRef = input.sessionId
        ? this.firestore.doc(firestorePaths.posSession(input.tenantId, input.sessionId))
        : null;
      if (sessionRef) {
        const sSnap = await transaction.get(sessionRef);
        if (!sSnap.exists) {
          throw new PosError(PosErrorCode.SESSION_NOT_OPEN, 'جلسة الصندوق غير موجودة.');
        }
        session = PosSessionDocSchema.parse(sSnap.data());
        if (session.branchId !== invoice.branchId || session.status !== 'OPEN') {
          throw new PosError(
            PosErrorCode.SESSION_NOT_OPEN,
            'جلسة الصندوق مغلقة أو لا تتبع فرع الفاتورة.'
          );
        }
      }

      const nowIso = new Date().toISOString();
      const paidAmountHalalas = invoice.paidAmountHalalas + input.amountHalalas;
      const balanceDueHalalas = invoice.totalAmountHalalas - paidAmountHalalas;
      const nextStatus = balanceDueHalalas === 0 ? 'PAID' : 'PARTIALLY_PAID';
      const nextPayStatus = balanceDueHalalas === 0 ? 'PAID' : 'PARTIAL';

      const updatedInvoice = InvoiceDocSchema.parse({
        ...invoice,
        paidAmountHalalas,
        balanceDueHalalas,
        status: nextStatus,
        paymentStatus: nextPayStatus,
        updatedAt: nowIso,
      });

      const paymentDoc = PaymentDocSchema.parse({
        id: payRef.id,
        tenantId: input.tenantId,
        branchId: invoice.branchId,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        saleId: invoice.saleId,
        sessionId: input.sessionId || null,
        amountHalalas: input.amountHalalas,
        method: input.method,
        status: 'RECORDED',
        referenceNumber: input.referenceNumber || null,
        cashierAttestation:
          input.cashierAttestation?.trim() ||
          `إقرار الكاشير باستلام مبلغ ${input.amountHalalas / 100} ريال (${input.method})`,
        refundedAmountHalalas: 0,
        receivedAt: nowIso,
        recordedBy: actorUid,
        idempotencyKey: input.idempotencyKey,
        journalEntryId: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      transaction.set(invoiceRef, updatedInvoice);
      transaction.set(payRef, paymentDoc);
      transaction.set(idemRef, {
        id: input.idempotencyKey,
        paymentId: paymentDoc.id,
        createdAt: nowIso,
      });

      if (session && sessionRef) {
        if (input.method === 'CASH') {
          const mvRef = this.firestore
            .collection(firestorePaths.posCashMovements(input.tenantId))
            .doc();
          transaction.set(
            mvRef,
            CashMovementDocSchema.parse({
              id: mvRef.id,
              tenantId: input.tenantId,
              branchId: invoice.branchId,
              sessionId: session.id,
              type: 'CASH_SALE',
              amountHalalas: input.amountHalalas,
              referenceId: paymentDoc.id,
              reason: `تحصيل نقدي فاتورة ${invoice.invoiceNumber}`,
              idempotencyKey: `cash_sale_${paymentDoc.id}`,
              actorUid,
              createdAt: nowIso,
            })
          );
          const nextCashSales = session.cashSalesHalalas + input.amountHalalas;
          const nextExpected = calculateExpectedCashHalalas({
            ...session,
            cashSalesHalalas: nextCashSales,
          });
          transaction.set(
            sessionRef,
            PosSessionDocSchema.parse({
              ...session,
              cashSalesHalalas: nextCashSales,
              expectedCashHalalas: nextExpected,
              updatedAt: nowIso,
            })
          );
        } else {
          transaction.set(
            sessionRef,
            PosSessionDocSchema.parse({
              ...session,
              nonCashSalesHalalas: session.nonCashSalesHalalas + input.amountHalalas,
              updatedAt: nowIso,
            })
          );
        }
      }

      createdOutbox = PosAccountingOutboxDocSchema.parse({
        id: outboxRef.id,
        tenantId: input.tenantId,
        eventType: 'PAYMENT_RECORDED',
        sourceId: paymentDoc.id,
        entryDate: todayDate,
        periodId,
        descriptionAr: `تحصيل دفعة (${paymentDoc.method}) لفاتورة ${invoice.invoiceNumber}`,
        status: 'PENDING',
        journalEntryId: null,
        errorMessage: null,
        createdAt: nowIso,
        postedAt: null,
      });
      transaction.set(outboxRef, createdOutbox);

      transaction.set(
        auditRef,
        PosAuditDocSchema.parse({
          id: auditRef.id,
          tenantId: input.tenantId,
          branchId: invoice.branchId,
          action: 'PAYMENT_RECORDED',
          entityType: 'PAYMENT',
          entityId: paymentDoc.id,
          actorUid,
          idempotencyKey: input.idempotencyKey,
          details: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            method: paymentDoc.method,
            amountHalalas: paymentDoc.amountHalalas,
          },
          timestamp: nowIso,
        })
      );

      return { payment: paymentDoc, invoice: updatedInvoice, deduplicated: false };
    });

    if (!txRes.deduplicated && createdOutbox) {
      const jId = await this.flushOutboxEntry(
        input.tenantId,
        createdOutbox,
        this.buildPaymentLines(txRes.payment, accounts),
        actorUid,
        firestorePaths.payment(input.tenantId, txRes.payment.id)
      );
      if (jId) txRes.payment.journalEntryId = jId;
    }

    return txRes;
  }

  /**
   * Records a partial or full refund against a recorded payment while preserving payment history
   * and posting an accounting reversal journal.
   */
  async recordRefund(
    actor: PosActor,
    rawInput: RecordRefundInput
  ): Promise<{ refund: RefundDoc; invoice: InvoiceDoc; payment: PaymentDoc; deduplicated: boolean }> {
    this.verifyPermission(actor, 'refunds.record');

    const parseRes = RecordRefundInputSchema.safeParse(rawInput);
    if (!parseRes.success) {
      throw new PosError(
        PosErrorCode.INVALID_PAYLOAD,
        `بيانات الاسترداد غير صالحة: ${parseRes.error.issues[0]?.message || parseRes.error.message}`,
        parseRes.error
      );
    }
    const input = parseRes.data;
    const actorUid = this.getActorUid(actor);
    const todayDate = getCurrentRiyadhDate();

    const idemRef = this.firestore.doc(
      firestorePaths.refundIdempotency(input.tenantId, input.idempotencyKey)
    );
    const earlyIdem = await idemRef.get();
    if (earlyIdem.exists) {
      const refundId = earlyIdem.data()?.refundId as string;
      const rSnap = await this.firestore
        .doc(firestorePaths.refund(input.tenantId, refundId))
        .get();
      if (rSnap.exists) {
        const refund = RefundDocSchema.parse(rSnap.data());
        const [pSnap, iSnap] = await Promise.all([
          this.firestore.doc(firestorePaths.payment(input.tenantId, refund.paymentId)).get(),
          this.firestore.doc(firestorePaths.invoice(input.tenantId, refund.invoiceId)).get(),
        ]);
        return {
          refund,
          payment: PaymentDocSchema.parse(pSnap.data()),
          invoice: InvoiceDocSchema.parse(iSnap.data()),
          deduplicated: true,
        };
      }
    }

    const [periodId, accounts] = await Promise.all([
      this.resolveOpenPeriod(input.tenantId, todayDate),
      this.resolvePosAccounts(input.tenantId),
    ]);

    const paymentRef = this.firestore.doc(firestorePaths.payment(input.tenantId, input.paymentId));
    const refundRef = this.firestore.collection(firestorePaths.refunds(input.tenantId)).doc();
    const outboxRef = this.firestore
      .collection(firestorePaths.posAccountingOutbox(input.tenantId))
      .doc();
    const auditRef = this.firestore.collection(firestorePaths.posAuditTrail(input.tenantId)).doc();

    let createdOutbox: PosAccountingOutboxDoc | null = null;

    const txRes = await this.firestore.runTransaction(async (transaction) => {
      const [idemSnap, paymentSnap] = await Promise.all([
        transaction.get(idemRef),
        transaction.get(paymentRef),
      ]);

      if (!paymentSnap.exists) {
        throw new PosError(PosErrorCode.NOT_FOUND, 'الدفعة الأصلية غير موجودة.');
      }
      const payment = PaymentDocSchema.parse(paymentSnap.data());
      this.verifyBranchAccess(actor, payment.branchId);

      const invoiceRef = this.firestore.doc(
        firestorePaths.invoice(input.tenantId, payment.invoiceId)
      );
      const invoiceSnap = await transaction.get(invoiceRef);
      if (!invoiceSnap.exists) {
        throw new PosError(PosErrorCode.NOT_FOUND, 'الفاتورة المرتبطة غير موجودة.');
      }
      const invoice = InvoiceDocSchema.parse(invoiceSnap.data());

      if (idemSnap.exists) {
        const refundId = idemSnap.data()?.refundId as string;
        const rSnap = await transaction.get(
          this.firestore.doc(firestorePaths.refund(input.tenantId, refundId))
        );
        if (rSnap.exists) {
          return {
            refund: RefundDocSchema.parse(rSnap.data()),
            payment,
            invoice,
            deduplicated: true,
          };
        }
      }

      if (payment.status !== 'RECORDED') {
        throw new PosError(
          PosErrorCode.INVOICE_STATE_INVALID,
          'لا يمكن استرداد دفعة غير مسجلة.'
        );
      }

      const refundableOnPayment = payment.amountHalalas - payment.refundedAmountHalalas;
      if (input.amountHalalas > refundableOnPayment) {
        throw new PosError(
          PosErrorCode.OVER_REFUND,
          'مبلغ الاسترداد يتجاوز المبلغ القابل للاسترداد من هذه الدفعة.'
        );
      }

      if (payment.method === 'CASH' && !input.sessionId) {
        throw new PosError(
          PosErrorCode.SESSION_NOT_OPEN,
          'يتطلب الاسترداد النقدي (كاش) وجود جلسة صندوق مفتوحة.'
        );
      }

      let session: PosSessionDoc | null = null;
      const sessionRef = input.sessionId
        ? this.firestore.doc(firestorePaths.posSession(input.tenantId, input.sessionId))
        : null;
      if (sessionRef) {
        const sSnap = await transaction.get(sessionRef);
        if (!sSnap.exists) {
          throw new PosError(PosErrorCode.SESSION_NOT_OPEN, 'جلسة الصندوق غير موجودة.');
        }
        session = PosSessionDocSchema.parse(sSnap.data());
        if (session.branchId !== payment.branchId || session.status !== 'OPEN') {
          throw new PosError(
            PosErrorCode.SESSION_NOT_OPEN,
            'جلسة الصندوق مغلقة أو لا تتبع فرع الفاتورة.'
          );
        }
      }

      const nowIso = new Date().toISOString();
      const nextPaymentRefunded = payment.refundedAmountHalalas + input.amountHalalas;
      const updatedPayment = PaymentDocSchema.parse({
        ...payment,
        refundedAmountHalalas: nextPaymentRefunded,
        updatedAt: nowIso,
      });

      const nextInvoiceRefunded = invoice.refundedAmountHalalas + input.amountHalalas;
      const isFullyRefunded = nextInvoiceRefunded >= invoice.paidAmountHalalas;
      const updatedInvoice = InvoiceDocSchema.parse({
        ...invoice,
        refundedAmountHalalas: nextInvoiceRefunded,
        status: isFullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        paymentStatus: isFullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        updatedAt: nowIso,
      });

      const refundDoc = RefundDocSchema.parse({
        id: refundRef.id,
        tenantId: input.tenantId,
        branchId: payment.branchId,
        paymentId: payment.id,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        sessionId: input.sessionId || null,
        amountHalalas: input.amountHalalas,
        method: payment.method,
        reason: input.reason.trim(),
        idempotencyKey: input.idempotencyKey,
        journalEntryId: null,
        recordedBy: actorUid,
        recordedAt: nowIso,
        createdAt: nowIso,
      });

      transaction.set(paymentRef, updatedPayment);
      transaction.set(invoiceRef, updatedInvoice);
      transaction.set(refundRef, refundDoc);
      transaction.set(idemRef, {
        id: input.idempotencyKey,
        refundId: refundDoc.id,
        createdAt: nowIso,
      });

      if (session && sessionRef) {
        if (payment.method === 'CASH') {
          const mvRef = this.firestore
            .collection(firestorePaths.posCashMovements(input.tenantId))
            .doc();
          transaction.set(
            mvRef,
            CashMovementDocSchema.parse({
              id: mvRef.id,
              tenantId: input.tenantId,
              branchId: payment.branchId,
              sessionId: session.id,
              type: 'CASH_REFUND',
              amountHalalas: input.amountHalalas,
              referenceId: refundDoc.id,
              reason: `استرداد نقدي فاتورة ${invoice.invoiceNumber}: ${input.reason.trim()}`,
              idempotencyKey: `cash_ref_${refundDoc.id}`,
              actorUid,
              createdAt: nowIso,
            })
          );
          const nextCashRefunds = session.cashRefundsHalalas + input.amountHalalas;
          const nextExpected = calculateExpectedCashHalalas({
            ...session,
            cashRefundsHalalas: nextCashRefunds,
          });
          transaction.set(
            sessionRef,
            PosSessionDocSchema.parse({
              ...session,
              cashRefundsHalalas: nextCashRefunds,
              expectedCashHalalas: nextExpected,
              updatedAt: nowIso,
            })
          );
        } else {
          transaction.set(
            sessionRef,
            PosSessionDocSchema.parse({
              ...session,
              nonCashRefundsHalalas: session.nonCashRefundsHalalas + input.amountHalalas,
              updatedAt: nowIso,
            })
          );
        }
      }

      createdOutbox = PosAccountingOutboxDocSchema.parse({
        id: outboxRef.id,
        tenantId: input.tenantId,
        eventType: 'REFUND_RECORDED',
        sourceId: refundDoc.id,
        entryDate: todayDate,
        periodId,
        descriptionAr: `استرداد (${payment.method}) للفاتورة ${invoice.invoiceNumber}`,
        status: 'PENDING',
        journalEntryId: null,
        errorMessage: null,
        createdAt: nowIso,
        postedAt: null,
      });
      transaction.set(outboxRef, createdOutbox);

      transaction.set(
        auditRef,
        PosAuditDocSchema.parse({
          id: auditRef.id,
          tenantId: input.tenantId,
          branchId: payment.branchId,
          action: 'REFUND_CREATED',
          entityType: 'REFUND',
          entityId: refundDoc.id,
          actorUid,
          idempotencyKey: input.idempotencyKey,
          details: {
            paymentId: payment.id,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            amountHalalas: refundDoc.amountHalalas,
            method: refundDoc.method,
          },
          timestamp: nowIso,
        })
      );

      return {
        refund: refundDoc,
        payment: updatedPayment,
        invoice: updatedInvoice,
        deduplicated: false,
      };
    });

    if (!txRes.deduplicated && createdOutbox) {
      const jId = await this.flushOutboxEntry(
        input.tenantId,
        createdOutbox,
        this.buildRefundLines(txRes.refund, txRes.invoice, accounts),
        actorUid,
        firestorePaths.refund(input.tenantId, txRes.refund.id)
      );
      if (jId) txRes.refund.journalEntryId = jId;
    }

    return txRes;
  }

  /**
   * Voids an unpaid ISSUED invoice and reverses its accounting journal entry.
   * Invoices with recorded payments must be refunded instead of voided.
   */
  async voidInvoice(
    actor: PosActor,
    input: {
      tenantId: string;
      invoiceId: string;
      reason: string;
    }
  ): Promise<InvoiceDoc> {
    this.verifyPermission(actor, 'invoices.void');
    if (!input.reason || input.reason.trim().length < 3) {
      throw new PosError(PosErrorCode.INVALID_PAYLOAD, 'يجب إدخال سبب واضح لإلغاء الفاتورة.');
    }

    const actorUid = this.getActorUid(actor);
    const todayDate = getCurrentRiyadhDate();
    await this.resolveOpenPeriod(input.tenantId, todayDate);

    const invoiceRef = this.firestore.doc(firestorePaths.invoice(input.tenantId, input.invoiceId));
    const auditRef = this.firestore.collection(firestorePaths.posAuditTrail(input.tenantId)).doc();

    const { voidedInvoice, journalEntryIdToReverse } = await this.firestore.runTransaction(
      async (transaction) => {
        const snap = await transaction.get(invoiceRef);
        if (!snap.exists) {
          throw new PosError(PosErrorCode.NOT_FOUND, 'الفاتورة غير موجودة.');
        }
        const invoice = InvoiceDocSchema.parse(snap.data());
        this.verifyBranchAccess(actor, invoice.branchId);

        if (invoice.status === 'VOIDED') {
          return { voidedInvoice: invoice, journalEntryIdToReverse: null };
        }
        if (invoice.paidAmountHalalas > 0) {
          throw new PosError(
            PosErrorCode.INVOICE_STATE_INVALID,
            'لا يمكن إلغاء فاتورة تحتوي على مدفوعات مسجلة؛ يجب تنفيذ استرداد أولاً.'
          );
        }
        if (invoice.status !== 'ISSUED') {
          throw new PosError(
            PosErrorCode.INVOICE_STATE_INVALID,
            `لا يمكن إلغاء فاتورة في حالة (${invoice.status}).`
          );
        }

        const nowIso = new Date().toISOString();
        const updated = InvoiceDocSchema.parse({
          ...invoice,
          status: 'VOIDED',
          balanceDueHalalas: 0,
          voidReason: input.reason.trim(),
          voidedAt: nowIso,
          voidedBy: actorUid,
          updatedAt: nowIso,
        });

        transaction.set(invoiceRef, updated);
        transaction.update(
          this.firestore.doc(firestorePaths.posSale(input.tenantId, invoice.saleId)),
          { status: 'VOIDED', updatedAt: nowIso }
        );
        if (invoice.bookingId) {
          transaction.delete(
            this.firestore.doc(firestorePaths.posBookingLock(input.tenantId, invoice.bookingId))
          );
        }
        transaction.set(
          auditRef,
          PosAuditDocSchema.parse({
            id: auditRef.id,
            tenantId: input.tenantId,
            branchId: invoice.branchId,
            action: 'INVOICE_VOIDED',
            entityType: 'INVOICE',
            entityId: invoice.id,
            actorUid,
            idempotencyKey: null,
            details: {
              invoiceNumber: invoice.invoiceNumber,
              reason: input.reason.trim(),
            },
            timestamp: nowIso,
          })
        );

        return {
          voidedInvoice: updated,
          journalEntryIdToReverse: invoice.journalEntryId,
        };
      }
    );

    if (journalEntryIdToReverse) {
      await this.accountingRepo.reverseJournalEntry(
        input.tenantId,
        journalEntryIdToReverse,
        actorUid,
        `إلغاء فاتورة ${voidedInvoice.invoiceNumber}: ${input.reason.trim()}`
      );
      const revAuditRef = this.firestore.collection(firestorePaths.posAuditTrail(input.tenantId)).doc();
      await revAuditRef.set(
        PosAuditDocSchema.parse({
          id: revAuditRef.id,
          tenantId: input.tenantId,
          branchId: voidedInvoice.branchId,
          action: 'ACCOUNTING_JOURNAL_REVERSED',
          entityType: 'JOURNAL_ENTRY',
          entityId: journalEntryIdToReverse,
          actorUid,
          idempotencyKey: null,
          details: { invoiceId: voidedInvoice.id, invoiceNumber: voidedInvoice.invoiceNumber },
          timestamp: new Date().toISOString(),
        })
      );
    }

    return voidedInvoice;
  }

  // ============================================================================
  // Read Queries
  // ============================================================================

  async listInvoices(
    actor: PosActor,
    tenantId: string,
    filters?: { branchId?: string; status?: InvoiceDoc['status']; limit?: number }
  ): Promise<InvoiceDoc[]> {
    this.verifyPermission(actor, 'invoices.read');
    if (filters?.branchId) this.verifyBranchAccess(actor, filters.branchId);

    let query: any = this.firestore.collection(firestorePaths.invoices(tenantId));
    if (filters?.branchId) query = query.where('branchId', '==', filters.branchId);
    if (filters?.status) query = query.where('status', '==', filters.status);
    query = query.orderBy('issuedAt', 'desc').limit(filters?.limit || 100);

    const snap = await query.get();
    let results = snap.docs.map((d: any) => InvoiceDocSchema.parse(d.data()));
    if (
      !TrustedSystemContext.isTrusted(actor) &&
      !actor.isPlatformAdmin &&
      actor.role !== 'OWNER' &&
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0
    ) {
      const allowed = new Set(actor.assignedBranchIds);
      results = results.filter((inv: InvoiceDoc) => allowed.has(inv.branchId));
    }
    return results;
  }

  async getInvoiceById(
    actor: PosActor,
    tenantId: string,
    invoiceId: string
  ): Promise<InvoiceDoc | null> {
    this.verifyPermission(actor, 'invoices.read');
    const snap = await this.firestore.doc(firestorePaths.invoice(tenantId, invoiceId)).get();
    if (!snap.exists) return null;
    const inv = InvoiceDocSchema.parse(snap.data());
    this.verifyBranchAccess(actor, inv.branchId);
    return inv;
  }

  async listPayments(
    actor: PosActor,
    tenantId: string,
    filters?: { invoiceId?: string; branchId?: string; limit?: number }
  ): Promise<PaymentDoc[]> {
    this.verifyPermission(actor, 'payments.read');
    if (filters?.branchId) this.verifyBranchAccess(actor, filters.branchId);

    let query: any = this.firestore.collection(firestorePaths.payments(tenantId));
    if (filters?.invoiceId) query = query.where('invoiceId', '==', filters.invoiceId);
    if (filters?.branchId) query = query.where('branchId', '==', filters.branchId);
    query = query.orderBy('receivedAt', 'desc').limit(filters?.limit || 100);

    const snap = await query.get();
    let results = snap.docs.map((d: any) => PaymentDocSchema.parse(d.data()));
    if (
      !TrustedSystemContext.isTrusted(actor) &&
      !actor.isPlatformAdmin &&
      actor.role !== 'OWNER' &&
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0
    ) {
      const allowed = new Set(actor.assignedBranchIds);
      results = results.filter((p: PaymentDoc) => allowed.has(p.branchId));
    }
    return results;
  }

  async listRefundsForInvoice(
    actor: PosActor,
    tenantId: string,
    invoiceId: string
  ): Promise<RefundDoc[]> {
    this.verifyPermission(actor, 'payments.read');
    const snap = await this.firestore
      .collection(firestorePaths.refunds(tenantId))
      .where('invoiceId', '==', invoiceId)
      .orderBy('recordedAt', 'desc')
      .get();
    return snap.docs.map((d) => RefundDocSchema.parse(d.data()));
  }

  async isBookingBilled(tenantId: string, bookingId: string): Promise<boolean> {
    const snap = await this.firestore
      .doc(firestorePaths.posBookingLock(tenantId, bookingId))
      .get();
    return snap.exists && snap.data()?.status === 'BILLED';
  }

  /**
   * Phase 4.3 POS Product Return:
   * - Validates original invoice, product line item, and remaining returnable quantity.
   * - Restocks sellable returned units via SALE_RETURN at original unitCostHalalas and reverses COGS (DR 1040 / CR 5020).
   * - Records damaged returned units separately without inflating sellable stock.
   */
  async returnSaleProduct(
    actor: PosActor,
    input: {
      tenantId: string;
      invoiceId: string;
      lineId: string;
      sellableQuantity: number;
      damagedQuantity?: number;
      reason: string;
      idempotencyKey: string;
    }
  ): Promise<{ invoice: InvoiceDoc; sellableMovementId: string | null; damagedAuditId: string | null }> {
    this.verifyPermission(actor, 'refunds.record');
    const damagedQty = input.damagedQuantity ?? 0;
    const totalReturnQty = input.sellableQuantity + damagedQty;
    if (
      !Number.isInteger(input.sellableQuantity) ||
      input.sellableQuantity < 0 ||
      !Number.isInteger(damagedQty) ||
      damagedQty < 0 ||
      totalReturnQty <= 0
    ) {
      throw new PosError(PosErrorCode.INVALID_PAYLOAD, 'كميات الإرجاع غير صالحة.');
    }

    const actorUid = this.getActorUid(actor);
    const entryDate = getCurrentRiyadhDate();
    const periodId = await this.resolveOpenPeriod(input.tenantId, entryDate);
    const accounts = await this.resolvePosAccounts(input.tenantId, true);
    const invRef = this.firestore.doc(firestorePaths.invoice(input.tenantId, input.invoiceId));

    let outboxIdToFlush: string | null = null;

    const res = await this.firestore.runTransaction(async (tx) => {
      const invSnap = await tx.get(invRef);
      if (!invSnap.exists) {
        throw new PosError(PosErrorCode.NOT_FOUND, 'الفاتورة غير موجودة.');
      }
      const invoice = InvoiceDocSchema.parse(invSnap.data());
      this.verifyBranchAccess(actor, invoice.branchId);
      if (invoice.status === 'VOIDED') {
        throw new PosError(PosErrorCode.INVOICE_STATE_INVALID, 'لا يمكن إرجاع منتجات من فاتورة ملغاة.');
      }

      const lineIdx = invoice.lineItems.findIndex((l) => l.lineId === input.lineId);
      if (lineIdx === -1) {
        throw new PosError(PosErrorCode.NOT_FOUND, 'البند غير موجود في الفاتورة.');
      }
      const line = invoice.lineItems[lineIdx]!;
      if (line.itemType !== 'PRODUCT' || !line.productId) {
        throw new PosError(PosErrorCode.INVALID_PAYLOAD, 'هذا البند ليس منتجاً مخزنياً.');
      }
      const remainingQty = line.quantity - (line.returnedQuantity || 0);
      if (totalReturnQty > remainingQty) {
        throw new PosError(
          PosErrorCode.OVER_REFUND,
          `الكمية المرتجعة (${totalReturnQty}) تتجاوز الكمية المتبقية القابلة للإرجاع (${remainingQty}).`
        );
      }

      const prodSnap = await tx.get(
        this.firestore.doc(firestorePaths.product(input.tenantId, line.productId))
      );
      const prod = ProductDocSchema.parse(prodSnap.data());
      const nowIso = new Date().toISOString();

      let sellableMovementId: string | null = null;
      if (input.sellableQuantity > 0 && prod.stockTrackingEnabled) {
        const moved = await this.inventoryRepo.applyStockMovementInTx(tx, {
          tenantId: input.tenantId,
          branchId: invoice.branchId,
          product: prod,
          movementType: 'SALE_RETURN',
          direction: 'IN',
          quantity: input.sellableQuantity,
          unitCostHalalas: line.unitCostHalalas || prod.purchaseCostHalalas,
          relatedDocumentType: 'INVOICE_RETURN',
          relatedDocumentId: invoice.id,
          reason: `مرتجع مبيعات صالح لإعادة البيع (${invoice.invoiceNumber}): ${input.reason}`,
          idempotencyKey: `sale_ret_${input.idempotencyKey}_${line.lineId}`,
          actorUid,
          nowIso,
        });
        sellableMovementId = moved.movement.id;

        if (moved.movement.totalCostHalalas > 0 && accounts.inventory && accounts.cogsRetail) {
          const outboxRef = this.firestore
            .collection(firestorePaths.inventoryAccountingOutbox(input.tenantId))
            .doc();
          const { InventoryAccountingOutboxDocSchema } = await import('../../inventory.schema');
          tx.set(
            outboxRef,
            InventoryAccountingOutboxDocSchema.parse({
              id: outboxRef.id,
              tenantId: input.tenantId,
              eventType: 'PRODUCT_RETURN_COGS',
              sourceId: invoice.id,
              entryDate,
              periodId,
              descriptionAr: `عكس تكلفة بضاعة مرتجعة - فاتورة ${invoice.invoiceNumber}`,
              lines: [
                {
                  accountId: accounts.inventory.id,
                  accountCode: accounts.inventory.code,
                  accountNameAr: accounts.inventory.nameAr,
                  debitHalalas: moved.movement.totalCostHalalas,
                  creditHalalas: 0,
                  descriptionAr: `إعادة للمخزون (${prod.nameAr})`,
                  branchId: invoice.branchId,
                },
                {
                  accountId: accounts.cogsRetail.id,
                  accountCode: accounts.cogsRetail.code,
                  accountNameAr: accounts.cogsRetail.nameAr,
                  debitHalalas: 0,
                  creditHalalas: moved.movement.totalCostHalalas,
                  descriptionAr: `عكس تكلفة المبيعات (${prod.nameAr})`,
                  branchId: invoice.branchId,
                },
              ],
              status: 'PENDING',
              journalEntryId: null,
              errorMessage: null,
              createdAt: nowIso,
              postedAt: null,
            })
          );
          outboxIdToFlush = outboxRef.id;
        }
      }

      let damagedAuditId: string | null = null;
      if (damagedQty > 0) {
        const { InventoryAuditDocSchema } = await import('../../inventory.schema');
        const auditRef = this.firestore
          .collection(firestorePaths.inventoryAuditTrail(input.tenantId))
          .doc();
        tx.set(
          auditRef,
          InventoryAuditDocSchema.parse({
            id: auditRef.id,
            tenantId: input.tenantId,
            branchId: invoice.branchId,
            action: 'DAMAGED_PRODUCT_RETURNED',
            entityType: 'INVOICE',
            entityId: invoice.id,
            actorUid,
            idempotencyKey: `dmg_ret_${input.idempotencyKey}`,
            details: {
              productId: prod.id,
              damagedQuantity: damagedQty,
              reason: input.reason,
            },
            timestamp: nowIso,
          })
        );
        damagedAuditId = auditRef.id;
      }

      const updatedLines = [...invoice.lineItems];
      updatedLines[lineIdx] = {
        ...line,
        returnedQuantity: (line.returnedQuantity || 0) + totalReturnQty,
      };
      const updatedInvoice = InvoiceDocSchema.parse({
        ...invoice,
        lineItems: updatedLines,
        updatedAt: nowIso,
      });
      tx.set(invRef, updatedInvoice);

      return { invoice: updatedInvoice, sellableMovementId, damagedAuditId };
    });

    if (outboxIdToFlush) {
      await this.inventoryRepo.flushOutboxEntry(actor, input.tenantId, outboxIdToFlush);
    }

    return res;
  }
}

