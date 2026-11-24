import { z } from 'zod';
import type { TaxSettingsDoc } from './company.schema';

export const TaxModeEnum = z.enum(['TAX_INCLUSIVE', 'TAX_EXCLUSIVE', 'TAX_EXEMPT']);
export type TaxMode = z.infer<typeof TaxModeEnum>;

/**
 * Authoritative Maximum Service Price Ceilings in Integer Halalas (1 SAR = 100 Halalas):
 * 1,000,000,000 Halalas = 10,000,000.00 SAR (Ten Million Saudi Riyals).
 * Well within Number.MAX_SAFE_INTEGER (9,007,199,254,740,991).
 */
export const MAX_SERVICE_BASE_PRICE_HALALAS = 10_000_000_00; // 1 Billion Halalas = 10 Million SAR
export const MAX_SERVICE_TOTAL_PRICE_HALALAS = 10_000_000_00; // 1 Billion Halalas = 10 Million SAR
export const MAX_SERVICE_PRICE_HALALAS = MAX_SERVICE_BASE_PRICE_HALALAS; // Canonical reference

export interface ServicePricingCalculation {
  basePriceHalalas: number;
  currency: 'SAR';
  taxMode: TaxMode;
  taxRateBps: number;
  netPriceHalalas: number;
  calculatedTaxHalalas: number;
  totalPriceHalalas: number;
  isVatExempt: boolean;
  rateSource: string;
}

export interface CalculatePricingInput {
  basePriceHalalas: number;
  taxMode?: TaxMode;
  customTaxRateBps?: number | null;
  transactionDate?: string;
}

/**
 * Documented Half-Up Rounding using pure integer BigInt arithmetic.
 * For positive numerator N and denominator D:
 * roundHalfUp(N / D) = floor((N + floor(D / 2)) / D)
 * Guarantees zero floating-point error.
 */
export function roundHalfUpBigInt(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) {
    throw new Error('Denominator cannot be zero in tax calculation');
  }
  if (numerator < 0n || denominator < 0n) {
    throw new Error('Numerator and denominator must be non-negative in tax calculation');
  }
  const halfDenominator = denominator / 2n;
  return (numerator + halfDenominator) / denominator;
}

/**
 * Authoritatively resolves the effective VAT rate in basis points for a transaction date.
 * Does NOT assume a hardcoded rate when missing or invalid.
 */
export function resolveEffectiveTaxRate(
  taxSettings?: TaxSettingsDoc | null,
  transactionDate?: string,
  customTaxRateBps?: number | null
): { taxRateBps: number; rateSource: string; isVatExempt: boolean } {
  if (customTaxRateBps !== undefined && customTaxRateBps !== null) {
    if (!Number.isInteger(customTaxRateBps) || customTaxRateBps < 0 || customTaxRateBps > 10000) {
      throw new Error('نسبة الضريبة المخصصة يجب أن تكون رقماً صحيحاً بين 0 و 10000 نقطة أساس');
    }
    return {
      taxRateBps: customTaxRateBps,
      rateSource: `نسبة ضريبية مخصصة للخدمة (${(customTaxRateBps / 100).toFixed(2)}%)`,
      isVatExempt: customTaxRateBps === 0,
    };
  }

  if (!taxSettings || taxSettings.vatStatus === 'NOT_REGISTERED') {
    return {
      taxRateBps: 0,
      rateSource: 'المنشأة غير مسجلة في ضريبة القيمة المضافة',
      isVatExempt: true,
    };
  }

  if (taxSettings.isVatExempt) {
    return {
      taxRateBps: 0,
      rateSource: 'المنشأة معفاة رسمياً من ضريبة القيمة المضافة',
      isVatExempt: true,
    };
  }

  const targetDate = transactionDate || new Date().toISOString().split('T')[0]!;

  // Look for matching effective-dated schedule
  if (taxSettings.rates && taxSettings.rates.length > 0) {
    const match = taxSettings.rates.find((r) => {
      const afterStart = targetDate >= r.effectiveFrom;
      const beforeEnd = !r.effectiveUntil || targetDate <= r.effectiveUntil;
      return afterStart && beforeEnd;
    });
    if (match) {
      return {
        taxRateBps: match.rateBps,
        rateSource: `جدول الضريبة المعتمد: ${match.nameAr} (${(match.rateBps / 100).toFixed(2)}%)`,
        isVatExempt: match.rateBps === 0,
      };
    }
  }

  // Fallback to configured standard rate
  if (typeof taxSettings.standardVatRateBps === 'number' && Number.isInteger(taxSettings.standardVatRateBps)) {
    return {
      taxRateBps: taxSettings.standardVatRateBps,
      rateSource: `النسبة القياسية للمنشأة (${(taxSettings.standardVatRateBps / 100).toFixed(2)}%)`,
      isVatExempt: taxSettings.standardVatRateBps === 0,
    };
  }

  throw new Error(`تعذر تحديد نسبة ضريبة القيمة المضافة السارية لتاريخ المعاملة (${targetDate})`);
}

