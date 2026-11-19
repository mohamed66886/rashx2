/**
 * RASHX Button Component
 *
 * - Fully accessible (keyboard navigation, visible focus ring, ARIA)
 * - Supports `asChild` pattern (Radix Slot) for seamless Next.js Link composition
 * - Strict type-safe variant system via `class-variance-authority`
 * - Server Component compatible (zero 'use client' requirement)
 * - RTL first-class: gaps and icon slots handle bidirectional text flows
 */

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-medium text-sm',
    'transition-all duration-[--duration-normal] ease-[--easing-standard]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--surface-ring] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap cursor-pointer',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[#F0C5AE] text-[#54453D]',
          'hover:bg-[#E4A889]',
          'active:scale-[0.98]',
        ],
        secondary: [
          'bg-[#91B8C0] text-[#54453D]',
          'hover:bg-[#6E9BA4]',
          'active:scale-[0.98]',
        ],
        ink: [
          'bg-[#54453D] text-white',
          'hover:bg-[#433730]',
          'active:scale-[0.98]',
        ],
        outline: [
          'bg-[--surface-muted] text-[--surface-foreground]',
          'hover:bg-[#E8DFD8] hover:text-[--color-accent]',
          'active:scale-[0.98]',
        ],
        ghost: [
          'text-[--surface-foreground]',
          'hover:bg-[--surface-muted] hover:text-[--color-accent]',
          'active:bg-[--surface-muted]',
          'bg-transparent',
        ],
        link: [
          'text-[--color-accent] underline-offset-4',
          'hover:underline',
          'bg-transparent p-0 h-auto font-normal',
        ],
        destructive: [
          'bg-[--color-error] text-white',
          'hover:bg-red-700',
          'active:scale-[0.98]',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-12 px-6 text-base gap-2.5',
        xl: 'h-14 px-8 text-lg gap-3',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
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
   * When true, renders the child element as the root node via Radix Slot.
   * Enables rendering Next.js `<Link>` with full button styling and accessibility.
   */
  asChild?: boolean;
  /** Shows an accessible loading spinner and disables user interaction */
  loading?: boolean;
  /** Alias for loading */
  isLoading?: boolean;
  /** Optional icon rendered before the button text (start in RTL is right) */
  startIcon?: ReactNode;
  /** Alias for startIcon */
  leftIcon?: ReactNode;
  /** Optional icon rendered after the button text (end in RTL is left) */
  endIcon?: ReactNode;
  /** Alias for endIcon */
  rightIcon?: ReactNode;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  isLoading = false,
  disabled,
  startIcon,
  leftIcon,
  endIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const isBusy = loading || isLoading;
  const isDisabled = disabled ?? isBusy;
  const leadingIcon = startIcon ?? leftIcon;
  const trailingIcon = endIcon ?? rightIcon;

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isBusy}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {isBusy && (
            <svg
              className="h-4 w-4 animate-spin shrink-0 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              role="status"
              aria-label="Loading"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {!isBusy && leadingIcon && (
            <span className="shrink-0 leading-none">{leadingIcon}</span>
          )}
          <span>{children}</span>
          {!isBusy && trailingIcon && (
            <span className="shrink-0 leading-none">{trailingIcon}</span>
          )}
        </>
      )}
    </Comp>
  );
}
