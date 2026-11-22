import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSessionCookieConfig,
  extractSessionCookie,
  PROD_COOKIE_NAME,
  DEV_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from '../../../apps/tenant/src/lib/session-cookie';
import { validateCsrf } from '../../../apps/tenant/src/lib/csrf';
import {
  TenantProvisioningDocSchema,
  ProvisioningStatusEnum,
  ProvisioningStepEnum,
} from '../src/tenant.schema';
import { firestorePaths } from '../src/paths';
import {
  detectMimeFromBytes,
  ALLOWED_CERTIFICATE_MIME_TYPES,
  MAX_CERTIFICATE_SIZE_BYTES,
} from '../src/certificate-validation';

describe('B.2.6 Session Cookie, CSRF & Provisioning Lifecycle Security', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. Session Cookie Specification & Environment Isolation
  // =========================================================================
  describe('1. Session Cookie Specification & Isolation', () => {
    it('enforces __Host- prefix, Secure: true, SameSite: lax, Path: /, and no Domain in production', () => {
      process.env.NODE_ENV = 'production';
      const config = getSessionCookieConfig();

      expect(config.name).toBe(PROD_COOKIE_NAME);
      expect(config.name).toBe('__Host-rashx_session');
      expect(config.options.secure).toBe(true); // MUST be true for __Host-
      expect(config.options.httpOnly).toBe(true);
      expect(config.options.sameSite).toBe('lax');
      expect(config.options.path).toBe('/');
      expect(config.options.maxAge).toBe(SESSION_DURATION_SECONDS);
      expect(config.options.domain).toBeUndefined(); // RFC 6265bis strict requirement
    });

    it('uses dev cookie without __Host- prefix in development so HTTP localhost does not drop it', () => {
      process.env.NODE_ENV = 'development';
      const config = getSessionCookieConfig();

      expect(config.name).toBe(DEV_COOKIE_NAME);
      expect(config.name).toBe('rashx_session');
      expect(config.options.secure).toBe(false);
      expect(config.options.httpOnly).toBe(true);
      expect(config.options.sameSite).toBe('lax');
      expect(config.options.path).toBe('/');
      expect(config.options.domain).toBeUndefined();
    });

    it('extracts session cookie across dev and prod namespaces cleanly', () => {
      process.env.NODE_ENV = 'development';
      const mockStoreA = {
        get: (name: string) =>
          name === 'rashx_session' ? { value: 'cookie_val_dev' } : undefined,
      };
      expect(extractSessionCookie(mockStoreA)).toBe('cookie_val_dev');

      const mockStoreB = {
        get: (name: string) =>
          name === '__Host-rashx_session' ? { value: 'cookie_val_prod' } : undefined,
      };
      expect(extractSessionCookie(mockStoreB)).toBe('cookie_val_prod');
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });
  });

  // =========================================================================
  // 2. CSRF Defense-in-Depth & Host Authority Validation
  // =========================================================================
  describe('2. CSRF Defense-in-Depth & Host Authority Verification', () => {
    function createMockRequest(headers: Record<string, string>): any {
      const headerMap = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
      return {
        headers: {
          get: (name: string) => headerMap.get(name.toLowerCase()) || null,
        },
        nextUrl: {
          host: headers['host'] || '',
        },
      };
    }

    it('allows valid request with matching Origin and X-RASHX-CSRF header', () => {
      const req = createMockRequest({
        host: 'salon-alpha.rashx.org',
        origin: 'https://salon-alpha.rashx.org',
        'x-rashx-csrf': '1',
        'content-type': 'application/json',
      });

      const res = validateCsrf(req, { requireJson: true });
      expect(res.valid).toBe(true);
    });

    it('allows valid request with missing Origin but matching Referer', () => {
      const req = createMockRequest({
        host: 'salon-alpha.rashx.org',
        referer: 'https://salon-alpha.rashx.org/login',
        'x-rashx-csrf': '1',
      });

      const res = validateCsrf(req);
      expect(res.valid).toBe(true);
    });

    it('strictly REJECTS foreign Origin (e.g. cross-origin attack from evil.com)', () => {
      const req = createMockRequest({
        host: 'salon-alpha.rashx.org',
        origin: 'https://evil.attacker.com',
        'x-rashx-csrf': '1',
      });

      const res = validateCsrf(req);
      expect(res.valid).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.error).toContain('لا يتطابق مع المضيف المعتمد');
    });

    it('strictly REJECTS cross-subdomain Origin mismatch (e.g. salon-beta targeting salon-alpha)', () => {
      const req = createMockRequest({
        host: 'salon-alpha.rashx.org',
        origin: 'https://salon-beta.rashx.org',
        'x-rashx-csrf': '1',
      });

      const res = validateCsrf(req);
      expect(res.valid).toBe(false);
      expect(res.statusCode).toBe(403);
    });

    it('strictly REJECTS missing X-RASHX-CSRF header even if Origin matches', () => {
      const req = createMockRequest({
        host: 'salon-alpha.rashx.org',
        origin: 'https://salon-alpha.rashx.org',
      });

      const res = validateCsrf(req);
      expect(res.valid).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.error).toContain('رمز الأمان مفقود');
    });

    it('strictly REJECTS request missing both Origin and Referer on mutations', () => {
      const req = createMockRequest({
        host: 'salon-alpha.rashx.org',
        'x-rashx-csrf': '1',
      });

      const res = validateCsrf(req);
      expect(res.valid).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.error).toContain('ترويسات التحقق من المصدر مفقودة');
    });

    it('strictly REJECTS malformed Origin URL', () => {
      const req = createMockRequest({
        host: 'salon-alpha.rashx.org',
        origin: '://malformed-url',
        'x-rashx-csrf': '1',
      });

      const res = validateCsrf(req);
      expect(res.valid).toBe(false);
      expect(res.statusCode).toBe(400);
    });

    it('enforces application/json when requireJson is set', () => {
      const req = createMockRequest({
        host: 'salon-alpha.rashx.org',
        origin: 'https://salon-alpha.rashx.org',
        'x-rashx-csrf': '1',
        'content-type': 'text/plain',
      });

      const res = validateCsrf(req, { requireJson: true });
      expect(res.valid).toBe(false);
      expect(res.statusCode).toBe(415);
    });
  });

  // =========================================================================
  // 3. Tenant Provisioning Tracking Schema & Path Validation
  // =========================================================================
  describe('3. Tenant Provisioning Tracking & Invariants', () => {
    it('validates canonical path builder for tenant provisioning records', () => {
      expect(firestorePaths.tenantProvisionings()).toBe('tenant_provisioning');
      expect(firestorePaths.tenantProvisioning('usr_owner_101')).toBe(
        'tenant_provisioning/usr_owner_101'
      );
      expect(() => firestorePaths.tenantProvisioning('')).toThrow();
    });

    it('validates TenantProvisioningDocSchema for in-progress step', () => {
      const doc = {
        ownerUid: 'usr_owner_101',
        slug: 'lamsat-sara',
        crNumber: '1010123456',
        status: 'IN_PROGRESS' as const,
        step: 'USER_CREATED' as const,
        createdAt: '2026-11-22T10:00:00.000Z',
        updatedAt: '2026-11-22T10:00:00.000Z',
      };

      const parsed = TenantProvisioningDocSchema.parse(doc);
      expect(parsed.ownerUid).toBe('usr_owner_101');
      expect(parsed.status).toBe('IN_PROGRESS');
      expect(parsed.step).toBe('USER_CREATED');
    });

    it('validates TenantProvisioningDocSchema for completed step', () => {
      const doc = {
        ownerUid: 'usr_owner_101',
        tenantId: 'tenant_sara_999',
        slug: 'lamsat-sara',
        crNumber: '1010123456',
        certificateStoragePath: 'tenants/tenant_sara_999/certificates/cert.pdf',
        status: 'COMPLETED' as const,
        step: 'CR_METADATA_SAVED' as const,
        createdAt: '2026-11-22T10:00:00.000Z',
        updatedAt: '2026-11-22T10:05:00.000Z',
      };

      const parsed = TenantProvisioningDocSchema.parse(doc);
      expect(parsed.status).toBe('COMPLETED');
      expect(parsed.tenantId).toBe('tenant_sara_999');
    });

    it('validates TenantProvisioningDocSchema for failed step with error detail', () => {
      const doc = {
        ownerUid: 'usr_owner_101',
        slug: 'lamsat-sara',
        status: 'FAILED' as const,
        step: 'USER_CREATED' as const,
        error: 'Slug collision occurred',
        createdAt: '2026-11-22T10:00:00.000Z',
        updatedAt: '2026-11-22T10:01:00.000Z',
      };

      const parsed = TenantProvisioningDocSchema.parse(doc);
      expect(parsed.status).toBe('FAILED');
      expect(parsed.error).toBe('Slug collision occurred');
    });
  });

  // =========================================================================
  // 4. Certificate Storage Security & Magic-Byte Validation
  // =========================================================================
  describe('4. Certificate Storage Security & Magic-Byte Validation', () => {
    it('detects valid PDF magic bytes (%PDF)', () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]);
      expect(detectMimeFromBytes(pdfBuffer)).toBe('application/pdf');
    });

    it('detects valid JPEG magic bytes (FF D8 FF)', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      expect(detectMimeFromBytes(jpegBuffer)).toBe('image/jpeg');
    });

    it('detects valid PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      expect(detectMimeFromBytes(pngBuffer)).toBe('image/png');
    });

    it('rejects executable / script / arbitrary text buffers (e.g. MZ, ELF, shell scripts)', () => {
      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ Windows exe
      const elfBuffer = Buffer.from([0x7f, 0x45, 0x4c, 0x46]); // ELF Linux binary
      const scriptBuffer = Buffer.from('#!/bin/bash\necho hack');
      const textBuffer = Buffer.from('hello world');
      const tinyBuffer = Buffer.from([0x25, 0x50]); // too short

      expect(detectMimeFromBytes(exeBuffer)).toBeNull();
      expect(detectMimeFromBytes(elfBuffer)).toBeNull();
      expect(detectMimeFromBytes(scriptBuffer)).toBeNull();
      expect(detectMimeFromBytes(textBuffer)).toBeNull();
      expect(detectMimeFromBytes(tinyBuffer)).toBeNull();
    });

    it('enforces maximum certificate file size ceiling of 5MB', () => {
      expect(MAX_CERTIFICATE_SIZE_BYTES).toBe(5 * 1024 * 1024);
      expect(ALLOWED_CERTIFICATE_MIME_TYPES.has('application/pdf')).toBe(true);
      expect(ALLOWED_CERTIFICATE_MIME_TYPES.has('image/jpeg')).toBe(true);
      expect(ALLOWED_CERTIFICATE_MIME_TYPES.has('image/png')).toBe(true);
      expect(ALLOWED_CERTIFICATE_MIME_TYPES.has('text/html')).toBe(false);
      expect(ALLOWED_CERTIFICATE_MIME_TYPES.has('application/javascript')).toBe(false);
    });
  });
});

