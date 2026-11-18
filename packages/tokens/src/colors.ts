/**
 * RASHX Color Token System
 *
 * Brand direction: dark authority palette with vivid purple accent.
 * ⚠️ PLACEHOLDER VALUES — pending founder approval of exact brand colors.
 * Update hex values after color approval before Phase 2 completion.
 */

// ─── Primary Palette ───────────────────────────────────────────────────────

/** Primary brand color — deep authority tone */
export const colorPrimary = {
  50: '#f0eeff',
  100: '#e3deff',
  200: '#c8bdff',
  300: '#a99cff',
  400: '#8a7aff',
  500: '#6b58ff',
  600: '#5240e0',
  700: '#3d2eb8',
  800: '#2a1e8f',
  900: '#1b1166',
  950: '#0d0833',
} as const;

/** Accent / Purple — clearly visible third primary brand color */
export const colorAccent = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea',
  700: '#7c3aed',
  800: '#6d28d9',
  900: '#581c87',
  950: '#3b0764',
} as const;

/** Neutral / Gray scale */
export const colorNeutral = {
  0: '#ffffff',
  50: '#f8f8fb',
  100: '#f0f0f7',
  200: '#e2e1ef',
  300: '#cbc9e0',
  400: '#aeacc8',
  500: '#8f8dab',
  600: '#706d8d',
  700: '#545271',
  800: '#3b3952',
  900: '#252337',
  950: '#14121f',
  1000: '#080712',
} as const;

/** Semantic colors */
export const colorSemantic = {
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#d97706',
  warningLight: '#fef3c7',
  error: '#dc2626',
  errorLight: '#fee2e2',
  info: '#2563eb',
  infoLight: '#dbeafe',
} as const;

/** CSS custom property names for all brand colors */
export const colorTokenNames = {
  primary: '--color-primary',
  accent: '--color-accent',
  accentForeground: '--color-accent-foreground',
  background: '--color-background',
  foreground: '--color-foreground',
  card: '--color-card',
  cardForeground: '--color-card-foreground',
  muted: '--color-muted',
  mutedForeground: '--color-muted-foreground',
  border: '--color-border',
  ring: '--color-ring',
  success: '--color-success',
  warning: '--color-warning',
  error: '--color-error',
  info: '--color-info',
} as const;
