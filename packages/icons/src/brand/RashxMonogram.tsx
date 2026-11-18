/**
 * RASHX Monogram
 *
 * ⚠️  PLACEHOLDER — awaiting approved final artwork.
 */

import type { SVGProps } from 'react';

export interface RashxMonogramProps extends SVGProps<SVGSVGElement> {
  size?: number;
  'aria-label'?: string;
}

/** RASHX monogram mark (placeholder) */
export function RashxMonogram({
  size = 24,
  'aria-label': ariaLabel = 'RASHX Monogram',
  ...props
}: RashxMonogramProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      {/* PLACEHOLDER — awaiting approved artwork */}
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="12"
        fontWeight="800"
        fill="currentColor"
        fontFamily="system-ui"
      >
        RX
      </text>
    </svg>
  );
}
