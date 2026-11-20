/**
 * @rashx/database - Canonical Firestore Document & Collection Paths
 *
 * Provides strongly-typed, centralized path builders for all Firestore resources.
 * Validates path parameters to ensure non-empty segments and prevent malformed references.
 */

function validateSegment(name: string, value: string): string {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Firestore path segment '${name}' cannot be empty or undefined.`);
  }
  return value.trim();
}

export const firestorePaths = {
  // Root collections
  users: () => 'users' as const,
  user: (uid: string) => `users/${validateSegment('uid', uid)}` as const,

  platformAdmins: () => 'platform_admins' as const,
  platformAdmin: (uid: string) => `platform_admins/${validateSegment('uid', uid)}` as const,

  customers: () => 'customers' as const,
  customer: (uid: string) => `customers/${validateSegment('uid', uid)}` as const,

  // Tenant collections & subcollections
  tenants: () => 'tenants' as const,
  tenant: (tenantId: string) => `tenants/${validateSegment('tenantId', tenantId)}` as const,

  memberships: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/memberships` as const,
  membership: (tenantId: string, memberId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/memberships/${validateSegment('memberId', memberId)}` as const,

  membershipSummary: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/membership_summary/counts` as const,

  branches: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/branches` as const,
  branch: (tenantId: string, branchId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/branches/${validateSegment('branchId', branchId)}` as const,

  staff: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/staff` as const,
  staffMember: (tenantId: string, staffId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/staff/${validateSegment('staffId', staffId)}` as const,

  services: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/services` as const,
  service: (tenantId: string, serviceId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/services/${validateSegment('serviceId', serviceId)}` as const,

  publicServices: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/public_services` as const,
  publicService: (tenantId: string, serviceId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/public_services/${validateSegment('serviceId', serviceId)}` as const,

  appointments: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/appointments` as const,
  appointment: (tenantId: string, appointmentId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/appointments/${validateSegment('appointmentId', appointmentId)}` as const,

  slotLocks: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/slot_locks` as const,
  slotLock: (tenantId: string, lockId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/slot_locks/${validateSegment('lockId', lockId)}` as const,

  auditLogs: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/audit_logs` as const,
  auditLog: (tenantId: string, logId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/audit_logs/${validateSegment('logId', logId)}` as const,
};

