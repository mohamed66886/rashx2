# RASHX Core UI Components — API Specification (Phase 2.1)

> **Package:** `@rashx/ui`  
> **Target Scope:** 9 Foundation Primitives  
> **Status:** Production Ready  
> **Date:** 2026-11-18  

---

## 1. Component Index

| Component | Category | Export Path | Polymorphic / Sub-elements | Key Purpose |
|---|---|---|---|---|
| `Button` | Primitive | `@rashx/ui` | Radix `Slot` (`asChild`) | Primary interactive triggers, actions, CTA |
| `IconButton` | Primitive | `@rashx/ui` | Native `button` | Icon-only actions enforcing `aria-label` |
| `Link` | Primitive | `@rashx/ui` | Next.js `Link` / `<a>` | Localized bilingual links preserving `?lang=en` |
| `Badge` | Primitive | `@rashx/ui` | Native `span` | Status chips, counts, metadata pills |
| `Typography` | Primitive | `@rashx/ui` | `as` polymorphic | Semantic headings, paragraphs, labels |
| `Separator` | Primitive | `@rashx/ui` | Native `hr` / `div` | Structural partition with ARIA role |
| `Avatar` | Primitive | `@rashx/ui` | Native `div` / `img` | User and salon initials with image fallback |
| `PageContainer` | Layout | `@rashx/ui` | Native `div` | Screen-width responsive boundary |
| `SectionContainer`| Layout | `@rashx/ui` | `as` polymorphic (`section`) | Consistent vertical spacing blocks |

---

## 2. Component Specifications

### 2.1 Button
- **Description:** Accessible interactive trigger supporting 5 variants, 3 sizes, loading spinner, and icon slots.
- **Props:**
  - `variant`: `'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'` (default: `'primary'`)
  - `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
  - `isLoading`: `boolean` (displays accessible spinner, sets `aria-busy="true"`, disables interaction)
  - `leftIcon`: `ReactNode` (leading icon slot with RTL logical spacing)
  - `rightIcon`: `ReactNode` (trailing icon slot with RTL logical spacing)
  - `asChild`: `boolean` (renders child component using Radix UI `Slot`)
  - All standard `ButtonHTMLAttributes<HTMLButtonElement>`

### 2.2 IconButton
- **Description:** Square icon-only trigger strictly requiring an `aria-label` for screen reader accessibility.
- **Props:**
  - `aria-label`: `string` (**Required** — TypeScript enforced)
  - `variant`: `'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'` (default: `'ghost'`)
  - `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
  - `isLoading`: `boolean`
  - `icon`: `ReactNode` (**Required**)

### 2.3 Link
- **Description:** Internationalized link wrapper ensuring that relative links retain language query parameters (`?lang=en` or clean Arabic default `/`). External links open securely with `rel="noopener noreferrer"`.
- **Props:**
  - `href`: `string` (**Required**)
  - `variant`: `'default' | 'subtle' | 'primary' | 'underline'` (default: `'default'`)
  - `isExternal`: `boolean` (auto-detected if starts with `http://` or `https://`)
  - `showExternalIndicator`: `boolean` (displays external link symbol)
  - All standard `AnchorHTMLAttributes<HTMLAnchorElement>`

### 2.4 Badge
- **Description:** Compact status indicator or pill supporting status dots and subtle semantic variants.
- **Props:**
  - `variant`: `'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'`
  - `size`: `'sm' | 'md'` (default: `'md'`)
  - `showDot`: `boolean` (renders a colored status beacon)
  - `dotColor`: `'success' | 'warning' | 'error' | 'primary'`

### 2.5 Typography
- **Description:** Polymorphic typographic primitive decoupling semantic HTML structure from visual scale tokens.
- **Props:**
  - `as`: `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label'`
  - `variant`: `'display-1' | 'display-2' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body-lg' | 'body' | 'body-sm' | 'caption' | 'label'`
  - `color`: `'default' | 'muted' | 'accent' | 'primary' | 'inverse' | 'success' | 'warning' | 'error'`
  - `align`: `'start' | 'center' | 'end'`

### 2.6 Separator
- **Description:** Accessible visual divider with horizontal or vertical orientation and proper decorative ARIA semantics.
- **Props:**
  - `orientation`: `'horizontal' | 'vertical'` (default: `'horizontal'`)
  - `decorative`: `boolean` (default: `true`, renders `role="none"` or `role="separator"`)

### 2.7 Avatar
- **Description:** User or salon avatar component with automatic image error fallback to uppercase initials.
- **Props:**
  - `src`: `string` (image URL)
  - `alt`: `string` (accessible image description)
  - `name`: `string` (user/salon name for initials extraction)
  - `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)

### 2.8 PageContainer
- **Description:** Responsive maximum-width boundary for page content with standardized horizontal padding.
- **Props:**
  - `size`: `'sm' | 'md' | 'lg' | 'xl' | 'full'` (default: `'lg'`)
  - `children`: `ReactNode`

### 2.9 SectionContainer
- **Description:** Standard vertical rhythm component establishing consistent section padding across desktop and mobile.
- **Props:**
  - `as`: `'section' | 'div' | 'article' | 'aside'` (default: `'section'`)
  - `spacing`: `'none' | 'sm' | 'md' | 'lg' | 'xl'` (default: `'lg'`)
  - `children`: `ReactNode`
