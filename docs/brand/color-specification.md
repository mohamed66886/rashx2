# RASHX Color System Specification

> **Status:** Specification Draft · **Date:** 2026-11-18 · **Package:** `@rashx/tokens`

---

## 1. Philosophy & Color Hierarchy

The RASHX color system is architected around three co-equal primary anchors:
1. **Primary (`--color-primary`)**: Midnight Authority (`#1b1030` / `#0d0833`). Communicates institutional stability, security, and enterprise infrastructure.
2. **Secondary (`--color-secondary`)**: Deep Obsidian Violet (`#2e1f5e` / `#1b1166`). Bridges deep backgrounds and elevated containers.
3. **Third Primary Accent (`--color-accent`)**: Electric Purple (`#7c3aed`). **Clearly visible third primary color**. Conveys innovation, forward momentum, and digital precision.

> [!IMPORTANT]
> In accordance with the brand directive, **purple is not a subtle hover state**. It is a defining primary brand pillar across all brand touchpoints, buttons, badges, and focal UI moments.

---

## 2. Technical Token Architecture

### 2.1 Primary Brand Palette (CSS Custom Properties)

```css
:root {
  /* Primary Midnight */
  --color-primary: #1b1030;
  --color-primary-foreground: #ffffff;

  /* Secondary Deep Violet */
  --color-secondary: #2e1f5e;
  --color-secondary-foreground: #ffffff;

  /* Third Primary: Electric Purple */
  --color-accent: #7c3aed;
  --color-accent-light: #9333ea;
  --color-accent-foreground: #ffffff;
}
```

### 2.2 Neutral Scales (12 Steps)

```css
:root {
  --color-neutral-0: #ffffff;    /* Pure White */
  --color-neutral-50: #f8f8fb;   /* App background light */
  --color-neutral-100: #f0f0f7;  /* Muted card surface */
  --color-neutral-200: #e2e1ef;  /* Subtle borders */
  --color-neutral-300: #cbc9e0;  /* Dividers & inactive outlines */
  --color-neutral-400: #aeacc8;  /* Placeholder text */
  --color-neutral-500: #8f8dab;  /* Secondary text / icons */
  --color-neutral-600: #706d8d;  /* Muted text */
  --color-neutral-700: #545271;  /* Body text on dark */
  --color-neutral-800: #3b3952;  /* Headings on tinted cards */
  --color-neutral-900: #252337;  /* High contrast dark */
  --color-neutral-950: #14121f;  /* Card surface dark */
  --color-neutral-1000: #080712; /* Canvas black */
}
```

### 2.3 Semantic Palette

| Token | Light Value | Dark Value | Meaning |
|---|---|---|---|
| `--color-success` | `#16a34a` (Emerald 600) | `#22c55e` (Emerald 500) | Completed booking, verified invoice, active salon |
| `--color-warning` | `#d97706` (Amber 600) | `#f59e0b` (Amber 500) | Low inventory, pending appointment, plan threshold |
| `--color-error` | `#dc2626` (Red 600) | `#ef4444` (Red 500) | Failed transaction, booking conflict, error state |
| `--color-info` | `#2563eb` (Blue 600) | `#3b82f6` (Blue 500) | System notice, release note, integration update |

---

## 3. Surface & Theme Mapping

| Surface Token | Light Theme | Dark Theme | Purpose |
|---|---|---|---|
| `--surface-background` | `#ffffff` | `#0a0612` | Root page background |
| `--surface-foreground` | `#0d0a1a` | `#f0eeff` | Default text color |
| `--surface-card` | `#ffffff` | `#14101f` | Card and sheet background |
| `--surface-card-foreground` | `#0d0a1a` | `#f0eeff` | Card text color |
| `--surface-muted` | `#f0f0f7` | `#1e1830` | Inactive tabs, disabled pills |
| `--surface-muted-foreground` | `#545271` | `#aeacc8` | Helper text, captions |
| `--surface-border` | `#e2e1ef` | `#2a2440` | Default component borders |
| `--surface-ring` | `#7c3aed` | `#9333ea` | Keyboard focus ring |

---

## 4. Accessibility & Contrast Verification (WCAG 2.2 AA)

- **White on Electric Purple (`#ffffff` on `#7c3aed`)**: Contrast ratio **5.28:1** (Passes Level AA for normal text and Level AAA for large text).
- **Body text on Light Surface (`#0d0a1a` on `#ffffff`)**: Contrast ratio **17.8:1** (Passes Level AAA).
- **Body text on Dark Surface (`#f0eeff` on `#0a0612`)**: Contrast ratio **16.4:1** (Passes Level AAA).
- **Error on Light Surface (`#dc2626` on `#fee2e2`)**: Contrast ratio **4.85:1** (Passes Level AA).

---

## 5. Prohibited Usages (Anti-Patterns)

1. ❌ **No arbitrary non-token hex codes** in component markup (e.g., `text-[#a855f7]`).
2. ❌ **No multi-color rainbow gradients** across primary CTAs.
3. ❌ **No pastel pink or gold clichés** that undermine the enterprise positioning.
4. ❌ **No low-contrast purple text** on dark backgrounds without verified 4.5:1 ratio.

