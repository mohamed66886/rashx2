# RASHX Semantic Design Tokens Specification

> **Document Class:** Design System Engineering Specification  
> **Target Packages:** `@rashx/tokens`, `@rashx/ui`, `@rashx/web`  
> **Version:** Phase 2.1 Verified & Corrected  
> **Date:** 2026-11-18  

---

## 1. Architecture Overview

RASHX implements a 3-tier token architecture:
1. **Primitive Tokens (`primitives`):** Raw color values and numerical scales (e.g. `violet-600: #7C3AED`, `neutral-900: #252337`).
2. **Semantic Tokens (`semantic`):** Intent-based abstractions mapped to component contexts (e.g. `--color-primary`, `--surface-background`, `--color-border-subtle`).
3. **Component Tokens:** Consumed directly by `@rashx/ui` primitives via standard CSS custom properties.

---

## 2. Core Brand Anchors

| Token Name | Hex Code | Role in System | Permitted Combinations |
|---|---|---|---|
| **Deep Midnight** | `#1B1030` | Dark theme canvas, deep corporate anchor, authoritative foundation | Surface background in dark mode, high-contrast dark text on light mode |
| **Obsidian Violet** | `#2E1F5E` | Secondary brand anchor, dark surface elevation, structural containers | Surface card fill in dark mode, active header states |
| **Electric Purple** | `#7C3AED` | Primary interactive accent, focal actions, badges, active indicators | Primary buttons, brand focus rings, highlights, status anchors |

---

## 3. Light vs. Dark Semantic Token Mapping (Independently Verified Contrast)

| CSS Variable | Role / Intent | Light Theme Value | Dark Theme Value | Verified Contrast Ratio | WCAG 2.2 Status |
|---|---|---|---|---|---|
| `--color-primary` | Main interactive brand anchor | `#7C3AED` | `#7C3AED` | **5.70:1** vs White | **AA (Pass)** |
| `--color-primary-hover` | Hover state for primary | `#6D28D9` | `#9333EA` | **6.58:1** vs White | **AA (Pass)** |
| `--color-secondary` | Secondary brand surface/container | `#2E1F5E` | `#A78BFA` | **14.25:1** (White on `#2E1F5E`) / **7.37:1** (`#A78BFA` on dark) | **AAA (Pass)** |
| `--color-accent` | Vibrant accent highlight | `#7C3AED` | `#A78BFA` | **5.70:1** (Light) / **7.37:1** (Dark) | **AA / AAA** |
| `--surface-background` | Global document canvas | `#FFFFFF` | `#0A0612` | Reference Canvas | Reference |
| `--surface-elevated` | Cards, popovers, elevated surfaces | `#F8FAFC` | `#1E1830` | Distinguishable | Distinguishable |
| `--surface-foreground` | Primary readable text | `#0D0A1A` | `#F0EEFF` | **18.9:1** (Light) / **17.5:1** (Dark) | **AAA (Pass)** |
| `--surface-muted-foreground` | Secondary helper text | `#545271` | `#AEACC8` | **7.44:1** on White / **8.49:1** on Dark Card | **AAA (Pass)** |
| `--color-border` | Standard structural borders | `#E2E1EF` | `#2A2440` | Subtle partition | Subtle partition |
| `--color-focus-ring` | Keyboard focus outline | `#7C3AED` | `#A855F7` | **5.70:1** vs White | **AA (Pass)** |
| `--color-success` | Graphical success indicator / dot | `#16A34A` | `#22C55E` | **3.30:1** (UI Component Pass) | **Pass (UI >= 3.0)** |
| `--color-success-text` | Body / badge text for success | `#15803D` | `#4ADE80` | **5.02:1** on White / **8.55:1** in Dark | **AA / AAA (Pass)** |
| `--color-warning` | Graphical warning indicator / dot | `#D97706` | `#F59E0B` | **3.19:1** (UI Component Pass) | **Pass (UI >= 3.0)** |
| `--color-warning-text` | Body / badge text for warning | `#B45309` | `#FBBF24` | **5.02:1** on White / **8.97:1** in Dark | **AA / AAA (Pass)** |
| `--color-error` | Graphical error indicator / dot | `#DC2626` | `#EF4444` | **4.83:1** (Passes normal text) | **AA (Pass)** |
| `--color-error-text` | Body / badge text for error | `#DC2626` | `#F87171` | **4.83:1** on White / **6.76:1** on Dark Card | **AA (Pass)** |
| `--color-info` | Graphical info indicator / dot | `#2563EB` | `#3B82F6` | **5.17:1** (Passes normal text) | **AA (Pass)** |
| `--color-info-text` | Body / badge text for info | `#1D4ED8` | `#60A5FA` | **6.70:1** on White / **7.35:1** on Dark Card | **AA / AAA (Pass)** |

---

## 4. Prohibited Color Combinations (Anti-Patterns)

1. ❌ **Electric Purple on Obsidian Violet:** Insufficient contrast (`2.50:1`) for any text or interactive elements. Only high-contrast text (`#FFFFFF` or `#F8FAFC`) is permitted on Obsidian Violet.
2. ❌ **Direct use of `#16A34A` or `#D97706` for normal text on white surfaces:** Both fail normal text requirements (`3.30:1` and `3.19:1`). Always consume `--color-success-text` (`#15803D`) and `--color-warning-text` (`#B45309`).
3. ❌ **`#8B5CF6` on Deep Midnight `#1B1030`:** Has contrast `4.26:1` (fails normal text). Always use `#A78BFA` (`6.63:1`).
4. ❌ **Hardcoded Hex Values:** No component in `@rashx/ui` or `apps/web` may specify inline hex colors. All styling must consume design tokens.
