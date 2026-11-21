import 'server-only';
import type {
  Firestore,
  DocumentReference,
  DocumentSnapshot,
  Transaction,
} from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  AppointmentDocSchema,
  RescheduleAppointmentInputSchema,
  CreateAppointmentInputSchema,
  CancelAppointmentInputSchema,
  CompleteAppointmentInputSchema,
  MarkNoShowAppointmentInputSchema,
  normalizeToUtcIso,
  type AppointmentDoc,
  type RescheduleAppointmentInput,
  type CreateAppointmentInput,
  type CancelAppointmentInput,
  type CompleteAppointmentInput,
  type MarkNoShowAppointmentInput,
  type ScheduleLockDoc,
} from '../../appointment.schema';
import { TrustedSystemContext } from './trusted-context';

/**
 * Standard error codes for appointment lifecycle, referential integrity, and conflict checking.
 */
export enum AppointmentErrorCode {
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  APPOINTMENT_NOT_FOUND = 'APPOINTMENT_NOT_FOUND',
  STAFF_NOT_FOUND = 'STAFF_NOT_FOUND',
  STAFF_INACTIVE = 'STAFF_INACTIVE',
  BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND',
  BRANCH_INACTIVE = 'BRANCH_INACTIVE',
  STAFF_BRANCH_MISMATCH = 'STAFF_BRANCH_MISMATCH',
  TERMINAL_LIFECYCLE_STATE = 'TERMINAL_LIFECYCLE_STATE',
  INVALID_TIME_RANGE = 'INVALID_TIME_RANGE',
  BOOKING_CONFLICT = 'BOOKING_CONFLICT',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
}

/**
 * Strongly typed error thrown on appointment mutation failures.
 */
export class AppointmentError extends Error {
  public override readonly cause?: unknown;

  constructor(
    public readonly code: AppointmentErrorCode,
    message: string,
    cause?: unknown
  ) {
    super(message);
    this.name = 'AppointmentError';
    this.cause = cause;
  }
}

/**
 * Actor performing the appointment mutation.
 * Authoritative identity derived from verified token, trusted platform context,
 * or unforgeable internal system context.
 */
export type AppointmentActor =
  | TrustedSystemContext
  | {
      uid: string;
      isPlatformAdmin?: boolean;
      system?: never;
    };

/**
 * Result of an atomic appointment mutation transaction.
 */
export interface AppointmentMutationResult {
  appointment: AppointmentDoc;
  auditLogId: string;
}

/**
 * Internal lock acquisition payload returned during the transaction read phase.
 */
interface AcquiredScheduleLocks {
  sortedStaffIds: string[];
  lockRefs: DocumentReference[];
  lockSnaps: DocumentSnapshot[];
  versions: Map<string, number>;
}

/**
 * Server-only Authoritative Appointment Repository.
 *
 * Enforces transactional booking integrity, atomic conflict detection (double-booking prevention),
 * deterministic schedule mutex locks (`/tenants/{tenantId}/schedule_locks/{staffUid}`) to prevent
 * phantom inserts and write skew across concurrent operations, immutable financial/identity fields,
 * referential validation across staff & branches, and atomic audit logging.
 */
export class AppointmentRepository {
  constructor(private readonly firestore: Firestore = getFirebaseAdminFirestore()) {}

