'use client';

import { useState } from 'react';
import type { BranchDoc } from '@rashx/database';
import { updateBranchAction } from '../actions';

export function BranchForm({ branch }: { branch: BranchDoc }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateBranchAction(branch.id, formData);

    setLoading(false);
    if (result.success) {
      setMessage({ text: 'تم حفظ وتحديث بيانات الفرع بنجاح!', isError: false });
    } else {
      setMessage({ text: result.error || 'فشل التحديث', isError: true });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border ${
            message.isError
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">
            اسم الفرع (بالعربية) *
          </label>
          <input
            name="name"
            defaultValue={branch.name}
            required
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">
            اسم الفرع (بالإنجليزية)
          </label>
          <input
            name="nameEn"
            defaultValue={branch.nameEn || ''}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white text-left font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">المدينة *</label>
          <input
            name="city"
            defaultValue={branch.city}
            required
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">الحي *</label>
          <input
            name="district"
            defaultValue={branch.district}
            required
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">العنوان التفصيلي *</label>
          <input
            name="address"
            defaultValue={branch.address}
            required
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">رقم الهاتف للتواصل *</label>
          <input
            name="phone"
            defaultValue={branch.phone}
            required
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white font-mono text-left"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">البريد الإلكتروني للفرع</label>
          <input
            name="email"
            type="email"
            defaultValue={branch.email || ''}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white font-mono text-left"
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF9F8] border border-[#54453D]/10">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isMain"
            value="true"
            defaultChecked={branch.isMain}
            disabled={branch.isMain}
            className="w-4 h-4 rounded text-[#54453D] focus:ring-[#54453D]"
          />
          <div>
            <span className="text-xs font-bold text-[#54453D] block">
              تعيين كفرع رئيسي للمنشأة (Main Branch)
            </span>
            <span className="text-[11px] text-[#54453D]/60 block mt-0.5">
              {branch.isMain
                ? 'هذا الفرع هو الفرع الرئيسي الحالي المعتمد قانونياً.'
                : 'تحديد هذا الخيار سيرقي هذا الفرع ليكون الفرع الرئيسي ويلغي صفة الفرع الرئيسي عن الفرع السابق.'}
            </span>
          </div>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#54453D]/10">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3d322c] disabled:opacity-50 transition-all shadow-xs"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ تعديلات الفرع'}
        </button>
      </div>
    </form>
  );
}

