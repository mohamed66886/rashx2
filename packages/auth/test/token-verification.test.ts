import { describe, it, expect } from 'vitest';
import {
  verifyIdToken,
  verifySessionCookie,
  mapFirebaseAdminAuthError,
  mapDecodedTokenToVerifiedUser,
} from '../src/server/verify.js';
import {
  UnauthenticatedError,
  TokenRevokedError,
  TokenExpiredError,
  InvalidTokenError,
} from '../src/errors.js';
import type { DecodedIdToken } from 'firebase-admin/auth';

describe('Token Verification & Error Mapping', () => {
  it('should throw UnauthenticatedError for empty or whitespace tokens', async () => {
    await expect(verifyIdToken('')).rejects.toThrow(UnauthenticatedError);
    await expect(verifyIdToken('   ')).rejects.toThrow(UnauthenticatedError);
    await expect(verifyIdToken(null as any)).rejects.toThrow(UnauthenticatedError);
    await expect(verifyIdToken(undefined as any)).rejects.toThrow(UnauthenticatedError);
  });

  it('should throw UnauthenticatedError for empty session cookies', async () => {
    await expect(verifySessionCookie('')).rejects.toThrow(UnauthenticatedError);
    await expect(verifySessionCookie('   ')).rejects.toThrow(UnauthenticatedError);
  });

  it('should correctly map Firebase Admin auth errors to typed errors', () => {
    const revokedErr = mapFirebaseAdminAuthError({ code: 'auth/id-token-revoked', message: 'revoked' });
    expect(revokedErr).toBeInstanceOf(TokenRevokedError);
    expect((revokedErr as TokenRevokedError).code).toBe('TOKEN_REVOKED');

    const expiredErr = mapFirebaseAdminAuthError({ code: 'auth/id-token-expired', message: 'expired' });
    expect(expiredErr).toBeInstanceOf(TokenExpiredError);
    expect((expiredErr as TokenExpiredError).code).toBe('TOKEN_EXPIRED');

    const invalidErr = mapFirebaseAdminAuthError({ code: 'auth/invalid-id-token', message: 'invalid' });
    expect(invalidErr).toBeInstanceOf(InvalidTokenError);
    expect((invalidErr as InvalidTokenError).code).toBe('INVALID_TOKEN');
  });

  it('should map decoded token to verified user and extract custom claims cleanly', () => {
    const mockDecoded: DecodedIdToken = {
      uid: 'user_123',
      email: 'stylist@rashx.org',
      email_verified: true,
      phone_number: '+966500000000',
      name: 'Sarah Ahmed',
      picture: 'https://example.com/avatar.jpg',
      auth_time: 1700000000,
      iat: 1700000000,
      exp: 1700003600,
      aud: 'rashx-prod',
      iss: 'https://securetoken.google.com/rashx-prod',
      sub: 'user_123',
      firebase: { identities: {}, sign_in_provider: 'password' },
      // Custom claims:
      platformRole: 'STAFF',
      tenantId: 'tenant_saloon_1',
      branchIds: ['branch_riyadh_01'],
    };

    const verified = mapDecodedTokenToVerifiedUser(mockDecoded);

    expect(verified.uid).toBe('user_123');
    expect(verified.email).toBe('stylist@rashx.org');
    expect(verified.emailVerified).toBe(true);
    expect(verified.displayName).toBe('Sarah Ahmed');
    expect(verified.phoneNumber).toBe('+966500000000');
    expect(verified.authTime).toBe(1700000000);
    expect(verified.expiresAt).toBe(1700003600);

    // Custom claims
    expect(verified.claims.platformRole).toBe('STAFF');
    expect(verified.claims.tenantId).toBe('tenant_saloon_1');
    expect(verified.claims.branchIds).toEqual(['branch_riyadh_01']);

    // Standard claims must NOT be in custom claims
    expect(verified.claims.aud).toBeUndefined();
    expect(verified.claims.iss).toBeUndefined();
    expect(verified.claims.sub).toBeUndefined();
    expect(verified.claims.firebase).toBeUndefined();
  });
});

