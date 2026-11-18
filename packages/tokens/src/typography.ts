/**
 * RASHX Typography Token System
 *
 * Arabic font: Noto Kufi Arabic (variable weight)
 * Latin font: Inter (variable weight)
 * Both served via next/font/google with CSS variable injection.
 */

export const fontFamilies = {
  arabic: 'var(--font-arabic), "Noto Kufi Arabic", system-ui, sans-serif',
  latin: 'var(--font-latin), "Inter", system-ui, sans-serif',
  sans: 'var(--font-arabic), var(--font-latin), system-ui, sans-serif',
  mono: '"JetBrains Mono", "Courier New", monospace',
} as const;

export const fontSizes = {
  'display-1': 'clamp(3rem, 5vw + 1rem, 5rem)',   // 48–80px
  'display-2': 'clamp(2.25rem, 4vw + 0.5rem, 3.5rem)', // 36–56px
  'heading-1': 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)', // 28–40px
  'heading-2': 'clamp(1.375rem, 2vw + 0.5rem, 2rem)',  // 22–32px
  'heading-3': 'clamp(1.125rem, 1.5vw + 0.25rem, 1.5rem)', // 18–24px
  'body-lg': 'clamp(1.0625rem, 1vw + 0.5rem, 1.25rem)', // 17–20px
  body: '1rem',   // 16px
  'body-sm': '0.875rem', // 14px
  caption: '0.8125rem', // 13px
  label: '0.75rem',    // 12px
} as const;

export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const lineHeights = {
  tight: '1.1',
  snug: '1.3',
  normal: '1.5',
  relaxed: '1.6',
  loose: '1.8',
} as const;

export const letterSpacings = {
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;
