/**
 * RASHX Official Monogram (Rx Mark)
 *
 * Single Source of Truth: rashx-brand/social/ and rashx-brand/logo/symbol-rx/
 * Geometry, proportions, and paths are strictly preserved.
 */

import type { SVGProps } from 'react';
import { RASHX_PATHS } from './paths';

export interface RashxMonogramProps extends SVGProps<SVGSVGElement> {
  /** Size in pixels (width = height) */
  size?: number;
  /** Fill color variant */
  color?: 'ink' | 'white' | 'currentColor';
  /** Optional background surface */
  background?: 'peach' | 'blue' | 'ink' | 'white' | 'cream' | 'none';
  /** Accessible label */
  'aria-label'?: string;
}

const BG_COLOR_MAP = {
  peach: '#F0C5AE',
  blue: '#91B8C0',
  ink: '#54453D',
  white: '#FFFFFF',
  cream: '#FAF9F8',
  none: 'transparent',
} as const;

const COLOR_MAP = {
  ink: '#54453D',
  white: '#FFFFFF',
  currentColor: 'currentColor',
} as const;

export function RashxMonogram({
  size = 32,
  color,
  background = 'none',
  'aria-label': ariaLabel = 'RASHX Monogram',
  ...props
}: RashxMonogramProps) {
  // If background is ink, default color is white. Otherwise, default color is ink.
  const resolvedColor = color ?? (background === 'ink' ? 'white' : 'ink');
  const fill = COLOR_MAP[resolvedColor];
  const bgFill = BG_COLOR_MAP[background];

  if (background === 'none') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 1048.8 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={ariaLabel}
        {...props}
      >
        <title>{ariaLabel}</title>
        <path
          d={RASHX_PATHS.symbolRx}
          fill={fill}
          fillRule="evenodd"
        />
      </svg>
    );
  }

  // With rounded background container
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1200 1200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <title>{ariaLabel}</title>
      <rect width="1200" height="1200" rx="300" fill={bgFill} />
      <g transform="translate(180, 180) scale(0.8)">
        <path
          d={RASHX_PATHS.symbolRx}
          fill={fill}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}
