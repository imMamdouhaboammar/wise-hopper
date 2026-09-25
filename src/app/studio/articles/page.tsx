import { redirect } from 'next/navigation';
import { verifyOwnerSession } from '@/lib/auth/session';
import { getArticleRepository } from '@/lib/data';
import { getAllTopics } from '@/lib/data/article-service';
import type { ArticleStatus, ArticleVisibility } from '@/lib/supabase/types';
import { StudioArticlesManager } from '@/components/studio/studio-articles-manager';

interface StudioArticlesPageProps {
  searchParams: Promise<{
    tab?: string;
    visibility?: string;
    topic?: string;
    q?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

export default async function StudioArticlesPage({ searchParams }: StudioArticlesPageProps) {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    redirect('/account?error=unauthorized_studio');
  }

  const params = await searchParams;
  const tab = params.tab || 'all';
  const visibilityParam = params.visibility?.toUpperCase() || 'ALL';
  const topicParam = params.topic && params.topic !== 'ALL' ? params.topic : undefined;
  const queryParam = params.q?.trim() || undefined;
  const sortBy = params.sortBy === 'published_at' ? 'published_at' : 'updated_at';
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const pageSize = 20;

  let status: ArticleStatus | 'ALL' = 'ALL';
  if (tab === 'published') {
    status = 'PUBLISHED';
  } else if (tab === 'drafts' || tab === 'draft') {
    status = 'DRAFT';
  } else if (tab === 'scheduled') {
    status = 'SCHEDULED';
  } else if (tab === 'archived') {
    status = 'ARCHIVED';
  }

  const visibility: ArticleVisibility | 'ALL' =
    visibilityParam === 'FREE' || visibilityParam === 'PREMIUM' ? visibilityParam : 'ALL';

  const repo = getArticleRepository();
  const [counts, topics, listResult] = await Promise.all([
    repo.getArticleCounts(),
    getAllTopics(),
    repo.listStudioArticles({
      status,
      visibility,
      topicId: topicParam,
      query: queryParam,
      sortBy,
      sortOrder,
      page,
      pageSize,
    }),
  ]);

  return (
    <StudioArticlesManager
      articles={listResult.articles}
      total={listResult.total}
      counts={counts}
      topics={topics}
      currentTab={tab}
      currentVisibility={visibilityParam}
      currentTopicId={topicParam}
      currentQuery={params.q || ''}
      currentSortBy={sortBy}
      currentSortOrder={sortOrder}
      currentPage={page}
      pageSize={pageSize}
    />
  );
}
