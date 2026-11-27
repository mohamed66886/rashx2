'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomerAction } from './actions';

export function CreateCustomerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const phone = (formData.get('phone') as string) || '';

    // Quick client-side pre-check for convenience
    const cleaned = phone.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632)).replace(/[\s-]/g, '');
    if (!/^(05|5|\+9665|9665|009665)\d{8}$/.test(cleaned)) {
      setError('يرجى إدخال رقم جوال سعودي صحيح يبدأ بـ 05 ويتكون من 10 أرقام (أو صيغة +9665).');
      setLoading(false);
      return;
    }

    const res = await createCustomerAction(formData);
    setLoading(false);

    if (res.success) {
      setIsOpen(false);
      router.refresh();
      if (res.customerId) {
        router.push(`/dashboard/customers/${res.customerId}`);
      }
    } else {
      setError(res.error || 'حدث خطأ أثناء إضافة العميل');
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
        <span>➕</span> إضافة عميل جديد
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#54453D]/10 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6DDD6] pb-3">
              <h3 className="text-base font-bold text-[#54453D] flex items-center gap-2">
                <span>👤</span> إضافة ملف عميل جديد
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#6B5B52] hover:text-[#54453D] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  اسم العميل الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="مثال: سارة محمد العتيبي"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  رقم الجوال السعودي <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  dir="ltr"
                  placeholder="05XXXXXXXX أو +9665XXXXXXXX"
                  className="w-full px-3 py-2 text-sm text-left font-mono rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
                />
                <p className="mt-1 text-[11px] text-[#6B5B52]">
                  يتم التحقق من عدم تكرار رقم الجوال تلقائياً داخل المنشأة.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    name="email"
                    dir="ltr"
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    تاريخ الميلاد (اختياري)
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    الجنس
                  </label>
                  <select
                    name="gender"
                    defaultValue="UNSPECIFIED"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
                  >
                    <option value="UNSPECIFIED">غير محدد</option>
                    <option value="FEMALE">أنثى</option>
                    <option value="MALE">ذكر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#54453D] mb-1">
                    وسوم تصنيفية (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="VIP, عروس, صبغة"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#54453D] mb-1">
                  ملاحظات خاصة (سرية للإدارة ومصرح بها فقط)
                </label>
                <textarea
                  name="privateNotes"
                  rows={2}
                  placeholder="ملاحظات الحساسية، التفضيلات الخاصة، أو تفاصيل العناية..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#9A8C83] bg-white focus:outline-none focus:ring-2 focus:ring-[#F0C5AE]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6DDD6]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6B5B52] hover:text-[#54453D]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 disabled:opacity-50 transition-all shadow-xs"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ ملف العميل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

