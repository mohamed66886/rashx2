import 'server-only';
import type { Firestore, Transaction } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  QueueEntryDocSchema,
  QueueCallDocSchema,
  EnqueueBookingInputSchema,
  CallNextCustomerInputSchema,
  CallAgainInputSchema,
  RecordNoResponseInputSchema,
  ReorderQueueInputSchema,
  RemoveQueueEntryInputSchema,
  QUEUE_PRIORITY_RANKS,
  compareWaitingQueueEntries,
  type QueueEntryDoc,
  type QueueEntryStatus,
  type QueueCallDoc,
  type EnqueueBookingInput,
  type CallNextCustomerInput,
  type CallAgainInput,
  type RecordNoResponseInput,
  type ReorderQueueInput,
  type RemoveQueueEntryInput,
} from '../../queue.schema';
import { BookingDocSchema, isValidBookingStatusTransition, type BookingDoc } from '../../booking.schema';
import { utcIsoToRiyadhTime } from '../../availability.types';
import { hasPermission, type TenantRole } from '../../permissions';
import { TrustedSystemContext } from './trusted-context';
import { BookingRepository } from './booking.repository';

export enum QueueErrorCode {
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BRANCH_FORBIDDEN = 'BRANCH_FORBIDDEN',
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  INVALID_BOOKING_STATUS = 'INVALID_BOOKING_STATUS',
  ENTRY_NOT_FOUND = 'ENTRY_NOT_FOUND',
  ALREADY_CALLED = 'ALREADY_CALLED',
  INVALID_QUEUE_STATE = 'INVALID_QUEUE_STATE',
  QUEUE_EMPTY = 'QUEUE_EMPTY',
}

export class QueueError extends Error {
  constructor(
    public readonly code: QueueErrorCode,
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'QueueError';
  }
}

export type QueueActor =
  | TrustedSystemContext
  | {
      uid: string;
      role: TenantRole;
      customPermissions?: readonly string[] | null;
      assignedBranchIds?: readonly string[] | null;
      isPlatformAdmin?: boolean;
    };

export interface QueueCallResult {
  entry: QueueEntryDoc;
  call: QueueCallDoc;
  deduplicated: boolean;
}

export class QueueRepository {
  private readonly bookingRepo: BookingRepository;

  constructor(private readonly firestore: Firestore = getFirebaseAdminFirestore()) {
    this.bookingRepo = new BookingRepository(firestore);
  }

