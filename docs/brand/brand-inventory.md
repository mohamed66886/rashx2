# RASHX — Official Brand Asset Inventory

**Source of Truth:** `/rashx-brand/`  
**Date of Audit & Integration:** November 2026  
**Status:** Approved by Founder · Integrated into Corporate Monorepo

---

## 1. Directory Structure Overview

The official brand package contains complete vector artworks with all letterforms converted directly into native vector paths (`fill-rule="evenodd"`), ensuring zero font dependency for logo rendering.

```
rashx-brand/
├── README.md                      # Core brand overview & Arabic summary
├── guidelines.svg                 # Visual brand guidelines poster (1600x2620)
├── logo/                          # Vector logo marks in Ink and White (+ background variants)
│   ├── symbol-rx/                 # Rx Symbol (viewBox: 0 0 1048.8 1000)
│   ├── wordmark/                  # English Wordmark (viewBox: 0 0 4549.3 1000)
│   ├── wordmark-arabic/           # Arabic Wordmark (viewBox: 0 0 7706.8 1000)
│   └── lockup-bilingual/          # Arabic + English Lockup (viewBox: 0 0 1233.1 340)
├── icons/                         # App icons & favicons across approved background pairings
├── social/                        # Social avatars, covers, and OpenGraph share cards
├── documents/                     # Letterheads, business cards, invoices, presentation slides
├── email/                         # Email signature, responsive HTML templates, high-res PNGs
└── fonts/                         # Ping AR + LT configuration & instructions
```

---

## 2. Complete Asset Catalog

### 2.1 Logo Marks (`/logo/`)

| Asset | File | Dimensions / ViewBox | Primary Color | Background |
|---|---|---|---|---|
| **Rx Symbol (Ink)** | `symbol-rx-ink.svg` | `0 0 1048.8 1000` | Ink `#54453D` | Transparent |
| **Rx Symbol (White)** | `symbol-rx-white.svg` | `0 0 1048.8 1000` | White `#FFFFFF` | Transparent |
| **Rx Symbol on Peach** | `symbol-rx-on-peach.svg` | `0 0 1200 1200` | Ink `#54453D` | Peach `#F0C5AE` |
| **Rx Symbol on Blue** | `symbol-rx-on-blue.svg` | `0 0 1200 1200` | Ink `#54453D` | Blue `#91B8C0` |
| **Rx Symbol on White** | `symbol-rx-on-white.svg` | `0 0 1200 1200` | Ink `#54453D` | White `#FFFFFF` |
| **Rx Symbol on Cream** | `symbol-rx-on-cream.svg` | `0 0 1200 1200` | Ink `#54453D` | Cream `#FAF9F8` |
| **Rx Symbol on Ink** | `symbol-rx-on-ink.svg` | `0 0 1200 1200` | White `#FFFFFF` | Ink `#54453D` |
| **Wordmark English (Ink)** | `wordmark-ink.svg` | `0 0 4549.3 1000` | Ink `#54453D` | Transparent |
| **Wordmark English (White)**| `wordmark-white.svg` | `0 0 4549.3 1000` | White `#FFFFFF` | Transparent |
| **Wordmark English on BG** | `wordmark-on-*.svg` | Various | Ink or White | Peach / Blue / Cream / White / Ink |
| **Wordmark Arabic (Ink)** | `wordmark-arabic-ink.svg` | `0 0 7706.8 1000` | Ink `#54453D` | Transparent |
| **Wordmark Arabic (White)**| `wordmark-arabic-white.svg` | `0 0 7706.8 1000` | White `#FFFFFF` | Transparent |
| **Wordmark Arabic on BG** | `wordmark-arabic-on-*.svg` | Various | Ink or White | Peach / Blue / Cream / White / Ink |
| **Bilingual Lockup (Ink)** | `lockup-bilingual-ink.svg` | `0 0 1233.1 340` | Ink `#54453D` | Transparent |
| **Bilingual Lockup (White)**| `lockup-bilingual-white.svg`| `0 0 1233.1 340` | White `#FFFFFF` | Transparent |

### 2.2 Icons & Favicons (`/icons/`)

| Asset | Format | Recommended Role |
|---|---|---|
| `app-icon-rx-ink-on-peach.svg` | SVG Vector | Mobile PWA Primary App Icon |
| `app-icon-rx-ink-on-blue.svg` | SVG Vector | Alternative Secondary App Icon |
| `app-icon-rx-ink-on-white.svg` | SVG Vector | Clean White App Icon |
| `app-icon-rx-white-on-ink.svg` | SVG Vector | Dark Surface App Icon |
| `favicon-ink-on-peach.svg` | SVG Vector | Primary Web Favicon |
| `favicon-ink-on-blue.svg` | SVG Vector | Secondary Web Favicon |
| `favicon-ink-on-white.svg` | SVG Vector | Monochrome Light Favicon |
| `favicon-white-on-ink.svg` | SVG Vector | Dark Theme Favicon |

