# ADR 0004: i18n Query-Based Language Strategy — Link Preservation & Edge Caching

## Status
Proposed (Awaiting Founder Approval)

## Date
2026-11-18

## Context
In ADR 0003, RASHX adopted a query-based language strategy:
- Arabic is the default language (`/`).
- English is selectable via a query parameter (`?lang=en`).
- No `/ar/` or `/en/` route segments.

During the Phase 1 Architecture Audit, two critical technical challenges were identified:

### 1. Internal Link Degradation for Search Crawlers & Cookie-less Users
When a user or search crawler (e.g. GoogleBot) visits `https://rashx.org/?lang=en` and clicks an internal standard Next.js link `<Link href="/about">`, the browser navigates to `/about` without the `?lang=en` query parameter.
- If cookies are enabled, the server reads the `rashx-lang=en` cookie and renders English.
- **However, search engine crawlers do not store or send cookies**. GoogleBot crawling from `/about` will see Arabic content, meaning English versions of subpages will never be indexed unless the query parameter is preserved across internal links or sitemaps.

### 2. Edge Cache Bypass via `headers()`
In Next.js App Router, invoking `headers()` in Server Components (`apps/web/src/lib/lang.ts`) causes Next.js to opt the entire route segment into dynamic server-side rendering on demand (`ƒ Dynamic`). This disables static HTML generation at deploy time and prevents zero-compute Vercel edge caching.

---

## Decision Proposal

### Architecture Enhancement 1: Smart Route-Preserving Link Component
Implement an enhanced `<Link>` component in `@rashx/ui/content/Link`:
- When rendered on a page where `lang === 'en'`, internal application links automatically append `?lang=en` (e.g. `<Link href="/about">` becomes `/about?lang=en`).
- When on default Arabic (`lang === 'ar'`), links remain clean without query parameters (`/about`).
- This guarantees:
  1. Search engine crawlers traverse and index the complete English page graph.
  2. Users sharing copied links to specific English subpages share the exact English URL.

### Architecture Enhancement 2: Hybrid Edge Caching with Vary Header
To restore edge cacheability for marketing pages:
1. In Next.js middleware, append `Vary: x-rashx-lang, Cookie` to responses.
2. In production deployment, set edge cache tags:
   ```ts
   // apps/web/src/app/page.tsx
   export const revalidate = 86400; // 24-hour ISR cache
   ```
3. Allow Vercel Edge Network to cache two independent variants per URL:
   - Variant A: Default Arabic HTML.
   - Variant B: English HTML (keyed by `?lang=en` or `x-rashx-lang: en`).

### Architecture Enhancement 3: Explicit Dual-Entry Sitemap
The generated `sitemap.xml` must explicitly list both canonical URLs and English alternates:
```xml
<url>
  <loc>https://rashx.org/about</loc>
  <xhtml:link rel="alternate" hreflang="ar" href="https://rashx.org/about"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://rashx.org/about?lang=en"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://rashx.org/about"/>
</url>
```

---

## Consequences

### Positive
- Strict adherence to the founder directive: zero `/ar/` or `/en/` route segment prefixes.
- English subpages become 100% crawlable and indexable by Google and Bing.
- High performance via ISR / Vercel edge caching without computing every request dynamically on Node serverless functions.
- Clean user experience with zero unexpected language resets during navigation.

### Trade-offs
- Internal link generation requires awareness of the active language context.
- Edge CDN caching requires cache-key awareness of query strings (supported natively on Vercel).

