import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  ServiceRepository,
  ServiceCategoryRepository,
  BranchRepository,
  ProviderRepository,
  CommissionPolicyRepository,
  hasPermission,
  canManageServiceCommission,
} from '@/lib/firebase-server';
import { EditServiceForm } from './edit-service-form';

export const dynamic = 'force-dynamic';

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership } = session;
  const canManage = hasPermission(membership.role, 'services.update');
  if (!canManage) {
    redirect('/dashboard/services');
  }

  const resolvedParams = await params;
  const serviceId = resolvedParams.serviceId;

  const serviceRepo = new ServiceRepository();
  const categoryRepo = new ServiceCategoryRepository();
  const branchRepo = new BranchRepository();
  const providerRepo = new ProviderRepository();
  const commissionRepo = new CommissionPolicyRepository();

  const [service, categories, branches, providers, commissionPolicies] = await Promise.all([
    serviceRepo.getServiceById(tenant.tenantId, serviceId),
    categoryRepo.listCategories(tenant.tenantId),
    branchRepo.listBranches(tenant.tenantId),
    providerRepo.listProviders(tenant.tenantId, { status: 'ACTIVE' }),
    commissionRepo.listPolicies(tenant.tenantId, { isActive: true }),
  ]);

  if (!service) {
    notFound();
  }

  const canManageCommission = canManageServiceCommission(membership.role);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>✏️</span> تعديل بيانات الخدمة
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            تعديل الخدمة: {service.nameAr}
          </p>
        </div>
        <Link
          href={`/dashboard/services/${service.id}`}
          className="text-xs font-bold text-[#54453D]/70 hover:text-[#54453D] px-3.5 py-2 rounded-xl border border-[#54453D]/10 hover:bg-[#54453D]/5 transition-all"
        >
          رجوع لتفاصيل الخدمة
        </Link>
      </div>

      <EditServiceForm
        service={service}
        categories={categories}
        branches={branches.map((b) => ({ id: b.id, name: b.name, isMain: b.isMain }))}
        providers={providers}
        commissionPolicies={commissionPolicies}
        canManageCommission={canManageCommission}
      />
    </div>
  );
}

