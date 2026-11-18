/**
 * RASHX Official Bilingual Lockup
 *
 * Single Source of Truth: rashx-brand/logo/lockup-bilingual/lockup-bilingual-ink.svg
 * Geometry, proportions, and paths are strictly preserved.
 */

import type { SVGProps } from 'react';
import { RASHX_PATHS } from './paths';

export interface RashxLockupBilingualProps extends SVGProps<SVGSVGElement> {
  /** Height in pixels (width scales with 1233.1 / 340 ratio) */
  height?: number;
  /** Width in pixels (overrides auto-ratio width) */
  width?: number;
  /** Fill color variant */
  color?: 'ink' | 'white' | 'currentColor';
  /** Accessible label */
  'aria-label'?: string;
}

const COLOR_MAP = {
  ink: '#54453D',
  white: '#FFFFFF',
  currentColor: 'currentColor',
} as const;

/** Official RASHX Bilingual Lockup (Arabic + English) */
export function RashxLockupBilingual({
  height = 40,
  width,
  color = 'ink',
  'aria-label': ariaLabel = 'RASHX | راش إكس',
  ...props
}: RashxLockupBilingualProps) {
  const fill = COLOR_MAP[color];
  const computedWidth = width ?? Math.round(height * (1233.1 / 340));

  return (
    <svg
      width={computedWidth}
      height={height}
      viewBox="0 0 1233.1 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <title>{ariaLabel}</title>
      {/* Arabic Wordmark Portion */}
      <path
        transform="translate(0.000 0.000) scale(0.160000)"
        d={RASHX_PATHS.wordmarkArabic}
        fill={fill}
        fillRule="evenodd"
      />
      {/* English Wordmark Portion */}
      <path
        transform="translate(343.586 250.000) scale(0.090000)"
        d={RASHX_PATHS.wordmarkEnglish}
        fill={fill}
        fillRule="evenodd"
      />
    </svg>
  );
}
