import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  BookingRepository,
  BranchRepository,
  ProviderRepository,
  type BookingDoc,
  type BookingStatus,
} from '@/lib/firebase-server';
import { utcIsoToRiyadhTime } from '@rashx/database';
import { BookingRowActions } from './booking-row-actions';

export const dynamic = 'force-dynamic';

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    branchId?: string;
    providerId?: string;
    status?: string;
  }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const sp = await searchParams;
  const dateFilter = sp.date || '';
  const branchFilter = sp.branchId || '';
  const providerFilter = sp.providerId || '';
  const statusFilter = (sp.status as BookingStatus) || undefined;

  const tenantId = session.tenant.tenantId;

  const branchRepo = new BranchRepository();
  const branches = await branchRepo.listBranches(tenantId);

  const providerRepo = new ProviderRepository();
  const providers = await providerRepo.listProviders(tenantId, { status: 'ACTIVE' });

  const bookingRepo = new BookingRepository();
  const bookings = await bookingRepo.listBookings(
    {
      uid: session.user.uid,
      role: session.membership.role,
    },
    tenantId,
    {
      date: dateFilter || undefined,
      branchId: branchFilter || undefined,
      providerId: providerFilter || undefined,
      status: statusFilter,
      limit: 100,
    }
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#54453D]">الحجوزات والمواعيد</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF9F8] border border-[#E6DDD6] text-xs font-semibold text-[#6B5B52]">
              {bookings.length} موعد
            </span>
          </div>
          <p className="text-xs text-[#6B5B52] mt-1">
            جدول المواعيد والخدمات، تسجيل وصول العملاء، وإدارة الفترات الزمنية المؤكدة.
          </p>
        </div>

        <Link
          href="/dashboard/bookings/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 transition-all shadow-xs self-start sm:self-auto"
        >
          <span>➕</span> حجز موعد جديد
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6] shadow-xs">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end text-xs">
          <div>
            <label className="block font-bold text-[#54453D] mb-1">التاريخ</label>
            <input
              type="date"
              name="date"
              defaultValue={dateFilter}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white font-mono text-xs focus:ring-2 focus:ring-[#F0C5AE]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#54453D] mb-1">الفرع</label>
            <select
              name="branchId"
              defaultValue={branchFilter}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white text-xs focus:ring-2 focus:ring-[#F0C5AE]"
            >
              <option value="">كافة الفروع</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#54453D] mb-1">مقدم الخدمة</label>
            <select
              name="providerId"
              defaultValue={providerFilter}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white text-xs focus:ring-2 focus:ring-[#F0C5AE]"
            >
              <option value="">كافة مقدمي الخدمات</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayNameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#54453D] mb-1">الحالة</label>
            <select
              name="status"
              defaultValue={statusFilter || ''}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white text-xs focus:ring-2 focus:ring-[#F0C5AE]"
            >
              <option value="">كافة الحالات</option>
              <option value="PENDING">قيد التأكيد</option>
              <option value="CONFIRMED">مؤكد</option>
              <option value="CHECKED_IN">وصل للصالون</option>
              <option value="IN_SERVICE">قيد الخدمة</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="CANCELLED">ملغي</option>
              <option value="NO_SHOW">لم يحضر</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-1.5 px-3 bg-[#54453D] text-white rounded-xl font-bold hover:bg-[#54453D]/90 text-xs transition-colors"
            >
              تصفية
            </button>
            {(dateFilter || branchFilter || providerFilter || statusFilter) && (
              <Link
                href="/dashboard/bookings"
                className="py-1.5 px-3 bg-[#FAF9F8] border border-[#9A8C83] text-[#54453D] hover:bg-[#E6DDD6] rounded-xl font-bold text-xs whitespace-nowrap"
              >
                إعادة ضبط
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-[#E6DDD6] shadow-xs overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <span className="text-4xl block">🗓️</span>
            <p className="text-sm font-bold text-[#54453D]">لا توجد حجوزات مطابقة لمعايير البحث</p>
            <p className="text-xs text-[#6B5B52]">
              يمكنك حجز موعد جديد أو تغيير خيارات التاريخ والفرع.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF9F8] text-[#6B5B52] font-bold border-b border-[#E6DDD6]">
                <tr>
                  <th className="px-5 py-3.5">رقم الحجز</th>
                  <th className="px-5 py-3.5">العميل</th>
                  <th className="px-5 py-3.5">الخدمة المطلوبة</th>
                  <th className="px-5 py-3.5">مقدم الخدمة</th>
                  <th className="px-5 py-3.5">التاريخ والوقت</th>
                  <th className="px-5 py-3.5">الإجمالي</th>
                  <th className="px-5 py-3.5">الحالة</th>
                  <th className="px-5 py-3.5 text-center">إجراءات الموعد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDD6]">
                {bookings.map((b: BookingDoc) => {
                  const { date, time } = utcIsoToRiyadhTime(b.scheduledStartTime);
                  const priceSar = (b.priceSnapshot.totalPriceHalalas / 100).toFixed(2);

                  const statusLabels: Record<string, { label: string; cls: string }> = {
                    PENDING: { label: 'قيد التأكيد', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
                    CONFIRMED: { label: 'مؤكد', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
                    CHECKED_IN: { label: 'وصل للصالون', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                    IN_SERVICE: { label: 'قيد الخدمة', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
                    COMPLETED: { label: 'مكتمل', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    CANCELLED: { label: 'ملغي', cls: 'bg-red-50 text-red-700 border-red-200' },
                    NO_SHOW: { label: 'لم يحضر', cls: 'bg-stone-100 text-stone-600 border-stone-200' },
                  };

                  const st = statusLabels[b.status] || { label: b.status, cls: 'bg-stone-100 text-stone-600' };

                  return (
                    <tr key={b.id} className="hover:bg-[#FAF9F8]/60 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-[#54453D]">
                        <Link href={`/dashboard/bookings/${b.id}`} className="hover:underline">
                          {b.bookingNumber}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/customers/${b.customerId}`}
                          className="font-bold text-[#54453D] hover:underline block"
                        >
                          {b.customerName}
                        </Link>
                        <span className="text-[11px] text-[#6B5B52] font-mono" dir="ltr">
                          {b.customerPhone}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-[#54453D] block">{b.serviceNameSnapshot.ar}</span>
                        <span className="text-[11px] text-[#6B5B52]">{b.serviceDurationMinutes} دقيقة</span>
                      </td>

                      <td className="px-5 py-4 text-[#54453D] font-medium">
                        {b.providerNameAr}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-[#54453D] block font-mono">{date}</span>
                        <span className="text-[11px] text-[#6B5B52] font-mono" dir="ltr">{time}</span>
                      </td>

                      <td className="px-5 py-4 font-bold text-[#54453D]">
                        {priceSar} ر.س
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <BookingRowActions booking={b} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