  /**
   * Authoritatively verifies whether the actor is permitted to perform the mutation.
   */
  private async verifyActorAuthorization(
    actor: AppointmentActor,
    tenantId: string,
    allowedRoles: Array<'OWNER' | 'MANAGER' | 'STAFF'> = ['OWNER', 'MANAGER'],
    allowedStaffId?: string
  ): Promise<void> {
    if (TrustedSystemContext.isTrusted(actor)) {
      return;
    }

    if (!actor || typeof actor !== 'object' || !('uid' in actor) || !actor.uid) {
      throw new AppointmentError(
        AppointmentErrorCode.UNAUTHORIZED,
        'Mutation requires an authenticated actor.'
      );
    }

    // 1. Verify platform admin against authoritative Firestore registry
    if (actor.isPlatformAdmin) {
      const adminSnap = await this.firestore
        .doc(firestorePaths.platformAdmin(actor.uid))
        .get();
      if (adminSnap.exists && adminSnap.data()?.isActive === true) {
        return;
      }
    }

    // 2. Verify active tenant membership
    const memberSnap = await this.firestore
      .doc(firestorePaths.membership(tenantId, actor.uid))
      .get();

    if (!memberSnap.exists) {
      throw new AppointmentError(
        AppointmentErrorCode.FORBIDDEN,
        `Actor ${actor.uid} has no membership record in tenant ${tenantId}.`
      );
    }

    const memberData = memberSnap.data();
    if (memberData?.status !== 'ACTIVE') {
      throw new AppointmentError(
        AppointmentErrorCode.FORBIDDEN,
        `Actor membership in tenant ${tenantId} is not ACTIVE (status: ${memberData?.status}).`
      );
    }

    if (!allowedRoles.includes(memberData.role)) {
      throw new AppointmentError(
        AppointmentErrorCode.FORBIDDEN,
        `Actor ${actor.uid} role '${memberData.role}' is not authorized for this operation.`
      );
    }

    if (memberData.role === 'STAFF' && allowedStaffId && actor.uid !== allowedStaffId) {
      throw new AppointmentError(
        AppointmentErrorCode.FORBIDDEN,
        `Staff member ${actor.uid} cannot mutate appointment assigned to staff ${allowedStaffId}.`
      );
    }
  }

  /**
   * Phase A Helper: Reads all schedule lock documents for the given staff IDs in
   * deterministic lexicographical order.
   *
   * Must be called during the transaction READ phase before ANY writes occur.
   */
  private async readScheduleLocksInTransaction(
    transaction: Transaction,
    tenantId: string,
    staffIds: string[]
  ): Promise<AcquiredScheduleLocks> {
    const sortedStaffIds = Array.from(new Set(staffIds)).sort();
    const lockRefs = sortedStaffIds.map((sId) =>
      this.firestore.doc(firestorePaths.scheduleLock(tenantId, sId))
    );
    const lockSnaps = await Promise.all(lockRefs.map((ref) => transaction.get(ref)));

    const versions = new Map<string, number>();
    for (let i = 0; i < sortedStaffIds.length; i++) {
      const sId = sortedStaffIds[i];
      const snap = lockSnaps[i];
      if (!sId || !snap) continue;
      const data = snap.exists ? snap.data() : undefined;
      const ver =
        data && typeof data.version === 'number'
          ? (data.version as number)
          : 0;
      versions.set(sId, ver);
    }

    return {
      sortedStaffIds,
      lockRefs,
      lockSnaps,
      versions,
    };
  }

  /**
   * Phase C Helper: Commits updated schedule lock documents for all acquired staff locks
   * within the transaction write phase.
   */
  private commitScheduleLocksInTransaction(
    transaction: Transaction,
    tenantId: string,
    locks: AcquiredScheduleLocks,
    mutationType: 'CREATE' | 'RESCHEDULE' | 'CANCEL' | 'COMPLETE' | 'NO_SHOW',
    appointmentId: string,
    nowIso: string
  ): void {
    for (let i = 0; i < locks.sortedStaffIds.length; i++) {
      const sId = locks.sortedStaffIds[i];
      const lockRef = locks.lockRefs[i];
      if (!sId || !lockRef) continue;
      const currentVer = locks.versions.get(sId) || 0;

      const lockData: ScheduleLockDoc = {
        id: sId,
        tenantId,
        staffId: sId,
        version: currentVer + 1,
        lastMutationType: mutationType,
        lastAppointmentId: appointmentId,
        updatedAt: nowIso,
      };

      transaction.set(lockRef, lockData);
    }
  }

