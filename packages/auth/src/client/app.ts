/**
 * @rashx/auth - Client App & Auth Initialization
 *
 * Safe singleton initialization for Firebase Client Modular SDK.
 * Reuses existing instance to prevent duplicate app initialization errors in React/Next.js.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirebaseClientConfig } from './config';
import type { FirebaseClientConfig } from '../types';

let clientAppInstance: FirebaseApp | null = null;
let clientAuthInstance: Auth | null = null;

export function getFirebaseClientApp(customConfig?: FirebaseClientConfig): FirebaseApp {
  if (clientAppInstance) {
    return clientAppInstance;
  }

  const existingApps = getApps();
  const firstExisting = existingApps[0];
  if (firstExisting) {
    clientAppInstance = firstExisting;
    return clientAppInstance;
  }

  const config = customConfig ?? getFirebaseClientConfig();
  clientAppInstance = initializeApp(config);
  return clientAppInstance;
}

export function getFirebaseAuth(customConfig?: FirebaseClientConfig): Auth {
  if (clientAuthInstance) {
    return clientAuthInstance;
  }

  const app = getFirebaseClientApp(customConfig);
  clientAuthInstance = getAuth(app);
  return clientAuthInstance;
}

/**
 * Resets the client singleton instances.
 * Intended primarily for testing environments.
 */
export function resetFirebaseClientApp(): void {
  clientAppInstance = null;
  clientAuthInstance = null;
}
