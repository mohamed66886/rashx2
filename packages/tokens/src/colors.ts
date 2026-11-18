/**
 * RASHX Official Brand Color Token System
 *
 * Single Source of Truth: rashx-brand
 *
 * Official Palette:
 * 1. Primary: Warm Peach (#F0C5AE) — Backgrounds, accents, cards
 * 2. Secondary: Dusty Blue (#91B8C0) — Details, secondary headers, cards
 * 3. Base 1: White (#FFFFFF) — Base canvas / surface
 * 4. Base 2: Soft Cream (#FAF9F8) — Elevated cards & soft surfaces
 * 5. Ink: (#54453D) — Official color for all logos, headings, and readable text
 *
 * Contrast Ratios (WCAG 2.2 AA / AAA):
 * - Ink (#54453D) on White (#FFFFFF): 9.04:1 (Passes AAA)
 * - Ink (#54453D) on Soft Cream (#FAF9F8): 8.65:1 (Passes AAA)
 * - Ink (#54453D) on Warm Peach (#F0C5AE): 5.82:1 (Passes AA normal, AAA large)
 * - Ink (#54453D) on Dusty Blue (#91B8C0): 4.31:1 (Passes UI components 3:1 & large text)
 * - White (#FFFFFF) on Ink (#54453D): 9.04:1 (Passes AAA)
 */

// ─── 1. Official Brand Palette (Single Source of Truth) ──────────────────────
export const colorBrand = {
  peach: '#F0C5AE', // Primary Brand Color
  blue: '#91B8C0',  // Secondary Brand Color
  white: '#FFFFFF', // Base 1
  cream: '#FAF9F8', // Base 2
  ink: '#54453D',   // Logo & All Text
} as const;

// ─── 2. Primary Brand Scale (Warm Peach #F0C5AE) ─────────────────────────────
export const colorPrimary = {
  50: '#FDF8F5',
  100: '#FBF0E9',
  200: '#F7E2D6',
  300: '#F3D3C2',
  400: '#F0C5AE', // Warm Peach (Anchor)
  500: '#E4A889',
  600: '#C78360',
  700: '#A4613F',
  800: '#7E4529',
  900: '#542D19',
} as const;

// ─── 3. Secondary Brand Scale (Dusty Blue #91B8C0) ───────────────────────────
export const colorSecondary = {
  50: '#F3F7F8',
  100: '#E4EEF0',
  200: '#CADEE2',
  300: '#AECDD3',
  400: '#91B8C0', // Dusty Blue (Anchor)
  500: '#6E9BA4',
  600: '#527C85',
  700: '#3D5E65',
  800: '#2C4349',
  900: '#1B2A2E',
} as const;

// ─── 4. Ink & Monochromatic Neutral Scale ───────────────────────────────────
export const colorNeutral = {
  0: '#FFFFFF',    // Pure White (Base 1)
  50: '#FAF9F8',   // Soft Cream (Base 2)
  100: '#F2EFEB',  // Card Muted
  200: '#E6E1DC',  // Subtle Borders
  300: '#D1C8C0',  // Strong Borders
  400: '#A39890',  // Muted Text Light
  500: '#75645B',  // Secondary Text Light
  600: '#54453D',  // Brand Ink (Anchor)
  700: '#433730',  // Deep Ink
  800: '#332924',  // Card Backgrounds Dark
  900: '#241D19',  // Elevated Surfaces Dark
  950: '#171310',  // Deep Canvas Dark
  1000: '#0C0A08', // True Dark
} as const;

// ─── 5. Semantic Feedback Palette ───────────────────────────────────────────
export const colorSemantic = {
  success: {
    DEFAULT: '#16a34a',
    text: '#15803d',
    darkText: '#4ade80',
    light: '#dcfce7',
    dark: '#052e16',
    border: '#86efac',
    foreground: '#ffffff',
  },
  warning: {
    DEFAULT: '#d97706',
    text: '#b45309',
    darkText: '#fbbf24',
    light: '#fef3c7',
    dark: '#451a03',
    border: '#fde68a',
    foreground: '#ffffff',
  },
  error: {
    DEFAULT: '#dc2626',
    text: '#dc2626',
    darkText: '#f87171',
    light: '#fee2e2',
    dark: '#450a0a',
    border: '#fca5a5',
    foreground: '#ffffff',
  },
  info: {
    DEFAULT: '#2563eb',
    text: '#1d4ed8',
    darkText: '#60a5fa',
    light: '#dbeafe',
    dark: '#172554',
    border: '#93c5fd',
    foreground: '#ffffff',
  },
} as const;

// ─── 6. Semantic Surface Tokens ─────────────────────────────────────────────
export const surfaceTokens = {
  light: {
    background: colorBrand.white,
    card: colorBrand.cream,
    elevated: colorBrand.white,
    muted: '#F5ECE5',
    border: '#E8DFD8',
    borderStrong: colorBrand.ink,
    foreground: colorBrand.ink,
    foregroundMuted: colorNeutral[500],
    ring: colorBrand.ink,
    overlay: 'rgb(84 69 61 / 0.5)',
  },
  dark: {
    background: '#1F1815',
    card: '#2A221E',
    elevated: '#362C27',
    muted: '#2A221E',
    border: colorBrand.ink,
    borderStrong: '#75645B',
    foreground: colorBrand.cream,
    foregroundMuted: '#D1C8C0',
    ring: colorBrand.peach,
    overlay: 'rgb(0 0 0 / 0.75)',
  },
} as const;

// ─── 7. CSS Variable Names Registry ─────────────────────────────────────────
export const colorTokenNames = {
  // Brand Anchors
  brandPeach: '--color-brand-peach',
  brandBlue: '--color-brand-blue',
  brandWhite: '--color-brand-white',
  brandCream: '--color-brand-cream',
  brandInk: '--color-brand-ink',

  primary: '--color-primary',
  primaryForeground: '--color-primary-foreground',
  secondary: '--color-secondary',
  secondaryForeground: '--color-secondary-foreground',
  accent: '--color-accent',
  accentLight: '--color-accent-light',
  accentForeground: '--color-accent-foreground',

  // Surfaces
  background: '--surface-background',
  foreground: '--surface-foreground',
  card: '--surface-card',
  cardForeground: '--surface-card-foreground',
  elevated: '--surface-elevated',
  elevatedForeground: '--surface-elevated-foreground',
  muted: '--surface-muted',
  mutedForeground: '--surface-muted-foreground',
  border: '--surface-border',
  borderStrong: '--surface-border-strong',
  ring: '--surface-ring',
  overlay: '--surface-overlay',

  // Semantics
  success: '--color-success',
  successText: '--color-success-text',
  successLight: '--color-success-light',
  warning: '--color-warning',
  warningText: '--color-warning-text',
  warningLight: '--color-warning-light',
  error: '--color-error',
  errorText: '--color-error-text',
  errorLight: '--color-error-light',
  info: '--color-info',
  infoText: '--color-info-text',
  infoLight: '--color-info-light',
} as const;
