/**
 * RASHX Brand Symbol
 *
 * ⚠️  PLACEHOLDER — This is a geometric placeholder awaiting
 * the approved final logo artwork from the founder/designer.
 * Replace the SVG paths when final artwork is approved.
 *
 * Do not use this in production without approval.
 */

import type { SVGProps } from 'react';

export interface RashxSymbolProps extends SVGProps<SVGSVGElement> {
  /** Size in pixels (width = height) */
  size?: number;
  /** Accessible label — always provide for standalone usage */
  'aria-label'?: string;
}

/** RASHX primary brand symbol (placeholder) */
export function RashxSymbol({
  size = 32,
  'aria-label': ariaLabel = 'RASHX Symbol',
  ...props
}: RashxSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      {/* PLACEHOLDER — awaiting approved artwork */}
      <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.1" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="currentColor"
        fontFamily="system-ui"
      >
        R
      </text>
    </svg>
  );
}
