import { describe, it, expect, beforeEach } from 'vitest';

/**
 * RASHX — Gate B.2.5 Final Security Integrity Verification Test Suite
 *
 * Exercises Cloud Firestore Security Rules against the live Firestore Emulator.
 * Validates:
 * 1. Default-deny on all unmatched paths
 * 2. Strict least-privilege tenant root privacy (OWNER only)
 * 3. Separation of operational staff vs self-service compensation vs confidential HR PII
 * 4. Authoritative RBAC roster isolation (Staff cannot enumerate other members)
 * 5. Appointment role permissions, strict status progression, & referential integrity
 * 6. Customer & User self-profile allowlists (protection of disabled status, roles, loyalty)
 * 7. Real query authorization tests (scoped staff queries, customer queries, public constraints, collectionGroup)
 * 8. Immutability of financial, audit, tenant ownership, and slug registries
 */

const PROJECT_ID = 'demo-rashx';
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const BASE_URL = `http://${EMULATOR_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Serializes standard JavaScript objects into Firestore REST document field representations.
 */
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

function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

/**
 * Generates an unsigned mock JWT accepted by the Cloud Firestore Emulator.
 */
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

/**
 * Seeds a document directly into the Firestore Emulator with admin privilege (bypasses security rules).
 */
async function seedDoc(documentPath: string, data: Record<string, unknown>): Promise<void> {
  const url = `${BASE_URL}/${documentPath}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer owner',
    },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to seed ${documentPath} (${res.status}): ${errText}`);
  }
}

/**
 * Clears all data from the Firestore Emulator instance.
 */
async function clearEmulatorData(): Promise<void> {
  const url = `http://${EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
  await fetch(url, { method: 'DELETE' });
}

/**
 * Reads a document subject to Firestore Security Rules.
 */
async function readDoc(documentPath: string, uid?: string | null, claims?: Record<string, unknown>) {
  const headers: Record<string, string> = {};
  if (uid) {
    headers['Authorization'] = `Bearer ${createMockToken(uid, claims)}`;
  }
  const res = await fetch(`${BASE_URL}/${documentPath}`, {
    method: 'GET',
    headers,
  });
  return { status: res.status, ok: res.ok };
}

/**
 * Writes (patches) a document subject to Firestore Security Rules.
 */
async function writeDoc(
  documentPath: string,
  data: Record<string, unknown>,
  uid?: string | null,
  claims?: Record<string, unknown>
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (uid) {
    headers['Authorization'] = `Bearer ${createMockToken(uid, claims)}`;
  }
  const res = await fetch(`${BASE_URL}/${documentPath}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
  return { status: res.status, ok: res.ok };
}

/**
 * Writes to a document subject to Firestore Security Rules with an authentic server timestamp.
 */
async function writeDocWithServerTimestamp(
  documentPath: string,
  data: Record<string, unknown>,
  uid?: string | null,
  claims?: Record<string, unknown>
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (uid) {
    headers['Authorization'] = `Bearer ${createMockToken(uid, claims)}`;
  }
  const fullDocPath = `projects/${PROJECT_ID}/databases/(default)/documents/${documentPath}`;
  const commitUrl = `http://${EMULATOR_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`;

  const fieldsData = { ...data };
  delete fieldsData.updatedAt;

  const res = await fetch(commitUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: fullDocPath,
            fields: toFirestoreFields(fieldsData),
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
  return { status: res.status, ok: res.ok };
}

/**
 * Deletes a document subject to Firestore Security Rules.
 */
async function deleteDoc(documentPath: string, uid?: string | null, claims?: Record<string, unknown>) {
  const headers: Record<string, string> = {};
  if (uid) {
    headers['Authorization'] = `Bearer ${createMockToken(uid, claims)}`;
  }
  const res = await fetch(`${BASE_URL}/${documentPath}`, {
    method: 'DELETE',
    headers,
  });
  return { status: res.status, ok: res.ok };
}

/**
 * Queries a collection subject to Firestore Security Rules.
 */
async function queryCollection(
  parentPath: string | null,
  collectionId: string,
  uid?: string | null,
  filters?: Array<{ field: string; op: string; value: unknown }>,
  allDescendants = false
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (uid) {
    headers['Authorization'] = `Bearer ${createMockToken(uid)}`;
  }
  const url = parentPath ? `${BASE_URL}/${parentPath}:runQuery` : `${BASE_URL}:runQuery`;

  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId, allDescendants }],
  };

  if (filters && filters.length > 0) {
    if (filters.length === 1) {
      structuredQuery.where = {
        fieldFilter: {
          field: { fieldPath: filters[0].field },
          op: filters[0].op,
          value: toFirestoreValue(filters[0].value),
        },
      };
    } else {
      structuredQuery.where = {
        compositeFilter: {
          op: 'AND',
          filters: filters.map((f) => ({
            fieldFilter: {
              field: { fieldPath: f.field },
              op: f.op,
              value: toFirestoreValue(f.value),
            },
          })),
        },
      };
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ structuredQuery }),
  });
  return { status: res.status, ok: res.ok };
}

// -----------------------------------------------------------------------------
// TEST SUITE: GATE B.2.5 FINAL INTEGRITY VERIFICATION
// -----------------------------------------------------------------------------

