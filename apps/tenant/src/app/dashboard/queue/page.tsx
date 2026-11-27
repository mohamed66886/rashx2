import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  ProviderRepository,
  QueueRepository,
  ResourceRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { getCurrentRiyadhDate } from '@rashx/database';
import { QueueClient } from './queue-client';

export const dynamic = 'force-dynamic';

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{
    branchId?: string;
    date?: string;
    providerId?: string;
  }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'queue.read')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">
          لا تملك صلاحية عرض طابور الانتظار والنداء في هذه المنشأة.
        </p>
      </div>
    );
  }

  const sp = await searchParams;
  const tenantId = session.tenant.tenantId;
  const date = sp.date || getCurrentRiyadhDate();

  const branchRepo = new BranchRepository();
  const allBranches = await branchRepo.listBranches(tenantId);
  const branches =
    actor.role !== 'OWNER' && actor.assignedBranchIds && actor.assignedBranchIds.length > 0
      ? allBranches.filter((b) => actor.assignedBranchIds!.includes(b.id))
      : allBranches;

  const branchId = sp.branchId || branches[0]?.id || '';
  const providerId = sp.providerId || undefined;

  const queueRepo = new QueueRepository();
  const providerRepo = new ProviderRepository();
  const resourceRepo = new ResourceRepository();

  const [entries, recentCalls, allProviders, resources] = await Promise.all([
    queueRepo.listQueueEntries(actor, tenantId, {
      branchId: branchId || undefined,
      date,
      providerId,
    }),
    queueRepo.listCallHistory(actor, tenantId, {
      branchId: branchId || undefined,
      date,
      limit: 20,
    }),
    providerRepo.listProviders(tenantId, { status: 'ACTIVE' }),
    resourceRepo.listResources(actor, tenantId, {
      branchId: branchId || undefined,
      status: 'ACTIVE',
    }),
  ]);

  const providers = branchId
    ? allProviders.filter((p) => p.assignedBranchIds.includes(branchId))
    : allProviders;

  const permissions = {
    canCall: hasPermission(actor.role, 'queue.call'),
    canManage: hasPermission(actor.role, 'queue.manage'),
    canReorder: hasPermission(actor.role, 'queue.reorder'),
    canStartService: hasPermission(actor.role, 'bookings.start_service'),
    canCompleteService: hasPermission(actor.role, 'bookings.complete_service'),
    canAssignResource: hasPermission(actor.role, 'resources.assign'),
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6] shadow-xs">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end text-xs">
          <div>
            <label className="block font-bold text-[#54453D] mb-1">الفرع</label>
            <select
              name="branchId"
              defaultValue={branchId}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

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
            <label className="block font-bold text-[#54453D] mb-1">المختص</label>
            <select
              name="providerId"
              defaultValue={providerId || ''}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
            >
              <option value="">كل المختصين</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayNameAr}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-[#54453D] text-white font-bold hover:bg-[#3f332d]"
          >
            عرض الطابور
          </button>
        </form>
      </div>

      <QueueClient
        branchId={branchId}
        date={date}
        branches={branches}
        providers={providers}
        resources={resources}
        entries={entries}
        recentCalls={recentCalls}
        permissions={permissions}
      />
    </div>
  );
}
