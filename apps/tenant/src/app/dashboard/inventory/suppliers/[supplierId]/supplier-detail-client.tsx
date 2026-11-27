'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  BranchDoc,
  PurchaseOrderDoc,
  SupplierDoc,
  SupplierInvoiceDoc,
  SupplierPaymentDoc,
} from '@/lib/firebase-server';
import { createSupplierInvoiceAction, recordSupplierPaymentAction } from '../../actions';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

export function SupplierDetailClient({
  supplier,
  branches,
  purchaseOrders,
  invoices,
  payments,
  canManageInvoices,
  canRecordPayments,
}: {
  supplier: SupplierDoc;
  branches: BranchDoc[];
  purchaseOrders: PurchaseOrderDoc[];
  invoices: SupplierInvoiceDoc[];
  payments: SupplierPaymentDoc[];
  canManageInvoices: boolean;
  canRecordPayments: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [invBranchId, setInvBranchId] = useState(branches[0]?.id || '');
  const [invNumber, setInvNumber] = useState('');
  const [invSubtotalSar, setInvSubtotalSar] = useState('');
  const [invVatSar, setInvVatSar] = useState('0');

  const [payInvoiceId, setPayInvoiceId] = useState<string | null>(null);
  const [payAmountSar, setPayAmountSar] = useState('');
  const [payMethod, setPayMethod] = useState<'BANK_TRANSFER' | 'CASH' | 'CARD' | 'OTHER'>('BANK_TRANSFER');

  const totalDue = invoices.reduce((s, i) => s + i.balanceDueHalalas, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await createSupplierInvoiceAction({
        branchId: invBranchId,
        supplierId: supplier.id,
        supplierInvoiceNumber: invNumber.trim(),
        subtotalHalalas: Math.round(Number(invSubtotalSar) * 100),
        vatHalalas: Math.round(Number(invVatSar) * 100),
      });
      if (!res.success) {
        setError(res.error || 'تعذر تسجيل فاتورة المورد.');
        return;
      }
      setInvNumber('');
      setInvSubtotalSar('');
      setMsg('تم تسجيل فاتورة المورد بنجاح.');
      router.refresh();
    });
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payInvoiceId) return;
    setError(null);
    setMsg(null);
    startTransition(async () => {
      const res = await recordSupplierPaymentAction({
        supplierInvoiceId: payInvoiceId,
        method: payMethod,
        amountHalalas: Math.round(Number(payAmountSar) * 100),
        idempotencyKey: `spay_${payInvoiceId}_${Date.now()}`,
      });
      if (!res.success) {
        setError(res.error || 'تعذر تسجيل الدفعة.');
        return;
      }
      setPayInvoiceId(null);
      setMsg('تم سداد فاتورة المورد وترحيل القيد المحاسبي.');
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/inventory/suppliers"
            className="text-xs font-bold text-[#54453D] hover:underline"
          >
            ← العودة للموردين
          </Link>
          <h1 className="text-2xl font-black text-[#2D221D] mt-1">{supplier.name}</h1>
          <p className="text-xs text-[#6B5B52]">
            الجوال: {supplier.displayPhone} • الرصيد المستحق للمورد:{' '}
            <span className="font-black text-amber-800">{formatSar(totalDue)} ر.س</span>
          </p>
        </div>
      </div>

      {supplier.privateNotes && (
        <div className="p-4 rounded-2xl bg-[#FAF6F3] border border-[#E6DDD6] text-xs">
          <span className="font-bold">ملاحظات خاصة:</span> {supplier.privateNotes}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
          {error}
        </div>
      )}
      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
          {msg}
        </div>
      )}

      {canManageInvoices && (
        <form
          onSubmit={handleCreateInvoice}
          className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-3"
        >
          <h2 className="text-sm font-black text-[#2D221D]">تسجيل فاتورة مورد جديدة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              value={invBranchId}
              onChange={(e) => setInvBranchId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="رقم فاتورة المورد"
              value={invNumber}
              onChange={(e) => setInvNumber(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
            />
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="الصافي (ر.س)"
              value={invSubtotalSar}
              onChange={(e) => setInvSubtotalSar(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="الضريبة (ر.س)"
              value={invVatSar}
              onChange={(e) => setInvVatSar(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold"
          >
            تسجيل الفاتورة
          </button>
        </form>
      )}

      {payInvoiceId && canRecordPayments && (
        <form
          onSubmit={handleRecordPayment}
          className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 space-y-3"
        >
          <h2 className="text-sm font-black text-emerald-900">سداد فاتورة مورد</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs"
            >
              <option value="BANK_TRANSFER">تحويل بنكي</option>
              <option value="CASH">نقدي</option>
              <option value="CARD">بطاقة</option>
            </select>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={payAmountSar}
              onChange={(e) => setPayAmountSar(e.target.value)}
              className="px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              تأكيد السداد
            </button>
            <button
              type="button"
              onClick={() => setPayInvoiceId(null)}
              className="px-4 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        <div className="p-4 border-b border-[#E6DDD6] font-black text-sm">فواتير المورد</div>
        {invoices.length === 0 ? (
          <div className="p-6 text-xs text-[#6B5B52]">لا توجد فواتير مسجلة.</div>
        ) : (
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
              <tr>
                <th className="py-3 px-4">الرقم</th>
                <th className="py-3 px-4">الإجمالي</th>
                <th className="py-3 px-4">المدفوع</th>
                <th className="py-3 px-4">المتبقي</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8E2]">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-3 px-4 font-mono font-bold">{inv.supplierInvoiceNumber}</td>
                  <td className="py-3 px-4">{formatSar(inv.totalHalalas)} ر.س</td>
                  <td className="py-3 px-4 text-emerald-700">{formatSar(inv.paidAmountHalalas)} ر.س</td>
                  <td className="py-3 px-4 text-amber-800 font-bold">
                    {formatSar(inv.balanceDueHalalas)} ر.س
                  </td>
                  <td className="py-3 px-4">{inv.status}</td>
                  <td className="py-3 px-4">
                    {canRecordPayments && inv.balanceDueHalalas > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPayInvoiceId(inv.id);
                          setPayAmountSar(formatSar(inv.balanceDueHalalas));
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-700 text-white font-bold"
                      >
                        سداد
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        <div className="p-4 border-b border-[#E6DDD6] font-black text-sm">
          أوامر الشراء ({purchaseOrders.length}) والمدفوعات ({payments.length})
        </div>
        <div className="p-4 text-xs space-y-2">
          {purchaseOrders.map((po) => (
            <div key={po.id} className="flex justify-between border-b border-[#F0E8E2] pb-2">
              <Link
                href={`/dashboard/inventory/purchase-orders/${po.id}`}
                className="font-mono font-bold text-[#54453D] underline"
              >
                {po.poNumber}
              </Link>
              <span>{formatSar(po.totalHalalas)} ر.س</span>
              <span>{po.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

