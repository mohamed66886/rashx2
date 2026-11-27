import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BookingRepository,
  BranchRepository,
  PosRepository,
  PosSessionRepository,
  ServiceRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { PosClient } from './pos-client';

export const dynamic = 'force-dynamic';

export default async function PosPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string; branchId?: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'pos.access')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">
          لا تملك صلاحية الوصول إلى نقطة البيع (POS) في هذه المنشأة.
        </p>
      </div>
    );
  }

  const sp = await searchParams;
  const tenantId = session.tenant.tenantId;

  const branchRepo = new BranchRepository();
  const serviceRepo = new ServiceRepository();
  const posSessionRepo = new PosSessionRepository();
  const bookingRepo = new BookingRepository();
  const posRepo = new PosRepository();

  const [allBranches, services, openSessions, paymentMethods, recentBookings] = await Promise.all([
    branchRepo.listBranches(tenantId),
    serviceRepo.listServices(tenantId, { isActive: true }),
    posSessionRepo.listSessions(actor, tenantId, { status: 'OPEN', limit: 20 }),
    posSessionRepo.listPaymentMethodConfigs(actor, tenantId),
    bookingRepo.listBookings(actor, tenantId, { limit: 60 }),
  ]);

  const branches =
    actor.role !== 'OWNER' && actor.assignedBranchIds && actor.assignedBranchIds.length > 0
      ? allBranches.filter((b) => actor.assignedBranchIds!.includes(b.id))
      : allBranches;

  const candidateBookings = recentBookings.filter(
    (b) =>
      b.status === 'CONFIRMED' ||
      b.status === 'CHECKED_IN' ||
      b.status === 'IN_SERVICE' ||
      b.status === 'COMPLETED'
  );

  // Filter out already billed bookings
  const billedChecks = await Promise.all(
    candidateBookings.map((b) => posRepo.isBookingBilled(tenantId, b.id))
  );
  const eligibleBookings = candidateBookings.filter((_, idx) => !billedChecks[idx]);

  return (
    <PosClient
      branches={branches}
      services={services}
      activeSessions={openSessions}
      paymentMethods={paymentMethods}
      eligibleBookings={eligibleBookings}
      initialBookingId={sp.bookingId}
      initialBranchId={sp.branchId}
      canApplyDiscount={hasPermission(actor.role, 'discounts.apply')}
      canOverrideDiscount={hasPermission(actor.role, 'discounts.override')}
      canOpenSession={hasPermission(actor.role, 'pos_sessions.open')}
    />
  );
}

