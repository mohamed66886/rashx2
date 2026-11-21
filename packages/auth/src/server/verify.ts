import 'server-only';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getFirebaseAdminAuth } from './app';
import {
  InvalidTokenError,
  TokenExpiredError,
  TokenRevokedError,
  UnauthenticatedError,
} from '../errors';
import type { VerifiedUser } from '../types';

export async function verifyIdToken(
  token: string | undefined | null,
  checkRevoked: boolean = true
): Promise<VerifiedUser> {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    throw new UnauthenticatedError('Missing or empty authentication token.');
  }

  try {
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(token.trim(), checkRevoked);
    return mapDecodedTokenToVerifiedUser(decoded);
  } catch (error: any) {
    throw mapFirebaseAdminAuthError(error);
  }
}

export async function verifySessionCookie(
  sessionCookie: string | undefined | null,
  checkRevoked: boolean = true
): Promise<VerifiedUser> {
  if (!sessionCookie || typeof sessionCookie !== 'string' || sessionCookie.trim() === '') {
    throw new UnauthenticatedError('Missing or empty session cookie.');
  }

  try {
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie.trim(), checkRevoked);
    return mapDecodedTokenToVerifiedUser(decoded);
  } catch (error: any) {
    throw mapFirebaseAdminAuthError(error);
  }
}

export async function createSessionCookie(
  idToken: string | undefined | null,
  expiresInMs: number = 5 * 24 * 60 * 60 * 1000 // 5 days default
): Promise<string> {
  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    throw new UnauthenticatedError('Missing or empty authentication token for session creation.');
  }

  // Firebase enforces expiresIn between 5 minutes and 14 days
  const MIN_EXPIRES_MS = 5 * 60 * 1000;
  const MAX_EXPIRES_MS = 14 * 24 * 60 * 60 * 1000;
  if (expiresInMs < MIN_EXPIRES_MS || expiresInMs > MAX_EXPIRES_MS) {
    throw new InvalidTokenError(
      `Session cookie duration must be between 5 minutes and 14 days (received ${expiresInMs}ms).`
    );
  }

  try {
    const auth = getFirebaseAdminAuth();
    return await auth.createSessionCookie(idToken.trim(), { expiresIn: expiresInMs });
  } catch (error: any) {
    throw mapFirebaseAdminAuthError(error);
  }
}

export async function revokeRefreshTokens(uid: string | undefined | null): Promise<void> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    throw new UnauthenticatedError('Missing or empty user ID for token revocation.');
  }

  try {
    const auth = getFirebaseAdminAuth();
    await auth.revokeRefreshTokens(uid.trim());
  } catch (error: any) {
    throw mapFirebaseAdminAuthError(error);
  }
}

export function mapDecodedTokenToVerifiedUser(decoded: DecodedIdToken): VerifiedUser {
  // Extract custom claims by excluding standard JWT / Firebase reserved claims
  const reservedClaims = new Set([
    'iss',
    'aud',
    'auth_time',
    'user_id',
    'sub',
    'iat',
    'exp',
    'email',
    'email_verified',
    'firebase',
    'phone_number',
    'name',
    'picture',
  ]);

  const customClaims: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(decoded)) {
    if (!reservedClaims.has(key)) {
      customClaims[key] = value;
    }
  }

  return {
    uid: decoded.uid,
    email: decoded.email,
    emailVerified: decoded.email_verified ?? false,
    phoneNumber: decoded.phone_number,
    displayName: decoded.name,
    photoURL: decoded.picture,
    claims: customClaims,
    authTime: decoded.auth_time,
    issuedAt: decoded.iat,
    expiresAt: decoded.exp,
  };
}

export function mapFirebaseAdminAuthError(error: any): Error {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as any).code);
    if (code === 'auth/id-token-revoked' || code === 'auth/session-cookie-revoked') {
      return new TokenRevokedError('Authentication session has been revoked.');
    }
    if (code === 'auth/id-token-expired' || code === 'auth/session-cookie-expired') {
      return new TokenExpiredError('Authentication token has expired.');
    }
    if (
      code === 'auth/argument-error' ||
      code === 'auth/invalid-id-token' ||
      code === 'auth/invalid-session-cookie'
    ) {
      return new InvalidTokenError('Malformed or invalid authentication credential.');
    }
  }
  return error instanceof Error ? error : new InvalidTokenError(String(error));
}