  /**
   * Atomically creates a new appointment within a Firestore transaction.
   *
   * Participates in the shared schedule lock protocol:
   * 1. Acquires `/tenants/{tenantId}/schedule_locks/{staffId}` in read phase.
   * 2. Queries existing appointments for target staff member and detects overlapping slots.
   * 3. Validates active same-tenant staff and branch, plus staff-to-branch assignment.
   * 4. Updates schedule lock, writes appointment, and appends audit log atomically.
   */
  public async createAppointment(
    actor: AppointmentActor,
    rawInput: CreateAppointmentInput
  ): Promise<AppointmentMutationResult> {
    const parseResult = CreateAppointmentInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new AppointmentError(
        AppointmentErrorCode.INVALID_PAYLOAD,
        `Invalid create appointment payload: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;

    await this.verifyActorAuthorization(actor, input.tenantId);

    const startTimeIso = normalizeToUtcIso(input.scheduledStartTime);
    const endTimeIso = normalizeToUtcIso(input.scheduledEndTime);

    if (endTimeIso <= startTimeIso) {
      throw new AppointmentError(
        AppointmentErrorCode.INVALID_TIME_RANGE,
        `scheduledEndTime (${endTimeIso}) must be strictly later than scheduledStartTime (${startTimeIso}).`
      );
    }

    const tenantId = input.tenantId;
    const appointmentId =
      input.appointmentId ||
      this.firestore.collection(firestorePaths.appointments(tenantId)).doc().id;
    const aptRef = this.firestore.doc(firestorePaths.appointment(tenantId, appointmentId));

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      // -------------------------------------------------------------
      // PHASE 1: DETERMINISTIC READS (All reads before any writes)
      // -------------------------------------------------------------
      // 1. Acquire schedule lock on target staff
      const locks = await this.readScheduleLocksInTransaction(transaction, tenantId, [
        input.staffId,
      ]);

      // 2. Read target staff
      const staffRef = this.firestore.doc(firestorePaths.staffMember(tenantId, input.staffId));
      const staffSnap = await transaction.get(staffRef);

      // 3. Read target branch
      const branchRef = this.firestore.doc(firestorePaths.branch(tenantId, input.branchId));
      const branchSnap = await transaction.get(branchRef);

      // 4. Query existing appointments for target staff member
      const appointmentsCol = this.firestore.collection(firestorePaths.appointments(tenantId));
      const staffAppointmentsQuery = appointmentsCol.where('staffId', '==', input.staffId);
      const existingAppointmentsSnap = await transaction.get(staffAppointmentsQuery);

      // -------------------------------------------------------------
      // PHASE 2: IN-MEMORY VALIDATION & CONFLICT DETECTION
      // -------------------------------------------------------------
      if (!staffSnap.exists) {
        throw new AppointmentError(
          AppointmentErrorCode.STAFF_NOT_FOUND,
          `Staff member ${input.staffId} does not exist in tenant ${tenantId}.`
        );
      }
      const staffData = staffSnap.data();
      if (staffData?.isActive !== true) {
        throw new AppointmentError(
          AppointmentErrorCode.STAFF_INACTIVE,
          `Staff member ${input.staffId} is inactive.`
        );
      }

      if (!branchSnap.exists) {
        throw new AppointmentError(
          AppointmentErrorCode.BRANCH_NOT_FOUND,
          `Branch ${input.branchId} does not exist in tenant ${tenantId}.`
        );
      }
      const branchData = branchSnap.data();
      if (branchData?.isActive !== true) {
        throw new AppointmentError(
          AppointmentErrorCode.BRANCH_INACTIVE,
          `Branch ${input.branchId} is inactive.`
        );
      }

      const assignedBranchIds: string[] = staffData.assignedBranchIds || [];
      if (!assignedBranchIds.includes(input.branchId)) {
        throw new AppointmentError(
          AppointmentErrorCode.STAFF_BRANCH_MISMATCH,
          `Staff member ${input.staffId} is not assigned to branch ${input.branchId}.`
        );
      }

      // Conflict detection: overlapping interval [StartA < EndB and EndA > StartB]
      for (const doc of existingAppointmentsSnap.docs) {
        const data = doc.data();
        if (data.status === 'CANCELLED') {
          continue;
        }

        const existingStart = String(data.scheduledStartTime);
        const existingEnd = String(data.scheduledEndTime);

        const isOverlapping = existingStart < endTimeIso && existingEnd > startTimeIso;
        if (isOverlapping) {
          throw new AppointmentError(
            AppointmentErrorCode.BOOKING_CONFLICT,
            `Booking conflict: Staff member ${input.staffId} already has appointment ${doc.id} scheduled from ${existingStart} to ${existingEnd}.`
          );
        }
      }

      // -------------------------------------------------------------
      // PHASE 3: TRANSACTIONAL WRITES
      // -------------------------------------------------------------
      const nowIso = new Date().toISOString();

      const newAppointment: AppointmentDoc = {
        id: appointmentId,
        tenantId,
        branchId: input.branchId,
        staffId: input.staffId,
        customerId: input.customerId,
        serviceId: input.serviceId,
        status: 'CONFIRMED',
        scheduledStartTime: startTimeIso,
        scheduledEndTime: endTimeIso,
        priceHalalas: input.priceHalalas,
        paymentStatus: 'PENDING',
        notes: input.notes || '',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const auditLogId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.auditLog(tenantId, auditLogId));
      const actorUid = TrustedSystemContext.isTrusted(actor) ? 'SYSTEM' : actor.uid;

      const auditDoc = {
        id: auditLogId,
        tenantId,
        actorUid,
        action: 'CREATE_APPOINTMENT',
        targetAppointmentId: appointmentId,
        newValues: {
          staffId: input.staffId,
          branchId: input.branchId,
          scheduledStartTime: startTimeIso,
          scheduledEndTime: endTimeIso,
          priceHalalas: input.priceHalalas,
        },
        timestamp: nowIso,
      };

      // 1. Commit schedule lock update
      this.commitScheduleLocksInTransaction(
        transaction,
        tenantId,
        locks,
        'CREATE',
        appointmentId,
        nowIso
      );

      // 2. Commit appointment creation
      transaction.set(aptRef, newAppointment);

      // 3. Commit audit log
      transaction.set(auditRef, auditDoc);

      return {
        appointment: newAppointment,
        auditLogId,
      };
    });
  }

  /**
   * Atomically reschedules and/or reassigns an appointment within a Firestore transaction.
   *
   * Participates in the shared schedule lock protocol:
   * 1. Reads target appointment to determine original staff member.
   * 2. Acquires schedule locks in deterministic sorted order:
   *    `[originalStaffId, targetStaffId].sort()`.
   * 3. Reads target staff, target branch, and queries existing appointments for target staff.
   * 4. Enforces lifecycle rules (terminal appointments cannot be rescheduled).
   * 5. Enforces referential integrity and active status for staff and branch.
   * 6. Rejects overlapping slots for target staff member.
   * 7. Preserves immutable identity, customer, and financial fields.
   * 8. Atomically updates both schedule locks, updates appointment, and writes audit log.
   */
  public async rescheduleAppointment(
    actor: AppointmentActor,
    rawInput: RescheduleAppointmentInput
  ): Promise<AppointmentMutationResult> {
    const parseResult = RescheduleAppointmentInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new AppointmentError(
        AppointmentErrorCode.INVALID_PAYLOAD,
        `Invalid reschedule payload: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;

    await this.verifyActorAuthorization(actor, input.tenantId);

    const newStartTimeIso = normalizeToUtcIso(input.scheduledStartTime);
    const newEndTimeIso = normalizeToUtcIso(input.scheduledEndTime);

    if (newEndTimeIso <= newStartTimeIso) {
      throw new AppointmentError(
        AppointmentErrorCode.INVALID_TIME_RANGE,
        `scheduledEndTime (${newEndTimeIso}) must be strictly later than scheduledStartTime (${newStartTimeIso}).`
      );
    }

    const tenantId = input.tenantId;
    const appointmentId = input.appointmentId;
    const aptRef = this.firestore.doc(firestorePaths.appointment(tenantId, appointmentId));

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      // -------------------------------------------------------------
      // PHASE 1: DETERMINISTIC READS (All reads before any writes)
      // -------------------------------------------------------------
      // 1. Fetch target appointment
      const aptSnap = await transaction.get(aptRef);
      if (!aptSnap.exists) {
        throw new AppointmentError(
          AppointmentErrorCode.APPOINTMENT_NOT_FOUND,
          `Appointment ${appointmentId} was not found in tenant ${tenantId}.`
        );
      }

      const existingData = aptSnap.data();
      const appointment = AppointmentDocSchema.parse(existingData);

      // Lifecycle check: terminal appointments cannot be rescheduled
      if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status)) {
        throw new AppointmentError(
          AppointmentErrorCode.TERMINAL_LIFECYCLE_STATE,
          `Cannot reschedule appointment ${appointmentId} in terminal status '${appointment.status}'.`
        );
      }

