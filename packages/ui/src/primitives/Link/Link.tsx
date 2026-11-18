/**
 * RASHX Link Component
 *
 * - Accessible semantic link supporting standard anchors and Next.js Link via `asChild`
 * - Language preservation utility: preserves active language across internal routes
 *   without introducing URL segment bloating (respects ADR 0003 & ADR 0004)
 * - Safe external link handling with explicit `openInNewTab` control (WCAG 2.2 AA compliant)
 *   Avoids unexpectedly forcing new tabs unless explicitly requested
 */

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

export const linkVariants = cva(
  'inline-flex items-center gap-1 transition-colors duration-[--duration-normal] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--surface-ring] focus-visible:ring-offset-2 rounded-sm',
  {
    variants: {
      variant: {
        default: 'text-[--surface-foreground] hover:text-[--color-accent]',
        muted: 'text-[--surface-muted-foreground] hover:text-[--surface-foreground]',
        accent: 'text-[--color-accent] hover:text-[--color-accent-light] font-medium',
        nav: 'text-[--surface-muted-foreground] hover:text-[--color-accent] hover:bg-[--surface-muted] px-3 py-2 rounded-md font-medium text-sm',
        underline: 'text-[--color-accent] underline underline-offset-4 hover:opacity-80',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

/**
 * Builds a localized internal href preserving query-based language strategy.
 * - Arabic (default): keeps clean path ('/about')
 * - English: appends or preserves ?lang=en ('/about?lang=en')
 * - External URLs: left unchanged
 */
export function buildLocalizedHref(href: string, lang?: string): string {
  if (
    !href.startsWith('/') ||
    href.startsWith('//') ||
    !lang ||
    lang === 'ar'
  ) {
    return href;
  }

  const [pathname, search] = href.split('?');
  const params = new URLSearchParams(search ?? '');
  if (!params.has('lang')) {
    params.set('lang', lang);
  }
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname ?? href;
}

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href: string;
  /** Whether the link points to an external destination */
  external?: boolean;
  /**
   * Explicitly controls whether the link opens in a new tab.
   * Default: false.
   * When true, enforces target="_blank", rel="noopener noreferrer", and accessible screen reader text.
   */
  openInNewTab?: boolean;
  /** Active language code for automatic query-param preservation */
  lang?: string;
  /** When true, renders child component via Radix Slot (e.g. Next.js Link) */
  asChild?: boolean;
  children: ReactNode;
}

export function Link({
  href,
  external = false,
  openInNewTab = false,
  lang,
  variant,
  size,
  className,
  asChild = false,
  children,
  target,
  rel,
  ...props
}: LinkProps) {
  const Comp = asChild ? Slot : 'a';
  const computedHref = external ? href : buildLocalizedHref(href, lang);
  const isExternal =
    external ||
    computedHref.startsWith('http://') ||
    computedHref.startsWith('https://') ||
    computedHref.startsWith('//');

  // Only open in a new tab if explicitly requested or if target was explicitly set to '_blank'
  const shouldOpenNewTab = openInNewTab || target === '_blank';

  const resolvedTarget = shouldOpenNewTab ? '_blank' : target;
  const resolvedRel = shouldOpenNewTab
    ? (rel ?? 'noopener noreferrer')
    : isExternal
      ? (rel ?? 'noopener')
      : rel;

  return (
    <Comp
      href={computedHref}
      className={cn(linkVariants({ variant, size, className }))}
      target={resolvedTarget}
      rel={resolvedRel}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children}
          {shouldOpenNewTab && (
            <span className="sr-only">
              {lang === 'ar' ? ' (يفتح في نافذة جديدة)' : ' (opens in a new tab)'}
            </span>
          )}
        </>
      )}
    </Comp>
  );
}
