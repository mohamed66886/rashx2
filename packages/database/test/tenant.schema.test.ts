import { describe, it, expect } from 'vitest';
import {
  TenantDocSchema,
  PublicTenantProfileSchema,
  CreateTenantInputSchema,
  UpdateTenantInputSchema,
  SaudiCrNumberSchema,
  SaudiVatNumberSchema,
  type TenantDoc,
} from '../src/tenant.schema';

describe('Tenant Schema & Projection Security', () => {
  const validTenantDoc: TenantDoc = {
    id: 'tenant_riyadh_01',
    slug: 'riyadh-salon',
    name: 'Riyadh Luxury Salon',
    commercialName: 'Riyadh Beauty Trading Est.',
    crNumber: '1010123456',
    vatNumber: '310123456789012',
    status: 'ACTIVE',
    isPublished: true,
    primaryOwnerUid: 'auth_user_owner_01',
    subscriptionTier: 'GROWTH',
    billingEmail: 'billing@riyadhsalon.sa',
    timezone: 'Asia/Riyadh',
    currency: 'SAR',
    createdAt: '2026-11-20T20:00:00.000Z',
    updatedAt: '2026-11-20T21:00:00.000Z',
  };

  describe('Saudi Legal Validation: CR and VAT', () => {
    it('accepts valid 10-digit Saudi Commercial Registration numbers', () => {
      expect(SaudiCrNumberSchema.parse('1010123456')).toBe('1010123456');
      expect(SaudiCrNumberSchema.parse('7001234567')).toBe('7001234567');
    });

    it('rejects invalid Saudi CR numbers (wrong length, non-numeric)', () => {
      expect(() => SaudiCrNumberSchema.parse('101012345')).toThrow();
      expect(() => SaudiCrNumberSchema.parse('10101234567')).toThrow();
      expect(() => SaudiCrNumberSchema.parse('101012345A')).toThrow();
      expect(() => SaudiCrNumberSchema.parse('')).toThrow();
    });

    it('accepts valid 15-digit Saudi VAT numbers starting with 3', () => {
      expect(SaudiVatNumberSchema.parse('310123456789012')).toBe('310123456789012');
      expect(SaudiVatNumberSchema.parse('300000000000003')).toBe('300000000000003');
    });

    it('rejects invalid Saudi VAT numbers (wrong length, does not start with 3)', () => {
      expect(() => SaudiVatNumberSchema.parse('110123456789012')).toThrow(); // starts with 1
      expect(() => SaudiVatNumberSchema.parse('31012345678901')).toThrow(); // 14 digits
      expect(() => SaudiVatNumberSchema.parse('3101234567890123')).toThrow(); // 16 digits
      expect(() => SaudiVatNumberSchema.parse('31012345678901A')).toThrow(); // letter
    });
  });

  describe('TenantDocSchema (Operational Document)', () => {
    it('validates a complete operational tenant document', () => {
      const parsed = TenantDocSchema.parse(validTenantDoc);
      expect(parsed.id).toBe('tenant_riyadh_01');
      expect(parsed.crNumber).toBe('1010123456');
      expect(parsed.vatNumber).toBe('310123456789012');
      expect(parsed.subscriptionTier).toBe('GROWTH');
      expect(parsed.timezone).toBe('Asia/Riyadh');
      expect(parsed.currency).toBe('SAR');
    });

    it('rejects invalid lifecycle statuses', () => {
      expect(() =>
        TenantDocSchema.parse({
          ...validTenantDoc,
          status: 'UNAUTHORIZED_STATUS',
        })
      ).toThrow();
    });

    it('rejects invalid subscription tiers', () => {
      expect(() =>
        TenantDocSchema.parse({
          ...validTenantDoc,
          subscriptionTier: 'UNLIMITED_VIP',
        })
      ).toThrow();
    });

    it('fails closed on unexpected keys (.strict enforcement)', () => {
      expect(() =>
        TenantDocSchema.parse({
          ...validTenantDoc,
          extraField: 'not allowed',
        })
      ).toThrow(/unrecognized_keys/);
    });
  });

  describe('PublicTenantProfileSchema & Projection Isolation', () => {
    const validPublicProfile = {
      id: 'tenant_riyadh_01',
      slug: 'riyadh-salon',
      name: 'Riyadh Luxury Salon',
      logoUrl: 'https://cdn.rashx.com/logos/riyadh-salon.png',
      coverImageUrl: 'https://cdn.rashx.com/covers/riyadh-salon.png',
      socialLinks: {
        instagram: 'https://instagram.com/riyadhsalon',
      },
      publicAddress: 'Olaya Street, Riyadh',
      publicPhone: '+966112345678',
      bookingPolicy: 'Please arrive 10 minutes prior to your booking.',
      updatedAt: '2026-11-20T21:00:00.000Z',
    };

    it('validates a clean public tenant profile', () => {
      const parsed = PublicTenantProfileSchema.parse(validPublicProfile);
      expect(parsed.id).toBe('tenant_riyadh_01');
      expect(parsed.slug).toBe('riyadh-salon');
      expect(parsed.logoUrl).toBe('https://cdn.rashx.com/logos/riyadh-salon.png');
    });

    it('CRITICAL: Strictly fails when operational document is parsed as public projection', () => {
      // Passing operational tenant document directly into PublicTenantProfileSchema MUST throw
      // because sensitive fields (crNumber, vatNumber, primaryOwnerUid, subscriptionTier, billingEmail)
      // are not permitted in public projections.
      expect(() => PublicTenantProfileSchema.parse(validTenantDoc)).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects crNumber in public projection', () => {
      expect(() =>
        PublicTenantProfileSchema.parse({
          ...validPublicProfile,
          crNumber: '1010123456',
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects vatNumber in public projection', () => {
      expect(() =>
        PublicTenantProfileSchema.parse({
          ...validPublicProfile,
          vatNumber: '310123456789012',
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects primaryOwnerUid in public projection', () => {
      expect(() =>
        PublicTenantProfileSchema.parse({
          ...validPublicProfile,
          primaryOwnerUid: 'auth_user_owner_01',
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects billingEmail in public projection', () => {
      expect(() =>
        PublicTenantProfileSchema.parse({
          ...validPublicProfile,
          billingEmail: 'billing@riyadhsalon.sa',
        })
      ).toThrow(/unrecognized_keys/);
    });
  });

  describe('CreateTenantInputSchema & UpdateTenantInputSchema', () => {
    it('validates tenant creation input with default tier', () => {
      const input = {
        slug: 'jaddah-beauty',
        name: 'Jeddah Beauty Lounge',
        commercialName: 'Jeddah Beauty Co.',
        crNumber: '4030123456',
        vatNumber: '340312345678901',
        primaryOwnerUid: 'auth_user_jeddah_01',
        billingEmail: 'billing@jeddahbeauty.sa',
      };
      const result = CreateTenantInputSchema.parse(input);
      expect(result.subscriptionTier).toBe('STARTER');
    });

    it('validates partial update inputs strictly', () => {
      const update = {
        name: 'Updated Name',
        isPublished: true,
      };
      const result = UpdateTenantInputSchema.parse(update);
      expect(result.name).toBe('Updated Name');
      expect(result.isPublished).toBe(true);

      // Rejects unknown properties
      expect(() =>
        UpdateTenantInputSchema.parse({
          ...update,
          unauthorizedField: 123,
        })
      ).toThrow(/unrecognized_keys/);
    });
  });
});

