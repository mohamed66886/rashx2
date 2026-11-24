'use client';

import { useState } from 'react';
import type { CompanyProfileDoc } from '@rashx/database';
import { saveCompanyProfileAction } from '../actions';
import { Field, FormMessage, SaveBar, Section, inputCls, ltrInputCls } from '../_components/settings-ui';

const LEGAL_FORMS = [
  { value: 'SOLE_PROPRIETORSHIP', label: 'مؤسسة فردية' },
  { value: 'LLC', label: 'شركة ذات مسؤولية محدودة' },
  { value: 'BRANCH_OF_FOREIGN', label: 'فرع شركة أجنبية' },
  { value: 'OTHER', label: 'شكل نظامي آخر' },
] as const;

export function CompanyProfileForm({ profile }: { profile: CompanyProfileDoc | null }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [legalNameAr, setLegalNameAr] = useState(profile?.legalNameAr || '');
  const [legalNameEn, setLegalNameEn] = useState(profile?.legalNameEn || '');
  const [legalForm, setLegalForm] = useState<string>(profile?.legalForm || 'SOLE_PROPRIETORSHIP');
  const [crNumber, setCrNumber] = useState(profile?.crNumber || '');
  const [unified, setUnified] = useState(profile?.unifiedEstablishmentNumber || '');
  const [building, setBuilding] = useState(profile?.nationalAddress?.buildingNumber || '1234');
  const [street, setStreet] = useState(profile?.nationalAddress?.streetName || '');
  const [district, setDistrict] = useState(profile?.nationalAddress?.district || '');
  const [city, setCity] = useState(profile?.nationalAddress?.city || '');
  const [postal, setPostal] = useState(profile?.nationalAddress?.postalCode || '12211');
  const [additional, setAdditional] = useState(profile?.nationalAddress?.additionalNumber || '');
  const [unit, setUnit] = useState(profile?.nationalAddress?.unitNumber || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await saveCompanyProfileAction(formData);

    setLoading(false);
    if (result.success) {
      setMessage({ text: 'تم حفظ وتحديث ملف المنشأة بنجاح!', isError: false });
    } else {
      setMessage({ text: result.error || 'فشل الحفظ', isError: true });
    }
  }

  const formLabel = LEGAL_FORMS.find((f) => f.value === legalForm)?.label;
  const dash = '—';

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-5">
        <FormMessage message={message} />

        <Section title="بيانات المنشأة" desc="كما هي مسجلة في السجل التجاري.">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الاسم التجاري الرسمي (بالعربية)" required htmlFor="legalNameAr">
                <input
                  id="legalNameAr"
                  name="legalNameAr"
                  value={legalNameAr}
                  onChange={(e) => setLegalNameAr(e.target.value)}
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="الاسم التجاري الرسمي (بالإنجليزية)" htmlFor="legalNameEn">
                <input
                  id="legalNameEn"
                  name="legalNameEn"
                  dir="ltr"
                  value={legalNameEn}
                  onChange={(e) => setLegalNameEn(e.target.value)}
                  className={ltrInputCls}
                />
              </Field>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-[13px] font-bold">
                الشكل القانوني <span className="text-(--rx-danger)">*</span>
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {LEGAL_FORMS.map((f) => (
                  <label key={f.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="legalForm"
                      value={f.value}
                      checked={legalForm === f.value}
                      onChange={() => setLegalForm(f.value)}
                      className="peer sr-only"
                    />
                    <span className="flex h-full min-h-14 items-center justify-center rounded-lg border border-(--rx-line) bg-white px-3 py-2 text-center text-[13px] font-medium leading-5 transition-colors hover:border-(--rx-ink)/40 peer-checked:border-(--rx-ink) peer-checked:bg-(--rx-peach) peer-checked:font-bold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--rx-blue)">
                      {f.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="رقم السجل التجاري" required htmlFor="crNumber" aside="10 أرقام">
                <input
                  id="crNumber"
                  name="crNumber"
                  dir="ltr"
                  inputMode="numeric"
                  value={crNumber}
                  onChange={(e) => setCrNumber(e.target.value)}
                  required
                  maxLength={10}
                  className={ltrInputCls}
                />
              </Field>
              <Field label="الرقم الموحد للمنشأة (700)" htmlFor="unifiedEstablishmentNumber" aside="يبدأ بـ 7">
                <input
                  id="unifiedEstablishmentNumber"
                  name="unifiedEstablishmentNumber"
                  dir="ltr"
                  inputMode="numeric"
                  value={unified}
                  onChange={(e) => setUnified(e.target.value)}
                  maxLength={10}
                  placeholder="7XXXXXXXXX"
                  className={ltrInputCls}
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section
          title="العنوان الوطني"
          desc="بنفس ترتيب العنوان المسجّل لدى البريد السعودي (SPL)."
          tone="cream"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            <div className="col-span-2 sm:col-span-2">
              <Field label="رقم المبنى" required htmlFor="buildingNumber">
                <input id="buildingNumber" name="buildingNumber" dir="ltr" inputMode="numeric" value={building} onChange={(e) => setBuilding(e.target.value)} required maxLength={4} className={ltrInputCls} />
              </Field>
            </div>
            <div className="col-span-2 sm:col-span-4">
              <Field label="اسم الشارع" required htmlFor="streetName">
                <input id="streetName" name="streetName" value={street} onChange={(e) => setStreet(e.target.value)} required className={inputCls} />
              </Field>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <Field label="الحي" required htmlFor="district">
                <input id="district" name="district" value={district} onChange={(e) => setDistrict(e.target.value)} required className={inputCls} />
              </Field>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <Field label="المدينة" required htmlFor="city">
                <input id="city" name="city" value={city} onChange={(e) => setCity(e.target.value)} required className={inputCls} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="الرمز البريدي" required htmlFor="postalCode" aside="5 أرقام">
                <input id="postalCode" name="postalCode" dir="ltr" inputMode="numeric" value={postal} onChange={(e) => setPostal(e.target.value)} required maxLength={5} className={ltrInputCls} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="الرقم الإضافي" htmlFor="additionalNumber" aside="4 أرقام">
                <input id="additionalNumber" name="additionalNumber" dir="ltr" inputMode="numeric" value={additional} onChange={(e) => setAdditional(e.target.value)} maxLength={4} className={ltrInputCls} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="رقم الوحدة" htmlFor="unitNumber">
                <input id="unitNumber" name="unitNumber" dir="ltr" value={unit} onChange={(e) => setUnit(e.target.value)} className={ltrInputCls} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="بيانات التواصل الرسمية">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="رقم الهاتف" required htmlFor="phone">
              <input id="phone" name="phone" dir="ltr" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={ltrInputCls} />
            </Field>
            <Field label="البريد الإلكتروني" required htmlFor="email">
              <input id="email" name="email" dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={ltrInputCls} />
            </Field>
          </div>
        </Section>

        <SaveBar loading={loading} label="حفظ بيانات المنشأة" note="التعديل متاح لمالك المنشأة فقط." />
      </div>

      {/* Live registry card */}
      <aside aria-label="معاينة بطاقة المنشأة" className="space-y-3 lg:sticky lg:top-6">
        <div className="overflow-hidden rounded-xl border border-(--rx-ink)">
          <div className="bg-(--rx-ink) px-5 py-4 text-white">
            <p className="text-[11px] text-white/60">بطاقة المنشأة</p>
            <p className="mt-1 min-h-7 text-lg font-extrabold leading-7">{legalNameAr || dash}</p>
            <p dir="ltr" className="min-h-5 text-left text-xs text-white/70">{legalNameEn || ' '}</p>
          </div>
          <dl className="divide-y divide-(--rx-line) bg-white text-sm">
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <dt className="text-xs text-(--rx-ink)/60">الشكل القانوني</dt>
              <dd className="font-bold">{formLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <dt className="text-xs text-(--rx-ink)/60">السجل التجاري</dt>
              <dd dir="ltr" className="font-mono font-bold tracking-wider">{crNumber || dash}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <dt className="text-xs text-(--rx-ink)/60">الرقم الموحد</dt>
              <dd dir="ltr" className="font-mono font-bold tracking-wider">{unified || dash}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl bg-(--rx-peach) p-5">
          <p className="text-[11px] font-bold text-(--rx-ink)/70">العنوان الوطني</p>
          <p dir="ltr" className="mt-2 text-left font-mono text-2xl font-bold tracking-[0.2em]">
            {building || '----'}
            <span className="mx-1 text-base tracking-normal opacity-50">/</span>
            {additional || '----'}
          </p>
          <p className="mt-3 min-h-12 text-sm font-medium leading-6">
            {[street, district].filter(Boolean).join('، ') || dash}
            <br />
            {[city, postal].filter(Boolean).join(' ') || ' '}
            {unit ? ` · وحدة ${unit}` : ''}
          </p>
        </div>
      </aside>
    </form>
  );
}
