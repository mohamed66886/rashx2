'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Icon, navItems, type IconName } from './nav-config';

interface Entry {
  href: string;
  label: string;
  group: string;
  icon: IconName;
}

// Arabic-friendly normalisation so "ادارة" matches "إدارة", "ه" matches "ة", etc.
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');

const ENTRIES: Entry[] = navItems.flatMap((item) =>
  item.subItems
    ? item.subItems.map((s) => ({ href: s.href, label: s.label, group: item.label, icon: item.icon }))
    : [{ href: item.href, label: item.label, group: 'التنقل', icon: item.icon }],
);

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return ENTRIES;
    return ENTRIES.filter((e) => norm(`${e.label} ${e.group}`).includes(q));
  }, [query]);

  // global open: Ctrl/⌘ + K, or the "rx:open-palette" event (header / mobile bar buttons)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('rx:open-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('rx:open-palette', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 10);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(t);
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (e?: Entry) => {
    if (!e) return;
    setOpen(false);
    router.push(e.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div dir="rtl" className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="بحث وانتقال سريع" onKeyDown={onKeyDown}>
      <button type="button" aria-label="إغلاق" onClick={() => setOpen(false)} className="rx-fade absolute inset-0 bg-[#54453D]/45 backdrop-blur-[3px]" />
      <div className="rx-dialog relative w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(84,69,61,0.3)]" style={{ fontFamily: "'Ping AR + LT','IBM Plex Sans Arabic',Tahoma,sans-serif" }}>
        <div className="flex items-center gap-3 border-b border-[#E6DDD6] px-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5B52" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="انتقل إلى صفحة… مثال: الضريبة"
            aria-label="بحث"
            role="combobox"
            aria-expanded="true"
            aria-controls="rx-palette-list"
            className="h-14 flex-1 bg-transparent text-base font-medium text-[#54453D] outline-none placeholder:text-[#8A7B72]"
          />
          <kbd className="rounded-md border border-[#E6DDD6] bg-[#FAF9F8] px-2 py-1 font-mono text-[11px] text-[#6B5B52]">Esc</kbd>
        </div>

        <ul id="rx-palette-list" ref={listRef} role="listbox" className="m-0 max-h-[50vh] list-none overflow-y-auto p-2">
          {results.length === 0 && <li className="px-4 py-10 text-center text-sm text-[#6B5B52]">لا توجد نتائج لـ «{query}»</li>}
          {results.map((r, i) => (
            <li key={r.href} role="option" aria-selected={i === active} data-active={i === active}>
              <button
                type="button"
                onMouseMove={() => setActive(i)}
                onClick={() => go(r)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors cursor-pointer ${i === active ? 'bg-[#F8E3D6]' : ''}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#54453D] ${i === active ? 'bg-[#F0C5AE]' : 'bg-[#F0E9E4]'}`}><Icon name={r.icon} size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold text-[#54453D]">{r.label}</span>
                  <span className="block truncate text-xs text-[#6B5B52]">{r.group}</span>
                </span>
                {i === active && <kbd className="rounded-md border border-[#E6DDD6] bg-white px-2 py-1 font-mono text-[11px] text-[#6B5B52]">↵</kbd>}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 border-t border-[#E6DDD6] bg-[#FAF9F8] px-5 py-2.5 text-xs text-[#6B5B52]">
          <span>↑↓ للتنقل</span>
          <span>↵ للفتح</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
