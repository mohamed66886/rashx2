/**
 * RASHX Official Vector Wordmark Component
 *
 * Single Source of Truth: rashx-brand/logo/
 * Supports English, Arabic, and Bilingual Combined lockup.
 * Geometry, proportions, and paths are strictly preserved.
 */

import type { SVGProps } from 'react';
import { RASHX_PATHS } from './paths';

export interface RashxWordmarkProps extends SVGProps<SVGSVGElement> {
  /** Logo variant: English, Arabic, or Combined bilingual */
  variant?: 'english' | 'arabic' | 'combined';
  /** Fill color variant */
  color?: 'ink' | 'white' | 'currentColor';
  /** Height in pixels (width is auto-calculated according to exact aspect ratio) */
  height?: number;
  /** Width in pixels (overrides aspect ratio) */
  width?: number;
  /** Accessible label */
  'aria-label'?: string;
}

const COLOR_MAP = {
  ink: '#54453D',
  white: '#FFFFFF',
  currentColor: 'currentColor',
} as const;

export function RashxWordmark({
  variant = 'combined',
  color = 'ink',
  height,
  width,
  'aria-label': ariaLabel,
  ...props
}: RashxWordmarkProps) {
  const fill = COLOR_MAP[color];

  if (variant === 'english') {
    const defaultHeight = height ?? 28;
    const computedWidth = width ?? Math.round(defaultHeight * (4549.3 / 1000));
    const label = ariaLabel ?? 'RASHX';

    return (
      <svg
        width={computedWidth}
        height={defaultHeight}
        viewBox="0 0 4549.3 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={label}
        {...props}
      >
        <title>{label}</title>
        <path
          d={RASHX_PATHS.wordmarkEnglish}
          fill={fill}
          fillRule="evenodd"
        />
      </svg>
    );
  }

  if (variant === 'arabic') {
    const defaultHeight = height ?? 28;
    const computedWidth = width ?? Math.round(defaultHeight * (7706.8 / 1000));
    const label = ariaLabel ?? 'راش إكس';

    return (
      <svg
        width={computedWidth}
        height={defaultHeight}
        viewBox="0 0 7706.8 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={label}
        {...props}
      >
        <title>{label}</title>
        <path
          d={RASHX_PATHS.wordmarkArabic}
          fill={fill}
          fillRule="evenodd"
        />
      </svg>
    );
  }

  // Combined bilingual lockup
  const defaultHeight = height ?? 36;
  const computedWidth = width ?? Math.round(defaultHeight * (1233.1 / 340));
  const label = ariaLabel ?? 'RASHX | راش إكس';

  return (
    <svg
      width={computedWidth}
      height={defaultHeight}
      viewBox="0 0 1233.1 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      {...props}
    >
      <title>{label}</title>
      <path
        transform="translate(0.000 0.000) scale(0.160000)"
        d={RASHX_PATHS.wordmarkArabic}
        fill={fill}
        fillRule="evenodd"
      />
      <path
        transform="translate(343.586 250.000) scale(0.090000)"
        d={RASHX_PATHS.wordmarkEnglish}
        fill={fill}
        fillRule="evenodd"
      />
    </svg>
  );
}
