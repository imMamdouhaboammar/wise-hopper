import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { mdxToMarkdown } from 'mdast-util-mdx';
import type { JSONContent } from '@tiptap/core';
import type {
  Root,
  RootContent,
  PhrasingContent,
  Table,
  TableRow,
  TableCell,
  Heading,
  Paragraph,
  Blockquote,
  List,
  ListItem,
  Code,
  FootnoteDefinition,
  BlockContent,
  DefinitionContent,
} from 'mdast';
import type { MdxJsxFlowElement, MdxJsxAttribute, MdxJsxExpressionAttribute, MdxJsxAttributeValueExpression } from 'mdast-util-mdx';

export type MarkType = 'bold' | 'italic' | 'strike' | 'code' | 'link';

export interface EditorMark {
  type: MarkType;
  attrs?: {
    href?: string;
    title?: string | null;
  };
}

export type EditorialBlock = BlockContent | DefinitionContent | MdxJsxFlowElement;
export type EditorialMdastNode = EditorialBlock;

const MARK_HIERARCHY: readonly MarkType[] = ['bold', 'italic', 'strike', 'link', 'code'] as const;

function isStringValue(
  value: string | number | boolean | MdxJsxAttributeValueExpression | null | undefined
): value is string {
  return value !== null && value !== undefined && String(value) === value;
}

function getStringAttr(node: JSONContent, key: string, fallback = ''): string {
  const value = node.attrs ? node.attrs[key] : undefined;
  return isStringValue(value) ? value : fallback;
}

function getNumberAttr(node: JSONContent, key: string, fallback = 1): number {
  const value = node.attrs ? node.attrs[key] : undefined;
  return Number.isFinite(value) ? Number(value) : fallback;
}

function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return false;
  }
  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  );
}

function sanitizeHref(href: string): string {
  return isSafeHref(href) ? href : '#';
}

function marksEqual(a: EditorMark, b: EditorMark): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'link') {
    return a.attrs?.href === b.attrs?.href && a.attrs?.title === b.attrs?.title;
  }
  return true;
}

function extractJsxAttribute(attributes: (MdxJsxAttribute | MdxJsxExpressionAttribute)[], name: string): string {
  for (const attr of attributes) {
    if (attr.type === 'mdxJsxAttribute' && attr.name === name) {
      if (attr.value === null || attr.value === undefined) {
        return '';
      }
      if (isStringValue(attr.value)) {
        return attr.value;
      }
      return '';
    }
  }
  return '';
}

function parseOptionalNumber(value: string): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function extractNodeMarks(node: JSONContent): readonly EditorMark[] {
  if (!node.marks || !Array.isArray(node.marks)) return [];
  const result: EditorMark[] = [];
  for (const m of node.marks) {
    if (m && isStringValue(m.type)) {
      if (
        m.type === 'bold' ||
        m.type === 'italic' ||
        m.type === 'strike' ||
        m.type === 'code' ||
        m.type === 'link'
      ) {
        const href = m.attrs && isStringValue(m.attrs.href) ? m.attrs.href : undefined;
        const title = m.attrs && isStringValue(m.attrs.title) ? m.attrs.title : null;
        result.push({
          type: m.type,
          attrs: href ? { href, title: title || null } : undefined,
        });
      }
    }
  }
  return result;
}

/**
 * Converts phrasing content (inline markdown AST nodes) into ProseMirror inline JSONContent nodes.
 */
