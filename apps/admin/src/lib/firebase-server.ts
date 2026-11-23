import 'server-only';

export {
  getFirebaseAdminApp,
  getFirebaseAdminAuth,
  verifyIdToken,
  verifySessionCookie,
} from '@rashx/auth/server';

export {
  getFirebaseAdminFirestore,
  getTypedAdminCollection,
  getTypedAdminDoc,
  firestorePaths,
  SubscriptionRepository,
  SubscriptionAccessGuard,
  SubscriptionError,
  SubscriptionUnauthorizedError,
} from '@rashx/database/server';

export {
  evaluateSubscriptionStatus,
  type SubscriptionDoc,
  type SubscriptionStatus,
  type SubscriptionAuditDoc,
  type SubscriptionAccessEvaluation,
} from '@rashx/database';

