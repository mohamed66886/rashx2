import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import * as PublicServerExports from '../src/server/index';
import * as PublicRootExports from '../src/index';
import {
  TenantRepository,
  TenantProvisioningError,
  TenantProvisioningErrorCode,
} from '../src/server/repositories/tenant.repository';
import {
  MembershipRepository,
  MembershipError,
  MembershipErrorCode,
  type MembershipActor,
} from '../src/server/repositories/membership.repository';
import { TrustedSystemContext } from '../src/server/repositories/trusted-context';
import { createTrustedSystemContext } from '../src/server/internal/trusted-system';
import { firestorePaths } from '../src/paths';

/**
 * In-memory transactional Firestore simulation for boundary tests.
 */
class InMemoryTransactionalFirestore {
  private store = new Map<string, Record<string, unknown>>();
  private docVersions = new Map<string, number>();

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

  setDocumentDirect(path: string, data: Record<string, unknown>) {
    this.store.set(path, JSON.parse(JSON.stringify(data)));
    this.docVersions.set(path, (this.docVersions.get(path) || 0) + 1);
  }

  getDocumentDirect(path: string): Record<string, unknown> | undefined {
    return this.store.get(path);
  }

  hasDocument(path: string): boolean {
    return this.store.has(path);
  }

  getStoreKeys(): string[] {
    return Array.from(this.store.keys());
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
      this.docVersions.set(path, (this.docVersions.get(path) || 0) + 1);
    }

    return result;
  }
}

