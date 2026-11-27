import { TenantBootstrapService } from '@rashx/database/server';

/**
 * Bootstrap READY is a terminal state, so once we have seen it we skip the
 * Firestore read for a few minutes instead of paying it on every layout render
 * (every router.refresh(), every server action revalidation).
 * In-memory per server instance; a cold instance simply re-checks once.
 */
const READY_TTL_MS = 5 * 60 * 1000;
const readyUntil = new Map<string, number>();

export async function ensureTenantBootstrapReady(tenantId: string): Promise<boolean> {
  const now = Date.now();
  if ((readyUntil.get(tenantId) ?? 0) > now) return true;

  const svc = new TenantBootstrapService();
  let status = await svc.getBootstrapStatus(tenantId);
  if (!status || status.status !== 'READY') {
    try {
      const recon = await svc.reconcileTenant(tenantId);
      status = recon.bootstrapStatus;
    } catch (err) {
      console.error('[DashboardLayout] Failed to reconcile tenant bootstrap:', err);
    }
  }

  const ready = status?.status === 'READY';
  if (ready) {
    if (readyUntil.size > 500) readyUntil.clear();
    readyUntil.set(tenantId, now + READY_TTL_MS);
  }
  return ready;
}
