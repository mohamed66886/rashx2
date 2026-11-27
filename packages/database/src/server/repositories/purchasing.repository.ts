import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import { hasPermission } from '../../permissions';
import { BranchDocSchema } from '../../branch.schema';
import { normalizeSaudiPhoneNumber } from '../../customer.schema';
import { getCurrentRiyadhDate } from '../../availability.types';
import { roundHalfUpBigInt } from '../../service-pricing';
import type { AccountDoc } from '../../accounting.schema';
import {
  GoodsReceiptDocSchema,
  InventoryAccountingOutboxDocSchema,
  InventoryAuditDocSchema,
  ProductDocSchema,
  PurchaseOrderDocSchema,
  SupplierDocSchema,
  SupplierInvoiceDocSchema,
  SupplierPaymentDocSchema,
  type GoodsReceiptDoc,
  type PurchaseOrderDoc,
  type PurchaseOrderLine,
  type PurchaseOrderStatus,
  type SupplierDoc,
  type SupplierInvoiceDoc,
  type SupplierPaymentDoc,
  type SupplierStatus,
} from '../../inventory.schema';
import { AccountingRepository } from './accounting.repository';
import { InventoryRepository, type InventoryActor } from './inventory.repository';
import { TrustedSystemContext } from './trusted-context';

export enum PurchasingErrorCode {
  FORBIDDEN = 'PURCHASING_FORBIDDEN',
  BRANCH_FORBIDDEN = 'PURCHASING_BRANCH_FORBIDDEN',
  NOT_FOUND = 'PURCHASING_NOT_FOUND',
  INVALID_PAYLOAD = 'PURCHASING_INVALID_PAYLOAD',
  STATE_INVALID = 'PURCHASING_STATE_INVALID',
  OVER_RECEIPT = 'PURCHASING_OVER_RECEIPT',
  OVERPAYMENT = 'PURCHASING_OVERPAYMENT',
  FISCAL_PERIOD_CLOSED = 'PURCHASING_FISCAL_PERIOD_CLOSED',
  ACCOUNTING_CONFIG_MISSING = 'PURCHASING_ACCOUNTING_CONFIG_MISSING',
}

export class PurchasingError extends Error {
  constructor(
    public readonly code: PurchasingErrorCode,
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PurchasingError';
  }
}

export class PurchasingRepository {
  private readonly accountingRepo: AccountingRepository;
  private readonly inventoryRepo: InventoryRepository;

  constructor(private readonly firestore: Firestore = getFirebaseAdminFirestore()) {
    this.accountingRepo = new AccountingRepository(firestore);
    this.inventoryRepo = new InventoryRepository(firestore);
  }

  private getActorUid(actor: InventoryActor): string {
    return TrustedSystemContext.isTrusted(actor) ? 'SYSTEM' : actor.uid;
  }

