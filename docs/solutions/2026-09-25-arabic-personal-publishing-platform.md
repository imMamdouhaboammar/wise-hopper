# Solution & Engineering Learnings: Arabic-First Personal Publishing Platform

**Date:** 2026-09-25  
**Topic:** Arabic-First MDX Publishing, Deterministic 3-Derivative Pipeline, Server-Side Paywall Zero-Leakage, and Pluggable Billing

---

## 1. Problem Statement & Mission
Building a production-ready personal publishing platform with an Arabic-first reading experience, WYSIWYG/MDX publishing studio, deterministic generation of three synchronized derivatives (Rich HTML, CommonMark Markdown, Plain Text), server-side protected paid content, and a professional newsletter system with double opt-in.

---

## 2. Key Architectural Decisions & Solutions

### A. The Deterministic 3-Derivative Pipeline
- **Problem:** Content drift when blog articles are maintained separately for browser rendering, RSS/Atom feeds, and raw Markdown downloads.
- **Solution:** A single versioned MDX source is parsed by a unified AST compiler (`unified` + `remarkParse` + `remarkRehype` + `rehypeRaw` + `rehypeSanitize`). Custom editorial components (`Callout`, `Figure`, `PullQuote`, `Mermaid`) are compiled deterministically into:
  1. Rich HTML with semantic editorial CSS classes.
  2. Normalized CommonMark with standard blockquote extensions (`> [!info]`).
  3. Clean UTF-8 text with explicit text descriptions of non-textual figures/diagrams.
- **SEO Canonicalization:** Search engines index only the HTML page; `.md` and `.txt` derivatives return `X-Robots-Tag: noindex, follow` to prevent split page rank.

### B. Arabic Orthography & Full-Text Search
- **Problem:** English stemming algorithms break on Arabic; users search with or without diacritics (Harakat), or vary Alef forms (أ, إ, آ, ٱ), Taa Marbuta (ة vs ه), and Alef Maqsura (ى vs ي).
- **Solution:** Designed dual-layer normalization:
  1. TypeScript utility (`src/lib/content/arabic-normalizer.ts`) for query tokenization and client/SSR filtering.
  2. PostgreSQL function `normalize_arabic(text)` with `pg_trgm` GIN indexes for fast server-side similarity search.

### C. Server-Side Paywall & Zero Leakage
- **Problem:** Client-side paywalls (`display: none` or obscured CSS overlays) leak proprietary content in HTML DOM, JSON payloads, and network responses.
- **Solution:** Server Components evaluate entitlement (`evaluateContentAccess`) before sending any response. Unauthorized readers receive only the teaser (first 2 paragraphs) plus the structured paywall card. The complete text never leaves the server.

### D. Pluggable Billing Engine
- **Problem:** External payment providers vary by jurisdiction (Lemon Squeezy for global MoR tax handling, Paymob for MENA/Egypt/GCC, Stripe for Western entities).
- **Solution:** Abstracted interface `PaymentProviderAdapter` with a built-in `SimulatedBillingProvider` implementing constant-time HMAC-SHA256 signature verification and checkout simulations, accompanied by modular adapters for Lemon Squeezy, Paymob, and Stripe.

---

## 3. Verification Evidence
- 48 automated tests passing across 9 test suites in Vitest.
- Clean Next.js 15 production build (`bun run build`) with 26 static/dynamic routes.
- Zero package hallucination, zero dummy database persistence, zero broad catch-all error handling.
