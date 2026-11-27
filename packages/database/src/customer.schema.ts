import { z } from 'zod';

/**
 * Normalizes any Saudi phone number into standard E.164 format (+9665XXXXXXXX).
 * Converts Arabic-Indic numerals (٠-٩) to ASCII, strips whitespace, hyphens, and parentheses.
 * Accepts formats:
 * - 05XXXXXXXX
 * - 5XXXXXXXX
 * - 9665XXXXXXXX
 * - 009665XXXXXXXX
 * - +9665XXXXXXXX
 */
export function normalizeSaudiPhoneNumber(phone: string): string {
  if (typeof phone !== 'string' || phone.trim() === '') {
    throw new Error('Phone number must be a non-empty string');
  }

  // Convert Arabic-Indic numerals to Latin
  let cleaned = phone
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[\s\-\(\)\.]/g, '');

  // Strip leading 00 if present
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }

  // Strip leading + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Format cases
  if (cleaned.startsWith('9665') && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  if (cleaned.startsWith('05') && cleaned.length === 10) {
    return `+966${cleaned.substring(1)}`;
  }

  if (cleaned.startsWith('5') && cleaned.length === 9) {
    return `+966${cleaned}`;
  }

  throw new Error(`Invalid Saudi mobile phone number format: ${phone}. Must be a 9-digit mobile starting with 5.`);
}

/**
 * Zod Schema for Saudi Mobile Phone Number.
 * Automatically normalizes input and validates against E.164 (+9665XXXXXXXX).
 */
export const SaudiPhoneNumberSchema = z.preprocess(
  (val) => {
    if (typeof val === 'string') {
      try {
        return normalizeSaudiPhoneNumber(val);
      } catch {
        return val;
      }
    }
    return val;
  },
  z
    .string()
    .regex(/^\+9665\d{8}$/, 'رقم الجوال يجب أن يكون رقم جوال سعودي صحيح يبدأ بـ 05 أو 9665 ويتكون من 9 أرقام بعد المقدمة')
);

export const CustomerStatusEnum = z.enum(['ACTIVE', 'ARCHIVED']);
export type CustomerStatus = z.infer<typeof CustomerStatusEnum>;

export const CustomerGenderEnum = z.enum(['FEMALE', 'MALE', 'UNSPECIFIED']);
export type CustomerGender = z.infer<typeof CustomerGenderEnum>;

/**
 * Booking statistics maintained reliably on customer profile.
 */
export const CustomerBookingStatsSchema = z
  .object({
    totalBookings: z.number().int().nonnegative().default(0),
    completedBookings: z.number().int().nonnegative().default(0),
    cancelledBookings: z.number().int().nonnegative().default(0),
    noShowBookings: z.number().int().nonnegative().default(0),
    totalSpentHalalas: z.number().int().nonnegative().default(0),
    lastBookingAt: z.string().datetime().nullable().default(null),
  })
  .strict();

export type CustomerBookingStats = z.infer<typeof CustomerBookingStatsSchema>;

/**
 * Tenant Customer Document Schema (`/tenants/{tenantId}/customers/{customerId}`).
 */
export const CustomerDocSchema = z
  .object({
    id: z.string().min(1, 'معرف العميل مطلوب'),
    tenantId: z.string().min(1, 'معرف المنشأة مطلوب'),
    fullName: z.string().min(2, 'اسم العميل يجب أن يتكون من حرفين على الأقل').max(100),
    isGuest: z.boolean().default(false),
    normalizedPhone: SaudiPhoneNumberSchema.nullable().optional().default(null),
    displayPhone: z.string().min(9).nullable().optional().default(null),
    email: z.string().email('البريد الإلكتروني غير صالح').nullable().optional().default(null),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ الميلاد يجب أن يكون بصيغة YYYY-MM-DD')
      .nullable()
      .optional()
      .default(null),
    gender: CustomerGenderEnum.default('UNSPECIFIED'),
    privateNotes: z.string().max(2000).default(''),
    tags: z.array(z.string().min(1).max(50)).default([]),
    status: CustomerStatusEnum.default('ACTIVE'),
    bookingStatistics: CustomerBookingStatsSchema.default({
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      noShowBookings: 0,
      totalSpentHalalas: 0,
      lastBookingAt: null,
    }),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
    createdBy: z.string().min(1, 'معرف المنشئ مطلوب'),
    updatedBy: z.string().min(1, 'معرف المحدث مطلوب'),
  })
  .strict();

export type CustomerDoc = z.infer<typeof CustomerDocSchema>;

/**
 * Deterministic Phone Identity Mutex Document (`/tenants/{tenantId}/customer_identities/{normalizedPhone}`).
 * Guarantees zero-race uniqueness of active customer phone numbers per tenant.
 */
export const CustomerPhoneIdentityDocSchema = z
  .object({
    normalizedPhone: z.string().min(1),
    customerId: z.string().min(1),
    tenantId: z.string().min(1),
    createdAt: z.string().datetime(),
  })
  .strict();

export type CustomerPhoneIdentityDoc = z.infer<typeof CustomerPhoneIdentityDocSchema>;

/**
 * Input Schema for creating a new Customer.
 * Supports explicit Guest Customer Policy (`isGuest: true`) when the walk-in guest has no phone number.
 */
export const CreateCustomerInputSchema = z
  .object({
    tenantId: z.string().min(1, 'معرف المنشأة مطلوب'),
    fullName: z.string().min(2, 'اسم العميل مطلوب').max(100),
    isGuest: z.boolean().optional().default(false),
    phone: z.union([SaudiPhoneNumberSchema, z.literal(''), z.null()]).optional(),
    email: z.string().email('البريد الإلكتروني غير صالح').nullable().optional(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ الميلاد يجب أن يكون بصيغة YYYY-MM-DD')
      .nullable()
      .optional(),
    gender: CustomerGenderEnum.optional().default('UNSPECIFIED'),
    privateNotes: z.string().max(2000).optional().default(''),
    tags: z.array(z.string().min(1).max(50)).optional().default([]),
    idempotencyKey: z.string().min(1).max(120).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const hasPhone = typeof data.phone === 'string' && data.phone.trim().length > 0;
    if (!data.isGuest && !hasPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'رقم الجوال السعودي مطلوب للعميل المسجل، أو فعّل وضع العميل الزائر (بدون جوال).',
      });
    }
  });

export type CreateCustomerInput = z.input<typeof CreateCustomerInputSchema>;

/**
 * Input Schema for updating an existing Customer.
 */
export const UpdateCustomerInputSchema = z
  .object({
    fullName: z.string().min(2).max(100).optional(),
    phone: SaudiPhoneNumberSchema.optional(),
    email: z.string().email().nullable().optional(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    gender: CustomerGenderEnum.optional(),
    privateNotes: z.string().max(2000).optional(),
    tags: z.array(z.string().min(1).max(50)).optional(),
    status: CustomerStatusEnum.optional(),
  })
  .strict();

export type UpdateCustomerInput = z.infer<typeof UpdateCustomerInputSchema>;
