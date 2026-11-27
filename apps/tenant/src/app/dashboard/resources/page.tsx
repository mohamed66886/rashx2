import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession, resolveOperationsActor } from '@/lib/tenant-auth';
import {
  BranchRepository,
  ResourceRepository,
  ServiceRepository,
  ServiceCategoryRepository,
  canManageResources,
  hasPermission,
  type ResourceStatus,
  type ResourceType,
} from '@/lib/firebase-server';
import { RESOURCE_TYPE_LABELS_AR, RESOURCE_STATUS_LABELS_AR } from '@rashx/database';
import { ResourcesClient } from './resources-client';

export const dynamic = 'force-dynamic';

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{
    branchId?: string;
    status?: string;
    type?: string;
  }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const actor = await resolveOperationsActor(session);
  if (!hasPermission(actor.role, 'resources.read')) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-red-200 text-center space-y-2">
        <h1 className="text-lg font-bold text-red-800">غير مصرح بالوصول</h1>
        <p className="text-xs text-[#6B5B52]">
          لا تملك صلاحية عرض الموارد والكراسي التشغيلية في هذه المنشأة.
        </p>
      </div>
    );
  }

  const sp = await searchParams;
  const branchFilter = sp.branchId || '';
  const statusFilter = (sp.status as ResourceStatus) || undefined;
  const typeFilter = (sp.type as ResourceType) || undefined;

  const tenantId = session.tenant.tenantId;
  const branchRepo = new BranchRepository();
  const resourceRepo = new ResourceRepository();
  const serviceRepo = new ServiceRepository();
  const categoryRepo = new ServiceCategoryRepository();

  const [allBranches, resources, services, categories] = await Promise.all([
    branchRepo.listBranches(tenantId),
    resourceRepo.listResources(actor, tenantId, {
      branchId: branchFilter || undefined,
      status: statusFilter,
      type: typeFilter,
    }),
    serviceRepo.listServices(tenantId, { isActive: true }),
    categoryRepo.listCategories(tenantId),
  ]);

  const branches =
    actor.role !== 'OWNER' && actor.assignedBranchIds && actor.assignedBranchIds.length > 0
      ? allBranches.filter((b) => actor.assignedBranchIds!.includes(b.id))
      : allBranches;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6] shadow-xs">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end text-xs">
          <div>
            <label className="block font-bold text-[#54453D] mb-1">الفرع</label>
            <select
              name="branchId"
              defaultValue={branchFilter}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
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
            <label className="block font-bold text-[#54453D] mb-1">نوع المورد</label>
            <select
              name="type"
              defaultValue={typeFilter || ''}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
            >
              <option value="">كافة الأنواع</option>
              {(Object.keys(RESOURCE_TYPE_LABELS_AR) as ResourceType[]).map((t) => (
                <option key={t} value={t}>
                  {RESOURCE_TYPE_LABELS_AR[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#54453D] mb-1">الحالة</label>
            <select
              name="status"
              defaultValue={statusFilter || ''}
              className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white"
            >
              <option value="">كافة الحالات</option>
              {(Object.keys(RESOURCE_STATUS_LABELS_AR) as ResourceStatus[]).map((s) => (
                <option key={s} value={s}>
                  {RESOURCE_STATUS_LABELS_AR[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-1.5 px-4 rounded-xl bg-[#54453D] text-white font-bold hover:bg-[#54453D]/90 cursor-pointer"
            >
              تصفية
            </button>
          </div>
        </form>
      </div>

      <ResourcesClient
        initialResources={resources}
        branches={branches}
        services={services}
        categories={categories}
        canManage={canManageResources(actor.role)}
        selectedBranchId={branchFilter || branches[0]?.id || ''}
      />
    </div>
  );
}

