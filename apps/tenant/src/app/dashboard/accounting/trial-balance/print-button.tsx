'use client';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="group inline-flex h-11 items-center gap-2 rounded-xl bg-[#54453D] px-5 text-sm font-bold text-white transition-all duration-150 hover:bg-[#433730] active:scale-[0.97] cursor-pointer print:hidden max-sm:w-full max-sm:justify-center"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5">
        <path d="M7 9V3.5h10V9M7 17.5H5A1.5 1.5 0 0 1 3.5 16v-5A2 2 0 0 1 5.5 9h13a2 2 0 0 1 2 2v5a1.5 1.5 0 0 1-1.5 1.5h-2M7 14h10v6.5H7z" />
      </svg>
      طباعة / حفظ PDF
    </button>
  );
}
