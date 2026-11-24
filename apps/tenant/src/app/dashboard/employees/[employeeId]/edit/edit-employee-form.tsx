'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SafeEmployeeDto, BranchDoc } from '@rashx/database';
import { updateEmployeeAction } from '../../actions';

export function EditEmployeeForm({
  employee,
  branches,
}: {
  employee: SafeEmployeeDto;
  branches: BranchDoc[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [primaryBranchId, setPrimaryBranchId] = useState(employee.primaryBranchId);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(employee.assignedBranchIds);

  function toggleBranch(branchId: string) {
    if (branchId === primaryBranchId) return;
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
    selectedBranches.forEach((bId) => formData.append('assignedBranchIds', bId));

    const result = await updateEmployeeAction(employee.id, formData);

    setLoading(false);
    if (result.success) {
      router.push(`/dashboard/employees/${employee.id}`);
    } else {
      setError(result.error || 'حدث خطأ أثناء حفظ التعديلات');
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
              defaultValue={employee.fullNameAr}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              الاسم الكامل (بالإنجليزية)
            </label>
            <input
              name="fullNameEn"
              defaultValue={employee.fullNameEn || ''}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              الرقم الوظيفي (غير قابل للتعديل)
            </label>
            <input
              disabled
              value={employee.employeeNumber}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/10 bg-gray-100 text-[#54453D]/60 font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              رقم الهوية الوطنية / الإقامة
            </label>
            <input
              name="nationalId"
              defaultValue={employee.nationalId || ''}
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
              defaultValue={employee.jobTitle}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              القسم / الإدارة
            </label>
            <input
              name="department"
              defaultValue={employee.department || ''}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              نوع الدوام التعاقدي *
            </label>
            <select
              name="employmentType"
              defaultValue={employee.employmentType}
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
              رقم الجوال *
            </label>
            <input
              type="tel"
              name="phone"
              required
              defaultValue={employee.phone}
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
              defaultValue={employee.email || ''}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white font-mono"
            />
          </div>
        </div>
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
          {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>
      </div>
    </form>
  );
}
