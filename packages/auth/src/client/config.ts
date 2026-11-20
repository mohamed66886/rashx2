/**
 * @rashx/auth - Client Configuration & Validation
 *
 * Validates public client-side Firebase environment variables.
 * Fails closed with actionable ConfigurationError if any required variable is missing.
 */

import { ConfigurationError } from '../errors.js';
import type { FirebaseClientConfig } from '../types.js';

export function validateClientConfig(
  env: Record<string, string | undefined>
): FirebaseClientConfig {
  const missing: string[] = [];

  const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');

  const authDomain = env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  if (!authDomain) missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');

  const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');

  const storageBucket = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (!storageBucket) missing.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');

  const messagingSenderId = env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim();
  if (!messagingSenderId) missing.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');

  const appId = env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();
  if (!appId) missing.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (missing.length > 0) {
    throw new ConfigurationError(
      `Missing required Firebase client environment variable(s): ${missing.join(
        ', '
      )}. Please configure these in your .env or deployment settings.`
    );
  }

  return {
    apiKey: apiKey!,
    authDomain: authDomain!,
    projectId: projectId!,
    storageBucket: storageBucket!,
    messagingSenderId: messagingSenderId!,
    appId: appId!,
  };
}

export function getFirebaseClientConfig(): FirebaseClientConfig {
  return validateClientConfig(process.env);
}

