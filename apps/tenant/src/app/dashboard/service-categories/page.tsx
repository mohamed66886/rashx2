import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTenantSubscriptionSession } from '@/lib/tenant-auth';
import { ServiceCategoryRepository, ServiceRepository, hasPermission } from '@/lib/firebase-server';
import { CategoryRowActions } from './category-row-actions';

export const dynamic = 'force-dynamic';

export default async function ServiceCategoriesPage() {
  const session = await getTenantSubscriptionSession();
  if (!session) {
    redirect('/login');
  }

  const { tenant, membership } = session;
  const categoryRepo = new ServiceCategoryRepository();
  const serviceRepo = new ServiceRepository();

  const [categories, services] = await Promise.all([
    categoryRepo.listCategories(tenant.tenantId),
    serviceRepo.listServices(tenant.tenantId),
  ]);

  const canManage = hasPermission(membership.role, 'service_categories.create');

  // Compute service count per category
  const serviceCountMap = new Map<string, number>();
  for (const s of services) {
    const current = serviceCountMap.get(s.categoryId) || 0;
    serviceCountMap.set(s.categoryId, current + 1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>🏷️</span> تصنيفات الخدمات (Service Categories)
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            تنظيم وتصنيف خدمات الصالون لتسهيل تصفحها وإدارتها من قبل العملاء وفريق العمل.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-[#91B8C0]/20 text-[#2C4349] font-bold px-3 py-1.5 rounded-xl border border-[#91B8C0]/30">
            إجمالي التصنيفات: {categories.length}
          </span>
          {canManage && (
            <Link
              href="/dashboard/service-categories/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#54453D] text-white rounded-xl text-xs font-bold hover:bg-[#3D322C] transition-all shadow-xs"
            >
              <span>➕</span>
              <span>إضافة تصنيف جديد</span>
            </Link>
          )}
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-[#54453D]/10 shadow-2xs overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-16 px-4">
            <span className="text-4xl block mb-3">📂</span>
            <h3 className="text-sm font-bold text-[#54453D]">لا توجد تصنيفات مسجلة حتى الآن</h3>
            <p className="text-xs text-[#54453D]/60 mt-1 max-w-sm mx-auto">
              ابدأ بإضافة أول تصنيف لخدمات صالونك مثل (العناية بالشعر، العناية بالبشرة، المساج).
            </p>
            {canManage && (
              <Link
                href="/dashboard/service-categories/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 bg-[#54453D] text-white rounded-xl text-xs font-bold hover:bg-[#3D322C] transition-all"
              >
                <span>➕</span>
                <span>إضافة تصنيف جديد</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#54453D]/5 text-[#54453D] border-b border-[#54453D]/10 font-bold">
                <tr>
                  <th className="py-3 px-4">الترتيب</th>
                  <th className="py-3 px-4">اسم التصنيف</th>
                  <th className="py-3 px-4">الاسم الإنجليزي</th>
                  <th className="py-3 px-4">الخدمات المرتبطة</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#54453D]/5">
                {categories.map((cat) => {
                  const sCount = serviceCountMap.get(cat.id) || 0;
                  return (
                    <tr key={cat.id} className="hover:bg-[#54453D]/2 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-[#54453D]/60">
                        #{cat.displayOrder}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#54453D]">
                        <div className="flex items-center gap-2">
                          {cat.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cat.imageUrl}
                              alt={cat.nameAr}
                              className="w-7 h-7 rounded-lg object-cover border border-[#54453D]/10"
                            />
                          )}
                          <span>{cat.nameAr}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#54453D]/70 font-sans">
                        {cat.nameEn || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#91B8C0]/15 text-[#2C4349]">
                          {sCount} خدمة
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {cat.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            مفعّل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                            معطّل
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <CategoryRowActions
                          categoryId={cat.id}
                          isActive={cat.isActive}
                          serviceCount={sCount}
                          canManage={canManage}
                        />
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

