# Design Specification: Arabic-First Personal Publishing Platform

**Date:** 2026-09-25  
**Status:** Approved  
**Author:** Publishing Platform Architect & Full-Stack Engineer  
**Framework:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase PostgreSQL, Vitest

---

## 1. System Overview & Invariants

An editorial, Arabic-first personal publishing platform built for a single owner/writer. The system enables the author to write once in an advanced MDX studio, publish once, and automatically produce three deterministic derivatives:

1. **Rich HTML (`/articles/[slug]`)**: Server-rendered interactive article with accessible custom components (Callouts, Figures, Tables, Mermaid diagrams, Pull Quotes).
2. **Normalized Markdown (`/content/[slug].md`)**: CommonMark representation preserving semantic structure, citations, code, and textual block equivalents.
3. **Clean UTF-8 Plain Text (`/content/[slug].txt`)**: Distilled textual narrative stripped of markup with explicit diagram/figure descriptions.

### Core Architectural Invariants:
- **Zero Drift**: All three derivatives are generated from a single canonical MDX versioned revision. Independent edited copies are strictly prohibited.
- **Paywall Security**: Premium content is gated strictly on the server. Unauthorized visitors receive only the teaser excerpt and a subscription CTA across all three endpoints (`.html`, `.md`, `.txt`), feeds, API routes, and React Server Component payloads.
- **RTL & Logical Design**: Pure RTL root (`dir="rtl"`) using CSS logical properties (`margin-inline`, `padding-inline`, `border-inline-start`). Code, URLs, and numbers are isolated in LTR (`unicode-bidi: isolate`).
- **Pluggable Billing**: A clean provider-agnostic interface (`PaymentProviderAdapter`) with a fully functional `SimulatedBillingProvider` (HMAC signatures, webhook handlers, checkout sessions) alongside structured connectors for Lemon Squeezy, Paymob, and Stripe.
- **Audience Isolation**: Reader accounts (`auth.users`), marketing newsletter subscribers, and paid subscriptions are decoupled in the schema. Double opt-in confirmation tokens protect newsletter integrity.

---

## 2. Visual Identity & Editorial UX

- **Color Tokens**:
  - `bg-surface`: `#FFFFFF`
  - `primary-purple`: `#7054D4`
  - `lavender-muted`: `#F0EAFF`
  - `lavender-tint`: `#F8F6FF`
  - `text-primary`: `#242035`
  - `text-secondary`: `#706B80`
  - `border-subtle`: `#E8E3F5`
- **Typography Scale**:
  - Arabic font: `IBM Plex Sans Arabic` (weights 400, 500, 600, 700)
  - Code/Monospace: `IBM Plex Mono`
  - Body text: 18px base on mobile, 20px on desktop, `line-height: 1.85`, reading width bounded at `68ch`.
- **Public Experiences**:
  - **Homepage (`/`)**: Editorial layout with hero article, topic navigation, recent essays, and newsletter capture box.
  - **Article Listing (`/articles`)**: Topic filters, search with Arabic text normalization, and badges (`مجاني` / `حصري للمشتركين`).
  - **Article Reading Page (`/articles/[slug]`)**: Progress bar at top, sticky Table of Contents with scroll-spy, footnote tooltips, and accessible paywall teaser.
  - **About Page (`/about`)**: Author bio, editorial manifesto, publication statistics.
  - **Newsletter Page (`/newsletter`)**: Double opt-in subscription box, topic preferences, public archive.
  - **Membership Page (`/membership`)**: Clear pricing, benefits, and checkout trigger.
  - **Account Page (`/account`)**: Manage subscription status, billing receipts, and newsletter preferences.

---

## 3. Database Schema & Supabase Migrations

The database is built on Supabase PostgreSQL with explicit Row Level Security (RLS) policies:

### Tables:
1. `authors`:
   - `id uuid primary key default gen_random_uuid()`
   - `name text not null`, `bio text`, `avatar_url text`, `social_links jsonb`
