import 'server-only';
import type { Firestore, Transaction, DocumentReference } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  BookingDocSchema,
  CreateBookingInputSchema,
  RescheduleBookingInputSchema,
  CancelBookingInputSchema,
  isValidBookingStatusTransition,
  isTerminalBookingStatus,
  type BookingDoc,
  type CreateBookingInput,
  type RescheduleBookingInput,
  type CancelBookingInput,
  type BookingStatus,
} from '../../booking.schema';
import {
  generateSlotLockIds,
  generateResourceSlotLockIds,
  riyadhTimeToUtcIso,
  utcIsoToRiyadhTime,
} from '../../availability.types';
import { ServiceDocSchema } from '../../service.schema';
import { BranchDocSchema } from '../../branch.schema';
import { ProviderDocSchema } from '../../provider.schema';
import { CustomerDocSchema } from '../../customer.schema';
import { TaxSettingsDocSchema } from '../../company.schema';
import {
  ResourceDocSchema,
  isResourceEligibleForService,
  type ResourceDoc,
} from '../../resource.schema';
import { QueueEntryDocSchema } from '../../queue.schema';
import { calculateServicePricing } from '../../service-pricing';
import { hasPermission } from '../../permissions';
import { TrustedSystemContext } from './trusted-context';

export enum BookingErrorCode {
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BRANCH_FORBIDDEN = 'BRANCH_FORBIDDEN',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  SERVICE_NOT_FOUND = 'SERVICE_NOT_FOUND',
  SERVICE_INACTIVE = 'SERVICE_INACTIVE',
  BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND',
  BRANCH_INACTIVE = 'BRANCH_INACTIVE',
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  PROVIDER_INACTIVE = 'PROVIDER_INACTIVE',
  CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  PROVIDER_SERVICE_MISMATCH = 'PROVIDER_SERVICE_MISMATCH',
  PROVIDER_BRANCH_MISMATCH = 'PROVIDER_BRANCH_MISMATCH',
  RESOURCE_REQUIRED = 'RESOURCE_REQUIRED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_INACTIVE = 'RESOURCE_INACTIVE',
  RESOURCE_INELIGIBLE = 'RESOURCE_INELIGIBLE',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  TERMINAL_STATE = 'TERMINAL_STATE',
  INVALID_TRANSITION = 'INVALID_TRANSITION',
  BOOKING_CONFLICT = 'BOOKING_CONFLICT',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
}

export class BookingError extends Error {
  constructor(
    public readonly code: BookingErrorCode,
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

export type BookingActor =
  | TrustedSystemContext
  | {
      uid: string;
      role: 'OWNER' | 'MANAGER' | 'STAFF';
      customPermissions?: readonly string[] | null;
      assignedBranchIds?: readonly string[] | null;
      isPlatformAdmin?: boolean;
    }
  | {
      uid: string;
      isCustomer: true;
    };

export interface BookingListFilters {
  date?: string; // YYYY-MM-DD
  branchId?: string;
  providerId?: string;
  resourceId?: string;
  serviceId?: string;
  customerId?: string;
  status?: BookingStatus;
  limit?: number;
}

export interface BookingDateRangeFilters {
  startTimeIso: string;
  endTimeIso: string;
  branchId?: string;
  providerId?: string;
  resourceId?: string;
  serviceId?: string;
  status?: BookingStatus;
  limit?: number;
  cursorStartTimeIso?: string;
}

export class BookingRepository {
  constructor(private readonly firestore: Firestore = getFirebaseAdminFirestore()) {}

  private verifyPermission(
    actor: BookingActor,
    capability: Parameters<typeof hasPermission>[1]
  ): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if ('isPlatformAdmin' in actor && actor.isPlatformAdmin) return;
    if ('isCustomer' in actor && actor.isCustomer) {
      if (capability === 'bookings.create' || capability === 'bookings.read') {
        return;
      }
      throw new BookingError(BookingErrorCode.FORBIDDEN, 'عملية غير مصرح بها لحساب العميل.');
    }
    if ('role' in actor) {
      if (!hasPermission(actor.role, capability, actor.customPermissions)) {
        throw new BookingError(
          BookingErrorCode.FORBIDDEN,
          `غير مصرح: لا تملك الصلاحية المطلوبة (${capability}) لإجراء هذه العملية.`
        );
      }
    }
  }

  private verifyBranchAccess(actor: BookingActor, branchId: string): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if ('isPlatformAdmin' in actor && actor.isPlatformAdmin) return;
    if ('isCustomer' in actor && actor.isCustomer) return;
    if ('role' in actor) {
      if (actor.role === 'OWNER') return;
      if (actor.assignedBranchIds && actor.assignedBranchIds.length > 0) {
        if (!actor.assignedBranchIds.includes(branchId)) {
          throw new BookingError(
            BookingErrorCode.BRANCH_FORBIDDEN,
            'غير مصرح: لا تملك صلاحية الوصول إلى حجوزات هذا الفرع.'
          );
        }
      }
    }
  }

  private sanitizeBookingForActor(actor: BookingActor, booking: BookingDoc): BookingDoc {
    if (TrustedSystemContext.isTrusted(actor) || ('isPlatformAdmin' in actor && actor.isPlatformAdmin)) {
      return booking;
    }
    // Customers never see internal notes
    if ('isCustomer' in actor && actor.isCustomer) {
      return {
        ...booking,
        internalNotes: '',
      };
    }
    if ('role' in actor) {
      const canSeeNotes = hasPermission(actor.role, 'customers.read_notes', actor.customPermissions);
      const canSeeCustomerPhone = hasPermission(actor.role, 'customers.read', actor.customPermissions);
      return {
        ...booking,
        internalNotes: canSeeNotes ? booking.internalNotes : '',
        customerPhone: canSeeCustomerPhone
          ? booking.customerPhone
          : booking.customerPhone
            ? 'مخفي حسب الصلاحية'
            : null,
      };
    }
    return booking;
  }

