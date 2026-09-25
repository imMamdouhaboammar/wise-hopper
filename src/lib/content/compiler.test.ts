import { describe, it, expect } from 'vitest';
import {
  compileRichHtml,
  compileNormalizedMarkdown,
  compilePlainText,
  validateMdxContent,
  type ContentMetadata,
} from './compiler';

describe('Unified Content 3-Derivative Compiler (Fable TDD)', () => {
  const sampleMdx = `# مستقبل النشر الرقمي العربي

تعتبر تجربة القراءة الهادئة جوهر التواصل المعرفي على الويب الحديث.

<Callout type="info" title="ملاحظة معمارية">
الاعتماد على نظام المشتقات الثلاث يمنع انحراف المحتوى بشكل كامل.
</Callout>

## الخطوط والأداء

الحرف العربي يحتاج إلى مساحات تنفس كافية.

<PullQuote quote="التصميم ليس ما يبدو، بل كيف يعمل في يد القارئ" author="ستيف جوبز" />

\`\`\`javascript
const siteName = "wise-hopper";
console.log(siteName);
\`\`\`

\`\`\`mermaid
graph TD
  A[البداية] --> B[النشر]
\`\`\`
`;

  const metadata: ContentMetadata = {
    title: 'مستقبل النشر الرقمي العربي',
    authorName: 'ممدوح أبو عمار',
    publishedAt: '2026-09-25T12:00:00Z',
    excerpt: 'تعتبر تجربة القراءة الهادئة جوهر التواصل المعرفي.',
  };

  describe('Validation & Security Allowlist', () => {
    it('accepts valid MDX with approved editorial tags', () => {
      const result = validateMdxContent(sampleMdx);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects malicious script tags and inline handlers', () => {
      const malicious = `${sampleMdx}\n<script>alert("xss")</script>`;
      const result = validateMdxContent(malicious);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes('script'))).toBe(true);
    });

    it('rejects unapproved JSX tags', () => {
      const malicious = `${sampleMdx}\n<MaliciousComponent />`;
      const result = validateMdxContent(malicious);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes('MaliciousComponent'))).toBe(true);
    });
  });

  describe('Derivative 1: Rich HTML', () => {
    it('generates server-rendered semantic HTML with custom editorial elements', async () => {
      const html = await compileRichHtml(sampleMdx);
      expect(html).toContain('<h1');
      expect(html).toContain('مستقبل النشر الرقمي العربي');
      expect(html).toContain('editorial-callout');
      expect(html).toContain('ملاحظة معمارية');
      expect(html).toContain('editorial-pullquote');
      expect(html).toContain('editorial-mermaid');
      expect(html).toContain('data-mermaid');
    });
  });

  describe('Derivative 2: Normalized Markdown', () => {
    it('generates clean CommonMark preserving semantics of custom blocks', async () => {
      const markdown = await compileNormalizedMarkdown(sampleMdx);
      expect(markdown).toContain('# مستقبل النشر الرقمي العربي');
      expect(markdown).toContain('> [!info] ملاحظة معمارية');
      expect(markdown).toContain('> "التصميم ليس ما يبدو، بل كيف يعمل في يد القارئ" — ستيف جوبز');
      expect(markdown).toContain('```javascript');
      expect(markdown).toContain('```mermaid');
    });
  });

  describe('Derivative 3: Plain UTF-8 Text', () => {
    it('generates clean text preserving metadata, headings, and diagram descriptions', async () => {
      const text = await compilePlainText(sampleMdx, metadata);
      expect(text).toContain('مستقبل النشر الرقمي العربي');
      expect(text).toContain('الكاتب: ممدوح أبو عمار');
      expect(text).toContain('تاريخ النشر: 2026-09-25');
      expect(text).toContain('[تنبيه: ملاحظة معمارية]');
      expect(text).toContain('[اقتباس: "التصميم ليس ما يبدو، بل كيف يعمل في يد القارئ" — ستيف جوبز]');
      expect(text).toContain('[رسم تخطيطي: مخطط سير البيانات]');
      // Must not contain raw html tags
      expect(text).not.toContain('<div');
      expect(text).not.toContain('<h1');
      expect(text).not.toContain('```');
    });
  });
});
