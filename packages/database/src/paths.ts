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

  mainBranchPointer: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/branch_summary/main` as const,

  bootstrapStatus: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/settings/bootstrap` as const,

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

  serviceCategories: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/service_categories` as const,
  serviceCategory: (tenantId: string, categoryId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/service_categories/${validateSegment('categoryId', categoryId)}` as const,

  publicServiceCategories: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/public_service_categories` as const,
  publicServiceCategory: (tenantId: string, categoryId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/public_service_categories/${validateSegment('categoryId', categoryId)}` as const,

  serviceAuditTrail: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/service_audit` as const,
  serviceAuditRecord: (tenantId: string, auditId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/service_audit/${validateSegment('auditId', auditId)}` as const,

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

  // Company Profile & Settings
  companyProfile: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/settings/company` as const,
  taxSettings: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/settings/tax` as const,
  generalSettings: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/settings/general` as const,
  seoSettings: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/settings/seo` as const,

  // Complete Accounting Core
  accounts: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/accounts` as const,
  account: (tenantId: string, accountId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/accounts/${validateSegment('accountId', accountId)}` as const,

  accountingSettings: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/settings/accounting` as const,

  fiscalYears: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/fiscal_years` as const,
  fiscalYear: (tenantId: string, fiscalYearId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/fiscal_years/${validateSegment('fiscalYearId', fiscalYearId)}` as const,

  accountingPeriods: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/accounting_periods` as const,
  accountingPeriod: (tenantId: string, periodId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/accounting_periods/${validateSegment('periodId', periodId)}` as const,

  journalEntries: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/journal_entries` as const,
  journalEntry: (tenantId: string, entryId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/journal_entries/${validateSegment('entryId', entryId)}` as const,

  journalSequence: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/journal_sequence/counter` as const,

  accountBalances: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/account_balances` as const,
  accountBalance: (tenantId: string, accountId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/account_balances/${validateSegment('accountId', accountId)}` as const,

  costCenters: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/cost_centers` as const,
  costCenter: (tenantId: string, costCenterId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/cost_centers/${validateSegment('costCenterId', costCenterId)}` as const,

  accountingAuditTrail: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/accounting_audit` as const,
  accountingAuditRecord: (tenantId: string, auditId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/accounting_audit/${validateSegment('auditId', auditId)}` as const,

  // Phase 2: Employees, Providers, Compensation & Commission Policies
  employees: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/employees` as const,
  employee: (tenantId: string, employeeId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/employees/${validateSegment('employeeId', employeeId)}` as const,

  compensations: (tenantId: string, employeeId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/employees/${validateSegment('employeeId', employeeId)}/compensations` as const,
  compensation: (tenantId: string, employeeId: string, compId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/employees/${validateSegment('employeeId', employeeId)}/compensations/${validateSegment('compId', compId)}` as const,

  providers: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/providers` as const,
  provider: (tenantId: string, providerId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/providers/${validateSegment('providerId', providerId)}` as const,

  publicProviders: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/public_providers` as const,
  publicProvider: (tenantId: string, providerId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/public_providers/${validateSegment('providerId', providerId)}` as const,

  tenantCounters: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/counters` as const,
  tenantCounter: (tenantId: string, counterId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/counters/${validateSegment('counterId', counterId)}` as const,

  commissionPolicies: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/commission_policies` as const,
  commissionPolicy: (tenantId: string, policyId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/commission_policies/${validateSegment('policyId', policyId)}` as const,

  invitations: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/invitations` as const,
  invitation: (tenantId: string, invitationId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/invitations/${validateSegment('invitationId', invitationId)}` as const,

  invitationTokens: () => 'invitation_tokens' as const,
  invitationToken: (tokenHash: string) =>
    `invitation_tokens/${validateSegment('tokenHash', tokenHash)}` as const,

  hrAuditTrail: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/hr_audit` as const,
  hrAuditRecord: (tenantId: string, auditId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/hr_audit/${validateSegment('auditId', auditId)}` as const,
};

