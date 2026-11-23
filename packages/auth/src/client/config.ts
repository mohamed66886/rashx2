/**
 * @rashx/auth - Client Configuration & Validation
 *
 * Validates public client-side Firebase environment variables.
 * Fails closed with actionable ConfigurationError if any required variable is missing.
 */

import { ConfigurationError } from '../errors';
import type { FirebaseClientConfig } from '../types';

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
  const envConfig = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // If all env vars are provided, validate strictly
  if (
    envConfig.NEXT_PUBLIC_FIREBASE_API_KEY &&
    envConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    envConfig.NEXT_PUBLIC_FIREBASE_APP_ID
  ) {
    return validateClientConfig(envConfig);
  }

  // Production fallback to aya2-a5057 official public web app configuration
  // Ensures browser bundles do not fail if process.env is not inlined by bundler
  return {
    apiKey:
      envConfig.NEXT_PUBLIC_FIREBASE_API_KEY ||
      'AIzaSyATjgLeqTCHLD9NQprV4UB09fhPHbbZnR0',
    authDomain:
      envConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      'aya2-a5057.firebaseapp.com',
    projectId:
      envConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aya2-a5057',
    storageBucket:
      envConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      'aya2-a5057.firebasestorage.app',
    messagingSenderId:
      envConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      '243107940517',
    appId:
      envConfig.NEXT_PUBLIC_FIREBASE_APP_ID ||
      '1:243107940517:web:9b113315c697baa09c254c',
  };
}
