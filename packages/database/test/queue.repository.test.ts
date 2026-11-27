import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import {
  QueueRepository,
  QueueErrorCode,
} from '../src/server/repositories/queue.repository';
import { firestorePaths } from '../src/paths';
import { riyadhTimeToUtcIso } from '../src/availability.types';

class InMemoryQueueFirestore {
  private store = new Map<string, Record<string, unknown>>();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
    } as unknown as DocumentReference;
  }

  collection(collectionPath: string) {
    const buildQuery = (filters: Array<{ field: string; op: string; value: unknown }>, lim?: number) => ({
      where: (field: string, op: string, value: unknown) =>
        buildQuery([...filters, { field, op, value }], lim),
      orderBy: () => buildQuery(filters, lim),
      limit: (n: number) => buildQuery(filters, n),
      get: async () => {
        const docs: DocumentSnapshot[] = [];
        for (const [p, data] of this.store.entries()) {
          if (
            p.startsWith(collectionPath + '/') &&
            p.split('/').length === collectionPath.split('/').length + 1
          ) {
            const match = filters.every((flt) => {
              if (!data) return false;
              if (flt.op === '==') return data[flt.field] === flt.value;
              if (flt.op === 'in' && Array.isArray(flt.value)) {
                return flt.value.includes(data[flt.field]);
              }
              return true;
            });
            if (match) {
              docs.push(this.createSnapshot(p));
            }
          }
        }
        return { docs: lim ? docs.slice(0, lim) : docs };
      },
    });

    return {
      path: collectionPath,
      where: (field: string, op: string, value: unknown) =>
        buildQuery([{ field, op, value }]),
      orderBy: () => buildQuery([]),
      limit: (n: number) => buildQuery([], n),
      get: async () => buildQuery([]).get(),
    };
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

  getDocumentDirect(path: string): Record<string, unknown> | undefined {
    return this.store.get(path);
  }

  async runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    const stagedWrites = new Map<string, Record<string, unknown>>();
    const stagedDeletes = new Set<string>();

    const mockTransaction: Transaction = {
      get: async (target: any) => {
        // Support both DocumentReference and Query inside transactions
        if (typeof target.get === 'function' && !target.path) {
          return target.get();
        }
        return this.createSnapshot(target.path);
      },
      set: (ref: DocumentReference, data: Record<string, unknown>, options?: { merge?: boolean }) => {
        if (options?.merge) {
          const current = stagedWrites.get(ref.path) || this.store.get(ref.path) || {};
          stagedWrites.set(ref.path, { ...current, ...JSON.parse(JSON.stringify(data)) });
        } else {
          stagedWrites.set(ref.path, JSON.parse(JSON.stringify(data)));
        }
        stagedDeletes.delete(ref.path);
        return mockTransaction;
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        const current = stagedWrites.get(ref.path) || JSON.parse(JSON.stringify(this.store.get(ref.path) || {}));
        for (const [k, v] of Object.entries(JSON.parse(JSON.stringify(data)))) {
          if (k.includes('.')) {
            const parts = k.split('.');
            let target = current as Record<string, any>;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!target[parts[i]!] || typeof target[parts[i]!] !== 'object') {
                target[parts[i]!] = {};
              }
              target = target[parts[i]!];
            }
            target[parts[parts.length - 1]!] = v;
          } else {
            current[k] = v;
          }
        }
        stagedWrites.set(ref.path, current);
        return mockTransaction;
      },
      delete: (ref: DocumentReference) => {
        stagedDeletes.add(ref.path);
        stagedWrites.delete(ref.path);
        return mockTransaction;
      },
    } as unknown as Transaction;

    const result = await updateFunction(mockTransaction);

    for (const [p, d] of stagedWrites.entries()) {
      this.store.set(p, d);
    }
    for (const p of stagedDeletes) {
      this.store.delete(p);
    }

    return result;
  }
}

