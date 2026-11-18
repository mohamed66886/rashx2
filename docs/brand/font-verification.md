# RASHX — Official Typography Verification & Integration Report

**Target Typeface:** Ping AR + LT  
**Target Weights:** Regular 400, Medium 500, Bold 700, Extra Bold 800  
**Verification Date:** November 2026  
**Auditor:** Principal Design System Architect & Accessibility Engineer  

---

## 1. Typeface Status & Licensing

1. **Brand Standard:** The founder and brand identity package explicitly designate **Ping AR + LT** as the exclusive corporate typeface for all Latin and Arabic digital and print communications.
2. **License Status:** `Ping AR + LT` is a proprietary licensed commercial typeface. As documented in `rashx-brand/fonts/README.md`, the licensed binary font files (`.woff2`, `.otf`) are intentionally omitted from public source repositories pending licensed font asset deployment by the founder.
3. **Logo Autonomy:** All brand logos, wordmarks, and lockups are constructed from pure SVG path outlines (`fill-rule="evenodd"`). **The logos do not depend on font files to render at 100% vector fidelity.**

---

## 2. Font Fallback & Progressive Enhancement Strategy

To guarantee immediate typographic stability, optimal performance, and zero layout shift (CLS), the monorepo configures a strict, high-legibility fallback stack:

```css
:root {
  --font-brand: "Ping AR + LT", "Helvetica Neue", Arial, "Noto Sans Arabic", Tahoma, sans-serif;
}
```

### 2.1 Resolution Hierarchy
1. **Local / System Installation:** If the user or operating system has `Ping AR + LT` installed, the browser immediately activates it.
2. **Self-Hosted Deployment:** `@font-face` rules are already compiled into `apps/web/src/app/globals.css`. Once the founder places the licensed `.woff2` files in `apps/web/public/fonts/`, the font will automatically load with `font-display: swap`.
3. **Latin Fallback:** `"Helvetica Neue", Arial, system-ui, sans-serif` provides proportional glyph alignment matching the clean geometric architecture of Ping.
4. **Arabic Fallback:** `"Noto Sans Arabic", Tahoma, sans-serif` guarantees proper Arabic cursive shaping, correct baseline alignment, and diacritic rendering without clipping.

---

## 3. Weight Mapping & Usage Hierarchy

| Weight | CSS Property | Primary Role | Line Height |
|---|---|---|---|
| **Regular** | `font-weight: 400` | Body copy, paragraphs, table data | `1.5` (Latin), `1.65` (Arabic) |
| **Medium** | `font-weight: 500` | UI buttons, navigation links, form labels, badges | `1.35`–`1.5` |
| **Bold** | `font-weight: 700` | Section headers (`H2`–`H4`), card titles, metric numbers | `1.35` |
| **Extra Bold** | `font-weight: 800` | Display titles (`H1`, Hero), strong brand emphasis | `1.2` |

---

## 4. Verification Checklist

- [x] `@font-face` configured for all 4 weights with `font-display: swap`.
- [x] Fallback stack verified across Arabic (RTL) and Latin (LTR) viewports.
- [x] Zero text clipping on diacritics and ascenders with `line-height >= 1.35` on headings and `1.65` on Arabic body copy.
- [x] Tested alongside official vector logos in the Brand Identity Showcase.
