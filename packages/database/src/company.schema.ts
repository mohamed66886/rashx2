import { z } from 'zod';
import { SaudiCrNumberSchema, SaudiVatNumberSchema } from './tenant.schema';

/**
 * Saudi Unified Establishment Number (700 series): 10 digits starting with 7.
 */
export const SaudiUnifiedEstablishmentNumberSchema = z
  .string()
  .regex(/^7\d{9}$/, 'Unified Establishment Number must be exactly 10 digits starting with 7');

/**
 * Saudi VAT Registration Status Model
 * - NOT_REGISTERED: Business turnover below mandatory ZATCA threshold and not voluntarily registered.
 * - REGISTERED: Formally registered with ZATCA and holds an official 15-digit VAT certificate.
 * - PENDING_VERIFICATION: VAT details submitted and awaiting internal administrative audit.
 * - EXEMPT_ENTITY: Specifically exempt entity supported by official legal decree/documentation.
 */
export const VatRegistrationStatusEnum = z.enum([
  'NOT_REGISTERED',
  'REGISTERED',
  'PENDING_VERIFICATION',
  'EXEMPT_ENTITY',
]);
export type VatRegistrationStatus = z.infer<typeof VatRegistrationStatusEnum>;

/**
 * Legal entity forms for Saudi commercial enterprises
 */
export const LegalFormEnum = z.enum([
  'SOLE_PROPRIETORSHIP',
  'LLC',
  'BRANCH_OF_FOREIGN',
  'OTHER',
]);
export type LegalForm = z.infer<typeof LegalFormEnum>;

/**
 * National Address Model for Saudi Arabia (SPL standard)
 */
export const NationalAddressSchema = z
  .object({
    buildingNumber: z.string().regex(/^\d{4}$/, 'Building number must be 4 digits').optional(),
    streetName: z.string().max(100).optional(),
    streetNameAr: z.string().max(100).optional(),
    streetNameEn: z.string().max(100).optional(),
    district: z.string().max(100).optional(),
    districtAr: z.string().max(100).optional(),
    districtEn: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    cityAr: z.string().max(100).optional(),
    cityEn: z.string().max(100).optional(),
    postalCode: z.string().regex(/^\d{5}$/, 'Postal code must be 5 digits').optional(),
    additionalNumber: z.string().regex(/^\d{4}$/, 'Additional number must be 4 digits').optional(),
    unitNumber: z.string().max(20).optional(),
    shortAddress: z.string().regex(/^[A-Z]{4}\d{4}$/, 'Short address format: e.g. RRRD2929').optional(),
  })
  .strict();
export type NationalAddress = z.infer<typeof NationalAddressSchema>;

/**
 * Tenant Company Profile Document (`/tenants/{tenantId}/settings/company`)
 */
export const CompanyProfileDocSchema = z
  .object({
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    legalNameAr: z.string().min(1, 'Legal Arabic name is required').max(150),
    legalNameEn: z.string().max(150).optional(),
    commercialName: z.string().max(100).optional(),
    legalForm: LegalFormEnum.default('SOLE_PROPRIETORSHIP'),
    crNumber: SaudiCrNumberSchema,
    crIssueDate: z.string().optional(),
    crExpiryDate: z.string().optional(),
    unifiedEstablishmentNumber: SaudiUnifiedEstablishmentNumberSchema.optional(),
    country: z.string().default('SA'),
    region: z.string().max(100).optional(),
    city: z.string().max(100).default('الرياض'),
    district: z.string().max(100).optional(),
    address: z.string().max(255).optional(),
    nationalAddress: NationalAddressSchema.optional(),
    officialPhone: z.string().min(7).max(20).optional(),
    officialEmail: z.string().email().optional(),
    phone: z.string().min(7).max(20).optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional().or(z.literal('')),
    businessActivity: z.string().max(150).optional(),
    businessLogoUrl: z.string().url().nullable().optional(),
    invoiceDisplayName: z.string().max(100).optional(),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();
export type CompanyProfileDoc = z.infer<typeof CompanyProfileDocSchema>;

/**
 * Tax Rate Schedule with Effective Dating
 * Allows rates to be updated over time without hardcoding or overwriting historical tax snapshots.
 */
export const TaxRateScheduleSchema = z
  .object({
    rateBps: z.number().int().nonnegative('Rate in basis points must be non-negative'), // e.g. 1500 for 15%
    nameAr: z.string().min(1),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'effectiveFrom must be YYYY-MM-DD'),
    effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'effectiveUntil must be YYYY-MM-DD').nullable().optional(),
  })
  .strict();
export type TaxRateSchedule = z.infer<typeof TaxRateScheduleSchema>;

/**
 * Tenant VAT & Tax Configuration Document (`/tenants/{tenantId}/settings/tax`)
 */
