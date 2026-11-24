import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { CommissionPolicyRepository, hasPermission } from '@/lib/firebase-server';
import { NewPolicyModal } from './new-policy-modal';
import type { CommissionPolicyType, CommissionPolicyBasis } from '@rashx/database';

export const dynamic = 'force-dynamic';

export default async function CommissionPoliciesPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership } = session;
  const policyRepo = new CommissionPolicyRepository();
  const policies = await policyRepo.listPolicies(tenant.tenantId);

  const canManage = hasPermission(membership.role, 'policies.manage');

  const typeLabels: Record<CommissionPolicyType, string> = {
    SERVICE: 'خدمات',
    PRODUCT: 'منتجات',
    TIERED: 'شرائح تصاعدية',
    HYBRID: 'هجينة',
  };

  const basisLabels: Record<CommissionPolicyBasis, string> = {
    PERCENTAGE_OF_REVENUE: 'نسبة من الإيراد',
    FIXED_AMOUNT_PER_UNIT: 'مبلغ مقطوع لكل وحدة/خدمة',
    TIERED_BY_VOLUME: 'شرائح حسب حجم العمل',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>📋</span> سياسات العمولات والحوافز التشغيلية
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            تعريف قوالب احتساب العمولات، النسب الافتراضية، وأسس التحصيل المالي للفريق.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-[#91B8C0]/20 text-[#2C4349] font-bold px-3 py-1.5 rounded-xl border border-[#91B8C0]/30">
            إجمالي السياسات: {policies.length}
          </span>
          {canManage && <NewPolicyModal />}
        </div>
      </div>

      {/* Policies List */}
      {policies.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#54453D]/10 shadow-2xs text-center text-[#54453D]/60 space-y-3">
          <span className="text-4xl block">📋</span>
          <p className="text-sm font-bold text-[#54453D]">لا توجد سياسات عمولات مسجلة بعد</p>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            يمكنك إنشاء سياسات عمولة افتراضية وتطبيقها على مقدمي الخدمات لضمان احتساب دقيق للمستحقات مع كل فاتورة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-3xl border border-[#54453D]/10 p-6 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="bg-[#FAF9F8] border border-[#54453D]/10 text-[10px] font-bold px-2 py-0.5 rounded-md text-[#54453D]">
                    {typeLabels[policy.type]}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      policy.isActive
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {policy.isActive ? 'نشطة' : 'معطلة'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#54453D]">{policy.nameAr}</h3>
                {policy.nameEn && (
                  <p className="text-[11px] text-[#54453D]/60 font-medium mb-2">{policy.nameEn}</p>
                )}

                {policy.description && (
                  <p className="text-xs text-[#54453D]/70 bg-[#FAF9F8] p-3 rounded-xl border border-[#54453D]/5 mb-3 leading-relaxed">
                    {policy.description}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-[#54453D]/80 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#54453D]/60 text-[11px]">نسبة العمولة:</span>
                    <span className="font-mono font-black text-sm text-[#2C4349]">
                      {policy.rateBps !== undefined ? `${policy.rateBps / 100}%` : 'مقطوعة'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#54453D]/60">أساس الاحتساب:</span>
                    <span className="font-bold text-[#54453D]">
                      {basisLabels[policy.basis]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#54453D]/50 pt-1 border-t border-[#54453D]/5">
                    <span>تاريخ السريان:</span>
                    <span>{policy.effectiveFrom}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
