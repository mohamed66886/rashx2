import { describe, it, expect } from 'vitest';
import { validateClientConfig } from '../src/client/config.js';
import { ConfigurationError } from '../src/errors.js';

describe('Firebase Client Configuration Validation', () => {
  it('should throw ConfigurationError when all env vars are missing', () => {
    expect(() => validateClientConfig({})).toThrow(ConfigurationError);
    try {
      validateClientConfig({});
    } catch (err: any) {
      expect(err.message).toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
      expect(err.message).toContain('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      expect(err.code).toBe('AUTH_CONFIGURATION_ERROR');
    }
  });

  it('should throw ConfigurationError listing specific missing variables', () => {
    const partialEnv = {
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    };

    expect(() => validateClientConfig(partialEnv)).toThrow(ConfigurationError);
    try {
      validateClientConfig(partialEnv);
    } catch (err: any) {
      expect(err.message).not.toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
      expect(err.message).toContain('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      expect(err.message).toContain('NEXT_PUBLIC_FIREBASE_APP_ID');
    }
  });

  it('should succeed and return typed config when all variables are present', () => {
    const completeEnv = {
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key-123',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'rashx-test.firebaseapp.com',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'rashx-test',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'rashx-test.firebasestorage.app',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '1234567890',
      NEXT_PUBLIC_FIREBASE_APP_ID: '1:1234567890:web:abcdef123456',
    };

    const config = validateClientConfig(completeEnv);
    expect(config.apiKey).toBe('test-api-key-123');
    expect(config.authDomain).toBe('rashx-test.firebaseapp.com');
    expect(config.projectId).toBe('rashx-test');
    expect(config.storageBucket).toBe('rashx-test.firebasestorage.app');
    expect(config.messagingSenderId).toBe('1234567890');
    expect(config.appId).toBe('1:1234567890:web:abcdef123456');
  });
});
