/**
 * RASHX Official Brand Symbol (Rx)
 *
 * Single Source of Truth: rashx-brand/logo/symbol-rx/symbol-rx-ink.svg
 * Geometry, proportions, and paths are strictly preserved.
 */

import type { SVGProps } from 'react';
import { RASHX_PATHS } from './paths';

export interface RashxSymbolProps extends SVGProps<SVGSVGElement> {
  /** Size in pixels (width = height) */
  size?: number;
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

/** Official RASHX primary brand symbol (Rx) */
export function RashxSymbol({
  size = 32,
  color = 'ink',
  'aria-label': ariaLabel = 'RASHX Symbol',
  ...props
}: RashxSymbolProps) {
  const fill = COLOR_MAP[color];

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
