/**
 * Centralized authorization rules, role definitions, and capability checks for RASHX.
 */

export type TenantRole = 'OWNER' | 'MANAGER' | 'STAFF';

export const PERMISSION_CAPABILITIES = [
  'employees.read',
  'employees.read_confidential',
  'employees.create',
  'employees.update',
  'employees.terminate',
  'employees.read_compensation',
  'employees.manage_compensation',
  'memberships.read',
  'memberships.invite',
  'memberships.update_role',
  'memberships.suspend',
  'providers.read',
  'providers.manage',
  'providers.assign_services',
  'providers.manage_schedule',
  'policies.read',
  'policies.manage',
  // Phase 3: Service Catalog & Categories
  'service_categories.read',
  'service_categories.create',
  'service_categories.update',
  'service_categories.manage_status',
  'services.read',
  'services.create',
  'services.update',
  'services.manage_status',
  'services.manage_pricing',
  'services.manage_branch_availability',
  'services.manage_provider_assignments',
  'services.manage_commission_policy',
] as const;

export type PermissionCapability = (typeof PERMISSION_CAPABILITIES)[number];

/**
 * Authoritative default capability sets per role.
 * Notice: Compensation access and commission policy management on services are
 * STRICTLY restricted to OWNER by default.
 * Managers do NOT have compensation/commission management access unless explicitly granted via custom permissions.
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<TenantRole, ReadonlySet<PermissionCapability>> = {
  OWNER: new Set<PermissionCapability>([
    'employees.read',
    'employees.read_confidential',
    'employees.create',
    'employees.update',
    'employees.terminate',
    'employees.read_compensation',
    'employees.manage_compensation',
    'memberships.read',
    'memberships.invite',
    'memberships.update_role',
    'memberships.suspend',
    'providers.read',
    'providers.manage',
    'providers.assign_services',
    'providers.manage_schedule',
    'policies.read',
    'policies.manage',
    // Phase 3
    'service_categories.read',
    'service_categories.create',
    'service_categories.update',
    'service_categories.manage_status',
    'services.read',
    'services.create',
    'services.update',
    'services.manage_status',
    'services.manage_pricing',
    'services.manage_branch_availability',
    'services.manage_provider_assignments',
    'services.manage_commission_policy',
  ]),
  MANAGER: new Set<PermissionCapability>([
    'employees.read',
    'employees.create',
    'employees.update',
    'memberships.read',
    'providers.read',
    'providers.manage',
    'providers.assign_services',
    'providers.manage_schedule',
    'policies.read',
    // Phase 3 operational catalog capabilities
    'service_categories.read',
    'service_categories.create',
    'service_categories.update',
    'services.read',
    'services.create',
    'services.update',
    'services.manage_status',
    'services.manage_pricing',
    'services.manage_branch_availability',
    'services.manage_provider_assignments',
  ]),
  STAFF: new Set<PermissionCapability>([
    'service_categories.read',
    'services.read',
  ]),
};

/**
 * Checks whether an actor with a given role (and optional custom capabilities) has permission.
 */
export function hasPermission(
  role: TenantRole,
  capability: PermissionCapability,
  customPermissions?: readonly string[] | null
): boolean {
  if (role === 'OWNER') {
    return true;
  }

  if (customPermissions && customPermissions.includes(capability)) {
    return true;
  }

  const defaults = ROLE_DEFAULT_PERMISSIONS[role];
  return defaults ? defaults.has(capability) : false;
}

/**
 * Asserts that the actor possesses the specified capability; throws an error otherwise.
 */
export function assertPermission(
  role: TenantRole,
  capability: PermissionCapability,
  customPermissions?: readonly string[] | null
): void {
  if (!hasPermission(role, capability, customPermissions)) {
    throw new Error(`غير مصرح: لا تملك الصلاحية المطلوبة (${capability}) لإجراء هذه العملية.`);
  }
}

/**
 * Evaluates whether an actor has authority to view confidential compensation records.
 */
export function canViewCompensation(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'employees.read_compensation', customPermissions);
}

/**
 * Evaluates whether an actor has authority to create or update compensation records.
 */
export function canManageCompensation(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'employees.manage_compensation', customPermissions);
}

/**
 * Evaluates whether an actor has authority to terminate employees.
 */
export function canTerminateEmployee(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'employees.terminate', customPermissions);
}

/**
 * Evaluates whether an actor has authority to view confidential HR data (unmasked national ID, private notes).
 */
export function canViewConfidentialHr(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'employees.read_confidential', customPermissions);
}

export function canManageServiceCommission(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'services.manage_commission_policy', customPermissions);
}

export function canManageServicePricing(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'services.manage_pricing', customPermissions);
}

export function canManageCategoryStatus(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'service_categories.manage_status', customPermissions);
}

export function canManageServiceStatus(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'services.manage_status', customPermissions);
}

