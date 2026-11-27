import 'server-only';

export {
  getFirebaseAdminApp,
  getFirebaseAdminAuth,
  getFirebaseAdminStorage,
  verifyIdToken,
  verifySessionCookie,
} from '@rashx/auth/server';

export {
  getFirebaseAdminFirestore,
  getTypedAdminCollection,
  getTypedAdminDoc,
  firestorePaths,
  TenantRepository,
  TenantProvisioningError,
  TenantProvisioningErrorCode,
  TenantBootstrapService,
  CustomerRepository,
  BookingRepository,
  AvailabilityService,
} from '@rashx/database/server';

export {
  type CustomerDoc,
  type BookingDoc,
  type BookingStatus,
  type TimeSlot,
  type AvailabilityQueryResult,
} from '@rashx/database';

