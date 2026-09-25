/**
 * Paywall and Entitlement Evaluation Engine
 * Enforces Zero Leakage of premium content on the server.
 */

export interface ContentAccessInput {
  visibility: 'FREE' | 'PREMIUM';
  isAuthenticated: boolean;
  hasEntitlement: boolean;
  fullHtml: string;
  fullMarkdown: string;
  fullPlainText: string;
}

export interface ContentAccessResult {
  canAccessFull: boolean;
  html: string;
  markdown: string;
  plainText: string;
}

/**
 * Extracts preview teaser paragraphs from content representations.
 */
export function extractTeaserContent(
  fullHtml: string,
  fullMarkdown: string,
  fullPlainText: string
): { teaserHtml: string; teaserMarkdown: string; teaserPlainText: string } {
  // Extract first 2 <p> tags from HTML
  const paragraphMatches = fullHtml.match(/<p>[\s\S]*?<\/p>/g) || [];
  const teaserParagraphs = paragraphMatches.slice(0, 2).join('\n');

  const teaserHtml = `
    <div class="teaser-content">
      ${teaserParagraphs}
    </div>
    <div class="premium-content-barrier" data-paywall="active">
      <!-- Paywall barrier for structured data & client paywall card -->
    </div>
  `.trim();

  // Extract first 2 paragraphs from Markdown (split by double newline)
  const markdownBlocks = fullMarkdown
    .split(/\n\n+/)
    .filter((block) => !block.startsWith('#') && block.trim().length > 0);
  const teaserMarkdown = (markdownBlocks.slice(0, 2).join('\n\n') + '\n\n*... [محتوى حصري للمشتركين]*').trim();

  // Extract first 2 paragraphs from Plain Text
  const plainBlocks = fullPlainText
    .split(/\n\n+/)
    .filter((block) => !block.startsWith('الكاتب') && !block.startsWith('تاريخ') && block.trim().length > 0);
  const teaserPlainText = (plainBlocks.slice(0, 2).join('\n\n') + '\n\n[محتوى حصري مخصص لأعضاء العضوية المميزة]').trim();

  return {
    teaserHtml,
    teaserMarkdown,
    teaserPlainText,
  };
}

/**
 * Evaluates whether the reader is entitled to view full content or must receive redacted teaser.
 */
export function evaluateContentAccess(input: ContentAccessInput): ContentAccessResult {
  if (input.visibility === 'FREE') {
    return {
      canAccessFull: true,
      html: input.fullHtml,
      markdown: input.fullMarkdown,
      plainText: input.fullPlainText,
    };
  }

  // Article is PREMIUM
  if (input.isAuthenticated && input.hasEntitlement) {
    return {
      canAccessFull: true,
      html: input.fullHtml,
      markdown: input.fullMarkdown,
      plainText: input.fullPlainText,
    };
  }

  // Unauthorized or unentitled visitor
  const { teaserHtml, teaserMarkdown, teaserPlainText } = extractTeaserContent(
    input.fullHtml,
    input.fullMarkdown,
    input.fullPlainText
  );

  return {
    canAccessFull: false,
    html: teaserHtml,
    markdown: teaserMarkdown,
    plainText: teaserPlainText,
  };
}
