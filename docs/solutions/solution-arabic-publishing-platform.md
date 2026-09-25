# Solution: Arabic-First Personal Publishing Platform (wise-hopper)

## Context & Objectives
Built a production-ready, Arabic-first personal publishing platform, MDX studio, professional newsletter, and zero-leakage membership paywall for `wise-hopper`. The platform adheres to strict typography, RTL logical properties, deterministic multi-format syndication (HTML, Markdown, Plain Text), and zero AI slop in both TypeScript code and Arabic editorial prose.

---

## Key Architectural Decisions & Solutions

### 1. Deterministic 3-Derivative AST Compiler (`src/lib/content/compiler.ts`)
- **Challenge**: Content written in MDX must be distributed to human web readers, markdown-based aggregators/static archives, and plain-text LLM ingestion pipelines without content drift or manual re-editing.
- **Solution**: Remark/Rehype unified pipeline with custom AST visitors:
  - **Rich HTML**: Injected with heading slug IDs, syntax highlighting, accessible labels, and responsive tables.
  - **CommonMark Markdown**: AST stripped of raw HTML, converting callouts into blockquotes and figures into standard images.
  - **Plain Text**: Formatted with clean metadata headers, stripped table layouts with inline summaries, and whitespace normalization for screen readers and LLMs.
- **Route Rewrites in Next.js 15**: Instead of using literal `.md` directory segments which break Next.js App Router route typing, unified handler `src/app/api/content/[slug]/route.ts` is bound to `/content/:slug.md` and `/content/:slug.txt` via `next.config.ts` rewrites with `X-Robots-Tag: noindex, follow`.

### 2. Zero-Leakage Server-Side Paywall (`src/lib/auth/entitlements.ts`)
- **Challenge**: Client-side CSS or JavaScript-hidden paywalls allow unauthorized visitors or scrapers to extract full premium text via DOM inspection or RSC wire payloads.
- **Solution**: Access evaluation happens purely on the server (`evaluateContentAccess`). Unauthorized requests receive only the first two paragraphs (`extractTeaserContent`) and a structured `.premium-content-barrier` paywall card. The complete text never leaves server memory for unauthorized sessions.
- **SEO Compliance**: Generated `BlogPosting` Schema.org JSON-LD contains `isAccessibleForFree: false` and `hasPart` targeting the `.premium-content-barrier` selector in accordance with Google Paywalled Content guidelines.

### 3. Oxlint Anti-Slop & Type Safety Architecture
- **Challenge**: Enforcing strict type safety and eliminating AI boilerplate, unparsed representations, and unhandled type assertions across all modules.
- **Solution**: Configured `oxlint` with 15 anti-slop rules enabled at `"error"`.
  - Replaced type assertions (`as string`, `as 'FREE' | 'PREMIUM'`) with type narrowing, standard coercion (`String()`, `.toString()`), and type guards (`isApprovedComponent`).
  - Replaced open dictionary types (`Record<string, any>`) with strongly typed contracts (`BlogPostingJsonLd`, `TeaserContentResult`).
  - Achieved `0 errors, 0 warnings` across all 63 repository files in 208ms.

### 4. Arabic Editorial UX Writing Pass (`/say-no-to-slop`)
- **Pattern Audited**: Corporate buzzwords, inflated significance, formulaic bullet lists, and hollow intensifiers in Arabic.
- **Refinement**: Replaced translated marketing clichés with natural, dignified Arabic phrasing:
  - Replaced passive expressions with active verbs and concrete value propositions.
  - Enforced Arabic grammatical rules (e.g. deleting the yaa in defective indefinite nouns: "خالٍ من التنسيق").
  - Formatted feature lists with explanatory colons rather than formulaic bullet fragments.

---

## Verification & Metrics
- **Vitest Suite**: 49/49 automated unit and integration tests passing (`bun run test`).
- **Oxlint**: 0 errors, 0 warnings across 63 files (`bun run lint`).
- **Next.js Production Build**: 26/26 static and dynamic routes compiled cleanly (`bun run build`).
- **GitHub Pull Request**: PR #1 opened on `imMamdouhaboammar/wise-hopper`.
