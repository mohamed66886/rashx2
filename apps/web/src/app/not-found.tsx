/**
 * Custom 404 Page
 * Rendered when a route is not found.
 */

import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <p className="mb-4 text-6xl font-extrabold text-[--color-accent]">
          404
        </p>
        <h1 className="mb-3 text-2xl font-bold">الصفحة غير موجودة</h1>
        <p className="mb-8 text-[--surface-muted-foreground]">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link
          href={routes.home}
          className="inline-flex items-center rounded-lg bg-[--color-accent] px-6 py-3 font-medium text-white transition-colors hover:bg-[--color-accent-light]"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
