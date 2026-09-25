# Production Backlog & Engineering Roadmap (Post-POC)

This document tracks all production-grade requirements, hardened security features, and persistent storage layers deferred from the initial Proof of Concept (POC) MVP pull request ([PR #1](https://github.com/imMamdouhaboammar/wise-hopper/pull/1)).

Judged as a POC / MVP, the platform demonstrates:
- Atomic compilation from a single Arabic MDX source into 3 synchronized derivatives (Rich HTML, CommonMark, UTF-8 Plaintext).
- Arabic typography excellence (IBM Plex Sans Arabic, RTL CSS Logical Properties, tashkeel normalization, search indexing).
- Server-side paywall teaser extraction ensuring paid content bodies never leak to unauthorized clients.
- Pluggable billing interfaces and double opt-in newsletter delivery in local sandbox mode.

The following epics represent the production migration plan.

---

## 1. Authentication & Identity Architecture (Production Gate)
*Related Review Threads: Codex P1 on content route, studio edit page, and `account/page.tsx`*

- **Supabase Auth Integration**: Full magic-link and OTP authentication flows (`/login`, `/auth/callback`, and `middleware.ts` session refresh).
- **Canonical `getViewer()` Server Helper**: Consolidated server-side identity resolver returning `{ user, isOwner, hasActiveSubscription }`. Owner identity linked to `authors.id` in Supabase Auth or `OWNER_EMAIL`.
- **Complete Elimination of Demo Bypasses**: Remove `DEMO_MODE` flag and ensure requests to `/studio/**` and premium endpoints strictly require verified owner/subscriber sessions.
- **Sentinel Regression Suite**: Automated CI tests verifying unauthenticated requests to premium articles (`.md`, `.txt`, and HTML) strictly redact content and never include sentinel strings from paid paragraphs.

---

## 2. Persistence & Repository Layer Architecture
*Related Review Threads: Codex P1 on `article-service.ts` & `newsletter_subscribers`*

- **Supabase Database Repository**: Replace in-memory seed stores in `article-service.ts` with true PostgreSQL relational tables managed via Supabase SSR client.
- **Atomic Revision Storage**: Persist all 3 derivatives into `article_revisions` table on publication, updating article status and triggering `revalidatePath` across articles, RSS/Atom feeds, and sitemap.
- **Hashed Newsletter Tokens**: Hash all double opt-in confirmation tokens (SHA-256) before storing them in `newsletter_subscribers` to prevent plaintext credential exposure in database dumps.
- **Opaque Unsubscribe Links**: Permanent HMAC-signed unsubscribe tokens per subscriber with POST confirmation gate to avoid false unsubscribes from enterprise email security scanners (`List-Unsubscribe` + `List-Unsubscribe-Post` headers).

---

## 3. Real Payment Gateways & Webhook Idempotency
*Related Review Threads: Codex P1 on Webhook sync & billing adapters*

- **Production Gateway Connectors**:
  - **Stripe**: Official SDK integration for `checkout.sessions.create` and `webhooks.constructEvent` with 5-minute replay tolerance window.
  - **Paymob**: Production Intention API integration with constant-time HMAC verification (`crypto.timingSafeEqual`) and currency-normalized amount fields.
  - **Lemon Squeezy**: Store variant synchronization and custom data payload binding.
- **Durable Webhook Idempotency**: Migration adding `billing_events` table with unique constraint on `(provider, event_id)` preventing double-processing on network retries.
- **Subscription Lifecycle Synchronization**: Real-time webhook events (`subscription_created`, `subscription_canceled`, `payment_refunded`) committed to `subscriptions` table before returning HTTP 200 OK.
- **Subscription Cancellation**: Production-grade cancellation endpoint talking directly to gateway REST endpoints.

---

## 4. Operational & Observability Guardrails
- **Security Scanner & SARIF Pipeline**: CI integration for automated dependency auditing, code scanning, and secret leak detection.
- **Audit Trails**: Immutable logging for publication events, subscription state changes, and studio administrative actions.
