'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toggleServiceStatusAction, deleteServiceAction } from '../actions';

interface ServiceDetailActionsProps {
  serviceId: string;
  isActive: boolean;
  canManage: boolean;
  isOwner: boolean;
}

export function ServiceDetailActions({
  serviceId,
  isActive,
  canManage,
  isOwner,
}: ServiceDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleServiceStatusAction(serviceId, isActive);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟ سيتم أرشفتها وإزالتها من العرض العام.')) return;

    startTransition(async () => {
      const res = await deleteServiceAction(serviceId);
      if (res.success) {
        router.push('/dashboard/services');
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {canManage && (
        <>
          <Link
            href={`/dashboard/services/${serviceId}/edit`}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#54453D] hover:bg-[#3D322C] rounded-xl transition-all shadow-xs"
          >
            ✏️ تعديل الخدمة
          </Link>
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {isPending ? '...' : isActive ? 'تعطيل الخدمة' : 'تفعيل الخدمة'}
          </button>
        </>
      )}
      {isOwner && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3.5 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
        >
          🗑️ حذف الخدمة
        </button>
      )}
    </div>
  );
}