function convertPhrasingToProseMirror(
  children: PhrasingContent[],
  activeMarks: readonly EditorMark[] = []
): JSONContent[] {
  const result: JSONContent[] = [];

  for (const child of children) {
    switch (child.type) {
      case 'text': {
        if (child.value.length === 0) continue;
        result.push({
          type: 'text',
          text: child.value,
          marks: activeMarks.length > 0 ? [...activeMarks] : undefined,
        });
        break;
      }

      case 'inlineCode': {
        if (child.value.length === 0) continue;
        result.push({
          type: 'text',
          text: child.value,
          marks: [...activeMarks, { type: 'code' }],
        });
        break;
      }

      case 'strong': {
        const nested = convertPhrasingToProseMirror(child.children, [...activeMarks, { type: 'bold' }]);
        result.push(...nested);
        break;
      }

      case 'emphasis': {
        const nested = convertPhrasingToProseMirror(child.children, [...activeMarks, { type: 'italic' }]);
        result.push(...nested);
        break;
      }

      case 'delete': {
        const nested = convertPhrasingToProseMirror(child.children, [...activeMarks, { type: 'strike' }]);
        result.push(...nested);
        break;
      }

      case 'link': {
        const safeUrl = sanitizeHref(child.url);
        const linkMark: EditorMark = {
          type: 'link',
          attrs: {
            href: safeUrl,
            title: child.title ?? null,
          },
        };
        const nested = convertPhrasingToProseMirror(child.children, [...activeMarks, linkMark]);
        result.push(...nested);
        break;
      }

      case 'break': {
        result.push({ type: 'hardBreak' });
        break;
      }

      case 'image': {
        result.push({
          type: 'image',
          attrs: {
            src: child.url,
            alt: child.alt ?? '',
            title: child.title ?? null,
          },
        });
        break;
      }

      case 'footnoteReference': {
        result.push({
          type: 'footnoteReference',
          attrs: {
            identifier: child.identifier,
          },
        });
        break;
      }

      default: {
        // Discard unknown phrasing or unwrap children if present
        if ('children' in child && Array.isArray(child.children)) {
          // SAFETY: Phrasing child has array children matching PhrasingContent[]
          const inner = child.children as PhrasingContent[];
          result.push(...convertPhrasingToProseMirror(inner, activeMarks));
        }
        break;
      }
    }
  }

  // Coalesce consecutive text nodes that have identical marks
  const coalesced: JSONContent[] = [];
  for (const node of result) {
    const last = coalesced[coalesced.length - 1];
    if (
      last &&
      last.type === 'text' &&
      node.type === 'text' &&
      Boolean(last.text) &&
      Boolean(node.text)
    ) {
      const lastMarks = extractNodeMarks(last);
      const nodeMarks = extractNodeMarks(node);
      const sameMarksCount = lastMarks.length === nodeMarks.length;
      const allMatch =
        sameMarksCount &&
        lastMarks.every((lm, idx) => {
          const nm = nodeMarks[idx];
          return nm ? marksEqual(lm, nm) : false;
        });

      if (allMatch) {
        last.text = (last.text || '') + (node.text || '');
        continue;
      }
    }
    coalesced.push(node);
  }

  return coalesced;
}

/**
 * Converts block mdast nodes into ProseMirror block JSONContent nodes.
 */
