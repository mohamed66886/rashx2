import { z } from 'zod';

/**
 * 6 Main Canonical Account Types
 */
export const AccountTypeEnum = z.enum([
  'ASSET', // 1. أصول
  'LIABILITY', // 2. خصوم
  'EQUITY', // 3. حقوق ملكية
  'REVENUE', // 4. إيرادات
  'COST_OF_GOODS', // 5. تكلفة إيرادات
  'EXPENSE', // 6. مصروفات تشغيلية
]);
export type AccountType = z.infer<typeof AccountTypeEnum>;

/**
 * Normal Balance Classification (Debit vs Credit)
 */
export const NormalBalanceEnum = z.enum(['DEBIT', 'CREDIT']);
export type NormalBalance = z.infer<typeof NormalBalanceEnum>;

/**
 * Chart of Accounts Document (`/tenants/{tenantId}/accounts/{accountId}`)
 */
export const AccountDocSchema = z
  .object({
    id: z.string().min(1, 'Account ID must be non-empty'),
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    code: z.string().regex(/^\d{1,8}$/, 'Account code must be between 1 and 8 digits'),
    nameAr: z.string().min(1, 'Arabic account name is required').max(100),
    nameEn: z.string().max(100).optional(),
    type: AccountTypeEnum,
    normalBalance: NormalBalanceEnum,
    isPosting: z.boolean().default(true), // true = accepting journal entries; false = grouping/parent header
    isSystem: z.boolean().default(false), // true = cannot be deleted
    parentAccountId: z.string().nullable().default(null),
    accountLevel: z.number().int().min(1).max(5).default(1),
    description: z.string().max(255).optional(),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();
export type AccountDoc = z.infer<typeof AccountDocSchema>;

/**
 * Tenant Accounting Settings (`/tenants/{tenantId}/settings/accounting`)
 */
export const AccountingSettingsDocSchema = z
  .object({
    tenantId: z.string().min(1, 'Tenant ID must be non-empty'),
    baseCurrency: z.literal('SAR').default('SAR'),
    fiscalYearStartMonth: z.number().int().min(1).max(12).default(1), // 1 = January
    accountingMethod: z.enum(['ACCRUAL', 'CASH']).default('ACCRUAL'),
    retainedEarningsAccountId: z.string().min(1).default('account-3030'),
    vatPayableAccountId: z.string().min(1).default('account-2040'),
    vatReceivableAccountId: z.string().min(1).default('account-1050'),
    lockoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();
export type AccountingSettingsDoc = z.infer<typeof AccountingSettingsDocSchema>;

/**
 * Fiscal Year Document (`/tenants/{tenantId}/fiscal_years/{yearId}`)
 */
export const FiscalYearDocSchema = z
  .object({
    id: z.string().min(1, 'Fiscal Year ID required'), // e.g. "FY-2026"
    tenantId: z.string().min(1, 'Tenant ID required'),
    name: z.string().min(1).max(50), // e.g. "السنة المالية 2026"
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
    status: z.enum(['OPEN', 'CLOSED']).default('OPEN'),
    closedAt: z.string().datetime().nullable().default(null),
    closedByUid: z.string().nullable().default(null),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();
export type FiscalYearDoc = z.infer<typeof FiscalYearDocSchema>;

/**
 * Accounting Period Document (`/tenants/{tenantId}/accounting_periods/{periodId}`)
 */
export const AccountingPeriodDocSchema = z
  .object({
    id: z.string().min(1, 'Period ID required'), // e.g. "2026-01"
    tenantId: z.string().min(1, 'Tenant ID required'),
    fiscalYearId: z.string().min(1, 'Fiscal Year ID required'),
    periodNumber: z.number().int().min(1).max(12),
    nameAr: z.string().min(1).max(50),
    nameEn: z.string().max(50).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD'),
    status: z.enum(['OPEN', 'CLOSED']).default('OPEN'),
    closedAt: z.string().datetime().nullable().default(null),
    closedByUid: z.string().nullable().default(null),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }).optional(),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }).optional(),
  })
  .strict();
export type AccountingPeriodDoc = z.infer<typeof AccountingPeriodDocSchema>;

/**
 * Journal Entry Type & Status
 */
export const JournalTypeEnum = z.enum([
  'GENERAL', // يومية عامة
  'OPENING', // قيد افتتاحي
  'ADJUSTING', // قيد تسوية
  'CLOSING', // قيد إقفال
  'REVERSAL', // قيد عكسي
]);
export type JournalType = z.infer<typeof JournalTypeEnum>;

export const JournalStatusEnum = z.enum(['DRAFT', 'POSTED', 'REVERSED']);
export type JournalStatus = z.infer<typeof JournalStatusEnum>;

/**
 * Individual Debit/Credit Line within a Journal Entry
 * Monetary amounts use integer Halalas (1 SAR = 100 Halalas) for 100% decimal safety.
 */
export const JournalLineSchema = z
  .object({
    id: z.string().min(1, 'Line ID required').optional(),
    lineId: z.string().optional(),
    accountId: z.string().min(1, 'Account ID required'),
    accountCode: z.string().min(1, 'Account code required'),
    accountNameAr: z.string().min(1, 'Account name required'),
    debitHalalas: z.number().int().nonnegative('Debit must be non-negative integer halalas').default(0),
    creditHalalas: z.number().int().nonnegative('Credit must be non-negative integer halalas').default(0),
    description: z.string().max(255).optional(),
    branchId: z.string().optional(),
    costCenterId: z.string().optional(),
  })
  .strict()
  .refine(
    (line) => (line.debitHalalas > 0 && line.creditHalalas === 0) || (line.creditHalalas > 0 && line.debitHalalas === 0),
    { message: 'Each line must have either a debit OR a credit amount, not both or zero' }
  );
export type JournalLine = z.infer<typeof JournalLineSchema>;

/**
 * Journal Entry Document (`/tenants/{tenantId}/journal_entries/{entryId}`)
 */
export const JournalEntryDocSchema = z
  .object({
    id: z.string().min(1, 'Entry ID required'),
    tenantId: z.string().min(1, 'Tenant ID required'),
    entryNumber: z.string().min(1, 'Entry number required'), // e.g. "JV-2026-00001"
    type: JournalTypeEnum.default('GENERAL'),
    status: JournalStatusEnum.default('DRAFT'),
    transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'transactionDate must be YYYY-MM-DD').optional(),
    entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'entryDate must be YYYY-MM-DD').optional(),
    postingDate: z.string().nullable().default(null),
    accountingPeriodId: z.string().optional(),
    periodId: z.string().optional(),
    description: z.string().max(500).optional(),
    descriptionAr: z.string().max(500).optional(),
    descriptionEn: z.string().max(500).optional(),
    reference: z.string().max(100).optional(),
    sourceDocumentRef: z.string().max(100).optional(),
    branchId: z.string().optional(),
    lines: z.array(JournalLineSchema).min(2, 'Journal entry must contain at least 2 lines'),
    totalDebitHalalas: z.number().int().positive('Total debit must be positive'),
    totalCreditHalalas: z.number().int().positive('Total credit must be positive'),
    postedAt: z.string().datetime().nullable().default(null),
    postedByUid: z.string().nullable().default(null),
    reversedAt: z.string().datetime().nullable().default(null),
    reversedByUid: z.string().nullable().default(null),
    reversingEntryId: z.string().nullable().default(null),
    reversedEntryId: z.string().nullable().default(null),
    reversalOfEntryId: z.string().nullable().default(null),
    reversedByEntryId: z.string().nullable().default(null),
    reversalReason: z.string().max(500).nullable().default(null),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict()
  .refine((doc) => doc.totalDebitHalalas === doc.totalCreditHalalas, {
    message: 'Double-entry balancing rule violated: Total debits must equal total credits',
  });
export type JournalEntryDoc = z.infer<typeof JournalEntryDocSchema>;

/**
 * Account Balance Read Model (`/tenants/{tenantId}/account_balances/{accountId}`)
 */
export const AccountBalanceDocSchema = z
  .object({
    id: z.string().optional(),
    accountId: z.string().min(1),
    tenantId: z.string().min(1),
    accountCode: z.string().min(1),
    accountNameAr: z.string().min(1),
    accountType: AccountTypeEnum,
    normalBalance: NormalBalanceEnum,
    debitTotalHalalas: z.number().int().nonnegative().default(0),
    creditTotalHalalas: z.number().int().nonnegative().default(0),
    totalDebitHalalas: z.number().int().nonnegative().default(0),
    totalCreditHalalas: z.number().int().nonnegative().default(0),
    netBalanceHalalas: z.number().int().default(0), // Can be positive or negative
    lastJournalEntryId: z.string().nullable().default(null),
    lastTransactionDate: z.string().nullable().default(null),
    lastPostedAt: z.string().datetime().nullable().default(null),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();
export type AccountBalanceDoc = z.infer<typeof AccountBalanceDocSchema>;

/**
 * Cost Center Document (`/tenants/{tenantId}/cost_centers/{costCenterId}`)
 */
export const CostCenterDocSchema = z
  .object({
    id: z.string().min(1, 'Cost Center ID required'),
    tenantId: z.string().min(1, 'Tenant ID required'),
    code: z.string().min(1, 'Code required').max(20),
    nameAr: z.string().min(1, 'Arabic name required').max(100),
    nameEn: z.string().max(100).optional(),
    branchId: z.string().optional(),
    isActive: z.boolean().default(true),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();
export type CostCenterDoc = z.infer<typeof CostCenterDocSchema>;

/**
 * Trial Balance Report Item
 */
export interface TrialBalanceItem {
  accountId: string;
  accountCode: string;
  accountNameAr: string;
  accountType: AccountType;
  debitBalanceHalalas: number;
  creditBalanceHalalas: number;
}

/**
 * Trial Balance Report Summary
 */
export interface TrialBalanceReport {
  tenantId: string;
  asOfDate: string;
  items: TrialBalanceItem[];
  totalDebitHalalas: number;
  totalCreditHalalas: number;
  isBalanced: boolean;
}

/**
 * Accounting Audit Record Document (`/tenants/{tenantId}/accounting_audit/{auditId}`).
 * Append-only immutable log for journal posting, reversal, period closing and reopening.
 */
export const AccountingAuditActionEnum = z.enum([
  'JOURNAL_POSTED',
  'JOURNAL_REVERSED',
  'PERIOD_CLOSED',
  'PERIOD_REOPENED',
  'LOCKOUT_DATE_CHANGED',
  'SETTINGS_CHANGED',
]);
export type AccountingAuditAction = z.infer<typeof AccountingAuditActionEnum>;

export const AccountingAuditRecordSchema = z
  .object({
    id: z.string().min(1, 'Audit ID is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    action: AccountingAuditActionEnum,
    entityType: z.enum(['JOURNAL_ENTRY', 'ACCOUNTING_PERIOD', 'ACCOUNTING_SETTINGS']),
    entityId: z.string().min(1, 'Entity ID is required'),
    actorUid: z.string().min(1, 'Actor UID is required'),
    details: z.record(z.any()).default({}),
    reason: z.string().optional(),
    timestamp: z.string().datetime({ message: 'timestamp must be an ISO 8601 string' }),
  })
  .strict();

export type AccountingAuditRecord = z.infer<typeof AccountingAuditRecordSchema>;
