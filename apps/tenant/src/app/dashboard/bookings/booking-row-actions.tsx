'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BookingDoc, BookingStatus } from '@/lib/firebase-server';
import {
  transitionBookingStatusAction,
  cancelBookingAction,
  rescheduleBookingAction,
} from './actions';

export function BookingRowActions({ booking }: { booking: BookingDoc }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusTransition(targetStatus: BookingStatus) {
    setLoading(true);
    setError(null);
    const res = await transitionBookingStatusAction(booking.id, targetStatus);
    setLoading(false);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'فشل تغيير الحالة');
    }
  }

  async function handleCancelSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('bookingId', booking.id);
    const res = await cancelBookingAction(formData);
    setLoading(false);
    if (res.success) {
      setShowCancelModal(false);
      router.refresh();
    } else {
      setError(res.error || 'فشل إلغاء الحجز');
    }
  }

  async function handleRescheduleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('bookingId', booking.id);
    const res = await rescheduleBookingAction(formData);
    setLoading(false);
    if (res.success) {
      setShowRescheduleModal(false);
      router.refresh();
    } else {
      setError(res.error || 'فشل إعادة الجدولة');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {booking.status === 'PENDING' && (
        <button
          onClick={() => handleStatusTransition('CONFIRMED')}
          disabled={loading}
          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-bold transition-colors"
        >
          تأكيد
        </button>
      )}

      {booking.status === 'CONFIRMED' && (
        <button
          onClick={() => handleStatusTransition('CHECKED_IN')}
          disabled={loading}
          className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[11px] font-bold transition-colors"
        >
          تسجيل وصول
        </button>
      )}

      {booking.status === 'CHECKED_IN' && (
        <button
          onClick={() => handleStatusTransition('IN_SERVICE')}
          disabled={loading}
          className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-[11px] font-bold transition-colors"
        >
          بدء الخدمة
        </button>
      )}

      {booking.status === 'IN_SERVICE' && (
        <button
          onClick={() => handleStatusTransition('COMPLETED')}
          disabled={loading}
          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-bold transition-colors"
        >
          إتمام الخدمة
        </button>
      )}

      {(booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN') && (
        <>
          <button
            onClick={() => setShowRescheduleModal(true)}
            disabled={loading}
            className="px-2 py-1 bg-[#FAF9F8] border border-[#9A8C83] text-[#54453D] hover:bg-[#E6DDD6] rounded-lg text-[11px] font-bold transition-colors"
          >
            تأجيل
          </button>
          <button
            onClick={() => handleStatusTransition('NO_SHOW')}
            disabled={loading}
            className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-[11px] font-bold transition-colors"
          >
            لم يحضر
          </button>
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={loading}
            className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-[11px] font-bold transition-colors"
          >
            إلغاء
          </button>
        </>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#54453D]/10 shadow-xl space-y-4 text-right">
            <h3 className="text-sm font-bold text-[#54453D]">إلغاء الحجز رقم {booking.bookingNumber}</h3>
            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
            <form onSubmit={handleCancelSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">سبب الإلغاء</label>
                <textarea
                  name="reason"
                  rows={2}
                  required
                  placeholder="اعتذار العميل، ظرف طارئ..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#9A8C83] bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-[#6B5B52]"
                >
                  تراجع
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
                >
                  تأكيد الإلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#54453D]/10 shadow-xl space-y-4 text-right">
            <h3 className="text-sm font-bold text-[#54453D]">تأجيل الموعد {booking.bookingNumber}</h3>
            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
            <form onSubmit={handleRescheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">التاريخ الجديد</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#9A8C83] bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">الوقت الجديد</label>
                <input
                  type="time"
                  name="time"
                  required
                  defaultValue="10:00"
                  step="900"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#9A8C83] bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">سبب التأجيل</label>
                <input
                  type="text"
                  name="reason"
                  placeholder="طلب العميل..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#9A8C83] bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-[#6B5B52]"
                >
                  تراجع
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-[#54453D] text-white rounded-xl text-xs font-bold hover:bg-[#54453D]/90"
                >
                  حفظ الموعد الجديد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

