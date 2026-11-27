import { cache } from 'react';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';

/**
 * One session lookup per request. Layout + page + nested components all call this
 * and share the same result (React `cache` is request-scoped).
 *
 * Even better: wrap the export inside lib/tenant-auth.ts itself
 *   export const getTenantSubscriptionSession = cache(async () => { ... })
 * so the other ~200 call sites benefit without any change.
 */
export const getDashboardSession = cache(getTenantSubscriptionSession);
