import { describe, it, expect } from 'vitest';
import {
  generateWebSiteSchema,
  generatePersonSchema,
  generateArticleSchema,
  auditSeoMetadata,
} from './seo-engine';

describe('Technical SEO & Structured Data Engine (Fable TDD)', () => {
  const author = {
    name: 'ممدوح أبو عمار',
    bio: 'مهندس برمجيات وكاتب تقني',
    avatarUrl: 'https://example.com/avatar.jpg',
    url: 'https://wisehopper.dev/about',
  };

  const sampleArticle = {
    title: 'بيان في هندسة الخط والطباعة العربية على الويب الحديث',
    excerpt: 'تحليل معمق لهندسة المقروئية العربية والخطوط التحريرية.',
    slug: 'arabic-web-typography-manifesto',
    publishedAt: '2026-09-25T12:00:00Z',
    updatedAt: '2026-09-25T14:00:00Z',
    coverImageUrl: 'https://example.com/cover.jpg',
    visibility: 'FREE' as const,
  };

  describe('JSON-LD Generators', () => {
    it('generates valid WebSite schema', () => {
      const schema = generateWebSiteSchema('https://wisehopper.dev');
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.inLanguage).toBe('ar');
    });

    it('generates valid Person schema for author', () => {
      const schema = generatePersonSchema(author);
      expect(schema['@type']).toBe('Person');
      expect(schema.name).toBe('ممدوح أبو عمار');
      expect(schema.jobTitle).toBeDefined();
    });

    it('generates valid BlogPosting schema for free article', () => {
      const schema = generateArticleSchema(
        sampleArticle,
        author,
        'https://wisehopper.dev/articles/arabic-web-typography-manifesto'
      );
      expect(schema['@type']).toBe('BlogPosting');
      expect(schema.headline).toBe(sampleArticle.title);
      expect(schema.isAccessibleForFree).toBe(true);
      expect(schema.hasPart).toBeUndefined();
    });

    it('generates compliant paywall schema for premium article', () => {
      const premiumArticle = {
        ...sampleArticle,
        visibility: 'PREMIUM' as const,
      };
      const schema = generateArticleSchema(
        premiumArticle,
        author,
        'https://wisehopper.dev/articles/premium-article'
      );
      expect(schema.isAccessibleForFree).toBe(false);
      expect(schema.hasPart).toBeDefined();
      expect(schema.hasPart?.isAccessibleForFree).toBe(false);
      expect(schema.hasPart?.cssSelector).toBe('.premium-content-barrier');
    });
  });

  describe('Studio SEO Audit Engine', () => {
    it('flags missing meta descriptions and short titles', () => {
      const audit = auditSeoMetadata({
        title: 'قصير',
        description: '',
        contentMdx: '# عنوان\nنص المقال هنا دون صور.',
      });

      expect(audit.isClean).toBe(false);
      expect(audit.warnings.some((w) => w.id === 'title_length')).toBe(true);
      expect(audit.warnings.some((w) => w.id === 'description_missing')).toBe(true);
    });

    it('flags images without descriptive alt attributes', () => {
      const mdxWithEmptyAlt = '# عنوان\n![ ](https://example.com/img.jpg)\nنص المقال.';
      const audit = auditSeoMetadata({
        title: 'عنوان طويل ومناسب جداً لمحركات البحث والقارئ العربي',
        description: 'هذا وصف تعريفي للمقالة يحتوي على عدد مناسب من الأحرف والكلمات لتحقيق معايير الأرشفة الجيدة على الويب.',
        contentMdx: mdxWithEmptyAlt,
      });

      expect(audit.warnings.some((w) => w.id === 'image_missing_alt')).toBe(true);
    });

    it('passes clean audit when all criteria are satisfied', () => {
      const validMdx = `
# عنوان رئيسي
فقرة تمهيدية للمقال العربي.
## عنوان فرعي أول
محتوى مفصل.
![رسم توضيحي دقيق](https://example.com/chart.png)
`;
      const audit = auditSeoMetadata({
        title: 'بيان في هندسة الخط والطباعة العربية على الويب الحديث',
        description: 'تحليل معمق لهندسة المقروئية العربية، الخطوط التحريرية، والخصائص المنطقية في لغة التنسيق الانسيابية على الويب المعاصر.',
        contentMdx: validMdx,
      });

      expect(audit.warnings).toHaveLength(0);
      expect(audit.isClean).toBe(true);
    });
  });
});
