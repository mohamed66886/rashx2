/**
 * SectionContainer — Semantic section wrapper with consistent vertical spacing.
 * Server Component.
 */

import { cn } from '../../lib/cn';
import type { HTMLAttributes } from 'react';

export interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  /** Use 'article' or 'aside' when semantically appropriate */
  as?: 'section' | 'article' | 'aside' | 'div';
  /** Vertical spacing size */
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

const spacingClasses = {
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-24',
  xl: 'py-24 md:py-32',
} as const;

export function SectionContainer({
  as: Comp = 'section',
  className,
  spacing = 'lg',
  children,
  ...props
}: SectionContainerProps) {
  return (
    <Comp
      className={cn(spacingClasses[spacing], className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
