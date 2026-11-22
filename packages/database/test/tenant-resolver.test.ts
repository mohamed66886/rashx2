import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { TenantResolver } from '../src/server/tenant-resolver';
import { firestorePaths } from '../src/paths';

/**
 * In-memory Firestore simulation for TenantResolver testing with fault injection.
 */
class InMemoryFirestore {
  private store = new Map<string, Record<string, unknown>>();
  public getCount = 0;
  public throwErrorOnGet = false;

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => {
        if (this.throwErrorOnGet) {
          throw new Error('Simulated Firestore read network/auth failure');
        }
        this.getCount++;
        const exists = this.store.has(path);
        const data = exists ? JSON.parse(JSON.stringify(this.store.get(path))) : undefined;
        return {
          id: path.split('/').pop()!,
          ref: this.doc(path),
          exists,
          data: () => data,
        } as unknown as DocumentSnapshot;
      },
    } as unknown as DocumentReference;
  }

  setDocumentDirect(path: string, data: Record<string, unknown>) {
    this.store.set(path, JSON.parse(JSON.stringify(data)));
  }

  deleteDocumentDirect(path: string) {
    this.store.delete(path);
  }
}

describe('TenantResolver — Authoritative Resolution & Revocation Safety', () => {
  let mockDb: InMemoryFirestore;
  let resolver: TenantResolver;

  const validSlug = 'riyadh-salon';
  const tenantId = 'tenant_riyadh_001';

  beforeEach(() => {
    mockDb = new InMemoryFirestore();
    resolver = new TenantResolver(mockDb as unknown as Firestore, { cacheTtlMs: 30_000 });

    // Seed canonical slug reservation in /tenant_slugs/{slug}
    mockDb.setDocumentDirect(firestorePaths.tenantSlug(validSlug), {
      slug: validSlug,
      tenantId,
      status: 'ACTIVE',
      allocatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Seed operational tenant document in /tenants/{tenantId}
    mockDb.setDocumentDirect(firestorePaths.tenant(tenantId), {
      id: tenantId,
      slug: validSlug,
      name: 'Riyadh Luxury Beauty Salon',
      commercialName: 'Riyadh Luxury Salon LLC',
      crNumber: '1010123456',
      vatNumber: '300123456700003',
      status: 'ACTIVE',
      isPublished: true,
      primaryOwnerUid: 'owner_user_99',
      subscriptionTier: 'GROWTH',
      billingEmail: 'billing@riyadhsalon.sa',
      timezone: 'Asia/Riyadh',
      currency: 'SAR',
      createdAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });
  });

  // -------------------------------------------------------------
  // Scenario 1: Authoritative Active Tenant Resolution
  // -------------------------------------------------------------
  it('1. Authoritatively resolves an active tenant and returns minimal TenantContext', async () => {
    const outcome = await resolver.resolveTenantBySlug(validSlug);

    expect(outcome.success).toBe(true);
    if (!outcome.success) return;

    const ctx = outcome.context;
    expect(ctx.tenantId).toBe(tenantId);
    expect(ctx.slug).toBe(validSlug);
    expect(ctx.name).toBe('Riyadh Luxury Beauty Salon');
    expect(ctx.commercialName).toBe('Riyadh Luxury Salon LLC');
    expect(ctx.status).toBe('ACTIVE');
    expect(ctx.isPublished).toBe(true);
    expect(ctx.subscriptionTier).toBe('GROWTH');
    expect(ctx.timezone).toBe('Asia/Riyadh');
    expect(ctx.currency).toBe('SAR');
    expect(ctx.resolvedAt).toBeDefined();

    // Verify strict PII & sensitive operational data exclusion:
    expect((ctx as any).crNumber).toBeUndefined();
    expect((ctx as any).vatNumber).toBeUndefined();
    expect((ctx as any).billingEmail).toBeUndefined();
    expect((ctx as any).primaryOwnerUid).toBeUndefined();
  });

  // -------------------------------------------------------------
  // Mandatory Cache Revocation Regression Tests
  // -------------------------------------------------------------
  describe('Cache Revocation Safety (Zero Stale Authorization Lag)', () => {
    it('2. Immediately returns TENANT_SUSPENDED when tenant status changed to SUSPENDED (no stale cache bypass)', async () => {
      // Step A: Resolve ACTIVE tenant and populate any presentation cache
      const o1 = await resolver.resolveTenantBySlug(validSlug);
      expect(o1.success).toBe(true);

      // Step B: Underlying tenant status mutated to SUSPENDED
      const currentDoc = {
        id: tenantId,
        slug: validSlug,
        name: 'Riyadh Luxury Beauty Salon',
        commercialName: 'Riyadh Luxury Salon LLC',
        crNumber: '1010123456',
        vatNumber: '300123456700003',
        status: 'SUSPENDED',
        isPublished: false,
        primaryOwnerUid: 'owner_user_99',
        subscriptionTier: 'GROWTH',
        billingEmail: 'billing@riyadhsalon.sa',
        timezone: 'Asia/Riyadh',
        currency: 'SAR',
        createdAt: '2026-11-20T20:00:00.000Z',
        updatedAt: '2026-11-21T09:00:00.000Z',
      };
      mockDb.setDocumentDirect(firestorePaths.tenant(tenantId), currentDoc);

      // Step C: Resolve again using the SAME TenantResolver instance
      const o2 = await resolver.resolveTenantBySlug(validSlug);
      expect(o2.success).toBe(false);
      if (o2.success) return;

      expect(o2.error).toBe('TENANT_SUSPENDED');
      expect(o2.reason).toContain('currently suspended');
    });

    it('3. Immediately returns TENANT_ARCHIVED when tenant status changed to ARCHIVED', async () => {
      // Step A: Initial active resolution
      const o1 = await resolver.resolveTenantBySlug(validSlug);
      expect(o1.success).toBe(true);

      // Step B: Mutate status to ARCHIVED in Firestore
      mockDb.setDocumentDirect(firestorePaths.tenant(tenantId), {
        id: tenantId,
        slug: validSlug,
        name: 'Riyadh Luxury Beauty Salon',
        commercialName: 'Riyadh Luxury Salon LLC',
        crNumber: '1010123456',
        vatNumber: '300123456700003',
        status: 'ARCHIVED',
        isPublished: false,
        primaryOwnerUid: 'owner_user_99',
        subscriptionTier: 'GROWTH',
        billingEmail: 'billing@riyadhsalon.sa',
        timezone: 'Asia/Riyadh',
        currency: 'SAR',
        createdAt: '2026-11-20T20:00:00.000Z',
        updatedAt: '2026-11-21T09:00:00.000Z',
      });

      // Step C: Re-resolve with SAME instance
      const o2 = await resolver.resolveTenantBySlug(validSlug);
      expect(o2.success).toBe(false);
      if (o2.success) return;

      expect(o2.error).toBe('TENANT_ARCHIVED');
      expect(o2.reason).toContain('archived');
    });

    it('4. Immediately returns INCONSISTENT_STATE when tenant document is deleted after initial resolution', async () => {
      // Step A: Initial active resolution
      const o1 = await resolver.resolveTenantBySlug(validSlug);
      expect(o1.success).toBe(true);

      // Step B: Delete operational document
      mockDb.deleteDocumentDirect(firestorePaths.tenant(tenantId));

      // Step C: Re-resolve with SAME instance
      const o2 = await resolver.resolveTenantBySlug(validSlug);
      expect(o2.success).toBe(false);
      if (o2.success) return;

      expect(o2.error).toBe('INCONSISTENT_STATE');
      expect(o2.reason).toContain('maps to non-existent tenant ID');
    });

    it('5. Immediately returns INCONSISTENT_STATE when slug mapping changes to another tenant', async () => {
      // Step A: Initial active resolution
      const o1 = await resolver.resolveTenantBySlug(validSlug);
      expect(o1.success).toBe(true);

      // Step B: Reassign slug mapping to a different tenant ID
      mockDb.setDocumentDirect(firestorePaths.tenantSlug(validSlug), {
        slug: validSlug,
        tenantId: 'tenant_other_999',
        status: 'ACTIVE',
        allocatedAt: '2026-11-20T20:00:00.000Z',
      });

      // Step C: Re-resolve with SAME instance
      const o2 = await resolver.resolveTenantBySlug(validSlug);
      expect(o2.success).toBe(false);
      if (o2.success) return;

      expect(o2.error).toBe('INCONSISTENT_STATE');
    });

    it('6. Strictly fails closed (DATABASE_ERROR) when Firestore read fails after earlier success (never returns stale active data)', async () => {
      // Step A: Initial active resolution succeeds
      const o1 = await resolver.resolveTenantBySlug(validSlug);
      expect(o1.success).toBe(true);

      // Step B: Inject Firestore fault
      mockDb.throwErrorOnGet = true;

      // Step C: Re-resolve with SAME instance
      const o2 = await resolver.resolveTenantBySlug(validSlug);
      expect(o2.success).toBe(false);
      if (o2.success) return;

      // MUST fail closed as DATABASE_ERROR, NEVER fall back to cached active data!
      expect(o2.error).toBe('DATABASE_ERROR');
      expect(o2.reason).toContain('Simulated Firestore read network/auth failure');
    });
  });

  // -------------------------------------------------------------
  // Scenario 7-10: Additional Invariant & Boundary Tests
  // -------------------------------------------------------------
  describe('Invariants & Operational Checks', () => {
    it('7. Rejects PROVISIONING tenant with TENANT_PROVISIONING', async () => {
      mockDb.setDocumentDirect(firestorePaths.tenant(tenantId), {
        id: tenantId,
        slug: validSlug,
        name: 'Provisioning Salon',
        commercialName: 'Provisioning LLC',
        crNumber: '1010123456',
        vatNumber: '300123456700003',
        status: 'PROVISIONING',
        isPublished: false,
        primaryOwnerUid: 'owner_user_99',
        subscriptionTier: 'STARTER',
        billingEmail: 'billing@prov.sa',
        timezone: 'Asia/Riyadh',
        currency: 'SAR',
        createdAt: '2026-11-20T20:00:00.000Z',
        updatedAt: '2026-11-20T20:00:00.000Z',
      });

      const outcome = await resolver.resolveTenantBySlug(validSlug);
      expect(outcome.success).toBe(false);
      if (outcome.success) return;

      expect(outcome.error).toBe('TENANT_PROVISIONING');
    });

    it('8. Rejects invalid slug format or reserved keyword', async () => {
      const oShort = await resolver.resolveTenantBySlug('ab');
      expect(oShort.success).toBe(false);
      if (!oShort.success) expect(oShort.error).toBe('INVALID_SLUG');

      const oReserved = await resolver.resolveTenantBySlug('admin');
      expect(oReserved.success).toBe(false);
      if (!oReserved.success) expect(oReserved.error).toBe('INVALID_SLUG');
    });

    it('9. Non-authoritative presentation helper returns cached context when valid', async () => {
      expect(resolver.getCachedPresentationContext(validSlug)).toBeNull();

      // Authoritative resolution populates presentation cache
      await resolver.resolveTenantBySlug(validSlug);

      const cached = resolver.getCachedPresentationContext(validSlug);
      expect(cached).not.toBeNull();
      expect(cached?.slug).toBe(validSlug);

      // Invalidation clears presentation cache
      resolver.invalidateTenantSlug(validSlug);
      expect(resolver.getCachedPresentationContext(validSlug)).toBeNull();
    });

    it('10. clearCache empties presentation cache', async () => {
      await resolver.resolveTenantBySlug(validSlug);
      expect(resolver.getCachedPresentationContext(validSlug)).not.toBeNull();

      resolver.clearCache();
      expect(resolver.getCachedPresentationContext(validSlug)).toBeNull();
    });
  });
});
