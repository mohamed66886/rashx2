import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { ServiceCategoryRepository, hasPermission } from '@/lib/firebase-server';
import { EditCategoryForm } from './edit-category-form';

export const dynamic = 'force-dynamic';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership } = session;
  const canManage = hasPermission(membership.role, 'service_categories.update');
  if (!canManage) {
    redirect('/dashboard/service-categories');
  }

  const resolvedParams = await params;
  const categoryRepo = new ServiceCategoryRepository();
  const category = await categoryRepo.getCategoryById(tenant.tenantId, resolvedParams.categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>✏️</span> تعديل تصنيف الخدمات
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            تعديل بيانات التصنيف: {category.nameAr}
          </p>
        </div>
        <Link
          href="/dashboard/service-categories"
          className="text-xs font-bold text-[#54453D]/70 hover:text-[#54453D] px-3 py-1.5 rounded-xl border border-[#54453D]/10 hover:bg-[#54453D]/5 transition-all"
        >
          رجوع للقائمة
        </Link>
      </div>

      <EditCategoryForm category={category} />
    </div>
  );
}