      const oldStaffId = appointment.staffId;
      const targetStaffId = input.staffId ?? appointment.staffId;
      const targetBranchId = input.branchId ?? appointment.branchId;

      // 2. Acquire schedule locks for both old and new staff in deterministic sorted order
      const staffIdsToLock = Array.from(new Set([oldStaffId, targetStaffId])).sort();
      const locks = await this.readScheduleLocksInTransaction(
        transaction,
        tenantId,
        staffIdsToLock
      );

      // 3. Fetch target staff
      const staffRef = this.firestore.doc(firestorePaths.staffMember(tenantId, targetStaffId));
      const staffSnap = await transaction.get(staffRef);

      // 4. Fetch target branch
      const branchRef = this.firestore.doc(firestorePaths.branch(tenantId, targetBranchId));
      const branchSnap = await transaction.get(branchRef);

      // 5. Query existing appointments for target staff member
      const appointmentsCol = this.firestore.collection(firestorePaths.appointments(tenantId));
      const staffAppointmentsQuery = appointmentsCol.where('staffId', '==', targetStaffId);
      const existingAppointmentsSnap = await transaction.get(staffAppointmentsQuery);

      // -------------------------------------------------------------
      // PHASE 2: IN-MEMORY VALIDATION & CONFLICT DETECTION
      // -------------------------------------------------------------
      if (!staffSnap.exists) {
        throw new AppointmentError(
          AppointmentErrorCode.STAFF_NOT_FOUND,
          `Target staff member ${targetStaffId} does not exist in tenant ${tenantId}.`
        );
      }
      const staffData = staffSnap.data();
      if (staffData?.isActive !== true) {
        throw new AppointmentError(
          AppointmentErrorCode.STAFF_INACTIVE,
          `Target staff member ${targetStaffId} is inactive.`
        );
      }

