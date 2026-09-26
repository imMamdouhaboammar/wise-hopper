import { describe, it, expect } from 'vitest';
import { mdxToProseMirror, proseMirrorToMdx } from './mdx-bridge';
import { compileRichHtml, toPascalCase, renderIconSvg } from '../content/compiler';
import { CURATED_ICONS } from '@/components/studio/editor/icon-picker-modal';

describe('Icon & SVG Studio & Viewer Support (Fable TDD)', () => {
  describe('toPascalCase helper', () => {
    it('normalizes various casing formats to PascalCase', () => {
      expect(toPascalCase('sparkles')).toBe('Sparkles');
      expect(toPascalCase('book-open')).toBe('BookOpen');
      expect(toPascalCase('lucide:check-circle')).toBe('CheckCircle');
      expect(toPascalCase('cpu')).toBe('Cpu');
      expect(toPascalCase('arrow_left')).toBe('ArrowLeft');
    });
  });

  describe('renderIconSvg helper', () => {
    it('renders inline SVG markup with editorial-icon class and accessibility attributes', () => {
      const svg = renderIconSvg('Sparkles', 22, 'text-primary');
      expect(svg).toContain('<svg');
      expect(svg).toContain('editorial-icon');
      expect(svg).toContain('text-primary');
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('viewBox');
    });

    it('falls back gracefully to Sparkles icon when unknown icon name is supplied', () => {
      const svg = renderIconSvg('NonExistentIconName123');
      expect(svg).toContain('<svg');
      expect(svg).toContain('editorial-icon');
    });
  });

  describe('MDX ⇄ ProseMirror Round-Trip for Icons', () => {
    it('converts inline <Icon> JSX into ProseMirror icon node', () => {
      const mdx = 'بداية النص <Icon name="Sparkles" /> ونهايته.\n';
      const pm = mdxToProseMirror(mdx);

      expect(pm.type).toBe('doc');
      const paragraph = pm.content?.[0];
      expect(paragraph?.type).toBe('paragraph');

      const iconNode = paragraph?.content?.find((node) => node.type === 'icon');
      expect(iconNode).toBeDefined();
      expect(iconNode?.attrs?.name).toBe('Sparkles');
      expect(iconNode?.attrs?.size).toBe(18);
    });

    it('converts block-level <Icon> JSX into ProseMirror document', () => {
      const mdx = '<Icon name="BookOpen" size="24" />\n';
      const pm = mdxToProseMirror(mdx);

      const paragraph = pm.content?.[0];
      const iconNode = paragraph?.content?.find((node) => node.type === 'icon');
      expect(iconNode).toBeDefined();
      expect(iconNode?.attrs?.name).toBe('BookOpen');
      expect(iconNode?.attrs?.size).toBe(24);
    });

    it('serializes ProseMirror icon node back to clean MDX JSX', () => {
      const pmDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'نص تحريري مع ' },
              {
                type: 'icon',
                attrs: {
                  name: 'Flame',
                  size: 20,
                },
              },
              { type: 'text', text: ' شعلة متقدة.' },
            ],
          },
        ],
      };

      const mdx = proseMirrorToMdx(pmDoc);
      expect(mdx).toContain('<Icon name="Flame" size="20" />');
    });

    it('achieves complete round-trip stability MDX -> ProseMirror -> MDX', () => {
      const originalMdx = '# مقال باللغة العربية\n\nنص تحريري يتضمن <Icon name="Sparkles" /> ورمز آخر <Icon name="Heart" size="22" /> في نفس الفقرة.\n';
      const pm = mdxToProseMirror(originalMdx);
      const roundTrippedMdx = proseMirrorToMdx(pm);

      expect(roundTrippedMdx).toContain('<Icon name="Sparkles" />');
      expect(roundTrippedMdx).toContain('<Icon name="Heart" size="22" />');
      expect(roundTrippedMdx).toContain('مقال باللغة العربية');
    });
  });

  describe('Curated Icons Catalog Completeness', () => {
    it('contains comprehensive categories and verified Arabic metadata', () => {
      expect(CURATED_ICONS.length).toBeGreaterThan(20);

      for (const item of CURATED_ICONS) {
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.arabicLabel.length).toBeGreaterThan(0);
        expect(['editorial', 'tech', 'status', 'arrows', 'common']).toContain(item.category);
        expect(item.keywords.length).toBeGreaterThan(0);
      }
    });

    it('contains key Arabic search keywords for common terms', () => {
      const searchTerms = ['نجمة', 'كتاب', 'كود', 'صح', 'سهم', 'بحث'];
      for (const term of searchTerms) {
        const matching = CURATED_ICONS.filter(
          (i) => i.arabicLabel.includes(term) || i.keywords.some((k) => k.includes(term))
        );
        expect(matching.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Server-Side Rich HTML Compilation', () => {
    it('compiles full article with multiple icons into accessible responsive HTML', async () => {
      const source = `## فقرة الأيقونات\n\nاستخدام <Icon name="Terminal" size="16" /> في الأكواد و <Icon name="CheckCircle" size="20" /> في التأكيدات.\n`;
      const html = await compileRichHtml(source);

      expect(html).toContain('editorial-icon');
      expect(html).toContain('<svg');
      expect(html).toContain('viewBox="0 0 24 24"');
      expect(html).toContain('aria-hidden="true"');
      expect(html).not.toContain('<script');
    });
  });
});
