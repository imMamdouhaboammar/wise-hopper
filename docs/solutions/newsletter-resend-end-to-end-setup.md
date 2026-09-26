# Newsletter & Resend End-to-End Configuration

## Overview
This document captures the complete architectural implementation of the Wise Hopper newsletter system, integrating Resend (free tier) with Next.js, React Email, and double opt-in subscriber management.

## Architecture Components

1. **Email Templates (`src/emails/`)**:
   - `confirmation-email.tsx`: RTL-optimized double opt-in email with a secure token link, 24-hour expiration notice, and clear action button.
   - `welcome-email.tsx`: Welcome email dispatched automatically upon subscription confirmation, displaying subscribed topics and preferences link.
   - `campaign-email.tsx`: Editorial newsletter broadcast template supporting paragraphs and clean typography.

2. **Delivery Service (`src/lib/newsletter/mailer.ts`)**:
   - Built on `resend` SDK v6.
   - Uses `@react-email/components`'s `render` to produce responsive, client-compatible HTML strings and plain-text fallbacks.
   - Embeds RFC 8058 `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers on all broadcast and transactional messages.
   - Graceful fallback: when `RESEND_API_KEY` is not present, operates in Sandbox mode (local memory logging) to prevent breakages during offline development or unit testing.

3. **Double Opt-In Lifecycle (`src/lib/newsletter/subscriber-service.ts`)**:
   - `subscribe(email, topics)`: Generates cryptographic 24-byte hex confirmation and unsubscribe tokens with a 24-hour expiration window.
   - `confirmSubscription(token)`: Verifies token validity and expiration, sets status to `active`, synchronizes the contact with Resend Audience, and sends the Welcome Email.
   - `unsubscribeByToken(token)`: Opaque, non-enumerable token unsubscription protecting against search engine crawlers and prefetch bots, updating both database and Resend Contact status.

4. **Public & Studio Interfaces**:
   - `/newsletter`: Public landing page with accessible status notification cards (`pending_confirmation`, `confirmed`, `unsubscribed`, `error`).
   - `/studio/newsletter`: Publisher interface displaying real-time Resend connection status, verified sender email, dynamic subscriber counts, and manual broadcast triggers.

5. **MCP Server Integration**:
   - Added `resend` server configuration to `~/.gemini/config/mcp_config.json`:
     ```json
     {
       "mcpServers": {
         "resend": {
           "serverUrl": "https://mcp.resend.com/mcp"
         }
       }
     }
     ```

6. **Resend Webhook Handler (`src/app/api/webhooks/resend/route.ts`)**:
   - Verifies incoming Svix signatures (`svix-id`, `svix-timestamp`, `svix-signature`) using `resend.webhooks.verify`.
   - Handles `email.bounced`: immediately unsubscribes recipients to maintain high domain reputation and avoid spam listings.
   - Handles `email.complained`: immediately suppresses recipients who reported spam.
   - Handles `email.delivered`, `email.opened`, `email.clicked`: records delivery and engagement metrics.

## Environment Variables

Configured in `.env.local`:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

*Note: `onboarding@resend.dev` is used for testing and free sandbox delivery directly to the verified account email. Once a custom domain is verified via SPF/DKIM in Resend, update `RESEND_FROM_EMAIL` to `newsletter@yourdomain.com`.*

## Verification
- Unit test suite: `bun test src/lib/newsletter/newsletter.test.ts` (100% passing)
- E2E delivery tests: `bun test src/e2e-delivery.test.ts` (100% passing)
- Complete lifecycle script: `bun run scripts/verify-newsletter-e2e.ts` (100% passing)
- Lint & Typecheck: `oxlint` (0 errors) & `tsc --noEmit` (0 errors)
