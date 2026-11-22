import { z } from 'zod';

/**
 * Global User Document Schema (`/users/{uid}`).
 * Represents an authenticated identity in the RASHX platform.
 */
export const UserDocSchema = z
  .object({
    id: z.string().min(1, 'User ID must be non-empty'),
    email: z.string().email('Invalid email address'),
    displayName: z.string().min(1, 'Display name is required').max(100),
    photoUrl: z.string().url('Invalid photo URL').nullable().optional(),
    phoneNumber: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be formatted in E.164 format')
      .nullable()
      .optional(),
    disabled: z.boolean().default(false),
    createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 datetime string' }),
    updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 datetime string' }),
  })
  .strict();

export type UserDoc = z.infer<typeof UserDocSchema>;

/**
 * Input schema for creating a new user profile during registration.
 */
export const CreateUserInputSchema = z
  .object({
    id: z.string().min(1, 'User ID must be non-empty'),
    email: z.string().email('Invalid email address'),
    displayName: z.string().min(1, 'Display name is required').max(100),
    phoneNumber: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be formatted in E.164 format')
      .nullable()
      .optional(),
    photoUrl: z.string().url('Invalid photo URL').nullable().optional(),
    disabled: z.boolean().default(false),
  })
  .strict();

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

