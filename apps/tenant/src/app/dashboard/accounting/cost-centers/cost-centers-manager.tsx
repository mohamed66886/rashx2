'use client';

import { useState } from 'react';
import type { CostCenterDoc, BranchDoc } from '@rashx/database';
import { createCostCenterAction } from '../actions';

interface CostCentersManagerProps {
  costCenters: CostCenterDoc[];
  branches: BranchDoc[];
}

export function CostCentersManager({ costCenters, branches }: CostCentersManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await createCostCenterAction(formData);

    setLoading(false);
    if (result.success) {
      setMessage({ text: 'تم إنشاء مركز التكلفة بنجاح!', isError: false });
      setShowAddForm(false);
    } else {
      setMessage({ text: result.error || 'فشل إنشاء مركز التكلفة', isError: true });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header card with action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#54453D] flex items-center gap-2">
            <span>🎯</span> مراكز التكلفة (Cost Centers)
          </h2>
          <p className="text-xs text-[#54453D]/70 mt-1">
            توزيع الإيرادات والمصروفات على الأقسام والفروع التشغيلية للصالون لتقييم ربحية كل قسم.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3d322c] transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <span>➕</span>
          <span>{showAddForm ? 'إلغاء' : 'إضافة مركز تكلفة جديد'}</span>
        </button>
      </div>

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

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs">
          <h3 className="text-sm font-bold text-[#54453D] mb-4">بيانات مركز التكلفة الجديد</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  رمز المركز *
                </label>
                <input
                  name="code"
                  placeholder="مثال: CC-HAIR"
                  required
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  اسم المركز (بالعربية) *
                </label>
                <input
                  name="nameAr"
                  placeholder="مثال: قسم العناية بالشعر"
                  required
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  اسم المركز (بالإنجليزية)
                </label>
                <input
                  name="nameEn"
                  placeholder="Hair Care Department"
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white text-left font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">
                الفرع المرتبط (اختياري)
              </label>
              <select
                name="branchId"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
              >
                <option value="">عام لكافة الفروع</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end pt-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3d322c] disabled:opacity-50 transition-all"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ مركز التكلفة'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cost Centers Table */}
      <div className="bg-white rounded-3xl border border-[#54453D]/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF9F8] text-[#54453D]/60 border-b border-[#54453D]/5">
              <tr>
                <th className="px-6 py-3 font-semibold">الرمز</th>
                <th className="px-6 py-3 font-semibold">اسم مركز التكلفة</th>
                <th className="px-6 py-3 font-semibold">الفرع التابع</th>
                <th className="px-6 py-3 font-semibold text-left">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#54453D]/5">
              {costCenters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-[#54453D]/60">
                    لا توجد مراكز تكلفة مسجلة حالياً.
                  </td>
                </tr>
              ) : (
                costCenters.map((cc) => (
                  <tr key={cc.id} className="hover:bg-[#FAF9F8]/60 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-[#54453D]">{cc.code}</td>
                    <td className="px-6 py-3.5 font-bold text-[#54453D]">
                      {cc.nameAr}
                      {cc.nameEn && (
                        <span className="block text-[11px] font-mono text-[#54453D]/50">
                          {cc.nameEn}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-[#54453D]/70">
                      {cc.branchId
                        ? branches.find((b) => b.id === cc.branchId)?.name || cc.branchId
                        : 'عام (كافة الفروع)'}
                    </td>
                    <td className="px-6 py-3.5 text-left">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        نشط
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

