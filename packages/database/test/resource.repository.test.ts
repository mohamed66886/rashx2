import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import {
  ResourceRepository,
  ResourceError,
  ResourceErrorCode,
} from '../src/server/repositories/resource.repository';
import { firestorePaths } from '../src/paths';
import { riyadhTimeToUtcIso, generateResourceSlotLockIds } from '../src/availability.types';

class InMemoryResourceFirestore {
  private store = new Map<string, Record<string, unknown>>();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
    } as unknown as DocumentReference;
  }

  collection(collectionPath: string) {
    const buildQuery = (filters: Array<{ field: string; op: string; value: unknown }>) => ({
      where: (field: string, op: string, value: unknown) =>
        buildQuery([...filters, { field, op, value }]),
      orderBy: () => buildQuery(filters),
      limit: () => buildQuery(filters),
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
              return true;
            });
            if (match) {
              docs.push(this.createSnapshot(p));
            }
          }
        }
        return { docs };
      },
    });

    return {
      path: collectionPath,
      where: (field: string, op: string, value: unknown) =>
        buildQuery([{ field, op, value }]),
      orderBy: () => buildQuery([]),
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
      get: async (target: DocumentReference) => this.createSnapshot(target.path),
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
        const current = stagedWrites.get(ref.path) || this.store.get(ref.path) || {};
        stagedWrites.set(ref.path, { ...current, ...JSON.parse(JSON.stringify(data)) });
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

describe('ResourceRepository (Phase 4.1)', () => {
  let db: InMemoryResourceFirestore;
  let repo: ResourceRepository;
  const tenantId = 'tenant_1';
  const branchId = 'branch_1';
  const actor = { uid: 'owner_1', role: 'OWNER' as const };

  beforeEach(() => {
    db = new InMemoryResourceFirestore();
    repo = new ResourceRepository(db as unknown as Firestore);

    const nowIso = new Date().toISOString();
    db.setDocumentDirect(firestorePaths.branch(tenantId, branchId), {
      id: branchId,
      tenantId,
      name: 'الفرع الرئيسي',
      isMain: true,
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
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    db.setDocumentDirect(firestorePaths.service(tenantId, 'srv_hair'), {
      id: 'srv_hair',
      tenantId,
      categoryId: 'cat_1',
      categoryNameAr: 'شعر',
      nameAr: 'قص شعر',
      nameEn: 'Haircut',
      descriptionAr: '',
      descriptionEn: '',
      imageUrl: '',
      durationMinutes: 30,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      basePriceHalalas: 10000,
      currency: 'SAR',
      taxMode: 'TAX_INCLUSIVE',
      taxRateBps: 1500,
      netPriceHalalas: 8696,
      calculatedTaxHalalas: 1304,
      totalPriceHalalas: 10000,
      primaryBranchId: branchId,
      assignedBranchIds: [branchId],
      assignedProviderIds: [],
      displayOrder: 0,
      isActive: true,
      resourceRequirement: 'REQUIRED',
      allowedResourceTypes: ['BARBER_CHAIR'],
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: 'owner_1',
      updatedBy: 'owner_1',
    });
  });

  it('creates a resource with branch validation and rejects missing branch', async () => {
    const created = await repo.createResource(actor, {
      tenantId,
      branchId,
      nameAr: 'كرسي 1',
      nameEn: 'Chair 1',
      type: 'BARBER_CHAIR',
      supportsAllBranchServices: true,
      supportedServiceIds: [],
      supportedCategoryIds: [],
      status: 'ACTIVE',
      description: '',
    });

    expect(created.id).toBeTruthy();
    expect(created.nameAr).toBe('كرسي 1');
    expect(created.type).toBe('BARBER_CHAIR');
    expect(created.status).toBe('ACTIVE');

    await expect(
      repo.createResource(actor, {
        tenantId,
        branchId: 'missing_branch',
        nameAr: 'كرسي وهمي',
        nameEn: '',
        type: 'BARBER_CHAIR',
        supportsAllBranchServices: true,
        supportedServiceIds: [],
        supportedCategoryIds: [],
        status: 'ACTIVE',
        description: '',
      })
    ).rejects.toMatchObject({
      code: ResourceErrorCode.BRANCH_NOT_FOUND,
    });
  });

  it('checks service eligibility and real-time slot lock conflicts', async () => {
    const chair1 = await repo.createResource(actor, {
      tenantId,
      branchId,
      nameAr: 'كرسي 1',
      nameEn: '',
      type: 'BARBER_CHAIR',
      supportsAllBranchServices: true,
      supportedServiceIds: [],
      supportedCategoryIds: [],
      status: 'ACTIVE',
      description: '',
    });

    const room1 = await repo.createResource(actor, {
      tenantId,
      branchId,
      nameAr: 'غرفة VIP',
      nameEn: '',
      type: 'VIP_SUITE',
      supportsAllBranchServices: true,
      supportedServiceIds: [],
      supportedCategoryIds: [],
      status: 'ACTIVE',
      description: '',
    });

    const startTimeIso = riyadhTimeToUtcIso('2026-12-01', '10:00');
    const endTimeIso = riyadhTimeToUtcIso('2026-12-01', '10:30');

    // Before locking: chair1 is eligible and available; room1 is excluded (service allows only BARBER_CHAIR)
    const before = await repo.listEligibleResourcesForService(actor, tenantId, branchId, 'srv_hair', {
      startTimeIso,
      endTimeIso,
    });
    expect(before.map((r) => r.id)).toEqual([chair1.id]);
    expect(before[0]!.isAvailableForWindow).toBe(true);

    // Place a ResourceSlotLock on chair1 for 10:00-10:15
    const { lockIds } = generateResourceSlotLockIds(chair1.id, startTimeIso, endTimeIso);
    expect(lockIds.length).toBe(2);
    db.setDocumentDirect(firestorePaths.resourceSlotLock(tenantId, lockIds[0]!), {
      id: lockIds[0],
      tenantId,
      resourceId: chair1.id,
      bookingId: 'bk_other',
      branchId,
      date: '2026-12-01',
      slotTime: '10:00',
      startTimeIso,
      endTimeIso,
      status: 'LOCKED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const after = await repo.listEligibleResourcesForService(actor, tenantId, branchId, 'srv_hair', {
      startTimeIso,
      endTimeIso,
    });
    expect(after.length).toBe(1);
    expect(after[0]!.isAvailableForWindow).toBe(false);
  });

  it('changes resource status to MAINTENANCE without deleting historical bookings', async () => {
    const chair = await repo.createResource(actor, {
      tenantId,
      branchId,
      nameAr: 'كرسي الصيانة',
      nameEn: '',
      type: 'BARBER_CHAIR',
      supportsAllBranchServices: true,
      supportedServiceIds: [],
      supportedCategoryIds: [],
      status: 'ACTIVE',
      description: '',
    });

    db.setDocumentDirect(firestorePaths.booking(tenantId, 'bk_hist'), {
      id: 'bk_hist',
      resourceId: chair.id,
      status: 'COMPLETED',
    });

    const updated = await repo.changeResourceStatus(actor, tenantId, chair.id, 'MAINTENANCE');
    expect(updated.status).toBe('MAINTENANCE');

    const histBooking = db.getDocumentDirect(firestorePaths.booking(tenantId, 'bk_hist'));
    expect(histBooking).toBeTruthy();
    expect(histBooking!.resourceId).toBe(chair.id);
  });
});
