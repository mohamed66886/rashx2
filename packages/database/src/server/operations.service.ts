import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from './index';
import { firestorePaths } from '../paths';
import {
  WalkInRegistrationInputSchema,
  type QueueEntryDoc,
  type QueueCallDoc,
  type WalkInRegistrationInput,
} from '../queue.schema';
import { type BookingDoc, type BookingStatus } from '../booking.schema';
import { type CustomerDoc } from '../customer.schema';
import { type ResourceDoc, ResourceSlotLockDocSchema } from '../resource.schema';
import { ProviderDocSchema, type ProviderDoc } from '../provider.schema';
import { ServiceDocSchema, type ServiceDoc } from '../service.schema';
import { BranchDocSchema, type BranchDoc } from '../branch.schema';
import { SlotLockDocSchema } from '../booking.schema';
import {
  riyadhDayBoundsUtc,
  riyadhDateRangeUtc,
  utcIsoToRiyadhTime,
  getCurrentRiyadhTimeRounded15,
} from '../availability.types';
import { hasPermission, type TenantRole } from '../permissions';
import { TrustedSystemContext } from './repositories/trusted-context';
import { CustomerRepository } from './repositories/customer.repository';
import { BookingRepository } from './repositories/booking.repository';
import { QueueRepository } from './repositories/queue.repository';
import { ResourceRepository } from './repositories/resource.repository';
import { AvailabilityService } from './availability.service';

export enum OperationsErrorCode {
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  FORBIDDEN = 'FORBIDDEN',
  BRANCH_FORBIDDEN = 'BRANCH_FORBIDDEN',
  CUSTOMER_INVALID = 'CUSTOMER_INVALID',
  SLOT_UNAVAILABLE = 'SLOT_UNAVAILABLE',
}

export class OperationsError extends Error {
  constructor(
    public readonly code: OperationsErrorCode,
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'OperationsError';
  }
}

export type OperationsActor =
  | TrustedSystemContext
  | {
      uid: string;
      role: TenantRole;
      customPermissions?: readonly string[] | null;
      assignedBranchIds?: readonly string[] | null;
      isPlatformAdmin?: boolean;
    };

export interface OperationalWarning {
  type:
    | 'DELAYED_CHECK_IN'
    | 'SERVICE_OVERRUN'
    | 'RESOURCE_UNAVAILABLE'
    | 'MISSING_RESOURCE'
    | 'SCHEDULE_OVERLAP';
  severity: 'HIGH' | 'MEDIUM';
  bookingId: string;
  bookingNumber: string;
  messageAr: string;
}

export interface WalkInRegistrationResult {
  booking: BookingDoc;
  customer: CustomerDoc;
  queueEntry: QueueEntryDoc | null;
  deduplicated: boolean;
}

export interface DailyOperationsSnapshot {
  date: string;
  timezone: 'Asia/Riyadh';
  branches: BranchDoc[];
  providers: ProviderDoc[];
  resources: ResourceDoc[];
  services: ServiceDoc[];
  bookings: BookingDoc[];
  queueEntries: QueueEntryDoc[];
  recentCalls: QueueCallDoc[];
  availableProviderIds: string[];
  availableResourceIds: string[];
  warnings: OperationalWarning[];
  counts: {
    totalToday: number;
    confirmed: number;
    checkedIn: number;
    inService: number;
    completed: number;
    cancelled: number;
    noShow: number;
    walkIns: number;
    waitingQueue: number;
    calledQueue: number;
    availableProviders: number;
    availableResources: number;
  };
}

export class DailyOperationsService {
  private readonly customerRepo: CustomerRepository;
  private readonly bookingRepo: BookingRepository;
  private readonly queueRepo: QueueRepository;
  private readonly resourceRepo: ResourceRepository;
  private readonly availabilityService: AvailabilityService;

  constructor(private readonly firestore: Firestore = getFirebaseAdminFirestore()) {
    this.customerRepo = new CustomerRepository(firestore);
    this.bookingRepo = new BookingRepository(firestore);
    this.queueRepo = new QueueRepository(firestore);
    this.resourceRepo = new ResourceRepository(firestore);
    this.availabilityService = new AvailabilityService(firestore);
  }

