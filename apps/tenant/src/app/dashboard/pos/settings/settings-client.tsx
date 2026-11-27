'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PaymentMethodConfigDoc } from '@/lib/firebase-server';
import { upsertPaymentMethodConfigAction } from '../actions';

export function PosSettingsClient({
  paymentMethods,
  canManage,
}: {
  paymentMethods: PaymentMethodConfigDoc[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<PaymentMethodConfigDoc[]>(paymentMethods);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = (item: PaymentMethodConfigDoc) => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await upsertPaymentMethodConfigAction({
        method: item.method,
        isEnabled: item.isEnabled,
        requiresReference: item.requiresReference,
        labelAr: item.labelAr,
        labelEn: item.labelEn,
      });
      if (!res.success) {
        setError(res.error || 'تعذر حفظ الإعدادات.');
        return;
      }
      setMessage(`تم تحديث وسيلة الدفع (${item.labelAr}) بنجاح.`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#2D221D]">إعدادات وسائل الدفع</h1>
        <p className="text-xs text-[#6B5B52] mt-1">
          تفعيل وتعطيل وسائل الدفع المعتمدة في نقطة البيع وإلزامية رقم المرجع
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
          {error}
        </div>
      )}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div
            key={item.method}
            className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#2D221D]">{item.labelAr}</h2>
                <p className="text-[11px] text-[#6B5B52] font-mono">{item.method}</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isEnabled}
                  disabled={!canManage || isPending}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, isEnabled: e.target.checked };
                    setItems(next);
                  }}
                  className="rounded border-[#E6DDD6]"
                />
                <span>مفعّلة</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#54453D] mb-1">
                  التسمية بالعربية
                </label>
                <input
                  type="text"
                  value={item.labelAr}
                  disabled={!canManage}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, labelAr: e.target.value };
                    setItems(next);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#54453D] mb-1">
                  التسمية بالإنجليزية
                </label>
                <input
                  type="text"
                  value={item.labelEn}
                  disabled={!canManage}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, labelEn: e.target.value };
                    setItems(next);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#F0E8E2]">
              <label className="flex items-center gap-2 text-xs text-[#54453D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.requiresReference}
                  disabled={!canManage || isPending}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, requiresReference: e.target.checked };
                    setItems(next);
                  }}
                  className="rounded border-[#E6DDD6]"
                />
                <span>تتطلب رقم مرجع / إيصال</span>
              </label>

              {canManage && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSave(item)}
                  className="px-4 py-1.5 rounded-xl bg-[#54453D] text-white text-xs font-bold hover:bg-[#3F332C] disabled:opacity-50"
                >
                  حفظ
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

