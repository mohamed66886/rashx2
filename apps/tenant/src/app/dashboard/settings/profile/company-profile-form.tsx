'use client';

import type { ReactNode } from 'react';
import type { CompanyProfileDoc } from '@rashx/database';
import { saveCompanyProfileAction } from '../actions';
import { Field, RadioCard, Row, inputCls, ltrInputCls } from '../_components/settings-ui';
import { SettingsForm, useFormValues } from '../_components/settings-form';

const LEGAL_FORMS = [
  { value: 'SOLE_PROPRIETORSHIP', label: 'مؤسسة فردية' },
  { value: 'LLC', label: 'شركة ذات مسؤولية محدودة' },
  { value: 'BRANCH_OF_FOREIGN', label: 'فرع شركة أجنبية' },
  { value: 'OTHER', label: 'شكل نظامي آخر' },
] as const;

const FORM_ID = 'company-profile-form';
const WATCH = [
  'legalNameAr', 'legalNameEn', 'legalForm', 'crNumber', 'unifiedEstablishmentNumber',
  'buildingNumber', 'additionalNumber', 'streetName', 'district', 'city', 'postalCode', 'unitNumber',
] as const;

// same rule as before, now run on the FormData at submit time (no per-keystroke state)
function validate(fd: FormData): string | null {
  const unified = String(fd.get('unifiedEstablishmentNumber') ?? '').trim();
  if (unified) {
    const normalized = unified.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632)).replace(/[\s-]/g, '');
    if (!/^7\d{9}$/.test(normalized)) {
      return 'الرقم الموحد للمنشأة (700) يجب أن يتكون من 10 أرقام ويبدأ بالرقم 7 (أو اتركه فارغاً)';
    }
  }
  return null;
}

/**
 * Layout is driven by the width of the card the fields sit in (container queries),
 * not by the screen width. The same form is therefore correct on a phone, a tablet,
 * and a desktop where the side column and the section titles eat part of the width.
 */
function Fields({ children }: { children: ReactNode }) {
  return (
    <div className="@container w-full min-w-0">
      <div className="grid gap-4 *:min-w-0">{children}</div>
    </div>
  );
}

// two columns once the card is ~512px wide, one column below that
const pair = 'grid gap-4 *:min-w-0 @lg:grid-cols-2';

