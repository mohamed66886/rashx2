import { redirect } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { BranchRepository, TenantBootstrapService } from '@/lib/firebase-server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BranchesPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant } = session;
  const branchRepo = new BranchRepository();
  let branches = await branchRepo.listBranches(tenant.tenantId);

  // Self-healing reconciliation if no branches exist
  if (branches.length === 0) {
    const bootstrap = new TenantBootstrapService();
    await bootstrap.reconcileTenant(tenant.tenantId);
    branches = await branchRepo.listBranches(tenant.tenantId);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>🏢</span> إدارة الفروع ومواقع المنشأة
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            إدارة الفرع الرئيسي والفروع التابعة، وتعيين العناوين الجغرافية وساعات العمل الأسبوعية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#91B8C0]/20 text-[#2C4349] font-bold px-3 py-1.5 rounded-xl border border-[#91B8C0]/30">
            إجمالي الفروع: {branches.length}
          </span>
        </div>
      </div>

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className={`bg-white rounded-3xl border p-6 shadow-2xs relative transition-all ${
              branch.isMain
                ? 'border-[#91B8C0] ring-2 ring-[#91B8C0]/20'
                : 'border-[#54453D]/10'
            }`}
          >
            {/* Top Badges */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                {branch.isMain && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span>⭐</span> الفرع الرئيسي
                  </span>
                )}
                <span className="font-mono text-xs text-[#54453D]/60 bg-[#FAF9F8] px-2 py-0.5 rounded-md border border-[#54453D]/5">
                  {branch.code || 'BRANCH'}
                </span>
              </div>

              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  branch.isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {branch.isActive ? 'نشط' : 'معطل'}
              </span>
            </div>

            {/* Branch Title & Names */}
            <h3 className="text-base font-bold text-[#54453D]">{branch.name}</h3>
            {branch.nameEn && (
              <p className="text-xs text-[#54453D]/60 font-medium mb-3">{branch.nameEn}</p>
            )}

            {/* Address & City */}
            <div className="space-y-1.5 text-xs text-[#54453D]/80 mb-4 bg-[#FAF9F8] p-3.5 rounded-2xl border border-[#54453D]/5">
              <div className="flex items-center gap-2">
                <span className="text-[#91B8C0]">📍</span>
                <span>
                  {branch.city}، {branch.district} — {branch.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#91B8C0]">📞</span>
                <span className="font-mono">{branch.phone}</span>
              </div>
              {branch.email && (
                <div className="flex items-center gap-2">
                  <span className="text-[#91B8C0]">✉️</span>
                  <span className="font-mono">{branch.email}</span>
                </div>
              )}
            </div>

            {/* Operating Hours Summary */}
            <div className="text-[11px] text-[#54453D]/70 mb-4 flex items-center justify-between border-t border-[#54453D]/5 pt-3">
              <span>ساعات العمل (السبت - الخميس):</span>
              <span className="font-mono font-medium">
                {branch.operatingHours?.saturday?.open} - {branch.operatingHours?.saturday?.close}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end border-t border-[#54453D]/5 pt-3">
              <Link
                href={`/dashboard/branches/${branch.id}`}
                className="text-xs font-bold text-[#2C4349] bg-[#91B8C0]/20 hover:bg-[#91B8C0]/30 px-3.5 py-1.5 rounded-xl border border-[#91B8C0]/40 transition-colors"
              >
                تعديل وتفاصيل الفرع ←
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

