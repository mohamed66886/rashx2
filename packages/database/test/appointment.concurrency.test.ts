import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { initializeApp, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import {
  AppointmentRepository,
  AppointmentError,
  AppointmentErrorCode,
  type AppointmentActor,
} from '../src/server/repositories/appointment.repository';
import { firestorePaths } from '../src/paths';

/**
 * RASHX — Gate B.2.5 Concurrency Integrity & Schedule Lock Test Suite
 *
 * Exercises real concurrent Firestore transactions against the live Cloud Firestore Emulator.
 * Proves that:
 * 1. Overlapping concurrent bookings for the same staff member contend on the shared schedule lock.
 * 2. Exactly one booking commits and the other is rejected with BOOKING_CONFLICT on OCC retry.
 * 3. Non-overlapping bookings for the same staff member can both commit.
 * 4. Concurrent bookings for different staff members execute in parallel without lock contention.
 * 5. Reassignments protect both original and new staff schedules using deterministic lock ordering.
 * 6. Failed transactions leave zero partial mutations (atomic rollback).
 * 7. Tenant isolation prevents cross-tenant schedule lock contention.
 * 8. Firestore Security Rules deny direct client access to schedule locks.
 */

const PROJECT_ID = 'demo-rashx';
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
process.env.FIRESTORE_EMULATOR_HOST = EMULATOR_HOST;

const REST_BASE_URL = `http://${EMULATOR_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function clearEmulatorData(): Promise<void> {
  const url = `http://${EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
  await fetch(url, { method: 'DELETE' });
}

function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  function toFirestoreValue(val: unknown): Record<string, unknown> {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'string') return { stringValue: val };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return { integerValue: String(val) };
      return { doubleValue: val };
    }
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map(toFirestoreValue) } };
    }
    if (typeof val === 'object') {
      const fields: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val)) {
        fields[k] = toFirestoreValue(v);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

function createMockToken(uid: string, claims: Record<string, unknown> = {}): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: uid,
      user_id: uid,
      email: `${uid}@rashx.sa`,
      aud: PROJECT_ID,
      iss: `https://securetoken.google.com/${PROJECT_ID}`,
      ...claims,
    })
  ).toString('base64url');
  return `${header}.${payload}.`;
}

