import 'server-only';

/**
 * Module-private Symbol brand for runtime identification.
 * This Symbol is never exported and cannot be accessed from outside this module.
 */
const TRUSTED_SYSTEM_BRAND = Symbol('RASHX_TRUSTED_SYSTEM');

/**
 * Module-private constructor key ensuring TrustedSystemContext cannot be
 * constructed directly with `new` by external code.
 */
const INTERNAL_CONSTRUCTOR_KEY = Symbol('INTERNAL_CONSTRUCTOR_KEY');

/**
 * Module-scoped WeakSet storing all validly created TrustedSystemContext instances.
 * Even if an attacker inspects symbols or clones prototypes, they cannot inject
 * objects into this set from outside this module.
 */
const TRUSTED_INSTANCES = new WeakSet<object>();

/**
 * Server-only unforgeable context for trusted internal system operations.
 *
 * TRUST BOUNDARY & DESIGN LIMITATIONS:
 * 1. JavaScript Symbol Isolation: Symbols cannot be forged via JSON deserialization.
 * 2. Module-Scoped WeakSet: Prevents prototype forgery (Object.create) or property spoofing.
 * 3. Constructor Restriction: Direct invocation with `new` without the private constructor key throws.
 * 4. Export Boundary: This class and its capability creator are NOT exported through the public
 *    entrypoint `@rashx/database/server`. External consumers, route handlers, and server actions
 *    have no access to instantiate this capability.
 *
 * Note on Node.js / Server Runtime Trust Boundaries:
 * In a monolithic server process, code running within the same execution context could theoretically
 * attempt reflection or memory inspection if arbitrary code execution is present. The module boundary
 * enforced here provides strict encapsulation against accidental or unauthorized invocation by
 * route handlers, server actions, or ordinary database consumers.
 */
export class TrustedSystemContext {
  public readonly [TRUSTED_SYSTEM_BRAND] = true;

  /**
   * Construction is restricted to internal callers presenting the private constructor key.
   */
  constructor(key: symbol, public readonly reason: string) {
    if (key !== INTERNAL_CONSTRUCTOR_KEY) {
      throw new Error(
        'Direct construction of TrustedSystemContext is forbidden. System capability is restricted.'
      );
    }
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      throw new Error('TrustedSystemContext requires a non-empty reason.');
    }
    TRUSTED_INSTANCES.add(this);
  }

  /**
   * Authoritative runtime type guard verifying that a context object:
   * 1. Is an object and instance of TrustedSystemContext.
   * 2. Was registered in the module-private WeakSet at construction time.
   * 3. Bears the module-private Symbol brand.
   */
  static isTrusted(val: unknown): val is TrustedSystemContext {
    return (
      typeof val === 'object' &&
      val !== null &&
      val instanceof TrustedSystemContext &&
      TRUSTED_INSTANCES.has(val) &&
      val[TRUSTED_SYSTEM_BRAND] === true
    );
  }
}

/**
 * Capability creator restricted to internal server-side orchestration modules.
 * This function is NOT exported from package entrypoints.
 */
export function createInternalSystemContext(reason: string): TrustedSystemContext {
  return new TrustedSystemContext(INTERNAL_CONSTRUCTOR_KEY, reason);
}