/**
 * Calculates authoritative service pricing and tax breakdown in exact integer Halalas.
 *
 * Invariant: netPriceHalalas + calculatedTaxHalalas === totalPriceHalalas across all modes.
 */
export function calculateServicePricing(
  input: CalculatePricingInput,
  taxSettings?: TaxSettingsDoc | null
): ServicePricingCalculation {
  const { basePriceHalalas, taxMode = 'TAX_INCLUSIVE', customTaxRateBps, transactionDate } = input;

  // 1. Strict Monetary Validation
  if (typeof basePriceHalalas !== 'number' || !Number.isFinite(basePriceHalalas) || Number.isNaN(basePriceHalalas)) {
    throw new Error('السعر الأساسي يجب أن يكون رقماً صالحاً ومحدداً');
  }
  if (!Number.isInteger(basePriceHalalas)) {
    throw new Error('السعر الأساسي يجب أن يكون رقماً صحيحاً بالهللات (بدون كسور عشرية)');
  }
  if (!Number.isSafeInteger(basePriceHalalas)) {
    throw new Error('السعر الأساسي يتجاوز الحدود الرقمية الآمنة (MAX_SAFE_INTEGER)');
  }
  if (basePriceHalalas < 0) {
    throw new Error('السعر الأساسي لا يمكن أن يكون سالباً');
  }
  if (basePriceHalalas > MAX_SERVICE_BASE_PRICE_HALALAS) {
    throw new Error(
      `السعر الأساسي يتجاوز الحد الأقصى المسموح به (${MAX_SERVICE_BASE_PRICE_HALALAS / 100} ريال سعودي)`
    );
  }

  // 2. Resolve Tax Rate
  let taxRateBps = 0;
  let rateSource = 'معفى من الضريبة';
  let isVatExempt = true;

  if (taxMode === 'TAX_EXEMPT') {
    taxRateBps = 0;
    rateSource = 'الخدمة معفاة صراحة من ضريبة القيمة المضافة';
    isVatExempt = true;
  } else {
    const resolved = resolveEffectiveTaxRate(taxSettings, transactionDate, customTaxRateBps);
    taxRateBps = resolved.taxRateBps;
    rateSource = resolved.rateSource;
    isVatExempt = resolved.isVatExempt;
  }

  // 3. Exact Integer Arithmetic
  let netPriceHalalas: number;
  let calculatedTaxHalalas: number;
  let totalPriceHalalas: number;

  const baseBig = BigInt(basePriceHalalas);
  const rateBig = BigInt(taxRateBps);

  if (taxRateBps === 0 || isVatExempt) {
    netPriceHalalas = basePriceHalalas;
    calculatedTaxHalalas = 0;
    totalPriceHalalas = basePriceHalalas;
  } else if (taxMode === 'TAX_INCLUSIVE') {
    // Total is fixed to basePriceHalalas
    totalPriceHalalas = basePriceHalalas;
    // tax = roundHalfUp(total * rate / (10000 + rate))
    const taxNumerator = baseBig * rateBig;
    const taxDenominator = 10000n + rateBig;
    calculatedTaxHalalas = Number(roundHalfUpBigInt(taxNumerator, taxDenominator));
    netPriceHalalas = totalPriceHalalas - calculatedTaxHalalas;
  } else {
    // TAX_EXCLUSIVE: Net is fixed to basePriceHalalas
    netPriceHalalas = basePriceHalalas;
    // tax = roundHalfUp(net * rate / 10000)
    const taxNumerator = baseBig * rateBig;
    const taxDenominator = 10000n;
    calculatedTaxHalalas = Number(roundHalfUpBigInt(taxNumerator, taxDenominator));
    totalPriceHalalas = netPriceHalalas + calculatedTaxHalalas;
  }

  // Validate safe integer bounds and final total ceiling
  if (!Number.isSafeInteger(totalPriceHalalas)) {
    throw new Error('القيمة الحسابية تتجاوز الحدود الآمنة للأرقام (MAX_SAFE_INTEGER)');
  }
  if (totalPriceHalalas > MAX_SERVICE_TOTAL_PRICE_HALALAS) {
    throw new Error(
      `السعر الإجمالي بعد احتساب الضريبة (${totalPriceHalalas / 100} ريال سعودي) يتجاوز الحد الأقصى المسموح به (${MAX_SERVICE_TOTAL_PRICE_HALALAS / 100} ريال سعودي)`
    );
  }

  // Safety assert invariant
  if (netPriceHalalas + calculatedTaxHalalas !== totalPriceHalalas) {
    throw new Error(
      `خلل حسابي: صافي السعر (${netPriceHalalas}) + الضريبة (${calculatedTaxHalalas}) لا يساوي الإجمالي (${totalPriceHalalas})`
    );
  }

  return {
    basePriceHalalas,
    currency: 'SAR',
    taxMode,
    taxRateBps,
    netPriceHalalas,
    calculatedTaxHalalas,
    totalPriceHalalas,
    isVatExempt,
    rateSource,
  };
}
