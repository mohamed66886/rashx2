import 'server-only';

export {
  getFirebaseAdminApp,
  getFirebaseAdminAuth,
  verifyIdToken,
  verifySessionCookie,
  createSessionCookie,
  revokeRefreshTokens,
} from '@rashx/auth/server';

export {
  getFirebaseAdminFirestore,
  getTypedAdminCollection,
  getTypedAdminDoc,
  firestorePaths,
  getTenantResolver,
  TenantResolver,
  MembershipRepository,
  SubscriptionRepository,
  SubscriptionAccessGuard,
  type TenantContext,
  type TenantResolutionOutcome,
} from '@rashx/database/server';

export {
  evaluateSubscriptionStatus,
  type SubscriptionDoc,
  type SubscriptionStatus,
  type SubscriptionAccessEvaluation,
} from '@rashx/database';

