'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CustomerDoc } from '@/lib/firebase-server';
import { updateCustomerAction, archiveCustomerAction } from '../actions';

export function CustomerDetailClient({
  customer,
  canManage,
  canSeeNotes,
}: {
  customer: CustomerDoc;
  canManage: boolean;
  canSeeNotes: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const res = await updateCustomerAction(customer.id, formData);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setEditing(false);
      router.refresh();
    } else {
      setError(res.error || 'حدث خطأ أثناء حفظ التعديلات.');
    }
  }

  async function handleArchive() {
    if (!confirm('هل أنت متأكد من رغبتك في أرشفة هذا العميل؟ سيبقى سجل مواعيده التاريخية محفوظاً.')) {
      return;
    }
    setLoading(true);
    setError(null);

    const res = await archiveCustomerAction(customer.id);
    setLoading(false);

    if (res.success) {
      router.refresh();
    } else {
      setError(res.error || 'فشل أرشفة العميل.');
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E6DDD6] p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#E6DDD6] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#54453D] flex items-center gap-2">
            <span>👤</span> المعلومات الأساسية وبيانات التواصل
          </h2>
          <p className="text-xs text-[#6B5B52] mt-0.5">
            معرف العميل الداخلي: <code className="font-mono text-[#54453D]">{customer.id}</code>
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                onClick={() => {
                  setEditing(true);
                  setError(null);
                  setSuccess(false);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FAF9F8] border border-[#9A8C83] text-[#54453D] hover:bg-[#E6DDD6] transition-colors"
              >
                تعديل البيانات
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-[#6B5B52] hover:text-[#54453D]"
              >
                إلغاء التعديل
              </button>
            )}

            {customer.status === 'ACTIVE' && (
              <button
                onClick={handleArchive}
                disabled={loading}
                className="px-3 py-2 text-xs font-bold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                أرشفة العميل
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
          ✓ تم تحديث بيانات العميل بنجاح.
        </div>
      )}

      {!editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="block font-bold text-[#6B5B52] mb-1">الاسم الكامل:</span>
            <span className="text-sm font-bold text-[#54453D]">{customer.fullName}</span>
          </div>

          <div>
            <span className="block font-bold text-[#6B5B52] mb-1">رقم الجوال الموحد:</span>
            <span className="text-sm font-bold text-[#54453D] font-mono" dir="ltr">
              {customer.normalizedPhone}
            </span>
          </div>

          <div>
            <span className="block font-bold text-[#6B5B52] mb-1">البريد الإلكتروني:</span>
            <span className="text-sm text-[#54453D]" dir="ltr">
              {customer.email || 'غير مسجل'}
            </span>
          </div>

          <div>
            <span className="block font-bold text-[#6B5B52] mb-1">تاريخ الميلاد:</span>
            <span className="text-sm text-[#54453D]">{customer.dateOfBirth || 'غير مسجل'}</span>
          </div>

          <div>
            <span className="block font-bold text-[#6B5B52] mb-1">الجنس:</span>
            <span className="text-sm text-[#54453D]">
              {customer.gender === 'FEMALE' ? 'أنثى' : customer.gender === 'MALE' ? 'ذكر' : 'غير محدد'}
            </span>
          </div>

          <div>
            <span className="block font-bold text-[#6B5B52] mb-1">التصنيفات (Tags):</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {customer.tags && customer.tags.length > 0 ? (
                customer.tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-[#FAF9F8] border border-[#E6DDD6] text-[11px] font-semibold text-[#54453D]"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-[#6B5B52]">لا توجد تصنيفات</span>
              )}
            </div>
          </div>

          {canSeeNotes && (
            <div className="md:col-span-2 lg:col-span-3 bg-[#FAF9F8] p-4 rounded-2xl border border-[#E6DDD6]">
              <span className="block font-bold text-[#54453D] mb-1 flex items-center gap-1.5">
                <span>🔒</span> ملاحظات العناية والملف الخاص (سري للمصرح لهم):
              </span>
              <p className="text-xs text-[#54453D] whitespace-pre-wrap">
                {customer.privateNotes || 'لا توجد ملاحظات مسجلة.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">الاسم الكامل</label>
              <input
                type="text"
                name="fullName"
                defaultValue={customer.fullName}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">رقم الجوال</label>
              <input
                type="tel"
                name="phone"
                defaultValue={customer.displayPhone ?? customer.normalizedPhone ?? ''}
                required
                dir="ltr"
                className="w-full px-3 py-2 text-sm text-left font-mono rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                defaultValue={customer.email || ''}
                dir="ltr"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">تاريخ الميلاد</label>
              <input
                type="date"
                name="dateOfBirth"
                defaultValue={customer.dateOfBirth || ''}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">الجنس</label>
              <select
                name="gender"
                defaultValue={customer.gender || 'UNSPECIFIED'}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
              >
                <option value="UNSPECIFIED">غير محدد</option>
                <option value="FEMALE">أنثى</option>
                <option value="MALE">ذكر</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">
                التصنيفات (مفصولة بفواصل)
              </label>
              <input
                type="text"
                name="tags"
                defaultValue={customer.tags ? customer.tags.join(', ') : ''}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
              />
            </div>
          </div>

          {canSeeNotes && (
            <div>
              <label className="block text-xs font-bold text-[#54453D] mb-1">
                الملاحظات الخاصة (سرية للإدارة)
              </label>
              <textarea
                name="privateNotes"
                rows={3}
                defaultValue={customer.privateNotes}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6DDD6]">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-xs font-bold text-[#6B5B52] hover:text-[#54453D]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 disabled:opacity-50 transition-all shadow-xs"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

