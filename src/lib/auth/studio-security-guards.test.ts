import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import * as sessionModule from './session';
import { POST as studioPublishRouteHandler } from '@/app/api/studio/publish/route';
import { POST as studioMediaRouteHandler } from '@/app/api/studio/media/route';
import {
  saveArticleDraftAction,
  checkSlugAvailableAction,
  getArticleRevisionsAction,
  getArticleRevisionAction,
  publishArticleAction,
  scheduleArticleAction,
  unpublishArticleAction,
  archiveArticleAction,
  unarchiveArticleAction,
  duplicateArticleAction,
  bulkArchiveArticlesAction,
} from '@/app/studio/actions/article-actions';
import { uploadArticleMediaAction } from '@/app/studio/actions/media-actions';

describe('Studio Security Guards: Every Endpoint & Action Fails Closed for Non-Owners', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Simulate non-owner session across all calls
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: false,
      userId: 'unauthorized-user',
    });
  });

  describe('Studio Route Handlers Reject Non-Owners with 401', () => {
    const routeHandlers = [
      {
        name: '/api/studio/publish',
        handler: studioPublishRouteHandler,
        url: 'http://localhost:3000/api/studio/publish',
      },
      {
        name: '/api/studio/media',
        handler: studioMediaRouteHandler,
        url: 'http://localhost:3000/api/studio/media',
      },
    ];

    for (const { name, handler, url } of routeHandlers) {
      it(`rejects non-owner with 401 for ${name}`, async () => {
        const req = new NextRequest(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true }),
        });

        const res = await handler(req);
        expect(res.status).toBe(401);
      });
    }
  });

  describe('Studio Server Actions Reject Non-Owners', () => {
    it('saveArticleDraftAction fails closed', async () => {
      const res = await saveArticleDraftAction({
        title: 'اختبار',
        slug: 'test',
        excerpt: 'مقتطف',
        draftMdxSource: '# اختبار',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('غير مصرح');
    });

    it('checkSlugAvailableAction returns false for non-owner', async () => {
      const res = await checkSlugAvailableAction('test-slug');
      expect(res).toBe(false);
    });

    it('getArticleRevisionsAction fails closed', async () => {
      const res = await getArticleRevisionsAction('art-id');
      expect(res.success).toBe(false);
      expect(res.error).toContain('غير مصرح');
    });

    it('getArticleRevisionAction fails closed', async () => {
      const res = await getArticleRevisionAction('art-id', 1);
      expect(res.success).toBe(false);
      expect(res.error).toContain('غير مصرح');
    });

    it('publishArticleAction fails closed', async () => {
      const res = await publishArticleAction({
        id: 'art-id',
        expectedVersion: 1,
        mdxSource: '# Test',
        richHtml: '<p>Test</p>',
        markdownDerivative: '# Test',
        plaintextDerivative: 'Test',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('غير مصرح');
    });

    it('scheduleArticleAction fails closed', async () => {
      const res = await scheduleArticleAction({
        id: 'art-id',
        expectedVersion: 1,
        scheduledAt: '2026-10-01T00:00:00Z',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('غير مصرح');
    });

    it('unpublishArticleAction fails closed', async () => {
      const res = await unpublishArticleAction('art-id', 1);
      expect(res.success).toBe(false);
      expect(res.error).toContain('غير مصرح');
    });

    it('archiveArticleAction fails closed', async () => {
      const res = await archiveArticleAction('art-id');
      expect(res.success).toBe(false);
      expect(res.error).toContain('غير مصرح');
    });

    it('unarchiveArticleAction fails closed', async () => {
      const res = await unarchiveArticleAction('art-id');
      expect(res.success).toBe(false);
      expect(res.error).toContain('غير مصرح');
    });

    it('duplicateArticleAction fails closed', async () => {
      const res = await duplicateArticleAction('art-id');
      expect(res.success).toBe(false);
      expect(res.error).toContain('غير مصرح');
    });

    it('bulkArchiveArticlesAction fails closed', async () => {
      const res = await bulkArchiveArticlesAction(['art-1', 'art-2']);
      expect(res.success).toBe(false);
      expect(res.error).toContain('غير مصرح');
    });

    it('uploadArticleMediaAction fails closed', async () => {
      const formData = new FormData();
      const res = await uploadArticleMediaAction(formData, 'art-id');
      expect(res.success).toBe(false);
      expect(res.error).toContain('غير مصرح');
    });
  });
});
