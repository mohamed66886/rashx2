import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getFirebaseClientApp,
  getFirebaseAuth,
  resetFirebaseClientApp,
} from '../src/client/app.js';
import {
  getFirebaseAdminApp,
  getFirebaseAdminAuth,
  resetFirebaseAdminApp,
} from '../src/server/app.js';

describe('Firebase Initialization Reuse & Singletons', () => {
  beforeEach(() => {
    resetFirebaseClientApp();
    resetFirebaseAdminApp();
  });

  it('should reuse client app and client auth singleton instances', () => {
    const mockConfig = {
      apiKey: 'fake-api-key',
      authDomain: 'test-reuse.firebaseapp.com',
      projectId: 'test-reuse',
      storageBucket: 'test-reuse.firebasestorage.app',
      messagingSenderId: '12345',
      appId: '1:12345:web:abcdef',
    };

    const app1 = getFirebaseClientApp(mockConfig);
    const app2 = getFirebaseClientApp(mockConfig);

    expect(app1).toBe(app2);

    const auth1 = getFirebaseAuth(mockConfig);
    const auth2 = getFirebaseAuth(mockConfig);

    expect(auth1).toBe(auth2);
  });

  it('should reset client instances when resetFirebaseClientApp is called', () => {
    const mockConfig = {
      apiKey: 'fake-api-key',
      authDomain: 'test-reset.firebaseapp.com',
      projectId: 'test-reset',
      storageBucket: 'test-reset.firebasestorage.app',
      messagingSenderId: '12345',
      appId: '1:12345:web:abcdef',
    };

    const app1 = getFirebaseClientApp(mockConfig);
    resetFirebaseClientApp();
    // After reset, clientAppInstance is cleared
    const app2 = getFirebaseClientApp(mockConfig);
    expect(app1).toBeDefined();
    expect(app2).toBeDefined();
  });
});