function convertBlockToProseMirror(node: RootContent): JSONContent | null {
  switch (node.type) {
    case 'heading': {
      // SAFETY: node is narrowed by type discriminator to Heading
      const headingNode = node as Heading;
      const content = convertPhrasingToProseMirror(headingNode.children);
      return {
        type: 'heading',
        attrs: {
          level: Math.min(Math.max(headingNode.depth, 1), 6),
        },
        content: content.length > 0 ? content : undefined,
      };
    }

    case 'paragraph': {
      // SAFETY: node is narrowed by type discriminator to Paragraph
      const paragraphNode = node as Paragraph;
      const content = convertPhrasingToProseMirror(paragraphNode.children);
      return {
        type: 'paragraph',
        content: content.length > 0 ? content : undefined,
      };
    }

    case 'blockquote': {
      // SAFETY: node is narrowed by type discriminator to Blockquote
      const blockquoteNode = node as Blockquote;
      const content: JSONContent[] = [];
      for (const child of blockquoteNode.children) {
        const converted = convertBlockToProseMirror(child);
        if (converted) content.push(converted);
      }
      return {
        type: 'blockquote',
        content: content.length > 0 ? content : [{ type: 'paragraph' }],
      };
    }

    case 'list': {
      // SAFETY: node is narrowed by type discriminator to List
      const listNode = node as List;
      const items: JSONContent[] = [];
      for (const item of listNode.children) {
        const itemContent: JSONContent[] = [];
        for (const child of item.children) {
          const converted = convertBlockToProseMirror(child);
          if (converted) itemContent.push(converted);
        }
        items.push({
          type: 'listItem',
          content: itemContent.length > 0 ? itemContent : [{ type: 'paragraph' }],
        });
      }

      if (listNode.ordered) {
        return {
          type: 'orderedList',
          attrs: {
            start: listNode.start ?? 1,
          },
          content: items,
        };
      }

      return {
        type: 'bulletList',
        content: items,
      };
    }

    case 'code': {
      // SAFETY: node is narrowed by type discriminator to Code
      const codeNode = node as Code;
      if (codeNode.lang === 'mermaid') {
        return {
          type: 'mermaid',
          attrs: {
            code: codeNode.value,
          },
        };
      }

      return {
        type: 'codeBlock',
        attrs: {
          language: codeNode.lang ?? null,
        },
        content: codeNode.value.length > 0 ? [{ type: 'text', text: codeNode.value }] : undefined,
      };
    }

    case 'thematicBreak': {
      return { type: 'horizontalRule' };
    }

    case 'table': {
      // SAFETY: node is narrowed by type discriminator to Table
      const tableNode = node as Table;
      const rows: JSONContent[] = [];

      tableNode.children.forEach((rowNode: TableRow, rowIndex: number) => {
        const cellType = rowIndex === 0 ? 'tableHeader' : 'tableCell';
        const cells: JSONContent[] = [];

        rowNode.children.forEach((cellNode: TableCell) => {
          const cellPhrasing = convertPhrasingToProseMirror(cellNode.children);
          cells.push({
            type: cellType,
            attrs: {
              colspan: 1,
              rowspan: 1,
              colwidth: null,
            },
            content: [
              {
                type: 'paragraph',
                content: cellPhrasing.length > 0 ? cellPhrasing : undefined,
              },
            ],
          });
        });

        rows.push({
          type: 'tableRow',
          content: cells,
        });
      });

      return {
        type: 'table',
        attrs: {
          align: tableNode.align || [],
        },
        content: rows,
      };
    }

    case 'footnoteDefinition': {
      // SAFETY: node is narrowed by type discriminator to FootnoteDefinition
      const fnNode = node as FootnoteDefinition;
      const content: JSONContent[] = [];
      for (const child of fnNode.children) {
        const converted = convertBlockToProseMirror(child);
        if (converted) content.push(converted);
      }
      return {
        type: 'footnoteDefinition',
        attrs: {
          identifier: fnNode.identifier,
        },
        content: content.length > 0 ? content : [{ type: 'paragraph' }],
      };
    }

    case 'mdxJsxFlowElement':
    case 'mdxJsxTextElement': {
      // SAFETY: node is narrowed by type discriminator to MdxJsxFlowElement
      const jsxNode = node as MdxJsxFlowElement;
      const tagName = jsxNode.name;

      if (tagName === 'Callout') {
        const type = extractJsxAttribute(jsxNode.attributes, 'type') || 'info';
        const title = extractJsxAttribute(jsxNode.attributes, 'title') || '';
        const content: JSONContent[] = [];

        for (const child of jsxNode.children) {
          const converted = convertBlockToProseMirror(child);
          if (converted) content.push(converted);
        }

        return {
          type: 'callout',
          attrs: {
            type,
            title,
          },
          content: content.length > 0 ? content : [{ type: 'paragraph' }],
        };
      }

      if (tagName === 'PullQuote') {
        const quote = extractJsxAttribute(jsxNode.attributes, 'quote');
        const author = extractJsxAttribute(jsxNode.attributes, 'author');
        return {
          type: 'pullQuote',
          attrs: {
            quote,
            author,
          },
        };
      }

      if (tagName === 'Figure') {
        const src = extractJsxAttribute(jsxNode.attributes, 'src');
        const alt = extractJsxAttribute(jsxNode.attributes, 'alt');
        const caption = extractJsxAttribute(jsxNode.attributes, 'caption');
        const width = parseOptionalNumber(extractJsxAttribute(jsxNode.attributes, 'width'));
        const height = parseOptionalNumber(extractJsxAttribute(jsxNode.attributes, 'height'));

        return {
          type: 'figure',
          attrs: {
            src,
            alt,
            caption,
            width,
            height,
          },
        };
      }

      if (tagName === 'Mermaid') {
        const code = extractJsxAttribute(jsxNode.attributes, 'code');
        return {
          type: 'mermaid',
          attrs: {
            code,
          },
        };
      }

      // Unrecognized JSX element: if it has block children, convert them
      if (jsxNode.children && jsxNode.children.length > 0) {
        const content: JSONContent[] = [];
        for (const child of jsxNode.children) {
          const converted = convertBlockToProseMirror(child);
          if (converted) content.push(converted);
        }
        if (content.length > 0) {
          return {
            type: 'paragraph',
            content,
          };
        }
      }

      return null;
    }

    default:
      return null;
  }
}