describe('Cloud Firestore Security Rules — Final Integrity Suite', () => {
  const tenantA = 'tenant_salon_alpha';
  const tenantB = 'tenant_salon_beta';

  const userOwnerA = 'uid_owner_alpha';
  const userManagerA = 'uid_manager_alpha';
  const userStaffA = 'uid_staff_alpha';
  const userStaffB = 'uid_staff_alpha_2';
  const userSuspendedA = 'uid_suspended_alpha';
  const userRevokedA = 'uid_revoked_alpha';

  const userOwnerB = 'uid_owner_beta';
  const userSuperAdmin = 'uid_platform_superadmin';
  const userCustomerA = 'uid_customer_client_1';
  const userCustomerB = 'uid_customer_client_2';

  beforeEach(async () => {
    await clearEmulatorData();

    // 1. Seed Tenant A (ACTIVE, isPublished: true)
    await seedDoc(`tenants/${tenantA}`, {
      id: tenantA,
      slug: 'salon-alpha',
      name: 'Salon Alpha Riyadh',
      commercialName: 'Salon Alpha LLC',
      crNumber: '1010123456',
      vatNumber: '300123456700003',
      status: 'ACTIVE',
      isPublished: true,
      primaryOwnerUid: userOwnerA,
      subscriptionTier: 'GROWTH',
      billingEmail: 'billing@salonalpha.sa',
      timezone: 'Asia/Riyadh',
      currency: 'SAR',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // 2. Seed Tenant B (ACTIVE, isPublished: false)
    await seedDoc(`tenants/${tenantB}`, {
      id: tenantB,
      slug: 'salon-beta',
      name: 'Salon Beta Jeddah',
      commercialName: 'Salon Beta Trading',
      crNumber: '4030123456',
      vatNumber: '300987654300003',
      status: 'ACTIVE',
      isPublished: false,
      primaryOwnerUid: userOwnerB,
      subscriptionTier: 'STARTER',
      billingEmail: 'billing@salonbeta.sa',
      timezone: 'Asia/Riyadh',
      currency: 'SAR',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // 3. Seed Memberships in Tenant A
    await seedDoc(`tenants/${tenantA}/memberships/${userOwnerA}`, {
      id: userOwnerA,
      tenantId: tenantA,
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/memberships/${userManagerA}`, {
      id: userManagerA,
      tenantId: tenantA,
      role: 'MANAGER',
      status: 'ACTIVE',
      joinedAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/memberships/${userStaffA}`, {
      id: userStaffA,
      tenantId: tenantA,
      role: 'STAFF',
      status: 'ACTIVE',
      joinedAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/memberships/${userStaffB}`, {
      id: userStaffB,
      tenantId: tenantA,
      role: 'STAFF',
      status: 'ACTIVE',
      joinedAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/memberships/${userSuspendedA}`, {
      id: userSuspendedA,
      tenantId: tenantA,
      role: 'STAFF',
      status: 'SUSPENDED',
      joinedAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/memberships/${userRevokedA}`, {
      id: userRevokedA,
      tenantId: tenantA,
      role: 'STAFF',
      status: 'REVOKED',
      joinedAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // 4. Seed Membership Summary Mutex
    await seedDoc(`tenants/${tenantA}/membership_summary/counts`, {
      tenantId: tenantA,
      activeOwnerCount: 1,
      activeManagerCount: 1,
      activeStaffCount: 2,
      totalActiveMembers: 4,
      version: 1,
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // 5. Seed Tenant B Owner
    await seedDoc(`tenants/${tenantB}/memberships/${userOwnerB}`, {
      id: userOwnerB,
      tenantId: tenantB,
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // 6. Seed Platform Admin
    await seedDoc(`platform_admins/${userSuperAdmin}`, {
      id: userSuperAdmin,
      isActive: true,
      roles: ['SUPER_ADMIN'],
    });

    // 7. Seed Public Projections in Tenant A
    await seedDoc(`tenants/${tenantA}/public_profile/profile`, {
      id: tenantA,
      slug: 'salon-alpha',
      name: 'Salon Alpha Riyadh',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/public_branches/branch_1`, {
      id: 'branch_1',
      name: 'Olaya Flagship Branch',
      city: 'Riyadh',
      district: 'Al-Olaya',
      address: 'King Fahd Rd, Al-Olaya',
      phone: '+966114567890',
      isActive: true,
      operatingHours: {
        monday: { open: '09:00', close: '22:00', isClosed: false },
        tuesday: { open: '09:00', close: '22:00', isClosed: false },
        wednesday: { open: '09:00', close: '22:00', isClosed: false },
        thursday: { open: '09:00', close: '22:00', isClosed: false },
        friday: { open: '14:00', close: '22:00', isClosed: false },
        saturday: { open: '09:00', close: '22:00', isClosed: false },
        sunday: { open: '09:00', close: '22:00', isClosed: false },
      },
    });

    await seedDoc(`tenants/${tenantA}/public_roster/stylist_1`, {
      id: 'stylist_1',
      displayName: 'Master Stylist Tariq',
      specialties: ['Fade', 'Beard Trim'],
      assignedBranchIds: ['branch_1'],
      isBookableOnline: true,
    });

    await seedDoc(`tenants/${tenantA}/public_services/service_1`, {
      id: 'service_1',
      name: 'Executive Royal Cut',
      description: 'Signature cut and beard shaping',
      category: 'Haircut',
      priceHalalas: 15000,
      durationMinutes: 45,
      primaryBranchId: 'branch_1',
      assignedBranchIds: ['branch_1'],
      status: 'PUBLISHED',
      isVisible: true,
      isArchived: false,
    });

    // 8. Seed Private Operational Documents in Tenant A
    await seedDoc(`tenants/${tenantA}/branches/branch_1`, {
      id: 'branch_1',
      tenantId: tenantA,
      name: 'Olaya Flagship Branch',
      city: 'Riyadh',
      district: 'Al-Olaya',
      address: 'King Fahd Rd, Al-Olaya',
      phone: '+966114567890',
      isActive: true,
      internalNotes: 'VIP room key stored at reception safe',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Secondary Branch in Tenant A (Active, but Stylist Ahmed is NOT assigned to it)
    await seedDoc(`tenants/${tenantA}/branches/branch_2`, {
      id: 'branch_2',
      tenantId: tenantA,
      name: 'Malqa Secondary Branch',
      city: 'Riyadh',
      district: 'Al-Malqa',
      address: 'Anas Ibn Malik Rd, Al-Malqa',
      phone: '+966114567899',
      isActive: true,
      internalNotes: 'Secondary branch',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Inactive Staff in Tenant A
    await seedDoc(`tenants/${tenantA}/staff/uid_inactive_staff`, {
      id: 'uid_inactive_staff',
      tenantId: tenantA,
      displayName: 'Inactive Stylist Sami',
      assignedBranchIds: ['branch_1'],
      isActive: false,
      isPubliclyVisible: false,
      specialties: ['Scissor Cut'],
      employmentStatus: 'PART_TIME',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Operational Staff profiles (scheduling, specialties, active status)
    await seedDoc(`tenants/${tenantA}/staff/${userStaffA}`, {
      id: userStaffA,
      tenantId: tenantA,
      displayName: 'Stylist Ahmed',
      assignedBranchIds: ['branch_1'],
      isActive: true,
      isPubliclyVisible: true,
      specialties: ['Scissor Cut'],
      employmentStatus: 'FULL_TIME',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/staff/${userStaffB}`, {
      id: userStaffB,
      tenantId: tenantA,
      displayName: 'Colorist Layla',
      assignedBranchIds: ['branch_1'],
      isActive: true,
      isPubliclyVisible: true,
      specialties: ['Balayage', 'Hair Coloring'],
      employmentStatus: 'FULL_TIME',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Self-Service Compensation Projections (Restricted to OWNER and Employee Self)
    await seedDoc(`tenants/${tenantA}/staff_compensation/${userStaffA}`, {
      id: userStaffA,
      tenantId: tenantA,
      staffId: userStaffA,
      baseSalaryHalalas: 800000,
      commissionSplitBps: 1500,
      employmentStatus: 'FULL_TIME',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/staff_compensation/${userStaffB}`, {
      id: userStaffB,
      tenantId: tenantA,
      staffId: userStaffB,
      baseSalaryHalalas: 950000,
      commissionSplitBps: 2000,
      employmentStatus: 'FULL_TIME',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Confidential Staff HR Identity & Emergency (Restricted strictly to OWNER)
    await seedDoc(`tenants/${tenantA}/staff_confidential/${userStaffA}`, {
      id: userStaffA,
      tenantId: tenantA,
      staffId: userStaffA,
      nationalId: '1098765432',
      personalPhone: '+966551234567',
      emergencyContact: 'Mother: +966559876543',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/staff_confidential/${userStaffB}`, {
      id: userStaffB,
      tenantId: tenantA,
      staffId: userStaffB,
      nationalId: '1098765999',
      personalPhone: '+966559999999',
      emergencyContact: 'Brother: +966558888888',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Tenant B Branch and Staff (for foreign tenant testing)
    await seedDoc(`tenants/${tenantB}/branches/branch_b1`, {
      id: 'branch_b1',
      tenantId: tenantB,
      name: 'Beta Jeddah Branch',
      city: 'Jeddah',
      isActive: true,
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantB}/staff/uid_staff_beta`, {
      id: 'uid_staff_beta',
      tenantId: tenantB,
      displayName: 'Beta Stylist Mona',
      assignedBranchIds: ['branch_b1'],
      isActive: true,
      isPubliclyVisible: true,
      specialties: ['Threading'],
      employmentStatus: 'FULL_TIME',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/services/service_1`, {
      id: 'service_1',
      tenantId: tenantA,
      name: 'Executive Royal Cut',
      category: 'Haircut',
      priceHalalas: 15000,
      durationMinutes: 45,
      costOfGoodsHalalas: 2500,
      stylistCommissionBps: 2000,
      internalProcedureNotes: 'Use premium argan oil',
      primaryBranchId: 'branch_1',
      assignedBranchIds: ['branch_1'],
      status: 'PUBLISHED',
      isVisible: true,
      isArchived: false,
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Seed Appointments
    await seedDoc(`tenants/${tenantA}/appointments/apt_alpha_1`, {
      id: 'apt_alpha_1',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaffA,
      customerId: userCustomerA,
      serviceId: 'service_1',
      status: 'CONFIRMED',
      scheduledStartTime: '2026-11-25T10:00:00.000Z',
      scheduledEndTime: '2026-11-25T11:00:00.000Z',
      priceHalalas: 15000,
      paymentStatus: 'PAID',
      notes: 'Customer prefers herbal tea',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/appointments/apt_alpha_2`, {
      id: 'apt_alpha_2',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaffB,
      customerId: userCustomerB,
      serviceId: 'service_1',
      status: 'CONFIRMED',
      scheduledStartTime: '2026-11-25T12:00:00.000Z',
      scheduledEndTime: '2026-11-25T13:00:00.000Z',
      priceHalalas: 25000,
      paymentStatus: 'PAID',
      notes: 'Customer allergy to sulfates',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/appointments/apt_completed`, {
      id: 'apt_completed',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaffA,
      customerId: userCustomerA,
      serviceId: 'service_1',
      status: 'COMPLETED',
      scheduledStartTime: '2026-11-24T10:00:00.000Z',
      scheduledEndTime: '2026-11-24T11:00:00.000Z',
      priceHalalas: 15000,
      paymentStatus: 'PAID',
      notes: 'Completed session',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-24T11:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantA}/appointments/apt_cancelled`, {
      id: 'apt_cancelled',
      tenantId: tenantA,
      branchId: 'branch_1',
      staffId: userStaffA,
      customerId: userCustomerA,
      serviceId: 'service_1',
      status: 'CANCELLED',
      scheduledStartTime: '2026-11-24T14:00:00.000Z',
      scheduledEndTime: '2026-11-24T15:00:00.000Z',
      priceHalalas: 15000,
      paymentStatus: 'REFUNDED',
      notes: 'Customer cancelled due to illness',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-24T12:00:00.000Z',
    });

    await seedDoc(`tenants/${tenantB}/appointments/apt_beta_1`, {
      id: 'apt_beta_1',
      tenantId: tenantB,
      branchId: 'branch_b1',
      staffId: 'uid_staff_beta',
      customerId: 'uid_customer_beta',
      serviceId: 'service_b1',
      status: 'CONFIRMED',
      scheduledStartTime: '2026-11-25T10:00:00.000Z',
      scheduledEndTime: '2026-11-25T11:00:00.000Z',
      priceHalalas: 30000,
      paymentStatus: 'PAID',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Seed User Profiles
    await seedDoc(`users/${userStaffA}`, {
      id: userStaffA,
      email: `${userStaffA}@rashx.sa`,
      displayName: 'Ahmed Staff',
      disabled: false,
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Seed Customer Profile
    await seedDoc(`customers/${userCustomerA}`, {
      id: userCustomerA,
      email: `${userCustomerA}@rashx.sa`,
      displayName: 'Customer Client 1',
      phoneNumber: '+966551112233',
      preferredLocale: 'ar',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Seed Audit Log
    await seedDoc(`tenants/${tenantA}/audit_logs/log_001`, {
      id: 'log_001',
      tenantId: tenantA,
      actorUid: userOwnerA,
      action: 'ADD_MEMBER',
      targetUid: userStaffA,
      timestamp: '2026-11-20T20:00:00.000Z',
    });

    // Seed Commercial Registration record
    await seedDoc(`tenants/${tenantA}/commercial_registration/record`, {
      tenantId: tenantA,
      crNumber: '1010123456',
      certificateStoragePath: `tenants/${tenantA}/certificates/cert_123.pdf`,
      certificateFileName: 'cert_123.pdf',
      certificateContentType: 'application/pdf',
      certificateFileSizeBytes: 500000,
      status: 'PENDING_REVIEW',
      uploadedByUid: userOwnerA,
      uploadedAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Seed Tenant Provisioning record
    await seedDoc(`tenant_provisioning/${userOwnerA}`, {
      ownerUid: userOwnerA,
      slug: 'salon-alpha',
      name: 'Salon Alpha Riyadh',
      tenantId: tenantA,
      status: 'COMPLETED',
      step: 'CR_METADATA_SAVED',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });
  });

  // ===========================================================================
  // 1. TENANT ROOT PRIVACY & LEAST PRIVILEGE
  // ===========================================================================
  describe('1. Tenant Root Privacy & Least Privilege', () => {
    it('1. Owner can read sensitive tenant root document', async () => {
      const res = await readDoc(`tenants/${tenantA}`, userOwnerA);
      expect(res.status).toBe(200);
    });

    it('2. Staff CANNOT read sensitive tenant root information (CR, VAT, billing)', async () => {
      const res = await readDoc(`tenants/${tenantA}`, userStaffA);
      expect(res.status).toBe(403);
    });

    it('3. Manager CANNOT read sensitive tenant root corporate document', async () => {
      const res = await readDoc(`tenants/${tenantA}`, userManagerA);
      expect(res.status).toBe(403);
    });

    it('4. Unauthenticated user cannot read private tenant root document', async () => {
      const res = await readDoc(`tenants/${tenantA}`);
      expect(res.status).toBe(403);
    });

    it('5. Tenant A owner cannot read Tenant B root document (cross-tenant isolation)', async () => {
      const res = await readDoc(`tenants/${tenantB}`, userOwnerA);
      expect(res.status).toBe(403);
    });

    it('6. Suspended member cannot access tenant root data', async () => {
      const res = await readDoc(`tenants/${tenantA}`, userSuspendedA);
      expect(res.status).toBe(403);
    });

    it('7. Revoked member cannot access tenant root data', async () => {
      const res = await readDoc(`tenants/${tenantA}`, userRevokedA);
      expect(res.status).toBe(403);
    });

    it('8. Active staff can read sanitized public profile projection', async () => {
      const res = await readDoc(`tenants/${tenantA}/public_profile/profile`, userStaffA);
      expect(res.status).toBe(200);
    });
  });

  // ===========================================================================
  // 2. MANAGER & STAFF CONFIDENTIAL DATA SEPARATION
  // ===========================================================================
  describe('2. Staff Privacy & Compensation Confidentiality', () => {
    it('9. Owner can read confidential staff compensation document', async () => {
      const res = await readDoc(`tenants/${tenantA}/staff_compensation/${userStaffA}`, userOwnerA);
      expect(res.status).toBe(200);
    });

    it('10. Staff member can read their own self-service compensation document', async () => {
      const res = await readDoc(`tenants/${tenantA}/staff_compensation/${userStaffA}`, userStaffA);
      expect(res.status).toBe(200);
    });

    it('11. Manager CANNOT read confidential staff compensation document (Salary protected)', async () => {
      const res = await readDoc(`tenants/${tenantA}/staff_compensation/${userStaffA}`, userManagerA);
      expect(res.status).toBe(403);
    });

    it('12. Staff A CANNOT read Staff B confidential compensation document', async () => {
      const res = await readDoc(`tenants/${tenantA}/staff_compensation/${userStaffB}`, userStaffA);
      expect(res.status).toBe(403);
    });

    it('13. Owner can read sensitive staff HR identity document (nationalId, emergency)', async () => {
      const res = await readDoc(`tenants/${tenantA}/staff_confidential/${userStaffA}`, userOwnerA);
      expect(res.status).toBe(200);
    });

    it('14. Staff member CANNOT read direct client staff_confidential document (HR PII protected)', async () => {
      const res = await readDoc(`tenants/${tenantA}/staff_confidential/${userStaffA}`, userStaffA);
      expect(res.status).toBe(403);
    });

    it('15. Manager CANNOT read sensitive staff HR identity document', async () => {
      const res = await readDoc(`tenants/${tenantA}/staff_confidential/${userStaffA}`, userManagerA);
      expect(res.status).toBe(403);
    });

    it('16. Staff A CANNOT read Staff B sensitive HR identity document', async () => {
      const res = await readDoc(`tenants/${tenantA}/staff_confidential/${userStaffB}`, userStaffA);
      expect(res.status).toBe(403);
    });

    it('17. Manager CAN read operational staff profiles for scheduling & branch assignments', async () => {
      const res = await readDoc(`tenants/${tenantA}/staff/${userStaffA}`, userManagerA);
      expect(res.status).toBe(200);
    });

    it('18. Staff A CANNOT read Staff B operational staff document', async () => {
      const res = await readDoc(`tenants/${tenantA}/staff/${userStaffB}`, userStaffA);
      expect(res.status).toBe(403);
    });

    it('19. Client write to staff_compensation is strictly forbidden (server Admin SDK only)', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/staff_compensation/${userStaffA}`,
        { baseSalaryHalalas: 9999999 },
        userStaffA
      );
      expect(res.status).toBe(403);
    });

    it('20. Client write to staff_confidential is strictly forbidden (server Admin SDK only)', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/staff_confidential/${userStaffA}`,
        { nationalId: '9999999999' },
        userStaffA
      );
      expect(res.status).toBe(403);
    });
  });

  // ===========================================================================
  // 3. MEMBERSHIP ROSTER PRIVACY & MUTEX IMMUTABILITY
  // ===========================================================================
  describe('3. Membership Roster Privacy & Invariants', () => {
    it('21. Owner can read full membership roster', async () => {
      const res = await readDoc(`tenants/${tenantA}/memberships/${userStaffA}`, userOwnerA);
      expect(res.status).toBe(200);
    });

    it('22. Manager can read full membership roster', async () => {
      const res = await readDoc(`tenants/${tenantA}/memberships/${userStaffA}`, userManagerA);
      expect(res.status).toBe(200);
    });

    it('23. Staff member can read their own membership record', async () => {
      const res = await readDoc(`tenants/${tenantA}/memberships/${userStaffA}`, userStaffA);
      expect(res.status).toBe(200);
    });

    it('24. Staff member CANNOT read another member membership record', async () => {
      const res = await readDoc(`tenants/${tenantA}/memberships/${userOwnerA}`, userStaffA);
      expect(res.status).toBe(403);
    });

    it('25. Ordinary client cannot promote itself to OWNER (client write forbidden)', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/memberships/${userStaffA}`,
        { role: 'OWNER' },
        userStaffA
      );
      expect(res.status).toBe(403);
    });

    it('26. Client cannot modify membership summary mutex counters directly', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/membership_summary/counts`,
        { activeOwnerCount: 0 },
        userOwnerA
      );
      expect(res.status).toBe(403);
    });

    it('27. Client cannot delete an active owner membership document directly', async () => {
      const res = await deleteDoc(`tenants/${tenantA}/memberships/${userOwnerA}`, userOwnerA);
      expect(res.status).toBe(403);
    });
  });

  // ===========================================================================
  // 4. APPOINTMENT SECURITY, INTEGRITY & MANAGER MUTATION VALIDATION
  // ===========================================================================
  describe('4. Appointment Security, Integrity & Validated Transitions', () => {
    it('28. Assigned staff can read their own assigned appointment', async () => {
      const res = await readDoc(`tenants/${tenantA}/appointments/apt_alpha_1`, userStaffA);
      expect(res.status).toBe(200);
    });

    it('29. Staff CANNOT read another staff member appointment (customer data protected)', async () => {
      const res = await readDoc(`tenants/${tenantA}/appointments/apt_alpha_2`, userStaffA);
      expect(res.status).toBe(403);
    });

    it('30. Booking customer can read their own appointment', async () => {
      const res = await readDoc(`tenants/${tenantA}/appointments/apt_alpha_1`, userCustomerA);
      expect(res.status).toBe(200);
    });

    it('31. Another customer CANNOT read different customer appointment', async () => {
      const res = await readDoc(`tenants/${tenantA}/appointments/apt_alpha_1`, userCustomerB);
      expect(res.status).toBe(403);
    });

    it('32. Manager and Owner can read any appointment in tenant', async () => {
      const resManager = await readDoc(`tenants/${tenantA}/appointments/apt_alpha_1`, userManagerA);
      expect(resManager.status).toBe(200);
      const resOwner = await readDoc(`tenants/${tenantA}/appointments/apt_alpha_2`, userOwnerA);
      expect(resOwner.status).toBe(200);
    });

    it('33. Staff cannot read foreign tenant appointments', async () => {
      const res = await readDoc(`tenants/${tenantB}/appointments/apt_beta_1`, userStaffA);
      expect(res.status).toBe(403);
    });

    it('34. Client direct creation of appointments is forbidden (server-only booking)', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/appointments/apt_new`,
        {
          id: 'apt_new',
          tenantId: tenantA,
          status: 'CONFIRMED',
          staffId: userStaffA,
        },
        userStaffA
      );
      expect(res.status).toBe(403);
    });

    it('35. Client deletion of appointments is forbidden (immutable audit history)', async () => {
      const res = await deleteDoc(`tenants/${tenantA}/appointments/apt_alpha_1`, userOwnerA);
      expect(res.status).toBe(403);
    });

    it('36. Assigned staff CAN update appointment status and notes with authentic server timestamp', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_alpha_1`,
        {
          id: 'apt_alpha_1',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-25T10:00:00.000Z',
          scheduledEndTime: '2026-11-25T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'IN_PROGRESS',
          notes: 'Customer prefers herbal tea. Commencing service.',
        },
        userStaffA
      );
      expect(res.status).toBe(200);
    });

    it('37. Assigned staff CANNOT forge arbitrary client updatedAt timestamp', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/appointments/apt_alpha_1`,
        {
          id: 'apt_alpha_1',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-25T10:00:00.000Z',
          scheduledEndTime: '2026-11-25T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'IN_PROGRESS',
          notes: 'Customer prefers herbal tea.',
          updatedAt: '2026-11-25T10:05:00.000Z', // Forged arbitrary client timestamp
        },
        userStaffA
      );
      expect(res.status).toBe(403);
    });

    it('38. Staff CANNOT update another staff member appointment', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_alpha_2`,
        {
          id: 'apt_alpha_2',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffB,
          customerId: userCustomerB,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-25T12:00:00.000Z',
          scheduledEndTime: '2026-11-25T13:00:00.000Z',
          priceHalalas: 25000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'IN_PROGRESS',
          notes: 'Unauthorized edit',
        },
        userStaffA
      );
      expect(res.status).toBe(403);
    });

    it('39. Manager direct rescheduling (scheduledStartTime/EndTime modification) is STRICTLY DENIED', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_alpha_1`,
        {
          id: 'apt_alpha_1',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-25T11:00:00.000Z', // Direct rescheduling attempt
          scheduledEndTime: '2026-11-25T12:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'CONFIRMED',
          notes: 'Direct client rescheduling attempt',
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('40. Manager direct staff reassignment (staffId modification) is STRICTLY DENIED', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_alpha_1`,
        {
          id: 'apt_alpha_1',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffB, // Direct staff reassignment attempt
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-25T10:00:00.000Z',
          scheduledEndTime: '2026-11-25T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'CONFIRMED',
          notes: 'Direct client staff reassignment attempt',
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('41. Manager direct branch reassignment (branchId modification) is STRICTLY DENIED', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_alpha_1`,
        {
          id: 'apt_alpha_1',
          tenantId: tenantA,
          branchId: 'branch_2', // Direct branch reassignment attempt
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-25T10:00:00.000Z',
          scheduledEndTime: '2026-11-25T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'CONFIRMED',
          notes: 'Direct client branch reassignment attempt',
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('42. Manager CANNOT forge arbitrary client updatedAt timestamp', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/appointments/apt_alpha_1`,
        {
          id: 'apt_alpha_1',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-25T10:00:00.000Z',
          scheduledEndTime: '2026-11-25T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'CONFIRMED',
          notes: 'Attempt with client-forged timestamp',
          updatedAt: '2026-11-21T10:00:00.000Z', // Arbitrary client timestamp
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('43. Manager CAN update appointment status and notes with authentic server timestamp', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_alpha_1`,
        {
          id: 'apt_alpha_1',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-25T10:00:00.000Z',
          scheduledEndTime: '2026-11-25T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'IN_PROGRESS',
          notes: 'Customer arrived early. Commencing service.',
        },
        userManagerA
      );
      expect(res.status).toBe(200);
    });

    it('44. Manager CANNOT modify appointment priceHalalas (financial protection)', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_alpha_1`,
        {
          id: 'apt_alpha_1',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-25T10:00:00.000Z',
          scheduledEndTime: '2026-11-25T11:00:00.000Z',
          priceHalalas: 0, // Unapproved price tampering
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'CONFIRMED',
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('45. Manager CANNOT modify appointment paymentStatus', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_alpha_1`,
        {
          id: 'apt_alpha_1',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-25T10:00:00.000Z',
          scheduledEndTime: '2026-11-25T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'REFUNDED', // Unapproved payment tampering
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'CONFIRMED',
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('46. Manager CANNOT modify appointment tenantId or customerId', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_alpha_1`,
        {
          id: 'apt_alpha_1',
          tenantId: tenantB, // Malicious tenant swap
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerB,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-25T10:00:00.000Z',
          scheduledEndTime: '2026-11-25T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'CONFIRMED',
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('47. Manager CANNOT reopen completed appointment (terminal state protected)', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_completed`,
        {
          id: 'apt_completed',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-24T10:00:00.000Z',
          scheduledEndTime: '2026-11-24T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'CONFIRMED', // Attempting to reopen completed appointment
          notes: 'Reopen completed session',
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('48. Manager CANNOT update terminal appointment (COMPLETED)', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_completed`,
        {
          id: 'apt_completed',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-24T10:00:00.000Z',
          scheduledEndTime: '2026-11-24T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'COMPLETED',
          notes: 'Attempt to add notes to completed session',
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('49. Manager CANNOT update terminal appointment (CANCELLED)', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_cancelled`,
        {
          id: 'apt_cancelled',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-24T14:00:00.000Z',
          scheduledEndTime: '2026-11-24T15:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'REFUNDED',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'CANCELLED',
          notes: 'Attempt to modify cancelled session',
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('50. Assigned staff CANNOT update a terminal appointment (COMPLETED)', async () => {
      const res = await writeDocWithServerTimestamp(
        `tenants/${tenantA}/appointments/apt_completed`,
        {
          id: 'apt_completed',
          tenantId: tenantA,
          branchId: 'branch_1',
          staffId: userStaffA,
          customerId: userCustomerA,
          serviceId: 'service_1',
          scheduledStartTime: '2026-11-24T10:00:00.000Z',
          scheduledEndTime: '2026-11-24T11:00:00.000Z',
          priceHalalas: 15000,
          paymentStatus: 'PAID',
          createdAt: '2026-11-20T20:00:00.000Z',
          status: 'COMPLETED',
          notes: 'Post-completion edit attempt',
        },
        userStaffA
      );
      expect(res.status).toBe(403);
    });
  });

  // ===========================================================================
  // 5. USER & CUSTOMER PROFILE FIELD VALIDATION
  // ===========================================================================
  describe('5. Customer and User Profile Field Validation', () => {
    it('51. User can create their own profile with allowlisted keys', async () => {
      const res = await writeDoc(
        `users/uid_new_user`,
        {
          id: 'uid_new_user',
          email: 'newuser@rashx.sa',
          displayName: 'New Member',
          disabled: false,
          createdAt: '2026-11-21T10:00:00.000Z',
          updatedAt: '2026-11-21T10:00:00.000Z',
        },
        'uid_new_user'
      );
      expect(res.status).toBe(200);
    });

    it('52. User cannot create profile with roles or platform privileges', async () => {
      const res = await writeDoc(
        `users/uid_attacker`,
        {
          id: 'uid_attacker',
          email: 'attacker@rashx.sa',
          disabled: false,
          roles: ['SUPER_ADMIN'], // Privilege escalation attempt
          isPlatformAdmin: true,
        },
        'uid_attacker'
      );
      expect(res.status).toBe(403);
    });

    it('53. User cannot create profile in disabled state', async () => {
      const res = await writeDoc(
        `users/uid_disabled_user`,
        {
          id: 'uid_disabled_user',
          email: 'disabled@rashx.sa',
          disabled: true, // Disallowed on client self-creation
        },
        'uid_disabled_user'
      );
      expect(res.status).toBe(403);
    });

    it('54. User can update profile with allowlisted keys (displayName, photoUrl)', async () => {
      const res = await writeDoc(
        `users/${userStaffA}`,
        {
          id: userStaffA,
          email: `${userStaffA}@rashx.sa`,
          displayName: 'Ahmed Master Stylist',
          photoUrl: 'https://cdn.rashx.sa/avatars/ahmed.png',
          disabled: false,
          createdAt: '2026-11-20T20:00:00.000Z',
          updatedAt: '2026-11-21T11:00:00.000Z',
        },
        userStaffA
      );
      expect(res.status).toBe(200);
    });

    it('55. User cannot modify disabled status on update', async () => {
      const res = await writeDoc(
        `users/${userStaffA}`,
        {
          id: userStaffA,
          email: `${userStaffA}@rashx.sa`,
          displayName: 'Ahmed Staff',
          disabled: true, // Cannot self-disable or bypass disabled
          createdAt: '2026-11-20T20:00:00.000Z',
        },
        userStaffA
      );
      expect(res.status).toBe(403);
    });

    it('56. Customer can create their own profile with allowlisted keys', async () => {
      const res = await writeDoc(
        `customers/uid_new_customer`,
        {
          id: 'uid_new_customer',
          email: 'customer@rashx.sa',
          displayName: 'Sarah Al-Otaibi',
          phoneNumber: '+966501234567',
          preferredLocale: 'ar',
          createdAt: '2026-11-21T10:00:00.000Z',
          updatedAt: '2026-11-21T10:00:00.000Z',
        },
        'uid_new_customer'
      );
      expect(res.status).toBe(200);
    });

    it('57. Customer cannot self-assign loyalty points or VIP status on create', async () => {
      const res = await writeDoc(
        `customers/uid_forged_customer`,
        {
          id: 'uid_forged_customer',
          email: 'forged@rashx.sa',
          loyaltyPoints: 100000, // Privilege escalation
          isVip: true,
        },
        'uid_forged_customer'
      );
      expect(res.status).toBe(403);
    });

    it('58. Customer can update preferredLocale on own profile', async () => {
      const res = await writeDoc(
        `customers/${userCustomerA}`,
        {
          id: userCustomerA,
          email: `${userCustomerA}@rashx.sa`,
          displayName: 'Customer Client 1',
          phoneNumber: '+966551112233',
          preferredLocale: 'en',
          createdAt: '2026-11-20T20:00:00.000Z',
          updatedAt: '2026-11-21T11:00:00.000Z',
        },
        userCustomerA
      );
      expect(res.status).toBe(200);
    });

    it('59. Customer cannot inject loyalty points or balance on update', async () => {
      const res = await writeDoc(
        `customers/${userCustomerA}`,
        {
          id: userCustomerA,
          loyaltyPoints: 50000,
          outstandingBalanceHalalas: 0,
        },
        userCustomerA
      );
      expect(res.status).toBe(403);
    });
  });

  // ===========================================================================
  // 6. REAL QUERY AUTHORIZATION TESTS
  // ===========================================================================
  describe('6. Real Query Authorization Tests', () => {
    it('60. Staff appointment query scoped to own staffId SUCCEEDS', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'appointments', userStaffA, [
        { field: 'staffId', op: 'EQUAL', value: userStaffA },
      ]);
      expect(res.status).toBe(200);
    });

    it('61. Staff appointment query UNFILTERED is REJECTED', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'appointments', userStaffA);
      expect(res.status).toBe(403);
    });

    it('62. Staff appointment query scoped to other staffId is REJECTED', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'appointments', userStaffA, [
        { field: 'staffId', op: 'EQUAL', value: userStaffB },
      ]);
      expect(res.status).toBe(403);
    });

    it('63. Customer appointment query scoped to own customerId SUCCEEDS', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'appointments', userCustomerA, [
        { field: 'customerId', op: 'EQUAL', value: userCustomerA },
      ]);
      expect(res.status).toBe(200);
    });

    it('64. Customer appointment query UNFILTERED is REJECTED', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'appointments', userCustomerA);
      expect(res.status).toBe(403);
    });

    it('65. Customer appointment query for other customer is REJECTED', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'appointments', userCustomerA, [
        { field: 'customerId', op: 'EQUAL', value: userCustomerB },
      ]);
      expect(res.status).toBe(403);
    });

    it('66. Staff member querying operational staff collection is REJECTED', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'staff', userStaffA);
      expect(res.status).toBe(403);
    });

    it('67. Manager querying operational staff collection SUCCEEDS', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'staff', userManagerA);
      expect(res.status).toBe(200);
    });

    it('68. Owner querying staff_compensation collection SUCCEEDS', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'staff_compensation', userOwnerA);
      expect(res.status).toBe(200);
    });

    it('69. Manager querying staff_compensation collection is REJECTED', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'staff_compensation', userManagerA);
      expect(res.status).toBe(403);
    });

    it('70. Staff member querying staff_compensation collection UNFILTERED is REJECTED', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'staff_compensation', userStaffA);
      expect(res.status).toBe(403);
    });

    it('71. Owner querying confidential staff collection SUCCEEDS', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'staff_confidential', userOwnerA);
      expect(res.status).toBe(200);
    });

    it('72. Manager querying confidential staff collection is REJECTED', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'staff_confidential', userManagerA);
      expect(res.status).toBe(403);
    });

    it('73. Staff querying confidential staff collection is REJECTED', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'staff_confidential', userStaffA);
      expect(res.status).toBe(403);
    });

    it('74. Public user querying published services with exact constraints SUCCEEDS', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'public_services', null, [
        { field: 'status', op: 'EQUAL', value: 'PUBLISHED' },
        { field: 'isVisible', op: 'EQUAL', value: true },
        { field: 'isArchived', op: 'EQUAL', value: false },
      ]);
      expect(res.status).toBe(200);
    });

    it('75. Public user querying published services WITHOUT constraints is REJECTED', async () => {
      const res = await queryCollection(`tenants/${tenantA}`, 'public_services', null);
      expect(res.status).toBe(403);
    });

    it('76. Public user query against unpublished tenant is REJECTED', async () => {
      const res = await queryCollection(`tenants/${tenantB}`, 'public_services', null, [
        { field: 'status', op: 'EQUAL', value: 'PUBLISHED' },
      ]);
      expect(res.status).toBe(403);
    });

    it('77. Public collectionGroup query across all appointments is REJECTED', async () => {
      const res = await queryCollection(null, 'appointments', null, undefined, true);
      expect(res.status).toBe(403);
    });
  });

  // ===========================================================================
  // 7. DIRECT CLIENT WRITE VALIDATION (BRANCHES & SERVICES)
  // ===========================================================================
  describe('7. Direct Client Write Validation', () => {
    it('78. Manager can create a valid branch with all required fields', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/branches/branch_new`,
        {
          id: 'branch_new',
          tenantId: tenantA,
          name: 'Sahafa Branch',
          city: 'Riyadh',
          isActive: true,
          createdAt: '2026-11-21T10:00:00.000Z',
        },
        userManagerA
      );
      expect(res.status).toBe(200);
    });

    it('79. Manager cannot create branch referencing foreign tenantId', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/branches/branch_foreign`,
        {
          id: 'branch_foreign',
          tenantId: tenantB,
          name: 'Malicious Branch',
          city: 'Riyadh',
          isActive: true,
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('80. Staff cannot create branches', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/branches/branch_staff`,
        {
          id: 'branch_staff',
          tenantId: tenantA,
          name: 'Unauthorized Branch',
          city: 'Riyadh',
          isActive: true,
        },
        userStaffA
      );
      expect(res.status).toBe(403);
    });

    it('81. Manager can create a valid service', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/services/service_new`,
        {
          id: 'service_new',
          tenantId: tenantA,
          name: 'Beard Sculpting',
          category: 'Grooming',
          priceHalalas: 7500,
          durationMinutes: 30,
          createdAt: '2026-11-21T10:00:00.000Z',
        },
        userManagerA
      );
      expect(res.status).toBe(200);
    });

    it('82. Manager cannot create service with negative price', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/services/service_negative`,
        {
          id: 'service_negative',
          tenantId: tenantA,
          name: 'Bad Service',
          category: 'Grooming',
          priceHalalas: -100,
          durationMinutes: 30,
        },
        userManagerA
      );
      expect(res.status).toBe(403);
    });

    it('83. Manager cannot delete service (restricted to OWNER)', async () => {
      const res = await deleteDoc(`tenants/${tenantA}/services/service_1`, userManagerA);
      expect(res.status).toBe(403);
    });

    it('84. Owner can delete service', async () => {
      const res = await deleteDoc(`tenants/${tenantA}/services/service_1`, userOwnerA);
      expect(res.status).toBe(200);
    });
  });

  // ===========================================================================
  // 8. TENANT LIFECYCLE, AUDIT & PLATFORM BOUNDARIES
  // ===========================================================================
  describe('8. Tenant Lifecycle & Platform Boundaries', () => {
    it('85. Client cannot change tenant operational status (e.g. SUSPENDED/ARCHIVED)', async () => {
      const res = await writeDoc(`tenants/${tenantA}`, { status: 'SUSPENDED' }, userOwnerA);
      expect(res.status).toBe(403);
    });

    it('86. Client cannot modify authoritative slug reservation documents', async () => {
      const res = await writeDoc(`tenant_slugs/salon-alpha`, { tenantId: 'tenant_hacked' }, userOwnerA);
      expect(res.status).toBe(403);
    });

    it('87. Client cannot modify tenant ownership fields (primaryOwnerUid)', async () => {
      const res = await writeDoc(`tenants/${tenantA}`, { primaryOwnerUid: userStaffA }, userOwnerA);
      expect(res.status).toBe(403);
    });

    it('88. Client cannot create arbitrary audit logs directly', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/audit_logs/log_forged`,
        { id: 'log_forged', action: 'FAKE_APPROVAL' },
        userOwnerA
      );
      expect(res.status).toBe(403);
    });

    it('89. Client cannot update existing audit logs', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/audit_logs/log_001`,
        { action: 'ALTERED_ACTION' },
        userOwnerA
      );
      expect(res.status).toBe(403);
    });

    it('90. Client cannot delete audit logs', async () => {
      const res = await deleteDoc(`tenants/${tenantA}/audit_logs/log_001`, userOwnerA);
      expect(res.status).toBe(403);
    });

    it('91. Staff member cannot read audit logs', async () => {
      const res = await readDoc(`tenants/${tenantA}/audit_logs/log_001`, userStaffA);
      expect(res.status).toBe(403);
    });

    it('92. Owner can read audit logs', async () => {
      const res = await readDoc(`tenants/${tenantA}/audit_logs/log_001`, userOwnerA);
      expect(res.status).toBe(200);
    });

    it('93. Ordinary tenant member cannot read platform administrator records', async () => {
      const res = await readDoc(`platform_admins/${userSuperAdmin}`, userOwnerA);
      expect(res.status).toBe(403);
    });

    it('94. Ordinary tenant member cannot write platform administrator records', async () => {
      const res = await writeDoc(`platform_admins/${userOwnerA}`, { isActive: true }, userOwnerA);
      expect(res.status).toBe(403);
    });

    it('95. Tenant Owner can read private commercial registration record', async () => {
      const res = await readDoc(`tenants/${tenantA}/commercial_registration/record`, userOwnerA);
      expect(res.status).toBe(200);
    });

    it('96. Staff member CANNOT read commercial registration record', async () => {
      const res = await readDoc(`tenants/${tenantA}/commercial_registration/record`, userStaffA);
      expect(res.status).toBe(403);
    });

    it('97. Manager CANNOT read commercial registration record', async () => {
      const res = await readDoc(`tenants/${tenantA}/commercial_registration/record`, userManagerA);
      expect(res.status).toBe(403);
    });

    it('98. Direct client writes to commercial registration are STRICTLY DENIED', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/commercial_registration/record`,
        { status: 'APPROVED' },
        userOwnerA
      );
      expect(res.status).toBe(403);
    });

    it('99. Owner can read their own tenant provisioning tracking record', async () => {
      const res = await readDoc(`tenant_provisioning/${userOwnerA}`, userOwnerA);
      expect(res.status).toBe(200);
    });

    it('100. Platform Admin can read any tenant provisioning tracking record', async () => {
      const res = await readDoc(`tenant_provisioning/${userOwnerA}`, userSuperAdmin);
      expect(res.status).toBe(200);
    });

    it('101. Another user CANNOT read foreign tenant provisioning tracking record', async () => {
      const res = await readDoc(`tenant_provisioning/${userOwnerA}`, userOwnerB);
      expect(res.status).toBe(403);
    });

    it('102. Direct client writes to tenant provisioning records are STRICTLY DENIED', async () => {
      const res = await writeDoc(
        `tenant_provisioning/${userOwnerA}`,
        { status: 'COMPLETED' },
        userOwnerA
      );
      expect(res.status).toBe(403);
    });

    it('103. Direct client writes to /tenants/{tenantId} are STRICTLY DENIED (cannot create arbitrary tenant)', async () => {
      const res = await writeDoc(
        `tenants/new_rogue_tenant`,
        { name: 'Rogue Salon', primaryOwnerUid: userOwnerA },
        userOwnerA
      );
      expect(res.status).toBe(403);
    });

    it('104. Cross-tenant client writes to branches (Tenant A owner writing to Tenant B branch) are STRICTLY DENIED', async () => {
      const res = await writeDoc(
        `tenants/${tenantB}/branches/branch_hijack`,
        { name: 'Hijacked Branch', tenantId: tenantB },
        userOwnerA
      );
      expect(res.status).toBe(403);
    });

    it('105. Cross-tenant client writes to appointments (Tenant A owner writing to Tenant B appointment) are STRICTLY DENIED', async () => {
      const res = await writeDoc(
        `tenants/${tenantB}/appointments/apt_hijack`,
        { status: 'CONFIRMED', tenantId: tenantB },
        userOwnerA
      );
      expect(res.status).toBe(403);
    });

    it('106. Direct client writes to /tenant_slugs/{slug} are STRICTLY DENIED', async () => {
      const res = await writeDoc(
        `tenant_slugs/rogue-slug`,
        { tenantId: tenantA },
        userOwnerA
      );
      expect(res.status).toBe(403);
    });

    it('107. Direct client writes to /tenants/{tenantId}/memberships are STRICTLY DENIED (cannot self-assign OWNER or escalate)', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/memberships/${userStaffA}`,
        { role: 'OWNER', status: 'ACTIVE' },
        userStaffA
      );
      expect(res.status).toBe(403);
    });

    it('108. Tenant Owner can read their own tenant subscription document', async () => {
      // Seed subscription doc
      await seedDoc(`tenants/${tenantA}/subscription/record`, {
        tenantId: tenantA,
        status: 'TRIALING',
        trialDurationDays: 3,
      });

      const res = await readDoc(`tenants/${tenantA}/subscription/record`, userOwnerA);
      expect(res.status).toBe(200);
    });

    it('109. Ordinary staff cannot read subscription document', async () => {
      const res = await readDoc(`tenants/${tenantA}/subscription/record`, userStaffA);
      expect(res.status).toBe(403);
    });

    it('110. Cross-tenant reading of subscription document is STRICTLY DENIED', async () => {
      const res = await readDoc(`tenants/${tenantA}/subscription/record`, userOwnerB);
      expect(res.status).toBe(403);
    });

    it('111. Direct client write/update to subscription document is STRICTLY DENIED', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/subscription/record`,
        { status: 'ACTIVE', currentPeriodEndsAt: '2099-01-01T00:00:00.000Z' },
        userOwnerA
      );
      expect(res.status).toBe(403);
    });

    it('112. Tenant Owner cannot read subscription audit trail (internal notes protected)', async () => {
      await seedDoc(`tenants/${tenantA}/subscription_audit/audit_secret`, {
        action: 'MANUALLY_ACTIVATED',
        actorUid: userSuperAdmin,
        note: 'Confidential billing details',
      });

      const res = await readDoc(`tenants/${tenantA}/subscription_audit/audit_secret`, userOwnerA);
      expect(res.status).toBe(403);
    });

    it('113. Platform Admin can read subscription audit trail', async () => {
      await seedDoc(`tenants/${tenantA}/subscription_audit/audit_secret`, {
        action: 'MANUALLY_ACTIVATED',
        actorUid: userSuperAdmin,
        note: 'Confidential billing details',
      });

      const res = await readDoc(`tenants/${tenantA}/subscription_audit/audit_secret`, userSuperAdmin);
      expect(res.status).toBe(200);
    });

    it('114. Direct client write to subscription audit trail is STRICTLY DENIED', async () => {
      const res = await writeDoc(
        `tenants/${tenantA}/subscription_audit/audit_tamper`,
        { action: 'MANUALLY_ACTIVATED', actorUid: userOwnerA },
        userOwnerA
      );
      expect(res.status).toBe(403);
    });
  });
});

