'use client';

import { useEffect, useRef, useState } from 'react';
import type { SeoSettingsDoc } from '@rashx/database';
import { saveSeoSettingsAction } from '../actions';
import { Field, Row, Switch, inputCls, textareaCls } from '../_components/settings-ui';
import { SettingsForm, useFormValues } from '../_components/settings-form';

const FORM_ID = 'seo-settings-form';
const PREVIEW_FIELDS = ['siteTitle', 'siteDescription', 'keywords', 'indexingEnabled'] as const;

function Counter({ value, max, ideal }: { value: number; max: number; ideal?: number }) {
  const over = ideal ? value > ideal : false;
  return <span className={over ? 'font-bold text-(--rx-danger)' : ''}>{value}/{max}</span>;
}

/** Tags input: its own tiny state; reports changes to the form through a hidden input. */
function KeywordsInput({ initial }: { initial: string[] }) {
  const [keywords, setKeywords] = useState(initial);
  const [draft, setDraft] = useState('');
  const [rev, setRev] = useState(0); // bumps only on user edits (StrictMode-safe)
  const hidden = useRef<HTMLInputElement>(null);
  const baseline = useRef(initial);
  const current = useRef(keywords);
  current.current = keywords;

  const edit = (updater: (prev: string[]) => string[]) => {
    setKeywords(updater);
    setRev((r) => r + 1);
  };

  // tell the form (dirty flag + preview) that the hidden value changed
  useEffect(() => {
    if (rev > 0) hidden.current?.dispatchEvent(new Event('input', { bubbles: true }));
  }, [rev]);

  // reset button / successful save
  useEffect(() => {
    const form = hidden.current?.form;
    if (!form) return;
    const onReset = () => setKeywords(baseline.current);
    const onSaved = () => {
      baseline.current = current.current;
    };
    form.addEventListener('reset', onReset);
    form.addEventListener('rx-saved', onSaved);
    return () => {
      form.removeEventListener('reset', onReset);
      form.removeEventListener('rx-saved', onSaved);
    };
  }, []);

  const commit = () => {
    const parts = draft.split(/[,،]/).map((k) => k.trim()).filter(Boolean);
    if (parts.length) edit((prev) => Array.from(new Set([...prev, ...parts])));
    setDraft('');
  };

  return (
    <>
      <input ref={hidden} type="hidden" name="keywords" value={keywords.join(',')} readOnly />
      <div className="flex flex-wrap gap-2 rounded-xl border-[1.5px] border-[#9A8C83] bg-white p-2.5 focus-within:border-(--rx-ink) focus-within:ring-[3px] focus-within:ring-(--rx-peach)">
        {keywords.map((k) => (
          <span key={k} className="flex items-center gap-1.5 rounded-full bg-(--rx-peach) py-1 ps-3 pe-1.5 text-[13px] font-medium">
            {k}
            <button type="button" onClick={() => edit((p) => p.filter((x) => x !== k))} aria-label={`حذف ${k}`} className="grid size-5 place-items-center rounded-full bg-white/70 text-xs hover:bg-white cursor-pointer">×</button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',' || e.key === '،') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Backspace' && !draft && keywords.length) {
              edit((p) => p.slice(0, -1));
            }
          }}
          onBlur={commit}
          aria-label="إضافة كلمة مفتاحية"
          placeholder={keywords.length ? '' : 'صالون نسائي، صبغات شعر، تصفيف، الرياض'}
          className="min-w-40 flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-[#8A7B72]"
        />
      </div>
    </>
  );
}

function TitleCounter({ initial }: { initial: string }) {
  const v = useFormValues(FORM_ID, ['siteTitle'] as const, { siteTitle: initial });
  return <Counter value={v.siteTitle.length} max={70} ideal={60} />;
}
function DescCounter({ initial }: { initial: string }) {
  const v = useFormValues(FORM_ID, ['siteDescription'] as const, { siteDescription: initial });
  return <Counter value={v.siteDescription.length} max={160} />;
}

