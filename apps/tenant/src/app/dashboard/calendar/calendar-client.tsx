'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type BranchDoc,
  type ProviderDoc,
  type ResourceDoc,
  type ServiceDoc,
  type BookingDoc,
  type BookingStatus,
  type OperationalWarning,
} from '@/lib/firebase-server';
import { utcIsoToRiyadhTime, addRiyadhDays } from '@rashx/database';
import { fetchCalendarPageAction } from '../operations/actions';
import { getAvailabilitySlotsAction, rescheduleBookingAction } from '../bookings/actions';

type CalendarViewMode = 'DAILY' | 'WEEKLY' | 'PROVIDER' | 'BRANCH';

const STATUS_BADGES: Record<BookingStatus, { label: string; cls: string }> = {
  PENDING: { label: 'قيد التأكيد', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'مؤكد', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  CHECKED_IN: { label: 'وصل للصالون', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  IN_SERVICE: { label: 'قيد الخدمة', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  COMPLETED: { label: 'مكتمل', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'ملغي', cls: 'bg-red-50 text-red-700 border-red-200' },
  NO_SHOW: { label: 'لم يحضر', cls: 'bg-stone-100 text-stone-600 border-stone-200' },
};

export function CalendarClient({
  initialStartDate,
  initialEndDate,
  initialBookings,
  initialWarnings,
  initialNextCursor,
  initialHasMore,
  branches,
  providers,
  resources,
  services,
  canReschedule,
}: {
  initialStartDate: string;
  initialEndDate: string;
  initialBookings: BookingDoc[];
  initialWarnings: OperationalWarning[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  branches: BranchDoc[];
  providers: ProviderDoc[];
  resources: ResourceDoc[];
  services: ServiceDoc[];
  canReschedule: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [viewMode, setViewMode] = useState<CalendarViewMode>('DAILY');
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [branchId, setBranchId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');

  const [bookings, setBookings] = useState<BookingDoc[]>(initialBookings);
  const [warnings, setWarnings] = useState<OperationalWarning[]>(initialWarnings);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Reschedule modal state
  const [rescheduleTarget, setRescheduleTarget] = useState<BookingDoc | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(initialStartDate);
  const [rescheduleProviderId, setRescheduleProviderId] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<
    Array<{ startTimeIso: string; endTimeIso: string; time: string; endTime: string; available: boolean }>
  >([]);
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const warningMap = new Map<string, OperationalWarning[]>();
  for (const w of warnings) {
    const existing = warningMap.get(w.bookingId) || [];
    existing.push(w);
    warningMap.set(w.bookingId, existing);
  }

  function loadRange(
    nextStart: string,
    nextEnd: string,
    opts?: {
      append?: boolean;
      cursor?: string;
      bId?: string;
      pId?: string;
      rId?: string;
      sId?: string;
      st?: BookingStatus | '';
    }
  ) {
    setFeedback(null);
    startTransition(async () => {
      const res = await fetchCalendarPageAction({
        startDate: nextStart,
        endDate: nextEnd,
        branchId: (opts?.bId ?? branchId) || undefined,
        providerId: (opts?.pId ?? providerId) || undefined,
        resourceId: (opts?.rId ?? resourceId) || undefined,
        serviceId: (opts?.sId ?? serviceId) || undefined,
        status: ((opts?.st ?? statusFilter) as BookingStatus) || undefined,
        cursorStartTimeIso: opts?.cursor,
        limit: 120,
      });

      if (!res.success) {
        setFeedback({ type: 'err', text: res.error || 'تعذر تحميل بيانات التقويم.' });
        return;
      }

      if (opts?.append) {
        setBookings((prev) => [...prev, ...(res.bookings || [])]);
        setWarnings((prev) => [...prev, ...(res.warnings || [])]);
      } else {
        setBookings(res.bookings || []);
        setWarnings(res.warnings || []);
      }
      setNextCursor(res.nextCursorStartTimeIso ?? null);
      setHasMore(Boolean(res.hasMore));
    });
  }

  function switchView(mode: CalendarViewMode) {
    setViewMode(mode);
    if (mode === 'WEEKLY') {
      const nextEnd = addRiyadhDays(startDate, 6);
      setEndDate(nextEnd);
      loadRange(startDate, nextEnd);
    } else if (mode === 'DAILY') {
      setEndDate(startDate);
      loadRange(startDate, startDate);
    }
  }

  function openRescheduleModal(booking: BookingDoc) {
    const currentDate = utcIsoToRiyadhTime(booking.scheduledStartTime).date;
    setRescheduleTarget(booking);
    setRescheduleDate(currentDate);
    setRescheduleProviderId(booking.providerId || '');
    setRescheduleSlots([]);
    setSelectedSlotTime('');
    setRescheduleReason('');
  }

  function loadRescheduleSlots() {
    if (!rescheduleTarget) return;
    startTransition(async () => {
      const res = await getAvailabilitySlotsAction(
        rescheduleTarget.branchId,
        rescheduleTarget.serviceId,
        rescheduleDate,
        rescheduleProviderId || undefined,
        rescheduleTarget.resourceId || undefined
      );
      if (!res.success || !res.data) {
        setFeedback({ type: 'err', text: res.error || 'تعذر فحص الأوقات المتاحة.' });
        return;
      }
      setRescheduleSlots(res.data.slots.filter((s) => s.available));
    });
  }

  function submitReschedule() {
    if (!rescheduleTarget || !selectedSlotTime) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set('bookingId', rescheduleTarget.id);
      fd.set('date', rescheduleDate);
      fd.set('time', selectedSlotTime);
      if (rescheduleProviderId) fd.set('newProviderId', rescheduleProviderId);
      fd.set('newResourceId', '__KEEP__');
      if (rescheduleReason) fd.set('reason', rescheduleReason);

      const res = await rescheduleBookingAction(fd);
      if (!res.success) {
        setFeedback({ type: 'err', text: res.error || 'تعذر إعادة جدولة الموعد.' });
        return;
      }
      setRescheduleTarget(null);
      setFeedback({ type: 'ok', text: 'تمت إعادة جدولة الموعد بنجاح.' });
      loadRange(startDate, endDate);
      router.refresh();
    });
  }

  const branchesById = new Map(branches.map((b) => [b.id, b.name]));

  // Group bookings depending on viewMode
  const groupedSections: Array<{ key: string; title: string; items: BookingDoc[] }> = (() => {
    if (viewMode === 'PROVIDER') {
      const map = new Map<string, BookingDoc[]>();
      for (const b of bookings) {
        const key = b.providerNameAr || 'بدون مختص محدد';
        const list = map.get(key) || [];
        list.push(b);
        map.set(key, list);
      }
      return Array.from(map.entries()).map(([title, items]) => ({ key: title, title, items }));
    }
    if (viewMode === 'BRANCH') {
      const map = new Map<string, BookingDoc[]>();
      for (const b of bookings) {
        const key = branchesById.get(b.branchId) || b.branchId;
        const list = map.get(key) || [];
        list.push(b);
        map.set(key, list);
      }
      return Array.from(map.entries()).map(([title, items]) => ({ key: title, title, items }));
    }
    // DAILY or WEEKLY -> group by Riyadh date
    const map = new Map<string, BookingDoc[]>();
    for (const b of bookings) {
      const d = utcIsoToRiyadhTime(b.scheduledStartTime).date;
      const list = map.get(d) || [];
      list.push(b);
      map.set(d, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([d, items]) => ({ key: d, title: `تاريخ ${d}`, items }));
  })();

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#54453D]">تقويم المواعيد</h1>
          <p className="text-xs text-[#6B5B52] mt-0.5">
            عرض زمني محدود النطاق بتوقيت الرياض (Asia/Riyadh) مع كشف التعارضات والتأخير
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E6DDD6]">
          {(
            [
              ['DAILY', 'يومي'],
              ['WEEKLY', 'أسبوعي'],
              ['PROVIDER', 'حسب المختص'],
              ['BRANCH', 'حسب الفرع'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => switchView(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === mode
                  ? 'bg-[#54453D] text-white'
                  : 'text-[#6B5B52] hover:bg-[#FAF6F3]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6] shadow-xs grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-7 gap-3 items-end text-xs">
        <div>
          <label className="block font-bold text-[#54453D] mb-1">من تاريخ</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white font-mono"
          />
        </div>
        <div>
          <label className="block font-bold text-[#54453D] mb-1">إلى تاريخ</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white font-mono"
          />
        </div>
        <div>
          <label className="block font-bold text-[#54453D] mb-1">الفرع</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
          >
            <option value="">كل الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold text-[#54453D] mb-1">المختص</label>
          <select
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
          >
            <option value="">كل المختصين</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayNameAr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold text-[#54453D] mb-1">المورد</label>
          <select
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
          >
            <option value="">كل الموارد</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nameAr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold text-[#54453D] mb-1">الخدمة</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
          >
            <option value="">كل الخدمات</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameAr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => loadRange(startDate, endDate)}
            className="w-full px-4 py-1.5 rounded-xl bg-[#54453D] text-white font-bold hover:bg-[#3f332d] disabled:opacity-50"
          >
            {isPending ? 'جاري التحميل...' : 'عرض'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-2xl border text-xs font-bold ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Sections */}
      {groupedSections.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-[#E6DDD6] text-center text-xs text-[#6B5B52]">
          لا توجد مواعيد في النطاق الزمني المحدد.
        </div>
      ) : (
        <div className="space-y-5">
          {groupedSections.map((section) => (
            <div key={section.key} className="bg-white rounded-3xl border border-[#E6DDD6] shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 bg-[#FAF6F3] border-b border-[#E6DDD6] flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#54453D]">{section.title}</h2>
                <span className="text-xs text-[#6B5B52]">{section.items.length} موعد</span>
              </div>

              <div className="divide-y divide-[#E6DDD6]">
                {section.items.map((b) => {
                  const start = utcIsoToRiyadhTime(b.scheduledStartTime);
                  const end = utcIsoToRiyadhTime(b.scheduledEndTime);
                  const st = STATUS_BADGES[b.status] || {
                    label: b.status,
                    cls: 'bg-stone-100 text-stone-600 border-stone-200',
                  };
                  const itemWarnings = warningMap.get(b.id) || [];

                  return (
                    <div
                      key={b.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                        itemWarnings.length > 0 ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#54453D]" dir="ltr">
                            {start.date} • {start.time} - {end.time}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${st.cls}`}>
                            {st.label}
                          </span>
                          {itemWarnings.map((w, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800"
                            >
                              {w.messageAr}
                            </span>
                          ))}
                        </div>

                        <div className="text-xs font-bold text-[#54453D]">
                          {b.customerName}
                          {b.customerPhone && (
                            <span className="font-mono font-normal text-[#6B5B52] mr-2" dir="ltr">
                              {b.customerPhone}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-[#6B5B52] flex flex-wrap gap-x-3">
                          <span>الخدمة: {b.serviceNameSnapshot.ar}</span>
                          <span>الفرع: {branchesById.get(b.branchId) || b.branchId}</span>
                          <span>المختص: {b.providerNameAr || 'غير محدد'}</span>
                          <span>المورد: {b.resourceNameAr || 'غير معين'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {canReschedule &&
                          (b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'CHECKED_IN') && (
                            <button
                              type="button"
                              onClick={() => openRescheduleModal(b)}
                              className="px-3 py-1.5 rounded-xl border border-[#54453D] text-[#54453D] text-[11px] font-bold hover:bg-[#FAF6F3]"
                            >
                              إعادة جدولة
                            </button>
                          )}
                        <Link
                          href={`/dashboard/bookings/${b.id}`}
                          className="px-3 py-1.5 rounded-xl bg-[#54453D] text-white text-[11px] font-bold hover:bg-[#3f332d]"
                        >
                          التفاصيل
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cursor Pagination */}
      {hasMore && nextCursor && (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={isPending}
            onClick={() => loadRange(startDate, endDate, { append: true, cursor: nextCursor })}
            className="px-6 py-2.5 rounded-xl border border-[#54453D] text-[#54453D] text-xs font-bold hover:bg-[#FAF6F3] disabled:opacity-50"
          >
            تحميل المزيد من المواعيد
          </button>
        </div>
      )}

      {/* Reschedule Modal (using Phase 4.0 atomic reservation engine) */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6DDD6] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E6DDD6] pb-3">
              <h3 className="text-sm font-bold text-[#54453D]">
                إعادة جدولة الحجز {rescheduleTarget.bookingNumber}
              </h3>
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="text-xs text-[#6B5B52] hover:text-[#54453D]"
              >
                إغلاق
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#54453D] mb-1">التاريخ الجديد</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-[#54453D] mb-1">المختص</label>
                <select
                  value={rescheduleProviderId}
                  onChange={(e) => setRescheduleProviderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] bg-white"
                >
                  <option value="">حسب التوافر</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayNameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={loadRescheduleSlots}
              className="w-full py-2 rounded-xl border border-[#54453D] text-[#54453D] text-xs font-bold hover:bg-[#FAF6F3]"
            >
              فحص الأوقات المتاحة
            </button>

            {rescheduleSlots.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#54453D]">اختر الوقت المتاح:</div>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {rescheduleSlots.map((slot) => (
                    <button
                      key={slot.startTimeIso}
                      type="button"
                      onClick={() => setSelectedSlotTime(slot.time)}
                      className={`py-2 px-2 rounded-xl text-xs font-mono border ${
                        selectedSlotTime === slot.time
                          ? 'bg-[#54453D] text-white border-[#54453D]'
                          : 'bg-white text-[#54453D] border-[#E6DDD6] hover:bg-[#FAF6F3]'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs">
              <label className="block font-bold text-[#54453D] mb-1">سبب إعادة الجدولة (اختياري)</label>
              <input
                type="text"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="مثال: طلب العميل"
                className="w-full px-3 py-2 rounded-xl border border-[#9A8C83]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#E6DDD6] text-xs font-bold text-[#54453D]"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isPending || !selectedSlotTime}
                onClick={submitReschedule}
                className="px-5 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3f332d] disabled:opacity-50"
              >
                تأكيد إعادة الجدولة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
