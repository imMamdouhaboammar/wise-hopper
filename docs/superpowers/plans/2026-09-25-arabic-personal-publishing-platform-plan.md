# Implementation Plan: Arabic-First Personal Publishing Platform

**Date:** 2026-09-25  
**Spec Reference:** `docs/superpowers/specs/2026-09-25-arabic-personal-publishing-platform-design.md`  
**Execution Strategy:** Test-Driven Development (TDD) via Bun, Vitest, clean-code-guard, and test-guard.

---

## Task Breakdown & Verification Gates

### Phase 1: Environment & Project Foundation
- **Task 1.1**: Initialize Next.js 15 application with Bun, TypeScript, and Tailwind CSS.
- **Task 1.2**: Configure Vitest test runner with `@testing-library/react` and happy-dom.
- **Task 1.3**: Configure Tailwind CSS with design tokens (`#7054D4`, `#F0EAFF`, `#F8F6FF`, `#242035`, `#706B80`), IBM Plex Sans Arabic typography, and CSS logical properties.
- **Verification Gate**: `bun run test` runs cleanly and `bun run build` succeeds.

### Phase 2: Supabase Migrations & Database Layer
- **Task 2.1**: Author SQL migrations in `supabase/migrations/20260925000000_init_schema.sql` covering all 8 core tables with foreign keys, constraints, and RLS policies.
- **Task 2.2**: Author Arabic search normalization function and `pg_trgm` indexes.
- **Task 2.3**: Author realistic Arabic seed data (`supabase/seed.sql`) containing author profile, topics, free and premium articles with rich blocks.
- **Task 2.4**: Create type-safe database definitions and Supabase server/browser client helpers.
- **Verification Gate**: Schema definitions match TypeScript types, SQL syntax validated.

### Phase 3: AST Content Pipeline & 3-Derivative Engine (TDD)
- **Task 3.1**: Write tests for Arabic text normalization (Alef normalization, Taa Marbuta, diacritics stripping).
- **Task 3.2**: Implement `lib/content/arabic-normalizer.ts` and verify test suite passes.
- **Task 3.3**: Write tests for MDX Safe Component Allowlist (rejection of `<script>`, `<iframe>`, unknown tags).
- **Task 3.4**: Implement `lib/content/allowlist.ts` component definitions.
- **Task 3.5**: Write tests for Unified 3-Derivative Compiler (`Rich HTML`, `Normalized Markdown`, `Plain Text`).
- **Task 3.6**: Implement `lib/content/compiler.ts` using Remark/Rehype AST transformers.
- **Verification Gate**: 100% test pass on AST transformations and malicious script rejection.

### Phase 4: Pluggable Billing Subsystem (TDD)
- **Task 4.1**: Define `PaymentProviderAdapter` interface and types in `lib/billing/types.ts`.
- **Task 4.2**: Write tests for `SimulatedBillingProvider` covering HMAC webhook signing, checkout sessions, subscription activations, cancellations, and refunds.
- **Task 4.3**: Implement `SimulatedBillingProvider` in `lib/billing/simulated-provider.ts`.
- **Task 4.4**: Implement adapter skeletons for Lemon Squeezy, Paymob, and Stripe.
- **Task 4.5**: Create billing webhook route handler `/api/webhooks/billing` with signature verification.
- **Verification Gate**: Billing lifecycle tests pass with verified HMAC signatures.

### Phase 5: Newsletter Subsystem (TDD)
- **Task 5.1**: Write tests for newsletter subscriber service (double opt-in, token expiration, topic preferences, unsubscribe).
- **Task 5.2**: Implement `lib/newsletter/subscriber-service.ts`.
- **Task 5.3**: Implement `lib/newsletter/mailer.ts` supporting live Resend API and sandbox test logging mode.
- **Task 5.4**: Create responsive RTL React Email templates for confirmation and campaign delivery.
- **Task 5.5**: Create confirmation (`/api/newsletter/confirm`) and unsubscribe (`/api/newsletter/unsubscribe`) route handlers.
- **Verification Gate**: Newsletter unit and integration tests pass.

### Phase 6: Public Experiences & Editorial UI
- **Task 6.1**: Build root layout with `dir="rtl"`, IBM Plex Sans Arabic, editorial header, and footer.
- **Task 6.2**: Build Homepage (`/`) with featured essay, recent articles, topic pills, and newsletter capture box.
- **Task 6.3**: Build Article Listing (`/articles`) with Arabic search, topic filters, and free/premium badges.
- **Task 6.4**: Build Long-form Reading Experience (`/articles/[slug]`):
  - Reading progress bar at top.
  - Sticky accessible Table of Contents.
  - Rich MDX components: Callout, Figure, Table, Mermaid diagram, PullQuote, Footnotes.
  - Server-side paywall gate: previews first 2 paragraphs + subscription card for unauthorized readers.
- **Task 6.5**: Implement derivative endpoints `/content/[slug].md` and `/content/[slug].txt` with identical entitlement gating and `X-Robots-Tag: noindex`.
- **Task 6.6**: Build About (`/about`), Newsletter (`/newsletter`), Membership (`/membership`), and Account (`/account`) pages.
- **Verification Gate**: Test paywall gating to ensure zero premium leakage on HTML, `.md`, and `.txt` endpoints.

### Phase 7: MDX Publishing Studio
- **Task 7.1**: Build Studio layout, navigation, and article management dashboard (`/studio/articles`).
- **Task 7.2**: Build MDX Composer (`/studio/articles/new` and `/studio/articles/[id]/edit`):
  - WYSIWYG, MDX Source, and Live Split Preview modes.
  - Safe block insert toolbar (Callout, Figure, PullQuote, Mermaid, Code, Table).
  - Debounced autosave with visual status indicator.
  - Revision history drawer with diff viewing and revision rollback.
- **Task 7.3**: Build Studio SEO audit panel checking title length, meta description, heading structure, and missing alt tags.
- **Task 7.4**: Implement atomic publish action with 3-derivative generation and database commit.
- **Verification Gate**: Studio drafting, autosave, revision recording, and publishing verified.

### Phase 8: Technical SEO, Feeds & Machine Readability
- **Task 8.1**: Implement JSON-LD generators for WebSite, Person, BreadcrumbList, and BlogPosting (including paywall structured data).
- **Task 8.2**: Implement dynamic XML Sitemap (`/sitemap.xml`).
- **Task 8.3**: Implement dynamic RSS 2.0 Feed (`/rss.xml`) and Atom 1.0 Feed (`/atom.xml`).
- **Task 8.4**: Implement `robots.txt` and `llms.txt`.
- **Verification Gate**: SEO feeds return valid XML, JSON-LD passes schema requirements.

### Phase 9: Three-Pass Verification & Quality Guards
- **Pass 1 (Functional Correctness)**: Run complete test suite covering compilation, billing, newsletter, and publishing.
- **Pass 2 (Security & Content Integrity)**: Verify paywall isolation across all endpoints, webhook signature forgery rejection, and malicious script sanitization.
- **Pass 3 (Production Readiness)**: Verify Next.js production build (`bun run build`), clean-code-guard review, test-guard review, and Git commit.
