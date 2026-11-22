import 'server-only';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from './index';
import { firestorePaths } from '../paths';
import {
  TenantSlugDocSchema,
  SlugFormatSchema,
  type TenantSlugDoc,
} from '../slug.schema';
import {
  TenantDocSchema,
  type TenantDoc,
  type TenantStatus,
  type SubscriptionTier,
} from '../tenant.schema';

/**
 * Minimal, safe tenant context returned for routing and server-side authorization.
 * Strictly excludes sensitive corporate and billing fields (CR, VAT, billing email, owner UID).
 */
export interface TenantContext {
  tenantId: string;
  slug: string;
  name: string;
  commercialName: string;
  status: TenantStatus;
  isPublished: boolean;
  subscriptionTier: SubscriptionTier;
  timezone: string;
  currency: string;
  resolvedAt: string;
}

export type TenantResolutionErrorCode =
  | 'INVALID_SLUG'
  | 'TENANT_NOT_FOUND'
  | 'TENANT_SUSPENDED'
  | 'TENANT_ARCHIVED'
  | 'TENANT_PROVISIONING'
  | 'INCONSISTENT_STATE'
  | 'DATABASE_ERROR';

export type TenantResolutionOutcome =
  | { success: true; context: TenantContext }
  | { success: false; error: TenantResolutionErrorCode; reason: string };

export interface TenantResolverOptions {
  cacheTtlMs?: number;
  disableCache?: boolean;
}

interface CacheEntry {
  context: TenantContext;
  expiresAt: number;
}

/**
 * Server-only service for resolving tenant domains/slugs against authoritative Firestore state.
 *
 * ZERO-REVOCATION-LAG & STRICT FAIL-CLOSED GUARANTEE:
 * 1. Authoritative resolution (`resolveTenantBySlug`) queries Firestore directly on EVERY call.
 * 2. In-memory caching is NEVER used as an authoritative authorization or routing bypass.
 *    This eliminates the risk of distributed cache desynchronization across independent Vercel instances
 *    when a tenant is suspended, archived, or deleted.
 * 3. Atomic lifecycle checks:
 *    - Validates slug format and reserved keywords via SlugFormatSchema.
 *    - Resolves `/tenant_slugs/{slug}` and enforces ACTIVE reservation.
 *    - Resolves `/tenants/{tenantId}` and enforces document existence.
 *    - Verifies bi-directional slug consistency between reservation and tenant document.
 *    - Verifies operational status: strictly rejects SUSPENDED, ARCHIVED, or PROVISIONING states.
 * 4. Fail-closed: If Firestore verification fails or throws an exception, `DATABASE_ERROR` is returned.
 *    Previously resolved data is NEVER returned upon an authoritative read failure.
 * 5. Strict runtime boundary ('server-only' enforced).
 */
export class TenantResolver {
  private readonly db: Firestore;
  private readonly presentationCache = new Map<string, CacheEntry>();
  private readonly cacheTtlMs: number;
  private readonly disableCache: boolean;

  constructor(firestore?: Firestore, options?: TenantResolverOptions) {
    this.db = firestore || getFirebaseAdminFirestore();
    this.cacheTtlMs = options?.cacheTtlMs ?? 30_000;
    this.disableCache = options?.disableCache ?? false;
  }

