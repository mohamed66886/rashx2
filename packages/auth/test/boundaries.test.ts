import { describe, it, expect } from 'vitest';
import * as clientModule from '../src/client/index.js';
import * as rootModule from '../src/index.js';

describe('Server / Client Boundary Enforcement', () => {
  it('client entrypoint must not export Admin SDK or server-only primitives', () => {
    const exportedKeys = Object.keys(clientModule);
    expect(exportedKeys).not.toContain('getFirebaseAdminApp');
    expect(exportedKeys).not.toContain('getFirebaseAdminAuth');
    expect(exportedKeys).not.toContain('verifyIdToken');
    expect(exportedKeys).not.toContain('verifySessionCookie');
    expect(exportedKeys).not.toContain('validateAdminConfig');
  });

  it('root index entrypoint must be safe for universal consumption', () => {
    const exportedKeys = Object.keys(rootModule);
    expect(exportedKeys).toContain('AuthError');
    expect(exportedKeys).toContain('ConfigurationError');
    expect(exportedKeys).toContain('InvalidTokenError');
    expect(exportedKeys).toContain('TokenExpiredError');
    expect(exportedKeys).toContain('TokenRevokedError');
    expect(exportedKeys).toContain('UnauthenticatedError');
    expect(exportedKeys).toContain('AUTH_PACKAGE_INITIALIZED');

    // Must not expose server admin methods directly in root
    expect(exportedKeys).not.toContain('getFirebaseAdminApp');
    expect(exportedKeys).not.toContain('getFirebaseAdminAuth');
  });
});

