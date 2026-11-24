import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import { AccountingRepository } from '../src/server/repositories/accounting.repository';
import { firestorePaths } from '../src/paths';

class MockAccountingFirestore {
  public store = new Map<string, Record<string, unknown>>();

  doc(path: string): DocumentReference {
    return {
      id: path.split('/').pop()!,
      path,
      get: async () => this.createSnapshot(path),
      set: async (data: Record<string, unknown>) => {
        this.store.set(path, JSON.parse(JSON.stringify(data)));
      },
    } as unknown as DocumentReference;
  }

  collection(path: string) {
    return {
      doc: (id?: string) => {
        const docId = id || `doc_${Math.random().toString(36).substring(2, 9)}`;
        return this.doc(`${path}/${docId}`);
      },
      orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => ({
        get: async () => {
          const docs: DocumentSnapshot[] = [];
          for (const [key, value] of this.store.entries()) {
            const segs = key.slice(path.length + 1).split('/');
            if (key.startsWith(path + '/') && segs.length === 1) {
              docs.push(this.createSnapshot(key));
            }
          }
          docs.sort((a, b) => {
            const vA = (a.data() as any)?.[field] || '';
            const vB = (b.data() as any)?.[field] || '';
            return direction === 'asc' ? String(vA).localeCompare(String(vB)) : String(vB).localeCompare(String(vA));
          });
          return { docs };
        },
      }),
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
        orderBy: () => ({
          get: async () => {
            const docs: DocumentSnapshot[] = [];
            for (const [key, value] of this.store.entries()) {
              if (key.startsWith(path + '/') && value[field] === val) {
                docs.push(this.createSnapshot(key));
              }
            }
            return { docs };
          },
        }),
        get: async () => {
          const docs: DocumentSnapshot[] = [];
          for (const [key, value] of this.store.entries()) {
            if (key.startsWith(path + '/') && value[field] === val) {
              docs.push(this.createSnapshot(key));
            }
          }
          return { docs };
        },
      }),
      get: async () => {
        const docs: DocumentSnapshot[] = [];
        for (const [key, value] of this.store.entries()) {
          const segs = key.slice(path.length + 1).split('/');
          if (key.startsWith(path + '/') && segs.length === 1) {
            docs.push(this.createSnapshot(key));
          }
        }
        return { docs };
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

  async runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    const stagedWrites = new Map<string, Record<string, unknown>>();
    const mockTransaction: Transaction = {
      get: async (target: any) => {
        if (target.docs !== undefined || typeof target.get === 'function') {
          return target.get();
        }
        return this.createSnapshot(target.path);
      },
      set: (ref: DocumentReference, data: Record<string, unknown>) => {
        stagedWrites.set(ref.path, JSON.parse(JSON.stringify(data)));
        return mockTransaction;
      },
      update: (ref: DocumentReference, data: Record<string, unknown>) => {
        const existing = this.store.get(ref.path) || {};
        stagedWrites.set(ref.path, { ...existing, ...JSON.parse(JSON.stringify(data)) });
        return mockTransaction;
      },
    } as unknown as Transaction;

    const result = await updateFunction(mockTransaction);
    for (const [p, d] of stagedWrites.entries()) {
      this.store.set(p, d);
    }
    return result;
  }
}

