# RASHX Semantic Design Tokens Specification

> **Document Class:** Design System Engineering Specification  
> **Target Packages:** `@rashx/tokens`, `@rashx/ui`, `@rashx/web`  
> **Version:** Phase 2.1 Final  
> **Date:** 2026-11-18  

---

## 1. Architecture Overview

RASHX implements a 3-tier token architecture:
1. **Primitive Tokens (`primitives`):** Raw color values and numerical scales (e.g. `violet-600: #7C3AED`, `neutral-900: #0F172A`).
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

## 3. Light vs. Dark Semantic Token Mapping

| CSS Variable | Role / Intent | Light Theme Value | Dark Theme Value | Min Contrast vs Bg |
|---|---|---|---|---|
| `--color-primary` | Main interactive brand anchor | `#7C3AED` | `#8B5CF6` | 4.8:1 (AA) |
| `--color-primary-hover` | Hover state for primary | `#6D28D9` | `#9333EA` | 5.5:1 (AA) |
| `--color-secondary` | Secondary brand surface/accent | `#2E1F5E` | `#A78BFA` | 8.2:1 (AAA) |
| `--color-accent` | Vibrant accent highlight | `#7C3AED` | `#A855F7` | 4.8:1 (AA) |
| `--surface-background` | Global document canvas | `#FFFFFF` | `#1B1030` | Reference Canvas |
| `--surface-elevated` | Cards, popovers, elevated surfaces | `#F8FAFC` | `#241842` | Distinguishable |
| `--surface-foreground` | Primary readable text | `#0F172A` | `#F8FAFC` | 14.2:1 (AAA) |
| `--surface-muted-foreground` | Secondary helper text | `#64748B` | `#94A3B8` | 5.1:1 (AA) |
| `--color-border` | Standard structural borders | `#E2E8F0` | `#3A2A68` | Subtle partition |
| `--color-border-subtle` | Ultra-fine dividers / separators | `#F1F5F9` | `#2D2152` | Subtle partition |
| `--color-focus-ring` | Keyboard focus outline | `#7C3AED` | `#A855F7` | 3.5:1 (Interactive) |
| `--color-success` | Positive state / active / confirmed | `#16A34A` | `#22C55E` | 4.6:1 (AA) |
| `--color-warning` | Pending / attention / cautions | `#D97706` | `#F59E0B` | 4.5:1 (AA) |
| `--color-error` | Destructive / critical errors | `#DC2626` | `#EF4444` | 4.8:1 (AA) |
| `--color-info` | Informational announcements | `#2563EB` | `#3B82F6` | 4.7:1 (AA) |

---

## 4. Prohibited Color Combinations (Anti-Patterns)

1. ❌ **Electric Purple on Obsidian Violet:** Insufficient contrast (~2.8:1) for regular body text. Only high-contrast text (`#FFFFFF` or `#F8FAFC`) is permitted on Obsidian Violet.
2. ❌ **Muted Text on Deep Midnight:** Must use at minimum `--neutral-400` (`#94A3B8`) or lighter to preserve WCAG AA legibility.
3. ❌ **Hardcoded Hex Values:** No component in `@rashx/ui` or `apps/web` may specify inline hex colors (e.g. `#fff`, `#000`, `#7C3AED`). All styling must consume Tailwind utility classes mapped to CSS variables.
4. ❌ **Unvetted Gradients:** Gradients are strictly prohibited on functional buttons, navigation links, and body text. Gradients dilute corporate authority and impair contrast.
