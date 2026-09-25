import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as articleActions from '@/app/studio/actions/article-actions';
import * as sessionModule from '@/lib/auth/session';

describe('Phase 5: Studio Autosave, Optimistic Locking & Revisions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects save draft if session is not owner', async () => {
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: false,
    });

    const result = await articleActions.saveArticleDraftAction({
      title: 'عنوان المقال',
      slug: 'test-slug',
      excerpt: 'مقتطف المقال',
      draftMdxSource: '# محتوى',
      expectedVersion: 1,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('غير مصرح');
  });

  it('detects version conflicts and returns structured conflict info', async () => {
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: true,
      userId: 'owner-id',
    });

    // Create an initial draft
    const initial = await articleActions.saveArticleDraftAction({
      title: 'مقال متزامن',
      slug: 'sync-test-slug',
      excerpt: 'مقتطف متزامن',
      draftMdxSource: '# الإصدار الأول',
      expectedVersion: 1,
    });

    expect(initial.success).toBe(true);
    const articleId = initial.data?.id;
    expect(articleId).toBeDefined();

    // First save succeeds and advances version to 2
    const update1 = await articleActions.saveArticleDraftAction({
      id: articleId,
      title: 'مقال متزامن - تعديل 1',
      slug: 'sync-test-slug',
      excerpt: 'مقتطف متزامن',
      draftMdxSource: '# الإصدار الثاني',
      expectedVersion: initial.data?.version,
    });
    expect(update1.success).toBe(true);
    expect(update1.data?.version).toBe(2);

    // Stale concurrent tab tries saving with expectedVersion: 1 (should fail with isConflict: true)
    const staleUpdate = await articleActions.saveArticleDraftAction({
      id: articleId,
      title: 'مقال متزامن - تعديل قديم',
      slug: 'sync-test-slug',
      excerpt: 'مقتطف متزامن',
      draftMdxSource: '# محتوى متعارض',
      expectedVersion: 1,
    });

    expect(staleUpdate.success).toBe(false);
    expect(staleUpdate.isConflict).toBe(true);
    expect(staleUpdate.serverVersion).toBe(2);
    expect(staleUpdate.expectedVersion).toBe(1);
    expect(staleUpdate.error).toContain('تعارض');
  });

  it('checks slug availability accurately', async () => {
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: true,
      userId: 'owner-id',
    });

    // Known seed slug should be unavailable
    const isTaken = await articleActions.checkSlugAvailableAction(
      'arabic-web-typography-manifesto'
    );
    expect(isTaken).toBe(false);

    // Completely new slug should be available
    const isAvailable = await articleActions.checkSlugAvailableAction(
      'completely-unique-fresh-slug-' + Date.now()
    );
    expect(isAvailable).toBe(true);
  });
});
