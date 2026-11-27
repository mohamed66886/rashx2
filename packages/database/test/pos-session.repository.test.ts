import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import {
  PosSessionRepository,
  PosSessionError,
  PosSessionErrorCode,
  type PosActor,
} from '../src/server/repositories/pos-session.repository';
import { firestorePaths } from '../src/paths';

class InMemoryPosSessionFirestore {
  private store = new Map<string, Record<string, unknown>>();
  private autoIdCounter = 0;

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
    } as unknown as DocumentReference;
  }

  collection(collectionPath: string) {
    return {
      path: collectionPath,
      doc: (id?: string) => {
        const docId = id || `auto_${++this.autoIdCounter}`;
        return this.doc(`${collectionPath}/${docId}`);
      },
      where: (field: string, _op: string, value: unknown) => {
        const filters = [{ field, value }];
        const chain: any = {
          where: (f2: string, _op2: string, val2: unknown) => {
            filters.push({ field: f2, value: val2 });
            return chain;
          },
          orderBy: () => chain,
          limit: () => chain,
          get: async () => {
            const docs: DocumentSnapshot[] = [];
            for (const [p, data] of this.store.entries()) {
              if (
                p.startsWith(collectionPath + '/') &&
                p.split('/').length === collectionPath.split('/').length + 1
              ) {
                if (filters.every((flt) => data && data[flt.field] === flt.value)) {
                  docs.push(this.createSnapshot(p));
                }
              }
            }
            return { docs };
          },
        };
        return chain;
      },
      orderBy: () => ({
        limit: () => ({
          get: async () => {
            const docs: DocumentSnapshot[] = [];
            for (const [p] of this.store.entries()) {
              if (
                p.startsWith(collectionPath + '/') &&
                p.split('/').length === collectionPath.split('/').length + 1
              ) {
                docs.push(this.createSnapshot(p));
              }
            }
            return { docs };
          },
        }),
      }),
      get: async () => {
        const docs: DocumentSnapshot[] = [];
        for (const [p] of this.store.entries()) {
          if (
            p.startsWith(collectionPath + '/') &&
            p.split('/').length === collectionPath.split('/').length + 1
          ) {
            docs.push(this.createSnapshot(p));
          }
        }
        return { docs };
      },
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

  async runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    const stagedWrites = new Map<string, Record<string, unknown>>();
    const stagedDeletes = new Set<string>();

    const mockTransaction: Transaction = {
      get: async (target: DocumentReference) => {
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
  }
}

describe('PosSessionRepository', () => {
  let db: InMemoryPosSessionFirestore;
  let repo: PosSessionRepository;

  const tenantId = 'tenant_1';
  const branchId = 'branch_1';
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

  beforeEach(() => {
    db = new InMemoryPosSessionFirestore();
    repo = new PosSessionRepository(db as unknown as Firestore);

    db.setDocumentDirect(firestorePaths.branch(tenantId, branchId), {
      id: branchId,
      tenantId,
      name: 'فرع العليا',
      city: 'الرياض',
      district: 'العليا',
      country: 'SA',
      address: 'طريق الملك فهد',
      coordinates: { latitude: 24.7, longitude: 46.7 },
      phone: '+966500000000',
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
  });

  it('opens a POS session with opening float and prevents duplicate open session on same branch', async () => {
    const session = await repo.openSession(staffActor, {
      tenantId,
      branchId,
      cashierName: 'سارة',
      openingCashHalalas: 50000, // 500 SAR
    });

    expect(session.status).toBe('OPEN');
    expect(session.openingCashHalalas).toBe(50000);
    expect(session.expectedCashHalalas).toBe(50000);

    const movements = await repo.listCashMovements(staffActor, tenantId, session.id);
    expect(movements).toHaveLength(1);
    expect(movements[0]!.type).toBe('OPENING_FLOAT');
    expect(movements[0]!.amountHalalas).toBe(50000);

    await expect(
      repo.openSession(staffActor, {
        tenantId,
        branchId,
        cashierName: 'أخرى',
        openingCashHalalas: 10000,
      })
    ).rejects.toMatchObject({ code: PosSessionErrorCode.SESSION_ALREADY_OPEN });
  });

  it('records cash in/out movements idempotently and updates expected cash balance', async () => {
    const session = await repo.openSession(staffActor, {
      tenantId,
      branchId,
      cashierName: 'سارة',
      openingCashHalalas: 50000,
    });

    const cashIn = await repo.recordCashMovement(staffActor, {
      tenantId,
      sessionId: session.id,
      type: 'CASH_IN',
      amountHalalas: 20000, // +200 SAR
      reason: 'تغذية فكة',
      idempotencyKey: 'move_in_1',
    });
    expect(cashIn.session.cashInHalalas).toBe(20000);
    expect(cashIn.session.expectedCashHalalas).toBe(70000);

    // Retry with same idempotencyKey should not double-count
    const retryIn = await repo.recordCashMovement(staffActor, {
      tenantId,
      sessionId: session.id,
      type: 'CASH_IN',
      amountHalalas: 20000,
      reason: 'تغذية فكة',
      idempotencyKey: 'move_in_1',
    });
    expect(retryIn.session.expectedCashHalalas).toBe(70000);

    const cashOut = await repo.recordCashMovement(staffActor, {
      tenantId,
      sessionId: session.id,
      type: 'CASH_OUT',
      amountHalalas: 15000, // -150 SAR
      reason: 'مصروف نثري',
      idempotencyKey: 'move_out_1',
    });
    expect(cashOut.session.cashOutHalalas).toBe(15000);
    expect(cashOut.session.expectedCashHalalas).toBe(55000);
  });

  it('closes session with reconciliation difference and blocks modifications after closing', async () => {
    const session = await repo.openSession(ownerActor, {
      tenantId,
      branchId,
      cashierName: 'نورة',
      openingCashHalalas: 30000,
    });

    const closed = await repo.closeSession(ownerActor, {
      tenantId,
      sessionId: session.id,
      actualCountedCashHalalas: 28500, // -15 SAR shortage
      notes: 'عجز طفيف',
    });

    expect(closed.status).toBe('CLOSED');
    expect(closed.expectedCashHalalas).toBe(30000);
    expect(closed.actualCountedCashHalalas).toBe(28500);
    expect(closed.cashDifferenceHalalas).toBe(-1500);

    // Closed session cannot accept new cash movements
    await expect(
      repo.recordCashMovement(ownerActor, {
        tenantId,
        sessionId: session.id,
        type: 'CASH_IN',
        amountHalalas: 5000,
        reason: 'بعد الإغلاق',
        idempotencyKey: 'after_close_1',
      })
    ).rejects.toMatchObject({ code: PosSessionErrorCode.SESSION_NOT_OPEN });
  });

  it('rejects session close by STAFF without pos_sessions.close permission', async () => {
    const session = await repo.openSession(staffActor, {
      tenantId,
      branchId,
      cashierName: 'سارة',
      openingCashHalalas: 10000,
    });

    await expect(
      repo.closeSession(staffActor, {
        tenantId,
        sessionId: session.id,
        actualCountedCashHalalas: 10000,
      })
    ).rejects.toBeInstanceOf(PosSessionError);
  });

  it('manages payment method configurations', async () => {
    const defaults = await repo.listPaymentMethodConfigs(staffActor, tenantId);
    expect(defaults.map((d) => d.method)).toEqual(['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER']);

    const updated = await repo.upsertPaymentMethodConfig(ownerActor, {
      tenantId,
      method: 'BANK_TRANSFER',
      isEnabled: false,
      requiresReference: true,
      labelAr: 'تحويل بنكي (معطل)',
    });
    expect(updated.isEnabled).toBe(false);
    expect(updated.labelAr).toBe('تحويل بنكي (معطل)');
  });
});
