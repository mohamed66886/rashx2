# RASHX Logo & Visual Identity Audit

> **Status:** Architecture Evaluation · **Date:** 2026-11-18 · **Package:** `@rashx/icons/brand`

---

## 1. Executive Assessment

All current brand logo marks (`RashxSymbol`, `RashxMonogram`, `RashxWordmark`) are **explicitly defined and flagged as Phase 1 structural placeholders**. This architectural decision successfully prevents unauthorized or unvetted visual designs from becoming permanently embedded in the codebase.

```tsx
// Current code state:
export function RashxSymbol({ size = 32, ...props }: RashxSymbolProps) {
  return (
    <svg ...>
      {/* PLACEHOLDER — awaiting approved artwork */}
      <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.1" />
      <text x="16" y="21" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">
        R
      </text>
    </svg>
  );
}
```

---

## 2. Evaluation of Existing Components

| Component | Responsibility | Current Code Strengths | Areas Requiring Final Artwork |
|---|---|---|---|
| `RashxSymbol` | Proprietary brand mark for headers, app icons, favicons, watermarks | - Fully typed with SVGProps.<br>- Clean scalable viewBox (0 0 32 32).<br>- `role="img"` and `aria-label` present.<br>- Zero inline hex codes. | The inner graphic is currently an arbitrary rectangle with letter "R". Must be replaced with the approved steadfastness & freedom geometry. |
| `RashxMonogram` | Compact 2-letter abbreviation for tiny scales (≤ 24px) | - Clean 24×24 viewBox.<br>- High optical balance.<br>- Consistent stroke width. | Replace placeholder circular ring with approved monogram motif. |
| `RashxWordmark` | Full typographic signature in Arabic, English, or Combined | - Supports 3 modes (`arabic`, `english`, `combined`).<br>- Responsive sizing scale (`xs` to `xl`).<br>- Clean semantic typography. | Currently renders via HTML text styling (`<span>`). Final version should support custom vector path outlines for pristine anti-aliasing across all operating systems. |

---

## 3. Logo Rules for Phase 2 Implementation

### 3.1 Clear-Space Specification
To protect the authority and visual integrity of the RASHX mark:
- **Minimum Clear Space ($X$)**: Equal to 50% of the symbol's total height ($0.5H$).
- No typography, interface icons, photography borders, or competing brand logos may enter this perimeter.

```
       ┌───────────────────────────────┐
       │             0.5 H             │
       │    ┌─────────────────────┐    │
 0.5 H │    │    RASHX SYMBOL     │    │ 0.5 H
       │    └─────────────────────┘    │
       │             0.5 H             │
       └───────────────────────────────┘
```

### 3.2 Minimum Sizing Rules
To prevent illegibility and pixelation:
- **Digital Screen**:
  - `RashxSymbol`: Minimum **20×20 px** (standard), **16×16 px** (favicon only).
  - `RashxWordmark`: Minimum height **18 px** (English), **20 px** (Arabic).
  - `RashxMonogram`: Minimum **16×16 px**.
- **Print / High-DPI**:
  - Symbol: Minimum **8 mm**.
  - Wordmark: Minimum **12 mm**.

### 3.3 Strict Misuse Restrictions (Anti-Patterns)
1. ❌ **Do not distort or stretch** the aspect ratio of the symbol or wordmark.
2. ❌ **Do not add arbitrary dropshadows or 3D extrusions** to the logo.
3. ❌ **Do not place the logo on busy photographic backgrounds** without a high-contrast backing scrim.
4. ❌ **Do not alter the lockup ratio** between the symbol and the wordmark.
5. ❌ **Do not use unauthorized colors** (e.g. green, orange, cyan) on proprietary marks. Allowed: `--color-primary`, `--color-accent`, white, or neutral-950.

---

## 4. Proposed Creative Directions for Founder Review

The founder directive mandates **indirect symbolic inspiration from steadfastness (الثبات) and freedom (الانطلاق)** without generic beauty clichés. Three geometric concepts are proposed for vector drafting:

1. **The Architectural Anchor (الرسوخ والريادة)**:
   - A bold, angled geometric prism that forms an implicit 'R' through negative space, symbolizing foundational stability (steadfastness) with an upward-pointing diagonal apex (freedom).
2. **The Dynamic Monolith (الكتلة المنطلقة)**:
   - Two interlocking solid vectors—one grounded vertical column and one ascending wing vector—bridging corporate operational control and open digital expansion.
3. **The Unbroken Nexus (الرابط المتين)**:
   - A continuous, confident polygon with sharp modern bevels, referencing an integrated digital operating system where multiple operations unify into one solid core.

