import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { ProviderRepository, EmployeeRepository } from '@/lib/firebase-server';
import { ProviderDetailForm } from './provider-detail-form';

export const dynamic = 'force-dynamic';

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { providerId } = await params;
  const { tenant } = session;

  const providerRepo = new ProviderRepository();
  const employeeRepo = new EmployeeRepository();

  const provider = await providerRepo.getProviderById(tenant.tenantId, providerId);
  if (!provider) {
    notFound();
  }

  const employee = await employeeRepo.getEmployeeByIdSafe(
    tenant.tenantId,
    provider.employeeId,
    session.membership.role,
    session.user.uid
  );
  if (!employee) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#54453D]/60 mb-1">
            <Link href="/dashboard/providers" className="hover:text-[#54453D]">
              مقدمو الخدمات
            </Link>
            <span>/</span>
            <span className="text-[#54453D] font-bold">{provider.displayNameAr}</span>
          </div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>✂️</span> ملف مقدم الخدمة: {provider.displayNameAr}
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-0.5">
            مرتبط بالموظف: {employee.fullNameAr} (#{employee.employeeNumber}) — {employee.jobTitle}
          </p>
        </div>

        <Link
          href={`/dashboard/employees/${employee.id}`}
          className="px-3 py-1.5 rounded-xl border border-[#54453D]/20 text-xs font-bold text-[#54453D] hover:bg-[#54453D]/5"
        >
          عرض سجل الموظف 👤
        </Link>
      </div>

      <ProviderDetailForm provider={provider} employee={employee} />
    </div>
  );
}

