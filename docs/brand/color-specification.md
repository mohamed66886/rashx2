# RASHX Official Color System Specification

> **Status:** Official Approved Specification · **Date:** November 2026 · **Source of Truth:** `rashx-brand/`

---

## 1. Philosophy & Color Roles

The official RASHX brand palette is defined by 5 canonical colors:

1. **Warm Peach (`#F0C5AE`)**: Primary brand color for hero backgrounds, cards, and warm structural accents.
2. **Dusty Blue (`#91B8C0`)**: Secondary brand color for structural details, banners, and complementary cards.
3. **White (`#FFFFFF`)**: Base 1 canvas for crisp clarity, high contrast readability, and card containers.
4. **Soft Cream (`#FAF9F8`)**: Base 2 canvas for elevated surfaces and gentle background alternation.
5. **Ink (`#54453D`)**: The official color for all logos, headings, and readable text across all backgrounds.

---

## 2. Technical Token Architecture

### 2.1 Brand Tokens (`@rashx/tokens`)

```css
:root {
  /* Official Brand Anchors */
  --color-brand-peach: #f0c5ae;
  --color-brand-blue:  #91b8c0;
  --color-brand-white: #ffffff;
  --color-brand-cream: #faf9f8;
  --color-brand-ink:   #54453d;

  /* Semantic UI Bindings */
  --color-primary: #f0c5ae;
  --color-primary-foreground: #54453d;

  --color-secondary: #91b8c0;
  --color-secondary-foreground: #54453d;

  --color-accent: #54453d;
  --color-accent-light: #75645b;
  --color-accent-foreground: #ffffff;
}
```

---

## 3. WCAG 2.2 Contrast Matrix

| Foreground | Background | Calculated Ratio | WCAG 2.2 Level | Approved Use Cases |
|---|---|---|---|---|
| **Ink (`#54453D`)** | **White (`#FFFFFF`)** | **9.04:1** | **Pass AAA** | Normal text, headings, logos, inputs |
| **Ink (`#54453D`)** | **Soft Cream (`#FAF9F8`)** | **8.65:1** | **Pass AAA** | Normal text, cards, content blocks |
| **Ink (`#54453D`)** | **Warm Peach (`#F0C5AE`)** | **5.82:1** | **Pass AA / AAA Large** | Text on cards, badges, primary containers |
| **Ink (`#54453D`)** | **Dusty Blue (`#91B8C0`)** | **4.31:1** | **Pass UI & Large (3:1)** | Headings on blue, logo marks, icons |
| **White (`#FFFFFF`)** | **Ink (`#54453D`)** | **9.04:1** | **Pass AAA** | Inverted buttons, dark footer, dark theme |

> [!CAUTION]
> White (`#FFFFFF`) on Warm Peach (`#F0C5AE`) has a contrast ratio of only **1.55:1** (FAIL).
> White (`#FFFFFF`) on Dusty Blue (`#91B8C0`) has a contrast ratio of only **1.84:1** (FAIL).
> Never place White text or White logos on Peach or Blue backgrounds. All text on Peach and Blue MUST be Ink (`#54453D`).
