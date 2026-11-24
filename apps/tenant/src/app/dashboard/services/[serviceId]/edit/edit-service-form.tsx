'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { updateServiceAction } from '../../actions';
import type {
  ServiceDoc,
  ServiceCategoryDoc,
  ProviderDoc,
  CommissionPolicyDoc,
} from '@/lib/firebase-server';

interface BranchOption {
  id: string;
  name: string;
  isMain: boolean;
}

interface EditServiceFormProps {
  service: ServiceDoc;
  categories: ServiceCategoryDoc[];
  branches: BranchOption[];
  providers: ProviderDoc[];
  commissionPolicies: CommissionPolicyDoc[];
  canManageCommission: boolean;
}

export function EditServiceForm({
  service,
  categories,
  branches,
  providers,
  commissionPolicies,
  canManageCommission,
}: EditServiceFormProps) {
  const router = useRouter();
  const updateActionWithId = updateServiceAction.bind(null, service.id);
  const [state, formAction, isPending] = useActionState(updateActionWithId, { success: false });

  // Pricing preview state
  const initialBaseSar = (service.basePriceHalalas / 100).toFixed(2);
  const [basePriceSar, setBasePriceSar] = useState<string>(initialBaseSar);
  const [taxMode, setTaxMode] = useState<string>(service.taxMode);

  // Selected branches state
  const [selectedBranches, setSelectedBranches] = useState<string[]>(service.assignedBranchIds);
  const [primaryBranchId, setPrimaryBranchId] = useState<string>(service.primaryBranchId);

  // Selected providers state
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    service.assignedProviderIds || []
  );

  useEffect(() => {
    if (state.success) {
      router.push(`/dashboard/services/${service.id}`);
    }
  }, [state.success, router, service.id]);

  const toggleBranch = (bId: string) => {
    if (selectedBranches.includes(bId)) {
      if (selectedBranches.length === 1) {
        alert('يجب تحديد فرع واحد على الأقل للخدمة');
        return;
      }
      const updated = selectedBranches.filter((id) => id !== bId);
      setSelectedBranches(updated);
      if (primaryBranchId === bId && updated.length > 0) {
        setPrimaryBranchId(updated[0]!);
      }
    } else {
      setSelectedBranches([...selectedBranches, bId]);
    }
  };

  const toggleProvider = (pId: string) => {
    if (selectedProviders.includes(pId)) {
      setSelectedProviders(selectedProviders.filter((id) => id !== pId));
    } else {
      setSelectedProviders([...selectedProviders, pId]);
    }
  };

  // Tax calculation preview
  const numBase = parseFloat(basePriceSar) || 0;
  let previewNet = numBase;
  let previewTax = 0;
  let previewTotal = numBase;

  if (taxMode === 'TAX_INCLUSIVE') {
    previewTotal = numBase;
    previewTax = Math.round((numBase * 1500) / 11500 * 100) / 100;
    previewNet = Math.round((previewTotal - previewTax) * 100) / 100;
  } else if (taxMode === 'TAX_EXCLUSIVE') {
    previewNet = numBase;
    previewTax = Math.round((numBase * 0.15) * 100) / 100;
    previewTotal = Math.round((previewNet + previewTax) * 100) / 100;
  } else {
    previewNet = numBase;
    previewTax = 0;
    previewTotal = numBase;
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          ⚠️ {state.error}
        </div>
      )}

      {/* 1. Basic Information */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>📝</span> 1. المعلومات الأساسية
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              اسم الخدمة (بالعربية) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="nameAr"
              required
              defaultValue={service.nameAr}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              اسم الخدمة (بالإنجليزية)
            </label>
            <input
              type="text"
              name="nameEn"
              dir="ltr"
              defaultValue={service.nameEn || ''}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden text-left"
            />
          </div>
        </div>
      </div>

      {/* 2. Description & Image */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>🖼️</span> 2. الوصف والصورة
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              وصف الخدمة (بالعربية)
            </label>
            <textarea
              name="descriptionAr"
              rows={3}
              defaultValue={service.descriptionAr || ''}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              وصف الخدمة (بالإنجليزية)
            </label>
            <textarea
              name="descriptionEn"
              rows={3}
              dir="ltr"
              defaultValue={service.descriptionEn || ''}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden text-left"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">
            رابط صورة الخدمة
          </label>
          <input
            type="url"
            name="imageUrl"
            dir="ltr"
            defaultValue={service.imageUrl || ''}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden text-left"
          />
        </div>
      </div>

      {/* 3. Category */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>📂</span> 3. تصنيف الخدمة
        </h3>
        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">
            التصنيف الحالي <span className="text-rose-500">*</span>
          </label>
          <select
            name="categoryId"
            defaultValue={service.categoryId}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameAr} {c.nameEn ? `(${c.nameEn})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Duration & Buffers */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>⏱️</span> 4. مدة التنفيذ والأوقات الاحتياطية
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              مدة التنفيذ (بالدقائق) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="durationMinutes"
              required
              defaultValue={service.durationMinutes}
              min={5}
              max={720}
              step={5}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              احتياطي قبل الخدمة (دقيقة)
            </label>
            <input
              type="number"
              name="bufferBeforeMinutes"
              defaultValue={service.bufferBeforeMinutes}
              min={0}
              max={60}
              step={5}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              احتياطي بعد الخدمة (دقيقة)
            </label>
            <input
              type="number"
              name="bufferAfterMinutes"
              defaultValue={service.bufferAfterMinutes}
              min={0}
              max={60}
              step={5}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden font-mono"
            />
          </div>
        </div>
      </div>

      {/* 5. Pricing & Tax */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>💰</span> 5. التسعير والضريبة
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              السعر الأساسي (بالريال السعودي) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="basePriceSar"
              required
              value={basePriceSar}
              onChange={(e) => setBasePriceSar(e.target.value)}
              min={0}
              step="0.01"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              نظام احتساب الضريبة
            </label>
            <select
              name="taxMode"
              value={taxMode}
              onChange={(e) => setTaxMode(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            >
              <option value="TAX_INCLUSIVE">شامل ضريبة القيمة المضافة (15%)</option>
              <option value="TAX_EXCLUSIVE">غير شامل للضريبة (تُضاف 15% عند الفاتورة)</option>
              <option value="TAX_EXEMPT">معفى من ضريبة القيمة المضافة (0%)</option>
            </select>
          </div>
        </div>

        <div className="bg-[#91B8C0]/10 p-4 rounded-2xl border border-[#91B8C0]/25 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[11px] text-[#54453D]/70 block">السعر الصافي</span>
            <span className="text-sm font-bold font-mono text-[#54453D]">
              {previewNet.toFixed(2)} ر.س
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#54453D]/70 block">مبلغ الضريبة (15%)</span>
            <span className="text-sm font-bold font-mono text-[#54453D]">
              {previewTax.toFixed(2)} ر.س
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#2C4349] font-bold block">إجمالي السعر للعميل</span>
            <span className="text-sm font-bold font-mono text-[#2C4349]">
              {previewTotal.toFixed(2)} ر.س
            </span>
          </div>
        </div>
      </div>

      {/* 6. Branch Availability */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>🏢</span> 6. الفروع المتاحة
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {branches.map((b) => {
            const isChecked = selectedBranches.includes(b.id);
            return (
              <label
                key={b.id}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-[#54453D]/5 border-[#54453D] font-bold text-[#54453D]'
                    : 'bg-white border-[#54453D]/10 text-[#54453D]/70 hover:bg-[#54453D]/2'
                }`}
              >
                <input
                  type="checkbox"
                  name="assignedBranchIds"
                  value={b.id}
                  checked={isChecked}
                  onChange={() => toggleBranch(b.id)}
                  className="w-4 h-4 rounded text-[#54453D] focus:ring-0"
                />
                <span>{b.name}</span>
                {b.isMain && (
                  <span className="text-[10px] bg-[#91B8C0]/25 text-[#2C4349] px-2 py-0.5 rounded-md mr-auto font-medium">
                    الفرع الرئيسي
                  </span>
                )}
              </label>
            );
          })}
        </div>
        <div>
          <label className="block text-xs font-bold text-[#54453D] mb-1.5">
            الفرع المرجعي الرئيسي
          </label>
          <select
            name="primaryBranchId"
            value={primaryBranchId}
            onChange={(e) => setPrimaryBranchId(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
          >
            {branches
              .filter((b) => selectedBranches.includes(b.id))
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.isMain ? '(الرئيسي)' : ''}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* 7. Provider Assignments */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>✂️</span> 7. تعيين مقدمي الخدمة
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {providers.map((p) => {
            const isChecked = selectedProviders.includes(p.id);
            const isBranchCompatible = p.assignedBranchIds.some((bId) =>
              selectedBranches.includes(bId)
            );

            return (
              <label
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  !isBranchCompatible
                    ? 'opacity-40 bg-gray-50 border-gray-200 cursor-not-allowed'
                    : isChecked
                    ? 'bg-[#54453D]/5 border-[#54453D] font-bold text-[#54453D]'
                    : 'bg-white border-[#54453D]/10 text-[#54453D]/70 hover:bg-[#54453D]/2'
                }`}
              >
                <input
                  type="checkbox"
                  name="assignedProviderIds"
                  value={p.id}
                  disabled={!isBranchCompatible}
                  checked={isChecked}
                  onChange={() => toggleProvider(p.id)}
                  className="w-4 h-4 rounded text-[#54453D] focus:ring-0"
                />
                <span>{p.displayNameAr}</span>
                {!isBranchCompatible && (
                  <span className="text-[10px] text-rose-500 mr-auto font-medium">
                    غير متاح بفروع الخدمة
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* 8. Commission Policy */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>📋</span> 8. سياسة العمولة المرتبطة
        </h3>
        {canManageCommission ? (
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              سياسة العمولة
            </label>
            <select
              name="commissionPolicyId"
              defaultValue={service.commissionPolicyId || ''}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            >
              <option value="">بدون سياسة مخصصة (تُطبق سياسة مقدم الخدمة الافتراضية)</option>
              {commissionPolicies.map((pol) => (
                <option key={pol.id} value={pol.id}>
                  {pol.nameAr} ({pol.basis === 'PERCENTAGE_OF_REVENUE' ? `${(pol.rateBps ?? 0) / 100}%` : `${(pol.fixedAmountHalalas ?? 0) / 100} ر.س مقطوع`})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-xs text-[#54453D]/60 py-2">
            إدارة سياسات العمولات مقتصرة على مالك المنشأة (OWNER).
          </p>
        )}
      </div>

      {/* 9. Status & Display Order */}
      <div className="bg-white p-6 rounded-3xl border border-[#54453D]/10 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#54453D] flex items-center gap-2 border-b border-[#54453D]/10 pb-3">
          <span>⚙️</span> 9. الحالة والترتيب
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              ترتيب العرض
            </label>
            <input
              type="number"
              name="displayOrder"
              defaultValue={service.displayOrder}
              min={0}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#54453D] mb-1.5">
              حالة الخدمة
            </label>
            <select
              name="isActive"
              defaultValue={service.isActive ? 'true' : 'false'}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#54453D]/20 focus:border-[#54453D] focus:outline-hidden bg-white"
            >
              <option value="true">مفعّلة</option>
              <option value="false">معطّلة</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#54453D]/10">
        <Link
          href={`/dashboard/services/${service.id}`}
          className="px-5 py-2.5 text-xs font-bold text-[#54453D]/70 hover:bg-[#54453D]/5 rounded-xl transition-all"
        >
          إلغاء
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-7 py-2.5 bg-[#54453D] text-white text-xs font-bold rounded-xl hover:bg-[#3D322C] transition-all disabled:opacity-50"
        >
          {isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>
      </div>
    </form>
  );
}

