'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  RESOURCE_TYPE_LABELS_AR,
  RESOURCE_STATUS_LABELS_AR,
  type ResourceDoc,
  type ResourceType,
  type ResourceStatus,
  type BranchDoc,
  type ServiceDoc,
  type ServiceCategoryDoc,
} from '@rashx/database';
import {
  createResourceAction,
  updateResourceAction,
  changeResourceStatusAction,
} from './actions';

const STATUS_BADGE: Record<ResourceStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
  MAINTENANCE: 'bg-amber-50 text-amber-800 border-amber-200',
};

export function ResourcesClient({
  initialResources,
  branches,
  services,
  categories,
  canManage,
  selectedBranchId,
}: {
  initialResources: ResourceDoc[];
  branches: BranchDoc[];
  services: ServiceDoc[];
  categories: ServiceCategoryDoc[];
  canManage: boolean;
  selectedBranchId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ResourceDoc | null>(null);

  // Modal fields
  const [branchId, setBranchId] = useState(selectedBranchId || branches[0]?.id || '');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<ResourceType>('BARBER_CHAIR');
  const [status, setStatus] = useState<ResourceStatus>('ACTIVE');
  const [supportsAll, setSupportsAll] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const branchMap = new Map(branches.map((b) => [b.id, b.name]));
  const serviceMap = new Map(services.map((s) => [s.id, s.nameAr]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.nameAr]));

  function openCreateModal() {
    setEditing(null);
    setBranchId(selectedBranchId || branches[0]?.id || '');
    setNameAr('');
    setNameEn('');
    setCode('');
    setType('BARBER_CHAIR');
    setStatus('ACTIVE');
    setSupportsAll(true);
    setSelectedServiceIds([]);
    setSelectedCategoryIds([]);
    setDescription('');
    setErrorMsg(null);
    setModalOpen(true);
  }

  function openEditModal(res: ResourceDoc) {
    setEditing(res);
    setBranchId(res.branchId);
    setNameAr(res.nameAr);
    setNameEn(res.nameEn || '');
    setCode(res.code || '');
    setType(res.type);
    setStatus(res.status);
    setSupportsAll(res.supportsAllBranchServices);
    setSelectedServiceIds(res.supportedServiceIds || []);
    setSelectedCategoryIds(res.supportedCategoryIds || []);
    setDescription(res.description || '');
    setErrorMsg(null);
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const fd = new FormData();
    fd.set('branchId', branchId);
    fd.set('nameAr', nameAr);
    fd.set('nameEn', nameEn);
    fd.set('code', code);
    fd.set('type', type);
    fd.set('status', status);
    fd.set('supportsAllBranchServices', String(supportsAll));
    fd.set('description', description);
    for (const sid of selectedServiceIds) fd.append('supportedServiceIds', sid);
    for (const cid of selectedCategoryIds) fd.append('supportedCategoryIds', cid);

    startTransition(async () => {
      const res = editing
        ? await updateResourceAction(editing.id, fd)
        : await createResourceAction(fd);

      if (!res.success) {
        setErrorMsg(res.error || 'حدث خطأ أثناء حفظ المورد.');
        return;
      }
      setModalOpen(false);
      setSuccessMsg(editing ? 'تم تحديث بيانات المورد بنجاح.' : 'تم إضافة المورد بنجاح.');
      router.refresh();
    });
  }

  function handleQuickStatus(resId: string, nextStatus: ResourceStatus) {
    setErrorMsg(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const res = await changeResourceStatusAction(resId, nextStatus);
      if (!res.success) {
        setErrorMsg(res.error || 'تعذر تغيير حالة المورد.');
        return;
      }
      setSuccessMsg('تم تحديث حالة المورد. المواعيد التاريخية والحالية محفوظة.');
      router.refresh();
    });
  }

  function toggleId(list: string[], id: string, setter: (next: string[]) => void) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  const branchServices = services.filter((s) => s.assignedBranchIds.includes(branchId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#54453D]">الكراسي والموارد التشغيلية</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF9F8] border border-[#E6DDD6] text-xs font-semibold text-[#6B5B52]">
              {initialResources.length} مورد
            </span>
          </div>
          <p className="text-xs text-[#6B5B52] mt-1">
            إدارة كراسي الحلاقة والتصفيف، محطات الغسيل والأظافر، وغرف العناية لكل فرع مع الحماية من التعارض.
          </p>
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#54453D]/90 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
          >
            + إضافة كرسي / مورد جديد
          </button>
        ) : (
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
            وضع العرض فقط (يتطلب صلاحية إدارة الموارد)
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6]">
          <span className="text-[11px] text-[#6B5B52] block">الموارد النشطة</span>
          <span className="text-xl font-bold text-emerald-700 font-mono">
            {initialResources.filter((r) => r.status === 'ACTIVE').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6]">
          <span className="text-[11px] text-[#6B5B52] block">قيد الصيانة</span>
          <span className="text-xl font-bold text-amber-700 font-mono">
            {initialResources.filter((r) => r.status === 'MAINTENANCE').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E6DDD6]">
          <span className="text-[11px] text-[#6B5B52] block">غير نشطة</span>
          <span className="text-xl font-bold text-slate-600 font-mono">
            {initialResources.filter((r) => r.status === 'INACTIVE').length}
          </span>
        </div>
      </div>

      {/* Resource Grid */}
      {initialResources.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-[#E6DDD6] text-center space-y-2">
          <p className="text-sm font-bold text-[#54453D]">لا توجد كراسي أو موارد مسجلة بعد</p>
          <p className="text-xs text-[#6B5B52]">
            أضف كراسي الحلاقة أو غرف المعالجة لربطها بالخدمات وتجنب التداخل في جدول الصالون.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialResources.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-[#E6DDD6] p-5 shadow-xs flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#54453D]">{res.nameAr}</h3>
                      {res.code && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF9F8] border border-[#E6DDD6] font-mono text-[10px] text-[#6B5B52]">
                          {res.code}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B5B52] mt-0.5">
                      {RESOURCE_TYPE_LABELS_AR[res.type]} • {branchMap.get(res.branchId) || res.branchId}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_BADGE[res.status]}`}>
                    {RESOURCE_STATUS_LABELS_AR[res.status]}
                  </span>
                </div>

                {res.description && (
                  <p className="text-xs text-[#6B5B52] leading-relaxed">{res.description}</p>
                )}

                <div className="pt-2 border-t border-[#E6DDD6]/60 text-[11px] text-[#6B5B52]">
                  {res.supportsAllBranchServices ? (
                    <span className="font-semibold text-emerald-700">مؤهل لكافة خدمات الفرع</span>
                  ) : (
                    <div className="space-y-1">
                      <span className="block font-semibold text-[#54453D]">الخدمات / التصنيفات المؤهلة:</span>
                      <div className="flex flex-wrap gap-1">
                        {res.supportedCategoryIds.map((cid) => (
                          <span key={cid} className="px-2 py-0.5 rounded-full bg-[#FAF9F8] border border-[#E6DDD6] text-[10px]">
                            تصنيف: {categoryMap.get(cid) || cid}
                          </span>
                        ))}
                        {res.supportedServiceIds.map((sid) => (
                          <span key={sid} className="px-2 py-0.5 rounded-full bg-[#FAF9F8] border border-[#E6DDD6] text-[10px]">
                            {serviceMap.get(sid) || sid}
                          </span>
                        ))}
                        {res.supportedCategoryIds.length === 0 && res.supportedServiceIds.length === 0 && (
                          <span className="text-amber-700">لم تُحدد خدمات مؤهلة بعد</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="pt-3 border-t border-[#E6DDD6] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {res.status !== 'ACTIVE' && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleQuickStatus(res.id, 'ACTIVE')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                      >
                        تفعيل
                      </button>
                    )}
                    {res.status !== 'MAINTENANCE' && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleQuickStatus(res.id, 'MAINTENANCE')}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 font-bold hover:bg-amber-200/70 disabled:opacity-50 cursor-pointer"
                      >
                        صيانة
                      </button>
                    )}
                    {res.status !== 'INACTIVE' && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleQuickStatus(res.id, 'INACTIVE')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold hover:bg-slate-200/70 disabled:opacity-50 cursor-pointer"
                      >
                        تعطيل
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => openEditModal(res)}
                    className="px-2.5 py-1 rounded-lg border border-[#E6DDD6] text-[#54453D] font-bold hover:bg-[#FAF9F8] cursor-pointer"
                  >
                    تعديل
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Resource Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-[#E6DDD6] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#54453D]">
                {editing ? 'تعديل المورد / الكرسي' : 'إضافة مورد / كرسي جديد'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-xs font-bold text-[#6B5B52] hover:text-[#54453D] cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#54453D] mb-1">الفرع *</label>
                  <select
                    value={branchId}
                    disabled={Boolean(editing)}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] bg-white disabled:bg-[#FAF9F8]"
                    required
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#54453D] mb-1">نوع المورد *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ResourceType)}
                    className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] bg-white"
                  >
                    {(Object.keys(RESOURCE_TYPE_LABELS_AR) as ResourceType[]).map((t) => (
                      <option key={t} value={t}>
                        {RESOURCE_TYPE_LABELS_AR[t]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#54453D] mb-1">اسم المورد بالعربية *</label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: كرسي الحلاقة 1"
                    className="w-full px-3 py-2 rounded-xl border border-[#9A8C83]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#54453D] mb-1">الرمز المختصر (Code)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="مثال: C-01"
                    className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#54453D] mb-1">الاسم بالإنجليزية (اختياري)</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Barber Chair 1"
                    className="w-full px-3 py-2 rounded-xl border border-[#9A8C83]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#54453D] mb-1">الحالة التشغيلية</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ResourceStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-[#9A8C83] bg-white"
                  >
                    {(Object.keys(RESOURCE_STATUS_LABELS_AR) as ResourceStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {RESOURCE_STATUS_LABELS_AR[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F8] border border-[#E6DDD6] space-y-3">
                <label className="flex items-center gap-2 font-bold text-[#54453D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportsAll}
                    onChange={(e) => setSupportsAll(e.target.checked)}
                  />
                  <span>يدعم جميع خدمات الفرع النشطة</span>
                </label>

                {!supportsAll && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E6DDD6]">
                    <div>
                      <span className="block font-bold text-[#54453D] mb-1">التصنيفات المدعومة</span>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {categories.map((cat) => (
                          <label key={cat.id} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategoryIds.includes(cat.id)}
                              onChange={() =>
                                toggleId(selectedCategoryIds, cat.id, setSelectedCategoryIds)
                              }
                            />
                            <span>{cat.nameAr}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block font-bold text-[#54453D] mb-1">الخدمات المدعومة</span>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {branchServices.map((srv) => (
                          <label key={srv.id} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedServiceIds.includes(srv.id)}
                              onChange={() =>
                                toggleId(selectedServiceIds, srv.id, setSelectedServiceIds)
                              }
                            />
                            <span>{srv.nameAr}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#54453D] mb-1">وصف / ملاحظات تشغيلية</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#9A8C83]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6DDD6] text-[#6B5B52] font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#54453D] text-white font-bold hover:bg-[#54453D]/90 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'إضافة المورد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

