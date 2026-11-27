import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import {
  InventoryRepository,
  InventoryError,
  InventoryErrorCode,
  type InventoryActor,
} from '../src/server/repositories/inventory.repository';
import { PosRepository } from '../src/server/repositories/pos.repository';
import { AccountingRepository } from '../src/server/repositories/accounting.repository';
import { firestorePaths } from '../src/paths';

class InMemoryInventoryFirestore {
  public store = new Map<string, Record<string, unknown>>();
  private autoIdCounter = 0;
  private txChain: Promise<unknown> = Promise.resolve();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
      set: async (data: Record<string, unknown>, options?: { merge?: boolean }) => {
        if (options?.merge) {
          const current = this.store.get(path) || {};
          this.store.set(path, { ...current, ...JSON.parse(JSON.stringify(data)) });
        } else {
          this.store.set(path, JSON.parse(JSON.stringify(data)));
        }
      },
      update: async (data: Record<string, unknown>) => {
        const current = this.store.get(path) || {};
        this.store.set(path, { ...current, ...JSON.parse(JSON.stringify(data)) });
      },
    } as unknown as DocumentReference;
  }

  collection(collectionPath: string) {
    return {
      path: collectionPath,
      doc: (id?: string) => {
        const docId = id || `auto_${++this.autoIdCounter}`;
        return this.doc(`${collectionPath}/${docId}`);
      },
      where: (field: string, op: string, value: unknown) => {
        const filters = [{ field, op, value }];
        const chain: any = {
          where: (f2: string, op2: string, val2: unknown) => {
            filters.push({ field: f2, op: op2, value: val2 });
            return chain;
          },
          orderBy: (orderField: string, dir: 'asc' | 'desc' = 'asc') => ({
            ...chain,
            limit: (lim: number) => ({
              get: async () => this.queryCollection(collectionPath, filters, orderField, dir, lim),
            }),
            get: async () => this.queryCollection(collectionPath, filters, orderField, dir),
          }),
          limit: (lim: number) => ({
            get: async () => this.queryCollection(collectionPath, filters, undefined, 'asc', lim),
          }),
          get: async () => this.queryCollection(collectionPath, filters),
        };
        return chain;
      },
      orderBy: (orderField: string, dir: 'asc' | 'desc' = 'asc') => ({
        limit: (lim: number) => ({
          get: async () => this.queryCollection(collectionPath, [], orderField, dir, lim),
        }),
        get: async () => this.queryCollection(collectionPath, [], orderField, dir),
      }),
      get: async () => this.queryCollection(collectionPath, []),
    };
  }

  private async queryCollection(
    collectionPath: string,
    filters: Array<{ field: string; op: string; value: unknown }>,
    orderField?: string,
    dir: 'asc' | 'desc' = 'asc',
    lim?: number
  ) {
    let docs: DocumentSnapshot[] = [];
    for (const [p, data] of this.store.entries()) {
      if (
        p.startsWith(collectionPath + '/') &&
        p.split('/').length === collectionPath.split('/').length + 1
      ) {
        const match = filters.every((flt) => {
          const val = data?.[flt.field];
          if (flt.op === '==') return val === flt.value;
          if (flt.op === '<=') return String(val) <= String(flt.value);
          if (flt.op === '>=') return String(val) >= String(flt.value);
          return false;
        });
        if (match) docs.push(this.createSnapshot(p));
      }
    }
    if (orderField) {
      docs.sort((a, b) => {
        const va = String((a.data() as any)?.[orderField] ?? '');
        const vb = String((b.data() as any)?.[orderField] ?? '');
        return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    if (lim !== undefined) docs = docs.slice(0, lim);
    return { docs, empty: docs.length === 0 };
  }

  private createSnapshot(path: string): DocumentSnapshot {
    const exists = this.store.has(path);
    const data = exists ? JSON.parse(JSON.stringify(this.store.get(path))) : undefined;
    return {
      id: path.split('/').pop()!,
      ref: this.doc(path),
      exists,
      data: () => data,
    } as unknown as DocumentSnapshot;
  }

  setDocumentDirect(path: string, data: Record<string, unknown>) {
    this.store.set(path, JSON.parse(JSON.stringify(data)));
  }

  async runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    const run = async (): Promise<T> => {
      const stagedWrites = new Map<string, Record<string, unknown>>();
      const stagedDeletes = new Set<string>();

      const mockTransaction: Transaction = {
        get: async (target: DocumentReference | { get: () => Promise<{ docs: DocumentSnapshot[] }> }) => {
          if ('path' in target) {
            if (stagedWrites.has(target.path)) {
              const data = JSON.parse(JSON.stringify(stagedWrites.get(target.path)));
              return {
                id: target.id,
                ref: target,
                exists: true,
                data: () => data,
              } as unknown as DocumentSnapshot;
            }
            return this.createSnapshot(target.path);
          }
          return (await target.get()) as any;
        },
        set: (
          ref: DocumentReference,
          data: Record<string, unknown>,
          options?: { merge?: boolean }
        ) => {
          if (options?.merge) {
            const current = stagedWrites.get(ref.path) || this.store.get(ref.path) || {};
            stagedWrites.set(ref.path, { ...current, ...JSON.parse(JSON.stringify(data)) });
          } else {
            stagedWrites.set(ref.path, JSON.parse(JSON.stringify(data)));
          }
          return mockTransaction;
        },
        update: (ref: DocumentReference, data: Record<string, unknown>) => {
          const current = stagedWrites.get(ref.path) || this.store.get(ref.path) || {};
          stagedWrites.set(ref.path, { ...current, ...JSON.parse(JSON.stringify(data)) });
          return mockTransaction;
        },
        delete: (ref: DocumentReference) => {
          stagedDeletes.add(ref.path);
          return mockTransaction;
        },
      } as unknown as Transaction;

      const result = await updateFunction(mockTransaction);
      for (const [p, data] of stagedWrites.entries()) {
        this.store.set(p, data);
      }
      for (const p of stagedDeletes) {
        this.store.delete(p);
      }
      return result;
    };

    const next = this.txChain.then(run, run);
    this.txChain = next.catch(() => {});
    return next;
  }
}

describe('InventoryRepository & POS Inventory Integration', () => {
  let db: InMemoryInventoryFirestore;
  let invRepo: InventoryRepository;
  let posRepo: PosRepository;
  let accountingRepo: AccountingRepository;

  const tenantId = 'tenant_inv_1';
  const branch1 = 'branch_1';
  const branch2 = 'branch_2';
  const customerId = 'cust_1';

  const ownerActor: InventoryActor = {
    uid: 'owner_1',
    role: 'OWNER',
    assignedBranchIds: null,
  };
  const managerActor: InventoryActor = {
    uid: 'mgr_1',
    role: 'MANAGER',
    assignedBranchIds: [branch1, branch2],
  };
  const staffActor: InventoryActor = {
    uid: 'staff_1',
    role: 'STAFF',
    assignedBranchIds: [branch1],
  };

  function seedBase() {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const lastDay = new Date(Date.UTC(yyyy, now.getUTCMonth() + 1, 0)).getUTCDate();
    const periodId = `${yyyy}-${mm}`;

    db.setDocumentDirect(firestorePaths.accountingPeriod(tenantId, periodId), {
      id: periodId,
      tenantId,
      fiscalYearId: `fy_${yyyy}`,
      periodNumber: now.getUTCMonth() + 1,
      nameAr: `فترة ${periodId}`,
      nameEn: `Period ${periodId}`,
      startDate: `${yyyy}-${mm}-01`,
      endDate: `${yyyy}-${mm}-${String(lastDay).padStart(2, '0')}`,
      status: 'OPEN',
      closedAt: null,
      closedByUid: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const accounts = [
      { id: 'account-1010', code: '1010', nameAr: 'الصندوق', type: 'ASSET', normal: 'DEBIT' },
      { id: 'account-1020', code: '1020', nameAr: 'البنك', type: 'ASSET', normal: 'DEBIT' },
      { id: 'account-1030', code: '1030', nameAr: 'العملاء', type: 'ASSET', normal: 'DEBIT' },
      { id: 'account-1040', code: '1040', nameAr: 'المخزون', type: 'ASSET', normal: 'DEBIT' },
      { id: 'account-1050', code: '1050', nameAr: 'ضريبة مدخلات', type: 'ASSET', normal: 'DEBIT' },
      { id: 'account-2010', code: '2010', nameAr: 'الموردون', type: 'LIABILITY', normal: 'CREDIT' },
      { id: 'account-2030', code: '2030', nameAr: 'ضريبة مخرجات', type: 'LIABILITY', normal: 'CREDIT' },
      { id: 'account-4010', code: '4010', nameAr: 'إيرادات خدمات', type: 'REVENUE', normal: 'CREDIT' },
      { id: 'account-4020', code: '4020', nameAr: 'إيرادات منتجات', type: 'REVENUE', normal: 'CREDIT' },
      { id: 'account-4030', code: '4030', nameAr: 'الخصومات', type: 'REVENUE', normal: 'DEBIT' },
      { id: 'account-5010', code: '5010', nameAr: 'تكلفة مواد', type: 'COST_OF_GOODS', normal: 'DEBIT' },
      { id: 'account-5020', code: '5020', nameAr: 'تكلفة بضاعة مباعة', type: 'COST_OF_GOODS', normal: 'DEBIT' },
    ];
    for (const acc of accounts) {
      db.setDocumentDirect(firestorePaths.account(tenantId, acc.id), {
        id: acc.id,
        tenantId,
        code: acc.code,
        nameAr: acc.nameAr,
        nameEn: acc.nameAr,
        type: acc.type,
        normalBalance: acc.normal,
        isSystem: true,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
    }

    const makeBranch = (id: string, name: string) => ({
      id,
      tenantId,
      name,
      city: 'الرياض',
      district: 'العليا',
      country: 'SA',
      address: 'طريق الملك فهد',
      coordinates: { latitude: 24.7, longitude: 46.7 },
      phone: '+966500000001',
      isActive: true,
      operatingHours: {
        monday: { open: '09:00', close: '22:00', isClosed: false },
        tuesday: { open: '09:00', close: '22:00', isClosed: false },
        wednesday: { open: '09:00', close: '22:00', isClosed: false },
        thursday: { open: '09:00', close: '22:00', isClosed: false },
        friday: { open: '13:00', close: '22:00', isClosed: false },
        saturday: { open: '09:00', close: '22:00', isClosed: false },
        sunday: { open: '09:00', close: '22:00', isClosed: false },
      },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    db.setDocumentDirect(firestorePaths.branch(tenantId, branch1), makeBranch(branch1, 'فرع العليا'));
    db.setDocumentDirect(firestorePaths.branch(tenantId, branch2), makeBranch(branch2, 'فرع الملقا'));

    db.setDocumentDirect(firestorePaths.companyProfile(tenantId), {
      tenantId,
      legalNameAr: 'صالون الجمال الراقي',
      legalNameEn: 'Beauty Salon',
      commercialName: 'صالون الجمال',
      crNumber: '1010123456',
      unifiedEstablishmentNumber: '7001234567',
      city: 'الرياض',
      address: 'طريق الملك فهد',
      phone: '+966500000000',
      email: 'info@salon.sa',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    db.setDocumentDirect(firestorePaths.taxSettings(tenantId), {
      tenantId,
      vatStatus: 'REGISTERED',
      vatNumber: '300000000000003',
      standardVatRateBps: 1500,
      isTaxInclusivePricing: true,
      isVatExempt: false,
      verificationStatus: 'VERIFIED',
      rates: [
        {
          rateBps: 1500,
          effectiveFrom: '2020-07-01',
          effectiveUntil: null,
          nameAr: 'ضريبة 15%',
        },
      ],
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    db.setDocumentDirect(firestorePaths.tenantCustomer(tenantId, customerId), {
      id: customerId,
      tenantId,
      fullName: 'نورة العتيبي',
      normalizedPhone: '+966501112233',
      displayPhone: '0501112233',
      email: null,
      dateOfBirth: null,
      gender: 'FEMALE',
      isGuest: false,
      status: 'ACTIVE',
      tags: [],
      bookingStatistics: {
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        noShowBookings: 0,
        lastBookingAt: null,
      },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      createdBy: 'owner_1',
      updatedBy: 'owner_1',
    });
  }

  beforeEach(() => {
    db = new InMemoryInventoryFirestore();
    invRepo = new InventoryRepository(db as unknown as Firestore);
    posRepo = new PosRepository(db as unknown as Firestore);
    accountingRepo = new AccountingRepository(db as unknown as Firestore);
    seedBase();
  });

  it('enforces unique SKU & barcode per tenant and rejects negative prices', async () => {
    const cat = await invRepo.createCategory(ownerActor, {
      tenantId,
      nameAr: 'العناية بالشعر',
    });

    const p1 = await invRepo.createProduct(ownerActor, {
      tenantId,
      sku: 'SHAMP-001',
      barcode: '628100000001',
      nameAr: 'شامبو كيراتين',
      categoryId: cat.id,
      unit: 'BOTTLE',
      purchaseCostHalalas: 4000,
      sellingPriceHalalas: 11500,
    });
    expect(p1.sku).toBe('SHAMP-001');

    // Duplicate SKU rejected
    await expect(
      invRepo.createProduct(ownerActor, {
        tenantId,
        sku: 'shamp-001',
        nameAr: 'منتج آخر',
        categoryId: cat.id,
        unit: 'BOTTLE',
        purchaseCostHalalas: 3000,
      })
    ).rejects.toMatchObject({ code: InventoryErrorCode.DUPLICATE_SKU });

    // Duplicate barcode rejected
    await expect(
      invRepo.createProduct(ownerActor, {
        tenantId,
        sku: 'SHAMP-002',
        barcode: '628100000001',
        nameAr: 'منتج آخر',
        categoryId: cat.id,
        unit: 'BOTTLE',
        purchaseCostHalalas: 3000,
      })
    ).rejects.toMatchObject({ code: InventoryErrorCode.DUPLICATE_BARCODE });

    // Negative price rejected
    await expect(
      invRepo.createProduct(ownerActor, {
        tenantId,
        sku: 'SHAMP-003',
        nameAr: 'منتج سالب',
        categoryId: cat.id,
        unit: 'BOTTLE',
        purchaseCostHalalas: -100,
      })
    ).rejects.toMatchObject({ code: InventoryErrorCode.INVALID_PAYLOAD });
  });

  it('tracks weighted average cost, prevents negative stock, and handles concurrent last-unit POS sales', async () => {
    const cat = await invRepo.createCategory(ownerActor, { tenantId, nameAr: 'العناية بالشعر' });
    const prod = await invRepo.createProduct(ownerActor, {
      tenantId,
      sku: 'SERUM-01',
      nameAr: 'سيروم أرجان',
      categoryId: cat.id,
      unit: 'BOTTLE',
      purchaseCostHalalas: 5000,
      sellingPriceHalalas: 11500,
    });

    // Opening stock: 2 units @ 50 SAR
    const openRes = await invRepo.recordOpeningBalance(ownerActor, {
      tenantId,
      branchId: branch1,
      productId: prod.id,
      quantity: 2,
      unitCostHalalas: 5000,
      idempotencyKey: 'open_serum_1',
    });
    expect(openRes.balance.quantityOnHand).toBe(2);
    expect(openRes.balance.averageCostHalalas).toBe(5000);

    // Concurrent sales of 2 units each -> only 1 succeeds, other fails with INSUFFICIENT_STOCK
    const [s1, s2] = await Promise.allSettled([
      posRepo.createAndFinalizeSale(staffActor, {
        tenantId,
        branchId: branch1,
        customerId,
        items: [{ itemType: 'PRODUCT', productId: prod.id, quantity: 2 }],
        payments: [{ method: 'CARD', amountHalalas: 23000, referenceNumber: 'MADA-1' }],
        idempotencyKey: 'pos_last_unit_1',
      }),
      posRepo.createAndFinalizeSale(staffActor, {
        tenantId,
        branchId: branch1,
        customerId,
        items: [{ itemType: 'PRODUCT', productId: prod.id, quantity: 2 }],
        payments: [{ method: 'CARD', amountHalalas: 23000, referenceNumber: 'MADA-2' }],
        idempotencyKey: 'pos_last_unit_2',
      }),
    ]);

    const fulfilled = [s1, s2].filter((r) => r.status === 'fulfilled') as PromiseFulfilledResult<any>[];
    const rejected = [s1, s2].filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0]!.reason as InventoryError).code).toBe(InventoryErrorCode.INSUFFICIENT_STOCK);

    // Stock is now 0
    const balances = await invRepo.listBalances(ownerActor, tenantId, { branchId: branch1 });
    expect(balances[0]!.quantityOnHand).toBe(0);
    expect(balances[0]!.totalValueHalalas).toBe(0);

    // Accounting journals balanced (Retail Revenue 4020 + COGS 5020 / Inventory 1040)
    const journals = await accountingRepo.listJournalEntries(tenantId);
    for (const j of journals) {
      const dr = j.lines.reduce((s, l) => s + l.debitHalalas, 0);
      const cr = j.lines.reduce((s, l) => s + l.creditHalalas, 0);
      expect(dr).toBe(cr);
      expect(dr).toBeGreaterThan(0);
    }

    // Product return: 1 sellable unit + 1 damaged unit
    const invoiceId = fulfilled[0]!.value.invoice.id;
    const lineId = fulfilled[0]!.value.invoice.lineItems[0]!.lineId;
    const ret = await posRepo.returnSaleProduct(ownerActor, {
      tenantId,
      invoiceId,
      lineId,
      sellableQuantity: 1,
      damagedQuantity: 1,
      reason: 'عبوة تالفة وأخرى سليمة',
      idempotencyKey: 'ret_serum_1',
    });
    expect(ret.sellableMovementId).toBeTruthy();
    expect(ret.damagedAuditId).toBeTruthy();

    // Only 1 sellable unit returned to stock
    const balancesAfterRet = await invRepo.listBalances(ownerActor, tenantId, { branchId: branch1 });
    expect(balancesAfterRet[0]!.quantityOnHand).toBe(1);
  });

  it('handles branch transfers with cost preservation, idempotent dispatch, and discrepancy receipt', async () => {
    const cat = await invRepo.createCategory(ownerActor, { tenantId, nameAr: 'أدوات' });
    const prod = await invRepo.createProduct(ownerActor, {
      tenantId,
      sku: 'TOOL-01',
      nameAr: 'فرشاة حرارية',
      categoryId: cat.id,
      unit: 'PIECE',
      purchaseCostHalalas: 8000,
    });

    await invRepo.recordOpeningBalance(ownerActor, {
      tenantId,
      branchId: branch1,
      productId: prod.id,
      quantity: 10,
      unitCostHalalas: 8000,
      idempotencyKey: 'open_tool_1',
    });

    const tr = await invRepo.createTransfer(managerActor, {
      tenantId,
      sourceBranchId: branch1,
      destinationBranchId: branch2,
      lines: [{ productId: prod.id, quantity: 4 }],
    });
    expect(tr.status).toBe('DRAFT');

    // Manager without stock_transfers.approve cannot approve
    await expect(
      invRepo.approveTransfer(managerActor, { tenantId, transferId: tr.id })
    ).rejects.toMatchObject({ code: InventoryErrorCode.FORBIDDEN });

    const approved = await invRepo.approveTransfer(ownerActor, { tenantId, transferId: tr.id });
    const dispatched = await invRepo.dispatchTransfer(managerActor, {
      tenantId,
      transferId: approved.id,
      idempotencyKey: 'disp_1',
    });
    expect(dispatched.status).toBe('IN_TRANSIT');

    // Duplicate dispatch with same key is idempotent
    const dispDup = await invRepo.dispatchTransfer(managerActor, {
      tenantId,
      transferId: approved.id,
      idempotencyKey: 'disp_1',
    });
    expect(dispDup.status).toBe('IN_TRANSIT');

    // Source balance decreased to 6
    const b1 = await invRepo.listBalances(ownerActor, tenantId, { branchId: branch1 });
    expect(b1[0]!.quantityOnHand).toBe(6);

    // Receive 3 good + 1 damaged
    const received = await invRepo.receiveTransfer(managerActor, {
      tenantId,
      transferId: approved.id,
      idempotencyKey: 'recv_1',
      lines: [
        {
          lineId: dispatched.lines[0]!.lineId,
          receivedQuantity: 3,
          damagedOrMissingQuantity: 1,
          discrepancyNotes: 'كسر أثناء النقل',
        },
      ],
    });
    expect(received.status).toBe('RECEIVED');

    const b2 = await invRepo.listBalances(ownerActor, tenantId, { branchId: branch2 });
    expect(b2[0]!.quantityOnHand).toBe(3);
    expect(b2[0]!.averageCostHalalas).toBe(8000);
  });

  it('requires approval for high-value stock adjustments and reconciles stock counts & ledger', async () => {
    const cat = await invRepo.createCategory(ownerActor, { tenantId, nameAr: 'أجهزة' });
    const prod = await invRepo.createProduct(ownerActor, {
      tenantId,
      sku: 'DEV-01',
      nameAr: 'جهاز بخار',
      categoryId: cat.id,
      unit: 'PIECE',
      purchaseCostHalalas: 60000, // 600 SAR
    });

    // Manager creates high-value adjustment (2 * 600 = 1,200 SAR > 1,000 SAR threshold) -> PENDING_APPROVAL
    const pending = await invRepo.createStockAdjustment(managerActor, {
      tenantId,
      branchId: branch1,
      productId: prod.id,
      reason: 'INITIAL_COUNT',
      reasonDetails: 'رصيد أولي عالي القيمة',
      direction: 'IN',
      quantity: 2,
      unitCostHalalas: 60000,
      idempotencyKey: 'adj_hv_1',
    });
    expect(pending.adjustment.status).toBe('PENDING_APPROVAL');

    // Owner approves
    const applied = await invRepo.approveStockAdjustment(ownerActor, {
      tenantId,
      adjustmentId: pending.adjustment.id,
    });
    expect(applied.status).toBe('APPLIED');

    // Stock count finds 1 unit instead of 2 -> -1 variance
    const count = await invRepo.startStockCount(managerActor, {
      tenantId,
      branchId: branch1,
      productIds: [prod.id],
    });
    const submitted = await invRepo.submitStockCount(managerActor, {
      tenantId,
      countId: count.id,
      counts: [{ productId: prod.id, countedQuantity: 1 }],
    });
    expect(submitted.items[0]!.varianceQuantity).toBe(-1);

    await invRepo.approveAndApplyStockCount(ownerActor, {
      tenantId,
      countId: count.id,
    });

    const bal = await invRepo.listBalances(ownerActor, tenantId, { branchId: branch1 });
    expect(bal[0]!.quantityOnHand).toBe(1);

    // Reconciliation must report balanced = true
    const recon = await invRepo.runReconciliation(ownerActor, tenantId);
    expect(recon.balanced).toBe(true);
    expect(recon.discrepancies).toHaveLength(0);
  });
});

