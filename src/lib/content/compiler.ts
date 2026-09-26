import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { validateMdxSource, type ValidationResult } from './allowlist';

export interface ContentMetadata {
  title: string;
  authorName: string;
  publishedAt: string;
  excerpt?: string;
}

export function validateMdxContent(source: string): ValidationResult {
  return validateMdxSource(source);
}

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server.edge';
import * as LucideIcons from 'lucide-react';

export function toPascalCase(str: string): string {
  return str
    .replace(/^lucide:/i, '')
    .replace(/[-_]([a-z0-9])/gi, (_match, char: string) => char.toUpperCase())
    .replace(/^[a-z]/, (first: string) => first.toUpperCase());
}

type LucideIconComponent = React.ComponentType<{
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}>;

function getLucideIcon(name: string): LucideIconComponent {
  const pascalName = toPascalCase(name);
  const iconKey =
    pascalName in LucideIcons
      ? pascalName
      : `${pascalName}Icon` in LucideIcons
        ? `${pascalName}Icon`
        : null;

  if (iconKey) {
    // SAFETY: iconKey was verified to exist in LucideIcons via in-operator checks
    const icon = LucideIcons[iconKey as keyof typeof LucideIcons];
    if (icon) {
      // SAFETY: Lucide icon component matches standard React component interface
      return icon as LucideIconComponent;
    }
  }
  return LucideIcons.Sparkles;
}

export function renderIconSvg(name: string, size = 18, customClassName = ''): string {
  const Component = getLucideIcon(name);

  const classes = customClassName
    ? `editorial-icon inline-block align-middle ${customClassName}`
    : 'editorial-icon inline-block align-middle';

  try {
    return renderToStaticMarkup(
      React.createElement(Component, {
        size,
        className: classes,
        'aria-hidden': true,
      })
    );
  } catch {
    return `<span class="${classes}" data-icon="${name}">[icon:${name}]</span>`;
  }
}

/**
 * Preprocesses custom JSX editorial tags into sanitized HTML containers.
 */
function preprocessCustomTagsForHtml(source: string): string {
  let result = source;

  // Transform Mermaid code blocks into semantic containers
  result = result.replace(/```mermaid\n([\s\S]*?)```/g, (_match, code: string) => {
    const trimmedCode = code.trim();
    return `<div class="editorial-mermaid" data-mermaid="${encodeURIComponent(trimmedCode)}" role="img" aria-label="رسم تخطيطي بياني"><pre class="mermaid">${trimmedCode}</pre></div>`;
  });

  // Transform <Icon name="..." size="..." className="..." />
  result = result.replace(
    /<Icon\s+([^>]*?)\/?>/g,
    (_match, attrsStr: string) => {
      const name = (attrsStr.match(/name="([^"]*)"/) || [])[1] || 'Sparkles';
      const sizeMatch = attrsStr.match(/size="?(\d+)"?/);
      const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 18;
      const customClass = (attrsStr.match(/className="([^"]*)"/) || [])[1] || '';
      return renderIconSvg(name, size, customClass);
    }
  );

  // Transform <Callout type="..." title="...">...</Callout>
  result = result.replace(
    /<Callout\s+type="([^"]*)"\s+title="([^"]*)">([\s\S]*?)<\/Callout>/g,
    (_match, type, title, body) => {
      return `<div class="editorial-callout editorial-callout-${type}" data-type="${type}"><span class="editorial-callout-title">${title}</span><div class="editorial-callout-body">${body.trim()}</div></div>`;
    }
  );

  // Transform <PullQuote quote="..." author="..." />
  result = result.replace(
    /<PullQuote\s+quote="([^"]*)"\s+author="([^"]*)"\s*\/>/g,
    (_match, quote, author) => {
      return `<blockquote class="editorial-pullquote"><p>«${quote}»</p><cite>— ${author}</cite></blockquote>`;
    }
  );

  // Transform <Figure src="..." alt="..." caption="..." />
  result = result.replace(
    /<Figure\s+src="([^"]*)"\s+alt="([^"]*)"\s+caption="([^"]*)"\s*\/>/g,
    (_match, src, alt, caption) => {
      return `<figure class="editorial-figure"><img src="${src}" alt="${alt}" loading="lazy" /><figcaption>${caption}</figcaption></figure>`;
    }
  );

  return result;
}

/**
 * Generates Derivative 1: Server-Rendered Rich HTML
 */
