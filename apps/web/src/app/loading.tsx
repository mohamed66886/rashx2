/**
 * Global Loading UI
 * Shown during page transitions (Suspense boundary).
 */

export default function GlobalLoading() {
  return (
    <div
      className="flex min-h-[80vh] items-center justify-center"
      aria-label="جاري التحميل"
      role="status"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[--surface-muted] border-t-[--color-accent]" />
    </div>
  );
}