      if (!branchSnap.exists) {
        throw new AppointmentError(
          AppointmentErrorCode.BRANCH_NOT_FOUND,
          `Target branch ${targetBranchId} does not exist in tenant ${tenantId}.`
        );
      }
      const branchData = branchSnap.data();
      if (branchData?.isActive !== true) {
        throw new AppointmentError(
          AppointmentErrorCode.BRANCH_INACTIVE,
          `Target branch ${targetBranchId} is inactive.`
        );
      }

      const assignedBranchIds: string[] = staffData.assignedBranchIds || [];
      if (!assignedBranchIds.includes(targetBranchId)) {
        throw new AppointmentError(
          AppointmentErrorCode.STAFF_BRANCH_MISMATCH,
          `Staff member ${targetStaffId} is not assigned to branch ${targetBranchId}.`
        );
      }

      // Conflict detection for target staff member
      for (const doc of existingAppointmentsSnap.docs) {
        if (doc.id === appointmentId) {
          continue; // Exclude the appointment currently being rescheduled
        }

        const data = doc.data();
        if (data.status === 'CANCELLED') {
          continue;
        }

        const existingStart = String(data.scheduledStartTime);
        const existingEnd = String(data.scheduledEndTime);

        const isOverlapping = existingStart < newEndTimeIso && existingEnd > newStartTimeIso;
        if (isOverlapping) {
          throw new AppointmentError(
            AppointmentErrorCode.BOOKING_CONFLICT,
            `Booking conflict: Staff member ${targetStaffId} already has appointment ${doc.id} scheduled from ${existingStart} to ${existingEnd}.`
          );
        }
      }

      // -------------------------------------------------------------
      // PHASE 3: TRANSACTIONAL WRITES
      // -------------------------------------------------------------
      const nowIso = new Date().toISOString();

