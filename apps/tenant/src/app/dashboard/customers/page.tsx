import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { CustomerRepository, type CustomerDoc } from '@/lib/firebase-server';
import { CreateCustomerModal } from './create-customer-modal';

export const dynamic = 'force-dynamic';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const sp = await searchParams;
  const search = sp.search || '';
  const statusFilter = sp.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE';

  const customerRepo = new CustomerRepository();
  const { customers, totalCount } = await customerRepo.listCustomers(
    {
      uid: session.user.uid,
      role: session.membership.role,
    },
    session.tenant.tenantId,
    {
      search,
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
            <h1 className="text-xl font-bold text-[#54453D]">سجل العملاء</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF9F8] border border-[#E6DDD6] text-xs font-semibold text-[#6B5B52]">
              {totalCount} عميل
            </span>
          </div>
          <p className="text-xs text-[#6B5B52] mt-1">
            إدارة بيانات العملاء، أرقام التواصل الموحدة، وسجل المواعيد والإنفاق.
          </p>
        </div>

        <CreateCustomerModal />
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6] shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <form method="GET" className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="بحث بالاسم أو رقم الجوال..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
          />
          {statusFilter === 'ARCHIVED' && (
            <input type="hidden" name="status" value="ARCHIVED" />
          )}
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold bg-[#FAF9F8] border border-[#9A8C83] text-[#54453D] rounded-xl hover:bg-[#E6DDD6] transition-colors"
          >
            بحث
          </button>
          {search && (
            <Link
              href={statusFilter === 'ARCHIVED' ? '/dashboard/customers?status=ARCHIVED' : '/dashboard/customers'}
              className="text-xs text-[#6B5B52] hover:text-[#54453D] whitespace-nowrap"
            >
              إلغاء البحث
            </Link>
          )}
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href={search ? `/dashboard/customers?search=${encodeURIComponent(search)}` : '/dashboard/customers'}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-[#54453D] text-white'
                : 'bg-[#FAF9F8] text-[#6B5B52] hover:bg-[#E6DDD6]'
            }`}
          >
            النشطون
          </Link>
          <Link
            href={search ? `/dashboard/customers?search=${encodeURIComponent(search)}&status=ARCHIVED` : '/dashboard/customers?status=ARCHIVED'}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              statusFilter === 'ARCHIVED'
                ? 'bg-[#54453D] text-white'
                : 'bg-[#FAF9F8] text-[#6B5B52] hover:bg-[#E6DDD6]'
            }`}
          >
            المؤرشفون
          </Link>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-3xl border border-[#E6DDD6] shadow-xs overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <span className="text-4xl block">👥</span>
            <p className="text-sm font-bold text-[#54453D]">لا يوجد عملاء مطابقين للبحث</p>
            <p className="text-xs text-[#6B5B52]">
              يمكنك إضافة عميل جديد باستخدام الزر بالأعلى، أو تعديل خيارات البحث.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF9F8] text-[#6B5B52] font-bold border-b border-[#E6DDD6]">
                <tr>
                  <th className="px-6 py-3.5">العميل</th>
                  <th className="px-6 py-3.5">رقم الجوال</th>
                  <th className="px-6 py-3.5">البريد الإلكتروني</th>
                  <th className="px-6 py-3.5">التصنيف</th>
                  <th className="px-6 py-3.5">إجمالي الحجوزات</th>
                  <th className="px-6 py-3.5">الإنفاق</th>
                  <th className="px-6 py-3.5">الحالة</th>
                  <th className="px-6 py-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDD6]">
                {customers.map((c: CustomerDoc) => {
                  const spentSar = ((c.bookingStatistics?.totalSpentHalalas || 0) / 100).toFixed(2);
                  return (
                    <tr key={c.id} className="hover:bg-[#FAF9F8]/60 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/customers/${c.id}`}
                          className="font-bold text-[#54453D] hover:underline flex items-center gap-2"
                        >
                          <span className="w-7 h-7 rounded-full bg-[#F0C5AE]/40 flex items-center justify-center font-bold text-[#54453D] text-[11px]">
                            {c.fullName.slice(0, 1)}
                          </span>
                          <span>{c.fullName}</span>
                        </Link>
                      </td>

                      <td className="px-6 py-4 font-mono" dir="ltr">
                        {c.normalizedPhone}
                      </td>

                      <td className="px-6 py-4 text-[#6B5B52]" dir="ltr">
                        {c.email || '—'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {c.tags && c.tags.length > 0 ? (
                            c.tags.slice(0, 2).map((t, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-[#FAF9F8] border border-[#E6DDD6] text-[10px] text-[#6B5B52]"
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#6B5B52]">—</span>
                          )}
                          {c.tags && c.tags.length > 2 && (
                            <span className="text-[10px] text-[#6B5B52]">+{c.tags.length - 2}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-[#54453D]">
                        {c.bookingStatistics?.totalBookings || 0} موعد
                      </td>

                      <td className="px-6 py-4 font-bold text-[#54453D]">
                        {spentSar} ر.س
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {c.status === 'ACTIVE' ? 'نشط' : 'مؤرشف'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/dashboard/customers/${c.id}`}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF9F8] border border-[#9A8C83] text-[#54453D] hover:bg-[#E6DDD6] font-semibold text-xs transition-colors"
                        >
                          عرض الملف
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

