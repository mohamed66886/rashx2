'use client';

/**
 * Global Error Boundary
 * Catches unhandled errors in the route segment.
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <p className="mb-4 text-6xl font-extrabold text-[--color-error]">
          500
        </p>
        <h1 className="mb-3 text-2xl font-bold">خطأ في الخادم</h1>
        <p className="mb-2 text-[--surface-muted-foreground]">
          حدث خطأ غير متوقع. فريقنا يعمل على الحل.
        </p>
        {error.digest !== undefined && (
          <p className="mb-6 font-mono text-xs text-[--surface-muted-foreground]">
            معرف الخطأ: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center rounded-lg bg-[--color-accent] px-6 py-3 font-medium text-white transition-colors hover:bg-[--color-accent-light]"
        >
          المحاولة مجدداً
        </button>
      </div>
    </div>
  );
}
