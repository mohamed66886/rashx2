import { z } from 'zod';

/**
 * Reserved slugs that cannot be registered or allocated by tenants.
 * Protects platform subdomains, system routes, and administrative entrypoints.
 */
export const RESERVED_SLUGS = [
  'www',
  'app',
  'admin',
  'api',
  'auth',
  'mail',
  'dashboard',
  'support',
  'billing',
  'staging',
  'dev',
  'static',
  'assets',
  'portal',
  'login',
  'signup',
  'register',
  'status',
  'account',
  'help',
  'docs',
  'pricing',
  'about',
  'legal',
  'terms',
  'privacy',
] as const;

export type ReservedSlug = (typeof RESERVED_SLUGS)[number];

const RESERVED_SLUGS_SET = new Set<string>(RESERVED_SLUGS);

/**
 * Strict regex for safe lowercase hostname slugs.
 * Matches lowercase alphanumeric words separated by single hyphens.
 * Prevents leading, trailing, or double hyphens.
 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Zod schema for validated slug strings.
 */
export const SlugFormatSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(32, 'Slug cannot exceed 32 characters')
  .regex(SLUG_REGEX, 'Slug must only contain lowercase alphanumeric characters and single hyphens')
  .refine(
    (slug) => !RESERVED_SLUGS_SET.has(slug),
    (slug) => ({ message: `The slug '${slug}' is a reserved platform keyword and cannot be used.` })
  );

export type SlugFormat = z.infer<typeof SlugFormatSchema>;

export const TenantSlugStatusEnum = z.enum(['ACTIVE', 'SUSPENDED', 'RESERVED']);
export type TenantSlugStatus = z.infer<typeof TenantSlugStatusEnum>;

/**
 * Strict schema for the central 'slugs/{slug}' routing document.
 */
export const TenantSlugDocSchema = z
  .object({
    slug: SlugFormatSchema,
    tenantId: z.string().min(1, 'tenantId must be a non-empty string'),
    status: TenantSlugStatusEnum,
    allocatedAt: z.string().datetime({ message: 'allocatedAt must be a valid ISO 8601 datetime string' }),
  })
  .strict();

export type TenantSlugDoc = z.infer<typeof TenantSlugDocSchema>;

