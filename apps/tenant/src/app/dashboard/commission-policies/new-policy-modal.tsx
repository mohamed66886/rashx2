'use client';

import { useState } from 'react';
import { createPolicyAction } from './actions';

export function NewPolicyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await createPolicyAction(formData);

    setLoading(false);
    if (res.success) {
      setIsOpen(false);
    } else {
      setError(res.error || 'حدث خطأ أثناء حفظ السياسة');
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setError(null);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 transition-all shadow-xs"
      >
        <span>➕</span> سياسة عمولة جديدة
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#54453D]/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#54453D] flex items-center gap-2">
                <span>📋</span> إضافة سياسة عمولات وحوافز
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#54453D]/60 hover:text-[#54453D] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-xs font-bold bg-red-50 text-red-800 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    اسم السياسة (بالعربية) *
                  </label>
                  <input
                    name="nameAr"
                    required
                    placeholder="مثال: عمولة خدمات الشعر الأساسية"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    الاسم (بالإنجليزية)
                  </label>
                  <input
                    name="nameEn"
                    placeholder="Standard Hair Services"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    نوع هيكل العمولة *
                  </label>
                  <select
                    name="type"
                    defaultValue="SERVICE"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                  >
                    <option value="SERVICE">عمولة على الخدمات (Services)</option>
                    <option value="PRODUCT">عمولة على مبيعات المنتجات (Products)</option>
                    <option value="TIERED">شرائح تصاعدية (Tiered)</option>
                    <option value="HYBRID">هجين (Hybrid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    أساس احتساب العمولة *
                  </label>
                  <select
                    name="basis"
                    defaultValue="PERCENTAGE_OF_REVENUE"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                  >
                    <option value="PERCENTAGE_OF_REVENUE">نسبة مئوية من الإيراد</option>
                    <option value="FIXED_AMOUNT_PER_UNIT">مبلغ مقطوع لكل خدمة/وحدة</option>
                    <option value="TIERED_BY_VOLUME">شرائح حسب حجم العمل</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    النسبة المئوية (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    name="ratePercent"
                    defaultValue="10"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    تاريخ سريان السياسة *
                  </label>
                  <input
                    type="date"
                    required
                    name="effectiveFrom"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  وصف مختصر وشروط التطبيق
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="شروط استحقاق العمولة أو الخدمات المشمولة..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#54453D]/60"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 disabled:opacity-50"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ السياسة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
