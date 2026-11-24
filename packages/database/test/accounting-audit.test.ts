import { describe, it, expect, beforeEach } from 'vitest';
import type { Firestore, DocumentReference, DocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import { AccountingRepository } from '../src/server/repositories/accounting.repository';
import { firestorePaths } from '../src/paths';

class MockAccountingAuditFirestore {
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
        orderBy: () => ({
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
      }),
      orderBy: () => ({
        get: async () => {
          const docs: DocumentSnapshot[] = [];
          for (const [key] of this.store.entries()) {
            const segs = key.slice(path.length + 1).split('/');
            if (key.startsWith(path + '/') && segs.length === 1) {
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

describe('Accounting Engine Audit & Immutability Suite', () => {
  let mockDb: MockAccountingAuditFirestore;
  let repo: AccountingRepository;
  const tenantId = 'tenant_accounting_audit';
  const actorUid = 'user_accountant_test';

  const cashAccId = 'acc_1010_cash';
  const revenueAccId = 'acc_4010_rev';
  const periodId = '2026-03';

  beforeEach(async () => {
    mockDb = new MockAccountingAuditFirestore();
    repo = new AccountingRepository(mockDb as unknown as Firestore);

    // Seed open accounting period
    mockDb.store.set(firestorePaths.accountingPeriod(tenantId, periodId), {
      id: periodId,
      tenantId,
      fiscalYearId: 'FY-2026',
      periodNumber: 3,
      nameAr: 'مارس 2026',
      nameEn: 'March 2026',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed cash account
    mockDb.store.set(firestorePaths.account(tenantId, cashAccId), {
      id: cashAccId,
      tenantId,
      code: '1010',
      nameAr: 'النقدية بالصندوق',
      type: 'ASSET',
      normalBalance: 'DEBIT',
      isPosting: true,
      accountLevel: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed revenue account
    mockDb.store.set(firestorePaths.account(tenantId, revenueAccId), {
      id: revenueAccId,
      tenantId,
      code: '4010',
      nameAr: 'إيرادات الخدمات',
      type: 'REVENUE',
      normalBalance: 'CREDIT',
      isPosting: true,
      accountLevel: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it('posts a balanced journal and writes an immutable JOURNAL_POSTED audit record', async () => {
    const draft = await repo.createDraftJournal(
      tenantId,
      {
        descriptionAr: 'قيد مبيعات نقدية لخدمات تجميل',
        entryDate: '2026-03-15',
        periodId,
        lines: [
          {
            lineId: 'l1',
            accountId: cashAccId,
            accountCode: '1010',
            accountNameAr: 'النقدية',
            debitHalalas: 50000, // 500.00 SAR
            creditHalalas: 0,
          },
          {
            lineId: 'l2',
            accountId: revenueAccId,
            accountCode: '4010',
            accountNameAr: 'الإيرادات',
            debitHalalas: 0,
            creditHalalas: 50000, // 500.00 SAR
          },
        ],
      },
      actorUid
    );

    const posted = await repo.postJournalEntry(tenantId, draft.id, actorUid);
    expect(posted.status).toBe('POSTED');
    expect(posted.entryNumber).toMatch(/^JV-\d{4}-\d{5}$/);

    // Verify accounting audit log was recorded
    const auditDocs = Array.from(mockDb.store.entries()).filter(([k]) =>
      k.startsWith(`tenants/${tenantId}/accounting_audit/`)
    );
    expect(auditDocs.length).toBe(1);
    const auditRecord = auditDocs[0]![1] as any;
    expect(auditRecord.action).toBe('JOURNAL_POSTED');
    expect(auditRecord.entityType).toBe('JOURNAL_ENTRY');
    expect(auditRecord.entityId).toBe(draft.id);
    expect(auditRecord.actorUid).toBe(actorUid);
    expect(auditRecord.details.totalDebitHalalas).toBe(50000);
  });

  it('reverses a posted entry, creates inverse lines, and writes JOURNAL_REVERSED audit', async () => {
    const draft = await repo.createDraftJournal(
      tenantId,
      {
        descriptionAr: 'قيد مبيعات أصلي للعكس',
        entryDate: '2026-03-15',
        periodId,
        lines: [
          {
            lineId: 'l1',
            accountId: cashAccId,
            accountCode: '1010',
            accountNameAr: 'النقدية',
            debitHalalas: 20000,
            creditHalalas: 0,
          },
          {
            lineId: 'l2',
            accountId: revenueAccId,
            accountCode: '4010',
            accountNameAr: 'الإيرادات',
            debitHalalas: 0,
            creditHalalas: 20000,
          },
        ],
      },
      actorUid
    );

    const posted = await repo.postJournalEntry(tenantId, draft.id, actorUid);

    // Perform reversal
    const { reversedEntry, reversalEntry } = await repo.reverseJournalEntry(
      tenantId,
      posted.id,
      actorUid,
      'إلغاء فاتورة بناء على طلب العميل'
    );

    expect(reversedEntry.status).toBe('REVERSED');
    expect(reversedEntry.reversedByEntryId).toBe(reversalEntry.id);

    // Verify reversal entry lines are inverted
    const cashLine = reversalEntry.lines.find((l) => l.accountId === cashAccId);
    expect(cashLine?.debitHalalas).toBe(0);
    expect(cashLine?.creditHalalas).toBe(20000); // Inverse of original debit

    const revLine = reversalEntry.lines.find((l) => l.accountId === revenueAccId);
    expect(revLine?.debitHalalas).toBe(20000); // Inverse of original credit
    expect(revLine?.creditHalalas).toBe(0);

    // Verify reversal audit record
    const auditDocs = Array.from(mockDb.store.entries()).filter(([k]) =>
      k.startsWith(`tenants/${tenantId}/accounting_audit/`)
    );
    const reversalAudit = auditDocs.find(([, doc]) => (doc as any).action === 'JOURNAL_REVERSED');
    expect(reversalAudit).toBeDefined();
    expect((reversalAudit![1] as any).reason).toBe('إلغاء فاتورة بناء على طلب العميل');
  });

  it('strictly rejects double-reversal of the same journal entry', async () => {
    const draft = await repo.createDraftJournal(
      tenantId,
      {
        descriptionAr: 'قيد للتكرار',
        entryDate: '2026-03-15',
        periodId,
        lines: [
          { lineId: '1', accountId: cashAccId, accountCode: '1010', accountNameAr: 'النقدية', debitHalalas: 1000, creditHalalas: 0 },
          { lineId: '2', accountId: revenueAccId, accountCode: '4010', accountNameAr: 'الإيرادات', debitHalalas: 0, creditHalalas: 1000 },
        ],
      },
      actorUid
    );
    const posted = await repo.postJournalEntry(tenantId, draft.id, actorUid);

    // First reversal succeeds
    await repo.reverseJournalEntry(tenantId, posted.id, actorUid, 'سبب أول');

    // Second reversal attempt must throw
    await expect(
      repo.reverseJournalEntry(tenantId, posted.id, actorUid, 'سبب ثاني')
    ).rejects.toThrow();
  });

  it('rejects reversing a reversal entry', async () => {
    const draft = await repo.createDraftJournal(
      tenantId,
      {
        descriptionAr: 'قيد أصلي',
        entryDate: '2026-03-15',
        periodId,
        lines: [
          { lineId: '1', accountId: cashAccId, accountCode: '1010', accountNameAr: 'النقدية', debitHalalas: 1000, creditHalalas: 0 },
          { lineId: '2', accountId: revenueAccId, accountCode: '4010', accountNameAr: 'الإيرادات', debitHalalas: 0, creditHalalas: 1000 },
        ],
      },
      actorUid
    );
    const posted = await repo.postJournalEntry(tenantId, draft.id, actorUid);
    const { reversalEntry } = await repo.reverseJournalEntry(tenantId, posted.id, actorUid, 'سبب');

    // Attempting to reverse the reversal itself
    await expect(
      repo.reverseJournalEntry(tenantId, reversalEntry.id, actorUid, 'عكس العكس')
    ).rejects.toThrow('Cannot reverse a reversal journal entry.');
  });

  it('audits period closure and period reopening with reason', async () => {
    // 1. Close period
    const closed = await repo.closeAccountingPeriod(tenantId, periodId, actorUid);
    expect(closed.status).toBe('CLOSED');
    expect(closed.closedByUid).toBe(actorUid);

    // 2. Postings must now be rejected in closed period
    const draft = await repo.createDraftJournal(
      tenantId,
      {
        descriptionAr: 'محاولة قيد في فترة مغلقة',
        entryDate: '2026-03-15',
        periodId,
        lines: [
          { lineId: '1', accountId: cashAccId, accountCode: '1010', accountNameAr: 'النقدية', debitHalalas: 1000, creditHalalas: 0 },
          { lineId: '2', accountId: revenueAccId, accountCode: '4010', accountNameAr: 'الإيرادات', debitHalalas: 0, creditHalalas: 1000 },
        ],
      },
      actorUid
    );
    await expect(repo.postJournalEntry(tenantId, draft.id, actorUid)).rejects.toThrow(
      /is CLOSED. Postings are rejected/
    );

    // 3. Reopening period without reason is rejected
    await expect(
      repo.reopenAccountingPeriod(tenantId, periodId, actorUid, '   ')
    ).rejects.toThrow('A valid reason is required');

    // 4. Reopening with valid reason succeeds and writes audit log
    const reopened = await repo.reopenAccountingPeriod(
      tenantId,
      periodId,
      actorUid,
      'مراجعة قيود التسوية الختامية'
    );
    expect(reopened.status).toBe('OPEN');

    const auditDocs = Array.from(mockDb.store.entries()).filter(([k]) =>
      k.startsWith(`tenants/${tenantId}/accounting_audit/`)
    );
    const reopenAudit = auditDocs.find(([, doc]) => (doc as any).action === 'PERIOD_REOPENED');
    expect(reopenAudit).toBeDefined();
    expect((reopenAudit![1] as any).reason).toBe('مراجعة قيود التسوية الختامية');
  });
});
