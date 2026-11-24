'use client';

import { useState } from 'react';
import type { AccountDoc, JournalEntryDoc, AccountBalanceDoc } from '@rashx/database';

interface LedgerViewerProps {
  accounts: AccountDoc[];
  journals: JournalEntryDoc[];
  balances: AccountBalanceDoc[];
}

export function LedgerViewer({ accounts, journals, balances }: LedgerViewerProps) {
  const postingAccounts = accounts.filter((a) => a.isPosting);
  const [selectedAccountId, setSelectedAccountId] = useState(
    postingAccounts[0]?.id || ''
  );

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedBalance = balances.find((b) => b.accountId === selectedAccountId);

  // Extract all lines affecting this account from POSTED journals
  const ledgerLines: Array<{
    date: string;
    entryNumber: string;
    description: string;
    debitHalalas: number;
    creditHalalas: number;
  }> = [];

  const postedJournals = journals
    .filter((j) => j.status === 'POSTED')
    .sort((a, b) => {
      const dateA = a.entryDate || a.transactionDate || '';
      const dateB = b.entryDate || b.transactionDate || '';
      return dateA.localeCompare(dateB);
    });

  for (const j of postedJournals) {
    for (const line of j.lines) {
      if (line.accountId === selectedAccountId) {
        ledgerLines.push({
          date: j.entryDate || j.transactionDate || '',
          entryNumber: j.entryNumber,
          description: line.description || j.descriptionAr || j.description || '',
          debitHalalas: line.debitHalalas || 0,
          creditHalalas: line.creditHalalas || 0,
        });
      }
    }
  }

  // Calculate running balances
  let runningHalalas = 0;
  const linesWithRunning = ledgerLines.map((line) => {
    if (selectedAccount?.normalBalance === 'DEBIT') {
      runningHalalas += line.debitHalalas - line.creditHalalas;
    } else {
      runningHalalas += line.creditHalalas - line.debitHalalas;
    }
    return {
      ...line,
      runningBalanceHalalas: runningHalalas,
    };
  });

  const formatSAR = (halalas: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(halalas / 100) + ' ر.س';
  };

  return (
    <div className="space-y-6">
      {/* Top Card: Account Selector & Account Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
              <span>📖</span> دفتر الأستاذ العام (General Ledger)
            </h2>
            <p className="text-xs text-[#54453D]/70 mt-1">
              حركات القيود اليومية المرحلة وتتبع الرصيد التراكمي لكل حساب فرعي.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#54453D] shrink-0">اختر الحساب:</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white font-medium"
            >
              {postingAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.code} - {acc.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedAccount && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#FAF9F8] p-4 rounded-2xl border border-[#54453D]/10 text-xs">
            <div>
              <span className="text-[#54453D]/60 block mb-0.5">رمز واسم الحساب:</span>
              <span className="font-bold text-[#54453D]">
                {selectedAccount.code} — {selectedAccount.nameAr}
              </span>
            </div>

            <div>
              <span className="text-[#54453D]/60 block mb-0.5">طبيعة الحساب:</span>
              <span className="font-semibold text-[#54453D]">
                {selectedAccount.normalBalance === 'DEBIT' ? 'مدين (Debit)' : 'دائن (Credit)'}
              </span>
            </div>

            <div>
              <span className="text-[#54453D]/60 block mb-0.5">إجمالي الحركات:</span>
              <span className="font-mono font-bold text-[#54453D]">
                {linesWithRunning.length} حركة مرحلة
              </span>
            </div>

            <div>
              <span className="text-[#54453D]/60 block mb-0.5">الرصيد الختامي الحالي:</span>
              <span className="font-mono font-black text-emerald-800 text-sm">
                {formatSAR(selectedBalance?.netBalanceHalalas || 0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-[#54453D]/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF9F8] text-[#54453D]/60 border-b border-[#54453D]/5">
              <tr>
                <th className="px-6 py-3 font-semibold">التاريخ</th>
                <th className="px-6 py-3 font-semibold">رقم القيد</th>
                <th className="px-6 py-3 font-semibold">البيان والشرح</th>
                <th className="px-6 py-3 font-semibold text-left">مدين (ر.س)</th>
                <th className="px-6 py-3 font-semibold text-left">دائن (ر.س)</th>
                <th className="px-6 py-3 font-semibold text-left">الرصيد التراكمي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#54453D]/5">
              {linesWithRunning.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#54453D]/60">
                    لا توجد حركات مرحلة مسجلة على هذا الحساب حتى الآن.
                  </td>
                </tr>
              ) : (
                linesWithRunning.map((line, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF9F8]/60 transition-colors">
                    <td className="px-6 py-3 font-mono text-[#54453D]">{line.date}</td>
                    <td className="px-6 py-3 font-mono font-bold text-[#54453D]">{line.entryNumber}</td>
                    <td className="px-6 py-3 text-[#54453D]">{line.description}</td>
                    <td className="px-6 py-3 text-left font-mono font-bold text-blue-800">
                      {line.debitHalalas ? formatSAR(line.debitHalalas) : '—'}
                    </td>
                    <td className="px-6 py-3 text-left font-mono font-bold text-emerald-800">
                      {line.creditHalalas ? formatSAR(line.creditHalalas) : '—'}
                    </td>
                    <td className="px-6 py-3 text-left font-mono font-black text-[#54453D]">
                      {formatSAR(line.runningBalanceHalalas)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
