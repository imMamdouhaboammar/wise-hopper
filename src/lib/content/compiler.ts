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
import * as LobeIcons from '@lobehub/icons';

export function toPascalCase(str: string): string {
  return str
    .replace(/^(lobe|ai|lucide):/i, '')
    .replace(/[-_]([a-z0-9])/gi, (_match, char: string) => char.toUpperCase())
    .replace(/^[a-z]/, (first: string) => first.toUpperCase());
}

type UniversalIconComponent = React.ComponentType<{
  size?: number | string;
  className?: string;
  'aria-hidden'?: boolean;
}>;

export function resolveUniversalIcon(name: string): UniversalIconComponent {
  let clean = name.replace(/^(lobe|ai|lucide):/i, '');
  const isColor = /\.Color$/i.test(clean) || /:color$/i.test(clean);
  clean = clean.replace(/(\.Color|:color)$/i, '');
  const pascalName = toPascalCase(clean);

  // 1. Check LobeIcons (AI & LLM brand icons: OpenAI, Claude, DeepSeek, Gemini, etc.)
  if (pascalName in LobeIcons) {
    // SAFETY: Property verified to exist on LobeIcons namespace
    const found = LobeIcons[pascalName as keyof typeof LobeIcons];
    if (found && Boolean(found)) {
      type LobeVariantRecord = { Color?: UniversalIconComponent };
      // SAFETY: LobeHub icon export can be inspected for Color variant component
      const foundWithVariant = found as LobeVariantRecord;
      if (isColor && Boolean(foundWithVariant.Color)) {
        // SAFETY: Color variant verified to exist on LobeHub icon component
        return foundWithVariant.Color as UniversalIconComponent;
      }
      // SAFETY: LobeHub icon component conforms to React component signature
      return found as UniversalIconComponent;
    }
  }

  // 2. Check LucideIcons
  const lucideKey =
    pascalName in LucideIcons
      ? pascalName
      : `${pascalName}Icon` in LucideIcons
        ? `${pascalName}Icon`
        : null;

  if (lucideKey) {
    // SAFETY: lucideKey verified to exist on LucideIcons namespace via in-operator
    const icon = LucideIcons[lucideKey as keyof typeof LucideIcons];
    if (icon && Boolean(icon)) {
      // SAFETY: Lucide icon component matches standard React component interface
      return icon as UniversalIconComponent;
    }
  }

  return LucideIcons.Sparkles;
}

export function renderIconSvg(name: string, size = 18, customClassName = ''): string {
  const Component = resolveUniversalIcon(name);

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
      'title',
      'path',
      'circle',
      'rect',
      'line',
      'polyline',
      'polygon',
      'g',
      'defs',
      'mask',
      'use',
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
        'style',
        'fillRule',
        'fill-rule',
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
        'fillRule',
        'fill-rule',
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
