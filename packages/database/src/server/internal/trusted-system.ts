import 'server-only';
import {
  createInternalSystemContext,
  type TrustedSystemContext,
} from '../repositories/trusted-context';

/**
 * RESTRICTED INTERNAL ORCHESTRATION MODULE:
 *
 * This module is reserved exclusively for trusted server-side system workflows
 * (e.g. initial infrastructure seeders, system maintenance tasks).
 *
 * TRUST & ACCESS BOUNDARIES:
 * - This file is NOT exported from `@rashx/database/server` or `package.json` exports.
 * - Route handlers, server actions, and external API consumers CANNOT access this factory.
 * - Request payloads, headers, query parameters, or client-controlled values cannot be
 *   used to invoke this module.
 */
export function createTrustedSystemContext(reason: string): TrustedSystemContext {
  return createInternalSystemContext(reason);
}

export { type TrustedSystemContext };