describe('QueueRepository (Phase 4.1)', () => {
  let db: InMemoryQueueFirestore;
  let repo: QueueRepository;
  const tenantId = 'tenant_1';
  const branchId = 'branch_1';
  const date = '2026-12-01';
  const actor = { uid: 'mgr_1', role: 'MANAGER' as const };

  function seedCheckedInBooking(id: string, opts?: { source?: 'WALK_IN' | 'DASHBOARD'; time?: string; customerId?: string }) {
    const startIso = riyadhTimeToUtcIso(date, opts?.time || '10:00');
    const endIso = riyadhTimeToUtcIso(date, '10:30');
    const customerId = opts?.customerId || `cust_${id}`;

    db.setDocumentDirect(firestorePaths.tenantCustomer(tenantId, customerId), {
      id: customerId,
      tenantId,
      fullName: `عميل ${id}`,
      normalizedPhone: '+966500000001',
      displayPhone: '0500000001',
      isGuest: false,
      status: 'ACTIVE',
      tags: [],
      bookingStatistics: {
        totalBookings: 1,
        completedBookings: 0,
        cancelledBookings: 0,
        noShowBookings: 0,
        totalSpentHalalas: 0,
      },
      createdBy: 'mgr_1',
      updatedBy: 'mgr_1',
      createdAt: startIso,
      updatedAt: startIso,
    });

    db.setDocumentDirect(firestorePaths.booking(tenantId, id), {
      id,
      bookingNumber: `BK-${id}`,
      tenantId,
      branchId,
      customerId,
      customerName: `عميل ${id}`,
      customerPhone: '+966500000001',
      serviceId: 'srv_1',
      providerId: 'prov_1',
      providerNameAr: 'أحمد',
      resourceId: 'res_1',
      resourceNameAr: 'كرسي 1',
      serviceNameSnapshot: { ar: 'قص شعر', en: 'Haircut' },
      serviceDurationMinutes: 30,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      totalDurationMinutes: 30,
      priceSnapshot: {
        taxMode: 'TAX_INCLUSIVE',
        taxRateBps: 1500,
        basePriceHalalas: 10000,
        netPriceHalalas: 8696,
        calculatedTaxHalalas: 1304,
        totalPriceHalalas: 10000,
      },
      scheduledStartTime: startIso,
      scheduledEndTime: endIso,
      slotLockIds: [`prov_1_${date}_1000`],
      resourceSlotLockIds: [`res_1_${date}_1000`],
      status: 'CHECKED_IN',
      source: opts?.source || 'DASHBOARD',
      checkIn: {
        checkedInAt: startIso,
        checkedInBy: 'mgr_1',
      },
      createdBy: 'mgr_1',
      updatedBy: 'mgr_1',
      createdAt: startIso,
      updatedAt: startIso,
    });

    db.setDocumentDirect(firestorePaths.slotLock(tenantId, `prov_1_${date}_1000`), {
      id: `prov_1_${date}_1000`,
      tenantId,
      providerId: 'prov_1',
      bookingId: id,
      status: 'LOCKED',
    });
    db.setDocumentDirect(firestorePaths.resourceSlotLock(tenantId, `res_1_${date}_1000`), {
      id: `res_1_${date}_1000`,
      tenantId,
      resourceId: 'res_1',
      bookingId: id,
      status: 'LOCKED',
    });
  }

  beforeEach(() => {
    db = new InMemoryQueueFirestore();
    repo = new QueueRepository(db as unknown as Firestore);
  });

  it('enqueues a checked-in booking idempotently', async () => {
    seedCheckedInBooking('bk_1');

    const first = await repo.enqueueBooking(actor, {
      tenantId,
      bookingId: 'bk_1',
      priority: false,
    });
    const second = await repo.enqueueBooking(actor, {
      tenantId,
      bookingId: 'bk_1',
      priority: false,
    });

    expect(first.id).toBe('bk_1');
    expect(first.status).toBe('WAITING');
    expect(second.id).toBe(first.id);
    expect(second.positionScore).toBe(first.positionScore);
  });

  it('calls next customer respecting priority over FIFO and rejects callAgain from WAITING', async () => {
    seedCheckedInBooking('bk_walkin', { source: 'WALK_IN', time: '09:30' });
    seedCheckedInBooking('bk_appt', { source: 'DASHBOARD', time: '10:00' });

    await repo.enqueueBooking(actor, { tenantId, bookingId: 'bk_walkin', priority: false });
    await repo.enqueueBooking(actor, { tenantId, bookingId: 'bk_appt', priority: true });

    // callAgain before calling should fail
    await expect(
      repo.callAgain(actor, {
        tenantId,
        bookingId: 'bk_appt',
        idempotencyKey: 'ca_invalid',
      })
    ).rejects.toMatchObject({
      code: QueueErrorCode.INVALID_QUEUE_STATE,
    });

    // Priority appointment should be called first
    const callRes = await repo.callNextCustomer(actor, {
      tenantId,
      branchId,
      date,
      idempotencyKey: 'cn_1',
    });
    expect(callRes.entry.bookingId).toBe('bk_appt');
    expect(callRes.entry.status).toBe('CALLED');
    expect(callRes.call.callType).toBe('INITIAL_CALL');

    // Now callAgain succeeds
    const againRes = await repo.callAgain(actor, {
      tenantId,
      bookingId: 'bk_appt',
      idempotencyKey: 'ca_1',
    });
    expect(againRes.entry.callCount).toBe(2);
    expect(againRes.call.callType).toBe('CALL_AGAIN');
  });

  it('marks NO_SHOW on recordNoResponse, releases slot locks, and updates customer stats', async () => {
    seedCheckedInBooking('bk_ns');
    await repo.enqueueBooking(actor, { tenantId, bookingId: 'bk_ns', priority: false });
    await repo.callNextCustomer(actor, {
      tenantId,
      branchId,
      date,
      idempotencyKey: 'cn_ns',
    });

    const res = await repo.recordNoResponse(actor, {
      tenantId,
      bookingId: 'bk_ns',
      disposition: 'MARK_NO_SHOW',
      idempotencyKey: 'nr_ns',
    });

    expect(res.entry.status).toBe('NO_SHOW');

    const booking = db.getDocumentDirect(firestorePaths.booking(tenantId, 'bk_ns'));
    expect(booking!.status).toBe('NO_SHOW');

    const provLock = db.getDocumentDirect(
      firestorePaths.slotLock(tenantId, `prov_1_${date}_1000`)
    );
    const resLock = db.getDocumentDirect(
      firestorePaths.resourceSlotLock(tenantId, `res_1_${date}_1000`)
    );
    expect(provLock?.status).toBe('RELEASED');
    expect(resLock?.status).toBe('RELEASED');

    const cust = db.getDocumentDirect(firestorePaths.tenantCustomer(tenantId, 'cust_bk_ns')) as any;
    expect(cust.bookingStatistics.noShowBookings).toBe(1);
  });

  it('reorders waiting queue and elevates a booking to priority', async () => {
    seedCheckedInBooking('bk_a', { source: 'WALK_IN', time: '09:00' });
    seedCheckedInBooking('bk_b', { source: 'WALK_IN', time: '09:15' });

    await repo.enqueueBooking(actor, { tenantId, bookingId: 'bk_a', priority: false });
    await repo.enqueueBooking(actor, { tenantId, bookingId: 'bk_b', priority: false });

    const reordered = await repo.reorderQueue(actor, {
      tenantId,
      branchId,
      date,
      orderedBookingIds: ['bk_b', 'bk_a'],
      elevateBookingIdToPriority: 'bk_b',
    });

    const entryB = reordered.find((e) => e.bookingId === 'bk_b')!;
    const entryA = reordered.find((e) => e.bookingId === 'bk_a')!;
    expect(entryB.priorityLevel).toBe('PRIORITY');
    expect(entryB.positionScore).toBeLessThan(entryA.positionScore);
  });
});
