# ADR 0002: Centralized Routing Strategy

## Status
Accepted

## Date
2026-11-18

## Context
Hardcoded URLs scattered throughout components lead to broken links, refactoring friction, and inconsistent route handling.

## Decision
All application routes are centrally registered in `apps/web/src/lib/routes.ts` as typed constants and helper functions.
- Every internal link must reference `routes.<domain>.<page>` or call its typed function for parameterized paths (e.g., `routes.blog.article(category, slug)`).
- Route groups in Next.js App Router (e.g., `(corporate)`, `(platform)`, `(commercial)`) are used to organize files without modifying the public URL structure.

## Consequences
- Single source of truth for all routes.
- Compile-time route validation with Next.js `typedRoutes: true`.
- Zero broken internal links during refactoring.
