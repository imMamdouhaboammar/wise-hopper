import { describe, it, expect, beforeEach } from 'vitest';
import { SeedArticleRepository } from './seed-article-repository';
import { VersionConflictError } from './article-repository';

describe('Phase 1: ArticleRepository & Data Layer (Fable TDD)', () => {
  let repo: SeedArticleRepository;

  beforeEach(() => {
    repo = new SeedArticleRepository();
  });

  describe('Public Reader Boundary (Published Revisions Only)', () => {
    it('returns only published articles and never leaks drafts or archived items', async () => {
      // Create a draft and an archived article
      await repo.saveDraft({
        title: 'مسودة قيد الكتابة',
        slug: 'in-progress-draft',
        excerpt: 'مقتطف المسودة',
        draftMdxSource: '# مسودة سرية',
      });

      const published = await repo.getPublishedArticles();
      expect(published.length).toBeGreaterThan(0);
      for (const article of published) {
        expect(article.status).toBe('PUBLISHED');
        expect(article.slug).not.toBe('in-progress-draft');
      }
    });

    it('retrieves published article by slug with its latest revision', async () => {
      const article = await repo.getPublishedArticleBySlug('arabic-web-typography-manifesto');
      expect(article).not.toBeNull();
      expect(article?.status).toBe('PUBLISHED');
      expect(article?.revision).toBeDefined();
      expect(article?.revision.rich_html).toBeDefined();
    });

    it('returns null for unpublished article slug on public reader query', async () => {
      const draft = await repo.saveDraft({
        title: 'مسودة أخرى',
        slug: 'secret-draft',
        excerpt: 'مقتطف',
        draftMdxSource: '# سر',
      });

      const result = await repo.getPublishedArticleBySlug(draft.slug);
      expect(result).toBeNull();
    });
  });

  describe('Studio Dashboard Metrics & Aggregations', () => {
    it('accurately computes counts for drafts, scheduled, published, premium, archived', async () => {
      const counts = await repo.getArticleCounts();
      expect(counts.published).toBeGreaterThanOrEqual(1);
      expect(counts.premium).toBeGreaterThanOrEqual(1);
      expect(counts.drafts).toBeGreaterThanOrEqual(0);
      expect(counts.scheduled).toBeGreaterThanOrEqual(0);
      expect(counts.archived).toBeGreaterThanOrEqual(0);
    });

    it('returns the 5 most recently edited articles for studio dashboard', async () => {
      const recent = await repo.getRecentStudioArticles(5);
      expect(recent.length).toBeLessThanOrEqual(5);
      for (let i = 0; i < recent.length - 1; i++) {
        const d1 = new Date(recent[i].updated_at).getTime();
        const d2 = new Date(recent[i + 1].updated_at).getTime();
        expect(d1).toBeGreaterThanOrEqual(d2);
      }
    });
  });

  describe('Optimistic Locking & Concurrency Control', () => {
    it('successfully saves draft when expectedVersion matches article version', async () => {
      const draft = await repo.saveDraft({
        title: 'مقال متزامن',
        slug: 'synchronized-draft',
        excerpt: 'المقتطف',
        draftMdxSource: 'نص المسودة',
      });

      expect(draft.version).toBe(1);

      const updated = await repo.saveDraft({
        id: draft.id,
        title: 'مقال متزامن معدل',
        slug: 'synchronized-draft',
        excerpt: 'المقتطف المحدث',
        draftMdxSource: 'نص المسودة المحدث',
        expectedVersion: 1,
      });

      expect(updated.title).toBe('مقال متزامن معدل');
      expect(updated.version).toBe(2);
    });

    it('rejects stale save with VersionConflictError when expectedVersion does not match', async () => {
      const draft = await repo.saveDraft({
        title: 'مقال لسباق التعديل',
        slug: 'race-draft',
        excerpt: 'مقتطف',
        draftMdxSource: 'نسخة أولى',
      });

      // Another tab saves first and increments version to 2
      await repo.saveDraft({
        id: draft.id,
        title: 'تعديل تبويب 1',
        slug: 'race-draft',
        excerpt: 'مقتطف',
        draftMdxSource: 'نسخة ثانية',
        expectedVersion: 1,
      });

      // Stale tab attempts to save with expectedVersion 1
      await expect(
        repo.saveDraft({
          id: draft.id,
          title: 'تعديل تبويب 2 المتأخر',
          slug: 'race-draft',
          excerpt: 'مقتطف',
          draftMdxSource: 'نسخة متأخرة',
          expectedVersion: 1,
        })
      ).rejects.toThrow(VersionConflictError);
    });
  });

  describe('Publishing, Revisions, & Lifecycle Transitions', () => {
    it('creates an immutable revision row and marks article as PUBLISHED on publish', async () => {
      const draft = await repo.saveDraft({
        title: 'مقال للنشر',
        slug: 'ready-to-publish',
        excerpt: 'مقتطف المقال الجاهز',
        draftMdxSource: '# مقال كامل',
      });

      const published = await repo.publishArticle({
        id: draft.id,
        expectedVersion: draft.version,
        mdxSource: '# مقال كامل\n\nنص تحليلي منشور.',
        richHtml: '<h1>مقال كامل</h1><p>نص تحليلي منشور.</p>',
        markdownDerivative: '# مقال كامل\n\nنص تحليلي منشور.',
        plaintextDerivative: 'مقال كامل\n\nنص تحليلي منشور.',
      });

      expect(published.status).toBe('PUBLISHED');
      expect(published.published_at).toBeDefined();
      expect(published.revision.revision_number).toBe(1);
      expect(published.revision.rich_html).toContain('نص تحليلي منشور.');

      // Verify revision history drawer
      const revisions = await repo.getRevisions(draft.id);
      expect(revisions.length).toBe(1);
      expect(revisions[0].mdx_source).toContain('نص تحليلي منشور.');
    });

    it('archives and unarchives articles correctly', async () => {
      const draft = await repo.saveDraft({
        title: 'مقال للأرشفة',
        slug: 'article-to-archive',
        excerpt: 'مقتطف',
        draftMdxSource: 'محتوى',
      });

      const archived = await repo.archiveArticle(draft.id);
      expect(archived.status).toBe('ARCHIVED');

      const restored = await repo.unarchiveArticle(draft.id);
      expect(restored.status).toBe('DRAFT');
    });

    it('duplicates article with unique slug and -copy suffix', async () => {
      const draft = await repo.saveDraft({
        title: 'مقال أصلي',
        slug: 'original-article',
        excerpt: 'مقتطف',
        draftMdxSource: 'محتوى أصلي',
      });

      const duplicate = await repo.duplicateArticle(draft.id);
      expect(duplicate.id).not.toBe(draft.id);
      expect(duplicate.slug).toBe('original-article-copy');
      expect(duplicate.status).toBe('DRAFT');
      expect(duplicate.title).toContain('مقال أصلي');
    });

    it('checks slug uniqueness accurately', async () => {
      const available = await repo.isSlugAvailable('unique-brand-new-slug');
      expect(available).toBe(true);

      const taken = await repo.isSlugAvailable('arabic-web-typography-manifesto');
      expect(taken).toBe(false);
    });
  });
});
