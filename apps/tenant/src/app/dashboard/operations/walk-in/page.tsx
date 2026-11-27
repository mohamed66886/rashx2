import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  ProviderRepository,
  ServiceRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { getCurrentRiyadhDate } from '@rashx/database';
import { WalkInClient } from './walk-in-client';

export const dynamic = 'force-dynamic';

export default async function WalkInPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'walkins.manage')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">
          لا تملك صلاحية تسجيل العملاء الفوريين (Walk-in) في هذه المنشأة.
        </p>
      </div>
    );
  }

  const tenantId = session.tenant.tenantId;
  const branchRepo = new BranchRepository();
  const serviceRepo = new ServiceRepository();
  const providerRepo = new ProviderRepository();

  const [allBranches, services, providers] = await Promise.all([
    branchRepo.listBranches(tenantId),
    serviceRepo.listServices(tenantId, { isActive: true }),
    providerRepo.listProviders(tenantId, { status: 'ACTIVE' }),
  ]);

  const branches =
    actor.role !== 'OWNER' && actor.assignedBranchIds && actor.assignedBranchIds.length > 0
      ? allBranches.filter((b) => actor.assignedBranchIds!.includes(b.id))
      : allBranches;

  const canPrioritize = hasPermission(actor.role, 'queue.reorder');

  return (
    <div className="space-y-4">
      <WalkInClient
        branches={branches}
        services={services}
        providers={providers}
        initialDate={getCurrentRiyadhDate()}
        canPrioritize={canPrioritize}
      />
    </div>
  );
}
