'use client';

import { useState } from 'react';
import type { SeoSettingsDoc } from '@rashx/database';
import { saveSeoSettingsAction } from '../actions';
import { Field, FormMessage, SaveBar, Section, Switch, inputCls } from '../_components/settings-ui';

function Counter({ value, max, ideal }: { value: number; max: number; ideal?: number }) {
  const over = ideal ? value > ideal : false;
  return (
    <span className={over ? 'font-bold text-(--rx-danger)' : ''}>
      {value}/{max}
    </span>
  );
}

export function SeoForm({ seoSettings }: { seoSettings: SeoSettingsDoc | null }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [title, setTitle] = useState(seoSettings?.siteTitle || '');
  const [desc, setDesc] = useState(seoSettings?.siteDescription || '');
  const [keywords, setKeywords] = useState<string[]>(seoSettings?.keywords || []);
  const [draft, setDraft] = useState('');
  const [indexing, setIndexing] = useState(seoSettings?.indexingEnabled ?? false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await saveSeoSettingsAction(formData);

    setLoading(false);
    if (result.success) {
      setMessage({ text: 'تم حفظ إعدادات الملف العام ومحركات البحث بنجاح!', isError: false });
    } else {
      setMessage({ text: result.error || 'فشل الحفظ', isError: true });
    }
  }

  function commitDraft() {
    const parts = draft.split(/[,،]/).map((k) => k.trim()).filter(Boolean);
    if (parts.length) setKeywords((prev) => Array.from(new Set([...prev, ...parts])));
    setDraft('');
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="space-y-5">
        <FormMessage message={message} />

        <Section title="خصوصية بياناتك المالية" tone="cream">
          <p className="text-sm leading-6">
            هذه الإعدادات خاصة بصفحة الحجز العامة فقط. لا يظهر في محركات البحث أبدًا السجل التجاري، الرقم الضريبي،
            الحسابات المالية، ولا بيانات المالك الشخصية.
          </p>
        </Section>

        <Section title="ما يظهر في نتائج البحث">
          <div className="space-y-4">
            <Field label="عنوان صفحة الصالون" required htmlFor="siteTitle" aside={<Counter value={title.length} max={70} ideal={60} />} hint="الأفضل ألا يتجاوز 60 حرفًا ليظهر كاملًا في Google.">
              <input id="siteTitle" name="siteTitle" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={70} className={inputCls} />
            </Field>

            <Field label="الوصف التعريفي" required htmlFor="siteDescription" aside={<Counter value={desc.length} max={160} />} hint="نبذة موجزة تظهر أسفل العنوان.">
              <textarea id="siteDescription" name="siteDescription" value={desc} onChange={(e) => setDesc(e.target.value)} required rows={3} maxLength={160} className={`${inputCls} resize-none leading-6`} />
            </Field>
          </div>
        </Section>

        <Section title="الكلمات المفتاحية" desc="اكتب الكلمة واضغط Enter أو الفاصلة لإضافتها.">
          <input type="hidden" name="keywords" value={keywords.join(',')} />
          <div className="flex flex-wrap gap-2 rounded-lg border border-(--rx-line) bg-white p-2.5 focus-within:border-(--rx-ink)">
            {keywords.map((k) => (
              <span key={k} className="flex items-center gap-1.5 rounded-full bg-(--rx-peach) py-1 ps-3 pe-1.5 text-[13px] font-medium">
                {k}
                <button
                  type="button"
                  onClick={() => setKeywords((prev) => prev.filter((x) => x !== k))}
                  aria-label={`حذف ${k}`}
                  className="grid size-5 place-items-center rounded-full bg-white/70 text-xs hover:bg-white focus-visible:outline-2 focus-visible:outline-(--rx-ink)"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',' || e.key === '،') {
                  e.preventDefault();
                  commitDraft();
                } else if (e.key === 'Backspace' && !draft && keywords.length) {
                  setKeywords((prev) => prev.slice(0, -1));
                }
              }}
              onBlur={commitDraft}
              aria-label="إضافة كلمة مفتاحية"
              placeholder={keywords.length ? '' : 'صالون نسائي، صبغات شعر، تصفيف، الرياض'}
              className="min-w-40 flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-(--rx-ink)/35"
            />
          </div>
        </Section>

        <Section title="الفهرسة في محركات البحث" tone={indexing ? 'blue' : 'white'}>
          <Switch
            name="indexingEnabled"
            checked={indexing}
            onChange={setIndexing}
            title="السماح لمحركات البحث بفهرسة صفحة الصالون العامة"
            desc="عند التفعيل يستطيع Googlebot أرشفة قائمة الخدمات وعنوان الفرع ليصل إليك العملاء."
          />
        </Section>

        <SaveBar loading={loading} label="حفظ إعدادات الظهور" />
      </div>

      {/* Google preview */}
      <aside aria-label="معاينة نتيجة Google" className="space-y-3 lg:sticky lg:top-6">
        <div className="rounded-xl border border-(--rx-line) bg-white p-5">
          <div className="mb-4 flex items-center gap-2 rounded-full border border-(--rx-line) bg-(--rx-cream) px-4 py-2 text-xs text-(--rx-ink)/65">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            {keywords[0] || 'صالون قريب مني'}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="grid size-6 place-items-center rounded-full bg-(--rx-peach) text-[10px] font-extrabold">Rx</span>
            <span dir="ltr" className="text-(--rx-ink)/70">rashx.org › salon</span>
          </div>
          <p className="mt-2 line-clamp-2 min-h-6 text-lg font-bold leading-6 text-(--rx-ink)">
            {title || 'عنوان صفحة الصالون'}
          </p>
          <p className="mt-1.5 line-clamp-3 min-h-12 text-[13px] leading-6 text-(--rx-ink)/75">
            {desc || 'يظهر هنا الوصف التعريفي الذي تكتبه لصالونك.'}
          </p>
        </div>

        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold ${
            indexing ? 'border-(--rx-ink) bg-(--rx-blue)' : 'border-(--rx-line) bg-(--rx-cream)'
          }`}
        >
          <span aria-hidden="true" className={`size-2.5 rounded-full ${indexing ? 'bg-(--rx-ink)' : 'bg-(--rx-ink)/30'}`} />
          {indexing ? 'صفحتك مفتوحة للفهرسة' : 'صفحتك مخفية عن محركات البحث'}
        </div>
      </aside>
    </form>
  );
}
