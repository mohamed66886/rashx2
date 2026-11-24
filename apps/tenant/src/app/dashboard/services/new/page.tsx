import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  ServiceCategoryRepository,
  BranchRepository,
  ProviderRepository,
  CommissionPolicyRepository,
  hasPermission,
  canManageServiceCommission,
} from '@/lib/firebase-server';
import { NewServiceForm } from './new-service-form';

export const dynamic = 'force-dynamic';

export default async function NewServicePage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership } = session;
  const canCreate = hasPermission(membership.role, 'services.create');
  if (!canCreate) {
    redirect('/dashboard/services');
  }

  const categoryRepo = new ServiceCategoryRepository();
  const branchRepo = new BranchRepository();
  const providerRepo = new ProviderRepository();
  const commissionRepo = new CommissionPolicyRepository();

  const [categories, branches, providers, commissionPolicies] = await Promise.all([
    categoryRepo.listCategories(tenant.tenantId, { isActive: true }),
    branchRepo.listBranches(tenant.tenantId),
    providerRepo.listProviders(tenant.tenantId, { status: 'ACTIVE' }),
    commissionRepo.listPolicies(tenant.tenantId, { isActive: true }),
  ]);

  const canManageCommission = canManageServiceCommission(membership.role);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>➕</span> إضافة خدمة جديدة
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            أدخل تفاصيل الخدمة، التسعير، مدة الحجز، تعيين مقدمي الخدمة والفروع.
          </p>
        </div>
        <Link
          href="/dashboard/services"
          className="text-xs font-bold text-[#54453D]/70 hover:text-[#54453D] px-3 py-1.5 rounded-xl border border-[#54453D]/10 hover:bg-[#54453D]/5 transition-all"
        >
          رجوع للقائمة
        </Link>
      </div>

      <NewServiceForm
        categories={categories}
        branches={branches.map((b) => ({ id: b.id, name: b.name, isMain: b.isMain }))}
        providers={providers}
        commissionPolicies={commissionPolicies}
        canManageCommission={canManageCommission}
      />
    </div>
  );
}

