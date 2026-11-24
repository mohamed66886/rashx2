'use client';

import { useTransition } from 'react';
import { toggleServiceStatusAction } from './actions';

export function ServiceStatusToggle({
  serviceId,
  isActive,
  canManage,
}: {
  serviceId: string;
  isActive: boolean;
  canManage: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleServiceStatusAction(serviceId, isActive);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  if (!canManage) {
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        مفعّل
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
        معطّل
      </span>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
        }`}
      />
      <span>{isPending ? '...' : isActive ? 'مفعّل' : 'معطّل'}</span>
    </button>
  );
}