export const TaxSettingsDocSchema = z
  .object({
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    vatStatus: VatRegistrationStatusEnum.default('NOT_REGISTERED'),
    vatNumber: SaudiVatNumberSchema.nullable().optional(),
    standardVatRateBps: z.number().int().nonnegative().default(1500), // 15.00% standard rate (1500 basis points)
    rates: z.array(TaxRateScheduleSchema).default([
      {
        rateBps: 1500,
        nameAr: 'النسبة الأساسية القياسية',
        effectiveFrom: '2020-07-01',
        effectiveUntil: null,
      },
    ]),
    isTaxInclusivePricing: z.boolean().default(true),
    isVatExempt: z.boolean().default(false),
    exemptionEvidencePath: z.string().nullable().optional(),
    verificationStatus: z
      .enum(['UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED'])
      .default('UNVERIFIED'),
    effectiveFrom: z.string().datetime().optional(),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }).optional(),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();
export type TaxSettingsDoc = z.infer<typeof TaxSettingsDocSchema>;

/**
 * Calculates the authoritative effective VAT rate in basis points for any transaction date.
 */
export function getEffectiveVatRateBps(
  taxSettings: TaxSettingsDoc | null | undefined,
  transactionDate?: string
): number {
  if (!taxSettings || taxSettings.vatStatus === 'NOT_REGISTERED' || taxSettings.isVatExempt) {
    return 0;
  }

  const targetDate = transactionDate || new Date().toISOString().split('T')[0]!;
  if (taxSettings.rates && taxSettings.rates.length > 0) {
    // Find matching rate schedule
    const match = taxSettings.rates.find((r) => {
      const afterStart = targetDate >= r.effectiveFrom;
      const beforeEnd = !r.effectiveUntil || targetDate <= r.effectiveUntil;
      return afterStart && beforeEnd;
    });
    if (match) {
      return match.rateBps;
    }
  }

  return taxSettings.standardVatRateBps ?? 1500;
}

/**
 * General Tenant Operational Settings (`/tenants/{tenantId}/settings/general`)
 */
export const GeneralSettingsDocSchema = z
  .object({
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    currency: z.literal('SAR').default('SAR'),
    baseCurrency: z.literal('SAR').default('SAR'),
    minorUnitName: z.string().default('Halalas'),
    minorUnitRatio: z.number().default(100),
    timezone: z.literal('Asia/Riyadh').default('Asia/Riyadh'),
    defaultLocale: z.string().default('ar-SA'),
    defaultLanguage: z.enum(['ar', 'en']).default('ar'),
    supportedLanguages: z.array(z.enum(['ar', 'en'])).default(['ar', 'en']),
    dateFormat: z.enum(['YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MM-YYYY']).default('YYYY-MM-DD'),
    timeFormat: z.enum(['12h', '24h']).default('12h'),
    startOfWeek: z.enum(['SUNDAY', 'SATURDAY', 'MONDAY']).default('SUNDAY'),
    calendarType: z.enum(['GREGORIAN', 'HIJRI']).default('GREGORIAN'),
    invoiceNumberPrefix: z.string().max(10).default('INV-'),
    defaultBranchId: z.string().nullable().default(null),
    businessWorkingDays: z
      .array(
        z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
      )
      .default(['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday']),
    notificationsEnabled: z.boolean().default(true),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }).optional(),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();
export type GeneralSettingsDoc = z.infer<typeof GeneralSettingsDocSchema>;

/**
 * Tenant SEO and Discoverability Settings (`/tenants/{tenantId}/settings/seo`)
 */
export const SeoSettingsDocSchema = z
  .object({
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    siteTitle: z.string().max(120).optional(),
    siteDescription: z.string().max(300).optional(),
    seoTitleAr: z.string().max(120).optional(),
    seoTitleEn: z.string().max(120).optional(),
    metaDescriptionAr: z.string().max(300).optional(),
    metaDescriptionEn: z.string().max(300).optional(),
    keywords: z.array(z.string()).default([]),
    canonicalUrl: z.string().url().optional().or(z.literal('')),
    ogImageUrl: z.string().url().nullable().optional(),
    indexingEnabled: z.boolean().default(false),
    robotsIndex: z.boolean().default(false),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }).optional(),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();
export type SeoSettingsDoc = z.infer<typeof SeoSettingsDocSchema>;

/**
 * Tenant Bootstrap Status and Lifecycle (`/tenants/{tenantId}/settings/bootstrap`).
 * Enforces foundation completion before operational access is permitted.
 */
export const BootstrapStatusEnum = z.enum([
  'INITIALIZING',
  'READY',
  'FAILED',
  'RECOVERY_REQUIRED',
]);
export type BootstrapStatus = z.infer<typeof BootstrapStatusEnum>;

export const BootstrapStageEnum = z.enum([
  'NOT_STARTED',
  'INITIALIZING',
  'BRANCH_AND_SETTINGS_CREATED',
  'PERIODS_CREATED',
  'CHART_OF_ACCOUNTS_CREATED',
  'READY',
  'FAILED',
]);
export type BootstrapStage = z.infer<typeof BootstrapStageEnum>;

export const BootstrapStatusDocSchema = z
  .object({
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    status: BootstrapStatusEnum.default('INITIALIZING'),
    stage: BootstrapStageEnum.default('INITIALIZING'),
    version: z.number().int().nonnegative().default(1),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime().nullable().default(null),
    lastError: z.string().nullable().optional(),
    retryCount: z.number().int().nonnegative().default(0),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type BootstrapStatusDoc = z.infer<typeof BootstrapStatusDocSchema>;
