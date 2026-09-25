import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { getArticleRepository } from '@/lib/data';

describe('Phase 6: Scheduled Cron Publisher Route', () => {
  const TEST_CRON_SECRET = 'super-secret-cron-key-at-least-32-chars-long';

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.CRON_SECRET = TEST_CRON_SECRET;
  });

  it('rejects unauthenticated requests without valid bearer or query secret', async () => {
    const req = new NextRequest('http://localhost:3000/api/cron/publish-scheduled');
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('Unauthorized');
  });

  it('rejects requests with incorrect bearer secret', async () => {
    const req = new NextRequest('http://localhost:3000/api/cron/publish-scheduled', {
      headers: {
        authorization: 'Bearer wrong-secret-key-12345',
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('successfully publishes due scheduled articles when valid secret is provided', async () => {
    const repo = getArticleRepository();

    // Schedule an article that is due in the past
    const article = await repo.saveDraft({
      title: 'مقال مجدول منشور زمنياً',
      slug: 'scheduled-cron-test-' + Date.now(),
      excerpt: 'مقتطف تحليلي للمقال المجدول',
      draftMdxSource: '# مقال مجدول منشور\n\nنص تحليلي مكتمل.',
      expectedVersion: 1,
    });

    await repo.scheduleArticle({
      id: article.id,
      expectedVersion: article.version,
      scheduledAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago (due!)
    });

    const req = new NextRequest('http://localhost:3000/api/cron/publish-scheduled', {
      headers: {
        authorization: `Bearer ${TEST_CRON_SECRET}`,
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.publishedCount).toBeGreaterThanOrEqual(1);
    expect(data.publishedSlugs).toContain(article.slug);
  });
});