2. `topics`:
   - `id uuid primary key default gen_random_uuid()`
   - `slug text unique not null`, `name text not null`, `description text`
3. `articles`:
   - `id uuid primary key default gen_random_uuid()`
   - `slug text unique not null`
   - `title text not null`, `excerpt text not null`
   - `cover_image_url text`, `cover_image_alt text`
   - `visibility text check (visibility in ('FREE', 'PREMIUM')) not null default 'FREE'`
   - `status text check (status in ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED')) not null default 'DRAFT'`
   - `topic_id uuid references topics(id)`
   - `published_at timestamptz`, `scheduled_at timestamptz`
   - `reading_time_minutes integer default 5`
   - `seo_title text`, `seo_description text`
   - `created_at timestamptz default now()`, `updated_at timestamptz default now()`
4. `article_revisions`:
   - `id uuid primary key default gen_random_uuid()`
   - `article_id uuid references articles(id) on delete cascade not null`
   - `revision_number integer not null`
   - `mdx_source text not null`
   - `rich_html text not null`
   - `markdown_derivative text not null`
   - `plaintext_derivative text not null`
   - `created_at timestamptz default now()`
   - `unique(article_id, revision_number)`
5. `readers`:
   - `id uuid primary key references auth.users(id) on delete cascade`
   - `email text unique not null`, `display_name text`, `created_at timestamptz default now()`
6. `subscriptions`:
   - `id uuid primary key default gen_random_uuid()`
   - `reader_id uuid references readers(id) on delete cascade not null`
   - `provider text not null check (provider in ('simulated', 'lemonsqueezy', 'paymob', 'stripe'))`
   - `provider_subscription_id text not null`
   - `status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'expired'))`
   - `plan_type text not null check (plan_type in ('monthly', 'annual'))`
   - `current_period_end timestamptz not null`
   - `is_complimentary boolean default false`
   - `created_at timestamptz default now()`, `updated_at timestamptz default now()`
7. `newsletter_subscribers`:
   - `id uuid primary key default gen_random_uuid()`
   - `email text unique not null`
   - `status text check (status in ('unconfirmed', 'active', 'unsubscribed')) not null default 'unconfirmed'`
   - `confirmation_token text unique`
   - `token_expires_at timestamptz`
   - `topics text[] default '{}'`
   - `created_at timestamptz default now()`, `confirmed_at timestamptz`
8. `newsletter_campaigns`:
   - `id uuid primary key default gen_random_uuid()`
   - `title text not null`, `subject text not null`
   - `html_content text not null`, `plain_text_content text not null`
   - `target_segment text check (target_segment in ('all', 'free', 'premium')) default 'all'`
   - `status text check (status in ('draft', 'scheduled', 'sent')) default 'draft'`
   - `sent_at timestamptz`, `created_at timestamptz default now()`

---

## 4. AST Content Pipeline & 3 Deterministic Derivatives

The AST compiler transforms raw MDX into the three formats:

