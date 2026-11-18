import type { SVGProps } from 'react';

export interface ConceptNexusProps extends SVGProps<SVGSVGElement> {
  /** Size in pixels (width = height) */
  size?: number;
  /** Accessible label */
  'aria-label'?: string;
}

/**
 * Concept C: The Unbroken Nexus (الرابط المتين)
 *
 * Geometric Philosophy:
 * An unbroken continuous hexagonal ribbon with chamfered vertices, embodying
 * the complete unification of beauty salon operations (CRM, Point of Sale,
 * Inventory, Staff Governance, Customer Journey) into one seamless digital core.
 *
 * Status: EXPLORATION ONLY — FOR FOUNDER REVIEW
 */
export function ConceptNexus({
  size = 48,
  'aria-label': ariaLabel = 'Concept C: The Unbroken Nexus',
  ...props
}: ConceptNexusProps) {
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
      {/* Outer Continuous Chamfered Nexus Ring */}
      <path
        d="M24 4L40 13.2V34.8L24 44L8 34.8V13.2L24 4Z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Central Symmetric Core Axis */}
      <path
        d="M24 16V32M16 20L32 28M32 20L16 28"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

