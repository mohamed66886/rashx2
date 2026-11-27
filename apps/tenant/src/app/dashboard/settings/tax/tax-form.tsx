'use client';

import type { TaxSettingsDoc } from '@rashx/database';
import { saveTaxSettingsAction } from '../actions';
import { Field, RadioCard, Row, Switch, ltrInputCls } from '../_components/settings-ui';
import { SettingsForm, useFormValues } from '../_components/settings-form';

const VAT_OPTIONS = [
  { value: 'NOT_REGISTERED', title: 'غير مسجل', desc: 'إيرادات المنشأة أقل من الحد الإلزامي للتسجيل.' },
  { value: 'REGISTERED', title: 'مسجل رسميًا', desc: 'لديك رقم ضريبي معتمد من 15 رقمًا.' },
  { value: 'PENDING_VERIFICATION', title: 'قيد المراجعة', desc: 'شهادة التسجيل لدى الهيئة قيد المراجعة.' },
  { value: 'EXEMPT_ENTITY', title: 'منشأة معفاة', desc: 'معفاة نظامًا بموجب لائحة خاصة.' },
] as const;

const FORM_ID = 'tax-settings-form';
const VAT_FIELDS = ['vatStatus', 'vatNumber'] as const;
const PRICING_FIELDS = ['isTaxInclusivePricing'] as const;

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function VatNumber({ status, number }: { status: string; number: string }) {
  const v = useFormValues(FORM_ID, VAT_FIELDS, { vatStatus: status, vatNumber: number });
  const disabled = v.vatStatus === 'NOT_REGISTERED';
  const n = v.vatNumber;
  const checks = [
    { ok: /^\d*$/.test(n) && n.length === 15, label: '15 رقمًا' },
    { ok: n.startsWith('3'), label: 'يبدأ بالرقم 3' },
    { ok: n.endsWith('3') && n.length > 1, label: 'ينتهي بالرقم 3' },
  ];
  return (
    <div className="border-t border-(--rx-line) pt-5">
      <Field label="الرقم الضريبي للمنشأة" htmlFor="vatNumber" required={v.vatStatus === 'REGISTERED'} aside={`${n.length}/15`}>
        <input
          id="vatNumber"
          name="vatNumber"
          dir="ltr"
          inputMode="numeric"
          defaultValue={number}
          required={v.vatStatus === 'REGISTERED'}
          disabled={disabled}
          maxLength={15}
          placeholder="3XXXXXXXXXXXXX3"
          className={`${ltrInputCls} text-lg sm:max-w-sm`}
        />
      </Field>
      {disabled ? (
        <p className="mb-0 mt-2 text-xs text-(--rx-muted)">الرقم الضريبي غير مطلوب لمنشأة غير مسجلة.</p>
      ) : (
        <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0" aria-label="شروط الرقم الضريبي">
          {checks.map((c) => (
            <li key={c.label} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${c.ok ? 'border-(--rx-ink) bg-(--rx-blue)' : 'border-(--rx-line) bg-white text-(--rx-muted)'}`}>
              <span aria-hidden="true">{c.ok ? '✓' : '○'}</span>
              {c.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InvoiceExample({ inclusive: initial }: { inclusive: boolean }) {
  const v = useFormValues(FORM_ID, PRICING_FIELDS, { isTaxInclusivePricing: initial ? 'true' : '' });
  const inclusive = v.isTaxInclusivePricing === 'true';
  const price = 100;
  const net = inclusive ? price / 1.15 : price;
  const vat = inclusive ? price - price / 1.15 : price * 0.15;
  const total = inclusive ? price : price * 1.15;
  return (
    <div aria-label="مثال على الفاتورة" className="mt-5 overflow-hidden rounded-xl border border-(--rx-ink) bg-white">
      <div className="flex items-center justify-between border-b border-dashed border-(--rx-ink)/40 px-5 py-3">
        <span className="text-xs font-bold">مثال: خدمة بسعر 100 ر.س</span>
        <span className="rounded-full bg-(--rx-peach) px-2.5 py-0.5 text-[11px] font-bold">{inclusive ? 'شامل' : 'غير شامل'}</span>
      </div>
      <dl className="m-0 space-y-2.5 px-5 py-4 text-sm">
        <div className="flex justify-between"><dt className="text-(--rx-muted)">الصافي قبل الضريبة</dt><dd dir="ltr" className="m-0 font-mono">{fmt(net)}</dd></div>
        <div className="flex justify-between"><dt className="text-(--rx-muted)">ضريبة 15%</dt><dd dir="ltr" className="m-0 font-mono">{fmt(vat)}</dd></div>
      </dl>
      <div className="flex items-center justify-between bg-(--rx-blue) px-5 py-3.5">
        <span className="text-sm font-bold">يدفع العميل</span>
        <span dir="ltr" className="font-mono text-xl font-bold">{fmt(total)} <span className="text-xs">SAR</span></span>
      </div>
    </div>
  );
}

export function TaxForm({ taxSettings }: { taxSettings: TaxSettingsDoc | null }) {
  const vatStatus = taxSettings?.vatStatus || 'NOT_REGISTERED';
  const inclusive = taxSettings?.isTaxInclusivePricing ?? true;

  return (
    <SettingsForm
      id={FORM_ID}
      action={saveTaxSettingsAction}
      successText="تم حفظ وتحديث الإعدادات الضريبية بنجاح!"
      saveLabel="حفظ الإعدادات الضريبية"
      note="التعديل متاح لمالك المنشأة فقط."
    >
      <Row title="حالة التسجيل" desc="التسجيل في ضريبة القيمة المضافة لدى هيئة الزكاة والضريبة والجمارك (ZATCA).">
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="sr-only">حالة التسجيل</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {VAT_OPTIONS.map((o) => (
              <RadioCard key={o.value} name="vatStatus" value={o.value} defaultChecked={vatStatus === o.value} title={o.title} desc={o.desc} />
            ))}
          </div>
        </fieldset>
        <div className="mt-5">
          <VatNumber status={vatStatus} number={taxSettings?.vatNumber || ''} />
        </div>
      </Row>

      <Row title="طريقة عرض الأسعار" desc="تظهر الأسعار للعميل كما تضبطها هنا.">
        <Switch
          name="isTaxInclusivePricing"
          defaultChecked={inclusive}
          title="الأسعار شاملة ضريبة القيمة المضافة"
          desc="تشترط لائحة حماية المستهلك وهيئة الزكاة أن تكون الأسعار المعلنة للعميل النهائي شاملة الضريبة."
        />
        <p className="mb-0 mt-5 rounded-xl bg-(--rx-cream) p-4 text-xs leading-6">
          نسبة الضريبة القياسية لخدمات التجميل والصالونات هي <strong>15%</strong> (1500 bps) وفق هيئة الزكاة والضريبة والجمارك.
        </p>
        <InvoiceExample inclusive={inclusive} />
      </Row>
    </SettingsForm>
  );
}
