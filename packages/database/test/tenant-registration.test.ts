import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import {
  TenantRepository,
  TenantProvisioningError,
  TenantProvisioningErrorCode,
} from '../src/server/repositories/tenant.repository';
import { firestorePaths } from '../src/paths';
import { CommercialRegistrationDocSchema } from '../src/tenant.schema';

/**
 * In-memory transactional Firestore simulation for tenant registration tests.
 */
class InMemoryTransactionalFirestore {
  private store = new Map<string, Record<string, unknown>>();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
    } as unknown as DocumentReference;
  }

  collection(path: string) {
    return {
      doc: (id?: string) => {
        const docId = id || `auto_${Math.random().toString(36).substring(2, 10)}`;
        return this.doc(`${path}/${docId}`);
      },
    };
  }

  private createSnapshot(path: string): DocumentSnapshot {
    const exists = this.store.has(path);
    const data = exists ? JSON.parse(JSON.stringify(this.store.get(path))) : undefined;
    return {
      id: path.split('/').pop()!,
      ref: this.doc(path),
      exists,
      data: () => data,
    } as unknown as DocumentSnapshot;
  }

  setDocumentDirect(path: string, data: Record<string, unknown>): void {
    this.store.set(path, JSON.parse(JSON.stringify(data)));
  }

  getDocumentDirect(path: string): Record<string, unknown> | undefined {
    return this.store.get(path);
  }

  hasDocument(path: string): boolean {
    return this.store.has(path);
  }

  async runTransaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    const stagedWrites = new Map<string, Record<string, unknown>>();
    let hasWritten = false;

    const mockTransaction: Transaction = {
      get: async (ref: DocumentReference) => {
        if (hasWritten) {
          throw new Error('All reads must precede writes.');
        }
        return this.createSnapshot(ref.path);
      },
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        hasWritten = true;
        stagedWrites.set(ref.path, JSON.parse(JSON.stringify(data)));
        return mockTransaction;
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        hasWritten = true;
        stagedWrites.set(ref.path, JSON.parse(JSON.stringify(data)));
        return mockTransaction;
      },
      delete: (ref: DocumentReference) => {
        hasWritten = true;
        return mockTransaction;
      },
    } as unknown as Transaction;

    const result = await updateFunction(mockTransaction);

    for (const [path, data] of stagedWrites.entries()) {
      this.store.set(path, data);
    }

    return result;
  }
}

describe('Tenant Registration & Onboarding Lifecycle', () => {
  let mockDb: InMemoryTransactionalFirestore;
  let tenantRepo: TenantRepository;

  const ownerUid = 'user_saudi_owner_noura';
  const validPayload = {
    slug: 'lamsat-noura',
    name: 'صالون لمسة نورة',
    commercialName: 'مؤسسة لمسة نورة للتزيين النسائي',
    crNumber: '1010888999',
    primaryOwnerUid: ownerUid,
    subscriptionTier: 'STARTER' as const,
    billingEmail: 'noura@salon-noura.sa',
  };

  beforeEach(() => {
    mockDb = new InMemoryTransactionalFirestore();
    tenantRepo = new TenantRepository(mockDb as unknown as Firestore);

    // Seed global owner profile in /users/{ownerUid}
    mockDb.setDocumentDirect(firestorePaths.user(ownerUid), {
      id: ownerUid,
      email: 'noura@salon-noura.sa',
      displayName: 'نورة العتيبي',
      phoneNumber: '+966501234567',
      disabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it('allows owner to self-provision their tenant atomically', async () => {
    const result = await tenantRepo.createTenant(validPayload, { callerUid: ownerUid });

    expect(result.status).toBe('PROVISIONED');
    expect(result.slug).toBe('lamsat-noura');
    expect(result.ownerUid).toBe(ownerUid);

    // Verify Slug Reservation Document
    const slugDoc = mockDb.getDocumentDirect(firestorePaths.tenantSlug('lamsat-noura'));
    expect(slugDoc).toBeDefined();
    expect(slugDoc?.tenantId).toBe(result.tenantId);
    expect(slugDoc?.status).toBe('ACTIVE');

    // Verify Tenant Operational Document
    const tenantDoc = mockDb.getDocumentDirect(firestorePaths.tenant(result.tenantId));
    expect(tenantDoc).toBeDefined();
    expect(tenantDoc?.name).toBe('صالون لمسة نورة');
    expect(tenantDoc?.crNumber).toBe('1010888999');
    expect(tenantDoc?.status).toBe('ACTIVE');

    // Verify Owner Membership Record
    const membershipDoc = mockDb.getDocumentDirect(
      firestorePaths.membership(result.tenantId, ownerUid)
    );
    expect(membershipDoc).toBeDefined();
    expect(membershipDoc?.role).toBe('OWNER');
    expect(membershipDoc?.status).toBe('ACTIVE');

    // Verify Membership Summary Counts
    const summaryDoc = mockDb.getDocumentDirect(
      firestorePaths.membershipSummary(result.tenantId)
    );
    expect(summaryDoc).toBeDefined();
    expect(summaryDoc?.activeOwnerCount).toBe(1);
    expect(summaryDoc?.totalActiveMembers).toBe(1);
  });

  it('rejects an unauthorized caller attempting to provision for a different owner', async () => {
    const attackerUid = 'user_attacker_xyz';
    await expect(
      tenantRepo.createTenant(validPayload, { callerUid: attackerUid })
    ).rejects.toThrow(TenantProvisioningError);
  });

  it('verifies commercial registration document storage', () => {
    const crRecord = {
      tenantId: 'tenant_noura_01',
      crNumber: '1010888999',
      certificateStoragePath: 'tenants/tenant_noura_01/certificates/cert_noura.pdf',
      certificateFileName: 'cert_noura.pdf',
      certificateContentType: 'application/pdf',
      certificateFileSizeBytes: 1024 * 350,
      status: 'PENDING_REVIEW',
      uploadedByUid: ownerUid,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const parsed = CommercialRegistrationDocSchema.parse(crRecord);
    expect(parsed.status).toBe('PENDING_REVIEW');
    expect(parsed.crNumber).toBe('1010888999');
  });
});