      const updatedAppointment: AppointmentDoc = {
        id: appointment.id,
        tenantId: appointment.tenantId, // Immutable
        customerId: appointment.customerId, // Immutable
        serviceId: appointment.serviceId, // Immutable
        priceHalalas: appointment.priceHalalas, // Immutable
        paymentStatus: appointment.paymentStatus, // Immutable
        createdAt: appointment.createdAt, // Immutable
        branchId: targetBranchId,
        staffId: targetStaffId,
        status: appointment.status,
        scheduledStartTime: newStartTimeIso,
        scheduledEndTime: newEndTimeIso,
        notes: input.notes !== undefined ? input.notes : appointment.notes,
        updatedAt: nowIso,
      };

      const auditLogId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.auditLog(tenantId, auditLogId));
      const actorUid = TrustedSystemContext.isTrusted(actor) ? 'SYSTEM' : actor.uid;

      const auditDoc = {
        id: auditLogId,
        tenantId,
        actorUid,
        action: 'RESCHEDULE_APPOINTMENT',
        targetAppointmentId: appointmentId,
        previousValues: {
          staffId: appointment.staffId,
          branchId: appointment.branchId,
          scheduledStartTime: appointment.scheduledStartTime,
          scheduledEndTime: appointment.scheduledEndTime,
        },
        newValues: {
          staffId: targetStaffId,
          branchId: targetBranchId,
          scheduledStartTime: newStartTimeIso,
          scheduledEndTime: newEndTimeIso,
        },
        timestamp: nowIso,
      };

      // 1. Commit schedule lock updates (for old and new staff)
      this.commitScheduleLocksInTransaction(
        transaction,
        tenantId,
        locks,
        'RESCHEDULE',
        appointmentId,
        nowIso
      );

      // 2. Commit appointment update
      transaction.set(aptRef, updatedAppointment);

      // 3. Commit audit log
      transaction.set(auditRef, auditDoc);

      return {
        appointment: updatedAppointment,
        auditLogId,
      };
    });
  }

  /**
   * Atomically cancels an appointment within a Firestore transaction.
   *
   * Participates in the shared schedule lock protocol:
   * 1. Reads target appointment.
   * 2. Acquires schedule lock for assigned staff member in read phase.
   * 3. Enforces lifecycle rules (cannot cancel an already completed or cancelled appointment).
   * 4. Updates appointment status to CANCELLED.
   * 5. Updates schedule lock to signal slot release and commits audit log atomically.
   */
  public async cancelAppointment(
    actor: AppointmentActor,
    rawInput: CancelAppointmentInput
  ): Promise<AppointmentMutationResult> {
    const parseResult = CancelAppointmentInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new AppointmentError(
        AppointmentErrorCode.INVALID_PAYLOAD,
        `Invalid cancel appointment payload: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;

    const tenantId = input.tenantId;
    const appointmentId = input.appointmentId;
    const aptRef = this.firestore.doc(firestorePaths.appointment(tenantId, appointmentId));

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      // -------------------------------------------------------------
      // PHASE 1: DETERMINISTIC READS
      // -------------------------------------------------------------
      const aptSnap = await transaction.get(aptRef);
      if (!aptSnap.exists) {
        throw new AppointmentError(
          AppointmentErrorCode.APPOINTMENT_NOT_FOUND,
          `Appointment ${appointmentId} was not found in tenant ${tenantId}.`
        );
      }

      const existingData = aptSnap.data();
      const appointment = AppointmentDocSchema.parse(existingData);

      // Verify actor authorization (manager/owner, or assigned staff member)
      await this.verifyActorAuthorization(
        actor,
        tenantId,
        ['OWNER', 'MANAGER', 'STAFF'],
        appointment.staffId
      );

      if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status)) {
        throw new AppointmentError(
          AppointmentErrorCode.TERMINAL_LIFECYCLE_STATE,
          `Cannot cancel appointment ${appointmentId} in terminal status '${appointment.status}'.`
        );
      }

      // Acquire schedule lock for assigned staff member
      const locks = await this.readScheduleLocksInTransaction(transaction, tenantId, [
        appointment.staffId,
      ]);

      // -------------------------------------------------------------
      // PHASE 3: TRANSACTIONAL WRITES
      // -------------------------------------------------------------
      const nowIso = new Date().toISOString();

      const cancelledAppointment: AppointmentDoc = {
        ...appointment,
        status: 'CANCELLED',
        notes: input.reason
          ? `${appointment.notes ? appointment.notes + ' | ' : ''}Cancellation reason: ${input.reason}`
          : appointment.notes,
        updatedAt: nowIso,
      };

      const auditLogId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.auditLog(tenantId, auditLogId));
      const actorUid = TrustedSystemContext.isTrusted(actor) ? 'SYSTEM' : actor.uid;

      const auditDoc = {
        id: auditLogId,
        tenantId,
        actorUid,
        action: 'CANCEL_APPOINTMENT',
        targetAppointmentId: appointmentId,
        previousStatus: appointment.status,
        newStatus: 'CANCELLED',
        reason: input.reason || null,
        timestamp: nowIso,
      };

      // 1. Commit schedule lock update
      this.commitScheduleLocksInTransaction(
        transaction,
        tenantId,
        locks,
        'CANCEL',
        appointmentId,
        nowIso
      );

      // 2. Commit appointment update
      transaction.set(aptRef, cancelledAppointment);

      // 3. Commit audit log
      transaction.set(auditRef, auditDoc);

      return {
        appointment: cancelledAppointment,
        auditLogId,
      };
    });
  }

  /**
   * Atomically completes an appointment within a Firestore transaction.
   *
   * Participates in the shared schedule lock protocol:
   * 1. Reads target appointment.
   * 2. Verifies appointment is currently active (CONFIRMED or IN_PROGRESS).
   * 3. Acquires schedule lock for assigned staff member in read phase.
   * 4. Updates appointment status to COMPLETED (terminal).
   * 5. Updates schedule lock and commits audit log atomically.
   */
  public async completeAppointment(
    actor: AppointmentActor,
    rawInput: CompleteAppointmentInput
  ): Promise<AppointmentMutationResult> {
    const parseResult = CompleteAppointmentInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new AppointmentError(
        AppointmentErrorCode.INVALID_PAYLOAD,
        `Invalid complete appointment payload: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;

    const tenantId = input.tenantId;
    const appointmentId = input.appointmentId;
    const aptRef = this.firestore.doc(firestorePaths.appointment(tenantId, appointmentId));

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const aptSnap = await transaction.get(aptRef);
      if (!aptSnap.exists) {
        throw new AppointmentError(
          AppointmentErrorCode.APPOINTMENT_NOT_FOUND,
          `Appointment ${appointmentId} was not found in tenant ${tenantId}.`
        );
      }

      const existingData = aptSnap.data();
      const appointment = AppointmentDocSchema.parse(existingData);

      await this.verifyActorAuthorization(
        actor,
        tenantId,
        ['OWNER', 'MANAGER', 'STAFF'],
        appointment.staffId
      );

      if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status)) {
        throw new AppointmentError(
          AppointmentErrorCode.TERMINAL_LIFECYCLE_STATE,
          `Cannot complete appointment ${appointmentId} in terminal status '${appointment.status}'.`
        );
      }

      if (appointment.status === 'PENDING') {
        throw new AppointmentError(
          AppointmentErrorCode.TERMINAL_LIFECYCLE_STATE,
          `Cannot complete an unconfirmed appointment in PENDING status.`
        );
      }

      const locks = await this.readScheduleLocksInTransaction(transaction, tenantId, [
        appointment.staffId,
      ]);

      const nowIso = new Date().toISOString();
      const completedAppointment: AppointmentDoc = {
        ...appointment,
        status: 'COMPLETED',
        notes: input.notes
          ? `${appointment.notes ? appointment.notes + ' | ' : ''}Completion notes: ${input.notes}`
          : appointment.notes,
        updatedAt: nowIso,
      };

      const auditLogId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.auditLog(tenantId, auditLogId));
      const actorUid = TrustedSystemContext.isTrusted(actor) ? 'SYSTEM' : actor.uid;

      const auditDoc = {
        id: auditLogId,
        tenantId,
        actorUid,
        action: 'COMPLETE_APPOINTMENT',
        targetAppointmentId: appointmentId,
        previousStatus: appointment.status,
        newStatus: 'COMPLETED',
        timestamp: nowIso,
      };

      this.commitScheduleLocksInTransaction(
        transaction,
        tenantId,
        locks,
        'COMPLETE',
        appointmentId,
        nowIso
      );

      transaction.set(aptRef, completedAppointment);
      transaction.set(auditRef, auditDoc);

      return {
        appointment: completedAppointment,
        auditLogId,
      };
    });
  }

  /**
   * Atomically marks an appointment as NO_SHOW within a Firestore transaction.
   *
   * Participates in the shared schedule lock protocol:
   * 1. Reads target appointment.
   * 2. Verifies appointment is in CONFIRMED status.
   * 3. Acquires schedule lock for assigned staff member in read phase.
   * 4. Updates appointment status to NO_SHOW (terminal & slot-releasing).
   * 5. Updates schedule lock and commits audit log atomically.
   */
  public async markNoShowAppointment(
    actor: AppointmentActor,
    rawInput: MarkNoShowAppointmentInput
  ): Promise<AppointmentMutationResult> {
    const parseResult = MarkNoShowAppointmentInputSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new AppointmentError(
        AppointmentErrorCode.INVALID_PAYLOAD,
        `Invalid mark no-show payload: ${parseResult.error.message}`,
        parseResult.error
      );
    }
    const input = parseResult.data;

    const tenantId = input.tenantId;
    const appointmentId = input.appointmentId;
    const aptRef = this.firestore.doc(firestorePaths.appointment(tenantId, appointmentId));

    return await this.firestore.runTransaction(async (transaction: Transaction) => {
      const aptSnap = await transaction.get(aptRef);
      if (!aptSnap.exists) {
        throw new AppointmentError(
          AppointmentErrorCode.APPOINTMENT_NOT_FOUND,
          `Appointment ${appointmentId} was not found in tenant ${tenantId}.`
        );
      }

      const existingData = aptSnap.data();
      const appointment = AppointmentDocSchema.parse(existingData);

      await this.verifyActorAuthorization(
        actor,
        tenantId,
        ['OWNER', 'MANAGER', 'STAFF'],
        appointment.staffId
      );

      if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status)) {
        throw new AppointmentError(
          AppointmentErrorCode.TERMINAL_LIFECYCLE_STATE,
          `Cannot mark NO_SHOW on appointment ${appointmentId} in terminal status '${appointment.status}'.`
        );
      }

      if (appointment.status !== 'CONFIRMED') {
        throw new AppointmentError(
          AppointmentErrorCode.TERMINAL_LIFECYCLE_STATE,
          `Only CONFIRMED appointments can be marked as NO_SHOW (current status: ${appointment.status}).`
        );
      }

      const locks = await this.readScheduleLocksInTransaction(transaction, tenantId, [
        appointment.staffId,
      ]);

      const nowIso = new Date().toISOString();
      const noShowAppointment: AppointmentDoc = {
        ...appointment,
        status: 'NO_SHOW',
        notes: input.notes
          ? `${appointment.notes ? appointment.notes + ' | ' : ''}NO_SHOW notes: ${input.notes}`
          : appointment.notes,
        updatedAt: nowIso,
      };

      const auditLogId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const auditRef = this.firestore.doc(firestorePaths.auditLog(tenantId, auditLogId));
      const actorUid = TrustedSystemContext.isTrusted(actor) ? 'SYSTEM' : actor.uid;

      const auditDoc = {
        id: auditLogId,
        tenantId,
        actorUid,
        action: 'NO_SHOW_APPOINTMENT',
        targetAppointmentId: appointmentId,
        previousStatus: appointment.status,
        newStatus: 'NO_SHOW',
        timestamp: nowIso,
      };

      this.commitScheduleLocksInTransaction(
        transaction,
        tenantId,
        locks,
        'NO_SHOW',
        appointmentId,
        nowIso
      );

      transaction.set(aptRef, noShowAppointment);
      transaction.set(auditRef, auditDoc);

      return {
        appointment: noShowAppointment,
        auditLogId,
      };
    });
  }
}
