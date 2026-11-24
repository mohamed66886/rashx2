import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  ServiceRepository,
  BranchRepository,
  CommissionPolicyRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { ServiceDetailActions } from './service-detail-actions';

export const dynamic = 'force-dynamic';

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership } = session;
  const resolvedParams = await params;
  const serviceId = resolvedParams.serviceId;

  const serviceRepo = new ServiceRepository();
  const branchRepo = new BranchRepository();
  const commissionRepo = new CommissionPolicyRepository();

  const [service, branches, assignedProviders] = await Promise.all([
    serviceRepo.getServiceById(tenant.tenantId, serviceId),
    branchRepo.listBranches(tenant.tenantId),
    serviceRepo.listProvidersForService(tenant.tenantId, serviceId),
  ]);

  if (!service) {
    notFound();
  }

  let commissionPolicy = null;
  if (service.commissionPolicyId) {
    commissionPolicy = await commissionRepo.getPolicyById(tenant.tenantId, service.commissionPolicyId);
  }

  const canManage = hasPermission(membership.role, 'services.update');
  const isOwner = membership.role === 'OWNER';

  const basePriceSar = (service.basePriceHalalas / 100).toFixed(2);
  const netPriceSar = (service.netPriceHalalas / 100).toFixed(2);
  const taxSar = (service.calculatedTaxHalalas / 100).toFixed(2);
  const totalPriceSar = (service.totalPriceHalalas / 100).toFixed(2);
  const taxRatePercent = (service.taxRateBps / 100).toFixed(1);

  const branchMap = new Map(branches.map((b) => [b.id, b]));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#54453D]">
              {service.nameAr}
            </h2>
            {service.isActive ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                مفعّلة
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                معطّلة
              </span>
            )}
          </div>
          {service.nameEn && (
            <p className="text-xs text-[#54453D]/60 mt-0.5 font-sans">
              {service.nameEn}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/services"
            className="text-xs font-bold text-[#54453D]/70 hover:text-[#54453D] px-3.5 py-2 rounded-xl border border-[#54453D]/10 hover:bg-[#54453D]/5 transition-all"
          >
            ← رجوع للقائمة
          </Link>
          <ServiceDetailActions
            serviceId={service.id}
            isActive={service.isActive}
            canManage={canManage}
            isOwner={isOwner}
          />
        </div>
      </div>

      {/* Financial & Tax Breakdown Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>💳</span> التسعير وتفاصيل ضريبة القيمة المضافة
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#54453D]/5 p-4 rounded-2xl">
            <span className="text-[11px] text-[#54453D]/60 block mb-1">السعر الأساسي المعتمد</span>
            <span className="text-base font-bold font-mono text-[#54453D]">{basePriceSar} ر.س</span>
          </div>
          <div className="bg-[#54453D]/5 p-4 rounded-2xl">
            <span className="text-[11px] text-[#54453D]/60 block mb-1">نظام الاحتساب</span>
            <span className="text-xs font-bold text-[#54453D]">
              {service.taxMode === 'TAX_INCLUSIVE'
                ? 'شامل الضريبة'
                : service.taxMode === 'TAX_EXCLUSIVE'
                ? 'غير شامل للضريبة'
                : 'معفى من الضريبة'}
            </span>
          </div>
          <div className="bg-[#54453D]/5 p-4 rounded-2xl">
            <span className="text-[11px] text-[#54453D]/60 block mb-1">
              مبلغ الضريبة ({taxRatePercent}%)
            </span>
            <span className="text-base font-bold font-mono text-[#54453D]">{taxSar} ر.س</span>
          </div>
          <div className="bg-[#91B8C0]/20 border border-[#91B8C0]/40 p-4 rounded-2xl">
            <span className="text-[11px] text-[#2C4349] font-bold block mb-1">
              إجمالي السعر للعميل
            </span>
            <span className="text-lg font-black font-mono text-[#2C4349]">{totalPriceSar} ر.س</span>
          </div>
        </div>
      </div>

      {/* Operational Details Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>⏱️</span> تفاصيل التشغيل والمدد
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[11px] text-[#54453D]/60 block">التصنيف</span>
            <span className="text-xs font-bold text-[#54453D]">{service.categoryNameAr}</span>
          </div>
          <div>
            <span className="text-[11px] text-[#54453D]/60 block">مدة تنفيذ الخدمة</span>
            <span className="text-xs font-bold font-mono text-[#54453D]">
              {service.durationMinutes} دقيقة
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#54453D]/60 block">الأوقات الاحتياطية (Buffer)</span>
            <span className="text-xs font-medium font-mono text-[#54453D]/80">
              {service.bufferBeforeMinutes}د قبل / {service.bufferAfterMinutes}د بعد
            </span>
          </div>
        </div>

        {service.descriptionAr && (
          <div className="pt-2 border-t border-[#54453D]/5">
            <span className="text-[11px] text-[#54453D]/60 block mb-1">الوصف التفصيلي:</span>
            <p className="text-xs text-[#54453D]/80 leading-relaxed bg-[#54453D]/2 p-3 rounded-xl">
              {service.descriptionAr}
            </p>
          </div>
        )}
      </div>

      {/* Available Branches Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>🏢</span> الفروع المتاحة ({service.assignedBranchIds.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {service.assignedBranchIds.map((bId) => {
            const branch = branchMap.get(bId);
            const isPrimary = service.primaryBranchId === bId;

            return (
              <div
                key={bId}
                className="p-3.5 rounded-2xl border border-[#54453D]/10 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[#54453D]">
                    {branch ? branch.name : bId}
                  </div>
                  {branch && (
                    <div className="text-[10px] text-[#54453D]/50 mt-0.5">
                      {branch.city} - {branch.district}
                    </div>
                  )}
                </div>
                {isPrimary && (
                  <span className="text-[10px] bg-[#91B8C0]/25 text-[#2C4349] font-bold px-2 py-0.5 rounded-md">
                    الفرع المرجعي
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Assigned Providers Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>✂️</span> كادر مقدمي الخدمة المعتمدين ({assignedProviders.length})
        </h3>
        {assignedProviders.length === 0 ? (
          <p className="text-xs text-[#54453D]/60 py-2">
            لم يتم تعيين أي مقدم خدمة لهذه الخدمة حتى الآن.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assignedProviders.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl border border-[#54453D]/10 flex items-center gap-3"
              >
                {p.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photoUrl}
                    alt={p.displayNameAr}
                    className="w-10 h-10 rounded-xl object-cover border border-[#54453D]/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#54453D]/10 flex items-center justify-center text-sm font-bold text-[#54453D]">
                    ✂️
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-[#54453D]">{p.displayNameAr}</div>
                  {p.specialties.length > 0 && (
                    <div className="text-[10px] text-[#54453D]/60 mt-0.5">
                      {p.specialties.join('، ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Associated Commission Policy Card */}
      {commissionPolicy && (
        <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
            <span>📋</span> سياسة العمولة المرتبطة
          </h3>
          <div className="p-4 rounded-2xl bg-[#54453D]/5 border border-[#54453D]/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#54453D]">{commissionPolicy.nameAr}</div>
              <div className="text-[11px] text-[#54453D]/60 mt-0.5">
                {commissionPolicy.basis === 'PERCENTAGE_OF_REVENUE'
                  ? `نسبة مئوية: ${(commissionPolicy.rateBps ?? 0) / 100}% من قيمة الخدمة`
                  : `مبلغ مقطوع: ${(commissionPolicy.fixedAmountHalalas ?? 0) / 100} ر.س لكل عملية`}
              </div>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg border border-emerald-200">
              سارية
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

