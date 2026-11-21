import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, Transaction, DocumentSnapshot } from 'firebase-admin/firestore';
import {
  MembershipRepository,
  MembershipError,
  MembershipErrorCode,
  type MembershipActor,
} from '../src/server/repositories/membership.repository';
import { TrustedSystemContext } from '../src/server/repositories/trusted-context';
import { createTrustedSystemContext } from '../src/server/internal/trusted-system';
import { firestorePaths } from '../src/paths';
import type { MembershipSummaryDoc, MembershipDoc } from '../src/membership.schema';

/**
 * High-fidelity in-memory transactional Firestore simulation.
 * Rigorously models Firestore Admin SDK transaction mechanics:
 * 1. Read-before-write validation: transaction.get() after set() throws.
 * 2. Atomic staging: writes are buffered and only committed if callback succeeds.
 * 3. Failure rollback: exceptions leave underlying store completely unchanged.
 * 4. Concurrency conflict detection: concurrent modifications simulate transaction retry.
 */
class InMemoryTransactionalFirestore {
  private store = new Map<string, Record<string, unknown>>();
  private docVersions = new Map<string, number>();
  public transactionExecutionCount = 0;

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
    updateFunction: (transaction: Transaction) => Promise<T>,
    attempt = 1
  ): Promise<T> {
    this.transactionExecutionCount++;

    const stagedWrites = new Map<string, Record<string, unknown>>();
    const readVersions = new Map<string, number>();
    let hasWritten = false;

    const mockTransaction: Transaction = {
      get: async (ref: DocumentReference) => {
        if (hasWritten) {
          throw new Error('Firestore transactions require all reads to be executed before writes.');
        }
        readVersions.set(ref.path, this.docVersions.get(ref.path) || 0);
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

    // Execute callback
    const result = await updateFunction(mockTransaction);

    // Concurrency conflict detection: verify all read documents remain untouched
    for (const [path, readVer] of readVersions.entries()) {
      const currentVer = this.docVersions.get(path) || 0;
      if (currentVer !== readVer) {
        // Conflicting write occurred during transaction callback
        if (attempt < 5) {
          return this.runTransaction(updateFunction, attempt + 1);
        }
        throw new Error('Transaction failed due to concurrent modification conflict.');
      }
    }

    // Atomic commit
    for (const [path, data] of stagedWrites.entries()) {
      this.store.set(path, data);
      this.docVersions.set(path, (this.docVersions.get(path) || 0) + 1);
    }

    return result;
  }
}

describe('MembershipRepository — Active Owner Invariant & Transactional Mutex', () => {
  let mockDb: InMemoryTransactionalFirestore;
  let repo: MembershipRepository;

  const tenantId = 'tenant_riyadh_01';
  const ownerUid = 'user_owner_01';
  const managerUid = 'user_manager_01';
  const staffUid = 'user_staff_01';

  const ownerActor: MembershipActor = { uid: ownerUid };
  const managerActor: MembershipActor = { uid: managerUid };
  const staffActor: MembershipActor = { uid: staffUid };

  beforeEach(() => {
    mockDb = new InMemoryTransactionalFirestore();
    repo = new MembershipRepository(mockDb as unknown as Firestore);

    // 1. Seed root users in /users/{uid}
    mockDb.setDocumentDirect(firestorePaths.user(ownerUid), {
      uid: ownerUid,
      email: 'owner@riyadhsalon.sa',
      disabled: false,
    });
    mockDb.setDocumentDirect(firestorePaths.user(managerUid), {
      uid: managerUid,
      email: 'manager@riyadhsalon.sa',
      disabled: false,
    });
    mockDb.setDocumentDirect(firestorePaths.user(staffUid), {
      uid: staffUid,
      email: 'staff@riyadhsalon.sa',
      disabled: false,
    });

    // 2. Seed initial owner membership in /tenants/{tenantId}/memberships/{ownerUid}
    mockDb.setDocumentDirect(firestorePaths.membership(tenantId, ownerUid), {
      id: ownerUid,
      tenantId,
      role: 'OWNER',
      status: 'ACTIVE',
      title: 'Primary Owner',
      joinedAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // 3. Seed initial membership summary mutex in /tenants/{tenantId}/membership_summary/counts
    mockDb.setDocumentDirect(firestorePaths.membershipSummary(tenantId), {
      tenantId,
      activeOwnerCount: 1,
      activeManagerCount: 0,
      activeStaffCount: 0,
      totalActiveMembers: 1,
      version: 0,
      updatedAt: '2026-11-20T20:00:00.000Z',
    });
  });

  // -------------------------------------------------------------
  // Scenario 1 & 2: Add Members
  // -------------------------------------------------------------
  it('1. Adds STAFF successfully and increments staff/active counters', async () => {
    const member = await repo.addMember(
      {
        tenantId,
        targetUid: staffUid,
        role: 'STAFF',
        title: 'Senior Hair Stylist',
      },
      ownerActor
    );

    expect(member.id).toBe(staffUid);
    expect(member.role).toBe('STAFF');
    expect(member.status).toBe('ACTIVE');

    // Verify summary counters
    const summary = (await repo.getMembershipSummary(tenantId))!;
    expect(summary.activeOwnerCount).toBe(1);
    expect(summary.activeManagerCount).toBe(0);
    expect(summary.activeStaffCount).toBe(1);
    expect(summary.totalActiveMembers).toBe(2);
    expect(summary.version).toBe(1);
  });

  it('2. Adds MANAGER successfully by owner and increments manager/active counters', async () => {
    const member = await repo.addMember(
      {
        tenantId,
        targetUid: managerUid,
        role: 'MANAGER',
        title: 'Branch Operations Manager',
      },
      ownerActor
    );

    expect(member.id).toBe(managerUid);
    expect(member.role).toBe('MANAGER');
    expect(member.status).toBe('ACTIVE');

    const summary = (await repo.getMembershipSummary(tenantId))!;
    expect(summary.activeOwnerCount).toBe(1);
    expect(summary.activeManagerCount).toBe(1);
    expect(summary.activeStaffCount).toBe(0);
    expect(summary.totalActiveMembers).toBe(2);
    expect(summary.version).toBe(1);
  });

  // -------------------------------------------------------------
  // Scenario 3-5: Add Member Rejection Guards
  // -------------------------------------------------------------
  it('3. Strictly rejects duplicate membership for already active member', async () => {
    // First addition
    await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);

    // Duplicate addition attempt
    await expect(
      repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor)
    ).rejects.toThrow(MembershipError);

    try {
      await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);
    } catch (err: any) {
      expect(err.code).toBe(MembershipErrorCode.MEMBERSHIP_ALREADY_EXISTS);
    }
  });

  it('4. Rejects adding a user that does not exist in root /users', async () => {
    await expect(
      repo.addMember(
        { tenantId, targetUid: 'phantom_user_missing', role: 'STAFF' },
        ownerActor
      )
    ).rejects.toThrow(MembershipError);

    try {
      await repo.addMember(
        { tenantId, targetUid: 'phantom_user_missing', role: 'STAFF' },
        ownerActor
      );
    } catch (err: any) {
      expect(err.code).toBe(MembershipErrorCode.USER_NOT_FOUND);
    }
  });

  it('5. Rejects adding a user whose account is disabled in /users', async () => {
    const disabledUid = 'user_disabled_99';
    mockDb.setDocumentDirect(firestorePaths.user(disabledUid), {
      uid: disabledUid,
      disabled: true,
    });

    await expect(
      repo.addMember({ tenantId, targetUid: disabledUid, role: 'STAFF' }, ownerActor)
    ).rejects.toThrow(MembershipError);

    try {
      await repo.addMember({ tenantId, targetUid: disabledUid, role: 'STAFF' }, ownerActor);
    } catch (err: any) {
      expect(err.code).toBe(MembershipErrorCode.USER_DISABLED);
    }
  });

  // -------------------------------------------------------------
  // Scenario 6-8: Authorization Hierarchy Guards
  // -------------------------------------------------------------
  it('6. Rejects unauthorized actor with no membership in the tenant', async () => {
    const intruderActor: MembershipActor = { uid: 'intruder_random_uid' };

    await expect(
      repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, intruderActor)
    ).rejects.toThrow(MembershipError);

    try {
      await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, intruderActor);
    } catch (err: any) {
      expect(err.code).toBe(MembershipErrorCode.FORBIDDEN);
    }
  });

  it('7. Rejects STAFF attempting membership management operations', async () => {
    // Add staff first
    await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);

    // Staff attempts to add another member
    const newHireUid = 'user_new_hire';
    mockDb.setDocumentDirect(firestorePaths.user(newHireUid), { uid: newHireUid, disabled: false });

    await expect(
      repo.addMember({ tenantId, targetUid: newHireUid, role: 'STAFF' }, staffActor)
    ).rejects.toThrow(MembershipError);

    try {
      await repo.addMember({ tenantId, targetUid: newHireUid, role: 'STAFF' }, staffActor);
    } catch (err: any) {
      expect(err.code).toBe(MembershipErrorCode.FORBIDDEN);
      expect(err.message).toContain('STAFF members are not permitted');
    }
  });

  it('8. Rejects MANAGER attempting ownership management or promotion to MANAGER/OWNER', async () => {
    // Add manager and staff
    await repo.addMember({ tenantId, targetUid: managerUid, role: 'MANAGER' }, ownerActor);
    await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);

    // Manager attempts to promote staff to MANAGER
    await expect(
      repo.changeMemberRole(
        { tenantId, targetUid: staffUid, newRole: 'MANAGER' },
        managerActor
      )
    ).rejects.toThrow(MembershipError);

    // Manager attempts to transfer ownership
    await expect(
      repo.transferOwnership({ tenantId, targetUid: managerUid }, managerActor)
    ).rejects.toThrow(MembershipError);

    // Manager attempts to suspend the OWNER
    await expect(
      repo.suspendMember({ tenantId, targetUid: ownerUid }, managerActor)
    ).rejects.toThrow(MembershipError);
  });

  // -------------------------------------------------------------
  // Scenario 9 & 10: Demote Owner Invariant
  // -------------------------------------------------------------
  it('9. Successfully demotes an OWNER when another active OWNER exists', async () => {
    // Add co-owner
    const coOwnerUid = 'user_co_owner_02';
    mockDb.setDocumentDirect(firestorePaths.user(coOwnerUid), { uid: coOwnerUid, disabled: false });
    mockDb.setDocumentDirect(firestorePaths.membership(tenantId, coOwnerUid), {
      id: coOwnerUid,
      tenantId,
      role: 'OWNER',
      status: 'ACTIVE',
      title: 'Co-Owner',
      joinedAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });
    // Set activeOwnerCount = 2, total = 2
    mockDb.setDocumentDirect(firestorePaths.membershipSummary(tenantId), {
      tenantId,
      activeOwnerCount: 2,
      activeManagerCount: 0,
      activeStaffCount: 0,
      totalActiveMembers: 2,
      version: 1,
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Demote one owner to MANAGER
    const demoted = await repo.demoteOwner(
      { tenantId, targetUid: coOwnerUid, newRole: 'MANAGER' },
      ownerActor
    );

    expect(demoted.role).toBe('MANAGER');
    const summary = (await repo.getMembershipSummary(tenantId))!;
    expect(summary.activeOwnerCount).toBe(1);
    expect(summary.activeManagerCount).toBe(1);
    expect(summary.totalActiveMembers).toBe(2);
  });

  it('10. CRITICAL: Strictly rejects demoting the last active OWNER (activeOwnerCount >= 1)', async () => {
    // Current activeOwnerCount is 1
    await expect(
      repo.demoteOwner({ tenantId, targetUid: ownerUid, newRole: 'MANAGER' }, ownerActor)
    ).rejects.toThrow(MembershipError);

    try {
      await repo.demoteOwner({ tenantId, targetUid: ownerUid, newRole: 'MANAGER' }, ownerActor);
    } catch (err: any) {
      expect(err.code).toBe(MembershipErrorCode.LAST_OWNER_INVARIANT_VIOLATION);
      expect(err.message).toContain('activeOwnerCount >= 1');
    }
  });

  // -------------------------------------------------------------
  // Scenario 11 & 12: Suspend / Remove Last Owner Invariant
  // -------------------------------------------------------------
  it('11. CRITICAL: Strictly rejects suspending the last active OWNER', async () => {
    await expect(
      repo.suspendMember({ tenantId, targetUid: ownerUid }, ownerActor)
    ).rejects.toThrow(MembershipError);

    try {
      await repo.suspendMember({ tenantId, targetUid: ownerUid }, ownerActor);
    } catch (err: any) {
      expect(err.code).toBe(MembershipErrorCode.LAST_OWNER_INVARIANT_VIOLATION);
    }
  });

  it('12. CRITICAL: Strictly rejects removing the last active OWNER', async () => {
    await expect(
      repo.removeMember({ tenantId, targetUid: ownerUid }, ownerActor)
    ).rejects.toThrow(MembershipError);

    try {
      await repo.removeMember({ tenantId, targetUid: ownerUid }, ownerActor);
    } catch (err: any) {
      expect(err.code).toBe(MembershipErrorCode.LAST_OWNER_INVARIANT_VIOLATION);
    }
  });

  // -------------------------------------------------------------
  // Scenario 13: Reactivate Suspended Member
  // -------------------------------------------------------------
  it('13. Successfully reactivates a suspended member and restores counters', async () => {
    await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);
    await repo.suspendMember({ tenantId, targetUid: staffUid }, ownerActor);

    // After suspension: activeStaffCount = 0, total = 1
    let summary = (await repo.getMembershipSummary(tenantId))!;
    expect(summary.activeStaffCount).toBe(0);
    expect(summary.totalActiveMembers).toBe(1);

    // Reactivate
    const reactivated = await repo.reactivateMember({ tenantId, targetUid: staffUid }, ownerActor);
    expect(reactivated.status).toBe('ACTIVE');

    summary = (await repo.getMembershipSummary(tenantId))!;
    expect(summary.activeStaffCount).toBe(1);
    expect(summary.totalActiveMembers).toBe(2);
  });

  // -------------------------------------------------------------
  // Scenario 14 & 15: Counter Verification & Rollback Invariance
  // -------------------------------------------------------------
  it('14. Verifies counters after every step in a multi-action lifecycle', async () => {
    // Add manager
    await repo.addMember({ tenantId, targetUid: managerUid, role: 'MANAGER' }, ownerActor);
    let s = (await repo.getMembershipSummary(tenantId))!;
    expect(s.activeOwnerCount).toBe(1);
    expect(s.activeManagerCount).toBe(1);
    expect(s.totalActiveMembers).toBe(2);

    // Add staff
    await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);
    s = (await repo.getMembershipSummary(tenantId))!;
    expect(s.activeStaffCount).toBe(1);
    expect(s.totalActiveMembers).toBe(3);

    // Change staff to manager
    await repo.changeMemberRole(
      { tenantId, targetUid: staffUid, newRole: 'MANAGER' },
      ownerActor
    );
    s = (await repo.getMembershipSummary(tenantId))!;
    expect(s.activeManagerCount).toBe(2);
    expect(s.activeStaffCount).toBe(0);
    expect(s.totalActiveMembers).toBe(3);

    // Suspend managerUid
    await repo.suspendMember({ tenantId, targetUid: managerUid }, ownerActor);
    s = (await repo.getMembershipSummary(tenantId))!;
    expect(s.activeManagerCount).toBe(1);
    expect(s.totalActiveMembers).toBe(2);
  });

  it('15. Verifies counters remain unchanged when a mutation fails and rolls back', async () => {
    const sBefore = (await repo.getMembershipSummary(tenantId))!;

    // Attempt invalid demotion (last owner)
    await expect(
      repo.demoteOwner({ tenantId, targetUid: ownerUid, newRole: 'STAFF' }, ownerActor)
    ).rejects.toThrow();

    const sAfter = (await repo.getMembershipSummary(tenantId))!;
    expect(sAfter.activeOwnerCount).toBe(sBefore.activeOwnerCount);
    expect(sAfter.totalActiveMembers).toBe(sBefore.totalActiveMembers);
    expect(sAfter.version).toBe(sBefore.version);
  });

  // -------------------------------------------------------------
  // Scenario 16 & 17: Atomic Ownership Transfer
  // -------------------------------------------------------------
  it('16. Transfers ownership atomically: promotes target to OWNER and demotes old OWNER to MANAGER', async () => {
    await repo.addMember({ tenantId, targetUid: managerUid, role: 'MANAGER' }, ownerActor);

    const transferResult = await repo.transferOwnership(
      { tenantId, targetUid: managerUid, previousOwnerRole: 'MANAGER' },
      ownerActor
    );

    expect(transferResult.newOwner.id).toBe(managerUid);
    expect(transferResult.newOwner.role).toBe('OWNER');

    expect(transferResult.previousOwner.id).toBe(ownerUid);
    expect(transferResult.previousOwner.role).toBe('MANAGER');

    // Invariant: exactly 1 active owner retained throughout
    const summary = (await repo.getMembershipSummary(tenantId))!;
    expect(summary.activeOwnerCount).toBe(1);
    expect(summary.activeManagerCount).toBe(1);
    expect(summary.totalActiveMembers).toBe(2);
  });

  it('17. Rejects invalid ownership transfer (self-transfer, non-existent target, suspended target)', async () => {
    await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);
    await repo.suspendMember({ tenantId, targetUid: staffUid }, ownerActor);

    // Reject self-transfer
    await expect(
      repo.transferOwnership({ tenantId, targetUid: ownerUid }, ownerActor)
    ).rejects.toThrow(/Cannot transfer ownership to self/);

    // Reject transfer to missing target
    await expect(
      repo.transferOwnership({ tenantId, targetUid: 'missing_target' }, ownerActor)
    ).rejects.toThrow(MembershipError);

    // Reject transfer to suspended target
    await expect(
      repo.transferOwnership({ tenantId, targetUid: staffUid }, ownerActor)
    ).rejects.toThrow(/Target member must be ACTIVE/);
  });

  // -------------------------------------------------------------
  // Scenario 18: Tenant Isolation / Cross-Tenant Rejection
  // -------------------------------------------------------------
  it('18. Enforces strict tenant isolation: rejects cross-tenant mutations', async () => {
    const foreignTenantId = 'tenant_jeddah_99';

    // Actor is owner in riyadh_01, attempts mutation in jeddah_99 where they have no membership
    mockDb.setDocumentDirect(firestorePaths.membershipSummary(foreignTenantId), {
      tenantId: foreignTenantId,
      activeOwnerCount: 1,
      activeManagerCount: 0,
      activeStaffCount: 0,
      totalActiveMembers: 1,
      version: 0,
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    await expect(
      repo.addMember({ tenantId: foreignTenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor)
    ).rejects.toThrow(MembershipError);

    try {
      await repo.addMember(
        { tenantId: foreignTenantId, targetUid: staffUid, role: 'STAFF' },
        ownerActor
      );
    } catch (err: any) {
      expect(err.code).toBe(MembershipErrorCode.FORBIDDEN);
      expect(err.message).toContain('has no membership in tenant');
    }
  });

  // -------------------------------------------------------------
  // Scenario 19: Prevent Double Counter Decrement
  // -------------------------------------------------------------
  it('19. Prevents double counter decrement when repeatedly suspending or removing a member', async () => {
    await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);
    let s = (await repo.getMembershipSummary(tenantId))!;
    expect(s.totalActiveMembers).toBe(2);
    expect(s.activeStaffCount).toBe(1);

    // First suspend
    await repo.suspendMember({ tenantId, targetUid: staffUid }, ownerActor);
    s = (await repo.getMembershipSummary(tenantId))!;
    expect(s.totalActiveMembers).toBe(1);
    expect(s.activeStaffCount).toBe(0);

    // Second suspend (no-op on counters)
    await repo.suspendMember({ tenantId, targetUid: staffUid }, ownerActor);
    s = (await repo.getMembershipSummary(tenantId))!;
    expect(s.totalActiveMembers).toBe(1);
    expect(s.activeStaffCount).toBe(0);

    // Remove already suspended member (counters were already decremented; must not decrement again)
    await repo.removeMember({ tenantId, targetUid: staffUid }, ownerActor);
    s = (await repo.getMembershipSummary(tenantId))!;
    expect(s.totalActiveMembers).toBe(1);
    expect(s.activeStaffCount).toBe(0);
  });

  // -------------------------------------------------------------
  // Scenario 20: Concurrent Demotion Preserves Invariant
  // -------------------------------------------------------------
  it('20. Guarantees that concurrent owner demotion attempts preserve at least one active owner', async () => {
    // Start with 2 owners: owner_01 and owner_02
    const owner02Uid = 'user_owner_02';
    mockDb.setDocumentDirect(firestorePaths.user(owner02Uid), { uid: owner02Uid, disabled: false });
    mockDb.setDocumentDirect(firestorePaths.membership(tenantId, owner02Uid), {
      id: owner02Uid,
      tenantId,
      role: 'OWNER',
      status: 'ACTIVE',
      title: 'Co-Owner',
      joinedAt: '2026-11-20T20:00:00.000Z',
      updatedAt: '2026-11-20T20:00:00.000Z',
    });
    mockDb.setDocumentDirect(firestorePaths.membershipSummary(tenantId), {
      tenantId,
      activeOwnerCount: 2,
      activeManagerCount: 0,
      activeStaffCount: 0,
      totalActiveMembers: 2,
      version: 0,
      updatedAt: '2026-11-20T20:00:00.000Z',
    });

    // Two concurrent transactions attempt to demote BOTH owners at the exact same moment:
    // T1: Demote owner_01 to MANAGER
    // T2: Demote owner_02 to MANAGER
    // If concurrency control failed, both could read activeOwnerCount=2 and commit, leaving 0 owners!
    const t1 = repo.demoteOwner({ tenantId, targetUid: ownerUid, newRole: 'MANAGER' }, ownerActor);
    const t2 = repo.demoteOwner({ tenantId, targetUid: owner02Uid, newRole: 'MANAGER' }, { uid: owner02Uid });

    const results = await Promise.allSettled([t1, t2]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly one demotion must succeed, and the second must be rejected by the invariant!
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const rejectionReason = (rejected[0] as PromiseRejectedResult).reason;
    expect(rejectionReason).toBeInstanceOf(MembershipError);
    expect(rejectionReason.code).toBe(MembershipErrorCode.LAST_OWNER_INVARIANT_VIOLATION);

    // The summary document must have activeOwnerCount exactly 1 (invariant preserved!)
    const finalSummary = (await repo.getMembershipSummary(tenantId))!;
    expect(finalSummary.activeOwnerCount).toBe(1);
    expect(finalSummary.activeManagerCount).toBe(1);
    expect(finalSummary.totalActiveMembers).toBe(2);
  });

  // -------------------------------------------------------------
  // Gate B.2.3 Security Closure: 12 Mandatory Regression Tests
  // -------------------------------------------------------------
  describe('Gate B.2.3 Security Closure — 12 Mandatory Security & Invariant Regression Tests', () => {
    it('Regression Test 1: system: true spoofing by an ordinary caller throws UNAUTHORIZED', async () => {
      // Ordinary caller attempts to pass plain object with system: true
      await expect(
        repo.addMember(
          { tenantId, targetUid: staffUid, role: 'STAFF' },
          { uid: 'attacker', system: true } as any
        )
      ).rejects.toThrow(MembershipError);

      try {
        await repo.addMember(
          { tenantId, targetUid: staffUid, role: 'STAFF' },
          { uid: 'attacker', system: true } as any
        );
        expect.fail('Should have rejected plain system boolean');
      } catch (err: any) {
        expect(err).toBeInstanceOf(MembershipError);
        expect(err.code).toBe(MembershipErrorCode.UNAUTHORIZED);
        expect(err.message).toContain('System privilege cannot be granted via untrusted context');
      }

      // Conversely, genuine internal orchestration context succeeds
      const trustedSystem = createTrustedSystemContext('System background worker');
      const systemResult = await repo.addMember(
        { tenantId, targetUid: staffUid, role: 'STAFF' },
        trustedSystem
      );
      expect(systemResult.id).toBe(staffUid);
      expect(systemResult.status).toBe('ACTIVE');
    });

    it('Regression Test 2: isPlatformAdmin: true spoofing without an authoritative document in /platform_admins/{uid} throws UNAUTHORIZED', async () => {
      // Caller asserts isPlatformAdmin: true, but NO document exists in /platform_admins/spoof_admin
      const spoofActor: MembershipActor = {
        uid: 'spoof_admin_uid',
        isPlatformAdmin: true,
      };

      await expect(
        repo.addMember(
          { tenantId, targetUid: staffUid, role: 'STAFF' },
          spoofActor
        )
      ).rejects.toThrow(MembershipError);

      try {
        await repo.addMember(
          { tenantId, targetUid: staffUid, role: 'STAFF' },
          spoofActor
        );
        expect.fail('Should have failed authoritative platform admin check');
      } catch (err: any) {
        expect(err).toBeInstanceOf(MembershipError);
        expect(err.code).toBe(MembershipErrorCode.UNAUTHORIZED);
        expect(err.message).toContain('not an authoritative platform administrator');
      }
    });

    it('Regression Test 3: Valid platform admin record in /platform_admins/{uid} permits platform recovery operations', async () => {
      const platformAdminUid = 'super_platform_admin_01';
      // Seed authoritative platform admin record in /platform_admins/{uid}
      mockDb.setDocumentDirect(firestorePaths.platformAdmin(platformAdminUid), {
        uid: platformAdminUid,
        role: 'SUPER_ADMIN',
        createdAt: '2026-11-20T20:00:00.000Z',
      });

      const validAdminActor: MembershipActor = {
        uid: platformAdminUid,
        isPlatformAdmin: true,
      };

      // Platform admin can execute mutations even without being an active member of the tenant
      const member = await repo.addMember(
        { tenantId, targetUid: staffUid, role: 'STAFF' },
        validAdminActor
      );
      expect(member.id).toBe(staffUid);
      expect(member.role).toBe('STAFF');

      const summary = (await repo.getMembershipSummary(tenantId))!;
      expect(summary.activeStaffCount).toBe(1);
    });

    it('Regression Test 4: Forged MembershipActor UID with no membership throws FORBIDDEN', async () => {
      const nonExistentActor: MembershipActor = { uid: 'phantom_forged_actor' };

      await expect(
        repo.addMember(
          { tenantId, targetUid: staffUid, role: 'STAFF' },
          nonExistentActor
        )
      ).rejects.toThrow(MembershipError);

      try {
        await repo.addMember(
          { tenantId, targetUid: staffUid, role: 'STAFF' },
          nonExistentActor
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(MembershipError);
        expect(err.code).toBe(MembershipErrorCode.FORBIDDEN);
        expect(err.message).toContain('has no membership in tenant');
      }
    });

    it('Regression Test 5: Forged actor role or privilege (e.g. caller claiming role: OWNER in params) is ignored because role is derived exclusively from Firestore', async () => {
      // Add staff member to tenant
      await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);

      // Caller sends actor with role: 'OWNER' spoofed on the object
      const spoofedRoleActor = { uid: staffUid, role: 'OWNER' } as unknown as MembershipActor;

      // When attempting to add a new member, the repository re-reads Firestore /tenants/{tenantId}/memberships/{staffUid}
      // and derives actorRole = 'STAFF', strictly rejecting the mutation with FORBIDDEN
      const newHireUid = 'user_new_hire_99';
      mockDb.setDocumentDirect(firestorePaths.user(newHireUid), { uid: newHireUid, disabled: false });

      await expect(
        repo.addMember({ tenantId, targetUid: newHireUid, role: 'STAFF' }, spoofedRoleActor)
      ).rejects.toThrow(MembershipError);

      try {
        await repo.addMember({ tenantId, targetUid: newHireUid, role: 'STAFF' }, spoofedRoleActor);
      } catch (err: any) {
        expect(err).toBeInstanceOf(MembershipError);
        expect(err.code).toBe(MembershipErrorCode.FORBIDDEN);
        expect(err.message).toContain('STAFF members are not permitted');
      }
    });

    it('Regression Test 6: Cross-tenant actor attempting membership mutation throws FORBIDDEN', async () => {
      const tenantB = 'tenant_foreign_salon';
      // Seed Tenant B summary
      mockDb.setDocumentDirect(firestorePaths.membershipSummary(tenantB), {
        tenantId: tenantB,
        activeOwnerCount: 1,
        activeManagerCount: 0,
        activeStaffCount: 0,
        totalActiveMembers: 1,
        version: 0,
        updatedAt: '2026-11-20T20:00:00.000Z',
      });

      // Owner of tenant_riyadh_01 tries to execute mutation in tenant_foreign_salon
      await expect(
        repo.addMember({ tenantId: tenantB, targetUid: staffUid, role: 'STAFF' }, ownerActor)
      ).rejects.toThrow(MembershipError);

      try {
        await repo.addMember({ tenantId: tenantB, targetUid: staffUid, role: 'STAFF' }, ownerActor);
      } catch (err: any) {
        expect(err).toBeInstanceOf(MembershipError);
        expect(err.code).toBe(MembershipErrorCode.FORBIDDEN);
        expect(err.message).toContain('has no membership in tenant');
      }
    });

    it('Regression Test 7: Suspended actor attempting mutation throws FORBIDDEN', async () => {
      // Add manager then suspend manager
      await repo.addMember({ tenantId, targetUid: managerUid, role: 'MANAGER' }, ownerActor);
      await repo.suspendMember({ tenantId, targetUid: managerUid }, ownerActor);

      // Verify manager membership is SUSPENDED
      const managerDoc = (await repo.getMembership(tenantId, managerUid))!;
      expect(managerDoc.status).toBe('SUSPENDED');

      // Suspended manager attempts to add staff
      const candidateUid = 'candidate_staff_01';
      mockDb.setDocumentDirect(firestorePaths.user(candidateUid), { uid: candidateUid, disabled: false });

      await expect(
        repo.addMember({ tenantId, targetUid: candidateUid, role: 'STAFF' }, managerActor)
      ).rejects.toThrow(MembershipError);

      try {
        await repo.addMember({ tenantId, targetUid: candidateUid, role: 'STAFF' }, managerActor);
      } catch (err: any) {
        expect(err).toBeInstanceOf(MembershipError);
        expect(err.code).toBe(MembershipErrorCode.FORBIDDEN);
        expect(err.message).toContain('membership is not ACTIVE');
      }
    });

    it('Regression Test 8: Revoked actor attempting mutation throws FORBIDDEN', async () => {
      // Add staff then remove staff (status -> REVOKED)
      await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);
      await repo.removeMember({ tenantId, targetUid: staffUid }, ownerActor);

      const staffDoc = (await repo.getMembership(tenantId, staffUid))!;
      expect(staffDoc.status).toBe('REVOKED');

      // Revoked staff attempts any mutation
      await expect(
        repo.suspendMember({ tenantId, targetUid: ownerUid }, staffActor)
      ).rejects.toThrow(MembershipError);

      try {
        await repo.suspendMember({ tenantId, targetUid: ownerUid }, staffActor);
      } catch (err: any) {
        expect(err).toBeInstanceOf(MembershipError);
        expect(err.code).toBe(MembershipErrorCode.FORBIDDEN);
        expect(err.message).toContain('membership is not ACTIVE');
      }
    });

    it('Regression Test 9: Unauthorized attempt by STAFF or MANAGER to modify/demote/suspend an Owner throws FORBIDDEN', async () => {
      await repo.addMember({ tenantId, targetUid: managerUid, role: 'MANAGER' }, ownerActor);
      await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);

      // MANAGER attempts to suspend OWNER
      await expect(
        repo.suspendMember({ tenantId, targetUid: ownerUid }, managerActor)
      ).rejects.toThrow(MembershipError);

      // MANAGER attempts to demote OWNER
      await expect(
        repo.demoteOwner({ tenantId, targetUid: ownerUid, newRole: 'STAFF' }, managerActor)
      ).rejects.toThrow(MembershipError);

      // STAFF attempts to suspend OWNER
      await expect(
        repo.suspendMember({ tenantId, targetUid: ownerUid }, staffActor)
      ).rejects.toThrow(MembershipError);

      // STAFF attempts to demote OWNER
      await expect(
        repo.demoteOwner({ tenantId, targetUid: ownerUid, newRole: 'STAFF' }, staffActor)
      ).rejects.toThrow(MembershipError);
    });

    it('Regression Test 10: Audit record is written ONLY when mutation succeeds (atomic rollback on error leaves zero audit logs)', async () => {
      // 1. Initial state: 0 audit logs in tenant
      const initialLogs = mockDb.getStoreKeys().filter((k) => k.startsWith(`tenants/${tenantId}/audit_logs`));
      expect(initialLogs.length).toBe(0);

      // 2. Execute failing mutation (attempting to suspend sole owner)
      await expect(
        repo.suspendMember({ tenantId, targetUid: ownerUid }, ownerActor)
      ).rejects.toThrow(MembershipError);

      // Verify zero audit logs created due to atomic transaction rollback
      const logsAfterFailure = mockDb.getStoreKeys().filter((k) => k.startsWith(`tenants/${tenantId}/audit_logs`));
      expect(logsAfterFailure.length).toBe(0);

      // 3. Execute successful mutation (adding staff)
      await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);

      // Verify exactly 1 audit log created
      const logsAfterSuccess = mockDb.getStoreKeys().filter((k) => k.startsWith(`tenants/${tenantId}/audit_logs`));
      expect(logsAfterSuccess.length).toBe(1);

      const auditLogDoc = mockDb.getDocumentDirect(logsAfterSuccess[0])!;
      expect(auditLogDoc.action).toBe('ADD_MEMBER');
      expect(auditLogDoc.actorUid).toBe(ownerUid);
      expect(auditLogDoc.targetUid).toBe(staffUid);
      expect(auditLogDoc.newRole).toBe('STAFF');
      expect(auditLogDoc.newStatus).toBe('ACTIVE');
      // Verify zero PII (no email, phone, name)
      expect(auditLogDoc.email).toBeUndefined();
      expect(auditLogDoc.phone).toBeUndefined();
      expect(auditLogDoc.name).toBeUndefined();
    });

    it('Regression Test 11: Existing audit records are never updated or deleted through repository APIs (append-only verification)', async () => {
      // Create first audit log
      await repo.addMember({ tenantId, targetUid: staffUid, role: 'STAFF' }, ownerActor);
      const logs1 = mockDb.getStoreKeys().filter((k) => k.startsWith(`tenants/${tenantId}/audit_logs`));
      expect(logs1.length).toBe(1);
      const firstLogContent = JSON.stringify(mockDb.getDocumentDirect(logs1[0]));

      // Create second audit log
      await repo.changeMemberRole({ tenantId, targetUid: staffUid, newRole: 'MANAGER' }, ownerActor);
      const logs2 = mockDb.getStoreKeys().filter((k) => k.startsWith(`tenants/${tenantId}/audit_logs`));
      expect(logs2.length).toBe(2);

      // Verify the first audit log content remains 100% untouched and unmodified
      const originalLogAfterSecondOp = JSON.stringify(mockDb.getDocumentDirect(logs1[0]));
      expect(originalLogAfterSecondOp).toBe(firstLogContent);

      // Confirm repository interface does not expose mutation methods for audit logs
      expect((repo as any).updateAuditLog).toBeUndefined();
      expect((repo as any).deleteAuditLog).toBeUndefined();
      expect((repo as any).clearAuditLogs).toBeUndefined();
    });

    it('Regression Test 12: Concurrent owner changes preserve the active-owner invariant (activeOwnerCount >= 1)', async () => {
      // Seed co-owner
      const coOwnerUid = 'user_co_owner_concurrent';
      mockDb.setDocumentDirect(firestorePaths.user(coOwnerUid), { uid: coOwnerUid, disabled: false });
      mockDb.setDocumentDirect(firestorePaths.membership(tenantId, coOwnerUid), {
        id: coOwnerUid,
        tenantId,
        role: 'OWNER',
        status: 'ACTIVE',
        title: 'Co-Owner',
        joinedAt: '2026-11-20T20:00:00.000Z',
        updatedAt: '2026-11-20T20:00:00.000Z',
      });
      mockDb.setDocumentDirect(firestorePaths.membershipSummary(tenantId), {
        tenantId,
        activeOwnerCount: 2,
        activeManagerCount: 0,
        activeStaffCount: 0,
        totalActiveMembers: 2,
        version: 0,
        updatedAt: '2026-11-20T20:00:00.000Z',
      });

      // Two concurrent transactions attempt to demote both owners at the same instant
      const demote1 = repo.demoteOwner({ tenantId, targetUid: ownerUid, newRole: 'MANAGER' }, ownerActor);
      const demote2 = repo.demoteOwner({ tenantId, targetUid: coOwnerUid, newRole: 'MANAGER' }, { uid: coOwnerUid });

      const results = await Promise.allSettled([demote1, demote2]);
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      // Exactly one succeeds, the other fails with LAST_OWNER_INVARIANT_VIOLATION
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);

      const err = (rejected[0] as PromiseRejectedResult).reason;
      expect(err).toBeInstanceOf(MembershipError);
      expect(err.code).toBe(MembershipErrorCode.LAST_OWNER_INVARIANT_VIOLATION);

      // Verify final activeOwnerCount is strictly 1
      const finalSummary = (await repo.getMembershipSummary(tenantId))!;
      expect(finalSummary.activeOwnerCount).toBe(1);
      expect(finalSummary.activeManagerCount).toBe(1);
      expect(finalSummary.totalActiveMembers).toBe(2);
    });
  });
});