  private verifyPermission(
    actor: InventoryActor,
    capability: Parameters<typeof hasPermission>[1]
  ): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin) return;
    if (!hasPermission(actor.role, capability, actor.customPermissions)) {
      throw new PurchasingError(
        PurchasingErrorCode.FORBIDDEN,
        `غير مصرح: تفتقر إلى الصلاحية المطلوبة (${capability}).`
      );
    }
  }

  private verifyBranchAccess(actor: InventoryActor, branchId: string): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin || actor.role === 'OWNER') return;
    if (
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0 &&
      !actor.assignedBranchIds.includes(branchId)
    ) {
      throw new PurchasingError(
        PurchasingErrorCode.BRANCH_FORBIDDEN,
        'غير مصرح: لا تملك صلاحية الوصول إلى مشتريات هذا الفرع.'
      );
    }
  }

  private redactSupplierIfUnauthorized(actor: InventoryActor, s: SupplierDoc): SupplierDoc {
    if (
      TrustedSystemContext.isTrusted(actor) ||
      actor.isPlatformAdmin ||
      hasPermission(actor.role, 'suppliers.read_notes', actor.customPermissions)
    ) {
      return s;
    }
    return { ...s, privateNotes: '' };
  }

  private async resolveOpenPeriod(tenantId: string, dateStr: string): Promise<string> {
    const period = await this.accountingRepo.resolvePeriodForDate(tenantId, dateStr);
    if (!period || period.status !== 'OPEN') {
      throw new PurchasingError(
        PurchasingErrorCode.FISCAL_PERIOD_CLOSED,
        `الفترة المحاسبية للتاريخ (${dateStr}) مغلقة أو غير معرفة.`
      );
    }
    return period.id;
  }

  private async resolveAccounts(tenantId: string): Promise<{
    cash: AccountDoc;
    bank: AccountDoc;
    inventory: AccountDoc;
    vatInput: AccountDoc;
    accountsPayable: AccountDoc;
  }> {
    const [cash, bank, inventory, vatInput, accountsPayable] = await Promise.all([
      this.accountingRepo.getAccountByCode(tenantId, '1010'),
      this.accountingRepo.getAccountByCode(tenantId, '1020'),
      this.accountingRepo.getAccountByCode(tenantId, '1040'),
      this.accountingRepo.getAccountByCode(tenantId, '1050'),
      this.accountingRepo.getAccountByCode(tenantId, '2010'),
    ]);
    if (!cash || !bank || !inventory || !vatInput || !accountsPayable) {
      throw new PurchasingError(
        PurchasingErrorCode.ACCOUNTING_CONFIG_MISSING,
        'دليل الحسابات غير مكتمل للمشتريات (مطلوب: 1010، 1020، 1040، 1050، 2010).'
      );
    }
    return { cash, bank, inventory, vatInput, accountsPayable };
  }

  // ============================================================================
  // 1. Suppliers Management
  // ============================================================================

  async createSupplier(
    actor: InventoryActor,
    input: {
      tenantId: string;
      name: string;
      contactPerson?: string;
      phone: string;
      email?: string | null;
      address?: string;
      vatNumber?: string | null;
      crNumber?: string | null;
      privateNotes?: string;
    }
  ): Promise<SupplierDoc> {
    this.verifyPermission(actor, 'suppliers.manage');
    const actorUid = this.getActorUid(actor);
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeSaudiPhoneNumber(input.phone);
    } catch (err: any) {
      throw new PurchasingError(
        PurchasingErrorCode.INVALID_PAYLOAD,
        err?.message || 'رقم جوال المورد غير صالح.'
      );
    }

    const canWriteNotes =
      TrustedSystemContext.isTrusted(actor) ||
      actor.isPlatformAdmin ||
      hasPermission(actor.role, 'suppliers.read_notes', actor.customPermissions);

    const ref = this.firestore.collection(firestorePaths.suppliers(input.tenantId)).doc();
    const nowIso = new Date().toISOString();
    const supplier = SupplierDocSchema.parse({
      id: ref.id,
      tenantId: input.tenantId,
      name: input.name.trim(),
      contactPerson: input.contactPerson?.trim() || '',
      normalizedPhone,
      displayPhone: input.phone.trim(),
      email: input.email?.trim() || null,
      address: input.address?.trim() || '',
      vatNumber: input.vatNumber?.trim() || null,
      crNumber: input.crNumber?.trim() || null,
      privateNotes: canWriteNotes ? input.privateNotes?.trim() || '' : '',
      status: 'ACTIVE',
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: actorUid,
      updatedBy: actorUid,
    });

    await ref.set(supplier);
    const auditRef = this.firestore.collection(firestorePaths.inventoryAuditTrail(input.tenantId)).doc();
    await auditRef.set(
      InventoryAuditDocSchema.parse({
        id: auditRef.id,
        tenantId: input.tenantId,
        branchId: null,
        action: 'SUPPLIER_CREATED',
        entityType: 'SUPPLIER',
        entityId: supplier.id,
        actorUid,
        idempotencyKey: null,
        details: { name: supplier.name },
        timestamp: nowIso,
      })
    );

    return this.redactSupplierIfUnauthorized(actor, supplier);
  }

  async updateSupplier(
    actor: InventoryActor,
    input: {
      tenantId: string;
      supplierId: string;
      name?: string;
      contactPerson?: string;
      phone?: string;
      email?: string | null;
      address?: string;
      vatNumber?: string | null;
      crNumber?: string | null;
      privateNotes?: string;
      status?: SupplierStatus;
    }
  ): Promise<SupplierDoc> {
    this.verifyPermission(actor, 'suppliers.manage');
    const actorUid = this.getActorUid(actor);
    const ref = this.firestore.doc(firestorePaths.supplier(input.tenantId, input.supplierId));
    const snap = await ref.get();
    if (!snap.exists) {
      throw new PurchasingError(PurchasingErrorCode.NOT_FOUND, 'المورد غير موجود.');
    }
    const existing = SupplierDocSchema.parse(snap.data());

    let normalizedPhone = existing.normalizedPhone;
    let displayPhone = existing.displayPhone;
    if (input.phone !== undefined) {
      try {
        normalizedPhone = normalizeSaudiPhoneNumber(input.phone);
        displayPhone = input.phone.trim();
      } catch (err: any) {
        throw new PurchasingError(
          PurchasingErrorCode.INVALID_PAYLOAD,
          err?.message || 'رقم جوال المورد غير صالح.'
        );
      }
    }

    const canEditNotes =
      TrustedSystemContext.isTrusted(actor) ||
      actor.isPlatformAdmin ||
      hasPermission(actor.role, 'suppliers.read_notes', actor.customPermissions);

    const nowIso = new Date().toISOString();
    const updated = SupplierDocSchema.parse({
      ...existing,
      name: input.name !== undefined ? input.name.trim() : existing.name,
      contactPerson:
        input.contactPerson !== undefined ? input.contactPerson.trim() : existing.contactPerson,
      normalizedPhone,
      displayPhone,
      email: input.email !== undefined ? input.email?.trim() || null : existing.email,
      address: input.address !== undefined ? input.address.trim() : existing.address,
      vatNumber: input.vatNumber !== undefined ? input.vatNumber?.trim() || null : existing.vatNumber,
      crNumber: input.crNumber !== undefined ? input.crNumber?.trim() || null : existing.crNumber,
      privateNotes:
        canEditNotes && input.privateNotes !== undefined
          ? input.privateNotes.trim()
          : existing.privateNotes,
      status: input.status ?? existing.status,
      updatedAt: nowIso,
      updatedBy: actorUid,
    });

    await ref.set(updated);
    const auditRef = this.firestore.collection(firestorePaths.inventoryAuditTrail(input.tenantId)).doc();
    await auditRef.set(
      InventoryAuditDocSchema.parse({
        id: auditRef.id,
        tenantId: input.tenantId,
        branchId: null,
        action: updated.status === 'ARCHIVED' ? 'SUPPLIER_ARCHIVED' : 'SUPPLIER_UPDATED',
        entityType: 'SUPPLIER',
        entityId: updated.id,
        actorUid,
        idempotencyKey: null,
        details: { status: updated.status },
        timestamp: nowIso,
      })
    );

    return this.redactSupplierIfUnauthorized(actor, updated);
  }

  async getSupplierById(
    actor: InventoryActor,
    tenantId: string,
    supplierId: string
  ): Promise<SupplierDoc | null> {
    this.verifyPermission(actor, 'suppliers.read');
    const snap = await this.firestore.doc(firestorePaths.supplier(tenantId, supplierId)).get();
    if (!snap.exists) return null;
    const s = SupplierDocSchema.parse(snap.data());
    if (s.tenantId !== tenantId) {
      throw new PurchasingError(PurchasingErrorCode.FORBIDDEN, 'وصول غير مصرح عبر المنشآت.');
    }
    return this.redactSupplierIfUnauthorized(actor, s);
  }

  async listSuppliers(
    actor: InventoryActor,
    tenantId: string,
    filters?: { status?: SupplierStatus; search?: string; limit?: number }
  ): Promise<SupplierDoc[]> {
    this.verifyPermission(actor, 'suppliers.read');
    let query: any = this.firestore.collection(firestorePaths.suppliers(tenantId));
    if (filters?.status) query = query.where('status', '==', filters.status);
    const snap = await query.limit(filters?.limit || 150).get();
    let list: SupplierDoc[] = snap.docs.map((d: any) =>
      this.redactSupplierIfUnauthorized(actor, SupplierDocSchema.parse(d.data()))
    );
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.normalizedPhone.includes(q) ||
          s.displayPhone.includes(q)
      );
    }
    return list;
  }

  // ============================================================================
  // 2. Purchase Orders (Lifecycle: DRAFT -> SUBMITTED -> APPROVED -> PARTIALLY_RECEIVED -> RECEIVED | CANCELLED)
  // ============================================================================

  private buildPoLineItems(
    products: Map<string, ReturnType<typeof ProductDocSchema.parse>>,
    items: Array<{
      productId: string;
      orderedQuantity: number;
      unitCostHalalas: number;
      discountHalalas?: number;
      taxRateBps?: number;
    }>
  ): {
    lines: PurchaseOrderLine[];
    subtotalHalalas: number;
    discountTotalHalalas: number;
    taxTotalHalalas: number;
    totalHalalas: number;
  } {
    let subtotalHalalas = 0;
    let discountTotalHalalas = 0;
    let taxTotalHalalas = 0;
    let totalHalalas = 0;

    const lines: PurchaseOrderLine[] = items.map((item, idx) => {
      const prod = products.get(item.productId)!;
      if (!Number.isInteger(item.orderedQuantity) || item.orderedQuantity <= 0) {
        throw new PurchasingError(PurchasingErrorCode.INVALID_PAYLOAD, 'الكمية المطلوبة غير صالحة.');
      }
      if (!Number.isInteger(item.unitCostHalalas) || item.unitCostHalalas < 0) {
        throw new PurchasingError(PurchasingErrorCode.INVALID_PAYLOAD, 'تكلفة الوحدة غير صالحة.');
      }
      const lineGross = item.orderedQuantity * item.unitCostHalalas;
      const discount = item.discountHalalas ?? 0;
      if (!Number.isInteger(discount) || discount < 0 || discount > lineGross) {
        throw new PurchasingError(PurchasingErrorCode.INVALID_PAYLOAD, 'قيمة الخصم غير صالحة.');
      }
      const net = lineGross - discount;
      const taxRateBps = item.taxRateBps ?? 0;
      const tax = Number(roundHalfUpBigInt(BigInt(net) * BigInt(taxRateBps), 10000n));
      const lineTotal = net + tax;

      subtotalHalalas += lineGross;
      discountTotalHalalas += discount;
      taxTotalHalalas += tax;
      totalHalalas += lineTotal;

      return {
        lineId: `poline-${idx + 1}`,
        productId: prod.id,
        skuSnapshot: prod.sku,
        nameArSnapshot: prod.nameAr,
        nameEnSnapshot: prod.nameEn || '',
        unitSnapshot: prod.unit,
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: 0,
        rejectedQuantity: 0,
        unitCostHalalas: item.unitCostHalalas,
        discountHalalas: discount,
        taxRateBps,
        netHalalas: net,
        taxHalalas: tax,
        totalHalalas: lineTotal,
      };
    });

    return { lines, subtotalHalalas, discountTotalHalalas, taxTotalHalalas, totalHalalas };
  }

  async createPurchaseOrder(
    actor: InventoryActor,
    input: {
      tenantId: string;
      branchId: string;
      supplierId: string;
      orderDate?: string;
      expectedDeliveryDate?: string | null;
      notes?: string;
      items: Array<{
        productId: string;
        orderedQuantity: number;
        unitCostHalalas: number;
        discountHalalas?: number;
        taxRateBps?: number;
      }>;
    }
  ): Promise<PurchaseOrderDoc> {
    this.verifyPermission(actor, 'purchase_orders.create');
    this.verifyBranchAccess(actor, input.branchId);
    if (!input.items.length) {
      throw new PurchasingError(
        PurchasingErrorCode.INVALID_PAYLOAD,
        'يجب أن يحتوي أمر الشراء على بند واحد على الأقل.'
      );
    }

    const actorUid = this.getActorUid(actor);
    const orderDate = input.orderDate || getCurrentRiyadhDate();
    const year = orderDate.slice(0, 4);
    const poRef = this.firestore.collection(firestorePaths.purchaseOrders(input.tenantId)).doc();
    const seqRef = this.firestore.doc(firestorePaths.purchaseOrderSequence(input.tenantId, year));

    return await this.firestore.runTransaction(async (tx) => {
      const [branchSnap, supSnap, seqSnap] = await Promise.all([
        tx.get(this.firestore.doc(firestorePaths.branch(input.tenantId, input.branchId))),
        tx.get(this.firestore.doc(firestorePaths.supplier(input.tenantId, input.supplierId))),
        tx.get(seqRef),
      ]);

      if (!branchSnap.exists) {
        throw new PurchasingError(PurchasingErrorCode.NOT_FOUND, 'الفرع غير موجود.');
      }
      if (!supSnap.exists) {
        throw new PurchasingError(PurchasingErrorCode.NOT_FOUND, 'المورد غير موجود.');
      }
      const branch = BranchDocSchema.parse(branchSnap.data());
      const supplier = SupplierDocSchema.parse(supSnap.data());
      if (supplier.status !== 'ACTIVE') {
        throw new PurchasingError(PurchasingErrorCode.INVALID_PAYLOAD, 'المورد غير نشط.');
      }

      const prodMap = new Map<string, ReturnType<typeof ProductDocSchema.parse>>();
      for (const item of input.items) {
        if (!prodMap.has(item.productId)) {
          const pSnap = await tx.get(
            this.firestore.doc(firestorePaths.product(input.tenantId, item.productId))
          );
          if (!pSnap.exists) {
            throw new PurchasingError(PurchasingErrorCode.NOT_FOUND, 'أحد المنتجات غير موجود.');
          }
          const prod = ProductDocSchema.parse(pSnap.data());
          if (prod.status === 'ARCHIVED') {
            throw new PurchasingError(
              PurchasingErrorCode.INVALID_PAYLOAD,
              `المنتج (${prod.nameAr}) مؤرشف ولا يمكن طلبه.`
            );
          }
          prodMap.set(prod.id, prod);
        }
      }

      const nextSeq = ((seqSnap.exists ? (seqSnap.data()?.lastSeq as number) : 0) || 0) + 1;
      const poNumber = `PO-${year}-${String(nextSeq).padStart(5, '0')}`;
      const built = this.buildPoLineItems(prodMap, input.items);
      const nowIso = new Date().toISOString();

      const po = PurchaseOrderDocSchema.parse({
        id: poRef.id,
        poNumber,
        tenantId: input.tenantId,
        branchId: branch.id,
        branchNameSnapshot: branch.name,
        supplierId: supplier.id,
        supplierNameSnapshot: supplier.name,
        orderDate,
        expectedDeliveryDate: input.expectedDeliveryDate || null,
        currency: 'SAR',
        lineItems: built.lines,
        subtotalHalalas: built.subtotalHalalas,
        discountTotalHalalas: built.discountTotalHalalas,
        taxTotalHalalas: built.taxTotalHalalas,
        totalHalalas: built.totalHalalas,
        status: 'DRAFT',
        notes: input.notes?.trim() || '',
        createdBy: actorUid,
        submittedBy: null,
        submittedAt: null,
        approvedBy: null,
        approvedAt: null,
        cancelledBy: null,
        cancelledAt: null,
        cancelReason: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      tx.set(seqRef, { year, lastSeq: nextSeq, updatedAt: nowIso });
      tx.set(poRef, po);
      return po;
    });
  }

  async submitPurchaseOrder(
    actor: InventoryActor,
    input: { tenantId: string; purchaseOrderId: string }
  ): Promise<PurchaseOrderDoc> {
    this.verifyPermission(actor, 'purchase_orders.submit');
    const actorUid = this.getActorUid(actor);
    const ref = this.firestore.doc(
      firestorePaths.purchaseOrder(input.tenantId, input.purchaseOrderId)
    );
    const snap = await ref.get();
    if (!snap.exists) {
      throw new PurchasingError(PurchasingErrorCode.NOT_FOUND, 'أمر الشراء غير موجود.');
    }
    const po = PurchaseOrderDocSchema.parse(snap.data());
    this.verifyBranchAccess(actor, po.branchId);
    if (po.status !== 'DRAFT') {
      throw new PurchasingError(PurchasingErrorCode.STATE_INVALID, 'يمكن تقديم المسودات فقط.');
    }
    const nowIso = new Date().toISOString();
    const updated = PurchaseOrderDocSchema.parse({
      ...po,
      status: 'SUBMITTED',
      submittedBy: actorUid,
      submittedAt: nowIso,
      updatedAt: nowIso,
    });
    await ref.set(updated);
    return updated;
  }

  async approvePurchaseOrder(
    actor: InventoryActor,
    input: { tenantId: string; purchaseOrderId: string }
  ): Promise<PurchaseOrderDoc> {
    this.verifyPermission(actor, 'purchase_orders.approve');
    const actorUid = this.getActorUid(actor);
    const ref = this.firestore.doc(
      firestorePaths.purchaseOrder(input.tenantId, input.purchaseOrderId)
    );
    const snap = await ref.get();
    if (!snap.exists) {
      throw new PurchasingError(PurchasingErrorCode.NOT_FOUND, 'أمر الشراء غير موجود.');
    }
    const po = PurchaseOrderDocSchema.parse(snap.data());
    if (po.status !== 'SUBMITTED') {
      throw new PurchasingError(
        PurchasingErrorCode.STATE_INVALID,
        'يجب تقديم أمر الشراء أولاً قبل اعتماده.'
      );
    }
    const nowIso = new Date().toISOString();
    const updated = PurchaseOrderDocSchema.parse({
      ...po,
      status: 'APPROVED',
      approvedBy: actorUid,
      approvedAt: nowIso,
      updatedAt: nowIso,
    });
    await ref.set(updated);

    const auditRef = this.firestore.collection(firestorePaths.inventoryAuditTrail(input.tenantId)).doc();
    await auditRef.set(
      InventoryAuditDocSchema.parse({
        id: auditRef.id,
        tenantId: input.tenantId,
        branchId: po.branchId,
        action: 'PURCHASE_ORDER_APPROVED',
        entityType: 'PURCHASE_ORDER',
        entityId: po.id,
        actorUid,
        idempotencyKey: null,
        details: { poNumber: po.poNumber, totalHalalas: po.totalHalalas },
        timestamp: nowIso,
      })
    );

    return updated;
  }

  async cancelPurchaseOrder(
    actor: InventoryActor,
    input: { tenantId: string; purchaseOrderId: string; reason: string }
  ): Promise<PurchaseOrderDoc> {
    this.verifyPermission(actor, 'purchase_orders.create');
    const actorUid = this.getActorUid(actor);
    const ref = this.firestore.doc(
      firestorePaths.purchaseOrder(input.tenantId, input.purchaseOrderId)
    );
    const snap = await ref.get();
    if (!snap.exists) {
      throw new PurchasingError(PurchasingErrorCode.NOT_FOUND, 'أمر الشراء غير موجود.');
    }
    const po = PurchaseOrderDocSchema.parse(snap.data());
    if (
      po.status === 'PARTIALLY_RECEIVED' ||
      po.status === 'RECEIVED' ||
      po.status === 'CANCELLED'
    ) {
      throw new PurchasingError(
        PurchasingErrorCode.STATE_INVALID,
        'لا يمكن إلغاء أمر شراء تم استلامه أو إلغاؤه مسبقاً.'
      );
    }
    const nowIso = new Date().toISOString();
    const updated = PurchaseOrderDocSchema.parse({
      ...po,
      status: 'CANCELLED',
      cancelledBy: actorUid,
      cancelledAt: nowIso,
      cancelReason: input.reason.trim(),
      updatedAt: nowIso,
    });
    await ref.set(updated);
    return updated;
  }

  async getPurchaseOrderById(
    actor: InventoryActor,
    tenantId: string,
    purchaseOrderId: string
  ): Promise<PurchaseOrderDoc | null> {
    this.verifyPermission(actor, 'inventory.read');
    const snap = await this.firestore
      .doc(firestorePaths.purchaseOrder(tenantId, purchaseOrderId))
      .get();
    if (!snap.exists) return null;
    const po = PurchaseOrderDocSchema.parse(snap.data());
    this.verifyBranchAccess(actor, po.branchId);
    return po;
  }

  async listPurchaseOrders(
    actor: InventoryActor,
    tenantId: string,
    filters?: { branchId?: string; supplierId?: string; status?: PurchaseOrderStatus; limit?: number }
  ): Promise<PurchaseOrderDoc[]> {
    this.verifyPermission(actor, 'inventory.read');
    if (filters?.branchId) this.verifyBranchAccess(actor, filters.branchId);
    let query: any = this.firestore.collection(firestorePaths.purchaseOrders(tenantId));
    if (filters?.branchId) query = query.where('branchId', '==', filters.branchId);
    if (filters?.supplierId) query = query.where('supplierId', '==', filters.supplierId);
    if (filters?.status) query = query.where('status', '==', filters.status);
    const snap = await query.orderBy('createdAt', 'desc').limit(filters?.limit || 100).get();
    return snap.docs.map((d: any) => PurchaseOrderDocSchema.parse(d.data()));
  }

  // ============================================================================
  // 3. Goods Receiving (Atomic Stock Increase + Accounting Outbox DR Inventory / CR AP)
  // ============================================================================

  async receiveGoods(
    actor: InventoryActor,
    input: {
      tenantId: string;
      purchaseOrderId: string;
      receivedDate?: string;
      notes?: string;
      idempotencyKey: string;
      lines: Array<{
        lineId: string;
        acceptedQuantity: number;
        rejectedQuantity?: number;
        actualUnitCostHalalas?: number;
      }>;
    }
  ): Promise<{ receipt: GoodsReceiptDoc; purchaseOrder: PurchaseOrderDoc; deduplicated: boolean }> {
    this.verifyPermission(actor, 'goods_receipts.record');
    if (!input.lines.length) {
      throw new PurchasingError(PurchasingErrorCode.INVALID_PAYLOAD, 'يجب تحديد بند واحد على الأقل للاستلام.');
    }

    const actorUid = this.getActorUid(actor);
    const receivedDate = input.receivedDate || getCurrentRiyadhDate();
    const periodId = await this.resolveOpenPeriod(input.tenantId, receivedDate);
    const accounts = await this.resolveAccounts(input.tenantId);

    const idemRef = this.firestore.doc(
      firestorePaths.goodsReceiptIdempotency(input.tenantId, input.idempotencyKey)
    );
    const poRef = this.firestore.doc(
      firestorePaths.purchaseOrder(input.tenantId, input.purchaseOrderId)
    );

    let outboxIdToFlush: string | null = null;
    let receiptPathToUpdate: string | undefined;

    const txRes = await this.firestore.runTransaction(async (tx) => {
      const [idemSnap, poSnap] = await Promise.all([tx.get(idemRef), tx.get(poRef)]);
      if (idemSnap.exists) {
        const existingReceiptId = idemSnap.data()?.receiptId as string;
        const rSnap = await tx.get(
          this.firestore.doc(firestorePaths.goodsReceipt(input.tenantId, existingReceiptId))
        );
        return {
          receipt: GoodsReceiptDocSchema.parse(rSnap.data()),
          purchaseOrder: PurchaseOrderDocSchema.parse(poSnap.data()),
          deduplicated: true,
        };
      }

      if (!poSnap.exists) {
        throw new PurchasingError(PurchasingErrorCode.NOT_FOUND, 'أمر الشراء غير موجود.');
      }
      const po = PurchaseOrderDocSchema.parse(poSnap.data());
      this.verifyBranchAccess(actor, po.branchId);

      if (po.status !== 'APPROVED' && po.status !== 'PARTIALLY_RECEIVED') {
        throw new PurchasingError(
          PurchasingErrorCode.STATE_INVALID,
          `لا يمكن استلام بضاعة لأمر شراء في الحالة (${po.status}). يجب أن يكون معتمداً.`
        );
      }

      const inputByLine = new Map(input.lines.map((l) => [l.lineId, l]));
      const nowIso = new Date().toISOString();
      const receiptRef = this.firestore.collection(firestorePaths.goodsReceipts(input.tenantId)).doc();
      const receiptLines = [];
      let totalAcceptedCostHalalas = 0;

      const updatedPoLines = [];
      for (const poLine of po.lineItems) {
        const rec = inputByLine.get(poLine.lineId);
        if (!rec || (rec.acceptedQuantity === 0 && (rec.rejectedQuantity ?? 0) === 0)) {
          updatedPoLines.push(poLine);
          continue;
        }

        const accepted = rec.acceptedQuantity;
        const rejected = rec.rejectedQuantity ?? 0;
        if (!Number.isInteger(accepted) || accepted < 0 || !Number.isInteger(rejected) || rejected < 0) {
          throw new PurchasingError(PurchasingErrorCode.INVALID_PAYLOAD, 'الكميات المستلمة غير صالحة.');
        }

        const remaining = poLine.orderedQuantity - poLine.receivedQuantity;
        if (accepted > remaining) {
          throw new PurchasingError(
            PurchasingErrorCode.OVER_RECEIPT,
            `الكمية المستلمة (${accepted}) للبند (${poLine.nameArSnapshot}) تتجاوز الكمية المتبقية (${remaining}).`
          );
        }

        const unitCost = rec.actualUnitCostHalalas ?? poLine.unitCostHalalas;
        const lineAcceptedCost = accepted * unitCost;
        totalAcceptedCostHalalas += lineAcceptedCost;

        let movementId: string | null = null;
        if (accepted > 0) {
          const prodSnap = await tx.get(
            this.firestore.doc(firestorePaths.product(input.tenantId, poLine.productId))
          );
          const product = ProductDocSchema.parse(prodSnap.data());
          const moved = await this.inventoryRepo.applyStockMovementInTx(tx, {
            tenantId: input.tenantId,
            branchId: po.branchId,
            product,
            movementType: 'PURCHASE_RECEIPT',
            direction: 'IN',
            quantity: accepted,
            unitCostHalalas: unitCost,
            relatedDocumentType: 'GOODS_RECEIPT',
            relatedDocumentId: receiptRef.id,
            reason: `استلام بضاعة أمر شراء ${po.poNumber}`,
            idempotencyKey: `gr_${input.idempotencyKey}_${poLine.lineId}`,
            actorUid,
            nowIso,
          });
          movementId = moved.movement.id;
        }

        receiptLines.push({
          lineId: poLine.lineId,
          productId: poLine.productId,
          nameArSnapshot: poLine.nameArSnapshot,
          unitSnapshot: poLine.unitSnapshot,
          acceptedQuantity: accepted,
          rejectedQuantity: rejected,
          actualUnitCostHalalas: unitCost,
          totalAcceptedCostHalalas: lineAcceptedCost,
          movementId,
        });

        updatedPoLines.push({
          ...poLine,
          receivedQuantity: poLine.receivedQuantity + accepted,
          rejectedQuantity: poLine.rejectedQuantity + rejected,
        });
      }

      if (receiptLines.length === 0) {
        throw new PurchasingError(
          PurchasingErrorCode.INVALID_PAYLOAD,
          'لم يتم تحديد أي كميات صالحة للاستلام.'
        );
      }

      const allReceived = updatedPoLines.every((l) => l.receivedQuantity >= l.orderedQuantity);
      const nextPoStatus: PurchaseOrderStatus = allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';

      const updatedPo = PurchaseOrderDocSchema.parse({
        ...po,
        lineItems: updatedPoLines,
        status: nextPoStatus,
        updatedAt: nowIso,
      });

      const receipt = GoodsReceiptDocSchema.parse({
        id: receiptRef.id,
        receiptNumber: `GR-${receivedDate.slice(0, 4)}-${receiptRef.id.slice(0, 6).toUpperCase()}`,
        tenantId: input.tenantId,
        branchId: po.branchId,
        purchaseOrderId: po.id,
        poNumber: po.poNumber,
        supplierId: po.supplierId,
        supplierNameSnapshot: po.supplierNameSnapshot,
        receivedDate,
        lines: receiptLines,
        totalAcceptedCostHalalas,
        notes: input.notes?.trim() || '',
        idempotencyKey: input.idempotencyKey,
        journalEntryId: null,
        receivedBy: actorUid,
        receivedAt: nowIso,
        createdAt: nowIso,
      });

      tx.set(poRef, updatedPo);
      tx.set(receiptRef, receipt);
      tx.set(idemRef, {
        idempotencyKey: input.idempotencyKey,
        receiptId: receipt.id,
        createdAt: nowIso,
      });

      if (totalAcceptedCostHalalas > 0) {
        const outboxRef = this.firestore
          .collection(firestorePaths.inventoryAccountingOutbox(input.tenantId))
          .doc();
        tx.set(
          outboxRef,
          InventoryAccountingOutboxDocSchema.parse({
            id: outboxRef.id,
            tenantId: input.tenantId,
            eventType: 'GOODS_RECEIPT',
            sourceId: receipt.id,
            entryDate: receivedDate,
            periodId,
            descriptionAr: `استلام مخزني ${receipt.receiptNumber} (أمر شراء ${po.poNumber})`,
            lines: [
              {
                accountId: accounts.inventory.id,
                accountCode: accounts.inventory.code,
                accountNameAr: accounts.inventory.nameAr,
                debitHalalas: totalAcceptedCostHalalas,
                creditHalalas: 0,
                descriptionAr: `إضافة مخزون (${receipt.receiptNumber})`,
                branchId: po.branchId,
              },
              {
                accountId: accounts.accountsPayable.id,
                accountCode: accounts.accountsPayable.code,
                accountNameAr: accounts.accountsPayable.nameAr,
                debitHalalas: 0,
                creditHalalas: totalAcceptedCostHalalas,
                descriptionAr: `استحقاق مورد (${po.supplierNameSnapshot})`,
                branchId: po.branchId,
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
        receiptPathToUpdate = receiptRef.path;
      }

      const auditRef = this.firestore
        .collection(firestorePaths.inventoryAuditTrail(input.tenantId))
        .doc();
      tx.set(
        auditRef,
        InventoryAuditDocSchema.parse({
          id: auditRef.id,
          tenantId: input.tenantId,
          branchId: po.branchId,
          action: 'GOODS_RECEIVED',
          entityType: 'GOODS_RECEIPT',
          entityId: receipt.id,
          actorUid,
          idempotencyKey: input.idempotencyKey,
          details: { poId: po.id, totalAcceptedCostHalalas },
          timestamp: nowIso,
        })
      );

      return { receipt, purchaseOrder: updatedPo, deduplicated: false };
    });

    if (outboxIdToFlush) {
      const jeId = await this.inventoryRepo.flushOutboxEntry(
        actor,
        input.tenantId,
        outboxIdToFlush,
        receiptPathToUpdate
      );
      if (jeId) {
        txRes.receipt = { ...txRes.receipt, journalEntryId: jeId };
      }
    }

    return txRes;
  }

  async listGoodsReceipts(
    actor: InventoryActor,
    tenantId: string,
    filters?: { purchaseOrderId?: string; branchId?: string; limit?: number }
  ): Promise<GoodsReceiptDoc[]> {
    this.verifyPermission(actor, 'inventory.read');
    if (filters?.branchId) this.verifyBranchAccess(actor, filters.branchId);
    let query: any = this.firestore.collection(firestorePaths.goodsReceipts(tenantId));
    if (filters?.purchaseOrderId) query = query.where('purchaseOrderId', '==', filters.purchaseOrderId);
    if (filters?.branchId) query = query.where('branchId', '==', filters.branchId);
    const snap = await query.orderBy('receivedAt', 'desc').limit(filters?.limit || 100).get();
    return snap.docs.map((d: any) => GoodsReceiptDocSchema.parse(d.data()));
  }

  // ============================================================================
  // 4. Supplier Invoices & Payments (AP)
  // ============================================================================

  async createSupplierInvoice(
    actor: InventoryActor,
    input: {
      tenantId: string;
      branchId: string;
      supplierId: string;
      supplierInvoiceNumber: string;
      purchaseOrderId?: string | null;
      goodsReceiptIds?: string[];
      invoiceDate?: string;
      dueDate?: string | null;
      subtotalHalalas: number;
      vatHalalas?: number;
      notes?: string;
    }
  ): Promise<SupplierInvoiceDoc> {
    this.verifyPermission(actor, 'supplier_invoices.manage');
    this.verifyBranchAccess(actor, input.branchId);
    const actorUid = this.getActorUid(actor);
    const invoiceDate = input.invoiceDate || getCurrentRiyadhDate();
    const vatHalalas = input.vatHalalas ?? 0;
    const totalHalalas = input.subtotalHalalas + vatHalalas;
    if (!Number.isInteger(totalHalalas) || totalHalalas <= 0) {
      throw new PurchasingError(PurchasingErrorCode.INVALID_PAYLOAD, 'إجمالي فاتورة المورد غير صالح.');
    }

    const periodId = await this.resolveOpenPeriod(input.tenantId, invoiceDate);
    const accounts = await this.resolveAccounts(input.tenantId);

    const supSnap = await this.firestore
      .doc(firestorePaths.supplier(input.tenantId, input.supplierId))
      .get();
    if (!supSnap.exists) {
      throw new PurchasingError(PurchasingErrorCode.NOT_FOUND, 'المورد غير موجود.');
    }
    const supplier = SupplierDocSchema.parse(supSnap.data());
    const ref = this.firestore.collection(firestorePaths.supplierInvoices(input.tenantId)).doc();
    const nowIso = new Date().toISOString();

    const inv = SupplierInvoiceDocSchema.parse({
      id: ref.id,
      tenantId: input.tenantId,
      branchId: input.branchId,
      supplierId: supplier.id,
      supplierNameSnapshot: supplier.name,
      supplierInvoiceNumber: input.supplierInvoiceNumber.trim(),
      purchaseOrderId: input.purchaseOrderId || null,
      goodsReceiptIds: input.goodsReceiptIds || [],
      invoiceDate,
      dueDate: input.dueDate || null,
      subtotalHalalas: input.subtotalHalalas,
      vatHalalas,
      totalHalalas,
      paidAmountHalalas: 0,
      balanceDueHalalas: totalHalalas,
      status: 'OPEN',
      notes: input.notes?.trim() || '',
      journalEntryId: null,
      createdBy: actorUid,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    await ref.set(inv);

    // If VAT Input > 0, post VAT Input recoverable DR 1050 / CR 2010 AP
    // (When linked to Goods Receipt, inventory cost subtotal was already booked DR 1040 / CR 2010 on receipt;
    // if standalone without receipt, book DR 1040 Inventory + DR 1050 VAT Input / CR 2010 AP)
    const hasReceipt = (input.goodsReceiptIds?.length || 0) > 0;
    const lines = [];
    if (!hasReceipt && input.subtotalHalalas > 0) {
      lines.push({
        accountId: accounts.inventory.id,
        accountCode: accounts.inventory.code,
        accountNameAr: accounts.inventory.nameAr,
        debitHalalas: input.subtotalHalalas,
        creditHalalas: 0,
        descriptionAr: `فاتورة مورد ${inv.supplierInvoiceNumber}`,
        branchId: input.branchId,
      });
    }
    if (vatHalalas > 0) {
      lines.push({
        accountId: accounts.vatInput.id,
        accountCode: accounts.vatInput.code,
        accountNameAr: accounts.vatInput.nameAr,
        debitHalalas: vatHalalas,
        creditHalalas: 0,
        descriptionAr: `ضريبة مدخلات فاتورة مورد ${inv.supplierInvoiceNumber}`,
        branchId: input.branchId,
      });
    }
    const creditTotal = (!hasReceipt ? input.subtotalHalalas : 0) + vatHalalas;
    if (creditTotal > 0) {
      lines.push({
        accountId: accounts.accountsPayable.id,
        accountCode: accounts.accountsPayable.code,
        accountNameAr: accounts.accountsPayable.nameAr,
        debitHalalas: 0,
        creditHalalas: creditTotal,
        descriptionAr: `ذمم دائنة للمورد ${supplier.name}`,
        branchId: input.branchId,
      });

      const outboxRef = this.firestore
        .collection(firestorePaths.inventoryAccountingOutbox(input.tenantId))
        .doc();
      await outboxRef.set(
        InventoryAccountingOutboxDocSchema.parse({
          id: outboxRef.id,
          tenantId: input.tenantId,
          eventType: 'SUPPLIER_INVOICE',
          sourceId: inv.id,
          entryDate: invoiceDate,
          periodId,
          descriptionAr: `فاتورة مورد ${inv.supplierInvoiceNumber} — ${supplier.name}`,
          lines,
          status: 'PENDING',
          journalEntryId: null,
          errorMessage: null,
          createdAt: nowIso,
          postedAt: null,
        })
      );
      await this.inventoryRepo.flushOutboxEntry(actor, input.tenantId, outboxRef.id, ref.path);
    }

    return inv;
  }

  async recordSupplierPayment(
    actor: InventoryActor,
    input: {
      tenantId: string;
      supplierInvoiceId: string;
      method: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
      amountHalalas: number;
      paymentDate?: string;
      referenceNumber?: string | null;
      notes?: string;
      idempotencyKey: string;
    }
  ): Promise<{ payment: SupplierPaymentDoc; invoice: SupplierInvoiceDoc; deduplicated: boolean }> {
    this.verifyPermission(actor, 'supplier_payments.record');
    if (!Number.isInteger(input.amountHalalas) || input.amountHalalas <= 0) {
      throw new PurchasingError(PurchasingErrorCode.INVALID_PAYLOAD, 'مبلغ الدفع غير صالح.');
    }

    const actorUid = this.getActorUid(actor);
    const paymentDate = input.paymentDate || getCurrentRiyadhDate();
    const periodId = await this.resolveOpenPeriod(input.tenantId, paymentDate);
    const accounts = await this.resolveAccounts(input.tenantId);

    const idemRef = this.firestore.doc(
      firestorePaths.supplierPaymentIdempotency(input.tenantId, input.idempotencyKey)
    );
    const invRef = this.firestore.doc(
      firestorePaths.supplierInvoice(input.tenantId, input.supplierInvoiceId)
    );

    let outboxIdToFlush: string | null = null;
    let paymentPathToUpdate: string | undefined;

    const txRes = await this.firestore.runTransaction(async (tx) => {
      const [idemSnap, invSnap] = await Promise.all([tx.get(idemRef), tx.get(invRef)]);
      if (idemSnap.exists) {
        const payId = idemSnap.data()?.paymentId as string;
        const pSnap = await tx.get(
          this.firestore.doc(firestorePaths.supplierPayment(input.tenantId, payId))
        );
        return {
          payment: SupplierPaymentDocSchema.parse(pSnap.data()),
          invoice: SupplierInvoiceDocSchema.parse(invSnap.data()),
          deduplicated: true,
        };
      }

      if (!invSnap.exists) {
        throw new PurchasingError(PurchasingErrorCode.NOT_FOUND, 'فاتورة المورد غير موجودة.');
      }
      const inv = SupplierInvoiceDocSchema.parse(invSnap.data());
      this.verifyBranchAccess(actor, inv.branchId);
      if (inv.status === 'VOIDED' || inv.status === 'PAID') {
        throw new PurchasingError(
          PurchasingErrorCode.STATE_INVALID,
          `لا يمكن تسجيل دفعة لفاتورة في الحالة (${inv.status}).`
        );
      }
      if (input.amountHalalas > inv.balanceDueHalalas) {
        throw new PurchasingError(
          PurchasingErrorCode.OVERPAYMENT,
          `مبلغ الدفعة (${input.amountHalalas}) يتجاوز الرصيد المستحق (${inv.balanceDueHalalas}).`
        );
      }

      const nowIso = new Date().toISOString();
      const payRef = this.firestore.collection(firestorePaths.supplierPayments(input.tenantId)).doc();
      const newPaid = inv.paidAmountHalalas + input.amountHalalas;
      const newBalance = inv.totalHalalas - newPaid;
      const nextStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

      const updatedInv = SupplierInvoiceDocSchema.parse({
        ...inv,
        paidAmountHalalas: newPaid,
        balanceDueHalalas: newBalance,
        status: nextStatus,
        updatedAt: nowIso,
      });

      const payment = SupplierPaymentDocSchema.parse({
        id: payRef.id,
        tenantId: input.tenantId,
        branchId: inv.branchId,
        supplierId: inv.supplierId,
        supplierInvoiceId: inv.id,
        method: input.method,
        amountHalalas: input.amountHalalas,
        paymentDate,
        referenceNumber: input.referenceNumber?.trim() || null,
        notes: input.notes?.trim() || '',
        idempotencyKey: input.idempotencyKey,
        journalEntryId: null,
        recordedBy: actorUid,
        recordedAt: nowIso,
        createdAt: nowIso,
      });

      tx.set(invRef, updatedInv);
      tx.set(payRef, payment);
      tx.set(idemRef, {
        idempotencyKey: input.idempotencyKey,
        paymentId: payment.id,
        createdAt: nowIso,
      });

      const settlementAccount = input.method === 'CASH' ? accounts.cash : accounts.bank;
      const outboxRef = this.firestore
        .collection(firestorePaths.inventoryAccountingOutbox(input.tenantId))
        .doc();
      tx.set(
        outboxRef,
        InventoryAccountingOutboxDocSchema.parse({
          id: outboxRef.id,
          tenantId: input.tenantId,
          eventType: 'SUPPLIER_PAYMENT',
          sourceId: payment.id,
          entryDate: paymentDate,
          periodId,
          descriptionAr: `سداد فاتورة مورد ${inv.supplierInvoiceNumber}`,
          lines: [
            {
              accountId: accounts.accountsPayable.id,
              accountCode: accounts.accountsPayable.code,
              accountNameAr: accounts.accountsPayable.nameAr,
              debitHalalas: input.amountHalalas,
              creditHalalas: 0,
              descriptionAr: `سداد ذمم مورد (${inv.supplierNameSnapshot})`,
              branchId: inv.branchId,
            },
            {
              accountId: settlementAccount.id,
              accountCode: settlementAccount.code,
              accountNameAr: settlementAccount.nameAr,
              debitHalalas: 0,
              creditHalalas: input.amountHalalas,
              descriptionAr: `دفع لمورد (${input.method})`,
              branchId: inv.branchId,
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
      paymentPathToUpdate = payRef.path;

      const auditRef = this.firestore
        .collection(firestorePaths.inventoryAuditTrail(input.tenantId))
        .doc();
      tx.set(
        auditRef,
        InventoryAuditDocSchema.parse({
          id: auditRef.id,
          tenantId: input.tenantId,
          branchId: inv.branchId,
          action: 'SUPPLIER_PAYMENT_RECORDED',
          entityType: 'SUPPLIER_PAYMENT',
          entityId: payment.id,
          actorUid,
          idempotencyKey: input.idempotencyKey,
          details: { supplierInvoiceId: inv.id, amountHalalas: input.amountHalalas },
          timestamp: nowIso,
        })
      );

      return { payment, invoice: updatedInv, deduplicated: false };
    });

    if (outboxIdToFlush) {
      await this.inventoryRepo.flushOutboxEntry(
        actor,
        input.tenantId,
        outboxIdToFlush,
        paymentPathToUpdate
      );
    }

    return txRes;
  }

  async listSupplierInvoices(
    actor: InventoryActor,
    tenantId: string,
    filters?: { supplierId?: string; branchId?: string; limit?: number }
  ): Promise<SupplierInvoiceDoc[]> {
    this.verifyPermission(actor, 'suppliers.read');
    if (filters?.branchId) this.verifyBranchAccess(actor, filters.branchId);
    let query: any = this.firestore.collection(firestorePaths.supplierInvoices(tenantId));
    if (filters?.supplierId) query = query.where('supplierId', '==', filters.supplierId);
    if (filters?.branchId) query = query.where('branchId', '==', filters.branchId);
    const snap = await query.orderBy('createdAt', 'desc').limit(filters?.limit || 100).get();
    return snap.docs.map((d: any) => SupplierInvoiceDocSchema.parse(d.data()));
  }

  async listSupplierPayments(
    actor: InventoryActor,
    tenantId: string,
    filters?: { supplierId?: string; supplierInvoiceId?: string; limit?: number }
  ): Promise<SupplierPaymentDoc[]> {
    this.verifyPermission(actor, 'suppliers.read');
    let query: any = this.firestore.collection(firestorePaths.supplierPayments(tenantId));
    if (filters?.supplierId) query = query.where('supplierId', '==', filters.supplierId);
    if (filters?.supplierInvoiceId) {
      query = query.where('supplierInvoiceId', '==', filters.supplierInvoiceId);
    }
    const snap = await query.orderBy('recordedAt', 'desc').limit(filters?.limit || 100).get();
    return snap.docs.map((d: any) => SupplierPaymentDocSchema.parse(d.data()));
  }
}

