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

  slugs: () => 'slugs' as const,
  slug: (slugVal: string) => `slugs/${validateSegment('slug', slugVal)}` as const,

  tenantSlugs: () => 'tenant_slugs' as const,
  tenantSlug: (slugVal: string) => `tenant_slugs/${validateSegment('slug', slugVal)}` as const,

  tenantProvisionings: () => 'tenant_provisioning' as const,
  tenantProvisioning: (ownerUid: string) =>
    `tenant_provisioning/${validateSegment('ownerUid', ownerUid)}` as const,

  // Tenant collections & subcollections
  tenants: () => 'tenants' as const,
  tenant: (tenantId: string) => `tenants/${validateSegment('tenantId', tenantId)}` as const,

  publicProfile: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/public_profile/profile` as const,

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

  publicBranches: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/public_branches` as const,
  publicBranch: (tenantId: string, branchId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/public_branches/${validateSegment('branchId', branchId)}` as const,

  staff: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/staff` as const,
  staffMember: (tenantId: string, staffId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/staff/${validateSegment('staffId', staffId)}` as const,

  staffCompensation: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/staff_compensation` as const,
  staffCompensationMember: (tenantId: string, staffId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/staff_compensation/${validateSegment('staffId', staffId)}` as const,

  staffConfidential: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/staff_confidential` as const,
  staffConfidentialMember: (tenantId: string, staffId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/staff_confidential/${validateSegment('staffId', staffId)}` as const,

  publicRoster: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/public_roster` as const,
  publicStaffMember: (tenantId: string, staffId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/public_roster/${validateSegment('staffId', staffId)}` as const,

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

  scheduleLocks: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/schedule_locks` as const,
  scheduleLock: (tenantId: string, staffUid: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/schedule_locks/${validateSegment('staffUid', staffUid)}` as const,

  auditLogs: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/audit_logs` as const,
  auditLog: (tenantId: string, logId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/audit_logs/${validateSegment('logId', logId)}` as const,

  commercialRegistrations: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/commercial_registration` as const,
  commercialRegistration: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/commercial_registration/record` as const,

  // Subscription collections & documents
  subscriptions: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/subscription` as const,
  subscription: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/subscription/record` as const,

  subscriptionAuditTrail: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/subscription_audit` as const,
  subscriptionAuditRecord: (tenantId: string, auditId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/subscription_audit/${validateSegment('auditId', auditId)}` as const,
};

