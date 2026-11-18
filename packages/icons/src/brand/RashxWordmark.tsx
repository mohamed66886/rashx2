/**
 * RASHX Wordmark (text-based logo component)
 *
 * ⚠️  PLACEHOLDER — awaiting approved final wordmark artwork.
 * This component renders the RASHX name as text until the SVG wordmark is approved.
 */

import type { HTMLAttributes } from 'react';

export interface RashxWordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'arabic' | 'english' | 'combined';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  xs: { fontSize: '0.875rem' },
  sm: { fontSize: '1rem' },
  md: { fontSize: '1.25rem' },
  lg: { fontSize: '1.5rem' },
  xl: { fontSize: '2rem' },
} as const;

/** RASHX wordmark text component (placeholder) */
export function RashxWordmark({
  variant = 'combined',
  size = 'md',
  style,
  ...props
}: RashxWordmarkProps) {
  const fontSize = sizeStyles[size].fontSize;

  return (
    <span
      style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize, ...style }}
      aria-label="RASHX"
      {...props}
    >
      {variant === 'arabic' && 'راش إكس'}
      {variant === 'english' && 'RASHX'}
      {variant === 'combined' && (
        <>
          <span>RASHX</span>
          <span aria-hidden="true" style={{ marginInlineStart: '0.25em', opacity: 0.7 }}>
            | راش إكس
          </span>
        </>
      )}
    </span>
  );
}
