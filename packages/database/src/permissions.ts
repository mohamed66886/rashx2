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
  // Phase 4: Customer Management & Core Booking Engine
  'customers.read',
  'customers.create',
  'customers.update',
  'customers.archive',
  'customers.read_notes',
  'bookings.read',
  'bookings.create',
  'bookings.confirm',
  'bookings.reschedule',
  'bookings.cancel',
  'bookings.check_in',
  'bookings.manage_status',
  // Phase 4.1: Daily Salon Operations Engine
  'operations.read',
  'calendar.read',
  'walkins.manage',
  'queue.read',
  'queue.manage',
  'queue.call',
  'queue.reorder',
  'resources.read',
  'resources.manage',
  'resources.assign',
  'bookings.mark_no_show',
  'bookings.start_service',
  'bookings.complete_service',
  // Phase 4.2: POS, Invoicing & Payment Management
  'pos.access',
  'pos.sales.create',
  'pos.sales.read',
  'invoices.issue',
  'invoices.read',
  'invoices.void',
  'payments.record',
  'payments.read',
  'refunds.record',
  'payment_methods.manage',
  'pos_sessions.open',
  'pos_sessions.close',
  'pos_sessions.cash_movement',
  'discounts.apply',
  'discounts.override',
  'financial_reports.read',
  // Phase 4.3: Inventory, Suppliers & Purchasing Management
  'inventory.read',
  'products.manage',
  'product_categories.manage',
  'inventory_balances.read',
  'stock_movements.read',
  'inventory_valuation.read',
  'suppliers.read',
  'suppliers.manage',
  'suppliers.read_notes',
  'purchase_orders.create',
  'purchase_orders.submit',
  'purchase_orders.approve',
  'goods_receipts.record',
  'supplier_invoices.manage',
  'supplier_payments.record',
  'stock_transfers.initiate',
  'stock_transfers.approve',
  'stock_transfers.dispatch',
  'stock_transfers.receive',
  'stock_adjustments.create',
  'stock_adjustments.approve',
  'stock_counts.conduct',
  'inventory_reconciliation.run',
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
    // Phase 4
    'customers.read',
    'customers.create',
    'customers.update',
    'customers.archive',
    'customers.read_notes',
    'bookings.read',
    'bookings.create',
    'bookings.confirm',
    'bookings.reschedule',
    'bookings.cancel',
    'bookings.check_in',
    'bookings.manage_status',
    // Phase 4.1
    'operations.read',
    'calendar.read',
    'walkins.manage',
    'queue.read',
    'queue.manage',
    'queue.call',
    'queue.reorder',
    'resources.read',
    'resources.manage',
    'resources.assign',
    'bookings.mark_no_show',
    'bookings.start_service',
    'bookings.complete_service',
    // Phase 4.2
    'pos.access',
    'pos.sales.create',
    'pos.sales.read',
    'invoices.issue',
    'invoices.read',
    'invoices.void',
    'payments.record',
    'payments.read',
    'refunds.record',
    'payment_methods.manage',
    'pos_sessions.open',
    'pos_sessions.close',
    'pos_sessions.cash_movement',
    'discounts.apply',
    'discounts.override',
    'financial_reports.read',
    // Phase 4.3
    'inventory.read',
    'products.manage',
    'product_categories.manage',
    'inventory_balances.read',
    'stock_movements.read',
    'inventory_valuation.read',
    'suppliers.read',
    'suppliers.manage',
    'suppliers.read_notes',
    'purchase_orders.create',
    'purchase_orders.submit',
    'purchase_orders.approve',
    'goods_receipts.record',
    'supplier_invoices.manage',
    'supplier_payments.record',
    'stock_transfers.initiate',
    'stock_transfers.approve',
    'stock_transfers.dispatch',
    'stock_transfers.receive',
    'stock_adjustments.create',
    'stock_adjustments.approve',
    'stock_counts.conduct',
    'inventory_reconciliation.run',
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
    // Phase 4
    'customers.read',
    'customers.create',
    'customers.update',
    'customers.archive',
    'customers.read_notes',
    'bookings.read',
    'bookings.create',
    'bookings.confirm',
    'bookings.reschedule',
    'bookings.cancel',
    'bookings.check_in',
    'bookings.manage_status',
    // Phase 4.1
    'operations.read',
    'calendar.read',
    'walkins.manage',
    'queue.read',
    'queue.manage',
    'queue.call',
    'queue.reorder',
    'resources.read',
    'resources.manage',
    'resources.assign',
    'bookings.mark_no_show',
    'bookings.start_service',
    'bookings.complete_service',
    // Phase 4.2
    'pos.access',
    'pos.sales.create',
    'pos.sales.read',
    'invoices.issue',
    'invoices.read',
    'invoices.void',
    'payments.record',
    'payments.read',
    'refunds.record',
    'payment_methods.manage',
    'pos_sessions.open',
    'pos_sessions.close',
    'pos_sessions.cash_movement',
    'discounts.apply',
    'discounts.override',
    'financial_reports.read',
    // Phase 4.3: Operational inventory & purchasing (approvals & confidential supplier notes restricted to OWNER or explicit custom permission)
    'inventory.read',
    'products.manage',
    'product_categories.manage',
    'inventory_balances.read',
    'stock_movements.read',
    'inventory_valuation.read',
    'suppliers.read',
    'suppliers.manage',
    'purchase_orders.create',
    'purchase_orders.submit',
    'goods_receipts.record',
    'supplier_invoices.manage',
    'stock_transfers.initiate',
    'stock_transfers.dispatch',
    'stock_transfers.receive',
    'stock_adjustments.create',
    'stock_counts.conduct',
  ]),
  STAFF: new Set<PermissionCapability>([
    'service_categories.read',
    'services.read',
    'bookings.read',
    'bookings.check_in',
    'bookings.manage_status',
    // Phase 4.1: Least privilege operational access (no resource admin, no reorder, no mark_no_show by default)
    'operations.read',
    'calendar.read',
    'queue.read',
    'queue.call',
    'resources.read',
    'bookings.start_service',
    'bookings.complete_service',
    // Phase 4.2: Cashier operational access only (no void, no refund, no discount override, no session close/reports)
    'pos.access',
    'pos.sales.create',
    'pos.sales.read',
    'invoices.issue',
    'invoices.read',
    'payments.record',
    'payments.read',
    'pos_sessions.open',
    'pos_sessions.cash_movement',
    'discounts.apply',
    // Phase 4.3: Read-only product & branch stock visibility for POS (no cost/supplier/adjustment/PO access)
    'inventory.read',
    'inventory_balances.read',
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

export function canViewCustomerNotes(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'customers.read_notes', customPermissions);
}

export function canManageCustomers(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'customers.update', customPermissions);
}

export function canManageBookings(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'bookings.manage_status', customPermissions);
}

// Phase 4.1: Daily Operations Permission Helpers
export function canViewOperations(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'operations.read', customPermissions);
}

export function canViewCalendar(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'calendar.read', customPermissions);
}

export function canManageWalkIns(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'walkins.manage', customPermissions);
}

export function canManageQueue(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'queue.manage', customPermissions);
}

export function canCallQueue(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'queue.call', customPermissions);
}

export function canReorderQueue(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'queue.reorder', customPermissions);
}

export function canAssignResources(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'resources.assign', customPermissions);
}

export function canManageResources(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'resources.manage', customPermissions);
}

export function canMarkNoShow(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'bookings.mark_no_show', customPermissions);
}

export function canStartBookingService(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'bookings.start_service', customPermissions);
}

export function canCompleteBookingService(
  role: TenantRole,
  customPermissions?: readonly string[] | null
): boolean {
  return hasPermission(role, 'bookings.complete_service', customPermissions);
}