/**
 * Converts an MDX/Markdown string into a ProseMirror JSONContent document.
 */
export function mdxToProseMirror(mdx: string): JSONContent {
  const trimmed = mdx.trim();
  if (trimmed.length === 0) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }

  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMdx);
  // SAFETY: unified parse produces mdast Root
  const tree = processor.parse(mdx) as Root;

  const content: JSONContent[] = [];
  for (const child of tree.children) {
    const converted = convertBlockToProseMirror(child);
    if (converted) {
      content.push(converted);
    }
  }

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph' }],
  };
}

/**
 * Converts a sequence of ProseMirror inline nodes into mdast PhrasingContent nodes.
 */
function convertInlineNodesToMdast(nodes: JSONContent[]): PhrasingContent[] {
  const result: PhrasingContent[] = [];
  let index = 0;

  while (index < nodes.length) {
    const node = nodes[index];
    if (!node) {
      index++;
      continue;
    }

    if (node.type === 'hardBreak') {
      result.push({ type: 'break' });
      index++;
      continue;
    }

    if (node.type === 'image') {
      const src = getStringAttr(node, 'src');
      const alt = getStringAttr(node, 'alt');
      const title = getStringAttr(node, 'title');
      result.push({ type: 'image', url: src, alt, title: title || null });
      index++;
      continue;
    }

    if (node.type === 'footnoteReference') {
      const identifier = getStringAttr(node, 'identifier', '1');
      result.push({ type: 'footnoteReference', identifier, label: identifier });
      index++;
      continue;
    }

    if (node.type === 'text') {
      const textVal = node.text || '';
      const marks = extractNodeMarks(node);

      if (marks.length === 0) {
        result.push({ type: 'text', value: textVal });
        index++;
        continue;
      }

      // Sort marks by canonical hierarchy
      const sortedMarks = [...marks].sort(
        (a, b) => MARK_HIERARCHY.indexOf(a.type) - MARK_HIERARCHY.indexOf(b.type)
      );
      const outerMark = sortedMarks[0];
      if (!outerMark) {
        result.push({ type: 'text', value: textVal });
        index++;
        continue;
      }

      if (outerMark.type === 'code') {
        result.push({ type: 'inlineCode', value: textVal });
        index++;
        continue;
      }

      // Group consecutive nodes that share outerMark
      const group: JSONContent[] = [];
      while (index < nodes.length) {
        const nextNode = nodes[index];
        if (!nextNode || nextNode.type !== 'text') break;

        const nextMarks = extractNodeMarks(nextNode);
        const matchingMark = nextMarks.find((m) => marksEqual(m, outerMark));
        if (!matchingMark) break;

        const remainingMarks = nextMarks.filter((m) => m !== matchingMark);
        group.push({ ...nextNode, marks: remainingMarks.length > 0 ? [...remainingMarks] : undefined });
        index++;
      }

      const innerChildren = convertInlineNodesToMdast(group);

      if (outerMark.type === 'link') {
        const safeUrl = sanitizeHref(outerMark.attrs?.href || '#');
        const title = outerMark.attrs?.title ?? null;
        result.push({
          type: 'link',
          url: safeUrl,
          title,
          children: innerChildren,
        });
      } else if (outerMark.type === 'strike') {
        result.push({ type: 'delete', children: innerChildren });
      } else if (outerMark.type === 'bold') {
        result.push({ type: 'strong', children: innerChildren });
      } else if (outerMark.type === 'italic') {
        result.push({ type: 'emphasis', children: innerChildren });
      }
      continue;
    }

    index++;
  }

  return result;
}

