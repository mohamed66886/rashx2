'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type BranchDoc,
  type ServiceDoc,
  type ProviderDoc,
  type CustomerDoc,
  type AvailabilityQueryResult,
  type EligibleResourceAvailability,
} from '@/lib/firebase-server';
import {
  searchCustomersForWalkInAction,
  getWalkInAvailabilityAction,
  registerWalkInAction,
} from '../actions';
import { listEligibleResourcesAction } from '../../resources/actions';

function makeIdempotencyKey() {
  return `walkin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function WalkInClient({
  branches,
  services,
  providers,
  initialDate,
  canPrioritize,
}: {
  branches: BranchDoc[];
  services: ServiceDoc[];
  providers: ProviderDoc[];
  initialDate: string;
  canPrioritize: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Customer selection state
  const [customerMode, setCustomerMode] = useState<'SEARCH' | 'NEW' | 'GUEST'>('SEARCH');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerDoc[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDoc | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Booking & scheduling state
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(initialDate);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [availability, setAvailability] = useState<AvailabilityQueryResult | null>(null);
  const [selectedSlotIso, setSelectedSlotIso] = useState('');
  const [selectedSlotEndIso, setSelectedSlotEndIso] = useState('');

  // Resource assignment
  const [eligibleResources, setEligibleResources] = useState<EligibleResourceAvailability[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState('');

  // Queue & notes
  const [addToQueue, setAddToQueue] = useState(true);
  const [priority, setPriority] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Idempotency & feedback
  const [idempotencyKey, setIdempotencyKey] = useState(() => makeIdempotencyKey());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    bookingId: string;
    bookingNumber: string;
    queueEntryId: string | null;
    deduplicated: boolean;
  } | null>(null);

  const branchServices = services.filter((s) => s.assignedBranchIds.includes(branchId));
  const selectedService = branchServices.find((s) => s.id === serviceId) || null;
  const branchProviders = providers.filter(
    (p) =>
      p.assignedBranchIds.includes(branchId) &&
      (!serviceId ||
        p.assignedServiceIds.includes(serviceId) ||
        selectedService?.assignedProviderIds.includes(p.id))
  );

  // Auto-select first active service when branch changes
  useEffect(() => {
    const firstSrv = branchServices[0];
    if (firstSrv && !branchServices.some((s) => s.id === serviceId)) {
      setServiceId(firstSrv.id);
    } else if (!firstSrv) {
      setServiceId('');
    }
    setAvailability(null);
    setSelectedSlotIso('');
    setSelectedResourceId('');
  }, [branchId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCustomerSearch() {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await searchCustomersForWalkInAction(searchQuery);
      if (!res.success) {
        setErrorMsg(res.error || 'تعذر البحث عن العملاء.');
        return;
      }
      setSearchResults(res.customers || []);
    });
  }

  function handleFetchAvailability() {
    if (!branchId || !serviceId || !date) {
      setErrorMsg('يرجى تحديد الفرع والخدمة والتاريخ لفحص التوافر الفعلي.');
      return;
    }
    setErrorMsg(null);
    setSelectedSlotIso('');
    setEligibleResources([]);
    setSelectedResourceId('');

    startTransition(async () => {
      const res = await getWalkInAvailabilityAction({
        branchId,
        serviceId,
        date,
        providerId: selectedProviderId || undefined,
      });
      if (!res.success || !res.data) {
        setErrorMsg(res.error || 'تعذر جلب الأوقات المتاحة.');
        return;
      }
      setAvailability(res.data);
    });
  }

  function handleSelectSlot(slot: {
    startTimeIso: string;
    endTimeIso: string;
    providerId: string;
  }) {
    setSelectedSlotIso(slot.startTimeIso);
    setSelectedSlotEndIso(slot.endTimeIso);
    setSelectedProviderId(slot.providerId);
    setSelectedResourceId('');

    startTransition(async () => {
      const res = await listEligibleResourcesAction({
        branchId,
        serviceId,
        startTimeIso: slot.startTimeIso,
        endTimeIso: slot.endTimeIso,
      });
      if (res.success && res.resources) {
        setEligibleResources(res.resources);
        const firstFree = res.resources.find((r) => r.isAvailableForWindow);
        if (selectedService?.resourceRequirement === 'REQUIRED' && firstFree) {
          setSelectedResourceId(firstFree.id);
        }
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (customerMode === 'SEARCH' && !selectedCustomer) {
      setErrorMsg('يرجى البحث عن العميل واختياره أو التحويل لإنشاء عميل جديد / زائر.');
      return;
    }
    if ((customerMode === 'NEW' || customerMode === 'GUEST') && newCustomerName.trim().length < 2) {
      setErrorMsg('يرجى إدخال اسم العميل (حرفين على الأقل).');
      return;
    }
    if (customerMode === 'NEW' && !newCustomerPhone.trim()) {
      setErrorMsg('يرجى إدخال رقم الجوال السعودي أو اختيار وضع "عميل زائر بدون جوال".');
      return;
    }
    if (!selectedSlotIso || !selectedProviderId) {
      setErrorMsg('يرجى فحص التوافر واختيار فترة زمنية ومقدم خدمة متاح.');
      return;
    }
    if (selectedService?.resourceRequirement === 'REQUIRED' && !selectedResourceId) {
      setErrorMsg('هذه الخدمة تتطلب تحديد كرسي أو غرفة صالون متاحة.');
      return;
    }

    startTransition(async () => {
      const res = await registerWalkInAction({
        branchId,
        serviceId,
        providerId: selectedProviderId,
        resourceId: selectedResourceId || null,
        scheduledStartTime: selectedSlotIso,
        existingCustomerId: customerMode === 'SEARCH' ? selectedCustomer?.id : undefined,
        newCustomerName: customerMode !== 'SEARCH' ? newCustomerName : undefined,
        newCustomerPhone: customerMode === 'NEW' ? newCustomerPhone : undefined,
        isGuestCustomer: customerMode === 'GUEST',
        customerNotes,
        internalNotes,
        addToQueue,
        priority: addToQueue && canPrioritize ? priority : false,
        idempotencyKey,
      });

      if (!res.success || !res.bookingId) {
        setErrorMsg(res.error || 'تعذر تسجيل الزيارة الفورية.');
        return;
      }

      setReceipt({
        bookingId: res.bookingId,
        bookingNumber: res.bookingNumber || res.bookingId,
        queueEntryId: res.queueEntryId ?? null,
        deduplicated: Boolean(res.deduplicated),
      });
      router.refresh();
    });
  }

  function handleResetNewWalkIn() {
    setReceipt(null);
    setSelectedCustomer(null);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setSelectedSlotIso('');
    setSelectedSlotEndIso('');
    setSelectedResourceId('');
    setCustomerNotes('');
    setInternalNotes('');
    setIdempotencyKey(makeIdempotencyKey());
    setErrorMsg(null);
  }

  if (receipt) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-xs max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-xl">
          ✓
        </div>
        <h2 className="text-lg font-bold text-[#54453D]">
          تم تسجيل الزيارة الفورية (Walk-in) بنجاح
        </h2>
        <p className="text-xs text-[#6B5B52]">
          رقم الحجز المرجعي:{' '}
          <span className="font-mono font-bold text-[#54453D]">{receipt.bookingNumber}</span>
          {receipt.deduplicated && ' (تم استرجاع الطلب المسبق لمنع التكرار)'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs">
          {receipt.queueEntryId && (
            <Link
              href="/dashboard/queue"
              className="px-4 py-2 rounded-xl bg-[#54453D] text-white font-bold hover:bg-[#54453D]/90"
            >
              الانتقال إلى طابور الانتظار
            </Link>
          )}
          <Link
            href={`/dashboard/bookings/${receipt.bookingId}`}
            className="px-4 py-2 rounded-xl border border-[#E6DDD6] text-[#54453D] font-bold hover:bg-[#FAF9F8]"
          >
            تفاصيل الحجز
          </Link>
          <button
            type="button"
            onClick={handleResetNewWalkIn}
            className="px-4 py-2 rounded-xl bg-[#FAF9F8] border border-[#E6DDD6] text-[#54453D] font-bold cursor-pointer"
          >
            تسجيل زيارة فورية جديدة
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Step 1: Customer Selection */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6DDD6] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-sm font-bold text-[#54453D]">1. بيانات العميل</h2>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setCustomerMode('SEARCH');
                setErrorMsg(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold border cursor-pointer ${
                customerMode === 'SEARCH'
                  ? 'bg-[#54453D] text-white border-[#54453D]'
                  : 'bg-[#FAF9F8] text-[#54453D] border-[#E6DDD6]'
              }`}
            >
              بحث عن عميل حالي
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomerMode('NEW');
                setSelectedCustomer(null);
                setErrorMsg(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold border cursor-pointer ${
                customerMode === 'NEW'
                  ? 'bg-[#54453D] text-white border-[#54453D]'
                  : 'bg-[#FAF9F8] text-[#54453D] border-[#E6DDD6]'
              }`}
            >
              عميل جديد (بجوال)
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomerMode('GUEST');
                setSelectedCustomer(null);
                setNewCustomerPhone('');
                setErrorMsg(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold border cursor-pointer ${
                customerMode === 'GUEST'
                  ? 'bg-[#54453D] text-white border-[#54453D]'
                  : 'bg-[#FAF9F8] text-[#54453D] border-[#E6DDD6]'
              }`}
            >
              زائر بدون رقم جوال (Guest)
            </button>
          </div>
        </div>

        {customerMode === 'SEARCH' && (
          <div className="space-y-3 text-xs">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو رقم الجوال (مثال: 05xxxxxxxx أو +9665...)"
                className="flex-1 px-3 py-2 rounded-xl border border-[#9A8C83]"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={handleCustomerSearch}
                className="px-4 py-2 rounded-xl bg-[#54453D] text-white font-bold cursor-pointer"
              >
                بحث
              </button>
            </div>

            {selectedCustomer && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block">
                    العميل المختار: {selectedCustomer.fullName}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-800">
                    {selectedCustomer.normalizedPhone || 'زائر بدون رقم جوال'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="text-xs font-bold text-red-700 cursor-pointer"
                >
                  تغيير
                </button>
              </div>
            )}

            {searchResults.length > 0 && !selectedCustomer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {searchResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCustomer(c)}
                    className="p-3 rounded-xl border border-[#E6DDD6] hover:border-[#54453D] text-right bg-[#FAF9F8] cursor-pointer"
                  >
                    <div className="font-bold text-[#54453D]">{c.fullName}</div>
                    <div className="text-[11px] font-mono text-[#6B5B52]">
                      {c.normalizedPhone || 'زائر بدون رقم جوال'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(customerMode === 'NEW' || customerMode === 'GUEST') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-[#54453D] mb-1">اسم العميل *</label>
              <input
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full px-3 py-2 rounded-xl border border-[#9A8C83]"
              />
            </div>

            {customerMode === 'NEW' ? (
              <div>
                <label className="block font-bold text-[#54453D] mb-1">رقم الجوال السعودي *</label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] font-mono"
                />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#FAF9F8] border border-[#E6DDD6] flex items-center text-[11px] text-[#6B5B52]">
                سياسة الضيف الزائر: لن يتم تسجيل أي رقم جوال وهمي، وسيُسجل العميل كزائر فوري.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Branch, Service & Availability */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6DDD6] shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-[#54453D]">2. الفرع والخدمة وفحص التوافر الفعلي</h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block font-bold text-[#54453D] mb-1">الفرع *</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] bg-white"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#54453D] mb-1">الخدمة *</label>
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setAvailability(null);
                setSelectedSlotIso('');
              }}
              className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] bg-white"
            >
              {branchServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr} ({s.durationMinutes} د • {(s.totalPriceHalalas / 100).toFixed(2)} ر.س)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#54453D] mb-1">مقدم الخدمة (اختياري للتصفية)</label>
            <select
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] bg-white"
            >
              <option value="">أي مقدم خدمة متاح</option>
              {branchProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayNameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#54453D] mb-1">التاريخ (توقيت الرياض)</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] font-mono"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {selectedService && (
            <div className="text-[11px] text-[#6B5B52]">
              متطلب الكرسي/الغرفة:{' '}
              <span className="font-bold text-[#54453D]">
                {selectedService.resourceRequirement === 'REQUIRED'
                  ? 'إلزامي'
                  : selectedService.resourceRequirement === 'NONE'
                    ? 'لا يتطلب مورداً'
                    : 'اختياري'}
              </span>
            </div>
          )}

          <button
            type="button"
            disabled={isPending || !branchId || !serviceId}
            onClick={handleFetchAvailability}
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white font-bold hover:bg-[#54453D]/90 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'جاري فحص الجدول...' : 'فحص الأوقات ومقدمي الخدمة المتاحين'}
          </button>
        </div>

        {availability && (
          <div className="pt-3 border-t border-[#E6DDD6] space-y-3">
            {availability.slots.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                لا توجد فترات متاحة لهذا اليوم/الخدمة ضمن ساعات عمل الفرع وتوافر الموارد.
              </div>
            ) : (
              <div>
                <p className="font-bold text-[#54453D] mb-2">
                  اختر الوقت ومقدم الخدمة ({availability.slots.length} فترة متاحة):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                  {availability.slots.map((slot) => {
                    const active =
                      selectedSlotIso === slot.startTimeIso &&
                      selectedProviderId === slot.providerId;
                    return (
                      <button
                        key={`${slot.providerId}_${slot.startTimeIso}`}
                        type="button"
                        onClick={() => handleSelectSlot(slot)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          active
                            ? 'bg-[#54453D] text-white border-[#54453D]'
                            : 'bg-[#FAF9F8] text-[#54453D] border-[#E6DDD6] hover:border-[#54453D]'
                        }`}
                      >
                        <div className="font-mono font-bold text-xs">{slot.time}</div>
                        <div className="text-[10px] opacity-85 truncate">{slot.providerNameAr}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resource Selection when Slot Selected */}
        {selectedSlotIso && selectedService?.resourceRequirement !== 'NONE' && (
          <div className="pt-3 border-t border-[#E6DDD6] space-y-2">
            <label className="block font-bold text-[#54453D]">
              تخصيص الكرسي / المورد{' '}
              {selectedService?.resourceRequirement === 'REQUIRED' ? '(إلزامي *)' : '(اختياري)'}
            </label>
            {eligibleResources.length === 0 ? (
              <p className="text-[11px] text-[#6B5B52]">
                لا توجد موارد مسجلة ومؤهلة لهذه الخدمة في الفرع المحدد.
              </p>
            ) : (
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 rounded-xl border border-[#9A8C83] bg-white"
              >
                {selectedService?.resourceRequirement !== 'REQUIRED' && (
                  <option value="">بدون تحديد مورد الآن</option>
                )}
                {eligibleResources.map((r) => (
                  <option key={r.id} value={r.id} disabled={!r.isAvailableForWindow}>
                    {r.nameAr} {r.code ? `(${r.code})` : ''}{' '}
                    {r.isAvailableForWindow ? '— متاح' : '— محجوز في هذه الفترة'}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Step 3: Queue & Notes */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6DDD6] shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-[#54453D]">3. الطابور والملاحظات</h2>

        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 font-bold text-[#54453D] cursor-pointer">
            <input
              type="checkbox"
              checked={addToQueue}
              onChange={(e) => setAddToQueue(e.target.checked)}
            />
            <span>تسجيل الوصول (CHECKED_IN) وإدراج العميل مباشرة في الطابور التشغيلي</span>
          </label>

          {canPrioritize && addToQueue && (
            <label className="flex items-center gap-2 font-bold text-amber-800 cursor-pointer">
              <input
                type="checkbox"
                checked={priority}
                onChange={(e) => setPriority(e.target.checked)}
              />
              <span>منح أولوية قصوى (VIP / أولوية)</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-[#54453D] mb-1">ملاحظات العميل</label>
            <textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-[#9A8C83]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#54453D] mb-1">ملاحظات داخلية للفريق</label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-[#9A8C83]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/dashboard/operations"
            className="px-4 py-2.5 rounded-xl border border-[#E6DDD6] text-[#6B5B52] font-bold"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isPending || !selectedSlotIso}
            className="px-6 py-2.5 rounded-xl bg-[#54453D] text-white font-bold hover:bg-[#54453D]/90 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'جاري التسجيل والحجز...' : 'تأكيد الزيارة الفورية وإدراجها'}
          </button>
        </div>
      </div>
    </form>
  );
}

