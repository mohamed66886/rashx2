import 'server-only';
import {
  getFirestore,
  type Firestore,
  type CollectionReference,
  type DocumentReference,
  type DocumentData,
} from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@rashx/auth/server';

let adminFirestoreInstance: Firestore | null = null;

export function getFirebaseAdminFirestore(): Firestore {
  if (adminFirestoreInstance) {
    return adminFirestoreInstance;
  }
  const app = getFirebaseAdminApp();
  adminFirestoreInstance = getFirestore(app);
  try {
    adminFirestoreInstance.settings({ ignoreUndefinedProperties: true });
  } catch {
    // In case settings were already initialized or frozen
  }
  return adminFirestoreInstance;
}

export function resetFirebaseAdminFirestore(): void {
  adminFirestoreInstance = null;
}

export function getTypedAdminCollection<T extends DocumentData = DocumentData>(
  collectionPath: string
): CollectionReference<T> {
  const db = getFirebaseAdminFirestore();
  return db.collection(collectionPath) as CollectionReference<T>;
}

export function getTypedAdminDoc<T extends DocumentData = DocumentData>(
  documentPath: string
): DocumentReference<T> {
  const db = getFirebaseAdminFirestore();
  return db.doc(documentPath) as DocumentReference<T>;
}

export { firestorePaths } from '../paths';
export type { BaseEntity, FirestoreDocumentData } from '../types';

// Repositories (Server-only)
export {
  TenantRepository,
  TenantProvisioningError,
  TenantProvisioningErrorCode,
  type TenantProvisioningResult,
  type TenantAuthorizationContext,
} from './repositories/tenant.repository';

export {
  MembershipRepository,
  MembershipError,
  MembershipErrorCode,
  type MembershipActor,
  type MembershipAuditLog,
} from './repositories/membership.repository';

export {
  AppointmentRepository,
  AppointmentError,
  AppointmentErrorCode,
  type AppointmentActor,
  type AppointmentMutationResult,
} from './repositories/appointment.repository';

export {
  SubscriptionRepository,
  SubscriptionError,
  SubscriptionNotFoundError,
  SubscriptionUnauthorizedError,
  SubscriptionAccessError,
  type ActivateSubscriptionParams,
  type SuspendSubscriptionParams,
} from './repositories/subscription.repository';

export {
  SubscriptionAccessGuard,
  type GuardOperationalAccessResult,
} from './subscription-guard';

export {
  BranchRepository,
  DEFAULT_OPERATING_HOURS,
} from './repositories/branch.repository';

export { CompanyRepository } from './repositories/company.repository';

export { AccountingRepository } from './repositories/accounting.repository';

export {
  TenantBootstrapService,
  generateFiscalPeriods,
  type BootstrapOptions,
  type ReconciliationResult,
  type GeneratedFiscalPeriod,
} from './tenant-bootstrap.service';

// Phase 2: Employees, Providers, Compensation & Policies Repositories
export {
  EmployeeRepository,
  type EmployeeListOptions,
} from './repositories/employee.repository';

export {
  ProviderRepository,
  type ProviderListOptions,
} from './repositories/provider.repository';

export { CompensationRepository } from './repositories/compensation.repository';

export { CommissionPolicyRepository } from './repositories/commission-policy.repository';

export { InvitationRepository } from './repositories/invitation.repository';

// Phase 3: Service Catalog & Categories Repositories
export { ServiceCategoryRepository } from './repositories/service-category.repository';
export {
  ServiceRepository,
  type ServiceListFilter,
} from './repositories/service.repository';

// Phase 4: Customer Management & Core Booking Engine
export {
  CustomerRepository,
  CustomerError,
  CustomerErrorCode,
  type CustomerActor,
  type CustomerListOptions,
} from './repositories/customer.repository';

export {
  BookingRepository,
  BookingError,
  BookingErrorCode,
  type BookingActor,
  type BookingListFilters,
  type BookingDateRangeFilters,
} from './repositories/booking.repository';

export { AvailabilityService } from './availability.service';

// Phase 4.1: Salon Daily Operations Engine
export {
  ResourceRepository,
  ResourceError,
  ResourceErrorCode,
  type ResourceActor,
  type ResourceListFilters,
  type EligibleResourceAvailability,
} from './repositories/resource.repository';

export {
  QueueRepository,
  QueueError,
  QueueErrorCode,
  type QueueActor,
  type QueueCallResult,
} from './repositories/queue.repository';

export {
  DailyOperationsService,
  OperationsError,
  OperationsErrorCode,
  type OperationsActor,
  type OperationalWarning,
  type WalkInRegistrationResult,
  type DailyOperationsSnapshot,
} from './operations.service';

export {
  PosSessionRepository,
  PosSessionError,
  PosSessionErrorCode,
  type PosActor,
} from './repositories/pos-session.repository';

export {
  PosRepository,
  PosError,
  PosErrorCode,
} from './repositories/pos.repository';

// Phase 4.3: Inventory, Suppliers & Purchasing Repositories
export {
  InventoryRepository,
  InventoryError,
  InventoryErrorCode,
  type InventoryActor,
} from './repositories/inventory.repository';

export {
  PurchasingRepository,
  PurchasingError,
  PurchasingErrorCode,
} from './repositories/purchasing.repository';

// Authoritative Tenant Resolution & Context (Server-only)
export {
  TenantResolver,
  getTenantResolver,
  resetTenantResolver,
  type TenantContext,
  type TenantResolutionOutcome,
  type TenantResolutionErrorCode,
  type TenantResolverOptions,
} from './tenant-resolver';
