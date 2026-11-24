'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { toggleCategoryStatusAction, deleteCategoryAction } from './actions';

interface CategoryRowActionsProps {
  categoryId: string;
  isActive: boolean;
  serviceCount: number;
  canManage: boolean;
}

export function CategoryRowActions({
  categoryId,
  isActive,
  serviceCount,
  canManage,
}: CategoryRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleCategoryStatusAction(categoryId, isActive);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  const handleDelete = () => {
    if (serviceCount > 0) {
      alert('لا يمكن حذف هذا التصنيف لأنه مرتبط بخدمات حالية. يرجى نقل أو حذف الخدمات أولاً.');
      return;
    }
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف نهائياً؟')) return;

    startTransition(async () => {
      const res = await deleteCategoryAction(categoryId);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  if (!canManage) return null;

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/service-categories/${categoryId}/edit`}
        className="px-2.5 py-1 text-xs font-semibold text-[#54453D] bg-[#54453D]/5 hover:bg-[#54453D]/10 rounded-lg transition-all"
      >
        تعديل
      </Link>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          isActive
            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
        }`}
      >
        {isPending ? '...' : isActive ? 'تعطيل' : 'تفعيل'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending || serviceCount > 0}
        title={serviceCount > 0 ? 'لا يمكن حذف تصنيف يحتوي على خدمات' : 'حذف التصنيف'}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          serviceCount > 0
            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
            : 'text-rose-600 bg-rose-50 hover:bg-rose-100'
        }`}
      >
        حذف
      </button>
    </div>
  );
}

