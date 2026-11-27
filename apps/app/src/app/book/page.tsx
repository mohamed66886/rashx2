'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAvailableSalonsAction,
  getTenantBranchesAction,
  getTenantServicesAction,
  getTenantProvidersAction,
  getCustomerAvailabilitySlotsAction,
  submitCustomerBookingAction,
} from './actions';
import type { TimeSlot } from '@rashx/database';

export default function CustomerBookingWizard() {
  const [step, setStep] = useState<number>(1);

  // Data states
  const [salons, setSalons] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedSalonId, setSelectedSalonId] = useState<string>('');

  const [branches, setBranches] = useState<Array<{ id: string; name: string; city: string; address: string }>>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  const [services, setServices] = useState<Array<{ id: string; name: string; durationMinutes: number; totalPriceHalalas: number }>>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  const [providers, setProviders] = useState<Array<{ id: string; displayNameAr: string }>>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0]!;
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Customer form details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Loading & Submission states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [bookingResult, setBookingResult] = useState<{
    bookingNumber: string;
    status: string;
    scheduledStartTime: string;
    serviceName: string;
    totalPriceHalalas: number;
  } | null>(null);

  // Load Salons on mount
  useEffect(() => {
    async function initSalons() {
      setLoading(true);
      const data = await getAvailableSalonsAction();
      setSalons(data);
      if (data.length > 0) {
        setSelectedSalonId(data[0]!.id);
      }
      setLoading(false);
    }
    initSalons();
  }, []);

  // When Salon changes, fetch Branches
  useEffect(() => {
    if (!selectedSalonId) return;
    async function fetchBranches() {
      setLoading(true);
      const data = await getTenantBranchesAction(selectedSalonId);
      setBranches(data);
      if (data.length > 0) {
        setSelectedBranchId(data[0]!.id);
      } else {
        setSelectedBranchId('');
      }
      setLoading(false);
    }
    fetchBranches();
  }, [selectedSalonId]);

  // When Branch changes, fetch Services
  useEffect(() => {
    if (!selectedSalonId || !selectedBranchId) return;
    async function fetchServices() {
      setLoading(true);
      const data = await getTenantServicesAction(selectedSalonId, selectedBranchId);
      setServices(data);
      if (data.length > 0) {
        setSelectedServiceId(data[0]!.id);
      } else {
        setSelectedServiceId('');
      }
      setLoading(false);
    }
    fetchServices();
  }, [selectedSalonId, selectedBranchId]);

  // When Service changes, fetch Providers
  useEffect(() => {
    if (!selectedSalonId || !selectedBranchId || !selectedServiceId) return;
    async function fetchProviders() {
      setLoading(true);
      const data = await getTenantProvidersAction(selectedSalonId, selectedBranchId, selectedServiceId);
      setProviders(data);
      setSelectedProviderId('');
      setLoading(false);
    }
    fetchProviders();
  }, [selectedSalonId, selectedBranchId, selectedServiceId]);

  // When Date or Provider or Service changes, fetch Available Slots
  useEffect(() => {
    if (!selectedSalonId || !selectedBranchId || !selectedServiceId || !selectedDate) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    async function fetchSlots() {
      setLoadingSlots(true);
      setError(null);
      setSelectedSlot(null);
      const res = await getCustomerAvailabilitySlotsAction(
        selectedSalonId,
        selectedBranchId,
        selectedServiceId,
        selectedDate,
        selectedProviderId || undefined
      );
      setLoadingSlots(false);
      if (res.success && res.data) {
        setSlots(res.data.slots);
      } else {
        setSlots([]);
        setError(res.error || 'لا توجد أوقات شاغرة لهذا اليوم.');
      }
    }
    fetchSlots();
  }, [selectedSalonId, selectedBranchId, selectedServiceId, selectedProviderId, selectedDate]);

  async function handleSubmitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setError('يرجى اختيار وقت محدد للموعد.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('يرجى إدخال اسم العميل ورقم الجوال السعودي.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set('tenantId', selectedSalonId);
    formData.set('branchId', selectedBranchId);
    formData.set('serviceId', selectedServiceId);
    formData.set('providerId', selectedSlot.providerId);
    formData.set('date', selectedDate);
    formData.set('time', selectedSlot.time);
    formData.set('customerName', customerName.trim());
    formData.set('customerPhone', customerPhone.trim());
    if (customerEmail) formData.set('customerEmail', customerEmail.trim());
    if (customerNotes) formData.set('customerNotes', customerNotes.trim());

    const res = await submitCustomerBookingAction(formData);
    setLoading(false);

    if (res.success && res.bookingNumber) {
      setBookingResult({
        bookingNumber: res.bookingNumber,
        status: res.status || 'CONFIRMED',
        scheduledStartTime: res.scheduledStartTime || '',
        serviceName: res.serviceName || '',
        totalPriceHalalas: res.totalPriceHalalas || 0,
      });
      setStep(4); // Receipt step
    } else {
      setError(res.error || 'فشل إتمام الحجز، يرجى المحاولة مرة أخرى.');
    }
  }

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedSalon = salons.find((s) => s.id === selectedSalonId);
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <main className="min-h-screen bg-[#FAF9F8] text-[#54453D] py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block text-2xl font-black text-[#54453D] tracking-wide">
            راش إكس <span className="text-[#91B8C0]">· RASHX</span>
          </Link>
          <h1 className="text-xl font-bold text-[#54453D]">حجز موعد جديد في الصالون</h1>
          <p className="text-xs text-[#6B5B52]">
            احجز موعدك بسهولة، اختر الخدمة والأخصائي والوقت المناسب لك مباشرة.
          </p>
        </div>

        {/* Stepper (Steps 1, 2, 3, 4) */}
        {step < 4 && (
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#E6DDD6] text-xs font-bold text-[#6B5B52]">
            <span className={step === 1 ? 'text-[#54453D] font-black' : ''}>1. الصالون والخدمة</span>
            <span>←</span>
            <span className={step === 2 ? 'text-[#54453D] font-black' : ''}>2. الوقت والمقدم</span>
            <span>←</span>
            <span className={step === 3 ? 'text-[#54453D] font-black' : ''}>3. بياناتك والتأكيد</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: Salon, Branch & Service */}
        {step === 1 && (
          <div className="bg-white p-6 rounded-3xl border border-[#E6DDD6] shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[#54453D] flex items-center gap-2">
              <span>💇‍♀️</span> اختيار المنشأة والخدمة
            </h2>

            {salons.length === 0 && !loading ? (
              <p className="text-xs text-[#6B5B52]">لا توجد صالونات متاحة للحجز حالياً.</p>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#54453D] mb-1">الصالون / المركز</label>
                  <select
                    value={selectedSalonId}
                    onChange={(e) => setSelectedSalonId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#9A8C83] bg-white text-xs focus:ring-2 focus:ring-[#F0C5AE]"
                  >
                    {salons.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#54453D] mb-1">الفرع</label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    disabled={branches.length === 0}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#9A8C83] bg-white text-xs focus:ring-2 focus:ring-[#F0C5AE]"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city} — {b.address})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#54453D] mb-1">الخدمة المطلوبة</label>
                  {services.length === 0 ? (
                    <p className="text-[#6B5B52] p-3 bg-[#FAF9F8] rounded-xl">لا توجد خدمات متاحة في هذا الفرع.</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                      {services.map((srv) => {
                        const isSelected = selectedServiceId === srv.id;
                        return (
                          <div
                            key={srv.id}
                            onClick={() => setSelectedServiceId(srv.id)}
                            className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-[#54453D] text-white border-[#54453D] shadow-xs'
                                : 'bg-white border-[#E6DDD6] hover:bg-[#FAF9F8]'
                            }`}
                          >
                            <div>
                              <span className="font-bold block text-sm">{srv.name}</span>
                              <span className="text-[11px] opacity-80">{srv.durationMinutes} دقيقة</span>
                            </div>
                            <span className="font-bold text-sm">
                              {(srv.totalPriceHalalas / 100).toFixed(0)} ر.س
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!selectedSalonId || !selectedBranchId || !selectedServiceId}
                  onClick={() => setStep(2)}
                  className="w-full py-3 rounded-2xl bg-[#54453D] text-white font-bold text-xs hover:bg-[#54453D]/90 disabled:opacity-50 transition-all shadow-sm mt-4"
                >
                  المتابعة لاختيار التاريخ والوقت ←
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Provider, Date & Slot */}
        {step === 2 && (
          <div className="bg-white p-6 rounded-3xl border border-[#E6DDD6] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6DDD6] pb-3">
              <h2 className="text-base font-bold text-[#54453D] flex items-center gap-2">
                <span>🗓️</span> الموعد والأخصائي
              </h2>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[#6B5B52] hover:text-[#54453D]"
              >
                تغيير الخدمة
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#54453D] mb-1">الأخصائي / مقدم الخدمة</label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#9A8C83] bg-white text-xs focus:ring-2 focus:ring-[#F0C5AE]"
                >
                  <option value="">أي أخصائي متاح</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayNameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#54453D] mb-1">تاريخ الحجز</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] bg-white font-mono text-xs focus:ring-2 focus:ring-[#F0C5AE]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#54453D] mb-2">الأوقات المتاحة لهذا اليوم</label>
                {loadingSlots ? (
                  <div className="p-8 text-center text-[#6B5B52] text-xs">
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    جاري فحص المواعيد المتاحة...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6B5B52] bg-[#FAF9F8] rounded-2xl">
                    لا توجد مواعيد متاحة في هذا اليوم. يرجى اختيار تاريخ آخر أو تغيير الأخصائي.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
                    {slots.map((s, idx) => {
                      const isSelected = selectedSlot?.time === s.time && selectedSlot?.providerId === s.providerId;
                      return (
                        <button
                          type="button"
                          key={`${s.providerId}_${s.time}_${idx}`}
                          onClick={() => setSelectedSlot(s)}
                          className={`p-2.5 rounded-xl text-center border transition-all text-xs font-semibold ${
                            isSelected
                              ? 'bg-[#54453D] text-white border-[#54453D] shadow-xs'
                              : 'bg-white border-[#E6DDD6] text-[#54453D] hover:bg-[#FAF9F8]'
                          }`}
                        >
                          <span className="block font-bold text-xs" dir="ltr">{s.time}</span>
                          <span className="block text-[10px] opacity-80 truncate">{s.providerNameAr}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-2xl bg-[#FAF9F8] border border-[#9A8C83] text-[#54453D] font-bold text-xs hover:bg-[#E6DDD6]"
                >
                  السابق
                </button>
                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                  className="flex-2 py-3 rounded-2xl bg-[#54453D] text-white font-bold text-xs hover:bg-[#54453D]/90 disabled:opacity-50 transition-all shadow-sm"
                >
                  المتابعة لبيانات التواصل ←
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Customer Information & Final Confirmation */}
        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="bg-white p-6 rounded-3xl border border-[#E6DDD6] shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[#54453D] flex items-center gap-2">
              <span>📝</span> بيانات التواصل وتأكيد الحجز
            </h2>

            {/* Selected Booking Summary */}
            <div className="bg-[#FAF9F8] p-4 rounded-2xl border border-[#E6DDD6] text-xs space-y-2">
              <div className="flex justify-between items-center text-[#6B5B52]">
                <span>الصالون والفرع:</span>
                <span className="font-bold text-[#54453D]">{selectedSalon?.name} ({selectedBranch?.name})</span>
              </div>
              <div className="flex justify-between items-center text-[#6B5B52]">
                <span>الخدمة:</span>
                <span className="font-bold text-[#54453D]">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between items-center text-[#6B5B52]">
                <span>الموعد:</span>
                <span className="font-bold text-[#54453D]" dir="ltr">
                  {selectedDate} @ {selectedSlot?.time}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#6B5B52]">
                <span>الأخصائي:</span>
                <span className="font-bold text-[#54453D]">{selectedSlot?.providerNameAr}</span>
              </div>
              <div className="border-t border-[#E6DDD6] pt-2 flex justify-between items-center text-sm font-bold text-[#54453D]">
                <span>السعر الإجمالي:</span>
                <span>{((selectedService?.totalPriceHalalas || 0) / 100).toFixed(2)} ر.س</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#54453D] mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: ريم العتيبي"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#9A8C83] bg-white text-xs focus:ring-2 focus:ring-[#F0C5AE]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#54453D] mb-1">رقم الجوال السعودي *</label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full px-3 py-2.5 text-left font-mono rounded-xl border border-[#9A8C83] bg-white text-xs focus:ring-2 focus:ring-[#F0C5AE]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#54453D] mb-1">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  dir="ltr"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#9A8C83] bg-white text-xs focus:ring-2 focus:ring-[#F0C5AE]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#54453D] mb-1">ملاحظات خاصة للصالون (اختياري)</label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="أي تفاصيل ترغب في إبلاغ الأخصائي بها..."
                  className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] bg-white text-xs focus:ring-2 focus:ring-[#F0C5AE]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-2xl bg-[#FAF9F8] border border-[#9A8C83] text-[#54453D] font-bold text-xs hover:bg-[#E6DDD6]"
                >
                  السابق
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 py-3 rounded-2xl bg-[#54453D] text-white font-bold text-xs hover:bg-[#54453D]/90 disabled:opacity-50 transition-all shadow-md"
                >
                  {loading ? 'جاري تأكيد الحجز...' : 'تأكيد الحجز النهائي'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 4: Success Receipt */}
        {step === 4 && bookingResult && (
          <div className="bg-white p-8 rounded-3xl border border-[#E6DDD6] shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
              ✓
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#54453D]">تم تأكيد حجزك بنجاح!</h2>
              <p className="text-xs text-[#6B5B52] mt-1">
                شكراً لاختيارك لنا. تم حجز موعدك وإرسال التفاصيل لصالون الخدمة.
              </p>
            </div>

            <div className="bg-[#FAF9F8] p-5 rounded-2xl border border-[#E6DDD6] text-xs text-right space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between items-center border-b border-[#E6DDD6] pb-2">
                <span className="text-[#6B5B52]">رقم الحجز المرجعي:</span>
                <span className="font-mono font-bold text-sm text-[#54453D]">{bookingResult.bookingNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B5B52]">الخدمة:</span>
                <span className="font-bold text-[#54453D]">{bookingResult.serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B5B52]">تاريخ ووقت الموعد:</span>
                <span className="font-mono font-bold text-[#54453D]" dir="ltr">
                  {selectedDate} @ {selectedSlot?.time}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B5B52]">الأخصائي:</span>
                <span className="font-bold text-[#54453D]">{selectedSlot?.providerNameAr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B5B52]">الموقع:</span>
                <span className="font-bold text-[#54453D]">{selectedBranch?.name} ({selectedBranch?.address})</span>
              </div>
              <div className="border-t border-[#E6DDD6] pt-2 flex justify-between items-center text-sm font-bold text-[#54453D]">
                <span>المبلغ المستحق:</span>
                <span>{((bookingResult.totalPriceHalalas || 0) / 100).toFixed(2)} ر.س</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setBookingResult(null);
                  setSelectedSlot(null);
                  setStep(1);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#54453D] text-white font-bold text-xs hover:bg-[#54453D]/90"
              >
                حجز موعد جديد
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

