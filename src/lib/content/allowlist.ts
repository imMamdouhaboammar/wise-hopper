/**
 * MDX Component Allowlist and Safety Validator
 */

export const APPROVED_CUSTOM_COMPONENTS = ['Callout', 'Figure', 'PullQuote', 'Mermaid'] as const;
export type ApprovedCustomComponent = (typeof APPROVED_CUSTOM_COMPONENTS)[number];

const FORBIDDEN_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'meta',
  'link',
  'style',
  'form',
  'input',
  'button',
  'textarea',
  'select',
];

const FORBIDDEN_ATTRIBUTES = [
  'onload',
  'onerror',
  'onclick',
  'onmouseover',
  'onfocus',
  'onblur',
  'dangerouslysetinnerhtml',
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates MDX source to prevent code injection, malicious tags, or unauthorized components.
 */
export function validateMdxSource(source: string): ValidationResult {
  const errors: string[] = [];
  const lower = source.toLowerCase();

  // Check forbidden HTML tags
  for (const tag of FORBIDDEN_TAGS) {
    const openingTagRegex = new RegExp(`<\\s*${tag}[\\s>/]`, 'i');
    if (openingTagRegex.test(lower)) {
      errors.push(`Forbidden HTML tag detected: <${tag}>`);
    }
  }

  // Check forbidden event handlers and attributes
  for (const attr of FORBIDDEN_ATTRIBUTES) {
    if (lower.includes(attr)) {
      errors.push(`Forbidden inline event handler/attribute detected: ${attr}`);
    }
  }

  // Check for unapproved JSX custom components (<PascalCaseTags...>)
  const customTagRegex = /<([A-Z][A-Za-z0-9]+)/g;
  let match: RegExpExecArray | null;
  while ((match = customTagRegex.exec(source)) !== null) {
    const tagName = match[1];
    if (!APPROVED_CUSTOM_COMPONENTS.includes(tagName as ApprovedCustomComponent)) {
      errors.push(`Unapproved custom component: <${tagName}>`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
