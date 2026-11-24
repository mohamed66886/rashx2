import type { CSSProperties, ReactNode } from 'react';

/**
 * RASHX settings — shared primitives.
 * Brand: Peach #F0C5AE · Dusty Blue #91B8C0 · White · Cream #FAF9F8 · Ink #54453D
 * Rules: flat colour only (no gradients), 1px borders, no shadows.
 * Peach / Blue are backgrounds & details; text is always Ink.
 */

export const rxVars = {
  '--rx-peach': '#F0C5AE',
  '--rx-peach-soft': '#FAE9DF',
  '--rx-blue': '#91B8C0',
  '--rx-blue-soft': '#E3EEF0',
  '--rx-cream': '#FAF9F8',
  '--rx-ink': '#54453D',
  '--rx-line': 'rgba(84, 69, 61, 0.14)',
  '--rx-danger': '#A8473B',
  fontFamily:
    'var(--font-brand, "Ping AR + LT", "Helvetica Neue", Arial, "Noto Sans Arabic", Tahoma, sans-serif)',
} as CSSProperties;

export function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <div style={rxVars} className="space-y-5 text-(--rx-ink)">
      {children}
    </div>
  );
}

/* ---------- inputs ---------- */

export const inputCls =
  'w-full rounded-lg border border-(--rx-line) bg-white px-3.5 py-2.5 text-sm text-(--rx-ink) ' +
  'placeholder:text-(--rx-ink)/35 transition-colors hover:border-(--rx-ink)/40 ' +
  'focus:border-(--rx-ink) focus:outline-2 focus:outline-offset-2 focus:outline-(--rx-blue) ' +
  'disabled:cursor-not-allowed disabled:bg-(--rx-cream) disabled:text-(--rx-ink)/40';

export const ltrInputCls = `${inputCls} text-left font-mono tracking-wide`;

export function Field({
  label,
  hint,
  required,
  htmlFor,
  aside,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-bold">
          {label}
          {required && (
            <span className="ms-1 text-(--rx-danger)" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {aside && <span className="text-xs text-(--rx-ink)/55">{aside}</span>}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-5 text-(--rx-ink)/60">{hint}</p>}
    </div>
  );
}

/* ---------- feedback ---------- */

export function FormMessage({ message }: { message: { text: string; isError: boolean } | null }) {
  if (!message) return null;
  return (
    <div
      role={message.isError ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-bold ${
        message.isError
          ? 'border-(--rx-danger) bg-white'
          : 'border-(--rx-blue) bg-(--rx-blue-soft)'
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs text-white ${
          message.isError ? 'bg-(--rx-danger)' : 'bg-(--rx-ink)'
        }`}
      >
        {message.isError ? '!' : '✓'}
      </span>
      <span>{message.text}</span>
    </div>
  );
}

export function SaveBar({
  loading,
  label,
  loadingLabel = 'جاري الحفظ...',
  note,
}: {
  loading: boolean;
  label: string;
  loadingLabel?: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-(--rx-line) pt-5 sm:flex-row sm:items-center">
      <p className="text-xs text-(--rx-ink)/60">{note}</p>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-(--rx-ink) px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-(--rx-ink)/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--rx-blue) disabled:opacity-50"
      >
        {loading ? loadingLabel : label}
      </button>
    </div>
  );
}

/* ---------- switch (real checkbox, so FormData keeps working) ---------- */

export function Switch({
  name,
  checked,
  onChange,
  title,
  desc,
}: {
  name: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  desc?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4">
      <span className="relative mt-0.5 inline-flex h-7 w-12 shrink-0">
        <input
          type="checkbox"
          name={name}
          value="true"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full border border-(--rx-ink)/30 bg-white transition-colors peer-checked:border-(--rx-ink) peer-checked:bg-(--rx-ink) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--rx-blue)" />
        <span className="absolute start-1 top-1 size-5 rounded-full bg-(--rx-ink) transition-all peer-checked:start-6 peer-checked:bg-(--rx-peach)" />
      </span>
      <span>
        <span className="block text-sm font-bold">{title}</span>
        {desc && <span className="mt-1 block text-xs leading-5 text-(--rx-ink)/65">{desc}</span>}
      </span>
    </label>
  );
}

/* ---------- section wrapper ---------- */

export function Section({
  title,
  desc,
  tone = 'white',
  children,
}: {
  title: string;
  desc?: string;
  tone?: 'white' | 'cream' | 'peach' | 'blue';
  children: ReactNode;
}) {
  const bg = {
    white: 'bg-white',
    cream: 'bg-(--rx-cream)',
    peach: 'bg-(--rx-peach-soft)',
    blue: 'bg-(--rx-blue-soft)',
  }[tone];
  return (
    <section className={`rounded-xl border border-(--rx-line) p-5 sm:p-6 ${bg}`}>
      <header className="mb-4">
        <h3 className="text-sm font-bold">{title}</h3>
        {desc && <p className="mt-1 text-xs leading-5 text-(--rx-ink)/65">{desc}</p>}
      </header>
      {children}
    </section>
  );
}
