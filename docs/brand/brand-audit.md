# RASHX Brand Audit — Phase 1 Evaluation

> **Status:** Completed Audit · **Date:** 2026-11-18 · **Role:** Brand Identity Engineer & Design System Architect  
> **Brand:** RASHX | راش إكس · **Domain:** https://rashx.org

---

## 1. Executive Summary

This audit assesses the state of brand assets, tokens, and components delivered in Phase 1 against the creative and corporate directives established by the founder:
- **Unconventional visual identity** (anti-template, SaaS-distinctive).
- **Strong, confident, and modern appearance**.
- **Purple as a visible third primary brand color**, not a secondary hover accent.
- **Indirect symbolic inspiration** from steadfastness and freedom.
- **Zero excessive gradients** or generic beauty-salon clichés (no floral swirls or pastel fades).
- **Strict architectural decoupling** between the corporate identity and future SaaS platform.

---

## 2. Inventory of Current Brand Assets & Code

| Component / Token | Location | Current State | Audit Finding |
|---|---|---|---|
| `RashxSymbol` | `packages/icons/src/brand/RashxSymbol.tsx` | Geometric placeholder (`<rect>` + "R") | Clearly marked as placeholder. Needs proprietary geometry inspired by steadfastness/freedom once founder approves artwork. |
| `RashxMonogram` | `packages/icons/src/brand/RashxMonogram.tsx` | Minimal circle + "RX" text | Geometric placeholder. Valid temporary asset for favicons and small avatar scales. |
| `RashxWordmark` | `packages/icons/src/brand/RashxWordmark.tsx` | Typographic component (`arabic`, `english`, `combined`) | Highly legible, uses system font weight 800 with negative tracking. Awaits custom lettering. |
| Brand Color Tokens | `packages/tokens/src/colors.ts` & `css/tokens.css` | 3-tier system (`--color-primary`, `--color-secondary`, `--color-accent`) | Purple (`#7c3aed`) is correctly elevated to third primary. Missing `colorSecondary` in TypeScript exports. |
| Brand Metadata | `packages/content/src/corporate/company.ts` | Factual company metadata | 100% compliant: No fabricated metrics, testimonials, or ZATCA Phase 2 claims. |

---

## 3. Compliance with Creative Directives

### 3.1 Unconventional Visual Language
- **Finding:** The corporate foundation rejects the pastel pink/gold palette common to generic beauty booking software. The foundational dark authority tone paired with sharp electric purple positions RASHX as a high-performance **Operating System**, not just a booking app.
- **Recommendation:** Maintain this technical rigor into Phase 2 component styling.

### 3.2 Purple as Third Primary Color
- **Finding:** In both `tokens.css` and `globals.css`, `--color-accent` is defined as `#7c3aed` (Purple 600) with a light variant `#9333ea`. It is actively assigned to primary interactive actions (`Button` primary variant, focus rings, skip-to-content links).
- **Recommendation:** Ensure purple is consistently balanced with `--color-primary` (deep plum/midnight) so it does not degrade into a monochromatic purple template.

### 3.3 Indirect Symbolism
- **Finding:** The existing symbol code is explicitly safeguarded as a placeholder to prevent unapproved designs from shipping.
- **Recommendation:** Present 3 conceptual directions for the permanent symbol to the founder in Phase 2 based on steadfastness (الثبات) and freedom (الانطلاق).

---

## 4. Brand Asset Quality Checklist

- [x] SVGs are standalone React components with accessible `role="img"` and `aria-label`.
- [x] No inline raw SVG duplicated in web application pages.
- [x] Zero hardcoded hex codes in UI components; all colors resolve via CSS custom properties.
- [x] Arabic and English wordmark variants supported with correct inline spacing and directional markup.
- [x] Placeholder warnings present in all proprietary mark files.

