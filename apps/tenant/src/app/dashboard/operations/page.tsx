import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  DailyOperationsService,
  hasPermission,
  type BookingStatus,
} from '@/lib/firebase-server';
import { getCurrentRiyadhDate } from '@rashx/database';
import { OperationsClient } from './operations-client';

export const dynamic = 'force-dynamic';

export default async function DailyOperationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    branchId?: string;
    providerId?: string;
    serviceId?: string;
    status?: string;
  }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'operations.read')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">
          لا تملك صلاحية عرض لوحة التشغيل اليومي في هذه المنشأة.
        </p>
      </div>
    );
  }

  const sp = await searchParams;
  const date = sp.date || getCurrentRiyadhDate();
  const branchId = sp.branchId || undefined;
  const providerId = sp.providerId || undefined;
  const serviceId = sp.serviceId || undefined;
  const status = (sp.status as BookingStatus) || undefined;

  const ops = new DailyOperationsService();
  const snapshot = await ops.getDailyOperationsSnapshot(actor, session.tenant.tenantId, {
    date,
    branchId,
    providerId,
    serviceId,
    status,
  });

  const permissions = {
    canWalkIn: hasPermission(actor.role, 'walkins.manage'),
    canManageQueue: hasPermission(actor.role, 'queue.manage'),
    canStartService: hasPermission(actor.role, 'bookings.start_service'),
    canCompleteService: hasPermission(actor.role, 'bookings.complete_service'),
    canMarkNoShow: hasPermission(actor.role, 'bookings.mark_no_show'),
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6] shadow-xs">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end text-xs">
          <div>
            <label className="block font-bold text-[#54453D] mb-1">التاريخ</label>
            <input
              type="date"
              name="date"
              defaultValue={date}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-[#54453D] mb-1">الفرع</label>
            <select
              name="branchId"
              defaultValue={branchId || ''}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
            >
              <option value="">كل الفروع المتاحة</option>
              {snapshot.branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#54453D] mb-1">المختص</label>
            <select
              name="providerId"
              defaultValue={providerId || ''}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
            >
              <option value="">كل المختصين</option>
              {snapshot.providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayNameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#54453D] mb-1">الخدمة</label>
            <select
              name="serviceId"
              defaultValue={serviceId || ''}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
            >
              <option value="">كل الخدمات</option>
              {snapshot.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#54453D] mb-1">الحالة</label>
            <select
              name="status"
              defaultValue={status || ''}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
            >
              <option value="">كل الحالات</option>
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
              className="flex-1 px-4 py-1.5 rounded-xl bg-[#54453D] text-white font-bold hover:bg-[#3f332d]"
            >
              تطبيق
            </button>
          </div>
        </form>
      </div>

      <OperationsClient snapshot={snapshot} permissions={permissions} />
    </div>
  );
}
