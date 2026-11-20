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
} from './app.js';

export {
  validateClientConfig,
  getFirebaseClientConfig,
} from './config.js';

export type { FirebaseClientConfig } from '../types.js';

