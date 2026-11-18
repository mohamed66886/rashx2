import type { SVGProps } from 'react';

export interface ConceptMonolithProps extends SVGProps<SVGSVGElement> {
  /** Size in pixels (width = height) */
  size?: number;
  /** Accessible label */
  'aria-label'?: string;
}

/**
 * Concept B: The Dynamic Monolith (الكتلة المنطلقة)
 *
 * Geometric Philosophy:
 * Two solid, high-precision interlocking geometric masses. A grounded vertical
 * monolith anchoring operational discipline, sliced by a 50-degree ascending
 * kinetic shard representing digital acceleration, cloud sovereignty, and bold market entry.
 *
 * Status: EXPLORATION ONLY — FOR FOUNDER REVIEW
 */
export function ConceptMonolith({
  size = 48,
  'aria-label': ariaLabel = 'Concept B: The Dynamic Monolith',
  ...props
}: ConceptMonolithProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      {/* Grounded Monolith Core (Operation & Governance) */}
      <path
        d="M6 10C6 7.79086 7.79086 6 10 6H18C20.2091 6 22 7.79086 22 10V38C22 40.2091 20.2091 42 18 42H10C7.79086 42 6 40.2091 6 38V10Z"
        fill="currentColor"
      />
      {/* Ascending Kinetic Shard (Speed & Freedom) */}
      <path
        d="M26 18C26 15.7909 27.7909 14 30 14H38C40.2091 14 42 15.7909 42 18V28L30 42H26V18Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      {/* Dynamic Bridging Horizon Bar */}
      <path
        d="M16 20H32C33.1046 20 34 20.8954 34 22V26C34 27.1046 33.1046 28 32 28H16C14.8954 28 14 27.1046 14 26V22C14 20.8954 14.8954 20 16 20Z"
        fill="currentColor"
      />
    </svg>
  );
}