export async function compileRichHtml(source: string): Promise<string> {
  const validation = validateMdxSource(source);
  if (!validation.isValid) {
    throw new Error(`MDX Validation Failed: ${validation.errors.join(', ')}`);
  }

  const preprocessed = preprocessCustomTagsForHtml(source);

  // Extended schema allowing our editorial classes, icons, and SVG data attributes
  const customSanitizeSchema = {
    ...defaultSchema,
    tagNames: [
      ...(defaultSchema.tagNames || []),
      'figure',
      'figcaption',
      'svg',
      'path',
      'circle',
      'rect',
      'line',
      'polyline',
      'polygon',
      'g',
      'defs',
    ],
    attributes: {
      ...defaultSchema.attributes,
      '*': [...(defaultSchema.attributes?.['*'] || []), 'className', 'class'],
      div: [
        ...(defaultSchema.attributes?.div || []),
        'className',
        'class',
        'data-type',
        'dataType',
        'data-mermaid',
        'dataMermaid',
        'role',
        'aria-label',
        'ariaLabel',
      ],
      span: [
        ...(defaultSchema.attributes?.span || []),
        'className',
        'class',
        'data-icon',
        'data-editorial-icon',
      ],
      svg: [
        'className',
        'class',
        'viewBox',
        'width',
        'height',
        'fill',
        'stroke',
        'strokeWidth',
        'stroke-width',
        'strokeLinecap',
        'stroke-linecap',
        'strokeLinejoin',
        'stroke-linejoin',
        'xmlns',
        'aria-hidden',
        'ariaHidden',
        'role',
      ],
      path: [
        'd',
        'fill',
        'stroke',
        'strokeWidth',
        'stroke-width',
        'strokeLinecap',
        'stroke-linecap',
        'strokeLinejoin',
        'stroke-linejoin',
        'opacity',
      ],
      circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'strokeWidth', 'stroke-width'],
      rect: [
        'x',
        'y',
        'width',
        'height',
        'rx',
        'ry',
        'fill',
        'stroke',
        'strokeWidth',
        'stroke-width',
      ],
      line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'strokeWidth', 'stroke-width'],
      polyline: ['points', 'fill', 'stroke', 'strokeWidth', 'stroke-width'],
      polygon: ['points', 'fill', 'stroke', 'strokeWidth', 'stroke-width'],
      g: ['fill', 'stroke', 'className', 'class', 'opacity'],
      pre: [...(defaultSchema.attributes?.pre || []), 'className', 'class'],
      code: [...(defaultSchema.attributes?.code || []), 'className', 'class'],
      blockquote: [...(defaultSchema.attributes?.blockquote || []), 'className', 'class'],
      figure: [...(defaultSchema.attributes?.figure || []), 'className', 'class'],
      img: [...(defaultSchema.attributes?.img || []), 'src', 'alt', 'loading'],
    },
  };

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, customSanitizeSchema)
    .use(rehypeStringify)
    .process(preprocessed);

  return String(file);
}

/**
 * Generates Derivative 2: Normalized CommonMark Markdown
 */
export async function compileNormalizedMarkdown(source: string): Promise<string> {
  let result = source;

  // Convert <Callout> to Markdown blockquote format
  result = result.replace(
    /<Callout\s+type="([^"]*)"\s+title="([^"]*)">([\s\S]*?)<\/Callout>/g,
    (_match, type, title, body) => {
      const indentedBody = body.trim().split('\n').map((line: string) => `> ${line}`).join('\n');
      return `> [!${type}] ${title}\n${indentedBody}`;
    }
  );

  // Convert <PullQuote> to Markdown blockquote
  result = result.replace(
    /<PullQuote\s+quote="([^"]*)"\s+author="([^"]*)"\s*\/>/g,
    (_match, quote, author) => `> "${quote}" — ${author}`
  );

  // Convert <Figure> to Markdown image + caption
  result = result.replace(
    /<Figure\s+src="([^"]*)"\s+alt="([^"]*)"\s+caption="([^"]*)"\s*\/>/g,
    (_match, src, alt, caption) => `![${alt}](${src})\n*${caption}*`
  );

  // Convert <Icon> to markdown representation
  result = result.replace(
    /<Icon\s+([^>]*?)\/?>/g,
    (_match, attrsStr: string) => {
      const name = (attrsStr.match(/name="([^"]*)"/) || [])[1] || 'icon';
      return `[icon:${name}]`;
    }
  );

  return result.trim();
}

/**
 * Generates Derivative 3: Clean UTF-8 Plain Text
 */
export async function compilePlainText(source: string, metadata: ContentMetadata): Promise<string> {
  let text = source;

  // Replace custom blocks with semantic text representations
  text = text.replace(
    /<Icon\s+([^>]*?)\/?>/g,
    (_match, attrsStr: string) => {
      const name = (attrsStr.match(/name="([^"]*)"/) || [])[1] || '';
      return name ? `[رمز: ${name}]` : '';
    }
  );

  text = text.replace(
    /<Callout\s+type="[^"]*"\s+title="([^"]*)">([\s\S]*?)<\/Callout>/g,
    (_match, title, body) => `[تنبيه: ${title}] ${body.trim()}`
  );

  text = text.replace(
    /<PullQuote\s+quote="([^"]*)"\s+author="([^"]*)"\s*\/>/g,
    (_match, quote, author) => `[اقتباس: "${quote}" — ${author}]`
  );

  text = text.replace(
    /<Figure\s+src="[^"]*"\s+alt="([^"]*)"\s+caption="([^"]*)"\s*\/>/g,
    (_match, alt, caption) => `[صورة: ${alt} — ${caption}]`
  );

  text = text.replace(/```mermaid[\s\S]*?```/g, '[رسم تخطيطي: مخطط سير البيانات]');
  text = text.replace(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g, (_match, code: string) => code.trim());
  text = text.replace(/`([^`]+)`/g, '$1');

  // Strip Markdown headings (# Header -> Header)
  text = text.replace(/^#+\s+(.*)$/gm, '$1');

  // Strip links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  const dateFormatted = metadata.publishedAt.slice(0, 10);
  const header = `${metadata.title}\nالكاتب: ${metadata.authorName}\nتاريخ النشر: ${dateFormatted}\n\n`;

  const cleanBody = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n\n');

  return (header + cleanBody).trim();
}
