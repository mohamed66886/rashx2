'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type {
  BranchDoc,
  ServiceDoc,
  ProviderDoc,
  CustomerDoc,
  TimeSlot,
} from '@/lib/firebase-server';
import { createBookingAction, getAvailabilitySlotsAction } from '../actions';

export function NewBookingClient({
  branches,
  services,
  providers,
  customers,
  initialCustomerId,
}: {
  branches: BranchDoc[];
  services: ServiceDoc[];
  providers: ProviderDoc[];
  customers: CustomerDoc[];
  initialCustomerId?: string;
}) {
  const router = useRouter();

  // Selection states
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId || (customers[0]?.id || ''));

  // Default to today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0]!;
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter services for the selected branch
  const availableServices = services.filter((s) => s.assignedBranchIds.includes(selectedBranchId));

  // Filter providers for the selected branch & service
  const availableProviders = providers.filter((p) => {
    const assignedToBranch = p.assignedBranchIds.includes(selectedBranchId);
    const assignedToService =
      p.assignedServiceIds.includes(selectedServiceId) ||
      (services.find((s) => s.id === selectedServiceId)?.assignedProviderIds || []).includes(p.id);
    return assignedToBranch && assignedToService;
  });

  // Whenever branch or service changes, refresh availability slots
  useEffect(() => {
    if (!selectedBranchId || !selectedServiceId || !selectedDate) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    let isCancelled = false;
    async function fetchSlots() {
      setLoadingSlots(true);
      setError(null);
      setSelectedSlot(null);

      const res = await getAvailabilitySlotsAction(
        selectedBranchId,
        selectedServiceId,
        selectedDate,
        selectedProviderId || undefined
      );

      if (!isCancelled) {
        setLoadingSlots(false);
        if (res.success && res.data) {
          setSlots(res.data.slots);
        } else {
          setSlots([]);
          setError(res.error || 'تعذر جلب الأوقات المتاحة.');
        }
      }
    }

    fetchSlots();

    return () => {
      isCancelled = true;
    };
  }, [selectedBranchId, selectedServiceId, selectedProviderId, selectedDate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSlot) {
      setError('يرجى اختيار وقت محدد للموعد من قائمة الأوقات المتاحة.');
      return;
    }
    if (!selectedCustomerId) {
      setError('يرجى اختيار العميل.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('branchId', selectedBranchId);
    formData.set('serviceId', selectedServiceId);
    formData.set('providerId', selectedSlot.providerId);
    formData.set('customerId', selectedCustomerId);
    formData.set('date', selectedDate);
    formData.set('time', selectedSlot.time);

    const res = await createBookingAction(formData);
    setSubmitting(false);

    if (res.success && res.bookingId) {
      router.push(`/dashboard/bookings/${res.bookingId}`);
    } else {
      setError(res.error || 'فشل إتمام الحجز.');
    }
  }

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Selections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Branch & Service */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#54453D] flex items-center gap-2">
              <span>📍</span> 1. اختيار الفرع والخدمة
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">الفرع</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">الخدمة المطلوبة</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
                >
                  {availableServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameAr} — {(s.totalPriceHalalas / 100).toFixed(0)} ر.س ({s.durationMinutes} دقيقة)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">
                مقدم الخدمة (اختياري — اترك فارغاً لعرض كافة المتاحين)
              </label>
              <select
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
              >
                <option value="">أي مقدم خدمة متاح</option>
                {availableProviders.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayNameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Date & Available Time Slots */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#54453D] flex items-center gap-2">
                <span>⏰</span> 2. التاريخ والموعد المتاح
              </h2>
              <input
                type="date"
                value={selectedDate}
                min={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE] font-mono"
              />
            </div>

            {loadingSlots ? (
              <div className="p-8 text-center text-xs text-[#6B5B52]">
                <span className="animate-spin inline-block mr-2">⏳</span>
                جاري حساب الأوقات الشاغرة وساعات العمل وتعارضات المواعيد...
              </div>
            ) : slots.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6B5B52] bg-[#FAF9F8] rounded-2xl">
                لا توجد مواعيد متاحة في هذا اليوم لهذا الفرع ومقدم الخدمة. يرجى اختيار يوم آخر أو تغيير مقدم الخدمة.
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-[#6B5B52] block">
                  الأوقات المتاحة للحجز ({slots.length} موعد متاح):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1">
                  {slots.map((s, idx) => {
                    const isSelected =
                      selectedSlot?.time === s.time && selectedSlot?.providerId === s.providerId;
                    return (
                      <button
                        type="button"
                        key={`${s.providerId}_${s.time}_${idx}`}
                        onClick={() => setSelectedSlot(s)}
                        className={`p-2 rounded-xl text-center border transition-all text-xs font-semibold ${
                          isSelected
                            ? 'bg-[#54453D] text-white border-[#54453D] shadow-xs'
                            : 'bg-white border-[#E6DDD6] text-[#54453D] hover:border-[#9A8C83] hover:bg-[#FAF9F8]'
                        }`}
                      >
                        <span className="block font-bold text-xs" dir="ltr">{s.time}</span>
                        <span className="block text-[10px] opacity-80 truncate">{s.providerNameAr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Customer Information & Notes */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#54453D] flex items-center gap-2">
              <span>👤</span> 3. العميل والملاحظات
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">اختيار العميل</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.normalizedPhone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  ملاحظات العميل (تظهر للعميل في تفاصيل الحجز)
                </label>
                <textarea
                  name="customerNotes"
                  rows={2}
                  placeholder="ملاحظات الحجز أو طلبات العميل..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  ملاحظات داخلية (خاصة بإدارة الصالون وفريق العمل)
                </label>
                <textarea
                  name="internalNotes"
                  rows={2}
                  placeholder="ملاحظات التحضير الخاصة، تفاصيل الصبغة..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-4 sticky top-6">
            <h3 className="text-sm font-bold text-[#54453D] border-b border-[#E6DDD6] pb-3">
              ملخص الحجز والتكلفة
            </h3>

            {selectedService ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-[#6B5B52]">
                  <span>الخدمة:</span>
                  <span className="font-bold text-[#54453D]">{selectedService.nameAr}</span>
                </div>

                <div className="flex justify-between items-center text-[#6B5B52]">
                  <span>مدة الخدمة:</span>
                  <span className="font-bold text-[#54453D]">{selectedService.durationMinutes} دقيقة</span>
                </div>

                {selectedSlot && (
                  <>
                    <div className="flex justify-between items-center text-[#6B5B52]">
                      <span>التاريخ والوقت:</span>
                      <span className="font-bold text-[#54453D]" dir="ltr">
                        {selectedDate} @ {selectedSlot.time}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#6B5B52]">
                      <span>مقدم الخدمة:</span>
                      <span className="font-bold text-[#54453D]">{selectedSlot.providerNameAr}</span>
                    </div>
                  </>
                )}

                <div className="border-t border-[#E6DDD6] pt-3 space-y-1.5">
                  <div className="flex justify-between items-center text-[#6B5B52]">
                    <span>السعر الصافي:</span>
                    <span>{(selectedService.netPriceHalalas / 100).toFixed(2)} ر.س</span>
                  </div>

                  <div className="flex justify-between items-center text-[#6B5B52]">
                    <span>ضريبة القيمة المضافة (15%):</span>
                    <span>{(selectedService.calculatedTaxHalalas / 100).toFixed(2)} ر.س</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-[#54453D] pt-2 border-t border-[#E6DDD6]">
                    <span>الإجمالي المستحق:</span>
                    <span className="text-base">
                      {(selectedService.totalPriceHalalas / 100).toFixed(2)} ر.س
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedSlot || !selectedCustomerId}
                  className="w-full py-3 rounded-2xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 disabled:opacity-50 transition-all shadow-md mt-4"
                >
                  {submitting ? 'جاري تثبيت الحجز والأقفال الزمنية...' : 'تأكيد الحجز وحجز الموعد'}
                </button>
                <p className="text-[10px] text-center text-[#6B5B52]">
                  يتم حجز الموعد وإقفال الفترات الزمنية لمقدم الخدمة مباشرة وبشكل ذري.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#6B5B52]">اختر خدمة لعرض تفاصيل الأسعار.</p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

