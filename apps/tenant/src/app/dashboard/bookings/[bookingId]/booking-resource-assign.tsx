'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type EligibleResourceAvailability } from '@/lib/firebase-server';
import {
  assignBookingResourceAction,
  listEligibleResourcesAction,
} from '../../resources/actions';

export function BookingResourceAssign({
  bookingId,
  branchId,
  serviceId,
  scheduledStartTime,
  scheduledEndTime,
  currentResourceId,
  currentResourceNameAr,
  canAssign,
  isEditableStatus,
}: {
  bookingId: string;
  branchId: string;
  serviceId: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  currentResourceId: string | null;
  currentResourceNameAr: string | null;
  canAssign: boolean;
  isEditableStatus: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [resources, setResources] = useState<EligibleResourceAvailability[]>([]);
  const [selectedId, setSelectedId] = useState(currentResourceId || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleOpenEdit() {
    setErrorMsg(null);
    setEditing(true);
    startTransition(async () => {
      const res = await listEligibleResourcesAction({
        branchId,
        serviceId,
        startTimeIso: scheduledStartTime,
        endTimeIso: scheduledEndTime,
      });
      if (!res.success) {
        setErrorMsg(res.error || 'تعذر جلب الموارد المتاحة.');
        return;
      }
      setResources(res.resources || []);
    });
  }

  function handleSave() {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await assignBookingResourceAction(bookingId, selectedId || null);
      if (!res.success) {
        setErrorMsg(res.error || 'تعذر تعيين المورد.');
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <div>
      <span className="text-[#6B5B52] block mb-1">الكرسي / المورد المخصص:</span>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-sm text-[#54453D]">
          {currentResourceNameAr || 'غير معين'}
        </span>
        {canAssign && isEditableStatus && !editing && (
          <button
            type="button"
            onClick={handleOpenEdit}
            className="px-2.5 py-1 rounded-xl border border-[#E6DDD6] text-[11px] font-bold text-[#54453D] hover:bg-[#FAF6F3]"
          >
            {currentResourceId ? 'تغيير المورد' : 'تعيين مورد'}
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-2 p-3 rounded-2xl bg-[#FAF6F3] border border-[#E6DDD6] space-y-2">
          {errorMsg && <p className="text-[11px] font-bold text-red-700">{errorMsg}</p>}
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-[#9A8C83] bg-white text-xs"
          >
            <option value="">بدون مورد</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id} disabled={!r.isAvailableForWindow && r.id !== currentResourceId}>
                {r.nameAr} {r.isAvailableForWindow ? '(متاح)' : '(مشغول في هذا الوقت)'}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              className="px-3 py-1.5 rounded-xl bg-[#54453D] text-white text-[11px] font-bold hover:bg-[#3f332d] disabled:opacity-50"
            >
              {isPending ? 'جاري الحفظ...' : 'حفظ المورد'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 rounded-xl border border-[#E6DDD6] bg-white text-[11px] font-bold text-[#54453D]"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
