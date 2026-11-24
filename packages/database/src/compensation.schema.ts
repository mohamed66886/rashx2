import { z } from 'zod';

export const CompensationModelTypeEnum = z.enum([
  'FIXED_SALARY',
  'COMMISSION_BASED',
  'HYBRID',
]);
export type CompensationModelType = z.infer<typeof CompensationModelTypeEnum>;

export const PaymentFrequencyEnum = z.enum(['MONTHLY', 'WEEKLY', 'BIWEEKLY']);
export type PaymentFrequency = z.infer<typeof PaymentFrequencyEnum>;

export const CommissionBasisEnum = z.enum([
  'SERVICE_REVENUE_PERCENTAGE',
  'PRODUCT_SALES_PERCENTAGE',
  'FIXED_AMOUNT_PER_SERVICE',
]);
export type CommissionBasis = z.infer<typeof CommissionBasisEnum>;

/**
 * Fixed Salary Component (Integer Halalas)
 */
export const FixedSalaryStructureSchema = z
  .object({
    baseSalaryHalalas: z
      .number()
      .int('الراتب الأساسي يجب أن يكون عدداً صحيحاً بالهللات')
      .nonnegative('الراتب الأساسي لا يمكن أن يكون سالباً'),
    currency: z.literal('SAR').default('SAR'),
    paymentFrequency: PaymentFrequencyEnum.default('MONTHLY'),
    contractReference: z.string().max(100).optional(),
  })
  .strict();
export type FixedSalaryStructure = z.infer<typeof FixedSalaryStructureSchema>;

/**
 * Commission-Only Component
 */
export const CommissionStructureSchema = z
  .object({
    commissionBasis: CommissionBasisEnum,
    commissionRateBps: z
      .number()
      .int('نسبة العمولة بالنقاط المئوية يجب أن تكون رقماً صحيحاً')
      .min(0)
      .max(10000, 'نسبة العمولة لا يمكن أن تتجاوز 100% (10000 نقطة)')
      .optional(),
    fixedAmountHalalas: z
      .number()
      .int('المبلغ المقطوع يجب أن يكون بالهللات')
      .nonnegative()
      .optional(),
    eligibleCategoryIds: z.array(z.string()).default([]),
    commissionPolicyId: z.string().optional(),
  })
  .strict();
export type CommissionStructure = z.infer<typeof CommissionStructureSchema>;

/**
 * Hybrid Component (Fixed Base + Commission Incentives)
 */
export const HybridStructureSchema = z
  .object({
    baseSalaryHalalas: z
      .number()
      .int('الراتب الأساسي يجب أن يكون بالهللات')
      .nonnegative('الراتب الأساسي لا يمكن أن يكون سالباً'),
    currency: z.literal('SAR').default('SAR'),
    paymentFrequency: PaymentFrequencyEnum.default('MONTHLY'),
    serviceCommissionBasis: z.enum([
      'SERVICE_REVENUE_PERCENTAGE',
      'FIXED_AMOUNT_PER_SERVICE',
    ]).default('SERVICE_REVENUE_PERCENTAGE'),
    serviceCommissionRateBps: z
      .number()
      .int()
      .min(0)
      .max(10000)
      .optional(),
    serviceCommissionFixedHalalas: z
      .number()
      .int()
      .nonnegative()
      .optional(),
    productCommissionRateBps: z
      .number()
      .int()
      .min(0)
      .max(10000)
      .optional(),
    contractReference: z.string().max(100).optional(),
  })
  .strict();
export type HybridStructure = z.infer<typeof HybridStructureSchema>;

export const CompensationStatusEnum = z.enum(['ACTIVE', 'SUPERSEDED', 'CANCELLED']);
export type CompensationStatus = z.infer<typeof CompensationStatusEnum>;

/**
 * Confidential Employee Compensation Document
 * (`/tenants/{tenantId}/employees/{employeeId}/compensations/{compId}`).
 * Strictly restricted to tenant OWNER or explicitly authorized HR administrators.
 * Preserves complete effective-dated history without modifying past contracts.
 */
export const CompensationRecordDocSchema = z
  .object({
    id: z.string().min(1, 'Compensation record ID is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    employeeId: z.string().min(1, 'Employee ID is required'),
    modelType: CompensationModelTypeEnum,
    fixed: FixedSalaryStructureSchema.optional(),
    commission: CommissionStructureSchema.optional(),
    hybrid: HybridStructureSchema.optional(),
    status: CompensationStatusEnum.default('ACTIVE'),
    effectiveStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ بدء السريان يجب أن يكون YYYY-MM-DD'),
    effectiveEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
    notes: z.string().max(500).optional(),
    createdByUid: z.string().min(1, 'معرف المستخدم المنشئ مطلوب'),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();

export type CompensationRecordDoc = z.infer<typeof CompensationRecordDocSchema>;

/**
 * Input Schema for Creating a Compensation Record
 */
export const CreateCompensationInputSchema = z
  .object({
    modelType: CompensationModelTypeEnum,
    fixed: FixedSalaryStructureSchema.optional(),
    commission: CommissionStructureSchema.optional(),
    hybrid: HybridStructureSchema.optional(),
    effectiveStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ بدء السريان يجب أن يكون YYYY-MM-DD'),
    effectiveEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    notes: z.string().max(500).optional(),
  })
  .strict();

export type CreateCompensationInput = z.infer<typeof CreateCompensationInputSchema>;

