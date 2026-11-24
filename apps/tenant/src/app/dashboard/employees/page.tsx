import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { EmployeeRepository, BranchRepository } from '@/lib/firebase-server';
import type { EmployeeStatus, EmploymentType } from '@rashx/database';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams?: Promise<{ branchId?: string; status?: string; search?: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership, user } = session;
  const resolvedParams = searchParams ? await searchParams : {};
  const branchId = resolvedParams.branchId || undefined;
  const status = resolvedParams.status as EmployeeStatus | undefined;
  const search = resolvedParams.search || undefined;

  const employeeRepo = new EmployeeRepository();
  const branchRepo = new BranchRepository();

  const [employeesResult, branches] = await Promise.all([
    employeeRepo.listEmployeesSafe(
      tenant.tenantId,
      {
        branchId,
        status,
        search,
        limit: 100,
      },
      membership.role,
      user.uid
    ),
    branchRepo.listBranches(tenant.tenantId),
  ]);

  const employees = employeesResult.employees;

  // Stats calculation
  const totalEmployees = employeesResult.total;
  const activeCount = employees.filter((e) => e.employmentStatus === 'ACTIVE').length;
  const providerCount = employees.filter((e) => e.isProvider).length;
  const terminatedCount = employees.filter((e) => e.employmentStatus === 'TERMINATED').length;

  const branchMap = new Map(branches.map((b) => [b.id, b.name]));

  const statusLabels: Record<EmployeeStatus, { text: string; bg: string; textCol: string; border: string }> = {
    ACTIVE: { text: 'نشط', bg: 'bg-emerald-50', textCol: 'text-emerald-800', border: 'border-emerald-200' },
    INACTIVE: { text: 'غير نشط', bg: 'bg-gray-50', textCol: 'text-gray-700', border: 'border-gray-200' },
    ON_LEAVE: { text: 'في إجازة', bg: 'bg-amber-50', textCol: 'text-amber-800', border: 'border-amber-200' },
    SUSPENDED: { text: 'موقوف مؤقتاً', bg: 'bg-orange-50', textCol: 'text-orange-800', border: 'border-orange-200' },
    TERMINATED: { text: 'منهي الخدمة', bg: 'bg-red-50', textCol: 'text-red-800', border: 'border-red-200' },
  };

  const employmentTypeLabels: Record<EmploymentType, string> = {
    FULL_TIME: 'دوام كامل',
    PART_TIME: 'دوام جزئي',
    CONTRACTOR: 'متعاقد',
    TRAINEE: 'متدرب',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>👥</span> سجل الموظفين وإدارة الكادر البشري
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            إدارة بيانات الموظفين، إسناد الفروع، ربط مقدمي الخدمات، ومتابعة الهياكل التعاقدية.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/employees/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 transition-all shadow-xs"
          >
            <span>➕</span> إضافة موظف جديد
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#54453D]/10 shadow-2xs">
          <p className="text-xs text-[#54453D]/60 font-medium">إجمالي الموظفين</p>
          <p className="text-xl font-black text-[#54453D] mt-1">{totalEmployees}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#54453D]/10 shadow-2xs">
          <p className="text-xs text-emerald-700 font-medium">على رأس العمل (نشط)</p>
          <p className="text-xl font-black text-emerald-800 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#54453D]/10 shadow-2xs">
          <p className="text-xs text-[#91B8C0] font-medium">مقدمو خدمات معتمدون</p>
          <p className="text-xl font-black text-[#2C4349] mt-1">{providerCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#54453D]/10 shadow-2xs">
          <p className="text-xs text-red-600 font-medium">خدمة منتهية / متوقف</p>
          <p className="text-xl font-black text-red-800 mt-1">{terminatedCount}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#54453D]/10 shadow-2xs flex flex-wrap items-center gap-3">
        <form method="GET" className="flex flex-wrap items-center gap-3 w-full">
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="بحث بالاسم أو الرقم الوظيفي..."
            className="text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-[#FAF9F8] min-w-[220px]"
          />
          <select
            name="branchId"
            defaultValue={branchId || ''}
            className="text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-[#FAF9F8]"
          >
            <option value="">جميع الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status || ''}
            className="text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-[#FAF9F8]"
          >
            <option value="">جميع الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="INACTIVE">غير نشط</option>
            <option value="ON_LEAVE">في إجازة</option>
            <option value="SUSPENDED">موقوف مؤقتاً</option>
            <option value="TERMINATED">منهي الخدمة</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-[#91B8C0]/30 text-[#2C4349] font-bold text-xs rounded-xl hover:bg-[#91B8C0]/50 transition-all"
          >
            تصفية
          </button>
          {(search || branchId || status) && (
            <Link
              href="/dashboard/employees"
              className="px-3 py-2 text-xs text-[#54453D]/60 hover:text-[#54453D]"
            >
              إعادة ضبط
            </Link>
          )}
        </form>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl border border-[#54453D]/10 shadow-2xs overflow-hidden">
        {employees.length === 0 ? (
          <div className="p-12 text-center text-[#54453D]/60">
            <span className="text-3xl block mb-2">📋</span>
            <p className="text-sm font-bold">لا يوجد موظفون مطابقون لشروط البحث</p>
            <p className="text-xs mt-1">ابدأ بإضافة موظف جديد لتسجيل الكادر البشري للصالون.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF9F8] border-b border-[#54453D]/10 text-[#54453D]/80 font-bold">
                <tr>
                  <th className="p-4">الموظف</th>
                  <th className="p-4">المسمى الوظيفي</th>
                  <th className="p-4">الفرع الأساسي</th>
                  <th className="p-4">نوع الدوام</th>
                  <th className="p-4">الصفة التشغيلية</th>
                  <th className="p-4">حالة العمل</th>
                  <th className="p-4">حساب المستخدم</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#54453D]/5">
                {employees.map((emp) => {
                  const statusConfig = statusLabels[emp.employmentStatus];
                  return (
                    <tr key={emp.id} className="hover:bg-[#FAF9F8]/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#54453D]/10 text-[#54453D] font-bold flex items-center justify-center text-xs">
                            {emp.fullNameAr.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#54453D]">{emp.fullNameAr}</p>
                            <p className="font-mono text-[10px] text-[#54453D]/60">
                              #{emp.employeeNumber} {emp.fullNameEn && `• ${emp.fullNameEn}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-[#54453D]">
                        {emp.jobTitle}
                        {emp.department && (
                          <span className="block text-[10px] text-[#54453D]/60">
                            {emp.department}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-medium text-[#54453D]/80">
                        {branchMap.get(emp.primaryBranchId) || 'الفرع الأساسي'}
                        {emp.assignedBranchIds.length > 1 && (
                          <span className="block text-[10px] text-[#91B8C0] font-bold">
                            + {emp.assignedBranchIds.length - 1} فروع أخرى
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-medium">
                        <span className="bg-[#FAF9F8] border border-[#54453D]/10 px-2 py-0.5 rounded-md text-[11px]">
                          {employmentTypeLabels[emp.employmentType]}
                        </span>
                      </td>
                      <td className="p-4">
                        {emp.isProvider ? (
                          <span className="inline-flex items-center gap-1 bg-[#91B8C0]/20 text-[#2C4349] font-bold px-2 py-0.5 rounded-full text-[10px] border border-[#91B8C0]/30">
                            <span>✂️</span> مقدم خدمة
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#54453D]/60">إداري / تشغيلي</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.textCol} ${statusConfig.border}`}
                        >
                          {statusConfig.text}
                        </span>
                      </td>
                      <td className="p-4">
                        {emp.linkedUid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <span>✓</span> مرتبط
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#54453D]/50">بدون حساب</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/dashboard/employees/${emp.id}`}
                            className="px-2.5 py-1 bg-[#FAF9F8] border border-[#54453D]/10 rounded-lg text-xs font-bold text-[#54453D] hover:bg-[#54453D] hover:text-white transition-all"
                          >
                            عرض الملف
                          </Link>
                          <Link
                            href={`/dashboard/employees/${emp.id}/edit`}
                            className="px-2 py-1 text-xs text-[#54453D]/70 hover:text-[#54453D]"
                          >
                            تعديل
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
