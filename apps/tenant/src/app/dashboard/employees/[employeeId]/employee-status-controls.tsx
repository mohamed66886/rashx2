'use client';

import { useState } from 'react';
import type { SafeEmployeeDto, EmployeeStatus } from '@rashx/database';
import { setEmployeeStatusAction, terminateEmployeeAction } from '../actions';

export function EmployeeStatusControls({
  employee,
  isOwner,
  canManage,
}: {
  employee: SafeEmployeeDto;
  isOwner: boolean;
  canManage: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTerminateModal, setShowTerminateModal] = useState(false);

  const [termDate, setTermDate] = useState(new Date().toISOString().split('T')[0]!);
  const [termReason, setTermReason] = useState('استقالة الموظف');
  const [termNotes, setTermNotes] = useState('');

  async function handleQuickStatusChange(newStatus: EmployeeStatus) {
    if (newStatus === employee.employmentStatus) return;
    setLoading(true);
    setError(null);

    const res = await setEmployeeStatusAction(employee.id, newStatus);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'فشل تحديث الحالة');
    }
  }

  async function handleTerminateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('terminationDate', termDate);
    formData.append('reason', termReason);
    if (termNotes) formData.append('notes', termNotes);

    const res = await terminateEmployeeAction(employee.id, formData);
    setLoading(false);
    if (res.success) {
      setShowTerminateModal(false);
    } else {
      setError(res.error || 'فشل تسجيل إنهاء الخدمة');
    }
  }

  if (employee.employmentStatus === 'TERMINATED') {
    const termDetails = 'terminationDetails' in employee ? employee.terminationDetails : undefined;
    return (
      <div className="bg-red-50/50 p-4 rounded-2xl border border-red-200 text-xs text-red-900 space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <span>🛑</span> هذا الموظف تم إنهاء خدمته رسمياً
        </p>
        {termDetails && (
          <p className="text-[11px] text-red-800">
            تاريخ الإنهاء: {termDetails.effectiveDate} • السبب:{' '}
            {termDetails.reason}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl text-xs font-bold bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {canManage && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#54453D]">تغيير الحالة السريعة:</span>
          {(['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'SUSPENDED'] as EmployeeStatus[]).map((st) => {
            const isCurrent = employee.employmentStatus === st;
            return (
              <button
                key={st}
                disabled={loading || isCurrent}
                onClick={() => handleQuickStatusChange(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                  isCurrent
                    ? 'bg-[#54453D] text-white border-[#54453D]'
                    : 'bg-white text-[#54453D]/70 border-[#54453D]/20 hover:border-[#54453D]'
                }`}
              >
                {st === 'ACTIVE' && 'نشط'}
                {st === 'ON_LEAVE' && 'في إجازة'}
                {st === 'INACTIVE' && 'غير نشط'}
                {st === 'SUSPENDED' && 'إيقاف مؤقت'}
              </button>
            );
          })}

          {isOwner && (
            <button
              onClick={() => setShowTerminateModal(true)}
              className="mr-auto px-3 py-1 rounded-lg text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-all"
            >
              إنهاء الخدمة
            </button>
          )}
        </div>
      )}

      {/* Termination Modal */}
      {showTerminateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#54453D]/10 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-red-700 flex items-center gap-2">
              <span>⚠️</span> توثيق إنهاء خدمة الموظف
            </h3>
            <p className="text-xs text-[#54453D]/70 leading-relaxed">
              إنهاء الخدمة يغير حالة الموظف بشكل نهائي ويوثق ذلك في السجل التاريخي للمنشأة، مع تعطيل صلاحيات الربط والجدولة.
            </p>

            <form onSubmit={handleTerminateSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  تاريخ إنهاء الخدمة الفعلي *
                </label>
                <input
                  type="date"
                  required
                  value={termDate}
                  onChange={(e) => setTermDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  سبب إنهاء الخدمة *
                </label>
                <select
                  value={termReason}
                  onChange={(e) => setTermReason(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white"
                >
                  <option value="استقالة الموظف">استقالة الموظف (Resignation)</option>
                  <option value="إنهاء بالتراضي">إنهاء بالتراضي (Mutual Agreement)</option>
                  <option value="انتهاء مدة العقد">انتهاء مدة العقد (Contract Expiry)</option>
                  <option value="فصل وفق نظام العمل">فصل وفق نظام العمل (Dismissal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  ملاحظات أو تفاصيل التسوية
                </label>
                <textarea
                  rows={2}
                  value={termNotes}
                  onChange={(e) => setTermNotes(e.target.value)}
                  placeholder="ملاحظات توثيقية إضافية..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#54453D]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTerminateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#54453D]/60"
                >
                  تراجع
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'جاري التوثيق...' : 'تأكيد إنهاء الخدمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