describe('Appointment Concurrency & Shared Schedule Lock (Real Firestore Emulator)', { timeout: 25000 }, () => {
  let adminDb: Firestore;
  let repo: AppointmentRepository;

  const tenantA = 'tenant_salon_olaya';
  const tenantB = 'tenant_spa_malaz';

  const userManager = 'user_mgr_fatima';
  const userStaffSara = 'staff_sara';
  const userStaffNoura = 'staff_noura';
  const userCustomer = 'user_cust_reem';

  const actorManager: AppointmentActor = {
    uid: userManager,
  };

  beforeAll(async () => {
    vi.setConfig({ testTimeout: 20000 });
    const existingApps = getApps();
    const app =
      existingApps.find((a) => a.name === 'concurrency-test-app') ||
      initializeApp({ projectId: PROJECT_ID }, 'concurrency-test-app');
    adminDb = getFirestore(app);
    repo = new AppointmentRepository(adminDb);
  });

  afterAll(async () => {
    const app = getApps().find((a) => a.name === 'concurrency-test-app');
    if (app) {
      await deleteApp(app);
    }
  });

  beforeEach(async () => {
    await clearEmulatorData();

    // 1. Seed Tenant A
    await adminDb.doc(firestorePaths.tenant(tenantA)).set({
      id: tenantA,
      name: 'Olaya Salon',
      slug: 'olaya-salon',
      status: 'ACTIVE',
      isPublished: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    // 2. Seed Manager Membership in Tenant A
    await adminDb.doc(firestorePaths.membership(tenantA, userManager)).set({
      id: userManager,
      tenantId: tenantA,
      userId: userManager,
      role: 'MANAGER',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    // 3. Seed Branches in Tenant A
    await adminDb.doc(firestorePaths.branch(tenantA, 'branch_1')).set({
      id: 'branch_1',
      tenantId: tenantA,
      name: 'Main Branch',
      city: 'Riyadh',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    // 4. Seed Staff Members in Tenant A
    await adminDb.doc(firestorePaths.staffMember(tenantA, userStaffSara)).set({
      id: userStaffSara,
      tenantId: tenantA,
      displayName: 'Sara Stylist',
      assignedBranchIds: ['branch_1'],
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    await adminDb.doc(firestorePaths.staffMember(tenantA, userStaffNoura)).set({
      id: userStaffNoura,
      tenantId: tenantA,
      displayName: 'Noura Colorist',
      assignedBranchIds: ['branch_1'],
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('1 & 2 & 3. Two concurrent transactions for the same staff with overlapping intervals: exactly one succeeds and one fails with BOOKING_CONFLICT', async () => {
    // Both transactions attempt to book Sara during overlapping intervals:
    // Slot 1: 10:00 - 11:00 UTC
    // Slot 2: 10:30 - 11:30 UTC
    const promise1 = repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_slot_1',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-01T10:00:00.000Z',
      scheduledEndTime: '2026-12-01T11:00:00.000Z',
      priceHalalas: 15000,
    });

    const promise2 = repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_slot_2',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-01T10:30:00.000Z',
      scheduledEndTime: '2026-12-01T11:30:00.000Z',
      priceHalalas: 15000,
    });

    const results = await Promise.allSettled([promise1, promise2]);

    const fulfilled = results.filter(
      (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled'
    );
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected'
    );

    // Exactly one must succeed
    expect(fulfilled.length).toBe(1);
    expect(fulfilled[0].value.appointment.status).toBe('CONFIRMED');

    // Exactly one must be rejected with BOOKING_CONFLICT
    expect(rejected.length).toBe(1);
    const error = rejected[0].reason as AppointmentError;
    expect(error).toBeInstanceOf(AppointmentError);
    expect(error.code).toBe(AppointmentErrorCode.BOOKING_CONFLICT);

    // Verify schedule lock version was incremented to 1 by the winning transaction
    const lockSnap = await adminDb
      .doc(firestorePaths.scheduleLock(tenantA, userStaffSara))
      .get();
    expect(lockSnap.exists).toBe(true);
    expect(lockSnap.data()?.version).toBe(1);
  });

  it('4. Two non-overlapping concurrent bookings for the same staff member can both succeed', async () => {
    // Slot A: 12:00 - 13:00 UTC
    // Slot B: 13:00 - 14:00 UTC
    const promiseA = repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_seq_a',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-01T12:00:00.000Z',
      scheduledEndTime: '2026-12-01T13:00:00.000Z',
      priceHalalas: 15000,
    });

    const promiseB = repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_seq_b',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-01T13:00:00.000Z',
      scheduledEndTime: '2026-12-01T14:00:00.000Z',
      priceHalalas: 15000,
    });

    const results = await Promise.allSettled([promiseA, promiseB]);

    const fulfilled = results.filter(
      (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled'
    );
    expect(fulfilled.length).toBe(2);

    // Both appointments exist in Firestore
    const snapA = await adminDb.doc(firestorePaths.appointment(tenantA, 'apt_seq_a')).get();
    const snapB = await adminDb.doc(firestorePaths.appointment(tenantA, 'apt_seq_b')).get();
    expect(snapA.exists).toBe(true);
    expect(snapB.exists).toBe(true);

    // Schedule lock version must reflect two sequential commits
    const lockSnap = await adminDb
      .doc(firestorePaths.scheduleLock(tenantA, userStaffSara))
      .get();
    expect(lockSnap.data()?.version).toBe(2);
  });

  it('5. Concurrent bookings for different staff members execute in parallel without unnecessary contention', async () => {
    // Both Sara and Noura are booked for the EXACT same time slot: 15:00 - 16:00 UTC
    const promiseSara = repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_sara_slot',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-01T15:00:00.000Z',
      scheduledEndTime: '2026-12-01T16:00:00.000Z',
      priceHalalas: 15000,
    });

    const promiseNoura = repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_noura_slot',
      branchId: 'branch_1',
      staffId: userStaffNoura,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-01T15:00:00.000Z',
      scheduledEndTime: '2026-12-01T16:00:00.000Z',
      priceHalalas: 15000,
    });

    const [resSara, resNoura] = await Promise.all([promiseSara, promiseNoura]);

    expect(resSara.appointment.staffId).toBe(userStaffSara);
    expect(resNoura.appointment.staffId).toBe(userStaffNoura);

    // Each staff member has their own independent lock at version 1
    const lockSara = await adminDb
      .doc(firestorePaths.scheduleLock(tenantA, userStaffSara))
      .get();
    const lockNoura = await adminDb
      .doc(firestorePaths.scheduleLock(tenantA, userStaffNoura))
      .get();

    expect(lockSara.data()?.version).toBe(1);
    expect(lockNoura.data()?.version).toBe(1);
  });

  it('6. Reassignment protects both old and new staff schedules using deterministic sorted lock ordering', async () => {
    // 1. Create appointment for Sara
    await repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_reassign',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-01T17:00:00.000Z',
      scheduledEndTime: '2026-12-01T18:00:00.000Z',
      priceHalalas: 15000,
    });

    // 2. Reassign from Sara to Noura
    const res = await repo.rescheduleAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_reassign',
      staffId: userStaffNoura,
      scheduledStartTime: '2026-12-01T17:00:00.000Z',
      scheduledEndTime: '2026-12-01T18:00:00.000Z',
    });

    expect(res.appointment.staffId).toBe(userStaffNoura);

    // Both locks must be updated
    const lockSara = await adminDb
      .doc(firestorePaths.scheduleLock(tenantA, userStaffSara))
      .get();
    const lockNoura = await adminDb
      .doc(firestorePaths.scheduleLock(tenantA, userStaffNoura))
      .get();

    expect(lockSara.data()?.version).toBe(2); // 1 create + 1 reschedule
    expect(lockNoura.data()?.version).toBe(1); // 1 reschedule
    expect(lockSara.data()?.lastMutationType).toBe('RESCHEDULE');
    expect(lockNoura.data()?.lastMutationType).toBe('RESCHEDULE');
  });

  it('7 & 8. Failed transaction leaves no partial appointment, lock mutation, or audit log', async () => {
    // Seed an existing appointment for Sara
    await repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_existing',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-02T10:00:00.000Z',
      scheduledEndTime: '2026-12-02T11:00:00.000Z',
      priceHalalas: 15000,
    });

    const lockBefore = (
      await adminDb.doc(firestorePaths.scheduleLock(tenantA, userStaffSara)).get()
    ).data();

    // Attempt to book conflicting appointment
    await expect(
      repo.createAppointment(actorManager, {
        tenantId: tenantA,
        appointmentId: 'apt_should_fail',
        branchId: 'branch_1',
        staffId: userStaffSara,
        customerId: userCustomer,
        serviceId: 'srv_haircut',
        scheduledStartTime: '2026-12-02T10:30:00.000Z',
        scheduledEndTime: '2026-12-02T11:30:00.000Z',
        priceHalalas: 15000,
      })
    ).rejects.toThrow(/Booking conflict/);

    // Verify appointment was NOT created
    const failedAptSnap = await adminDb
      .doc(firestorePaths.appointment(tenantA, 'apt_should_fail'))
      .get();
    expect(failedAptSnap.exists).toBe(false);

    // Verify schedule lock was NOT modified by the failed transaction
    const lockAfter = (
      await adminDb.doc(firestorePaths.scheduleLock(tenantA, userStaffSara)).get()
    ).data();
    expect(lockAfter?.version).toBe(lockBefore?.version);

    // Verify no audit log was created for the failed appointment
    const auditQuery = await adminDb
      .collection(firestorePaths.auditLogs(tenantA))
      .where('targetAppointmentId', '==', 'apt_should_fail')
      .get();
    expect(auditQuery.empty).toBe(true);
  });

  it('9. Cross-tenant lock access is isolated: operations in Tenant A cannot touch Tenant B schedule locks', async () => {
    // Seed Tenant B
    await adminDb.doc(firestorePaths.tenant(tenantB)).set({
      id: tenantB,
      name: 'Malaz Spa',
      status: 'ACTIVE',
      isPublished: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    await adminDb.doc(firestorePaths.scheduleLock(tenantB, userStaffSara)).set({
      id: userStaffSara,
      tenantId: tenantB,
      staffId: userStaffSara,
      version: 99,
      lastMutationType: 'CREATE',
      lastAppointmentId: 'apt_foreign',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    // Create appointment in Tenant A
    await repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_tenant_a',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-03T10:00:00.000Z',
      scheduledEndTime: '2026-12-03T11:00:00.000Z',
      priceHalalas: 15000,
    });

    // Tenant B's schedule lock must remain untouched
    const lockB = await adminDb
      .doc(firestorePaths.scheduleLock(tenantB, userStaffSara))
      .get();
    expect(lockB.data()?.version).toBe(99);

    // Tenant A's schedule lock is independent
    const lockA = await adminDb
      .doc(firestorePaths.scheduleLock(tenantA, userStaffSara))
      .get();
    expect(lockA.data()?.version).toBe(1);
  });

  it('10. Firestore Security Rules: Direct client reads and writes to schedule locks are STRICTLY REJECTED (HTTP 403)', async () => {
    const userToken = createMockToken(userManager);
    const lockUrl = `${REST_BASE_URL}/tenants/${tenantA}/schedule_locks/${userStaffSara}`;

    // 1. Direct client read attempt
    const readRes = await fetch(lockUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(readRes.status).toBe(403);

    // 2. Direct client write attempt
    const writeRes = await fetch(lockUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        fields: toFirestoreFields({
          version: 999,
        }),
      }),
    });
    expect(writeRes.status).toBe(403);
  });

  // =========================================================================
  // GATE B.2.5 LIFECYCLE MUTATION LOCK AUDIT TESTS
  // =========================================================================

  it('11. Direct client cancellation is strictly DENIED by security rules (HTTP 403)', async () => {
    // Seed an appointment in CONFIRMED state
    await adminDb.doc(firestorePaths.appointment(tenantA, 'apt_direct_cancel')).set({
      id: 'apt_direct_cancel',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      status: 'CONFIRMED',
      scheduledStartTime: '2026-12-05T10:00:00.000Z',
      scheduledEndTime: '2026-12-05T11:00:00.000Z',
      priceHalalas: 15000,
      paymentStatus: 'PAID',
      notes: '',
      createdAt: '2026-12-01T00:00:00.000Z',
      updatedAt: '2026-12-01T00:00:00.000Z',
    });

    const userToken = createMockToken(userManager);
    const aptUrl = `${REST_BASE_URL}/tenants/${tenantA}/appointments/apt_direct_cancel`;

    // Attempt direct client write to CANCELLED
    const res = await fetch(aptUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: 'apt_direct_cancel',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffSara,
          customerId: userCustomer,
          serviceId: 'srv_haircut',
          scheduledStartTime: '2026-12-05T10:00:00.000Z',
          scheduledEndTime: '2026-12-05T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-12-01T00:00:00.000Z',
          status: 'CANCELLED', // Forbidden direct lifecycle mutation
          notes: 'Direct client cancellation attempt',
        }),
      }),
    });

    expect(res.status).toBe(403);
  });

  it('12. Direct client completion is strictly DENIED by security rules (HTTP 403)', async () => {
    await adminDb.doc(firestorePaths.appointment(tenantA, 'apt_direct_complete')).set({
      id: 'apt_direct_complete',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      status: 'CONFIRMED',
      scheduledStartTime: '2026-12-05T12:00:00.000Z',
      scheduledEndTime: '2026-12-05T13:00:00.000Z',
      priceHalalas: 15000,
      paymentStatus: 'PAID',
      notes: '',
      createdAt: '2026-12-01T00:00:00.000Z',
      updatedAt: '2026-12-01T00:00:00.000Z',
    });

    const staffToken = createMockToken(userStaffSara);
    const aptUrl = `${REST_BASE_URL}/tenants/${tenantA}/appointments/apt_direct_complete`;

    // Attempt direct client write to COMPLETED
    const res = await fetch(aptUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: 'apt_direct_complete',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffSara,
          customerId: userCustomer,
          serviceId: 'srv_haircut',
          scheduledStartTime: '2026-12-05T12:00:00.000Z',
          scheduledEndTime: '2026-12-05T13:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-12-01T00:00:00.000Z',
          status: 'COMPLETED', // Forbidden direct completion
          notes: 'Direct client completion attempt',
        }),
      }),
    });

    expect(res.status).toBe(403);
  });

  it('13. Direct client NO_SHOW is strictly DENIED by security rules (HTTP 403)', async () => {
    await adminDb.doc(firestorePaths.appointment(tenantA, 'apt_direct_noshow')).set({
      id: 'apt_direct_noshow',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      status: 'CONFIRMED',
      scheduledStartTime: '2026-12-05T14:00:00.000Z',
      scheduledEndTime: '2026-12-05T15:00:00.000Z',
      priceHalalas: 15000,
      paymentStatus: 'PAID',
      notes: '',
      createdAt: '2026-12-01T00:00:00.000Z',
      updatedAt: '2026-12-01T00:00:00.000Z',
    });

    const userToken = createMockToken(userManager);
    const aptUrl = `${REST_BASE_URL}/tenants/${tenantA}/appointments/apt_direct_noshow`;

    // Attempt direct client write to NO_SHOW
    const res = await fetch(aptUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: 'apt_direct_noshow',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffSara,
          customerId: userCustomer,
          serviceId: 'srv_haircut',
          scheduledStartTime: '2026-12-05T14:00:00.000Z',
          scheduledEndTime: '2026-12-05T15:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-12-01T00:00:00.000Z',
          status: 'NO_SHOW', // Forbidden direct no-show
          notes: 'Direct client no-show attempt',
        }),
      }),
    });

    expect(res.status).toBe(403);
  });

  it('14. Authorized repository cancellation succeeds through the shared schedule lock', async () => {
    await repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_repo_cancel',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-06T10:00:00.000Z',
      scheduledEndTime: '2026-12-06T11:00:00.000Z',
      priceHalalas: 15000,
    });

    const cancelRes = await repo.cancelAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_repo_cancel',
      reason: 'Customer rescheduled trip',
    });

    expect(cancelRes.appointment.status).toBe('CANCELLED');
    expect(cancelRes.appointment.notes).toContain('Customer rescheduled trip');

    // Verify schedule lock version was incremented to 2 (1 create + 1 cancel)
    const lockSnap = await adminDb
      .doc(firestorePaths.scheduleLock(tenantA, userStaffSara))
      .get();
    expect(lockSnap.data()?.version).toBe(2);
    expect(lockSnap.data()?.lastMutationType).toBe('CANCEL');
    expect(lockSnap.data()?.lastAppointmentId).toBe('apt_repo_cancel');

    // Verify audit log exists
    const auditSnap = await adminDb
      .doc(firestorePaths.auditLog(tenantA, cancelRes.auditLogId))
      .get();
    expect(auditSnap.exists).toBe(true);
    expect(auditSnap.data()?.action).toBe('CANCEL_APPOINTMENT');
  });

  it('15. Concurrent cancellation and booking for the same staff member are serialized correctly by schedule lock', async () => {
    // Seed existing appointment for Sara from 10:00 to 11:00
    await repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_existing_slot',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-07T10:00:00.000Z',
      scheduledEndTime: '2026-12-07T11:00:00.000Z',
      priceHalalas: 15000,
    });

    // Run cancellation of apt_existing_slot and concurrent booking of the exact same slot
    const cancelPromise = repo.cancelAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_existing_slot',
      reason: 'Slot opened up',
    });

    const newBookingPromise = repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_competing_booking',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-07T10:00:00.000Z',
      scheduledEndTime: '2026-12-07T11:00:00.000Z',
      priceHalalas: 15000,
    });

    const results = await Promise.allSettled([cancelPromise, newBookingPromise]);

    // Cancellation must ALWAYS succeed
    const cancelResult = results[0];
    expect(cancelResult.status).toBe('fulfilled');
    if (cancelResult.status === 'fulfilled') {
      expect(cancelResult.value.appointment.status).toBe('CANCELLED');
    }

    // Competing booking either:
    // A) Committed after cancellation retry (fulfilled with CONFIRMED)
    // B) Failed with BOOKING_CONFLICT if evaluated before cancellation committed
    const bookingResult = results[1];
    if (bookingResult.status === 'fulfilled') {
      expect(bookingResult.value.appointment.status).toBe('CONFIRMED');
    } else {
      expect((bookingResult.reason as AppointmentError).code).toBe(
        AppointmentErrorCode.BOOKING_CONFLICT
      );
    }

    // In no case are both active at the same time: verify database state
    const apt1 = (
      await adminDb.doc(firestorePaths.appointment(tenantA, 'apt_existing_slot')).get()
    ).data();
    expect(apt1?.status).toBe('CANCELLED');
  });

  it('16. A failed cancellation leaves appointment, lock, and audit state completely unchanged', async () => {
    // 1. Create appointment
    await repo.createAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_cancel_fail_test',
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      scheduledStartTime: '2026-12-08T10:00:00.000Z',
      scheduledEndTime: '2026-12-08T11:00:00.000Z',
      priceHalalas: 15000,
    });

    // 2. Mark completed
    await repo.completeAppointment(actorManager, {
      tenantId: tenantA,
      appointmentId: 'apt_cancel_fail_test',
    });

    const lockBefore = (
      await adminDb.doc(firestorePaths.scheduleLock(tenantA, userStaffSara)).get()
    ).data();

    // 3. Attempting to cancel an already COMPLETED appointment must fail
    await expect(
      repo.cancelAppointment(actorManager, {
        tenantId: tenantA,
        appointmentId: 'apt_cancel_fail_test',
      })
    ).rejects.toThrow(/terminal status 'COMPLETED'/);

    // Verify appointment status remains COMPLETED
    const aptSnap = await adminDb
      .doc(firestorePaths.appointment(tenantA, 'apt_cancel_fail_test'))
      .get();
    expect(aptSnap.data()?.status).toBe('COMPLETED');

    // Verify lock version was NOT modified
    const lockAfter = (
      await adminDb.doc(firestorePaths.scheduleLock(tenantA, userStaffSara)).get()
    ).data();
    expect(lockAfter?.version).toBe(lockBefore?.version);

    // Verify no CANCEL audit log was created
    const auditQuery = await adminDb
      .collection(firestorePaths.auditLogs(tenantA))
      .where('action', '==', 'CANCEL_APPOINTMENT')
      .where('targetAppointmentId', '==', 'apt_cancel_fail_test')
      .get();
    expect(auditQuery.empty).toBe(true);
  });

  it('17. Existing safe operational status updates (CONFIRMED -> IN_PROGRESS) with authentic server timestamp still succeed', async () => {
    await adminDb.doc(firestorePaths.appointment(tenantA, 'apt_safe_op')).set({
      id: 'apt_safe_op',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaffSara,
      customerId: userCustomer,
      serviceId: 'srv_haircut',
      status: 'CONFIRMED',
      scheduledStartTime: '2026-12-09T10:00:00.000Z',
      scheduledEndTime: '2026-12-09T11:00:00.000Z',
      priceHalalas: 15000,
      paymentStatus: 'PAID',
      notes: '',
      createdAt: '2026-12-01T00:00:00.000Z',
      updatedAt: '2026-12-01T00:00:00.000Z',
    });

    const userToken = createMockToken(userManager);
    const aptUrl = `${REST_BASE_URL}/tenants/${tenantA}/appointments/apt_safe_op?updateMask.fieldPaths=status&updateMask.fieldPaths=notes&updateMask.fieldPaths=updatedAt`;

    const res = await fetch(aptUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        fields: {
          ...toFirestoreFields({
            status: 'IN_PROGRESS',
            notes: 'Client seated, starting service.',
          }),
          updatedAt: {
            // Evaluates to request.time in Firestore
          },
        },
      }),
    });

    // In REST, FieldValue.serverTimestamp() via REST requires transforms or writeDocWithServerTimestamp.
    // Let's test with writeDocWithServerTimestamp equivalent via REST
    const transformUrl = `${REST_BASE_URL}:commit`;
    const commitRes = await fetch(transformUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: `projects/${PROJECT_ID}/databases/(default)/documents/tenants/${tenantA}/appointments/apt_safe_op`,
              fields: toFirestoreFields({
                id: 'apt_safe_op',
                tenantId: tenantA,
                branchId: 'branch_1',
                staffId: userStaffSara,
                customerId: userCustomer,
                serviceId: 'srv_haircut',
                scheduledStartTime: '2026-12-09T10:00:00.000Z',
                scheduledEndTime: '2026-12-09T11:00:00.000Z',
                priceHalalas: 15000,
                paymentStatus: 'PAID',
                createdAt: '2026-12-01T00:00:00.000Z',
                status: 'IN_PROGRESS',
                notes: 'Client seated, starting service.',
              }),
            },
            updateTransforms: [
              {
                fieldPath: 'updatedAt',
                setToServerValue: 'REQUEST_TIME',
              },
            ],
          },
        ],
      }),
    });

    expect(commitRes.status).toBe(200);

    // Verify status was updated in Firestore
    const updatedSnap = await adminDb
      .doc(firestorePaths.appointment(tenantA, 'apt_safe_op'))
      .get();
    expect(updatedSnap.data()?.status).toBe('IN_PROGRESS');
    expect(updatedSnap.data()?.notes).toBe('Client seated, starting service.');
  });
});
