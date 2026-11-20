import { describe, it, expect } from 'vitest';
import { validateAdminConfig, normalizePrivateKey } from '../src/server/config.js';
import { ConfigurationError } from '../src/errors.js';

describe('Firebase Admin Configuration Validation', () => {
  it('should fail closed when configuration is missing', () => {
    expect(() => validateAdminConfig({})).toThrow(ConfigurationError);
    try {
      validateAdminConfig({});
    } catch (err: any) {
      expect(err.message).toContain('Firebase Admin SDK configuration missing');
      expect(err.code).toBe('AUTH_CONFIGURATION_ERROR');
    }
  });

  it('should parse valid FIREBASE_SERVICE_ACCOUNT_KEY JSON string', () => {
    const serviceAccountJson = JSON.stringify({
      project_id: 'rashx-prod',
      client_email: 'firebase-admin@rashx-prod.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC\\n-----END PRIVATE KEY-----\\n',
    });

    const config = validateAdminConfig({
      FIREBASE_SERVICE_ACCOUNT_KEY: serviceAccountJson,
    });

    expect(config.projectId).toBe('rashx-prod');
    expect(config.clientEmail).toBe('firebase-admin@rashx-prod.iam.gserviceaccount.com');
    expect(config.privateKey).toContain('\n');
    expect(config.privateKey).not.toContain('\\n');
  });

  it('should parse valid base64-encoded FIREBASE_SERVICE_ACCOUNT_KEY', () => {
    const serviceAccountJson = JSON.stringify({
      project_id: 'rashx-b64-prod',
      client_email: 'sa@rashx-b64.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\\nFAKE_KEY\\n-----END PRIVATE KEY-----\\n',
    });
    const base64String = Buffer.from(serviceAccountJson, 'utf8').toString('base64');

    const config = validateAdminConfig({
      FIREBASE_SERVICE_ACCOUNT_KEY: base64String,
    });

    expect(config.projectId).toBe('rashx-b64-prod');
    expect(config.clientEmail).toBe('sa@rashx-b64.iam.gserviceaccount.com');
  });

  it('should reject malformed JSON in FIREBASE_SERVICE_ACCOUNT_KEY', () => {
    expect(() =>
      validateAdminConfig({
        FIREBASE_SERVICE_ACCOUNT_KEY: '{ malformed json: not valid }',
      })
    ).toThrow(ConfigurationError);
  });

  it('should parse individual discrete environment variables', () => {
    const config = validateAdminConfig({
      FIREBASE_PROJECT_ID: 'rashx-discrete',
      FIREBASE_CLIENT_EMAIL: 'sa@rashx-discrete.iam.gserviceaccount.com',
      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nFAKE_KEY\\n-----END PRIVATE KEY-----\\n',
    });

    expect(config.projectId).toBe('rashx-discrete');
    expect(config.clientEmail).toBe('sa@rashx-discrete.iam.gserviceaccount.com');
    expect(config.privateKey).toBe(
      '-----BEGIN PRIVATE KEY-----\nFAKE_KEY\n-----END PRIVATE KEY-----\n'
    );
  });

  it('should correctly normalize escaped newlines in private key', () => {
    const escaped = 'line1\\nline2\\nline3';
    expect(normalizePrivateKey(escaped)).toBe('line1\nline2\nline3');
  });
});

