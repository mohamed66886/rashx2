'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createCategoryAction } from '../actions';

export default function NewCategoryPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createCategoryAction, { success: false });

  useEffect(() => {
    if (state.success) {
      router.push('/dashboard/service-categories');
    }
  }, [state.success, router]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>➕</span> إضافة تصنيف جديد للخدمات
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            أنشئ قسماً أو تصنيفاً رئيسياً تندرج تحته خدمات الصالون.
          </p>
        </div>
        <Link
          href="/dashboard/service-categories"
          className="text-xs font-bold text-[#54453D]/70 hover:text-[#54453D] px-3 py-1.5 rounded-xl border border-[#54453D]/10 hover:bg-[#54453D]/5 transition-all"
        >
          رجوع للقائمة
        </Link>
      </div>

      {/* Form */}
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
                placeholder="مثال: العناية بالشعر"
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
                placeholder="e.g. Hair Care"
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
              placeholder="وصف مختصر لتصنيف الخدمات..."
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
              placeholder="https://example.com/images/hair.jpg"
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
                defaultValue={0}
                min={0}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden transition-all"
              />
              <span className="text-[11px] text-[#54453D]/50 mt-1 block">
                الأرقام الأصغر تظهر أولاً في قائمة الخدمات للعملاء.
              </span>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1.5">
                حالة التصنيف
              </label>
              <select
                name="isActive"
                defaultValue="true"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden transition-all bg-white"
              >
                <option value="true">مفعّل (يظهر للعملاء وفريق العمل)</option>
                <option value="false">معطّل (مخفي مؤقتاً)</option>
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
              {isPending ? 'جاري الحفظ...' : 'حفظ التصنيف'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

