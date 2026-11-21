import { describe, it, expect } from 'vitest';
import { firestorePaths } from '../src/paths';

describe('Firestore Canonical Paths & Validation', () => {
  it('should construct valid root collection paths', () => {
    expect(firestorePaths.users()).toBe('users');
    expect(firestorePaths.user('user_abc')).toBe('users/user_abc');
    expect(firestorePaths.platformAdmins()).toBe('platform_admins');
    expect(firestorePaths.platformAdmin('admin_xyz')).toBe('platform_admins/admin_xyz');
    expect(firestorePaths.customers()).toBe('customers');
    expect(firestorePaths.customer('cust_123')).toBe('customers/cust_123');
    expect(firestorePaths.slugs()).toBe('slugs');
    expect(firestorePaths.slug('al-olaya-spa')).toBe('slugs/al-olaya-spa');
    expect(firestorePaths.tenantSlugs()).toBe('tenant_slugs');
    expect(firestorePaths.tenantSlug('al-olaya-spa')).toBe('tenant_slugs/al-olaya-spa');
  });

  it('should construct valid tenant-scoped collection and document paths', () => {
    const tid = 'tenant_riyadh_salon';
    expect(firestorePaths.tenants()).toBe('tenants');
    expect(firestorePaths.tenant(tid)).toBe('tenants/tenant_riyadh_salon');
    expect(firestorePaths.publicProfile(tid)).toBe(
      'tenants/tenant_riyadh_salon/public_profile/profile'
    );
    expect(firestorePaths.memberships(tid)).toBe('tenants/tenant_riyadh_salon/memberships');
    expect(firestorePaths.membership(tid, 'mem_01')).toBe(
      'tenants/tenant_riyadh_salon/memberships/mem_01'
    );
    expect(firestorePaths.membershipSummary(tid)).toBe(
      'tenants/tenant_riyadh_salon/membership_summary/counts'
    );
    expect(firestorePaths.branches(tid)).toBe('tenants/tenant_riyadh_salon/branches');
    expect(firestorePaths.branch(tid, 'branch_olaya')).toBe(
      'tenants/tenant_riyadh_salon/branches/branch_olaya'
    );
    expect(firestorePaths.publicBranches(tid)).toBe(
      'tenants/tenant_riyadh_salon/public_branches'
    );
    expect(firestorePaths.publicBranch(tid, 'branch_olaya')).toBe(
      'tenants/tenant_riyadh_salon/public_branches/branch_olaya'
    );
    expect(firestorePaths.staff(tid)).toBe('tenants/tenant_riyadh_salon/staff');
    expect(firestorePaths.staffMember(tid, 'staff_sara')).toBe(
      'tenants/tenant_riyadh_salon/staff/staff_sara'
    );
    expect(firestorePaths.staffCompensation(tid)).toBe(
      'tenants/tenant_riyadh_salon/staff_compensation'
    );
    expect(firestorePaths.staffCompensationMember(tid, 'staff_sara')).toBe(
      'tenants/tenant_riyadh_salon/staff_compensation/staff_sara'
    );
    expect(firestorePaths.staffConfidential(tid)).toBe(
      'tenants/tenant_riyadh_salon/staff_confidential'
    );
    expect(firestorePaths.staffConfidentialMember(tid, 'staff_sara')).toBe(
      'tenants/tenant_riyadh_salon/staff_confidential/staff_sara'
    );
    expect(firestorePaths.publicRoster(tid)).toBe(
      'tenants/tenant_riyadh_salon/public_roster'
    );
    expect(firestorePaths.publicStaffMember(tid, 'staff_sara')).toBe(
      'tenants/tenant_riyadh_salon/public_roster/staff_sara'
    );
    expect(firestorePaths.services(tid)).toBe('tenants/tenant_riyadh_salon/services');
    expect(firestorePaths.service(tid, 'srv_haircut')).toBe(
      'tenants/tenant_riyadh_salon/services/srv_haircut'
    );
    expect(firestorePaths.publicServices(tid)).toBe(
      'tenants/tenant_riyadh_salon/public_services'
    );
    expect(firestorePaths.publicService(tid, 'srv_haircut')).toBe(
      'tenants/tenant_riyadh_salon/public_services/srv_haircut'
    );
    expect(firestorePaths.appointments(tid)).toBe('tenants/tenant_riyadh_salon/appointments');
    expect(firestorePaths.appointment(tid, 'apt_999')).toBe(
      'tenants/tenant_riyadh_salon/appointments/apt_999'
    );
    expect(firestorePaths.slotLocks(tid)).toBe('tenants/tenant_riyadh_salon/slot_locks');
    expect(firestorePaths.slotLock(tid, 'lock_101')).toBe(
      'tenants/tenant_riyadh_salon/slot_locks/lock_101'
    );
    expect(firestorePaths.scheduleLocks(tid)).toBe('tenants/tenant_riyadh_salon/schedule_locks');
    expect(firestorePaths.scheduleLock(tid, 'staff_sara')).toBe(
      'tenants/tenant_riyadh_salon/schedule_locks/staff_sara'
    );
    expect(firestorePaths.auditLogs(tid)).toBe('tenants/tenant_riyadh_salon/audit_logs');
    expect(firestorePaths.auditLog(tid, 'audit_555')).toBe(
      'tenants/tenant_riyadh_salon/audit_logs/audit_555'
    );
    expect(firestorePaths.commercialRegistrations(tid)).toBe(
      'tenants/tenant_riyadh_salon/commercial_registration'
    );
    expect(firestorePaths.commercialRegistration(tid)).toBe(
      'tenants/tenant_riyadh_salon/commercial_registration/record'
    );
  });

  it('should reject empty or whitespace path segments', () => {
    expect(() => firestorePaths.user('')).toThrow(
      "Firestore path segment 'uid' cannot be empty or undefined."
    );
    expect(() => firestorePaths.user('   ')).toThrow(
      "Firestore path segment 'uid' cannot be empty or undefined."
    );
    expect(() => firestorePaths.tenant('')).toThrow(
      "Firestore path segment 'tenantId' cannot be empty or undefined."
    );
    expect(() => firestorePaths.membership('t1', '')).toThrow(
      "Firestore path segment 'memberId' cannot be empty or undefined."
    );
  });
});
