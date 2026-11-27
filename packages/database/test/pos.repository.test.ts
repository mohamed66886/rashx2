import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import {
  PosRepository,
  PosError,
  PosErrorCode,
} from '../src/server/repositories/pos.repository';
import {
  PosSessionRepository,
  type PosActor,
} from '../src/server/repositories/pos-session.repository';
import { AccountingRepository } from '../src/server/repositories/accounting.repository';
import { firestorePaths } from '../src/paths';

/**
 * In-memory Firestore mock with serialized transaction lock so concurrent
 * calls accurately exercise transaction isolation & duplicate-billing/numbering locks.
 */
class InMemoryPosFirestore {
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
          orderBy: (orderField: string, dir: 'asc' | 'desc' = 'asc') => {
            return {
              ...chain,
              limit: (lim: number) => ({
                get: async () => this.queryCollection(collectionPath, filters, orderField, dir, lim),
              }),
              get: async () => this.queryCollection(collectionPath, filters, orderField, dir),
            };
          },
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
    if (lim !== undefined) {
      docs = docs.slice(0, lim);
    }
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

describe('PosRepository', () => {
  let db: InMemoryPosFirestore;
  let posRepo: PosRepository;
  let sessionRepo: PosSessionRepository;
  let accountingRepo: AccountingRepository;

  const tenantId = 'tenant_pos_1';
  const branchId = 'branch_1';
  const customerId = 'cust_1';
  const serviceId = 'srv_1';
  const service2Id = 'srv_2';
  const inactiveServiceId = 'srv_inactive';

  const ownerActor: PosActor = {
    uid: 'owner_1',
    role: 'OWNER',
    assignedBranchIds: null,
  };

  const staffActor: PosActor = {
    uid: 'staff_1',
    role: 'STAFF',
    assignedBranchIds: [branchId],
  };

  function seedBaseFixtures() {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const lastDay = new Date(Date.UTC(yyyy, now.getUTCMonth() + 1, 0)).getUTCDate();
    const periodId = `${yyyy}-${mm}`;

    // Open accounting period covering today
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

    // Required CoA accounts
    const accounts: Array<{ id: string; code: string; nameAr: string; type: string; normal: string }> = [
      { id: 'account-1010', code: '1010', nameAr: 'الصندوق النقدي', type: 'ASSET', normal: 'DEBIT' },
      { id: 'account-1020', code: '1020', nameAr: 'البنك / الشبكة', type: 'ASSET', normal: 'DEBIT' },
      { id: 'account-1030', code: '1030', nameAr: 'الذمم المدينة', type: 'ASSET', normal: 'DEBIT' },
      { id: 'account-2030', code: '2030', nameAr: 'ضريبة القيمة المضافة المستحقة', type: 'LIABILITY', normal: 'CREDIT' },
      { id: 'account-4010', code: '4010', nameAr: 'إيرادات الخدمات', type: 'REVENUE', normal: 'CREDIT' },
      { id: 'account-4030', code: '4030', nameAr: 'الخصومات المسموح بها', type: 'REVENUE', normal: 'DEBIT' },
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

    // Company profile & VAT settings (15% standard)
    db.setDocumentDirect(firestorePaths.companyProfile(tenantId), {
      tenantId,
      legalNameAr: 'صالون الجمال الراقي',
      legalNameEn: 'Elegant Beauty Salon',
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
          nameAr: 'ضريبة القيمة المضافة 15%',
        },
      ],
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    // Branch
    db.setDocumentDirect(firestorePaths.branch(tenantId, branchId), {
      id: branchId,
      tenantId,
      name: 'فرع العليا',
      city: 'الرياض',
      district: 'العليا',
      country: 'SA',
      address: 'العليا',
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

    // Customer
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

    // Services (115 SAR tax-inclusive => 100 SAR net + 15 SAR VAT)
    const makeService = (id: string, nameAr: string, priceHalalas: number, isActive = true) => ({
      id,
      tenantId,
      categoryId: 'cat_1',
      categoryNameAr: 'الشعر',
      nameAr,
      nameEn: nameAr,
      descriptionAr: '',
      descriptionEn: '',
      durationMinutes: 45,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      basePriceHalalas: priceHalalas,
      currency: 'SAR',
      taxMode: 'TAX_INCLUSIVE',
      taxRateBps: 1500,
      netPriceHalalas: Math.round((priceHalalas * 10000) / 11500),
      calculatedTaxHalalas: priceHalalas - Math.round((priceHalalas * 10000) / 11500),
      totalPriceHalalas: priceHalalas,
      primaryBranchId: branchId,
      assignedBranchIds: [branchId],
      assignedProviderIds: [],
      commissionPolicyId: null,
      resourceRequirement: 'OPTIONAL',
      allowedResourceTypes: [],
      displayOrder: 0,
      isActive,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      createdBy: 'owner_1',
      updatedBy: 'owner_1',
    });

    db.setDocumentDirect(
      firestorePaths.service(tenantId, serviceId),
      makeService(serviceId, 'قص وتصفيف', 11500, true)
    );
    db.setDocumentDirect(
      firestorePaths.service(tenantId, service2Id),
      makeService(service2Id, 'عناية بالأظافر', 23000, true)
    );
    db.setDocumentDirect(
      firestorePaths.service(tenantId, inactiveServiceId),
      makeService(inactiveServiceId, 'خدمة متوقفة', 10000, false)
    );
  }

  beforeEach(() => {
    db = new InMemoryPosFirestore();
    posRepo = new PosRepository(db as unknown as Firestore);
    sessionRepo = new PosSessionRepository(db as unknown as Firestore);
    accountingRepo = new AccountingRepository(db as unknown as Firestore);
    seedBaseFixtures();
  });

  it('creates a walk-in cash sale with authoritative server pricing and balanced accounting journals', async () => {
    const session = await sessionRepo.openSession(ownerActor, {
      tenantId,
      branchId,
      cashierName: 'سارة',
      openingCashHalalas: 50000,
    });

    const result = await posRepo.createAndFinalizeSale(staffActor, {
      tenantId,
      branchId,
      customerId,
      sessionId: session.id,
      items: [{ serviceId, quantity: 1 }],
      payments: [{ method: 'CASH', amountHalalas: 11500 }],
      idempotencyKey: 'sale_cash_1',
    });

    expect(result.deduplicated).toBe(false);
    expect(result.invoice.status).toBe('PAID');
    expect(result.invoice.paymentStatus).toBe('PAID');
    expect(result.invoice.netAmountHalalas).toBe(10000);
    expect(result.invoice.vatAmountHalalas).toBe(1500);
    expect(result.invoice.totalAmountHalalas).toBe(11500);
    expect(result.invoice.paidAmountHalalas).toBe(11500);
    expect(result.invoice.balanceDueHalalas).toBe(0);
    expect(result.payments).toHaveLength(1);

    // Cash session updated for CASH sale
    const updatedSession = await sessionRepo.getSessionById(ownerActor, tenantId, session.id);
    expect(updatedSession!.cashSalesHalalas).toBe(11500);
    expect(updatedSession!.expectedCashHalalas).toBe(61500);

    // Accounting journals posted and balanced
    const journals = await accountingRepo.listJournalEntries(tenantId);
    expect(journals.length).toBeGreaterThanOrEqual(2);
    for (const j of journals) {
      expect(j.status).toBe('POSTED');
      const totalDr = j.lines.reduce((s, l) => s + l.debitHalalas, 0);
      const totalCr = j.lines.reduce((s, l) => s + l.creditHalalas, 0);
      expect(totalDr).toBeGreaterThan(0);
      expect(totalDr).toBe(totalCr);
    }
  });

  it('records card sale without adding to cash drawer expected cash', async () => {
    const session = await sessionRepo.openSession(ownerActor, {
      tenantId,
      branchId,
      cashierName: 'سارة',
      openingCashHalalas: 50000,
    });

    await posRepo.createAndFinalizeSale(staffActor, {
      tenantId,
      branchId,
      customerId,
      sessionId: session.id,
      items: [{ serviceId, quantity: 1 }],
      payments: [{ method: 'CARD', amountHalalas: 11500, referenceNumber: 'MADA-9988' }],
      idempotencyKey: 'sale_card_1',
    });

    const updatedSession = await sessionRepo.getSessionById(ownerActor, tenantId, session.id);
    expect(updatedSession!.cashSalesHalalas).toBe(0);
    expect(updatedSession!.nonCashSalesHalalas).toBe(11500);
    expect(updatedSession!.expectedCashHalalas).toBe(50000);
  });

  it('supports split payment (CASH + CARD) and partial payment + subsequent payment completion', async () => {
    const session = await sessionRepo.openSession(ownerActor, {
      tenantId,
      branchId,
      cashierName: 'سارة',
      openingCashHalalas: 20000,
    });

    // Service 2 is 23000 halalas (230 SAR); pay 100 SAR cash + 50 SAR card = 150 SAR partial
    const saleRes = await posRepo.createAndFinalizeSale(staffActor, {
      tenantId,
      branchId,
      customerId,
      sessionId: session.id,
      items: [{ serviceId: service2Id, quantity: 1 }],
      payments: [
        { method: 'CASH', amountHalalas: 10000 },
        { method: 'CARD', amountHalalas: 5000, referenceNumber: 'POS-12' },
      ],
      idempotencyKey: 'sale_split_partial',
    });

    expect(saleRes.invoice.status).toBe('PARTIALLY_PAID');
    expect(saleRes.invoice.paidAmountHalalas).toBe(15000);
    expect(saleRes.invoice.balanceDueHalalas).toBe(8000);
    expect(saleRes.payments).toHaveLength(2);

    // Attempt overpayment -> rejected
    await expect(
      posRepo.recordPaymentOnInvoice(staffActor, {
        tenantId,
        invoiceId: saleRes.invoice.id,
        method: 'CARD',
        amountHalalas: 9000,
        referenceNumber: 'MADA-OVER',
        idempotencyKey: 'pay_over_1',
      })
    ).rejects.toMatchObject({ code: PosErrorCode.OVERPAYMENT });

    // Pay remaining 80 SAR by card
    const pay2 = await posRepo.recordPaymentOnInvoice(staffActor, {
      tenantId,
      invoiceId: saleRes.invoice.id,
      method: 'CARD',
      amountHalalas: 8000,
      referenceNumber: 'POS-13',
      idempotencyKey: 'pay_rem_1',
    });
    expect(pay2.invoice.status).toBe('PAID');
    expect(pay2.invoice.balanceDueHalalas).toBe(0);

    // Duplicate idempotency key returns deduplicated without double charging
    const pay2Retry = await posRepo.recordPaymentOnInvoice(staffActor, {
      tenantId,
      invoiceId: saleRes.invoice.id,
      method: 'CARD',
      amountHalalas: 8000,
      idempotencyKey: 'pay_rem_1',
    });
    expect(pay2Retry.deduplicated).toBe(true);
    expect(pay2Retry.invoice.paidAmountHalalas).toBe(23000);
  });

  it('links booking to sale and prevents duplicate billing under concurrent submissions', async () => {
    const bookingId = 'booking_1';
    db.setDocumentDirect(firestorePaths.booking(tenantId, bookingId), {
      id: bookingId,
      bookingNumber: 'BK-2026-0001',
      tenantId,
      branchId,
      customerId,
      customerName: 'نورة العتيبي',
      customerPhone: '+966501112233',
      serviceId,
      providerId: 'prov_1',
      providerNameAr: 'سارة محمد',
      resourceId: null,
      resourceNameAr: null,
      status: 'COMPLETED',
      source: 'ONLINE_APP',
      serviceDurationMinutes: 45,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      totalDurationMinutes: 45,
      scheduledStartTime: '2026-11-25T07:00:00.000Z',
      scheduledEndTime: '2026-11-25T07:45:00.000Z',
      timezone: 'Asia/Riyadh',
      serviceNameSnapshot: { ar: 'قص وتصفيف', en: 'Haircut' },
      priceSnapshot: {
        basePriceHalalas: 11500,
        taxMode: 'TAX_INCLUSIVE',
        taxRateBps: 1500,
        netPriceHalalas: 10000,
        calculatedTaxHalalas: 1500,
        totalPriceHalalas: 11500,
        currency: 'SAR',
      },
      createdAt: '2026-11-25T06:00:00.000Z',
      updatedAt: '2026-11-25T06:00:00.000Z',
      createdBy: 'owner_1',
      updatedBy: 'owner_1',
    });

    const [r1, r2] = await Promise.allSettled([
      posRepo.createAndFinalizeSale(staffActor, {
        tenantId,
        branchId,
        customerId,
        bookingId,
        items: [{ serviceId, quantity: 1 }],
        payments: [{ method: 'CARD', amountHalalas: 11500, referenceNumber: 'MADA-B1' }],
        idempotencyKey: 'booking_bill_1',
      }),
      posRepo.createAndFinalizeSale(staffActor, {
        tenantId,
        branchId,
        customerId,
        bookingId,
        items: [{ serviceId, quantity: 1 }],
        payments: [{ method: 'CARD', amountHalalas: 11500, referenceNumber: 'MADA-B2' }],
        idempotencyKey: 'booking_bill_2',
      }),
    ]);

    const fulfilled = [r1, r2].filter((r) => r.status === 'fulfilled');
    const rejected = [r1, r2].filter((r) => r.status === 'rejected') as PromiseRejectedResult[];

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0]!.reason as PosError).code).toBe(PosErrorCode.BOOKING_ALREADY_BILLED);
    expect(await posRepo.isBookingBilled(tenantId, bookingId)).toBe(true);
  });

  it('allocates unique sequential invoice numbers under concurrent sales', async () => {
    const results = await Promise.all([
      posRepo.createAndFinalizeSale(staffActor, {
        tenantId,
        branchId,
        customerId,
        items: [{ serviceId, quantity: 1 }],
        payments: [{ method: 'CARD', amountHalalas: 11500, referenceNumber: 'MADA-C1' }],
        idempotencyKey: 'conc_1',
      }),
      posRepo.createAndFinalizeSale(staffActor, {
        tenantId,
        branchId,
        customerId,
        items: [{ serviceId, quantity: 1 }],
        payments: [{ method: 'CARD', amountHalalas: 11500, referenceNumber: 'MADA-C2' }],
        idempotencyKey: 'conc_2',
      }),
      posRepo.createAndFinalizeSale(staffActor, {
        tenantId,
        branchId,
        customerId,
        items: [{ serviceId, quantity: 1 }],
        payments: [{ method: 'CARD', amountHalalas: 11500, referenceNumber: 'MADA-C3' }],
        idempotencyKey: 'conc_3',
      }),
    ]);

    const numbers = results.map((r) => r.invoice.invoiceNumber);
    expect(new Set(numbers).size).toBe(3);
  });

  it('preserves immutable invoice snapshots when customer/company data changes later', async () => {
    const sale = await posRepo.createAndFinalizeSale(staffActor, {
      tenantId,
      branchId,
      customerId,
      items: [{ serviceId, quantity: 1 }],
      payments: [{ method: 'CARD', amountHalalas: 11500, referenceNumber: 'MADA-S1' }],
      idempotencyKey: 'snap_1',
    });

    // Mutate customer name afterwards
    db.setDocumentDirect(firestorePaths.tenantCustomer(tenantId, customerId), {
      ...db.store.get(firestorePaths.tenantCustomer(tenantId, customerId))!,
      fullName: 'اسم معدل لاحقاً',
    });

    const fetched = await posRepo.getInvoiceById(ownerActor, tenantId, sale.invoice.id);
    expect(fetched!.customerSnapshot.fullName).toBe('نورة العتيبي');
    expect(fetched!.tenantSnapshot.legalNameAr).toBe('صالون الجمال الراقي');
  });

  it('supports partial and full refunds, preserves payment history, rejects over-refunds, and reverses accounting', async () => {
    const session = await sessionRepo.openSession(ownerActor, {
      tenantId,
      branchId,
      cashierName: 'سارة',
      openingCashHalalas: 50000,
    });

    const sale = await posRepo.createAndFinalizeSale(ownerActor, {
      tenantId,
      branchId,
      customerId,
      sessionId: session.id,
      items: [{ serviceId, quantity: 1 }],
      payments: [{ method: 'CASH', amountHalalas: 11500 }],
      idempotencyKey: 'ref_sale_1',
    });

    const paymentId = sale.payments[0]!.id;

    // Partial refund 50 SAR
    const ref1 = await posRepo.recordRefund(ownerActor, {
      tenantId,
      paymentId,
      sessionId: session.id,
      amountHalalas: 5000,
      reason: 'استرداد جزئي',
      idempotencyKey: 'refund_key_1',
    });
    expect(ref1.invoice.status).toBe('PARTIALLY_REFUNDED');
    expect(ref1.invoice.refundedAmountHalalas).toBe(5000);

    // Duplicate refund idempotency
    const ref1Dup = await posRepo.recordRefund(ownerActor, {
      tenantId,
      paymentId,
      sessionId: session.id,
      amountHalalas: 5000,
      reason: 'استرداد جزئي',
      idempotencyKey: 'refund_key_1',
    });
    expect(ref1Dup.deduplicated).toBe(true);

    // Over-refund (> remaining 65 SAR) rejected
    await expect(
      posRepo.recordRefund(ownerActor, {
        tenantId,
        paymentId,
        sessionId: session.id,
        amountHalalas: 7000,
        reason: 'استرداد زائد',
        idempotencyKey: 'refund_key_over',
      })
    ).rejects.toMatchObject({ code: PosErrorCode.OVER_REFUND });

    // Remaining 65 SAR refund -> REFUNDED
    const ref2 = await posRepo.recordRefund(ownerActor, {
      tenantId,
      paymentId,
      sessionId: session.id,
      amountHalalas: 6500,
      reason: 'استرداد كامل المتبقي',
      idempotencyKey: 'refund_key_2',
    });
    expect(ref2.invoice.status).toBe('REFUNDED');

    // Payment record still exists (never deleted)
    const payments = await posRepo.listPayments(ownerActor, tenantId, {
      invoiceId: sale.invoice.id,
    });
    expect(payments).toHaveLength(1);
    expect(payments[0]!.status).toBe('RECORDED');
    expect(payments[0]!.refundedAmountHalalas).toBe(11500);

    // Session cash expected = 50000 + 11500 - 11500 = 50000
    const sAfter = await sessionRepo.getSessionById(ownerActor, tenantId, session.id);
    expect(sAfter!.cashRefundsHalalas).toBe(11500);
    expect(sAfter!.expectedCashHalalas).toBe(50000);
  });

  it('voids an unpaid ISSUED invoice and reverses its accounting journal', async () => {
    const sale = await posRepo.createAndFinalizeSale(ownerActor, {
      tenantId,
      branchId,
      customerId,
      items: [{ serviceId, quantity: 1 }],
      payments: [], // Unpaid -> ISSUED
      idempotencyKey: 'void_sale_1',
    });

    expect(sale.invoice.status).toBe('ISSUED');

    const voided = await posRepo.voidInvoice(ownerActor, {
      tenantId,
      invoiceId: sale.invoice.id,
      reason: 'خطأ في الإدخال',
    });
    expect(voided.status).toBe('VOIDED');
    expect(voided.voidReason).toBe('خطأ في الإدخال');
  });

  it('rejects inactive services, cross-branch unauthorized actors, and closed fiscal periods', async () => {
    // Inactive service
    await expect(
      posRepo.createAndFinalizeSale(staffActor, {
        tenantId,
        branchId,
        customerId,
        items: [{ serviceId: inactiveServiceId, quantity: 1 }],
        payments: [],
        idempotencyKey: 'bad_srv_1',
      })
    ).rejects.toMatchObject({ code: PosErrorCode.SERVICE_INVALID });

    // Unauthorized branch
    const otherBranchActor: PosActor = {
      uid: 'staff_other',
      role: 'STAFF',
      assignedBranchIds: ['branch_other'],
    };
    await expect(
      posRepo.createAndFinalizeSale(otherBranchActor, {
        tenantId,
        branchId,
        customerId,
        items: [{ serviceId, quantity: 1 }],
        payments: [],
        idempotencyKey: 'bad_branch_1',
      })
    ).rejects.toMatchObject({ code: PosErrorCode.BRANCH_FORBIDDEN });

    // Closed fiscal period
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const periodId = `${yyyy}-${mm}`;
    db.setDocumentDirect(firestorePaths.accountingPeriod(tenantId, periodId), {
      ...db.store.get(firestorePaths.accountingPeriod(tenantId, periodId))!,
      status: 'CLOSED',
    });

    await expect(
      posRepo.createAndFinalizeSale(ownerActor, {
        tenantId,
        branchId,
        customerId,
        items: [{ serviceId, quantity: 1 }],
        payments: [],
        idempotencyKey: 'closed_period_1',
      })
    ).rejects.toMatchObject({ code: PosErrorCode.FISCAL_PERIOD_CLOSED });
  });
});
