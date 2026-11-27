import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import {
  InventoryRepository,
  type InventoryActor,
} from '../src/server/repositories/inventory.repository';
import {
  PurchasingRepository,
  PurchasingErrorCode,
} from '../src/server/repositories/purchasing.repository';
import { AccountingRepository } from '../src/server/repositories/accounting.repository';
import { firestorePaths } from '../src/paths';

class InMemoryPurchasingFirestore {
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

describe('PurchasingRepository', () => {
  let db: InMemoryPurchasingFirestore;
  let invRepo: InventoryRepository;
  let purchRepo: PurchasingRepository;
  let accountingRepo: AccountingRepository;

  const tenantId = 'tenant_purch_1';
  const branchId = 'branch_1';
  let productId = '';

  const ownerActor: InventoryActor = {
    uid: 'owner_1',
    role: 'OWNER',
    assignedBranchIds: null,
  };
  const managerActor: InventoryActor = {
    uid: 'mgr_1',
    role: 'MANAGER',
    assignedBranchIds: [branchId],
  };

  beforeEach(async () => {
    db = new InMemoryPurchasingFirestore();
    invRepo = new InventoryRepository(db as unknown as Firestore);
    purchRepo = new PurchasingRepository(db as unknown as Firestore);
    accountingRepo = new AccountingRepository(db as unknown as Firestore);

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
      { id: 'account-1040', code: '1040', nameAr: 'المخزون', type: 'ASSET', normal: 'DEBIT' },
      { id: 'account-1050', code: '1050', nameAr: 'ضريبة مدخلات', type: 'ASSET', normal: 'DEBIT' },
      { id: 'account-2010', code: '2010', nameAr: 'الموردون', type: 'LIABILITY', normal: 'CREDIT' },
      { id: 'account-5010', code: '5010', nameAr: 'تكلفة مواد', type: 'COST_OF_GOODS', normal: 'DEBIT' },
      { id: 'account-5020', code: '5020', nameAr: 'تكلفة بضاعة', type: 'COST_OF_GOODS', normal: 'DEBIT' },
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

    db.setDocumentDirect(firestorePaths.branch(tenantId, branchId), {
      id: branchId,
      tenantId,
      name: 'فرع العليا',
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

    const cat = await invRepo.createCategory(ownerActor, { tenantId, nameAr: 'العناية' });
    const prod = await invRepo.createProduct(ownerActor, {
      tenantId,
      sku: 'MASK-01',
      nameAr: 'ماسك شعر',
      categoryId: cat.id,
      unit: 'BOX',
      purchaseCostHalalas: 6000,
    });
    productId = prod.id;
  });

  it('creates suppliers with normalized Saudi phone and redacts privateNotes for unauthorized roles', async () => {
    const sup = await purchRepo.createSupplier(ownerActor, {
      tenantId,
      name: 'شركة الجمال للتوريد',
      phone: '0501234567',
      privateNotes: 'خصم خاص سري 10%',
    });
    expect(sup.normalizedPhone).toBe('+966501234567');
    expect(sup.privateNotes).toBe('خصم خاص سري 10%');

    const fetchedByManager = await purchRepo.getSupplierById(managerActor, tenantId, sup.id);
    expect(fetchedByManager!.privateNotes).toBe('');
  });

  it('enforces PO lifecycle, unique concurrent numbering, partial receipt, over-receipt rejection, and supplier payments', async () => {
    const sup = await purchRepo.createSupplier(ownerActor, {
      tenantId,
      name: 'مورد الرياض',
      phone: '0559998887',
    });

    // Concurrent PO creation yields unique PO numbers
    const [po1, po2] = await Promise.all([
      purchRepo.createPurchaseOrder(managerActor, {
        tenantId,
        branchId,
        supplierId: sup.id,
        items: [{ productId, orderedQuantity: 10, unitCostHalalas: 6000 }],
      }),
      purchRepo.createPurchaseOrder(managerActor, {
        tenantId,
        branchId,
        supplierId: sup.id,
        items: [{ productId, orderedQuantity: 5, unitCostHalalas: 6000 }],
      }),
    ]);
    expect(po1.poNumber).not.toBe(po2.poNumber);

    // Receiving before approval is rejected
    await expect(
      purchRepo.receiveGoods(managerActor, {
        tenantId,
        purchaseOrderId: po1.id,
        idempotencyKey: 'gr_unapproved',
        lines: [{ lineId: po1.lineItems[0]!.lineId, acceptedQuantity: 4 }],
      })
    ).rejects.toMatchObject({ code: PurchasingErrorCode.STATE_INVALID });

    // Submit then attempt approval by manager (forbidden) -> then owner approves
    await purchRepo.submitPurchaseOrder(managerActor, { tenantId, purchaseOrderId: po1.id });
    await expect(
      purchRepo.approvePurchaseOrder(managerActor, { tenantId, purchaseOrderId: po1.id })
    ).rejects.toMatchObject({ code: PurchasingErrorCode.FORBIDDEN });
    await purchRepo.approvePurchaseOrder(ownerActor, { tenantId, purchaseOrderId: po1.id });

    // Partial receipt of 4 units
    const gr1 = await purchRepo.receiveGoods(managerActor, {
      tenantId,
      purchaseOrderId: po1.id,
      idempotencyKey: 'gr_part_1',
      lines: [{ lineId: po1.lineItems[0]!.lineId, acceptedQuantity: 4 }],
    });
    expect(gr1.purchaseOrder.status).toBe('PARTIALLY_RECEIVED');
    expect(gr1.receipt.totalAcceptedCostHalalas).toBe(24000);

    // Duplicate receipt idempotency
    const gr1Dup = await purchRepo.receiveGoods(managerActor, {
      tenantId,
      purchaseOrderId: po1.id,
      idempotencyKey: 'gr_part_1',
      lines: [{ lineId: po1.lineItems[0]!.lineId, acceptedQuantity: 4 }],
    });
    expect(gr1Dup.deduplicated).toBe(true);

    // Over-receipt (> remaining 6) rejected
    await expect(
      purchRepo.receiveGoods(managerActor, {
        tenantId,
        purchaseOrderId: po1.id,
        idempotencyKey: 'gr_over_1',
        lines: [{ lineId: po1.lineItems[0]!.lineId, acceptedQuantity: 7 }],
      })
    ).rejects.toMatchObject({ code: PurchasingErrorCode.OVER_RECEIPT });

    // Receive remaining 6 -> RECEIVED
    const gr2 = await purchRepo.receiveGoods(managerActor, {
      tenantId,
      purchaseOrderId: po1.id,
      idempotencyKey: 'gr_part_2',
      lines: [{ lineId: po1.lineItems[0]!.lineId, acceptedQuantity: 6 }],
    });
    expect(gr2.purchaseOrder.status).toBe('RECEIVED');

    // Supplier invoice & partial/full payment
    const supInv = await purchRepo.createSupplierInvoice(managerActor, {
      tenantId,
      branchId,
      supplierId: sup.id,
      supplierInvoiceNumber: 'SUP-INV-100',
      purchaseOrderId: po1.id,
      goodsReceiptIds: [gr1.receipt.id, gr2.receipt.id],
      subtotalHalalas: 60000,
      vatHalalas: 9000,
    });
    expect(supInv.totalHalalas).toBe(69000);

    // Overpayment rejected
    await expect(
      purchRepo.recordSupplierPayment(ownerActor, {
        tenantId,
        supplierInvoiceId: supInv.id,
        method: 'BANK_TRANSFER',
        amountHalalas: 70000,
        idempotencyKey: 'spay_over',
      })
    ).rejects.toMatchObject({ code: PurchasingErrorCode.OVERPAYMENT });

    // Partial payment 300 SAR + remaining 390 SAR
    const p1 = await purchRepo.recordSupplierPayment(ownerActor, {
      tenantId,
      supplierInvoiceId: supInv.id,
      method: 'BANK_TRANSFER',
      amountHalalas: 30000,
      referenceNumber: 'TRF-1',
      idempotencyKey: 'spay_1',
    });
    expect(p1.invoice.status).toBe('PARTIALLY_PAID');

    const p2 = await purchRepo.recordSupplierPayment(ownerActor, {
      tenantId,
      supplierInvoiceId: supInv.id,
      method: 'BANK_TRANSFER',
      amountHalalas: 39000,
      referenceNumber: 'TRF-2',
      idempotencyKey: 'spay_2',
    });
    expect(p2.invoice.status).toBe('PAID');
    expect(p2.invoice.balanceDueHalalas).toBe(0);

    // All accounting journals balanced
    const journals = await accountingRepo.listJournalEntries(tenantId);
    expect(journals.length).toBeGreaterThanOrEqual(4);
    for (const j of journals) {
      const dr = j.lines.reduce((s, l) => s + l.debitHalalas, 0);
      const cr = j.lines.reduce((s, l) => s + l.creditHalalas, 0);
      expect(dr).toBe(cr);
      expect(dr).toBeGreaterThan(0);
    }
  });
});

