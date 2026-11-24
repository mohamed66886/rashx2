import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { TenantBootstrapService } from '../src/server/tenant-bootstrap.service';
import { firestorePaths } from '../src/paths';
import { DEFAULT_SAUDI_ACCOUNTS } from '../src/default-chart-of-accounts';

class MockBootstrapFirestore {
  public store = new Map<string, Record<string, unknown>>();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
      set: async (data: Record<string, unknown>, options?: { merge?: boolean }) => {
        const checkUndefined = (obj: any, pathStr = '') => {
          if (!obj || typeof obj !== 'object') return;
          for (const [k, v] of Object.entries(obj)) {
            if (v === undefined) {
              throw new Error(
                `Value for argument "data" is not a valid Firestore document. Cannot use "undefined" as a Firestore value (found in field "${pathStr}${k}").`
              );
            }
            if (v && typeof v === 'object') {
              checkUndefined(v, `${pathStr}${k}.`);
            }
          }
        };
        checkUndefined(data);
        if (options?.merge && this.store.has(path)) {
          const existing = this.store.get(path) || {};
          this.store.set(path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        } else {
          this.store.set(path, JSON.parse(JSON.stringify(data)));
        }
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
        const docId = id || `doc_${Math.random().toString(36).substring(2, 9)}`;
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
      }),
      get: async () => {
        const docs: DocumentSnapshot[] = [];
        for (const [key, value] of this.store.entries()) {
          const segs = key.slice(path.length + 1).split('/');
          if (key.startsWith(path + '/') && segs.length === 1) {
            docs.push(this.createSnapshot(key));
          }
        }
        return { docs, empty: docs.length === 0 };
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

  batch() {
    const staged = new Map<string, Record<string, unknown>>();
    return {
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        staged.set(ref.path, JSON.parse(JSON.stringify(data)));
        return this;
      },
      commit: async () => {
        for (const [p, d] of staged.entries()) {
          this.store.set(p, d);
        }
      },
    };
  }
}

describe('TenantBootstrapService Suite', () => {
  let mockDb: MockBootstrapFirestore;
  let service: TenantBootstrapService;
  const tenantId = 'tenant_lamsa_bootstrap';
  const ownerUid = 'user_owner_bootstrap';

  beforeEach(() => {
    mockDb = new MockBootstrapFirestore();
    service = new TenantBootstrapService(mockDb as unknown as Firestore);
  });

  it('orchestrates complete foundational tenant bootstrap', async () => {
    await service.bootstrapTenant(tenantId, {
      name: 'صالون لمسة التجميل',
      ownerUid,
      crNumber: '1010999888',
      billingEmail: 'owner@lamsa.sa',
    });

    // 1. Verify Main Branch & Public Projection
    const mainBranchSnap = await mockDb.doc(firestorePaths.branch(tenantId, 'main-branch')).get();
    expect(mainBranchSnap.exists).toBe(true);
    expect(mainBranchSnap.data()?.isMain).toBe(true);
    expect(mainBranchSnap.data()?.name).toContain('الفرع الرئيسي');

    const publicBranchSnap = await mockDb.doc(firestorePaths.publicBranch(tenantId, 'main-branch')).get();
    expect(publicBranchSnap.exists).toBe(true);
    expect(publicBranchSnap.data()?.isMain).toBe(true);

    // 2. Verify Company Profile Settings
    const compSnap = await mockDb.doc(firestorePaths.companyProfile(tenantId)).get();
    expect(compSnap.exists).toBe(true);
    expect(compSnap.data()?.legalNameAr).toBe('صالون لمسة التجميل');
    expect(compSnap.data()?.crNumber).toBe('1010999888');

    // 3. Verify Tax Settings
    const taxSnap = await mockDb.doc(firestorePaths.taxSettings(tenantId)).get();
    expect(taxSnap.exists).toBe(true);
    expect(taxSnap.data()?.vatStatus).toBe('NOT_REGISTERED');
    expect(taxSnap.data()?.standardVatRateBps).toBe(1500);

    // 4. Verify General Settings
    const genSnap = await mockDb.doc(firestorePaths.generalSettings(tenantId)).get();
    expect(genSnap.exists).toBe(true);
    expect(genSnap.data()?.baseCurrency).toBe('SAR');
    expect(genSnap.data()?.timezone).toBe('Asia/Riyadh');

    // 5. Verify SEO Settings
    const seoSnap = await mockDb.doc(firestorePaths.seoSettings(tenantId)).get();
    expect(seoSnap.exists).toBe(true);
    expect(seoSnap.data()?.siteTitle).toBe('صالون لمسة التجميل');

    // 6. Verify Accounting Settings
    const accSnap = await mockDb.doc(firestorePaths.accountingSettings(tenantId)).get();
    expect(accSnap.exists).toBe(true);
    expect(accSnap.data()?.baseCurrency).toBe('SAR');

    // 7. Verify Fiscal Year & 12 Periods
    const year = new Date().getFullYear();
    const fySnap = await mockDb.doc(firestorePaths.fiscalYear(tenantId, `FY-${year}`)).get();
    expect(fySnap.exists).toBe(true);
    expect(fySnap.data()?.status).toBe('OPEN');

    for (let m = 1; m <= 12; m++) {
      const pSnap = await mockDb.doc(
        firestorePaths.accountingPeriod(tenantId, `${year}-${String(m).padStart(2, '0')}`)
      ).get();
      expect(pSnap.exists).toBe(true);
      expect(pSnap.data()?.status).toBe('OPEN');
    }

    // 8. Verify 22 Default Saudi Chart of Accounts
    for (const acc of DEFAULT_SAUDI_ACCOUNTS) {
      const aSnap = await mockDb.doc(firestorePaths.account(tenantId, `account-${acc.code}`)).get();
      expect(aSnap.exists).toBe(true);
      expect(aSnap.data()?.code).toBe(acc.code);

      if (acc.isPosting) {
        const bSnap = await mockDb.doc(
          firestorePaths.accountBalance(tenantId, `account-${acc.code}`)
        ).get();
        expect(bSnap.exists).toBe(true);
        expect(bSnap.data()?.netBalanceHalalas).toBe(0);
      }
    }
  });

  it('reconciles partially provisioned existing tenant idempotently', async () => {
    // Seed tenant record only
    mockDb.store.set(firestorePaths.tenant(tenantId), {
      id: tenantId,
      name: 'صالون الأناقة القديم',
      crNumber: '1010333444',
      primaryOwnerUid: ownerUid,
      status: 'ACTIVE',
    });

    const result = await service.reconcileTenant(tenantId);

    expect(result.mainBranchCreated).toBe(true);
    expect(result.companySettingsCreated).toBe(true);
    expect(result.taxSettingsCreated).toBe(true);
    expect(result.generalSettingsCreated).toBe(true);
    expect(result.seoSettingsCreated).toBe(true);
    expect(result.accountingSettingsCreated).toBe(true);
    expect(result.fiscalYearCreated).toBe(true);
    expect(result.periodsCreatedCount).toBe(12);
    expect(result.accountsCreatedCount).toBe(DEFAULT_SAUDI_ACCOUNTS.length);

    // Run reconciliation a second time: should NOT recreate anything
    const secondResult = await service.reconcileTenant(tenantId);
    expect(secondResult.mainBranchCreated).toBe(false);
    expect(secondResult.companySettingsCreated).toBe(false);
    expect(secondResult.periodsCreatedCount).toBe(0);
    expect(secondResult.accountsCreatedCount).toBe(0);
  });
});
