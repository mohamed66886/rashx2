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

  // Phase 4: Customers & Bookings Core Engine
  tenantCustomers: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/customers` as const,
  tenantCustomer: (tenantId: string, customerId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/customers/${validateSegment('customerId', customerId)}` as const,

  tenantCustomerIdentities: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/customer_identities` as const,
  tenantCustomerIdentity: (tenantId: string, phone: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/customer_identities/${validateSegment('phone', phone)}` as const,

  bookings: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/bookings` as const,
  booking: (tenantId: string, bookingId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/bookings/${validateSegment('bookingId', bookingId)}` as const,

  bookingIdempotency: (tenantId: string, key: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/booking_idempotency/${validateSegment('key', key)}` as const,

  bookingAuditTrail: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/booking_audit` as const,
  bookingAuditRecord: (tenantId: string, auditId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/booking_audit/${validateSegment('auditId', auditId)}` as const,

  slotLocks: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/slot_locks` as const,
  slotLock: (tenantId: string, lockId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/slot_locks/${validateSegment('lockId', lockId)}` as const,

  scheduleLocks: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/schedule_locks` as const,
  scheduleLock: (tenantId: string, staffUid: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/schedule_locks/${validateSegment('staffUid', staffUid)}` as const,

  // Phase 4.1: Salon Daily Operations Engine (Resources, Queue, Calling, Guest Idempotency, Operations Audit)
  resources: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/resources` as const,
  resource: (tenantId: string, resourceId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/resources/${validateSegment('resourceId', resourceId)}` as const,

  resourceSlotLocks: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/resource_slot_locks` as const,
  resourceSlotLock: (tenantId: string, lockId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/resource_slot_locks/${validateSegment('lockId', lockId)}` as const,

  resourceScheduleLocks: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/resource_schedule_locks` as const,
  resourceScheduleLock: (tenantId: string, resourceId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/resource_schedule_locks/${validateSegment('resourceId', resourceId)}` as const,

  queueEntries: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/queue_entries` as const,
  queueEntry: (tenantId: string, bookingId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/queue_entries/${validateSegment('bookingId', bookingId)}` as const,

  queueLocks: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/queue_locks` as const,
  queueLock: (tenantId: string, branchDateKey: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/queue_locks/${validateSegment('branchDateKey', branchDateKey)}` as const,

  queueCalls: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/queue_calls` as const,
  queueCall: (tenantId: string, callId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/queue_calls/${validateSegment('callId', callId)}` as const,

  queueCallIdempotency: (tenantId: string, key: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/queue_call_idempotency/${validateSegment('key', key)}` as const,

  customerGuestIdempotency: (tenantId: string, key: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/customer_guest_idempotency/${validateSegment('key', key)}` as const,

  operationsAuditTrail: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/operations_audit` as const,
  operationsAuditRecord: (tenantId: string, auditId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/operations_audit/${validateSegment('auditId', auditId)}` as const,

  // Phase 4.2: POS, Invoicing & Payment Management
  posSessions: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_sessions` as const,
  posSession: (tenantId: string, sessionId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_sessions/${validateSegment('sessionId', sessionId)}` as const,

  posActiveSessionLocks: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_active_session_locks` as const,
  posActiveSessionLock: (tenantId: string, lockId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_active_session_locks/${validateSegment('lockId', lockId)}` as const,

  posCashMovements: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_cash_movements` as const,
  posCashMovement: (tenantId: string, movementId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_cash_movements/${validateSegment('movementId', movementId)}` as const,

  posCashMovementIdempotency: (tenantId: string, key: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_cash_movement_idempotency/${validateSegment('key', key)}` as const,

  posSales: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_sales` as const,
  posSale: (tenantId: string, saleId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_sales/${validateSegment('saleId', saleId)}` as const,

  posBookingLocks: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_booking_locks` as const,
  posBookingLock: (tenantId: string, bookingId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_booking_locks/${validateSegment('bookingId', bookingId)}` as const,

  posSaleIdempotency: (tenantId: string, key: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_sale_idempotency/${validateSegment('key', key)}` as const,

  invoices: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/invoices` as const,
  invoice: (tenantId: string, invoiceId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/invoices/${validateSegment('invoiceId', invoiceId)}` as const,

  invoiceSequence: (tenantId: string, scopeKey: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/counters/invoice_seq_${validateSegment('scopeKey', scopeKey)}` as const,

  payments: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/payments` as const,
  payment: (tenantId: string, paymentId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/payments/${validateSegment('paymentId', paymentId)}` as const,

  paymentIdempotency: (tenantId: string, key: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/payment_idempotency/${validateSegment('key', key)}` as const,

  refunds: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/refunds` as const,
  refund: (tenantId: string, refundId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/refunds/${validateSegment('refundId', refundId)}` as const,

  refundIdempotency: (tenantId: string, key: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/refund_idempotency/${validateSegment('key', key)}` as const,

  paymentMethodConfigs: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/payment_method_configs` as const,
  paymentMethodConfig: (tenantId: string, methodCode: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/payment_method_configs/${validateSegment('methodCode', methodCode)}` as const,

  posAccountingOutbox: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_accounting_outbox` as const,
  posAccountingOutboxItem: (tenantId: string, outboxId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_accounting_outbox/${validateSegment('outboxId', outboxId)}` as const,

  posAuditTrail: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_audit` as const,
  posAuditRecord: (tenantId: string, auditId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/pos_audit/${validateSegment('auditId', auditId)}` as const,

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

  // Phase 4.3: Inventory, Suppliers & Purchasing Management
  productCategories: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/product_categories` as const,
  productCategory: (tenantId: string, categoryId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/product_categories/${validateSegment('categoryId', categoryId)}` as const,

  products: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/products` as const,
  product: (tenantId: string, productId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/products/${validateSegment('productId', productId)}` as const,

  productSkuLocks: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/product_sku_locks` as const,
  productSkuLock: (tenantId: string, skuKey: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/product_sku_locks/${validateSegment('skuKey', skuKey)}` as const,

  productBarcodeLocks: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/product_barcode_locks` as const,
  productBarcodeLock: (tenantId: string, barcodeKey: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/product_barcode_locks/${validateSegment('barcodeKey', barcodeKey)}` as const,

  inventoryBalances: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/inventory_balances` as const,
  inventoryBalance: (tenantId: string, balanceId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/inventory_balances/${validateSegment('balanceId', balanceId)}` as const,

  stockMovements: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/stock_movements` as const,
  stockMovement: (tenantId: string, movementId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/stock_movements/${validateSegment('movementId', movementId)}` as const,

  stockMovementIdempotency: (tenantId: string, key: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/stock_movement_idempotency/${validateSegment('key', key)}` as const,

  suppliers: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/suppliers` as const,
  supplier: (tenantId: string, supplierId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/suppliers/${validateSegment('supplierId', supplierId)}` as const,

  purchaseOrders: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/purchase_orders` as const,
  purchaseOrder: (tenantId: string, purchaseOrderId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/purchase_orders/${validateSegment('purchaseOrderId', purchaseOrderId)}` as const,

  purchaseOrderSequence: (tenantId: string, year: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/counters/po_seq_${validateSegment('year', year)}` as const,

  goodsReceipts: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/goods_receipts` as const,
  goodsReceipt: (tenantId: string, receiptId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/goods_receipts/${validateSegment('receiptId', receiptId)}` as const,

  goodsReceiptIdempotency: (tenantId: string, key: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/goods_receipt_idempotency/${validateSegment('key', key)}` as const,

  supplierInvoices: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/supplier_invoices` as const,
  supplierInvoice: (tenantId: string, invoiceId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/supplier_invoices/${validateSegment('invoiceId', invoiceId)}` as const,

  supplierPayments: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/supplier_payments` as const,
  supplierPayment: (tenantId: string, paymentId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/supplier_payments/${validateSegment('paymentId', paymentId)}` as const,

  supplierPaymentIdempotency: (tenantId: string, key: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/supplier_payment_idempotency/${validateSegment('key', key)}` as const,

  stockTransfers: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/stock_transfers` as const,
  stockTransfer: (tenantId: string, transferId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/stock_transfers/${validateSegment('transferId', transferId)}` as const,

  stockAdjustments: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/stock_adjustments` as const,
  stockAdjustment: (tenantId: string, adjustmentId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/stock_adjustments/${validateSegment('adjustmentId', adjustmentId)}` as const,

  stockCounts: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/stock_counts` as const,
  stockCount: (tenantId: string, countId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/stock_counts/${validateSegment('countId', countId)}` as const,

  inventoryAccountingOutbox: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/inventory_accounting_outbox` as const,
  inventoryAccountingOutboxItem: (tenantId: string, outboxId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/inventory_accounting_outbox/${validateSegment('outboxId', outboxId)}` as const,

  inventoryAuditTrail: (tenantId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/inventory_audit` as const,
  inventoryAuditRecord: (tenantId: string, auditId: string) =>
    `tenants/${validateSegment('tenantId', tenantId)}/inventory_audit/${validateSegment('auditId', auditId)}` as const,
};

