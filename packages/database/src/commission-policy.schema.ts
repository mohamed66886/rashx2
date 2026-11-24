import { z } from 'zod';

export const CommissionPolicyTypeEnum = z.enum([
  'SERVICE',
  'PRODUCT',
  'TIERED',
  'HYBRID',
]);
export type CommissionPolicyType = z.infer<typeof CommissionPolicyTypeEnum>;

export const CommissionPolicyBasisEnum = z.enum([
  'PERCENTAGE_OF_REVENUE',
  'FIXED_AMOUNT_PER_UNIT',
  'TIERED_BY_VOLUME',
]);
export type CommissionPolicyBasis = z.infer<typeof CommissionPolicyBasisEnum>;

/**
 * Tenant Commission Policy Document (`/tenants/{tenantId}/commission_policies/{policyId}`).
 * Reusable commission templates applicable to service providers and products across branches.
 */
export const CommissionPolicyDocSchema = z
  .object({
    id: z.string().min(1, 'Policy ID is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    nameAr: z.string().min(1, 'اسم السياسة بالعربية مطلوب').max(100),
    nameEn: z.string().max(100).optional(),
    type: CommissionPolicyTypeEnum.default('SERVICE'),
    basis: CommissionPolicyBasisEnum.default('PERCENTAGE_OF_REVENUE'),
    rateBps: z
      .number()
      .int('نسبة العمولة بالنقاط المئوية يجب أن تكون رقماً صحيحاً')
      .min(0)
      .max(10000, 'نسبة العمولة لا يمكن أن تتجاوز 100%')
      .optional(),
    fixedAmountHalalas: z
      .number()
      .int('المبلغ المقطوع يجب أن يكون بالهللات')
      .nonnegative()
      .optional(),
    applicableServiceIds: z.array(z.string().min(1)).default([]), // Empty = all services
    branchScope: z.array(z.string().min(1)).default([]), // Empty = all branches
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ بدء السريان مطلوب YYYY-MM-DD'),
    effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    isActive: z.boolean().default(true),
    description: z.string().max(500).optional(),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();

export type CommissionPolicyDoc = z.infer<typeof CommissionPolicyDocSchema>;

/**
 * Input Schema for creating a Commission Policy
 */
export const CreateCommissionPolicyInputSchema = z
  .object({
    nameAr: z.string().min(1, 'اسم السياسة بالعربية مطلوب').max(100),
    nameEn: z.string().max(100).optional(),
    type: CommissionPolicyTypeEnum.default('SERVICE'),
    basis: CommissionPolicyBasisEnum.default('PERCENTAGE_OF_REVENUE'),
    rateBps: z
      .number()
      .int()
      .min(0)
      .max(10000)
      .optional(),
    fixedAmountHalalas: z
      .number()
      .int()
      .nonnegative()
      .optional(),
    applicableServiceIds: z.array(z.string().min(1)).default([]),
    branchScope: z.array(z.string().min(1)).default([]),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ بدء السريان مطلوب YYYY-MM-DD'),
    effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    description: z.string().max(500).optional(),
  })
  .strict();

export type CreateCommissionPolicyInput = z.infer<typeof CreateCommissionPolicyInputSchema>;

/**
 * Input Schema for updating a Commission Policy
 */
export const UpdateCommissionPolicyInputSchema = z
  .object({
    nameAr: z.string().min(1).max(100).optional(),
    nameEn: z.string().max(100).optional(),
    type: CommissionPolicyTypeEnum.optional(),
    basis: CommissionPolicyBasisEnum.optional(),
    rateBps: z
      .number()
      .int()
      .min(0)
      .max(10000)
      .optional(),
    fixedAmountHalalas: z
      .number()
      .int()
      .nonnegative()
      .optional(),
    applicableServiceIds: z.array(z.string().min(1)).optional(),
    branchScope: z.array(z.string().min(1)).optional(),
    effectiveUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    isActive: z.boolean().optional(),
    description: z.string().max(500).optional(),
  })
  .strict();

export type UpdateCommissionPolicyInput = z.infer<typeof UpdateCommissionPolicyInputSchema>;

/**
 * Validates whether a commission policy can be associated with a service.
 * Supports future-effective scheduling:
 * - Allows associating an active policy scheduled for the future (effectiveFrom > today).
 * - Strictly rejects expired policies (today > effectiveUntil).
 * - Enforces tenant isolation, active status, and date interval ordering (effectiveFrom <= effectiveUntil).
 */
export function validateCommissionPolicyAssociation(
  policy: CommissionPolicyDoc,
  tenantId: string,
  referenceDate?: string
): void {
  // 1. Tenant ownership validation
  if (policy.tenantId !== tenantId) {
    throw new Error(`سياسة العمولة (${policy.id}) لا تنتمي لنفس المتجر`);
  }

  // 2. Active status validation
  if (!policy.isActive) {
    throw new Error(`سياسة العمولة (${policy.nameAr}) غير مفعّلة حالياً`);
  }

  // 3. Date interval sanity validation (effectiveFrom <= effectiveUntil)
  if (policy.effectiveUntil && policy.effectiveFrom > policy.effectiveUntil) {
    throw new Error(
      `فترة سريان سياسة العمولة غير صالحة: تاريخ البدء (${policy.effectiveFrom}) بعد تاريخ الانتهاء (${policy.effectiveUntil})`
    );
  }

  // 4. Reject already-expired policy at the time of association
  const today = referenceDate || new Date().toISOString().split('T')[0]!;
  if (policy.effectiveUntil && today > policy.effectiveUntil) {
    throw new Error(
      `سياسة العمولة (${policy.nameAr}) منتهية الصلاحية (تاريخ الانتهاء: ${policy.effectiveUntil})`
    );
  }
}

/**
 * Validates whether a commission policy can be applied to a specific financial transaction/event.
 * Strictly enforces that eventDate is within [effectiveFrom, effectiveUntil].
 */
export function validateCommissionPolicyApplication(
  policy: CommissionPolicyDoc,
  tenantId: string,
  eventDate: string
): void {
  validateCommissionPolicyAssociation(policy, tenantId, eventDate);

  if (eventDate < policy.effectiveFrom) {
    throw new Error(
      `سياسة العمولة (${policy.nameAr}) لم تبدأ بعد لتاريخ المعاملة (${eventDate}) (تاريخ البدء: ${policy.effectiveFrom})`
    );
  }
}

/**
 * Backwards-compatible alias for policy association validation.
 */
export const validateCommissionPolicyApplicability = validateCommissionPolicyAssociation;

