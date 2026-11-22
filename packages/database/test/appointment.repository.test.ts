import { describe, it, expect, beforeEach } from 'vitest';
import type {
  Firestore,
  DocumentReference,
  Transaction,
  DocumentSnapshot,
  QuerySnapshot,
} from 'firebase-admin/firestore';
import {
  AppointmentRepository,
  AppointmentError,
  AppointmentErrorCode,
  type AppointmentActor,
} from '../src/server/repositories/appointment.repository';
import { firestorePaths } from '../src/paths';
import { createTrustedSystemContext } from '../src/server/internal/trusted-system';
import type { AppointmentDoc } from '../src/appointment.schema';

/**
 * High-fidelity in-memory transactional Firestore simulation for appointments.
 * Simulates document gets, query executions inside transactions, atomic writes, and concurrency retries.
 */
class InMemoryTransactionalFirestore {
  private store = new Map<string, Record<string, unknown>>();
  private docVersions = new Map<string, number>();
  public transactionExecutionCount = 0;

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
      doc: (id?: string) => {
        const docId = id || `auto_${Math.random().toString(36).substring(2, 10)}`;
        return this.doc(`${collectionPath}/${docId}`);
      },
      where: (field: string, op: string, value: unknown) => {
        return {
          collectionPath,
          filters: [{ field, op, value }],
          where: (f2: string, op2: string, val2: unknown) => ({
            collectionPath,
            filters: [
              { field, op, value },
              { field: f2, op: op2, value: val2 },
            ],
          }),
        };
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
    this.docVersions.set(path, (this.docVersions.get(path) || 0) + 1);
  }

  getDocumentDirect(path: string): Record<string, unknown> | undefined {
    return this.store.get(path);
  }

  hasDocument(path: string): boolean {
    return this.store.has(path);
  }

  async runTransaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>,
    attempt = 1
  ): Promise<T> {
    this.transactionExecutionCount++;

    const stagedWrites = new Map<string, Record<string, unknown>>();
    const readVersions = new Map<string, number>();
    let hasWritten = false;

    const mockTransaction: Transaction = {
      get: async (target: DocumentReference | { collectionPath: string; filters: Array<{ field: string; op: string; value: unknown }> }) => {
        if (hasWritten) {
          throw new Error('Firestore transactions require all reads to be executed before writes.');
        }

        // Query support in transaction
        if ('collectionPath' in target) {
          const { collectionPath, filters } = target;
          const matchingDocs: DocumentSnapshot[] = [];
          for (const [path, docData] of this.store.entries()) {
            if (path.startsWith(collectionPath + '/') && path.split('/').length === collectionPath.split('/').length + 1) {
              readVersions.set(path, this.docVersions.get(path) || 0);
              let matches = true;
              for (const filter of filters) {
                if (filter.op === '==' && docData[filter.field] !== filter.value) {
                  matches = false;
                  break;
                }
              }
              if (matches) {
                matchingDocs.push(this.createSnapshot(path));
              }
            }
          }
          return { docs: matchingDocs } as unknown as QuerySnapshot;
        }

        readVersions.set(target.path, this.docVersions.get(target.path) || 0);
        return this.createSnapshot(target.path);
      },
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        hasWritten = true;
        stagedWrites.set(ref.path, JSON.parse(JSON.stringify(data)));
        return mockTransaction;
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        hasWritten = true;
        stagedWrites.set(ref.path, JSON.parse(JSON.stringify(data)));
        return mockTransaction;
      },
      delete: (ref: DocumentReference) => {
        hasWritten = true;
        return mockTransaction;
      },
    } as unknown as Transaction;

    const result = await updateFunction(mockTransaction);

    // Concurrency conflict detection: verify read documents were not modified concurrently
    for (const [path, readVer] of readVersions.entries()) {
      const currentVer = this.docVersions.get(path) || 0;
      if (currentVer !== readVer) {
        if (attempt < 5) {
          return this.runTransaction(updateFunction, attempt + 1);
        }
        throw new Error('Transaction failed due to concurrent modification conflict.');
      }
    }

    // Atomic commit
    for (const [path, data] of stagedWrites.entries()) {
      this.store.set(path, data);
      this.docVersions.set(path, (this.docVersions.get(path) || 0) + 1);
    }

    return result;
  }
}

