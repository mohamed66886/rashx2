import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import {
  BookingRepository,
  BookingError,
  BookingErrorCode,
} from '../src/server/repositories/booking.repository';
import { firestorePaths } from '../src/paths';
import { riyadhTimeToUtcIso } from '../src/availability.types';

class InMemoryBookingFirestore {
  private store = new Map<string, Record<string, unknown>>();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
    } as unknown as DocumentReference;
  }

  collection(collectionPath: string) {
    return {
      path: collectionPath,
      where: (field: string, op: string, value: unknown) => {
        const filters = [{ field, value }];
        const chain = {
          where: (f2: string, op2: string, val2: unknown) => {
            filters.push({ field: f2, value: val2 });
            return chain;
          },
          get: async () => {
            const docs: DocumentSnapshot[] = [];
            for (const [p, data] of this.store.entries()) {
              if (p.startsWith(collectionPath + '/') && p.split('/').length === collectionPath.split('/').length + 1) {
                const match = filters.every((flt) => data && data[flt.field] === flt.value);
                if (match) {
                  docs.push(this.createSnapshot(p));
                }
              }
            }
            return { docs };
          },
        };
        return chain;
      },
      get: async () => {
        const docs: DocumentSnapshot[] = [];
        for (const [p] of this.store.entries()) {
          if (p.startsWith(collectionPath + '/') && p.split('/').length === collectionPath.split('/').length + 1) {
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

  getDocumentDirect(path: string): Record<string, unknown> | undefined {
    return this.store.get(path);
  }

  async runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    const stagedWrites = new Map<string, Record<string, unknown>>();
    const stagedDeletes = new Set<string>();

    const mockTransaction: Transaction = {
      get: async (target: DocumentReference) => {
        return this.createSnapshot(target.path);
      },
      set: (ref: DocumentReference, data: Record<string, unknown>, options?: { merge?: boolean }) => {
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
        const updated = { ...current };
        for (const [k, v] of Object.entries(data)) {
          if (k.includes('.')) {
            const [parent, child] = k.split('.');
            updated[parent!] = { ...(updated[parent!] || {}), [child!]: v };
          } else {
            updated[k] = v;
          }
        }
        stagedWrites.set(ref.path, updated);
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

describe('BookingRepository & Concurrency Protection', () => {
  let mockFirestore: InMemoryBookingFirestore;
  let repo: BookingRepository;
  const tenantId = 'tenant_salon_alpha';
  const branchId = 'branch_olaya';
  const serviceId = 'srv_royal_hair';
  const providerId = 'prov_samira';
  const customerId = 'cust_sarah';

  const ownerActor = {
    uid: 'owner_1',
    role: 'OWNER' as const,
  };

  const nowIso = new Date().toISOString();

  beforeEach(() => {
    mockFirestore = new InMemoryBookingFirestore();
    repo = new BookingRepository(mockFirestore as unknown as Firestore);

    // Seed Branch
    mockFirestore.setDocumentDirect(firestorePaths.branch(tenantId, branchId), {
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
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    // Seed Service (duration: 30 minutes, 150.00 SAR)
    mockFirestore.setDocumentDirect(firestorePaths.service(tenantId, serviceId), {
      id: serviceId,
      tenantId,
      categoryId: 'cat_hair',
      categoryNameAr: 'شعر',
      nameAr: 'قص ملكي وسشوار',
      durationMinutes: 30,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      basePriceHalalas: 15000,
      currency: 'SAR',
      taxMode: 'TAX_INCLUSIVE',
      taxRateBps: 1500,
      netPriceHalalas: 13043,
      calculatedTaxHalalas: 1957,
      totalPriceHalalas: 15000,
      primaryBranchId: branchId,
      assignedBranchIds: [branchId],
      assignedProviderIds: [providerId],
      displayOrder: 1,
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: 'owner_1',
      updatedBy: 'owner_1',
    });

    // Seed Provider
    mockFirestore.setDocumentDirect(firestorePaths.provider(tenantId, providerId), {
      id: providerId,
      tenantId,
      employeeId: 'emp_samira',
      displayNameAr: 'سميرة أخصائية تجميل',
      status: 'ACTIVE',
      assignedBranchIds: [branchId],
      assignedServiceIds: [serviceId],
      isPubliclyVisible: true,
      commissionEligible: true,
      defaultCommissionPolicyId: null,
      displayOrder: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    // Seed Customer
    mockFirestore.setDocumentDirect(firestorePaths.tenantCustomer(tenantId, customerId), {
      id: customerId,
      tenantId,
      fullName: 'سارة خالد',
      normalizedPhone: '+966501234567',
      displayPhone: '0501234567',
      email: 'sarah@example.com',
      dateOfBirth: null,
      gender: 'FEMALE',
      privateNotes: 'عميلة دائمة',
      tags: ['VIP'],
      status: 'ACTIVE',
      bookingStatistics: {
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        noShowBookings: 0,
        totalSpentHalalas: 0,
        lastBookingAt: null,
      },
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: 'owner_1',
      updatedBy: 'owner_1',
    });

    // Seed Tax Settings
    mockFirestore.setDocumentDirect(firestorePaths.taxSettings(tenantId), {
      tenantId,
      vatStatus: 'REGISTERED',
      vatNumber: '310123456789012',
      standardVatRateBps: 1500,
      rates: [{ rateBps: 1500, nameAr: 'النسبة الأساسية', effectiveFrom: '2020-07-01', effectiveUntil: null }],
      isTaxInclusivePricing: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  });

  describe('Atomic Booking Creation', () => {
    it('creates a booking, secures slot locks, and increments customer booking count', async () => {
      const startTimeIso = riyadhTimeToUtcIso('2026-11-25', '10:00');

      const booking = await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        scheduledStartTime: startTimeIso,
      });

      expect(booking.id).toMatch(/^bk_/);
      expect(booking.bookingNumber).toMatch(/^BK-20261125-/);
      expect(booking.status).toBe('CONFIRMED');
      expect(booking.priceSnapshot.totalPriceHalalas).toBe(15000);
      expect(booking.priceSnapshot.calculatedTaxHalalas).toBe(1957);

      // Verify slot locks created for the 30-minute interval (10:00 and 10:15)
      expect(booking.slotLockIds.length).toBe(2);
      expect(booking.slotLockIds).toContain(`${providerId}_2026-11-25_1000`);
      expect(booking.slotLockIds).toContain(`${providerId}_2026-11-25_1015`);

      const lockDoc = mockFirestore.getDocumentDirect(
        firestorePaths.slotLock(tenantId, `${providerId}_2026-11-25_1000`)
      );
      expect(lockDoc?.status).toBe('LOCKED');
      expect(lockDoc?.bookingId).toBe(booking.id);

      // Verify customer totalBookings incremented
      const custDoc = mockFirestore.getDocumentDirect(firestorePaths.tenantCustomer(tenantId, customerId));
      expect(custDoc?.bookingStatistics?.totalBookings).toBe(1);
    });

    it('rejects concurrent request for the same slot (Double Booking Prevention)', async () => {
      const startTimeIso = riyadhTimeToUtcIso('2026-11-25', '10:00');

      // First booking succeeds
      await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        scheduledStartTime: startTimeIso,
      });

      // Second booking for the same provider and overlapping slot MUST FAIL
      await expect(
        repo.createBooking(ownerActor, {
          tenantId,
          branchId,
          serviceId,
          providerId,
          customerId,
          scheduledStartTime: startTimeIso,
        })
      ).rejects.toThrow(BookingError);
    });

    it('rejects overlapping request starting during existing booking (e.g. 10:15)', async () => {
      const start1000 = riyadhTimeToUtcIso('2026-11-25', '10:00');
      const start1015 = riyadhTimeToUtcIso('2026-11-25', '10:15');

      await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        scheduledStartTime: start1000,
      });

      await expect(
        repo.createBooking(ownerActor, {
          tenantId,
          branchId,
          serviceId,
          providerId,
          customerId,
          scheduledStartTime: start1015,
        })
      ).rejects.toThrow(BookingError);
    });

    it('supports idempotencyKey to prevent duplicate booking on network retry', async () => {
      const startTimeIso = riyadhTimeToUtcIso('2026-11-25', '10:00');
      const key = 'idem_key_12345';

      const booking1 = await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        scheduledStartTime: startTimeIso,
        idempotencyKey: key,
      });

      // Retry with same idempotency key
      const booking2 = await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        scheduledStartTime: startTimeIso,
        idempotencyKey: key,
      });

      expect(booking1.id).toBe(booking2.id);
    });
  });

  describe('Rescheduling', () => {
    it('reschedules into an open slot and releases previous locks', async () => {
      const start1000 = riyadhTimeToUtcIso('2026-11-25', '10:00');
      const start1400 = riyadhTimeToUtcIso('2026-11-25', '14:00');

      const booking = await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        scheduledStartTime: start1000,
      });

      const rescheduled = await repo.rescheduleBooking(ownerActor, {
        tenantId,
        bookingId: booking.id,
        newScheduledStartTime: start1400,
        reason: 'طلب العميل التأجيل',
      });

      expect(rescheduled.scheduledStartTime).toBe(start1400);
      expect(rescheduled.rescheduling?.reason).toBe('طلب العميل التأجيل');

      // Old lock is released
      const oldLock = mockFirestore.getDocumentDirect(
        firestorePaths.slotLock(tenantId, `${providerId}_2026-11-25_1000`)
      );
      expect(oldLock?.status).toBe('RELEASED');

      // New lock is locked
      const newLock = mockFirestore.getDocumentDirect(
        firestorePaths.slotLock(tenantId, `${providerId}_2026-11-25_1400`)
      );
      expect(newLock?.status).toBe('LOCKED');
    });

    it('rejects rescheduling into an occupied slot while preserving original reservation', async () => {
      const start1000 = riyadhTimeToUtcIso('2026-11-25', '10:00');
      const start1400 = riyadhTimeToUtcIso('2026-11-25', '14:00');

      // Booking A at 10:00
      const bookingA = await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        scheduledStartTime: start1000,
      });

      // Booking B at 14:00
      await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        scheduledStartTime: start1400,
      });

      // Trying to reschedule A into 14:00 must fail
      await expect(
        repo.rescheduleBooking(ownerActor, {
          tenantId,
          bookingId: bookingA.id,
          newScheduledStartTime: start1400,
        })
      ).rejects.toThrow(BookingError);

      // Verify original lock at 10:00 is STILL LOCKED and untouched
      const originalLock = mockFirestore.getDocumentDirect(
        firestorePaths.slotLock(tenantId, `${providerId}_2026-11-25_1000`)
      );
      expect(originalLock?.status).toBe('LOCKED');
    });
  });

  describe('Cancellation', () => {
    it('cancels booking, releases slot locks, and increments cancelled count on customer', async () => {
      const startTimeIso = riyadhTimeToUtcIso('2026-11-25', '10:00');

      const booking = await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        scheduledStartTime: startTimeIso,
      });

      const cancelled = await repo.cancelBooking(ownerActor, {
        tenantId,
        bookingId: booking.id,
        reason: 'ظرف طارئ للعميل',
      });

      expect(cancelled.status).toBe('CANCELLED');
      expect(cancelled.cancellation?.reason).toBe('ظرف طارئ للعميل');

      // Slot locks released
      const lockDoc = mockFirestore.getDocumentDirect(
        firestorePaths.slotLock(tenantId, `${providerId}_2026-11-25_1000`)
      );
      expect(lockDoc?.status).toBe('RELEASED');

      // Customer stats updated
      const custDoc = mockFirestore.getDocumentDirect(firestorePaths.tenantCustomer(tenantId, customerId));
      expect(custDoc?.bookingStatistics?.cancelledBookings).toBe(1);
    });
  });

  describe('Lifecycle State Transitions', () => {
    it('executes valid status transitions and updates customer spend upon completion', async () => {
      const startTimeIso = riyadhTimeToUtcIso('2026-11-25', '10:00');

      const booking = await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        scheduledStartTime: startTimeIso,
      });

      // CONFIRMED -> CHECKED_IN
      const checkedIn = await repo.transitionBookingStatus(ownerActor, tenantId, booking.id, 'CHECKED_IN');
      expect(checkedIn.status).toBe('CHECKED_IN');
      expect(checkedIn.checkIn?.checkedInAt).toBeDefined();

      // CHECKED_IN -> IN_SERVICE
      const inService = await repo.transitionBookingStatus(ownerActor, tenantId, booking.id, 'IN_SERVICE');
      expect(inService.status).toBe('IN_SERVICE');
      expect(inService.serviceExecution?.startedAt).toBeDefined();

      // IN_SERVICE -> COMPLETED
      const completed = await repo.transitionBookingStatus(ownerActor, tenantId, booking.id, 'COMPLETED');
      expect(completed.status).toBe('COMPLETED');
      expect(completed.serviceExecution?.completedAt).toBeDefined();

      // Verify locks released
      const lockDoc = mockFirestore.getDocumentDirect(
        firestorePaths.slotLock(tenantId, `${providerId}_2026-11-25_1000`)
      );
      expect(lockDoc?.status).toBe('RELEASED');

      // Customer spend updated
      const custDoc = mockFirestore.getDocumentDirect(firestorePaths.tenantCustomer(tenantId, customerId));
      expect(custDoc?.bookingStatistics?.completedBookings).toBe(1);
      expect(custDoc?.bookingStatistics?.totalSpentHalalas).toBe(15000);
    });

    it('rejects invalid status transitions (e.g. COMPLETED -> IN_SERVICE)', async () => {
      const startTimeIso = riyadhTimeToUtcIso('2026-11-25', '10:00');

      const booking = await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        scheduledStartTime: startTimeIso,
      });

      await repo.transitionBookingStatus(ownerActor, tenantId, booking.id, 'CHECKED_IN');
      await repo.transitionBookingStatus(ownerActor, tenantId, booking.id, 'IN_SERVICE');
      await repo.transitionBookingStatus(ownerActor, tenantId, booking.id, 'COMPLETED');

      // Attempting to transition from terminal state COMPLETED must fail
      await expect(
        repo.transitionBookingStatus(ownerActor, tenantId, booking.id, 'IN_SERVICE')
      ).rejects.toThrow(BookingError);
    });
  });

  describe('Phase 4.1 Resource Slot Locking', () => {
    const resource1Id = 'res_chair_1';
    const resource2Id = 'res_chair_2';

    beforeEach(() => {
      mockFirestore.setDocumentDirect(firestorePaths.resource(tenantId, resource1Id), {
        id: resource1Id,
        tenantId,
        branchId,
        nameAr: 'كرسي 1',
        nameEn: 'Chair 1',
        code: '',
        type: 'BARBER_CHAIR',
        supportsAllBranchServices: true,
        supportedServiceIds: [],
        supportedCategoryIds: [],
        status: 'ACTIVE',
        description: '',
        createdBy: 'owner_1',
        updatedBy: 'owner_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      mockFirestore.setDocumentDirect(firestorePaths.resource(tenantId, resource2Id), {
        id: resource2Id,
        tenantId,
        branchId,
        nameAr: 'كرسي 2',
        nameEn: 'Chair 2',
        code: '',
        type: 'BARBER_CHAIR',
        supportsAllBranchServices: true,
        supportedServiceIds: [],
        supportedCategoryIds: [],
        status: 'ACTIVE',
        description: '',
        createdBy: 'owner_1',
        updatedBy: 'owner_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    it('locks resource slots on createBooking, migrates on rescheduleBooking, and releases on cancelBooking', async () => {
      const start1 = riyadhTimeToUtcIso('2026-11-25', '10:00');
      const start2 = riyadhTimeToUtcIso('2026-11-25', '12:00');

      const created = await repo.createBooking(ownerActor, {
        tenantId,
        branchId,
        serviceId,
        providerId,
        customerId,
        resourceId: resource1Id,
        scheduledStartTime: start1,
      });

      expect(created.resourceId).toBe(resource1Id);
      expect(created.resourceNameAr).toBe('كرسي 1');
      expect(created.resourceSlotLockIds.length).toBeGreaterThan(0);

      const lock1 = mockFirestore.getDocumentDirect(
        firestorePaths.resourceSlotLock(tenantId, `${resource1Id}_2026-11-25_1000`)
      );
      expect(lock1?.status).toBe('LOCKED');

      const rescheduled = await repo.rescheduleBooking(ownerActor, {
        tenantId,
        bookingId: created.id,
        newScheduledStartTime: start2,
        newResourceId: resource2Id,
        reason: 'تغيير الكرسي',
      });

      expect(rescheduled.resourceId).toBe(resource2Id);
      expect(rescheduled.resourceNameAr).toBe('كرسي 2');

      const oldLock1 = mockFirestore.getDocumentDirect(
        firestorePaths.resourceSlotLock(tenantId, `${resource1Id}_2026-11-25_1000`)
      );
      const newLock2 = mockFirestore.getDocumentDirect(
        firestorePaths.resourceSlotLock(tenantId, `${resource2Id}_2026-11-25_1200`)
      );
      expect(oldLock1?.status).toBe('RELEASED');
      expect(newLock2?.status).toBe('LOCKED');

      await repo.cancelBooking(ownerActor, {
        tenantId,
        bookingId: created.id,
        reason: 'إلغاء',
      });

      const releasedLock2 = mockFirestore.getDocumentDirect(
        firestorePaths.resourceSlotLock(tenantId, `${resource2Id}_2026-11-25_1200`)
      );
      expect(releasedLock2?.status).toBe('RELEASED');
    });
  });
});

