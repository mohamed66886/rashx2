/**
 * PageContainer — Full-width page wrapper with max-width constraint.
 * Server Component.
 */

import { cn } from '../../lib/cn';
import type { HTMLAttributes } from 'react';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Max width variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  /** Whether to include horizontal padding */
  padded?: boolean;
}

const sizeClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-[1440px]',
  '3xl': 'max-w-[1600px]',
  full: 'max-w-full 2xl:max-w-[1600px]',
} as const;

export function PageContainer({
  className,
  size = 'full',
  padded = true,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        padded && 'px-4 sm:px-6 lg:px-8',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
