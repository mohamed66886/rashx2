'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type BranchDoc,
  type ProviderDoc,
  type ResourceDoc,
  type QueueEntryDoc,
  type QueueCallDoc,
} from '@/lib/firebase-server';
import {
  callNextCustomerAction,
  callAgainAction,
  recordNoResponseAction,
  reorderQueueAction,
  startQueueServiceAction,
  completeQueueServiceAction,
  removeFromQueueAction,
  reconcileQueueAction,
} from '../operations/actions';
import { assignBookingResourceAction } from '../resources/actions';

function makeIdemKey(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function formatWaitMinutes(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return '0 د';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} د`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs} س ${rem} د`;
}

export function QueueClient({
  branchId,
  date,
  branches,
  providers,
  resources,
  entries,
  recentCalls,
  permissions,
}: {
  branchId: string;
  date: string;
  branches: BranchDoc[];
  providers: ProviderDoc[];
  resources: ResourceDoc[];
  entries: QueueEntryDoc[];
  recentCalls: QueueCallDoc[];
  permissions: {
    canCall: boolean;
    canManage: boolean;
    canReorder: boolean;
    canStartService: boolean;
    canCompleteService: boolean;
    canAssignResource: boolean;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [callProviderId, setCallProviderId] = useState('');
  const [selectedResources, setSelectedResources] = useState<Record<string, string>>({});

  // Periodic background refresh for live queue desk
  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, 20000);
    return () => clearInterval(id);
  }, [router]);

  const waitingEntries = entries
    .filter((e) => e.status === 'WAITING')
    .sort((a, b) => a.positionScore - b.positionScore);
  const calledEntries = entries.filter((e) => e.status === 'CALLED');
  const inServiceEntries = entries.filter((e) => e.status === 'IN_SERVICE');

  const activeBranch = branches.find((b) => b.id === branchId);
  const activeResources = resources.filter((r) => r.status === 'ACTIVE' && (!branchId || r.branchId === branchId));

  function runAction(fn: () => Promise<{ success: boolean; error?: string }>, okText: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.success) {
        setFeedback({ type: 'err', text: res.error || 'تعذر تنفيذ العملية.' });
        return;
      }
      setFeedback({ type: 'ok', text: okText });
      router.refresh();
    });
  }

  function handleCallNext(targetBookingId?: string) {
    if (!branchId) {
      setFeedback({ type: 'err', text: 'يرجى تحديد الفرع أولاً لنداء العميل.' });
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const res = await callNextCustomerAction({
        branchId,
        date,
        providerId: callProviderId || undefined,
        targetBookingId,
        idempotencyKey: makeIdemKey('call_next'),
      });
      if (!res.success) {
        setFeedback({ type: 'err', text: res.error || 'تعذر نداء العميل التالي.' });
        return;
      }
      setFeedback({
        type: 'ok',
        text: res.entry
          ? `تم نداء العميل: ${res.entry.customerName}`
          : 'تم إرسال النداء بنجاح.',
      });
      router.refresh();
    });
  }

  function handleMoveWaiting(index: number, direction: -1 | 1) {
    if (!branchId) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= waitingEntries.length) return;
    const nextOrder = waitingEntries.map((e) => e.bookingId);
    const [moved] = nextOrder.splice(index, 1);
    nextOrder.splice(targetIdx, 0, moved!);

    runAction(
      () =>
        reorderQueueAction({
          branchId,
          date,
          orderedBookingIds: nextOrder,
        }),
      'تم تحديث ترتيب الطابور.'
    );
  }

  function handleElevatePriority(bookingId: string) {
    if (!branchId) return;
    const nextOrder = [
      bookingId,
      ...waitingEntries.filter((e) => e.bookingId !== bookingId).map((e) => e.bookingId),
    ];
    runAction(
      () =>
        reorderQueueAction({
          branchId,
          date,
          orderedBookingIds: nextOrder,
          elevateBookingIdToPriority: bookingId,
        }),
      'تم منح العميل أولوية وتقديمه في الطابور.'
    );
  }

  function handleAssignResource(bookingId: string, resourceId: string) {
    runAction(
      () => assignBookingResourceAction(bookingId, resourceId || null),
      resourceId ? 'تم تعيين المورد للعميل.' : 'تم إلغاء تعيين المورد.'
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#54453D]">طابور الانتظار والنداء</h1>
          <p className="text-xs text-[#6B5B52] mt-0.5">
            {activeBranch ? `الفرع: ${activeBranch.name} — ` : ''}
            {date} (توقيت الرياض) • تحديث تلقائي كل 20 ثانية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {permissions.canManage && branchId && (
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                runAction(() => reconcileQueueAction(branchId, date), 'تمت مزامنة الطابور مع الحجوزات.')
              }
              className="px-3.5 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs font-bold text-[#54453D] hover:bg-[#FAF6F3] disabled:opacity-50"
            >
              مزامنة الطابور
            </button>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={() => router.refresh()}
            className="px-3.5 py-2 rounded-xl border border-[#E6DDD6] bg-white text-xs font-bold text-[#54453D] hover:bg-[#FAF6F3]"
          >
            تحديث الآن
          </button>
          <Link
            href="/dashboard/operations/walk-in"
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3f332d]"
          >
            + تسجيل عميل فوري
          </Link>
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

      {/* Call Next Control Bar */}
      {permissions.canCall && (
        <div className="bg-white p-5 rounded-3xl border border-[#E6DDD6] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#54453D]">نداء العميل التالي</h2>
            <p className="text-xs text-[#6B5B52]">
              ينادي النظام تلقائياً العميل صاحب الأولوية الأقدم في الانتظار (FIFO + أولوية).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={callProviderId}
              onChange={(e) => setCallProviderId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#9A8C83] bg-white text-xs"
            >
              <option value="">أي مختص</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayNameAr}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={isPending || waitingEntries.length === 0 || !branchId}
              onClick={() => handleCallNext()}
              className="px-5 py-2.5 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3f332d] disabled:opacity-50"
            >
              نداء العميل التالي ({waitingEntries.length} منتظر)
            </button>
          </div>
        </div>
      )}

      {/* 3 Operational Lanes: CALLED | WAITING | IN_SERVICE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: CALLED */}
        <div className="bg-white rounded-3xl border border-amber-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-amber-900">تم النداء ({calledEntries.length})</h2>
            <span className="text-[11px] text-amber-700">بانتظار التوجه للخدمة</span>
          </div>
          <div className="p-4 space-y-3">
            {calledEntries.length === 0 ? (
              <p className="text-xs text-[#6B5B52] text-center py-6">لا يوجد عملاء قيد النداء.</p>
            ) : (
              calledEntries.map((entry) => {
                const chosenRes = selectedResources[entry.bookingId] ?? entry.resourceId ?? '';
                return (
                  <div key={entry.id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[#54453D]">{entry.customerName}</div>
                        <div className="text-xs text-[#6B5B52]">{entry.serviceNameAr}</div>
                        <div className="text-[11px] text-[#6B5B52] mt-1">
                          المختص: {entry.providerNameAr || 'غير محدد'} • نداءات: {entry.callCount}
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/bookings/${entry.bookingId}`}
                        className="text-[11px] font-mono text-[#54453D] underline"
                      >
                        {entry.bookingNumber}
                      </Link>
                    </div>

                    {permissions.canAssignResource && activeResources.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <select
                          value={chosenRes}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedResources((prev) => ({ ...prev, [entry.bookingId]: val }));
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-xl border border-[#9A8C83] bg-white text-xs"
                        >
                          <option value="">بدون مورد / كرسي محدد</option>
                          {activeResources.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.nameAr}
                            </option>
                          ))}
                        </select>
                        {chosenRes !== (entry.resourceId ?? '') && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleAssignResource(entry.bookingId, chosenRes)}
                            className="px-2.5 py-1.5 rounded-xl border border-[#54453D] text-[#54453D] font-bold text-[11px]"
                          >
                            حفظ
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      {permissions.canStartService && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            runAction(
                              () => startQueueServiceAction(entry.bookingId, chosenRes || null),
                              'بدأت الخدمة بنجاح.'
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-[11px] font-bold hover:bg-purple-700 disabled:opacity-50"
                        >
                          بدء الخدمة
                        </button>
                      )}
                      {permissions.canCall && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            runAction(
                              () =>
                                callAgainAction({
                                  bookingId: entry.bookingId,
                                  idempotencyKey: makeIdemKey('call_again'),
                                }),
                              'تمت إعادة نداء العميل.'
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 disabled:opacity-50"
                        >
                          إعادة نداء
                        </button>
                      )}
                      {permissions.canCall && (
                        <>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              runAction(
                                () =>
                                  recordNoResponseAction({
                                    bookingId: entry.bookingId,
                                    disposition: 'RETURN_TO_QUEUE',
                                    idempotencyKey: makeIdemKey('no_resp_ret'),
                                  }),
                                'تمت إعادة العميل إلى الانتظار.'
                              )
                            }
                            className="px-2.5 py-1.5 rounded-xl border border-[#E6DDD6] bg-white text-[#54453D] text-[11px] font-bold hover:bg-[#FAF6F3]"
                          >
                            إعادة للانتظار
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              runAction(
                                () =>
                                  recordNoResponseAction({
                                    bookingId: entry.bookingId,
                                    disposition: 'MARK_NO_SHOW',
                                    idempotencyKey: makeIdemKey('no_resp_ns'),
                                  }),
                                'تم تسجيل العميل كـ (لم يحضر).'
                              )
                            }
                            className="px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-[11px] font-bold hover:bg-red-100"
                          >
                            لم يحضر
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: WAITING */}
        <div className="bg-white rounded-3xl border border-[#E6DDD6] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#FAF6F3] border-b border-[#E6DDD6] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#54453D]">قائمة الانتظار ({waitingEntries.length})</h2>
            <span className="text-[11px] text-[#6B5B52]">مرتبة بالأولوية</span>
          </div>
          <div className="p-4 space-y-3">
            {waitingEntries.length === 0 ? (
              <p className="text-xs text-[#6B5B52] text-center py-6">طابور الانتظار فارغ.</p>
            ) : (
              waitingEntries.map((entry, idx) => (
                <div key={entry.id} className="p-4 rounded-2xl border border-[#E6DDD6] space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#54453D] text-white text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-sm text-[#54453D]">{entry.customerName}</span>
                        {entry.priorityLevel === 'PRIORITY' && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                            أولوية
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#6B5B52] mt-1">{entry.serviceNameAr}</div>
                      <div className="text-[11px] text-[#6B5B52] mt-0.5 flex flex-wrap gap-x-2">
                        <span>المختص: {entry.providerNameAr || 'أي مختص'}</span>
                        <span>المورد: {entry.resourceNameAr || 'غير محدد'}</span>
                        <span>الانتظار: {formatWaitMinutes(entry.checkedInAt || entry.queuedAt)}</span>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/bookings/${entry.bookingId}`}
                      className="text-[11px] font-mono text-[#54453D] underline"
                    >
                      {entry.bookingNumber}
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {permissions.canCall && branchId && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleCallNext(entry.bookingId)}
                        className="px-2.5 py-1 rounded-xl bg-[#54453D] text-white text-[11px] font-bold hover:bg-[#3f332d]"
                      >
                        نداء مباشر
                      </button>
                    )}

                    {permissions.canReorder && branchId && (
                      <>
                        <button
                          type="button"
                          disabled={isPending || idx === 0}
                          onClick={() => handleMoveWaiting(idx, -1)}
                          className="px-2 py-1 rounded-xl border border-[#E6DDD6] text-[11px] font-bold disabled:opacity-40"
                          title="تقديم"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={isPending || idx === waitingEntries.length - 1}
                          onClick={() => handleMoveWaiting(idx, 1)}
                          className="px-2 py-1 rounded-xl border border-[#E6DDD6] text-[11px] font-bold disabled:opacity-40"
                          title="تأخير"
                        >
                          ↓
                        </button>
                        {entry.priorityLevel !== 'PRIORITY' && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleElevatePriority(entry.bookingId)}
                            className="px-2.5 py-1 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-[11px] font-bold"
                          >
                            منح أولوية
                          </button>
                        )}
                      </>
                    )}

                    {permissions.canManage && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          runAction(
                            () => removeFromQueueAction({ bookingId: entry.bookingId, reason: 'إزالة يدوية' }),
                            'تمت إزالة العميل من الطابور.'
                          )
                        }
                        className="px-2.5 py-1 rounded-xl border border-stone-200 text-stone-600 text-[11px] hover:bg-stone-100 mr-auto"
                      >
                        إزالة
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: IN_SERVICE */}
        <div className="bg-white rounded-3xl border border-purple-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-purple-50/70 border-b border-purple-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-purple-900">قيد الخدمة ({inServiceEntries.length})</h2>
            <span className="text-[11px] text-purple-700">تقديم الخدمة حالياً</span>
          </div>
          <div className="p-4 space-y-3">
            {inServiceEntries.length === 0 ? (
              <p className="text-xs text-[#6B5B52] text-center py-6">لا توجد خدمات قيد التنفيذ حالياً.</p>
            ) : (
              inServiceEntries.map((entry) => (
                <div key={entry.id} className="p-4 rounded-2xl border border-purple-200 bg-purple-50/20 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-[#54453D]">{entry.customerName}</div>
                      <div className="text-xs text-[#6B5B52]">{entry.serviceNameAr}</div>
                      <div className="text-[11px] text-[#6B5B52] mt-1">
                        المختص: {entry.providerNameAr || 'غير محدد'} • المورد: {entry.resourceNameAr || 'غير محدد'}
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/bookings/${entry.bookingId}`}
                      className="text-[11px] font-mono text-[#54453D] underline"
                    >
                      {entry.bookingNumber}
                    </Link>
                  </div>

                  {permissions.canCompleteService && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        runAction(
                          () => completeQueueServiceAction(entry.bookingId),
                          'تم إكمال الخدمة بنجاح.'
                        )
                      }
                      className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                    >
                      إكمال الخدمة وإنهاء الدور
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Call Log */}
      {recentCalls.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-[#54453D]">سجل النداءات الأخيرة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {recentCalls.slice(0, 8).map((c) => (
              <div key={c.id} className="p-3 rounded-2xl bg-[#FAF6F3] border border-[#E6DDD6]">
                <div className="font-bold text-[#54453D]">{c.customerName}</div>
                <div className="text-[11px] text-[#6B5B52]">
                  {c.callType === 'CALL_AGAIN' ? 'إعادة نداء' : 'نداء'} • نداء #{c.callSequence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
