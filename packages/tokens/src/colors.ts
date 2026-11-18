/**
 * RASHX Color Token System
 *
 * Core Brand Pillars:
 * 1. Primary: Deep Midnight (#1B1030) — Authority, infrastructure, steadfastness
 * 2. Secondary: Obsidian Violet (#2E1F5E) — Structural depth, elevated surfaces
 * 3. Third Primary Accent: Electric Purple (#7C3AED) — Innovation, momentum, primary CTAs
 *
 * Strictly synchronized with packages/tokens/css/tokens.css
 */

// ─── 1. Primary Brand Palette (Midnight Authority) ───────────────────────────
export const colorPrimary = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#8c7ae6',
  500: '#5240e0',
  600: '#3d2eb8',
  700: '#2a1e8f',
  800: '#1b1166',
  900: '#1b1030', // Deep Midnight (Anchor)
  950: '#0d0833',
} as const;

// ─── 2. Secondary Brand Palette (Obsidian Violet) ────────────────────────────
export const colorSecondary = {
  50: '#faf8ff',
  100: '#f3effe',
  200: '#e5dcfc',
  300: '#cfc0f8',
  400: '#9b7ee8',
  500: '#6f4ec7',
  600: '#4f30a6',
  700: '#3c2384',
  800: '#2e1f5e', // Obsidian Violet (Anchor)
  900: '#201544',
  950: '#130b2c',
} as const;

// ─── 3. Third Primary Accent Palette (Electric Purple) ──────────────────────
export const colorAccent = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea', // Electric Purple Light
  700: '#7c3aed', // Electric Purple (Anchor)
  800: '#6d28d9',
  900: '#581c87',
  950: '#3b0764',
} as const;

// ─── 4. Neutral / Monochromatic Scale ───────────────────────────────────────
export const colorNeutral = {
  0: '#ffffff',    // Pure White
  50: '#f8f8fb',   // Soft Canvas Light
  100: '#f0f0f7',  // Card Muted Light
  200: '#e2e1ef',  // Subtle Borders Light
  300: '#cbc9e0',  // Strong Borders Light
  400: '#aeacc8',  // Placeholder Text Light / Muted Dark
  500: '#8f8dab',  // Secondary Text Light
  600: '#706d8d',  // Muted Body Light
  700: '#545271',  // Primary Text Dark
  800: '#3b3952',  // Card Borders Dark
  900: '#252337',  // Elevated Surfaces Dark
  950: '#14121f',  // Card Backgrounds Dark
  1000: '#0a0612', // Deep Canvas Dark
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
    background: colorNeutral[0],
    card: colorNeutral[0],
    elevated: colorNeutral[0],
    muted: colorNeutral[100],
    border: colorNeutral[200],
    borderStrong: colorNeutral[300],
    foreground: '#0d0a1a',
    foregroundMuted: colorNeutral[600],
    ring: colorAccent[700],
    overlay: 'rgb(13 10 26 / 0.6)',
  },
  dark: {
    background: '#0a0612',
    card: '#14101f',
    elevated: '#1e1830',
    muted: '#1e1830',
    border: '#2a2440',
    borderStrong: '#3b3952',
    foreground: '#f0eeff',
    foregroundMuted: colorNeutral[400],
    ring: colorAccent[500],
    overlay: 'rgb(0 0 0 / 0.75)',
  },
} as const;

// ─── 7. CSS Variable Names Registry ─────────────────────────────────────────
export const colorTokenNames = {
  // Brand Anchors
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
