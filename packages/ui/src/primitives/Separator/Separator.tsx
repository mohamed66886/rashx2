/**
 * RASHX Separator Component
 *
 * Semantic or decorative divider with full ARIA role management.
 */

import { cn } from '../../lib/cn';
import type { HTMLAttributes } from 'react';

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement | HTMLDivElement> {
  /** Orientation of the separator */
  orientation?: 'horizontal' | 'vertical';
  /**
   * When true, screen readers ignore the element (role="none").
   * When false, announces a visual break (role="separator").
   */
  decorative?: boolean;
}

export function Separator({
  orientation = 'horizontal',
  decorative = true,
  className,
  ...props
}: SeparatorProps) {
  const isHorizontal = orientation === 'horizontal';

  if (isHorizontal) {
    return (
      <hr
        role={decorative ? 'none' : 'separator'}
        aria-orientation="horizontal"
        aria-hidden={decorative ? 'true' : undefined}
        className={cn('w-full my-6 shrink-0 h-0 border-0', className)}
        {...props}
      />
    );
  }

  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation="vertical"
      aria-hidden={decorative ? 'true' : undefined}
      className={cn('self-stretch w-0 mx-4 shrink-0', className)}
      {...props}
    />
  );
}

