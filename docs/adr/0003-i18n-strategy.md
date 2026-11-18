# ADR 0003: Bilingual Query-Param Language Strategy

## Status
Accepted

## Date
2026-11-18

## Context
RASHX serves the Saudi Arabia market initially with Arabic as the primary language and English for international partners and non-Arabic speakers. The project preference explicitly requires:
- Arabic is the default language (`/`).
- English is selectable via a query parameter (`?lang=en`).
- No `/ar/` or `/en/` route segment prefixes.
- Zero duplicated page implementations.

## Decision
1. **Detection & Middleware:**
   - Next.js edge middleware inspects `request.nextUrl.searchParams.get('lang')`.
   - If present and valid (`'ar'` | `'en'`), it sets a persistent 1-year cookie (`rashx-lang`) and passes `x-rashx-lang` header to downstream Server Components.
   - If absent, it checks the `rashx-lang` cookie, defaulting to `'ar'` (Arabic).
2. **Server-Side Rendering (RSC):**
   - Root layout (`apps/web/src/app/layout.tsx`) reads the language from the request header via `getLang()`.
   - Dynamically injects `dir="rtl"` or `dir="ltr"` and `lang="ar"` or `lang="en"` on `<html>`.
   - Loads the exact typed dictionary via `@rashx/i18n/server`.
3. **Client-Side Interactivity:**
   - `useTranslation()` hook provides context for interactive client components.
4. **SEO & Indexing:**
   - Alternate hreflang tags point to the canonical URL for Arabic and `?lang=en` for English with `x-default` pointing to canonical.

## Consequences
- Clean URLs without route segment bloating.
- High performance: zero runtime client-side translation framework overhead.
- Strict type-safety: all keys across `ar.ts` and `en.ts` match 1:1.

