import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { ProviderRepository, EmployeeRepository, hasPermission } from '@/lib/firebase-server';
import { RegisterProviderModal } from './register-provider-modal';

export const dynamic = 'force-dynamic';

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams?: Promise<{ registerEmployeeId?: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership } = session;
  const resolvedParams = searchParams ? await searchParams : {};
  const registerEmployeeId = resolvedParams.registerEmployeeId;

  const providerRepo = new ProviderRepository();
  const employeeRepo = new EmployeeRepository();

  const [providers, employeesRes] = await Promise.all([
    providerRepo.listProviders(tenant.tenantId),
    employeeRepo.listEmployees(tenant.tenantId, { limit: 200, status: 'ACTIVE' }),
  ]);

  const canManage = hasPermission(membership.role, 'providers.manage');
  const employeeMap = new Map(employeesRes.employees.map((e) => [e.id, e]));

  // Eligible employees for new provider profile: active employees without provider profile
  const existingProviderEmpIds = new Set(providers.map((p) => p.employeeId));
  const eligibleEmployees = employeesRes.employees.filter((e) => !existingProviderEmpIds.has(e.id));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>✂️</span> كادر مقدمي الخدمات (Service Providers)
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            إدارة المختصين، ربط الخدمات التجميلية، تفعيل الحجز الإلكتروني، وتحديد التخصصات.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-[#91B8C0]/20 text-[#2C4349] font-bold px-3 py-1.5 rounded-xl border border-[#91B8C0]/30">
            إجمالي مقدمي الخدمات: {providers.length}
          </span>
          {canManage && eligibleEmployees.length > 0 && (
            <RegisterProviderModal
              eligibleEmployees={eligibleEmployees}
              preselectedEmployeeId={registerEmployeeId}
            />
          )}
        </div>
      </div>

      {/* Providers Grid */}
      {providers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#54453D]/10 shadow-2xs text-center text-[#54453D]/60 space-y-3">
          <span className="text-4xl block">✂️</span>
          <p className="text-sm font-bold text-[#54453D]">لا يوجد مقدمو خدمات مسجلون بعد</p>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            مقدمو الخدمات هم الموظفون الذين يقومون بتقديم خدمات الصالون (قص، تصفيف، مكياج، عناية) ويمكن إسناد الخدمات وجدول المواعيد إليهم.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => {
            const emp = employeeMap.get(provider.employeeId);
            return (
              <div
                key={provider.id}
                className="bg-white rounded-3xl border border-[#54453D]/10 p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#91B8C0]/50 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#91B8C0]/30 text-[#2C4349] font-black text-lg flex items-center justify-center">
                        {provider.displayNameAr.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#54453D]">
                          {provider.displayNameAr}
                        </h3>
                        {provider.displayNameEn && (
                          <p className="text-[11px] text-[#54453D]/60 font-medium">
                            {provider.displayNameEn}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        provider.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {provider.status === 'ACTIVE' ? 'نشط' : 'معطل'}
                    </span>
                  </div>

                  {/* Linked Employee Info */}
                  <div className="bg-[#FAF9F8] p-3 rounded-xl border border-[#54453D]/5 text-xs text-[#54453D]/80 mb-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#54453D]/60">الموظف المرتبط:</span>
                      <span className="font-bold text-[#54453D]">
                        {emp ? emp.fullNameAr : 'غير محدد'}
                      </span>
                    </div>
                    {emp && (
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#54453D]/60">
                        <span>الرقم الوظيفي:</span>
                        <span>#{emp.employeeNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Specialties */}
                  {provider.specialties.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      <span className="text-[10px] font-bold text-[#54453D]/60 block">التخصصات:</span>
                      <div className="flex flex-wrap gap-1">
                        {provider.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="text-[10px] bg-[#FAF9F8] border border-[#54453D]/10 px-2 py-0.5 rounded-md text-[#54453D]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Online Booking Flag */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#54453D]/70 text-[11px]">الظهور والحجز الإلكتروني:</span>
                    <span
                      className={`font-bold text-[11px] ${
                        provider.isPubliclyVisible ? 'text-emerald-700' : 'text-[#54453D]/50'
                      }`}
                    >
                      {provider.isPubliclyVisible ? 'مفعل أونلاين ✓' : 'مخفي'}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[#54453D]/10 flex items-center justify-between">
                  <span className="text-[11px] text-[#54453D]/60 font-medium">
                    {provider.assignedServiceIds.length} خدمات مسندة
                  </span>
                  <Link
                    href={`/dashboard/providers/${provider.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 transition-all shadow-2xs"
                  >
                    إدارة الخدمات والجدول
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
