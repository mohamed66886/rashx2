import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  DailyOperationsService,
  ProviderRepository,
  ResourceRepository,
  ServiceRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { getCurrentRiyadhDate } from '@rashx/database';
import { CalendarClient } from './calendar-client';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'calendar.read')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">
          لا تملك صلاحية عرض تقويم المواعيد في هذه المنشأة.
        </p>
      </div>
    );
  }

  const tenantId = session.tenant.tenantId;
  const today = getCurrentRiyadhDate();

  const branchRepo = new BranchRepository();
  const providerRepo = new ProviderRepository();
  const resourceRepo = new ResourceRepository();
  const serviceRepo = new ServiceRepository();
  const ops = new DailyOperationsService();

  const [allBranches, providers, resources, services, calendarRes] = await Promise.all([
    branchRepo.listBranches(tenantId),
    providerRepo.listProviders(tenantId, { status: 'ACTIVE' }),
    resourceRepo.listResources(actor, tenantId, {}),
    serviceRepo.listServices(tenantId, { isActive: true }),
    ops.getCalendarSchedule(actor, tenantId, {
      startDate: today,
      endDate: today,
      limit: 120,
    }),
  ]);

  const branches =
    actor.role !== 'OWNER' && actor.assignedBranchIds && actor.assignedBranchIds.length > 0
      ? allBranches.filter((b) => actor.assignedBranchIds!.includes(b.id))
      : allBranches;

  const canReschedule = hasPermission(actor.role, 'bookings.reschedule');

  return (
    <CalendarClient
      initialStartDate={today}
      initialEndDate={today}
      initialBookings={calendarRes.bookings}
      initialWarnings={calendarRes.warnings}
      initialNextCursor={calendarRes.nextCursorStartTimeIso}
      initialHasMore={calendarRes.hasMore}
      branches={branches}
      providers={providers}
      resources={resources}
      services={services}
      canReschedule={canReschedule}
    />
  );
}
