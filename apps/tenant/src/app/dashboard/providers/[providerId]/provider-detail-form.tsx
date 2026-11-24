'use client';

import { useState } from 'react';
import type { ProviderDoc, EmployeeDoc } from '@rashx/database';
import { updateProviderAction, assignServicesAction } from '../actions';

const DEFAULT_SALON_SERVICES = [
  { id: 'srv_haircut_women', name: 'قص شعر نسائي احترافي' },
  { id: 'srv_hair_blowdry', name: 'سشوار وتصفيف' },
  { id: 'srv_hair_color', name: 'صبغة وتلوين شعر كامل' },
  { id: 'srv_hair_highlights', name: 'خصل وبلياج (Highlights)' },
  { id: 'srv_hair_treatment', name: 'علاج بروتين وكولاجين' },
  { id: 'srv_manicure', name: 'مانيكير كلاسيكي' },
  { id: 'srv_pedicure', name: 'باديكير عناية متكاملة' },
  { id: 'srv_gel_nails', name: 'تركيب أظافر جل' },
  { id: 'srv_makeup_event', name: 'مكياج سهرة احترافي' },
  { id: 'srv_makeup_bridal', name: 'مكياج عروس VIP' },
  { id: 'srv_facial_care', name: 'تنظيف وبشرة هايدرافاشيل' },
  { id: 'srv_waxing', name: 'إزالة شعر بالشمع' },
];

export function ProviderDetailForm({
  provider,
  employee,
}: {
  provider: ProviderDoc;
  employee: EmployeeDoc;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [assignedServices, setAssignedServices] = useState<string[]>(
    provider.assignedServiceIds || []
  );

  function toggleService(serviceId: string) {
    setAssignedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  }

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateProviderAction(provider.id, formData);

    setLoading(false);
    if (res.success) {
      setMessage({ text: 'تم حفظ وتحديث بيانات مقدم الخدمة بنجاح!', isError: false });
    } else {
      setMessage({ text: res.error || 'فشل التحديث', isError: true });
    }
  }

  async function handleSaveServices() {
    setLoading(true);
    setMessage(null);

    const res = await assignServicesAction(provider.id, assignedServices);

    setLoading(false);
    if (res.success) {
      setMessage({ text: 'تم تحديث قائمة الخدمات المسندة بنجاح!', isError: false });
    } else {
      setMessage({ text: res.error || 'فشل إسناد الخدمات', isError: true });
    }
  }

  return (
    <div className="space-y-6">
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

      {/* Main Form */}
      <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-5">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2">
          <span>⚙️</span> إعدادات الملف الشخصي والظهور
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              اسم الظهور للعملاء (بالعربية) *
            </label>
            <input
              name="displayNameAr"
              required
              defaultValue={provider.displayNameAr}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              اسم الظهور (بالإنجليزية)
            </label>
            <input
              name="displayNameEn"
              defaultValue={provider.displayNameEn || ''}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              حالة مقدم الخدمة بالجدول
            </label>
            <select
              name="status"
              defaultValue={provider.status}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white"
            >
              <option value="ACTIVE">نشط (متاح للحجوزات وجدول المواعيد)</option>
              <option value="INACTIVE">معطل مؤقتاً</option>
              <option value="ON_LEAVE">في إجازة</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">
            التخصصات والمهارات (مفصولة بفاصلة)
          </label>
          <input
            name="specialties"
            defaultValue={provider.specialties.join(', ')}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">
            النبذة التعريفية (تظهر في صفحة الحجز)
          </label>
          <textarea
            name="bioAr"
            rows={2}
            defaultValue={provider.bioAr || ''}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 bg-white"
          />
        </div>

        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#54453D]">
            <input
              type="checkbox"
              name="isPubliclyVisible"
              value="true"
              defaultChecked={provider.isPubliclyVisible}
              className="rounded text-[#54453D]"
            />
            <span>إتاحة الظهور والحجز الإلكتروني عبر الموقع وصفحة الصالون العامة</span>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ تعديلات الملف'}
          </button>
        </div>
      </form>

      {/* Services Assignment Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2">
              <span>💆‍♀️</span> قائمة الخدمات المسندة لمقدم الخدمة
            </h3>
            <p className="text-xs text-[#54453D]/60 mt-0.5">
              حدد الخدمات المصرح لمقدم الخدمة تقديمها للعملاء في نظام الحجوزات والمواعيد.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveServices}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#91B8C0]/30 text-[#2C4349] font-bold text-xs hover:bg-[#91B8C0]/50 transition-all disabled:opacity-50"
          >
            حفظ إسناد الخدمات ({assignedServices.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {DEFAULT_SALON_SERVICES.map((srv) => {
            const isAssigned = assignedServices.includes(srv.id);
            return (
              <button
                type="button"
                key={srv.id}
                onClick={() => toggleService(srv.id)}
                className={`p-3 rounded-2xl text-xs font-bold text-right transition-all border flex items-center justify-between ${
                  isAssigned
                    ? 'bg-[#54453D] text-white border-[#54453D] shadow-2xs'
                    : 'bg-[#FAF9F8] text-[#54453D]/70 border-[#54453D]/10 hover:border-[#54453D]/30'
                }`}
              >
                <span>{srv.name}</span>
                <span>{isAssigned ? '✓' : '+'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
