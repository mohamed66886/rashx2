'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type DailyOperationsSnapshot,
  type BookingStatus,
} from '@/lib/firebase-server';
import { utcIsoToRiyadhTime, RESOURCE_TYPE_LABELS_AR } from '@rashx/database';
import { transitionBookingStatusAction } from '../bookings/actions';
import { enqueueBookingAction } from './actions';

const STATUS_BADGES: Record<BookingStatus, { label: string; cls: string }> = {
  PENDING: { label: 'قيد التأكيد', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'مؤكد', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  CHECKED_IN: { label: 'وصل للصالون', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  IN_SERVICE: { label: 'قيد الخدمة', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  COMPLETED: { label: 'مكتمل', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'ملغي', cls: 'bg-red-50 text-red-700 border-red-200' },
  NO_SHOW: { label: 'لم يحضر', cls: 'bg-stone-100 text-stone-600 border-stone-200' },
};

export function OperationsClient({
  snapshot,
  permissions,
}: {
  snapshot: DailyOperationsSnapshot;
  permissions: {
    canWalkIn: boolean;
    canManageQueue: boolean;
    canStartService: boolean;
    canCompleteService: boolean;
    canMarkNoShow: boolean;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const queuedBookingIds = new Set(
    snapshot.queueEntries
      .filter((q) => q.status === 'WAITING' || q.status === 'CALLED' || q.status === 'IN_SERVICE')
      .map((q) => q.bookingId)
  );
  const availableProviderSet = new Set(snapshot.availableProviderIds);
  const availableResourceSet = new Set(snapshot.availableResourceIds);

  function handleTransition(bookingId: string, status: BookingStatus, successLabel: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await transitionBookingStatusAction(bookingId, status);
      if (!res.success) {
        setFeedback({ type: 'err', text: res.error || 'تعذر تنفيذ العملية.' });
        return;
      }
      setFeedback({ type: 'ok', text: successLabel });
      router.refresh();
    });
  }

  function handleEnqueue(bookingId: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await enqueueBookingAction(bookingId, false);
      if (!res.success) {
        setFeedback({ type: 'err', text: res.error || 'تعذر إضافة الحجز للطابور.' });
        return;
      }
      setFeedback({ type: 'ok', text: 'تم إدراج العميل في طابور الانتظار.' });
      router.refresh();
    });
  }

  const kpiCards = [
    { label: 'إجمالي مواعيد اليوم', value: snapshot.counts.totalToday, tone: 'text-[#54453D] bg-[#FAF6F3]' },
    { label: 'مؤكد', value: snapshot.counts.confirmed, tone: 'text-blue-700 bg-blue-50/70' },
    { label: 'وصل للصالون', value: snapshot.counts.checkedIn, tone: 'text-indigo-700 bg-indigo-50/70' },
    { label: 'قيد الخدمة', value: snapshot.counts.inService, tone: 'text-purple-700 bg-purple-50/70' },
    { label: 'مكتمل', value: snapshot.counts.completed, tone: 'text-emerald-700 bg-emerald-50/70' },
    { label: 'ملغي / لم يحضر', value: snapshot.counts.cancelled + snapshot.counts.noShow, tone: 'text-red-700 bg-red-50/70' },
    { label: 'عملاء فوريون (Walk-in)', value: snapshot.counts.walkIns, tone: 'text-amber-700 bg-amber-50/70' },
    { label: 'الطابور (انتظار + مناداة)', value: snapshot.counts.waitingQueue + snapshot.counts.calledQueue, tone: 'text-[#54453D] bg-[#F0C5AE]/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#54453D]">لوحة التشغيل اليومي</h1>
          <p className="text-xs text-[#6B5B52] mt-0.5">
            متابعة لحظية للمواعيد، الطابور، المختصين، والموارد المتاحة ({snapshot.date} — توقيت الرياض)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.refresh()}
            disabled={isPending}
            className="px-3.5 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs font-bold text-[#54453D] hover:bg-[#FAF6F3] disabled:opacity-50"
          >
            تحديث اللوحة
          </button>
          <Link
            href="/dashboard/queue"
            className="px-3.5 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs font-bold text-[#54453D] hover:bg-[#FAF6F3]"
          >
            طابور الانتظار ({snapshot.counts.waitingQueue + snapshot.counts.calledQueue})
          </Link>
          <Link
            href="/dashboard/calendar"
            className="px-3.5 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs font-bold text-[#54453D] hover:bg-[#FAF6F3]"
          >
            التقويم
          </Link>
          {permissions.canWalkIn && (
            <Link
              href="/dashboard/operations/walk-in"
              className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3f332d]"
            >
              + تسجيل عميل فوري (Walk-in)
            </Link>
          )}
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

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`p-3.5 rounded-2xl border border-[#E6DDD6] ${card.tone} flex flex-col justify-between`}
          >
            <span className="text-[11px] font-medium opacity-80">{card.label}</span>
            <span className="text-2xl font-bold mt-1 font-mono">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Operational Warnings */}
      {snapshot.warnings.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-amber-900">
              تنبيهات تشغيلية ({snapshot.warnings.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {snapshot.warnings.map((w, idx) => (
              <Link
                key={`${w.bookingId}_${w.type}_${idx}`}
                href={`/dashboard/bookings/${w.bookingId}`}
                className={`p-3 rounded-2xl border text-xs flex items-start justify-between gap-2 bg-white hover:shadow-xs transition ${
                  w.severity === 'HIGH' ? 'border-red-300' : 'border-amber-200'
                }`}
              >
                <div>
                  <div className="font-bold text-[#54453D]">{w.messageAr}</div>
                  <div className="text-[11px] text-[#6B5B52] font-mono mt-0.5">{w.bookingNumber}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    w.severity === 'HIGH'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {w.severity === 'HIGH' ? 'عاجل' : 'تنبيه'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Split: Today's Bookings Table + Live Resources/Providers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bookings List */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-[#E6DDD6] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E6DDD6] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#54453D]">
              جدول مواعيد اليوم ({snapshot.bookings.length})
            </h2>
            <span className="text-[11px] text-[#6B5B52]">مرتبة حسب وقت البدء</span>
          </div>

          {snapshot.bookings.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#6B5B52]">
              لا توجد مواعيد مطابقة لمعايير التصفية الحالية.
            </div>
          ) : (
            <div className="divide-y divide-[#E6DDD6]">
              {snapshot.bookings.map((b) => {
                const start = utcIsoToRiyadhTime(b.scheduledStartTime).time;
                const end = utcIsoToRiyadhTime(b.scheduledEndTime).time;
                const st = STATUS_BADGES[b.status] || {
                  label: b.status,
                  cls: 'bg-stone-100 text-stone-600 border-stone-200',
                };
                const inQueue = queuedBookingIds.has(b.id);

                return (
                  <div
                    key={b.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[#FAF6F3]/60"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#54453D]" dir="ltr">
                          {start} - {end}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${st.cls}`}>
                          {st.label}
                        </span>
                        {b.source === 'WALK_IN' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            فوري
                          </span>
                        )}
                        {inQueue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0C5AE]/40 text-[#54453D]">
                            في الطابور
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-[#54453D]">
                        <Link href={`/dashboard/bookings/${b.id}`} className="hover:underline">
                          {b.customerName}
                        </Link>
                        {b.customerPhone && (
                          <span className="font-mono font-normal text-[#6B5B52] mr-2" dir="ltr">
                            {b.customerPhone}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-[#6B5B52] flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>الخدمة: {b.serviceNameSnapshot.ar}</span>
                        <span>المختص: {b.providerNameAr || 'غير محدد'}</span>
                        <span>المورد: {b.resourceNameAr || 'غير معين'}</span>
                        <span className="font-mono">{b.bookingNumber}</span>
                      </div>
                    </div>

                    {/* Quick Operational Actions */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleTransition(b.id, 'CHECKED_IN', 'تم تسجيل حضور العميل.')}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 disabled:opacity-50"
                        >
                          تسجيل حضور
                        </button>
                      )}

                      {b.status === 'CHECKED_IN' && permissions.canManageQueue && !inQueue && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleEnqueue(b.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#54453D] text-white text-[11px] font-bold hover:bg-[#3f332d] disabled:opacity-50"
                        >
                          إدراج بالطابور
                        </button>
                      )}

                      {b.status === 'CHECKED_IN' && permissions.canStartService && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleTransition(b.id, 'IN_SERVICE', 'بدأت الخدمة بنجاح.')}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-600 text-white text-[11px] font-bold hover:bg-purple-700 disabled:opacity-50"
                        >
                          بدء الخدمة
                        </button>
                      )}

                      {b.status === 'IN_SERVICE' && permissions.canCompleteService && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleTransition(b.id, 'COMPLETED', 'تم إكمال الخدمة.')}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 disabled:opacity-50"
                        >
                          إكمال
                        </button>
                      )}

                      {(b.status === 'CONFIRMED' || b.status === 'CHECKED_IN') && permissions.canMarkNoShow && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleTransition(b.id, 'NO_SHOW', 'تم تسجيل عدم حضور العميل.')}
                          className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-stone-700 text-[11px] font-bold hover:bg-stone-100 disabled:opacity-50"
                        >
                          لم يحضر
                        </button>
                      )}

                      <Link
                        href={`/dashboard/bookings/${b.id}`}
                        className="px-2.5 py-1.5 rounded-xl border border-[#E6DDD6] text-[#54453D] text-[11px] font-bold hover:bg-[#FAF6F3]"
                      >
                        التفاصيل
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Available Providers & Resources + Queue Preview */}
        <div className="space-y-6">
          {/* Available Providers */}
          <div className="bg-white p-5 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#54453D]">
                المختصون المتاحون الآن ({snapshot.counts.availableProviders} / {snapshot.providers.length})
              </h2>
            </div>
            {snapshot.providers.length === 0 ? (
              <p className="text-xs text-[#6B5B52]">لا يوجد مختصون نشطون.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {snapshot.providers.map((p) => {
                  const isAvail = availableProviderSet.has(p.id);
                  return (
                    <span
                      key={p.id}
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isAvail
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}
                    >
                      {p.displayNameAr} {isAvail ? '• متاح' : '• مشغول'}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Resources */}
          <div className="bg-white p-5 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#54453D]">
                الكراسي والموارد ({snapshot.counts.availableResources} / {snapshot.resources.length})
              </h2>
              <Link href="/dashboard/resources" className="text-[11px] font-bold text-[#54453D] hover:underline">
                إدارة الموارد
              </Link>
            </div>
            {snapshot.resources.length === 0 ? (
              <p className="text-xs text-[#6B5B52]">لا توجد موارد مضافة.</p>
            ) : (
              <div className="space-y-1.5">
                {snapshot.resources.map((r) => {
                  const isAvail = availableResourceSet.has(r.id);
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#FAF6F3]"
                    >
                      <div>
                        <span className="font-bold text-[#54453D]">{r.nameAr}</span>
                        <span className="text-[10px] text-[#6B5B52] mr-2">
                          ({RESOURCE_TYPE_LABELS_AR[r.type] || r.type})
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status !== 'ACTIVE'
                            ? 'bg-red-100 text-red-700'
                            : isAvail
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status !== 'ACTIVE' ? 'غير نشط' : isAvail ? 'متاح' : 'مشغول'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Queue Summary */}
          <div className="bg-white p-5 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#54453D]">طابور الانتظار الحالي</h2>
              <Link href="/dashboard/queue" className="text-[11px] font-bold text-[#54453D] hover:underline">
                إدارة الطابور
              </Link>
            </div>
            {snapshot.queueEntries.filter((q) => q.status === 'WAITING' || q.status === 'CALLED').length === 0 ? (
              <p className="text-xs text-[#6B5B52]">لا يوجد عملاء في الانتظار حالياً.</p>
            ) : (
              <div className="space-y-2">
                {snapshot.queueEntries
                  .filter((q) => q.status === 'WAITING' || q.status === 'CALLED')
                  .slice(0, 6)
                  .map((q) => (
                    <div
                      key={q.id}
                      className="p-2.5 rounded-xl border border-[#E6DDD6] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#54453D]">{q.customerName}</div>
                        <div className="text-[11px] text-[#6B5B52]">{q.serviceNameAr}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.status === 'CALLED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {q.status === 'CALLED' ? 'تم النداء' : 'منتظر'}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
