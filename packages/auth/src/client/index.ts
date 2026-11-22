/**
 * @rashx/auth/client
 *
 * Client-safe Firebase authentication entrypoint.
 * Safe to import inside browser bundles and React Client Components ('use client').
 */

export {
  getFirebaseClientApp,
  getFirebaseAuth,
  resetFirebaseClientApp,
} from './app';

export {
  validateClientConfig,
  getFirebaseClientConfig,
} from './config';

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

export type { FirebaseClientConfig } from '../types';
