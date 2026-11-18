# RASHX Official Typography Specification

> **Status:** Official Approved Specification · **Date:** November 2026 · **Source of Truth:** `rashx-brand/fonts/`

---

## 1. Typeface Architecture: Ping AR + LT

The corporate brand identity mandates **Ping AR + LT** as the single unified typeface across Arabic and English.

```css
:root {
  --font-brand: "Ping AR + LT", "Helvetica Neue", Arial, "Noto Sans Arabic", Tahoma, sans-serif;
}
```

---

## 2. Weight Scale & Semantic Roles

| Style | Weight | Semantic Role | Desktop Size | Mobile Size | Line Height |
|---|---|---|---|---|---|
| **Regular** | `400` | Body copy, paragraphs, table rows | 16px (`1rem`) | 15px (`0.9375rem`) | 1.5–1.65 |
| **Medium** | `500` | Buttons, form inputs, navigation items, badges | 14px (`0.875rem`) | 13px (`0.8125rem`) | 1.35 |
| **Bold** | `700` | Section headings (`H2`–`H4`), card titles, stat values | 24–36px | 20–28px | 1.35 |
| **Extra Bold** | `800` | Display titles (`H1`, Hero), display numbers | 48–80px | 36–48px | 1.2 |

---

## 3. Bilingual Typography Rules

1. **Arabic Leading Rule:** Arabic typography requires extra leading (minimum `1.35` for headings, `1.65` for body text) to accommodate high ascenders and deep descenders without glyph clipping.
2. **Alignment & Direction:** The primary corporate language is Arabic (`dir="rtl"`). English communications render with `dir="ltr"`.
3. **Numerals:** Both standard Arabic-Indic and Western Arabic numerals are rendered with optical clarity and tabular spacing where numerical metrics are displayed.
