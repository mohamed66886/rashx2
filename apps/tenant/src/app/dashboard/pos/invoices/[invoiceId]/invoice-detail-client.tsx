'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type InvoiceDoc,
  type PaymentDoc,
  type RefundDoc,
  type PaymentMethodConfigDoc,
  type PaymentMethodCode,
} from '@/lib/firebase-server';
import {
  recordInvoicePaymentAction,
  recordRefundAction,
  voidInvoiceAction,
} from '../../actions';

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

function makeIdemKey(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

const STATUS_BADGES: Record<InvoiceDoc['status'], { label: string; cls: string }> = {
  DRAFT: { label: 'مسودة', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
  ISSUED: { label: 'صادرة (غير مدفوعة)', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  PARTIALLY_PAID: { label: 'مدفوعة جزئياً', cls: 'bg-blue-50 text-blue-800 border-blue-200' },
  PAID: { label: 'مدفوعة بالكامل', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  VOIDED: { label: 'ملغاة', cls: 'bg-red-50 text-red-700 border-red-200' },
  PARTIALLY_REFUNDED: { label: 'مستردة جزئياً', cls: 'bg-purple-50 text-purple-800 border-purple-200' },
  REFUNDED: { label: 'مستردة بالكامل', cls: 'bg-purple-50 text-purple-800 border-purple-200' },
};

const METHOD_LABELS: Record<PaymentMethodCode, string> = {
  CASH: 'نقدي',
  CARD: 'بطاقة / شبكة',
  BANK_TRANSFER: 'تحويل بنكي',
  OTHER: 'وسيلة أخرى',
};

export function InvoiceDetailClient({
  invoice,
  payments,
  refunds,
  paymentMethods,
  activeSessionId,
  canRecordPayment,
  canRefund,
  canVoid,
}: {
  invoice: InvoiceDoc;
  payments: PaymentDoc[];
  refunds: RefundDoc[];
  paymentMethods: PaymentMethodConfigDoc[];
  activeSessionId: string | null;
  canRecordPayment: boolean;
  canRefund: boolean;
  canVoid: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Payment form state
  const [showPayForm, setShowPayForm] = useState(false);
  const enabledMethods = paymentMethods.filter((m) => m.isEnabled);
  const [payMethod, setPayMethod] = useState<PaymentMethodCode>(
    enabledMethods[0]?.method || 'CASH'
  );
  const [payAmountSar, setPayAmountSar] = useState<string>(
    formatSar(invoice.balanceDueHalalas)
  );
  const [payRef, setPayRef] = useState('');

  // Refund form state
  const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null);
  const [refundAmountSar, setRefundAmountSar] = useState<string>('');
  const [refundReason, setRefundReason] = useState('');

  // Void form state
  const [showVoidForm, setShowVoidForm] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const statusInfo = STATUS_BADGES[invoice.status];
  const canAddPayment =
    canRecordPayment &&
    (invoice.status === 'ISSUED' || invoice.status === 'PARTIALLY_PAID') &&
    invoice.balanceDueHalalas > 0;
  const canVoidInvoice = canVoid && invoice.status === 'ISSUED' && invoice.paidAmountHalalas === 0;

  const handlePrint = () => {
    window.print();
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const amountHalalas = Math.round(Number(payAmountSar) * 100);
    if (!Number.isFinite(amountHalalas) || amountHalalas <= 0) {
      setError('أدخل مبلغ دفع صحيح أكبر من صفر.');
      return;
    }

    startTransition(async () => {
      const res = await recordInvoicePaymentAction({
        invoiceId: invoice.id,
        sessionId: payMethod === 'CASH' ? activeSessionId : activeSessionId,
        method: payMethod,
        amountHalalas,
        referenceNumber: payRef.trim() || null,
        idempotencyKey: makeIdemKey('pay'),
      });
      if (!res.success) {
        setError(res.error || 'تعذر تسجيل الدفعة.');
        return;
      }
      setShowPayForm(false);
      setPayRef('');
      setSuccessMsg('تم تسجيل الدفعة بنجاح.');
      router.refresh();
    });
  };

  const handleRecordRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundPaymentId) return;
    setError(null);
    setSuccessMsg(null);

    const amountHalalas = Math.round(Number(refundAmountSar) * 100);
    if (!Number.isFinite(amountHalalas) || amountHalalas <= 0) {
      setError('أدخل مبلغ استرداد صحيح أكبر من صفر.');
      return;
    }
    if (!refundReason.trim()) {
      setError('سبب الاسترداد مطلوب.');
      return;
    }

    startTransition(async () => {
      const res = await recordRefundAction({
        paymentId: refundPaymentId,
        sessionId: activeSessionId,
        amountHalalas,
        reason: refundReason.trim(),
        idempotencyKey: makeIdemKey('refund'),
      });
      if (!res.success) {
        setError(res.error || 'تعذر تنفيذ الاسترداد.');
        return;
      }
      setRefundPaymentId(null);
      setRefundReason('');
      setSuccessMsg('تم تسجيل الاسترداد وعكس القيد المحاسبي بنجاح.');
      router.refresh();
    });
  };

  const handleVoidInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!voidReason.trim()) {
      setError('سبب إلغاء الفاتورة مطلوب.');
      return;
    }

    startTransition(async () => {
      const res = await voidInvoiceAction({
        invoiceId: invoice.id,
        reason: voidReason.trim(),
      });
      if (!res.success) {
        setError(res.error || 'تعذر إلغاء الفاتورة.');
        return;
      }
      setShowVoidForm(false);
      setVoidReason('');
      setSuccessMsg('تم إلغاء الفاتورة وعكس القيد المحاسبي.');
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pos/invoices"
            className="px-3 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs font-bold text-[#54453D] hover:bg-[#FAF6F3]"
          >
            ← الفواتير
          </Link>
          <span
            className={`px-3 py-1 rounded-full border text-xs font-bold ${statusInfo.cls}`}
          >
            {statusInfo.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3F332C]"
          >
            طباعة الفاتورة
          </button>

          {canAddPayment && (
            <button
              type="button"
              onClick={() => {
                setPayAmountSar(formatSar(invoice.balanceDueHalalas));
                setShowPayForm((v) => !v);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
            >
              + تسجيل دفعة
            </button>
          )}

          {canVoidInvoice && (
            <button
              type="button"
              onClick={() => setShowVoidForm((v) => !v)}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
            >
              إلغاء الفاتورة
            </button>
          )}
        </div>
      </div>

      {/* Feedback banners */}
      {error && (
        <div className="print:hidden p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="print:hidden p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
          {successMsg}
        </div>
      )}

      {/* Record Payment Form */}
      {showPayForm && canAddPayment && (
        <form
          onSubmit={handleRecordPayment}
          className="print:hidden bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4"
        >
          <h2 className="text-sm font-black text-[#2D221D]">تسجيل دفعة جديدة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">وسيلة الدفع</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethodCode)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              >
                {enabledMethods.map((m) => (
                  <option key={m.method} value={m.method}>
                    {m.labelAr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">
                المبلغ (ر.س) — المتبقي {formatSar(invoice.balanceDueHalalas)}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={payAmountSar}
                onChange={(e) => setPayAmountSar(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">
                رقم المرجع (اختياري)
              </label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="رقم العملية / الإيصال"
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
          </div>
          {payMethod === 'CASH' && !activeSessionId && (
            <p className="text-xs text-amber-700 font-bold">
              تنبيه: الدفع النقدي يتطلب وجود جلسة صندوق مفتوحة لهذا الفرع.
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
            >
              {isPending ? 'جاري الحفظ...' : 'تأكيد تسجيل الدفعة'}
            </button>
            <button
              type="button"
              onClick={() => setShowPayForm(false)}
              className="px-4 py-2 rounded-xl border border-[#E6DDD6] text-xs font-bold text-[#54453D]"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Void Invoice Form */}
      {showVoidForm && canVoidInvoice && (
        <form
          onSubmit={handleVoidInvoice}
          className="print:hidden bg-red-50 rounded-2xl border border-red-200 p-5 space-y-3"
        >
          <h2 className="text-sm font-black text-red-900">تأكيد إلغاء الفاتورة</h2>
          <p className="text-xs text-red-800">
            سيتم إلغاء الفاتورة وعكس قيدها المحاسبي. لا يمكن التراجع عن هذا الإجراء.
          </p>
          <input
            type="text"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            placeholder="سبب الإلغاء..."
            required
            className="w-full px-3 py-2 rounded-xl border border-red-200 bg-white text-xs"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-bold disabled:opacity-50"
            >
              {isPending ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
            </button>
            <button
              type="button"
              onClick={() => setShowVoidForm(false)}
              className="px-4 py-2 rounded-xl border border-red-200 bg-white text-xs font-bold text-red-800"
            >
              تراجع
            </button>
          </div>
        </form>
      )}

      {/* Refund Form */}
      {refundPaymentId && canRefund && (
        <form
          onSubmit={handleRecordRefund}
          className="print:hidden bg-purple-50 rounded-2xl border border-purple-200 p-5 space-y-3"
        >
          <h2 className="text-sm font-black text-purple-900">تسجيل استرداد مالي</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-purple-900 mb-1">
                مبلغ الاسترداد (ر.س)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={refundAmountSar}
                onChange={(e) => setRefundAmountSar(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-900 mb-1">سبب الاسترداد</label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="سبب الاسترداد..."
                required
                className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold disabled:opacity-50"
            >
              {isPending ? 'جاري التنفيذ...' : 'تأكيد الاسترداد'}
            </button>
            <button
              type="button"
              onClick={() => setRefundPaymentId(null)}
              className="px-4 py-2 rounded-xl border border-purple-200 bg-white text-xs font-bold text-purple-900"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Printable Invoice Sheet */}
      <div
        dir="rtl"
        className="bg-white rounded-3xl border border-[#E6DDD6] p-6 sm:p-10 space-y-8 print:border-0 print:rounded-none print:p-0"
      >
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-[#E6DDD6] pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#2D221D]">
              {invoice.tenantSnapshot.legalNameAr}
            </h1>
            {invoice.tenantSnapshot.legalNameEn && (
              <p className="text-xs text-[#6B5B52]">{invoice.tenantSnapshot.legalNameEn}</p>
            )}
            <p className="text-xs text-[#54453D]">
              الفرع: {invoice.tenantSnapshot.branchName}
            </p>
            {invoice.tenantSnapshot.branchAddress && (
              <p className="text-xs text-[#6B5B52]">{invoice.tenantSnapshot.branchAddress}</p>
            )}
            {invoice.tenantSnapshot.vatNumber && (
              <p className="text-xs font-bold text-[#2D221D]">
                الرقم الضريبي: <span dir="ltr">{invoice.tenantSnapshot.vatNumber}</span>
              </p>
            )}
          </div>

          <div className="text-left space-y-1">
            <div className="inline-block px-3 py-1 rounded-xl bg-[#FAF6F3] border border-[#E6DDD6] text-xs font-black text-[#2D221D]">
              {invoice.invoiceType === 'STANDARD_TAX'
                ? 'فاتورة ضريبية'
                : invoice.invoiceType === 'SIMPLIFIED_TAX'
                  ? 'فاتورة ضريبية مبسطة'
                  : 'فاتورة / إيصال غير ضريبي'}
            </div>
            <p className="text-base font-black text-[#2D221D] font-mono mt-2">
              {invoice.invoiceNumber}
            </p>
            <p className="text-xs text-[#6B5B52]">
              التاريخ:{' '}
              <span dir="ltr">
                {new Date(invoice.issuedAt).toLocaleString('ar-SA', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </p>
            <p className="text-xs text-[#6B5B52]">
              الحالة: <span className="font-bold text-[#2D221D]">{statusInfo.label}</span>
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-[#FAF6F3] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-[#6B5B52]">بيانات العميل</p>
            <p className="text-sm font-black text-[#2D221D]">
              {invoice.customerSnapshot.fullName}
              {invoice.customerSnapshot.isGuest ? ' (عميل زائر)' : ''}
            </p>
          </div>
          {invoice.customerSnapshot.phone && (
            <div>
              <p className="text-[11px] text-[#6B5B52]">رقم الجوال</p>
              <p className="text-xs font-bold text-[#2D221D]" dir="ltr">
                {invoice.customerSnapshot.phone}
              </p>
            </div>
          )}
          {invoice.bookingId && (
            <div>
              <p className="text-[11px] text-[#6B5B52]">رقم الحجز المرتبط</p>
              <p className="text-xs font-mono font-bold text-[#54453D]">{invoice.bookingId}</p>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF6F3] text-[#54453D] border-y border-[#E6DDD6]">
              <tr>
                <th className="py-3 px-3 font-bold">البند / الخدمة</th>
                <th className="py-3 px-3 font-bold">الكمية</th>
                <th className="py-3 px-3 font-bold">سعر الوحدة</th>
                <th className="py-3 px-3 font-bold">الخصم</th>
                <th className="py-3 px-3 font-bold">الصافي</th>
                <th className="py-3 px-3 font-bold">الضريبة</th>
                <th className="py-3 px-3 font-bold">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E8E2]">
              {invoice.lineItems.map((item) => (
                <tr key={item.lineId}>
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#2D221D]">{item.nameAr}</div>
                    {item.nameEn && <div className="text-[11px] text-[#6B5B52]">{item.nameEn}</div>}
                  </td>
                  <td className="py-3 px-3">{item.quantity}</td>
                  <td className="py-3 px-3">{formatSar(item.unitPriceHalalas)} ر.س</td>
                  <td className="py-3 px-3 text-red-700">
                    {item.discountHalalas > 0 ? `${formatSar(item.discountHalalas)} ر.س` : '—'}
                  </td>
                  <td className="py-3 px-3">{formatSar(item.netHalalas)} ر.س</td>
                  <td className="py-3 px-3">
                    {formatSar(item.vatHalalas)} ر.س ({(item.taxRateBps / 100).toFixed(0)}%)
                  </td>
                  <td className="py-3 px-3 font-bold text-[#2D221D]">
                    {formatSar(item.totalHalalas)} ر.س
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 bg-[#FAF6F3] rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#6B5B52]">المجموع قبل الخصم:</span>
              <span className="font-bold">{formatSar(invoice.subtotalBeforeDiscountHalalas)} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5B52]">إجمالي الخصومات:</span>
              <span className="font-bold text-red-700">
                -{formatSar(invoice.totalDiscountHalalas)} ر.س
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5B52]">الصافي الخاضع للضريبة:</span>
              <span className="font-bold">{formatSar(invoice.netAmountHalalas)} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5B52]">ضريبة القيمة المضافة:</span>
              <span className="font-bold">{formatSar(invoice.vatAmountHalalas)} ر.س</span>
            </div>
            <div className="flex justify-between border-t border-[#E6DDD6] pt-2 text-sm font-black text-[#2D221D]">
              <span>الإجمالي النهائي:</span>
              <span>{formatSar(invoice.totalAmountHalalas)} ر.س</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>المدفوع:</span>
              <span>{formatSar(invoice.paidAmountHalalas)} ر.س</span>
            </div>
            <div className="flex justify-between text-amber-800 font-bold">
              <span>المتبقي:</span>
              <span>{formatSar(invoice.balanceDueHalalas)} ر.س</span>
            </div>
            {invoice.refundedAmountHalalas > 0 && (
              <div className="flex justify-between text-purple-700 font-bold">
                <span>المسترد:</span>
                <span>{formatSar(invoice.refundedAmountHalalas)} ر.س</span>
              </div>
            )}
          </div>
        </div>

        {/* Void Reason if voided */}
        {invoice.status === 'VOIDED' && invoice.voidReason && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800">
            <span className="font-bold">سبب الإلغاء:</span> {invoice.voidReason}
          </div>
        )}

        {/* Payments Section */}
        {payments.length > 0 && (
          <div className="space-y-2 border-t border-[#E6DDD6] pt-6">
            <h2 className="text-sm font-black text-[#2D221D]">المدفوعات المسجلة</h2>
            <div className="divide-y divide-[#F0E8E2] border border-[#E6DDD6] rounded-2xl overflow-hidden">
              {payments.map((p) => {
                const refundableHalalas = p.amountHalalas - p.refundedAmountHalalas;
                return (
                  <div
                    key={p.id}
                    className="p-3 flex flex-wrap items-center justify-between gap-3 text-xs bg-white"
                  >
                    <div>
                      <span className="font-bold text-[#2D221D]">
                        {METHOD_LABELS[p.method]}
                      </span>
                      <span className="mx-2 text-[#6B5B52]">•</span>
                      <span className="font-bold text-emerald-700">
                        {formatSar(p.amountHalalas)} ر.س
                      </span>
                      {p.referenceNumber && (
                        <span className="mr-2 text-[#6B5B52] font-mono">
                          (مرجع: {p.referenceNumber})
                        </span>
                      )}
                      {p.refundedAmountHalalas > 0 && (
                        <span className="mr-2 text-purple-700 font-bold">
                          (مسترد: {formatSar(p.refundedAmountHalalas)} ر.س)
                        </span>
                      )}
                      <div className="text-[11px] text-[#6B5B52] mt-0.5">
                        {p.cashierAttestation}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                      {canRefund &&
                        refundableHalalas > 0 &&
                        invoice.status !== 'VOIDED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setRefundPaymentId(p.id);
                              setRefundAmountSar(formatSar(refundableHalalas));
                            }}
                            className="px-3 py-1 rounded-lg border border-purple-200 bg-purple-50 text-purple-800 font-bold hover:bg-purple-100"
                          >
                            استرداد
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Refunds Section */}
        {refunds.length > 0 && (
          <div className="space-y-2 border-t border-[#E6DDD6] pt-6">
            <h2 className="text-sm font-black text-[#2D221D]">عمليات الاسترداد</h2>
            <div className="divide-y divide-[#F0E8E2] border border-purple-200 rounded-2xl overflow-hidden">
              {refunds.map((r) => (
                <div key={r.id} className="p-3 text-xs bg-purple-50/40 flex justify-between">
                  <div>
                    <span className="font-bold text-purple-900">
                      استرداد {formatSar(r.amountHalalas)} ر.س ({METHOD_LABELS[r.method]})
                    </span>
                    <div className="text-[11px] text-[#6B5B52]">السبب: {r.reason}</div>
                  </div>
                  <div className="text-[11px] text-[#6B5B52]" dir="ltr">
                    {new Date(r.recordedAt).toLocaleString('ar-SA', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
