import type { SVGProps } from 'react';

export interface ConceptAnchorProps extends SVGProps<SVGSVGElement> {
  /** Size in pixels (width = height) */
  size?: number;
  /** Accessible label */
  'aria-label'?: string;
}

/**
 * Concept A: The Architectural Anchor (الرسوخ والريادة)
 *
 * Geometric Philosophy:
 * Represents foundational steadfastness (الثبات) through a grounded structural stem,
 * coupled with an ascending diagonal prism that breaks free at an acute apex (الانطلاق),
 * evoking both the letter 'R' and the dynamic diagonal strike of 'X'.
 *
 * Status: EXPLORATION ONLY — FOR FOUNDER REVIEW
 */
export function ConceptAnchor({
  size = 48,
  'aria-label': ariaLabel = 'Concept A: The Architectural Anchor',
  ...props
}: ConceptAnchorProps) {
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
      {/* Structural Grounded Stem (Steadfastness / الثبات) */}
      <path
        d="M8 8C8 6.89543 8.89543 6 10 6H18C19.1046 6 20 6.89543 20 8V40C20 41.1046 19.1046 42 18 42H10C8.89543 42 8 41.1046 8 40V8Z"
        fill="currentColor"
      />
      {/* Upper Arch loop forming architectural crown */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 6H30C36.6274 6 42 11.3726 42 18C42 24.6274 36.6274 30 30 30H20V22H29C31.2091 22 33 20.2091 33 18C33 15.7909 31.2091 14 29 14H20V6Z"
        fill="currentColor"
      />
      {/* Ascending Cantilever Strut (Freedom / الانطلاق) */}
      <path
        d="M24 24L37.5 40.5C38.3 41.5 39.7 42 41 42H44L28.5 23L24 24Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
    </svg>
  );
}
