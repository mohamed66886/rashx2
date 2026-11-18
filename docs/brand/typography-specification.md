# RASHX Typography Specification

> **Document Class:** Brand & Design System Engineering Specification  
> **Target Packages:** `@rashx/tokens`, `@rashx/ui`, `@rashx/web`  
> **Primary Typefaces:** Noto Kufi Arabic (Arabic) · Inter (Latin)  
> **Status:** Phase 2.1 Standardized Specification  
> **Date:** 2026-11-18  

---

## 1. Executive Typographic Philosophy

RASHX is an enterprise SaaS platform operating primarily in the Kingdom of Saudi Arabia with full bilingual capability. Typography must embody architectural steadfastness, crisp modern legibility, and technical precision.

The typographic pairing balances:
- **Arabic (Primary):** `Noto Kufi Arabic` — Chosen for its geometric discipline, architectural upright strokes, high legibility across dense dashboard interfaces, and modern Saudi enterprise tone.
- **English / Latin (Secondary):** `Inter` — Chosen for its unmatched optical clarity, neutral humanist geometry, comprehensive variable weight support, and seamless coordination with Kufic proportions.

---

## 2. Font Families and Stack Fallbacks

```css
/* Arabic Primary Stack */
--font-arabic: var(--font-noto-kufi), 'Noto Kufi Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif;

/* Latin Secondary Stack */
--font-latin: var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

/* Default System Fallback Stack */
--font-sans: var(--font-latin);
[dir="rtl"] {
  --font-sans: var(--font-arabic);
}
```

---

## 3. Typographic Scale & Line Heights

The scale uses an optical modular progression calibrated specifically to prevent Arabic ascenders and descenders from colliding while maintaining tight, commanding English display hierarchy.

| Token | Size (Desktop / Mobile) | Line Height | Font Weight | Semantic Tag (`as`) | Primary Usage |
|---|---|---|---|---|---|
| `display-1` | `4.5rem` (72px) / `3rem` (48px) | `1.15` | ExtraBold (800) | `h1` | Hero landing titles, major corporate statements |
| `display-2` | `3.75rem` (60px) / `2.25rem` (36px) | `1.20` | Bold (700) | `h1` | Major section headers, impact callouts |
| `h1` | `3rem` (48px) / `1.875rem` (30px) | `1.25` | Bold (700) | `h1` | Page titles, major feature headlines |
| `h2` | `2.25rem` (36px) / `1.5rem` (24px) | `1.30` | Bold (700) | `h2` | Section titles, card group headers |
| `h3` | `1.5rem` (24px) / `1.25rem` (20px) | `1.35` | SemiBold (600) | `h3` | Subsection headers, dialog headers |
| `h4` | `1.25rem` (20px) / `1.125rem` (18px) | `1.40` | SemiBold (600) | `h4` | Module headers, metric labels |
| `h5` | `1.125rem` (18px) / `1rem` (16px) | `1.45` | Medium (500) | `h5` | Group headings, emphasized items |
| `h6` | `1rem` (16px) / `0.875rem` (14px) | `1.50` | Medium (500) | `h6` | Fine group headings, sub-labels |
| `body-lg` | `1.25rem` (20px) / `1.125rem` (18px) | `1.70` | Regular (400) | `p` | Article leads, editorial intros |
| `body` | `1rem` (16px) / `1rem` (16px) | `1.65` | Regular (400) | `p` | Standard prose, interface descriptions |
| `body-sm` | `0.875rem` (14px) / `0.875rem` (14px) | `1.60` | Regular (400) | `p` | Secondary descriptions, table cells |
| `caption` | `0.75rem` (12px) / `0.75rem` (12px) | `1.50` | Regular (400) | `span` | Timestamps, metadata, footnotes |
| `label` | `0.75rem` (12px) / `0.75rem` (12px) | `1.00` | Medium (500) | `label` / `span` | Form field labels, badge text, tags |

---

## 4. Arabic Font Shaping & Rendering Rules

1. **Optical Line Height Compensation:**
   Arabic script features extensive vertical diacritics and ligatures. Line heights below `1.4` on body text cause severe clipping of dots and diacritics. Therefore:
   - Body text in Arabic MUST maintain line-height of `1.65` or greater.
   - Headings MUST maintain line-height of `1.25` or greater.

2. **Letter Spacing (Tracking):**
   - **Latin:** Positive tracking (e.g. `tracking-wider`, `letter-spacing: 0.05em`) is permitted on small caps, labels, and badges.
   - **Arabic:** ❌ **NEVER apply letter-spacing or tracking to Arabic script.** Arabic characters are cursively connected; adding tracking breaks character ligatures and creates fragmented, illegible glyphs. The `Typography` component and CSS tokens disable tracking when rendering in RTL context.

3. **Numeral Convention & Localization Policy (سياسة الأرقام والتعريب):**
   - **Western Arabic Digits (`0 1 2 3 4 5 6 7 8 9` / الأرقام العربية الغربية):**
     Standardized as the primary, universal numeral set across all RASHX systems (both Arabic and English interfaces).
     - *Scope:* Financial figures, prices (`150 SAR`), invoices, POS receipts, calendar booking times (`14:30`), operational metrics, CR numbers, VAT numbers, phone numbers (`+966...`), URLs, and technical IDs.
     - *Saudi Market Alignment:* Aligns with current Saudi governmental, banking, and commercial technology standards (including ZATCA Phase 2 e-invoicing and Saudi Central Bank / Mada payment integrations).
   - **Eastern Arabic Digits (`٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩` / الأرقام العربية المشرقية):**
     Reserved strictly for optional cultural/editorial headings or commemorative certificates where aesthetic calligraphic parity is explicitly desired.
   - **Critical Architectural Safeguard:**
     ❌ **NEVER apply global automated numeral string replacement (e.g. converting `0-9` to `٠-٩`).** Global regex replacement corrupts telephone numbers, machine-readable barcodes, ISO timestamps, query parameters, HTML data attributes, and form inputs. Numeric conversions must be explicitly scoped via isolated display formatters only.

4. **Mixed Arabic/English Content:**
   - Mixed text (e.g. "نظام RASHX لإدارة الصالونات") must be wrapped with proper directionality tags or CSS `unicode-bidi: isolate;` to prevent punctuation inversion.

