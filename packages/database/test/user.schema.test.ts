import { describe, it, expect } from 'vitest';
import { UserDocSchema, CreateUserInputSchema } from '../src/user.schema';
import { CommercialRegistrationDocSchema } from '../src/tenant.schema';

describe('User & Commercial Registration Schemas', () => {
  it('should validate a valid UserDoc', () => {
    const validUser = {
      id: 'usr_saudi_owner_01',
      email: 'owner@salon.sa',
      displayName: 'نورة العتيبي',
      photoUrl: 'https://cdn.rashx.org/avatars/noura.jpg',
      phoneNumber: '+966501234567',
      disabled: false,
      createdAt: '2026-11-21T10:00:00.000Z',
      updatedAt: '2026-11-21T10:00:00.000Z',
    };

    const parsed = UserDocSchema.parse(validUser);
    expect(parsed.id).toBe('usr_saudi_owner_01');
    expect(parsed.email).toBe('owner@salon.sa');
    expect(parsed.displayName).toBe('نورة العتيبي');
    expect(parsed.disabled).toBe(false);
  });

  it('should reject invalid user phone numbers or emails', () => {
    expect(() =>
      UserDocSchema.parse({
        id: 'usr_01',
        email: 'invalid-email',
        displayName: 'Test',
        disabled: false,
        createdAt: '2026-11-21T10:00:00.000Z',
        updatedAt: '2026-11-21T10:00:00.000Z',
      })
    ).toThrow();

    expect(() =>
      UserDocSchema.parse({
        id: 'usr_01',
        email: 'valid@example.com',
        displayName: 'Test',
        phoneNumber: '0501234567', // Not E.164 (+966...)
        disabled: false,
        createdAt: '2026-11-21T10:00:00.000Z',
        updatedAt: '2026-11-21T10:00:00.000Z',
      })
    ).toThrow();
  });

  it('should validate CreateUserInputSchema with optional fields', () => {
    const input = {
      id: 'usr_02',
      email: 'stylist@rashx.org',
      displayName: 'سارة خالد',
      phoneNumber: '+966555123456',
    };

    const parsed = CreateUserInputSchema.parse(input);
    expect(parsed.id).toBe('usr_02');
    expect(parsed.disabled).toBe(false);
  });

  it('should validate CommercialRegistrationDocSchema', () => {
    const validCR = {
      tenantId: 'tenant_olaya_01',
      crNumber: '1010123456',
      certificateStoragePath: 'tenants/tenant_olaya_01/certificates/cr_cert_123.pdf',
      certificateFileName: 'cr_cert_123.pdf',
      certificateContentType: 'application/pdf',
      certificateFileSizeBytes: 1024 * 500, // 500KB
      status: 'PENDING_REVIEW',
      uploadedByUid: 'usr_saudi_owner_01',
      uploadedAt: '2026-11-21T10:00:00.000Z',
      updatedAt: '2026-11-21T10:00:00.000Z',
    };

    const parsed = CommercialRegistrationDocSchema.parse(validCR);
    expect(parsed.tenantId).toBe('tenant_olaya_01');
    expect(parsed.crNumber).toBe('1010123456');
    expect(parsed.status).toBe('PENDING_REVIEW');
  });

  it('should reject CommercialRegistrationDoc exceeding 5MB or invalid MIME', () => {
    expect(() =>
      CommercialRegistrationDocSchema.parse({
        tenantId: 'tenant_olaya_01',
        crNumber: '1010123456',
        certificateStoragePath: 'path/to/file.exe',
        certificateFileName: 'file.exe',
        certificateContentType: 'application/x-msdownload' as any,
        certificateFileSizeBytes: 1024,
        status: 'PENDING_REVIEW',
        uploadedByUid: 'usr_01',
        uploadedAt: '2026-11-21T10:00:00.000Z',
        updatedAt: '2026-11-21T10:00:00.000Z',
      })
    ).toThrow();

    expect(() =>
      CommercialRegistrationDocSchema.parse({
        tenantId: 'tenant_olaya_01',
        crNumber: '1010123456',
        certificateStoragePath: 'path/to/large.pdf',
        certificateFileName: 'large.pdf',
        certificateContentType: 'application/pdf',
        certificateFileSizeBytes: 6 * 1024 * 1024, // 6MB > 5MB
        status: 'PENDING_REVIEW',
        uploadedByUid: 'usr_01',
        uploadedAt: '2026-11-21T10:00:00.000Z',
        updatedAt: '2026-11-21T10:00:00.000Z',
      })
    ).toThrow();
  });
});

