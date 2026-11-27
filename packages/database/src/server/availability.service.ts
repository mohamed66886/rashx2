import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from './index';
import { firestorePaths } from '../paths';
import {
  AvailabilityQueryInputSchema,
  riyadhTimeToUtcIso,
  utcIsoToRiyadhTime,
  SLOT_GRANULARITY_MINUTES,
  type AvailabilityQueryInput,
  type AvailabilityQueryResult,
  type TimeSlot,
  type ProviderAvailabilitySummary,
} from '../availability.types';
import { ServiceDocSchema, type ServiceDoc } from '../service.schema';
import { BranchDocSchema, type BranchDoc, type OperatingHoursDay } from '../branch.schema';
import { ProviderDocSchema, type ProviderDoc } from '../provider.schema';
import { SlotLockDocSchema, type SlotLockDoc } from '../booking.schema';
import {
  ResourceDocSchema,
  ResourceSlotLockDocSchema,
  isResourceEligibleForService,
  type ResourceDoc,
} from '../resource.schema';

export class AvailabilityService {
  constructor(private readonly firestore: Firestore = getFirebaseAdminFirestore()) {}

  /**
   * Calculates available appointment slots for a given tenant, branch, service, and date.
   */
  async getAvailableSlots(input: AvailabilityQueryInput): Promise<AvailabilityQueryResult> {
    const parsed = AvailabilityQueryInputSchema.parse(input);
    const {
      tenantId,
      branchId,
      serviceId,
      date,
      providerId: requestedProviderId,
      resourceId: requestedResourceId,
    } = parsed;

    // 1. Fetch Authoritative Service Document
    const serviceRef = this.firestore.doc(firestorePaths.service(tenantId, serviceId));
    const serviceSnap = await serviceRef.get();
    if (!serviceSnap.exists) {
      throw new Error(`Service ${serviceId} does not exist in tenant ${tenantId}.`);
    }
    const service = ServiceDocSchema.parse(serviceSnap.data());
    if (!service.isActive) {
      throw new Error(`Service ${serviceId} is currently inactive.`);
    }

    if (!service.assignedBranchIds.includes(branchId)) {
      throw new Error(`Service ${serviceId} is not offered at branch ${branchId}.`);
    }

    // 2. Fetch Authoritative Branch Document
    const branchRef = this.firestore.doc(firestorePaths.branch(tenantId, branchId));
    const branchSnap = await branchRef.get();
    if (!branchSnap.exists) {
      throw new Error(`Branch ${branchId} does not exist in tenant ${tenantId}.`);
    }
    const branch = BranchDocSchema.parse(branchSnap.data());
    if (!branch.isActive) {
      throw new Error(`Branch ${branchId} is currently inactive.`);
    }

    // 3. Determine Day of Week and Operating Hours in Riyadh Time
    // Choose noon in Riyadh to inspect day of week reliably
    const sampleUtcIso = riyadhTimeToUtcIso(date, '12:00');
    const { dayOfWeek } = utcIsoToRiyadhTime(sampleUtcIso);

    const hoursForDay = (branch.operatingHours as Record<string, OperatingHoursDay>)[dayOfWeek];
    if (!hoursForDay || hoursForDay.isClosed) {
      return {
        date,
        branchId,
        serviceId,
        serviceNameAr: service.nameAr,
        serviceDurationMinutes: service.durationMinutes,
        bufferBeforeMinutes: service.bufferBeforeMinutes,
        bufferAfterMinutes: service.bufferAfterMinutes,
        totalDurationMinutes:
          service.durationMinutes + service.bufferBeforeMinutes + service.bufferAfterMinutes,
        priceHalalas: service.totalPriceHalalas,
        timezone: 'Asia/Riyadh',
        availableProviders: [],
        slots: [],
      };
    }

    // 4. Fetch Eligible Providers
    const providersCol = this.firestore.collection(firestorePaths.providers(tenantId));
    const providersSnap = await providersCol.where('status', '==', 'ACTIVE').get();

    let eligibleProviders = providersSnap.docs
      .map((d) => ProviderDocSchema.parse(d.data()))
      .filter((p) => {
        const assignedToBranch = p.assignedBranchIds.includes(branchId);
        const assignedToService =
          p.assignedServiceIds.includes(serviceId) ||
          service.assignedProviderIds.includes(p.id);
        return assignedToBranch && assignedToService;
      });

    if (requestedProviderId) {
      eligibleProviders = eligibleProviders.filter((p) => p.id === requestedProviderId);
    }

    if (eligibleProviders.length === 0) {
      return {
        date,
        branchId,
        serviceId,
        serviceNameAr: service.nameAr,
        serviceDurationMinutes: service.durationMinutes,
        bufferBeforeMinutes: service.bufferBeforeMinutes,
        bufferAfterMinutes: service.bufferAfterMinutes,
        totalDurationMinutes:
          service.durationMinutes + service.bufferBeforeMinutes + service.bufferAfterMinutes,
        priceHalalas: service.totalPriceHalalas,
        timezone: 'Asia/Riyadh',
        availableProviders: [],
        slots: [],
      };
    }

    // 5. Fetch Reserved Slot Locks for Candidate Providers on Date
    const slotLocksCol = this.firestore.collection(firestorePaths.slotLocks(tenantId));
    const locksSnap = await slotLocksCol
      .where('date', '==', date)
      .where('status', '==', 'LOCKED')
      .get();

    const activeLocksByProvider = new Map<string, Set<string>>();
    for (const doc of locksSnap.docs) {
      const lock = SlotLockDocSchema.parse(doc.data());
      let set = activeLocksByProvider.get(lock.providerId);
      if (!set) {
        set = new Set<string>();
        activeLocksByProvider.set(lock.providerId, set);
      }
      set.add(lock.slotTime);
    }

    // 5b. Fetch Eligible Resources & Reserved Resource Slot Locks when applicable
    let eligibleResources: ResourceDoc[] = [];
    const activeLocksByResource = new Map<string, Set<string>>();
    if (service.resourceRequirement !== 'NONE') {
      const resourcesSnap = await this.firestore
        .collection(firestorePaths.resources(tenantId))
        .where('branchId', '==', branchId)
        .where('status', '==', 'ACTIVE')
        .get();

      eligibleResources = resourcesSnap.docs
        .map((d) => ResourceDocSchema.parse(d.data()))
        .filter((r) => isResourceEligibleForService(r, service).eligible);

      if (requestedResourceId) {
        eligibleResources = eligibleResources.filter((r) => r.id === requestedResourceId);
      }

      if (eligibleResources.length > 0 || requestedResourceId || service.resourceRequirement === 'REQUIRED') {
        const resLocksSnap = await this.firestore
          .collection(firestorePaths.resourceSlotLocks(tenantId))
          .where('date', '==', date)
          .where('status', '==', 'LOCKED')
          .get();
        for (const doc of resLocksSnap.docs) {
          const lock = ResourceSlotLockDocSchema.parse(doc.data());
          let set = activeLocksByResource.get(lock.resourceId);
          if (!set) {
            set = new Set<string>();
            activeLocksByResource.set(lock.resourceId, set);
          }
          set.add(lock.slotTime);
        }
      }
    }

    if ((requestedResourceId || service.resourceRequirement === 'REQUIRED') && eligibleResources.length === 0) {
      return {
        date,
        branchId,
        serviceId,
        serviceNameAr: service.nameAr,
        serviceDurationMinutes: service.durationMinutes,
        bufferBeforeMinutes: service.bufferBeforeMinutes,
        bufferAfterMinutes: service.bufferAfterMinutes,
        totalDurationMinutes:
          service.durationMinutes + service.bufferBeforeMinutes + service.bufferAfterMinutes,
        priceHalalas: service.totalPriceHalalas,
        timezone: 'Asia/Riyadh',
        availableProviders: [],
        availableResources: [],
        slots: [],
      };
    }

    // 6. Generate Potential Slots from Branch Open to Close
    const [openH, openM] = hoursForDay.open.split(':').map(Number);
    const [closeH, closeM] = hoursForDay.close.split(':').map(Number);

    const openTotalMinutes = (openH ?? 9) * 60 + (openM ?? 0);
    const closeTotalMinutes = (closeH ?? 21) * 60 + (closeM ?? 0);

    const serviceDuration = service.durationMinutes;
    const bufferBefore = service.bufferBeforeMinutes;
    const bufferAfter = service.bufferAfterMinutes;
    const totalSlotRequired = bufferBefore + serviceDuration + bufferAfter;

    const allSlots: TimeSlot[] = [];
    const providerSlotCounts = new Map<string, number>();

    for (const provider of eligibleProviders) {
      const providerLocks = activeLocksByProvider.get(provider.id) || new Set<string>();
      let count = 0;

      for (
        let currentMinutes = openTotalMinutes;
        currentMinutes + totalSlotRequired <= closeTotalMinutes;
        currentMinutes += SLOT_GRANULARITY_MINUTES
      ) {
        // Service starts after bufferBefore
        const serviceStartMinutes = currentMinutes + bufferBefore;
        const serviceEndMinutes = serviceStartMinutes + serviceDuration;
        const blockEndMinutes = currentMinutes + totalSlotRequired;

        // Check if any 15-minute slice within [currentMinutes, blockEndMinutes) is locked
        const sliceTimes: string[] = [];
        let isConflict = false;
        for (
          let slice = currentMinutes;
          slice < blockEndMinutes;
          slice += SLOT_GRANULARITY_MINUTES
        ) {
          const sliceH = String(Math.floor(slice / 60)).padStart(2, '0');
          const sliceM = String(slice % 60).padStart(2, '0');
          const sliceTimeStr = `${sliceH}:${sliceM}`;
          sliceTimes.push(sliceTimeStr);
          if (providerLocks.has(sliceTimeStr)) {
            isConflict = true;
            break;
          }
        }

        // Check resource availability if resourceId was specified or service requires a resource
        if (!isConflict && (requestedResourceId || service.resourceRequirement === 'REQUIRED')) {
          const hasFreeResource = eligibleResources.some((res) => {
            const resLocks = activeLocksByResource.get(res.id) || new Set<string>();
            return sliceTimes.every((st) => !resLocks.has(st));
          });
          if (!hasFreeResource) {
            isConflict = true;
          }
        }

        const startH = String(Math.floor(serviceStartMinutes / 60)).padStart(2, '0');
        const startM = String(serviceStartMinutes % 60).padStart(2, '0');
        const startTimeStr = `${startH}:${startM}`;

        const endH = String(Math.floor(serviceEndMinutes / 60)).padStart(2, '0');
        const endM = String(serviceEndMinutes % 60).padStart(2, '0');
        const endTimeStr = `${endH}:${endM}`;

        const startTimeIso = riyadhTimeToUtcIso(date, startTimeStr);
        const endTimeIso = riyadhTimeToUtcIso(date, endTimeStr);

        if (!isConflict) {
          count++;
          allSlots.push({
            time: startTimeStr,
            endTime: endTimeStr,
            startTimeIso,
            endTimeIso,
            providerId: provider.id,
            providerNameAr: provider.displayNameAr,
            providerPhotoUrl: provider.photoUrl || undefined,
            available: true,
          });
        }
      }

      providerSlotCounts.set(provider.id, count);
    }

    // Sort slots by time ascending, then provider
    allSlots.sort((a, b) => a.startTimeIso.localeCompare(b.startTimeIso));

    const providerSummaries: ProviderAvailabilitySummary[] = eligibleProviders.map((p) => ({
      id: p.id,
      displayNameAr: p.displayNameAr,
      photoUrl: p.photoUrl || undefined,
      availableSlotCount: providerSlotCounts.get(p.id) || 0,
    }));

    return {
      date,
      branchId,
      serviceId,
      serviceNameAr: service.nameAr,
      serviceDurationMinutes: service.durationMinutes,
      bufferBeforeMinutes: service.bufferBeforeMinutes,
      bufferAfterMinutes: service.bufferAfterMinutes,
      totalDurationMinutes: totalSlotRequired,
      priceHalalas: service.totalPriceHalalas,
      timezone: 'Asia/Riyadh',
      availableProviders: providerSummaries,
      availableResources: eligibleResources.map((r) => ({
        id: r.id,
        nameAr: r.nameAr,
        type: r.type,
        code: r.code || undefined,
      })),
      slots: allSlots,
    };
  }
}

