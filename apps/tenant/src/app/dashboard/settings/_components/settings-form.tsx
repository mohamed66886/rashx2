'use client';

import { useEffect, useRef, useState, useTransition, type ReactNode } from 'react';
import { FormMessage } from './settings-ui';

/* ------------------------------------------------------------------ */
/*  Performance model                                                  */
/*  • Inputs are UNCONTROLLED (defaultValue) → typing never re-renders */
/*    the form.                                                         */
/*  • Previews subscribe to the form through useFormValues(): one rAF-  */
/*    throttled FormData read, setState only when a watched value       */
/*    actually changed → only the preview component re-renders.         */
/* ------------------------------------------------------------------ */

/** Watch a few fields of a form. `names` must be a stable (module-level) array. */
export function useFormValues<T extends string>(formId: string, names: readonly T[], initial: Record<T, string>) {
  const [vals, setVals] = useState<Record<T, string>>(initial);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    let raf = 0;
    const read = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const fd = new FormData(form);
        const next = {} as Record<T, string>;
        for (const n of names) {
          const v = fd.get(n);
          next[n] = typeof v === 'string' ? v : '';
        }
        setVals((prev) => (names.some((n) => prev[n] !== next[n]) ? next : prev));
      });
    };
    const afterReset = () => setTimeout(read, 0);
    read();
    form.addEventListener('input', read);
    form.addEventListener('change', read);
    form.addEventListener('reset', afterReset);
    form.addEventListener('rx-saved', read);
    return () => {
      cancelAnimationFrame(raf);
      form.removeEventListener('input', read);
      form.removeEventListener('change', read);
      form.removeEventListener('reset', afterReset);
      form.removeEventListener('rx-saved', read);
    };
  }, [formId, names]);

  return vals;
}

/** After a successful save, the current values become the new "reset" baseline. */
function commitDefaults(form: HTMLFormElement) {
  for (const el of Array.from(form.elements)) {
    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox' || el.type === 'radio') el.defaultChecked = el.checked;
      else el.defaultValue = el.value;
    } else if (el instanceof HTMLTextAreaElement) {
      el.defaultValue = el.value;
    } else if (el instanceof HTMLSelectElement) {
      for (const o of Array.from(el.options)) o.defaultSelected = o.selected;
    }
  }
  form.dispatchEvent(new Event('rx-saved'));
}

interface SettingsFormProps {
  id: string;
  action: (fd: FormData) => Promise<{ success: boolean; error?: string }>;
  successText: string;
  saveLabel: string;
  note?: string;
  /** return an error string to block submit */
  validate?: (fd: FormData) => string | null;
  /** live preview: side column when the form is wide, on top when medium, below the fields on phones */
  aside?: ReactNode;
  children: ReactNode;
}

/*
  Layout is measured on the FORM's own width (container queries), not on the screen.
  The dashboard already spends ~340px on the rail + section panel, so a "desktop"
  screen can leave the form only ~880px. Container thresholds used here:
    @3xl (768px)  → preview moves from below the fields to the top (2 cards side by side)
    @5xl (1024px) → preview becomes a sticky 300px side column
*/
export function SettingsForm({ id, action, successText, saveLabel, note, validate, aside, children }: SettingsFormProps) {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const msgRef = useRef<HTMLDivElement>(null);

  // leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (message) msgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [message]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setMessage(null);
    const fd = new FormData(form);
    const invalid = validate?.(fd);
    if (invalid) return setMessage({ text: invalid, isError: true });

    startTransition(async () => {
      const result = await action(fd);
      if (result.success) {
        commitDefaults(form);
        setDirty(false);
        setMessage({ text: successText, isError: false });
      } else {
        setMessage({ text: result.error || 'فشل الحفظ', isError: true });
      }
    });
  };

  return (
    <form
      id={id}
      ref={ref}
      onSubmit={onSubmit}
      onInput={() => !dirty && setDirty(true)}
      onChange={() => !dirty && setDirty(true)}
      className="@container"
    >
      <div className={aside ? 'grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_300px] @5xl:items-start @5xl:gap-8' : ''}>
        {/* This div is the container the <Row>s measure themselves against. */}
        <div className="@container min-w-0">
          <div ref={msgRef}>
            <FormMessage message={message} />
          </div>
          {children}

          {/* floating save bar — only when there is something to save */}
          {(dirty || pending) && (
            <div className="rx-sheet sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-10 pt-4 lg:bottom-4">
              {/* no border / shadow: the dark fill is what separates the bar from the content under it */}
              <div className="flex flex-col gap-3 rounded-2xl bg-(--rx-ink) p-3 ps-5 text-white @lg:flex-row @lg:items-center @lg:justify-between">
                <p className="m-0 flex items-center gap-2.5 text-sm font-bold">
                  <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-(--rx-peach)" />
                  تغييرات غير محفوظة
                  {note && <span className="hidden text-xs font-normal text-white/70 @2xl:inline">— {note}</span>}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      ref.current?.reset();
                      setDirty(false);
                      setMessage(null);
                    }}
                    className="h-11 flex-1 rounded-xl bg-white/10 px-5 text-sm font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-50 @lg:flex-none cursor-pointer"
                  >
                    تراجع
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    aria-busy={pending}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-(--rx-peach) px-6 text-sm font-bold text-(--rx-ink) transition-colors hover:bg-(--rx-peach-soft) disabled:opacity-60 @lg:flex-none cursor-pointer"
                  >
                    {pending && <i aria-hidden="true" className="block size-4 animate-spin rounded-full border-2 border-(--rx-ink)/30 border-t-(--rx-ink) motion-reduce:animate-none" />}
                    {pending ? 'جاري الحفظ...' : saveLabel}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {aside && (
          // DOM order stays "fields → preview" (tab order, screen readers).
          // phone: below · tablet/small desktop: on top · wide: side column
          <aside className="order-last min-w-0 space-y-3 @3xl:order-first @5xl:order-last @5xl:sticky @5xl:top-20">{aside}</aside>
        )}
      </div>
    </form>
  );
}