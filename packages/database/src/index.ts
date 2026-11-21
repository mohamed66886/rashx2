/**
 * @rashx/database
 *
 * Core database abstractions, path builders, and typed reference helpers.
 *
 * Subpath entrypoints:
 * - `@rashx/database/client`: Modular Firestore client instances ('use client' safe)
 * - `@rashx/database/server`: Admin Firestore instances ('server-only' enforced)
 */

export * from './paths';
export * from './types';
export * from './hostname';

// Multi-tenant domain schemas & projections
export * from './user.schema';
export * from './slug.schema';
export * from './tenant.schema';
export * from './membership.schema';
export * from './branch.schema';
export * from './staff.schema';
export * from './service.schema';
export * from './appointment.schema';

export const DATABASE_PACKAGE_INITIALIZED = true as const;
