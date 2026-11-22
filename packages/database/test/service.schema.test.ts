import { describe, it, expect } from 'vitest';
import {
  OperationalServiceDocSchema,
  PublicServiceProjectionSchema,
  CreateServiceInputSchema,
  UpdateServiceInputSchema,
  type OperationalServiceDoc,
} from '../src/service.schema';

describe('Service Schema & Financial Margin Isolation', () => {
  const validServiceDoc: OperationalServiceDoc = {
    id: 'srv_signature_haircut',
    tenantId: 'tenant_riyadh_01',
    name: 'Signature Royal Haircut',
    description: 'Includes consultation, hair wash, scalp massage, and custom cut.',
    category: 'Hair Care',
    priceHalalas: 25000, // 250.00 SAR
    durationMinutes: 45,
    costOfGoodsHalalas: 3500, // 35.00 SAR (Sensitive supplier COGS)
    stylistCommissionBps: 2000, // 20.00% (Sensitive commission)
    internalProcedureNotes: 'Use Moroccanoil restorative mask for 5 mins at the basin.',
    supplierSku: 'SUP-MOROCCAN-OIL-500ML',
    primaryBranchId: 'branch_olaya_main',
    assignedBranchIds: ['branch_olaya_main', 'branch_sahafa'],
    status: 'PUBLISHED',
    isVisible: true,
    isArchived: false,
    createdAt: '2026-11-20T20:00:00.000Z',
    updatedAt: '2026-11-20T21:00:00.000Z',
  };

  describe('OperationalServiceDocSchema', () => {
    it('validates a complete operational service document', () => {
      const parsed = OperationalServiceDocSchema.parse(validServiceDoc);
      expect(parsed.id).toBe('srv_signature_haircut');
      expect(parsed.priceHalalas).toBe(25000);
      expect(parsed.costOfGoodsHalalas).toBe(3500);
      expect(parsed.stylistCommissionBps).toBe(2000);
    });

    it('rejects negative price in Halalas', () => {
      expect(() =>
        OperationalServiceDocSchema.parse({
          ...validServiceDoc,
          priceHalalas: -1,
        })
      ).toThrow(/cannot be negative/);
    });

    it('rejects non-integer price in Halalas', () => {
      expect(() =>
        OperationalServiceDocSchema.parse({
          ...validServiceDoc,
          priceHalalas: 250.5,
        })
      ).toThrow(/must be an integer/);
    });

    it('rejects duration of 0 or negative', () => {
      expect(() =>
        OperationalServiceDocSchema.parse({
          ...validServiceDoc,
          durationMinutes: 0,
        })
      ).toThrow(/greater than 0/);

      expect(() =>
        OperationalServiceDocSchema.parse({
          ...validServiceDoc,
          durationMinutes: -15,
        })
      ).toThrow(/greater than 0/);
    });

    it('rejects negative COGS', () => {
      expect(() =>
        OperationalServiceDocSchema.parse({
          ...validServiceDoc,
          costOfGoodsHalalas: -500,
        })
      ).toThrow(/cannot be negative/);
    });

    it('rejects commission exceeding 10000 basis points', () => {
      expect(() =>
        OperationalServiceDocSchema.parse({
          ...validServiceDoc,
          stylistCommissionBps: 10001,
        })
      ).toThrow(/cannot exceed 10000/);
    });

    it('fails closed on unrecognized keys', () => {
      expect(() =>
        OperationalServiceDocSchema.parse({
          ...validServiceDoc,
          secretDiscountCode: 'VIP90',
        })
      ).toThrow(/unrecognized_keys/);
    });
  });

  describe('PublicServiceProjectionSchema & Financial Leakage Prevention', () => {
    const validPublicProjection = {
      id: 'srv_signature_haircut',
      name: 'Signature Royal Haircut',
      description: 'Includes consultation, hair wash, scalp massage, and custom cut.',
      category: 'Hair Care',
      priceHalalas: 25000,
      durationMinutes: 45,
      imageUrl: 'https://cdn.rashx.com/services/haircut.jpg',
      primaryBranchId: 'branch_olaya_main',
      assignedBranchIds: ['branch_olaya_main', 'branch_sahafa'],
      status: 'PUBLISHED' as const,
      isVisible: true as const,
      isArchived: false as const,
    };

    it('validates a clean public service projection', () => {
      const parsed = PublicServiceProjectionSchema.parse(validPublicProjection);
      expect(parsed.id).toBe('srv_signature_haircut');
      expect(parsed.priceHalalas).toBe(25000);
      expect(parsed.status).toBe('PUBLISHED');
      expect(parsed.isVisible).toBe(true);
      expect(parsed.isArchived).toBe(false);
    });

    it('CRITICAL: Strictly fails when operational service is parsed as public projection', () => {
      // Must throw because operational service contains costOfGoodsHalalas,
      // stylistCommissionBps, internalProcedureNotes, supplierSku, and tenantId
      expect(() => PublicServiceProjectionSchema.parse(validServiceDoc)).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects costOfGoodsHalalas in public projection', () => {
      expect(() =>
        PublicServiceProjectionSchema.parse({
          ...validPublicProjection,
          costOfGoodsHalalas: 3500,
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects stylistCommissionBps in public projection', () => {
      expect(() =>
        PublicServiceProjectionSchema.parse({
          ...validPublicProjection,
          stylistCommissionBps: 2000,
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects internalProcedureNotes in public projection', () => {
      expect(() =>
        PublicServiceProjectionSchema.parse({
          ...validPublicProjection,
          internalProcedureNotes: 'Confidential protocol',
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects supplierSku in public projection', () => {
      expect(() =>
        PublicServiceProjectionSchema.parse({
          ...validPublicProjection,
          supplierSku: 'SUP-SKU-123',
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('specifically rejects tenantId in public projection', () => {
      expect(() =>
        PublicServiceProjectionSchema.parse({
          ...validPublicProjection,
          tenantId: 'tenant_riyadh_01',
        })
      ).toThrow(/unrecognized_keys/);
    });

    it('enforces status must be PUBLISHED in public projection', () => {
      expect(() =>
        PublicServiceProjectionSchema.parse({
          ...validPublicProjection,
          status: 'DRAFT',
        })
      ).toThrow();
    });

    it('enforces isVisible must be true and isArchived must be false', () => {
      expect(() =>
        PublicServiceProjectionSchema.parse({
          ...validPublicProjection,
          isVisible: false,
        })
      ).toThrow();

      expect(() =>
        PublicServiceProjectionSchema.parse({
          ...validPublicProjection,
          isArchived: true,
        })
      ).toThrow();
    });
  });

  describe('CreateServiceInputSchema & UpdateServiceInputSchema', () => {
    it('validates service creation input with defaults', () => {
      const input = {
        tenantId: 'tenant_riyadh_01',
        name: 'Classic Beard Trim',
        category: 'Beard Grooming',
        priceHalalas: 7500,
        durationMinutes: 20,
        primaryBranchId: 'branch_olaya_main',
      };
      const parsed = CreateServiceInputSchema.parse(input);
      expect(parsed.costOfGoodsHalalas).toBe(0);
      expect(parsed.stylistCommissionBps).toBe(0);
      expect(parsed.status).toBe('DRAFT');
      expect(parsed.isVisible).toBe(false);
      expect(parsed.isArchived).toBe(false);
    });

    it('validates service update input', () => {
      const update = {
        priceHalalas: 8000,
        costOfGoodsHalalas: 1000,
        status: 'PUBLISHED' as const,
        isVisible: true,
      };
      const parsed = UpdateServiceInputSchema.parse(update);
      expect(parsed.priceHalalas).toBe(8000);
      expect(parsed.status).toBe('PUBLISHED');
    });
  });
});

