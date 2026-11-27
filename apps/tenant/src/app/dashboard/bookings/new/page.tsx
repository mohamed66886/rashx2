import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  BranchRepository,
  ServiceRepository,
  ProviderRepository,
  CustomerRepository,
} from '@/lib/firebase-server';
import { NewBookingClient } from './new-booking-client';

export const dynamic = 'force-dynamic';

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { customerId } = await searchParams;
  const tenantId = session.tenant.tenantId;

  const branchRepo = new BranchRepository();
  const branches = await branchRepo.listBranches(tenantId);
  const activeBranches = branches.filter((b) => b.isActive);

  const serviceRepo = new ServiceRepository();
  const services = await serviceRepo.listServices(tenantId, { isActive: true });
  const activeServices = services.filter((s) => s.isActive);

  const providerRepo = new ProviderRepository();
  const providers = await providerRepo.listProviders(tenantId, { status: 'ACTIVE' });

  const customerRepo = new CustomerRepository();
  const { customers } = await customerRepo.listCustomers(
    {
      uid: session.user.uid,
      role: session.membership.role,
    },
    tenantId,
    { status: 'ACTIVE', limit: 200 }
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#6B5B52] mb-1">
          <Link href="/dashboard/bookings" className="hover:underline">
            الحجوزات والمواعيد
          </Link>
          <span>/</span>
          <span className="font-bold text-[#54453D]">حجز موعد جديد</span>
        </div>
        <h1 className="text-xl font-bold text-[#54453D]">إنشاء حجز موعد جديد</h1>
        <p className="text-xs text-[#6B5B52] mt-1">
          حجز موعد تشغيلي ذري، حساب التوافر اللحظي لمقدمي الخدمات، وإقفال الفترات الزمنية.
        </p>
      </div>

      <NewBookingClient
        branches={activeBranches}
        services={activeServices}
        providers={providers}
        customers={customers}
        initialCustomerId={customerId}
      />
    </div>
  );
}
