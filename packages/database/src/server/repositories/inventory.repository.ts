import 'server-only';
import type { Firestore, Transaction } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import { hasPermission } from '../../permissions';
import { BranchDocSchema } from '../../branch.schema';
import { getCurrentRiyadhDate } from '../../availability.types';
import type { AccountDoc, JournalLine } from '../../accounting.schema';
import {
  AdjustmentReasonEnum,
  InventoryAccountingOutboxDocSchema,
  InventoryAuditDocSchema,
  InventoryBalanceDocSchema,
  ProductCategoryDocSchema,
  ProductDocSchema,
  StockAdjustmentDocSchema,
  StockCountDocSchema,
  StockMovementDocSchema,
  StockTransferDocSchema,
  UnitOfMeasureEnum,
  applyWeightedAverageMovement,
  makeInventoryBalanceId,
  type AdjustmentReason,
  type InventoryAccountingOutboxDoc,
  type InventoryBalanceDoc,
  type ProductCategoryDoc,
  type ProductDoc,
  type ProductStatus,
  type StockAdjustmentDoc,
  type StockCountDoc,
  type StockMovementDoc,
  type StockMovementType,
  type StockTransferDoc,
  type UnitOfMeasure,
} from '../../inventory.schema';
import { AccountingRepository } from './accounting.repository';
import { TrustedSystemContext } from './trusted-context';
import type { PosActor } from './pos-session.repository';

export enum InventoryErrorCode {
  FORBIDDEN = 'INVENTORY_FORBIDDEN',
  BRANCH_FORBIDDEN = 'INVENTORY_BRANCH_FORBIDDEN',
  NOT_FOUND = 'INVENTORY_NOT_FOUND',
  INVALID_PAYLOAD = 'INVENTORY_INVALID_PAYLOAD',
  DUPLICATE_SKU = 'INVENTORY_DUPLICATE_SKU',
  DUPLICATE_BARCODE = 'INVENTORY_DUPLICATE_BARCODE',
  INSUFFICIENT_STOCK = 'INVENTORY_INSUFFICIENT_STOCK',
  STATE_INVALID = 'INVENTORY_STATE_INVALID',
  FISCAL_PERIOD_CLOSED = 'INVENTORY_FISCAL_PERIOD_CLOSED',
  ACCOUNTING_CONFIG_MISSING = 'INVENTORY_ACCOUNTING_CONFIG_MISSING',
}

export class InventoryError extends Error {
  constructor(
    public readonly code: InventoryErrorCode,
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'InventoryError';
  }
}

export type InventoryActor = PosActor;

const HIGH_VALUE_ADJUSTMENT_THRESHOLD_HALALAS = 100_000; // 1,000 SAR

export class InventoryRepository {
  private readonly accountingRepo: AccountingRepository;

  constructor(private readonly firestore: Firestore = getFirebaseAdminFirestore()) {
    this.accountingRepo = new AccountingRepository(firestore);
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
      throw new InventoryError(
        InventoryErrorCode.FORBIDDEN,
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
      throw new InventoryError(
        InventoryErrorCode.BRANCH_FORBIDDEN,
        'غير مصرح: لا تملك صلاحية الوصول إلى مخزون هذا الفرع.'
      );
    }
  }