  /**
   * Generates a readable human reference for bookings: BK-YYYYMMDD-XXXX
   */
  private generateBookingNumber(dateStr: string): string {
    const compactDate = dateStr.replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${compactDate}-${rand}`;
  }

  /**
   * Atomically books an appointment within a Firestore transaction.
   * Guarantees:
   * 1. Deterministic slot lock mutex detection.
   * 2. Recalculation and server-side snapshot of price and VAT.
   * 3. Referential integrity across tenant, branch, service, provider, and customer.
   * 4. Idempotency against network retries.
   * 5. Increments customer stats and writes immutable audit log.
   */
  async createBooking(
    actor: BookingActor,
    rawInput: CreateBookingInput
  ): Promise<BookingDoc> {
    this.verifyPermission(actor, 'bookings.create');

    const parseResult = CreateBookingInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new BookingError(
        BookingErrorCode.INVALID_PAYLOAD,
        `بيانات الحجز غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    const tenantId = input.tenantId;
    this.verifyBranchAccess(actor, input.branchId);

    const actorUid = TrustedSystemContext.isTrusted(actor)
      ? 'SYSTEM'
      : 'uid' in actor
        ? actor.uid
        : 'UNKNOWN';

    // Check Idempotency outside transaction first if present
    const idempDocRef = input.idempotencyKey
      ? this.firestore.doc(firestorePaths.bookingIdempotency(tenantId, input.idempotencyKey))
      : null;

    if (idempDocRef) {
      const idempSnap = await idempDocRef.get();
      if (idempSnap.exists) {
        const existingBookingId = idempSnap.data()?.bookingId;
        if (existingBookingId) {
          const existingBooking = await this.getBookingById(actor, tenantId, existingBookingId);
          if (existingBooking) return existingBooking;
        }
      }
    }

    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const bookingRef = this.firestore.doc(firestorePaths.booking(tenantId, bookingId));
    const nowIso = new Date().toISOString();

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      // -----------------------------------------------------------------
      // PHASE 1: READS
      // -----------------------------------------------------------------
      if (idempDocRef) {
        const idempTxSnap = await transaction.get(idempDocRef);
        if (idempTxSnap.exists) {
          const existingBookingId = idempTxSnap.data()?.bookingId;
          if (existingBookingId) {
            const existingSnap = await transaction.get(
              this.firestore.doc(firestorePaths.booking(tenantId, existingBookingId))
            );
            if (existingSnap.exists) {
              return this.sanitizeBookingForActor(actor, BookingDocSchema.parse(existingSnap.data()));
            }
          }
        }
      }

      // 1. Read Provider Schedule Mutex Lock
      const scheduleLockRef = this.firestore.doc(
        firestorePaths.scheduleLock(tenantId, input.providerId)
      );
      const scheduleLockSnap = await transaction.get(scheduleLockRef);
      const currentScheduleVersion = scheduleLockSnap.exists
        ? (scheduleLockSnap.data()?.version || 0)
        : 0;

      // 1b. Read Resource & Resource Schedule Mutex Lock if resourceId is provided
      const targetResourceId = input.resourceId || null;
      const resourceRef = targetResourceId
        ? this.firestore.doc(firestorePaths.resource(tenantId, targetResourceId))
        : null;
      const resourceScheduleLockRef = targetResourceId
        ? this.firestore.doc(firestorePaths.resourceScheduleLock(tenantId, targetResourceId))
        : null;

      const resourceSnap = resourceRef ? await transaction.get(resourceRef) : null;
      const resourceScheduleLockSnap = resourceScheduleLockRef
        ? await transaction.get(resourceScheduleLockRef)
        : null;
      const currentResourceVersion = resourceScheduleLockSnap?.exists
        ? (resourceScheduleLockSnap.data()?.version || 0)
        : 0;

      // 2. Read Service
      const serviceRef = this.firestore.doc(firestorePaths.service(tenantId, input.serviceId));
      const serviceSnap = await transaction.get(serviceRef);
      if (!serviceSnap.exists) {
        throw new BookingError(BookingErrorCode.SERVICE_NOT_FOUND, 'الخدمة المطلوبة غير موجودة.');
      }
      const service = ServiceDocSchema.parse(serviceSnap.data());
      if (!service.isActive) {
        throw new BookingError(BookingErrorCode.SERVICE_INACTIVE, 'الخدمة المطلوبة غير نشطة.');
      }

      // 3. Read Branch
      const branchRef = this.firestore.doc(firestorePaths.branch(tenantId, input.branchId));
      const branchSnap = await transaction.get(branchRef);
      if (!branchSnap.exists) {
        throw new BookingError(BookingErrorCode.BRANCH_NOT_FOUND, 'الفرع المطلوب غير موجود.');
      }
      const branch = BranchDocSchema.parse(branchSnap.data());
      if (!branch.isActive) {
        throw new BookingError(BookingErrorCode.BRANCH_INACTIVE, 'الفرع المطلوب غير نشط.');
      }

      // 4. Read Provider
      const providerRef = this.firestore.doc(firestorePaths.provider(tenantId, input.providerId));
      const providerSnap = await transaction.get(providerRef);
      if (!providerSnap.exists) {
        throw new BookingError(BookingErrorCode.PROVIDER_NOT_FOUND, 'مقدم الخدمة المطلوب غير موجود.');
      }
      const provider = ProviderDocSchema.parse(providerSnap.data());
      if (provider.status !== 'ACTIVE') {
        throw new BookingError(BookingErrorCode.PROVIDER_INACTIVE, 'مقدم الخدمة المطلوب غير متاح حالياً.');
      }

      // 5. Read Customer
      const customerRef = this.firestore.doc(firestorePaths.tenantCustomer(tenantId, input.customerId));
      const customerSnap = await transaction.get(customerRef);
      if (!customerSnap.exists) {
        throw new BookingError(BookingErrorCode.CUSTOMER_NOT_FOUND, 'العميل المطلوب غير موجود.');
      }
      const customer = CustomerDocSchema.parse(customerSnap.data());

      // 6. Read Tax Settings for Authoritative Pricing Snapshot
      const taxSettingsRef = this.firestore.doc(firestorePaths.taxSettings(tenantId));
      const taxSettingsSnap = await transaction.get(taxSettingsRef);
      const taxSettings = taxSettingsSnap.exists
        ? TaxSettingsDocSchema.parse(taxSettingsSnap.data())
        : null;

      // -----------------------------------------------------------------
      // PHASE 2: VALIDATIONS & CONFLICT DETECTION
      // -----------------------------------------------------------------
      if (!service.assignedBranchIds.includes(input.branchId)) {
        throw new BookingError(
          BookingErrorCode.PROVIDER_BRANCH_MISMATCH,
          'الخدمة المطلوبة غير متاحة في هذا الفرع.'
        );
      }

      if (!provider.assignedBranchIds.includes(input.branchId)) {
        throw new BookingError(
          BookingErrorCode.PROVIDER_BRANCH_MISMATCH,
          'مقدم الخدمة غير معين في هذا الفرع.'
        );
      }

      const isProviderAssigned =
        provider.assignedServiceIds.includes(input.serviceId) ||
        service.assignedProviderIds.includes(provider.id);
      if (!isProviderAssigned) {
        throw new BookingError(
          BookingErrorCode.PROVIDER_SERVICE_MISMATCH,
          'مقدم الخدمة غير مؤهل لتقديم هذه الخدمة.'
        );
      }

      // Resource requirements & validation
      if (service.resourceRequirement === 'REQUIRED' && !targetResourceId) {
        throw new BookingError(
          BookingErrorCode.RESOURCE_REQUIRED,
          'هذه الخدمة تتطلب تحديد كرسي أو غرفة صالون صالحة قبل إتمام الحجز.'
        );
      }
      if (service.resourceRequirement === 'NONE' && targetResourceId) {
        throw new BookingError(
          BookingErrorCode.RESOURCE_INELIGIBLE,
          'هذه الخدمة مضبوطة بدون استخدام موارد أو كراسي.'
        );
      }

      let resource: ResourceDoc | null = null;
      if (targetResourceId) {
        if (!resourceSnap || !resourceSnap.exists) {
          throw new BookingError(BookingErrorCode.RESOURCE_NOT_FOUND, 'المورد أو الكرسي المطلوب غير موجود.');
        }
        resource = ResourceDocSchema.parse(resourceSnap.data());
        if (resource.branchId !== input.branchId) {
          throw new BookingError(
            BookingErrorCode.RESOURCE_INELIGIBLE,
            'المورد المختار لا يتبع للفرع المحدد في الحجز.'
          );
        }
        if (resource.status !== 'ACTIVE') {
          throw new BookingError(
            BookingErrorCode.RESOURCE_INACTIVE,
            resource.status === 'MAINTENANCE'
              ? 'المورد المختار قيد الصيانة ولا يمكن حجزه.'
              : 'المورد المختار غير نشط ولا يمكن حجزه.'
          );
        }
        const eligibility = isResourceEligibleForService(resource, service);
        if (!eligibility.eligible) {
          throw new BookingError(
            BookingErrorCode.RESOURCE_INELIGIBLE,
            eligibility.reason || 'المورد المختار غير مؤهل لتنفيذ هذه الخدمة.'
          );
        }
      }

      // Calculate time windows
      const startTimeDate = new Date(input.scheduledStartTime);
      const startTimeIso = startTimeDate.toISOString();
      const endTimeDate = new Date(startTimeDate.getTime() + service.durationMinutes * 60 * 1000);
      const endTimeIso = endTimeDate.toISOString();

      // Buffer time window for provider & resource locking
      const blockStartDate = new Date(
        startTimeDate.getTime() - service.bufferBeforeMinutes * 60 * 1000
      );
      const blockEndDate = new Date(
        endTimeDate.getTime() + service.bufferAfterMinutes * 60 * 1000
      );

      const { lockIds, slotLocks } = generateSlotLockIds(
        input.providerId,
        blockStartDate.toISOString(),
        blockEndDate.toISOString()
      );

      const resourceLockData = resource
        ? generateResourceSlotLockIds(
            resource.id,
            blockStartDate.toISOString(),
            blockEndDate.toISOString()
          )
        : { lockIds: [] as string[], slotLocks: [] };

      // Read all provider slot locks AND resource slot locks inside transaction before ANY write
      const lockRefs = lockIds.map((lid) =>
        this.firestore.doc(firestorePaths.slotLock(tenantId, lid))
      );
      const resourceLockRefs = resourceLockData.lockIds.map((lid) =>
        this.firestore.doc(firestorePaths.resourceSlotLock(tenantId, lid))
      );

      const [lockSnaps, resourceLockSnaps] = await Promise.all([
        Promise.all(lockRefs.map((r) => transaction.get(r))),
        Promise.all(resourceLockRefs.map((r) => transaction.get(r))),
      ]);

      // Verify no provider conflict exists
      for (let i = 0; i < lockSnaps.length; i++) {
        const snap = lockSnaps[i];
        if (snap?.exists && snap.data()?.status === 'LOCKED') {
          throw new BookingError(
            BookingErrorCode.BOOKING_CONFLICT,
            `تعذر إتمام الحجز: الموعد المطلوب أو جزء منه محجوز مسبقاً لمقدم الخدمة.`
          );
        }
      }

      // Verify no resource conflict exists (prevents partial reservation where provider locks but resource fails)
      for (let i = 0; i < resourceLockSnaps.length; i++) {
        const snap = resourceLockSnaps[i];
        if (snap?.exists && snap.data()?.status === 'LOCKED') {
          throw new BookingError(
            BookingErrorCode.RESOURCE_CONFLICT,
            `تعذر إتمام الحجز: الكرسي أو المورد (${resource?.nameAr}) محجوز مسبقاً في نفس الفترة.`
          );
        }
      }

      // -----------------------------------------------------------------
      // PHASE 3: FINANCIAL RE-CALCULATION & AUTHORITATIVE SNAPSHOT
      // -----------------------------------------------------------------
      const pricingCalc = calculateServicePricing(
        {
          basePriceHalalas: service.basePriceHalalas,
          taxMode: service.taxMode,
          customTaxRateBps: service.taxRateBps,
          transactionDate: nowIso,
        },
        taxSettings
      );

      const priceSnapshot = {
        basePriceHalalas: pricingCalc.basePriceHalalas,
        currency: 'SAR' as const,
        taxMode: pricingCalc.taxMode,
        taxRateBps: pricingCalc.taxRateBps,
        netPriceHalalas: pricingCalc.netPriceHalalas,
        calculatedTaxHalalas: pricingCalc.calculatedTaxHalalas,
        totalPriceHalalas: pricingCalc.totalPriceHalalas,
      };

      const { date: riyadhDate } = utcIsoToRiyadhTime(startTimeIso);
      const bookingNumber = this.generateBookingNumber(riyadhDate);

      const newBooking: BookingDoc = BookingDocSchema.parse({
        id: bookingId,
        bookingNumber,
        tenantId,
        branchId: input.branchId,
        customerId: input.customerId,
        customerName: customer.fullName,
        customerPhone: customer.normalizedPhone ?? null,
        serviceId: input.serviceId,
        providerId: input.providerId,
        providerNameAr: provider.displayNameAr,
        resourceId: resource?.id ?? null,
        resourceNameAr: resource?.nameAr ?? null,
        serviceNameSnapshot: {
          ar: service.nameAr,
          en: service.nameEn || '',
        },
        serviceDurationMinutes: service.durationMinutes,
        bufferBeforeMinutes: service.bufferBeforeMinutes,
        bufferAfterMinutes: service.bufferAfterMinutes,
        totalDurationMinutes:
          service.durationMinutes + service.bufferBeforeMinutes + service.bufferAfterMinutes,
        priceSnapshot,
        scheduledStartTime: startTimeIso,
        scheduledEndTime: endTimeIso,
        timezone: 'Asia/Riyadh',
        status: input.initialStatus || 'CONFIRMED',
        source: input.source || 'DASHBOARD',
        customerNotes: input.customerNotes || '',
        internalNotes: input.internalNotes || '',
        slotLockIds: lockIds,
        resourceSlotLockIds: resourceLockData.lockIds,
        idempotencyKey: input.idempotencyKey || null,
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: actorUid,
        updatedBy: actorUid,
      });

      // -----------------------------------------------------------------
      // PHASE 4: TRANSACTION WRITES
      // -----------------------------------------------------------------
      // 1. Commit Provider Slot Locks
      for (let i = 0; i < slotLocks.length; i++) {
        const item = slotLocks[i]!;
        const lref = lockRefs[i]!;

        transaction.set(lref, {
          id: item.lockId,
          tenantId,
          providerId: input.providerId,
          branchId: input.branchId,
          bookingId,
          date: item.date,
          slotTime: item.time,
          startTimeIso: item.startTimeIso,
          endTimeIso: item.endTimeIso,
          status: 'LOCKED',
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }

      // 1b. Commit Resource Slot Locks & Resource Schedule Mutex (if resource selected)
      if (resource && resourceScheduleLockRef) {
        for (let i = 0; i < resourceLockData.slotLocks.length; i++) {
          const item = resourceLockData.slotLocks[i]!;
          const rlref = resourceLockRefs[i]!;
          transaction.set(rlref, {
            id: item.lockId,
            tenantId,
            resourceId: resource.id,
            branchId: input.branchId,
            bookingId,
            date: item.date,
            slotTime: item.time,
            startTimeIso: item.startTimeIso,
            endTimeIso: item.endTimeIso,
            status: 'LOCKED',
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }

        transaction.set(resourceScheduleLockRef, {
          id: resource.id,
          tenantId,
          resourceId: resource.id,
          branchId: input.branchId,
          version: currentResourceVersion + 1,
          lastMutationType: 'CREATE',
          lastBookingId: bookingId,
          updatedAt: nowIso,
        });
      }

      // 2. Commit Provider Schedule Mutex Version increment
      transaction.set(scheduleLockRef, {
        id: input.providerId,
        tenantId,
        staffId: input.providerId,
        version: currentScheduleVersion + 1,
        lastMutationType: 'CREATE',
        lastAppointmentId: bookingId,
        updatedAt: nowIso,
      });

      // 3. Commit Booking
      transaction.set(bookingRef, newBooking);

      // 4. Commit Idempotency record if provided
      if (idempDocRef && input.idempotencyKey) {
        transaction.set(idempDocRef, {
          bookingId,
          tenantId,
          idempotencyKey: input.idempotencyKey,
          createdAt: nowIso,
        });
      }

      // 5. Update Customer Statistics
      const stats = customer.bookingStatistics || {
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        noShowBookings: 0,
        totalSpentHalalas: 0,
        lastBookingAt: null,
      };
      transaction.update(customerRef, {
        bookingStatistics: {
          ...stats,
          totalBookings: stats.totalBookings + 1,
          lastBookingAt: startTimeIso,
        },
        updatedAt: nowIso,
        updatedBy: actorUid,
      });

      // 6. Commit Audit Record
      const auditId = `audit_bk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.bookingAuditRecord(tenantId, auditId));
      transaction.set(auditRef, {
        id: auditId,
        tenantId,
        actorUid,
        entityType: 'BOOKING',
        entityId: bookingId,
        action: newBooking.source === 'WALK_IN' ? 'WALK_IN_CREATED' : 'BOOKING_CREATED',
        afterValues: {
          bookingNumber,
          scheduledStartTime: startTimeIso,
          scheduledEndTime: endTimeIso,
          providerId: input.providerId,
          resourceId: resource?.id ?? null,
          source: newBooking.source,
          priceHalalas: priceSnapshot.totalPriceHalalas,
        },
        idempotencyKey: input.idempotencyKey || undefined,
        timestamp: nowIso,
      });

      if (resource) {
        const resAuditId = `audit_op_res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        transaction.set(
          this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, resAuditId)),
          {
            id: resAuditId,
            tenantId,
            branchId: input.branchId,
            actorUid,
            entityType: 'BOOKING',
            entityId: bookingId,
            action: 'RESOURCE_ASSIGNED',
            afterValues: {
              resourceId: resource.id,
              resourceNameAr: resource.nameAr,
              scheduledStartTime: startTimeIso,
              scheduledEndTime: endTimeIso,
            },
            idempotencyKey: input.idempotencyKey || null,
            timestamp: nowIso,
          }
        );
      }

      return this.sanitizeBookingForActor(actor, newBooking);
    });
  }

  /**
   * Atomically reschedules a booking within a Firestore transaction.
   * Secures new provider & resource slot locks BEFORE releasing old locks.
   * If any lock or validation fails, original reservations remain completely untouched.
   */
  async rescheduleBooking(
    actor: BookingActor,
    rawInput: RescheduleBookingInput
  ): Promise<BookingDoc> {
    this.verifyPermission(actor, 'bookings.reschedule');

    const parseResult = RescheduleBookingInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new BookingError(
        BookingErrorCode.INVALID_PAYLOAD,
        `بيانات إعادة جدولة الموعد غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    const tenantId = input.tenantId;
    const bookingId = input.bookingId;

    const actorUid = TrustedSystemContext.isTrusted(actor)
      ? 'SYSTEM'
      : 'uid' in actor
        ? actor.uid
        : 'UNKNOWN';

    const bookingRef = this.firestore.doc(firestorePaths.booking(tenantId, bookingId));
    const queueEntryRef = this.firestore.doc(firestorePaths.queueEntry(tenantId, bookingId));
    const nowIso = new Date().toISOString();

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      // 1. Read Current Booking
      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists) {
        throw new BookingError(BookingErrorCode.BOOKING_NOT_FOUND, 'الحجز غير موجود.');
      }
      const booking = BookingDocSchema.parse(bookingSnap.data());
      this.verifyBranchAccess(actor, booking.branchId);

      if (isTerminalBookingStatus(booking.status)) {
        throw new BookingError(
          BookingErrorCode.TERMINAL_STATE,
          `لا يمكن إعادة جدولة حجز في حالته الحالية (${booking.status}).`
        );
      }

      const targetProviderId = input.newProviderId || booking.providerId;
      const targetBranchId = input.newBranchId || booking.branchId;
      this.verifyBranchAccess(actor, targetBranchId);

      // Determine target resource:
      // - undefined -> keep booking.resourceId (unless branch changed without explicit newResourceId)
      // - null -> explicitly clear resource
      // - string -> reserve specified resource
      const targetResourceId =
        input.newResourceId !== undefined
          ? input.newResourceId
          : targetBranchId === booking.branchId
            ? booking.resourceId ?? null
            : null;

      // 2. Read Schedule Mutexes in Sorted Order (Prevent Deadlocks)
      const providerIds = Array.from(new Set([booking.providerId, targetProviderId])).sort();
      const schedRefs = providerIds.map((pid) =>
        this.firestore.doc(firestorePaths.scheduleLock(tenantId, pid))
      );

      const resourceIdsForLocks = Array.from(
        new Set(
          [booking.resourceId, targetResourceId].filter(
            (id): id is string => typeof id === 'string' && id.length > 0
          )
        )
      ).sort();
      const resSchedRefs = resourceIdsForLocks.map((rid) =>
        this.firestore.doc(firestorePaths.resourceScheduleLock(tenantId, rid))
      );

      const serviceRef = this.firestore.doc(firestorePaths.service(tenantId, booking.serviceId));
      const targetProviderRef =
        targetProviderId !== booking.providerId
          ? this.firestore.doc(firestorePaths.provider(tenantId, targetProviderId))
          : null;
      const targetResourceRef = targetResourceId
        ? this.firestore.doc(firestorePaths.resource(tenantId, targetResourceId))
        : null;

      const [
        schedSnaps,
        resSchedSnaps,
        serviceSnap,
        targetProviderSnap,
        targetResourceSnap,
        queueEntrySnap,
      ] = await Promise.all([
        Promise.all(schedRefs.map((r) => transaction.get(r))),
        Promise.all(resSchedRefs.map((r) => transaction.get(r))),
        transaction.get(serviceRef),
        targetProviderRef ? transaction.get(targetProviderRef) : Promise.resolve(null),
        targetResourceRef ? transaction.get(targetResourceRef) : Promise.resolve(null),
        transaction.get(queueEntryRef),
      ]);

      if (!serviceSnap.exists) {
        throw new BookingError(BookingErrorCode.SERVICE_NOT_FOUND, 'الخدمة غير موجودة.');
      }
      const service = ServiceDocSchema.parse(serviceSnap.data());

      let targetProviderNameAr = booking.providerNameAr;
      if (targetProviderSnap) {
        if (!targetProviderSnap.exists) {
          throw new BookingError(BookingErrorCode.PROVIDER_NOT_FOUND, 'مقدم الخدمة الجديد غير موجود.');
        }
        const targetProvider = ProviderDocSchema.parse(targetProviderSnap.data());
        if (targetProvider.status !== 'ACTIVE') {
          throw new BookingError(BookingErrorCode.PROVIDER_INACTIVE, 'مقدم الخدمة الجديد غير متاح.');
        }
        if (!targetProvider.assignedBranchIds.includes(targetBranchId)) {
          throw new BookingError(
            BookingErrorCode.PROVIDER_BRANCH_MISMATCH,
            'مقدم الخدمة الجديد غير معين في الفرع المحدد.'
          );
        }
        targetProviderNameAr = targetProvider.displayNameAr;
      }

      if (service.resourceRequirement === 'REQUIRED' && !targetResourceId) {
        throw new BookingError(
          BookingErrorCode.RESOURCE_REQUIRED,
          'هذه الخدمة تتطلب تخصيص كرسي أو غرفة صالون صالحة.'
        );
      }

      let targetResource: ResourceDoc | null = null;
      if (targetResourceId) {
        if (!targetResourceSnap || !targetResourceSnap.exists) {
          throw new BookingError(BookingErrorCode.RESOURCE_NOT_FOUND, 'المورد المطلوب غير موجود.');
        }
        targetResource = ResourceDocSchema.parse(targetResourceSnap.data());
        if (targetResource.branchId !== targetBranchId) {
          throw new BookingError(
            BookingErrorCode.RESOURCE_INELIGIBLE,
            'المورد المختار لا ينتمي للفرع المحدد.'
          );
        }
        if (targetResource.status !== 'ACTIVE') {
          throw new BookingError(
            BookingErrorCode.RESOURCE_INACTIVE,
            targetResource.status === 'MAINTENANCE'
              ? 'المورد المختار قيد الصيانة ولا يمكن حجزه.'
              : 'المورد المختار غير نشط ولا يمكن حجزه.'
          );
        }
        const eligibility = isResourceEligibleForService(targetResource, service);
        if (!eligibility.eligible) {
          throw new BookingError(
            BookingErrorCode.RESOURCE_INELIGIBLE,
            eligibility.reason || 'المورد المختار غير مؤهل لهذه الخدمة.'
          );
        }
      }

      // 4. Calculate new time windows
      const newStartDate = new Date(input.newScheduledStartTime);
      const newStartTimeIso = newStartDate.toISOString();
      const newEndDate = new Date(newStartDate.getTime() + service.durationMinutes * 60 * 1000);
      const newEndTimeIso = newEndDate.toISOString();

      const newBlockStart = new Date(
        newStartDate.getTime() - service.bufferBeforeMinutes * 60 * 1000
      );
      const newBlockEnd = new Date(
        newEndDate.getTime() + service.bufferAfterMinutes * 60 * 1000
      );

      const { lockIds: newLockIds, slotLocks: newSlotLocks } = generateSlotLockIds(
        targetProviderId,
        newBlockStart.toISOString(),
        newBlockEnd.toISOString()
      );

      const newResourceLockData = targetResource
        ? generateResourceSlotLockIds(
            targetResource.id,
            newBlockStart.toISOString(),
            newBlockEnd.toISOString()
          )
        : { lockIds: [] as string[], slotLocks: [] };

      // 5. Read New Provider Slot Locks & Resource Slot Locks BEFORE releasing anything
      const newLockRefs = newLockIds.map((lid) =>
        this.firestore.doc(firestorePaths.slotLock(tenantId, lid))
      );
      const newResLockRefs = newResourceLockData.lockIds.map((lid) =>
        this.firestore.doc(firestorePaths.resourceSlotLock(tenantId, lid))
      );

      const [newLockSnaps, newResLockSnaps] = await Promise.all([
        Promise.all(newLockRefs.map((r) => transaction.get(r))),
        Promise.all(newResLockRefs.map((r) => transaction.get(r))),
      ]);

      for (let i = 0; i < newLockSnaps.length; i++) {
        const snap = newLockSnaps[i];
        if (snap?.exists && snap.data()?.status === 'LOCKED') {
          if (snap.data()?.bookingId !== bookingId) {
            throw new BookingError(
              BookingErrorCode.BOOKING_CONFLICT,
              'تعذر إعادة الجدولة: الوقت الجديد المختار لمقدم الخدمة محجوز مسبقاً.'
            );
          }
        }
      }

      for (let i = 0; i < newResLockSnaps.length; i++) {
        const snap = newResLockSnaps[i];
        if (snap?.exists && snap.data()?.status === 'LOCKED') {
          if (snap.data()?.bookingId !== bookingId) {
            throw new BookingError(
              BookingErrorCode.RESOURCE_CONFLICT,
              `تعذر إعادة الجدولة: الكرسي أو المورد (${targetResource?.nameAr}) محجوز مسبقاً في الوقت الجديد.`
            );
          }
        }
      }

      // 6. Release Old Provider & Resource Slot Locks not kept by new reservation
      for (const oldLockId of booking.slotLockIds) {
        if (!newLockIds.includes(oldLockId)) {
          const oldRef = this.firestore.doc(firestorePaths.slotLock(tenantId, oldLockId));
          transaction.set(oldRef, { status: 'RELEASED', updatedAt: nowIso }, { merge: true });
        }
      }

      for (const oldResLockId of booking.resourceSlotLockIds || []) {
        if (!newResourceLockData.lockIds.includes(oldResLockId)) {
          const oldResRef = this.firestore.doc(
            firestorePaths.resourceSlotLock(tenantId, oldResLockId)
          );
          transaction.set(oldResRef, { status: 'RELEASED', updatedAt: nowIso }, { merge: true });
        }
      }

      // 7. Write New Provider Slot Locks & Resource Slot Locks
      for (let i = 0; i < newSlotLocks.length; i++) {
        const item = newSlotLocks[i]!;
        const lref = newLockRefs[i]!;

        transaction.set(lref, {
          id: item.lockId,
          tenantId,
          providerId: targetProviderId,
          branchId: targetBranchId,
          bookingId,
          date: item.date,
          slotTime: item.time,
          startTimeIso: item.startTimeIso,
          endTimeIso: item.endTimeIso,
          status: 'LOCKED',
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }

      if (targetResource) {
        for (let i = 0; i < newResourceLockData.slotLocks.length; i++) {
          const item = newResourceLockData.slotLocks[i]!;
          const rlref = newResLockRefs[i]!;
          transaction.set(rlref, {
            id: item.lockId,
            tenantId,
            resourceId: targetResource.id,
            branchId: targetBranchId,
            bookingId,
            date: item.date,
            slotTime: item.time,
            startTimeIso: item.startTimeIso,
            endTimeIso: item.endTimeIso,
            status: 'LOCKED',
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }
      }

      // 8. Update Provider & Resource Schedule Mutexes
      for (let i = 0; i < providerIds.length; i++) {
        const pid = providerIds[i]!;
        const sref = schedRefs[i]!;
        const ssnap = schedSnaps[i];
        const ver = ssnap?.exists ? ssnap.data()?.version || 0 : 0;
        transaction.set(sref, {
          id: pid,
          tenantId,
          staffId: pid,
          version: ver + 1,
          lastMutationType: 'RESCHEDULE',
          lastAppointmentId: bookingId,
          updatedAt: nowIso,
        });
      }

      for (let i = 0; i < resourceIdsForLocks.length; i++) {
        const rid = resourceIdsForLocks[i]!;
        const rsref = resSchedRefs[i]!;
        const rssnap = resSchedSnaps[i];
        const ver = rssnap?.exists ? rssnap.data()?.version || 0 : 0;
        transaction.set(rsref, {
          id: rid,
          tenantId,
          resourceId: rid,
          branchId: targetBranchId,
          version: ver + 1,
          lastMutationType: 'RESCHEDULE',
          lastBookingId: bookingId,
          updatedAt: nowIso,
        });
      }

      // 9. Update Booking Document
      const updatedBooking: BookingDoc = {
        ...booking,
        branchId: targetBranchId,
        providerId: targetProviderId,
        providerNameAr: targetProviderNameAr,
        resourceId: targetResource?.id ?? null,
        resourceNameAr: targetResource?.nameAr ?? null,
        scheduledStartTime: newStartTimeIso,
        scheduledEndTime: newEndTimeIso,
        slotLockIds: newLockIds,
        resourceSlotLockIds: newResourceLockData.lockIds,
        internalNotes: input.internalNotes !== undefined ? input.internalNotes : booking.internalNotes,
        rescheduling: {
          previousStartTime: booking.scheduledStartTime,
          previousEndTime: booking.scheduledEndTime,
          rescheduledAt: nowIso,
          rescheduledBy: actorUid,
          reason: input.reason || '',
        },
        updatedAt: nowIso,
        updatedBy: actorUid,
      };

      transaction.set(bookingRef, updatedBooking);

      // 9b. Sync Queue Entry projection if it exists
      if (queueEntrySnap.exists) {
        const { date: newRiyadhDate } = utcIsoToRiyadhTime(newStartTimeIso);
        transaction.update(queueEntryRef, {
          branchId: targetBranchId,
          date: newRiyadhDate,
          providerId: targetProviderId,
          providerNameAr: targetProviderNameAr,
          resourceId: targetResource?.id ?? null,
          resourceNameAr: targetResource?.nameAr ?? null,
          scheduledStartTime: newStartTimeIso,
          updatedAt: nowIso,
          updatedBy: actorUid,
        });
      }

      // 10. Audit Record
      const auditId = `audit_bk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.bookingAuditRecord(tenantId, auditId));
      transaction.set(auditRef, {
        id: auditId,
        tenantId,
        actorUid,
        entityType: 'BOOKING',
        entityId: bookingId,
        action: 'BOOKING_RESCHEDULED',
        beforeValues: {
          scheduledStartTime: booking.scheduledStartTime,
          scheduledEndTime: booking.scheduledEndTime,
          providerId: booking.providerId,
          resourceId: booking.resourceId ?? null,
        },
        afterValues: {
          scheduledStartTime: newStartTimeIso,
          scheduledEndTime: newEndTimeIso,
          providerId: targetProviderId,
          resourceId: targetResource?.id ?? null,
        },
        timestamp: nowIso,
      });

      return this.sanitizeBookingForActor(actor, updatedBooking);
    });
  }

  /**
   * Atomically cancels a booking and releases all its reserved provider & resource schedule locks.
   * Also syncs queue projection if a queue entry exists for this booking.
   */
  async cancelBooking(
    actor: BookingActor,
    rawInput: CancelBookingInput
  ): Promise<BookingDoc> {
    this.verifyPermission(actor, 'bookings.cancel');

    const parseResult = CancelBookingInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new BookingError(
        BookingErrorCode.INVALID_PAYLOAD,
        `بيانات إلغاء الحجز غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    const tenantId = input.tenantId;
    const bookingId = input.bookingId;

    const actorUid = TrustedSystemContext.isTrusted(actor)
      ? 'SYSTEM'
      : 'uid' in actor
        ? actor.uid
        : 'UNKNOWN';

    const bookingRef = this.firestore.doc(firestorePaths.booking(tenantId, bookingId));
    const queueEntryRef = this.firestore.doc(firestorePaths.queueEntry(tenantId, bookingId));
    const nowIso = new Date().toISOString();

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const snap = await transaction.get(bookingRef);
      if (!snap.exists) {
        throw new BookingError(BookingErrorCode.BOOKING_NOT_FOUND, 'الحجز غير موجود.');
      }
      const booking = BookingDocSchema.parse(snap.data());
      this.verifyBranchAccess(actor, booking.branchId);

      if (booking.status === 'CANCELLED') {
        return this.sanitizeBookingForActor(actor, booking); // Idempotent cancellation
      }

      if (isTerminalBookingStatus(booking.status)) {
        throw new BookingError(
          BookingErrorCode.TERMINAL_STATE,
          `لا يمكن إلغاء الحجز في حالته الحالية (${booking.status}).`
        );
      }

      // Phase 1 Reads before any writes
      const scheduleLockRef = this.firestore.doc(
        firestorePaths.scheduleLock(tenantId, booking.providerId)
      );
      const resourceScheduleLockRef = booking.resourceId
        ? this.firestore.doc(firestorePaths.resourceScheduleLock(tenantId, booking.resourceId))
        : null;
      const customerRef = this.firestore.doc(firestorePaths.tenantCustomer(tenantId, booking.customerId));

      const [schedSnap, resSchedSnap, customerSnap, queueEntrySnap] = await Promise.all([
        transaction.get(scheduleLockRef),
        resourceScheduleLockRef ? transaction.get(resourceScheduleLockRef) : Promise.resolve(null),
        transaction.get(customerRef),
        transaction.get(queueEntryRef),
      ]);

      // Phase 2 Writes
      // 1. Release all provider & resource slot locks
      for (const lockId of booking.slotLockIds) {
        const lockRef = this.firestore.doc(firestorePaths.slotLock(tenantId, lockId));
        transaction.set(lockRef, { status: 'RELEASED', updatedAt: nowIso }, { merge: true });
      }
      for (const resLockId of booking.resourceSlotLockIds || []) {
        const resLockRef = this.firestore.doc(firestorePaths.resourceSlotLock(tenantId, resLockId));
        transaction.set(resLockRef, { status: 'RELEASED', updatedAt: nowIso }, { merge: true });
      }

      // 2. Update Provider & Resource Schedule Mutexes
      const ver = schedSnap.exists ? schedSnap.data()?.version || 0 : 0;
      transaction.set(scheduleLockRef, {
        id: booking.providerId,
        tenantId,
        staffId: booking.providerId,
        version: ver + 1,
        lastMutationType: 'CANCEL',
        lastAppointmentId: bookingId,
        updatedAt: nowIso,
      });

      if (booking.resourceId && resourceScheduleLockRef) {
        const resVer = resSchedSnap?.exists ? resSchedSnap.data()?.version || 0 : 0;
        transaction.set(resourceScheduleLockRef, {
          id: booking.resourceId,
          tenantId,
          resourceId: booking.resourceId,
          branchId: booking.branchId,
          version: resVer + 1,
          lastMutationType: 'CANCEL',
          lastBookingId: bookingId,
          updatedAt: nowIso,
        });
      }

      // 3. Update Customer Statistics
      if (customerSnap.exists) {
        const stats = customerSnap.data()?.bookingStatistics;
        if (stats) {
          transaction.update(customerRef, {
            'bookingStatistics.cancelledBookings': (stats.cancelledBookings || 0) + 1,
            updatedAt: nowIso,
            updatedBy: actorUid,
          });
        }
      }

      // 4. Update Booking Document
      const cancelledBooking: BookingDoc = {
        ...booking,
        status: 'CANCELLED',
        cancellation: {
          reason: input.reason || '',
          cancelledAt: nowIso,
          cancelledBy: actorUid,
        },
        updatedAt: nowIso,
        updatedBy: actorUid,
      };
      transaction.set(bookingRef, cancelledBooking);

      // 4b. Sync Queue Entry if present
      if (queueEntrySnap.exists) {
        transaction.update(queueEntryRef, {
          status: 'REMOVED',
          removedAt: nowIso,
          removedReason: input.reason || 'تم إلغاء الحجز',
          updatedAt: nowIso,
          updatedBy: actorUid,
        });
      }

      // 5. Audit Records
      const auditId = `audit_bk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.bookingAuditRecord(tenantId, auditId));
      transaction.set(auditRef, {
        id: auditId,
        tenantId,
        actorUid,
        entityType: 'BOOKING',
        entityId: bookingId,
        action: 'BOOKING_CANCELLED',
        beforeValues: { status: booking.status },
        afterValues: { status: 'CANCELLED', reason: input.reason || '' },
        timestamp: nowIso,
      });

      if (booking.resourceId) {
        const relAuditId = `audit_op_rel_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        transaction.set(
          this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, relAuditId)),
          {
            id: relAuditId,
            tenantId,
            branchId: booking.branchId,
            actorUid,
            entityType: 'BOOKING',
            entityId: bookingId,
            action: 'RESOURCE_RELEASED',
            beforeValues: { resourceId: booking.resourceId, resourceNameAr: booking.resourceNameAr ?? null },
            afterValues: { reason: 'BOOKING_CANCELLED' },
            timestamp: nowIso,
          }
        );
      }

      return this.sanitizeBookingForActor(actor, cancelledBooking);
    });
  }

  /**
   * Updates booking lifecycle state (CONFIRMED, CHECKED_IN, IN_SERVICE, COMPLETED, NO_SHOW).
   * Releases provider + resource locks on terminal outcomes and keeps queue projections synchronized.
   */
  async transitionBookingStatus(
    actor: BookingActor,
    tenantId: string,
    bookingId: string,
    targetStatus: BookingStatus
  ): Promise<BookingDoc> {
    const capability =
      targetStatus === 'CONFIRMED'
        ? 'bookings.confirm'
        : targetStatus === 'CHECKED_IN'
          ? 'bookings.check_in'
          : targetStatus === 'IN_SERVICE'
            ? 'bookings.start_service'
            : targetStatus === 'COMPLETED'
              ? 'bookings.complete_service'
              : targetStatus === 'NO_SHOW'
                ? 'bookings.mark_no_show'
                : 'bookings.manage_status';

    this.verifyPermission(actor, capability);

    const actorUid = TrustedSystemContext.isTrusted(actor)
      ? 'SYSTEM'
      : 'uid' in actor
        ? actor.uid
        : 'UNKNOWN';

    const bookingRef = this.firestore.doc(firestorePaths.booking(tenantId, bookingId));
    const queueEntryRef = this.firestore.doc(firestorePaths.queueEntry(tenantId, bookingId));
    const nowIso = new Date().toISOString();

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const snap = await transaction.get(bookingRef);
      if (!snap.exists) {
        throw new BookingError(BookingErrorCode.BOOKING_NOT_FOUND, 'الحجز غير موجود.');
      }
      const booking = BookingDocSchema.parse(snap.data());
      this.verifyBranchAccess(actor, booking.branchId);

      if (booking.status === targetStatus) {
        return this.sanitizeBookingForActor(actor, booking);
      }

      if (!isValidBookingStatusTransition(booking.status, targetStatus)) {
        throw new BookingError(
          BookingErrorCode.INVALID_TRANSITION,
          `الانتقال من حالة '${booking.status}' إلى '${targetStatus}' غير مسموح به في دورة حياة الحجز.`
        );
      }

      const customerRef = this.firestore.doc(firestorePaths.tenantCustomer(tenantId, booking.customerId));
      const resourceScheduleLockRef =
        (targetStatus === 'COMPLETED' || targetStatus === 'NO_SHOW') && booking.resourceId
          ? this.firestore.doc(firestorePaths.resourceScheduleLock(tenantId, booking.resourceId))
          : null;

      const [customerSnap, queueEntrySnap, resSchedSnap] = await Promise.all([
        transaction.get(customerRef),
        transaction.get(queueEntryRef),
        resourceScheduleLockRef ? transaction.get(resourceScheduleLockRef) : Promise.resolve(null),
      ]);

      // If transition is to COMPLETED or NO_SHOW, release provider & resource slot locks
      if (targetStatus === 'COMPLETED' || targetStatus === 'NO_SHOW') {
        for (const lockId of booking.slotLockIds) {
          const lockRef = this.firestore.doc(firestorePaths.slotLock(tenantId, lockId));
          transaction.set(lockRef, { status: 'RELEASED', updatedAt: nowIso }, { merge: true });
        }
        for (const resLockId of booking.resourceSlotLockIds || []) {
          const resLockRef = this.firestore.doc(firestorePaths.resourceSlotLock(tenantId, resLockId));
          transaction.set(resLockRef, { status: 'RELEASED', updatedAt: nowIso }, { merge: true });
        }
        if (booking.resourceId && resourceScheduleLockRef) {
          const resVer = resSchedSnap?.exists ? resSchedSnap.data()?.version || 0 : 0;
          transaction.set(resourceScheduleLockRef, {
            id: booking.resourceId,
            tenantId,
            resourceId: booking.resourceId,
            branchId: booking.branchId,
            version: resVer + 1,
            lastMutationType: targetStatus === 'COMPLETED' ? 'COMPLETE' : 'NO_SHOW',
            lastBookingId: bookingId,
            updatedAt: nowIso,
          });
        }
      }

      if (customerSnap.exists) {
        const stats = customerSnap.data()?.bookingStatistics;
        if (stats) {
          if (targetStatus === 'COMPLETED') {
            transaction.update(customerRef, {
              'bookingStatistics.completedBookings': (stats.completedBookings || 0) + 1,
              'bookingStatistics.totalSpentHalalas':
                (stats.totalSpentHalalas || 0) + booking.priceSnapshot.totalPriceHalalas,
              updatedAt: nowIso,
              updatedBy: actorUid,
            });
          } else if (targetStatus === 'NO_SHOW') {
            transaction.update(customerRef, {
              'bookingStatistics.noShowBookings': (stats.noShowBookings || 0) + 1,
              updatedAt: nowIso,
              updatedBy: actorUid,
            });
          }
        }
      }

      const updatedBooking: BookingDoc = {
        ...booking,
        status: targetStatus,
        checkIn:
          targetStatus === 'CHECKED_IN'
            ? { checkedInAt: nowIso, checkedInBy: actorUid }
            : booking.checkIn,
        serviceExecution: {
          startedAt:
            targetStatus === 'IN_SERVICE'
              ? nowIso
              : booking.serviceExecution?.startedAt,
          startedBy:
            targetStatus === 'IN_SERVICE'
              ? actorUid
              : booking.serviceExecution?.startedBy,
          completedAt:
            targetStatus === 'COMPLETED'
              ? nowIso
              : booking.serviceExecution?.completedAt,
          completedBy:
            targetStatus === 'COMPLETED'
              ? actorUid
              : booking.serviceExecution?.completedBy,
        },
        updatedAt: nowIso,
        updatedBy: actorUid,
      };

      transaction.set(bookingRef, updatedBooking);

      // Sync queue entry projection atomically if it exists
      if (queueEntrySnap.exists) {
        const queueEntry = QueueEntryDocSchema.parse(queueEntrySnap.data());
        if (targetStatus === 'IN_SERVICE') {
          transaction.update(queueEntryRef, {
            status: 'IN_SERVICE',
            serviceStartedAt: nowIso,
            updatedAt: nowIso,
            updatedBy: actorUid,
          });
        } else if (targetStatus === 'COMPLETED') {
          transaction.update(queueEntryRef, {
            status: 'COMPLETED',
            completedAt: nowIso,
            updatedAt: nowIso,
            updatedBy: actorUid,
          });
        } else if (targetStatus === 'NO_SHOW') {
          transaction.update(queueEntryRef, {
            status: 'NO_SHOW',
            removedAt: nowIso,
            removedReason: 'عدم حضور العميل (NO_SHOW)',
            updatedAt: nowIso,
            updatedBy: actorUid,
          });
        } else if (queueEntry.status === 'WAITING' || queueEntry.status === 'CALLED') {
          transaction.update(queueEntryRef, {
            updatedAt: nowIso,
            updatedBy: actorUid,
          });
        }
      }

      const actionMap: Record<BookingStatus, any> = {
        PENDING: 'BOOKING_CREATED',
        CONFIRMED: 'BOOKING_CONFIRMED',
        CHECKED_IN: 'BOOKING_CHECKED_IN',
        IN_SERVICE: 'BOOKING_SERVICE_STARTED',
        COMPLETED: 'BOOKING_SERVICE_COMPLETED',
        CANCELLED: 'BOOKING_CANCELLED',
        NO_SHOW: 'BOOKING_NO_SHOW',
      };

      const auditId = `audit_bk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.bookingAuditRecord(tenantId, auditId));
      transaction.set(auditRef, {
        id: auditId,
        tenantId,
        actorUid,
        entityType: 'BOOKING',
        entityId: bookingId,
        action: actionMap[targetStatus],
        beforeValues: { status: booking.status },
        afterValues: { status: targetStatus },
        timestamp: nowIso,
      });

      if (targetStatus === 'IN_SERVICE' || targetStatus === 'COMPLETED' || targetStatus === 'NO_SHOW') {
        const opAuditId = `audit_op_st_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        transaction.set(
          this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, opAuditId)),
          {
            id: opAuditId,
            tenantId,
            branchId: booking.branchId,
            actorUid,
            entityType: 'BOOKING',
            entityId: bookingId,
            action: actionMap[targetStatus],
            beforeValues: { status: booking.status },
            afterValues: { status: targetStatus, resourceId: booking.resourceId ?? null },
            timestamp: nowIso,
          }
        );
      }

      if ((targetStatus === 'COMPLETED' || targetStatus === 'NO_SHOW') && booking.resourceId) {
        const relAuditId = `audit_op_rel_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        transaction.set(
          this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, relAuditId)),
          {
            id: relAuditId,
            tenantId,
            branchId: booking.branchId,
            actorUid,
            entityType: 'BOOKING',
            entityId: bookingId,
            action: 'RESOURCE_RELEASED',
            beforeValues: { resourceId: booking.resourceId, resourceNameAr: booking.resourceNameAr ?? null },
            afterValues: { reason: targetStatus },
            timestamp: nowIso,
          }
        );
      }

      return this.sanitizeBookingForActor(actor, updatedBooking);
    });
  }

  /**
   * Atomically assigns, swaps, or releases a salon chair/resource on an active booking.
   * Coordinates resource slot locks and queue projection atomically without double-booking.
   */
  async assignBookingResource(
    actor: BookingActor,
    tenantId: string,
    bookingId: string,
    resourceId: string | null
  ): Promise<BookingDoc> {
    this.verifyPermission(actor, 'resources.assign');

    const actorUid = TrustedSystemContext.isTrusted(actor)
      ? 'SYSTEM'
      : 'uid' in actor
        ? actor.uid
        : 'UNKNOWN';

    const bookingRef = this.firestore.doc(firestorePaths.booking(tenantId, bookingId));
    const queueEntryRef = this.firestore.doc(firestorePaths.queueEntry(tenantId, bookingId));
    const nowIso = new Date().toISOString();

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists) {
        throw new BookingError(BookingErrorCode.BOOKING_NOT_FOUND, 'الحجز غير موجود.');
      }
      const booking = BookingDocSchema.parse(bookingSnap.data());
      this.verifyBranchAccess(actor, booking.branchId);

      if (isTerminalBookingStatus(booking.status)) {
        throw new BookingError(
          BookingErrorCode.TERMINAL_STATE,
          `لا يمكن تغيير مورد حجز في حالته النهائية (${booking.status}).`
        );
      }

      if ((booking.resourceId ?? null) === (resourceId ?? null)) {
        return this.sanitizeBookingForActor(actor, booking);
      }

      const serviceRef = this.firestore.doc(firestorePaths.service(tenantId, booking.serviceId));
      const newResourceRef = resourceId
        ? this.firestore.doc(firestorePaths.resource(tenantId, resourceId))
        : null;

      const resourceIdsForLocks = Array.from(
        new Set(
          [booking.resourceId, resourceId].filter(
            (id): id is string => typeof id === 'string' && id.length > 0
          )
        )
      ).sort();
      const resSchedRefs = resourceIdsForLocks.map((rid) =>
        this.firestore.doc(firestorePaths.resourceScheduleLock(tenantId, rid))
      );

      const [serviceSnap, newResourceSnap, resSchedSnaps, queueEntrySnap] = await Promise.all([
        transaction.get(serviceRef),
        newResourceRef ? transaction.get(newResourceRef) : Promise.resolve(null),
        Promise.all(resSchedRefs.map((r) => transaction.get(r))),
        transaction.get(queueEntryRef),
      ]);

      if (!serviceSnap.exists) {
        throw new BookingError(BookingErrorCode.SERVICE_NOT_FOUND, 'الخدمة غير موجودة.');
      }
      const service = ServiceDocSchema.parse(serviceSnap.data());

      if (service.resourceRequirement === 'REQUIRED' && !resourceId) {
        throw new BookingError(
          BookingErrorCode.RESOURCE_REQUIRED,
          'لا يمكن إزالة المورد لأن هذه الخدمة تتطلب تخصيص كرسي أو غرفة.'
        );
      }

      let targetResource: ResourceDoc | null = null;
      if (resourceId) {
        if (!newResourceSnap || !newResourceSnap.exists) {
          throw new BookingError(BookingErrorCode.RESOURCE_NOT_FOUND, 'المورد المطلوب غير موجود.');
        }
        targetResource = ResourceDocSchema.parse(newResourceSnap.data());
        if (targetResource.branchId !== booking.branchId) {
          throw new BookingError(
            BookingErrorCode.RESOURCE_INELIGIBLE,
            'المورد المختار لا ينتمي لنفس فرع الحجز.'
          );
        }
        if (targetResource.status !== 'ACTIVE') {
          throw new BookingError(
            BookingErrorCode.RESOURCE_INACTIVE,
            targetResource.status === 'MAINTENANCE'
              ? 'المورد المختار قيد الصيانة ولا يمكن تعيينه.'
              : 'المورد المختار غير نشط ولا يمكن تعيينه.'
          );
        }
        const eligibility = isResourceEligibleForService(targetResource, service);
        if (!eligibility.eligible) {
          throw new BookingError(
            BookingErrorCode.RESOURCE_INELIGIBLE,
            eligibility.reason || 'المورد المختار غير مؤهل لهذه الخدمة.'
          );
        }
      }

      const startDate = new Date(booking.scheduledStartTime);
      const endDate = new Date(booking.scheduledEndTime);
      const blockStart = new Date(startDate.getTime() - service.bufferBeforeMinutes * 60 * 1000);
      const blockEnd = new Date(endDate.getTime() + service.bufferAfterMinutes * 60 * 1000);

      const newLockData = targetResource
        ? generateResourceSlotLockIds(targetResource.id, blockStart.toISOString(), blockEnd.toISOString())
        : { lockIds: [] as string[], slotLocks: [] };

      const newResLockRefs = newLockData.lockIds.map((lid) =>
        this.firestore.doc(firestorePaths.resourceSlotLock(tenantId, lid))
      );
      const newResLockSnaps = await Promise.all(newResLockRefs.map((r) => transaction.get(r)));

      for (const snap of newResLockSnaps) {
        if (snap.exists && snap.data()?.status === 'LOCKED' && snap.data()?.bookingId !== bookingId) {
          throw new BookingError(
            BookingErrorCode.RESOURCE_CONFLICT,
            `الكرسي أو المورد (${targetResource?.nameAr}) محجوز مسبقاً في وقت هذا الموعد.`
          );
        }
      }

      // Release old resource locks
      for (const oldResLockId of booking.resourceSlotLockIds || []) {
        if (!newLockData.lockIds.includes(oldResLockId)) {
          transaction.set(
            this.firestore.doc(firestorePaths.resourceSlotLock(tenantId, oldResLockId)),
            { status: 'RELEASED', updatedAt: nowIso },
            { merge: true }
          );
        }
      }

      // Lock new resource slots
      if (targetResource) {
        for (let i = 0; i < newLockData.slotLocks.length; i++) {
          const item = newLockData.slotLocks[i]!;
          const ref = newResLockRefs[i]!;
          transaction.set(ref, {
            id: item.lockId,
            tenantId,
            resourceId: targetResource.id,
            branchId: booking.branchId,
            bookingId,
            date: item.date,
            slotTime: item.time,
            startTimeIso: item.startTimeIso,
            endTimeIso: item.endTimeIso,
            status: 'LOCKED',
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }
      }

      // Increment resource schedule locks
      for (let i = 0; i < resourceIdsForLocks.length; i++) {
        const rid = resourceIdsForLocks[i]!;
        const rref = resSchedRefs[i]!;
        const rsnap = resSchedSnaps[i];
        const ver = rsnap?.exists ? rsnap.data()?.version || 0 : 0;
        transaction.set(rref, {
          id: rid,
          tenantId,
          resourceId: rid,
          branchId: booking.branchId,
          version: ver + 1,
          lastMutationType: targetResource?.id === rid ? 'ASSIGN' : 'RELEASE',
          lastBookingId: bookingId,
          updatedAt: nowIso,
        });
      }

      const updatedBooking: BookingDoc = {
        ...booking,
        resourceId: targetResource?.id ?? null,
        resourceNameAr: targetResource?.nameAr ?? null,
        resourceSlotLockIds: newLockData.lockIds,
        updatedAt: nowIso,
        updatedBy: actorUid,
      };
      transaction.set(bookingRef, updatedBooking);

      if (queueEntrySnap.exists) {
        transaction.update(queueEntryRef, {
          resourceId: targetResource?.id ?? null,
          resourceNameAr: targetResource?.nameAr ?? null,
          updatedAt: nowIso,
          updatedBy: actorUid,
        });
      }

      if (booking.resourceId) {
        const relId = `audit_op_rel_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        transaction.set(this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, relId)), {
          id: relId,
          tenantId,
          branchId: booking.branchId,
          actorUid,
          entityType: 'BOOKING',
          entityId: bookingId,
          action: 'RESOURCE_RELEASED',
          beforeValues: { resourceId: booking.resourceId, resourceNameAr: booking.resourceNameAr ?? null },
          afterValues: { newResourceId: targetResource?.id ?? null },
          timestamp: nowIso,
        });
      }

      if (targetResource) {
        const assignId = `audit_op_asg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        transaction.set(
          this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, assignId)),
          {
            id: assignId,
            tenantId,
            branchId: booking.branchId,
            actorUid,
            entityType: 'BOOKING',
            entityId: bookingId,
            action: 'RESOURCE_ASSIGNED',
            beforeValues: { resourceId: booking.resourceId ?? null },
            afterValues: { resourceId: targetResource.id, resourceNameAr: targetResource.nameAr },
            timestamp: nowIso,
          }
        );
      }

      return this.sanitizeBookingForActor(actor, updatedBooking);
    });
  }

  /**
   * Retrieves a single booking by ID.
   */
  async getBookingById(
    actor: BookingActor,
    tenantId: string,
    bookingId: string
  ): Promise<BookingDoc | null> {
    this.verifyPermission(actor, 'bookings.read');

    const snap = await this.firestore.doc(firestorePaths.booking(tenantId, bookingId)).get();
    if (!snap.exists) return null;

    const booking = BookingDocSchema.parse(snap.data());
    this.verifyBranchAccess(actor, booking.branchId);
    return this.sanitizeBookingForActor(actor, booking);
  }

  /**
   * Lists bookings with date, branch, provider, resource, service, customer, and status filtering.
   */
  async listBookings(
    actor: BookingActor,
    tenantId: string,
    filters: BookingListFilters = {}
  ): Promise<BookingDoc[]> {
    this.verifyPermission(actor, 'bookings.read');
    if (filters.branchId) {
      this.verifyBranchAccess(actor, filters.branchId);
    }

    let colRef: any = this.firestore.collection(firestorePaths.bookings(tenantId));

    if (filters.branchId) {
      colRef = colRef.where('branchId', '==', filters.branchId);
    }
    if (filters.providerId) {
      colRef = colRef.where('providerId', '==', filters.providerId);
    }
    if (filters.customerId) {
      colRef = colRef.where('customerId', '==', filters.customerId);
    }
    if (filters.status) {
      colRef = colRef.where('status', '==', filters.status);
    }

    const snap = await colRef.get();
    let bookings: BookingDoc[] = snap.docs.map((d: any) => BookingDocSchema.parse(d.data()));

    if (
      !TrustedSystemContext.isTrusted(actor) &&
      !('isPlatformAdmin' in actor && actor.isPlatformAdmin) &&
      !('isCustomer' in actor && actor.isCustomer) &&
      'role' in actor &&
      actor.role !== 'OWNER' &&
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0
    ) {
      const allowed = new Set(actor.assignedBranchIds);
      bookings = bookings.filter((b) => allowed.has(b.branchId));
    }

    if (filters.resourceId) {
      bookings = bookings.filter((b) => b.resourceId === filters.resourceId);
    }
    if (filters.serviceId) {
      bookings = bookings.filter((b) => b.serviceId === filters.serviceId);
    }

    // In-memory date filter (YYYY-MM-DD in Riyadh time) if specified
    if (filters.date) {
      bookings = bookings.filter((b) => {
        const { date } = utcIsoToRiyadhTime(b.scheduledStartTime);
        return date === filters.date;
      });
    }

    // Sort by scheduledStartTime ascending
    bookings.sort((a, b) => a.scheduledStartTime.localeCompare(b.scheduledStartTime));

    if (filters.limit) {
      bookings = bookings.slice(0, filters.limit);
    }

    return bookings.map((b) => this.sanitizeBookingForActor(actor, b));
  }

  /**
   * Bounded date-range query for Calendar and Daily Operations views.
   * Avoids scanning historical bookings and supports deterministic cursor pagination.
   */
  async listBookingsByDateRange(
    actor: BookingActor,
    tenantId: string,
    filters: BookingDateRangeFilters
  ): Promise<{ bookings: BookingDoc[]; nextCursorStartTimeIso: string | null; hasMore: boolean }> {
    this.verifyPermission(actor, 'bookings.read');
    if (filters.branchId) {
      this.verifyBranchAccess(actor, filters.branchId);
    }

    const pageSize = Math.min(Math.max(filters.limit ?? 100, 1), 250);
    const effectiveStart = filters.cursorStartTimeIso
      ? filters.cursorStartTimeIso > filters.startTimeIso
        ? filters.cursorStartTimeIso
        : filters.startTimeIso
      : filters.startTimeIso;

    let query: any = this.firestore
      .collection(firestorePaths.bookings(tenantId))
      .where('scheduledStartTime', '>=', effectiveStart)
      .where('scheduledStartTime', '<', filters.endTimeIso);

    if (filters.branchId) {
      query = query.where('branchId', '==', filters.branchId);
    } else if (filters.providerId) {
      query = query.where('providerId', '==', filters.providerId);
    }

    query = query.orderBy('scheduledStartTime', 'asc').limit(pageSize + 1);

    const snap = await query.get();
    let bookings: BookingDoc[] = snap.docs.map((d: any) => BookingDocSchema.parse(d.data()));

    const rawHasMore = bookings.length > pageSize;
    if (rawHasMore) {
      bookings = bookings.slice(0, pageSize);
    }

    if (
      !TrustedSystemContext.isTrusted(actor) &&
      !('isPlatformAdmin' in actor && actor.isPlatformAdmin) &&
      !('isCustomer' in actor && actor.isCustomer) &&
      'role' in actor &&
      actor.role !== 'OWNER' &&
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0
    ) {
      const allowed = new Set(actor.assignedBranchIds);
      bookings = bookings.filter((b) => allowed.has(b.branchId));
    }

    if (filters.providerId && filters.branchId) {
      bookings = bookings.filter((b) => b.providerId === filters.providerId);
    }
    if (filters.resourceId) {
      bookings = bookings.filter((b) => b.resourceId === filters.resourceId);
    }
    if (filters.serviceId) {
      bookings = bookings.filter((b) => b.serviceId === filters.serviceId);
    }
    if (filters.status) {
      bookings = bookings.filter((b) => b.status === filters.status);
    }

    const lastDoc = bookings[bookings.length - 1];
    const nextCursorStartTimeIso =
      rawHasMore && lastDoc
        ? new Date(new Date(lastDoc.scheduledStartTime).getTime() + 1).toISOString()
        : null;

    return {
      bookings: bookings.map((b) => this.sanitizeBookingForActor(actor, b)),
      nextCursorStartTimeIso,
      hasMore: rawHasMore,
    };
  }
}
