# ADR 0001: Project Foundation & Monorepo Architecture

## Status
Accepted

## Date
2026-11-18

## Context
RASHX requires a scalable, clean foundation for the official corporate digital presence (`rashx.org`). The platform will eventually include SaaS applications (`app.rashx.org`) and tenant portals (`*.rashx.org`). The corporate website must remain architecturally independent from the tenant SaaS application while sharing reusable design tokens, icons, translations, and UI primitives.

## Decision
We chose a **Turborepo monorepo** using **pnpm workspaces** with a single Next.js 15 App Router web application (`apps/web`) and 7 modular internal packages:
- `@rashx/config`: Shared ESLint, TypeScript base, and Next.js configurations.
- `@rashx/tokens`: Brand color scales, typography tokens, spacing, radius, shadows, and CSS variables.
- `@rashx/i18n`: Centralized bilingual dictionaries (AR default, EN selectable) and translation helpers.
- `@rashx/icons`: Proprietary RASHX brand SVG symbols and Lucide interface icons categorized by business domain.
- `@rashx/ui`: Accessible, unstyled Radix-based primitives and layout wrappers.
- `@rashx/content`: Type-safe, structured corporate content and factual entities.
- `@rashx/seo`: Metadata generators, canonical/hreflang builders, and JSON-LD schema generators.

## Consequences
- Clean separation of concerns with strict dependency boundaries.
- Zero code duplication between features.
- Isolated package testing and type checking.
- Foundation ready to support future apps (`app.rashx.org`) in the same monorepo.
