import { redirect, notFound } from 'next/navigation';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { BranchRepository } from '@/lib/firebase-server';
import { BranchForm } from './branch-form';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { branchId } = await params;
  const branchRepo = new BranchRepository();
  const branch = await branchRepo.getBranchById(session.tenant.tenantId, branchId);

  if (!branch) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#54453D]/60">
        <Link href="/dashboard/branches" className="hover:text-[#54453D]">
          الفروع
        </Link>
        <span>/</span>
        <span className="font-bold text-[#54453D]">{branch.name}</span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-[#54453D]/10 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#54453D]/10 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-[#54453D]">{branch.name}</h2>
              {branch.isMain && (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  الفرع الرئيسي
                </span>
              )}
            </div>
            <p className="text-xs text-[#54453D]/60 font-mono">
              معرف الفرع: {branch.id} • الرمز: {branch.code || 'N/A'}
            </p>
          </div>

          <Link
            href="/dashboard/branches"
            className="text-xs font-bold text-[#54453D]/70 hover:text-[#54453D] px-3 py-1.5 rounded-xl border border-[#54453D]/20 self-start sm:self-auto"
          >
            ← العودة لقائمة الفروع
          </Link>
        </div>

        <BranchForm branch={branch} />
      </div>
    </div>
  );
}

