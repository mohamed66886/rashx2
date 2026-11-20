import 'server-only';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getFirebaseAdminAuth } from './app.js';
import {
  InvalidTokenError,
  TokenExpiredError,
  TokenRevokedError,
  UnauthenticatedError,
} from '../errors.js';
import type { VerifiedUser } from '../types.js';

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
