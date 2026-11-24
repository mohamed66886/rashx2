import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  EmployeeRepository,
  BranchRepository,
  ProviderRepository,
  CompensationRepository,
  canViewCompensation,
  canManageCompensation,
  canTerminateEmployee,
  hasPermission,
} from '@/lib/firebase-server';
import { CompensationCard } from './compensation-card';
import { EmployeeStatusControls } from './employee-status-controls';
import type { EmployeeStatus, EmploymentType } from '@rashx/database';

export const dynamic = 'force-dynamic';

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { employeeId } = await params;
  const { tenant, membership, user } = session;

  const employeeRepo = new EmployeeRepository();
  const branchRepo = new BranchRepository();
  const providerRepo = new ProviderRepository();

  let employee = null;
  try {
    employee = await employeeRepo.getEmployeeSafe(
      tenant.tenantId,
      employeeId,
      membership.role,
      user.uid
    );
  } catch (err) {
    // If unauthorized access
    redirect('/dashboard/employees');
  }

  const [branches] = await Promise.all([
    branchRepo.listBranches(tenant.tenantId),
  ]);

  if (!employee) {
    notFound();
  }

  const provider = await providerRepo.getProviderByEmployeeId(tenant.tenantId, employee.id);

  // Compensation evaluation (strictly gated by canViewCompensation)
  const canView = canViewCompensation(membership.role);
  const canManage = canManageCompensation(membership.role);
  const isOwner = canTerminateEmployee(membership.role);
  const canEditEmployee = hasPermission(membership.role, 'employees.update');

  let activeCompensation = null;
  let compensationHistory: any[] = [];

  if (canView) {
    const compRepo = new CompensationRepository();
    compensationHistory = await compRepo.listCompensationHistory(
      tenant.tenantId,
      employee.id,
      membership.role
    );
    activeCompensation = compensationHistory.find((c) => c.status === 'ACTIVE') || null;
  }

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

  const statusConfig = statusLabels[employee.employmentStatus];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#54453D]/60">
        <Link href="/dashboard/employees" className="hover:text-[#54453D]">
          الموظفون
        </Link>
        <span>/</span>
        <span className="text-[#54453D] font-bold">{employee.fullNameAr}</span>
      </div>

      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#54453D] text-white font-black text-2xl flex items-center justify-center shadow-xs">
            {employee.fullNameAr.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-[#54453D]">{employee.fullNameAr}</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.textCol} ${statusConfig.border}`}
              >
                {statusConfig.text}
              </span>
              {employee.isProvider && (
                <span className="bg-[#91B8C0]/20 text-[#2C4349] font-bold px-2.5 py-0.5 rounded-full text-xs border border-[#91B8C0]/30">
                  ✂️ مقدم خدمة
                </span>
              )}
            </div>
            <p className="text-xs text-[#54453D]/70 mt-1 flex items-center gap-2">
              <span className="font-mono font-bold">#{employee.employeeNumber}</span>
              {employee.fullNameEn && <span>• {employee.fullNameEn}</span>}
              <span>• {employee.jobTitle}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canEditEmployee && (
            <Link
              href={`/dashboard/employees/${employee.id}/edit`}
              className="px-4 py-2 rounded-xl border border-[#54453D]/20 text-xs font-bold text-[#54453D] hover:bg-[#54453D]/5 transition-all"
            >
              تعديل البيانات
            </Link>
          )}
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#54453D]/10 shadow-2xs">
        <EmployeeStatusControls
          employee={employee}
          isOwner={isOwner}
          canManage={canEditEmployee}
        />
      </div>

      {/* Grid: Details & Provider info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employment Information */}
        <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2">
            <span>📋</span> بيانات العمل والفروع
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#54453D]/60 block font-medium">القسم / الإدارة</span>
              <span className="font-bold text-[#54453D] block mt-0.5">
                {employee.department || 'عام'}
              </span>
            </div>

            <div>
              <span className="text-[#54453D]/60 block font-medium">نوع الدوام التعاقدي</span>
              <span className="font-bold text-[#54453D] block mt-0.5">
                {employmentTypeLabels[employee.employmentType]}
              </span>
            </div>

            <div>
              <span className="text-[#54453D]/60 block font-medium">تاريخ المباشرة / التعيين</span>
              <span className="font-mono font-bold text-[#54453D] block mt-0.5">
                {employee.hireDate}
              </span>
            </div>

            <div>
              <span className="text-[#54453D]/60 block font-medium">الفرع الأساسي</span>
              <span className="font-bold text-[#54453D] block mt-0.5">
                {branchMap.get(employee.primaryBranchId) || 'الفرع الأساسي'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#54453D]/10">
            <span className="text-[#54453D]/60 text-xs block font-medium mb-2">
              الفروع المصرح بالعمل بها:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {employee.assignedBranchIds.map((bId) => (
                <span
                  key={bId}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                    bId === employee.primaryBranchId
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-[#FAF9F8] text-[#54453D]/80 border-[#54453D]/10'
                  }`}
                >
                  {branchMap.get(bId) || bId}
                  {bId === employee.primaryBranchId && ' (أساسي)'}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-2 border-t border-[#54453D]/10 space-y-2 text-xs">
            <span className="text-[#54453D]/60 block font-medium">بيانات التواصل والهوية:</span>
            <div className="flex items-center gap-2">
              <span className="text-[#91B8C0]">📞</span>
              <span className="font-mono">{employee.phone || 'غير مسجل'}</span>
            </div>
            {employee.email && (
              <div className="flex items-center gap-2">
                <span className="text-[#91B8C0]">✉️</span>
                <span className="font-mono">{employee.email}</span>
              </div>
            )}
            {employee.nationalId && (
              <div className="flex items-center gap-2">
                <span className="text-[#91B8C0]">🪪</span>
                <span className="font-mono">هوية: {employee.nationalId}</span>
                {employee.nationalId.includes('*') && (
                  <span className="text-[10px] text-[#54453D]/40 font-bold bg-[#54453D]/5 px-1.5 py-0.5 rounded">
                    بيانات محمية
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Provider Profile Integration */}
        <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2">
            <span>✂️</span> ملف مقدم الخدمة (Service Provider)
          </h3>

          {provider ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#FAF9F8] rounded-2xl border border-[#54453D]/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#54453D]">
                    {provider.displayNameAr}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      provider.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {provider.status === 'ACTIVE' ? 'نشط بالجدول' : 'معطل'}
                  </span>
                </div>
                {provider.bioAr && (
                  <p className="text-[11px] text-[#54453D]/70">{provider.bioAr}</p>
                )}
                {provider.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {provider.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="text-[10px] bg-white border border-[#54453D]/10 px-2 py-0.5 rounded-lg text-[#54453D]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#54453D]/70">
                  الخدمات المسندة: {provider.assignedServiceIds.length} خدمة
                </span>
                <Link
                  href={`/dashboard/providers/${provider.id}`}
                  className="px-3 py-1.5 rounded-xl bg-[#91B8C0]/30 text-[#2C4349] font-bold text-xs hover:bg-[#91B8C0]/50 transition-all"
                >
                  إدارة جدول وخدمات مقدم الخدمة
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-[#FAF9F8] rounded-2xl border border-dashed border-[#54453D]/20 text-center space-y-3">
              <p className="text-xs text-[#54453D]/70 font-medium">
                الموظف غير مسجل حالياً كمقدم خدمة بالصالون.
              </p>
              {canEditEmployee && (
                <Link
                  href={`/dashboard/providers?registerEmployeeId=${employee.id}`}
                  className="inline-block px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 transition-all"
                >
                  إنشاء ملف مقدم خدمة لهذا الموظف
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compensation Confidential Card */}
      <CompensationCard
        employeeId={employee.id}
        canView={canView}
        canManage={canManage}
        activeCompensation={activeCompensation}
        compensationHistory={compensationHistory}
      />
    </div>
  );
}