describe('Gate B.2.3 Final Hardening: Trusted System Capability Isolation & Audit Integrity', () => {
  let mockDb: InMemoryTransactionalFirestore;
  let tenantRepo: TenantRepository;
  let membershipRepo: MembershipRepository;

  const validOwnerUid = 'user_owner_boundary';
  const staffUid = 'user_staff_boundary';
  const tenantId = 'tenant_boundary_test';

  const validTenantPayload = {
    slug: 'boundary-salon',
    name: 'Boundary Test Salon',
    commercialName: 'Boundary Salon LLC',
    crNumber: '1010789012',
    vatNumber: '300987654300003',
    primaryOwnerUid: validOwnerUid,
    subscriptionTier: 'STARTER' as const,
    billingEmail: 'billing@boundary.sa',
  };

  beforeEach(() => {
    mockDb = new InMemoryTransactionalFirestore();
    tenantRepo = new TenantRepository(mockDb as unknown as Firestore);
    membershipRepo = new MembershipRepository(mockDb as unknown as Firestore);

    // Seed root owner user
    mockDb.setDocumentDirect(firestorePaths.user(validOwnerUid), {
      uid: validOwnerUid,
      email: 'owner@boundary.sa',
      disabled: false,
    });

    // Seed staff user
    mockDb.setDocumentDirect(firestorePaths.user(staffUid), {
      uid: staffUid,
      email: 'staff@boundary.sa',
      disabled: false,
    });
  });

  // -------------------------------------------------------------
  // Section 1: Public Export Boundary Verification
  // -------------------------------------------------------------
  describe('1. Public Package Export Boundaries', () => {
    it('proves an ordinary consumer cannot access capability creation through @rashx/database/server', () => {
      // Inspect runtime exports of @rashx/database/server
      const serverExports = PublicServerExports as Record<string, unknown>;

      // Neither the factory nor the internal creator is exported
      expect(serverExports.createTrustedSystemContext).toBeUndefined();
      expect(serverExports.createInternalSystemContext).toBeUndefined();

      // TrustedSystemContext runtime class is NOT exported as a value
      expect(serverExports.TrustedSystemContext).toBeUndefined();

      // Verify legitimate repository constructors are exported
      expect(serverExports.TenantRepository).toBeDefined();
      expect(serverExports.MembershipRepository).toBeDefined();
    });

    it('proves an ordinary consumer cannot access capability creation through root @rashx/database', () => {
      // Inspect runtime exports of @rashx/database
      const rootExports = PublicRootExports as Record<string, unknown>;

      expect(rootExports.createTrustedSystemContext).toBeUndefined();
      expect(rootExports.createInternalSystemContext).toBeUndefined();
      expect(rootExports.TrustedSystemContext).toBeUndefined();
    });

    it('proves direct construction of TrustedSystemContext without internal key is strictly forbidden', () => {
      // Attempt to invoke new TrustedSystemContext directly
      expect(() => {
        new (TrustedSystemContext as any)(Symbol('FAKE_KEY'), 'malicious reason');
      }).toThrow(/Direct construction of TrustedSystemContext is forbidden/);

      expect(() => {
        new (TrustedSystemContext as any)(undefined, 'malicious reason');
      }).toThrow(/Direct construction of TrustedSystemContext is forbidden/);
    });
  });

  // -------------------------------------------------------------
  // Section 2: Rejection of Spoofed Payloads (JSON & Symbols)
  // -------------------------------------------------------------
  describe('2. Runtime Rejection of Spoofed Payloads', () => {
    it('strictly rejects parsed JSON payload containing { "system": true } in TenantRepository', async () => {
      const jsonString = JSON.stringify({ callerUid: 'attacker_uid', system: true });
      const deserializedPayload = JSON.parse(jsonString);

      await expect(
        tenantRepo.createTenant(validTenantPayload, deserializedPayload)
      ).rejects.toThrow(TenantProvisioningError);

      try {
        await tenantRepo.createTenant(validTenantPayload, deserializedPayload);
        expect.fail('Should have rejected deserialized system boolean');
      } catch (err: any) {
        expect(err).toBeInstanceOf(TenantProvisioningError);
        expect(err.code).toBe(TenantProvisioningErrorCode.UNAUTHORIZED);
        expect(err.message).toContain('System privilege cannot be granted via untrusted context');
      }
    });

    it('strictly rejects parsed JSON payload containing { "system": true } in MembershipRepository', async () => {
      // Provision tenant first
      const created = await tenantRepo.createTenant(validTenantPayload, { callerUid: validOwnerUid });

      const jsonString = JSON.stringify({ uid: 'attacker_uid', system: true });
      const deserializedActor = JSON.parse(jsonString);

      await expect(
        membershipRepo.addMember(
          { tenantId: created.tenantId, targetUid: staffUid, role: 'STAFF' },
          deserializedActor
        )
      ).rejects.toThrow(MembershipError);

      try {
        await membershipRepo.addMember(
          { tenantId: 'any_tenant', targetUid: staffUid, role: 'STAFF' },
          deserializedActor
        );
        expect.fail('Should have rejected deserialized system boolean');
      } catch (err: any) {
        expect(err).toBeInstanceOf(MembershipError);
        expect(err.code).toBe(MembershipErrorCode.UNAUTHORIZED);
        expect(err.message).toContain('System privilege cannot be granted via untrusted context');
      }
    });

    it('strictly rejects a plain object with a forged Symbol property', async () => {
      // Attacker attempts to forge the symbol discriminator using local Symbol
      const forged1 = {
        [Symbol('RASHX_TRUSTED_SYSTEM')]: true,
        reason: 'malicious bypass attempt',
      };

      // Attacker attempts to forge using global Symbol registry
      const forged2 = {
        [Symbol.for('RASHX_TRUSTED_SYSTEM')]: true,
        reason: 'malicious bypass attempt',
      };

      // Attacker attempts prototype forgery
      const forgedProto = Object.create(TrustedSystemContext.prototype);

      expect(TrustedSystemContext.isTrusted(forged1)).toBe(false);
      expect(TrustedSystemContext.isTrusted(forged2)).toBe(false);
      expect(TrustedSystemContext.isTrusted(forgedProto)).toBe(false);

      // Attempt provisioning with forged objects
      await expect(
        tenantRepo.createTenant(validTenantPayload, forged1 as any)
      ).rejects.toThrow(TenantProvisioningError);

      await expect(
        tenantRepo.createTenant(validTenantPayload, forged2 as any)
      ).rejects.toThrow(TenantProvisioningError);

      await expect(
        tenantRepo.createTenant(validTenantPayload, forgedProto as any)
      ).rejects.toThrow(TenantProvisioningError);
    });
  });

  // -------------------------------------------------------------
  // Section 3: Legitimate Internal Orchestration Workflows
  // -------------------------------------------------------------
  describe('3. Legitimate Internal Orchestration Execution', () => {
    it('allows trusted server orchestration module to provision tenants and manage memberships', async () => {
      // Capability instantiated exclusively from internal orchestration module
      const internalContext = createTrustedSystemContext('Automated initial platform migration');

      expect(TrustedSystemContext.isTrusted(internalContext)).toBe(true);

      // Successfully provisions tenant using internal system authority
      const tenantResult = await tenantRepo.createTenant(validTenantPayload, internalContext);
      expect(tenantResult.status).toBe('PROVISIONED');

      // Successfully manages membership using internal system authority
      const memberResult = await membershipRepo.addMember(
        { tenantId: tenantResult.tenantId, targetUid: staffUid, role: 'STAFF' },
        internalContext
      );
      expect(memberResult.id).toBe(staffUid);
      expect(memberResult.role).toBe('STAFF');
      expect(memberResult.status).toBe('ACTIVE');
    });
  });

  // -------------------------------------------------------------
  // Section 4: Audit Log Integrity & Boundary Limits
  // -------------------------------------------------------------
  describe('4. Audit Log Integrity & Repository Boundary Limits', () => {
    it('verifies that MembershipRepository exposes zero mutation APIs for audit logs (append-only)', () => {
      // Confirm repository interface does not expose update, delete, or clear operations
      expect((membershipRepo as any).updateAuditLog).toBeUndefined();
      expect((membershipRepo as any).deleteAuditLog).toBeUndefined();
      expect((membershipRepo as any).removeAuditLog).toBeUndefined();
      expect((membershipRepo as any).clearAuditLogs).toBeUndefined();
      expect((membershipRepo as any).truncateAuditLogs).toBeUndefined();
    });

    it('verifies atomic rollback leaves zero audit logs on operation failure', async () => {
      const internalContext = createTrustedSystemContext('Setup tenant');
      const tenantResult = await tenantRepo.createTenant(validTenantPayload, internalContext);
      const tid = tenantResult.tenantId;

      const initialAuditCount = mockDb.getStoreKeys().filter((k) => k.startsWith(`tenants/${tid}/audit_logs`)).length;
      expect(initialAuditCount).toBe(0);

      // Attempt an invalid mutation: suspend the sole active owner (invariant violation)
      await expect(
        membershipRepo.suspendMember({ tenantId: tid, targetUid: validOwnerUid }, { uid: validOwnerUid })
      ).rejects.toThrow(MembershipError);

      // Atomic transaction rollback guarantees zero audit records persist
      const auditCountAfterFailure = mockDb.getStoreKeys().filter((k) => k.startsWith(`tenants/${tid}/audit_logs`)).length;
      expect(auditCountAfterFailure).toBe(0);
    });

    it('verifies audit logs contain zero PII and persist unchanged across operations', async () => {
      const internalContext = createTrustedSystemContext('Setup tenant');
      const tenantResult = await tenantRepo.createTenant(validTenantPayload, internalContext);
      const tid = tenantResult.tenantId;

      // 1. Add staff member
      await membershipRepo.addMember(
        { tenantId: tid, targetUid: staffUid, role: 'STAFF' },
        { uid: validOwnerUid }
      );

      const logs = mockDb.getStoreKeys().filter((k) => k.startsWith(`tenants/${tid}/audit_logs`));
      expect(logs.length).toBe(1);

      const logData = mockDb.getDocumentDirect(logs[0])!;
      expect(logData.action).toBe('ADD_MEMBER');
      expect(logData.actorUid).toBe(validOwnerUid);
      expect(logData.targetUid).toBe(staffUid);
      expect(logData.newRole).toBe('STAFF');
      expect(logData.newStatus).toBe('ACTIVE');

      // Strict PII absence verification:
      expect(logData.email).toBeUndefined();
      expect(logData.name).toBeUndefined();
      expect(logData.phone).toBeUndefined();
      expect(logData.ip).toBeUndefined();
      expect(logData.nationalId).toBeUndefined();

      const logSnapshot1 = JSON.stringify(logData);

      // 2. Perform another mutation
      await membershipRepo.changeMemberRole(
        { tenantId: tid, targetUid: staffUid, newRole: 'MANAGER' },
        { uid: validOwnerUid }
      );

      const logsAfterSecond = mockDb.getStoreKeys().filter((k) => k.startsWith(`tenants/${tid}/audit_logs`));
      expect(logsAfterSecond.length).toBe(2);

      // The first audit log is completely untouched and immutable
      const logSnapshotAfter = JSON.stringify(mockDb.getDocumentDirect(logs[0]));
      expect(logSnapshotAfter).toBe(logSnapshot1);
    });
  });
});
