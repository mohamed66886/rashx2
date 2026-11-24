import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { BranchRepository, hasPermission } from '@/lib/firebase-server';
import { NewEmployeeForm } from './new-employee-form';

export const dynamic = 'force-dynamic';

export default async function NewEmployeePage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  if (!hasPermission(session.membership.role, 'employees.create')) {
    redirect('/dashboard/employees');
  }

  const branchRepo = new BranchRepository();
  const branches = await branchRepo.listBranches(session.tenant.tenantId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#54453D]/60 mb-1">
            <Link href="/dashboard/employees" className="hover:text-[#54453D]">
              الموظفون
            </Link>
            <span>/</span>
            <span>إضافة موظف جديد</span>
          </div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>➕</span> تسجيل موظف جديد بالمنشأة
          </h2>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <NewEmployeeForm branches={branches} />
      </div>
    </div>
  );
}

