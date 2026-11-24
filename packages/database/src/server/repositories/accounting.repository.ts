import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Firestore, Transaction } from 'firebase-admin/firestore';
import { getFirebaseAdminFirestore } from '../index';
import { firestorePaths } from '../../paths';
import {
  AccountDocSchema,
  AccountingSettingsDocSchema,
  FiscalYearDocSchema,
  AccountingPeriodDocSchema,
  JournalEntryDocSchema,
  AccountBalanceDocSchema,
  CostCenterDocSchema,
  AccountingAuditRecordSchema,
  type AccountDoc,
  type AccountingSettingsDoc,
  type FiscalYearDoc,
  type AccountingPeriodDoc,
  type JournalEntryDoc,
  type AccountBalanceDoc,
  type CostCenterDoc,
  type TrialBalanceReport,
  type TrialBalanceItem,
  type JournalLine,
  type AccountingAuditRecord,
} from '../../accounting.schema';

export class AccountingRepository {
  private readonly db: Firestore;

  constructor(firestore?: Firestore) {
    this.db = firestore || getFirebaseAdminFirestore();
  }

  // ==========================================
  // Chart of Accounts
  // ==========================================

  async listAccounts(tenantId: string): Promise<AccountDoc[]> {
    const snap = await this.db
      .collection(firestorePaths.accounts(tenantId))
      .orderBy('code', 'asc')
      .get();

    return snap.docs.map((doc) => AccountDocSchema.parse(doc.data()));
  }

  async getAccountById(tenantId: string, accountId: string): Promise<AccountDoc | null> {
    const snap = await this.db.doc(firestorePaths.account(tenantId, accountId)).get();
    if (!snap.exists) {
      return null;
    }
    return AccountDocSchema.parse(snap.data());
  }

  async getAccountByCode(tenantId: string, code: string): Promise<AccountDoc | null> {
    const snap = await this.db
      .collection(firestorePaths.accounts(tenantId))
      .where('code', '==', code)
      .limit(1)
      .get();

    if (snap.empty || !snap.docs[0]) {
      return null;
    }
    return AccountDocSchema.parse(snap.docs[0].data());
  }

