'use client';

import { useEffect, useState } from 'react';
import type { GeneralSettingsDoc } from '@rashx/database';
import { saveGeneralSettingsAction } from '../actions';
import { Field, FormMessage, SaveBar, Section, inputCls } from '../_components/settings-ui';

// Saturday-first so we can rotate the strip from the chosen start day.
const WEEK = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const START_OPTIONS = [
  { value: 'SATURDAY', label: 'السبت', index: 0 },
  { value: 'SUNDAY', label: 'الأحد', index: 1, note: 'المعتمد بالمملكة' },
  { value: 'MONDAY', label: 'الإثنين', index: 2 },
] as const;

export function GeneralForm({ settings }: { settings: GeneralSettingsDoc | null }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [startOfWeek, setStartOfWeek] = useState<string>(settings?.startOfWeek || 'SUNDAY');
  const [calendarType, setCalendarType] = useState<string>(settings?.calendarType || 'GREGORIAN');
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => setNow(new Date()), []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await saveGeneralSettingsAction(formData);

    setLoading(false);
    if (result.success) {
      setMessage({ text: 'تم حفظ الإعدادات العامة بنجاح!', isError: false });
    } else {
      setMessage({ text: result.error || 'فشل الحفظ', isError: true });
    }
  }

  const startIndex = START_OPTIONS.find((o) => o.value === startOfWeek)?.index ?? 1;
  const days = WEEK.map((_, i) => WEEK[(startIndex + i) % 7]);

  const dateIn = (cal: 'gregory' | 'islamic-umalqura') =>
    now
      ? new Intl.DateTimeFormat(`ar-SA-u-ca-${cal}-nu-latn`, { day: 'numeric', month: 'long', year: 'numeric' }).format(now)
      : ' ';

  const calendars = [
    { value: 'GREGORIAN', title: 'الميلادي', sample: dateIn('gregory') },
    { value: 'HIJRI', title: 'الهجري', sample: dateIn('islamic-umalqura') },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormMessage message={message} />

      {/* Locked by the system */}
      <section aria-label="معايير العملة" className="rounded-xl border border-(--rx-ink) bg-(--rx-ink) p-5 text-white sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold">العملة والحسابات المالية</h3>
          <span className="rounded-full bg-(--rx-peach) px-3 py-0.5 text-[11px] font-bold text-(--rx-ink)">ثابتة من النظام</span>
        </div>
        <dl className="grid gap-px overflow-hidden rounded-lg bg-white/15 sm:grid-cols-3">
          {[
            ['العملة الأساسية', 'ريال سعودي (SAR)'],
            ['الوحدة الصغرى', '1 ريال = 100 هللة'],
            ['دقة الحساب', 'Integer Minor Units'],
          ].map(([k, v]) => (
            <div key={k} className="bg-(--rx-ink) px-4 py-3">
              <dt className="text-[11px] text-white/60">{k}</dt>
              <dd className="mt-1 text-sm font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Section title="المنطقة الزمنية واللغة">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المنطقة الزمنية" required htmlFor="timezone">
            <select id="timezone" name="timezone" defaultValue={settings?.timezone || 'Asia/Riyadh'} className={inputCls}>
              <option value="Asia/Riyadh">توقيت السعودية الرسمي — الرياض (UTC+3)</option>
            </select>
          </Field>
          <Field label="لغة النظام والتقارير" required htmlFor="defaultLocale">
            <select id="defaultLocale" name="defaultLocale" defaultValue={settings?.defaultLocale || 'ar-SA'} className={inputCls}>
              <option value="ar-SA">العربية (المملكة العربية السعودية)</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="بداية أسبوع العمل" desc="يبدأ بها التقويم وجداول المواعيد وتقارير الأسبوع." tone="peach">
        <fieldset>
          <legend className="sr-only">بداية أسبوع العمل</legend>
          <div className="flex flex-wrap gap-2">
            {START_OPTIONS.map((o) => (
              <label key={o.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="startOfWeek"
                  value={o.value}
                  checked={startOfWeek === o.value}
                  onChange={() => setStartOfWeek(o.value)}
                  className="peer sr-only"
                />
                <span className="flex items-center gap-2 rounded-full border border-(--rx-ink)/25 bg-white px-5 py-2 text-sm font-medium transition-colors hover:border-(--rx-ink) peer-checked:border-(--rx-ink) peer-checked:bg-(--rx-ink) peer-checked:font-bold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--rx-blue)">
                  {o.label}
                  {'note' in o && <span className="text-[11px] font-normal opacity-70">({o.note})</span>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <ol className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="معاينة الأسبوع">
          {days.map((d, i) => (
            <li
              key={d}
              className={`rounded-lg border px-1 py-3 text-center text-[11px] font-medium sm:text-sm ${
                i === 0
                  ? 'border-(--rx-ink) bg-(--rx-ink) font-bold text-white'
                  : 'border-(--rx-ink)/15 bg-white'
              }`}
            >
              {d}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="التقويم الافتراضي" desc="طريقة عرض التواريخ في النظام والتقارير." tone="blue">
        <fieldset>
          <legend className="sr-only">التقويم</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {calendars.map((c) => (
              <label key={c.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="calendarType"
                  value={c.value}
                  checked={calendarType === c.value}
                  onChange={() => setCalendarType(c.value)}
                  className="peer sr-only"
                />
                <span className="block rounded-lg border border-(--rx-ink)/20 bg-white p-4 transition-colors hover:border-(--rx-ink) peer-checked:border-(--rx-ink) peer-checked:outline-2 peer-checked:-outline-offset-3 peer-checked:outline-(--rx-ink) peer-focus-visible:ring-2 peer-focus-visible:ring-(--rx-ink)">
                  <span className="block text-xs font-bold text-(--rx-ink)/65">{c.title}</span>
                  <span className="mt-1 block min-h-7 text-lg font-extrabold">{c.sample}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </Section>

      <SaveBar loading={loading} label="حفظ الإعدادات العامة" note="متاح للمالك والمدير." />
    </form>
  );
}
