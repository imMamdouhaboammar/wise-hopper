import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { compileRichHtml } from '../content/compiler';
import { SEED_ARTICLES } from '../data/article-service';
import {
  mdxToProseMirror,
  proseMirrorToMdx,
  sanitizePastedHtml,
  cleanExternalHtml,
} from './mdx-bridge';
import type { JSONContent } from '@tiptap/core';

const FIXTURES_DIR = join(process.cwd(), 'src/lib/editor/__fixtures__');

describe('MDX ⇄ ProseMirror Bridge (Fable TDD Round-Trip)', () => {
  describe('Seed Articles Round-Trip and Compiler Equivalence', () => {
    for (const article of SEED_ARTICLES) {
      it(`preserves compileRichHtml and achieves stability for seed article "${article.slug}"`, async () => {
        const originalMdx = article.revision.mdx_source;

        // Pass 1: original -> ProseMirror doc -> normalized MDX
        const doc1 = mdxToProseMirror(originalMdx);
        const norm1 = proseMirrorToMdx(doc1);

        // Pass 2: normalized MDX -> ProseMirror doc -> MDX
        const doc2 = mdxToProseMirror(norm1);
        const norm2 = proseMirrorToMdx(doc2);

        // Guarantee 1: Idempotence (stability after one normalization pass)
        expect(norm2).toBe(norm1);

        // Guarantee 2: Compiler rich HTML equivalence between original and round-tripped
        const htmlOriginal = await compileRichHtml(originalMdx);
        const htmlRoundTripped = await compileRichHtml(norm1);

        expect(htmlRoundTripped).toBe(htmlOriginal);
      });
    }
  });

  describe('Fixtures Round-Trip and Compiler Equivalence', () => {
    const fixtureFiles = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.mdx'));

    expect(fixtureFiles.length).toBeGreaterThanOrEqual(11);

    for (const fileName of fixtureFiles) {
      it(`preserves compileRichHtml and achieves stability for fixture "${fileName}"`, async () => {
        const fixturePath = join(FIXTURES_DIR, fileName);
        const originalMdx = readFileSync(fixturePath, 'utf8');

        // Pass 1: original -> ProseMirror doc -> normalized MDX
        const doc1 = mdxToProseMirror(originalMdx);
        const norm1 = proseMirrorToMdx(doc1);

        // Pass 2: normalized MDX -> ProseMirror doc -> MDX
        const doc2 = mdxToProseMirror(norm1);
        const norm2 = proseMirrorToMdx(doc2);

        // Guarantee 1: Stability after one normalization pass
        expect(norm2).toBe(norm1);

        // Guarantee 2: Rich HTML equivalence
        const htmlOriginal = await compileRichHtml(originalMdx);
        const htmlRoundTripped = await compileRichHtml(norm1);

        expect(htmlRoundTripped).toBe(htmlOriginal);
      });
    }
  });

  describe('Arabic Typography & Punctuation Preservation', () => {
    it('preserves Arabic tashkeel (vocalization marks) and Arabic punctuation exactly', () => {
      const arabicSource = 'الْمَعْرِفَةُ قُوَّةٌ؛ فَهَلْ نُدْرِكُ قِيمَتَهَا، وَكَيْفَ نَبْنِيهَا؟\n';
      const doc = mdxToProseMirror(arabicSource);
      const output = proseMirrorToMdx(doc);

      expect(output).toBe(arabicSource);
    });
  });

  describe('Paste Sanitization', () => {
    const googleDocsHtml = readFileSync(join(FIXTURES_DIR, 'google-docs-paste.html'), 'utf8');

    it('sanitizes external Google Docs HTML down to allowlisted schema only', () => {
      const doc = sanitizePastedHtml(googleDocsHtml);

      expect(doc.type).toBe('doc');
      expect(doc.content).toBeDefined();

      const ALLOWED_NODE_TYPES = new Set([
        'doc',
        'paragraph',
        'heading',
        'bulletList',
        'orderedList',
        'listItem',
        'blockquote',
        'codeBlock',
        'horizontalRule',
        'table',
        'tableRow',
        'tableHeader',
        'tableCell',
        'footnoteDefinition',
        'footnoteReference',
        'callout',
        'pullQuote',
        'figure',
        'mermaid',
        'text',
        'hardBreak',
        'image',
      ]);

      function assertAllowedNodes(node: JSONContent) {
        if (node.type) {
          expect(ALLOWED_NODE_TYPES.has(node.type)).toBe(true);
        }
        if (node.content && Array.isArray(node.content)) {
          for (const child of node.content) {
            assertAllowedNodes(child);
          }
        }
      }

      assertAllowedNodes(doc);

      // Verify that malicious script, style, and button were completely removed
      const docJsonString = JSON.stringify(doc);
      expect(docJsonString).not.toContain('maliciousPayload');
      expect(docJsonString).not.toContain('hidden-injection');
      expect(docJsonString).not.toContain('زر غير مسموح به');
      expect(docJsonString).not.toContain('alert');

      // Verify H1 was downgraded to H2
      const firstHeading = doc.content?.find((c) => c.type === 'heading');
      expect(firstHeading?.attrs?.level).toBe(2);

      // Verify cleanExternalHtml strips styles and scripts
      const cleanedHtml = cleanExternalHtml(googleDocsHtml);
      expect(cleanedHtml).not.toContain('style=');
      expect(cleanedHtml).not.toContain('<script');
      expect(cleanedHtml).not.toContain('<style');
    });
  });

  describe('Security and Edge Cases', () => {
    it('disallows unsafe link protocols like javascript:', () => {
      const unsafeMdx = '[اختبار خبيث](javascript:alert("xss"))';
      const doc = mdxToProseMirror(unsafeMdx);
      const textNode = doc.content?.[0]?.content?.[0];
      const linkMark = textNode?.marks?.find((m) => m.type === 'link');

      expect(linkMark?.attrs?.href).toBe('#');
    });

    it('returns empty string for empty or whitespace-only documents', () => {
      const emptyDoc: JSONContent = {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      };
      expect(proseMirrorToMdx(emptyDoc)).toBe('');

      const emptyMdx = mdxToProseMirror('   \n  ');
      expect(emptyMdx.content).toBeDefined();
      expect(proseMirrorToMdx(emptyMdx)).toBe('');
    });
  });
});