  async createAccount(tenantId: string, input: unknown): Promise<AccountDoc> {
    const parsed = AccountDocSchema.omit({
      id: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
    }).parse(input);
    const nowIso = new Date().toISOString();

    // Check code uniqueness
    const existingCode = await this.getAccountByCode(tenantId, parsed.code);
    if (existingCode) {
      throw new Error(`Account code '${parsed.code}' already exists for this tenant.`);
    }

    // Circular hierarchy & parent validation
    let accountLevel = 1;
    if (parsed.parentAccountId) {
      const parent = await this.getAccountById(tenantId, parsed.parentAccountId);
      if (!parent) {
        throw new Error(`Parent account '${parsed.parentAccountId}' not found.`);
      }
      if (parent.tenantId !== tenantId) {
        throw new Error('Cross-tenant parent account reference is prohibited.');
      }
      accountLevel = parent.accountLevel + 1;
    }

    const accountId = this.db.collection(firestorePaths.accounts(tenantId)).doc().id;
    const accountDoc: AccountDoc = AccountDocSchema.parse({
      ...parsed,
      id: accountId,
      tenantId,
      accountLevel,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    await this.db.runTransaction(async (transaction) => {
      // If parent is currently marked isPosting=true, demote to false
      if (parsed.parentAccountId) {
        const parentRef = this.db.doc(firestorePaths.account(tenantId, parsed.parentAccountId));
        const parentSnap = await transaction.get(parentRef);
        if (parentSnap.exists && parentSnap.data()?.isPosting) {
          transaction.update(parentRef, { isPosting: false, updatedAt: nowIso });
        }
      }

      transaction.set(this.db.doc(firestorePaths.account(tenantId, accountId)), accountDoc);
    });

    return accountDoc;
  }

  async updateAccount(
    tenantId: string,
    accountId: string,
    input: Partial<AccountDoc>
  ): Promise<AccountDoc> {
    const nowIso = new Date().toISOString();
    const accountRef = this.db.doc(firestorePaths.account(tenantId, accountId));

    return await this.db.runTransaction(async (transaction) => {
      const snap = await transaction.get(accountRef);
      if (!snap.exists) {
        throw new Error(`Account '${accountId}' not found.`);
      }

      const current = AccountDocSchema.parse(snap.data());

      if (current.isSystem && input.code && input.code !== current.code) {
        throw new Error('Cannot change the code of a system-defined account.');
      }

      // Check circular hierarchy if parent changed
      if (input.parentAccountId && input.parentAccountId !== current.parentAccountId) {
        if (input.parentAccountId === accountId) {
          throw new Error('An account cannot be its own parent.');
        }

        let currParentId: string | null = input.parentAccountId;
        while (currParentId) {
          const pSnap: any = await transaction.get(this.db.doc(firestorePaths.account(tenantId, currParentId)));
          if (!pSnap.exists) break;
          const pData = pSnap.data() as any;
          if (pData?.id === accountId) {
            throw new Error('Circular account hierarchy detected.');
          }
          currParentId = pData?.parentAccountId || null;
        }
      }

      const updated: AccountDoc = AccountDocSchema.parse({
        ...current,
        ...input,
        id: accountId,
        tenantId,
        updatedAt: nowIso,
      });

      transaction.set(accountRef, updated);
      return updated;
    });
  }

  // ==========================================
  // Accounting Settings
  // ==========================================

  async getAccountingSettings(tenantId: string): Promise<AccountingSettingsDoc | null> {
    const snap = await this.db.doc(firestorePaths.accountingSettings(tenantId)).get();
    if (!snap.exists) {
      return null;
    }
    return AccountingSettingsDocSchema.parse(snap.data());
  }

  async saveAccountingSettings(
    tenantId: string,
    input: Partial<AccountingSettingsDoc>
  ): Promise<AccountingSettingsDoc> {
    const existing = await this.getAccountingSettings(tenantId);
    const nowIso = new Date().toISOString();

    const data: AccountingSettingsDoc = AccountingSettingsDocSchema.parse({
      tenantId,
      baseCurrency: 'SAR',
      fiscalYearStartMonth: 1,
      accountingMethod: 'ACCRUAL',
      retainedEarningsAccountId: 'account-3030',
      vatPayableAccountId: 'account-2040',
      vatReceivableAccountId: 'account-1050',
      lockoutDate: null,
      ...existing,
      ...input,
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    });

    await this.db.doc(firestorePaths.accountingSettings(tenantId)).set(data);
    return data;
  }

  // ==========================================
  // Fiscal Years & Accounting Periods
  // ==========================================

  async listFiscalYears(tenantId: string): Promise<FiscalYearDoc[]> {
    const snap = await this.db
      .collection(firestorePaths.fiscalYears(tenantId))
      .orderBy('startDate', 'desc')
      .get();

    return snap.docs.map((doc) => FiscalYearDocSchema.parse(doc.data()));
  }

  async getFiscalYear(tenantId: string, fiscalYearId: string): Promise<FiscalYearDoc | null> {
    const snap = await this.db.doc(firestorePaths.fiscalYear(tenantId, fiscalYearId)).get();
    if (!snap.exists) {
      return null;
    }
    return FiscalYearDocSchema.parse(snap.data());
  }

  async listAccountingPeriods(tenantId: string, fiscalYearId?: string): Promise<AccountingPeriodDoc[]> {
    let query: any = this.db.collection(firestorePaths.accountingPeriods(tenantId));
    if (fiscalYearId) {
      query = query.where('fiscalYearId', '==', fiscalYearId);
    }
    const snap = await query.orderBy('periodNumber', 'asc').get();
    return snap.docs.map((doc: any) => AccountingPeriodDocSchema.parse(doc.data()));
  }

  async getAccountingPeriod(tenantId: string, periodId: string): Promise<AccountingPeriodDoc | null> {
    const snap = await this.db.doc(firestorePaths.accountingPeriod(tenantId, periodId)).get();
    if (!snap.exists) {
      return null;
    }
    return AccountingPeriodDocSchema.parse(snap.data());
  }

  async closeAccountingPeriod(
    tenantId: string,
    periodId: string,
    actorUid: string
  ): Promise<AccountingPeriodDoc> {
    const nowIso = new Date().toISOString();
    const periodRef = this.db.doc(firestorePaths.accountingPeriod(tenantId, periodId));

    return await this.db.runTransaction(async (transaction) => {
      const snap = await transaction.get(periodRef);
      if (!snap.exists) {
        throw new Error(`Accounting period '${periodId}' not found.`);
      }

      const period = AccountingPeriodDocSchema.parse(snap.data());
      if (period.status === 'CLOSED') {
        throw new Error('Accounting period is already closed.');
      }

      const updated: AccountingPeriodDoc = AccountingPeriodDocSchema.parse({
        ...period,
        status: 'CLOSED',
        closedAt: nowIso,
        closedByUid: actorUid,
        updatedAt: nowIso,
      });

      const auditId = this.db.collection(firestorePaths.accountingAuditTrail(tenantId)).doc().id;
      const auditRecord: AccountingAuditRecord = AccountingAuditRecordSchema.parse({
        id: auditId,
        tenantId,
        action: 'PERIOD_CLOSED',
        entityType: 'ACCOUNTING_PERIOD',
        entityId: periodId,
        actorUid,
        details: {
          periodNameAr: period.nameAr,
          periodNumber: period.periodNumber,
          fiscalYearId: period.fiscalYearId,
          startDate: period.startDate,
          endDate: period.endDate,
        },
        timestamp: nowIso,
      });

      transaction.set(periodRef, updated);
      transaction.set(this.db.doc(firestorePaths.accountingAuditRecord(tenantId, auditId)), auditRecord);
      return updated;
    });
  }

  async reopenAccountingPeriod(
    tenantId: string,
    periodId: string,
    actorUid: string,
    reason: string
  ): Promise<AccountingPeriodDoc> {
    const nowIso = new Date().toISOString();
    const periodRef = this.db.doc(firestorePaths.accountingPeriod(tenantId, periodId));

    if (!reason || reason.trim().length === 0) {
      throw new Error('A valid reason is required to reopen a closed accounting period.');
    }

    return await this.db.runTransaction(async (transaction) => {
      const snap = await transaction.get(periodRef);
      if (!snap.exists) {
        throw new Error(`Accounting period '${periodId}' not found.`);
      }

      const period = AccountingPeriodDocSchema.parse(snap.data());
      if (period.status === 'OPEN') {
        throw new Error('Accounting period is already open.');
      }

      const updated: AccountingPeriodDoc = AccountingPeriodDocSchema.parse({
        ...period,
        status: 'OPEN',
        closedAt: null,
        closedByUid: null,
        updatedAt: nowIso,
      });

      const auditId = this.db.collection(firestorePaths.accountingAuditTrail(tenantId)).doc().id;
      const auditRecord: AccountingAuditRecord = AccountingAuditRecordSchema.parse({
        id: auditId,
        tenantId,
        action: 'PERIOD_REOPENED',
        entityType: 'ACCOUNTING_PERIOD',
        entityId: periodId,
        actorUid,
        details: {
          periodNameAr: period.nameAr,
          periodNumber: period.periodNumber,
          fiscalYearId: period.fiscalYearId,
        },
        reason,
        timestamp: nowIso,
      });

      transaction.set(periodRef, updated);
      transaction.set(this.db.doc(firestorePaths.accountingAuditRecord(tenantId, auditId)), auditRecord);
      return updated;
    });
  }

  /**
   * Resolves the open accounting period covering a specific transaction date (YYYY-MM-DD).
   */
  async resolvePeriodForDate(tenantId: string, dateStr: string): Promise<AccountingPeriodDoc | null> {
    const periods = await this.listAccountingPeriods(tenantId);
    const match = periods.find((p) => dateStr >= p.startDate && dateStr <= p.endDate);
    return match || null;
  }

  // ==========================================
  // Sequence Generation
  // ==========================================

  async getNextJournalNumber(tenantId: string, transaction?: Transaction): Promise<string> {
    const seqRef = this.db.doc(firestorePaths.journalSequence(tenantId));
    const year = new Date().getFullYear();

    if (transaction) {
      const snap = await transaction.get(seqRef);
      let currentVal = 0;
      if (snap.exists) {
        currentVal = (snap.data() as any).currentValue || 0;
      }
      const nextVal = currentVal + 1;
      transaction.set(seqRef, { currentValue: nextVal, updatedAt: new Date().toISOString() });
      return `JV-${year}-${String(nextVal).padStart(5, '0')}`;
    }

    return await this.db.runTransaction(async (t) => {
      const snap = await t.get(seqRef);
      let currentVal = 0;
      if (snap.exists) {
        currentVal = (snap.data() as any).currentValue || 0;
      }
      const nextVal = currentVal + 1;
      t.set(seqRef, { currentValue: nextVal, updatedAt: new Date().toISOString() });
      return `JV-${year}-${String(nextVal).padStart(5, '0')}`;
    });
  }

  // ==========================================
  // Journal Engine & Double-Entry Invariants
  // ==========================================

  async listJournalEntries(
    tenantId: string,
    options?: { periodId?: string; status?: string; limit?: number }
  ): Promise<JournalEntryDoc[]> {
    let query: any = this.db.collection(firestorePaths.journalEntries(tenantId));

    if (options?.status) {
      query = query.where('status', '==', options.status);
    }
    if (options?.periodId) {
      query = query.where('periodId', '==', options.periodId);
    }

    query = query.orderBy('entryDate', 'desc');

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snap = await query.get();
    return snap.docs.map((doc: any) => JournalEntryDocSchema.parse(doc.data()));
  }

  async getJournalEntry(tenantId: string, entryId: string): Promise<JournalEntryDoc | null> {
    const snap = await this.db.doc(firestorePaths.journalEntry(tenantId, entryId)).get();
    if (!snap.exists) {
      return null;
    }
    return JournalEntryDocSchema.parse(snap.data());
  }

  async createDraftJournal(
    tenantId: string,
    input: {
      descriptionAr: string;
      descriptionEn?: string;
      entryDate: string;
      periodId?: string;
      lines: JournalLine[];
      sourceDocumentRef?: string;
      reversalOfEntryId?: string;
    },
    actorUid: string
  ): Promise<JournalEntryDoc> {
    const nowIso = new Date().toISOString();
    const entryId = this.db.collection(firestorePaths.journalEntries(tenantId)).doc().id;

    let periodId = input.periodId;
    if (!periodId) {
      const resolved = await this.resolvePeriodForDate(tenantId, input.entryDate);
      if (!resolved) {
        throw new Error(`No accounting period found for transaction date '${input.entryDate}'.`);
      }
      periodId = resolved.id;
    }

    // Calculate totals
    const totalDebitHalalas = input.lines.reduce((acc, l) => acc + (l.debitHalalas || 0), 0);
    const totalCreditHalalas = input.lines.reduce((acc, l) => acc + (l.creditHalalas || 0), 0);

    const draftEntry: JournalEntryDoc = JournalEntryDocSchema.parse({
      id: entryId,
      tenantId,
      entryNumber: `DRAFT-${entryId.slice(0, 8)}`,
      entryDate: input.entryDate,
      periodId,
      status: 'DRAFT',
      descriptionAr: input.descriptionAr,
      descriptionEn: input.descriptionEn,
      sourceDocumentRef: input.sourceDocumentRef,
      lines: input.lines,
      totalDebitHalalas,
      totalCreditHalalas,
      postedAt: null,
      postedByUid: null,
      reversalOfEntryId: input.reversalOfEntryId || null,
      reversingEntryId: input.reversalOfEntryId || null,
      reversedByEntryId: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    await this.db.doc(firestorePaths.journalEntry(tenantId, entryId)).set(draftEntry);
    return draftEntry;
  }

  /**
   * Transactional posting of a journal entry:
   * 1. Validates entry is DRAFT and balanced.
   * 2. Validates period is OPEN.
   * 3. Validates all accounts are in tenant, active, and isPosting=true.
   * 4. Updates Account Balance read models atomically.
   * 5. Sets status=POSTED, generates sequential JV number.
   */
  async postJournalEntry(
    tenantId: string,
    entryId: string,
    actorUid: string
  ): Promise<JournalEntryDoc> {
    const nowIso = new Date().toISOString();
    const entryRef = this.db.doc(firestorePaths.journalEntry(tenantId, entryId));

    return await this.db.runTransaction(async (transaction) => {
      // Step A: All reads FIRST
      const entrySnap = await transaction.get(entryRef);
      if (!entrySnap.exists) {
        throw new Error(`Journal entry '${entryId}' does not exist.`);
      }

      const entry = JournalEntryDocSchema.parse(entrySnap.data());
      if (entry.status !== 'DRAFT') {
        throw new Error(`Cannot post entry with status '${entry.status}'. Entry must be DRAFT.`);
      }

      if (entry.totalDebitHalalas !== entry.totalCreditHalalas || entry.totalDebitHalalas <= 0) {
        throw new Error('Unbalanced journal entry cannot be posted.');
      }

      // Check period status
      const periodId = entry.periodId || entry.accountingPeriodId || '';
      const periodRef = this.db.doc(firestorePaths.accountingPeriod(tenantId, periodId));
      const periodSnap = await transaction.get(periodRef);
      if (!periodSnap.exists) {
        throw new Error(`Accounting period '${periodId}' does not exist.`);
      }
      const period = AccountingPeriodDocSchema.parse(periodSnap.data());
      if (period.status !== 'OPEN') {
        throw new Error(`Accounting period '${period.nameAr}' is CLOSED. Postings are rejected.`);
      }

      // Read all referenced accounts
      const accountIds = Array.from(new Set(entry.lines.map((l) => l.accountId)));
      const accountSnaps = await Promise.all(
        accountIds.map((accId) => transaction.get(this.db.doc(firestorePaths.account(tenantId, accId))))
      );

      const accountsMap = new Map<string, AccountDoc>();
      for (const snap of accountSnaps) {
        if (!snap.exists) {
          throw new Error('One or more referenced accounts do not exist in this tenant.');
        }
        const acc = AccountDocSchema.parse(snap.data());
        if (!acc.isActive) {
          throw new Error(`Account '${acc.code} - ${acc.nameAr}' is inactive.`);
        }
        if (!acc.isPosting) {
          throw new Error(`Account '${acc.code} - ${acc.nameAr}' is a grouping account and cannot accept journal lines.`);
        }
        accountsMap.set(acc.id, acc);
      }

      // Read current account balances
      const balanceSnaps = await Promise.all(
        accountIds.map((accId) =>
          transaction.get(this.db.doc(firestorePaths.accountBalance(tenantId, accId)))
        )
      );

      const balancesMap = new Map<string, AccountBalanceDoc>();
      for (let i = 0; i < accountIds.length; i++) {
        const accId = accountIds[i]!;
        const bSnap = balanceSnaps[i]!;
        const acc = accountsMap.get(accId)!;

        if (bSnap.exists) {
          balancesMap.set(accId, AccountBalanceDocSchema.parse(bSnap.data()));
        } else {
          balancesMap.set(
            accId,
            AccountBalanceDocSchema.parse({
              id: accId,
              tenantId,
              accountId: accId,
              accountCode: acc.code,
              accountNameAr: acc.nameAr,
              accountType: acc.type,
              normalBalance: acc.normalBalance,
              totalDebitHalalas: 0,
              totalCreditHalalas: 0,
              netBalanceHalalas: 0,
              lastPostedAt: null,
              lastJournalEntryId: null,
              updatedAt: nowIso,
            })
          );
        }
      }

      // Read sequence number
      const seqRef = this.db.doc(firestorePaths.journalSequence(tenantId));
      const seqSnap = await transaction.get(seqRef);
      let currentSeq = 0;
      if (seqSnap.exists) {
        currentSeq = (seqSnap.data() as any).currentValue || 0;
      }
      const nextSeq = currentSeq + 1;
      const year = new Date().getFullYear();
      const entryNumber = `JV-${year}-${String(nextSeq).padStart(5, '0')}`;

      // Step B: Writes
      transaction.set(seqRef, { currentValue: nextSeq, updatedAt: nowIso });

      // Calculate new balances
      for (const line of entry.lines) {
        const bal = balancesMap.get(line.accountId)!;
        const debit = line.debitHalalas || 0;
        const credit = line.creditHalalas || 0;

        bal.totalDebitHalalas += debit;
        bal.totalCreditHalalas += credit;

        if (bal.normalBalance === 'DEBIT') {
          bal.netBalanceHalalas += debit - credit;
        } else {
          bal.netBalanceHalalas += credit - debit;
        }

        bal.lastPostedAt = nowIso;
        bal.lastJournalEntryId = entryId;
        bal.updatedAt = nowIso;
      }

      // Write updated balances
      for (const [accId, bal] of balancesMap.entries()) {
        transaction.set(
          this.db.doc(firestorePaths.accountBalance(tenantId, accId)),
          bal
        );
      }

      // Update journal entry to POSTED
      const postedEntry: JournalEntryDoc = JournalEntryDocSchema.parse({
        ...entry,
        entryNumber,
        status: 'POSTED',
        postedAt: nowIso,
        postedByUid: actorUid,
        updatedAt: nowIso,
      });

      transaction.set(entryRef, postedEntry);

      // Audit Record
      const auditId = this.db.collection(firestorePaths.accountingAuditTrail(tenantId)).doc().id;
      const auditRecord: AccountingAuditRecord = AccountingAuditRecordSchema.parse({
        id: auditId,
        tenantId,
        action: 'JOURNAL_POSTED',
        entityType: 'JOURNAL_ENTRY',
        entityId: entryId,
        actorUid,
        details: {
          entryNumber,
          totalDebitHalalas: entry.totalDebitHalalas,
          periodId,
          linesCount: entry.lines.length,
        },
        timestamp: nowIso,
      });
      transaction.set(this.db.doc(firestorePaths.accountingAuditRecord(tenantId, auditId)), auditRecord);

      return postedEntry;
    });
  }

  /**
   * Reverses a posted journal entry:
   * 1. Verifies original entry is POSTED and not already reversed.
   * 2. Creates and posts an inverse journal entry.
   * 3. Sets original entry status to REVERSED.
   * 4. Logs immutable accounting audit trail record.
   */
  async reverseJournalEntry(
    tenantId: string,
    entryId: string,
    actorUid: string,
    reason: string
  ): Promise<{ reversedEntry: JournalEntryDoc; reversalEntry: JournalEntryDoc }> {
    const original = await this.getJournalEntry(tenantId, entryId);
    if (!original) {
      throw new Error(`Journal entry '${entryId}' not found.`);
    }

    if (original.status !== 'POSTED') {
      throw new Error('Only POSTED journal entries can be reversed.');
    }

    if (original.reversedByEntryId) {
      throw new Error(`Journal entry is already reversed by '${original.reversedByEntryId}'.`);
    }

    if (original.reversalOfEntryId) {
      throw new Error('Cannot reverse a reversal journal entry.');
    }

    // Invert lines: debits become credits, credits become debits
    const invertedLines: JournalLine[] = original.lines.map((line, idx) => ({
      lineId: `rev-${idx + 1}`,
      accountId: line.accountId,
      accountCode: line.accountCode,
      accountNameAr: line.accountNameAr,
      description: `عكس قيد ${original.entryNumber}: ${reason}`,
      debitHalalas: line.creditHalalas,
      creditHalalas: line.debitHalalas,
      costCenterId: line.costCenterId,
    }));

    // Create draft reversal entry
    const draftReversal = await this.createDraftJournal(
      tenantId,
      {
        descriptionAr: `عكس قيد رقم ${original.entryNumber} - ${reason}`,
        descriptionEn: `Reversal of ${original.entryNumber} - ${reason}`,
        entryDate: original.entryDate || original.transactionDate || new Date().toISOString().split('T')[0]!,
        periodId: original.periodId || original.accountingPeriodId || '',
        lines: invertedLines,
        sourceDocumentRef: original.entryNumber,
        reversalOfEntryId: original.id,
      },
      actorUid
    );

    // Post reversal entry
    const postedReversal = await this.postJournalEntry(tenantId, draftReversal.id, actorUid);

    // Link original entry with reversal and log reversal audit
    const nowIso = new Date().toISOString();
    const updatedOriginal: JournalEntryDoc = JournalEntryDocSchema.parse({
      ...original,
      status: 'REVERSED',
      reversedByEntryId: postedReversal.id,
      updatedAt: nowIso,
    });

    const auditId = this.db.collection(firestorePaths.accountingAuditTrail(tenantId)).doc().id;
    const auditRecord: AccountingAuditRecord = AccountingAuditRecordSchema.parse({
      id: auditId,
      tenantId,
      action: 'JOURNAL_REVERSED',
      entityType: 'JOURNAL_ENTRY',
      entityId: original.id,
      actorUid,
      details: {
        originalEntryNumber: original.entryNumber,
        reversalEntryId: postedReversal.id,
        reversalEntryNumber: postedReversal.entryNumber,
      },
      reason,
      timestamp: nowIso,
    });

    await this.db.runTransaction(async (transaction) => {
      transaction.set(this.db.doc(firestorePaths.journalEntry(tenantId, original.id)), updatedOriginal);
      transaction.set(this.db.doc(firestorePaths.accountingAuditRecord(tenantId, auditId)), auditRecord);
    });

    return {
      reversedEntry: updatedOriginal,
      reversalEntry: postedReversal,
    };
  }

  // ==========================================
  // Balances & Trial Balance
  // ==========================================

  async getAccountBalance(tenantId: string, accountId: string): Promise<AccountBalanceDoc | null> {
    const snap = await this.db.doc(firestorePaths.accountBalance(tenantId, accountId)).get();
    if (!snap.exists) {
      return null;
    }
    return AccountBalanceDocSchema.parse(snap.data());
  }

  async listAccountBalances(tenantId: string): Promise<AccountBalanceDoc[]> {
    const snap = await this.db
      .collection(firestorePaths.accountBalances(tenantId))
      .orderBy('accountCode', 'asc')
      .get();

    return snap.docs.map((doc) => AccountBalanceDocSchema.parse(doc.data()));
  }

  async getTrialBalance(tenantId: string): Promise<TrialBalanceReport> {
    const [accounts, balances] = await Promise.all([
      this.listAccounts(tenantId),
      this.listAccountBalances(tenantId),
    ]);

    const balanceMap = new Map(balances.map((b) => [b.accountId, b]));

    let totalDebitHalalas = 0;
    let totalCreditHalalas = 0;

    const items: TrialBalanceItem[] = accounts
      .filter((acc) => acc.isPosting)
      .map((acc) => {
        const bal = balanceMap.get(acc.id);
        const totalDebit = bal?.totalDebitHalalas || 0;
        const totalCredit = bal?.totalCreditHalalas || 0;
        const net = bal?.netBalanceHalalas || 0;

        let debitBalanceHalalas = 0;
        let creditBalanceHalalas = 0;

        if (acc.normalBalance === 'DEBIT') {
          if (net >= 0) {
            debitBalanceHalalas = net;
          } else {
            creditBalanceHalalas = Math.abs(net);
          }
        } else {
          if (net >= 0) {
            creditBalanceHalalas = net;
          } else {
            debitBalanceHalalas = Math.abs(net);
          }
        }

        totalDebitHalalas += debitBalanceHalalas;
        totalCreditHalalas += creditBalanceHalalas;

        return {
          accountId: acc.id,
          accountCode: acc.code,
          accountNameAr: acc.nameAr,
          accountType: acc.type,
          debitBalanceHalalas,
          creditBalanceHalalas,
        };
      });

    return {
      tenantId,
      asOfDate: new Date().toISOString(),
      items,
      totalDebitHalalas,
      totalCreditHalalas,
      isBalanced: totalDebitHalalas === totalCreditHalalas,
    };
  }

  // ==========================================
  // Cost Centers
  // ==========================================

  async listCostCenters(tenantId: string): Promise<CostCenterDoc[]> {
    const snap = await this.db
      .collection(firestorePaths.costCenters(tenantId))
      .orderBy('code', 'asc')
      .get();

    return snap.docs.map((doc) => CostCenterDocSchema.parse(doc.data()));
  }

  async createCostCenter(tenantId: string, input: unknown): Promise<CostCenterDoc> {
    const parsed = CostCenterDocSchema.omit({
      id: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
    }).parse(input);
    const costCenterId = this.db.collection(firestorePaths.costCenters(tenantId)).doc().id;
    const nowIso = new Date().toISOString();

    const data: CostCenterDoc = CostCenterDocSchema.parse({
      ...parsed,
      id: costCenterId,
      tenantId,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    await this.db.doc(firestorePaths.costCenter(tenantId, costCenterId)).set(data);
    return data;
  }
}