```
                    ┌────────────────────────┐
                    │ Canonical MDX Document │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │ Remark Markdown Parser │
                    │ (AST AST-to-Hast)      │
                    └───────────┬────────────┘
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 1. Rich HTML     │  │ 2. Markdown      │  │ 3. Plain Text    │
│ React Components │  │ Normalized MD    │  │ UTF-8 Text       │
│ - Callout        │  │ - Blockquotes    │  │ - Title/Author   │
│ - Mermaid        │  │ - Clean URLs     │  │ - Stripped tags  │
│ - Figures/Captions│ │ - Alt descriptions│ │ - Diagram notes  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Safe Component Allowlist:
- `Callout`: type (`info` | `warning` | `quote` | `tip`), title, content.
- `Figure`: image URL, alt (mandatory), caption.
- `Mermaid`: chart definition, alt description (mandatory for a11y & plain text).
- `PullQuote`: quote text, author, source.
- `Footnote` & `Reference`: citation links.
- Rejection rule: Any raw HTML `<script>`, `<iframe>`, `eval`, or unapproved JSX tag fails validation with an explicit error.

---

## 5. Security & Paywall Enforcement

- Server Components verify user session and active subscription before rendering:
  - If article is `FREE`: return complete article.
  - If article is `PREMIUM`:
    - Call `hasActiveEntitlement(userId)` against Supabase.
    - If entitled: render full content.
    - If unauthenticated / unentitled: extract only the first 2 paragraphs for the preview teaser. Render paywall card with login/subscribe triggers.
    - **Never** render full content hidden with `display: none` or inside Next.js payload.
- Route handlers for `/content/[slug].md` and `/content/[slug].txt`:
  - Enforce the same entitlement check. Return 403 Forbidden with teaser text for unauthenticated requests.
  - Set `X-Robots-Tag: noindex, follow` on `.md` and `.txt` endpoints.

---

## 6. Pluggable Billing Architecture

- Interface `PaymentProviderAdapter`:
  ```typescript
  export interface PaymentProviderAdapter {
    readonly name: string;
    createCheckoutSession(input: {
      plan: 'monthly' | 'annual';
      customerEmail: string;
      redirectUrl: string;
    }): Promise<{ checkoutUrl: string; sessionId: string }>;
    verifyWebhookSignature(payload: string, headers: Headers): boolean;
    handleWebhookEvent(event: BillingWebhookEvent): Promise<BillingEventResult>;
    cancelSubscription(subscriptionId: string): Promise<boolean>;
  }
  ```
- `SimulatedBillingProvider`: Local development and test provider using HMAC-SHA256 signatures, deterministic event emission, and immediate database synchronization.
- Connector stubs for Lemon Squeezy, Paymob, and Stripe implementing the same interface.

---

## 7. Newsletter Subsystem

- **Double Opt-In Flow**:
  1. Reader enters email and selects topics.
  2. A secure crypto random token is generated (expires in 24 hours).
  3. Arabic confirmation email sent via Resend API (or logged in sandbox test mode).
  4. Reader clicks `/api/newsletter/confirm?token=xyz`.
  5. Status flips to `active`.
- **RTL React Email Templates**:
  - `ConfirmationEmail`: Welcoming message in Arabic with CTA button and expiration note.
  - `EditorialCampaignEmail`: Responsive card layout with featured post teaser and direct reading link.
  - `UnsubscribeLink`: 1-click unsubscribe endpoint `/api/newsletter/unsubscribe?token=abc`.

---

## 8. Technical SEO, Feeds & Machine Readability

- **Structured Data (JSON-LD)**:
  - `WebSite` & `Person` for author branding.
  - `BlogPosting` with Arabic headline, ISO timestamps, author schema, and `isAccessibleForFree: false` + `hasPart` paywall metadata for premium articles.
- **Feeds**:
  - `/rss.xml`: Fully compliant RSS 2.0 with `<language>ar</language>`.
  - `/atom.xml`: Atom 1.0 feed.
- **Discovery**:
  - `/sitemap.xml`: Auto-generated sitemap with priority and lastmod.
  - `/robots.txt`: Standard crawling directives.
  - `/llms.txt`: Documented index of published essays and topics.

---

## 9. Verification & Quality Gates

- **Unit Testing (Vitest)**:
  - Arabic normalizer & search tokenizer.
  - 3-derivative AST compiler.
  - Safe component allowlist rejection.
  - SEO JSON-LD generator.
- **Integration Testing**:
  - Paywall security: Verify premium content never leaks to unauthenticated callers on HTML, `.md`, and `.txt` routes.
  - Billing webhook simulation & entitlement transitions.
  - Newsletter double opt-in lifecycle.
- **Guards**:
  - `clean-code-guard`: Strict typing, small functions, boundary validation, zero Broad catch-alls.
  - `test-guard`: Assert behavior from caller perspective, real value objects.
