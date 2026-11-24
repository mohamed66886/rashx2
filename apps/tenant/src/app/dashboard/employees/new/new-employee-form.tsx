'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BranchDoc } from '@rashx/database';
import { createEmployeeAction } from '../actions';

export function NewEmployeeForm({ branches }: { branches: BranchDoc[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mainBranch = branches.find((b) => b.isMain) || branches[0];
  const [primaryBranchId, setPrimaryBranchId] = useState(mainBranch?.id || '');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([mainBranch?.id || '']);

  function toggleBranch(branchId: string) {
    if (branchId === primaryBranchId) return; // Cannot unselect primary
    setSelectedBranches((prev) =>
      prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId]
    );
  }

  function handlePrimaryChange(newPrimary: string) {
    setPrimaryBranchId(newPrimary);
    if (!selectedBranches.includes(newPrimary)) {
      setSelectedBranches((prev) => [...prev, newPrimary]);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    // Ensure all selected branches are appended
    selectedBranches.forEach((bId) => formData.append('assignedBranchIds', bId));

    const result = await createEmployeeAction(formData);

    setLoading(false);
    if (result.success && result.employeeId) {
      router.push(`/dashboard/employees/${result.employeeId}`);
    } else {
      setError(result.error || 'حدث خطأ أثناء حفظ بيانات الموظف');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl text-xs font-bold bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="bg-[#FAF9F8] p-5 rounded-2xl border border-[#54453D]/10 space-y-4">
        <h3 className="text-xs font-bold text-[#54453D] flex items-center gap-2">
          <span>👤</span> البيانات الأساسية والهوية
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              الاسم الكامل (بالعربية) *
            </label>
            <input
              name="fullNameAr"
              required
              placeholder="مثال: سارة أحمد المنصور"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              الاسم الكامل (بالإنجليزية)
            </label>
            <input
              name="fullNameEn"
              placeholder="مثال: Sarah Ahmed Al-Mansoor"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              الرقم الوظيفي *
            </label>
            <input
              name="employeeNumber"
              required
              placeholder="مثال: EMP-001"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              رقم الهوية الوطنية / الإقامة
            </label>
            <input
              name="nationalId"
              placeholder="10 أرقام"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Job & Branch Assignment */}
      <div className="bg-[#FAF9F8] p-5 rounded-2xl border border-[#54453D]/10 space-y-4">
        <h3 className="text-xs font-bold text-[#54453D] flex items-center gap-2">
          <span>🏢</span> التعيين الوظيفي والفروع
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              المسمى الوظيفي *
            </label>
            <input
              name="jobTitle"
              required
              placeholder="مثال: أخصائية تصفيف وتلوين شعر"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              القسم / الإدارة
            </label>
            <input
              name="department"
              placeholder="مثال: قسم العناية بالشعر"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              نوع الدوام التعاقدي *
            </label>
            <select
              name="employmentType"
              defaultValue="FULL_TIME"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            >
              <option value="FULL_TIME">دوام كامل (Full Time)</option>
              <option value="PART_TIME">دوام جزئي (Part Time)</option>
              <option value="CONTRACTOR">متعاقد مستقل (Contractor)</option>
              <option value="TRAINEE">متدرب (Trainee)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              تاريخ بداية العمل / التعيين *
            </label>
            <input
              type="date"
              name="hireDate"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              الفرع الأساسي المعتمد *
            </label>
            <select
              name="primaryBranchId"
              value={primaryBranchId}
              onChange={(e) => handlePrimaryChange(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.isMain ? '(الفرع الرئيسي)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-2">
            الفروع المصرح للموظف العمل بها (تعدد الفروع)
          </label>
          <div className="flex flex-wrap gap-2">
            {branches.map((b) => {
              const isSelected = selectedBranches.includes(b.id);
              const isPrimary = b.id === primaryBranchId;
              return (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => toggleBranch(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-[#54453D] text-white border-[#54453D]'
                      : 'bg-white text-[#54453D]/70 border-[#54453D]/20 hover:border-[#54453D]'
                  }`}
                >
                  {b.name} {isPrimary ? '⭐ (أساسي)' : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3: Contact Details */}
      <div className="bg-[#FAF9F8] p-5 rounded-2xl border border-[#54453D]/10 space-y-4">
        <h3 className="text-xs font-bold text-[#54453D] flex items-center gap-2">
          <span>📞</span> بيانات الاتصال
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              رقم الجوال
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="05XXXXXXXX"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              name="email"
              placeholder="employee@example.com"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Operational Role Option */}
      <div className="bg-white p-5 rounded-2xl border border-[#91B8C0]/30 shadow-2xs">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isServiceProvider"
            value="true"
            defaultChecked={true}
            className="mt-1 rounded text-[#54453D] focus:ring-[#54453D]"
          />
          <div>
            <span className="text-xs font-bold text-[#54453D] block">
              تسجيل الموظف كمقدم خدمة بالصالون (Service Provider Profile)
            </span>
            <span className="text-[11px] text-[#54453D]/70 block mt-0.5">
              يتيح ربط الخدمات وتحديد التخصصات وحجز المواعيد على جدول هذا الموظف.
            </span>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-xs font-bold text-[#54453D]/70 hover:text-[#54453D]"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[#54453D] text-white text-xs font-bold shadow-xs hover:bg-[#54453D]/90 transition-all disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ الموظف ومتابعة الملف'}
        </button>
      </div>
    </form>
  );
}

