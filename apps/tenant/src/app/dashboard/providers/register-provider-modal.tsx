'use client';

import { useState } from 'react';
import type { EmployeeDoc } from '@rashx/database';
import { createProviderAction } from './actions';

export function RegisterProviderModal({
  eligibleEmployees,
  preselectedEmployeeId,
}: {
  eligibleEmployees: EmployeeDoc[];
  preselectedEmployeeId?: string;
}) {
  const [isOpen, setIsOpen] = useState(Boolean(preselectedEmployeeId));
  const [selectedEmpId, setSelectedEmpId] = useState(
    preselectedEmployeeId || eligibleEmployees[0]?.id || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedEmp = eligibleEmployees.find((e) => e.id === selectedEmpId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedEmpId) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await createProviderAction(selectedEmpId, formData);

    setLoading(false);
    if (res.success) {
      setIsOpen(false);
    } else {
      setError(res.error || 'حدث خطأ أثناء إنشاء ملف مقدم الخدمة');
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 transition-all shadow-xs"
      >
        <span>➕</span> تسجيل مقدم خدمة
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#54453D]/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#54453D] flex items-center gap-2">
                <span>✂️</span> إنشاء ملف مقدم خدمة جديد
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
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  اختر الموظف المراد تسجيله *
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white"
                >
                  {eligibleEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullNameAr} (#{e.employeeNumber}) — {e.jobTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    اسم الظهور للعملاء (بالعربية) *
                  </label>
                  <input
                    name="displayNameAr"
                    required
                    defaultValue={selectedEmp?.fullNameAr || ''}
                    placeholder="مثال: سارة أحمد"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    اسم الظهور (بالإنجليزية)
                  </label>
                  <input
                    name="displayNameEn"
                    defaultValue={selectedEmp?.fullNameEn || ''}
                    placeholder="Sarah Ahmed"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  التخصصات والمهارات (افصل بينها بفاصلة)
                </label>
                <input
                  name="specialties"
                  placeholder="قص شعر, صبغات, تسريحات, بروتين"
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  نبذة تعريفية موجزة للعملاء
                </label>
                <textarea
                  name="bioAr"
                  rows={2}
                  placeholder="خبرة أكثر من ٥ سنوات في مجال..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20 bg-white"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#54453D]">
                  <input
                    type="checkbox"
                    name="isPubliclyVisible"
                    value="true"
                    defaultChecked={true}
                    className="rounded text-[#54453D]"
                  />
                  <span>إتاحة الظهور والحجز المباشر عبر الموقع الإلكتروني</span>
                </label>
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
                  {loading ? 'جاري الحفظ...' : 'إنشاء الملف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
