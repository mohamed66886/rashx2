/**
 * RASHX Avatar Component
 *
 * User and salon brand avatar with robust fallback initials handling.
 */

'use client';

import { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import type { HTMLAttributes } from 'react';

export const avatarVariants = cva(
  'inline-flex items-center justify-center overflow-hidden font-semibold select-none bg-[--surface-muted] text-[--color-primary] border border-[--surface-border] shrink-0',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-24 w-24 text-3xl',
      },
      shape: {
        circle: 'rounded-full',
        rounded: 'rounded-lg',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  },
);

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /** Image source URL */
  src?: string;
  /** Accessible label describing the person or salon */
  alt: string;
  /** Fallback initials to display if image is loading or fails */
  fallback: string;
}

export function Avatar({
  src,
  alt,
  fallback,
  size,
  shape,
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src) && !hasError;

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(avatarVariants({ size, shape, className }))}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true" className="font-bold tracking-tight">
          {fallback.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}