/**
 * Converts ProseMirror block nodes into mdast EditorialMdastNode nodes.
 */
function convertBlocksToMdast(nodes: JSONContent[]): EditorialBlock[] {
  const result: EditorialBlock[] = [];

  for (const node of nodes) {
    if (!node.type) continue;

    switch (node.type) {
      case 'heading': {
        const levelNum = getNumberAttr(node, 'level', 2);
        // SAFETY: depth clamped between 1 and 6 matches Heading depth
        const depth = Math.min(Math.max(levelNum, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
        const children = convertInlineNodesToMdast(node.content || []);
        result.push({
          type: 'heading',
          depth,
          children,
        });
        break;
      }

      case 'paragraph': {
        const children = convertInlineNodesToMdast(node.content || []);
        result.push({
          type: 'paragraph',
          children,
        });
        break;
      }

      case 'blockquote': {
        const children = convertBlocksToMdast(node.content || [{ type: 'paragraph' }]);
        result.push({
          type: 'blockquote',
          // SAFETY: EditorialBlock items conform to BlockContent | DefinitionContent
          children: children as Array<BlockContent | DefinitionContent>,
        });
        break;
      }

      case 'bulletList': {
        const items: ListItem[] = [];
        for (const item of node.content || []) {
          const itemBlocks = convertBlocksToMdast(item.content || [{ type: 'paragraph' }]);
          items.push({
            type: 'listItem',
            spread: false,
            // SAFETY: EditorialBlock items conform to BlockContent | DefinitionContent
            children: itemBlocks as Array<BlockContent | DefinitionContent>,
          });
        }
        result.push({
          type: 'list',
          ordered: false,
          spread: false,
          children: items,
        });
        break;
      }

      case 'orderedList': {
        const items: ListItem[] = [];
        const start = getNumberAttr(node, 'start', 1);
        for (const item of node.content || []) {
          const itemBlocks = convertBlocksToMdast(item.content || [{ type: 'paragraph' }]);
          items.push({
            type: 'listItem',
            spread: false,
            // SAFETY: EditorialBlock items conform to BlockContent | DefinitionContent
            children: itemBlocks as Array<BlockContent | DefinitionContent>,
          });
        }
        result.push({
          type: 'list',
          ordered: true,
          start,
          spread: false,
          children: items,
        });
        break;
      }

      case 'codeBlock': {
        const lang = getStringAttr(node, 'language', '') || null;
        const textValue = (node.content || []).map((c) => c.text || '').join('');
        result.push({
          type: 'code',
          lang,
          meta: null,
          value: textValue,
        });
        break;
      }

      case 'horizontalRule': {
        result.push({ type: 'thematicBreak' });
        break;
      }

      case 'table': {
        const rows: TableRow[] = [];
        const tableContent = node.content || [];

        for (const rowNode of tableContent) {
          const cells: TableCell[] = [];
          for (const cellNode of rowNode.content || []) {
            // Flatten block children in table cell to phrasing content
            const phrasingChildren: PhrasingContent[] = [];
            for (const cellBlock of cellNode.content || []) {
              phrasingChildren.push(...convertInlineNodesToMdast(cellBlock.content || []));
            }
            cells.push({
              type: 'tableCell',
              children: phrasingChildren,
            });
          }
          rows.push({
            type: 'tableRow',
            children: cells,
          });
        }

        const alignAttrs = node.attrs?.align;
        const columnCount = rows[0]?.children.length || 0;
        const align: ('left' | 'right' | 'center' | null)[] = [];
        for (let i = 0; i < columnCount; i++) {
          const val = Array.isArray(alignAttrs) ? alignAttrs[i] : null;
          if (val === 'left' || val === 'right' || val === 'center') {
            align.push(val);
          } else {
            align.push(null);
          }
        }

        result.push({
          type: 'table',
          align,
          children: rows,
        });
        break;
      }

      case 'footnoteDefinition': {
        const identifier = getStringAttr(node, 'identifier', '1');
        const children = convertBlocksToMdast(node.content || [{ type: 'paragraph' }]);
        result.push({
          type: 'footnoteDefinition',
          identifier,
          label: identifier,
          // SAFETY: EditorialBlock items conform to BlockContent | DefinitionContent
          children: children as Array<BlockContent | DefinitionContent>,
        });
        break;
      }

      case 'callout': {
        const calloutType = getStringAttr(node, 'type', 'info');
        const title = getStringAttr(node, 'title', '');
        const children = convertBlocksToMdast(node.content || [{ type: 'paragraph' }]);

        const jsxCallout: MdxJsxFlowElement = {
          type: 'mdxJsxFlowElement',
          name: 'Callout',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'type', value: calloutType },
            { type: 'mdxJsxAttribute', name: 'title', value: title },
          ],
          // SAFETY: EditorialBlock items conform to BlockContent | DefinitionContent
          children: children as Array<BlockContent | DefinitionContent>,
        };
        result.push(jsxCallout);
        break;
      }

      case 'pullQuote': {
        const quote = getStringAttr(node, 'quote', '');
        const author = getStringAttr(node, 'author', '');

        const jsxPullQuote: MdxJsxFlowElement = {
          type: 'mdxJsxFlowElement',
          name: 'PullQuote',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'quote', value: quote },
            { type: 'mdxJsxAttribute', name: 'author', value: author },
          ],
          children: [],
        };
        result.push(jsxPullQuote);
        break;
      }

      case 'figure': {
        const src = getStringAttr(node, 'src', '');
        const alt = getStringAttr(node, 'alt', '');
        const caption = getStringAttr(node, 'caption', '');
        const widthVal = node.attrs?.width;
        const heightVal = node.attrs?.height;
        const width = Number.isFinite(widthVal) ? String(widthVal) : null;
        const height = Number.isFinite(heightVal) ? String(heightVal) : null;

        const attributes: MdxJsxAttribute[] = [
          { type: 'mdxJsxAttribute', name: 'src', value: src },
          { type: 'mdxJsxAttribute', name: 'alt', value: alt },
          { type: 'mdxJsxAttribute', name: 'caption', value: caption },
        ];
        if (width) {
          attributes.push({ type: 'mdxJsxAttribute', name: 'width', value: width });
        }
        if (height) {
          attributes.push({ type: 'mdxJsxAttribute', name: 'height', value: height });
        }

        const jsxFigure: MdxJsxFlowElement = {
          type: 'mdxJsxFlowElement',
          name: 'Figure',
          attributes,
          children: [],
        };
        result.push(jsxFigure);
        break;
      }

      case 'mermaid': {
        const code = getStringAttr(node, 'code', '').trim();
        result.push({
          type: 'code',
          lang: 'mermaid',
          meta: null,
          value: code,
        });
        break;
      }

      default:
        break;
    }
  }

  return result;
}