  private verifyPermission(
    actor: QueueActor,
    capability: Parameters<typeof hasPermission>[1]
  ): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin) return;
    if (!hasPermission(actor.role, capability, actor.customPermissions)) {
      throw new QueueError(
        QueueErrorCode.FORBIDDEN,
        `غير مصرح: لا تملك الصلاحية المطلوبة (${capability}) لإجراء هذه العملية في الطابور.`
      );
    }
  }

  private verifyBranchAccess(actor: QueueActor, branchId: string): void {
    if (TrustedSystemContext.isTrusted(actor)) return;
    if (actor.isPlatformAdmin) return;
    if (actor.role === 'OWNER') return;
    if (actor.assignedBranchIds && actor.assignedBranchIds.length > 0) {
      if (!actor.assignedBranchIds.includes(branchId)) {
        throw new QueueError(
          QueueErrorCode.BRANCH_FORBIDDEN,
          'غير مصرح: لا تملك صلاحية الوصول إلى طابور هذا الفرع.'
        );
      }
    }
  }

  private getActorUid(actor: QueueActor): string {
    if (TrustedSystemContext.isTrusted(actor)) return 'SYSTEM';
    if (actor.isPlatformAdmin) return 'PLATFORM_ADMIN';
    return actor.uid;
  }

  private sanitizeEntryForActor(actor: QueueActor, entry: QueueEntryDoc): QueueEntryDoc {
    if (TrustedSystemContext.isTrusted(actor) || actor.isPlatformAdmin) {
      return entry;
    }
    const canSeePhone = hasPermission(actor.role, 'customers.read', actor.customPermissions);
    if (!canSeePhone) {
      return {
        ...entry,
        customerPhone: entry.customerPhone ? 'مخفي حسب الصلاحية' : null,
      };
    }
    return entry;
  }

  private queueLockKey(branchId: string, date: string): string {
    return `${branchId}_${date}`;
  }

  /**
   * Adds an eligible CHECKED_IN booking to the branch operational queue.
   * Uses deterministic doc ID `bookingId` to structurally eliminate duplicate queue entries.
   */
  async enqueueBooking(actor: QueueActor, rawInput: EnqueueBookingInput): Promise<QueueEntryDoc> {
    this.verifyPermission(actor, 'queue.manage');

    const parseResult = EnqueueBookingInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new QueueError(
        QueueErrorCode.INVALID_PAYLOAD,
        `بيانات الإضافة للطابور غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    if (input.priority) {
      this.verifyPermission(actor, 'queue.reorder');
    }

    const tenantId = input.tenantId;
    const bookingId = input.bookingId;
    const actorUid = this.getActorUid(actor);
    const nowIso = new Date().toISOString();

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const bookingRef = this.firestore.doc(firestorePaths.booking(tenantId, bookingId));
      const entryRef = this.firestore.doc(firestorePaths.queueEntry(tenantId, bookingId));

      const [bookingSnap, entrySnap] = await Promise.all([
        transaction.get(bookingRef),
        transaction.get(entryRef),
      ]);

      if (!bookingSnap.exists) {
        throw new QueueError(QueueErrorCode.BOOKING_NOT_FOUND, 'الحجز غير موجود.');
      }
      const booking = BookingDocSchema.parse(bookingSnap.data());
      this.verifyBranchAccess(actor, booking.branchId);

      if (booking.status !== 'CHECKED_IN') {
        throw new QueueError(
          QueueErrorCode.INVALID_BOOKING_STATUS,
          `لا يمكن إدراج الحجز في الطابور لأن حالته الحالية (${booking.status}) ليست CHECKED_IN.`
        );
      }

      // Idempotent guard: if active queue entry already exists for this booking, return it without duplication
      if (entrySnap.exists) {
        const existingEntry = QueueEntryDocSchema.parse(entrySnap.data());
        if (
          existingEntry.status === 'WAITING' ||
          existingEntry.status === 'CALLED' ||
          existingEntry.status === 'IN_SERVICE'
        ) {
          return this.sanitizeEntryForActor(actor, existingEntry);
        }
      }

      const { date } = utcIsoToRiyadhTime(booking.scheduledStartTime);
      const lockRef = this.firestore.doc(
        firestorePaths.queueLock(tenantId, this.queueLockKey(booking.branchId, date))
      );
      const deterministicAuditId = `audit_q_enq_${bookingId}`;
      const auditRef = this.firestore.doc(
        firestorePaths.operationsAuditRecord(tenantId, deterministicAuditId)
      );

      const [lockSnap, auditSnap] = await Promise.all([
        transaction.get(lockRef),
        transaction.get(auditRef),
      ]);

      const lockData = lockSnap.exists ? lockSnap.data() : null;
      const version = lockData?.version || 0;
      const sequenceNumber = lockData?.nextSequenceNumber || 1;

      const priorityLevel = input.priority
        ? ('PRIORITY' as const)
        : booking.source === 'WALK_IN'
          ? ('WALK_IN' as const)
          : ('APPOINTMENT' as const);
      const priorityRank = QUEUE_PRIORITY_RANKS[priorityLevel];
      const positionScore = priorityRank * 100_000 + sequenceNumber;

      const newEntry = QueueEntryDocSchema.parse({
        id: bookingId,
        bookingId,
        bookingNumber: booking.bookingNumber,
        tenantId,
        branchId: booking.branchId,
        date,
        customerId: booking.customerId,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone ?? null,
        isGuestCustomer: !booking.customerPhone,
        serviceId: booking.serviceId,
        serviceNameAr: booking.serviceNameSnapshot.ar,
        serviceDurationMinutes: booking.serviceDurationMinutes,
        providerId: booking.providerId,
        providerNameAr: booking.providerNameAr,
        resourceId: booking.resourceId ?? null,
        resourceNameAr: booking.resourceNameAr ?? null,
        source: booking.source,
        status: 'WAITING',
        priorityLevel,
        priorityRank,
        sequenceNumber,
        positionScore,
        scheduledStartTime: booking.scheduledStartTime,
        checkedInAt: booking.checkIn?.checkedInAt || nowIso,
        queuedAt: nowIso,
        callCount: 0,
        lastCalledAt: null,
        lastCalledBy: null,
        serviceStartedAt: null,
        completedAt: null,
        removedAt: null,
        removedReason: null,
        notes: input.notes || '',
        updatedAt: nowIso,
        updatedBy: actorUid,
      });

      transaction.set(entryRef, newEntry);
      transaction.set(lockRef, {
        id: this.queueLockKey(booking.branchId, date),
        tenantId,
        branchId: booking.branchId,
        date,
        version: version + 1,
        nextSequenceNumber: sequenceNumber + 1,
        lastMutationType: 'ENQUEUE',
        lastBookingId: bookingId,
        updatedAt: nowIso,
      });

      if (!auditSnap.exists) {
        transaction.set(auditRef, {
          id: deterministicAuditId,
          tenantId,
          branchId: booking.branchId,
          actorUid,
          entityType: 'QUEUE_ENTRY',
          entityId: bookingId,
          action: 'QUEUE_ENTRY_CREATED',
          afterValues: {
            bookingNumber: booking.bookingNumber,
            priorityLevel,
            sequenceNumber,
            positionScore,
          },
          idempotencyKey: bookingId,
          timestamp: nowIso,
        });
      }

      return this.sanitizeEntryForActor(actor, newEntry);
    });
  }

  /**
   * Atomically calls the next eligible WAITING customer (or a specific targetBookingId) in FIFO + priority order.
   * Serialized by `queue_locks/{branchId}_{date}` to guarantee a customer is never called twice concurrently.
   */
  async callNextCustomer(
    actor: QueueActor,
    rawInput: CallNextCustomerInput
  ): Promise<QueueCallResult> {
    this.verifyPermission(actor, 'queue.call');

    const parseResult = CallNextCustomerInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new QueueError(
        QueueErrorCode.INVALID_PAYLOAD,
        `بيانات نداء العميل غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    this.verifyBranchAccess(actor, input.branchId);

    const tenantId = input.tenantId;
    const actorUid = this.getActorUid(actor);
    const nowIso = new Date().toISOString();

    const idempRef = input.idempotencyKey
      ? this.firestore.doc(firestorePaths.queueCallIdempotency(tenantId, input.idempotencyKey))
      : null;

    if (idempRef) {
      const idempSnap = await idempRef.get();
      if (idempSnap.exists) {
        const data = idempSnap.data();
        if (data?.bookingId && data?.callId) {
          const [eSnap, cSnap] = await Promise.all([
            this.firestore.doc(firestorePaths.queueEntry(tenantId, data.bookingId)).get(),
            this.firestore.doc(firestorePaths.queueCall(tenantId, data.callId)).get(),
          ]);
          if (eSnap.exists && cSnap.exists) {
            return {
              entry: this.sanitizeEntryForActor(actor, QueueEntryDocSchema.parse(eSnap.data())),
              call: QueueCallDocSchema.parse(cSnap.data()),
              deduplicated: true,
            };
          }
        }
      }
    }

    const lockKey = this.queueLockKey(input.branchId, input.date);
    const lockRef = this.firestore.doc(firestorePaths.queueLock(tenantId, lockKey));

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      if (idempRef) {
        const idempTxSnap = await transaction.get(idempRef);
        if (idempTxSnap.exists) {
          const data = idempTxSnap.data();
          if (data?.bookingId && data?.callId) {
            const [eSnap, cSnap] = await Promise.all([
              transaction.get(this.firestore.doc(firestorePaths.queueEntry(tenantId, data.bookingId))),
              transaction.get(this.firestore.doc(firestorePaths.queueCall(tenantId, data.callId))),
            ]);
            if (eSnap.exists && cSnap.exists) {
              return {
                entry: this.sanitizeEntryForActor(actor, QueueEntryDocSchema.parse(eSnap.data())),
                call: QueueCallDocSchema.parse(cSnap.data()),
                deduplicated: true,
              };
            }
          }
        }
      }

      const lockSnap = await transaction.get(lockRef);

      let targetEntrySnap: FirebaseFirestore.DocumentSnapshot | null = null;
      let waitingEntries: QueueEntryDoc[] = [];

      if (input.targetBookingId) {
        const specificRef = this.firestore.doc(
          firestorePaths.queueEntry(tenantId, input.targetBookingId)
        );
        targetEntrySnap = await transaction.get(specificRef);
        if (!targetEntrySnap.exists) {
          throw new QueueError(QueueErrorCode.ENTRY_NOT_FOUND, 'سجل الطابور غير موجود.');
        }
        const entry = QueueEntryDocSchema.parse(targetEntrySnap.data());
        if (entry.branchId !== input.branchId || entry.date !== input.date) {
          throw new QueueError(
            QueueErrorCode.INVALID_QUEUE_STATE,
            'سجل الطابور لا ينتمي للفرع أو التاريخ المحدد.'
          );
        }
        if (entry.status !== 'WAITING') {
          throw new QueueError(
            QueueErrorCode.ALREADY_CALLED,
            `لا يمكن نداء العميل لأن حالة الطابور الحالية هي (${entry.status}).`
          );
        }
        waitingEntries = [entry];
      } else {
        const q = this.firestore
          .collection(firestorePaths.queueEntries(tenantId))
          .where('branchId', '==', input.branchId)
          .where('date', '==', input.date)
          .where('status', '==', 'WAITING');
        const qSnap = await transaction.get(q);
        waitingEntries = qSnap.docs
          .map((d) => QueueEntryDocSchema.parse(d.data()))
          .filter((e) => (!input.providerId ? true : e.providerId === input.providerId));
        waitingEntries.sort(compareWaitingQueueEntries);
      }

      const candidate = waitingEntries[0];
      if (!candidate) {
        throw new QueueError(
          QueueErrorCode.QUEUE_EMPTY,
          'لا يوجد عملاء في قائمة الانتظار حالياً.'
        );
      }

      // Verify canonical booking is still CHECKED_IN
      const bookingSnap = await transaction.get(
        this.firestore.doc(firestorePaths.booking(tenantId, candidate.bookingId))
      );
      if (!bookingSnap.exists) {
        throw new QueueError(QueueErrorCode.BOOKING_NOT_FOUND, 'الحجز المرتبط غير موجود.');
      }
      const booking = BookingDocSchema.parse(bookingSnap.data());
      if (booking.status !== 'CHECKED_IN') {
        throw new QueueError(
          QueueErrorCode.INVALID_BOOKING_STATUS,
          `حالة الحجز المرجعي (${booking.status}) غير مؤهلة للنداء.`
        );
      }

      const nextCallSeq = (candidate.callCount || 0) + 1;
      const callId = `qcall_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const callDoc = QueueCallDocSchema.parse({
        id: callId,
        tenantId,
        branchId: candidate.branchId,
        date: candidate.date,
        bookingId: candidate.bookingId,
        queueEntryId: candidate.id,
        customerId: candidate.customerId,
        customerName: candidate.customerName,
        providerId: candidate.providerId,
        providerNameAr: candidate.providerNameAr,
        resourceId: candidate.resourceId ?? null,
        resourceNameAr: candidate.resourceNameAr ?? null,
        callType: 'INITIAL_CALL',
        callSequence: nextCallSeq,
        notes: input.notes || '',
        idempotencyKey: input.idempotencyKey || null,
        calledAt: nowIso,
        calledBy: actorUid,
      });

      const updatedEntry: QueueEntryDoc = {
        ...candidate,
        status: 'CALLED',
        callCount: nextCallSeq,
        lastCalledAt: nowIso,
        lastCalledBy: actorUid,
        updatedAt: nowIso,
        updatedBy: actorUid,
      };

      const lockData = lockSnap.exists ? lockSnap.data() : null;
      transaction.set(
        this.firestore.doc(firestorePaths.queueEntry(tenantId, candidate.bookingId)),
        updatedEntry
      );
      transaction.set(this.firestore.doc(firestorePaths.queueCall(tenantId, callId)), callDoc);
      transaction.set(lockRef, {
        id: lockKey,
        tenantId,
        branchId: input.branchId,
        date: input.date,
        version: (lockData?.version || 0) + 1,
        nextSequenceNumber: lockData?.nextSequenceNumber || candidate.sequenceNumber + 1,
        lastMutationType: 'CALL',
        lastBookingId: candidate.bookingId,
        updatedAt: nowIso,
      });

      if (idempRef && input.idempotencyKey) {
        transaction.set(idempRef, {
          idempotencyKey: input.idempotencyKey,
          bookingId: candidate.bookingId,
          callId,
          tenantId,
          createdAt: nowIso,
        });
      }

      const auditId = `audit_qcall_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      transaction.set(
        this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, auditId)),
        {
          id: auditId,
          tenantId,
          branchId: candidate.branchId,
          actorUid,
          entityType: 'QUEUE_CALL',
          entityId: callId,
          action: 'CUSTOMER_CALLED',
          afterValues: {
            bookingId: candidate.bookingId,
            customerName: candidate.customerName,
            callSequence: nextCallSeq,
          },
          idempotencyKey: input.idempotencyKey || null,
          timestamp: nowIso,
        }
      );

      return {
        entry: this.sanitizeEntryForActor(actor, updatedEntry),
        call: callDoc,
        deduplicated: false,
      };
    });
  }

  /**
   * Explicitly calls a CALLED customer again and appends to the call history.
   */
  async callAgain(actor: QueueActor, rawInput: CallAgainInput): Promise<QueueCallResult> {
    this.verifyPermission(actor, 'queue.call');

    const parseResult = CallAgainInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new QueueError(
        QueueErrorCode.INVALID_PAYLOAD,
        `بيانات إعادة النداء غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    const tenantId = input.tenantId;
    const actorUid = this.getActorUid(actor);
    const nowIso = new Date().toISOString();

    const idempRef = input.idempotencyKey
      ? this.firestore.doc(firestorePaths.queueCallIdempotency(tenantId, input.idempotencyKey))
      : null;

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      if (idempRef) {
        const idempSnap = await transaction.get(idempRef);
        if (idempSnap.exists) {
          const data = idempSnap.data();
          if (data?.bookingId && data?.callId) {
            const [eSnap, cSnap] = await Promise.all([
              transaction.get(this.firestore.doc(firestorePaths.queueEntry(tenantId, data.bookingId))),
              transaction.get(this.firestore.doc(firestorePaths.queueCall(tenantId, data.callId))),
            ]);
            if (eSnap.exists && cSnap.exists) {
              return {
                entry: this.sanitizeEntryForActor(actor, QueueEntryDocSchema.parse(eSnap.data())),
                call: QueueCallDocSchema.parse(cSnap.data()),
                deduplicated: true,
              };
            }
          }
        }
      }

      const entryRef = this.firestore.doc(firestorePaths.queueEntry(tenantId, input.bookingId));
      const entrySnap = await transaction.get(entryRef);
      if (!entrySnap.exists) {
        throw new QueueError(QueueErrorCode.ENTRY_NOT_FOUND, 'سجل الطابور غير موجود.');
      }
      const entry = QueueEntryDocSchema.parse(entrySnap.data());
      this.verifyBranchAccess(actor, entry.branchId);

      if (entry.status !== 'CALLED') {
        throw new QueueError(
          QueueErrorCode.INVALID_QUEUE_STATE,
          `إعادة النداء متاحة فقط للعملاء في حالة (CALLED)، الحالة الحالية هي (${entry.status}).`
        );
      }

      const lockKey = this.queueLockKey(entry.branchId, entry.date);
      const lockRef = this.firestore.doc(firestorePaths.queueLock(tenantId, lockKey));
      const lockSnap = await transaction.get(lockRef);

      const nextCallSeq = (entry.callCount || 0) + 1;
      const callId = `qcall_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const callDoc = QueueCallDocSchema.parse({
        id: callId,
        tenantId,
        branchId: entry.branchId,
        date: entry.date,
        bookingId: entry.bookingId,
        queueEntryId: entry.id,
        customerId: entry.customerId,
        customerName: entry.customerName,
        providerId: entry.providerId,
        providerNameAr: entry.providerNameAr,
        resourceId: entry.resourceId ?? null,
        resourceNameAr: entry.resourceNameAr ?? null,
        callType: 'CALL_AGAIN',
        callSequence: nextCallSeq,
        notes: input.notes || '',
        idempotencyKey: input.idempotencyKey || null,
        calledAt: nowIso,
        calledBy: actorUid,
      });

      const updatedEntry: QueueEntryDoc = {
        ...entry,
        callCount: nextCallSeq,
        lastCalledAt: nowIso,
        lastCalledBy: actorUid,
        updatedAt: nowIso,
        updatedBy: actorUid,
      };

      const lockData = lockSnap.exists ? lockSnap.data() : null;
      transaction.set(entryRef, updatedEntry);
      transaction.set(this.firestore.doc(firestorePaths.queueCall(tenantId, callId)), callDoc);
      transaction.set(lockRef, {
        id: lockKey,
        tenantId,
        branchId: entry.branchId,
        date: entry.date,
        version: (lockData?.version || 0) + 1,
        nextSequenceNumber: lockData?.nextSequenceNumber || entry.sequenceNumber + 1,
        lastMutationType: 'CALL_AGAIN',
        lastBookingId: entry.bookingId,
        updatedAt: nowIso,
      });

      if (idempRef && input.idempotencyKey) {
        transaction.set(idempRef, {
          idempotencyKey: input.idempotencyKey,
          bookingId: entry.bookingId,
          callId,
          tenantId,
          createdAt: nowIso,
        });
      }

      const auditId = `audit_qcall_again_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      transaction.set(
        this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, auditId)),
        {
          id: auditId,
          tenantId,
          branchId: entry.branchId,
          actorUid,
          entityType: 'QUEUE_CALL',
          entityId: callId,
          action: 'CUSTOMER_CALLED_AGAIN',
          afterValues: {
            bookingId: entry.bookingId,
            customerName: entry.customerName,
            callSequence: nextCallSeq,
          },
          idempotencyKey: input.idempotencyKey || null,
          timestamp: nowIso,
        }
      );

      return {
        entry: this.sanitizeEntryForActor(actor, updatedEntry),
        call: callDoc,
        deduplicated: false,
      };
    });
  }

  /**
   * Records that a called customer did not respond:
   * - RETURN_TO_QUEUE moves entry back to WAITING while keeping booking CHECKED_IN.
   * - MARK_NO_SHOW marks booking NO_SHOW (requires `bookings.mark_no_show`), releases locks, and updates stats.
   */
  async recordNoResponse(
    actor: QueueActor,
    rawInput: RecordNoResponseInput
  ): Promise<{ entry: QueueEntryDoc; call: QueueCallDoc }> {
    this.verifyPermission(actor, 'queue.call');

    const parseResult = RecordNoResponseInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new QueueError(
        QueueErrorCode.INVALID_PAYLOAD,
        `بيانات تسجيل عدم الاستجابة غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    if (input.disposition === 'MARK_NO_SHOW') {
      this.verifyPermission(actor, 'bookings.mark_no_show');
    }

    const tenantId = input.tenantId;
    const actorUid = this.getActorUid(actor);
    const nowIso = new Date().toISOString();

    const idempRef = input.idempotencyKey
      ? this.firestore.doc(firestorePaths.queueCallIdempotency(tenantId, input.idempotencyKey))
      : null;

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      if (idempRef) {
        const idempSnap = await transaction.get(idempRef);
        if (idempSnap.exists) {
          const data = idempSnap.data();
          if (data?.bookingId && data?.callId) {
            const [eSnap, cSnap] = await Promise.all([
              transaction.get(this.firestore.doc(firestorePaths.queueEntry(tenantId, data.bookingId))),
              transaction.get(this.firestore.doc(firestorePaths.queueCall(tenantId, data.callId))),
            ]);
            if (eSnap.exists && cSnap.exists) {
              return {
                entry: this.sanitizeEntryForActor(actor, QueueEntryDocSchema.parse(eSnap.data())),
                call: QueueCallDocSchema.parse(cSnap.data()),
              };
            }
          }
        }
      }

      const entryRef = this.firestore.doc(firestorePaths.queueEntry(tenantId, input.bookingId));
      const bookingRef = this.firestore.doc(firestorePaths.booking(tenantId, input.bookingId));
      const [entrySnap, bookingSnap] = await Promise.all([
        transaction.get(entryRef),
        transaction.get(bookingRef),
      ]);

      if (!entrySnap.exists) {
        throw new QueueError(QueueErrorCode.ENTRY_NOT_FOUND, 'سجل الطابور غير موجود.');
      }
      if (!bookingSnap.exists) {
        throw new QueueError(QueueErrorCode.BOOKING_NOT_FOUND, 'الحجز المرتبط غير موجود.');
      }

      const entry = QueueEntryDocSchema.parse(entrySnap.data());
      const booking = BookingDocSchema.parse(bookingSnap.data());
      this.verifyBranchAccess(actor, entry.branchId);

      if (entry.status !== 'CALLED') {
        throw new QueueError(
          QueueErrorCode.INVALID_QUEUE_STATE,
          `تسجيل عدم الاستجابة متاح فقط للعملاء في حالة (CALLED)، الحالة الحالية (${entry.status}).`
        );
      }

      const lockKey = this.queueLockKey(entry.branchId, entry.date);
      const lockRef = this.firestore.doc(firestorePaths.queueLock(tenantId, lockKey));
      const customerRef = this.firestore.doc(firestorePaths.tenantCustomer(tenantId, booking.customerId));
      const resSchedRef = booking.resourceId
        ? this.firestore.doc(firestorePaths.resourceScheduleLock(tenantId, booking.resourceId))
        : null;

      const [lockSnap, customerSnap, resSchedSnap] = await Promise.all([
        transaction.get(lockRef),
        input.disposition === 'MARK_NO_SHOW' ? transaction.get(customerRef) : Promise.resolve(null),
        input.disposition === 'MARK_NO_SHOW' && resSchedRef
          ? transaction.get(resSchedRef)
          : Promise.resolve(null),
      ]);

      const callSeq = (entry.callCount || 0) + 1;
      const callId = `qcall_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const callDoc = QueueCallDocSchema.parse({
        id: callId,
        tenantId,
        branchId: entry.branchId,
        date: entry.date,
        bookingId: entry.bookingId,
        queueEntryId: entry.id,
        customerId: entry.customerId,
        customerName: entry.customerName,
        providerId: entry.providerId,
        providerNameAr: entry.providerNameAr,
        resourceId: entry.resourceId ?? null,
        resourceNameAr: entry.resourceNameAr ?? null,
        callType: 'NO_RESPONSE',
        callSequence: callSeq,
        notes: input.notes || '',
        idempotencyKey: input.idempotencyKey || null,
        calledAt: nowIso,
        calledBy: actorUid,
      });

      let updatedEntry: QueueEntryDoc;
      if (input.disposition === 'RETURN_TO_QUEUE') {
        updatedEntry = {
          ...entry,
          status: 'WAITING',
          updatedAt: nowIso,
          updatedBy: actorUid,
        };
      } else {
        if (!isValidBookingStatusTransition(booking.status, 'NO_SHOW')) {
          throw new QueueError(
            QueueErrorCode.INVALID_BOOKING_STATUS,
            `لا يمكن تسجيل عدم الحضور للحجز في حالته الحالية (${booking.status}).`
          );
        }

        // Release provider & resource locks
        for (const lockId of booking.slotLockIds) {
          transaction.set(
            this.firestore.doc(firestorePaths.slotLock(tenantId, lockId)),
            { status: 'RELEASED', updatedAt: nowIso },
            { merge: true }
          );
        }
        for (const rLockId of booking.resourceSlotLockIds || []) {
          transaction.set(
            this.firestore.doc(firestorePaths.resourceSlotLock(tenantId, rLockId)),
            { status: 'RELEASED', updatedAt: nowIso },
            { merge: true }
          );
        }
        if (booking.resourceId && resSchedRef) {
          const rVer = resSchedSnap?.exists ? resSchedSnap.data()?.version || 0 : 0;
          transaction.set(resSchedRef, {
            id: booking.resourceId,
            tenantId,
            resourceId: booking.resourceId,
            branchId: booking.branchId,
            version: rVer + 1,
            lastMutationType: 'NO_SHOW',
            lastBookingId: booking.id,
            updatedAt: nowIso,
          });
        }

        if (customerSnap?.exists) {
          const stats = customerSnap.data()?.bookingStatistics;
          if (stats) {
            transaction.update(customerRef, {
              'bookingStatistics.noShowBookings': (stats.noShowBookings || 0) + 1,
              updatedAt: nowIso,
              updatedBy: actorUid,
            });
          }
        }

        const noShowBooking: BookingDoc = {
          ...booking,
          status: 'NO_SHOW',
          updatedAt: nowIso,
          updatedBy: actorUid,
        };
        transaction.set(bookingRef, noShowBooking);

        const bkAuditId = `audit_bk_noshow_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        transaction.set(
          this.firestore.doc(firestorePaths.bookingAuditRecord(tenantId, bkAuditId)),
          {
            id: bkAuditId,
            tenantId,
            actorUid,
            entityType: 'BOOKING',
            entityId: booking.id,
            action: 'BOOKING_NO_SHOW',
            beforeValues: { status: booking.status },
            afterValues: { status: 'NO_SHOW' },
            timestamp: nowIso,
          }
        );

        updatedEntry = {
          ...entry,
          status: 'NO_SHOW',
          removedAt: nowIso,
          removedReason: input.notes || 'لم يستجب للنداء (NO_SHOW)',
          updatedAt: nowIso,
          updatedBy: actorUid,
        };
      }

      const lockData = lockSnap.exists ? lockSnap.data() : null;
      transaction.set(entryRef, updatedEntry);
      transaction.set(this.firestore.doc(firestorePaths.queueCall(tenantId, callId)), callDoc);
      transaction.set(lockRef, {
        id: lockKey,
        tenantId,
        branchId: entry.branchId,
        date: entry.date,
        version: (lockData?.version || 0) + 1,
        nextSequenceNumber: lockData?.nextSequenceNumber || entry.sequenceNumber + 1,
        lastMutationType: 'NO_RESPONSE',
        lastBookingId: entry.bookingId,
        updatedAt: nowIso,
      });

      if (idempRef && input.idempotencyKey) {
        transaction.set(idempRef, {
          idempotencyKey: input.idempotencyKey,
          bookingId: entry.bookingId,
          callId,
          tenantId,
          createdAt: nowIso,
        });
      }

      const opAuditId = `audit_q_noresp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      transaction.set(
        this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, opAuditId)),
        {
          id: opAuditId,
          tenantId,
          branchId: entry.branchId,
          actorUid,
          entityType: 'QUEUE_CALL',
          entityId: callId,
          action: 'CUSTOMER_NO_RESPONSE',
          afterValues: {
            bookingId: entry.bookingId,
            disposition: input.disposition,
            newQueueStatus: updatedEntry.status,
          },
          idempotencyKey: input.idempotencyKey || null,
          timestamp: nowIso,
        }
      );

      return {
        entry: this.sanitizeEntryForActor(actor, updatedEntry),
        call: callDoc,
      };
    });
  }

  /**
   * Authoritatively reorders waiting customers in a branch+date queue.
   * Requires `queue.reorder` permission; cannot bypass booking eligibility or reorder non-WAITING entries.
   */
  async reorderQueue(actor: QueueActor, rawInput: ReorderQueueInput): Promise<QueueEntryDoc[]> {
    this.verifyPermission(actor, 'queue.reorder');

    const parseResult = ReorderQueueInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new QueueError(
        QueueErrorCode.INVALID_PAYLOAD,
        `بيانات إعادة ترتيب الطابور غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    this.verifyBranchAccess(actor, input.branchId);

    const tenantId = input.tenantId;
    const actorUid = this.getActorUid(actor);
    const nowIso = new Date().toISOString();
    const lockKey = this.queueLockKey(input.branchId, input.date);
    const lockRef = this.firestore.doc(firestorePaths.queueLock(tenantId, lockKey));

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const lockSnap = await transaction.get(lockRef);

      const waitingQuery = this.firestore
        .collection(firestorePaths.queueEntries(tenantId))
        .where('branchId', '==', input.branchId)
        .where('date', '==', input.date)
        .where('status', '==', 'WAITING');
      const waitingSnap = await transaction.get(waitingQuery);

      const currentWaiting = waitingSnap.docs.map((d) => QueueEntryDocSchema.parse(d.data()));
      const waitingMap = new Map(currentWaiting.map((e) => [e.bookingId, e]));

      // Verify every bookingId in orderedBookingIds is actually WAITING in this branch/date
      const orderedUniqueIds = Array.from(new Set(input.orderedBookingIds));
      for (const bId of orderedUniqueIds) {
        if (!waitingMap.has(bId)) {
          throw new QueueError(
            QueueErrorCode.INVALID_QUEUE_STATE,
            `الحجز (${bId}) غير موجود في قائمة الانتظار النشطة لهذا الفرع والتاريخ.`
          );
        }
      }

      // Append any remaining WAITING entries that weren't explicitly listed at the end
      const remaining = currentWaiting
        .filter((e) => !orderedUniqueIds.includes(e.bookingId))
        .sort(compareWaitingQueueEntries)
        .map((e) => e.bookingId);
      const finalOrder = [...orderedUniqueIds, ...remaining];

      const updatedEntries: QueueEntryDoc[] = [];
      for (let i = 0; i < finalOrder.length; i++) {
        const bId = finalOrder[i]!;
        const entry = waitingMap.get(bId)!;
        const elevate = input.elevateBookingIdToPriority === bId;
        const nextPriorityLevel = elevate ? ('PRIORITY' as const) : entry.priorityLevel;
        const nextPriorityRank = QUEUE_PRIORITY_RANKS[nextPriorityLevel];
        const nextScore = (i + 1) * 10;

        const updated: QueueEntryDoc = {
          ...entry,
          priorityLevel: nextPriorityLevel,
          priorityRank: nextPriorityRank,
          positionScore: nextScore,
          updatedAt: nowIso,
          updatedBy: actorUid,
        };
        updatedEntries.push(updated);
        transaction.set(
          this.firestore.doc(firestorePaths.queueEntry(tenantId, bId)),
          updated
        );
      }

      const lockData = lockSnap.exists ? lockSnap.data() : null;
      transaction.set(lockRef, {
        id: lockKey,
        tenantId,
        branchId: input.branchId,
        date: input.date,
        version: (lockData?.version || 0) + 1,
        nextSequenceNumber: lockData?.nextSequenceNumber || currentWaiting.length + 1,
        lastMutationType: 'REORDER',
        lastBookingId: finalOrder[0] || 'REORDER',
        updatedAt: nowIso,
      });

      const auditId = `audit_q_reord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      transaction.set(
        this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, auditId)),
        {
          id: auditId,
          tenantId,
          branchId: input.branchId,
          actorUid,
          entityType: 'QUEUE_ENTRY',
          entityId: lockKey,
          action: 'QUEUE_POSITION_CHANGED',
          afterValues: {
            orderedBookingIds: finalOrder,
            elevatedBookingId: input.elevateBookingIdToPriority ?? null,
          },
          timestamp: nowIso,
        }
      );

      return updatedEntries.map((e) => this.sanitizeEntryForActor(actor, e));
    });
  }

  /**
   * Starts service for a queued customer via the canonical BookingRepository state machine.
   * Optionally assigns a chair/resource first if `resourceId` is specified.
   */
  async startServiceFromQueue(
    actor: QueueActor,
    tenantId: string,
    bookingId: string,
    resourceId?: string | null
  ): Promise<BookingDoc> {
    if (resourceId !== undefined) {
      await this.bookingRepo.assignBookingResource(actor, tenantId, bookingId, resourceId);
    }
    return this.bookingRepo.transitionBookingStatus(actor, tenantId, bookingId, 'IN_SERVICE');
  }

  /**
   * Completes service via the canonical BookingRepository state machine (releases locks & updates stats).
   */
  async completeServiceFromQueue(
    actor: QueueActor,
    tenantId: string,
    bookingId: string
  ): Promise<BookingDoc> {
    return this.bookingRepo.transitionBookingStatus(actor, tenantId, bookingId, 'COMPLETED');
  }

  /**
   * Removes an entry from the queue; optionally cancels the underlying canonical booking.
   */
  async removeFromQueue(
    actor: QueueActor,
    rawInput: RemoveQueueEntryInput
  ): Promise<QueueEntryDoc> {
    const parseResult = RemoveQueueEntryInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new QueueError(
        QueueErrorCode.INVALID_PAYLOAD,
        `بيانات إزالة العميل من الطابور غير صالحة: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;
    const tenantId = input.tenantId;
    const actorUid = this.getActorUid(actor);
    const nowIso = new Date().toISOString();

    if (input.cancelBooking) {
      await this.bookingRepo.cancelBooking(actor, {
        tenantId,
        bookingId: input.bookingId,
        reason: input.reason || 'تمت الإزالة والإلغاء من الطابور',
      });
      const entrySnap = await this.firestore
        .doc(firestorePaths.queueEntry(tenantId, input.bookingId))
        .get();
      if (!entrySnap.exists) {
        throw new QueueError(QueueErrorCode.ENTRY_NOT_FOUND, 'سجل الطابور غير موجود.');
      }
      return this.sanitizeEntryForActor(actor, QueueEntryDocSchema.parse(entrySnap.data()));
    }

    this.verifyPermission(actor, 'queue.manage');

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const entryRef = this.firestore.doc(firestorePaths.queueEntry(tenantId, input.bookingId));
      const snap = await transaction.get(entryRef);
      if (!snap.exists) {
        throw new QueueError(QueueErrorCode.ENTRY_NOT_FOUND, 'سجل الطابور غير موجود.');
      }
      const entry = QueueEntryDocSchema.parse(snap.data());
      this.verifyBranchAccess(actor, entry.branchId);

      if (entry.status !== 'WAITING' && entry.status !== 'CALLED') {
        throw new QueueError(
          QueueErrorCode.INVALID_QUEUE_STATE,
          `لا يمكن إزالة السجل في حالته الحالية (${entry.status}).`
        );
      }

      const updated: QueueEntryDoc = {
        ...entry,
        status: 'REMOVED',
        removedAt: nowIso,
        removedReason: input.reason || 'تمت الإزالة من الطابور',
        updatedAt: nowIso,
        updatedBy: actorUid,
      };
      transaction.set(entryRef, updated);

      const auditId = `audit_q_rem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      transaction.set(
        this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, auditId)),
        {
          id: auditId,
          tenantId,
          branchId: entry.branchId,
          actorUid,
          entityType: 'QUEUE_ENTRY',
          entityId: input.bookingId,
          action: 'QUEUE_ENTRY_REMOVED',
          beforeValues: { status: entry.status },
          afterValues: { status: 'REMOVED', reason: updated.removedReason },
          timestamp: nowIso,
        }
      );

      return this.sanitizeEntryForActor(actor, updated);
    });
  }

  /**
   * Reconciles derived queue projections against canonical bookings for a branch and date.
   * Ensures interrupted projection writes never silently diverge from BookingDoc truth.
   */
  async reconcileQueueProjection(
    actor: QueueActor,
    tenantId: string,
    branchId: string,
    date: string
  ): Promise<{ repairedCount: number; createdCount: number }> {
    this.verifyPermission(actor, 'queue.manage');
    this.verifyBranchAccess(actor, branchId);

    const actorUid = this.getActorUid(actor);
    const nowIso = new Date().toISOString();

    const entriesSnap = await this.firestore
      .collection(firestorePaths.queueEntries(tenantId))
      .where('branchId', '==', branchId)
      .where('date', '==', date)
      .get();

    const entries = entriesSnap.docs.map((d) => QueueEntryDocSchema.parse(d.data()));
    let repairedCount = 0;

    for (const entry of entries) {
      const bkSnap = await this.firestore
        .doc(firestorePaths.booking(tenantId, entry.bookingId))
        .get();
      if (!bkSnap.exists) continue;
      const booking = BookingDocSchema.parse(bkSnap.data());

      let expectedStatus: QueueEntryStatus | null = null;
      if (booking.status === 'IN_SERVICE' && entry.status !== 'IN_SERVICE') {
        expectedStatus = 'IN_SERVICE';
      } else if (booking.status === 'COMPLETED' && entry.status !== 'COMPLETED') {
        expectedStatus = 'COMPLETED';
      } else if (booking.status === 'CANCELLED' && entry.status !== 'REMOVED') {
        expectedStatus = 'REMOVED';
      } else if (booking.status === 'NO_SHOW' && entry.status !== 'NO_SHOW') {
        expectedStatus = 'NO_SHOW';
      }

      const metadataDrifted =
        entry.providerId !== booking.providerId ||
        (entry.resourceId ?? null) !== (booking.resourceId ?? null) ||
        entry.scheduledStartTime !== booking.scheduledStartTime;

      if (expectedStatus || metadataDrifted) {
        await this.firestore.doc(firestorePaths.queueEntry(tenantId, entry.bookingId)).update({
          ...(expectedStatus ? { status: expectedStatus } : {}),
          providerId: booking.providerId,
          providerNameAr: booking.providerNameAr,
          resourceId: booking.resourceId ?? null,
          resourceNameAr: booking.resourceNameAr ?? null,
          scheduledStartTime: booking.scheduledStartTime,
          updatedAt: nowIso,
          updatedBy: actorUid,
        });
        repairedCount++;
      }
    }

    if (repairedCount > 0) {
      const auditId = `audit_q_rec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      await this.firestore.doc(firestorePaths.operationsAuditRecord(tenantId, auditId)).set({
        id: auditId,
        tenantId,
        branchId,
        actorUid,
        entityType: 'QUEUE_ENTRY',
        entityId: this.queueLockKey(branchId, date),
        action: 'QUEUE_RECONCILED',
        afterValues: { repairedCount, date },
        timestamp: nowIso,
      });
    }

    return { repairedCount, createdCount: 0 };
  }

  /**
   * Lists operational queue entries for a branch and date, deterministically ordered.
   */
  async listQueueEntries(
    actor: QueueActor,
    tenantId: string,
    filters: {
      branchId?: string;
      date: string;
      status?: QueueEntryStatus;
      providerId?: string;
    }
  ): Promise<QueueEntryDoc[]> {
    this.verifyPermission(actor, 'queue.read');
    if (filters.branchId) {
      this.verifyBranchAccess(actor, filters.branchId);
    }

    let query: any = this.firestore
      .collection(firestorePaths.queueEntries(tenantId))
      .where('date', '==', filters.date);

    if (filters.branchId) {
      query = query.where('branchId', '==', filters.branchId);
    }
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    const snap = await query.get();
    let entries: QueueEntryDoc[] = snap.docs.map((d: any) => QueueEntryDocSchema.parse(d.data()));

    if (
      !TrustedSystemContext.isTrusted(actor) &&
      !actor.isPlatformAdmin &&
      actor.role !== 'OWNER' &&
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0
    ) {
      const allowed = new Set(actor.assignedBranchIds);
      entries = entries.filter((e) => allowed.has(e.branchId));
    }

    if (filters.providerId) {
      entries = entries.filter((e) => e.providerId === filters.providerId);
    }

    entries.sort(compareWaitingQueueEntries);
    return entries.map((e) => this.sanitizeEntryForActor(actor, e));
  }

  /**
   * Retrieves chronological call history for a branch/date or specific booking.
   */
  async listCallHistory(
    actor: QueueActor,
    tenantId: string,
    filters: { branchId?: string; date?: string; bookingId?: string; limit?: number }
  ): Promise<QueueCallDoc[]> {
    this.verifyPermission(actor, 'queue.read');
    if (filters.branchId) {
      this.verifyBranchAccess(actor, filters.branchId);
    }

    let query: any = this.firestore.collection(firestorePaths.queueCalls(tenantId));
    if (filters.bookingId) {
      query = query.where('bookingId', '==', filters.bookingId);
    } else {
      if (filters.branchId) {
        query = query.where('branchId', '==', filters.branchId);
      }
      if (filters.date) {
        query = query.where('date', '==', filters.date);
      }
    }

    const snap = await query.get();
    let calls: QueueCallDoc[] = snap.docs.map((d: any) => QueueCallDocSchema.parse(d.data()));

    if (
      !TrustedSystemContext.isTrusted(actor) &&
      !actor.isPlatformAdmin &&
      actor.role !== 'OWNER' &&
      actor.assignedBranchIds &&
      actor.assignedBranchIds.length > 0
    ) {
      const allowed = new Set(actor.assignedBranchIds);
      calls = calls.filter((c) => allowed.has(c.branchId));
    }

    calls.sort((a, b) => b.calledAt.localeCompare(a.calledAt));
    if (filters.limit) {
      calls = calls.slice(0, filters.limit);
    }
    return calls;
  }
}

