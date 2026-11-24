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
} from '@rashx/database/server';

