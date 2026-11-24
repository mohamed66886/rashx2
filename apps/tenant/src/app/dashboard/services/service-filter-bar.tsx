'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import type { ServiceCategoryDoc } from '@/lib/firebase-server';

interface ServiceFilterBarProps {
  categories: ServiceCategoryDoc[];
  branches: Array<{ id: string; name: string }>;
}

export function ServiceFilterBar({ categories, branches }: ServiceFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('q') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentBranch = searchParams.get('branch') || '';
  const currentStatus = searchParams.get('status') || '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/dashboard/services?${params.toString()}`);
    });
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-[#54453D]/10 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3">
      {/* Search Input */}
      <div>
        <label className="block text-[11px] font-bold text-[#54453D]/70 mb-1">
          البحث بالاسم أو الوصف
        </label>
        <input
          type="text"
          placeholder="ابحث عن خدمة..."
          defaultValue={currentSearch}
          onChange={(e) => updateParam('q', e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-xl border border-[#54453D]/15 focus:border-[#54453D] focus:outline-hidden"
        />
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-[11px] font-bold text-[#54453D]/70 mb-1">
          التصنيف
        </label>
        <select
          value={currentCategory}
          onChange={(e) => updateParam('category', e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-xl border border-[#54453D]/15 focus:border-[#54453D] focus:outline-hidden bg-white"
        >
          <option value="">جميع التصنيفات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameAr}
            </option>
          ))}
        </select>
      </div>

      {/* Branch Filter */}
      <div>
        <label className="block text-[11px] font-bold text-[#54453D]/70 mb-1">
          الفرع
        </label>
        <select
          value={currentBranch}
          onChange={(e) => updateParam('branch', e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-xl border border-[#54453D]/15 focus:border-[#54453D] focus:outline-hidden bg-white"
        >
          <option value="">جميع الفروع</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-[11px] font-bold text-[#54453D]/70 mb-1">
          الحالة
        </label>
        <select
          value={currentStatus}
          onChange={(e) => updateParam('status', e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-xl border border-[#54453D]/15 focus:border-[#54453D] focus:outline-hidden bg-white"
        >
          <option value="">الكل (مفعّل ومعطّل)</option>
          <option value="active">مفعّل فقط</option>
          <option value="inactive">معطّل فقط</option>
        </select>
      </div>
    </div>
  );
}

