/**
 * @rashx/auth
 *
 * Core authentication abstractions, typed errors, and interfaces.
 *
 * Subpath entrypoints:
 * - `@rashx/auth/client`: Client SDK instances ('use client' safe)
 * - `@rashx/auth/server`: Admin SDK & verification ('server-only' enforced)
 */

export * from './errors';
export * from './types';

export const AUTH_PACKAGE_INITIALIZED = true as const;
