import { z } from 'zod';

export const EmploymentTypeEnum = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACTOR',
  'TRAINEE',
]);
export type EmploymentType = z.infer<typeof EmploymentTypeEnum>;

export const EmployeeStatusEnum = z.enum([
  'ACTIVE',
  'INACTIVE',
  'ON_LEAVE',
  'SUSPENDED',
  'TERMINATED',
]);
export type EmployeeStatus = z.infer<typeof EmployeeStatusEnum>;

export const EmergencyContactSchema = z
  .object({
    name: z.string().min(1, 'اسم جهة الاتصال للطوارئ مطلوب').max(100),
    relation: z.string().min(1, 'صلة القرابة مطلوبة').max(50),
    phone: z.string().min(7, 'رقم هاتف الطوارئ غير صالح').max(20),
  })
  .strict();
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;

export const TerminationDetailsSchema = z
  .object({
    reason: z.string().min(1, 'سبب إنهاء الخدمة مطلوب').max(500),
    effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ السريان يجب أن يكون بتنسيق YYYY-MM-DD'),
    terminatedByUid: z.string().min(1, 'معرف المستخدم المنفذ مطلوب'),
    notes: z.string().max(1000).optional(),
  })
  .strict();
export type TerminationDetails = z.infer<typeof TerminationDetailsSchema>;

/**
 * Authoritative Employee Document (`/tenants/{tenantId}/employees/{employeeId}`).
 * Represents an employment relationship scoped to a specific tenant.
 * Completely distinct from authentication user identities (`/users/{uid}`).
 */
export const EmployeeDocSchema = z
  .object({
    id: z.string().min(1, 'Employee ID is required'),
    tenantId: z.string().min(1, 'Tenant ID is required'),
    linkedUid: z.string().nullable().default(null),
    employeeNumber: z.string().min(1, 'الرقم الوظيفي مطلوب').max(30),
    fullNameAr: z.string().min(1, 'الاسم باللغة العربية مطلوب').max(100),
    fullNameEn: z.string().max(100).optional(),
    phone: z.string().min(7, 'رقم الهاتف غير صالح').max(20),
    email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
    photoUrl: z.string().url('رابط الصورة غير صالح').optional().or(z.literal('')),
    nationality: z.string().max(50).optional(),
    nationalId: z.string().max(30).optional(), // Confidential
    jobTitle: z.string().min(1, 'المسمى الوظيفي مطلوب').max(100),
    department: z.string().max(100).optional(),
    employmentType: EmploymentTypeEnum.default('FULL_TIME'),
    employmentStatus: EmployeeStatusEnum.default('ACTIVE'),
    hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ التعيين يجب أن يكون YYYY-MM-DD'),
    contractStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    contractEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    primaryBranchId: z.string().min(1, 'الفرع الأساسي مطلوب'),
    assignedBranchIds: z.array(z.string().min(1)).min(1, 'يجب تعيين الموظف في فرع واحد على الأقل'),
    isProvider: z.boolean().default(false),
    terminationDetails: TerminationDetailsSchema.optional(),
    emergencyContact: EmergencyContactSchema.optional(), // Private
    internalNotes: z.string().max(1000).optional(), // Private
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
  })
  .strict();

export type EmployeeDoc = z.infer<typeof EmployeeDocSchema>;

/**
 * Phase 2.3: Safe Emergency Contact DTO (Minimization)
 * Exposes strictly necessary operational emergency fields. Third-party personal info is excluded.
 */
export const SafeEmergencyContactDtoSchema = z
  .object({
    name: z.string().min(1, 'اسم جهة الاتصال للطوارئ مطلوب').max(100),
    relation: z.string().min(1, 'صلة القرابة مطلوبة').max(50),
    phone: z.string().min(7, 'رقم هاتف الطوارئ غير صالح').max(20),
  })
  .strict();
export type SafeEmergencyContactDto = z.infer<typeof SafeEmergencyContactDtoSchema>;

/**
 * Phase 2.3: Safe Employee Self-Service DTO (STAFF viewing own profile)
 * Exposes basic profile, contact info, minimal emergency contact, and masked nationalId.
 * Strips internalNotes and terminationDetails completely.
 */
export const SafeEmployeeStaffSelfDtoSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    linkedUid: z.string().nullable().default(null),
    employeeNumber: z.string().min(1).max(30),
    fullNameAr: z.string().min(1).max(100),
    fullNameEn: z.string().max(100).optional(),
    phone: z.string().min(7).max(20),
    email: z.string().optional().or(z.literal('')),
    photoUrl: z.string().optional().or(z.literal('')),
    nationality: z.string().max(50).optional(),
    nationalId: z.string().max(30).optional(), // Masked: 109*****32
    jobTitle: z.string().min(1).max(100),
    department: z.string().max(100).optional(),
    employmentType: EmploymentTypeEnum,
    employmentStatus: EmployeeStatusEnum,
    hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    primaryBranchId: z.string().min(1),
    assignedBranchIds: z.array(z.string().min(1)),
    isProvider: z.boolean(),
    emergencyContact: SafeEmergencyContactDtoSchema.optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();
export type SafeEmployeeStaffSelfDto = z.infer<typeof SafeEmployeeStaffSelfDtoSchema>;

/**
 * Phase 2.3: Safe Employee Operational DTO (MANAGER viewing employee profile)
 * Exposes operational management fields, branch assignments, minimal emergency contact,
 * and masked nationalId. Exposes internalNotes / terminationDetails ONLY if granted explicit permission.
 */
export const SafeEmployeeManagerDtoSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    linkedUid: z.string().nullable().default(null),
    employeeNumber: z.string().min(1).max(30),
    fullNameAr: z.string().min(1).max(100),
    fullNameEn: z.string().max(100).optional(),
    phone: z.string().min(7).max(20),
    email: z.string().optional().or(z.literal('')),
    photoUrl: z.string().optional().or(z.literal('')),
    nationality: z.string().max(50).optional(),
    nationalId: z.string().max(30).optional(), // Masked: 109*****32
    jobTitle: z.string().min(1).max(100),
    department: z.string().max(100).optional(),
    employmentType: EmploymentTypeEnum,
    employmentStatus: EmployeeStatusEnum,
    hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    contractStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    contractEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    primaryBranchId: z.string().min(1),
    assignedBranchIds: z.array(z.string().min(1)),
    isProvider: z.boolean(),
    emergencyContact: SafeEmergencyContactDtoSchema.optional(),
    internalNotes: z.string().max(1000).optional(),
    terminationDetails: TerminationDetailsSchema.optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();
export type SafeEmployeeManagerDto = z.infer<typeof SafeEmployeeManagerDtoSchema>;

/**
 * Phase 2.3: Safe Employee Complete HR DTO (OWNER viewing employee profile)
 * Complete profile including unmasked nationalId, emergency contact, notes, and termination details.
 */
export const SafeEmployeeOwnerDtoSchema = z
  .object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    linkedUid: z.string().nullable().default(null),
    employeeNumber: z.string().min(1).max(30),
    fullNameAr: z.string().min(1).max(100),
    fullNameEn: z.string().max(100).optional(),
    phone: z.string().min(7).max(20),
    email: z.string().optional().or(z.literal('')),
    photoUrl: z.string().optional().or(z.literal('')),
    nationality: z.string().max(50).optional(),
    nationalId: z.string().max(30).optional(), // Unmasked
    jobTitle: z.string().min(1).max(100),
    department: z.string().max(100).optional(),
    employmentType: EmploymentTypeEnum,
    employmentStatus: EmployeeStatusEnum,
    hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    contractStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    contractEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    primaryBranchId: z.string().min(1),
    assignedBranchIds: z.array(z.string().min(1)),
    isProvider: z.boolean(),
    emergencyContact: SafeEmergencyContactDtoSchema.optional(),
    internalNotes: z.string().max(1000).optional(),
    terminationDetails: TerminationDetailsSchema.optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();
export type SafeEmployeeOwnerDto = z.infer<typeof SafeEmployeeOwnerDtoSchema>;