describe('AccountingRepository & Double-Entry Invariants Suite', () => {
  let mockDb: MockAccountingFirestore;
  let repo: AccountingRepository;
  const tenantId = 'tenant_acc_test';
  const actorUid = 'user_accountant_01';

  beforeEach(async () => {
    mockDb = new MockAccountingFirestore();
    repo = new AccountingRepository(mockDb as unknown as Firestore);

    // Seed open accounting period: 2026-01
    mockDb.store.set(firestorePaths.accountingPeriod(tenantId, '2026-01'), {
      id: '2026-01',
      tenantId,
      fiscalYearId: 'FY-2026',
      periodNumber: 1,
      nameAr: 'يناير 2026',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed closed accounting period: 2025-12
    mockDb.store.set(firestorePaths.accountingPeriod(tenantId, '2025-12'), {
      id: '2025-12',
      tenantId,
      fiscalYearId: 'FY-2025',
      periodNumber: 12,
      nameAr: 'ديسمبر 2025',
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      status: 'CLOSED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe('Chart of Accounts & Hierarchies', () => {
    it('creates accounts with unique codes and prevents duplicate code', async () => {
      const a1 = await repo.createAccount(tenantId, {
        code: '1010',
        nameAr: 'النقدية بالصندوق',
        nameEn: 'Cash in Hand',
        type: 'ASSET',
        normalBalance: 'DEBIT',
        isPosting: true,
        isSystem: false,
        accountLevel: 1,
        isActive: true,
      });

      expect(a1.code).toBe('1010');

      await expect(
        repo.createAccount(tenantId, {
          code: '1010',
          nameAr: 'نقدية مكررة',
          type: 'ASSET',
          normalBalance: 'DEBIT',
          isPosting: true,
          isSystem: false,
          accountLevel: 1,
          isActive: true,
        })
      ).rejects.toThrow('already exists');
    });

    it('rejects circular parent account hierarchy', async () => {
      const parent = await repo.createAccount(tenantId, {
        code: '1000',
        nameAr: 'الأصول المتداولة',
        type: 'ASSET',
        normalBalance: 'DEBIT',
        isPosting: false,
        isSystem: false,
        accountLevel: 1,
        isActive: true,
      });

      const child = await repo.createAccount(tenantId, {
        code: '1010',
        nameAr: 'النقدية',
        type: 'ASSET',
        normalBalance: 'DEBIT',
        isPosting: true,
        isSystem: false,
        parentAccountId: parent.id,
        accountLevel: 2,
        isActive: true,
      });

      // Trying to set parent's parent to child -> circular
      await expect(
        repo.updateAccount(tenantId, parent.id, { parentAccountId: child.id })
      ).rejects.toThrow('Circular account hierarchy detected');
    });
  });

  describe('Journal Engine & Double-Entry Invariants', () => {
    let cashAccountId: string;
    let revAccountId: string;
    let groupAccountId: string;

    beforeEach(async () => {
      const cash = await repo.createAccount(tenantId, {
        code: '1010',
        nameAr: 'النقدية',
        type: 'ASSET',
        normalBalance: 'DEBIT',
        isPosting: true,
        isSystem: true,
        accountLevel: 1,
        isActive: true,
      });
      cashAccountId = cash.id;

      const rev = await repo.createAccount(tenantId, {
        code: '4010',
        nameAr: 'إيرادات الخدمات',
        type: 'REVENUE',
        normalBalance: 'CREDIT',
        isPosting: true,
        isSystem: true,
        accountLevel: 1,
        isActive: true,
      });
      revAccountId = rev.id;

      const group = await repo.createAccount(tenantId, {
        code: '1000',
        nameAr: 'مجموعة الأصول',
        type: 'ASSET',
        normalBalance: 'DEBIT',
        isPosting: false,
        isSystem: false,
        accountLevel: 1,
        isActive: true,
      });
      groupAccountId = group.id;
    });

    it('rejects unbalancing journal entry (debits != credits)', async () => {
      await expect(
        repo.createDraftJournal(
          tenantId,
          {
            descriptionAr: 'قيد غير متزن',
            entryDate: '2026-01-15',
            periodId: '2026-01',
            lines: [
              {
                lineId: 'l1',
                accountId: cashAccountId,
                accountCode: '1010',
                accountNameAr: 'النقدية',
                description: 'مدين',
                debitHalalas: 50000, // 500 SAR
              },
              {
                lineId: 'l2',
                accountId: revAccountId,
                accountCode: '4010',
                accountNameAr: 'إيراد',
                description: 'دائن',
                creditHalalas: 40000, // 400 SAR (Unbalanced!)
              },
            ],
          },
          actorUid
        )
      ).rejects.toThrow();
    });

    it('rejects posting to a non-posting grouping parent account', async () => {
      const draft = await repo.createDraftJournal(
        tenantId,
        {
          descriptionAr: 'قيد على حساب تجميعي',
          entryDate: '2026-01-15',
          periodId: '2026-01',
          lines: [
            {
              lineId: 'l1',
              accountId: groupAccountId, // Grouping account!
              accountCode: '1000',
              accountNameAr: 'مجموعة',
              description: 'مدين',
              debitHalalas: 10000,
            },
            {
              lineId: 'l2',
              accountId: revAccountId,
              accountCode: '4010',
              accountNameAr: 'إيراد',
              description: 'دائن',
              creditHalalas: 10000,
            },
          ],
        },
        actorUid
      );

      await expect(
        repo.postJournalEntry(tenantId, draft.id, actorUid)
      ).rejects.toThrow('is a grouping account and cannot accept journal lines');
    });

    it('rejects posting to a CLOSED accounting period', async () => {
      const draft = await repo.createDraftJournal(
        tenantId,
        {
          descriptionAr: 'قيد في فترة مغلقة',
          entryDate: '2025-12-15',
          periodId: '2025-12', // CLOSED period
          lines: [
            {
              lineId: 'l1',
              accountId: cashAccountId,
              accountCode: '1010',
              accountNameAr: 'النقدية',
              description: 'مدين',
              debitHalalas: 20000,
            },
            {
              lineId: 'l2',
              accountId: revAccountId,
              accountCode: '4010',
              accountNameAr: 'إيراد',
              description: 'دائن',
              creditHalalas: 20000,
            },
          ],
        },
        actorUid
      );

      await expect(
        repo.postJournalEntry(tenantId, draft.id, actorUid)
      ).rejects.toThrow('is CLOSED. Postings are rejected');
    });

    it('posts balanced journal, updates account balances atomically, and verifies trial balance agrees', async () => {
      // 1. Create balanced draft journal: 150.00 SAR (15000 Halalas)
      const draft = await repo.createDraftJournal(
        tenantId,
        {
          descriptionAr: 'مبيعات خدمات نقدية',
          entryDate: '2026-01-15',
          periodId: '2026-01',
          lines: [
            {
              lineId: 'l1',
              accountId: cashAccountId,
              accountCode: '1010',
              accountNameAr: 'النقدية',
              description: 'قبض نقدي من العميل',
              debitHalalas: 15000,
            },
            {
              lineId: 'l2',
              accountId: revAccountId,
              accountCode: '4010',
              accountNameAr: 'إيراد',
              description: 'إيراد خدمة قص شعر',
              creditHalalas: 15000,
            },
          ],
        },
        actorUid
      );

      expect(draft.status).toBe('DRAFT');

      // 2. Post journal entry
      const posted = await repo.postJournalEntry(tenantId, draft.id, actorUid);
      expect(posted.status).toBe('POSTED');
      expect(posted.entryNumber).toMatch(/^JV-\d{4}-\d{5}$/);
      expect(posted.postedByUid).toBe(actorUid);

      // 3. Verify Account Balances read model
      const cashBal = await repo.getAccountBalance(tenantId, cashAccountId);
      const revBal = await repo.getAccountBalance(tenantId, revAccountId);

      // Cash is DEBIT normal: +15000 net
      expect(cashBal?.netBalanceHalalas).toBe(15000);
      expect(cashBal?.totalDebitHalalas).toBe(15000);

      // Revenue is CREDIT normal: +15000 net
      expect(revBal?.netBalanceHalalas).toBe(15000);
      expect(revBal?.totalCreditHalalas).toBe(15000);

      // 4. Verify Trial Balance agrees
      const tb = await repo.getTrialBalance(tenantId);
      expect(tb.isBalanced).toBe(true);
      expect(tb.totalDebitHalalas).toBe(15000);
      expect(tb.totalCreditHalalas).toBe(15000);
    });

    it('reverses a posted journal entry, creating inverse lines and preserving audit links', async () => {
      const draft = await repo.createDraftJournal(
        tenantId,
        {
          descriptionAr: 'قيد تجريبي للعكس',
          entryDate: '2026-01-20',
          periodId: '2026-01',
          lines: [
            {
              lineId: 'l1',
              accountId: cashAccountId,
              accountCode: '1010',
              accountNameAr: 'النقدية',
              description: 'مدين',
              debitHalalas: 30000,
            },
            {
              lineId: 'l2',
              accountId: revAccountId,
              accountCode: '4010',
              accountNameAr: 'إيراد',
              description: 'دائن',
              creditHalalas: 30000,
            },
          ],
        },
        actorUid
      );

      await repo.postJournalEntry(tenantId, draft.id, actorUid);

      // Reverse entry
      const { reversedEntry, reversalEntry } = await repo.reverseJournalEntry(
        tenantId,
        draft.id,
        actorUid,
        'خطأ في التسجيل'
      );

      expect(reversedEntry.status).toBe('REVERSED');
      expect(reversedEntry.reversedByEntryId).toBe(reversalEntry.id);
      expect(reversalEntry.reversalOfEntryId).toBe(draft.id);
      expect(reversalEntry.status).toBe('POSTED');

      // Verify net balances are now back to 0
      const cashBal = await repo.getAccountBalance(tenantId, cashAccountId);
      const revBal = await repo.getAccountBalance(tenantId, revAccountId);
      expect(cashBal?.netBalanceHalalas).toBe(0);
      expect(revBal?.netBalanceHalalas).toBe(0);

      // Trial balance remains balanced at 0 net
      const tb = await repo.getTrialBalance(tenantId);
      expect(tb.isBalanced).toBe(true);
    });
  });
});

