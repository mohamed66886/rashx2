'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { updateCategoryAction } from '../../actions';
import type { ServiceCategoryDoc } from '@/lib/firebase-server';

export function EditCategoryForm({ category }: { category: ServiceCategoryDoc }) {
  const router = useRouter();
  const updateActionWithId = updateCategoryAction.bind(null, category.id);
  const [state, formAction, isPending] = useActionState(updateActionWithId, { success: false });

  useEffect(() => {
    if (state.success) {
      router.push('/dashboard/service-categories');
    }
  }, [state.success, router]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
      {state.error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          ⚠️ {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              اسم التصنيف (بالعربية) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="nameAr"
              required
              defaultValue={category.nameAr}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              اسم التصنيف (بالإنجليزية)
            </label>
            <input
              type="text"
              name="nameEn"
              dir="ltr"
              defaultValue={category.nameEn || ''}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden transition-all text-left"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">
            الوصف (بالعربية)
          </label>
          <textarea
            name="descriptionAr"
            rows={3}
            defaultValue={category.descriptionAr || ''}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">
            رابط صورة التصنيف (اختياري)
          </label>
          <input
            type="url"
            name="imageUrl"
            dir="ltr"
            defaultValue={category.imageUrl || ''}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden transition-all text-left"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              ترتيب العرض
            </label>
            <input
              type="number"
              name="displayOrder"
              defaultValue={category.displayOrder}
              min={0}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              حالة التصنيف
            </label>
            <select
              name="isActive"
              defaultValue={category.isActive ? 'true' : 'false'}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden transition-all bg-white"
            >
              <option value="true">مفعّل</option>
              <option value="false">معطّل</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#54453D]/10">
          <Link
            href="/dashboard/service-categories"
            className="px-4 py-2.5 text-xs font-bold text-[#54453D]/70 hover:bg-[#54453D]/5 rounded-xl transition-all"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-[#54453D] text-white text-xs font-bold rounded-xl hover:bg-[#3D322C] transition-all disabled:opacity-50"
          >
            {isPending ? 'جاري التعديل...' : 'حفظ التعديلات'}
          </button>
        </div>
      </form>
    </div>
  );
}

