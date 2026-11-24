import { describe, it, expect } from 'vitest';
import {
  calculateServicePricing,
  roundHalfUpBigInt,
  MAX_SERVICE_PRICE_HALALAS,
} from '../src/service-pricing';
import { type TaxSettingsDoc } from '../src/company.schema';

describe('Service Pricing & Saudi Tax Calculations', () => {
  const registeredTaxSettings: TaxSettingsDoc = {
    tenantId: 'tenant_riyadh_01',
    vatStatus: 'REGISTERED',
    vatNumber: '300000000000003',
    standardVatRateBps: 1500, // 15%
    rates: [
      {
        rateBps: 500, // 5% historically
        nameAr: 'نسبة 5% السابقة',
        effectiveFrom: '2018-01-01',
        effectiveUntil: '2020-06-30',
      },
      {
        rateBps: 1500, // 15% standard
        nameAr: 'النسبة الأساسية القياسية',
        effectiveFrom: '2020-07-01',
        effectiveUntil: null,
      },
    ],
    isTaxInclusivePricing: true,
    isVatExempt: false,
    exemptionEvidencePath: null,
    verificationStatus: 'VERIFIED',
    updatedAt: '2026-11-20T10:00:00.000Z',
  };

  const exemptTaxSettings: TaxSettingsDoc = {
    ...registeredTaxSettings,
    isVatExempt: true,
  };

  const unregisteredTaxSettings: TaxSettingsDoc = {
    ...registeredTaxSettings,
    vatStatus: 'NOT_REGISTERED',
  };

  describe('Pure Integer BigInt Half-Up Rounding', () => {
    it('rounds half up accurately without floating point errors', () => {
      // 1 / 2 = 0.5 -> 1
      expect(roundHalfUpBigInt(1n, 2n)).toBe(1n);
      // 0 / 2 = 0 -> 0
      expect(roundHalfUpBigInt(0n, 2n)).toBe(0n);
      // 2 / 2 = 1 -> 1
      expect(roundHalfUpBigInt(2n, 2n)).toBe(1n);
      // 3 / 2 = 1.5 -> 2
      expect(roundHalfUpBigInt(3n, 2n)).toBe(2n);

      // Denominator 10
      expect(roundHalfUpBigInt(4n, 10n)).toBe(0n); // 0.4 -> 0
      expect(roundHalfUpBigInt(5n, 10n)).toBe(1n); // 0.5 -> 1 (half up)
      expect(roundHalfUpBigInt(6n, 10n)).toBe(1n); // 0.6 -> 1
      expect(roundHalfUpBigInt(14n, 10n)).toBe(1n); // 1.4 -> 1
      expect(roundHalfUpBigInt(15n, 10n)).toBe(2n); // 1.5 -> 2
    });

    it('rejects zero denominator', () => {
      expect(() => roundHalfUpBigInt(10n, 0n)).toThrow(/cannot be zero/);
    });
  });

  describe('Tax Inclusive Mode', () => {
    it('correctly calculates 15% VAT for 115.00 SAR (11500 Halalas)', () => {
      const result = calculateServicePricing(
        {
          basePriceHalalas: 11500,
          taxMode: 'TAX_INCLUSIVE',
          transactionDate: '2026-11-23',
        },
        registeredTaxSettings
      );

      expect(result.taxMode).toBe('TAX_INCLUSIVE');
      expect(result.taxRateBps).toBe(1500);
      expect(result.totalPriceHalalas).toBe(11500); // 115.00 SAR
      expect(result.calculatedTaxHalalas).toBe(1500); // 15.00 SAR (11500 * 1500 / 11500)
      expect(result.netPriceHalalas).toBe(10000); // 100.00 SAR
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(result.totalPriceHalalas);
    });

    it('correctly handles fractional rounding with integer Halalas (100.00 SAR)', () => {
      // 100.00 SAR inclusive at 15% VAT:
      // Tax = round(10000 * 1500 / 11500) = round(1304.3478...) = 1304 Halalas
      // Net = 10000 - 1304 = 8696 Halalas
      const result = calculateServicePricing(
        {
          basePriceHalalas: 10000,
          taxMode: 'TAX_INCLUSIVE',
          transactionDate: '2026-11-23',
        },
        registeredTaxSettings
      );

      expect(result.totalPriceHalalas).toBe(10000);
      expect(result.calculatedTaxHalalas).toBe(1304);
      expect(result.netPriceHalalas).toBe(8696);
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(result.totalPriceHalalas);
    });

    it('handles 1 Halala in inclusive mode', () => {
      // 1 Halala inclusive: tax = round(1 * 1500 / 11500) = round(0.1304) = 0 Halalas
      // Net = 1 Halala, Total = 1 Halala
      const result = calculateServicePricing(
        { basePriceHalalas: 1, taxMode: 'TAX_INCLUSIVE' },
        registeredTaxSettings
      );
      expect(result.totalPriceHalalas).toBe(1);
      expect(result.calculatedTaxHalalas).toBe(0);
      expect(result.netPriceHalalas).toBe(1);
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(result.totalPriceHalalas);
    });

    it('handles small boundary price where tax rounds to exactly 1 Halala', () => {
      // Smallest inclusive price where tax = 1 Halala:
      // round(x * 1500 / 11500) >= 1 -> x * 1500 >= 11500 / 2 = 5750 -> x >= 5750 / 1500 = 3.833... -> x = 4 Halalas!
      // For 4 Halalas: tax = round(6000 / 11500) = 1 Halala. Net = 3 Halalas.
      const result = calculateServicePricing(
        { basePriceHalalas: 4, taxMode: 'TAX_INCLUSIVE' },
        registeredTaxSettings
      );
      expect(result.calculatedTaxHalalas).toBe(1);
      expect(result.netPriceHalalas).toBe(3);
      expect(result.totalPriceHalalas).toBe(4);
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(result.totalPriceHalalas);
    });
  });

  describe('Tax Exclusive Mode', () => {
    it('correctly adds 15% VAT on top of 100.00 SAR net (10000 Halalas)', () => {
      const result = calculateServicePricing(
        {
          basePriceHalalas: 10000,
          taxMode: 'TAX_EXCLUSIVE',
          transactionDate: '2026-11-23',
        },
        registeredTaxSettings
      );

      expect(result.taxMode).toBe('TAX_EXCLUSIVE');
      expect(result.taxRateBps).toBe(1500);
      expect(result.netPriceHalalas).toBe(10000);
      expect(result.calculatedTaxHalalas).toBe(1500);
      expect(result.totalPriceHalalas).toBe(11500);
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(result.totalPriceHalalas);
    });

    it('handles fractional rounding in tax exclusive calculations (33.33 SAR)', () => {
      // 33.33 SAR net (3333 Halalas) at 15%:
      // Tax = round(3333 * 1500 / 10000) = round(499.95) = 500 Halalas
      // Total = 3333 + 500 = 3833 Halalas
      const result = calculateServicePricing(
        {
          basePriceHalalas: 3333,
          taxMode: 'TAX_EXCLUSIVE',
          transactionDate: '2026-11-23',
        },
        registeredTaxSettings
      );

      expect(result.netPriceHalalas).toBe(3333);
      expect(result.calculatedTaxHalalas).toBe(500);
      expect(result.totalPriceHalalas).toBe(3833);
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(result.totalPriceHalalas);
    });

    it('handles 1 Halala net in exclusive mode', () => {
      // 1 Halala net: tax = round(1 * 1500 / 10000) = round(0.15) = 0 Halalas
      // Total = 1 Halala
      const result = calculateServicePricing(
        { basePriceHalalas: 1, taxMode: 'TAX_EXCLUSIVE' },
        registeredTaxSettings
      );
      expect(result.netPriceHalalas).toBe(1);
      expect(result.calculatedTaxHalalas).toBe(0);
      expect(result.totalPriceHalalas).toBe(1);
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(result.totalPriceHalalas);
    });

    it('handles rounding boundary at exact 0.5 Halala in exclusive mode', () => {
      // When does net * 1500 / 10000 have remainder 5000?
      // net * 15 = 50 -> net = 50 / 15 not integer.
      // But for net = 7: 7 * 1500 = 10500. 10500 / 10000 = 1.05 -> round(1.05) = 1.
      // For net = 3: 3 * 1500 = 4500. 4500 / 10000 = 0.45 -> round(0.45) = 0.
      const res3 = calculateServicePricing(
        { basePriceHalalas: 3, taxMode: 'TAX_EXCLUSIVE' },
        registeredTaxSettings
      );
      expect(res3.calculatedTaxHalalas).toBe(0);
      expect(res3.totalPriceHalalas).toBe(3);

      const res4 = calculateServicePricing(
        { basePriceHalalas: 4, taxMode: 'TAX_EXCLUSIVE' },
        registeredTaxSettings
      );
      // 4 * 1500 = 6000 / 10000 = 0.6 -> rounds to 1 Halala
      expect(res4.calculatedTaxHalalas).toBe(1);
      expect(res4.totalPriceHalalas).toBe(5);
    });
  });

  describe('Large Numbers & Maximum Supported Range', () => {
    it('handles large valid price (1,000,000.00 SAR = 100,000,000 Halalas)', () => {
      const result = calculateServicePricing(
        {
          basePriceHalalas: 100_000_000,
          taxMode: 'TAX_INCLUSIVE',
          transactionDate: '2026-11-23',
        },
        registeredTaxSettings
      );

      expect(result.totalPriceHalalas).toBe(100_000_000);
      // Tax = round(100_000_000 * 1500 / 11500) = 13043478
      expect(result.calculatedTaxHalalas).toBe(13043478);
      expect(result.netPriceHalalas).toBe(86956522);
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(result.totalPriceHalalas);
    });

    it('handles maximum supported service price (10 Billion Halalas)', () => {
      const result = calculateServicePricing(
        {
          basePriceHalalas: MAX_SERVICE_PRICE_HALALAS,
          taxMode: 'TAX_INCLUSIVE',
          transactionDate: '2026-11-23',
        },
        registeredTaxSettings
      );

      expect(result.totalPriceHalalas).toBe(MAX_SERVICE_PRICE_HALALAS);
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(MAX_SERVICE_PRICE_HALALAS);
    });

    it('rejects price exceeding MAX_SERVICE_PRICE_HALALAS', () => {
      expect(() =>
        calculateServicePricing(
          { basePriceHalalas: MAX_SERVICE_PRICE_HALALAS + 1 },
          registeredTaxSettings
        )
      ).toThrow(/يتجاوز الحد الأقصى/);
    });
  });

  describe('Tax Exempt & Unregistered Scenarios', () => {
    it('zero tax when service itself is marked TAX_EXEMPT', () => {
      const result = calculateServicePricing(
        { basePriceHalalas: 25000, taxMode: 'TAX_EXEMPT' },
        registeredTaxSettings
      );

      expect(result.taxRateBps).toBe(0);
      expect(result.calculatedTaxHalalas).toBe(0);
      expect(result.netPriceHalalas).toBe(25000);
      expect(result.totalPriceHalalas).toBe(25000);
      expect(result.isVatExempt).toBe(true);
    });

    it('zero tax when tenant is marked exempt', () => {
      const result = calculateServicePricing(
        { basePriceHalalas: 25000, taxMode: 'TAX_INCLUSIVE' },
        exemptTaxSettings
      );

      expect(result.taxRateBps).toBe(0);
      expect(result.calculatedTaxHalalas).toBe(0);
      expect(result.totalPriceHalalas).toBe(25000);
      expect(result.netPriceHalalas).toBe(25000);
      expect(result.isVatExempt).toBe(true);
    });

    it('zero tax when tenant is NOT_REGISTERED', () => {
      const result = calculateServicePricing(
        { basePriceHalalas: 25000, taxMode: 'TAX_INCLUSIVE' },
        unregisteredTaxSettings
      );

      expect(result.taxRateBps).toBe(0);
      expect(result.calculatedTaxHalalas).toBe(0);
      expect(result.totalPriceHalalas).toBe(25000);
      expect(result.isVatExempt).toBe(true);
    });
  });

  describe('Effective-Dated VAT Schedules', () => {
    it('uses historical 5% rate for transaction prior to July 2020', () => {
      const result = calculateServicePricing(
        {
          basePriceHalalas: 10500,
          taxMode: 'TAX_INCLUSIVE',
          transactionDate: '2020-03-15',
        },
        registeredTaxSettings
      );

      expect(result.taxRateBps).toBe(500); // 5.00%
      expect(result.calculatedTaxHalalas).toBe(500);
      expect(result.netPriceHalalas).toBe(10000);
      expect(result.totalPriceHalalas).toBe(10500);
    });

    it('uses standard 15% rate for transaction after July 2020', () => {
      const result = calculateServicePricing(
        {
          basePriceHalalas: 11500,
          taxMode: 'TAX_INCLUSIVE',
          transactionDate: '2021-01-01',
        },
        registeredTaxSettings
      );

      expect(result.taxRateBps).toBe(1500);
      expect(result.calculatedTaxHalalas).toBe(1500);
    });
  });

  describe('Validation & Boundary Rejections', () => {
    it('rejects negative base price', () => {
      expect(() =>
        calculateServicePricing({ basePriceHalalas: -100 })
      ).toThrow(/سالباً/);
    });

    it('rejects non-integer base price', () => {
      expect(() =>
        calculateServicePricing({ basePriceHalalas: 100.5 })
      ).toThrow(/رقماً صحيحاً/);
    });

    it('rejects NaN, Infinity, -Infinity', () => {
      expect(() =>
        calculateServicePricing({ basePriceHalalas: NaN })
      ).toThrow(/رقماً صالحاً/);

      expect(() =>
        calculateServicePricing({ basePriceHalalas: Infinity })
      ).toThrow(/رقماً صالحاً/);

      expect(() =>
        calculateServicePricing({ basePriceHalalas: -Infinity })
      ).toThrow(/رقماً صالحاً/);
    });

    it('allows 0 Halalas base price (free promotional service)', () => {
      const result = calculateServicePricing(
        { basePriceHalalas: 0, taxMode: 'TAX_INCLUSIVE' },
        registeredTaxSettings
      );
      expect(result.totalPriceHalalas).toBe(0);
      expect(result.calculatedTaxHalalas).toBe(0);
      expect(result.netPriceHalalas).toBe(0);
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(result.totalPriceHalalas);
    });

    it('allows maximum base price of 10 Million SAR (1,000,000,000 Halalas) tax-inclusive', () => {
      const result = calculateServicePricing(
        {
          basePriceHalalas: MAX_SERVICE_PRICE_HALALAS,
          taxMode: 'TAX_INCLUSIVE',
          transactionDate: '2026-11-23',
        },
        registeredTaxSettings
      );
      expect(result.basePriceHalalas).toBe(10_000_000_00);
      expect(result.totalPriceHalalas).toBe(10_000_000_00);
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(result.totalPriceHalalas);
    });

    it('rejects base price exceeding 10 Million SAR by 1 Halala (1,000,000,001 Halalas)', () => {
      expect(() =>
        calculateServicePricing({
          basePriceHalalas: MAX_SERVICE_PRICE_HALALAS + 1,
          taxMode: 'TAX_INCLUSIVE',
        })
      ).toThrow(/يتجاوز الحد الأقصى المسموح به/);
    });

    it('rejects TAX_EXCLUSIVE service when post-VAT total exceeds 10 Million SAR ceiling', () => {
      // 9,000,000.00 SAR base + 15% VAT = 10,350,000.00 SAR > 10,000,000.00 SAR
      expect(() =>
        calculateServicePricing(
          {
            basePriceHalalas: 9_000_000_00,
            taxMode: 'TAX_EXCLUSIVE',
            transactionDate: '2026-11-23',
          },
          registeredTaxSettings
        )
      ).toThrow(/يتجاوز الحد الأقصى المسموح به/);
    });

    it('allows TAX_EXCLUSIVE service whose post-VAT total exactly equals 10 Million SAR ceiling', () => {
      // 8,695,652.17 SAR (869565217 Halalas) at 15% VAT:
      // Tax = roundHalfUp(869565217 * 1500 / 10000) = 130434783 Halalas
      // Total = 869565217 + 130434783 = 1,000,000,000 Halalas (10 Million SAR)
      const result = calculateServicePricing(
        {
          basePriceHalalas: 869565217,
          taxMode: 'TAX_EXCLUSIVE',
          transactionDate: '2026-11-23',
        },
        registeredTaxSettings
      );
      expect(result.totalPriceHalalas).toBe(10_000_000_00);
      expect(result.calculatedTaxHalalas).toBe(130434783);
      expect(result.netPriceHalalas).toBe(869565217);
      expect(result.netPriceHalalas + result.calculatedTaxHalalas).toBe(result.totalPriceHalalas);
    });

    it('fails safely when effective tax rate cannot be resolved', () => {
      const invalidTaxSettings = {
        tenantId: 'tenant_broken',
        vatStatus: 'REGISTERED' as const,
        isVatExempt: false,
        standardVatRateBps: undefined as any,
        rates: [],
        verificationStatus: 'VERIFIED' as const,
        updatedAt: '2026-11-20T10:00:00.000Z',
      };

      expect(() =>
        calculateServicePricing(
          {
            basePriceHalalas: 10000,
            taxMode: 'TAX_INCLUSIVE',
            transactionDate: '2026-11-23',
          },
          invalidTaxSettings as any
        )
      ).toThrow(/تعذر تحديد نسبة ضريبة القيمة المضافة/);
    });
  });

  describe('Phase 3.1.2: Strict Integer Financial Input Validation', () => {
    it('rejects fractional halala input (100.5 halalas)', () => {
      expect(() =>
        calculateServicePricing(
          {
            basePriceHalalas: 100.5,
            taxMode: 'TAX_INCLUSIVE',
          },
          registeredTaxSettings
        )
      ).toThrow(/بدون كسور عشرية/);
    });

    it('rejects negative halala input (-1 halala)', () => {
      expect(() =>
        calculateServicePricing(
          {
            basePriceHalalas: -1,
            taxMode: 'TAX_INCLUSIVE',
          },
          registeredTaxSettings
        )
      ).toThrow(/لا يمكن أن يكون سالباً/);
    });

    it('rejects NaN input', () => {
      expect(() =>
        calculateServicePricing(
          {
            basePriceHalalas: NaN,
            taxMode: 'TAX_INCLUSIVE',
          },
          registeredTaxSettings
        )
      ).toThrow(/رقماً صالحاً ومحدداً/);
    });

    it('rejects Infinity and -Infinity input', () => {
      expect(() =>
        calculateServicePricing(
          {
            basePriceHalalas: Infinity,
            taxMode: 'TAX_INCLUSIVE',
          },
          registeredTaxSettings
        )
      ).toThrow(/رقماً صالحاً ومحدداً/);

      expect(() =>
        calculateServicePricing(
          {
            basePriceHalalas: -Infinity,
            taxMode: 'TAX_INCLUSIVE',
          },
          registeredTaxSettings
        )
      ).toThrow(/رقماً صالحاً ومحدداً/);
    });

    it('rejects Number.MAX_SAFE_INTEGER + 1 and unsafe integers', () => {
      expect(() =>
        calculateServicePricing(
          {
            basePriceHalalas: Number.MAX_SAFE_INTEGER + 1,
            taxMode: 'TAX_INCLUSIVE',
          },
          registeredTaxSettings
        )
      ).toThrow(/يتجاوز الحد الأقصى المسموح به|MAX_SAFE_INTEGER/);
    });

    it('accepts zero halalas (free promotional service)', () => {
      const res = calculateServicePricing(
        {
          basePriceHalalas: 0,
          taxMode: 'TAX_INCLUSIVE',
        },
        registeredTaxSettings
      );
      expect(res.totalPriceHalalas).toBe(0);
      expect(res.calculatedTaxHalalas).toBe(0);
      expect(res.netPriceHalalas).toBe(0);
    });

    it('accurately verifies all standard VAT boundary percentages (0%, 5%, 15%, 100%)', () => {
      // 0%
      const res0 = calculateServicePricing(
        {
          basePriceHalalas: 10000,
          taxMode: 'TAX_EXCLUSIVE',
          customTaxRateBps: 0,
        },
        registeredTaxSettings
      );
      expect(res0.calculatedTaxHalalas).toBe(0);
      expect(res0.totalPriceHalalas).toBe(10000);

      // 5% (500 bps) on 100 SAR exclusive
      const res5 = calculateServicePricing(
        {
          basePriceHalalas: 10000,
          taxMode: 'TAX_EXCLUSIVE',
          customTaxRateBps: 500,
        },
        registeredTaxSettings
      );
      expect(res5.calculatedTaxHalalas).toBe(500); // 5 SAR
      expect(res5.totalPriceHalalas).toBe(10500);

      // 15% (1500 bps) on 100 SAR exclusive
      const res15 = calculateServicePricing(
        {
          basePriceHalalas: 10000,
          taxMode: 'TAX_EXCLUSIVE',
          customTaxRateBps: 1500,
        },
        registeredTaxSettings
      );
      expect(res15.calculatedTaxHalalas).toBe(1500); // 15 SAR
      expect(res15.totalPriceHalalas).toBe(11500);

      // 100% (10000 bps) on 100 SAR exclusive
      const res100 = calculateServicePricing(
        {
          basePriceHalalas: 10000,
          taxMode: 'TAX_EXCLUSIVE',
          customTaxRateBps: 10000,
        },
        registeredTaxSettings
      );
      expect(res100.calculatedTaxHalalas).toBe(10000); // 100 SAR
      expect(res100.totalPriceHalalas).toBe(20000);
    });
  });
});