/**
 * Converts a ProseMirror JSONContent document back into normalized MDX.
 */
export function proseMirrorToMdx(doc: JSONContent): string {
  if (!doc || !doc.content || doc.content.length === 0) {
    return '';
  }

  // If the document contains only a single empty paragraph, serialize to empty string
  if (
    doc.content.length === 1 &&
    doc.content[0]?.type === 'paragraph' &&
    (!doc.content[0]?.content || doc.content[0].content.length === 0)
  ) {
    return '';
  }

  const children = convertBlocksToMdast(doc.content);
  const root: Root = {
    type: 'root',
    // SAFETY: EditorialMdastNode[] conforms to RootContent[]
    children: children as RootContent[],
  };

  const serialized = toMarkdown(root, {
    extensions: [gfmToMarkdown(), mdxToMarkdown()],
  });

  return serialized.trimEnd() + '\n';
}

const BLOCK_TAGS = new Set([
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'P',
  'UL',
  'OL',
  'LI',
  'BLOCKQUOTE',
  'TABLE',
  'TR',
  'TH',
  'TD',
  'PRE',
  'HR',
]);

function hasBlockDescendant(element: Element): boolean {
  for (const child of element.children) {
    if (BLOCK_TAGS.has(child.tagName.toUpperCase())) return true;
    if (hasBlockDescendant(child)) return true;
  }
  return false;
}

