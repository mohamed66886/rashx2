import 'server-only';

export {
  getFirebaseAdminApp,
  getFirebaseAdminAuth,
  getFirebaseAdminStorage,
  resetFirebaseAdminApp,
} from './app';

export {
  validateAdminConfig,
  getFirebaseAdminConfig,
  normalizePrivateKey,
} from './config';

export {
  verifyIdToken,
  verifySessionCookie,
  createSessionCookie,
  revokeRefreshTokens,
  mapDecodedTokenToVerifiedUser,
} from './verify';

export type {
  FirebaseAdminConfig,
  FirebaseAdminServiceAccount,
  VerifiedUser,
} from '../types';
