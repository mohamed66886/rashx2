import type { CSSProperties, ReactNode } from 'react';

/**
 * RASHX settings — shared primitives (server-safe, no client JS).
 * Brand: Peach #F0C5AE · Dusty Blue #91B8C0 · White · Cream #FAF9F8 · Ink #54453D
 * Layout: one "Row" per concern — title/description beside the fields when there is room, above them when not.
 * Responsiveness is driven by container width (@container), not screen width: the dashboard rail + section
 * panel take a big slice of a "desktop" screen, so viewport breakpoints would pick the wrong layout.
 * Radio cards / switches are pure CSS (peer-checked) so they need no React state.
 */

export const rxVars = {
  '--rx-peach': '#F0C5AE',
  '--rx-peach-soft': '#F8E3D6',
  '--rx-blue': '#91B8C0',
  '--rx-blue-soft': '#E3EEF0',
  '--rx-cream': '#FAF9F8',
  '--rx-ink': '#54453D',
  '--rx-muted': '#6B5B52',
  '--rx-line': '#E6DDD6',
  '--rx-danger': '#A8473B',
  fontFamily: 'var(--font-brand, "Ping AR + LT", "IBM Plex Sans Arabic", Tahoma, sans-serif)',
} as CSSProperties;

export function SettingsShell({ children }: { children: ReactNode }) {
  return (
    // @container: fallback measuring box for <Row> when it is used outside <SettingsForm>
    <div style={rxVars} className="@container space-y-6 text-(--rx-ink)">
      {children}
    </div>
  );
}

/* ---------- page header ---------- */

export function PageHeader({ title, desc, icon, badge }: { title: string; desc: string; icon: ReactNode; badge?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-(--rx-peach) sm:size-12" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0">
          <h1 className="m-0 text-xl font-bold leading-tight sm:text-2xl">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-(--rx-muted) sm:text-sm sm:leading-7">{desc}</p>
        </div>
      </div>
      {badge}
    </header>
  );
}

export const PageIcon = ({ children }: { children: ReactNode }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

/* ---------- inputs ---------- */

// text-base (16px) on touch screens: anything smaller makes iOS Safari zoom the page on focus.
export const inputCls =
  'w-full h-11 rounded-xl border-[1.5px] border-[#9A8C83] bg-white px-3.5 text-base font-medium text-(--rx-ink) md:text-[15px] ' +
  'placeholder:text-[#8A7B72] outline-none transition-colors hover:border-(--rx-ink) ' +
  'focus:border-(--rx-ink) focus:ring-[3px] focus:ring-(--rx-peach) ' +
  'disabled:cursor-not-allowed disabled:border-(--rx-line) disabled:bg-(--rx-cream) disabled:text-(--rx-muted)';

export const ltrInputCls = `${inputCls} text-left font-mono tracking-wide`;
export const textareaCls = inputCls.replace('h-11 ', '') + ' py-2.5 leading-7 resize-none';

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
      {/* wraps instead of squeezing the label when the column is narrow */}
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <label htmlFor={htmlFor} className="text-[13px] font-bold">
          {label}
          {required && (
            <span className="ms-1 text-(--rx-danger)" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {aside && <span className="text-xs text-(--rx-muted)">{aside}</span>}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-5 text-(--rx-muted)">{hint}</p>}
    </div>
  );
}

/* ---------- layout rows ---------- */

/**
 * < 896px of available width : title + description on top, fields card below (full width)
 * ≥ 896px                    : title on the start side (210px), fields card beside it
 */
export function Row({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 py-7 first:pt-0 @4xl:grid-cols-[210px_minmax(0,1fr)] @4xl:gap-10">
      <header>
        <h2 className="m-0 text-[15px] font-bold">{title}</h2>
        {desc && <p className="mt-1.5 text-[13px] leading-6 text-(--rx-muted)">{desc}</p>}
      </header>
      <div className="min-w-0 rounded-2xl bg-white p-4 @xl:p-6">{children}</div>
    </section>
  );
}

/* ---------- choice cards & switch (CSS-only state) ---------- */

export function RadioCard({
  name,
  value,
  defaultChecked,
  title,
  desc,
  compact,
}: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  title: string;
  desc?: string;
  compact?: boolean;
}) {
  return (
    <label className="block cursor-pointer">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        className={`flex h-full items-start gap-3 rounded-xl bg-(--rx-cream) transition-colors hover:bg-(--rx-peach-soft)/60 peer-checked:bg-(--rx-peach-soft) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--rx-blue) peer-checked:[&_i]:border-(--rx-ink) peer-checked:[&_i]:bg-(--rx-ink) peer-checked:[&_i>b]:opacity-100 ${
          compact ? 'items-center px-3.5 py-3' : 'p-4'
        }`}
      >
        <i aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-[#9A8C83] bg-white not-italic">
          <b className="size-2 rounded-full bg-(--rx-peach) opacity-0" />
        </i>
        <span className="min-w-0">
          <span className="block text-sm font-bold leading-5">{title}</span>
          {desc && <span className="mt-1 block text-xs leading-5 text-(--rx-muted)">{desc}</span>}
        </span>
      </span>
    </label>
  );
}

export function Switch({ name, defaultChecked, title, desc }: { name: string; defaultChecked?: boolean; title: string; desc?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-4">
      <span className="relative mt-0.5 inline-flex h-7 w-12 shrink-0">
        <input type="checkbox" name={name} value="true" defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full border-[1.5px] border-[#9A8C83] bg-white transition-colors peer-checked:border-(--rx-ink) peer-checked:bg-(--rx-ink) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--rx-blue)" />
        <span className="absolute start-1 top-1 size-5 rounded-full bg-(--rx-ink) transition-[inset-inline-start,background-color] peer-checked:start-6 peer-checked:bg-(--rx-peach)" />
      </span>
      <span>
        <span className="block text-sm font-bold">{title}</span>
        {desc && <span className="mt-1 block text-xs leading-5 text-(--rx-muted)">{desc}</span>}
      </span>
    </label>
  );
}

/* ---------- feedback ---------- */

export function FormMessage({ message }: { message: { text: string; isError: boolean } | null }) {
  if (!message) return null;
  return (
    <div
      role={message.isError ? 'alert' : 'status'}
      className={`mb-6 flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
        message.isError ? 'bg-[#FBEAE7] text-(--rx-danger)' : 'bg-(--rx-blue-soft)'
      }`}
    >
      <span aria-hidden="true" className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs text-white ${message.isError ? 'bg-(--rx-danger)' : 'bg-(--rx-ink)'}`}>
        {message.isError ? '!' : '✓'}
      </span>
      <span>{message.text}</span>
    </div>
  );
}