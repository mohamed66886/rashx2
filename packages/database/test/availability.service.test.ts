import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { AvailabilityService } from '../src/server/availability.service';
import { firestorePaths } from '../src/paths';
import { riyadhTimeToUtcIso, utcIsoToRiyadhTime } from '../src/availability.types';

class InMemoryAvailabilityFirestore {
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
}

describe('AvailabilityService & Riyadh Scheduling Rules', () => {
  let mockFirestore: InMemoryAvailabilityFirestore;
  let service: AvailabilityService;
  const tenantId = 'tenant_salon_alpha';
  const branchId = 'branch_olaya';
  const serviceId = 'srv_haircut';
  const providerId = 'prov_mona';

  const nowIso = new Date().toISOString();

  beforeEach(() => {
    mockFirestore = new InMemoryAvailabilityFirestore();
    service = new AvailabilityService(mockFirestore as unknown as Firestore);

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
        monday: { open: '10:00', close: '12:00', isClosed: false },
        tuesday: { open: '10:00', close: '12:00', isClosed: false },
        wednesday: { open: '10:00', close: '12:00', isClosed: false },
        thursday: { open: '10:00', close: '12:00', isClosed: false },
        friday: { open: '14:00', close: '20:00', isClosed: true }, // Friday closed!
        saturday: { open: '10:00', close: '12:00', isClosed: false },
        sunday: { open: '10:00', close: '12:00', isClosed: false },
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    // Seed Service (duration: 30m, bufferBefore: 0m, bufferAfter: 0m)
    mockFirestore.setDocumentDirect(firestorePaths.service(tenantId, serviceId), {
      id: serviceId,
      tenantId,
      categoryId: 'cat_hair',
      categoryNameAr: 'شعر',
      nameAr: 'قص واستشوار ملكي',
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
      employeeId: 'emp_mona',
      displayNameAr: 'منى أخصائية شعر',
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
  });

  describe('Timezone & Datetime Calculations', () => {
    it('converts Riyadh local time to UTC ISO instant (+03:00)', () => {
      // 10:00 AM Riyadh is 07:00 AM UTC
      const utcIso = riyadhTimeToUtcIso('2026-11-25', '10:00');
      expect(utcIso).toBe('2026-11-25T07:00:00.000Z');
    });

    it('converts UTC ISO instant back to Riyadh local time and day of week', () => {
      const utcIso = '2026-11-25T07:00:00.000Z';
      const riyadh = utcIsoToRiyadhTime(utcIso);
      expect(riyadh.date).toBe('2026-11-25');
      expect(riyadh.time).toBe('10:00');
      expect(riyadh.dayOfWeek).toBe('wednesday');
    });
  });

  describe('Slot Generation & Operating Hours', () => {
    it('generates 30-minute slots from 10:00 to 12:00 (10:00, 10:15, 10:30, 10:45, 11:00, 11:15, 11:30)', async () => {
      // 2026-11-25 is a Wednesday
      const result = await service.getAvailableSlots({
        tenantId,
        branchId,
        serviceId,
        date: '2026-11-25',
      });

      expect(result.slots.length).toBeGreaterThan(0);
      expect(result.slots[0]?.time).toBe('10:00');
      expect(result.slots[0]?.endTime).toBe('10:30');

      // The last slot starting at 11:30 finishes at 12:00 (branch close).
      // Slot at 11:45 would finish at 12:15 which exceeds branch close!
      const lastSlot = result.slots[result.slots.length - 1];
      expect(lastSlot?.time).toBe('11:30');
      expect(lastSlot?.endTime).toBe('12:00');
    });

    it('returns 0 slots on a closed day (e.g. Friday)', async () => {
      // 2026-11-27 is a Friday (isClosed: true)
      const result = await service.getAvailableSlots({
        tenantId,
        branchId,
        serviceId,
        date: '2026-11-27',
      });

      expect(result.slots.length).toBe(0);
    });

    it('filters out slots that conflict with existing slot locks', async () => {
      // Lock slot 10:00 to 10:30 (slices 10:00 and 10:15)
      mockFirestore.setDocumentDirect(
        firestorePaths.slotLock(tenantId, `${providerId}_2026-11-25_1000`),
        {
          id: `${providerId}_2026-11-25_1000`,
          tenantId,
          providerId,
          branchId,
          bookingId: 'bk_prior',
          date: '2026-11-25',
          slotTime: '10:00',
          startTimeIso: '2026-11-25T07:00:00.000Z',
          endTimeIso: '2026-11-25T07:15:00.000Z',
          status: 'LOCKED',
          createdAt: nowIso,
          updatedAt: nowIso,
        }
      );

      const result = await service.getAvailableSlots({
        tenantId,
        branchId,
        serviceId,
        date: '2026-11-25',
      });

      // Slot at 10:00 must NOT be present
      expect(result.slots.some((s) => s.time === '10:00')).toBe(false);
      // Next free slot starting at 10:15 or 10:30 is available
      expect(result.slots.some((s) => s.time === '10:30')).toBe(true);
    });
  });
});

