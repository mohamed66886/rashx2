'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SupplierDoc } from '@/lib/firebase-server';
import { createSupplierAction, updateSupplierStatusAction } from '../actions';

export function SuppliersClient({
  suppliers,
  canManage,
  canReadNotes,
}: {
  suppliers: SupplierDoc[];
  canManage: boolean;
  canReadNotes: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createSupplierAction({
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        vatNumber: vatNumber.trim() || null,
        privateNotes: canReadNotes ? privateNotes.trim() : undefined,
      });
      if (!res.success) {
        setError(res.error || 'تعذر إضافة المورد.');
        return;
      }
      setShowForm(false);
      setName('');
      setPhone('');
      setVatNumber('');
      setPrivateNotes('');
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2D221D]">الموردون والذمم الدائنة</h1>
          <p className="text-xs text-[#6B5B52] mt-1">
            إدارة بيانات الموردين وسجل المشتريات والفواتير والمدفوعات
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-xl bg-[#54453D] text-white text-xs font-bold"
          >
            + إضافة مورد جديد
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
          {error}
        </div>
      )}

      {showForm && canManage && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border border-[#E6DDD6] p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">اسم المورد</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">رقم الجوال (السعودي)</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">مسؤول التواصل</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">الرقم الضريبي (اختياري)</label>
              <input
                type="text"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs font-mono"
              />
            </div>
            {canReadNotes && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-1">ملاحظات تجارية خاصة (مقيدة)</label>
                <input
                  type="text"
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DDD6] bg-[#FAF6F3] text-xs"
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
          >
            {isPending ? 'جاري الحفظ...' : 'حفظ المورد'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-[#E6DDD6] overflow-hidden">
        {suppliers.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#6B5B52]">لا يوجد موردون مسجلون.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF6F3] text-[#54453D] border-b border-[#E6DDD6]">
                <tr>
                  <th className="py-3 px-4 font-bold">المورد</th>
                  <th className="py-3 px-4 font-bold">الجوال</th>
                  <th className="py-3 px-4 font-bold">الرقم الضريبي</th>
                  <th className="py-3 px-4 font-bold">الحالة</th>
                  <th className="py-3 px-4 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E2]">
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 px-4 font-bold text-[#2D221D]">{s.name}</td>
                    <td className="py-3 px-4" dir="ltr">
                      {s.displayPhone}
                    </td>
                    <td className="py-3 px-4 font-mono">{s.vatNumber || '—'}</td>
                    <td className="py-3 px-4">{s.status}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <Link
                        href={`/dashboard/inventory/suppliers/${s.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF6F3] border border-[#E6DDD6] font-bold text-[#54453D]"
                      >
                        التفاصيل والذمم
                      </Link>
                      {canManage && s.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() => {
                            startTransition(async () => {
                              await updateSupplierStatusAction({
                                supplierId: s.id,
                                status: 'ARCHIVED',
                              });
                              router.refresh();
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 font-bold"
                        >
                          أرشفة
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