  /**
   * Authoritatively resolves a tenant slug against live Firestore state.
   *
   * Every invocation executes direct Firestore queries to eliminate cache revocation lag
   * across serverless execution environments.
   *
   * @param rawSlug Validated or unvalidated tenant slug
   */
  async resolveTenantBySlug(rawSlug: string): Promise<TenantResolutionOutcome> {
    // 1. Slug format and reserved keyword validation
    const slugParse = SlugFormatSchema.safeParse(rawSlug);
    if (!slugParse.success) {
      return {
        success: false,
        error: 'INVALID_SLUG',
        reason: slugParse.error.issues[0]?.message || `Invalid tenant slug format: '${rawSlug}'`,
      };
    }

    const cleanSlug = slugParse.data;

    try {
      // 2. Authoritative resolution of slug reservation: /tenant_slugs/{slug}
      const slugRef = this.db.doc(firestorePaths.tenantSlug(cleanSlug));
      const slugSnap = await slugRef.get();

      if (!slugSnap.exists) {
        return {
          success: false,
          error: 'TENANT_NOT_FOUND',
          reason: `No tenant registered under slug '${cleanSlug}'`,
        };
      }

      let slugDoc: TenantSlugDoc;
      try {
        slugDoc = TenantSlugDocSchema.parse(slugSnap.data());
      } catch (err) {
        return {
          success: false,
          error: 'INCONSISTENT_STATE',
          reason: `Malformed slug reservation document for '${cleanSlug}'`,
        };
      }

      // Check slug reservation lifecycle
      if (slugDoc.status === 'SUSPENDED') {
        return {
          success: false,
          error: 'TENANT_SUSPENDED',
          reason: `Tenant slug '${cleanSlug}' is currently suspended.`,
        };
      }

      if (slugDoc.status !== 'ACTIVE') {
        return {
          success: false,
          error: 'TENANT_NOT_FOUND',
          reason: `Tenant slug '${cleanSlug}' is not in ACTIVE state (status: ${slugDoc.status})`,
        };
      }

      const tenantId = slugDoc.tenantId;

      // 3. Authoritative retrieval of operational tenant document: /tenants/{tenantId}
      const tenantRef = this.db.doc(firestorePaths.tenant(tenantId));
      const tenantSnap = await tenantRef.get();

      if (!tenantSnap.exists) {
        return {
          success: false,
          error: 'INCONSISTENT_STATE',
          reason: `Slug '${cleanSlug}' maps to non-existent tenant ID '${tenantId}'`,
        };
      }

      let tenantDoc: TenantDoc;
      try {
        tenantDoc = TenantDocSchema.parse(tenantSnap.data());
      } catch (err) {
        return {
          success: false,
          error: 'INCONSISTENT_STATE',
          reason: `Malformed tenant operational document for ID '${tenantId}'`,
        };
      }

      // Verify cross-document slug consistency
      if (tenantDoc.slug !== cleanSlug) {
        return {
          success: false,
          error: 'INCONSISTENT_STATE',
          reason: `Tenant document slug '${tenantDoc.slug}' does not match reservation '${cleanSlug}'`,
        };
      }

      // 4. Authoritative verification of tenant operational lifecycle status
      if (tenantDoc.status === 'SUSPENDED') {
        return {
          success: false,
          error: 'TENANT_SUSPENDED',
          reason: `Tenant '${cleanSlug}' is currently suspended.`,
        };
      }

      if (tenantDoc.status === 'ARCHIVED') {
        return {
          success: false,
          error: 'TENANT_ARCHIVED',
          reason: `Tenant '${cleanSlug}' has been archived and is inaccessible.`,
        };
      }

      if (tenantDoc.status === 'PROVISIONING') {
        return {
          success: false,
          error: 'TENANT_PROVISIONING',
          reason: `Tenant '${cleanSlug}' is still being provisioned.`,
        };
      }

      if (tenantDoc.status !== 'ACTIVE') {
        return {
          success: false,
          error: 'TENANT_NOT_FOUND',
          reason: `Tenant '${cleanSlug}' status '${tenantDoc.status}' does not permit routing.`,
        };
      }

      // 5. Construct verified, minimal TenantContext
      const context: TenantContext = {
        tenantId: tenantDoc.id,
        slug: tenantDoc.slug,
        name: tenantDoc.name,
        commercialName: tenantDoc.commercialName,
        status: tenantDoc.status,
        isPublished: tenantDoc.isPublished,
        subscriptionTier: tenantDoc.subscriptionTier,
        timezone: tenantDoc.timezone,
        currency: tenantDoc.currency,
        resolvedAt: new Date().toISOString(),
      };

      // 6. Optional presentation cache update (never bypasses authoritative resolution)
      if (!this.disableCache) {
        this.presentationCache.set(cleanSlug, {
          context,
          expiresAt: Date.now() + this.cacheTtlMs,
        });
      }

      return {
        success: true,
        context,
      };
    } catch (error) {
      // Fail closed: Never return stale cached data if Firestore read fails
      return {
        success: false,
        error: 'DATABASE_ERROR',
        reason: `Firestore error during tenant resolution: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Non-authoritative presentation context helper.
   *
   * SECURITY NOTICE: Strictly for non-sensitive UI hints.
   * NEVER use this for authorization, permissions, or access control decisions.
   */
  getCachedPresentationContext(slug: string): TenantContext | null {
    if (this.disableCache) return null;
    const cleanSlug = slug.trim().toLowerCase();
    const entry = this.presentationCache.get(cleanSlug);
    if (!entry || entry.expiresAt <= Date.now()) {
      return null;
    }
    return entry.context;
  }

  /**
   * Invalidates cached presentation data for a specific slug.
   */
  invalidateTenantSlug(slug: string): void {
    this.presentationCache.delete(slug.trim().toLowerCase());
  }

  /**
   * Clears all cached presentation entries.
   */
  clearCache(): void {
    this.presentationCache.clear();
  }
}

let defaultResolverInstance: TenantResolver | null = null;

/**
 * Returns a shared singleton TenantResolver instance.
 */
export function getTenantResolver(
  firestore?: Firestore,
  options?: TenantResolverOptions
): TenantResolver {
  if (defaultResolverInstance && !firestore && !options) {
    return defaultResolverInstance;
  }
  const resolver = new TenantResolver(firestore, options);
  if (!firestore && !options) {
    defaultResolverInstance = resolver;
  }
  return resolver;
}

export function resetTenantResolver(): void {
  defaultResolverInstance = null;
}