/** Only this component re-renders while typing. */
function LivePreview({ initial }: { initial: Record<(typeof WATCH)[number], string> }) {
  const v = useFormValues(FORM_ID, WATCH, initial);
  const dash = '—';
  const formLabel = LEGAL_FORMS.find((f) => f.value === v.legalForm)?.label;
  return (
    // narrow column (desktop side panel / phone) => stacked · wide (tablet, full-width) => side by side
    <div className="@container w-full min-w-0">
      <div className="grid gap-4 *:min-w-0 @xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl">
          <div className="bg-(--rx-ink) px-5 py-4 text-white">
            <p className="m-0 text-[11px] text-white/70">بطاقة المنشأة</p>
            <p className="mt-1 min-h-7 break-words text-lg font-bold leading-7">{v.legalNameAr || dash}</p>
            <p dir="ltr" className="m-0 min-h-5 break-words text-left text-xs text-white/75">{v.legalNameEn || ' '}</p>
          </div>
          <dl className="m-0 bg-white text-sm">
            {[
              ['الشكل القانوني', formLabel, false],
              ['السجل التجاري', v.crNumber || dash, true],
              ['الرقم الموحد', v.unifiedEstablishmentNumber || dash, true],
            ].map(([k, val, mono]) => (
              <div key={String(k)} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-3">
                <dt className="text-xs text-(--rx-muted)">{k}</dt>
                <dd dir={mono ? 'ltr' : undefined} className={`m-0 min-w-0 break-words font-bold ${mono ? 'font-mono tracking-wider' : ''}`}>{val}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl bg-(--rx-peach) p-5">
          <p className="m-0 text-[11px] font-bold">العنوان الوطني</p>
          <p dir="ltr" className="mt-2 text-left font-mono text-2xl font-bold tracking-[0.2em]">
            {v.buildingNumber || '----'}
            <span className="mx-1 text-base tracking-normal opacity-60">/</span>
            {v.additionalNumber || '----'}
          </p>
          <p className="mb-0 mt-3 min-h-12 break-words text-sm font-medium leading-6">
            {[v.streetName, v.district].filter(Boolean).join('، ') || dash}
            <br />
            {[v.city, v.postalCode].filter(Boolean).join(' ') || ' '}
            {v.unitNumber ? ` · وحدة ${v.unitNumber}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CompanyProfileForm({ profile }: { profile: CompanyProfileDoc | null }) {
  const a = profile?.nationalAddress;
  const legalForm = profile?.legalForm || 'SOLE_PROPRIETORSHIP';
  const init = {
    legalNameAr: profile?.legalNameAr || '',
    legalNameEn: profile?.legalNameEn || '',
    legalForm,
    crNumber: profile?.crNumber || '',
    unifiedEstablishmentNumber: profile?.unifiedEstablishmentNumber || '',
    buildingNumber: a?.buildingNumber || '1234',
    additionalNumber: a?.additionalNumber || '',
    streetName: a?.streetName || '',
    district: a?.district || '',
    city: a?.city || '',
    postalCode: a?.postalCode || '12211',
    unitNumber: a?.unitNumber || '',
  };

  return (
    <SettingsForm
      id={FORM_ID}
      action={saveCompanyProfileAction}
      validate={validate}
      successText="تم حفظ وتحديث ملف المنشأة بنجاح!"
      saveLabel="حفظ بيانات المنشأة"
      note="التعديل متاح لمالك المنشأة فقط."
      aside={<LivePreview initial={init} />}
    >
      <Row title="بيانات المنشأة" desc="كما هي مسجلة في السجل التجاري.">
        <Fields>
          <div className={pair}>
            <Field label="الاسم التجاري الرسمي (بالعربية)" required htmlFor="legalNameAr">
              <input id="legalNameAr" name="legalNameAr" defaultValue={init.legalNameAr} required className={inputCls} />
            </Field>
            <Field label="الاسم التجاري الرسمي (بالإنجليزية)" htmlFor="legalNameEn">
              <input id="legalNameEn" name="legalNameEn" dir="ltr" defaultValue={init.legalNameEn} className={ltrInputCls} />
            </Field>
          </div>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-1.5 p-0 text-[13px] font-bold">الشكل القانوني <span className="text-(--rx-danger)" aria-hidden="true">*</span></legend>
            {/* 2 per row by default, all 4 in one row when there is room */}
            <div className="grid grid-cols-2 gap-2 *:min-w-0 @2xl:grid-cols-4">
              {LEGAL_FORMS.map((f) => (
                <RadioCard key={f.value} name="legalForm" value={f.value} defaultChecked={legalForm === f.value} title={f.label} compact />
              ))}
            </div>
          </fieldset>

          <div className={pair}>
            <Field label="رقم السجل التجاري" required htmlFor="crNumber" aside="10 أرقام">
              <input id="crNumber" name="crNumber" dir="ltr" inputMode="numeric" defaultValue={init.crNumber} required maxLength={10} className={ltrInputCls} />
            </Field>
            <Field label="الرقم الموحد للمنشأة (700)" htmlFor="unifiedEstablishmentNumber" aside="اختياري — يبدأ بـ 7">
              <input id="unifiedEstablishmentNumber" name="unifiedEstablishmentNumber" dir="ltr" inputMode="numeric" defaultValue={init.unifiedEstablishmentNumber} maxLength={10} placeholder="7XXXXXXXXX" className={ltrInputCls} />
            </Field>
          </div>
        </Fields>
      </Row>

      <Row title="العنوان الوطني" desc="بنفس ترتيب العنوان المسجّل لدى البريد السعودي (SPL).">
        {/*
          narrow : [مبنى | إضافي]  [شارع]  [حي | مدينة]  [بريدي | وحدة]
          wide   : [مبنى | إضافي | شارع شارع]  [حي حي | مدينة مدينة]  [بريدي بريدي | وحدة وحدة]
          ترتيب الـ DOM = ترتيب التنقل بالـ Tab = ترتيب القراءة في الحالتين.
        */}
        <div className="@container w-full min-w-0">
          <div className="grid grid-cols-2 gap-4 *:min-w-0 @xl:grid-cols-4">
            <Field label="رقم المبنى" required htmlFor="buildingNumber" aside="4 أرقام">
              <input id="buildingNumber" name="buildingNumber" dir="ltr" inputMode="numeric" defaultValue={init.buildingNumber} required maxLength={4} className={ltrInputCls} />
            </Field>
            <Field label="الرقم الإضافي" htmlFor="additionalNumber" aside="4 أرقام">
              <input id="additionalNumber" name="additionalNumber" dir="ltr" inputMode="numeric" defaultValue={init.additionalNumber} maxLength={4} className={ltrInputCls} />
            </Field>
            <div className="col-span-2">
              <Field label="اسم الشارع" required htmlFor="streetName">
                <input id="streetName" name="streetName" defaultValue={init.streetName} required className={inputCls} />
              </Field>
            </div>
            <div className="@xl:col-span-2">
              <Field label="الحي" required htmlFor="district">
                <input id="district" name="district" defaultValue={init.district} required className={inputCls} />
              </Field>
            </div>
            <div className="@xl:col-span-2">
              <Field label="المدينة" required htmlFor="city">
                <input id="city" name="city" defaultValue={init.city} required className={inputCls} />
              </Field>
            </div>
            <div className="@xl:col-span-2">
              <Field label="الرمز البريدي" required htmlFor="postalCode" aside="5 أرقام">
                <input id="postalCode" name="postalCode" dir="ltr" inputMode="numeric" defaultValue={init.postalCode} required maxLength={5} className={ltrInputCls} />
              </Field>
            </div>
            <div className="@xl:col-span-2">
              <Field label="رقم الوحدة" htmlFor="unitNumber">
                <input id="unitNumber" name="unitNumber" dir="ltr" defaultValue={init.unitNumber} className={ltrInputCls} />
              </Field>
            </div>
          </div>
        </div>
      </Row>

      <Row title="بيانات التواصل الرسمية">
        <Fields>
          <div className={pair}>
            <Field label="رقم الهاتف" required htmlFor="phone">
              <input id="phone" name="phone" dir="ltr" type="tel" defaultValue={profile?.phone || ''} required className={ltrInputCls} />
            </Field>
            <Field label="البريد الإلكتروني" required htmlFor="email">
              <input id="email" name="email" dir="ltr" type="email" defaultValue={profile?.email || ''} required className={ltrInputCls} />
            </Field>
          </div>
        </Fields>
      </Row>
    </SettingsForm>
  );
}