### 2.3 Social & OpenGraph Media (`/social/`)

| Asset | Format | Resolution | Description |
|---|---|---|---|
| `avatar-rx-ink-on-peach.svg` | SVG | 1200x1200 | Social Profile Avatar (Rx on Warm Peach) |
| `avatar-rx-ink-on-blue.svg` | SVG | 1200x1200 | Social Profile Avatar (Rx on Dusty Blue) |
| `avatar-rx-ink-on-white.svg` | SVG | 1200x1200 | Social Profile Avatar (Rx on White) |
| `avatar-rx-white-on-ink.svg` | SVG | 1200x1200 | Social Profile Avatar (White Rx on Ink) |
| `avatar-r-*.svg` | SVG | 1200x1200 | Monogram R Avatar Variants |
| `cover-peach.svg` | SVG | 1500x500 | Twitter/X / LinkedIn Profile Header (Peach) |
| `cover-blue.svg` | SVG | 1500x500 | Profile Header (Dusty Blue) |
| `cover-ink.svg` | SVG | 1500x500 | Profile Header (Ink) |
| `cover-white.svg` | SVG | 1500x500 | Profile Header (Clean White) |
| `og-share-peach.svg` | SVG | 1200x630 | OpenGraph Link Preview Card (Warm Peach) |
| `og-share-blue.svg` | SVG | 1200x630 | OpenGraph Link Preview Card (Dusty Blue) |
| `og-share-ink.svg` | SVG | 1200x630 | OpenGraph Link Preview Card (Deep Ink) |
| `og-share-white.svg` | SVG | 1200x630 | OpenGraph Link Preview Card (White) |

### 2.4 Corporate Documents (`/documents/`)

| Asset | Format | Dimensions | Usage |
|---|---|---|---|
| `letterhead-a4.svg` | SVG | 210 x 297 mm (A4) | Official Corporate Letterhead (English) |
| `letterhead-a4-arabic.svg` | SVG | 210 x 297 mm (A4) | Official Corporate Letterhead (Arabic) |
| `invoice-a4.svg` | SVG | 210 x 297 mm (A4) | Official Customer & Vendor Invoice Template |
| `envelope-dl.svg` | SVG | 220 x 110 mm (DL) | Official Business Envelope |
| `business-card-front.svg` | SVG | 85 x 55 mm | Business Card Front (Wordmark) |
| `business-card-front-symbol.svg`| SVG | 85 x 55 mm | Business Card Front (Rx Symbol) |
| `business-card-back.svg` | SVG | 85 x 55 mm | Business Card Back (Contact Details) |
| `presentation-cover-16x9.svg` | SVG | 1920 x 1080 (16:9) | Keynote / Pitch Deck Cover Slide |
| `presentation-slide-16x9.svg` | SVG | 1920 x 1080 (16:9) | Interior Content Presentation Slide |

### 2.5 Email Templates & Raster Assets (`/email/`)

| Asset | Format | Role |
|---|---|---|
| `signature.html` | HTML | Rich HTML Email Signature |
| `signature.svg` | SVG | Vector Email Signature Layout |
| `email-template-ar.html` | HTML | Responsive Transactional & Marketing Email (Arabic) |
| `email-template-en.html` | HTML | Responsive Transactional & Marketing Email (English) |
| `email-header.svg` | SVG | Vector Email Header Banner |
| `images/logo-wordmark@2x.png` | PNG | Raster Logo for Outlook & Gmail clients |
| `images/logo-wordmark-arabic@2x.png` | PNG | Raster Arabic Wordmark for email clients |
| `images/logo-symbol-rx@2x.png` | PNG | Raster Rx Symbol for email clients |
| `images/email-header@2x.png` | PNG | High-DPI Header Image for email clients |

---

## 3. Monorepo Integration Mappings

| Brand Kit Path | Monorepo Package / Destination |
|---|---|
| `logo/symbol-rx/*` | `@rashx/icons` (`RashxSymbol`, `RashxMonogram`) & `apps/web/public/brand/logo/` |
| `logo/wordmark/*` | `@rashx/icons` (`RashxWordmark variant="english"`) & `apps/web/public/brand/logo/` |
| `logo/wordmark-arabic/*` | `@rashx/icons` (`RashxWordmark variant="arabic"`) & `apps/web/public/brand/logo/` |
| `logo/lockup-bilingual/*` | `@rashx/icons` (`RashxLockupBilingual`, `RashxWordmark variant="combined"`) |
| `icons/*` | `apps/web/public/icons/` |
| `social/*` | `apps/web/public/brand/social/` |
| `email/images/*` | `apps/web/public/brand/email/` |
| `fonts/fonts.css` | Integrated into `apps/web/src/app/globals.css` and `@rashx/tokens` |

