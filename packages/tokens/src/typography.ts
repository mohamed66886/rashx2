/**
 * RASHX Typography Token System
 *
 * Arabic Font: Noto Kufi Arabic (variable weight)
 * Latin Font: Inter (variable weight)
 *
 * Strict Arabic shaping & line-height considerations:
 * - Arabic script has taller ascenders and deeper descenders than Latin.
 * - Arabic headings MUST NOT use leading < 1.3 to avoid diacritic and letter clipping.
 * - Numerals default to standard Latin/Arabic decimal figures.
 */

export const fontFamilies = {
  arabic: 'var(--font-arabic), "Noto Kufi Arabic", system-ui, sans-serif',
  latin: 'var(--font-latin), "Inter", system-ui, sans-serif',
  sans: 'var(--font-arabic), var(--font-latin), system-ui, sans-serif',
  mono: '"JetBrains Mono", "Courier New", monospace',
} as const;

export const fontSizes = {
  // Display Headlines
  'display-1': 'clamp(3rem, 5vw + 1rem, 5rem)',          // 48–80px
  'display-2': 'clamp(2.25rem, 4vw + 0.5rem, 3.75rem)',   // 36–60px

  // Section Headings H1–H6
  'heading-1': 'clamp(1.875rem, 3vw + 0.5rem, 2.75rem)',  // 30–44px
  'heading-2': 'clamp(1.5rem, 2vw + 0.5rem, 2.25rem)',    // 24–36px
  'heading-3': 'clamp(1.25rem, 1.5vw + 0.25rem, 1.75rem)',// 20–28px
  'heading-4': 'clamp(1.125rem, 1vw + 0.25rem, 1.375rem)',// 18–22px
  'heading-5': 'clamp(1rem, 0.5vw + 0.25rem, 1.125rem)',  // 16–18px
  'heading-6': '0.9375rem',                                // 15px

  // Body Text
  'body-lg': 'clamp(1.125rem, 1vw + 0.25rem, 1.25rem)',   // 18–20px
  body: '1rem',                                            // 16px
  'body-sm': '0.875rem',                                   // 14px

  // Interactive & Micro-copy
  button: '0.9375rem',                                     // 15px
  'button-sm': '0.8125rem',                                // 13px
  'button-lg': '1.0625rem',                                // 17px
  caption: '0.8125rem',                                    // 13px
  label: '0.75rem',                                        // 12px
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
  tight: '1.2',    // Display titles only
  snug: '1.35',   // Section headings
  normal: '1.5',   // Standard Latin text
  relaxed: '1.65', // Standard Arabic text (prevents glyph clipping)
  loose: '1.85',   // Arabic long-form editorial & quotes
} as const;

export const letterSpacings = {
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;
