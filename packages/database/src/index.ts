/**
 * @rashx/database
 *
 * Core database abstractions, path builders, and typed reference helpers.
 *
 * Subpath entrypoints:
 * - `@rashx/database/client`: Modular Firestore client instances ('use client' safe)
 * - `@rashx/database/server`: Admin Firestore instances ('server-only' enforced)
 */

export * from './paths.js';
export * from './types.js';

export const DATABASE_PACKAGE_INITIALIZED = true as const;
