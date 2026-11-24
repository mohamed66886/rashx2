import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import {
  ServiceRepository,
  ServiceCategoryRepository,
  BranchRepository,
  hasPermission,
} from '@/lib/firebase-server';
import { ServiceStatusToggle } from './service-status-toggle';
import { ServiceFilterBar } from './service-filter-bar';

export const dynamic = 'force-dynamic';

export default async function ServicesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    branch?: string;
    status?: string;
  }>;
}) {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership } = session;
  const resolvedParams = searchParams ? await searchParams : {};
  const { q, category, branch, status } = resolvedParams;

  const serviceRepo = new ServiceRepository();
  const categoryRepo = new ServiceCategoryRepository();
  const branchRepo = new BranchRepository();

  const [categories, branches, allServices] = await Promise.all([
    categoryRepo.listCategories(tenant.tenantId),
    branchRepo.listBranches(tenant.tenantId),
    serviceRepo.listServices(tenant.tenantId, {
      categoryId: category || undefined,
      branchId: branch || undefined,
      isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
      search: q || undefined,
    }),
  ]);

  const canCreate = hasPermission(membership.role, 'services.create');
  const canManage = hasPermission(membership.role, 'services.update');

  const branchMap = new Map(branches.map((b) => [b.id, b.name]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>✨</span> قائمة خدمات الصالون (Services Catalog)
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            إدارة باقات وخدمات الصالون، التسعير، مدد التنفيذ، وتعيين مقدمي الخدمات والفروع المتاحة.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/service-categories"
            className="text-xs font-bold text-[#54453D] px-3.5 py-2 rounded-xl border border-[#54453D]/15 hover:bg-[#54453D]/5 transition-all"
          >
            📂 إدارة التصنيفات ({categories.length})
          </Link>
          {canCreate && (
            <Link
              href="/dashboard/services/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#54453D] text-white rounded-xl text-xs font-bold hover:bg-[#3D322C] transition-all shadow-xs"
            >
              <span>➕</span>
              <span>إضافة خدمة جديدة</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <ServiceFilterBar
        categories={categories}
        branches={branches.map((b) => ({ id: b.id, name: b.name }))}
      />

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-[#54453D]/10 shadow-2xs overflow-hidden">
        {allServices.length === 0 ? (
          <div className="text-center py-16 px-4">
            <span className="text-4xl block mb-3">✂️</span>
            <h3 className="text-sm font-bold text-[#54453D]">لا توجد خدمات مطابقة للبحث</h3>
            <p className="text-xs text-[#54453D]/60 mt-1 max-w-sm mx-auto">
              لم نتمكن من العثور على خدمات بالمعايير المحددة. جرب تغيير خيارات التصفية أو أضف خدمة جديدة.
            </p>
            {canCreate && (
              <Link
                href="/dashboard/services/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 bg-[#54453D] text-white rounded-xl text-xs font-bold hover:bg-[#3D322C] transition-all"
              >
                <span>➕</span>
                <span>إضافة خدمة جديدة</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#54453D]/5 text-[#54453D] border-b border-[#54453D]/10 font-bold">
                <tr>
                  <th className="py-3 px-4">اسم الخدمة</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">المدة</th>
                  <th className="py-3 px-4">السعر الإجمالي</th>
                  <th className="py-3 px-4">الضريبة</th>
                  <th className="py-3 px-4">الفروع المتاحة</th>
                  <th className="py-3 px-4">مقدمو الخدمة</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#54453D]/5">
                {allServices.map((service) => {
                  const priceSar = (service.totalPriceHalalas / 100).toFixed(2);
                  const netSar = (service.netPriceHalalas / 100).toFixed(2);
                  const taxSar = (service.calculatedTaxHalalas / 100).toFixed(2);

                  return (
                    <tr key={service.id} className="hover:bg-[#54453D]/2 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#54453D] flex items-center gap-2">
                          {service.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={service.imageUrl}
                              alt={service.nameAr}
                              className="w-7 h-7 rounded-lg object-cover border border-[#54453D]/10"
                            />
                          )}
                          <div>
                            <div>{service.nameAr}</div>
                            {service.nameEn && (
                              <div className="text-[10px] text-[#54453D]/50 font-sans">
                                {service.nameEn}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-[#54453D]/5 text-[#54453D] font-medium text-[11px]">
                          {service.categoryNameAr}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-[#54453D]">
                        {service.durationMinutes} دقيقة
                        {(service.bufferBeforeMinutes > 0 || service.bufferAfterMinutes > 0) && (
                          <span className="text-[10px] text-[#54453D]/50 block">
                            +{service.bufferBeforeMinutes + service.bufferAfterMinutes}د احتياطي
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#2C4349]">
                        {priceSar} ر.س
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#54453D]/70">
                        {service.taxMode === 'TAX_EXEMPT' ? (
                          <span className="text-gray-400">معفى</span>
                        ) : (
                          <div>
                            <span>{taxSar} ر.س</span>
                            <span className="text-[10px] text-[#54453D]/50 block">
                              {service.taxMode === 'TAX_INCLUSIVE' ? 'شامل (15%)' : 'غير شامل (+15%)'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-[#54453D]/70">
                          {service.assignedBranchIds.length === branches.length
                            ? 'جميع الفروع'
                            : `${service.assignedBranchIds.length} فرع`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#91B8C0]/15 text-[#2C4349]">
                          {service.assignedProviderIds?.length || 0} مختص
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <ServiceStatusToggle
                          serviceId={service.id}
                          isActive={service.isActive}
                          canManage={canManage}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/dashboard/services/${service.id}`}
                            className="px-2.5 py-1 text-xs font-semibold text-[#2C4349] bg-[#91B8C0]/20 hover:bg-[#91B8C0]/30 rounded-lg transition-all"
                          >
                            عرض
                          </Link>
                          {canManage && (
                            <Link
                              href={`/dashboard/services/${service.id}/edit`}
                              className="px-2.5 py-1 text-xs font-semibold text-[#54453D] bg-[#54453D]/5 hover:bg-[#54453D]/10 rounded-lg transition-all"
                            >
                              تعديل
                            </Link>
                          )}
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