function GooglePreview({ initial }: { initial: Record<(typeof PREVIEW_FIELDS)[number], string> }) {
  const v = useFormValues(FORM_ID, PREVIEW_FIELDS, initial);
  const indexing = v.indexingEnabled === 'true';
  const firstKeyword = v.keywords.split(',')[0];
  return (
    <>
      <div className="rounded-2xl border border-(--rx-line) bg-white p-5">
        <div className="mb-4 flex items-center gap-2 rounded-full border border-(--rx-line) bg-(--rx-cream) px-4 py-2 text-xs text-(--rx-muted)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          {firstKeyword || 'صالون قريب مني'}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="grid size-6 place-items-center rounded-full bg-(--rx-peach) text-[10px] font-bold">Rx</span>
          <span dir="ltr" className="text-(--rx-muted)">rashx.org › salon</span>
        </div>
        <p className="mb-0 mt-2 line-clamp-2 min-h-6 text-lg font-bold leading-6">{v.siteTitle || 'عنوان صفحة الصالون'}</p>
        <p className="mb-0 mt-1.5 line-clamp-3 min-h-12 text-[13px] leading-6 text-(--rx-muted)">{v.siteDescription || 'يظهر هنا الوصف التعريفي الذي تكتبه لصالونك.'}</p>
      </div>
      <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${indexing ? 'border-(--rx-ink) bg-(--rx-blue)' : 'border-(--rx-line) bg-(--rx-cream)'}`}>
        <span aria-hidden="true" className={`size-2.5 rounded-full ${indexing ? 'bg-(--rx-ink)' : 'bg-(--rx-ink)/30'}`} />
        {indexing ? 'صفحتك مفتوحة للفهرسة' : 'صفحتك مخفية عن محركات البحث'}
      </div>
    </>
  );
}

export function SeoForm({ seoSettings }: { seoSettings: SeoSettingsDoc | null }) {
  const title = seoSettings?.siteTitle || '';
  const desc = seoSettings?.siteDescription || '';
  const keywords = seoSettings?.keywords || [];
  const indexing = seoSettings?.indexingEnabled ?? false;

  return (
    <SettingsForm
      id={FORM_ID}
      action={saveSeoSettingsAction}
      successText="تم حفظ إعدادات الملف العام ومحركات البحث بنجاح!"
      saveLabel="حفظ إعدادات الظهور"
      aside={<GooglePreview initial={{ siteTitle: title, siteDescription: desc, keywords: keywords.join(','), indexingEnabled: indexing ? 'true' : '' }} />}
    >
      <Row title="خصوصية بياناتك المالية">
        <p className="m-0 rounded-xl bg-(--rx-cream) p-4 text-sm leading-7">
          هذه الإعدادات خاصة بصفحة الحجز العامة فقط. لا يظهر في محركات البحث أبدًا السجل التجاري، الرقم الضريبي، الحسابات المالية، ولا بيانات المالك الشخصية.
        </p>
      </Row>

      <Row title="ما يظهر في نتائج البحث" desc="العنوان والوصف كما يراهما العملاء.">
        <div className="space-y-4">
          <Field label="عنوان صفحة الصالون" required htmlFor="siteTitle" aside={<TitleCounter initial={title} />} hint="الأفضل ألا يتجاوز 60 حرفًا ليظهر كاملًا في Google.">
            <input id="siteTitle" name="siteTitle" defaultValue={title} required maxLength={70} className={inputCls} />
          </Field>
          <Field label="الوصف التعريفي" required htmlFor="siteDescription" aside={<DescCounter initial={desc} />} hint="نبذة موجزة تظهر أسفل العنوان.">
            <textarea id="siteDescription" name="siteDescription" defaultValue={desc} required rows={3} maxLength={160} className={textareaCls} />
          </Field>
        </div>
      </Row>

      <Row title="الكلمات المفتاحية" desc="اكتب الكلمة واضغط Enter أو الفاصلة لإضافتها.">
        <KeywordsInput initial={keywords} />
      </Row>

      <Row title="الفهرسة في محركات البحث">
        <Switch
          name="indexingEnabled"
          defaultChecked={indexing}
          title="السماح لمحركات البحث بفهرسة صفحة الصالون العامة"
          desc="عند التفعيل يستطيع Googlebot أرشفة قائمة الخدمات وعنوان الفرع ليصل إليك العملاء."
        />
      </Row>
    </SettingsForm>
  );
}