/**
 * Phase 2.3: Safe Employee DTO Union
 */
export type SafeEmployeeDto =
  | SafeEmployeeOwnerDto
  | SafeEmployeeManagerDto
  | SafeEmployeeStaffSelfDto;

/**
 * Phase 2.3: Minimal Unlinked Employee Option (For user invitation dropdowns)
 * Strictly exposes only non-sensitive operational identifiers.
 */
export const UnlinkedEmployeeOptionDtoSchema = z
  .object({
    id: z.string().min(1),
    fullNameAr: z.string().min(1),
    employeeNumber: z.string().min(1),
    jobTitle: z.string().min(1),
  })
  .strict();
export type UnlinkedEmployeeOptionDto = z.infer<typeof UnlinkedEmployeeOptionDtoSchema>;

/**
 * Public/Roster Safe Employee Summary
 */
export const PublicEmployeeSummarySchema = z
  .object({
    id: z.string().min(1),
    employeeNumber: z.string(),
    fullNameAr: z.string(),
    fullNameEn: z.string().optional(),
    photoUrl: z.string().optional(),
    jobTitle: z.string(),
    department: z.string().optional(),
    primaryBranchId: z.string(),
    assignedBranchIds: z.array(z.string()),
    isProvider: z.boolean(),
    employmentStatus: EmployeeStatusEnum,
  })
  .strict();
export type PublicEmployeeSummary = z.infer<typeof PublicEmployeeSummarySchema>;

/**
 * Input Schema for Creating an Employee
 */
export const CreateEmployeeInputSchema = z
  .object({
    employeeNumber: z.string().max(30).optional(),
    fullNameAr: z.string().min(1, 'الاسم باللغة العربية مطلوب').max(100),
    fullNameEn: z.string().max(100).optional(),
    phone: z.string().min(7, 'رقم الهاتف غير صالح').max(20),
    email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
    photoUrl: z.string().url('رابط الصورة غير صالح').optional().or(z.literal('')),
    nationality: z.string().max(50).optional(),
    nationalId: z.string().max(30).optional(),
    jobTitle: z.string().min(1, 'المسمى الوظيفي مطلوب').max(100),
    department: z.string().max(100).optional(),
    employmentType: EmploymentTypeEnum.default('FULL_TIME'),
    hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ التعيين يجب أن يكون YYYY-MM-DD'),
    contractStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    contractEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    primaryBranchId: z.string().min(1, 'الفرع الأساسي مطلوب'),
    assignedBranchIds: z.array(z.string().min(1)).min(1, 'يجب تحديد فرع واحد على الأقل'),
    isProvider: z.boolean().default(false),
    emergencyContact: EmergencyContactSchema.optional(),
    internalNotes: z.string().max(1000).optional(),
    linkedUid: z.string().nullable().optional(),
  })
  .strict();
export type CreateEmployeeInput = z.infer<typeof CreateEmployeeInputSchema>;

/**
 * Input Schema for Updating an Employee
 */
export const UpdateEmployeeInputSchema = z
  .object({
    employeeNumber: z.string().max(30).optional(),
    fullNameAr: z.string().min(1).max(100).optional(),
    fullNameEn: z.string().max(100).optional(),
    phone: z.string().min(7).max(20).optional(),
    email: z.string().email().optional().or(z.literal('')),
    photoUrl: z.string().url().optional().or(z.literal('')),
    nationality: z.string().max(50).optional(),
    nationalId: z.string().max(30).optional(),
    jobTitle: z.string().min(1).max(100).optional(),
    department: z.string().max(100).optional(),
    employmentType: EmploymentTypeEnum.optional(),
    employmentStatus: EmployeeStatusEnum.optional(),
    contractStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    contractEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    primaryBranchId: z.string().min(1).optional(),
    assignedBranchIds: z.array(z.string().min(1)).min(1).optional(),
    isProvider: z.boolean().optional(),
    emergencyContact: EmergencyContactSchema.optional(),
    internalNotes: z.string().max(1000).optional(),
    linkedUid: z.string().nullable().optional(),
  })
  .strict();
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeInputSchema>;

