import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { AccountingRepository, BranchRepository } from '@/lib/firebase-server';
import { CostCentersManager } from './cost-centers-manager';

export const dynamic = 'force-dynamic';

export default async function CostCentersPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant } = session;
  const accRepo = new AccountingRepository();
  const branchRepo = new BranchRepository();

  const [costCenters, branches] = await Promise.all([
    accRepo.listCostCenters(tenant.tenantId),
    branchRepo.listBranches(tenant.tenantId),
  ]);

  return (
    <CostCentersManager
      costCenters={costCenters}
      branches={branches}
    />
  );
}
