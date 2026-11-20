import 'server-only';
import { ConfigurationError } from '../errors.js';
import type { FirebaseAdminConfig } from '../types.js';

export function validateAdminConfig(
  env: Record<string, string | undefined>
): FirebaseAdminConfig {
  // Option 1: Full Service Account Key JSON (as raw string or base64)
  const rawServiceAccount = env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (rawServiceAccount) {
    try {
      let jsonString = rawServiceAccount;
      // If it starts with base64 pattern and not '{', attempt base64 decode
      if (!rawServiceAccount.startsWith('{')) {
        jsonString = Buffer.from(rawServiceAccount, 'base64').toString('utf8');
      }
      const parsed = JSON.parse(jsonString);

      if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
        throw new ConfigurationError(
          'FIREBASE_SERVICE_ACCOUNT_KEY JSON is missing required fields (project_id, client_email, private_key).'
        );
      }

      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: normalizePrivateKey(parsed.private_key),
      };
    } catch (err) {
      if (err instanceof ConfigurationError) throw err;
      throw new ConfigurationError(
        'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Must be a valid JSON string or base64-encoded JSON string.'
      );
    }
  }

  // Option 2: Individual environment variables
  const projectId = env.FIREBASE_PROJECT_ID?.trim() || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = env.FIREBASE_PRIVATE_KEY?.trim();

  if (clientEmail && rawPrivateKey && projectId) {
    return {
      projectId,
      clientEmail,
      privateKey: normalizePrivateKey(rawPrivateKey),
    };
  }

  // Option 3: Application Default Credentials (e.g. running inside GCP Cloud Run)
  if (env.GOOGLE_APPLICATION_CREDENTIALS || env.GCP_PROJECT || env.K_SERVICE) {
    if (projectId) {
      return {
        projectId,
        useApplicationDefault: true,
      };
    }
  }

  // If none match, fail closed with detailed actionable error
  const missing: string[] = [];
  if (!projectId) missing.push('FIREBASE_PROJECT_ID');
  if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
  if (!rawPrivateKey) missing.push('FIREBASE_PRIVATE_KEY');

  throw new ConfigurationError(
    `Firebase Admin SDK configuration missing. Please provide FIREBASE_SERVICE_ACCOUNT_KEY or the discrete variables: ${missing.join(
      ', '
    )}.`
  );
}

export function normalizePrivateKey(key: string): string {
  // Normalize escaped newlines common in environment variable stores (e.g. Vercel, .env)
  return key.replace(/\\n/g, '\n');
}

export function getFirebaseAdminConfig(): FirebaseAdminConfig {
  return validateAdminConfig(process.env);
}
