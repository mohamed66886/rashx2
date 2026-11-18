/**
 * RASHX IconButton Component
 *
 * Dedicated icon-only button requiring an explicit, non-empty `aria-label`
 * for full WCAG 2.2 AA accessibility compliance.
 */

import { Button, type buttonVariants } from '../Button/Button';
import { cn } from '../../lib/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    Pick<VariantProps<typeof buttonVariants>, 'variant'> {
  /**
   * Accessible description of the button's action. Required for screen readers.
   */
  'aria-label': string;
  /**
   * The icon element to render inside the button.
   */
  icon: ReactNode;
  /**
   * Icon button square sizing:
   * - sm: 32×32 px
   * - md: 40×40 px (standard touch target)
   * - lg: 48×48 px (large touch target)
   */
  size?: 'sm' | 'md' | 'lg';
  /** Shows loading spinner */
  loading?: boolean;
  /** Alias for loading */
  isLoading?: boolean;
}

export function IconButton({
  icon,
  size = 'md',
  className,
  'aria-label': ariaLabel,
  loading = false,
  isLoading = false,
  ...props
}: IconButtonProps) {
  const sizeMap = {
    sm: 'icon-sm' as const,
    md: 'icon' as const,
    lg: 'icon-lg' as const,
  };

  const isBusy = loading || isLoading;

  return (
    <Button
      size={sizeMap[size]}
      className={cn('shrink-0', className)}
      aria-label={ariaLabel}
      loading={isBusy}
      {...props}
    >
      {icon}
    </Button>
  );
}
