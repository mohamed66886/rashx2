import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  CustomerRepository,
  BookingRepository,
  canViewCustomerNotes,
  canManageCustomers,
  type BookingDoc,
} from '@/lib/firebase-server';
import { utcIsoToRiyadhTime } from '@rashx/database';
import { CustomerDetailClient } from './customer-detail-client';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { customerId } = await params;
  const customerRepo = new CustomerRepository();
  const customer = await customerRepo.getCustomerById(
    {
      uid: session.user.uid,
      role: session.membership.role,
    },
    session.tenant.tenantId,
    customerId
  );

  if (!customer) {
    notFound();
  }

  const bookingRepo = new BookingRepository();
  const bookings = await bookingRepo.listBookings(
    {
      uid: session.user.uid,
      role: session.membership.role,
    },
    session.tenant.tenantId,
    { customerId, limit: 50 }
  );

  const canSeeNotes = canViewCustomerNotes(session.membership.role);
  const canManage = canManageCustomers(session.membership.role);

  const totalSpentSar = ((customer.bookingStatistics?.totalSpentHalalas || 0) / 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B5B52] mb-1">
            <Link href="/dashboard/customers" className="hover:underline">
              العملاء
            </Link>
            <span>/</span>
            <span className="font-bold text-[#54453D]">{customer.fullName}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#54453D]">{customer.fullName}</h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                customer.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {customer.status === 'ACTIVE' ? 'نشط' : 'مؤرشف'}
            </span>
          </div>
        </div>

        <Link
          href={`/dashboard/bookings/new?customerId=${customer.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 transition-all shadow-xs self-start sm:self-auto"
        >
          <span>📅</span> حجز موعد جديد لهذا العميل
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6] shadow-xs">
          <span className="text-xs text-[#6B5B52] block mb-1">إجمالي الحجوزات</span>
          <span className="text-lg font-bold text-[#54453D]">
            {customer.bookingStatistics?.totalBookings || 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6] shadow-xs">
          <span className="text-xs text-[#6B5B52] block mb-1">المكتملة بنجاح</span>
          <span className="text-lg font-bold text-emerald-600">
            {customer.bookingStatistics?.completedBookings || 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6] shadow-xs">
          <span className="text-xs text-[#6B5B52] block mb-1">عدم الحضور (No-Show)</span>
          <span className="text-lg font-bold text-amber-600">
            {customer.bookingStatistics?.noShowBookings || 0}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6] shadow-xs">
          <span className="text-xs text-[#6B5B52] block mb-1">إجمالي المبيعات</span>
          <span className="text-lg font-bold text-[#54453D]">
            {totalSpentSar} <span className="text-xs font-normal">ر.س</span>
          </span>
        </div>
      </div>

      {/* Profile Details & Form */}
      <CustomerDetailClient
        customer={customer}
        canManage={canManage}
        canSeeNotes={canSeeNotes}
      />

      {/* Booking History Section */}
      <div className="bg-white rounded-3xl border border-[#E6DDD6] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6DDD6] pb-3">
          <h2 className="text-base font-bold text-[#54453D] flex items-center gap-2">
            <span>📅</span> سجل المواعيد والحجوزات ({bookings.length})
          </h2>
        </div>

        {bookings.length === 0 ? (
          <div className="p-8 text-center text-[#6B5B52] text-xs space-y-2">
            <span className="text-3xl block">🗓️</span>
            <p className="font-bold text-[#54453D]">لا توجد حجوزات مسجلة لهذا العميل حتى الآن</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF9F8] text-[#6B5B52] font-bold border-b border-[#E6DDD6]">
                <tr>
                  <th className="px-4 py-3">رقم الحجز</th>
                  <th className="px-4 py-3">الخدمة</th>
                  <th className="px-4 py-3">مقدم الخدمة</th>
                  <th className="px-4 py-3">تاريخ ووقت الموعد</th>
                  <th className="px-4 py-3">السعر الإجمالي</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3 text-center">التفاصيل</th>
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
                      <td className="px-4 py-3.5 font-bold font-mono text-[#54453D]">
                        {b.bookingNumber}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-[#54453D]">
                        {b.serviceNameSnapshot.ar}
                      </td>

                      <td className="px-4 py-3.5 text-[#54453D]">
                        {b.providerNameAr}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-[#54453D] block">{date}</span>
                        <span className="text-[11px] text-[#6B5B52]" dir="ltr">{time}</span>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-[#54453D]">
                        {priceSar} ر.س
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <Link
                          href={`/dashboard/bookings/${b.id}`}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF9F8] border border-[#9A8C83] text-[#54453D] hover:bg-[#E6DDD6] font-semibold text-[11px] transition-colors"
                        >
                          عرض
                        </Link>
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

