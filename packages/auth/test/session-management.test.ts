import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSessionCookie, revokeRefreshTokens, verifySessionCookie } from '../src/server/verify';
import { UnauthenticatedError, InvalidTokenError } from '../src/errors';
import * as appModule from '../src/server/app';

describe('Session Management & Cookie Operations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createSessionCookie', () => {
    it('throws UnauthenticatedError when idToken is missing or empty', async () => {
      await expect(createSessionCookie('')).rejects.toThrow(UnauthenticatedError);
      await expect(createSessionCookie('   ')).rejects.toThrow(UnauthenticatedError);
      await expect(createSessionCookie(null as any)).rejects.toThrow(UnauthenticatedError);
      await expect(createSessionCookie(undefined as any)).rejects.toThrow(UnauthenticatedError);
    });

    it('rejects duration shorter than 5 minutes or longer than 14 days', async () => {
      const under5Min = 4 * 60 * 1000;
      await expect(createSessionCookie('valid-id-token', under5Min)).rejects.toThrow(InvalidTokenError);

      const over14Days = 15 * 24 * 60 * 60 * 1000;
      await expect(createSessionCookie('valid-id-token', over14Days)).rejects.toThrow(InvalidTokenError);
    });

    it('invokes adminAuth.createSessionCookie with correct trimmed token and duration', async () => {
      const mockCreateSessionCookie = vi.fn().mockResolvedValue('mock-session-cookie-value-abc');
      vi.spyOn(appModule, 'getFirebaseAdminAuth').mockReturnValue({
        createSessionCookie: mockCreateSessionCookie,
      } as any);

      const result = await createSessionCookie('  sample_token_xyz  ', 5 * 24 * 60 * 60 * 1000);
      expect(result).toBe('mock-session-cookie-value-abc');
      expect(mockCreateSessionCookie).toHaveBeenCalledWith('sample_token_xyz', {
        expiresIn: 5 * 24 * 60 * 60 * 1000,
      });
    });
  });

  describe('revokeRefreshTokens', () => {
    it('throws UnauthenticatedError when uid is missing or empty', async () => {
      await expect(revokeRefreshTokens('')).rejects.toThrow(UnauthenticatedError);
      await expect(revokeRefreshTokens('   ')).rejects.toThrow(UnauthenticatedError);
      await expect(revokeRefreshTokens(null as any)).rejects.toThrow(UnauthenticatedError);
    });

    it('invokes adminAuth.revokeRefreshTokens with trimmed uid', async () => {
      const mockRevoke = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(appModule, 'getFirebaseAdminAuth').mockReturnValue({
        revokeRefreshTokens: mockRevoke,
      } as any);

      await revokeRefreshTokens('  user_to_revoke_123  ');
      expect(mockRevoke).toHaveBeenCalledWith('user_to_revoke_123');
    });
  });
});

