/**
 * RASHX Button Component
 *
 * - Fully accessible (keyboard, ARIA)
 * - Supports asChild pattern (Radix Slot) for rendering as Link
 * - Variant system via class-variance-authority
 * - Server Component compatible (no 'use client' needed)
 */

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import type { ButtonHTMLAttributes } from 'react';

export const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-medium',
    'transition-colors duration-[--duration-normal]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--surface-ring] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[--color-accent] text-white',
          'hover:bg-[--color-accent-light]',
          'active:scale-[0.98]',
        ],
        secondary: [
          'bg-[--color-primary] text-white',
          'hover:bg-[--color-secondary]',
          'active:scale-[0.98]',
        ],
        outline: [
          'border-2 border-[--surface-border] text-[--surface-foreground]',
          'hover:border-[--color-accent] hover:text-[--color-accent]',
          'bg-transparent',
        ],
        ghost: [
          'text-[--surface-foreground]',
          'hover:bg-[--surface-muted]',
          'bg-transparent',
        ],
        link: [
          'text-[--color-accent] underline-offset-4',
          'hover:underline',
          'bg-transparent p-0 h-auto',
        ],
        destructive: [
          'bg-[--color-error] text-white',
          'hover:opacity-90',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, renders the component's child as the button element.
   * Use with Next.js Link for accessible navigation buttons.
   */
  asChild?: boolean;
  /** Shows a loading spinner and disables the button */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled ?? loading}
      aria-disabled={disabled ?? loading}
      {...props}
    >
      {children}
    </Comp>
  );
}
