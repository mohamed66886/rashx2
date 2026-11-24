'use client';

import { useState } from 'react';
import type { UnlinkedEmployeeOptionDto } from '@rashx/database';
import { inviteUserAction } from './actions';

export function InviteUserModal({
  unlinkedEmployees,
}: {
  unlinkedEmployees: UnlinkedEmployeeOptionDto[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{ inviteLink?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInviteResult(null);

    const formData = new FormData(e.currentTarget);
    const res = await inviteUserAction(formData);

    setLoading(false);
    if (res.success) {
      setInviteResult({ inviteLink: res.inviteLink });
    } else {
      setError(res.error || 'فشل إرسال الدعوة');
    }
  }

  function handleCopyLink() {
    if (inviteResult?.inviteLink) {
      navigator.clipboard.writeText(inviteResult.inviteLink);
      alert('تم نسخ رابط الدعوة إلى الحافظة!');
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setInviteResult(null);
          setError(null);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 transition-all shadow-xs"
      >
        <span>✉️</span> دعوة مستخدم جديد
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#54453D]/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#54453D] flex items-center gap-2">
                <span>🔐</span> دعوة عضو جديد للمنظمة
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

            {inviteResult ? (
              <div className="space-y-4 bg-emerald-50 p-5 rounded-2xl border border-emerald-200 text-center">
                <span className="text-3xl block">🎉</span>
                <p className="text-xs font-bold text-emerald-900">
                  تم إنشاء رمز ورابط الدعوة المشفر بنجاح!
                </p>
                <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                  يمكن للمستخدم استخدام هذا الرابط لتسجيل الدخول والانضمام فوراً بصلاحياته المحددة (صالح لمدة ٧ أيام).
                </p>
                {inviteResult.inviteLink && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      readOnly
                      value={inviteResult.inviteLink}
                      className="w-full text-[10px] px-3 py-2 rounded-xl border border-emerald-300 bg-white font-mono text-left"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shrink-0 hover:bg-emerald-800"
                    >
                      نسخ
                    </button>
                  </div>
                )}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold"
                  >
                    إغلاق النافذة
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    البريد الإلكتروني للمستخدم المدعو *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    الدور والصلاحيات الأساسية *
                  </label>
                  <select
                    name="role"
                    defaultValue="STAFF"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white"
                  >
                    <option value="STAFF">عضو فريق عمل / مقدم خدمة (Staff - تشغيلي)</option>
                    <option value="MANAGER">مدير صالون (Manager - إدارة الفروع والعمليات)</option>
                  </select>
                  <p className="text-[10px] text-[#54453D]/60 mt-1">
                    ملاحظة: تعيين مالك جديد (Owner) يتطلب إجراء نقل ملكية رسمي لحماية المنشأة.
                  </p>
                </div>

                {unlinkedEmployees.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-[#54453D] mb-1">
                      ربط تلقائي بملف موظف موجود (اختياري)
                    </label>
                    <select
                      name="targetEmployeeId"
                      defaultValue=""
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white"
                    >
                      <option value="">بدون ربط (إنشاء مستخدم مستقل)</option>
                      {unlinkedEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullNameAr} (#{emp.employeeNumber}) — {emp.jobTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
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
                    className="px-5 py-2.5 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 disabled:opacity-50"
                  >
                    {loading ? 'جاري الإصدار...' : 'إصدار رابط الدعوة'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