function parseDomInline(node: Node, marks: readonly EditorMark[] = []): JSONContent[] {
  if (node.nodeType === 3) {
    const text = node.nodeValue || '';
    if (text.length === 0) return [];
    return [{ type: 'text', text, marks: marks.length > 0 ? [...marks] : undefined }];
  }
  if (node.nodeType !== 1) return [];

  // SAFETY: node is an element node because nodeType is 1
  const element = node as Element;
  const tag = element.tagName.toUpperCase();
  const currentMarks = [...marks];

  if (tag === 'STRONG' || tag === 'B') {
    const style = (element.getAttribute('style') || '').toLowerCase();
    if (!style.includes('font-weight:normal') && !style.includes('font-weight: normal')) {
      currentMarks.push({ type: 'bold' });
    }
  } else if (tag === 'EM' || tag === 'I') {
    currentMarks.push({ type: 'italic' });
  } else if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL') {
    currentMarks.push({ type: 'strike' });
  } else if (tag === 'CODE') {
    currentMarks.push({ type: 'code' });
  } else if (tag === 'A') {
    const rawHref = element.getAttribute('href') || '#';
    currentMarks.push({ type: 'link', attrs: { href: sanitizeHref(rawHref) } });
  } else if (tag === 'SPAN') {
    const style = (element.getAttribute('style') || '').toLowerCase();
    if (
      style.includes('font-weight:700') ||
      style.includes('font-weight: 700') ||
      style.includes('font-weight:bold') ||
      style.includes('font-weight: bold')
    ) {
      currentMarks.push({ type: 'bold' });
    }
    if (style.includes('font-style:italic') || style.includes('font-style: italic')) {
      currentMarks.push({ type: 'italic' });
    }
    if (style.includes('line-through')) {
      currentMarks.push({ type: 'strike' });
    }
  }

  const result: JSONContent[] = [];
  for (const child of element.childNodes) {
    result.push(...parseDomInline(child, currentMarks));
  }
  return result;
}

