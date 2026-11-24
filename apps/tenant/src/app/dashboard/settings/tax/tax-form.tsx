'use client';

import { useState } from 'react';
import type { TaxSettingsDoc } from '@rashx/database';
import { saveTaxSettingsAction } from '../actions';
import { Field, FormMessage, SaveBar, Section, Switch, ltrInputCls } from '../_components/settings-ui';

const VAT_OPTIONS = [
  { value: 'NOT_REGISTERED', title: 'غير مسجل', desc: 'إيرادات المنشأة أقل من الحد الإلزامي للتسجيل.' },
  { value: 'REGISTERED', title: 'مسجل رسميًا', desc: 'لديك رقم ضريبي معتمد من 15 رقمًا.' },
  { value: 'PENDING_VERIFICATION', title: 'قيد المراجعة', desc: 'شهادة التسجيل لدى الهيئة قيد المراجعة.' },
  { value: 'EXEMPT_ENTITY', title: 'منشأة معفاة', desc: 'معفاة نظامًا بموجب لائحة خاصة.' },
] as const;

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TaxForm({ taxSettings }: { taxSettings: TaxSettingsDoc | null }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [vatStatus, setVatStatus] = useState<string>(taxSettings?.vatStatus || 'NOT_REGISTERED');
  const [vatNumber, setVatNumber] = useState(taxSettings?.vatNumber || '');
  const [inclusive, setInclusive] = useState(taxSettings?.isTaxInclusivePricing ?? true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await saveTaxSettingsAction(formData);

    setLoading(false);
    if (result.success) {
      setMessage({ text: 'تم حفظ وتحديث الإعدادات الضريبية بنجاح!', isError: false });
    } else {
      setMessage({ text: result.error || 'فشل الحفظ', isError: true });
    }
  }

  const numberDisabled = vatStatus === 'NOT_REGISTERED';
  const checks = [
    { ok: /^\d*$/.test(vatNumber) && vatNumber.length === 15, label: '15 رقمًا' },
    { ok: vatNumber.startsWith('3'), label: 'يبدأ بالرقم 3' },
    { ok: vatNumber.endsWith('3') && vatNumber.length > 1, label: 'ينتهي بالرقم 3' },
  ];

  // 100 SAR sample, 15% VAT
  const price = 100;
  const net = inclusive ? price / 1.15 : price;
  const vat = inclusive ? price - price / 1.15 : price * 0.15;
  const total = inclusive ? price : price * 1.15;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormMessage message={message} />

      <Section title="حالة التسجيل في ضريبة القيمة المضافة (ZATCA)">
        <fieldset>
          <legend className="sr-only">حالة التسجيل</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {VAT_OPTIONS.map((o) => (
              <label key={o.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="vatStatus"
                  value={o.value}
                  checked={vatStatus === o.value}
                  onChange={() => setVatStatus(o.value)}
                  className="peer sr-only"
                />
                <span className="flex h-full items-start gap-3 rounded-lg border border-(--rx-line) bg-white p-4 transition-colors hover:border-(--rx-ink)/40 peer-checked:border-(--rx-ink) peer-checked:bg-(--rx-blue) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--rx-ink)">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
                      vatStatus === o.value ? 'border-(--rx-ink) bg-(--rx-ink)' : 'border-(--rx-ink)/35 bg-white'
                    }`}
                  >
                    {vatStatus === o.value && <span className="size-2 rounded-full bg-white" />}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{o.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-(--rx-ink)/75">{o.desc}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 border-t border-(--rx-line) pt-5">
          <Field
            label="الرقم الضريبي للمنشأة"
            htmlFor="vatNumber"
            required={vatStatus === 'REGISTERED'}
            aside={`${vatNumber.length}/15`}
          >
            <input
              id="vatNumber"
              name="vatNumber"
              dir="ltr"
              inputMode="numeric"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              required={vatStatus === 'REGISTERED'}
              disabled={numberDisabled}
              maxLength={15}
              placeholder="3XXXXXXXXXXXXX3"
              className={`${ltrInputCls} sm:max-w-sm text-lg`}
            />
          </Field>
          {numberDisabled ? (
            <p className="mt-2 text-xs text-(--rx-ink)/60">الرقم الضريبي غير مطلوب لمنشأة غير مسجلة.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="شروط الرقم الضريبي">
              {checks.map((c) => (
                <li
                  key={c.label}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                    c.ok ? 'border-(--rx-ink) bg-(--rx-blue)' : 'border-(--rx-line) bg-white text-(--rx-ink)/65'
                  }`}
                >
                  <span aria-hidden="true">{c.ok ? '✓' : '○'}</span>
                  {c.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Section title="طريقة عرض الأسعار" desc="تظهر الأسعار للعميل كما تضبطها هنا." tone="cream">
          <Switch
            name="isTaxInclusivePricing"
            checked={inclusive}
            onChange={setInclusive}
            title="الأسعار شاملة ضريبة القيمة المضافة"
            desc="تشترط لائحة حماية المستهلك وهيئة الزكاة أن تكون الأسعار المعلنة للعميل النهائي شاملة الضريبة."
          />
          <p className="mt-5 rounded-lg bg-white p-4 text-xs leading-6 text-(--rx-ink)/75">
            نسبة الضريبة القياسية لخدمات التجميل والصالونات هي <strong className="text-(--rx-ink)">15%</strong> (1500 bps)
            وفق هيئة الزكاة والضريبة والجمارك.
          </p>
        </Section>

        <aside aria-label="مثال على الفاتورة" className="self-start rounded-xl border border-(--rx-ink) bg-white">
          <div className="flex items-center justify-between border-b border-dashed border-(--rx-ink)/40 px-5 py-3">
            <span className="text-xs font-bold">مثال: خدمة بسعر 100 ر.س</span>
            <span className="rounded-full bg-(--rx-peach) px-2.5 py-0.5 text-[11px] font-bold">
              {inclusive ? 'شامل' : 'غير شامل'}
            </span>
          </div>
          <dl className="space-y-2.5 px-5 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-(--rx-ink)/65">الصافي قبل الضريبة</dt>
              <dd dir="ltr" className="font-mono">{fmt(net)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-(--rx-ink)/65">ضريبة 15%</dt>
              <dd dir="ltr" className="font-mono">{fmt(vat)}</dd>
            </div>
          </dl>
          <div className="flex items-center justify-between rounded-b-xl bg-(--rx-blue) px-5 py-4">
            <span className="text-sm font-bold">يدفع العميل</span>
            <span dir="ltr" className="font-mono text-xl font-extrabold">{fmt(total)} <span className="text-xs font-bold">SAR</span></span>
          </div>
        </aside>
      </div>

      <SaveBar loading={loading} label="حفظ الإعدادات الضريبية" note="التعديل متاح لمالك المنشأة فقط." />
    </form>
  );
}
