import { describe, it, expect } from 'vitest';
import { ContentPublisher } from './publisher';

describe('Atomic Content Publishing Pipeline (Fable TDD)', () => {
  it('publishes valid article atomically producing 3 synchronized derivatives and an immutable revision', async () => {
    const publisher = new ContentPublisher();

    const mdx = `
# معمارية خطوط النشر الحتمية

القراءة ليست مجرد إدراك بصري للرموز.

<Callout type="tip" title="نصيحة أداء">
استخدم دائماً التوليد الحتمي للمشتقات على الخادم.
</Callout>

\`\`\`typescript
const version = "1.0.0";
\`\`\`
    `.trim();

    const articleData = {
      id: 'art-001',
      slug: 'deterministic-publishing-pipelines',
      title: 'معمارية خطوط النشر الحتمية',
      excerpt: 'القراءة ليست مجرد إدراك بصري للرموز.',
      authorName: 'ممدوح أبو عمار',
      visibility: 'FREE' as const,
    };

    const result = await publisher.publishArticle(articleData, mdx);

    expect(result.success).toBe(true);
    expect(result.revisionNumber).toBe(1);
    expect(result.derivatives.richHtml).toContain('editorial-callout');
    expect(result.derivatives.markdown).toContain('> [!tip] نصيحة أداء');
    expect(result.derivatives.plainText).toContain('[تنبيه: نصيحة أداء]');
  });

  it('rejects publication when MDX validation fails due to malicious tags', async () => {
    const publisher = new ContentPublisher();
    const maliciousMdx = '# عنوان المقال\n<script>alert("hacked")</script>';

    const articleData = {
      id: 'art-002',
      slug: 'malicious-article',
      title: 'مقال خبيث',
      excerpt: 'محاولة اختراق',
      authorName: 'ممدوح أبو عمار',
      visibility: 'FREE' as const,
    };

    const result = await publisher.publishArticle(articleData, maliciousMdx);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Forbidden HTML tag');
  });
});