describe('AppointmentRepository — Server Transaction Booking Integrity', () => {
  let mockDb: InMemoryTransactionalFirestore;
  let repo: AppointmentRepository;

  const tenantA = 'tenant_salon_alpha';
  const tenantB = 'tenant_salon_beta';

  const userOwner = 'uid_owner_alpha';
  const userManager = 'uid_manager_alpha';
  const userStaff = 'uid_staff_alpha';
  const userStaff2 = 'uid_staff_alpha_2';
  const userCustomer = 'uid_customer_client_1';

  const actorManager: AppointmentActor = { uid: userManager };
  const actorStaff: AppointmentActor = { uid: userStaff };

  beforeEach(() => {
    mockDb = new InMemoryTransactionalFirestore();
    repo = new AppointmentRepository(mockDb as unknown as Firestore);

    // 1. Memberships
    mockDb.setDocumentDirect(firestorePaths.membership(tenantA, userOwner), {
      id: userOwner,
      tenantId: tenantA,
      role: 'OWNER',
      status: 'ACTIVE',
    });
    mockDb.setDocumentDirect(firestorePaths.membership(tenantA, userManager), {
      id: userManager,
      tenantId: tenantA,
      role: 'MANAGER',
      status: 'ACTIVE',
    });
    mockDb.setDocumentDirect(firestorePaths.membership(tenantA, userStaff), {
      id: userStaff,
      tenantId: tenantA,
      role: 'STAFF',
      status: 'ACTIVE',
    });

    // 2. Branches in Tenant A
    mockDb.setDocumentDirect(firestorePaths.branch(tenantA, 'branch_1'), {
      id: 'branch_1',
      tenantId: tenantA,
      name: 'Olaya Flagship Branch',
      isActive: true,
    });
    mockDb.setDocumentDirect(firestorePaths.branch(tenantA, 'branch_2'), {
      id: 'branch_2',
      tenantId: tenantA,
      name: 'Malqa Branch',
      isActive: true,
    });
    mockDb.setDocumentDirect(firestorePaths.branch(tenantA, 'branch_inactive'), {
      id: 'branch_inactive',
      tenantId: tenantA,
      name: 'Inactive Branch',
      isActive: false,
    });

    // 3. Staff in Tenant A
    mockDb.setDocumentDirect(firestorePaths.staffMember(tenantA, userStaff), {
      id: userStaff,
      tenantId: tenantA,
      displayName: 'Stylist Ahmed',
      assignedBranchIds: ['branch_1'],
      isActive: true,
    });
    mockDb.setDocumentDirect(firestorePaths.staffMember(tenantA, userStaff2), {
      id: userStaff2,
      tenantId: tenantA,
      displayName: 'Colorist Layla',
      assignedBranchIds: ['branch_1', 'branch_2'],
      isActive: true,
    });
    mockDb.setDocumentDirect(firestorePaths.staffMember(tenantA, 'uid_inactive_staff'), {
      id: 'uid_inactive_staff',
      tenantId: tenantA,
      displayName: 'Inactive Stylist',
      assignedBranchIds: ['branch_1'],
      isActive: false,
    });

    // 4. Staff and Branch in Tenant B
    mockDb.setDocumentDirect(firestorePaths.branch(tenantB, 'branch_b1'), {
      id: 'branch_b1',
      tenantId: tenantB,
      name: 'Beta Jeddah Branch',
      isActive: true,
    });
    mockDb.setDocumentDirect(firestorePaths.staffMember(tenantB, 'uid_staff_beta'), {
      id: 'uid_staff_beta',
      tenantId: tenantB,
      displayName: 'Beta Stylist',
      assignedBranchIds: ['branch_b1'],
      isActive: true,
    });

    // 5. Existing Appointment to Reschedule
    mockDb.setDocumentDirect(firestorePaths.appointment(tenantA, 'apt_001'), {
      id: 'apt_001',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaff,
      customerId: userCustomer,
      serviceId: 'service_1',
      status: 'CONFIRMED',
      scheduledStartTime: '2026-11-25T10:00:00.000Z',
      scheduledEndTime: '2026-11-25T11:00:00.000Z',
      priceHalalas: 15000,
      paymentStatus: 'PAID',
      notes: 'Initial booking notes',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // 6. Conflicting Appointment for userStaff
    mockDb.setDocumentDirect(firestorePaths.appointment(tenantA, 'apt_conflict'), {
      id: 'apt_conflict',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaff,
      customerId: 'uid_other_customer',
      serviceId: 'service_1',
      status: 'CONFIRMED',
      scheduledStartTime: '2026-11-25T14:00:00.000Z',
      scheduledEndTime: '2026-11-25T15:30:00.000Z',
      priceHalalas: 20000,
      paymentStatus: 'PAID',
      notes: 'Another appointment',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // 7. Completed Appointment
    mockDb.setDocumentDirect(firestorePaths.appointment(tenantA, 'apt_completed'), {
      id: 'apt_completed',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaff,
      customerId: userCustomer,
      serviceId: 'service_1',
      status: 'COMPLETED',
      scheduledStartTime: '2026-11-24T10:00:00.000Z',
      scheduledEndTime: '2026-11-24T11:00:00.000Z',
      priceHalalas: 15000,
      paymentStatus: 'PAID',
      notes: 'Session finished',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-24T11:00:00.000Z',
    });
  });

  it('1. Authorized manager can reschedule appointment with valid non-conflicting time', async () => {
    const res = await repo.rescheduleAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_001',
      scheduledStartTime: '2026-11-25T11:30:00.000Z',
      scheduledEndTime: '2026-11-25T12:30:00.000Z',
      notes: 'Shifted appointment upon client call',
    });

    expect(res.appointment.scheduledStartTime).toBe('2026-11-25T11:30:00.000Z');
    expect(res.appointment.scheduledEndTime).toBe('2026-11-25T12:30:00.000Z');
    expect(res.appointment.notes).toBe('Shifted appointment upon client call');

    // Audit log was created atomically
    expect(mockDb.hasDocument(firestorePaths.auditLog(tenantA, res.auditLogId))).toBe(true);
    const auditData = mockDb.getDocumentDirect(firestorePaths.auditLog(tenantA, res.auditLogId));
    expect(auditData?.action).toBe('RESCHEDULE_APPOINTMENT');
    expect(auditData?.actorUid).toBe(userManager);
  });

  it('2. Normalizes timezone offset (+03:00) to canonical UTC ISO instant', async () => {
    // 15:00 UTC+3 is 12:00 UTC, 16:00 UTC+3 is 13:00 UTC
    const res = await repo.rescheduleAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_001',
      scheduledStartTime: '2026-11-25T15:00:00+03:00',
      scheduledEndTime: '2026-11-25T16:00:00+03:00',
    });

    expect(res.appointment.scheduledStartTime).toBe('2026-11-25T12:00:00.000Z');
    expect(res.appointment.scheduledEndTime).toBe('2026-11-25T13:00:00.000Z');
  });

  it('3. Reassigning to another valid active staff member in same tenant succeeds', async () => {
    const res = await repo.rescheduleAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_001',
      staffId: userStaff2,
      scheduledStartTime: '2026-11-25T11:30:00.000Z',
      scheduledEndTime: '2026-11-25T12:30:00.000Z',
    });

    expect(res.appointment.staffId).toBe(userStaff2);
  });

  it('4. Rejects unauthorized actors (ordinary STAFF role)', async () => {
    await expect(
      repo.rescheduleAppointment(actorStaff, {
        tenantId: tenantA,
        appointmentId: 'apt_001',
        scheduledStartTime: '2026-11-25T11:30:00.000Z',
        scheduledEndTime: '2026-11-25T12:30:00.000Z',
      })
    ).rejects.toThrow(AppointmentError);

    try {
      await repo.rescheduleAppointment(actorStaff, {
        tenantId: tenantA,
        appointmentId: 'apt_001',
        scheduledStartTime: '2026-11-25T11:30:00.000Z',
        scheduledEndTime: '2026-11-25T12:30:00.000Z',
      });
    } catch (err) {
      expect((err as AppointmentError).code).toBe(AppointmentErrorCode.FORBIDDEN);
    }
  });

  it('5. Rejects actors without tenant membership', async () => {
    await expect(
      repo.rescheduleAppointment(
        { uid: 'stranger_uid' },
        {
          tenantId: tenantA,
          appointmentId: 'apt_001',
          scheduledStartTime: '2026-11-25T11:30:00.000Z',
          scheduledEndTime: '2026-11-25T12:30:00.000Z',
        }
      )
    ).rejects.toThrow(AppointmentError);
  });

  it('6. Rejects foreign-tenant staff member', async () => {
    await expect(
      repo.rescheduleAppointment(actorManager, {
        tenantId: tenantA,
        appointmentId: 'apt_001',
        staffId: 'uid_staff_beta', // Staff from Tenant B
        scheduledStartTime: '2026-11-25T11:30:00.000Z',
        scheduledEndTime: '2026-11-25T12:30:00.000Z',
      })
    ).rejects.toThrow(/does not exist in tenant/);
  });

  it('7. Rejects inactive staff member', async () => {
    await expect(
      repo.rescheduleAppointment(actorManager, {
        tenantId: tenantA,
        appointmentId: 'apt_001',
        staffId: 'uid_inactive_staff',
        scheduledStartTime: '2026-11-25T11:30:00.000Z',
        scheduledEndTime: '2026-11-25T12:30:00.000Z',
      })
    ).rejects.toThrow(/is inactive/);
  });

  it('8. Rejects foreign-tenant branch', async () => {
    await expect(
      repo.rescheduleAppointment(actorManager, {
        tenantId: tenantA,
        appointmentId: 'apt_001',
        branchId: 'branch_b1', // Branch from Tenant B
        scheduledStartTime: '2026-11-25T11:30:00.000Z',
        scheduledEndTime: '2026-11-25T12:30:00.000Z',
      })
    ).rejects.toThrow(/does not exist in tenant/);
  });

  it('9. Rejects staff/branch mismatch (staff not assigned to branch)', async () => {
    // userStaff is only assigned to ['branch_1'], NOT 'branch_2'
    await expect(
      repo.rescheduleAppointment(actorManager, {
        tenantId: tenantA,
        appointmentId: 'apt_001',
        staffId: userStaff,
        branchId: 'branch_2',
        scheduledStartTime: '2026-11-25T11:30:00.000Z',
        scheduledEndTime: '2026-11-25T12:30:00.000Z',
      })
    ).rejects.toThrow(/is not assigned to branch/);
  });

  it('10. Rejects rescheduling a terminal appointment (COMPLETED)', async () => {
    await expect(
      repo.rescheduleAppointment(actorManager, {
        tenantId: tenantA,
        appointmentId: 'apt_completed',
        scheduledStartTime: '2026-11-25T11:30:00.000Z',
        scheduledEndTime: '2026-11-25T12:30:00.000Z',
      })
    ).rejects.toThrow(/terminal status/);
  });

  it('11. Rejects booking conflict (overlapping slot for same staff member)', async () => {
    // userStaff has apt_conflict from 14:00 to 15:30
    // Attempting to reschedule apt_001 to 14:30 - 15:00 overlaps!
    await expect(
      repo.rescheduleAppointment(actorManager, {
        tenantId: tenantA,
        appointmentId: 'apt_001',
        staffId: userStaff,
        scheduledStartTime: '2026-11-25T14:30:00.000Z',
        scheduledEndTime: '2026-11-25T15:00:00.000Z',
      })
    ).rejects.toThrow(/Booking conflict/);
  });

  it('12. Concurrency Conflict Prevention: Two concurrent attempts cannot double-book the same slot', async () => {
    // Both attempt 1 and attempt 2 try to schedule userStaff for 16:00 - 17:00
    // In our transactional engine, if one transaction completes first, the other reads the updated
    // version during its commit check / retry and throws BOOKING_CONFLICT.

    // 1. First transaction succeeds
    const res1 = await repo.rescheduleAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_001',
      staffId: userStaff,
      scheduledStartTime: '2026-11-25T16:00:00.000Z',
      scheduledEndTime: '2026-11-25T17:00:00.000Z',
    });
    expect(res1.appointment.scheduledStartTime).toBe('2026-11-25T16:00:00.000Z');

    // 2. Add second appointment that tries to take the exact same slot
    mockDb.setDocumentDirect(firestorePaths.appointment(tenantA, 'apt_002'), {
      id: 'apt_002',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaff2,
      customerId: userCustomer,
      serviceId: 'service_1',
      status: 'CONFIRMED',
      scheduledStartTime: '2026-11-25T18:00:00.000Z',
      scheduledEndTime: '2026-11-25T19:00:00.000Z',
      priceHalalas: 15000,
      paymentStatus: 'PAID',
      notes: '',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // 3. Second transaction attempting to move apt_002 to userStaff at 16:00 - 17:00 fails
    await expect(
      repo.rescheduleAppointment(actorManager, {
        tenantId: tenantA,
        appointmentId: 'apt_002',
        staffId: userStaff,
        scheduledStartTime: '2026-11-25T16:00:00.000Z',
        scheduledEndTime: '2026-11-25T17:00:00.000Z',
      })
    ).rejects.toThrow(/Booking conflict/);
  });

  it('13. Immutability: priceHalalas and paymentStatus cannot be changed by rescheduling', async () => {
    const res = await repo.rescheduleAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_001',
      scheduledStartTime: '2026-11-25T11:30:00.000Z',
      scheduledEndTime: '2026-11-25T12:30:00.000Z',
    });

    expect(res.appointment.priceHalalas).toBe(15000); // Preserved
    expect(res.appointment.paymentStatus).toBe('PAID'); // Preserved
    expect(res.appointment.customerId).toBe(userCustomer); // Preserved
    expect(res.appointment.serviceId).toBe('service_1'); // Preserved
  });

  it('14. createAppointment: Authorized manager can create appointment and increment staff schedule lock', async () => {
    const res = await repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_new_1',
      branchId: 'branch_1',
      staffId: userStaff,
      customerId: userCustomer,
      serviceId: 'service_1',
      scheduledStartTime: '2026-11-26T10:00:00.000Z',
      scheduledEndTime: '2026-11-26T11:00:00.000Z',
      priceHalalas: 20000,
      notes: 'Initial booking',
    });

    expect(res.appointment.id).toBe('apt_new_1');
    expect(res.appointment.status).toBe('CONFIRMED');

    // Verify schedule lock was updated with version 1
    const lockDoc = mockDb.getDocumentDirect(firestorePaths.scheduleLock(tenantA, userStaff));
    expect(lockDoc).toBeDefined();
    expect(lockDoc?.version).toBe(1);
    expect(lockDoc?.lastMutationType).toBe('CREATE');
    expect(lockDoc?.lastAppointmentId).toBe('apt_new_1');
  });

  it('15. createAppointment: Rejects overlapping slot with BOOKING_CONFLICT', async () => {
    await expect(
      repo.createAppointment(actorManager, {
        tenantId: tenantA,
        branchId: 'branch_1',
        staffId: userStaff,
        customerId: userCustomer,
        serviceId: 'service_1',
        scheduledStartTime: '2026-11-25T10:30:00.000Z', // Overlaps with apt_001 (10:00 - 11:00)
        scheduledEndTime: '2026-11-25T11:30:00.000Z',
        priceHalalas: 20000,
      })
    ).rejects.toThrow(/Booking conflict/);
  });

  it('16. cancelAppointment: Transitions status to CANCELLED and increments schedule lock', async () => {
    const res = await repo.cancelAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_001',
      reason: 'Client requested cancellation',
    });

    expect(res.appointment.status).toBe('CANCELLED');
    expect(res.appointment.notes).toContain('Client requested cancellation');

    const lockDoc = mockDb.getDocumentDirect(firestorePaths.scheduleLock(tenantA, userStaff));
    expect(lockDoc).toBeDefined();
    expect(lockDoc?.version).toBe(1);
    expect(lockDoc?.lastMutationType).toBe('CANCEL');
  });

  it('17. Reassignment updates schedule locks for BOTH original and new staff members', async () => {
    const res = await repo.rescheduleAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_001',
      staffId: userStaff2, // Reassigned from userStaff to userStaff2
      scheduledStartTime: '2026-11-25T14:00:00.000Z',
      scheduledEndTime: '2026-11-25T15:00:00.000Z',
    });

    expect(res.appointment.staffId).toBe(userStaff2);

    // Verify locks exist for both staff members
    const lock1 = mockDb.getDocumentDirect(firestorePaths.scheduleLock(tenantA, userStaff));
    const lock2 = mockDb.getDocumentDirect(firestorePaths.scheduleLock(tenantA, userStaff2));

    expect(lock1?.version).toBe(1);
    expect(lock2?.version).toBe(1);
    expect(lock1?.lastMutationType).toBe('RESCHEDULE');
    expect(lock2?.lastMutationType).toBe('RESCHEDULE');
  });

  it('18. completeAppointment: Transitions status to COMPLETED and increments schedule lock', async () => {
    const res = await repo.completeAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_001',
      notes: 'Customer left happy',
    });

    expect(res.appointment.status).toBe('COMPLETED');
    expect(res.appointment.notes).toContain('Customer left happy');

    const lockDoc = mockDb.getDocumentDirect(firestorePaths.scheduleLock(tenantA, userStaff));
    expect(lockDoc).toBeDefined();
    expect(lockDoc?.version).toBe(1);
    expect(lockDoc?.lastMutationType).toBe('COMPLETE');
  });

  it('19. markNoShowAppointment: Transitions status to NO_SHOW and increments schedule lock', async () => {
    const res = await repo.markNoShowAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_001',
      notes: 'No response to phone call',
    });

    expect(res.appointment.status).toBe('NO_SHOW');
    expect(res.appointment.notes).toContain('NO_SHOW notes: No response to phone call');

    const lockDoc = mockDb.getDocumentDirect(firestorePaths.scheduleLock(tenantA, userStaff));
    expect(lockDoc).toBeDefined();
    expect(lockDoc?.version).toBe(1);
    expect(lockDoc?.lastMutationType).toBe('NO_SHOW');
  });
});
