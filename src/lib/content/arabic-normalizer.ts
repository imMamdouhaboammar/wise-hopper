/**
 * Arabic Text Normalizer and Search Utilities
 * Strips Harakat, normalizes orthographic variants, and tokenizes queries.
 */

// Regular expressions for Arabic script normalization
const ARABIC_DIACRITICS_REGEX = /[\u064B-\u0652\u0670]/g;
const TATWEEL_REGEX = /\u0640/g;
const ALEF_VARIANTS_REGEX = /[إأآٱ]/g;
const ALEF_MAQSURA_REGEX = /ى/g;
const TAA_MARBUTA_REGEX = /ة/g;
const PUNCTUATION_REGEX = /[،؛؟.,!?:;()[\]{}"'`«»\-—_]/g;

/**
 * Normalizes an Arabic string for consistent comparison and indexing.
 */
export function normalizeArabic(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(TATWEEL_REGEX, '')
    .replace(ALEF_VARIANTS_REGEX, 'ا')
    .replace(TAA_MARBUTA_REGEX, 'ه')
    .replace(ALEF_MAQSURA_REGEX, 'ي')
    .toLowerCase()
    .trim();
}

/**
 * Tokenizes a query into normalized search keywords.
 */
export function tokenizeArabic(text: string): string[] {
  if (!text) {
    return [];
  }

  const cleaned = text.replace(PUNCTUATION_REGEX, ' ');
  const normalized = normalizeArabic(cleaned);

  return normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

/**
 * Checks whether target text satisfies all tokens in an Arabic search query.
 */
export function matchArabicQuery(targetText: string, searchQuery: string): boolean {
  const queryTokens = tokenizeArabic(searchQuery);
  if (queryTokens.length === 0) {
    return true;
  }

  const normalizedTarget = normalizeArabic(targetText);
  return queryTokens.every((token) => normalizedTarget.includes(token));
}
