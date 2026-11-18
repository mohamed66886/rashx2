/**
 * RASHX Badge Component
 *
 * Compact status indicators, category tags, and feature flags.
 * Fully tokenized with semantic color mapping and optional status dot.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import type { HTMLAttributes, ReactNode } from 'react';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors select-none whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-[--color-accent] text-white',
        secondary: 'bg-[--surface-muted] text-[--surface-muted-foreground]',
        outline: 'border border-[--surface-border] text-[--surface-foreground] bg-transparent',
        success: 'bg-[--color-success-light] text-[--color-success] border border-[--color-success]/20',
        warning: 'bg-[--color-warning-light] text-[--color-warning] border border-[--color-warning]/20',
        error: 'bg-[--color-error-light] text-[--color-error] border border-[--color-error]/20',
        info: 'bg-[--color-info-light] text-[--color-info] border border-[--color-info]/20',
        brand: 'bg-[--color-primary] text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px] gap-1',
        md: 'px-2.5 py-0.5 text-xs gap-1.5',
        lg: 'px-3 py-1 text-sm gap-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional status indicator dot */
  dot?: boolean;
  /** Optional icon rendered before badge label */
  icon?: ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  dot = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  const dotColorMap = {
    default: 'bg-white',
    secondary: 'bg-[--color-neutral-400]',
    outline: 'bg-[--color-accent]',
    success: 'bg-[--color-success]',
    warning: 'bg-[--color-warning]',
    error: 'bg-[--color-error]',
    info: 'bg-[--color-info]',
    brand: 'bg-[--color-accent]',
  };

  const activeVariant = variant ?? 'default';

  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            dotColorMap[activeVariant],
          )}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0 leading-none">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
