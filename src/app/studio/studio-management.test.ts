import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sessionModule from '@/lib/auth/session';
import { getArticleRepository } from '@/lib/data';
import {
  duplicateArticleAction,
  archiveArticleAction,
  unarchiveArticleAction,
  bulkArchiveArticlesAction,
  saveArticleDraftAction,
} from './actions/article-actions';

describe('Studio Dashboard & Article Management', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects management actions for unauthenticated users or non-owners', async () => {
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: false,
      userId: 'non-owner-user',
    });

    const dupRes = await duplicateArticleAction('20000000-0000-0000-0000-000000000001');
    expect(dupRes.success).toBe(false);
    expect(dupRes.error).toContain('غير مصرح');

    const archiveRes = await archiveArticleAction('20000000-0000-0000-0000-000000000001');
    expect(archiveRes.success).toBe(false);

    const unarchiveRes = await unarchiveArticleAction('20000000-0000-0000-0000-000000000001');
    expect(unarchiveRes.success).toBe(false);

    const bulkRes = await bulkArchiveArticlesAction(['20000000-0000-0000-0000-000000000001']);
    expect(bulkRes.success).toBe(false);
  });

  it('calculates article counts accurately across all statuses', async () => {
    const repo = getArticleRepository();
    const counts = await repo.getArticleCounts();

    expect(counts).toHaveProperty('published');
    expect(counts).toHaveProperty('drafts');
    expect(counts).toHaveProperty('scheduled');
    expect(counts).toHaveProperty('premium');
    expect(counts).toHaveProperty('archived');
    expect(counts.published).toBeGreaterThanOrEqual(1);
  });

  it('filters studio articles by status, visibility, and Arabic query', async () => {
    const repo = getArticleRepository();

    // Filter by PUBLISHED status
    const publishedOnly = await repo.listStudioArticles({ status: 'PUBLISHED' });
    expect(publishedOnly.articles.every((a) => a.status === 'PUBLISHED')).toBe(true);

    // Filter by PREMIUM visibility
    const premiumOnly = await repo.listStudioArticles({ visibility: 'PREMIUM' });
    expect(premiumOnly.articles.every((a) => a.visibility === 'PREMIUM')).toBe(true);

    // Search by Arabic query with normalization (e.g. "هندسة")
    const searchResult = await repo.listStudioArticles({ query: 'هندسة' });
    expect(searchResult.articles.length).toBeGreaterThanOrEqual(1);
    expect(searchResult.articles[0].title).toContain('هندسة');
  });

  it('duplicates an article as a new draft with unique slug and title copy', async () => {
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: true,
      userId: 'owner-id',
    });

    const targetId = '20000000-0000-0000-0000-000000000001';
    const result = await duplicateArticleAction(targetId);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.id).not.toBe(targetId);
    expect(result.data?.status).toBe('DRAFT');
    expect(result.data?.title).toContain('نسخة');
  });

  it('archives, unarchives, and bulk archives articles correctly', async () => {
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: true,
      userId: 'owner-id',
    });

    // Create a temporary draft to test archive cycle
    const draftRes = await saveArticleDraftAction({
      title: 'مقال تجريبي للأرشفة',
      slug: 'test-archive-cycle-' + Date.now(),
      excerpt: 'مقتطف تجريبي للأرشفة',
      draftMdxSource: '# محتوى تجريبي',
    });

    expect(draftRes.success).toBe(true);
    const articleId = draftRes.data!.id;

    // Archive
    const archiveRes = await archiveArticleAction(articleId);
    expect(archiveRes.success).toBe(true);
    expect(archiveRes.data?.status).toBe('ARCHIVED');

    // Unarchive
    const unarchiveRes = await unarchiveArticleAction(articleId);
    expect(unarchiveRes.success).toBe(true);
    expect(unarchiveRes.data?.status).toBe('DRAFT');

    // Bulk archive
    const bulkRes = await bulkArchiveArticlesAction([articleId]);
    expect(bulkRes.success).toBe(true);
    expect(bulkRes.data?.count).toBe(1);

    const repo = getArticleRepository();
    const finalState = await repo.getArticleById(articleId);
    expect(finalState?.status).toBe('ARCHIVED');
  });
});
