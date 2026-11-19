# RASHX — Official Brand Identity Guidelines

**Brand:** RASHX | راش إكس  
**Corporate Domain:** https://rashx.org  
**Approved by Founder:** Eng. Mohamed Abdo Rashad El-Bahy  
**Date:** November 2026  
**Source of Truth:** `rashx-brand/`

---

## 1. Brand Essence & Foundations

RASHX is the premier integrated digital operating system for beauty centers, salons, and wellness spas in Saudi Arabia. The visual identity embodies precision, elegance, hygiene, and technological leadership.

---

## 2. Official Color Palette

The official color system is composed of 5 exact values. No alternative color variations, gradients, or saturation adjustments are permitted.

| Name | Hex | Semantic Role | Contrast on White | Contrast on Ink |
|---|---|---|---|---|
| **Warm Peach** | `#F0C5AE` | Primary brand color: backgrounds, accent containers, primary cards | 1.55:1 (Non-text) | **5.82:1** (AA Normal, AAA Large) |
| **Dusty Blue** | `#91B8C0` | Secondary brand color: details, header bars, secondary cards | 1.84:1 (Non-text) | **4.31:1** (UI Component 3:1, Large text) |
| **White** | `#FFFFFF` | Base 1: clean canvas, crisp white surfaces, card containers | 1:1 | **9.04:1** (AAA Compliant) |
| **Soft Cream** | `#FAF9F8` | Base 2: secondary background, soft surface elevation | 1.04:1 (Non-text) | **8.65:1** (AAA Compliant) |
| **Ink** | `#54453D` | Primary brand ink: all logo artwork, headlines, and readable text | **9.04:1** (AAA Compliant) | N/A |

### 2.1 Critical Contrast Directive
- Peach (`#F0C5AE`) and Dusty Blue (`#91B8C0`) have low contrast with White (`#FFFFFF`). They must NEVER be used as text on white backgrounds.
- All readable text and logo elements placed over Peach, Blue, Cream, or White backgrounds MUST be in **Ink (`#54453D`)**.
- When placed over an Ink background, logos and text MUST be in **White (`#FFFFFF`)**.

---

## 3. Logo Marks & Construction

The RASHX brand mark architecture consists of 4 approved variants:

### 3.1 Rx Symbol (`symbol-rx`)
- **Symbolism:** Combines the uppercase "R" of RASHX with an integrated diagonal prescription "x", symbolizing wellness, precision, and digital formulation.
- **Aspect Ratio & ViewBox:** `0 0 1048.8 1000` (aspect ratio 1.0488 : 1).
- **Approved Colors:** Ink (`#54453D`) or White (`#FFFFFF`).

### 3.2 English Wordmark (`wordmark`)
- **Composition:** Uppercase geometric wordmark `RASHX` with the signature `Rx` integrated in place of the standard letter R.
- **Aspect Ratio & ViewBox:** `0 0 4549.3 1000` (aspect ratio 4.5493 : 1).
- **Approved Colors:** Ink (`#54453D`) or White (`#FFFFFF`).

### 3.3 Arabic Wordmark (`wordmark-arabic`)
- **Composition:** Arabic wordmark `راش اكس` harmonized with the `Rx` signature symbol.
- **Aspect Ratio & ViewBox:** `0 0 7706.8 1000` (aspect ratio 7.7068 : 1).
- **Approved Colors:** Ink (`#54453D`) or White (`#FFFFFF`).

### 3.4 Bilingual Lockup (`lockup-bilingual`)
- **Composition:** Arabic wordmark on the primary baseline scaled at 0.16x paired with the English wordmark scaled at 0.09x.
- **Aspect Ratio & ViewBox:** `0 0 1233.1 340` (aspect ratio 3.6268 : 1).
- **Usage:** Corporate headers, official documentation, bilingual legal and executive communications.

---

## 4. Clear Space & Sizing Rules

### 4.1 Clear Space
- Keep clear space around the logo equal to the height of the R stem.
- No text, graphics, or UI elements may intrude into this exclusion zone.

### 4.2 Minimum Sizes
- **Screen:**
  - Wordmark minimum height: `12px`.
  - Rx Symbol minimum height: `16px`.
- **Print:**
  - Wordmark minimum height: `3mm`.
  - Rx Symbol minimum height: `4mm`.

---

## 5. Official Typography — Ping AR + LT

The official corporate typeface across all Arabic and Latin touchpoints is **Ping AR + LT**.

| Style | Weight | Semantic Role |
|---|---|---|
| **Regular** | `400` | Body copy, editorial prose, descriptions |
| **Medium** | `500` | UI elements, buttons, form labels, small caps badges |
| **Bold** | `700` | Section headings, card titles, executive names |
| **Extra Bold** | `800` | Hero headlines, display titles, brand emphasis |

### 5.1 Fallback Typography Stack
```css
font-family: "Ping AR + LT", "Helvetica Neue", Arial, "Noto Sans Arabic", Tahoma, sans-serif;
```

---

## 6. Incorrect Usage (Strictly Prohibited)

1. **Do NOT stretch or distort:** Never alter the horizontal or vertical proportions of any logo mark.
2. **Do NOT recolor:** Logos must strictly be Ink (`#54453D`) or White (`#FFFFFF`). Never apply Peach, Blue, or third-party colors to the logo.
3. **Do NOT add gradients or dropshadows:** All marks are flat vector geometry.
4. **Do NOT rotate or angle:** Logos must always sit squarely on their baseline.
5. **Do NOT place white text on peach or blue:** Always use Ink text on Peach and Blue surfaces to guarantee WCAG compliance.
6. **Do NOT substitute typography:** Never replace Ping AR + LT with arbitrary non-brand fonts.

