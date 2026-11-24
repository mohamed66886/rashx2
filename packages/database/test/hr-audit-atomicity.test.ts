import { describe, it, expect, beforeEach } from 'vitest';
import type { DocumentReference, DocumentSnapshot, WriteBatch } from 'firebase-admin/firestore';
import { EmployeeRepository } from '../src/server/repositories/employee.repository';
import { ProviderRepository } from '../src/server/repositories/provider.repository';
import { CompensationRepository } from '../src/server/repositories/compensation.repository';
import { CommissionPolicyRepository } from '../src/server/repositories/commission-policy.repository';
import { InvitationRepository } from '../src/server/repositories/invitation.repository';
import { firestorePaths } from '../src/paths';
import { BranchDocSchema } from '../src/branch.schema';
import { DEFAULT_OPERATING_HOURS } from '../src/server/repositories/branch.repository';

class FailingMockFirestore {
  public store = new Map<string, Record<string, unknown>>();
  public shouldFailAuditWrite = false;

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
      set: async (data: Record<string, unknown>) => {
        this.store.set(path, JSON.parse(JSON.stringify(data)));
      },
      update: async (data: Record<string, unknown>) => {
        const existing = this.store.get(path) || {};
        this.store.set(path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
      },
    } as unknown as DocumentReference;
  }

  collection(path: string) {
    return {
      doc: (id?: string) => {
        const docId = id || `id_${Math.random().toString(36).substring(2, 9)}`;
        return this.doc(`${path}/${docId}`);
      },
      where: (field: string, op: string, val: unknown) => ({
        limit: () => ({
          get: async () => {
            const docs: DocumentSnapshot[] = [];
            for (const [key, value] of this.store.entries()) {
              if (key.startsWith(path + '/') && value[field] === val) {
                docs.push(this.createSnapshot(key));
                break;
              }
            }
            return { docs, empty: docs.length === 0 };
          },
        }),
        get: async () => {
          const docs: DocumentSnapshot[] = [];
          for (const [key, value] of this.store.entries()) {
            if (key.startsWith(path + '/') && value[field] === val) {
              docs.push(this.createSnapshot(key));
            }
          }
          return { docs, empty: docs.length === 0 };
        },
      }),
      get: async () => {
        const docs: DocumentSnapshot[] = [];
        for (const [key] of this.store.entries()) {
          const segs = key.slice(path.length + 1).split('/');
          if (key.startsWith(path + '/') && segs.length === 1) {
            docs.push(this.createSnapshot(key));
          }
        }
        return { docs, size: docs.length, empty: docs.length === 0 };
      },
    };
  }

  batch(): WriteBatch {
    const staged = new Map<string, Record<string, unknown>>();
    return {
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        staged.set(ref.path, JSON.parse(JSON.stringify(data)));
        return this.batch();
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        const existing = this.store.get(ref.path) || {};
        staged.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        return this.batch();
      },
      delete: (ref: DocumentReference) => {
        staged.delete(ref.path);
        return this.batch();
      },
      commit: async () => {
        if (this.shouldFailAuditWrite) {
          throw new Error('SIMULATED_FIRESTORE_WRITE_FAILURE: Batch commit failed during audit trail persistence.');
        }
        for (const [p, d] of staged.entries()) {
          this.store.set(p, d);
        }
      },
    } as unknown as WriteBatch;
  }

  async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    const staged = new Map<string, Record<string, unknown>>();
    const deleted = new Set<string>();

    const tx = {
      get: async (target: any) => {
        if (typeof target.get === 'function') {
          return target.get();
        }
        return this.createSnapshot(target.path);
      },
      set: (ref: DocumentReference, data: Record<string, unknown>, options?: any) => {
        if (options?.merge) {
          const existing = staged.get(ref.path) || this.store.get(ref.path) || {};
          staged.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        } else {
          staged.set(ref.path, JSON.parse(JSON.stringify(data)));
        }
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        const existing = staged.get(ref.path) || this.store.get(ref.path) || {};
        staged.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
      },
      delete: (ref: DocumentReference) => {
        deleted.add(ref.path);
      },
    };

    const result = await updateFunction(tx);

    if (this.shouldFailAuditWrite) {
      throw new Error('SIMULATED_FIRESTORE_TRANSACTION_FAILURE: Transaction aborted during audit write.');
    }

    // Commit only if no error thrown
    for (const [p, d] of staged.entries()) {
      this.store.set(p, d);
    }
    for (const p of deleted) {
      this.store.delete(p);
    }

    return result;
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
}

