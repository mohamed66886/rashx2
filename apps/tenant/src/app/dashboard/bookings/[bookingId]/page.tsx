import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BookingRepository,
  BranchRepository,
  hasPermission,
  type BookingDoc,
} from '@/lib/firebase-server';
import { utcIsoToRiyadhTime } from '@rashx/database';
import { BookingRowActions } from '../booking-row-actions';
import { BookingResourceAssign } from './booking-resource-assign';

export const dynamic = 'force-dynamic';

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { bookingId } = await params;
  const tenantId = session.tenant.tenantId;
  const actor = await resolveOperationsActor(session);

  const bookingRepo = new BookingRepository();
  const booking = await bookingRepo.getBookingById(
    actor,
    tenantId,
    bookingId
  );

  if (!booking) {
    notFound();
  }

  const branchRepo = new BranchRepository();
  const branch = await branchRepo.getBranchById(tenantId, booking.branchId);

  const { date: startDate, time: startTime } = utcIsoToRiyadhTime(booking.scheduledStartTime);
  const { time: endTime } = utcIsoToRiyadhTime(booking.scheduledEndTime);

  const statusLabels: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'قيد التأكيد', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    CONFIRMED: { label: 'مؤكد', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    CHECKED_IN: { label: 'وصل للصالون', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    IN_SERVICE: { label: 'قيد الخدمة', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
    COMPLETED: { label: 'مكتمل', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'ملغي', cls: 'bg-red-50 text-red-700 border-red-200' },
    NO_SHOW: { label: 'لم يحضر', cls: 'bg-stone-100 text-stone-600 border-stone-200' },
  };
  const st = statusLabels[booking.status] || { label: booking.status, cls: 'bg-stone-100 text-stone-600 border-stone-200' };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B5B52] mb-1">
            <Link href="/dashboard/bookings" className="hover:underline">
              الحجوزات والمواعيد
            </Link>
            <span>/</span>
            <span className="font-bold text-[#54453D]">{booking.bookingNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#54453D]">حجز رقم {booking.bookingNumber}</h1>
            <span className={`inline-flex px-3 py-0.5 rounded-full text-xs font-bold border ${st.cls}`}>
              {st.label}
            </span>
          </div>
        </div>

        <BookingRowActions booking={booking} />
      </div>

      {/* Main Grid: Details & Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Time, Branch & Provider */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#54453D] border-b border-[#E6DDD6] pb-3 flex items-center gap-2">
              <span>📅</span> موعد الخدمة والموقع
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#6B5B52] block mb-1">تاريخ الموعد (توقيت الرياض):</span>
                <span className="font-bold text-sm text-[#54453D] font-mono">{startDate}</span>
              </div>

              <div>
                <span className="text-[#6B5B52] block mb-1">فترة الخدمة:</span>
                <span className="font-bold text-sm text-[#54453D] font-mono" dir="ltr">
                  {startTime} — {endTime}
                </span>
                <span className="text-[11px] text-[#6B5B52] block mt-0.5">
                  ({booking.serviceDurationMinutes} دقيقة تنفيذ + {booking.bufferBeforeMinutes} قَبْلي + {booking.bufferAfterMinutes} بَعْدي)
                </span>
              </div>

              <div>
                <span className="text-[#6B5B52] block mb-1">الفرع:</span>
                <span className="font-bold text-sm text-[#54453D]">
                  {branch ? branch.name : booking.branchId}
                </span>
                {branch && <span className="text-[#6B5B52] block text-[11px]">{branch.address}، {branch.city}</span>}
              </div>

              <div>
                <span className="text-[#6B5B52] block mb-1">مقدم الخدمة:</span>
                <span className="font-bold text-sm text-[#54453D]">
                  {booking.providerNameAr}
                </span>
              </div>

              <BookingResourceAssign
                bookingId={booking.id}
                branchId={booking.branchId}
                serviceId={booking.serviceId}
                scheduledStartTime={booking.scheduledStartTime}
                scheduledEndTime={booking.scheduledEndTime}
                currentResourceId={booking.resourceId}
                currentResourceNameAr={booking.resourceNameAr}
                canAssign={hasPermission(actor.role, 'resources.assign')}
                isEditableStatus={
                  booking.status === 'PENDING' ||
                  booking.status === 'CONFIRMED' ||
                  booking.status === 'CHECKED_IN' ||
                  booking.status === 'IN_SERVICE'
                }
              />
            </div>
          </div>

          {/* Card 2: Customer Details */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6DDD6] pb-3">
              <h2 className="text-sm font-bold text-[#54453D] flex items-center gap-2">
                <span>👤</span> بيانات العميل
              </h2>
              <Link
                href={`/dashboard/customers/${booking.customerId}`}
                className="text-xs font-bold text-[#54453D] hover:underline"
              >
                عرض سجل العميل الكامل ↗
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#6B5B52] block mb-1">اسم العميل:</span>
                <span className="font-bold text-sm text-[#54453D]">{booking.customerName}</span>
              </div>

              <div>
                <span className="text-[#6B5B52] block mb-1">رقم الجوال:</span>
                <span className="font-bold text-sm text-[#54453D] font-mono" dir="ltr">
                  {booking.customerPhone || 'زائر (بدون رقم)'}
                </span>
              </div>
            </div>

            {booking.customerNotes && (
              <div className="bg-[#FAF9F8] p-3 rounded-xl border border-[#E6DDD6] text-xs">
                <span className="font-bold text-[#54453D] block mb-1">ملاحظات العميل:</span>
                <p className="text-[#6B5B52] whitespace-pre-wrap">{booking.customerNotes}</p>
              </div>
            )}

            {booking.internalNotes && (
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 text-xs">
                <span className="font-bold text-[#54453D] block mb-1 flex items-center gap-1">
                  <span>🔒</span> ملاحظات داخلية (خاصة بالإدارة):
                </span>
                <p className="text-[#54453D] whitespace-pre-wrap">{booking.internalNotes}</p>
              </div>
            )}
          </div>

          {/* Card 3: Lifecycle History & Metadata */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#54453D] border-b border-[#E6DDD6] pb-3 flex items-center gap-2">
              <span>⏱️</span> سجل دورة حياة الحجز
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#FAF9F8]">
                <span className="text-[#6B5B52]">تاريخ إنشاء الحجز:</span>
                <span className="font-mono text-[#54453D]">{booking.createdAt}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#FAF9F8]">
                <span className="text-[#6B5B52]">قناة الحجز:</span>
                <span className="font-bold text-[#54453D]">
                  {booking.source === 'ONLINE_APP' ? 'تطبيق العميل أونلاين' : 'لوحة التحكم التشغيلية'}
                </span>
              </div>

              {booking.checkIn && (
                <div className="flex justify-between items-center py-1 border-b border-[#FAF9F8]">
                  <span className="text-[#6B5B52]">تسجيل الوصول للصالون:</span>
                  <span className="font-mono text-indigo-700 font-semibold">{booking.checkIn.checkedInAt}</span>
                </div>
              )}

              {booking.serviceExecution?.startedAt && (
                <div className="flex justify-between items-center py-1 border-b border-[#FAF9F8]">
                  <span className="text-[#6B5B52]">بدء تقديم الخدمة:</span>
                  <span className="font-mono text-purple-700 font-semibold">{booking.serviceExecution.startedAt}</span>
                </div>
              )}

              {booking.serviceExecution?.completedAt && (
                <div className="flex justify-between items-center py-1 border-b border-[#FAF9F8]">
                  <span className="text-[#6B5B52]">اكتمال تقديم الخدمة:</span>
                  <span className="font-mono text-emerald-700 font-semibold">{booking.serviceExecution.completedAt}</span>
                </div>
              )}

              {booking.cancellation && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-red-800 space-y-1">
                  <span className="font-bold block">بيانات الإلغاء:</span>
                  <p>تاريخ الإلغاء: <span className="font-mono">{booking.cancellation.cancelledAt}</span></p>
                  {booking.cancellation.reason && <p>السبب: {booking.cancellation.reason}</p>}
                </div>
              )}

              {booking.rescheduling && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-800 space-y-1">
                  <span className="font-bold block">بيانات إعادة الجدولة:</span>
                  <p>تم التأجيل في: <span className="font-mono">{booking.rescheduling.rescheduledAt}</span></p>
                  {booking.rescheduling.reason && <p>السبب: {booking.rescheduling.reason}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Breakdown Snapshot */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E6DDD6] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#54453D] border-b border-[#E6DDD6] pb-3">
              لقطة التسعير والضريبة المعتمدة
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-[#6B5B52]">
                <span>الخدمة:</span>
                <span className="font-bold text-[#54453D]">{booking.serviceNameSnapshot.ar}</span>
              </div>

              <div className="flex justify-between items-center text-[#6B5B52]">
                <span>السعر الصافي:</span>
                <span className="font-mono">
                  {(booking.priceSnapshot.netPriceHalalas / 100).toFixed(2)} ر.س
                </span>
              </div>

              <div className="flex justify-between items-center text-[#6B5B52]">
                <span>نسبة الضريبة (ZATCA):</span>
                <span>{(booking.priceSnapshot.taxRateBps / 100).toFixed(2)}%</span>
              </div>

              <div className="flex justify-between items-center text-[#6B5B52]">
                <span>مبلغ الضريبة المحسوب:</span>
                <span className="font-mono">
                  {(booking.priceSnapshot.calculatedTaxHalalas / 100).toFixed(2)} ر.س
                </span>
              </div>

              <div className="border-t border-[#E6DDD6] pt-3 flex justify-between items-center text-sm font-bold text-[#54453D]">
                <span>الإجمالي المستحق:</span>
                <span className="text-base font-bold text-[#54453D] font-mono">
                  {(booking.priceSnapshot.totalPriceHalalas / 100).toFixed(2)} ر.س
                </span>
              </div>
            </div>

            <div className="bg-[#FAF9F8] p-3 rounded-xl border border-[#E6DDD6] text-[11px] text-[#6B5B52] space-y-1">
              <span className="font-bold text-[#54453D] block">الأقفال الزمنية المحجوزة:</span>
              <p className="font-mono text-[10px] break-all">
                {booking.slotLockIds.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
