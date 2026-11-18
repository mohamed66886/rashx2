import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import type { HTMLAttributes } from 'react';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[--color-accent] text-white',
        secondary: 'bg-[--surface-muted] text-[--surface-muted-foreground]',
        outline: 'border border-[--surface-border] text-[--surface-foreground]',
        success: 'bg-[--color-success-light] text-[--color-success]',
        warning: 'bg-[--color-warning-light] text-[--color-warning]',
        error: 'bg-[--color-error-light] text-[--color-error]',
        info: 'bg-[--color-info-light] text-[--color-info]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
