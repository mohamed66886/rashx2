'use client';

import { useEffect, useState } from 'react';
import type { GeneralSettingsDoc } from '@rashx/database';
import { saveGeneralSettingsAction } from '../actions';
import { Field, RadioCard, Row, inputCls } from '../_components/settings-ui';
import { SettingsForm, useFormValues } from '../_components/settings-form';

// Saturday-first so we can rotate the strip from the chosen start day.
const WEEK = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const START_OPTIONS = [
  { value: 'SATURDAY', label: 'السبت', index: 0 },
  { value: 'SUNDAY', label: 'الأحد', index: 1, note: 'المعتمد بالمملكة' },
  { value: 'MONDAY', label: 'الإثنين', index: 2 },
] as const;

const FORM_ID = 'general-settings-form';
const WEEK_FIELDS = ['startOfWeek'] as const;

function WeekStrip({ start }: { start: string }) {
  const v = useFormValues(FORM_ID, WEEK_FIELDS, { startOfWeek: start });
  const startIndex = START_OPTIONS.find((o) => o.value === v.startOfWeek)?.index ?? 1;
  return (
    <ol className="m-0 mt-4 grid list-none grid-cols-7 gap-1.5 p-0 sm:gap-2" aria-label="معاينة الأسبوع">
      {WEEK.map((_, i) => {
        const d = WEEK[(startIndex + i) % 7];
        return (
          <li key={d} className={`rounded-xl border px-1 py-3 text-center text-[11px] font-medium sm:text-sm ${i === 0 ? 'border-(--rx-ink) bg-(--rx-ink) font-bold text-white' : 'border-(--rx-line) bg-white'}`}>
            {d}
          </li>
        );
      })}
    </ol>
  );
}

/** Dates are computed after mount only (avoids a hydration mismatch) */
function CalendarCards({ type }: { type: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const dateIn = (cal: 'gregory' | 'islamic-umalqura') =>
    now ? new Intl.DateTimeFormat(`ar-SA-u-ca-${cal}-nu-latn`, { day: 'numeric', month: 'long', year: 'numeric' }).format(now) : ' ';
  const calendars = [
    { value: 'GREGORIAN', title: 'الميلادي', sample: dateIn('gregory') },
    { value: 'HIJRI', title: 'الهجري', sample: dateIn('islamic-umalqura') },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {calendars.map((c) => (
        <RadioCard key={c.value} name="calendarType" value={c.value} defaultChecked={type === c.value} title={c.title} desc={c.sample} />
      ))}
    </div>
  );
}

export function GeneralForm({ settings }: { settings: GeneralSettingsDoc | null }) {
  const startOfWeek = settings?.startOfWeek || 'SUNDAY';
  const calendarType = settings?.calendarType || 'GREGORIAN';

  return (
    <SettingsForm
      id={FORM_ID}
      action={saveGeneralSettingsAction}
      successText="تم حفظ الإعدادات العامة بنجاح!"
      saveLabel="حفظ الإعدادات العامة"
      note="متاح للمالك والمدير."
    >
      <Row title="العملة والحسابات" desc="ثابتة من النظام ولا يمكن تغييرها.">
        <dl className="m-0 grid gap-px overflow-hidden rounded-xl bg-(--rx-ink) sm:grid-cols-3">
          {[
            ['العملة الأساسية', 'ريال سعودي (SAR)'],
            ['الوحدة الصغرى', '1 ريال = 100 هللة'],
            ['دقة الحساب', 'Integer Minor Units'],
          ].map(([k, val]) => (
            <div key={k} className="bg-(--rx-ink) px-4 py-3 text-white">
              <dt className="text-[11px] text-white/70">{k}</dt>
              <dd className="m-0 mt-1 text-sm font-bold">{val}</dd>
            </div>
          ))}
        </dl>
      </Row>

      <Row title="المنطقة الزمنية واللغة">
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
      </Row>

      <Row title="بداية أسبوع العمل" desc="يبدأ بها التقويم وجداول المواعيد وتقارير الأسبوع.">
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="sr-only">بداية أسبوع العمل</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {START_OPTIONS.map((o) => (
              <RadioCard key={o.value} name="startOfWeek" value={o.value} defaultChecked={startOfWeek === o.value} title={o.label} desc={'note' in o ? o.note : undefined} compact={!('note' in o)} />
            ))}
          </div>
        </fieldset>
        <WeekStrip start={startOfWeek} />
      </Row>

      <Row title="التقويم الافتراضي" desc="طريقة عرض التواريخ في النظام والتقارير.">
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="sr-only">التقويم</legend>
          <CalendarCards type={calendarType} />
        </fieldset>
      </Row>
    </SettingsForm>
  );
}
