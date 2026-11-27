'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type BranchDoc,
  type ServiceDoc,
  type CustomerDoc,
  type BookingDoc,
  type PosSessionDoc,
  type PaymentMethodConfigDoc,
  type PaymentMethodCode,
  type DiscountType,
} from '@/lib/firebase-server';
import {
  searchPosCustomersAction,
  quickCreatePosCustomerAction,
  createAndFinalizeSaleAction,
  openPosSessionAction,
} from './actions';

function makeIdemKey(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function formatSar(halalas: number): string {
  return (halalas / 100).toFixed(2);
}

interface CartItem {
  service: ServiceDoc;
  quantity: number;
  discountType: DiscountType;
  /** SAR if FIXED, percentage (0..100) if PERCENT */
  discountInput: string;
  discountReason: string;
}

interface PaymentRow {
  id: string;
  method: PaymentMethodCode;
  amountSar: string;
  referenceNumber: string;
}

export function PosClient({
  branches,
  services,
  activeSessions,
  paymentMethods,
  eligibleBookings,
  initialBookingId,
  initialBranchId,
  canApplyDiscount,
  canOverrideDiscount,
  canOpenSession,
}: {
  branches: BranchDoc[];
  services: ServiceDoc[];
  activeSessions: PosSessionDoc[];
  paymentMethods: PaymentMethodConfigDoc[];
  eligibleBookings: BookingDoc[];
  initialBookingId?: string;
  initialBranchId?: string;
  canApplyDiscount: boolean;
  canOverrideDiscount: boolean;
  canOpenSession: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialBooking = initialBookingId
    ? eligibleBookings.find((b) => b.id === initialBookingId) || null
    : null;

  const [branchId, setBranchId] = useState(
    initialBooking?.branchId || initialBranchId || branches[0]?.id || ''
  );
  const [saleMode, setSaleMode] = useState<'WALK_IN' | 'BOOKING'>(
    initialBooking ? 'BOOKING' : 'WALK_IN'
  );
  const [selectedBookingId, setSelectedBookingId] = useState(initialBooking?.id || '');

  // Customer state
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<CustomerDoc[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDoc | null>(
    initialBooking
      ? ({
          id: initialBooking.customerId,
          fullName: initialBooking.customerName,
          displayPhone: initialBooking.customerPhone,
          normalizedPhone: initialBooking.customerPhone,
          isGuest: !initialBooking.customerPhone,
        } as CustomerDoc)
      : null
  );
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickGuest, setQuickGuest] = useState(false);

  // Cart state
  const initialService = initialBooking
    ? services.find((s) => s.id === initialBooking.serviceId)
    : undefined;
  const [cart, setCart] = useState<CartItem[]>(
    initialService
      ? [
          {
            service: initialService,
            quantity: 1,
            discountType: 'NONE',
            discountInput: '',
            discountReason: '',
          },
        ]
      : []
  );

  // Payment allocations
  const enabledMethods = paymentMethods.filter((m) => m.isEnabled);
  const defaultMethod: PaymentMethodCode = enabledMethods[0]?.method || 'CASH';
  const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([
    { id: 'p1', method: defaultMethod, amountSar: '', referenceNumber: '' },
  ]);

  // Quick open session
  const [openingCashSar, setOpeningCashSar] = useState('0');
  const [notes, setNotes] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => makeIdemKey('sale'));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedInvoiceId, setCompletedInvoiceId] = useState<string | null>(null);
  const [completedInvoiceNumber, setCompletedInvoiceNumber] = useState<string | null>(null);

  const activeSession = activeSessions.find((s) => s.branchId === branchId) || null;
  const branchServices = services.filter((s) => s.assignedBranchIds.includes(branchId));
  const branchBookings = eligibleBookings.filter((b) => b.branchId === branchId);

  function handleSelectBooking(bookingId: string) {
    setSelectedBookingId(bookingId);
    const bk = branchBookings.find((b) => b.id === bookingId);
    if (!bk) return;
    setSelectedCustomer({
      id: bk.customerId,
      fullName: bk.customerName,
      displayPhone: bk.customerPhone,
      normalizedPhone: bk.customerPhone,
      isGuest: !bk.customerPhone,
    } as CustomerDoc);
    const srv = services.find((s) => s.id === bk.serviceId);
    if (srv) {
      setCart([
        {
          service: srv,
          quantity: 1,
          discountType: 'NONE',
          discountInput: '',
          discountReason: '',
        },
      ]);
    }
  }

  function handleSearchCustomers() {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await searchPosCustomersAction(customerSearch);
      if (!res.success) {
        setErrorMsg(res.error || 'تعذر البحث عن العملاء.');
        return;
      }
      setCustomerResults(res.customers || []);
    });
  }

  function handleQuickCreateCustomer() {
    if (!quickName.trim()) {
      setErrorMsg('يرجى إدخال اسم العميل.');
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const res = await quickCreatePosCustomerAction({
        fullName: quickName.trim(),
        phone: quickGuest ? undefined : quickPhone.trim() || undefined,
        isGuest: quickGuest,
        idempotencyKey: makeIdemKey('pos_cust'),
      });
      if (!res.success || !res.customer) {
        setErrorMsg(res.error || 'تعذر إنشاء العميل.');
        return;
      }
      setSelectedCustomer(res.customer);
      setQuickName('');
      setQuickPhone('');
    });
  }

  function handleAddService(service: ServiceDoc) {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.service.id === service.id);
      if (idx >= 0) {
        return prev.map((c, i) => (i === idx ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [
        ...prev,
        {
          service,
          quantity: 1,
          discountType: 'NONE',
          discountInput: '',
          discountReason: '',
        },
      ];
    });
  }

  function handleOpenSession() {
    const halalas = Math.round((Number(openingCashSar) || 0) * 100);
    setErrorMsg(null);
    startTransition(async () => {
      const res = await openPosSessionAction({
        branchId,
        openingCashHalalas: halalas,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'تعذر فتح جلسة الصندوق.');
        return;
      }
      router.refresh();
    });
  }

  // Approximate client preview (server remains sole authority)
  const previewTotalHalalas = cart.reduce((sum, item) => {
    const gross = item.service.totalPriceHalalas * item.quantity;
    let disc = 0;
    const val = Number(item.discountInput) || 0;
    if (item.discountType === 'FIXED') {
      disc = Math.min(Math.round(val * 100), gross);
    } else if (item.discountType === 'PERCENT') {
      disc = Math.round((gross * Math.min(val, 100)) / 100);
    }
    return sum + Math.max(0, gross - disc);
  }, 0);

  function handleCompleteSale() {
    if (!branchId) {
      setErrorMsg('يرجى تحديد الفرع.');
      return;
    }
    if (!selectedCustomer) {
      setErrorMsg('يرجى اختيار العميل أو إنشاؤه قبل إتمام البيع.');
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('يرجى إضافة خدمة واحدة على الأقل.');
      return;
    }

    const items = cart.map((c) => {
      const valNum = Number(c.discountInput) || 0;
      const discount =
        c.discountType === 'NONE' || valNum <= 0
          ? undefined
          : {
              type: c.discountType,
              value:
                c.discountType === 'FIXED'
                  ? Math.round(valNum * 100)
                  : Math.round(valNum * 100), // percent * 100 = basis points
              reason: c.discountReason || 'خصم نقطة بيع',
            };
      return {
        serviceId: c.service.id,
        quantity: c.quantity,
        discount,
      };
    });

    const payments = paymentRows
      .filter((r) => (Number(r.amountSar) || 0) > 0)
      .map((r) => ({
        method: r.method,
        amountHalalas: Math.round((Number(r.amountSar) || 0) * 100),
        referenceNumber: r.referenceNumber.trim() || null,
      }));

    setErrorMsg(null);
    startTransition(async () => {
      const res = await createAndFinalizeSaleAction({
        branchId,
        sessionId: activeSession?.id || null,
        customerId: selectedCustomer.id,
        bookingId: saleMode === 'BOOKING' && selectedBookingId ? selectedBookingId : null,
        items,
        payments,
        notes,
        idempotencyKey,
      });

      if (!res.success || !res.invoice) {
        setErrorMsg(res.error || 'تعذر إتمام عملية البيع.');
        return;
      }

      setCompletedInvoiceId(res.invoice.id);
      setCompletedInvoiceNumber(res.invoice.invoiceNumber);
      setIdempotencyKey(makeIdemKey('sale'));
      setCart([]);
      setPaymentRows([{ id: 'p1', method: defaultMethod, amountSar: '', referenceNumber: '' }]);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header & Branch/Session Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#E6DDD6] shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#54453D]">شاشة نقطة البيع (POS)</h1>
          <p className="text-xs text-[#6B5B52] mt-0.5">
            إصدار الفواتير، تحصيل المدفوعات المقسمة، والترحيل المحاسبي الآلي
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <select
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value);
              setCart([]);
              setSelectedBookingId('');
            }}
            className="px-3 py-2 rounded-xl border border-[#9A8C83] bg-white font-bold text-[#54453D]"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {activeSession ? (
            <Link
              href="/dashboard/pos/sessions"
              className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold"
            >
              الوردية مفتوحة • الرصيد المتوقع: {formatSar(activeSession.expectedCashHalalas)} ر.س
            </Link>
          ) : canOpenSession ? (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              <span className="text-amber-900 font-bold">لا توجد وردية مفتوحة:</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={openingCashSar}
                onChange={(e) => setOpeningCashSar(e.target.value)}
                placeholder="الافتتاحي"
                className="w-20 px-2 py-1 rounded-lg border border-amber-300 bg-white font-mono text-xs"
              />
              <button
                type="button"
                disabled={isPending || !branchId}
                onClick={handleOpenSession}
                className="px-3 py-1 rounded-lg bg-[#54453D] text-white font-bold hover:bg-[#3f332d]"
              >
                فتح صندوق
              </button>
            </div>
          ) : (
            <span className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold">
              بدون جلسة صندوق مفتوحة (الدفع النقدي يتطلب فتح صندوق)
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-800">
          {errorMsg}
        </div>
      )}

      {completedInvoiceId && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs font-bold text-emerald-900">
            تم إصدار الفاتورة رقم <span className="font-mono">{completedInvoiceNumber}</span> وترحيلها بنجاح.
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/pos/invoices/${completedInvoiceId}`}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
            >
              عرض وطباعة الفاتورة
            </Link>
          </div>
        </div>
      )}

      {/* Main 3-Column POS Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left/Center: Sale Source, Customer & Catalog */}
        <div className="xl:col-span-2 space-y-6">
          {/* Mode Switch: Walk-in vs Booking */}
          <div className="bg-white p-5 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSaleMode('WALK_IN');
                  setSelectedBookingId('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  saleMode === 'WALK_IN'
                    ? 'bg-[#54453D] text-white'
                    : 'bg-[#FAF6F3] text-[#54453D]'
                }`}
              >
                بيع مباشر (Walk-in)
              </button>
              <button
                type="button"
                onClick={() => setSaleMode('BOOKING')}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  saleMode === 'BOOKING'
                    ? 'bg-[#54453D] text-white'
                    : 'bg-[#FAF6F3] text-[#54453D]'
                }`}
              >
                تحويل حجز إلى فاتورة ({branchBookings.length})
              </button>
            </div>

            {saleMode === 'BOOKING' && (
              <div className="space-y-2 text-xs">
                <label className="block font-bold text-[#54453D]">اختر الحجز المؤهل للفوترة:</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => handleSelectBooking(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] bg-white"
                >
                  <option value="">-- اختر حجزاً --</option>
                  {branchBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber} — {b.customerName} — {b.serviceNameSnapshot.ar} ({formatSar(b.priceSnapshot.totalPriceHalalas)} ر.س)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Customer Selector */}
          <div className="bg-white p-5 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#54453D]">1. العميل</h2>

            {selectedCustomer ? (
              <div className="p-3 rounded-2xl bg-[#FAF6F3] border border-[#E6DDD6] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#54453D]">{selectedCustomer.fullName}</span>
                  {selectedCustomer.displayPhone && (
                    <span className="font-mono text-[#6B5B52] mr-2" dir="ltr">
                      {selectedCustomer.displayPhone}
                    </span>
                  )}
                  {selectedCustomer.isGuest && (
                    <span className="mr-2 px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px]">
                      زائر
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="text-red-700 font-bold hover:underline"
                >
                  تغيير
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو رقم الجوال..."
                    className="flex-1 px-3 py-2 rounded-xl border border-[#9A8C83]"
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSearchCustomers}
                    className="px-4 py-2 rounded-xl bg-[#54453D] text-white font-bold"
                  >
                    بحث
                  </button>
                </div>

                {customerResults.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                    {customerResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCustomer(c)}
                        className="p-2.5 rounded-xl border border-[#E6DDD6] text-right hover:bg-[#FAF6F3]"
                      >
                        <div className="font-bold text-[#54453D]">{c.fullName}</div>
                        <div className="text-[11px] text-[#6B5B52] font-mono" dir="ltr">
                          {c.displayPhone || 'زائر'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-[#E6DDD6] grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="اسم عميل جديد"
                    className="px-3 py-1.5 rounded-xl border border-[#9A8C83]"
                  />
                  <input
                    type="tel"
                    value={quickPhone}
                    disabled={quickGuest}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className="px-3 py-1.5 rounded-xl border border-[#9A8C83] font-mono disabled:bg-stone-100"
                  />
                  <label className="flex items-center gap-1.5 text-[11px] text-[#54453D]">
                    <input
                      type="checkbox"
                      checked={quickGuest}
                      onChange={(e) => setQuickGuest(e.target.checked)}
                    />
                    عميل زائر بدون رقم
                  </label>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleQuickCreateCustomer}
                    className="px-3 py-1.5 rounded-xl border border-[#54453D] text-[#54453D] font-bold hover:bg-[#FAF6F3]"
                  >
                    + إضافة سريعة
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Service Catalog */}
          <div className="bg-white p-5 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#54453D]">2. اختيار الخدمات</h2>
            {branchServices.length === 0 ? (
              <p className="text-xs text-[#6B5B52]">لا توجد خدمات نشطة مخصصة لهذا الفرع.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {branchServices.map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => handleAddService(srv)}
                    className="p-3.5 rounded-2xl border border-[#E6DDD6] text-right hover:border-[#54453D] hover:bg-[#FAF6F3] transition flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#54453D]">{srv.nameAr}</div>
                      <div className="text-[11px] text-[#6B5B52]">{srv.durationMinutes} دقيقة</div>
                    </div>
                    <div className="text-xs font-bold font-mono text-[#54453D]">
                      {formatSar(srv.totalPriceHalalas)} ر.س
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cart, Discounts & Split Payment Checkout */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-5 h-fit">
          <h2 className="text-sm font-bold text-[#54453D] border-b border-[#E6DDD6] pb-3">
            3. سلة الفاتورة والتحصيل
          </h2>

          {cart.length === 0 ? (
            <p className="text-xs text-[#6B5B52] text-center py-6">
              أضف خدمات من القائمة لبدء الفاتورة.
            </p>
          ) : (
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div key={item.service.id} className="p-3 rounded-2xl bg-[#FAF6F3] border border-[#E6DDD6] space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#54453D]">{item.service.nameAr}</span>
                    <button
                      type="button"
                      onClick={() => setCart((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-700 text-[11px] font-bold"
                    >
                      حذف
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((c, i) =>
                              i === idx ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c
                            )
                          )
                        }
                        className="w-6 h-6 rounded-lg border border-[#9A8C83] bg-white font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold px-1">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCart((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, quantity: c.quantity + 1 } : c))
                          )
                        }
                        className="w-6 h-6 rounded-lg border border-[#9A8C83] bg-white font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-mono font-bold text-[#54453D]">
                      {formatSar(item.service.totalPriceHalalas * item.quantity)} ر.س
                    </span>
                  </div>

                  {canApplyDiscount && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <select
                        value={item.discountType}
                        onChange={(e) =>
                          setCart((prev) =>
                            prev.map((c, i) =>
                              i === idx
                                ? { ...c, discountType: e.target.value as DiscountType, discountInput: '' }
                                : c
                            )
                          )
                        }
                        className="px-2 py-1 rounded-lg border border-[#9A8C83] bg-white text-[11px]"
                      >
                        <option value="NONE">بدون خصم</option>
                        <option value="FIXED">خصم مبلغ (ر.س)</option>
                        <option value="PERCENT">
                          خصم نسبة % {!canOverrideDiscount ? '(حتى 20%)' : ''}
                        </option>
                      </select>
                      {item.discountType !== 'NONE' && (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discountInput}
                          onChange={(e) =>
                            setCart((prev) =>
                              prev.map((c, i) =>
                                i === idx ? { ...c, discountInput: e.target.value } : c
                              )
                            )
                          }
                          placeholder={item.discountType === 'PERCENT' ? 'النسبة %' : 'المبلغ ر.س'}
                          className="px-2 py-1 rounded-lg border border-[#9A8C83] bg-white font-mono text-[11px]"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Totals Preview */}
          <div className="p-3.5 rounded-2xl bg-[#54453D] text-white space-y-1">
            <div className="flex items-center justify-between text-xs opacity-85">
              <span>الإجمالي التقديري (يُعتمد من الخادم)</span>
              <span className="font-mono font-bold text-base">{formatSar(previewTotalHalalas)} ر.س</span>
            </div>
          </div>

          {/* Split Payments */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#54453D]">المدفوعات (يدعم تقسيم الدفع)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPaymentRows([
                      {
                        id: 'p1',
                        method: defaultMethod,
                        amountSar: formatSar(previewTotalHalalas),
                        referenceNumber: '',
                      },
                    ])
                  }
                  className="text-[11px] font-bold text-[#54453D] underline"
                >
                  تعبئة كامل المبلغ
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentRows((prev) => [
                      ...prev,
                      {
                        id: `p_${Date.now()}`,
                        method: defaultMethod,
                        amountSar: '',
                        referenceNumber: '',
                      },
                    ])
                  }
                  className="px-2 py-1 rounded-lg border border-[#54453D] text-[11px] font-bold"
                >
                  + دفعة
                </button>
              </div>
            </div>

            {paymentRows.map((row, idx) => {
              const cfg = paymentMethods.find((m) => m.method === row.method);
              return (
                <div key={row.id} className="p-2.5 rounded-xl border border-[#E6DDD6] space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={row.method}
                      onChange={(e) =>
                        setPaymentRows((prev) =>
                          prev.map((r, i) =>
                            i === idx ? { ...r, method: e.target.value as PaymentMethodCode } : r
                          )
                        )
                      }
                      className="flex-1 px-2.5 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
                    >
                      {enabledMethods.map((m) => (
                        <option key={m.method} value={m.method}>
                          {m.labelAr}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.amountSar}
                      onChange={(e) =>
                        setPaymentRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, amountSar: e.target.value } : r))
                        )
                      }
                      placeholder="المبلغ ر.س"
                      className="w-28 px-2.5 py-1.5 rounded-xl border border-[#9A8C83] font-mono"
                    />
                    {paymentRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setPaymentRows((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-red-700 font-bold px-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {cfg?.requiresReference && (
                    <input
                      type="text"
                      value={row.referenceNumber}
                      onChange={(e) =>
                        setPaymentRows((prev) =>
                          prev.map((r, i) =>
                            i === idx ? { ...r, referenceNumber: e.target.value } : r
                          )
                        )
                      }
                      placeholder="رقم المرجع / إيصال الشبكة (إلزامي)"
                      className="w-full px-2.5 py-1 rounded-xl border border-[#9A8C83] font-mono text-[11px]"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات الفاتورة (اختياري)"
            className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] text-xs"
          />

          <button
            type="button"
            disabled={isPending || cart.length === 0 || !selectedCustomer}
            onClick={handleCompleteSale}
            className="w-full py-3 rounded-2xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3f332d] disabled:opacity-50"
          >
            {isPending ? 'جاري اعتماد الفاتورة والترحيل...' : 'اعتماد البيع وإصدار الفاتورة'}
          </button>
        </div>
      </div>
    </div>
  );
}

