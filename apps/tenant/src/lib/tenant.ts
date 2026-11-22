import 'server-only';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTenantResolver, type TenantContext } from './firebase-server';
import { resolveHostname } from '@rashx/database';

/**
 * Retrieves the authoritative, Firestore-verified TenantContext for the current request.
 *
 * Verification sequence:
 * 1. Reads 'x-rashx-tenant-slug' header set by trusted middleware.
 * 2. If missing, attempts fallback resolution from verified 'host' header only. (x-forwarded-host is never used).
 * 3. Authoritatively queries Firestore for slug mapping and tenant operational doc (no stale cache bypass).
 * 4. Confirms tenant lifecycle status is ACTIVE.
 * 5. Returns minimal trusted TenantContext (excluding sensitive billing/owner info).
 *
 * @param required When true (default), triggers Next.js notFound() if tenant is missing or suspended.
 */
export async function getAuthoritativeTenant(required = true): Promise<TenantContext | null> {
  const headerList = await headers();
  let slug = headerList.get('x-rashx-tenant-slug');

  if (!slug) {
    const host = headerList.get('host');
    if (host) {
      const res = resolveHostname(host);
      if (res.category === 'TENANT' && res.tenantSlug) {
        slug = res.tenantSlug;
      }
    }
  }

  if (!slug) {
    if (required) notFound();
    return null;
  }

  const resolver = getTenantResolver();
  const outcome = await resolver.resolveTenantBySlug(slug);

  if (!outcome.success) {
    if (required) notFound();
    return null;
  }

  return outcome.context;
}