  private verifyPermission(
    actor: OperationsActor,
    capability: Parameters<typeof hasPermission>[1]
  ): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin) return;
    if (!hasPermission(actor.role, capability, actor.customPermissions)) {
      throw new OperationsError(
        OperationsErrorCode.FORBIDDEN,
        `غير مصرح: لا تملك الصلاحية المطلوبة (${capability}) لهذه العملية التشغيلية.`
      );
    }
  }

  private verifyBranchAccess(actor: OperationsActor, branchId: string): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin) return;
    if (actor.role === 'OWNER') return;
    if (actor.assignedBranchIds && actor.assignedBranchIds.length > 0) {
      if (!actor.assignedBranchIds.includes(branchId)) {
        throw new OperationsError(
          OperationsErrorCode.BRANCH_FORBIDDEN,
          'غير مصرح: لا تملك صلاحية العمليات التشغيلية في هذا الفرع.'
        );
      }
    }
  }

  /**
   * Orchestrates the complete Walk-In registration workflow:
   * 1. Deduplicates retries via `idempotencyKey`.
   * 2. Selects existing customer OR creates customer (supporting explicit Guest Policy without fake phones).
   * 3. Checks real availability via `AvailabilityService`.
   * 4. Creates canonical booking (`source: 'WALK_IN'`) via `BookingRepository`.
   * 5. Checks in (`CONFIRMED -> CHECKED_IN`) and enqueues into `queue_entries` when requested.
   */
  async registerWalkIn(
    actor: OperationsActor,
    rawInput: WalkInRegistrationInput
  ): Promise<WalkInRegistrationResult> {
    this.verifyPermission(actor, 'walkins.manage');

    const parseResult = WalkInRegistrationInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new OperationsError(
        OperationsErrorCode.INVALID_PAYLOAD,
        `بيانات تسجيل الزيارة الفورية غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    this.verifyBranchAccess(actor, input.branchId);
    const tenantId = input.tenantId;

    if (input.priority) {
      this.verifyPermission(actor, 'queue.reorder');
    }

    // 1. Check Walk-In Idempotency first
    const idempSnap = await this.firestore
      .doc(firestorePaths.bookingIdempotency(tenantId, input.idempotencyKey))
      .get();
    if (idempSnap.exists) {
      const existingBookingId = idempSnap.data()?.bookingId;
      if (existingBookingId) {
        const existingBooking = await this.bookingRepo.getBookingById(
          actor,
          tenantId,
          existingBookingId
        );
        if (existingBooking) {
          const existingCust = await this.customerRepo.getCustomerById(
            actor,
            tenantId,
            existingBooking.customerId
          );
          const qSnap = await this.firestore
            .doc(firestorePaths.queueEntry(tenantId, existingBooking.id))
            .get();
          const existingQueue = qSnap.exists
            ? await this.queueRepo
                .listQueueEntries(actor, tenantId, {
                  branchId: existingBooking.branchId,
                  date: utcIsoToRiyadhTime(existingBooking.scheduledStartTime).date,
                })
                .then((list) => list.find((e) => e.bookingId === existingBooking.id) || null)
            : null;
          if (existingCust) {
            return {
              booking: existingBooking,
              customer: existingCust,
              queueEntry: existingQueue,
              deduplicated: true,
            };
          }
        }
      }
    }

    // 2. Resolve or Create Customer (Enforces Guest Policy; no fake phones)
    let customer: CustomerDoc | null = null;
    if (input.existingCustomerId) {
      customer = await this.customerRepo.getCustomerById(actor, tenantId, input.existingCustomerId);
      if (!customer) {
        throw new OperationsError(OperationsErrorCode.CUSTOMER_INVALID, 'العميل المحدد غير موجود.');
      }
      if (customer.status !== 'ACTIVE') {
        throw new OperationsError(
          OperationsErrorCode.CUSTOMER_INVALID,
          'العميل المحدد مؤرشف ولا يمكن تسجيل حجز جديد له.'
        );
      }
    } else {
      const cleanName = input.newCustomerName?.trim();
      if (!cleanName || cleanName.length < 2) {
        throw new OperationsError(
          OperationsErrorCode.INVALID_PAYLOAD,
          'يجب اختيار عميل حالي أو إدخال اسم العميل الجديد.'
        );
      }
      const cleanPhone = input.newCustomerPhone?.trim() || '';
      if (cleanPhone) {
        const existingByPhone = await this.customerRepo.getCustomerByPhone(
          actor,
          tenantId,
          cleanPhone
        );
        if (existingByPhone) {
          if (existingByPhone.status !== 'ACTIVE') {
            throw new OperationsError(
              OperationsErrorCode.CUSTOMER_INVALID,
              'العميل المرتبط بهذا الرقم مؤرشف حالياً.'
            );
          }
          customer = existingByPhone;
        } else {
          customer = await this.customerRepo.createCustomer(actor, {
            tenantId,
            fullName: cleanName,
            isGuest: false,
            phone: cleanPhone,
            idempotencyKey: `walkin_cust_${input.idempotencyKey}`,
          });
        }
      } else {
        if (!input.isGuestCustomer) {
          throw new OperationsError(
            OperationsErrorCode.INVALID_PAYLOAD,
            'رقم الجوال مطلوب، أو قم بتفعيل خيار "عميل زائر بدون جوال".'
          );
        }
        customer = await this.customerRepo.createCustomer(actor, {
          tenantId,
          fullName: cleanName,
          isGuest: true,
          phone: null,
          tags: ['WALK_IN_GUEST'],
          idempotencyKey: `walkin_guest_${input.idempotencyKey}`,
        });
      }
    }

    // 3. Validate Actual Availability via Phase 4.0 AvailabilityService
    const canonicalStartIso = new Date(input.scheduledStartTime).toISOString();
    const { date: riyadhDate } = utcIsoToRiyadhTime(canonicalStartIso);

    const availability = await this.availabilityService.getAvailableSlots({
      tenantId,
      branchId: input.branchId,
      serviceId: input.serviceId,
      date: riyadhDate,
      providerId: input.providerId,
      resourceId: input.resourceId || undefined,
    });

    const isSlotOpen = availability.slots.some(
      (s) => s.providerId === input.providerId && s.startTimeIso === canonicalStartIso
    );
    if (!isSlotOpen) {
      throw new OperationsError(
        OperationsErrorCode.SLOT_UNAVAILABLE,
        'الموعد الفوري المختار غير متاح حسب ساعات عمل الفرع أو جدول مقدم الخدمة أو المورد.'
      );
    }

    // 4. Create Canonical Booking (`source: 'WALK_IN'`)
    const booking = await this.bookingRepo.createBooking(actor, {
      tenantId,
      branchId: input.branchId,
      serviceId: input.serviceId,
      providerId: input.providerId,
      resourceId: input.resourceId ?? null,
      customerId: customer.id,
      scheduledStartTime: canonicalStartIso,
      customerNotes: input.customerNotes || '',
      internalNotes: input.internalNotes || '',
      source: 'WALK_IN',
      idempotencyKey: input.idempotencyKey,
      initialStatus: 'CONFIRMED',
    });

    // 5. Check-in & Add to Queue when requested
    let finalBooking = booking;
    let queueEntry: QueueEntryDoc | null = null;
    if (input.addToQueue) {
      finalBooking = await this.bookingRepo.transitionBookingStatus(
        actor,
        tenantId,
        booking.id,
        'CHECKED_IN'
      );
      queueEntry = await this.queueRepo.enqueueBooking(actor, {
        tenantId,
        bookingId: finalBooking.id,
        priority: input.priority ?? false,
        notes: input.customerNotes || '',
      });
    }

    return {
      booking: finalBooking,
      customer,
      queueEntry,
      deduplicated: false,
    };
  }

  /**
   * Computes operational warnings (delays, overruns, unavailable resources, schedule overlaps)
   * without mutating any booking state.
   */
  evaluateOperationalWarnings(
    bookings: readonly BookingDoc[],
    resourcesById: ReadonlyMap<string, ResourceDoc>,
    servicesById: ReadonlyMap<string, ServiceDoc>,
    now: Date = new Date()
  ): OperationalWarning[] {
    const warnings: OperationalWarning[] = [];
    const nowMs = now.getTime();
    const delayGraceMs = 5 * 60 * 1000;

    // Group active bookings by provider & resource for overlap inspection
    const activeStatuses = new Set<BookingStatus>([
      'PENDING',
      'CONFIRMED',
      'CHECKED_IN',
      'IN_SERVICE',
    ]);
    const activeByProvider = new Map<string, BookingDoc[]>();

    for (const bk of bookings) {
      const startMs = new Date(bk.scheduledStartTime).getTime();
      const endMs = new Date(bk.scheduledEndTime).getTime();

      if (bk.status === 'CONFIRMED' && nowMs > startMs + delayGraceMs) {
        warnings.push({
          type: 'DELAYED_CHECK_IN',
          severity: 'MEDIUM',
          bookingId: bk.id,
          bookingNumber: bk.bookingNumber,
          messageAr: `تأخر حضور العميل (${bk.customerName}) عن الموعد ${bk.bookingNumber}.`,
        });
      }

      if (bk.status === 'IN_SERVICE' && nowMs > endMs) {
        warnings.push({
          type: 'SERVICE_OVERRUN',
          severity: 'HIGH',
          bookingId: bk.id,
          bookingNumber: bk.bookingNumber,
          messageAr: `تجاوز وقت تقديم الخدمة للعميل (${bk.customerName}) الموعد المحدد (${bk.bookingNumber}).`,
        });
      }

      if (activeStatuses.has(bk.status)) {
        if (bk.resourceId) {
          const res = resourcesById.get(bk.resourceId);
          if (res && res.status !== 'ACTIVE') {
            warnings.push({
              type: 'RESOURCE_UNAVAILABLE',
              severity: 'HIGH',
              bookingId: bk.id,
              bookingNumber: bk.bookingNumber,
              messageAr: `الحجز ${bk.bookingNumber} معين على مورد (${res.nameAr}) حالته الحالية (${res.status === 'MAINTENANCE' ? 'صيانة' : 'غير نشط'}).`,
            });
          }
        } else {
          const svc = servicesById.get(bk.serviceId);
          if (svc?.resourceRequirement === 'REQUIRED') {
            warnings.push({
              type: 'MISSING_RESOURCE',
              severity: 'MEDIUM',
              bookingId: bk.id,
              bookingNumber: bk.bookingNumber,
              messageAr: `الحجز ${bk.bookingNumber} يتطلب تخصيص كرسي أو غرفة صالون.`,
            });
          }
        }

        const pList = activeByProvider.get(bk.providerId) || [];
        pList.push(bk);
        activeByProvider.set(bk.providerId, pList);
      }
    }

    for (const list of activeByProvider.values()) {
      list.sort((a, b) => a.scheduledStartTime.localeCompare(b.scheduledStartTime));
      for (let i = 0; i < list.length - 1; i++) {
        const curr = list[i]!;
        const next = list[i + 1]!;
        if (new Date(curr.scheduledEndTime).getTime() > new Date(next.scheduledStartTime).getTime()) {
          warnings.push({
            type: 'SCHEDULE_OVERLAP',
            severity: 'HIGH',
            bookingId: next.id,
            bookingNumber: next.bookingNumber,
            messageAr: `تداخل في جدول مقدم الخدمة (${next.providerNameAr}) بين ${curr.bookingNumber} و ${next.bookingNumber}.`,
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Builds the full bounded Daily Operations Snapshot for the salon dashboard.
   */
  async getDailyOperationsSnapshot(
    actor: OperationsActor,
    tenantId: string,
    filters: {
      date: string;
      branchId?: string;
      providerId?: string;
      serviceId?: string;
      status?: BookingStatus;
    },
    now: Date = new Date()
  ): Promise<DailyOperationsSnapshot> {
    this.verifyPermission(actor, 'operations.read');
    if (filters.branchId) {
      this.verifyBranchAccess(actor, filters.branchId);
    }

    const { startTimeIso, endTimeIso } = riyadhDayBoundsUtc(filters.date);

    const [branchesSnap, providersSnap, servicesSnap, resourcesList, bookingsRes, queueEntries, recentCalls] =
      await Promise.all([
        this.firestore.collection(firestorePaths.branches(tenantId)).get(),
        this.firestore
          .collection(firestorePaths.providers(tenantId))
          .where('status', '==', 'ACTIVE')
          .get(),
        this.firestore.collection(firestorePaths.services(tenantId)).get(),
        this.resourceRepo.listResources(actor, tenantId, {
          branchId: filters.branchId,
        }),
        this.bookingRepo.listBookingsByDateRange(actor, tenantId, {
          startTimeIso,
          endTimeIso,
          branchId: filters.branchId,
          providerId: filters.providerId,
          serviceId: filters.serviceId,
          status: filters.status,
          limit: 250,
        }),
        hasPermission(
          TrustedSystemContext.isTrusted(actor) ? 'OWNER' : actor.role,
          'queue.read',
          TrustedSystemContext.isTrusted(actor) ? null : actor.customPermissions
        )
          ? this.queueRepo.listQueueEntries(actor, tenantId, {
              branchId: filters.branchId,
              date: filters.date,
              providerId: filters.providerId,
            })
          : Promise.resolve([]),
        hasPermission(
          TrustedSystemContext.isTrusted(actor) ? 'OWNER' : actor.role,
          'queue.read',
          TrustedSystemContext.isTrusted(actor) ? null : actor.customPermissions
        )
          ? this.queueRepo.listCallHistory(actor, tenantId, {
              branchId: filters.branchId,
              date: filters.date,
              limit: 25,
            })
          : Promise.resolve([]),
      ]);

    let branches = branchesSnap.docs.map((d) => BranchDocSchema.parse(d.data()));
    if (
      !TrustedSystemContext.isTrusted(actor) &&
      !actor.isPlatformAdmin &&
      actor.role !== 'OWNER' &&
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0
    ) {
      const allowed = new Set(actor.assignedBranchIds);
      branches = branches.filter((b) => allowed.has(b.id));
    }

    let providers = providersSnap.docs.map((d) => ProviderDocSchema.parse(d.data()));
    if (filters.branchId) {
      providers = providers.filter((p) => p.assignedBranchIds.includes(filters.branchId!));
    }

    const services = servicesSnap.docs.map((d) => ServiceDocSchema.parse(d.data()));
    const resourcesById = new Map(resourcesList.map((r) => [r.id, r]));
    const servicesById = new Map(services.map((s) => [s.id, s]));

    // Determine currently available providers & resources at current Riyadh 15-min slice
    const { date: todayRiyadh, time: currentSlotTime } = getCurrentRiyadhTimeRounded15(now);
    const lockedProvidersNow = new Set<string>();
    const lockedResourcesNow = new Set<string>();

    if (filters.date === todayRiyadh) {
      const [pLocksSnap, rLocksSnap] = await Promise.all([
        this.firestore
          .collection(firestorePaths.slotLocks(tenantId))
          .where('date', '==', todayRiyadh)
          .where('status', '==', 'LOCKED')
          .get(),
        this.firestore
          .collection(firestorePaths.resourceSlotLocks(tenantId))
          .where('date', '==', todayRiyadh)
          .where('status', '==', 'LOCKED')
          .get(),
      ]);

      for (const d of pLocksSnap.docs) {
        const l = SlotLockDocSchema.parse(d.data());
        if (l.slotTime === currentSlotTime) lockedProvidersNow.add(l.providerId);
      }
      for (const d of rLocksSnap.docs) {
        const l = ResourceSlotLockDocSchema.parse(d.data());
        if (l.slotTime === currentSlotTime) lockedResourcesNow.add(l.resourceId);
      }
    }

    const bookings = bookingsRes.bookings;
    for (const bk of bookings) {
      if (bk.status === 'IN_SERVICE') {
        lockedProvidersNow.add(bk.providerId);
        if (bk.resourceId) lockedResourcesNow.add(bk.resourceId);
      }
    }

    const availableProviderIds = providers
      .filter((p) => !lockedProvidersNow.has(p.id))
      .map((p) => p.id);

    const availableResourceIds = resourcesList
      .filter((r) => r.status === 'ACTIVE' && !lockedResourcesNow.has(r.id))
      .map((r) => r.id);

    const warnings = this.evaluateOperationalWarnings(bookings, resourcesById, servicesById, now);

    return {
      date: filters.date,
      timezone: 'Asia/Riyadh',
      branches,
      providers,
      resources: resourcesList,
      services,
      bookings,
      queueEntries,
      recentCalls,
      availableProviderIds,
      availableResourceIds,
      warnings,
      counts: {
        totalToday: bookings.length,
        confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
        checkedIn: bookings.filter((b) => b.status === 'CHECKED_IN').length,
        inService: bookings.filter((b) => b.status === 'IN_SERVICE').length,
        completed: bookings.filter((b) => b.status === 'COMPLETED').length,
        cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
        noShow: bookings.filter((b) => b.status === 'NO_SHOW').length,
        walkIns: bookings.filter((b) => b.source === 'WALK_IN').length,
        waitingQueue: queueEntries.filter((q) => q.status === 'WAITING').length,
        calledQueue: queueEntries.filter((q) => q.status === 'CALLED').length,
        availableProviders: availableProviderIds.length,
        availableResources: availableResourceIds.length,
      },
    };
  }

  /**
   * Bounded calendar feed for Daily, Weekly, Provider, and Branch views with pagination.
   */
  async getCalendarSchedule(
    actor: OperationsActor,
    tenantId: string,
    filters: {
      startDate: string;
      endDate: string;
      branchId?: string;
      providerId?: string;
      resourceId?: string;
      serviceId?: string;
      status?: BookingStatus;
      limit?: number;
      cursorStartTimeIso?: string;
    },
    now: Date = new Date()
  ): Promise<{
    bookings: BookingDoc[];
    warnings: OperationalWarning[];
    nextCursorStartTimeIso: string | null;
    hasMore: boolean;
    timezone: 'Asia/Riyadh';
  }> {
    this.verifyPermission(actor, 'calendar.read');
    if (filters.branchId) {
      this.verifyBranchAccess(actor, filters.branchId);
    }

    const { startTimeIso, endTimeIso } = riyadhDateRangeUtc(filters.startDate, filters.endDate);

    const [rangeResult, resourcesList, servicesSnap] = await Promise.all([
      this.bookingRepo.listBookingsByDateRange(actor, tenantId, {
        startTimeIso,
        endTimeIso,
        branchId: filters.branchId,
        providerId: filters.providerId,
        resourceId: filters.resourceId,
        serviceId: filters.serviceId,
        status: filters.status,
        limit: filters.limit ?? 100,
        cursorStartTimeIso: filters.cursorStartTimeIso,
      }),
      this.resourceRepo.listResources(actor, tenantId, { branchId: filters.branchId }),
      this.firestore.collection(firestorePaths.services(tenantId)).get(),
    ]);

    const resourcesById = new Map(resourcesList.map((r) => [r.id, r]));
    const servicesById = new Map(
      servicesSnap.docs.map((d) => {
        const s = ServiceDocSchema.parse(d.data());
        return [s.id, s] as const;
      })
    );

    const warnings = this.evaluateOperationalWarnings(
      rangeResult.bookings,
      resourcesById,
      servicesById,
      now
    );

    return {
      bookings: rangeResult.bookings,
      warnings,
      nextCursorStartTimeIso: rangeResult.nextCursorStartTimeIso,
      hasMore: rangeResult.hasMore,
      timezone: 'Asia/Riyadh',
    };
  }
}

