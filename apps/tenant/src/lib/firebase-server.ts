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
} from '@rashx/database/server';
