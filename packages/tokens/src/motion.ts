/**
 * RASHX Motion / Animation Token System
 * Supports prefers-reduced-motion automatically via CSS.
 */

export const durations = {
  instant: '0ms',
  fast: '100ms',
  normal: '200ms',
  slow: '350ms',
  slower: '500ms',
  sluggish: '700ms',
} as const;

export const easings = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;