  private normalizeLockKey(value: string): string {
    return value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, '_');
  }

  private async resolveOpenPeriod(tenantId: string, dateStr: string): Promise<string> {
    const period = await this.accountingRepo.resolvePeriodForDate(tenantId, dateStr);
    if (!period || period.status !== 'OPEN') {
      throw new InventoryError(
        InventoryErrorCode.FISCAL_PERIOD_CLOSED,
        `الفترة المحاسبية للتاريخ (${dateStr}) مغلقة أو غير معرفة.`
      );
    }
    return period.id;
  }

  private async resolveInventoryAccounts(tenantId: string): Promise<{
    inventory: AccountDoc;
    cogsConsumables: AccountDoc;
    cogsRetail: AccountDoc;
    vatInput: AccountDoc;
    accountsPayable: AccountDoc;
  }> {
    const [inventory, cogsConsumables, cogsRetail, vatInput, accountsPayable] = await Promise.all([
      this.accountingRepo.getAccountByCode(tenantId, '1040'),
      this.accountingRepo.getAccountByCode(tenantId, '5010'),
      this.accountingRepo.getAccountByCode(tenantId, '5020'),
      this.accountingRepo.getAccountByCode(tenantId, '1050'),
      this.accountingRepo.getAccountByCode(tenantId, '2010'),
    ]);
    if (!inventory || !cogsConsumables || !cogsRetail || !vatInput || !accountsPayable) {
      throw new InventoryError(
        InventoryErrorCode.ACCOUNTING_CONFIG_MISSING,
        'دليل الحسابات غير مكتمل لعمليات المخزون والمشتريات (مطلوب: 1040، 1050، 2010، 5010، 5020).'
      );
    }
    return { inventory, cogsConsumables, cogsRetail, vatInput, accountsPayable };
  }

  async flushOutboxEntry(
    actor: InventoryActor,
    tenantId: string,
    outboxId: string,
    targetDocPath?: string
  ): Promise<string | null> {
    const outboxRef = this.firestore.doc(
      firestorePaths.inventoryAccountingOutboxItem(tenantId, outboxId)
    );
    const outboxSnap = await outboxRef.get();
    if (!outboxSnap.exists) return null;

    const outbox = InventoryAccountingOutboxDocSchema.parse(outboxSnap.data());
    if (outbox.status === 'POSTED' && outbox.journalEntryId) {
      return outbox.journalEntryId;
    }

    const actorUid = this.getActorUid(actor);
    try {
      const draft = await this.accountingRepo.createDraftJournal(
        tenantId,
        {
          descriptionAr: outbox.descriptionAr,
          descriptionEn: `Inventory ${outbox.eventType} (${outbox.sourceId})`,
          entryDate: outbox.entryDate,
          periodId: outbox.periodId,
          sourceDocumentRef: outbox.sourceId,
          lines: outbox.lines.map((l, idx) => ({
            lineId: `inv-line-${idx + 1}`,
            accountId: l.accountId,
            accountCode: l.accountCode,
            accountNameAr: l.accountNameAr,
            debitHalalas: l.debitHalalas,
            creditHalalas: l.creditHalalas,
            description: l.descriptionAr || outbox.descriptionAr,
            branchId: l.branchId,
          })) as JournalLine[],
        },
        actorUid
      );
      const posted = await this.accountingRepo.postJournalEntry(tenantId, draft.id, actorUid);
      const nowIso = new Date().toISOString();

      await this.firestore.runTransaction(async (tx) => {
        tx.set(
          outboxRef,
          InventoryAccountingOutboxDocSchema.parse({
            ...outbox,
            status: 'POSTED',
            journalEntryId: posted.id,
            errorMessage: null,
            postedAt: nowIso,
          })
        );
        if (targetDocPath) {
          tx.update(this.firestore.doc(targetDocPath), {
            journalEntryId: posted.id,
          });
        }
      });

      return posted.id;
    } catch (err: any) {
      await outboxRef.set(
        InventoryAccountingOutboxDocSchema.parse({
          ...outbox,
          status: 'FAILED',
          errorMessage: err?.message || 'Accounting posting failed',
        })
      );
      throw err;
    }
  }

  // ============================================================================
  // 1. Product Categories
  // ============================================================================

  async createCategory(
    actor: InventoryActor,
    input: {
      tenantId: string;
      nameAr: string;
      nameEn?: string;
      descriptionAr?: string;
      displayOrder?: number;
    }
  ): Promise<ProductCategoryDoc> {
    this.verifyPermission(actor, 'product_categories.manage');
    const actorUid = this.getActorUid(actor);
    const nowIso = new Date().toISOString();
    const ref = this.firestore.collection(firestorePaths.productCategories(input.tenantId)).doc();

    const doc = ProductCategoryDocSchema.parse({
      id: ref.id,
      tenantId: input.tenantId,
      nameAr: input.nameAr.trim(),
      nameEn: input.nameEn?.trim() || '',
      descriptionAr: input.descriptionAr?.trim() || '',
      status: 'ACTIVE',
      displayOrder: input.displayOrder ?? 0,
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: actorUid,
      updatedBy: actorUid,
    });

    await ref.set(doc);
    return doc;
  }

  async updateCategory(
    actor: InventoryActor,
    input: {
      tenantId: string;
      categoryId: string;
      nameAr?: string;
      nameEn?: string;
      descriptionAr?: string;
      status?: 'ACTIVE' | 'INACTIVE';
      displayOrder?: number;
    }
  ): Promise<ProductCategoryDoc> {
    this.verifyPermission(actor, 'product_categories.manage');
    const actorUid = this.getActorUid(actor);
    const ref = this.firestore.doc(
      firestorePaths.productCategory(input.tenantId, input.categoryId)
    );
    const snap = await ref.get();
    if (!snap.exists) {
      throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'تصنيف المنتج غير موجود.');
    }
    const existing = ProductCategoryDocSchema.parse(snap.data());
    const updated = ProductCategoryDocSchema.parse({
      ...existing,
      nameAr: input.nameAr !== undefined ? input.nameAr.trim() : existing.nameAr,
      nameEn: input.nameEn !== undefined ? input.nameEn.trim() : existing.nameEn,
      descriptionAr:
        input.descriptionAr !== undefined ? input.descriptionAr.trim() : existing.descriptionAr,
      status: input.status ?? existing.status,
      displayOrder: input.displayOrder ?? existing.displayOrder,
      updatedAt: new Date().toISOString(),
      updatedBy: actorUid,
    });
    await ref.set(updated);
    return updated;
  }

  async listCategories(
    actor: InventoryActor,
    tenantId: string,
    filters?: { status?: 'ACTIVE' | 'INACTIVE' }
  ): Promise<ProductCategoryDoc[]> {
    this.verifyPermission(actor, 'inventory.read');
    let query: any = this.firestore.collection(firestorePaths.productCategories(tenantId));
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    const snap = await query.get();
    return snap.docs
      .map((d: any) => ProductCategoryDocSchema.parse(d.data()))
      .sort((a: ProductCategoryDoc, b: ProductCategoryDoc) => a.displayOrder - b.displayOrder);
  }

  // ============================================================================
  // 2. Product Catalog (Unique SKU & Barcode per tenant)
  // ============================================================================

  async createProduct(
    actor: InventoryActor,
    input: {
      tenantId: string;
      sku: string;
      barcode?: string | null;
      nameAr: string;
      nameEn?: string;
      descriptionAr?: string;
      descriptionEn?: string;
      categoryId: string;
      brand?: string;
      unit: UnitOfMeasure;
      purchaseCostHalalas: number;
      sellingPriceHalalas?: number | null;
      isSellableInPos?: boolean;
      taxMode?: 'TAX_INCLUSIVE' | 'TAX_EXCLUSIVE' | 'TAX_EXEMPT';
      stockTrackingEnabled?: boolean;
      minStockThreshold?: number;
      reorderQuantity?: number;
    }
  ): Promise<ProductDoc> {
    this.verifyPermission(actor, 'products.manage');
    const sku = input.sku.trim();
    const barcode = input.barcode?.trim() || null;
    if (!sku) {
      throw new InventoryError(InventoryErrorCode.INVALID_PAYLOAD, 'رمز SKU مطلوب.');
    }
    if (!Number.isInteger(input.purchaseCostHalalas) || input.purchaseCostHalalas < 0) {
      throw new InventoryError(
        InventoryErrorCode.INVALID_PAYLOAD,
        'تكلفة الشراء يجب أن تكون رقماً صحيحاً غير سالب بالهللات.'
      );
    }
    if (
      input.sellingPriceHalalas !== undefined &&
      input.sellingPriceHalalas !== null &&
      (!Number.isInteger(input.sellingPriceHalalas) || input.sellingPriceHalalas < 0)
    ) {
      throw new InventoryError(
        InventoryErrorCode.INVALID_PAYLOAD,
        'سعر البيع يجب أن يكون رقماً صحيحاً غير سالب بالهللات.'
      );
    }

    const unit = UnitOfMeasureEnum.parse(input.unit);
    const actorUid = this.getActorUid(actor);
    const productRef = this.firestore.collection(firestorePaths.products(input.tenantId)).doc();
    const skuKey = this.normalizeLockKey(sku);
    const skuLockRef = this.firestore.doc(firestorePaths.productSkuLock(input.tenantId, skuKey));
    const barcodeLockRef = barcode
      ? this.firestore.doc(
          firestorePaths.productBarcodeLock(input.tenantId, this.normalizeLockKey(barcode))
        )
      : null;

    return await this.firestore.runTransaction(async (tx) => {
      const catRef = this.firestore.doc(
        firestorePaths.productCategory(input.tenantId, input.categoryId)
      );
      const [catSnap, skuLockSnap, barcodeLockSnap] = await Promise.all([
        tx.get(catRef),
        tx.get(skuLockRef),
        barcodeLockRef ? tx.get(barcodeLockRef) : Promise.resolve(null),
      ]);

      if (!catSnap.exists) {
        throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'تصنيف المنتج غير موجود.');
      }
      const cat = ProductCategoryDocSchema.parse(catSnap.data());
      if (cat.status !== 'ACTIVE') {
        throw new InventoryError(
          InventoryErrorCode.INVALID_PAYLOAD,
          'لا يمكن إضافة منتج تحت تصنيف غير نشط.'
        );
      }
      if (skuLockSnap.exists) {
        throw new InventoryError(
          InventoryErrorCode.DUPLICATE_SKU,
          `رمز المنتج SKU (${sku}) مستخدم مسبقاً في هذه المنشأة.`
        );
      }
      if (barcodeLockSnap?.exists) {
        throw new InventoryError(
          InventoryErrorCode.DUPLICATE_BARCODE,
          `الباركود (${barcode}) مستخدم مسبقاً في هذه المنشأة.`
        );
      }

      const nowIso = new Date().toISOString();
      const product = ProductDocSchema.parse({
        id: productRef.id,
        tenantId: input.tenantId,
        sku,
        barcode,
        nameAr: input.nameAr.trim(),
        nameEn: input.nameEn?.trim() || '',
        descriptionAr: input.descriptionAr?.trim() || '',
        descriptionEn: input.descriptionEn?.trim() || '',
        categoryId: cat.id,
        categoryNameAr: cat.nameAr,
        brand: input.brand?.trim() || '',
        unit,
        purchaseCostHalalas: input.purchaseCostHalalas,
        sellingPriceHalalas: input.sellingPriceHalalas ?? null,
        isSellableInPos: input.isSellableInPos ?? true,
        taxMode: input.taxMode ?? 'TAX_INCLUSIVE',
        stockTrackingEnabled: input.stockTrackingEnabled ?? true,
        minStockThreshold: input.minStockThreshold ?? 0,
        reorderQuantity: input.reorderQuantity ?? 0,
        status: 'ACTIVE',
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: actorUid,
        updatedBy: actorUid,
      });

      tx.set(productRef, product);
      tx.set(skuLockRef, { productId: product.id, sku, createdAt: nowIso });
      if (barcodeLockRef && barcode) {
        tx.set(barcodeLockRef, { productId: product.id, barcode, createdAt: nowIso });
      }

      const auditRef = this.firestore.collection(firestorePaths.inventoryAuditTrail(input.tenantId)).doc();
      tx.set(
        auditRef,
        InventoryAuditDocSchema.parse({
          id: auditRef.id,
          tenantId: input.tenantId,
          branchId: null,
          action: 'PRODUCT_CREATED',
          entityType: 'PRODUCT',
          entityId: product.id,
          actorUid,
          idempotencyKey: null,
          details: { sku: product.sku, nameAr: product.nameAr },
          timestamp: nowIso,
        })
      );

      return product;
    });
  }

  async updateProduct(
    actor: InventoryActor,
    input: {
      tenantId: string;
      productId: string;
      nameAr?: string;
      nameEn?: string;
      descriptionAr?: string;
      categoryId?: string;
      brand?: string;
      purchaseCostHalalas?: number;
      sellingPriceHalalas?: number | null;
      isSellableInPos?: boolean;
      taxMode?: 'TAX_INCLUSIVE' | 'TAX_EXCLUSIVE' | 'TAX_EXEMPT';
      minStockThreshold?: number;
      reorderQuantity?: number;
      status?: ProductStatus;
    }
  ): Promise<ProductDoc> {
    this.verifyPermission(actor, 'products.manage');
    const actorUid = this.getActorUid(actor);
    const productRef = this.firestore.doc(firestorePaths.product(input.tenantId, input.productId));

    return await this.firestore.runTransaction(async (tx) => {
      const snap = await tx.get(productRef);
      if (!snap.exists) {
        throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'المنتج غير موجود.');
      }
      const existing = ProductDocSchema.parse(snap.data());

      let categoryId = existing.categoryId;
      let categoryNameAr = existing.categoryNameAr;
      if (input.categoryId && input.categoryId !== existing.categoryId) {
        const catSnap = await tx.get(
          this.firestore.doc(firestorePaths.productCategory(input.tenantId, input.categoryId))
        );
        if (!catSnap.exists) {
          throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'تصنيف المنتج غير موجود.');
        }
        const cat = ProductCategoryDocSchema.parse(catSnap.data());
        categoryId = cat.id;
        categoryNameAr = cat.nameAr;
      }

      if (
        input.purchaseCostHalalas !== undefined &&
        (!Number.isInteger(input.purchaseCostHalalas) || input.purchaseCostHalalas < 0)
      ) {
        throw new InventoryError(InventoryErrorCode.INVALID_PAYLOAD, 'تكلفة الشراء غير صالحة.');
      }

      const nowIso = new Date().toISOString();
      const updated = ProductDocSchema.parse({
        ...existing,
        nameAr: input.nameAr !== undefined ? input.nameAr.trim() : existing.nameAr,
        nameEn: input.nameEn !== undefined ? input.nameEn.trim() : existing.nameEn,
        descriptionAr:
          input.descriptionAr !== undefined ? input.descriptionAr.trim() : existing.descriptionAr,
        categoryId,
        categoryNameAr,
        brand: input.brand !== undefined ? input.brand.trim() : existing.brand,
        purchaseCostHalalas: input.purchaseCostHalalas ?? existing.purchaseCostHalalas,
        sellingPriceHalalas:
          input.sellingPriceHalalas !== undefined
            ? input.sellingPriceHalalas
            : existing.sellingPriceHalalas,
        isSellableInPos: input.isSellableInPos ?? existing.isSellableInPos,
        taxMode: input.taxMode ?? existing.taxMode,
        minStockThreshold: input.minStockThreshold ?? existing.minStockThreshold,
        reorderQuantity: input.reorderQuantity ?? existing.reorderQuantity,
        status: input.status ?? existing.status,
        updatedAt: nowIso,
        updatedBy: actorUid,
      });

      tx.set(productRef, updated);

      const auditRef = this.firestore
        .collection(firestorePaths.inventoryAuditTrail(input.tenantId))
        .doc();
      tx.set(
        auditRef,
        InventoryAuditDocSchema.parse({
          id: auditRef.id,
          tenantId: input.tenantId,
          branchId: null,
          action: updated.status === 'ARCHIVED' ? 'PRODUCT_ARCHIVED' : 'PRODUCT_UPDATED',
          entityType: 'PRODUCT',
          entityId: updated.id,
          actorUid,
          idempotencyKey: null,
          details: { status: updated.status },
          timestamp: nowIso,
        })
      );

      return updated;
    });
  }

  async getProductById(
    actor: InventoryActor,
    tenantId: string,
    productId: string
  ): Promise<ProductDoc | null> {
    this.verifyPermission(actor, 'inventory.read');
    const snap = await this.firestore.doc(firestorePaths.product(tenantId, productId)).get();
    if (!snap.exists) return null;
    const product = ProductDocSchema.parse(snap.data());
    if (product.tenantId !== tenantId) {
      throw new InventoryError(InventoryErrorCode.FORBIDDEN, 'وصول غير مصرح عبر المنشآت.');
    }
    return product;
  }

  async listProducts(
    actor: InventoryActor,
    tenantId: string,
    filters?: { status?: ProductStatus; categoryId?: string; search?: string; limit?: number }
  ): Promise<ProductDoc[]> {
    this.verifyPermission(actor, 'inventory.read');
    let query: any = this.firestore.collection(firestorePaths.products(tenantId));
    if (filters?.status) query = query.where('status', '==', filters.status);
    if (filters?.categoryId) query = query.where('categoryId', '==', filters.categoryId);
    const snap = await query.limit(filters?.limit || 200).get();
    let list = snap.docs.map((d: any) => ProductDocSchema.parse(d.data()));
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p: ProductDoc) =>
          p.nameAr.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }
    return list;
  }

  // ============================================================================
  // 3. Authoritative Stock Movement & Balance Engine (Reusable inside Transactions)
  // ============================================================================

  /**
   * Executes an atomic stock balance update + immutable movement ledger write inside an existing Firestore Transaction.
   * Ensures idempotency via `stock_movement_idempotency/{idempotencyKey}` and enforces non-negative stock.
   */
  async applyStockMovementInTx(
    tx: Transaction,
    params: {
      tenantId: string;
      branchId: string;
      product: ProductDoc;
      movementType: StockMovementType;
      direction: 'IN' | 'OUT';
      quantity: number;
      unitCostHalalas: number;
      relatedDocumentType: string | null;
      relatedDocumentId: string | null;
      reason: string;
      idempotencyKey: string;
      actorUid: string;
      nowIso: string;
      preloadedBalanceSnap?: FirebaseFirestore.DocumentSnapshot;
      preloadedIdemSnap?: FirebaseFirestore.DocumentSnapshot;
    }
  ): Promise<{ movement: StockMovementDoc; balance: InventoryBalanceDoc; deduplicated: boolean }> {
    const idemRef = this.firestore.doc(
      firestorePaths.stockMovementIdempotency(params.tenantId, params.idempotencyKey)
    );
    const balanceId = makeInventoryBalanceId(params.branchId, params.product.id);
    const balanceRef = this.firestore.doc(firestorePaths.inventoryBalance(params.tenantId, balanceId));

    const idemSnap = params.preloadedIdemSnap ?? (await tx.get(idemRef));
    if (idemSnap.exists) {
      const existingMovementId = idemSnap.data()?.movementId as string;
      const [mSnap, bSnap] = await Promise.all([
        tx.get(this.firestore.doc(firestorePaths.stockMovement(params.tenantId, existingMovementId))),
        tx.get(balanceRef),
      ]);
      return {
        movement: StockMovementDocSchema.parse(mSnap.data()),
        balance: InventoryBalanceDocSchema.parse(bSnap.data()),
        deduplicated: true,
      };
    }

    const balSnap = params.preloadedBalanceSnap ?? (await tx.get(balanceRef));
    const currentBalance: InventoryBalanceDoc = balSnap.exists
      ? InventoryBalanceDocSchema.parse(balSnap.data())
      : InventoryBalanceDocSchema.parse({
          id: balanceId,
          tenantId: params.tenantId,
          branchId: params.branchId,
          productId: params.product.id,
          unit: params.product.unit,
          quantityOnHand: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          averageCostHalalas: params.product.purchaseCostHalalas,
          totalValueHalalas: 0,
          lastMovementId: null,
          lastMovementAt: null,
          updatedAt: params.nowIso,
        });

    let calc;
    try {
      calc = applyWeightedAverageMovement({
        currentQtyOnHand: currentBalance.quantityOnHand,
        currentReservedQty: currentBalance.reservedQuantity,
        currentAvgCostHalalas: currentBalance.averageCostHalalas,
        currentTotalValueHalalas: currentBalance.totalValueHalalas,
        direction: params.direction,
        quantity: params.quantity,
        unitCostHalalas: params.unitCostHalalas,
      });
    } catch (err: any) {
      throw new InventoryError(
        InventoryErrorCode.INSUFFICIENT_STOCK,
        err?.message || 'الرصيد غير كافٍ.'
      );
    }

    const movementRef = this.firestore
      .collection(firestorePaths.stockMovements(params.tenantId))
      .doc();

    const movement = StockMovementDocSchema.parse({
      id: movementRef.id,
      tenantId: params.tenantId,
      branchId: params.branchId,
      productId: params.product.id,
      productNameAr: params.product.nameAr,
      movementType: params.movementType,
      direction: params.direction,
      quantity: params.quantity,
      unit: params.product.unit,
      unitCostHalalas: calc.movementUnitCostHalalas,
      totalCostHalalas: calc.movementTotalCostHalalas,
      balanceBefore: currentBalance.quantityOnHand,
      balanceAfter: calc.newQtyOnHand,
      relatedDocumentType: params.relatedDocumentType,
      relatedDocumentId: params.relatedDocumentId,
      reason: params.reason,
      idempotencyKey: params.idempotencyKey,
      actorUid: params.actorUid,
      auditId: null,
      timestamp: params.nowIso,
    });

    const nextBalance = InventoryBalanceDocSchema.parse({
      ...currentBalance,
      quantityOnHand: calc.newQtyOnHand,
      availableQuantity: calc.newAvailableQty,
      averageCostHalalas: calc.newAvgCostHalalas,
      totalValueHalalas: calc.newTotalValueHalalas,
      lastMovementId: movement.id,
      lastMovementAt: params.nowIso,
      updatedAt: params.nowIso,
    });

    tx.set(movementRef, movement);
    tx.set(balanceRef, nextBalance);
    tx.set(idemRef, {
      idempotencyKey: params.idempotencyKey,
      movementId: movement.id,
      createdAt: params.nowIso,
    });

    return { movement, balance: nextBalance, deduplicated: false };
  }

  async recordOpeningBalance(
    actor: InventoryActor,
    input: {
      tenantId: string;
      branchId: string;
      productId: string;
      quantity: number;
      unitCostHalalas: number;
      idempotencyKey: string;
      reason?: string;
    }
  ): Promise<{ movement: StockMovementDoc; balance: InventoryBalanceDoc; deduplicated: boolean }> {
    this.verifyPermission(actor, 'stock_adjustments.create');
    this.verifyBranchAccess(actor, input.branchId);
    const actorUid = this.getActorUid(actor);

    return await this.firestore.runTransaction(async (tx) => {
      const [branchSnap, prodSnap] = await Promise.all([
        tx.get(this.firestore.doc(firestorePaths.branch(input.tenantId, input.branchId))),
        tx.get(this.firestore.doc(firestorePaths.product(input.tenantId, input.productId))),
      ]);
      if (!branchSnap.exists) {
        throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'الفرع غير موجود.');
      }
      if (!prodSnap.exists) {
        throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'المنتج غير موجود.');
      }
      BranchDocSchema.parse(branchSnap.data());
      const product = ProductDocSchema.parse(prodSnap.data());
      if (product.status === 'ARCHIVED') {
        throw new InventoryError(InventoryErrorCode.INVALID_PAYLOAD, 'المنتج مؤرشف.');
      }

      const nowIso = new Date().toISOString();
      return await this.applyStockMovementInTx(tx, {
        tenantId: input.tenantId,
        branchId: input.branchId,
        product,
        movementType: 'OPENING_BALANCE',
        direction: 'IN',
        quantity: input.quantity,
        unitCostHalalas: input.unitCostHalalas,
        relatedDocumentType: 'OPENING_BALANCE',
        relatedDocumentId: input.productId,
        reason: input.reason || 'رصيد افتتاحي',
        idempotencyKey: input.idempotencyKey,
        actorUid,
        nowIso,
      });
    });
  }

  async listBalances(
    actor: InventoryActor,
    tenantId: string,
    filters?: { branchId?: string; productId?: string }
  ): Promise<InventoryBalanceDoc[]> {
    this.verifyPermission(actor, 'inventory_balances.read');
    if (filters?.branchId) this.verifyBranchAccess(actor, filters.branchId);

    let query: any = this.firestore.collection(firestorePaths.inventoryBalances(tenantId));
    if (filters?.branchId) query = query.where('branchId', '==', filters.branchId);
    if (filters?.productId) query = query.where('productId', '==', filters.productId);
    const snap = await query.get();
    let list = snap.docs.map((d: any) => InventoryBalanceDocSchema.parse(d.data()));

    if (
      !TrustedSystemContext.isTrusted(actor) &&
      !actor.isPlatformAdmin &&
      actor.role !== 'OWNER' &&
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0
    ) {
      const allowed = new Set(actor.assignedBranchIds);
      list = list.filter((b: InventoryBalanceDoc) => allowed.has(b.branchId));
    }
    return list;
  }

  async listMovements(
    actor: InventoryActor,
    tenantId: string,
    filters?: { branchId?: string; productId?: string; limit?: number }
  ): Promise<StockMovementDoc[]> {
    this.verifyPermission(actor, 'stock_movements.read');
    if (filters?.branchId) this.verifyBranchAccess(actor, filters.branchId);

    let query: any = this.firestore.collection(firestorePaths.stockMovements(tenantId));
    if (filters?.branchId) query = query.where('branchId', '==', filters.branchId);
    if (filters?.productId) query = query.where('productId', '==', filters.productId);
    const snap = await query.orderBy('timestamp', 'desc').limit(filters?.limit || 150).get();
    let list = snap.docs.map((d: any) => StockMovementDocSchema.parse(d.data()));

    if (
      !TrustedSystemContext.isTrusted(actor) &&
      !actor.isPlatformAdmin &&
      actor.role !== 'OWNER' &&
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0
    ) {
      const allowed = new Set(actor.assignedBranchIds);
      list = list.filter((m: StockMovementDoc) => allowed.has(m.branchId));
    }
    return list;
  }

  // ============================================================================
  // 4. Stock Adjustments & Stock Counts
  // ============================================================================

  async createStockAdjustment(
    actor: InventoryActor,
    input: {
      tenantId: string;
      branchId: string;
      productId: string;
      reason: AdjustmentReason;
      reasonDetails: string;
      direction: 'IN' | 'OUT';
      quantity: number;
      unitCostHalalas?: number;
      idempotencyKey: string;
    }
  ): Promise<{ adjustment: StockAdjustmentDoc; movement: StockMovementDoc | null }> {
    this.verifyPermission(actor, 'stock_adjustments.create');
    this.verifyBranchAccess(actor, input.branchId);
    const reason = AdjustmentReasonEnum.parse(input.reason);
    const actorUid = this.getActorUid(actor);
    const entryDate = getCurrentRiyadhDate();
    const periodId = await this.resolveOpenPeriod(input.tenantId, entryDate);
    const accounts = await this.resolveInventoryAccounts(input.tenantId);

    let outboxIdToFlush: string | null = null;
    let adjustmentPathToUpdate: string | undefined;

    const txRes = await this.firestore.runTransaction(async (tx) => {
      const prodRef = this.firestore.doc(firestorePaths.product(input.tenantId, input.productId));
      const balanceId = makeInventoryBalanceId(input.branchId, input.productId);
      const balRef = this.firestore.doc(firestorePaths.inventoryBalance(input.tenantId, balanceId));
      const [prodSnap, balSnap] = await Promise.all([tx.get(prodRef), tx.get(balRef)]);
      if (!prodSnap.exists) {
        throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'المنتج غير موجود.');
      }
      const product = ProductDocSchema.parse(prodSnap.data());
      const currentBal = balSnap.exists ? InventoryBalanceDocSchema.parse(balSnap.data()) : null;
      const beforeQty = currentBal?.quantityOnHand ?? 0;
      const unitCostHalalas =
        input.unitCostHalalas ?? currentBal?.averageCostHalalas ?? product.purchaseCostHalalas;
      const totalValueHalalas = input.quantity * unitCostHalalas;

      const canApprove =
        TrustedSystemContext.isTrusted(actor) ||
        actor.isPlatformAdmin ||
        hasPermission(actor.role, 'stock_adjustments.approve', actor.customPermissions);
      const requiresApproval =
        totalValueHalalas > HIGH_VALUE_ADJUSTMENT_THRESHOLD_HALALAS && !canApprove;

      const adjRef = this.firestore.collection(firestorePaths.stockAdjustments(input.tenantId)).doc();
      const nowIso = new Date().toISOString();

      if (requiresApproval) {
        const adj = StockAdjustmentDocSchema.parse({
          id: adjRef.id,
          tenantId: input.tenantId,
          branchId: input.branchId,
          productId: product.id,
          productNameAr: product.nameAr,
          unit: product.unit,
          reason,
          reasonDetails: input.reasonDetails.trim(),
          direction: input.direction,
          quantity: input.quantity,
          beforeQuantity: beforeQty,
          afterQuantity:
            input.direction === 'IN' ? beforeQty + input.quantity : Math.max(0, beforeQty - input.quantity),
          unitCostHalalas,
          totalValueHalalas,
          status: 'PENDING_APPROVAL',
          movementId: null,
          journalEntryId: null,
          idempotencyKey: input.idempotencyKey,
          requestedBy: actorUid,
          approvedBy: null,
          approvedAt: null,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        tx.set(adjRef, adj);
        return { adjustment: adj, movement: null };
      }

      const movementType: StockMovementType =
        reason === 'DAMAGE'
          ? 'DAMAGE'
          : reason === 'EXPIRATION'
            ? 'EXPIRED'
            : input.direction === 'IN'
              ? 'ADJUSTMENT_IN'
              : 'ADJUSTMENT_OUT';

      const moved = await this.applyStockMovementInTx(tx, {
        tenantId: input.tenantId,
        branchId: input.branchId,
        product,
        movementType,
        direction: input.direction,
        quantity: input.quantity,
        unitCostHalalas,
        relatedDocumentType: 'STOCK_ADJUSTMENT',
        relatedDocumentId: adjRef.id,
        reason: `${reason}: ${input.reasonDetails.trim()}`,
        idempotencyKey: input.idempotencyKey,
        actorUid,
        nowIso,
        preloadedBalanceSnap: balSnap,
      });

      const adj = StockAdjustmentDocSchema.parse({
        id: adjRef.id,
        tenantId: input.tenantId,
        branchId: input.branchId,
        productId: product.id,
        productNameAr: product.nameAr,
        unit: product.unit,
        reason,
        reasonDetails: input.reasonDetails.trim(),
        direction: input.direction,
        quantity: input.quantity,
        beforeQuantity: moved.movement.balanceBefore,
        afterQuantity: moved.movement.balanceAfter,
        unitCostHalalas: moved.movement.unitCostHalalas,
        totalValueHalalas: moved.movement.totalCostHalalas,
        status: 'APPLIED',
        movementId: moved.movement.id,
        journalEntryId: null,
        idempotencyKey: input.idempotencyKey,
        requestedBy: actorUid,
        approvedBy: actorUid,
        approvedAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      tx.set(adjRef, adj);

      if (moved.movement.totalCostHalalas > 0) {
        const outboxRef = this.firestore
          .collection(firestorePaths.inventoryAccountingOutbox(input.tenantId))
          .doc();
        const lines =
          input.direction === 'IN'
            ? [
                {
                  accountId: accounts.inventory.id,
                  accountCode: accounts.inventory.code,
                  accountNameAr: accounts.inventory.nameAr,
                  debitHalalas: moved.movement.totalCostHalalas,
                  creditHalalas: 0,
                  descriptionAr: `تسوية مخزنية بالزيادة (${product.nameAr})`,
                  branchId: input.branchId,
                },
                {
                  accountId: accounts.cogsConsumables.id,
                  accountCode: accounts.cogsConsumables.code,
                  accountNameAr: accounts.cogsConsumables.nameAr,
                  debitHalalas: 0,
                  creditHalalas: moved.movement.totalCostHalalas,
                  descriptionAr: `عكس تكلفة تسوية مخزنية (${product.nameAr})`,
                  branchId: input.branchId,
                },
              ]
            : [
                {
                  accountId: accounts.cogsConsumables.id,
                  accountCode: accounts.cogsConsumables.code,
                  accountNameAr: accounts.cogsConsumables.nameAr,
                  debitHalalas: moved.movement.totalCostHalalas,
                  creditHalalas: 0,
                  descriptionAr: `تسوية مخزنية بالعجز/التلف (${product.nameAr})`,
                  branchId: input.branchId,
                },
                {
                  accountId: accounts.inventory.id,
                  accountCode: accounts.inventory.code,
                  accountNameAr: accounts.inventory.nameAr,
                  debitHalalas: 0,
                  creditHalalas: moved.movement.totalCostHalalas,
                  descriptionAr: `تخفيض المخزون (${product.nameAr})`,
                  branchId: input.branchId,
                },
              ];

        tx.set(
          outboxRef,
          InventoryAccountingOutboxDocSchema.parse({
            id: outboxRef.id,
            tenantId: input.tenantId,
            eventType: 'STOCK_ADJUSTMENT',
            sourceId: adj.id,
            entryDate,
            periodId,
            descriptionAr: `تسوية مخزنية: ${product.nameAr} (${reason})`,
            lines,
            status: 'PENDING',
            journalEntryId: null,
            errorMessage: null,
            createdAt: nowIso,
            postedAt: null,
          })
        );
        outboxIdToFlush = outboxRef.id;
        adjustmentPathToUpdate = adjRef.path;
      }

      const auditRef = this.firestore
        .collection(firestorePaths.inventoryAuditTrail(input.tenantId))
        .doc();
      tx.set(
        auditRef,
        InventoryAuditDocSchema.parse({
          id: auditRef.id,
          tenantId: input.tenantId,
          branchId: input.branchId,
          action: 'STOCK_ADJUSTED',
          entityType: 'STOCK_ADJUSTMENT',
          entityId: adj.id,
          actorUid,
          idempotencyKey: input.idempotencyKey,
          details: { productId: product.id, direction: input.direction, quantity: input.quantity },
          timestamp: nowIso,
        })
      );

      return { adjustment: adj, movement: moved.movement };
    });

    if (outboxIdToFlush) {
      await this.flushOutboxEntry(actor, input.tenantId, outboxIdToFlush, adjustmentPathToUpdate);
    }

    return txRes;
  }

  async approveStockAdjustment(
    actor: InventoryActor,
    input: { tenantId: string; adjustmentId: string }
  ): Promise<StockAdjustmentDoc> {
    this.verifyPermission(actor, 'stock_adjustments.approve');
    const actorUid = this.getActorUid(actor);
    const entryDate = getCurrentRiyadhDate();
    const periodId = await this.resolveOpenPeriod(input.tenantId, entryDate);
    const accounts = await this.resolveInventoryAccounts(input.tenantId);
    const adjRef = this.firestore.doc(
      firestorePaths.stockAdjustment(input.tenantId, input.adjustmentId)
    );

    let outboxIdToFlush: string | null = null;
    const updated = await this.firestore.runTransaction(async (tx) => {
      const adjSnap = await tx.get(adjRef);
      if (!adjSnap.exists) {
        throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'طلب التسوية غير موجود.');
      }
      const adj = StockAdjustmentDocSchema.parse(adjSnap.data());
      if (adj.status !== 'PENDING_APPROVAL') {
        throw new InventoryError(InventoryErrorCode.STATE_INVALID, 'طلب التسوية ليس بانتظار الاعتماد.');
      }
      const prodSnap = await tx.get(
        this.firestore.doc(firestorePaths.product(input.tenantId, adj.productId))
      );
      const product = ProductDocSchema.parse(prodSnap.data());
      const nowIso = new Date().toISOString();

      const movementType: StockMovementType =
        adj.reason === 'DAMAGE'
          ? 'DAMAGE'
          : adj.reason === 'EXPIRATION'
            ? 'EXPIRED'
            : adj.direction === 'IN'
              ? 'ADJUSTMENT_IN'
              : 'ADJUSTMENT_OUT';

      const moved = await this.applyStockMovementInTx(tx, {
        tenantId: input.tenantId,
        branchId: adj.branchId,
        product,
        movementType,
        direction: adj.direction,
        quantity: adj.quantity,
        unitCostHalalas: adj.unitCostHalalas,
        relatedDocumentType: 'STOCK_ADJUSTMENT',
        relatedDocumentId: adj.id,
        reason: `${adj.reason}: ${adj.reasonDetails}`,
        idempotencyKey: adj.idempotencyKey,
        actorUid,
        nowIso,
      });

      const nextAdj = StockAdjustmentDocSchema.parse({
        ...adj,
        beforeQuantity: moved.movement.balanceBefore,
        afterQuantity: moved.movement.balanceAfter,
        totalValueHalalas: moved.movement.totalCostHalalas,
        status: 'APPLIED',
        movementId: moved.movement.id,
        approvedBy: actorUid,
        approvedAt: nowIso,
        updatedAt: nowIso,
      });
      tx.set(adjRef, nextAdj);

      if (moved.movement.totalCostHalalas > 0) {
        const outboxRef = this.firestore
          .collection(firestorePaths.inventoryAccountingOutbox(input.tenantId))
          .doc();
        const lines =
          adj.direction === 'IN'
            ? [
                {
                  accountId: accounts.inventory.id,
                  accountCode: accounts.inventory.code,
                  accountNameAr: accounts.inventory.nameAr,
                  debitHalalas: moved.movement.totalCostHalalas,
                  creditHalalas: 0,
                  descriptionAr: `تسوية مخزنية معتمدة (${product.nameAr})`,
                  branchId: adj.branchId,
                },
                {
                  accountId: accounts.cogsConsumables.id,
                  accountCode: accounts.cogsConsumables.code,
                  accountNameAr: accounts.cogsConsumables.nameAr,
                  debitHalalas: 0,
                  creditHalalas: moved.movement.totalCostHalalas,
                  descriptionAr: `عكس تكلفة تسوية (${product.nameAr})`,
                  branchId: adj.branchId,
                },
              ]
            : [
                {
                  accountId: accounts.cogsConsumables.id,
                  accountCode: accounts.cogsConsumables.code,
                  accountNameAr: accounts.cogsConsumables.nameAr,
                  debitHalalas: moved.movement.totalCostHalalas,
                  creditHalalas: 0,
                  descriptionAr: `تسوية مخزنية معتمدة (${product.nameAr})`,
                  branchId: adj.branchId,
                },
                {
                  accountId: accounts.inventory.id,
                  accountCode: accounts.inventory.code,
                  accountNameAr: accounts.inventory.nameAr,
                  debitHalalas: 0,
                  creditHalalas: moved.movement.totalCostHalalas,
                  descriptionAr: `تخفيض المخزون (${product.nameAr})`,
                  branchId: adj.branchId,
                },
              ];

        tx.set(
          outboxRef,
          InventoryAccountingOutboxDocSchema.parse({
            id: outboxRef.id,
            tenantId: input.tenantId,
            eventType: 'STOCK_ADJUSTMENT',
            sourceId: nextAdj.id,
            entryDate,
            periodId,
            descriptionAr: `اعتماد تسوية مخزنية: ${product.nameAr}`,
            lines,
            status: 'PENDING',
            journalEntryId: null,
            errorMessage: null,
            createdAt: nowIso,
            postedAt: null,
          })
        );
        outboxIdToFlush = outboxRef.id;
      }

      return nextAdj;
    });

    if (outboxIdToFlush) {
      await this.flushOutboxEntry(actor, input.tenantId, outboxIdToFlush, adjRef.path);
    }

    return updated;
  }

  async startStockCount(
    actor: InventoryActor,
    input: { tenantId: string; branchId: string; productIds?: string[]; notes?: string }
  ): Promise<StockCountDoc> {
    this.verifyPermission(actor, 'stock_counts.conduct');
    this.verifyBranchAccess(actor, input.branchId);
    const actorUid = this.getActorUid(actor);

    const [branchSnap, products, balances] = await Promise.all([
      this.firestore.doc(firestorePaths.branch(input.tenantId, input.branchId)).get(),
      this.listProducts(actor, input.tenantId, { status: 'ACTIVE' }),
      this.listBalances(actor, input.tenantId, { branchId: input.branchId }),
    ]);
    if (!branchSnap.exists) {
      throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'الفرع غير موجود.');
    }
    const branch = BranchDocSchema.parse(branchSnap.data());
    const balByProd = new Map(balances.map((b) => [b.productId, b]));
    const targetProducts =
      input.productIds && input.productIds.length > 0
        ? products.filter((p) => input.productIds!.includes(p.id))
        : products.filter((p) => p.stockTrackingEnabled);

    if (targetProducts.length === 0) {
      throw new InventoryError(InventoryErrorCode.INVALID_PAYLOAD, 'لا توجد منتجات متاحة للجرد.');
    }

    const nowIso = new Date().toISOString();
    const countRef = this.firestore.collection(firestorePaths.stockCounts(input.tenantId)).doc();
    const doc = StockCountDocSchema.parse({
      id: countRef.id,
      tenantId: input.tenantId,
      branchId: branch.id,
      branchName: branch.name,
      countDate: getCurrentRiyadhDate(),
      items: targetProducts.map((p) => {
        const bal = balByProd.get(p.id);
        return {
          productId: p.id,
          productNameAr: p.nameAr,
          unit: p.unit,
          expectedQuantity: bal?.quantityOnHand ?? 0,
          countedQuantity: null,
          varianceQuantity: 0,
          unitCostHalalas: bal?.averageCostHalalas ?? p.purchaseCostHalalas,
          varianceValueHalalas: 0,
        };
      }),
      status: 'IN_PROGRESS',
      notes: input.notes?.trim() || '',
      createdBy: actorUid,
      submittedBy: null,
      submittedAt: null,
      approvedBy: null,
      approvedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    await countRef.set(doc);
    return doc;
  }

  async submitStockCount(
    actor: InventoryActor,
    input: {
      tenantId: string;
      countId: string;
      counts: Array<{ productId: string; countedQuantity: number }>;
    }
  ): Promise<StockCountDoc> {
    this.verifyPermission(actor, 'stock_counts.conduct');
    const actorUid = this.getActorUid(actor);
    const ref = this.firestore.doc(firestorePaths.stockCount(input.tenantId, input.countId));
    const snap = await ref.get();
    if (!snap.exists) {
      throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'جلسة الجرد غير موجودة.');
    }
    const existing = StockCountDocSchema.parse(snap.data());
    this.verifyBranchAccess(actor, existing.branchId);
    if (existing.status !== 'IN_PROGRESS') {
      throw new InventoryError(InventoryErrorCode.STATE_INVALID, 'لا يمكن تعديل جرد مكتمل أو ملغى.');
    }

    const countMap = new Map(input.counts.map((c) => [c.productId, c.countedQuantity]));
    const updatedItems = existing.items.map((item) => {
      const counted = countMap.get(item.productId) ?? item.countedQuantity ?? item.expectedQuantity;
      const varianceQuantity = counted - item.expectedQuantity;
      return {
        ...item,
        countedQuantity: counted,
        varianceQuantity,
        varianceValueHalalas: varianceQuantity * item.unitCostHalalas,
      };
    });

    const nowIso = new Date().toISOString();
    const updated = StockCountDocSchema.parse({
      ...existing,
      items: updatedItems,
      status: 'SUBMITTED',
      submittedBy: actorUid,
      submittedAt: nowIso,
      updatedAt: nowIso,
    });
    await ref.set(updated);
    return updated;
  }

  async approveAndApplyStockCount(
    actor: InventoryActor,
    input: { tenantId: string; countId: string }
  ): Promise<StockCountDoc> {
    this.verifyPermission(actor, 'stock_adjustments.approve');
    const actorUid = this.getActorUid(actor);
    const ref = this.firestore.doc(firestorePaths.stockCount(input.tenantId, input.countId));
    const snap = await ref.get();
    if (!snap.exists) {
      throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'جلسة الجرد غير موجودة.');
    }
    const countDoc = StockCountDocSchema.parse(snap.data());
    if (countDoc.status !== 'SUBMITTED') {
      throw new InventoryError(InventoryErrorCode.STATE_INVALID, 'جلسة الجرد يجب أن تكون مقدمة للاعتماد.');
    }

    for (const item of countDoc.items) {
      if (item.varianceQuantity !== 0) {
        await this.createStockAdjustment(actor, {
          tenantId: input.tenantId,
          branchId: countDoc.branchId,
          productId: item.productId,
          reason: 'PHYSICAL_COUNT',
          reasonDetails: `مطابقة جرد فعلي (${countDoc.id})`,
          direction: item.varianceQuantity > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(item.varianceQuantity),
          unitCostHalalas: item.unitCostHalalas,
          idempotencyKey: `count_${countDoc.id}_${item.productId}`,
        });
      }
    }

    const nowIso = new Date().toISOString();
    const approved = StockCountDocSchema.parse({
      ...countDoc,
      status: 'APPROVED_AND_APPLIED',
      approvedBy: actorUid,
      approvedAt: nowIso,
      updatedAt: nowIso,
    });
    await ref.set(approved);

    const auditRef = this.firestore.collection(firestorePaths.inventoryAuditTrail(input.tenantId)).doc();
    await auditRef.set(
      InventoryAuditDocSchema.parse({
        id: auditRef.id,
        tenantId: input.tenantId,
        branchId: countDoc.branchId,
        action: 'STOCK_COUNT_COMPLETED',
        entityType: 'STOCK_COUNT',
        entityId: countDoc.id,
        actorUid,
        idempotencyKey: null,
        details: { itemCount: countDoc.items.length },
        timestamp: nowIso,
      })
    );

    return approved;
  }

  async listStockAdjustments(
    actor: InventoryActor,
    tenantId: string,
    filters?: { branchId?: string; limit?: number }
  ): Promise<StockAdjustmentDoc[]> {
    this.verifyPermission(actor, 'inventory.read');
    if (filters?.branchId) this.verifyBranchAccess(actor, filters.branchId);
    let query: any = this.firestore.collection(firestorePaths.stockAdjustments(tenantId));
    if (filters?.branchId) query = query.where('branchId', '==', filters.branchId);
    const snap = await query.orderBy('createdAt', 'desc').limit(filters?.limit || 100).get();
    return snap.docs.map((d: any) => StockAdjustmentDocSchema.parse(d.data()));
  }

  async listStockCounts(
    actor: InventoryActor,
    tenantId: string,
    filters?: { branchId?: string; limit?: number }
  ): Promise<StockCountDoc[]> {
    this.verifyPermission(actor, 'inventory.read');
    if (filters?.branchId) this.verifyBranchAccess(actor, filters.branchId);
    let query: any = this.firestore.collection(firestorePaths.stockCounts(tenantId));
    if (filters?.branchId) query = query.where('branchId', '==', filters.branchId);
    const snap = await query.orderBy('createdAt', 'desc').limit(filters?.limit || 50).get();
    return snap.docs.map((d: any) => StockCountDocSchema.parse(d.data()));
  }

  // ============================================================================
  // 5. Branch Transfers
  // ============================================================================

  async createTransfer(
    actor: InventoryActor,
    input: {
      tenantId: string;
      sourceBranchId: string;
      destinationBranchId: string;
      lines: Array<{ productId: string; quantity: number }>;
      notes?: string;
    }
  ): Promise<StockTransferDoc> {
    this.verifyPermission(actor, 'stock_transfers.initiate');
    this.verifyBranchAccess(actor, input.sourceBranchId);
    if (input.sourceBranchId === input.destinationBranchId) {
      throw new InventoryError(
        InventoryErrorCode.INVALID_PAYLOAD,
        'لا يمكن التحويل من الفرع إلى نفسه.'
      );
    }
    if (!input.lines.length) {
      throw new InventoryError(InventoryErrorCode.INVALID_PAYLOAD, 'يجب تحديد منتج واحد على الأقل.');
    }

    const actorUid = this.getActorUid(actor);
    const [srcSnap, dstSnap] = await Promise.all([
      this.firestore.doc(firestorePaths.branch(input.tenantId, input.sourceBranchId)).get(),
      this.firestore.doc(firestorePaths.branch(input.tenantId, input.destinationBranchId)).get(),
    ]);
    if (!srcSnap.exists || !dstSnap.exists) {
      throw new InventoryError(
        InventoryErrorCode.NOT_FOUND,
        'أحد الفرعين غير موجود أو لا يتبع نفس المنشأة.'
      );
    }
    const srcBranch = BranchDocSchema.parse(srcSnap.data());
    const dstBranch = BranchDocSchema.parse(dstSnap.data());

    const transferLines = [];
    for (let i = 0; i < input.lines.length; i++) {
      const item = input.lines[i]!;
      const prodSnap = await this.firestore
        .doc(firestorePaths.product(input.tenantId, item.productId))
        .get();
      if (!prodSnap.exists) {
        throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'المنتج غير موجود.');
      }
      const prod = ProductDocSchema.parse(prodSnap.data());
      if (prod.status !== 'ACTIVE' || !prod.stockTrackingEnabled) {
        throw new InventoryError(
          InventoryErrorCode.INVALID_PAYLOAD,
          `المنتج (${prod.nameAr}) غير نشط أو غير خاضع لتتبع المخزون.`
        );
      }
      transferLines.push({
        lineId: `tline-${i + 1}`,
        productId: prod.id,
        nameArSnapshot: prod.nameAr,
        unitSnapshot: prod.unit,
        requestedQuantity: item.quantity,
        dispatchedQuantity: 0,
        receivedQuantity: 0,
        damagedOrMissingQuantity: 0,
        unitCostHalalas: 0,
        discrepancyNotes: '',
      });
    }

    const ref = this.firestore.collection(firestorePaths.stockTransfers(input.tenantId)).doc();
    const nowIso = new Date().toISOString();
    const transfer = StockTransferDocSchema.parse({
      id: ref.id,
      transferNumber: `TR-${new Date().getUTCFullYear()}-${ref.id.slice(0, 6).toUpperCase()}`,
      tenantId: input.tenantId,
      sourceBranchId: srcBranch.id,
      sourceBranchName: srcBranch.name,
      destinationBranchId: dstBranch.id,
      destinationBranchName: dstBranch.name,
      lines: transferLines,
      status: 'DRAFT',
      notes: input.notes?.trim() || '',
      createdBy: actorUid,
      approvedBy: null,
      approvedAt: null,
      dispatchedBy: null,
      dispatchedAt: null,
      dispatchIdempotencyKey: null,
      receivedBy: null,
      receivedAt: null,
      receiveIdempotencyKey: null,
      cancelledBy: null,
      cancelledAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    await ref.set(transfer);
    return transfer;
  }

  async approveTransfer(
    actor: InventoryActor,
    input: { tenantId: string; transferId: string }
  ): Promise<StockTransferDoc> {
    this.verifyPermission(actor, 'stock_transfers.approve');
    const actorUid = this.getActorUid(actor);
    const ref = this.firestore.doc(firestorePaths.stockTransfer(input.tenantId, input.transferId));
    const snap = await ref.get();
    if (!snap.exists) throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'أمر التحويل غير موجود.');
    const transfer = StockTransferDocSchema.parse(snap.data());
    if (transfer.status !== 'DRAFT') {
      throw new InventoryError(InventoryErrorCode.STATE_INVALID, 'يمكن اعتماد المسودات فقط.');
    }
    const nowIso = new Date().toISOString();
    const updated = StockTransferDocSchema.parse({
      ...transfer,
      status: 'APPROVED',
      approvedBy: actorUid,
      approvedAt: nowIso,
      updatedAt: nowIso,
    });
    await ref.set(updated);
    return updated;
  }

  async dispatchTransfer(
    actor: InventoryActor,
    input: { tenantId: string; transferId: string; idempotencyKey: string }
  ): Promise<StockTransferDoc> {
    this.verifyPermission(actor, 'stock_transfers.dispatch');
    const actorUid = this.getActorUid(actor);
    const ref = this.firestore.doc(firestorePaths.stockTransfer(input.tenantId, input.transferId));

    return await this.firestore.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) {
        throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'أمر التحويل غير موجود.');
      }
      const transfer = StockTransferDocSchema.parse(snap.data());
      this.verifyBranchAccess(actor, transfer.sourceBranchId);

      if (
        transfer.status === 'IN_TRANSIT' &&
        transfer.dispatchIdempotencyKey === input.idempotencyKey
      ) {
        return transfer;
      }
      if (transfer.status !== 'APPROVED') {
        throw new InventoryError(
          InventoryErrorCode.STATE_INVALID,
          `لا يمكن شحن التحويل في حالته الحالية (${transfer.status}).`
        );
      }

      const nowIso = new Date().toISOString();
      const updatedLines = [];
      for (const line of transfer.lines) {
        const prodSnap = await tx.get(
          this.firestore.doc(firestorePaths.product(input.tenantId, line.productId))
        );
        const product = ProductDocSchema.parse(prodSnap.data());
        const moved = await this.applyStockMovementInTx(tx, {
          tenantId: input.tenantId,
          branchId: transfer.sourceBranchId,
          product,
          movementType: 'TRANSFER_OUT',
          direction: 'OUT',
          quantity: line.requestedQuantity,
          unitCostHalalas: 0, // consumes at source WAC
          relatedDocumentType: 'STOCK_TRANSFER',
          relatedDocumentId: transfer.id,
          reason: `تحويل مخزني صادر إلى ${transfer.destinationBranchName}`,
          idempotencyKey: `tr_out_${transfer.id}_${line.lineId}`,
          actorUid,
          nowIso,
        });

        updatedLines.push({
          ...line,
          dispatchedQuantity: line.requestedQuantity,
          unitCostHalalas: moved.movement.unitCostHalalas,
        });
      }

      const nextTransfer = StockTransferDocSchema.parse({
        ...transfer,
        lines: updatedLines,
        status: 'IN_TRANSIT',
        dispatchedBy: actorUid,
        dispatchedAt: nowIso,
        dispatchIdempotencyKey: input.idempotencyKey,
        updatedAt: nowIso,
      });
      tx.set(ref, nextTransfer);

      const auditRef = this.firestore
        .collection(firestorePaths.inventoryAuditTrail(input.tenantId))
        .doc();
      tx.set(
        auditRef,
        InventoryAuditDocSchema.parse({
          id: auditRef.id,
          tenantId: input.tenantId,
          branchId: transfer.sourceBranchId,
          action: 'STOCK_TRANSFER_DISPATCHED',
          entityType: 'STOCK_TRANSFER',
          entityId: transfer.id,
          actorUid,
          idempotencyKey: input.idempotencyKey,
          details: { transferNumber: transfer.transferNumber },
          timestamp: nowIso,
        })
      );

      return nextTransfer;
    });
  }

  async receiveTransfer(
    actor: InventoryActor,
    input: {
      tenantId: string;
      transferId: string;
      idempotencyKey: string;
      lines?: Array<{
        lineId: string;
        receivedQuantity: number;
        damagedOrMissingQuantity?: number;
        discrepancyNotes?: string;
      }>;
    }
  ): Promise<StockTransferDoc> {
    this.verifyPermission(actor, 'stock_transfers.receive');
    const actorUid = this.getActorUid(actor);
    const ref = this.firestore.doc(firestorePaths.stockTransfer(input.tenantId, input.transferId));

    return await this.firestore.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) {
        throw new InventoryError(InventoryErrorCode.NOT_FOUND, 'أمر التحويل غير موجود.');
      }
      const transfer = StockTransferDocSchema.parse(snap.data());
      this.verifyBranchAccess(actor, transfer.destinationBranchId);

      if (
        transfer.status === 'RECEIVED' &&
        transfer.receiveIdempotencyKey === input.idempotencyKey
      ) {
        return transfer;
      }
      if (transfer.status !== 'IN_TRANSIT') {
        throw new InventoryError(
          InventoryErrorCode.STATE_INVALID,
          'يجب أن يكون التحويل في حالة (قيد النقل) لإتمام الاستلام.'
        );
      }

      const inputMap = new Map((input.lines || []).map((l) => [l.lineId, l]));
      const nowIso = new Date().toISOString();
      const updatedLines = [];

      for (const line of transfer.lines) {
        const override = inputMap.get(line.lineId);
        const receivedQty = override?.receivedQuantity ?? line.dispatchedQuantity;
        const damagedQty = override?.damagedOrMissingQuantity ?? 0;

        if (receivedQty < 0 || damagedQty < 0 || receivedQty + damagedQty !== line.dispatchedQuantity) {
          throw new InventoryError(
            InventoryErrorCode.INVALID_PAYLOAD,
            `مجموع المستلم والتالف/المفقود (${receivedQty + damagedQty}) يجب أن يطابق الكمية المشحونة (${line.dispatchedQuantity}).`
          );
        }

        if (receivedQty > 0) {
          const prodSnap = await tx.get(
            this.firestore.doc(firestorePaths.product(input.tenantId, line.productId))
          );
          const product = ProductDocSchema.parse(prodSnap.data());
          await this.applyStockMovementInTx(tx, {
            tenantId: input.tenantId,
            branchId: transfer.destinationBranchId,
            product,
            movementType: 'TRANSFER_IN',
            direction: 'IN',
            quantity: receivedQty,
            unitCostHalalas: line.unitCostHalalas,
            relatedDocumentType: 'STOCK_TRANSFER',
            relatedDocumentId: transfer.id,
            reason: `استلام تحويل مخزني من ${transfer.sourceBranchName}`,
            idempotencyKey: `tr_in_${transfer.id}_${line.lineId}`,
            actorUid,
            nowIso,
          });
        }

        updatedLines.push({
          ...line,
          receivedQuantity: receivedQty,
          damagedOrMissingQuantity: damagedQty,
          discrepancyNotes: override?.discrepancyNotes?.trim() || '',
        });
      }

      const nextTransfer = StockTransferDocSchema.parse({
        ...transfer,
        lines: updatedLines,
        status: 'RECEIVED',
        receivedBy: actorUid,
        receivedAt: nowIso,
        receiveIdempotencyKey: input.idempotencyKey,
        updatedAt: nowIso,
      });
      tx.set(ref, nextTransfer);

      const auditRef = this.firestore
        .collection(firestorePaths.inventoryAuditTrail(input.tenantId))
        .doc();
      tx.set(
        auditRef,
        InventoryAuditDocSchema.parse({
          id: auditRef.id,
          tenantId: input.tenantId,
          branchId: transfer.destinationBranchId,
          action: 'STOCK_TRANSFER_RECEIVED',
          entityType: 'STOCK_TRANSFER',
          entityId: transfer.id,
          actorUid,
          idempotencyKey: input.idempotencyKey,
          details: { transferNumber: transfer.transferNumber },
          timestamp: nowIso,
        })
      );

      return nextTransfer;
    });
  }

  async listTransfers(
    actor: InventoryActor,
    tenantId: string,
    filters?: { limit?: number }
  ): Promise<StockTransferDoc[]> {
    this.verifyPermission(actor, 'inventory.read');
    const snap = await this.firestore
      .collection(firestorePaths.stockTransfers(tenantId))
      .orderBy('createdAt', 'desc')
      .limit(filters?.limit || 100)
      .get();
    return snap.docs.map((d) => StockTransferDocSchema.parse(d.data()));
  }

  // ============================================================================
  // 6. Reconciliation & Discrepancy Detection
  // ============================================================================

  async runReconciliation(
    actor: InventoryActor,
    tenantId: string,
    options?: { repairOutbox?: boolean }
  ): Promise<{
    balanced: boolean;
    discrepancies: Array<{ type: string; entityId: string; message: string }>;
    repairedOutboxIds: string[];
  }> {
    this.verifyPermission(actor, 'inventory_reconciliation.run');
    const [balancesSnap, movementsSnap, transfersSnap, outboxSnap] = await Promise.all([
      this.firestore.collection(firestorePaths.inventoryBalances(tenantId)).get(),
      this.firestore.collection(firestorePaths.stockMovements(tenantId)).get(),
      this.firestore.collection(firestorePaths.stockTransfers(tenantId)).get(),
      this.firestore.collection(firestorePaths.inventoryAccountingOutbox(tenantId)).get(),
    ]);

    const discrepancies: Array<{ type: string; entityId: string; message: string }> = [];
    const repairedOutboxIds: string[] = [];

    const movementSumByBal = new Map<string, number>();
    const seenMovementIdem = new Set<string>();
    for (const d of movementsSnap.docs) {
      const m = StockMovementDocSchema.parse(d.data());
      if (seenMovementIdem.has(m.idempotencyKey)) {
        discrepancies.push({
          type: 'DUPLICATE_MOVEMENT_IDEMPOTENCY',
          entityId: m.id,
          message: `تكرار مفتاح الحركة (${m.idempotencyKey})`,
        });
      }
      seenMovementIdem.add(m.idempotencyKey);
      const bId = makeInventoryBalanceId(m.branchId, m.productId);
      const delta = m.direction === 'IN' ? m.quantity : m.direction === 'OUT' ? -m.quantity : 0;
      movementSumByBal.set(bId, (movementSumByBal.get(bId) ?? 0) + delta);
    }

    const seenBalanceIds = new Set<string>();
    for (const d of balancesSnap.docs) {
      const b = InventoryBalanceDocSchema.parse(d.data());
      seenBalanceIds.add(b.id);
      const ledgerQty = movementSumByBal.get(b.id);
      if (ledgerQty === undefined && b.quantityOnHand !== 0) {
        discrepancies.push({
          type: 'BALANCE_WITHOUT_MOVEMENTS',
          entityId: b.id,
          message: `الرصيد (${b.quantityOnHand}) لا يقابله حركات مخزنية.`,
        });
      } else if (ledgerQty !== undefined && ledgerQty !== b.quantityOnHand) {
        discrepancies.push({
          type: 'BALANCE_MOVEMENT_MISMATCH',
          entityId: b.id,
          message: `الرصيد المسجل (${b.quantityOnHand}) لا يطابق مجموع الحركات (${ledgerQty}).`,
        });
      }
    }

    for (const [bId, qty] of movementSumByBal.entries()) {
      if (!seenBalanceIds.has(bId) && qty !== 0) {
        discrepancies.push({
          type: 'MOVEMENT_WITHOUT_BALANCE',
          entityId: bId,
          message: `حركات مخزنية بصافي (${qty}) بدون سجل رصيد.`,
        });
      }
    }

    for (const d of transfersSnap.docs) {
      const tr = StockTransferDocSchema.parse(d.data());
      if (tr.status === 'RECEIVED') {
        for (const l of tr.lines) {
          if (l.receivedQuantity + l.damagedOrMissingQuantity !== l.dispatchedQuantity) {
            discrepancies.push({
              type: 'TRANSFER_QUANTITY_MISMATCH',
              entityId: tr.id,
              message: `عدم تطابق كميات التحويل (${tr.transferNumber}) للبند ${l.lineId}.`,
            });
          }
        }
      }
    }

    for (const d of outboxSnap.docs) {
      const o = InventoryAccountingOutboxDocSchema.parse(d.data());
      if (o.status !== 'POSTED') {
        discrepancies.push({
          type: 'UNPOSTED_ACCOUNTING_OUTBOX',
          entityId: o.id,
          message: `قيد محاسبي معلق (${o.eventType}) للمستند ${o.sourceId}.`,
        });
        if (options?.repairOutbox) {
          await this.flushOutboxEntry(actor, tenantId, o.id);
          repairedOutboxIds.push(o.id);
        }
      }
    }

    return {
      balanced: discrepancies.length === 0,
      discrepancies,
      repairedOutboxIds,
    };
  }
}