describe('Phase 2.2: Atomic HR Audit Trail & Mutation Atomicity Verification', () => {
  const tenantId = 'tenant_atomicity_audit';
  const branchId = 'branch_atomicity_01';
  const actorUid = 'user_owner_atomicity';
  let mockDb: FailingMockFirestore;

  beforeEach(() => {
    mockDb = new FailingMockFirestore();

    // Seed branch
    mockDb.store.set(
      firestorePaths.branch(tenantId, branchId),
      BranchDocSchema.parse({
        id: branchId,
        tenantId,
        code: 'MAIN',
        name: 'الفرع الرئيسي',
        city: 'الرياض',
        district: 'العليا',
        address: 'طريق الملك فهد',
        phone: '+966500000000',
        coordinates: { latitude: 24.7136, longitude: 46.6753 },
        isMain: true,
        isActive: true,
        operatingHours: DEFAULT_OPERATING_HOURS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  });

  it('guarantees Employee creation rollback if HR audit trail write fails in transaction', async () => {
    const repo = new EmployeeRepository(mockDb as any);
    mockDb.shouldFailAuditWrite = true;

    await expect(
      repo.createEmployee(
        tenantId,
        {
          fullNameAr: 'ريم القحطاني',
          phone: '0551122334',
          nationalId: '1088776655',
          jobTitle: 'مصففة شعر',
          employmentType: 'FULL_TIME',
          hireDate: '2026-02-01',
          primaryBranchId: branchId,
          assignedBranchIds: [branchId],
        },
        actorUid
      )
    ).rejects.toThrow('SIMULATED_FIRESTORE_TRANSACTION_FAILURE');

    // Verify zero employee documents or counters exist in store
    const employeeDocs = Array.from(mockDb.store.keys()).filter((k) =>
      k.includes('/employees/')
    );
    expect(employeeDocs.length).toBe(0);

    const auditDocs = Array.from(mockDb.store.keys()).filter((k) =>
      k.includes('/hr_audit_trail/')
    );
    expect(auditDocs.length).toBe(0);
  });

  it('guarantees Provider creation rollback if HR audit trail write fails in batch', async () => {
    // First successfully seed an employee with audit write enabled
    const employeeRepo = new EmployeeRepository(mockDb as any);
    mockDb.shouldFailAuditWrite = false;
    const employee = await employeeRepo.createEmployee(
      tenantId,
      {
        fullNameAr: 'نورة السبيعي',
        phone: '0559988776',
        nationalId: '1077665544',
        jobTitle: 'أخصائية مساج',
        employmentType: 'FULL_TIME',
        hireDate: '2026-03-01',
        primaryBranchId: branchId,
        assignedBranchIds: [branchId],
      },
      actorUid
    );

    // Now inject write failure for provider creation
    const providerRepo = new ProviderRepository(mockDb as any);
    mockDb.shouldFailAuditWrite = true;

    await expect(
      providerRepo.createProvider(
        tenantId,
        {
          employeeId: employee.id,
          displayNameAr: 'نورة - أخصائية مساج',
          assignedBranchIds: [branchId],
          isPubliclyVisible: true,
        },
        actorUid
      )
    ).rejects.toThrow('SIMULATED_FIRESTORE_WRITE_FAILURE');

    // Provider document must NOT exist
    const providerDocs = Array.from(mockDb.store.keys()).filter((k) =>
      k.includes('/providers/')
    );
    expect(providerDocs.length).toBe(0);

    // Public provider projection must NOT exist
    const publicDocs = Array.from(mockDb.store.keys()).filter((k) =>
      k.includes('/public_providers/')
    );
    expect(publicDocs.length).toBe(0);

    // Employee isProvider flag must NOT have been updated
    const empSnap = mockDb.store.get(firestorePaths.employee(tenantId, employee.id)) as any;
    expect(empSnap.isProvider).toBe(false);
  });

  it('guarantees Commission Policy creation rollback if HR audit write fails in batch', async () => {
    const repo = new CommissionPolicyRepository(mockDb as any);
    mockDb.shouldFailAuditWrite = true;

    await expect(
      repo.createPolicy(
        tenantId,
        {
          nameAr: 'عمولة المبيعات الخاصة',
          type: 'SERVICE',
          basis: 'PERCENTAGE_OF_REVENUE',
          rateBps: 1000,
          effectiveFrom: '2026-01-01',
        },
        actorUid
      )
    ).rejects.toThrow('SIMULATED_FIRESTORE_WRITE_FAILURE');

    const policyDocs = Array.from(mockDb.store.keys()).filter((k) =>
      k.includes('/commission_policies/')
    );
    expect(policyDocs.length).toBe(0);
  });

  it('guarantees Invitation creation rollback if HR audit write fails in batch', async () => {
    const repo = new InvitationRepository(mockDb as any);
    mockDb.shouldFailAuditWrite = true;

    await expect(
      repo.createInvitation(
        tenantId,
        {
          email: 'newhire@example.com',
          role: 'STAFF',
          expiresInDays: 7,
        },
        actorUid
      )
    ).rejects.toThrow('SIMULATED_FIRESTORE_WRITE_FAILURE');

    const invitationDocs = Array.from(mockDb.store.keys()).filter((k) =>
      k.includes('/invitations/')
    );
    expect(invitationDocs.length).toBe(0);

    const tokenDocs = Array.from(mockDb.store.keys()).filter((k) =>
      k.includes('/invitation_tokens/')
    );
    expect(tokenDocs.length).toBe(0);
  });
});

