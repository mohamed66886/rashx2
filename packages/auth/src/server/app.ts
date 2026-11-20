import 'server-only';
import { initializeApp, getApps, cert, applicationDefault, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirebaseAdminConfig } from './config.js';
import type { FirebaseAdminConfig } from '../types.js';

let adminAppInstance: App | null = null;
let adminAuthInstance: Auth | null = null;

export function getFirebaseAdminApp(customConfig?: FirebaseAdminConfig): App {
  if (adminAppInstance) {
    return adminAppInstance;
  }

  const existingApps = getApps();
  const firstExisting = existingApps[0];
  if (firstExisting) {
    adminAppInstance = firstExisting;
    return adminAppInstance;
  }

  const config = customConfig ?? getFirebaseAdminConfig();

  let credential;
  if (config.clientEmail && config.privateKey) {
    credential = cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: config.privateKey,
    });
  } else if (config.useApplicationDefault) {
    credential = applicationDefault();
  }

  adminAppInstance = initializeApp({
    credential,
    projectId: config.projectId,
  });

  return adminAppInstance;
}

export function getFirebaseAdminAuth(customConfig?: FirebaseAdminConfig): Auth {
  if (adminAuthInstance) {
    return adminAuthInstance;
  }

  const app = getFirebaseAdminApp(customConfig);
  adminAuthInstance = getAuth(app);
  return adminAuthInstance;
}

/**
 * Resets the admin singleton instances.
 * Intended primarily for testing environments.
 */
export function resetFirebaseAdminApp(): void {
  adminAppInstance = null;
  adminAuthInstance = null;
}