function parseDomBlock(element: Element): JSONContent[] {
  const tag = element.tagName.toUpperCase();

  if (tag === 'H1' || tag === 'H2') {
    return [{ type: 'heading', attrs: { level: 2 }, content: parseDomInline(element) }];
  }
  if (tag === 'H3') {
    return [{ type: 'heading', attrs: { level: 3 }, content: parseDomInline(element) }];
  }
  if (tag === 'H4' || tag === 'H5' || tag === 'H6') {
    return [{ type: 'heading', attrs: { level: 4 }, content: parseDomInline(element) }];
  }
  if (tag === 'P') {
    return [{ type: 'paragraph', content: parseDomInline(element) }];
  }
  if (tag === 'BLOCKQUOTE') {
    const innerBlocks: JSONContent[] = [];
    for (const child of element.children) {
      innerBlocks.push(...parseDomBlock(child));
    }
    return [{ type: 'blockquote', content: innerBlocks.length > 0 ? innerBlocks : [{ type: 'paragraph' }] }];
  }
  if (tag === 'UL') {
    const items: JSONContent[] = [];
    for (const li of element.children) {
      if (li.tagName.toUpperCase() === 'LI') {
        const liBlocks: JSONContent[] = [];
        if (hasBlockDescendant(li)) {
          for (const child of li.children) {
            liBlocks.push(...parseDomBlock(child));
          }
        } else {
          liBlocks.push({ type: 'paragraph', content: parseDomInline(li) });
        }
        items.push({ type: 'listItem', content: liBlocks.length > 0 ? liBlocks : [{ type: 'paragraph' }] });
      }
    }
    return [{ type: 'bulletList', content: items }];
  }
  if (tag === 'OL') {
    const items: JSONContent[] = [];
    for (const li of element.children) {
      if (li.tagName.toUpperCase() === 'LI') {
        const liBlocks: JSONContent[] = [];
        if (hasBlockDescendant(li)) {
          for (const child of li.children) {
            liBlocks.push(...parseDomBlock(child));
          }
        } else {
          liBlocks.push({ type: 'paragraph', content: parseDomInline(li) });
        }
        items.push({ type: 'listItem', content: liBlocks.length > 0 ? liBlocks : [{ type: 'paragraph' }] });
      }
    }
    return [{ type: 'orderedList', attrs: { start: 1 }, content: items }];
  }
  if (tag === 'TABLE') {
    const rows: JSONContent[] = [];
    const trElements = element.querySelectorAll('tr');
    for (const tr of trElements) {
      const cells: JSONContent[] = [];
      for (const cell of tr.children) {
        const isHeader = cell.tagName.toUpperCase() === 'TH';
        cells.push({
          type: isHeader ? 'tableHeader' : 'tableCell',
          content: [{ type: 'paragraph', content: parseDomInline(cell) }],
        });
      }
      rows.push({ type: 'tableRow', content: cells });
    }
    return [{ type: 'table', content: rows }];
  }
  if (tag === 'PRE') {
    return [{ type: 'codeBlock', content: [{ type: 'text', text: element.textContent || '' }] }];
  }
  if (tag === 'HR') {
    return [{ type: 'horizontalRule' }];
  }

  // Wrapper tag (e.g. B, DIV, BODY)
  if (hasBlockDescendant(element)) {
    const result: JSONContent[] = [];
    for (const child of element.children) {
      result.push(...parseDomBlock(child));
    }
    return result;
  }

  // Pure inline container
  const inline = parseDomInline(element);
  if (inline.length > 0) {
    return [{ type: 'paragraph', content: inline }];
  }
  return [];
}

/**
 * Sanitizes pasted external HTML (e.g. from Google Docs, Word, or web pages)
 * down to the allowed ProseMirror schema, stripping unwanted styles, colors,
 * fonts, and disallowed tags.
 */
export function sanitizePastedHtml(html: string): JSONContent {
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, 'text/html');

  // Strip all forbidden tags along with their inner content
  const forbidden = dom.querySelectorAll(
    'script, style, button, input, form, select, textarea, svg, canvas, iframe, object, embed, applet'
  );
  for (const el of forbidden) {
    el.remove();
  }

  // SAFETY: dom.body is HTMLBodyElement matching Element
  const blocks = parseDomBlock(dom.body as Element);

  return {
    type: 'doc',
    content: blocks.length > 0 ? blocks : [{ type: 'paragraph' }],
  };
}

/**
 * Returns a cleaned HTML string stripping styles, fonts, and forbidden attributes.
 */
export function cleanExternalHtml(html: string): string {
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');

  cleaned = cleaned.replace(/\s+(?:style|class|id|dir|lang)="[^"]*"/gi, '');
  return cleaned;
}
