import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { EmployeeRepository, BranchRepository, hasPermission } from '@/lib/firebase-server';
import { EditEmployeeForm } from './edit-employee-form';

export const dynamic = 'force-dynamic';

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  if (!hasPermission(session.membership.role, 'employees.update')) {
    redirect('/dashboard/employees');
  }

  const { employeeId } = await params;
  const employeeRepo = new EmployeeRepository();
  const branchRepo = new BranchRepository();

  const [employee, branches] = await Promise.all([
    employeeRepo.getEmployeeByIdSafe(
      session.tenant.tenantId,
      employeeId,
      session.membership.role,
      session.user.uid
    ),
    branchRepo.listBranches(session.tenant.tenantId),
  ]);

  if (!employee) {
    notFound();
  }

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
            <Link href={`/dashboard/employees/${employee.id}`} className="hover:text-[#54453D]">
              {employee.fullNameAr}
            </Link>
            <span>/</span>
            <span>تعديل البيانات</span>
          </div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>✏️</span> تعديل بيانات الموظف
          </h2>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <EditEmployeeForm employee={employee} branches={branches} />
      </div>
    </div>
  );
}

