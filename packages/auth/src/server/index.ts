import 'server-only';

export {
  getFirebaseAdminApp,
  getFirebaseAdminAuth,
  resetFirebaseAdminApp,
} from './app.js';

export {
  validateAdminConfig,
  getFirebaseAdminConfig,
  normalizePrivateKey,
} from './config.js';

export {
  verifyIdToken,
  verifySessionCookie,
  mapDecodedTokenToVerifiedUser,
} from './verify.js';

export type {
  FirebaseAdminConfig,
  FirebaseAdminServiceAccount,
  VerifiedUser,
} from '../types.js';
