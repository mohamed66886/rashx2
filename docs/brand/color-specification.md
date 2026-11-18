# RASHX Color System Specification

> **Status:** Verified Specification · **Date:** 2026-11-18 · **Package:** `@rashx/tokens`

---

## 1. Philosophy & Color Hierarchy

The RASHX color system is architected around three co-equal primary anchors:
1. **Primary (`--color-primary`)**: Midnight Authority (`#1B1030`). Communicates institutional stability, security, and enterprise infrastructure.
2. **Secondary (`--color-secondary`)**: Deep Obsidian Violet (`#2E1F5E`). Bridges deep backgrounds and elevated containers.
3. **Third Primary Accent (`--color-accent`)**: Electric Purple (`#7C3AED`). **Clearly visible third primary color**. Conveys innovation, forward momentum, and digital precision.

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
  --color-neutral-700: #545271;  /* High-contrast muted body on light */
  --color-neutral-800: #3b3952;  /* Headings on tinted cards */
  --color-neutral-900: #252337;  /* High contrast dark */
  --color-neutral-950: #14121f;  /* Card surface dark */
  --color-neutral-1000: #0a0612; /* Canvas black */
}
```

### 2.3 Semantic Palette & Text Delineation

| Token | Light Value | Text Token (Light) | Dark Value | Dark Text Token | Role |
|---|---|---|---|---|---|
| `--color-success` | `#16a34a` (Green 600) | `#15803d` (Green 700) | `#22c55e` | `#4ade80` (Green 400) | Active salon, verified transaction |
| `--color-warning` | `#d97706` (Amber 600) | `#b45309` (Amber 700) | `#f59e0b` | `#fbbf24` (Amber 400) | Pending sync, threshold warnings |
| `--color-error` | `#dc2626` (Red 600) | `#dc2626` (Red 600) | `#ef4444` | `#f87171` (Red 400) | Failed action, conflict alert |
| `--color-info` | `#2563eb` (Blue 600) | `#1d4ed8` (Blue 700) | `#3b82f6` | `#60a5fa` (Blue 400) | System notice, release notes |

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
| `--surface-ring` | `#7c3aed` | `#a855f7` | Keyboard focus ring |

---

## 4. Independently Recalculated Contrast Audit (WCAG 2.2 AA)

*Calculated via strict W3C relative luminance formulas.*

| Foreground | Background | Context | Exact Ratio | WCAG 2.2 Rating | Architectural Finding |
|---|---|---|---|---|---|
| `#FFFFFF` | `#7C3AED` | White text on Electric Purple button | **5.70:1** | **PASS (AA >= 4.5)** | Fully accessible for primary CTAs |
| `#7C3AED` | `#FFFFFF` | Electric Purple link on White | **5.70:1** | **PASS (AA >= 4.5)** | Fully accessible for links / accents |
| `#7C3AED` | `#F8FAFC` | Electric Purple on elevated light | **5.45:1** | **PASS (AA >= 4.5)** | Fully accessible |
| `#FFFFFF` | `#2E1F5E` | White text on Obsidian Violet | **14.25:1** | **PASS (AAA >= 7.0)** | Exceptional enterprise contrast |
| `#7C3AED` | `#2E1F5E` | Electric Purple on Obsidian Violet | **2.50:1** | **FAIL (< 3.0:1)** | **PROHIBITED COMBINATION** |
| `#64748B` | `#FFFFFF` | Slate 500 on pure white | **4.76:1** | **PASS (AA >= 4.5)** | Passes on white only |
| `#64748B` | `#F0F0F7` | Slate 500 on muted surface | **4.20:1** | **FAIL (< 4.5:1)** | Fails normal text on muted surfaces |
| `#545271` | `#F0F0F7` | Neutral 700 on muted surface | **6.56:1** | **PASS (AA >= 4.5)** | Standardized as `--surface-muted-foreground` |
| `#16A34A` | `#FFFFFF` | Green 600 on White | **3.30:1** | **FAIL normal text** | Passes UI / Large text only (&ge; 3.0) |
| `#15803D` | `#FFFFFF` | Green 700 text on White | **5.02:1** | **PASS (AA >= 4.5)** | Standardized for `--color-success-text` |
| `#15803D` | `#DCFCE7` | Green 700 text on Light Green Badge | **4.79:1** | **PASS (AA >= 4.5)** | Fully accessible badge text |
| `#D97706` | `#FFFFFF` | Amber 600 on White | **3.19:1** | **FAIL normal text** | Passes UI / Large text only (&ge; 3.0) |
| `#B45309` | `#FFFFFF` | Amber 700 text on White | **5.02:1** | **PASS (AA >= 4.5)** | Standardized for `--color-warning-text` |
| `#8B5CF6` | `#1B1030` | Violet 500 on Deep Midnight | **4.26:1** | **FAIL (< 4.5:1)** | Fails normal text on Deep Midnight |
| `#A78BFA` | `#1B1030` | Violet 400 on Deep Midnight | **6.63:1** | **PASS (AA >= 4.5)** | Standardized for dark secondary |
| `#A78BFA` | `#0A0612` | Violet 400 on Dark Canvas | **7.37:1** | **PASS (AAA >= 7.0)** | Highly accessible dark accent |
| `#F0EEFF` | `#0A0612` | Light text on Dark Canvas | **17.54:1** | **PASS (AAA >= 7.0)** | Pristine dark mode legibility |
| `#AEACC8` | `#14101F` | Muted text on Dark Card | **8.49:1** | **PASS (AAA >= 7.0)** | Pristine dark card legibility |

---

## 5. Prohibited Usages (Anti-Patterns)

1. ❌ **No arbitrary non-token hex codes** in component markup (e.g., `text-[#a855f7]`).
2. ❌ **Never place `#7C3AED` text on `#2E1F5E`** (contrast 2.50:1 fails WCAG).
3. ❌ **Never place `#16A34A` or `#D97706` directly as body/label text on light backgrounds**; always use the dedicated high-contrast text tokens `--color-success-text` (`#15803D`) and `--color-warning-text` (`#B45309`).
4. ❌ **No multi-color rainbow gradients** across primary CTAs.
5. ❌ **No pastel pink or gold clichés** that undermine enterprise positioning.
